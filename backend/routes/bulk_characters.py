from flask import Blueprint, request

from backend.extensions import db
from backend.models import Character, Word, utcnow

bp = Blueprint("bulk_characters", __name__)


@bp.post("/characters/bulk")
def bulk_characters():
    uploaded_file = request.files.get("file")
    if uploaded_file is None:
        return {"error": "No file provided"}, 400

    file_content = uploaded_file.read().decode("utf-8")

    lines = file_content.split("\n")
    for line in lines:
        if line.strip() == "":
            continue

        parts = line.split(";")
        if len(parts) != 5:
            return {
                "error": (
                    "Invalid line format. Should have the format "
                    "'character;pinyin;tone;is_known;words'."
                    "(error found in line: %s)"
                ) % line
            }, 400

        char = parts[0]
        pinyin = parts[1]
        tone = parts[2]
        writting_known = parts[3] == "true"
        word_strings = [word.strip() for word in parts[4].split(",") if word.strip()]

        char_record = Character.query.filter_by(char=char).first()
        if char_record is None:
            char_record = Character(
                char=char,
                pinyin=pinyin+tone,
                writting_known=writting_known,
            )
            db.session.add(char_record)

        for word_str in word_strings:
            word_record = Word.query.filter_by(word=word_str).first()
            if word_record is None:
                word_record = Word(word=word_str, definition="")
                db.session.add(word_record)

            if word_record not in char_record.words:
                char_record.words.append(word_record)
                now = utcnow()
                char_record.updated_at = now
                word_record.updated_at = now

    db.session.commit()

    return {"message": "File received"}, 200
