import os

from flask import Flask, request
from flask_cors import CORS

from backend.database import configure_database, init_db
from backend.extensions import db
from backend.models import Character, Word, utcnow

app = Flask(__name__)
CORS(app)
configure_database(app)
init_db(app)


@app.route("/hello", methods=["POST"])
def hello():
    return "Hello from backend"


@app.route("/characters", methods=["GET"])
def list_characters():
    print("call list characters")
    characters = Character.query.order_by(Character.pinyin).all()
    return [
        {
            "char": character.char,
            "pinyin": character.pinyin,
            "writting_known": character.writting_known,
            "updated_at": character.updated_at.isoformat(),
        }
        for character in characters
    ], 200


@app.route("/characters/bulk", methods=["POST"])
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
        if len(parts) != 4:
            return {"error": "Invalid line format. Should have the format 'character;pinyin;is_known;words'"}, 400

        char = parts[0]
        pinyin = parts[1]
        writting_known = parts[2] == "true"
        word_strings = [word.strip() for word in parts[3].split(",") if word.strip()]

        char_record = Character.query.filter_by(char=char).first()
        if char_record is None:
            char_record = Character(
                char=char,
                pinyin=pinyin,
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


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    app.run(debug=True, port=port)
