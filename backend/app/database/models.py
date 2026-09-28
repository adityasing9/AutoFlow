from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, Index
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(100), unique=True, nullable=False, default="default_user")
    role = Column(String(50), default="owner")
    created_at = Column(DateTime, default=datetime.utcnow)

class Event(Base):
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    event_type = Column(String(50), nullable=False, index=True) # FILE_CREATED, FILE_OPENED, FILE_RENAMED, FILE_MOVED, FILE_COPIED, FILE_DELETED, FOLDER_CREATED
    file_type = Column(String(50), default="UNKNOWN")           # PDF, DOCX, TXT, IMAGE, DIRECTORY
    category = Column(String(50), default="DOCUMENT")           # DOCUMENT, CODE, MEDIA, ARCHIVE
    normalized_path = Column(String(500), nullable=False)       # Privacy-filtered abstracted path e.g. <WORKSPACE>/Inbox/file.pdf
    raw_hash = Column(String(64), nullable=True)                # SHA256 of original path to correlate transitions without storing sensitive raw path
    metadata_json = Column(Text, nullable=True)                 # JSON string for extra safe attributes (e.g. extension, size_category)
    is_privacy_filtered = Column(Boolean, default=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

class Pattern(Base):
    __tablename__ = "patterns"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    pattern_code = Column(String(50), unique=True, nullable=False, index=True) # e.g. P-001
    name = Column(String(255), nullable=True)
    sequence_json = Column(Text, nullable=False)                 # List of event types in sequence
    occurrences = Column(Integer, default=1)
    avg_interval_seconds = Column(Float, default=0.0)
    confidence = Column(Float, default=0.0)                      # 0.0 to 1.0
    risk_level = Column(String(20), default="LOW")              # LOW, MEDIUM, HIGH
    status = Column(String(50), default="DETECTED")             # DETECTED, ANALYZED, PROPOSED, IGNORED
    detected_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    events = relationship("PatternEvent", back_populates="pattern", cascade="all, delete-orphan")
    workflows = relationship("Workflow", back_populates="pattern")

class PatternEvent(Base):
    __tablename__ = "pattern_events"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    pattern_id = Column(Integer, ForeignKey("patterns.id"), nullable=False)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=True)
    step_order = Column(Integer, nullable=False)
    
    pattern = relationship("Pattern", back_populates="events")

class Workflow(Base):
    __tablename__ = "workflows"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    pattern_id = Column(Integer, ForeignKey("patterns.id"), nullable=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    trigger_type = Column(String(100), nullable=False)          # e.g. NEW_PDF_INBOX
    conditions_json = Column(Text, nullable=True)               # e.g. {"folder": "Inbox", "file_type": "PDF"}
    actions_json = Column(Text, nullable=False)                 # Array of proposed structured actions
    verification_json = Column(Text, nullable=True)             # Expected verification rules
    risk_level = Column(String(20), default="LOW")              # LOW, MEDIUM, HIGH, VERY_HIGH
    confidence = Column(Float, default=0.0)
    status = Column(String(50), default="PROPOSED")             # PROPOSED, APPROVED, REJECTED, IGNORED, PAUSED
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    pattern = relationship("Pattern", back_populates="workflows")
    steps = relationship("WorkflowStep", back_populates="workflow", cascade="all, delete-orphan")
    executions = relationship("Execution", back_populates="workflow")

class WorkflowStep(Base):
    __tablename__ = "workflow_steps"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    workflow_id = Column(Integer, ForeignKey("workflows.id"), nullable=False)
    step_order = Column(Integer, nullable=False)
    tool_name = Column(String(100), nullable=False)             # FileReader, FileRenamer, FolderCreator, FileMover
    tool_params_json = Column(Text, nullable=False)
    risk_level = Column(String(20), default="LOW")
    
    workflow = relationship("Workflow", back_populates="steps")

class Permission(Base):
    __tablename__ = "permissions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    action_type = Column(String(50), nullable=False, unique=True) # READ_FILE, CREATE_FOLDER, RENAME_FILE, MOVE_FILE, COPY_FILE, DELETE_FILE, EXECUTE_COMMAND, NETWORK_ACCESS
    risk_level = Column(String(20), default="LOW")
    is_allowed = Column(Boolean, default=True)
    requires_approval = Column(Boolean, default=True)
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Execution(Base):
    __tablename__ = "executions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    workflow_id = Column(Integer, ForeignKey("workflows.id"), nullable=False)
    trigger_event_id = Column(Integer, ForeignKey("events.id"), nullable=True)
    status = Column(String(50), default="PENDING")              # PENDING, RUNNING, SUCCESS, FAILED, SIMULATED
    is_simulation = Column(Boolean, default=False)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    workflow = relationship("Workflow", back_populates="executions")
    steps = relationship("ExecutionStep", back_populates="execution", cascade="all, delete-orphan")
    verifications = relationship("VerificationResult", back_populates="execution", cascade="all, delete-orphan")

class ExecutionStep(Base):
    __tablename__ = "execution_steps"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    execution_id = Column(Integer, ForeignKey("executions.id"), nullable=False)
    step_order = Column(Integer, nullable=False)
    tool_name = Column(String(100), nullable=False)
    input_data_json = Column(Text, nullable=True)
    output_data_json = Column(Text, nullable=True)
    status = Column(String(50), default="PENDING")              # SUCCESS, FAILED, SKIPPED
    error_message = Column(Text, nullable=True)
    executed_at = Column(DateTime, default=datetime.utcnow)
    
    execution = relationship("Execution", back_populates="steps")

class VerificationResult(Base):
    __tablename__ = "verification_results"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    execution_id = Column(Integer, ForeignKey("executions.id"), nullable=False)
    step_id = Column(Integer, ForeignKey("execution_steps.id"), nullable=True)
    status = Column(String(50), nullable=False)                 # SUCCESS, FAILED
    verification_type = Column(String(100), nullable=False)     # FILE_EXISTS, SOURCE_REMOVED, HASH_MATCH
    details_json = Column(Text, nullable=True)
    verified_at = Column(DateTime, default=datetime.utcnow)
    
    execution = relationship("Execution", back_populates="verifications")

class Memory(Base):
    __tablename__ = "memory"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    memory_key = Column(String(100), nullable=False, index=True)
    memory_type = Column(String(50), default="WORKFLOW_OUTCOME") # WORKFLOW_OUTCOME, PATTERN_CONTEXT, USER_FEEDBACK
    memory_value_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
