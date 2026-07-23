import os
import shutil
import uuid
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
# Legacy single-line correction answer (pre-thread format).
CORRECTION_PREFIX = "correction: "
CORRECTION_THREAD_PREFIX = "correction-thread: "


def _unescape_content(content: str) -> str:
    return content.replace("\\n", "\n")


def _escape_content(content: str) -> str:
    return content.replace("\n", "\\n")


def get_log_file(character_id: str) -> Path:
    if character_id not in VALID_CHARACTER_IDS:
        raise ValueError("Invalid character_id")

    return CONVERSATION_LOGS_DIR / f"{character_id}.txt"


def get_threads_dir(character_id: str) -> Path:
    if character_id not in VALID_CHARACTER_IDS:
        raise ValueError("Invalid character_id")

    return CONVERSATION_LOGS_DIR / character_id / "threads"


def get_thread_file(character_id: str, thread_id: str) -> Path:
    if character_id not in VALID_CHARACTER_IDS:
        raise ValueError("Invalid character_id")

    if not _is_valid_thread_id(thread_id):
        raise ValueError("Invalid thread_id")

    return get_threads_dir(character_id) / f"{thread_id}.txt"


def _is_valid_thread_id(thread_id: str) -> bool:
    return bool(thread_id) and all(char.isalnum() or char == "-" for char in thread_id)


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


def _load_messages_from_file(log_file: Path) -> list[dict[str, str]]:
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


def load_thread(character_id: str, thread_id: str) -> list[dict[str, str]]:
    return _load_messages_from_file(get_thread_file(character_id, thread_id))


def thread_exists(character_id: str, thread_id: str) -> bool:
    try:
        return get_thread_file(character_id, thread_id).is_file()
    except ValueError:
        return False


def create_correction_thread(
    character_id: str,
    initial_assistant_message: str,
) -> tuple[str, list[dict[str, str]]]:
    """Create a Teacher Wang correction thread under a parent conversation."""
    content = initial_assistant_message.strip()
    if content == "":
        raise ValueError("Thread message content must be a non-empty string")

    thread_id = uuid.uuid4().hex
    thread_messages = [{"role": "assistant", "content": content}]
    _write_thread_messages(character_id, thread_id, thread_messages)
    return thread_id, thread_messages


def append_thread_message(
    character_id: str,
    thread_id: str,
    role: str,
    content: str,
) -> None:
    if role not in {"user", "assistant"}:
        raise ValueError("Invalid message role")

    stripped = content.strip()
    if stripped == "":
        raise ValueError("Message content must be a non-empty string")

    if not thread_exists(character_id, thread_id):
        raise ValueError("Unknown correction thread")

    thread_file = get_thread_file(character_id, thread_id)
    with thread_file.open("a", encoding="utf-8") as file:
        file.write(_format_line(role, stripped) + "\n")


def _write_thread_messages(
    character_id: str,
    thread_id: str,
    messages: list[dict[str, str]],
) -> None:
    threads_dir = get_threads_dir(character_id)
    threads_dir.mkdir(parents=True, exist_ok=True)
    thread_file = get_thread_file(character_id, thread_id)
    lines = [_format_line(message["role"], message["content"]) for message in messages]
    thread_file.write_text("\n".join(lines) + ("\n" if lines else ""), encoding="utf-8")


def load_conversation(character_id: str) -> list[dict]:
    log_file = get_log_file(character_id)
    if not log_file.is_file():
        return []

    messages: list[dict] = []
    needs_rewrite = False

    for line in log_file.read_text(encoding="utf-8").splitlines():
        if line.strip() == "":
            continue

        if line.startswith(CORRECTION_THREAD_PREFIX):
            if messages and messages[-1]["role"] == "user":
                thread_id = line[len(CORRECTION_THREAD_PREFIX) :].strip()
                _attach_thread(messages[-1], character_id, thread_id)
            continue

        if line.startswith(CORRECTION_PREFIX):
            if messages and messages[-1]["role"] == "user":
                answer = _unescape_content(line[len(CORRECTION_PREFIX) :])
                thread_id, thread_messages = create_correction_thread(
                    character_id,
                    answer,
                )
                messages[-1]["correctionThreadId"] = thread_id
                messages[-1]["correctionThread"] = thread_messages
                messages[-1]["correctionAnswer"] = answer
                needs_rewrite = True
            continue

        parsed = _parse_line(line)
        if parsed is not None:
            messages.append(parsed)

    if needs_rewrite:
        _rewrite_conversation(character_id, messages)

    return messages


def _attach_thread(message: dict, character_id: str, thread_id: str) -> None:
    thread_messages = load_thread(character_id, thread_id)
    message["correctionThreadId"] = thread_id
    message["correctionThread"] = thread_messages
    if thread_messages and thread_messages[0]["role"] == "assistant":
        message["correctionAnswer"] = thread_messages[0]["content"]


def _rewrite_conversation(character_id: str, messages: list[dict]) -> None:
    CONVERSATION_LOGS_DIR.mkdir(parents=True, exist_ok=True)
    log_file = get_log_file(character_id)
    lines: list[str] = []

    for message in messages:
        role = message["role"]
        content = message["content"]
        lines.append(_format_line(role, content))
        thread_id = message.get("correctionThreadId")
        if role == "user" and isinstance(thread_id, str) and thread_id:
            lines.append(f"{CORRECTION_THREAD_PREFIX}{thread_id}")

    log_file.write_text("\n".join(lines) + ("\n" if lines else ""), encoding="utf-8")


def append_message(
    character_id: str,
    role: str,
    content: str,
    *,
    correction_thread_id: str | None = None,
) -> None:
    if role not in {"user", "assistant"}:
        raise ValueError("Invalid message role")

    if correction_thread_id is not None and role != "user":
        raise ValueError("Only user messages can link a correction thread")

    if correction_thread_id is not None and not _is_valid_thread_id(
        correction_thread_id
    ):
        raise ValueError("Invalid thread_id")

    CONVERSATION_LOGS_DIR.mkdir(parents=True, exist_ok=True)
    log_file = get_log_file(character_id)

    with log_file.open("a", encoding="utf-8") as file:
        file.write(_format_line(role, content) + "\n")
        if correction_thread_id is not None:
            file.write(f"{CORRECTION_THREAD_PREFIX}{correction_thread_id}\n")


def clear_conversation(character_id: str) -> None:
    log_file = get_log_file(character_id)
    if log_file.is_file():
        log_file.unlink()

    threads_root = CONVERSATION_LOGS_DIR / character_id
    if threads_root.is_dir():
        shutil.rmtree(threads_root)


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


def should_append_thread_user_message(
    character_id: str,
    thread_id: str,
    user_message: dict[str, str],
) -> bool:
    existing_messages = load_thread(character_id, thread_id)
    if not existing_messages:
        return True

    last_message = existing_messages[-1]
    return not (
        last_message["role"] == "user"
        and last_message["content"] == user_message["content"]
    )
