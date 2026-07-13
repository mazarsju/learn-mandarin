> 🚧 **Work in progress** — This repository is currently under active development. See the [roadmap](#roadmap) for planned features and progress.

# learn-mandarin

![Frontend-Statements](.github/badges/coverage-statements.svg)
![Frontend-Branches](.github/badges/coverage-branches.svg)
![Frontend-Functions](.github/badges/coverage-functions.svg)
![Frontend-Lines](.github/badges/coverage-lines.svg)


An app to learn Mandarin.

## Technologies

- **Backend:** Python, Flask, SQLAlchemy, SQLite
- **Frontend:** React, TypeScript, Vite

## Project structure

```
learn-mandarin/
├── backend/
│   ├── __init__.py         # Application factory (create_app)
│   ├── app.py              # Flask entry point
│   ├── database.py         # SQLite configuration and initialization
│   ├── extensions.py       # SQLAlchemy extension
│   ├── models.py           # Character, Word, and association tables
│   ├── routes/             # One endpoint per file (Flask blueprints)
│   ├── learn_mandarin.db   # SQLite database (created on first run)
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── src/
│   │   ├── App.tsx         # Main React component
│   │   ├── main.tsx        # React entry point
│   │   └── vite-env.d.ts
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts      # Vite dev server and proxy config
├── agent.md
└── README.md
```

## Getting started

### Backend

From the project root:

```bash
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
python3 -m pip install -r backend/requirements.txt
python3 -m backend.app
```

The API runs at `http://localhost:5000` by default. Set the `PORT` environment variable to use a different port:

```bash
PORT=8080 python3 -m backend.app
```

#### Tests

From the project root (requires the project virtual environment at `venv/` with dependencies installed):

```bash
python3 -m unittest discover -s backend/tests -v
```

#### Database

On first start, a SQLite database is created at `backend/learn_mandarin.db` with three tables:

| Table | Columns |
| --- | --- |
| `character` | `char` (PK), `pinyin` (max 6 chars), `writting_known` (boolean), `updated_at` (datetime) |
| `words` | `word` (PK, max 10 chars), `definition` (max 100 chars, nullable), `updated_at` (datetime) |
| `character_word` | many-to-many link between `character` and `words` |

Override the database file path with the `DATABASE_PATH` environment variable if needed.

You can use the /character/bulk endpoint to preload the database

Ex:
```
curl -X POST -F "file=@db.txt" http://127.0.0.1:5000/characters/bulk
```

#### API endpoints

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/health` | Health check |
| `GET` | `/characters` | List all characters |
| `POST` | `/characters` | Create a new character |
| `POST` | `/words` | Create a new word and link it to existing characters |
| `PATCH` | `/characters/<char>` | Update a character's `pinyin` and `writting_known` |
| `DELETE` | `/characters/<char>` | Delete a character and its `character_word` links |
| `POST` | `/characters/bulk` | Upload a `.txt` file (`multipart/form-data`, field name `file`) |

### Frontend

From the project root:

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`. Vite proxies API requests to the backend during development.

**Tests**

From the `frontend/` directory:

```bash
npm test
npm run test:coverage
```

The coverage report is written to `frontend/coverage/` (open `coverage/index.html` in a browser for the HTML report). On GitHub, badges in this README are updated automatically on each push to `main`, and the full HTML report is published at [mazarsju.github.io/learn-mandarin](https://mazarsju.github.io/learn-mandarin/).

To enable the hosted report, go to **Settings → Pages** and set **Build and deployment → Source** to **Deploy from a branch**, then choose branch **`gh-pages`** and folder **`/ (root)`**. The workflow creates and updates that branch automatically.

## Roadmap

### 1. Character overview ordered by pinyin

An overall view of the characters you know, sorted by pinyin.

- [x] Simple frontend connected with backend
- [x] Database structure for characters, and loading the DB with characters you already know
- [x] Create different tabs in the frontend: Landing page, Knowledge base, Chat, Preferences
- [x] Simple CRUD interface to manage characters
- [ ] Visualization of characters by pinyin
- [ ] UI polish with additional options: different color for the tones, a toggle to show or hide characters you only recognize (not write), mouse hover effect...

### 2. Chinese-only chatbot (known characters)

A chatbot that speaks Chinese using only the characters you are supposed to know.

- [ ] Integration with an LLM
- [ ] Chatbot interface that remembers previous conversations
- [ ] RAG pipeline to update the chat agent's knowledge with the list of vocabulary

### 3. Multi-agent conversations for specific topics

Several agents collaborating around focused learning scenarios.

- [ ] "Teacher" chatbot agent that corrects your sentences and explains mistakes
- [ ] Conversation scenarios with a defined goal to achieve
