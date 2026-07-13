import bootstrap  # noqa: F401
import unittest
from unittest.mock import MagicMock, patch

import backend.database as database_module

database_module.init_db = MagicMock()
database_module.configure_database = MagicMock()

from backend.app import app  # noqa: E402


class TestListWordsEndpoint(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
        self.word_patcher = patch("backend.routes.list_words.Word")
        self.mock_word_cls = self.word_patcher.start()
        self.addCleanup(self.word_patcher.stop)
        self.mock_word_cls.reset_mock()

    def test_list_words_returns_all_records(self):
        updated_at = "2026-07-12T12:00:00+00:00"
        first = MagicMock(
            word="爱好",
            definition="hobby",
            updated_at=MagicMock(isoformat=MagicMock(return_value=updated_at)),
        )
        second = MagicMock(
            word="爱",
            definition=None,
            updated_at=MagicMock(isoformat=MagicMock(return_value=updated_at)),
        )
        self.mock_word_cls.query.order_by.return_value.all.return_value = [
            first,
            second,
        ]

        response = self.client.get("/words")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.get_json(),
            [
                {
                    "word": "爱好",
                    "definition": "hobby",
                    "updated_at": updated_at,
                },
                {
                    "word": "爱",
                    "definition": None,
                    "updated_at": updated_at,
                },
            ],
        )
        self.mock_word_cls.query.order_by.assert_called_once()


if __name__ == "__main__":
    unittest.main()
