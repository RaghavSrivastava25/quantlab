# QuantLab — LeetCode for Quant Finance

## Folder Structure

```
quantlab/
├── frontend/          # Next.js 14 app
├── backend/           # FastAPI Python backend
├── sandbox/           # Docker-based code execution
├── data/              # Seed data, datasets, loaders
└── infra/             # Docker Compose, env templates
```

## Prerequisites (all free, VS Code only)

- VS Code + extensions: Python, ESLint, Prettier, Docker
- Node.js 20+
- Python 3.11+
- Docker Desktop
- PostgreSQL 15 (via Docker)

## Run Order

### Step 1 — Infrastructure (Postgres + Redis)
```bash
cd infra
docker compose up -d
```

### Step 2 — Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env           # fill in values
alembic upgrade head
python -m uvicorn api.main:app --reload --port 8000
```

### Step 3 — Seed Data
```bash
cd backend
python -m data.seeds.seed_problems
python -m data.seeds.seed_datasets
```

### Step 4 — Frontend
```bash
cd frontend
npm install
cp ../.env.example .env.local     # fill in NEXT_PUBLIC_ values
npm run dev
```

### Step 5 — Sandbox Runner (separate terminal)
```bash
cd sandbox
docker build -t quantlab-sandbox .
python runner/server.py
```

## Environment Variables

See `.env.example` in project root.

## API Docs

With backend running: http://localhost:8000/docs
