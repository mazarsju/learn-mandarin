import bootstrap  # noqa: F401
import tempfile
import unittest
from pathlib import Path

from flask import Flask

from backend.extensions import db
from backend.hsk_vocabulary_loader import load_hsk_vocabulary, parse_hsk_file
from backend.models import HskVocabulary  # noqa: F401


class TestLoadHskVocabulary(unittest.TestCase):
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

    def test_parse_hsk_file_extracts_unique_characters(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "hsk-1.txt"
            path.write_text("爱\n爱好\n八\n", encoding="utf-8")

            self.assertEqual(parse_hsk_file(path), ["爱", "好", "八"])

    def test_parse_rejects_non_han(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "hsk-1.txt"
            path.write_text("爱\nA\n", encoding="utf-8")

            with self.assertRaises(ValueError):
                parse_hsk_file(path)

    def test_load_keeps_lowest_level_on_conflict(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            content_dir = Path(temp_dir)
            (content_dir / "hsk-1.txt").write_text("爱\n爱好\n", encoding="utf-8")
            (content_dir / "hsk-2.txt").write_text("好\n学习\n", encoding="utf-8")
            for level in range(3, 8):
                (content_dir / f"hsk-{level}.txt").write_text("", encoding="utf-8")

            counts = load_hsk_vocabulary(content_dir)

            self.assertEqual(counts["hsk-1"], 2)
            self.assertEqual(counts["hsk-2"], 3)
            self.assertEqual(HskVocabulary.query.count(), 4)
            self.assertEqual(
                HskVocabulary.query.filter_by(character="好").one().level, 1
            )
            self.assertEqual(
                HskVocabulary.query.filter_by(character="学").one().level, 2
            )


if __name__ == "__main__":
    unittest.main()
