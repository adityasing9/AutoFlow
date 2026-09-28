import json
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.connection import get_db
from app.database.models import Workflow
from app.models.schemas import WorkflowResponse, WorkflowSimulationResponse, WorkflowSimulationRequest
from app.services.workflow_service.simulator import WorkflowSimulator

router = APIRouter(prefix="/workflows", tags=["Workflows"])

def _format_workflow(wf: Workflow) -> WorkflowResponse:
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

@router.get("", response_model=List[WorkflowResponse])
def get_workflows(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Workflow)
    if status:
        query = query.filter(Workflow.status == status)
    records = query.order_by(Workflow.created_at.desc()).all()
    return [_format_workflow(w) for w in records]

@router.get("/{workflow_id}", response_model=WorkflowResponse)
def get_workflow_detail(workflow_id: int, db: Session = Depends(get_db)):
    wf = db.query(Workflow).filter_by(id=workflow_id).first()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return _format_workflow(wf)

@router.post("/{workflow_id}/approve", response_model=WorkflowResponse)
def approve_workflow(workflow_id: int, db: Session = Depends(get_db)):
    wf = db.query(Workflow).filter_by(id=workflow_id).first()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    wf.status = "APPROVED"
    db.commit()
    db.refresh(wf)
    return _format_workflow(wf)

@router.post("/{workflow_id}/reject", response_model=WorkflowResponse)
def reject_workflow(workflow_id: int, db: Session = Depends(get_db)):
    wf = db.query(Workflow).filter_by(id=workflow_id).first()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    wf.status = "REJECTED"
    db.commit()
    db.refresh(wf)
    return _format_workflow(wf)

@router.post("/{workflow_id}/ignore", response_model=WorkflowResponse)
def ignore_workflow(workflow_id: int, db: Session = Depends(get_db)):
    wf = db.query(Workflow).filter_by(id=workflow_id).first()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    wf.status = "IGNORED"
    db.commit()
    db.refresh(wf)
    return _format_workflow(wf)

@router.post("/{workflow_id}/simulate", response_model=WorkflowSimulationResponse)
def simulate_workflow(
    workflow_id: int,
    req: Optional[WorkflowSimulationRequest] = None,
    db: Session = Depends(get_db)
):
    wf = db.query(Workflow).filter_by(id=workflow_id).first()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
        
    sample_file = req.sample_target_file if req else None
    sim_data = WorkflowSimulator.simulate_workflow(wf, sample_file)
    return WorkflowSimulationResponse(**sim_data)
