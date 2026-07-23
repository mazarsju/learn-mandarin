from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Table

from backend.extensions import db


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


character_word = Table(
    "character_word",
    db.Model.metadata,
    Column("character_char", String, ForeignKey("character.char"), primary_key=True),
    Column("word", String(10), ForeignKey("words.word"), primary_key=True),
)


hsk_word_character = Table(
    "hsk_word_character",
    db.Model.metadata,
    Column("word", String(32), ForeignKey("hsk_words.word"), primary_key=True),
    Column(
        "character",
        String(1),
        ForeignKey("hsk_characters.character"),
        primary_key=True,
    ),
)


class Character(db.Model):
    __tablename__ = "character"

    char = db.Column(String, primary_key=True)
    pinyin = db.Column(String(6), nullable=False)
    writting_known = db.Column(Boolean, nullable=False, default=False)
    updated_at = db.Column(
        DateTime(timezone=True),
        nullable=False,
        default=utcnow,
        onupdate=utcnow,
    )

    words = db.relationship(
        "Word",
        secondary=character_word,
        back_populates="characters",
    )


class Word(db.Model):
    __tablename__ = "words"

    word = db.Column(String(10), primary_key=True)
    definition = db.Column(String(100), nullable=True)
    updated_at = db.Column(
        DateTime(timezone=True),
        nullable=False,
        default=utcnow,
        onupdate=utcnow,
    )

    characters = db.relationship(
        "Character",
        secondary=character_word,
        back_populates="words",
    )


class HskWord(db.Model):
    __tablename__ = "hsk_words"

    word = db.Column(String(32), primary_key=True)
    level = db.Column(Integer, nullable=False)
    frequency = db.Column(Integer, nullable=False)

    characters = db.relationship(
        "HskCharacter",
        secondary=hsk_word_character,
        back_populates="words",
    )


class HskCharacter(db.Model):
    __tablename__ = "hsk_characters"

    character = db.Column(String(1), primary_key=True)
    level = db.Column(Integer, nullable=False)
    frequency = db.Column(Integer, nullable=False)

    words = db.relationship(
        "HskWord",
        secondary=hsk_word_character,
        back_populates="characters",
    )
