"""Analysis routes."""

import logging
import os
import uuid

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from PIL import Image, UnidentifiedImageError

from models.user import User
from models.analysis import Analysis

from utils.model_loader import (
    predict_image,
    CONFIDENCE_THRESHOLD,
    get_recent_softmax_logs,
)

# Do not import/load TensorFlow at module import time — keeps gunicorn boot fast.
from utils.disease_info import DISEASE_INFO
from utils.image_validation import validate_leaf_image, ENABLE_LEAF_PREFILTER

logger = logging.getLogger(__name__)

analysis_bp = Blueprint(
    "analysis",
    __name__,
    url_prefix="/api/analysis",
)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

NOT_A_LEAF_ERROR = (
    "This image does not appear to be a plant leaf. "
    "Please upload a clear, close-up photo of a single leaf."
)

LOW_CONFIDENCE_ERROR = (
    "Unable to confidently identify this as a leaf/disease — "
    "please upload a clear, well-lit photo of a single leaf."
)


def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


def get_disease_info(disease_name):
    """Normalize DISEASE_INFO entry into the API response shape."""
    default_info = {
        "description": "Disease information not available.",
        "careSteps": ["Consult an agriculture expert."],
        "recommendations": {
            "watering": "",
            "sunlight": "",
            "fertilizer": "",
            "treatment": "",
        },
    }

    entry = DISEASE_INFO.get(disease_name)
    if not entry:
        return default_info

    return {
        "description": entry.get("description", default_info["description"]),
        "careSteps": entry.get("prevention", default_info["careSteps"]),
        "recommendations": {
            "treatment": entry.get("treatment", []),
            "severity": entry.get("severity", ""),
            "recoveryChance": entry.get("recovery_chance", ""),
            "symptoms": entry.get("symptoms", []),
            "causes": entry.get("causes", []),
        },
    }


@analysis_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_image():
    try:
        if "image" not in request.files:
            return jsonify({"error": "No image file provided"}), 400

        file = request.files["image"]
        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        if not allowed_file(file.filename):
            return jsonify({"error": "Invalid image type"}), 400

        filename = str(uuid.uuid4()) + "_" + secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)

        return jsonify({
            "message": "Image uploaded successfully",
            "filepath": filepath,
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@analysis_bp.route("/analyze", methods=["POST"])
@jwt_required()
def analyze_image():
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}
        image_path = data.get("imagePath")

        if not image_path:
            return jsonify({"error": "Image path is required"}), 400

        if not os.path.exists(image_path):
            return jsonify({"error": "Image not found"}), 404

        user = User.find_by_id(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Readable image?
        try:
            with Image.open(image_path) as img:
                img.verify()
        except (UnidentifiedImageError, OSError):
            return jsonify({
                "error": NOT_A_LEAF_ERROR,
                "code": "NOT_A_LEAF",
            }), 422

        # Cheap leaf pre-filter (HSV) before model call
        if ENABLE_LEAF_PREFILTER:
            is_leaf, leaf_code = validate_leaf_image(image_path)
            if not is_leaf:
                logger.info("Leaf pre-filter rejected %s", image_path)
                return jsonify({
                    "error": NOT_A_LEAF_ERROR,
                    "code": leaf_code or "NOT_A_LEAF",
                }), 422

        # Disease model inference (+ confidence rejection)
        prediction = predict_image(image_path)

        if not prediction["accepted"]:
            return jsonify({
                "error": prediction.get("message") or LOW_CONFIDENCE_ERROR,
                "code": prediction.get("code") or "LOW_CONFIDENCE",
                "confidence": prediction.get("confidence"),
                "threshold": round(CONFIDENCE_THRESHOLD * 100, 1),
            }), 422

        disease_name = prediction["disease"]
        confidence = prediction["confidence"]
        info = get_disease_info(disease_name)

        result = {
            "diseaseName": disease_name,
            "confidence": confidence,
            "plant": (
                prediction["plant"]
                if prediction.get("plant") != "supported"
                else "healthy"
            ),
            "description": info["description"],
            "careSteps": info["careSteps"],
            "recommendations": info["recommendations"],
            "imagePath": image_path,
        }

        result_data = {
            **result,
            "userEmail": user.get("email"),
            "userName": user.get("name"),
        }
        analysis = Analysis.create(user_id, result_data)
        analysis_dict = Analysis.to_dict(analysis)

        return jsonify({
            "message": "Analysis completed successfully",
            "result": {
                "id": analysis_dict["id"],
                "diseaseName": result["diseaseName"],
                "confidence": result["confidence"],
                "plant": result.get("plant"),
                "description": result["description"],
                "careSteps": result["careSteps"],
                "recommendations": result["recommendations"],
                "imagePath": result["imagePath"],
                "date": analysis_dict["date"],
            },
        }), 200

    except Exception as e:
        logger.exception("analyze_image failed")
        return jsonify({"error": str(e)}), 500


@analysis_bp.route("/debug/softmax", methods=["GET"])
@jwt_required()
def debug_softmax():
    """Temporary: last N full softmax distributions for debugging."""
    return jsonify({
        "threshold": CONFIDENCE_THRESHOLD,
        "recent": get_recent_softmax_logs(),
    }), 200
