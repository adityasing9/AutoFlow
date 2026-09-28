from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import Event, Pattern, Workflow, Execution
from app.models.schemas import SystemStatusResponse
from app.services.event_service.monitor import activity_monitor
from app.services.ai_service.intent_engine import LocalLLMFactory
from app.config.settings import settings

router = APIRouter(prefix="/stats", tags=["Statistics"])

@router.get("/dashboard", response_model=SystemStatusResponse)
def get_dashboard_stats(db: Session = Depends(get_db)):
    start_of_day = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    events_today = db.query(Event).filter(Event.timestamp >= start_of_day).count()
    patterns_detected = db.query(Pattern).count()
    suggestions_count = db.query(Pattern).filter(Pattern.status.in_(["DETECTED", "PROPOSED"])).count()
    approved_workflows = db.query(Workflow).filter_by(status="APPROVED").count()
    
    successful_executions = db.query(Execution).filter_by(status="SUCCESS").count()
    failed_executions = db.query(Execution).filter_by(status="FAILED").count()
    
    provider = LocalLLMFactory.get_provider()
    model_info = provider.model_info()

    return SystemStatusResponse(
        monitoring_active=activity_monitor.get_status(),
        offline_mode=settings.OFFLINE_MODE,
        events_today=events_today,
        patterns_detected=patterns_detected,
        suggestions_count=suggestions_count,
        approved_workflows=approved_workflows,
        successful_executions=successful_executions,
        failed_executions=failed_executions,
        local_ai_status=model_info.get("status", "ACTIVE"),
        local_ai_model=f"{model_info.get('provider')} ({model_info.get('model')})"
    )
