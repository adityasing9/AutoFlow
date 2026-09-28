import sys
import os

curr_dir = os.path.dirname(os.path.abspath(__file__))
if curr_dir not in sys.path:
    sys.path.insert(0, curr_dir)

backend_dir = os.path.join(curr_dir, "..", "backend")
if os.path.exists(backend_dir) and backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app

# Export for Vercel
handler = app
