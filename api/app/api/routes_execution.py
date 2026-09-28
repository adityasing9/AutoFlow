import json
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from app.database.connection import get_db
from app.database.models import Workflow, Execution, ExecutionStep, VerificationResult
from app.models.schemas import ExecutionResponse, ExecutionStepResponse, VerificationResponse
from app.services.execution_service.executor import WorkflowExecutor

router = APIRouter(prefix="/execution", tags=["Execution"])

def _format_execution(exc: Execution) -> ExecutionResponse:
    step_models = []
    for s in exc.steps:
        step_models.append(ExecutionStepResponse(
            id=s.id,
            step_order=s.step_order,
            tool_name=s.tool_name,
            input_data=json.loads(s.input_data_json or "{}"),
            output_data=json.loads(s.output_data_json or "{}"),
            status=s.status,
            error_message=s.error_message,
            executed_at=s.executed_at
        ))
        
    ver_models = []
    for v in exc.verifications:
        ver_models.append(VerificationResponse(
            id=v.id,
            step_id=v.step_id,
            status=v.status,
            verification_type=v.verification_type,
            details={"message": v.details_json} if v.details_json else {},
            verified_at=v.verified_at
        ))

    return ExecutionResponse(
        id=exc.id,
        workflow_id=exc.workflow_id,
        status=exc.status,
        is_simulation=exc.is_simulation,
        error_message=exc.error_message,
        started_at=exc.started_at,
        completed_at=exc.completed_at,
        steps=step_models,
        verifications=ver_models
    )

@router.get("/history", response_model=List[ExecutionResponse])
def get_execution_history(limit: int = 50, db: Session = Depends(get_db)):
    execs = db.query(Execution).order_by(Execution.started_at.desc()).limit(limit).all()
    return [_format_execution(e) for e in execs]

@router.get("/{execution_id}", response_model=ExecutionResponse)
def get_execution_detail(execution_id: int, db: Session = Depends(get_db)):
    exc = db.query(Execution).filter_by(id=execution_id).first()
    if not exc:
        raise HTTPException(status_code=404, detail="Execution record not found")
    return _format_execution(exc)

@router.post("/run/{workflow_id}", response_model=ExecutionResponse)
def run_workflow(
    workflow_id: int,
    context: Optional[Dict[str, str]] = Body(None),
    db: Session = Depends(get_db)
):
    wf = db.query(Workflow).filter_by(id=workflow_id).first()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
        
    if wf.status != "APPROVED":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot execute workflow with status '{wf.status}'. User approval is required before execution."
        )

    execution = WorkflowExecutor.execute_workflow(workflow=wf, db=db, context_vars=context)
    return _format_execution(execution)
