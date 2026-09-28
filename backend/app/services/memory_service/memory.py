import json
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.database.models import Memory
from app.services.memory_service.vector_store import vector_store
from app.utils.logger import get_logger

logger = get_logger("memory_service")

class MemoryService:
    @staticmethod
    def save_memory(
        db: Session,
        key: str,
        value: Dict[str, Any],
        memory_type: str = "WORKFLOW_OUTCOME"
    ) -> Memory:
        mem = Memory(
            memory_key=key,
            memory_type=memory_type,
            memory_value_json=json.dumps(value),
            created_at=datetime.utcnow()
        )
        db.add(mem)
        db.commit()
        db.refresh(mem)
        return mem

    @staticmethod
    def get_memories_by_type(db: Session, memory_type: str, limit: int = 50) -> List[Dict[str, Any]]:
        records = db.query(Memory).filter_by(memory_type=memory_type).order_by(Memory.created_at.desc()).limit(limit).all()
        return [
            {
                "id": r.id,
                "key": r.memory_key,
                "type": r.memory_type,
                "value": json.loads(r.memory_value_json),
                "created_at": r.created_at.isoformat()
            }
            for r in records
        ]

    @staticmethod
    def record_workflow_learning(db: Session, workflow_id: int, name: str, description: str, outcome: str):
        data = {
            "workflow_id": workflow_id,
            "name": name,
            "description": description,
            "outcome": outcome,
            "timestamp": datetime.utcnow().isoformat()
        }
        # Save structured SQL memory
        MemoryService.save_memory(db, key=f"wf_learn_{workflow_id}", value=data, memory_type="WORKFLOW_OUTCOME")
        
        # Index in ChromaDB for semantic search
        vector_store.store_workflow_semantic(
            workflow_id=workflow_id,
            name=name,
            description=description,
            metadata={"outcome": outcome}
        )
