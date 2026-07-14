from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

from backend.chat_agents import get_system_prompt
from backend.llm import get_llm

VALID_ROLES = {"user", "assistant"}


def generate_chat_reply(character_id: str, messages: list[dict[str, str]]) -> str:
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

    response = get_llm().invoke(langchain_messages)
    content = response.content

    if isinstance(content, str):
        return content.strip()

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
