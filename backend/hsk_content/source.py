"""HSK vocabulary source: download and group complete-hsk entries."""

from __future__ import annotations

import json
import re
from pathlib import Path
from urllib.request import urlopen

COMPLETE_HSK_JSON_URL = (
    "https://raw.githubusercontent.com/drkameleon/complete-hsk-vocabulary/main/complete.json"
)
NEW_LEVEL_PATTERN = re.compile(r"^new-(\d+)$")


def fetch_complete_hsk_entries(url: str = COMPLETE_HSK_JSON_URL) -> list[dict]:
    """Download and parse the upstream complete HSK vocabulary JSON."""
    with urlopen(url) as response:  # noqa: S310 - fixed trusted upstream URL
        return json.loads(response.read().decode("utf-8"))


def load_complete_hsk_entries(source: str | Path | None = None) -> list[dict]:
    """Load entries from a local path, or download from GitHub when omitted."""
    if source is None:
        return fetch_complete_hsk_entries()

    path = Path(source)
    return json.loads(path.read_text(encoding="utf-8"))


def words_by_new_level(
    entries: list[dict],
) -> list[list[tuple[str, int]]]:
    """Group entries by ``new-1`` … ``new-7`` as ``(word, frequency)`` lists.

    Ignores ``old-X`` / ``newest-X`` labels. Each level list is sorted by
    frequency ascending.
    """
    lists: list[list[tuple[str, int]]] = [[] for _ in range(7)]

    for entry in entries:
        for level_label in entry.get("level", []):
            match = NEW_LEVEL_PATTERN.fullmatch(level_label)
            if match is None:
                continue
            level_number = int(match.group(1))
            if 1 <= level_number <= 7:
                lists[level_number - 1].append(
                    (entry["simplified"], int(entry["frequency"]))
                )

    for rows in lists:
        rows.sort(key=lambda row: row[1])

    return lists
