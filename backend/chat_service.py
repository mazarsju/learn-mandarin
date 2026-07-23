from dataclasses import dataclass

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

from backend.chat_agents import get_character, get_system_prompt
from backend.chinese_validation import extract_han_characters
from backend.llm import get_llm
from backend.models import Character

VALID_ROLES = {"user", "assistant"}
MAX_REPHRASE_ATTEMPTS = 3


@dataclass(frozen=True)
class ChatReplyResult:
    content: str
    unknown_characters: list[list[str]]


def _llm_response_text(response) -> str:
    content = response.content

    if isinstance(content, str):
        text = content.strip()
        if text:
            return text

    if isinstance(content, list):
        text_parts = [
            part.get("text", "")
            for part in content
            if isinstance(part, dict) and part.get("type") == "text"
        ]
        combined = "".join(text_parts).strip()
        if combined:
            return combined

    raise ValueError("The LLM returned an empty response")


def find_unknown_characters(
    text: str,
    known_characters: set[str] | None = None,
) -> list[str]:
    """Return Han characters in ``text`` that are not in the learner's vocabulary."""
    if known_characters is None:
        known_characters = {row.char for row in Character.query.all()}

    unknown = extract_han_characters(text) - known_characters
    return sorted(unknown)


def _rephrase_instruction(unknown_characters: list[str]) -> str:
    listed = "、".join(unknown_characters)
    return (
        "Please rephrase your previous reply without using these Chinese "
        f"characters the learner does not know yet: {listed}. Keep the same "
        "meaning, stay in character, and avoid introducing other unknown "
        "characters."
    )


def _best_attempt(
    attempts: list[tuple[str, list[str]]],
) -> tuple[str, list[str]]:
    """Pick the earliest reply that has the fewest unknown characters."""
    best_index = min(
        range(len(attempts)),
        key=lambda index: (len(attempts[index][1]), index),
    )
    return attempts[best_index]


def generate_chat_reply(
    character_id: str,
    messages: list[dict[str, str]],
) -> ChatReplyResult:
    if not messages:
        raise ValueError("At least one message is required")

    langchain_messages = [SystemMessage(content=get_system_prompt(character_id))]

    for message in messages:
        role = message["role"]
        content = message["content"].strip()

        if role not in VALID_ROLES:
            raise ValueError(f"Invalid message role: {role}")

        if content == "":
            raise ValueError("Message content must be a non-empty string")

        if role == "user":
            langchain_messages.append(HumanMessage(content=content))
        else:
            langchain_messages.append(AIMessage(content=content))

    if messages[-1]["role"] != "user":
        raise ValueError("The last message must be from the user")

    character = get_character(character_id)
    llm = get_llm()
    reply = _llm_response_text(llm.invoke(langchain_messages))

    if not character.get("retry_unknown_characters", False):
        return ChatReplyResult(content=reply, unknown_characters=[])

    known_characters = {row.char for row in Character.query.all()}
    attempts: list[tuple[str, list[str]]] = []

    while True:
        unknown_characters = find_unknown_characters(reply, known_characters)
        attempts.append((reply, unknown_characters))

        if not unknown_characters:
            break

        if len(attempts) > MAX_REPHRASE_ATTEMPTS:
            break

        langchain_messages.append(AIMessage(content=reply))
        langchain_messages.append(
            HumanMessage(content=_rephrase_instruction(unknown_characters))
        )
        reply = _llm_response_text(llm.invoke(langchain_messages))

    best_content, best_unknowns = _best_attempt(attempts)
    return ChatReplyResult(
        content=best_content,
        unknown_characters=(
            [unknowns for _, unknowns in attempts] if best_unknowns else []
        ),
    )
