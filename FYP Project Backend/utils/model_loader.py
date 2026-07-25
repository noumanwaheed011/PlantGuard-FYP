"""
MobileNetV2 disease classifier inference.

Training (Colab) contract this file must match:
  - IMG_SIZE = (224, 224)
  - RGB via keras.preprocessing.image / PIL (NOT OpenCV BGR)
  - tensorflow.keras.applications.mobilenet_v2.preprocess_input  →  [-1, 1]
  - batch dim (1, 224, 224, 3)
  - 11 classes in alphabetical folder order (see class_indices.json)

Model is loaded lazily so gunicorn can bind PORT before TensorFlow starts.
"""

from __future__ import annotations

import json
import logging
import os
from collections import deque
from typing import Any

import numpy as np

logger = logging.getLogger(__name__)

MODEL_PATH = os.getenv("MODEL_PATH", "ml_model/pidds_v2_30epochs_final.keras")
CLASS_PATH = os.getenv("CLASS_PATH", "ml_model/class_indices.json")
IMG_SIZE = (224, 224)

CONFIDENCE_THRESHOLD = 0.65
MIN_TOP1_TOP2_MARGIN = 0.12

SOFTMAX_LOG_SIZE = 20
_recent_softmax: deque = deque(maxlen=SOFTMAX_LOG_SIZE)

DISEASE_TO_PLANT = {
    "Algal_Leaf_Spot": "jackfruit",
    "Black_Spot": "jackfruit",
    "Cutting_Weevil": "mango",
    "Gall_Midge": "mango",
    "Die_Back": "mango",
    "Sooty_Mould": "mango",
    "Powdery_Mildew": "mango",
    "Bacterial_Leaf_Spot": "pumpkin",
    "Downy_Mildew": "pumpkin",
    "Mosaic_Disease": "pumpkin",
    "Healthy": "supported",
}

_model = None
class_indices = {}


def _load_class_indices():
    global class_indices
    if class_indices:
        return class_indices
    with open(CLASS_PATH, "r", encoding="utf-8") as f:
        raw = json.load(f)
    if all(str(k).isdigit() for k in raw.keys()):
        class_indices = {str(k): v for k, v in raw.items()}
    else:
        class_indices = {str(v): k for k, v in raw.items()}
    return class_indices


def get_model():
    """Lazy-load TensorFlow model (first analyze call pays the cost)."""
    global _model
    if _model is not None:
        return _model

    # Reduce TF startup noise / memory on small cloud VMs
    os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")

    from tensorflow.keras.models import load_model

    logger.info("Loading disease model from %s ...", MODEL_PATH)
    _model = load_model(MODEL_PATH)
    mapping = _load_class_indices()
    n_model = int(_model.output_shape[-1])
    n_json = len(mapping)
    if n_model != n_json:
        logger.warning("Class count mismatch: model=%s json=%s", n_model, n_json)
    logger.info("Model ready | classes=%s | mapping=%s", n_model, mapping)
    return _model


def _preprocess(img_path: str):
    from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
    from tensorflow.keras.preprocessing import image

    img = image.load_img(img_path, target_size=IMG_SIZE)
    arr = image.img_to_array(img)
    arr = np.expand_dims(arr, axis=0)

    raw_min, raw_max = float(arr.min()), float(arr.max())
    processed = preprocess_input(arr.copy())
    proc_min, proc_max = float(processed.min()), float(processed.max())

    logger.info(
        "Preprocess audit | path=%s | shape=%s | RGB_before=[%.2f, %.2f] | "
        "after_mobilenet_preprocess=[%.4f, %.4f]",
        img_path,
        processed.shape,
        raw_min,
        raw_max,
        proc_min,
        proc_max,
    )
    return processed


def get_recent_softmax_logs() -> list[dict[str, Any]]:
    return list(_recent_softmax)


def predict_image(img_path: str) -> dict[str, Any]:
    model = get_model()
    mapping = _load_class_indices()

    batch = _preprocess(img_path)
    prediction = model.predict(batch, verbose=0)[0]

    probs = {
        mapping[str(i)]: float(prediction[i])
        for i in range(len(prediction))
        if str(i) in mapping
    }
    sorted_items = sorted(probs.items(), key=lambda x: x[1], reverse=True)
    top_class, top_prob = sorted_items[0]
    second_prob = sorted_items[1][1] if len(sorted_items) > 1 else 0.0
    margin = float(top_prob - second_prob)

    clipped = np.clip(prediction, 1e-9, 1.0)
    entropy = float(-np.sum(clipped * np.log(clipped)))

    log_entry = {
        "image": img_path,
        "top": top_class,
        "top_prob": round(top_prob, 4),
        "margin": round(margin, 4),
        "entropy": round(entropy, 4),
        "softmax": {k: round(v, 4) for k, v in sorted_items},
    }
    _recent_softmax.append(log_entry)
    logger.info("Softmax distribution | %s", log_entry)

    confidence_pct = round(top_prob * 100.0, 2)
    margin_pct = round(margin * 100.0, 2)
    plant = DISEASE_TO_PLANT.get(top_class)

    if top_prob < CONFIDENCE_THRESHOLD or margin < MIN_TOP1_TOP2_MARGIN:
        return {
            "accepted": False,
            "disease": None,
            "confidence": confidence_pct,
            "margin": margin_pct,
            "entropy": round(entropy, 4),
            "plant": plant,
            "code": "LOW_CONFIDENCE",
            "message": (
                "Unable to confidently identify this as a leaf/disease — "
                "please upload a clear, well-lit photo of a single leaf."
            ),
            "probabilities": {k: round(v * 100.0, 2) for k, v in sorted_items},
        }

    return {
        "accepted": True,
        "disease": top_class,
        "confidence": confidence_pct,
        "margin": margin_pct,
        "entropy": round(entropy, 4),
        "plant": plant,
        "code": None,
        "message": None,
        "probabilities": {k: round(v * 100.0, 2) for k, v in sorted_items},
    }


# Eager class map only (cheap); TF model stays lazy
_load_class_indices()
