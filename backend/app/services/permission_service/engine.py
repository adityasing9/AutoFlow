from typing import Dict, Any
from sqlalchemy.orm import Session
from app.database.models import Permission
from app.services.permission_service.risk import RiskEngine, ExecutionPolicy
from app.services.permission_service.sandbox import SandboxValidator, SandboxViolationError
from app.tools.registry import tool_registry
from app.utils.logger import get_logger

logger = get_logger("permission_engine")

class PermissionEngine:
    """
    Centralized Permission and Validation Manager.
    
    Security Guarantee:
    - The LLM can never directly execute arbitrary code or bypass this layer.
    - All actions must be registered in the controlled tool system.
    - All filesystem paths must resolve inside the sandbox.
    - Permissions stored in DB are respected.
    """
    
    @classmethod
    def validate_action(
        cls,
        tool_name: str,
        params: Dict[str, Any],
        confidence: float,
        db: Session
    ) -> Dict[str, Any]:
        tool = tool_registry.get_tool(tool_name)
        if not tool:
            return {
                "allowed": False,
                "policy": ExecutionPolicy.BLOCKED.value,
                "reason": f"Tool '{tool_name}' is not recognized in the controlled tool registry."
            }

        # 1. Parameter schema validation
        try:
            tool.validate_inputs(params)
        except Exception as e:
            return {
                "allowed": False,
                "policy": ExecutionPolicy.BLOCKED.value,
                "reason": f"Parameter validation failed for {tool_name}: {str(e)}"
            }

        # 2. Path Sandboxing Check
        for key in ["path", "source_path", "dest_folder", "folder", "folder_path"]:
            val = params.get(key)
            if val and isinstance(val, str):
                try:
                    SandboxValidator.resolve_safe_path(val)
                except SandboxViolationError as sve:
                    logger.warning(f"Path traversal blocked: {sve}")
                    return {
                        "allowed": False,
                        "policy": ExecutionPolicy.BLOCKED.value,
                        "reason": f"Sandbox violation: {str(sve)}"
                    }

        # 3. Lookup Permission in DB
        action_type = tool.permission_requirement
        perm = db.query(Permission).filter_by(action_type=action_type).first()
        is_allowed = perm.is_allowed if perm else True
        requires_approval = perm.requires_approval if perm else True

        # 4. Evaluate with Risk Engine
        policy_eval = RiskEngine.evaluate_policy(
            action_type=action_type,
            confidence=confidence,
            is_allowed_in_db=is_allowed,
            requires_approval_in_db=requires_approval
        )

        allowed = (policy_eval["policy"] != ExecutionPolicy.BLOCKED)
        return {
            "allowed": allowed,
            "policy": policy_eval["policy"].value,
            "risk_level": policy_eval["risk_level"],
            "reason": policy_eval["reason"]
        }
