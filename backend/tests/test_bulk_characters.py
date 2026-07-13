import bootstrap  # noqa: F401
import io
import sys
import unittest
from unittest.mock import MagicMock, patch

import backend.database as database_module

database_module.init_db = MagicMock()
database_module.configure_database = MagicMock()

sys.modules.pop("backend.app", None)

from backend.app import app  # noqa: E402


class TestBulkCharactersEndpoint(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
        self.session_patcher = patch("backend.routes.bulk_characters.db.session")
        self.mock_session = self.session_patcher.start()
        self.addCleanup(self.session_patcher.stop)

        self.character_patcher = patch("backend.routes.bulk_characters.Character")
        self.mock_character_cls = self.character_patcher.start()
        self.addCleanup(self.character_patcher.stop)

        self.word_patcher = patch("backend.routes.bulk_characters.Word")
        self.mock_word_cls = self.word_patcher.start()
        self.addCleanup(self.word_patcher.stop)

        self.mock_character_cls.reset_mock()
        self.mock_word_cls.reset_mock()
        self.mock_session.reset_mock()

        self.mock_character_cls.query.filter_by.return_value.first.return_value = None
        self.mock_word_cls.query.filter_by.return_value.first.return_value = None

    def test_no_file_submitted_returns_error(self):
        response = self.client.post("/characters/bulk")

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"error": "No file provided"})
        self.mock_session.add.assert_not_called()
        self.mock_session.commit.assert_not_called()

    def test_invalid_format_missing_column_returns_error(self):
        data = {
            "file": (io.BytesIO("啊;∅a;true\n".encode("utf-8")), "chars.txt"),
        }

        response = self.client.post(
            "/characters/bulk",
            data=data,
            content_type="multipart/form-data",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.get_json(),
            {
                "error": (
                    "Invalid line format. Should have the format "
                    "'character;pinyin;is_known;words'"
                )
            },
        )
        self.mock_session.add.assert_not_called()
        self.mock_session.commit.assert_not_called()

    def test_valid_file_inserts_records_and_returns_success(self):
        created_characters = []

        def make_character(**kwargs):
            record = MagicMock()
            record.char = kwargs["char"]
            record.pinyin = kwargs["pinyin"]
            record.writting_known = kwargs["writting_known"]
            record.words = []
            created_characters.append(record)
            return record

        def make_word(**kwargs):
            record = MagicMock()
            record.word = kwargs["word"]
            record.definition = kwargs["definition"]
            return record

        self.mock_character_cls.side_effect = make_character
        self.mock_word_cls.side_effect = make_word

        file_content = b"X;pinyin;true;word1,word2\n"
        data = {
            "file": (io.BytesIO(file_content), "chars.txt"),
        }

        response = self.client.post(
            "/characters/bulk",
            data=data,
            content_type="multipart/form-data",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), {"message": "File received"})

        self.mock_character_cls.query.filter_by.assert_called_once_with(char="X")
        self.mock_character_cls.assert_called_once_with(
            char="X",
            pinyin="pinyin",
            writting_known=True,
        )

        self.mock_word_cls.query.filter_by.assert_any_call(word="word1")
        self.mock_word_cls.query.filter_by.assert_any_call(word="word2")
        self.mock_word_cls.assert_any_call(word="word1", definition="")
        self.mock_word_cls.assert_any_call(word="word2", definition="")

        char_record = created_characters[0]
        self.assertEqual(len(char_record.words), 2)

        self.assertEqual(self.mock_session.add.call_count, 3)
        self.mock_session.commit.assert_called_once()


if __name__ == "__main__":
    unittest.main()
