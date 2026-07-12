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


@app.route("/characters", methods=["GET", "POST"])
def characters():
    if request.method == "GET":
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

    if len(pinyin.strip()) > 6:
        return {"error": "pinyin must be at most 6 characters"}, 400

    if not isinstance(writting_known, bool):
        return {"error": "writting_known must be a boolean"}, 400

    char_value = char.strip()
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


@app.route("/characters/<path:char>", methods=["DELETE"])
def delete_character(char: str):
    char_record = Character.query.filter_by(char=char).first()
    if char_record is None:
        return {"error": "Character not found"}, 404

    char_record.words.clear()
    db.session.delete(char_record)
    db.session.commit()

    return {"message": "Character deleted"}, 200


@app.route("/characters/<path:char>", methods=["PATCH"])
def update_character(char: str):
    char_record = Character.query.filter_by(char=char).first()
    if char_record is None:
        return {"error": "Character not found"}, 404

    data = request.get_json(silent=True)
    if data is None:
        return {"error": "Invalid JSON body"}, 400

    if "pinyin" not in data or "writting_known" not in data:
        return {"error": "Missing required fields: pinyin, writting_known"}, 400

    pinyin = data["pinyin"]
    writting_known = data["writting_known"]

    if not isinstance(pinyin, str) or not pinyin.strip():
        return {"error": "pinyin must be a non-empty string"}, 400

    if len(pinyin.strip()) > 6:
        return {"error": "pinyin must be at most 6 characters"}, 400

    if not isinstance(writting_known, bool):
        return {"error": "writting_known must be a boolean"}, 400

    char_record.pinyin = pinyin.strip()
    char_record.writting_known = writting_known
    char_record.updated_at = utcnow()
    db.session.commit()

    return {
        "char": char_record.char,
        "pinyin": char_record.pinyin,
        "writting_known": char_record.writting_known,
        "updated_at": char_record.updated_at.isoformat(),
    }, 200


@app.route("/words", methods=["POST"])
def create_word():
    data = request.get_json(silent=True)
    if data is None:
        return {"error": "Invalid JSON body"}, 400

    if "word" not in data:
        return {"error": "Missing required field: word"}, 400

    word_value = data["word"]
    definition = data.get("definition", "")

    if not isinstance(word_value, str) or not word_value.strip():
        return {"error": "word must be a non-empty string"}, 400

    if len(word_value.strip()) > 10:
        return {"error": "word must be at most 10 characters"}, 400

    if definition is not None and not isinstance(definition, str):
        return {"error": "definition must be a string"}, 400

    if len(definition.strip()) > 100:
        return {"error": "definition must be at most 100 characters"}, 400

    word_text = word_value.strip()
    definition_text = definition.strip() if isinstance(definition, str) else ""

    missing_characters = [
        character
        for character in word_text
        if Character.query.filter_by(char=character).first() is None
    ]
    if missing_characters:
        return {
            "error": (
                f"Character '{missing_characters[0]}' does not exist in the database"
            )
        }, 400

    if Word.query.filter_by(word=word_text).first() is not None:
        return {"error": "Word already exists"}, 409

    word_record = Word(word=word_text, definition=definition_text or None)
    db.session.add(word_record)

    now = utcnow()
    for character in word_text:
        char_record = Character.query.filter_by(char=character).first()
        if char_record is None:
            continue

        if word_record not in char_record.words:
            char_record.words.append(word_record)
            char_record.updated_at = now

    word_record.updated_at = now
    db.session.commit()

    return {
        "word": word_record.word,
        "definition": word_record.definition,
        "updated_at": word_record.updated_at.isoformat(),
    }, 201


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
