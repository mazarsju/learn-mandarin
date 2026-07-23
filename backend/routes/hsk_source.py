"""HSK vocabulary source: download and group complete-hsk entries."""

from __future__ import annotations

import json
import logging
import re
from pathlib import Path
from urllib.request import urlopen

COMPLETE_HSK_JSON_URL = (
    "https://raw.githubusercontent.com/drkameleon/complete-hsk-vocabulary/main/complete.json"
)
HSK_FALLBACK_PATH = Path(__file__).resolve().parents[1] / "hsk.json"
NEW_LEVEL_PATTERN = re.compile(r"^new-(\d+)$")

logger = logging.getLogger(__name__)


def fetch_complete_hsk_entries(url: str = COMPLETE_HSK_JSON_URL) -> list[dict]:
    """Download and parse the upstream complete HSK vocabulary JSON."""
    with urlopen(url) as response:  # noqa: S310 - fixed trusted upstream URL
        return json.loads(response.read().decode("utf-8"))


def load_fallback_hsk_entries(path: Path = HSK_FALLBACK_PATH) -> list[dict]:
    """Load the bundled lightweight HSK JSON fallback."""
    return json.loads(path.read_text(encoding="utf-8"))


def load_complete_hsk_entries(source: str | Path | None = None) -> list[dict]:
    """Load entries from a local path, or download from GitHub when omitted.

    When downloading fails for any reason, falls back to ``backend/hsk.json``.
    """
    if source is not None:
        path = Path(source)
        return json.loads(path.read_text(encoding="utf-8"))

    try:
        return fetch_complete_hsk_entries()
    except Exception:
        logger.exception(
            "Failed to download %s; using fallback %s",
            COMPLETE_HSK_JSON_URL,
            HSK_FALLBACK_PATH,
        )
        return load_fallback_hsk_entries()


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
