from sqlalchemy import Boolean, Column, ForeignKey, String, Table

from backend.extensions import db

character_word = Table(
    "character_word",
    db.Model.metadata,
    Column("character_char", String, ForeignKey("character.char"), primary_key=True),
    Column("word", String(10), ForeignKey("words.word"), primary_key=True),
)


class Character(db.Model):
    __tablename__ = "character"

    char = db.Column(String, primary_key=True)
    pinyin = db.Column(String(6), nullable=False)
    writting_known = db.Column(Boolean, nullable=False, default=False)

    words = db.relationship(
        "Word",
        secondary=character_word,
        back_populates="characters",
    )


class Word(db.Model):
    __tablename__ = "words"

    word = db.Column(String(10), primary_key=True)
    definition = db.Column(String(100), nullable=True)

    characters = db.relationship(
        "Character",
        secondary=character_word,
        back_populates="words",
    )
