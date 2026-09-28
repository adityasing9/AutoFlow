from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.database.models import Permission
from app.models.schemas import PermissionResponse, PermissionUpdate

router = APIRouter(prefix="/permissions", tags=["Permissions"])

@router.get("", response_model=List[PermissionResponse])
def get_permissions(db: Session = Depends(get_db)):
    return db.query(Permission).order_by(Permission.id.asc()).all()

@router.put("/{permission_id}", response_model=PermissionResponse)
def update_permission(
    permission_id: int,
    perm_in: PermissionUpdate,
    db: Session = Depends(get_db)
):
    perm = db.query(Permission).filter_by(id=permission_id).first()
    if not perm:
        raise HTTPException(status_code=404, detail="Permission policy not found")

    # Guardrails: Shell commands & network access cannot be auto-allowed without strict security warning
    if perm.action_type in ("EXECUTE_COMMAND", "NETWORK_ACCESS") and perm_in.is_allowed:
        # Keep approval required
        perm.is_allowed = True
        perm.requires_approval = True
    else:
        if perm_in.is_allowed is not None:
            perm.is_allowed = perm_in.is_allowed
        if perm_in.requires_approval is not None:
            perm.requires_approval = perm_in.requires_approval

    db.commit()
    db.refresh(perm)
    return perm
