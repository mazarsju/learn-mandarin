from flask import Blueprint, request

from backend.chat_service import generate_chat_reply

bp = Blueprint("chat", __name__)

VALID_CHARACTER_IDS = {"teacher-wang", "xiao-ming"}


@bp.post("/chat")
def chat():
    data = request.get_json(silent=True)
    if data is None:
        return {"error": "Invalid JSON body"}, 400

    if not isinstance(data, dict):
        return {"error": "Request body must be a JSON object"}, 400

    character_id = data.get("character_id")
    messages = data.get("messages")

    if not isinstance(character_id, str) or character_id not in VALID_CHARACTER_IDS:
        return {"error": "Invalid character_id"}, 400

    if not isinstance(messages, list) or len(messages) == 0:
        return {"error": "messages must be a non-empty array"}, 400

    normalized_messages = []
    for message in messages:
        if not isinstance(message, dict):
            return {"error": "Each message must be an object"}, 400

        role = message.get("role")
        content = message.get("content")

        if role not in {"user", "assistant"}:
            return {"error": "Each message role must be user or assistant"}, 400

        if not isinstance(content, str) or content.strip() == "":
            return {"error": "Each message content must be a non-empty string"}, 400

        normalized_messages.append(
            {
                "role": role,
                "content": content.strip(),
            }
        )

    if normalized_messages[-1]["role"] != "user":
        return {"error": "The last message must be from the user"}, 400

    try:
        reply = generate_chat_reply(character_id, normalized_messages)
    except ValueError as error:
        return {"error": str(error)}, 400
    except Exception:
        return {"error": "Failed to generate a chat response"}, 500

    return {
        "message": {
            "role": "assistant",
            "content": reply,
        }
    }, 200
