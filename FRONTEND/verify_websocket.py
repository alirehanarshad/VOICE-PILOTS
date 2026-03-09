
import sys
import os

# Set base dir to the backend root
base_dir = r"c:\Users\ALI REHAN ARSHAD\Desktop\backend"

try:
    # We just want to check SYNTAX and INDENTATION. 
    # This won't run the server.
    file_path = os.path.join(base_dir, "api", "websocket.py")
    if not os.path.exists(file_path):
        print(f"ERROR: File not found at {file_path}")
    else:
        with open(file_path, "r", encoding='utf-8') as f:
            code = f.read()
            compile(code, "websocket.py", "exec")
        print("SUCCESS: websocket.py is VALID Python code.")
except IndentationError as ie:
    print(f"FAILURE: IndentationError in websocket.py: {ie}")
except SyntaxError as se:
    print(f"FAILURE: SyntaxError in websocket.py: {se}")
except Exception as e:
    print(f"ERROR: General check fail: {type(e).__name__}: {e}")
