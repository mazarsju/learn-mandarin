import bootstrap  # noqa: F401
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch

from backend.conversation_logs import (
    append_message,
    clear_conversation,
    load_conversation,
    should_append_user_message,
)


class TestConversationLogs(unittest.TestCase):
    def setUp(self):
        self.temp_dir = TemporaryDirectory()
        self.addCleanup(self.temp_dir.cleanup)
        self.logs_dir = Path(self.temp_dir.name)

        self.dir_patcher = patch(
            "backend.conversation_logs.CONVERSATION_LOGS_DIR",
            self.logs_dir,
        )
        self.dir_patcher.start()
        self.addCleanup(self.dir_patcher.stop)

    def test_append_and_load_conversation(self):
        append_message("teacher-wang", "user", "你好")
        append_message("teacher-wang", "assistant", "你好！")

        self.assertEqual(
            load_conversation("teacher-wang"),
            [
                {"role": "user", "content": "你好"},
                {"role": "assistant", "content": "你好！"},
            ],
        )

        log_file = self.logs_dir / "teacher-wang.txt"
        self.assertEqual(
            log_file.read_text(encoding="utf-8"),
            "me: 你好\nagent: 你好！\n",
        )

    def test_load_conversation_returns_empty_list_when_file_missing(self):
        self.assertEqual(load_conversation("xiao-ming"), [])

    def test_clear_conversation_removes_log_file(self):
        append_message("teacher-wang", "user", "你好")
        append_message("teacher-wang", "assistant", "你好！")

        clear_conversation("teacher-wang")

        self.assertEqual(load_conversation("teacher-wang"), [])
        self.assertFalse((self.logs_dir / "teacher-wang.txt").exists())

    def test_clear_conversation_is_noop_when_file_missing(self):
        clear_conversation("xiao-ming")
        self.assertEqual(load_conversation("xiao-ming"), [])

    def test_should_append_user_message_avoids_duplicate_user_entries(self):
        append_message("xiao-ming", "user", "Hello")

        self.assertFalse(
            should_append_user_message(
                "xiao-ming",
                {"role": "user", "content": "Hello"},
            )
        )
        self.assertTrue(
            should_append_user_message(
                "xiao-ming",
                {"role": "user", "content": "How are you?"},
            )
        )


if __name__ == "__main__":
    unittest.main()
