import bootstrap  # noqa: F401
import tempfile
import unittest
from pathlib import Path
from unittest.mock import MagicMock, patch

import backend.database as database_module

database_module.init_db = MagicMock()
database_module.configure_database = MagicMock()

from backend.llm import LLM_API_KEY_ENV, LLM_MODEL_ENV  # noqa: E402
from backend.llm_config import read_llm_config, write_llm_config  # noqa: E402


class TestLlmConfigFile(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.config_path = Path(self.temp_dir.name) / ".config.txt"
        self.path_patcher = patch(
            "backend.llm_config.CONFIG_PATH",
            self.config_path,
        )
        self.path_patcher.start()
        self.addCleanup(self.path_patcher.stop)
        self.addCleanup(self.temp_dir.cleanup)

    def test_read_llm_config_returns_empty_values_when_file_missing(self):
        self.assertEqual(
            read_llm_config(),
            {
                LLM_API_KEY_ENV: "",
                LLM_MODEL_ENV: "",
            },
        )

    def test_write_and_read_llm_config(self):
        write_llm_config(api_key="secret-key", model="gpt-4o-mini")

        self.assertEqual(
            read_llm_config(),
            {
                LLM_API_KEY_ENV: "secret-key",
                LLM_MODEL_ENV: "gpt-4o-mini",
            },
        )
        self.assertEqual(
            self.config_path.read_text(encoding="utf-8"),
            "LLM_API_KEY=secret-key\nLLM_MODEL=gpt-4o-mini\n",
        )

    def test_write_llm_config_updates_only_provided_values(self):
        write_llm_config(api_key="secret-key", model="gpt-4o-mini")

        write_llm_config(model="gpt-4o")

        self.assertEqual(
            read_llm_config(),
            {
                LLM_API_KEY_ENV: "secret-key",
                LLM_MODEL_ENV: "gpt-4o",
            },
        )


if __name__ == "__main__":
    unittest.main()
