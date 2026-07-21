from pathlib import Path

from sqlalchemy.dialects.sqlite import insert

from backend.chinese_validation import is_han_character
from backend.extensions import db
from backend.models import HskVocabulary


def parse_hsk_file(path: Path) -> list[str]:
    """Return unique Han characters from an hsk-X.txt word list (first-seen order)."""
    words = path.read_text(encoding="utf-8").splitlines()
    unique_chars: list[str] = []
    seen: set[str] = set()

    for word in words:
        word = word.strip()
        if not word:
            continue
        for char in word:
            if not is_han_character(char):
                raise ValueError(f"Invalid character in {path.name}: {char!r}")
            if char not in seen:
                seen.add(char)
                unique_chars.append(char)

    return unique_chars


def load_hsk_vocabulary(content_dir: Path) -> dict[str, int]:
    """Insert characters from hsk-1.txt … hsk-7.txt.

    Uses INSERT OR IGNORE so a character present in level N and N+1 keeps level N.
    Returns the number of unique characters processed per level file.
    """
    processed_by_level: dict[str, int] = {}

    for level in range(1, 8):
        path = content_dir / f"hsk-{level}.txt"
        if not path.is_file():
            raise FileNotFoundError(f"Missing HSK word file: {path}")

        characters = parse_hsk_file(path)
        for char in characters:
            statement = (
                insert(HskVocabulary)
                .values(character=char, level=level)
                .on_conflict_do_nothing(index_elements=["character"])
            )
            db.session.execute(statement)

        db.session.commit()
        processed_by_level[f"hsk-{level}"] = len(characters)

    return processed_by_level
