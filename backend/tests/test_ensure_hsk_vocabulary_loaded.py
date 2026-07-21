import bootstrap  # noqa: F401
import unittest
from pathlib import Path
from unittest.mock import MagicMock, patch

from flask import Flask

from backend.database import _ensure_hsk_vocabulary_loaded
from backend.extensions import db
from backend.models import HskVocabulary


class TestEnsureHskVocabularyLoaded(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
        self.app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
        db.init_app(self.app)
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def test_loads_when_table_is_empty(self):
        with patch(
            "backend.hsk_vocabulary_loader.load_hsk_vocabulary"
        ) as mock_load:
            _ensure_hsk_vocabulary_loaded()

        mock_load.assert_called_once()
        content_dir = mock_load.call_args.args[0]
        self.assertIsInstance(content_dir, Path)
        self.assertEqual(content_dir.name, "hsk-content")

    def test_skips_when_table_has_rows(self):
        db.session.add(HskVocabulary(character="爱", level=1))
        db.session.commit()

        with patch(
            "backend.hsk_vocabulary_loader.load_hsk_vocabulary"
        ) as mock_load:
            _ensure_hsk_vocabulary_loaded()

        mock_load.assert_not_called()


if __name__ == "__main__":
    unittest.main()
