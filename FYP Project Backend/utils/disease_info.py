import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

JSON_PATH = os.path.join(
    BASE_DIR,
    "data",
    "disease_info.json"
)

with open(JSON_PATH, "r", encoding="utf-8") as f:
    DISEASE_INFO = json.load(f)


def get_disease_info(disease_name):
    return DISEASE_INFO.get(disease_name, {})