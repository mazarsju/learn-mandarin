# Agent Instructions

## Repository navigation

After every AI-assisted change in this repository, update `README.md` so it reflects the current setup, commands, and project structure. Use `README.md` as the primary source of truth when orienting yourself in the codebase; keep `agent.md` aligned with it so agents can find their way through the repository faster.

## Python

Use `python3` instead of `python` when invoking Python or running Python libraries and scripts in this project.

Examples:

```bash
python3 -m venv venv
python3 -m backend.app
python3 -m pip install -r backend/requirements.txt
```

Do not use the `python` command unless the environment explicitly requires it.
