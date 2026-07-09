import os

from flask import Flask

from backend.extensions import db


def configure_database(app: Flask) -> None:
    db_path = os.environ.get(
        "DATABASE_PATH",
        os.path.join(os.path.dirname(__file__), "learn_mandarin.db"),
    )
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    db.init_app(app)


def init_db(app: Flask) -> None:
    import backend.models  # noqa: F401

    with app.app_context():
        db.create_all()
