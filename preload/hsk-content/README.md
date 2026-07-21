# HSK content preload

These files are **not** part of the frontend or backend app. They are only used to prepare HSK vocabulary lists offline and load them into the database.

## Source data

Word lists are derived from [`complete.json`](https://github.com/drkameleon/complete-hsk-vocabulary/blob/main/complete.json) in the [complete-hsk-vocabulary](https://github.com/drkameleon/complete-hsk-vocabulary/tree/main) repository (HSK 2.0 / 3.0 vocabulary).

Download that file into this folder before regenerating the lists.

## Generated files

| File | Contents |
| --- | --- |
| `hsk-1.txt` … `hsk-7.txt` | Simplified words for each HSK 3.0 `new-X` level (one word per line) |

## Scripts

1. `groupSimplifiedByNewLevel.ts` — splits `complete.json` entries by `new-1` … `new-7` and writes `hsk-X.txt`
2. `load_hsk_vocabulary.py` — loads characters from `hsk-X.txt` into the `hsk_vocabulary` table (level 1 → 7, insert-or-ignore so the lowest level wins). The backend also runs this automatically on startup when the table is empty.

Regenerate word lists (from this folder, with Node 22+):

```bash
node --experimental-strip-types -e '
import { readFileSync } from "node:fs";
import { groupSimplifiedByNewLevel } from "./groupSimplifiedByNewLevel.ts";

const entries = JSON.parse(readFileSync("./complete.json", "utf-8"));
groupSimplifiedByNewLevel(entries, ".");
'
```

Load characters into SQLite (from the project root, with the venv activated):

```bash
python3 preload/hsk-content/load_hsk_vocabulary.py
```
