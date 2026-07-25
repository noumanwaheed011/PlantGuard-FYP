"""
MobileNetV2 disease classifier inference.

Training (Colab) contract this file must match:
  - IMG_SIZE = (224, 224)
  - RGB via keras.preprocessing.image / PIL (NOT OpenCV BGR)
  - tensorflow.keras.applications.mobilenet_v2.preprocess_input  →  [-1, 1]
  - batch dim (1, 224, 224, 3)
  - 11 classes in alphabetical folder order (see class_indices.json)
"""

from __future__ import annotations

import json
import logging
from collections import deque
from typing import Any

import numpy as np
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Paths / model
# ---------------------------------------------------------------------------
MODEL_PATH = "ml_model/pidds_v2_30epochs_final.keras"
CLASS_PATH = "ml_model/class_indices.json"
IMG_SIZE = (224, 224)

# Reject predictions when top softmax prob is below this (0–1).
CONFIDENCE_THRESHOLD = 0.65

# Also reject when top-1 and top-2 are too close (ambiguous).
MIN_TOP1_TOP2_MARGIN = 0.12

# Ring buffer of recent full softmax vectors for debugging.
SOFTMAX_LOG_SIZE = 20
_recent_softmax: deque = deque(maxlen=SOFTMAX_LOG_SIZE)

# Disease → crop (for API metadata only)
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

model = load_model(MODEL_PATH)

with open(CLASS_PATH, "r", encoding="utf-8") as f:
    _raw_indices = json.load(f)

# Support both {"0": "Class"} and {"Class": 0} styles from training exports.
if all(str(k).isdigit() for k in _raw_indices.keys()):
    class_indices = {str(k): v for k, v in _raw_indices.items()}
else:
    class_indices = {str(v): k for k, v in _raw_indices.items()}

_num_model_classes = int(model.output_shape[-1])
_num_json_classes = len(class_indices)
if _num_model_classes != _num_json_classes:
    logger.warning(
        "Class count mismatch: model=%s json=%s",
        _num_model_classes,
        _num_json_classes,
    )

logger.info(
    "Loaded disease model %s | classes=%s | mapping=%s",
    MODEL_PATH,
    _num_model_classes,
    class_indices,
)


def _preprocess(img_path: str) -> np.ndarray:
    """
    Exact training preprocessing:
      load RGB → resize 224x224 → float32 array → batch → MobileNetV2 preprocess_input
    """
    # keras load_img uses PIL → RGB
    img = image.load_img(img_path, target_size=IMG_SIZE)
    arr = image.img_to_array(img)  # (224, 224, 3) float32, RGB, ~[0, 255]
    arr = np.expand_dims(arr, axis=0)  # (1, 224, 224, 3)

    raw_min, raw_max = float(arr.min()), float(arr.max())
    processed = preprocess_input(arr.copy())  # scales RGB to ~[-1, 1]
    proc_min, proc_max = float(processed.min()), float(processed.max())

    logger.info(
        "Preprocess audit | path=%s | shape=%s | RGB_before=[%.2f, %.2f] | "
        "after_mobilenet_preprocess=[%.4f, %.4f] | expected_after≈[-1, 1]",
        img_path,
        processed.shape,
        raw_min,
        raw_max,
        proc_min,
        proc_max,
    )
    return processed


def get_recent_softmax_logs() -> list[dict[str, Any]]:
    """Return the last N full softmax distributions (for debugging)."""
    return list(_recent_softmax)


def predict_image(img_path: str) -> dict[str, Any]:
    """
    Run inference with confidence-based rejection.

    Returns a dict:
      accepted (bool), disease, confidence (0-100), margin (0-100),
      entropy, plant, code, message, probabilities {class: pct}
    """
    batch = _preprocess(img_path)
    prediction = model.predict(batch, verbose=0)[0]

    # Full per-class distribution
    probs = {
        class_indices[str(i)]: float(prediction[i])
        for i in range(len(prediction))
        if str(i) in class_indices
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
        logger.info(
            "Rejected low-confidence prediction | top=%s p=%.3f thr=%.2f margin=%.3f",
            top_class,
            top_prob,
            CONFIDENCE_THRESHOLD,
            margin,
        )
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
