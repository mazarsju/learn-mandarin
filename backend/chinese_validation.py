import re

HAN_CHARACTER_PATTERN = re.compile(
    r"^["
    r"\u3400-\u4dbf"
    r"\u4e00-\u9fff"
    r"\uf900-\ufaff"
    r"]$"
)
HAN_TEXT_PATTERN = re.compile(
    r"^["
    r"\u3400-\u4dbf"
    r"\u4e00-\u9fff"
    r"\uf900-\ufaff"
    r"]+$"
)


def is_han_character(char: str) -> bool:
    return len(char) == 1 and bool(HAN_CHARACTER_PATTERN.fullmatch(char))


def is_han_text(text: str) -> bool:
    return bool(text) and bool(HAN_TEXT_PATTERN.fullmatch(text))
