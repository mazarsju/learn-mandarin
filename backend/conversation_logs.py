import os
from pathlib import Path

from backend.chat_agents import CHAT_CHARACTERS

CONVERSATION_LOGS_DIR = Path(
    os.environ.get(
        "CONVERSATION_LOGS_DIR",
        Path(__file__).resolve().parent.parent / "conversation_logs",
    )
)

VALID_CHARACTER_IDS = set(CHAT_CHARACTERS.keys())
USER_PREFIX = "me: "
AGENT_PREFIX = "agent: "


def _unescape_content(content: str) -> str:
    return content.replace("\\n", "\n")


def _escape_content(content: str) -> str:
    return content.replace("\n", "\\n")


def get_log_file(character_id: str) -> Path:
    if character_id not in VALID_CHARACTER_IDS:
        raise ValueError("Invalid character_id")

    return CONVERSATION_LOGS_DIR / f"{character_id}.txt"


def _format_line(role: str, content: str) -> str:
    prefix = USER_PREFIX if role == "user" else AGENT_PREFIX
    return f"{prefix}{_escape_content(content)}"


def _parse_line(line: str) -> dict[str, str] | None:
    if line.startswith(USER_PREFIX):
        return {
            "role": "user",
            "content": _unescape_content(line[len(USER_PREFIX) :]),
        }

    if line.startswith(AGENT_PREFIX):
        return {
            "role": "assistant",
            "content": _unescape_content(line[len(AGENT_PREFIX) :]),
        }

    return None


def load_conversation(character_id: str) -> list[dict[str, str]]:
    log_file = get_log_file(character_id)
    if not log_file.is_file():
        return []

    messages: list[dict[str, str]] = []
    for line in log_file.read_text(encoding="utf-8").splitlines():
        if line.strip() == "":
            continue

        parsed = _parse_line(line)
        if parsed is not None:
            messages.append(parsed)

    return messages


def append_message(character_id: str, role: str, content: str) -> None:
    if role not in {"user", "assistant"}:
        raise ValueError("Invalid message role")

    CONVERSATION_LOGS_DIR.mkdir(parents=True, exist_ok=True)
    log_file = get_log_file(character_id)

    with log_file.open("a", encoding="utf-8") as file:
        file.write(_format_line(role, content) + "\n")


def should_append_user_message(
    character_id: str,
    user_message: dict[str, str],
) -> bool:
    existing_messages = load_conversation(character_id)
    if not existing_messages:
        return True

    last_message = existing_messages[-1]
    return not (
        last_message["role"] == "user"
        and last_message["content"] == user_message["content"]
    )
