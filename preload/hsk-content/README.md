# HSK content preload

These files are **not** part of the frontend or backend app. They are only used to prepare HSK vocabulary lists offline.

## Source data

Word lists are derived from [`complete.json`](https://github.com/drkameleon/complete-hsk-vocabulary/blob/main/complete.json) in the [complete-hsk-vocabulary](https://github.com/drkameleon/complete-hsk-vocabulary/tree/main) repository (HSK 2.0 / 3.0 vocabulary).

Download that file into this folder before regenerating the lists.

## Generated files

| File | Contents |
| --- | --- |
| `hsk-1.txt` … `hsk-7.txt` | Simplified words for each HSK 3.0 `new-X` level (one word per line) |
| `character-hsk-1.txt` … `character-hsk-7.txt` | Unique Han characters used in the matching `hsk-X.txt`, comma-separated |

## Scripts

1. `groupSimplifiedByNewLevel.ts` — splits `complete.json` entries by `new-1` … `new-7` and writes `hsk-X.txt`
2. `writeCharacterHskFiles.ts` — reads `hsk-X.txt` and writes `character-hsk-X.txt`

Example (from this folder, with Node 22+):

```bash
node --experimental-strip-types -e '
import { readFileSync } from "node:fs";
import { groupSimplifiedByNewLevel } from "./groupSimplifiedByNewLevel.ts";
import { writeCharacterHskFiles } from "./writeCharacterHskFiles.ts";

const entries = JSON.parse(readFileSync("./complete.json", "utf-8"));
groupSimplifiedByNewLevel(entries, ".");
writeCharacterHskFiles(".");
'
```
