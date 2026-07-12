import unittest
from unittest.mock import MagicMock, patch

import backend.database as database_module

database_module.init_db = MagicMock()
database_module.configure_database = MagicMock()

from backend.app import app  # noqa: E402


class TestDeleteCharacterEndpoint(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
        self.session_patcher = patch("backend.app.db.session")
        self.mock_session = self.session_patcher.start()
        self.addCleanup(self.session_patcher.stop)

        self.character_patcher = patch("backend.app.Character")
        self.mock_character_cls = self.character_patcher.start()
        self.addCleanup(self.character_patcher.stop)

        self.mock_character_cls.reset_mock()
        self.mock_session.reset_mock()

    def test_delete_character_removes_record_and_links(self):
        char_record = MagicMock()
        self.mock_character_cls.query.filter_by.return_value.first.return_value = (
            char_record
        )

        response = self.client.delete("/characters/爱")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), {"message": "Character deleted"})
        self.mock_character_cls.query.filter_by.assert_called_once_with(char="爱")
        char_record.words.clear.assert_called_once_with()
        self.mock_session.delete.assert_called_once_with(char_record)
        self.mock_session.commit.assert_called_once()

    def test_delete_missing_character_returns_not_found(self):
        self.mock_character_cls.query.filter_by.return_value.first.return_value = None

        response = self.client.delete("/characters/爱")

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.get_json(), {"error": "Character not found"})
        self.mock_session.delete.assert_not_called()
        self.mock_session.commit.assert_not_called()


if __name__ == "__main__":
    unittest.main()
