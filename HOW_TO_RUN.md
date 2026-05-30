# Beijing Institute of Technology — Architectural Evolution

Scroll-driven, video-scrubbing immersive landing page (React + FastAPI + MongoDB).

## Frontend
```bash
cd frontend
yarn install
yarn start
```

## Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001
```

Create a `backend/.env` with `MONGO_URL`, `DB_NAME`, `CORS_ORIGINS` and a `frontend/.env` with `REACT_APP_BACKEND_URL`.
