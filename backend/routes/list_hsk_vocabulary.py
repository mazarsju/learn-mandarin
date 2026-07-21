from flask import Blueprint

from backend.models import HskVocabulary

bp = Blueprint("list_hsk_vocabulary", __name__)


@bp.get("/hsk-vocabulary")
def list_hsk_vocabulary():
    entries = HskVocabulary.query.order_by(
        HskVocabulary.level, HskVocabulary.character
    ).all()
    return [
        {
            "character": entry.character,
            "level": entry.level,
        }
        for entry in entries
    ], 200
