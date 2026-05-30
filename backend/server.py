from fastapi import FastAPI, APIRouter
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import io
import zipfile
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Project root (the /app directory that contains frontend & backend)
PROJECT_ROOT = ROOT_DIR.parent

# Directories / files we never want to bundle into the downloadable project
EXCLUDE_DIRS = {
    "node_modules", ".git", "build", "dist", "__pycache__",
    ".cache", ".pytest_cache", ".mypy_cache", ".yarn", "test_reports",
    ".emergent", "memory",
}
EXCLUDE_FILES = {".env", ".DS_Store"}
EXCLUDE_EXT = {".pyc", ".log", ".lock"}


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


@api_router.get("/")
async def root():
    return {"message": "Hello World"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    _ = await db.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks


def _should_skip(path: Path) -> bool:
    parts = set(path.parts)
    if parts & EXCLUDE_DIRS:
        return True
    if path.name in EXCLUDE_FILES:
        return True
    if path.suffix in EXCLUDE_EXT:
        return True
    return False


def _build_project_zip() -> io.BytesIO:
    """Walk the project root and bundle source files into an in-memory zip."""
    buffer = io.BytesIO()
    targets = ["frontend", "backend", "tests", "scripts", "README.md"]
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        for target in targets:
            src = PROJECT_ROOT / target
            if not src.exists():
                continue
            if src.is_file():
                zf.write(src, arcname=f"beijing-architectural-evolution/{target}")
                continue
            for file_path in src.rglob("*"):
                if file_path.is_dir():
                    continue
                if _should_skip(file_path):
                    continue
                rel = file_path.relative_to(PROJECT_ROOT)
                zf.write(file_path, arcname=f"beijing-architectural-evolution/{rel}")
        # A short readme describing how to run the bundled project
        zf.writestr(
            "beijing-architectural-evolution/HOW_TO_RUN.md",
            (
                "# Beijing Institute of Technology — Architectural Evolution\n\n"
                "Scroll-driven, video-scrubbing immersive landing page "
                "(React + FastAPI + MongoDB).\n\n"
                "## Frontend\n"
                "```bash\ncd frontend\nyarn install\nyarn start\n```\n\n"
                "## Backend\n"
                "```bash\ncd backend\npip install -r requirements.txt\n"
                "uvicorn server:app --host 0.0.0.0 --port 8001\n```\n\n"
                "Create a `backend/.env` with `MONGO_URL`, `DB_NAME`, `CORS_ORIGINS` "
                "and a `frontend/.env` with `REACT_APP_BACKEND_URL`.\n"
            ),
        )
    buffer.seek(0)
    return buffer


@api_router.get("/download-project")
async def download_project():
    buffer = _build_project_zip()
    filename = "beijing-architectural-evolution.zip"
    return StreamingResponse(
        buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
