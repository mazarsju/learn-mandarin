import os
from functools import lru_cache

from langchain_core.language_models.chat_models import BaseChatModel
from langchain_openai import ChatOpenAI

LLM_API_KEY_ENV = "LLM_API_KEY"
LLM_MODEL_ENV = "LLM_MODEL"


def _get_config_value(name: str) -> str:
    from backend.llm_config import read_llm_config

    file_value = read_llm_config().get(name, "").strip()
    if file_value:
        return file_value

    env_value = os.environ.get(name, "").strip()
    if env_value:
        return env_value

    raise ValueError(f"{name} must be set in .config.txt or as an environment variable")


@lru_cache(maxsize=1)
def get_llm() -> BaseChatModel:
    api_key = _get_config_value(LLM_API_KEY_ENV)
    model = _get_config_value(LLM_MODEL_ENV)

    return ChatOpenAI(api_key=api_key, model=model)


def reset_llm_cache() -> None:
    get_llm.cache_clear()
