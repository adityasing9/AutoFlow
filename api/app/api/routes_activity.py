from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database.connection import get_db
from app.database.models import Event
from app.models.schemas import EventResponse, EventCreate
from app.services.event_service.monitor import activity_monitor
from app.services.event_service.normalizer import EventNormalizer

router = APIRouter(prefix="/activity", tags=["Activity"])

@router.get("/events", response_model=List[EventResponse])
def get_events(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    event_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Event)
    if event_type:
        query = query.filter(Event.event_type == event_type)
    events = query.order_by(Event.timestamp.desc()).offset(offset).limit(limit).all()
    return events

@router.get("/monitor/status")
def get_monitor_status():
    return {
        "active": activity_monitor.get_status(),
        "type": "LOCAL_FILESYSTEM",
        "privacy": "FILTERED"
    }

@router.post("/monitor/start")
def start_monitoring():
    started = activity_monitor.start()
    return {"success": started, "status": "ACTIVE", "message": "Activity monitoring is now ACTIVE."}

@router.post("/monitor/stop")
def stop_monitoring():
    stopped = activity_monitor.stop()
    return {"success": stopped, "status": "INACTIVE", "message": "Activity monitoring is now STOPPED."}

@router.post("/events/simulate", response_model=EventResponse)
def record_simulated_event(event_in: EventCreate, db: Session = Depends(get_db)):
    """Allows simulating an event through the privacy normalizer for testing."""
    norm = EventNormalizer.normalize_event(
        event_type=event_in.event_type,
        raw_path=event_in.raw_path or event_in.normalized_path,
        extra_meta=event_in.metadata
    )
    db_event = Event(
        event_type=norm["event_type"],
        file_type=norm["file_type"],
        category=norm["category"],
        normalized_path=norm["normalized_path"],
        raw_hash=norm["raw_hash"],
        metadata_json=norm["metadata_json"],
        is_privacy_filtered=True
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event
