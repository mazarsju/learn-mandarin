from flask import Blueprint

from backend.extensions import db
from backend.models import Character

bp = Blueprint("delete_character", __name__)


@bp.delete("/characters/<path:char>")
def delete_character(char: str):
    char_record = Character.query.filter_by(char=char).first()
    if char_record is None:
        return {"error": "Character not found"}, 404

    char_record.words.clear()
    db.session.delete(char_record)
    db.session.commit()

    return {"message": "Character deleted"}, 200
