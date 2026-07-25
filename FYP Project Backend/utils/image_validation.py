"""
Lightweight "is this plausibly a leaf?" pre-filter (HSV heuristics only).

No second ML model — cheap histogram checks before calling the disease CNN.
Tune the constants below; set ENABLE_LEAF_PREFILTER = False to disable.
"""

from __future__ import annotations

import numpy as np
from PIL import Image, UnidentifiedImageError

# ---------------------------------------------------------------------------
# Tunable constants
# ---------------------------------------------------------------------------
ENABLE_LEAF_PREFILTER = True

# Fraction of pixels that must fall in a vegetation-like HSV band
MIN_VEGETATION_FRACTION = 0.08

# Reject near-blank / screenshot-like images
MAX_NEAR_WHITE_FRACTION = 0.92
MAX_NEAR_BLACK_FRACTION = 0.85

# Reject images that are almost a single flat color (low hue diversity
# among non-gray pixels) — catches solid walls/screenshots
MAX_FLAT_COLOR_FRACTION = 0.97

# Sample size for speed (resize before histogram)
SAMPLE_SIZE = (160, 160)


def _load_hsv_rgb(img_path: str):
    with Image.open(img_path) as img:
        rgb = np.array(
            img.convert("RGB").resize(SAMPLE_SIZE),
            dtype=np.float32,
        )
    # Manual RGB→HSV (OpenCV-free, stays RGB-consistent with keras loader)
    r = rgb[:, :, 0] / 255.0
    g = rgb[:, :, 1] / 255.0
    b = rgb[:, :, 2] / 255.0
    maxc = np.maximum(np.maximum(r, g), b)
    minc = np.minimum(np.minimum(r, g), b)
    delta = maxc - minc + 1e-8

    h = np.zeros_like(maxc)
    mask = delta > 1e-6
    # Red sector
    idx = (maxc == r) & mask
    h[idx] = ((g[idx] - b[idx]) / delta[idx]) % 6
    # Green sector
    idx = (maxc == g) & mask
    h[idx] = (b[idx] - r[idx]) / delta[idx] + 2
    # Blue sector
    idx = (maxc == b) & mask
    h[idx] = (r[idx] - g[idx]) / delta[idx] + 4
    h = (h / 6.0) % 1.0  # [0, 1)
    s = np.where(maxc > 1e-6, delta / (maxc + 1e-8), 0.0)
    v = maxc
    return h, s, v, rgb


def is_likely_plant_leaf(img_path: str) -> bool:
    """
    Return True when the image looks like vegetation (green/yellow/brown
    foliage), False for blank, flat-color, or non-vegetation photos.
    """
    if not ENABLE_LEAF_PREFILTER:
        return True

    try:
        h, s, v, rgb = _load_hsv_rgb(img_path)
    except (UnidentifiedImageError, OSError, ValueError):
        return False

    # Near white / near black
    near_white = (rgb[:, :, 0] > 230) & (rgb[:, :, 1] > 230) & (rgb[:, :, 2] > 230)
    near_black = (rgb[:, :, 0] < 25) & (rgb[:, :, 1] < 25) & (rgb[:, :, 2] < 25)
    if float(np.mean(near_white)) > MAX_NEAR_WHITE_FRACTION:
        return False
    if float(np.mean(near_black)) > MAX_NEAR_BLACK_FRACTION:
        return False

    # Vegetation hues in HSV:
    #   green ~ 0.16–0.45, yellow-brown ~ 0.05–0.18 with moderate S/V
    green = (h >= 0.16) & (h <= 0.45) & (s >= 0.12) & (v >= 0.12)
    yellow_brown = (h >= 0.04) & (h <= 0.18) & (s >= 0.15) & (v >= 0.15) & (v <= 0.95)
    # Dark necrotic spots often sit on leaves (low V, not blue)
    dark_necrosis = (v < 0.35) & (s < 0.45) & (rgb[:, :, 2] <= rgb[:, :, 1] + 15)
    vegetation = green | yellow_brown | dark_necrosis
    veg_fraction = float(np.mean(vegetation))

    if veg_fraction < MIN_VEGETATION_FRACTION:
        return False

    # Skin / face hues (reject portraits even with a green shirt)
    skin = (
        (((h <= 0.08) | (h >= 0.92)) & (s >= 0.12) & (s <= 0.68) & (v >= 0.25) & (v <= 0.95))
    )
    skin_fraction = float(np.mean(skin))
    # Center crop often holds the face
    hh, ww = h.shape
    cy0, cy1 = hh // 4, 3 * hh // 4
    cx0, cx1 = ww // 4, 3 * ww // 4
    center_skin = float(np.mean(skin[cy0:cy1, cx0:cx1]))
    center_veg = float(np.mean(vegetation[cy0:cy1, cx0:cx1]))
    if skin_fraction >= 0.12 and skin_fraction >= veg_fraction * 0.45:
        return False
    if center_skin >= 0.18 and center_skin >= center_veg * 0.5:
        return False

    # Flat-color check: among saturated pixels, one hue bin dominates
    sat = s >= 0.20
    if float(np.mean(sat)) > 0.05:
        hue_bins = np.floor(h[sat] * 12).astype(np.int32)  # 12 bins
        counts = np.bincount(hue_bins, minlength=12).astype(np.float32)
        flat_frac = float(counts.max() / (counts.sum() + 1e-8))
        # Only reject extreme flats that also lack mixed green foliage signal
        if flat_frac > MAX_FLAT_COLOR_FRACTION and veg_fraction < 0.20:
            return False

    return True


def validate_leaf_image(img_path: str):
    """
    Returns:
        (True, None) on success
        (False, "NOT_A_LEAF") when rejected
    """
    if not is_likely_plant_leaf(img_path):
        return False, "NOT_A_LEAF"
    return True, None
