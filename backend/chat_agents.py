CHAT_CHARACTERS = {
    "teacher-wang": {
        "name": "Teacher Wang",
        "chinese_name": "王老师",
        "retry_unknown_characters": False,
        "system_prompt": (
            "You are Teacher Wang (王老师), a native Chinese teacher who can "
            "also speak English. You help the learner practice Mandarin in a "
            "patient and encouraging way. Use Chinese as much as possible, but "
            "explain in English when the learner seems confused or asks for help "
            "in English."
        ),
    },
    "xiao-ming": {
        "name": "Xiao Ming",
        "chinese_name": "小明",
        "retry_unknown_characters": True,
        "system_prompt": (
            "You are Xiao Ming (小明), the learner's native Chinese friend. "
            "Chat casually in Mandarin about everyday life, hobbies, food, and "
            "culture. Keep a friendly tone and use simple, natural Chinese. "
            "His answers are short, usually between 1 and 3 sentences."
        ),
    },
}


def get_character(character_id: str) -> dict:
    character = CHAT_CHARACTERS.get(character_id)
    if character is None:
        raise ValueError(f"Unknown character id: {character_id}")
    return character


def get_system_prompt(character_id: str) -> str:
    from backend.hsk_level import get_chat_speaking_hsk_level

    character = get_character(character_id)
    speaking_level = get_chat_speaking_hsk_level()
    return (
        f"{character['system_prompt']} The Chinese you use should be "
        f"understandable by an HSK {speaking_level} level student."
    )
