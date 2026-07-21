import bootstrap  # noqa: F401
import unittest
from unittest.mock import MagicMock, patch

import backend.database as database_module

database_module.init_db = MagicMock()
database_module.configure_database = MagicMock()

from backend.app import app  # noqa: E402


class TestListHskVocabularyEndpoint(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
        self.hsk_patcher = patch("backend.routes.list_hsk_vocabulary.HskVocabulary")
        self.mock_hsk_cls = self.hsk_patcher.start()
        self.addCleanup(self.hsk_patcher.stop)
        self.mock_hsk_cls.reset_mock()

    def test_list_hsk_vocabulary_returns_all_records(self):
        first = MagicMock(character="爱", level=1)
        second = MagicMock(character="学", level=2)
        self.mock_hsk_cls.query.order_by.return_value.all.return_value = [
            first,
            second,
        ]

        response = self.client.get("/hsk-vocabulary")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.get_json(),
            [
                {"character": "爱", "level": 1},
                {"character": "学", "level": 2},
            ],
        )
        self.mock_hsk_cls.query.order_by.assert_called_once()


if __name__ == "__main__":
    unittest.main()
