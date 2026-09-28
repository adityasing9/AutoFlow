import json
from pathlib import Path
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.database.models import Workflow, Execution
from app.services.permission_service.sandbox import SandboxValidator
from app.tools.registry import tool_registry
from app.config.settings import settings
from app.utils.logger import get_logger

logger = get_logger("workflow_simulator")

class WorkflowSimulator:
    @staticmethod
    def simulate_workflow(workflow: Workflow, sample_file: Optional[str] = None) -> Dict[str, Any]:
        """
        Executes a dry-run of the proposed workflow without mutating the filesystem.
        """
        actions = json.loads(workflow.actions_json)
        workspace_root = SandboxValidator.get_workspace_root()
        inbox_dir = workspace_root / "Inbox"
        
        # Discover candidate files in Inbox or use sample_file
        candidate_files = []
        if sample_file:
            candidate_files = [sample_file]
        elif inbox_dir.exists():
            candidate_files = [f.name for f in inbox_dir.glob("*.pdf")]
            
        if not candidate_files:
            candidate_files = ["sample_assignment_dbms.pdf", "ai_lecture_notes.pdf", "os_lab_sheet.pdf"]

        potential_renames = 0
        potential_moves = 0
        potential_folders = 0
        potential_deletions = 0
        network_requests = 0
        simulated_steps = []

        for f_name in candidate_files:
            # Infer subject from filename if possible
            subject = "DBMS" if "dbms" in f_name.lower() else ("AI" if "ai" in f_name.lower() else "OS")
            
            for act in actions:
                tool_name = act["tool_name"]
                tool = tool_registry.get_tool(tool_name)
                
                # Format parameters safely
                raw_params = act["params"]
                formatted_params = {}
                for k, v in raw_params.items():
                    if isinstance(v, str):
                        formatted_params[k] = (
                            v.replace("{filename}", f_name)
                             .replace("{subject}", subject)
                             .replace("{date}", "20260928")
                        )
                    else:
                        formatted_params[k] = v

                sim_res = tool.simulate(formatted_params) if tool else {"simulated": True}
                
                if tool_name == "FileRenamer":
                    potential_renames += 1
                elif tool_name == "FileMover":
                    potential_moves += 1
                elif tool_name == "FolderCreator":
                    potential_folders += 1
                    
                simulated_steps.append({
                    "target_file": f_name,
                    "step_order": act["step_order"],
                    "tool": tool_name,
                    "action_description": act.get("description", ""),
                    "simulated_outcome": sim_res
                })

        return {
            "workflow_id": workflow.id,
            "workflow_name": workflow.name,
            "files_detected": len(candidate_files),
            "potential_renames": potential_renames,
            "potential_moves": potential_moves,
            "potential_folders_created": potential_folders,
            "potential_deletions": potential_deletions,
            "network_requests": network_requests,
            "risk_level": workflow.risk_level,
            "simulated_steps": simulated_steps,
            "can_proceed": True
        }
