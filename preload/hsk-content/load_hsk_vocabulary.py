"""Load unique HSK characters into the hsk_vocabulary table.

Reads hsk-1.txt … hsk-7.txt in order, extracting unique Han characters from each
word list. Existing characters are left unchanged (INSERT OR IGNORE), so a
character that appears in both level N and N+1 keeps level N.
"""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend import create_app  # noqa: E402
from backend.hsk_vocabulary_loader import load_hsk_vocabulary  # noqa: E402
from backend.models import HskVocabulary  # noqa: E402

CONTENT_DIR = Path(__file__).resolve().parent


def main() -> None:
    app = create_app()
    with app.app_context():
        counts = load_hsk_vocabulary(CONTENT_DIR)
        total_rows = HskVocabulary.query.count()

    for label, count in counts.items():
        print(f"{label}: processed {count} characters")
    print(f"hsk_vocabulary rows: {total_rows}")


if __name__ == "__main__":
    main()
