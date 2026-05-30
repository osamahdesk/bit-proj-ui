# Beijing Institute of Technology — Architectural Evolution

React frontend + FastAPI backend project for an immersive landing page.

## Repository structure

- `backend/` - FastAPI backend service
- `frontend/` - React app built with Create React App, CRACO and Tailwind CSS
- `tests/` - backend tests
- `HOW_TO_RUN.md` - quick run instructions

## Prerequisites

- Node.js 18+ and Yarn 1.x
- Python 3.11+ (or compatible Python 3)
- MongoDB instance or MongoDB Atlas connection string

## Setup

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# edit .env before running
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend

```bash
cd frontend
yarn install
cp .env.example .env
# edit .env if needed
yarn start
```

## Build for production

```bash
cd frontend
yarn build
```

## Environment variables

- `backend/.env.example` contains the backend variables required by `server.py`
- `frontend/.env.example` contains the frontend backend URL

## Notes

- Ignore `node_modules/`, `.env`, and build artifacts using `.gitignore`
- The original archive file has been decompressed and organized into repository folders
