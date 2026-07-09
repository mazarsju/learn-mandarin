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
