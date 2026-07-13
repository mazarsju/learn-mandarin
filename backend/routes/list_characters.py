from flask import Blueprint

from backend.models import Character

bp = Blueprint("list_characters", __name__)


@bp.get("/characters")
def list_characters():
    character_list = Character.query.order_by(Character.pinyin).all()
    return [
        {
            "char": character.char,
            "pinyin": character.pinyin,
            "writting_known": character.writting_known,
            "updated_at": character.updated_at.isoformat(),
        }
        for character in character_list
    ], 200
