import pytest
import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.models import Base, Permission, Workflow, Execution
from app.services.permission_service.sandbox import SandboxValidator
from app.tools.file_tools import FolderCreator, FileRenamer, FileMover
from app.tools.registry import tool_registry

@pytest.fixture
def workspace_tmp(tmp_path, monkeypatch):
    monkeypatch.setattr("app.config.settings.settings.WORKSPACE_DIR", str(tmp_path))
    inbox = tmp_path / "Inbox"
    inbox.mkdir(parents=True)
    college = tmp_path / "College" / "DBMS"
    college.mkdir(parents=True)
    
    # Create sample file
    sample = inbox / "sample.pdf"
    sample.write_text("dummy pdf binary content")
    return tmp_path

def test_successful_folder_creation(workspace_tmp):
    tool = tool_registry.get_tool("FolderCreator")
    res = tool.execute({"folder_path": "<WORKSPACE>/College/AI"})
    assert res["created"] is True
    assert (workspace_tmp / "College" / "AI").exists()

def test_successful_file_rename(workspace_tmp):
    tool = tool_registry.get_tool("FileRenamer")
    res = tool.execute({"source_path": "<WORKSPACE>/Inbox/sample.pdf", "new_name": "renamed_sample.pdf"})
    assert res["renamed"] is True
    assert (workspace_tmp / "Inbox" / "renamed_sample.pdf").exists()
    assert not (workspace_tmp / "Inbox" / "sample.pdf").exists()

def test_missing_file_handling(workspace_tmp):
    tool = tool_registry.get_tool("FileMover")
    with pytest.raises(FileNotFoundError):
        tool.execute({
            "source_path": "<WORKSPACE>/Inbox/non_existent.pdf",
            "dest_folder": "<WORKSPACE>/College/DBMS"
        })
