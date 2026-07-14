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

        self.append_patcher = patch("backend.routes.chat.append_message")
        self.mock_append = self.append_patcher.start()
        self.addCleanup(self.append_patcher.stop)

        self.should_append_patcher = patch(
            "backend.routes.chat.should_append_user_message"
        )
        self.mock_should_append = self.should_append_patcher.start()
        self.addCleanup(self.should_append_patcher.stop)

        self.load_patcher = patch("backend.routes.chat.load_conversation")
        self.mock_load = self.load_patcher.start()
        self.addCleanup(self.load_patcher.stop)

        self.mock_generate.reset_mock()
        self.mock_append.reset_mock()
        self.mock_should_append.reset_mock()
        self.mock_load.reset_mock()
        self.mock_should_append.return_value = True

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
        self.mock_append.assert_any_call("teacher-wang", "user", "你好")
        self.mock_append.assert_any_call(
            "teacher-wang",
            "assistant",
            "你好，很高兴认识你。",
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
        self.mock_append.assert_not_called()

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
        self.mock_append.assert_called_once_with("xiao-ming", "user", "你好")

    def test_chat_history_returns_saved_messages(self):
        self.mock_load.return_value = [
            {"role": "user", "content": "Hello"},
            {"role": "assistant", "content": "你好"},
        ]

        response = self.client.get("/chat/history/teacher-wang")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.get_json(),
            {
                "messages": [
                    {"role": "user", "content": "Hello"},
                    {"role": "assistant", "content": "你好"},
                ]
            },
        )
        self.mock_load.assert_called_once_with("teacher-wang")

    def test_chat_history_rejects_invalid_character_id(self):
        response = self.client.get("/chat/history/unknown")

        self.assertEqual(response.status_code, 400)
        self.mock_load.assert_not_called()


if __name__ == "__main__":
    unittest.main()
