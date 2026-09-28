from enum import Enum
from typing import Dict, Any

class ActionRiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    VERY_HIGH = "VERY_HIGH"

class ExecutionPolicy(str, Enum):
    AUTO_ALLOWED = "AUTO_ALLOWED"
    REQUIRES_APPROVAL = "REQUIRES_APPROVAL"
    BLOCKED = "BLOCKED"

BASE_ACTION_RISK: Dict[str, ActionRiskLevel] = {
    "READ_FILE": ActionRiskLevel.LOW,
    "CREATE_FOLDER": ActionRiskLevel.LOW,
    "CREATE_FILE": ActionRiskLevel.LOW,
    "RENAME_FILE": ActionRiskLevel.LOW,
    "MOVE_FILE": ActionRiskLevel.MEDIUM,
    "COPY_FILE": ActionRiskLevel.MEDIUM,
    "DELETE_FILE": ActionRiskLevel.HIGH,
    "EXECUTE_COMMAND": ActionRiskLevel.HIGH,
    "NETWORK_ACCESS": ActionRiskLevel.VERY_HIGH,
}

class RiskEngine:
    @staticmethod
    def get_action_risk(action_type: str) -> ActionRiskLevel:
        return BASE_ACTION_RISK.get(action_type, ActionRiskLevel.HIGH)

    @classmethod
    def evaluate_policy(
        cls,
        action_type: str,
        confidence: float,
        is_allowed_in_db: bool,
        requires_approval_in_db: bool
    ) -> Dict[str, Any]:
        """
        Combines Action Risk + AI Confidence + User Permission Setting to determine:
        AUTO_ALLOWED | REQUIRES_APPROVAL | BLOCKED
        """
        risk = cls.get_action_risk(action_type)
        
        # Security overrides: Shell commands & network access are BLOCKED by default
        if action_type in ("EXECUTE_COMMAND", "NETWORK_ACCESS") and not is_allowed_in_db:
            return {
                "policy": ExecutionPolicy.BLOCKED,
                "reason": f"Action '{action_type}' is strictly blocked under academic security baseline.",
                "risk_level": risk.value
            }
            
        if not is_allowed_in_db:
            return {
                "policy": ExecutionPolicy.BLOCKED,
                "reason": f"Action '{action_type}' has been disabled by user permission settings.",
                "risk_level": risk.value
            }

        # Deleting files always requires explicit approval
        if action_type == "DELETE_FILE":
            return {
                "policy": ExecutionPolicy.REQUIRES_APPROVAL,
                "reason": "Destructive operations (DELETE_FILE) always mandate explicit user confirmation.",
                "risk_level": risk.value
            }

        # If user explicitly configured approval requirement
        if requires_approval_in_db:
            return {
                "policy": ExecutionPolicy.REQUIRES_APPROVAL,
                "reason": f"Permission configuration specifies manual approval for {action_type}.",
                "risk_level": risk.value
            }

        # Low risk actions with high AI confidence (> 0.85) can be auto-allowed if user unflagged approval
        if risk == ActionRiskLevel.LOW and confidence >= 0.85:
            return {
                "policy": ExecutionPolicy.AUTO_ALLOWED,
                "reason": f"Action is low risk with high AI confidence ({confidence:.0%}).",
                "risk_level": risk.value
            }

        return {
            "policy": ExecutionPolicy.REQUIRES_APPROVAL,
            "reason": f"Medium or non-exempt risk requires user confirmation.",
            "risk_level": risk.value
        }
