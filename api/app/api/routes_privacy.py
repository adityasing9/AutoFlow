from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import Event
from app.models.schemas import PrivacyStatusResponse
from app.services.event_service.monitor import activity_monitor
from app.services.event_service.retention import RetentionManager
from app.config.settings import settings

router = APIRouter(prefix="/privacy", tags=["Privacy"])

@router.get("/status", response_model=PrivacyStatusResponse)
def get_privacy_status(db: Session = Depends(get_db)):
    total_events = db.query(Event).count()
    filtered_events = db.query(Event).filter_by(is_privacy_filtered=True).count()
    ratio = (filtered_events / total_events) if total_events > 0 else 1.0

    return PrivacyStatusResponse(
        local_ai_enabled=True,
        internet_access_enabled=settings.ALLOW_INTERNET,
        activity_monitoring_enabled=activity_monitor.get_status(),
        cloud_storage_enabled=False,
        external_api_calls=0,
        file_events_enabled=settings.COLLECT_FILE_EVENTS,
        app_events_enabled=settings.COLLECT_APP_EVENTS,
        screen_recording_enabled=False,
        keyboard_logging_enabled=False,
        microphone_enabled=False,
        camera_enabled=False,
        sanitized_events_ratio=round(ratio, 4)
    )

@router.post("/cleanup")
def run_privacy_retention(db: Session = Depends(get_db)):
    RetentionManager.cleanup_old_events(db, detailed_days=7, max_days=settings.MAX_EVENT_RETENTION_DAYS)
    return {"status": "SUCCESS", "message": "Storage retention optimization completed successfully."}
