from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

# --- Event Schemas ---
class EventBase(BaseModel):
    event_type: str
    file_type: str = "UNKNOWN"
    category: str = "DOCUMENT"
    normalized_path: str
    metadata: Optional[Dict[str, Any]] = None

class EventCreate(EventBase):
    raw_path: Optional[str] = None

class EventResponse(EventBase):
    id: int
    raw_hash: Optional[str] = None
    is_privacy_filtered: bool = True
    timestamp: datetime
    model_config = ConfigDict(from_attributes=True)

# --- Pattern Schemas ---
class PatternResponse(BaseModel):
    id: int
    pattern_code: str
    name: Optional[str] = None
    sequence: List[str]
    occurrences: int
    avg_interval_seconds: float
    confidence: float
    risk_level: str
    status: str
    detected_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- AI Intent Schemas ---
class AIIntentAnalysis(BaseModel):
    intent: str
    workflow_name: str
    description: str
    confidence: float = Field(ge=0.0, le=1.0)
    estimated_manual_actions_per_week: int = 0
    estimated_automated_actions_per_run: int = 0
    suggested_triggers: str = ""
    suggested_actions: List[Dict[str, Any]] = []

# --- Workflow Schemas ---
class WorkflowStepSchema(BaseModel):
    step_order: int
    tool_name: str
    tool_params: Dict[str, Any]
    risk_level: str = "LOW"

class WorkflowCreate(BaseModel):
    pattern_id: Optional[int] = None
    name: str
    description: Optional[str] = None
    trigger_type: str
    conditions: Dict[str, Any] = {}
    actions: List[Dict[str, Any]]
    verification: Optional[Dict[str, Any]] = None
    risk_level: str = "LOW"
    confidence: float = 0.85

class WorkflowResponse(BaseModel):
    id: int
    pattern_id: Optional[int] = None
    name: str
    description: Optional[str] = None
    trigger_type: str
    conditions: Dict[str, Any] = {}
    actions: List[Dict[str, Any]] = []
    verification: Optional[Dict[str, Any]] = None
    risk_level: str
    confidence: float
    status: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class WorkflowSimulationRequest(BaseModel):
    workflow_id: int
    sample_target_file: Optional[str] = None

class WorkflowSimulationResponse(BaseModel):
    workflow_id: int
    workflow_name: str
    files_detected: int
    potential_renames: int
    potential_moves: int
    potential_folders_created: int
    potential_deletions: int
    network_requests: int
    risk_level: str
    simulated_steps: List[Dict[str, Any]]
    can_proceed: bool

# --- Permission Schemas ---
class PermissionResponse(BaseModel):
    id: int
    action_type: str
    risk_level: str
    is_allowed: bool
    requires_approval: bool
    description: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class PermissionUpdate(BaseModel):
    is_allowed: Optional[bool] = None
    requires_approval: Optional[bool] = None

# --- Execution Schemas ---
class ExecutionStepResponse(BaseModel):
    id: int
    step_order: int
    tool_name: str
    input_data: Optional[Dict[str, Any]] = None
    output_data: Optional[Dict[str, Any]] = None
    status: str
    error_message: Optional[str] = None
    executed_at: datetime
    model_config = ConfigDict(from_attributes=True)

class VerificationResponse(BaseModel):
    id: int
    step_id: Optional[int] = None
    status: str
    verification_type: str
    details: Optional[Dict[str, Any]] = None
    verified_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ExecutionResponse(BaseModel):
    id: int
    workflow_id: int
    status: str
    is_simulation: bool
    error_message: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None
    steps: List[ExecutionStepResponse] = []
    verifications: List[VerificationResponse] = []
    model_config = ConfigDict(from_attributes=True)

# --- Dashboard & Privacy Schemas ---
class SystemStatusResponse(BaseModel):
    monitoring_active: bool
    offline_mode: bool
    events_today: int
    patterns_detected: int
    suggestions_count: int
    approved_workflows: int
    successful_executions: int
    failed_executions: int
    local_ai_status: str
    local_ai_model: str

class PrivacyStatusResponse(BaseModel):
    local_ai_enabled: bool
    internet_access_enabled: bool
    activity_monitoring_enabled: bool
    cloud_storage_enabled: bool
    external_api_calls: int
    file_events_enabled: bool
    app_events_enabled: bool
    screen_recording_enabled: bool
    keyboard_logging_enabled: bool
    microphone_enabled: bool
    camera_enabled: bool
    sanitized_events_ratio: float
