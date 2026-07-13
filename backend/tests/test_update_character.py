import bootstrap  # noqa: F401
import unittest
from unittest.mock import MagicMock, patch

import backend.database as database_module

database_module.init_db = MagicMock()
database_module.configure_database = MagicMock()

from backend.app import app  # noqa: E402


class TestUpdateCharacterEndpoint(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
        self.session_patcher = patch("backend.routes.update_character.db.session")
        self.mock_session = self.session_patcher.start()
        self.addCleanup(self.session_patcher.stop)

        self.character_patcher = patch("backend.routes.update_character.Character")
        self.mock_character_cls = self.character_patcher.start()
        self.addCleanup(self.character_patcher.stop)

        self.utcnow_patcher = patch("backend.routes.update_character.utcnow")
        self.mock_utcnow = self.utcnow_patcher.start()
        self.addCleanup(self.utcnow_patcher.stop)

        self.mock_character_cls.reset_mock()
        self.mock_session.reset_mock()
        self.mock_utcnow.reset_mock()

    def test_update_character_updates_record(self):
        updated_at = MagicMock(isoformat=MagicMock(return_value="2026-07-12T12:00:00+00:00"))
        char_record = MagicMock(
            char="爱",
            pinyin="old",
            writting_known=False,
            updated_at=updated_at,
        )
        self.mock_character_cls.query.filter_by.return_value.first.return_value = (
            char_record
        )
        self.mock_utcnow.return_value = updated_at

        response = self.client.patch(
            "/characters/爱",
            json={"pinyin": "ai", "writting_known": True},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.get_json(),
            {
                "char": "爱",
                "pinyin": "ai",
                "writting_known": True,
                "updated_at": "2026-07-12T12:00:00+00:00",
            },
        )
        self.assertEqual(char_record.pinyin, "ai")
        self.assertTrue(char_record.writting_known)
        self.mock_session.commit.assert_called_once()

    def test_update_missing_character_returns_not_found(self):
        self.mock_character_cls.query.filter_by.return_value.first.return_value = None

        response = self.client.patch(
            "/characters/爱",
            json={"pinyin": "ai", "writting_known": True},
        )

        self.assertEqual(response.status_code, 404)
        self.mock_session.commit.assert_not_called()

    def test_update_character_with_invalid_body_returns_error(self):
        response = self.client.patch("/characters/爱", json={"pinyin": "ai"})

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.get_json(),
            {"error": "Missing required fields: pinyin, writting_known"},
        )


if __name__ == "__main__":
    unittest.main()
