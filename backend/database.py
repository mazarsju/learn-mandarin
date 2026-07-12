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


def init_db(app: Flask) -> None:
    import backend.models  # noqa: F401

    with app.app_context():
        db.create_all()
        _migrate_updated_at_columns()
