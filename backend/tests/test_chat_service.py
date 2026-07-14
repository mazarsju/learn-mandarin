import bootstrap  # noqa: F401
import unittest
from unittest.mock import MagicMock, patch

import backend.database as database_module

database_module.init_db = MagicMock()
database_module.configure_database = MagicMock()

from backend.chat_service import generate_chat_reply  # noqa: E402


class TestGenerateChatReply(unittest.TestCase):
    @patch("backend.chat_service.get_llm")
    def test_generate_chat_reply_returns_assistant_message(self, mock_get_llm):
        mock_llm = MagicMock()
        mock_llm.invoke.return_value = MagicMock(content="你好！")
        mock_get_llm.return_value = mock_llm

        reply = generate_chat_reply(
            "teacher-wang",
            [{"role": "user", "content": "你好"}],
        )

        self.assertEqual(reply, "你好！")
        mock_llm.invoke.assert_called_once()
        invoked_messages = mock_llm.invoke.call_args.args[0]
        self.assertIn("Teacher Wang", invoked_messages[0].content)
        self.assertEqual(invoked_messages[1].content, "你好")

    def test_generate_chat_reply_rejects_unknown_character(self):
        with self.assertRaises(ValueError):
            generate_chat_reply("unknown", [{"role": "user", "content": "你好"}])

    def test_generate_chat_reply_requires_user_message_last(self):
        with self.assertRaises(ValueError):
            generate_chat_reply(
                "xiao-ming",
                [{"role": "assistant", "content": "你好"}],
            )


if __name__ == "__main__":
    unittest.main()
