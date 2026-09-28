import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.config.settings import settings
from app.database.models import Base, Permission, User
from app.utils.logger import get_logger

logger = get_logger("database")

def get_engine():
    # Attempt MySQL if configured
    mysql_url = f"mysql+pymysql://{settings.MYSQL_USER}:{settings.MYSQL_PASSWORD}@{settings.MYSQL_HOST}:{settings.MYSQL_PORT}/{settings.MYSQL_DATABASE}"
    
    # Check if DATABASE_URL was explicitly set or if MySQL connection is attempted
    target_url = settings.DATABASE_URL
    if "mysql" in target_url:
        try:
            logger.info(f"Attempting connection to MySQL at {settings.MYSQL_HOST}:{settings.MYSQL_PORT}/{settings.MYSQL_DATABASE}...")
            eng = create_engine(target_url, pool_pre_ping=True)
            with eng.connect() as conn:
                logger.info("Successfully connected to MySQL database.")
            return eng
        except Exception as e:
            logger.warning(f"MySQL connection could not be established ({e}). Falling back to local SQLite database.")
            target_url = "sqlite:///./autoflow.db"
    
    # SQLite configuration
    connect_args = {"check_same_thread": False} if "sqlite" in target_url else {}
    eng = create_engine(target_url, connect_args=connect_args)
    logger.info(f"Database engine active with URL: {target_url}")
    return eng

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    
    # Seed default user and permissions if not present
    db = SessionLocal()
    try:
        if not db.query(User).first():
            default_user = User(username="local_user", role="owner")
            db.add(default_user)
        
        default_permissions = [
            ("READ_FILE", "LOW", True, False, "Read file contents within workspace"),
            ("CREATE_FOLDER", "LOW", True, False, "Create new folders within workspace"),
            ("CREATE_FILE", "LOW", True, False, "Create new files within workspace"),
            ("RENAME_FILE", "LOW", True, True, "Rename existing files in workspace"),
            ("MOVE_FILE", "MEDIUM", True, True, "Move files between directories in workspace"),
            ("COPY_FILE", "MEDIUM", True, False, "Copy files within workspace"),
            ("DELETE_FILE", "HIGH", True, True, "Delete files - ALWAYS requires explicit approval"),
            ("EXECUTE_COMMAND", "HIGH", False, True, "Terminal/Shell command execution (Disabled by default)"),
            ("NETWORK_ACCESS", "VERY_HIGH", False, True, "External network access (Disabled by default)")
        ]
        
        for action, risk, allowed, req_app, desc in default_permissions:
            existing = db.query(Permission).filter_by(action_type=action).first()
            if not existing:
                perm = Permission(
                    action_type=action,
                    risk_level=risk,
                    is_allowed=allowed,
                    requires_approval=req_app,
                    description=desc
                )
                db.add(perm)
        db.commit()
        logger.info("Database initialized with default permissions and user.")
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding database: {e}")
    finally:
        db.close()
