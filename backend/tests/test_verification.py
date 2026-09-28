import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.models import Base, Execution, ExecutionStep, VerificationResult
from app.services.verification_service.verifier import VerificationEngine

@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

def test_successful_folder_verification(tmp_path, monkeypatch, db_session):
    monkeypatch.setattr("app.config.settings.settings.WORKSPACE_DIR", str(tmp_path))
    target_folder = tmp_path / "VerifiedFolder"
    target_folder.mkdir()
    
    verified, msg = VerificationEngine.verify_action(
        tool_name="FolderCreator",
        params={"folder_path": "<WORKSPACE>/VerifiedFolder"},
        execution_result={"folder_path": "<WORKSPACE>/VerifiedFolder", "created": True},
        execution_id=1,
        step_id=1,
        db=db_session
    )
    assert verified is True
    assert "verified on disk" in msg

def test_failed_move_verification(tmp_path, monkeypatch, db_session):
    monkeypatch.setattr("app.config.settings.settings.WORKSPACE_DIR", str(tmp_path))
    # Source file still exists and destination does not exist
    src = tmp_path / "still_here.pdf"
    src.write_text("dummy")
    
    verified, msg = VerificationEngine.verify_action(
        tool_name="FileMover",
        params={"source_path": "<WORKSPACE>/still_here.pdf", "dest_folder": "<WORKSPACE>/Target"},
        execution_result={"final_dest_file": str(tmp_path / "Target" / "still_here.pdf")},
        execution_id=1,
        step_id=2,
        db=db_session
    )
    assert verified is False
    assert "Move verification failed" in msg
