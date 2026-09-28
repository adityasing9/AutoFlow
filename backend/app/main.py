from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings
from app.database.connection import init_db
from app.services.event_service.monitor import activity_monitor
from app.api.routes_activity import router as activity_router
from app.api.routes_patterns import router as patterns_router
from app.api.routes_suggestions import router as suggestions_router
from app.api.routes_workflows import router as workflows_router
from app.api.routes_execution import router as execution_router
from app.api.routes_permissions import router as permissions_router
from app.api.routes_privacy import router as privacy_router
from app.api.routes_stats import router as stats_router
from app.api.routes_demo import router as demo_router
from app.utils.logger import get_logger

logger = get_logger("main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup sequence
    logger.info("Initializing AutoFlow Core System...")
    init_db()
    logger.info(f"AutoFlow initialized. Offline mode: {settings.OFFLINE_MODE}. Workspace: {settings.WORKSPACE_DIR}")
    yield
    # Shutdown sequence
    if activity_monitor.get_status():
        logger.info("Stopping filesystem monitor on shutdown...")
        activity_monitor.stop()
    logger.info("AutoFlow Core System safely stopped.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Privacy-Preserving Local-First AI Workflow Discovery & Automation System",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(activity_router, prefix=settings.API_V1_STR)
app.include_router(patterns_router, prefix=settings.API_V1_STR)
app.include_router(suggestions_router, prefix=settings.API_V1_STR)
app.include_router(workflows_router, prefix=settings.API_V1_STR)
app.include_router(execution_router, prefix=settings.API_V1_STR)
app.include_router(permissions_router, prefix=settings.API_V1_STR)
app.include_router(privacy_router, prefix=settings.API_V1_STR)
app.include_router(stats_router, prefix=settings.API_V1_STR)
app.include_router(demo_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "status": "ONLINE",
        "mode": "LOCAL_FIRST",
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "HEALTHY"}
