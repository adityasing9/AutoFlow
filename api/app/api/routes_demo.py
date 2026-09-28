import os
import json
from pathlib import Path
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import Event, Pattern, Workflow
from app.services.event_service.normalizer import EventNormalizer
from app.services.pattern_service.detector import PatternDetector
from app.services.workflow_service.generator import WorkflowGenerator
from app.services.permission_service.sandbox import SandboxValidator
from app.utils.logger import get_logger

logger = get_logger("demo_scenario")

router = APIRouter(prefix="/demo", tags=["Demo"])

@router.post("/prepare-workspace")
def prepare_workspace():
    """Sets up the demo folder structure and creates mock files in Inbox."""
    root = SandboxValidator.get_workspace_root()
    inbox = root / "Inbox"
    college = root / "College"
    output = root / "Output"
    
    inbox.mkdir(parents=True, exist_ok=True)
    (college / "DBMS").mkdir(parents=True, exist_ok=True)
    (college / "AI").mkdir(parents=True, exist_ok=True)
    (college / "OS").mkdir(parents=True, exist_ok=True)
    output.mkdir(parents=True, exist_ok=True)

    # Populate Inbox with sample incoming PDFs for demonstration
    sample_files = [
        ("lecture_notes_dbms_unit1.pdf", "DBMS Lecture Unit 1: Relational Model & SQL"),
        ("ai_lab_assignment_3.pdf", "AI Lab 3: Breadth-First and Depth-First Search Implementation"),
        ("operating_systems_process_mgmt.pdf", "Operating Systems Chapter 3: Process Scheduling Algorithms")
    ]
    created = []
    for fname, content in sample_files:
        p = inbox / fname
        with open(p, "w", encoding="utf-8") as f:
            f.write(f"%PDF-1.4\n{content}\n%%EOF")
        created.append(fname)

    return {
        "status": "SUCCESS",
        "workspace_root": str(root),
        "created_files": created
    }

@router.post("/run-scenario")
def run_academic_demo_scenario(db: Session = Depends(get_db)):
    """
    Executes the primary academic demo scenario:
    Simulates 11 repeated occurrences of:
    FILE_CREATED (PDF) -> FILE_OPENED (PDF) -> FILE_RENAMED (PDF) -> FILE_MOVED (PDF)
    Runs pattern detection, invokes AI intent understanding, and generates the
    'Study Material Organizer' workflow proposal.
    """
    prepare_workspace()
    
    base_time = datetime.utcnow() - timedelta(minutes=45)
    subjects = ["DBMS", "AI", "OS"]
    
    # 1. Generate 11 repetitive event cycles
    events_generated = 0
    for i in range(1, 12):
        subj = subjects[i % len(subjects)]
        file_name = f"downloaded_doc_{i}.pdf"
        renamed_file = f"{subj}_Unit_{i}_Notes.pdf"
        raw_hash = EventNormalizer.get_hash(f"session_file_{i}")
        
        cycle = [
            ("FILE_CREATED", f"<WORKSPACE>/Inbox/{file_name}", 0),
            ("FILE_OPENED", f"<WORKSPACE>/Inbox/{file_name}", 30),
            ("FILE_RENAMED", f"<WORKSPACE>/Inbox/{renamed_file}", 90),
            ("FILE_MOVED", f"<WORKSPACE>/College/{subj}/{renamed_file}", 150)
        ]
        
        cycle_base = base_time + timedelta(minutes=i * 3.5)
        for evt_type, norm_path, sec_offset in cycle:
            ev = Event(
                event_type=evt_type,
                file_type="PDF",
                category="DOCUMENT",
                normalized_path=norm_path,
                raw_hash=raw_hash,
                metadata_json=json.dumps({"subject": subj, "demo_cycle": i}),
                is_privacy_filtered=True,
                timestamp=cycle_base + timedelta(seconds=sec_offset)
            )
            db.add(ev)
            events_generated += 1
            
    db.commit()
    logger.info(f"Generated {events_generated} simulated privacy-filtered events for 11 cycles.")

    # 2. Run Pattern Discovery
    detector = PatternDetector(min_occurrences=3, window_minutes=60)
    discovered_patterns = detector.discover_patterns(db)
    
    # Find the matching 4-step pattern
    target_pattern = None
    for p in discovered_patterns:
        seq = json.loads(p.sequence_json)
        if len(seq) == 4 and "FILE_CREATED:PDF" in seq[0] and "FILE_MOVED:PDF" in seq[-1]:
            target_pattern = p
            break
            
    if not target_pattern and discovered_patterns:
        target_pattern = discovered_patterns[0]

    # 3. Generate Workflow Proposal
    wf = None
    if target_pattern:
        generator = WorkflowGenerator()
        wf = generator.generate_workflow_from_pattern(target_pattern, db)

    return {
        "status": "SUCCESS",
        "events_created": events_generated,
        "patterns_detected": len(discovered_patterns),
        "primary_pattern": {
            "code": target_pattern.pattern_code if target_pattern else None,
            "occurrences": target_pattern.occurrences if target_pattern else 0,
            "confidence": target_pattern.confidence if target_pattern else 0,
            "sequence": json.loads(target_pattern.sequence_json) if target_pattern else []
        } if target_pattern else None,
        "proposed_workflow": {
            "id": wf.id if wf else None,
            "name": wf.name if wf else None,
            "description": wf.description if wf else None,
            "confidence": wf.confidence if wf else None,
            "status": wf.status if wf else None
        } if wf else None
    }
