from flask import Blueprint, request

from backend.llm import LLM_API_KEY_ENV, LLM_MODEL_ENV, reset_llm_cache
from backend.llm_config import read_llm_config, write_llm_config

bp = Blueprint("llm_config", __name__)


@bp.get("/llm-config")
def get_llm_config():
    return read_llm_config(), 200


@bp.post("/llm-config")
def update_llm_config():
    data = request.get_json(silent=True)
    if data is None:
        return {"error": "Invalid JSON body"}, 400

    if not isinstance(data, dict):
        return {"error": "Request body must be a JSON object"}, 400

    if LLM_API_KEY_ENV not in data and LLM_MODEL_ENV not in data:
        return {
            "error": (
                f"Request body must include at least one of: "
                f"{LLM_API_KEY_ENV}, {LLM_MODEL_ENV}"
            )
        }, 400

    api_key = data.get(LLM_API_KEY_ENV)
    model = data.get(LLM_MODEL_ENV)

    if api_key is not None and not isinstance(api_key, str):
        return {"error": f"{LLM_API_KEY_ENV} must be a string"}, 400

    if model is not None and not isinstance(model, str):
        return {"error": f"{LLM_MODEL_ENV} must be a string"}, 400

    config = write_llm_config(api_key=api_key, model=model)
    reset_llm_cache()

    return config, 200
