
# Beijing Institute of Technology — Architectural Evolution
<img width="1242" height="688" alt="‏لقطة الشاشة ٢٠٢٦-٠٥-٣١ في ١ ٥٩ ٣٢ ص" src="https://github.com/user-attachments/assets/e0e4925d-5325-49f9-a62f-7fcde1e46168" /><img width="1242" height="695" alt="‏لقطة الشاشة ٢٠٢٦-٠٥-٣١ في ٢ ٠٠ ٤٠ ص" src="https://github.com/user-attachments/assets/06b2baf8-e61e-49b1-9958-f6907cc3513b" />

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
