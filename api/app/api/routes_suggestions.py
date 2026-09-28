import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database.connection import get_db
from app.database.models import Pattern, Workflow
from app.services.ai_service.intent_engine import AIIntentEngine
from app.services.workflow_service.generator import WorkflowGenerator
from app.models.schemas import AIIntentAnalysis, WorkflowResponse

router = APIRouter(prefix="/suggestions", tags=["Suggestions"])

@router.get("")
def list_suggestions(db: Session = Depends(get_db)):
    """Lists candidate patterns that have been interpreted or proposed as automations."""
    patterns = db.query(Pattern).filter(Pattern.status.in_(["DETECTED", "PROPOSED"])).all()
    suggestions = []
    
    for p in patterns:
        seq = json.loads(p.sequence_json)
        # Check if already has generated workflow
        wf = db.query(Workflow).filter_by(pattern_id=p.id).first()
        
        # Calculate weekly and automated estimates based on occurrences
        est_manual = p.occurrences * 5
        est_automated = len(seq)
        
        suggestions.append({
            "pattern_id": p.id,
            "pattern_code": p.pattern_code,
            "workflow_name": wf.name if wf else (p.name or "Discovered Workflow"),
            "description": wf.description if wf else f"Repetitive user sequence of {len(seq)} actions detected {p.occurrences} times.",
            "sequence": seq,
            "occurrences": p.occurrences,
            "confidence": wf.confidence if wf else p.confidence,
            "risk_level": p.risk_level,
            "estimated_manual_actions_per_week": est_manual,
            "estimated_automated_actions_per_workflow": est_automated,
            "workflow_id": wf.id if wf else None,
            "status": wf.status if wf else p.status
        })
    return suggestions

@router.post("/generate/{pattern_id}", response_model=WorkflowResponse)
def generate_suggestion(pattern_id: int, db: Session = Depends(get_db)):
    pattern = db.query(Pattern).filter_by(id=pattern_id).first()
    if not pattern:
        raise HTTPException(status_code=404, detail="Pattern not found")

    existing_wf = db.query(Workflow).filter_by(pattern_id=pattern.id).first()
    if existing_wf:
        return WorkflowResponse(
            id=existing_wf.id,
            pattern_id=existing_wf.pattern_id,
            name=existing_wf.name,
            description=existing_wf.description,
            trigger_type=existing_wf.trigger_type,
            conditions=json.loads(existing_wf.conditions_json or "{}"),
            actions=json.loads(existing_wf.actions_json),
            verification=json.loads(existing_wf.verification_json or "{}"),
            risk_level=existing_wf.risk_level,
            confidence=existing_wf.confidence,
            status=existing_wf.status,
            created_at=existing_wf.created_at,
            updated_at=existing_wf.updated_at
        )

    generator = WorkflowGenerator()
    wf = generator.generate_workflow_from_pattern(pattern, db)
    
    return WorkflowResponse(
        id=wf.id,
        pattern_id=wf.pattern_id,
        name=wf.name,
        description=wf.description,
        trigger_type=wf.trigger_type,
        conditions=json.loads(wf.conditions_json or "{}"),
        actions=json.loads(wf.actions_json),
        verification=json.loads(wf.verification_json or "{}"),
        risk_level=wf.risk_level,
        confidence=wf.confidence,
        status=wf.status,
        created_at=wf.created_at,
        updated_at=wf.updated_at
    )
