from flask import Blueprint

from backend.models import HskCharacter

bp = Blueprint("list_hsk_characters", __name__)


@bp.get("/hsk-characters")
def list_hsk_characters():
    entries = HskCharacter.query.order_by(
        HskCharacter.level, HskCharacter.character
    ).all()
    return [
        {
            "character": entry.character,
            "level": entry.level,
            "frequency": entry.frequency,
        }
        for entry in entries
    ], 200
