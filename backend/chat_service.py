from dataclasses import dataclass
import json
import re

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

from backend.chat_agents import get_character, get_system_prompt
from backend.chinese_validation import extract_han_characters
from backend.llm import get_llm
from backend.models import Character

VALID_ROLES = {"user", "assistant"}
MAX_REPHRASE_ATTEMPTS = 3
TEACHER_CHARACTER_ID = "teacher-wang"
GRAMMAR_CHECK_INSTRUCTION = (
    "Check whether the learner's Chinese message is grammatically correct. "
    "Reply with ONLY a JSON object and no other text. "
    'If the grammar is correct, respond exactly: {"correct": true}. '
    "If the grammar is incorrect, respond exactly: "
    '{"correct": false, "answer": "<brief correction and explanation>"}.'
)


@dataclass(frozen=True)
class ChatReplyResult:
    content: str
    unknown_characters: list[list[str]]


@dataclass(frozen=True)
class GrammarCorrection:
    correct: bool
    answer: str | None = None

    def to_dict(self) -> dict:
        payload: dict = {"correct": self.correct}
        if not self.correct and self.answer is not None:
            payload["answer"] = self.answer
        return payload


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


def _extract_json_object(text: str) -> dict:
    stripped = text.strip()
    fenced = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", stripped, re.DOTALL)
    if fenced:
        stripped = fenced.group(1).strip()
    else:
        start = stripped.find("{")
        end = stripped.rfind("}")
        if start != -1 and end != -1 and end > start:
            stripped = stripped[start : end + 1]

    parsed = json.loads(stripped)
    if not isinstance(parsed, dict):
        raise ValueError("Grammar check response must be a JSON object")
    return parsed


def check_user_grammar(user_message: str) -> GrammarCorrection:
    """Ask Teacher Wang whether the learner's message is grammatically correct."""
    content = user_message.strip()
    if content == "":
        raise ValueError("Message content must be a non-empty string")

    messages = [
        SystemMessage(
            content=(
                f"{get_system_prompt(TEACHER_CHARACTER_ID)} "
                f"{GRAMMAR_CHECK_INSTRUCTION}"
            )
        ),
        HumanMessage(content=content),
    ]
    raw = _llm_response_text(get_llm().invoke(messages))
    parsed = _extract_json_object(raw)

    correct = parsed.get("correct")
    if not isinstance(correct, bool):
        raise ValueError("Grammar check response must include boolean 'correct'")

    if correct:
        return GrammarCorrection(correct=True)

    answer = parsed.get("answer")
    if not isinstance(answer, str) or answer.strip() == "":
        raise ValueError(
            "Grammar check response must include non-empty 'answer' when incorrect"
        )

    return GrammarCorrection(correct=False, answer=answer.strip())


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
