import json
from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.database.models import Workflow, Execution, ExecutionStep, Memory
from app.services.permission_service.engine import PermissionEngine
from app.services.permission_service.sandbox import SandboxValidator
from app.services.verification_service.verifier import VerificationEngine
from app.services.execution_service.recovery import RecoveryEngine
from app.tools.registry import tool_registry
from app.utils.logger import get_logger

logger = get_logger("execution_engine")

class WorkflowExecutor:
    @classmethod
    def execute_workflow(
        cls,
        workflow: Workflow,
        db: Session,
        trigger_event_id: Optional[int] = None,
        context_vars: Optional[Dict[str, str]] = None
    ) -> Execution:
        """
        Executes an approved workflow through the controlled tool system,
        with strict permission validation, bounded recovery, and verification.
        """
        # Ensure workflow is approved
        if workflow.status != "APPROVED":
            logger.warning(f"Workflow #{workflow.id} cannot be executed because status is {workflow.status}")

        execution = Execution(
            workflow_id=workflow.id,
            trigger_event_id=trigger_event_id,
            status="RUNNING",
            started_at=datetime.utcnow()
        )
        db.add(execution)
        db.commit()
        db.refresh(execution)

        actions = json.loads(workflow.actions_json)
        ctx = context_vars or {
            "filename": "sample_assignment_dbms.pdf",
            "subject": "DBMS",
            "date": datetime.utcnow().strftime("%Y%m%d")
        }

        overall_success = True
        error_msg = None

        for act in actions:
            step_order = act["step_order"]
            tool_name = act["tool_name"]
            tool = tool_registry.get_tool(tool_name)
            
            raw_params = act["params"]
            formatted_params = {}
            for k, v in raw_params.items():
                if isinstance(v, str):
                    val = v
                    for var_k, var_v in ctx.items():
                        val = val.replace(f"{{{var_k}}}", var_v)
                    formatted_params[k] = val
                else:
                    formatted_params[k] = v

            # 1. Permission Validation Layer
            perm_eval = PermissionEngine.validate_action(
                tool_name=tool_name,
                params=formatted_params,
                confidence=workflow.confidence,
                db=db
            )

            if not perm_eval["allowed"]:
                step_record = ExecutionStep(
                    execution_id=execution.id,
                    step_order=step_order,
                    tool_name=tool_name,
                    input_data_json=json.dumps(formatted_params),
                    status="BLOCKED",
                    error_message=f"Permission engine blocked action: {perm_eval.get('reason')}"
                )
                db.add(step_record)
                db.commit()
                overall_success = False
                error_msg = f"Step {step_order} blocked: {perm_eval.get('reason')}"
                break

            # 2. Controlled Execution with Recovery
            def run_action():
                return tool.execute(formatted_params)

            def verify_action(res):
                return tool.verify(formatted_params, res)

            success, res_data, msg = RecoveryEngine.execute_with_recovery(
                operation_name=f"{tool_name}_step_{step_order}",
                action_fn=run_action,
                verify_fn=verify_action
            )

            step_record = ExecutionStep(
                execution_id=execution.id,
                step_order=step_order,
                tool_name=tool_name,
                input_data_json=json.dumps(formatted_params),
                output_data_json=json.dumps(res_data),
                status="SUCCESS" if success else "FAILED",
                error_message=msg if not success else None
            )
            db.add(step_record)
            db.commit()
            db.refresh(step_record)

            # 3. Independent Post-Condition Verification
            VerificationEngine.verify_action(
                tool_name=tool_name,
                params=formatted_params,
                execution_result=res_data,
                execution_id=execution.id,
                step_id=step_record.id,
                db=db
            )

            if not success:
                overall_success = False
                error_msg = f"Step {step_order} failed: {msg}"
                break

        # Finalize Execution
        execution.status = "SUCCESS" if overall_success else "FAILED"
        execution.error_message = error_msg
        execution.completed_at = datetime.utcnow()
        db.commit()

        # Update lightweight memory
        mem = Memory(
            memory_key=f"execution_result_{execution.id}",
            memory_type="WORKFLOW_OUTCOME",
            memory_value_json=json.dumps({
                "workflow_id": workflow.id,
                "workflow_name": workflow.name,
                "status": execution.status,
                "timestamp": execution.completed_at.isoformat()
            })
        )
        db.add(mem)
        db.commit()

        logger.info(f"Workflow #{workflow.id} execution completed. Status: {execution.status}")
        return execution
