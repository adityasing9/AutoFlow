import time
from typing import Callable, Any, Dict, Tuple
from app.utils.logger import get_logger

logger = get_logger("recovery_engine")

class RecoveryEngine:
    MAX_RETRIES = 2
    RETRY_DELAY_SECONDS = 0.5

    @classmethod
    def execute_with_recovery(
        cls,
        operation_name: str,
        action_fn: Callable[[], Dict[str, Any]],
        verify_fn: Callable[[Dict[str, Any]], Tuple[bool, str]]
    ) -> Tuple[bool, Dict[str, Any], str]:
        """
        Executes an action, verifies the outcome, and performs safe automatic retries
        up to MAX_RETRIES if recoverable.
        """
        attempts = 0
        last_error = ""
        result = {}

        while attempts <= cls.MAX_RETRIES:
            attempts += 1
            try:
                result = action_fn()
                verified, verify_msg = verify_fn(result)
                if verified:
                    return (True, result, "Operation succeeded and verified.")
                else:
                    last_error = f"Verification failed: {verify_msg}"
                    logger.warning(f"Attempt {attempts} verification failed for {operation_name}: {verify_msg}")
            except Exception as e:
                last_error = str(e)
                logger.warning(f"Attempt {attempts} exception for {operation_name}: {last_error}")

            if attempts <= cls.MAX_RETRIES:
                logger.info(f"Retrying {operation_name} (Attempt {attempts + 1} of {cls.MAX_RETRIES + 1})...")
                time.sleep(cls.RETRY_DELAY_SECONDS)

        logger.error(f"Recovery failed for {operation_name} after {attempts} attempts. Error: {last_error}")
        return (False, result, f"Failed after {attempts} attempts: {last_error}")
