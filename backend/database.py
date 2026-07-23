import os

from flask import Flask
from sqlalchemy import inspect, text

from backend.extensions import db


def configure_database(app: Flask) -> None:
    db_path = os.environ.get(
        "DATABASE_PATH",
        os.path.join(os.path.dirname(__file__), "learn_mandarin.db"),
    )
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    db.init_app(app)


def _migrate_updated_at_columns() -> None:
    inspector = inspect(db.engine)
    tables = ("character", "words")

    for table_name in tables:
        column_names = {column["name"] for column in inspector.get_columns(table_name)}
        if "updated_at" in column_names:
            continue

        db.session.execute(
            text(f"ALTER TABLE {table_name} ADD COLUMN updated_at DATETIME")
        )
        db.session.execute(
            text(
                f"UPDATE {table_name} "
                "SET updated_at = CURRENT_TIMESTAMP "
                "WHERE updated_at IS NULL"
            )
        )

    db.session.commit()


def _migrate_drop_legacy_hsk_vocabulary() -> None:
    """Drop the old hsk_vocabulary table so content reloads into the new schema."""
    inspector = inspect(db.engine)
    if "hsk_vocabulary" not in inspector.get_table_names():
        return

    db.session.execute(text("DROP TABLE hsk_vocabulary"))
    db.session.commit()


def _migrate_hsk_words_level() -> None:
    """Add level to hsk_words and clear HSK tables so they reload with values."""
    inspector = inspect(db.engine)
    if "hsk_words" not in inspector.get_table_names():
        return

    column_names = {column["name"] for column in inspector.get_columns("hsk_words")}
    if "level" in column_names:
        return

    db.session.execute(text("ALTER TABLE hsk_words ADD COLUMN level INTEGER"))
    db.session.execute(text("DELETE FROM hsk_word_character"))
    db.session.execute(text("DELETE FROM hsk_words"))
    db.session.execute(text("DELETE FROM hsk_characters"))
    db.session.commit()


def _ensure_hsk_content_loaded() -> None:
    from backend.models import HskWord
    from backend.routes.hsk_content_loader import load_hsk_content

    if HskWord.query.first() is not None:
        return

    load_hsk_content()


def init_db(app: Flask) -> None:
    import backend.models  # noqa: F401

    with app.app_context():
        db.create_all()
        _migrate_updated_at_columns()
        _migrate_drop_legacy_hsk_vocabulary()
        _migrate_hsk_words_level()
        _ensure_hsk_content_loaded()
