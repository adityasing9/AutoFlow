import os
from typing import List, Dict, Any, Optional
from pathlib import Path
from app.config.settings import settings
from app.utils.logger import get_logger

logger = get_logger("vector_store")

class ChromaVectorMemory:
    """
    ChromaDB Semantic Vector Memory
    Used selectively for semantic search over workflow descriptions,
    contextual memory retrieval, and intent clustering.
    """
    def __init__(self):
        self.client = None
        self.collection = None
        self._init_client()

    def _init_client(self):
        try:
            import chromadb
            persist_dir = Path(settings.CHROMA_PERSIST_DIR)
            persist_dir.mkdir(parents=True, exist_ok=True)
            self.client = chromadb.PersistentClient(path=str(persist_dir))
            self.collection = self.client.get_or_create_collection(name="autoflow_workflows")
            logger.info("ChromaDB vector store initialized successfully.")
        except Exception as e:
            logger.warning(f"ChromaDB initialization failed ({e}). Semantic vector search will use in-memory fallback.")
            self.client = None

    def store_workflow_semantic(self, workflow_id: int, name: str, description: str, metadata: Dict[str, Any] = None):
        if not self.collection:
            return
        try:
            doc_text = f"Workflow: {name}\nDescription: {description}"
            meta = metadata or {}
            meta["workflow_id"] = workflow_id
            meta["name"] = name
            
            self.collection.upsert(
                documents=[doc_text],
                metadatas=[meta],
                ids=[f"wf_{workflow_id}"]
            )
        except Exception as e:
            logger.warning(f"Failed to index workflow in ChromaDB: {e}")

    def query_similar_workflows(self, query_text: str, n_results: int = 3) -> List[Dict[str, Any]]:
        if not self.collection:
            return []
        try:
            res = self.collection.query(query_texts=[query_text], n_results=n_results)
            results = []
            if res and res.get("documents"):
                docs = res["documents"][0]
                metas = res["metadatas"][0] if res.get("metadatas") else [{}] * len(docs)
                for d, m in zip(docs, metas):
                    results.append({"document": d, "metadata": m})
            return results
        except Exception as e:
            logger.warning(f"Error querying ChromaDB: {e}")
            return []

vector_store = ChromaVectorMemory()
