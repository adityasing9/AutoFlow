import sys
import os

# Insert backend directory to sys.path so 'app' can be imported anywhere
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
