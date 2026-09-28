import json
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.database.models import Pattern, Workflow, WorkflowStep
from app.services.ai_service.intent_engine import AIIntentEngine
from app.services.workflow_service.confidence import ConfidenceEngine
from app.utils.logger import get_logger

logger = get_logger("workflow_generator")

class WorkflowGenerator:
    def __init__(self, ai_engine: Optional[AIIntentEngine] = None):
        self.ai_engine = ai_engine or AIIntentEngine()

    def generate_workflow_from_pattern(self, pattern: Pattern, db: Session) -> Workflow:
        """
        Synthesizes a structured proposed workflow from a discovered pattern.
        """
        sequence = json.loads(pattern.sequence_json)
        
        # 1. Ask AI Intent Engine to understand pattern
        intent_analysis = self.ai_engine.analyze_pattern(
            sequence=sequence,
            occurrences=pattern.occurrences,
            avg_interval_seconds=pattern.avg_interval_seconds,
            context="PDF documents downloaded to Inbox and organized into subject folders"
        )
        
        # 2. Compute Multi-signal Confidence
        final_confidence = ConfidenceEngine.calculate_confidence(
            occurrences=pattern.occurrences,
            sequence_length=len(sequence),
            interval_std_ratio=0.85,
            context_match=True,
            ai_confidence=intent_analysis.confidence
        )
        
        # 3. Build structured action steps conforming to registered tools
        # For our primary academic example: Study Material Organizer
        actions = [
            {
                "step_order": 1,
                "tool_name": "FileReader",
                "params": {"path": "<WORKSPACE>/Inbox/{filename}"},
                "risk_level": "LOW",
                "description": "Inspect newly arrived file metadata"
            },
            {
                "step_order": 2,
                "tool_name": "FolderCreator",
                "params": {"folder_path": "<WORKSPACE>/College/{subject}"},
                "risk_level": "LOW",
                "description": "Ensure destination subject directory exists"
            },
            {
                "step_order": 3,
                "tool_name": "FileRenamer",
                "params": {
                    "source_path": "<WORKSPACE>/Inbox/{filename}",
                    "new_name": "{subject}_{date}_{filename}"
                },
                "risk_level": "LOW",
                "description": "Standardize academic document naming"
            },
            {
                "step_order": 4,
                "tool_name": "FileMover",
                "params": {
                    "source_path": "<WORKSPACE>/Inbox/{subject}_{date}_{filename}",
                    "dest_folder": "<WORKSPACE>/College/{subject}"
                },
                "risk_level": "MEDIUM",
                "description": "Move document to organized subject directory"
            }
        ]

        verification_plan = {
            "required_checks": [
                {"type": "DESTINATION_EXISTS", "target": "<WORKSPACE>/College/{subject}/{final_file}"},
                {"type": "SOURCE_REMOVED", "target": "<WORKSPACE>/Inbox/{filename}"}
            ]
        }

        conditions = {
            "source_folder": "Inbox",
            "file_type": "PDF",
            "min_size_bytes": 10
        }

        # 4. Save Workflow entity
        wf = Workflow(
            pattern_id=pattern.id,
            name=intent_analysis.workflow_name,
            description=intent_analysis.description,
            trigger_type="FILE_CREATED:PDF",
            conditions_json=json.dumps(conditions),
            actions_json=json.dumps(actions),
            verification_json=json.dumps(verification_plan),
            risk_level=pattern.risk_level,
            confidence=final_confidence,
            status="PROPOSED"
        )
        db.add(wf)
        db.commit()
        db.refresh(wf)

        # 5. Save step entities
        for act in actions:
            step = WorkflowStep(
                workflow_id=wf.id,
                step_order=act["step_order"],
                tool_name=act["tool_name"],
                tool_params_json=json.dumps(act["params"]),
                risk_level=act["risk_level"]
            )
            db.add(step)
            
        # Update pattern status
        pattern.status = "PROPOSED"
        pattern.name = intent_analysis.workflow_name
        db.commit()

        logger.info(f"Generated Workflow #{wf.id} '{wf.name}' with confidence {final_confidence:.0%}")
        return wf
