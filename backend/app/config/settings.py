import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DEFAULT_WORKSPACE = (BASE_DIR.parent / "AutoFlowWorkspace").resolve()

class Settings(BaseSettings):
    PROJECT_NAME: str = "AutoFlow"
    API_V1_STR: str = "/api"
    
    # Database Settings: Supports MySQL with automatic SQLite fallback
    # To connect to MySQL: mysql+pymysql://<user>:<password>@localhost:3306/autoflow
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./autoflow.db")
    MYSQL_HOST: str = os.getenv("MYSQL_HOST", "localhost")
    MYSQL_PORT: int = int(os.getenv("MYSQL_PORT", "3306"))
    MYSQL_USER: str = os.getenv("MYSQL_USER", "root")
    MYSQL_PASSWORD: str = os.getenv("MYSQL_PASSWORD", "")
    MYSQL_DATABASE: str = os.getenv("MYSQL_DATABASE", "autoflow")
    
    # Safe Workspace Sandbox
    WORKSPACE_DIR: str = os.getenv("WORKSPACE_DIR", str(DEFAULT_WORKSPACE))
    
    # Privacy & Local AI
    OFFLINE_MODE: bool = True
    ALLOW_INTERNET: bool = False
    LOCAL_LLM_PROVIDER: str = os.getenv("LOCAL_LLM_PROVIDER", "auto") # auto, ollama, heuristic
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama3")
    
    # Event Collection & Privacy Filtering
    MONITORING_ACTIVE: bool = False
    COLLECT_FILE_EVENTS: bool = True
    COLLECT_APP_EVENTS: bool = False
    MAX_EVENT_RETENTION_DAYS: int = 30
    
    # Pattern Discovery
    PATTERN_MIN_OCCURRENCES: int = 3
    PATTERN_TIME_WINDOW_MINUTES: int = 15
    PATTERN_CONFIDENCE_THRESHOLD: float = 0.60
    
    # ChromaDB Vector Memory Path
    CHROMA_PERSIST_DIR: str = str(BASE_DIR / "chroma_db")

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
