# learn-mandarin

An app to learn Mandarin.

## Technologies

- **Backend:** Python, Flask, Flask-CORS
- **Frontend:** React, TypeScript, Vite

## Project structure

```
learn-mandarin/
├── backend/
│   ├── __init__.py
│   ├── app.py              # Flask application and routes
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

### Frontend

From the project root:

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`. Vite proxies `/hello` requests to the backend during development.

Open the frontend in your browser, click **Call backend**, and an alert should show `Hello from backend`.

## Roadmap

### 1. Character overview ordered by pinyin

An overall view of the characters you know, sorted by pinyin.

- [x] Simple frontend connected with backend
- [ ] Database structure for characters, and loading the DB with characters you already know
- [ ] Simple CRUD interface to manage characters
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
