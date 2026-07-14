import os
from pathlib import Path

from backend.llm import LLM_API_KEY_ENV, LLM_MODEL_ENV

CONFIG_FILENAME = ".config.txt"
CONFIG_PATH = Path(
    os.environ.get(
        "LLM_CONFIG_PATH",
        Path(__file__).resolve().parent.parent / CONFIG_FILENAME,
    )
)


def _parse_config_line(line: str) -> tuple[str, str] | None:
    stripped = line.strip()
    if not stripped or stripped.startswith("#"):
        return None

    key, _, value = stripped.partition("=")
    key = key.strip()
    if key not in {LLM_API_KEY_ENV, LLM_MODEL_ENV}:
        return None

    return key, value.strip()


def read_llm_config() -> dict[str, str]:
    config = {
        LLM_API_KEY_ENV: "",
        LLM_MODEL_ENV: "",
    }

    if not CONFIG_PATH.is_file():
        return config

    for line in CONFIG_PATH.read_text(encoding="utf-8").splitlines():
        parsed = _parse_config_line(line)
        if parsed is not None:
            key, value = parsed
            config[key] = value

    return config


def write_llm_config(
    api_key: str | None = None,
    model: str | None = None,
) -> dict[str, str]:
    config = read_llm_config()

    if api_key is not None:
        config[LLM_API_KEY_ENV] = api_key.strip()

    if model is not None:
        config[LLM_MODEL_ENV] = model.strip()

    CONFIG_PATH.write_text(
        "\n".join(
            [
                f"{LLM_API_KEY_ENV}={config[LLM_API_KEY_ENV]}",
                f"{LLM_MODEL_ENV}={config[LLM_MODEL_ENV]}",
            ]
        )
        + "\n",
        encoding="utf-8",
    )

    return config
