import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.models import Base, Permission
from app.services.permission_service.engine import PermissionEngine
from app.services.permission_service.risk import RiskEngine, ExecutionPolicy

@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    # Seed default permissions
    session.add(Permission(action_type="READ_FILE", risk_level="LOW", is_allowed=True, requires_approval=False))
    session.add(Permission(action_type="CREATE_FOLDER", risk_level="LOW", is_allowed=True, requires_approval=False))
    session.add(Permission(action_type="MOVE_FILE", risk_level="MEDIUM", is_allowed=True, requires_approval=True))
    session.add(Permission(action_type="DELETE_FILE", risk_level="HIGH", is_allowed=True, requires_approval=True))
    session.add(Permission(action_type="EXECUTE_COMMAND", risk_level="HIGH", is_allowed=False, requires_approval=True))
    session.commit()
    
    yield session
    session.close()

def test_allowed_low_risk_action(db_session):
    eval_res = PermissionEngine.validate_action(
        tool_name="FolderCreator",
        params={"folder_path": "<WORKSPACE>/College/DBMS"},
        confidence=0.95,
        db=db_session
    )
    assert eval_res["allowed"] is True
    assert eval_res["policy"] == ExecutionPolicy.AUTO_ALLOWED.value

def test_action_requiring_approval(db_session):
    eval_res = PermissionEngine.validate_action(
        tool_name="FileMover",
        params={"source_path": "<WORKSPACE>/Inbox/test.pdf", "dest_folder": "<WORKSPACE>/College/DBMS"},
        confidence=0.90,
        db=db_session
    )
    assert eval_res["allowed"] is True
    assert eval_res["policy"] == ExecutionPolicy.REQUIRES_APPROVAL.value

def test_blocked_high_risk_shell_command():
    policy = RiskEngine.evaluate_policy(
        action_type="EXECUTE_COMMAND",
        confidence=0.99,
        is_allowed_in_db=False,
        requires_approval_in_db=True
    )
    assert policy["policy"] == ExecutionPolicy.BLOCKED

def test_path_traversal_rejection(db_session):
    eval_res = PermissionEngine.validate_action(
        tool_name="FileReader",
        params={"path": "../../Windows/System32/cmd.exe"},
        confidence=0.95,
        db=db_session
    )
    assert eval_res["allowed"] is False
    assert "Sandbox violation" in eval_res["reason"]
