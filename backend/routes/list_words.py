from flask import Blueprint

from backend.models import Word

bp = Blueprint("list_words", __name__)


@bp.get("/words")
def list_words():
    word_list = Word.query.order_by(Word.word).all()
    return [
        {
            "word": word.word,
            "definition": word.definition,
            "updated_at": word.updated_at.isoformat(),
            "characters": [character.char for character in word.characters],
        }
        for word in word_list
    ], 200
