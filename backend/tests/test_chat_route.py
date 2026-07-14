import bootstrap  # noqa: F401
import unittest
from unittest.mock import MagicMock, patch

import backend.database as database_module

database_module.init_db = MagicMock()
database_module.configure_database = MagicMock()

from backend.app import app  # noqa: E402


class TestChatEndpoint(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
        self.generate_patcher = patch("backend.routes.chat.generate_chat_reply")
        self.mock_generate = self.generate_patcher.start()
        self.addCleanup(self.generate_patcher.stop)
        self.mock_generate.reset_mock()

    def test_chat_returns_assistant_message(self):
        self.mock_generate.return_value = "你好，很高兴认识你。"

        response = self.client.post(
            "/chat",
            json={
                "character_id": "teacher-wang",
                "messages": [{"role": "user", "content": "你好"}],
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.get_json(),
            {
                "message": {
                    "role": "assistant",
                    "content": "你好，很高兴认识你。",
                }
            },
        )
        self.mock_generate.assert_called_once_with(
            "teacher-wang",
            [{"role": "user", "content": "你好"}],
        )

    def test_chat_rejects_invalid_character_id(self):
        response = self.client.post(
            "/chat",
            json={
                "character_id": "unknown",
                "messages": [{"role": "user", "content": "你好"}],
            },
        )

        self.assertEqual(response.status_code, 400)
        self.mock_generate.assert_not_called()

    def test_chat_returns_service_error(self):
        self.mock_generate.side_effect = ValueError("LLM_API_KEY must be set")

        response = self.client.post(
            "/chat",
            json={
                "character_id": "xiao-ming",
                "messages": [{"role": "user", "content": "你好"}],
            },
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.get_json(),
            {"error": "LLM_API_KEY must be set"},
        )


if __name__ == "__main__":
    unittest.main()
