from flask import Blueprint, request

from backend.chat_service import generate_chat_reply
from backend.conversation_logs import (
    VALID_CHARACTER_IDS,
    append_message,
    clear_conversation,
    load_conversation,
    should_append_user_message,
)

bp = Blueprint("chat", __name__)


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

    last_user_message = normalized_messages[-1]

    try:
        if should_append_user_message(character_id, last_user_message):
            append_message(character_id, "user", last_user_message["content"])

        reply = generate_chat_reply(character_id, normalized_messages)
        append_message(character_id, "assistant", reply.content)
    except ValueError as error:
        return {"error": str(error)}, 400
    except Exception:
        return {"error": "Failed to generate a chat response"}, 500

    response = {
        "message": {
            "role": "assistant",
            "content": reply.content,
        }
    }
    if reply.unknown_characters:
        response["unknown_characters"] = reply.unknown_characters

    return response, 200


@bp.get("/chat/history/<character_id>")
def chat_history(character_id: str):
    if character_id not in VALID_CHARACTER_IDS:
        return {"error": "Invalid character_id"}, 400

    return {"messages": load_conversation(character_id)}, 200


@bp.delete("/chat/history/<character_id>")
def delete_chat_history(character_id: str):
    if character_id not in VALID_CHARACTER_IDS:
        return {"error": "Invalid character_id"}, 400

    clear_conversation(character_id)
    return {"message": "Chat history cleared"}, 200
