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
    
    # In Vercel serverless environment, auto-seed the demo scenario on initial cold-start
    if os.getenv("VERCEL"):
        from app.database.connection import SessionLocal
        from app.database.models import Pattern
        from app.api.routes_demo import run_academic_demo_scenario
        db = SessionLocal()
        try:
            if db.query(Pattern).count() == 0:
                run_academic_demo_scenario(db)
        except Exception as e:
            logger.warning(f"Initial demo seeding skipped on Vercel: {e}")
        finally:
            db.close()

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

# Enable CORS for local Vite frontend and Vercel deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers (support both /api prefix and root for serverless flexibility)
routers = [
    activity_router,
    patterns_router,
    suggestions_router,
    workflows_router,
    execution_router,
    permissions_router,
    privacy_router,
    stats_router,
    demo_router,
]

for r in routers:
    app.include_router(r, prefix="/api")
    app.include_router(r)

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
