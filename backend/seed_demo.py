import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.connection import init_db, SessionLocal
from app.api.routes_demo import run_academic_demo_scenario
from app.utils.logger import get_logger

logger = get_logger("seed_demo")

def main():
    logger.info("Initializing database...")
    init_db()
    db = SessionLocal()
    try:
        logger.info("Running initial Academic Demo Scenario Seeding...")
        res = run_academic_demo_scenario(db)
        logger.info(f"Seeding completed successfully: {res['status']}.")
        logger.info(f"Events created: {res['events_created']}")
        logger.info(f"Patterns detected: {res['patterns_detected']}")
        if res.get("proposed_workflow"):
            logger.info(f"Proposed Workflow: '{res['proposed_workflow']['name']}' (ID: {res['proposed_workflow']['id']})")
    finally:
        db.close()

if __name__ == "__main__":
    main()
