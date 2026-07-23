# HSK content

Helpers that download [complete-hsk-vocabulary](https://github.com/drkameleon/complete-hsk-vocabulary)
`complete.json` and load it into `hsk_words` / `hsk_characters`.

On backend startup, if `hsk_words` is empty, the same download+load runs automatically.

## Manual reload

From the project root (venv activated):

```bash
python3 -m backend.hsk_content.load_hsk_content
# optional local JSON override:
python3 -m backend.hsk_content.load_hsk_content /path/to/complete.json
```
