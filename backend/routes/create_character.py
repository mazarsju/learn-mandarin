from flask import Blueprint, request

from backend.chinese_validation import is_han_character
from backend.extensions import db
from backend.models import Character

bp = Blueprint("create_character", __name__)


@bp.post("/characters")
def create_character():
    data = request.get_json(silent=True)
    if data is None:
        return {"error": "Invalid JSON body"}, 400

    if "char" not in data or "pinyin" not in data or "writting_known" not in data:
        return {"error": "Missing required fields: char, pinyin, writting_known"}, 400

    char = data["char"]
    pinyin = data["pinyin"]
    writting_known = data["writting_known"]

    if not isinstance(char, str) or not char.strip():
        return {"error": "char must be a non-empty string"}, 400

    if not isinstance(pinyin, str) or not pinyin.strip():
        return {"error": "pinyin must be a non-empty string"}, 400

    if len(pinyin.strip()) > 8:
        return {"error": "pinyin must be at most 8 characters"}, 400

    if not isinstance(writting_known, bool):
        return {"error": "writting_known must be a boolean"}, 400

    char_value = char.strip()
    if not is_han_character(char_value):
        return {"error": "char must be a single Chinese character"}, 400

    if Character.query.filter_by(char=char_value).first() is not None:
        return {"error": "Character already exists"}, 409

    char_record = Character(
        char=char_value,
        pinyin=pinyin.strip(),
        writting_known=writting_known,
    )
    db.session.add(char_record)
    db.session.commit()

    return {
        "char": char_record.char,
        "pinyin": char_record.pinyin,
        "writting_known": char_record.writting_known,
        "updated_at": char_record.updated_at.isoformat(),
    }, 201
