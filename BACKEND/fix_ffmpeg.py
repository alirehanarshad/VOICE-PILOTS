import os
import subprocess
import sys

def get_ffmpeg_path():
    """Tries to find ffmpeg.exe using different methods."""
    # 1. Try 'where' command
    try:
        result = subprocess.run(['where.exe', 'ffmpeg'], capture_output=True, text=True)
        if result.returncode == 0:
            return result.stdout.splitlines()[0].strip()
    except:
        pass

    # 2. Check common Winget path (based on user's environment)
    winget_base = os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\WinGet\Packages")
    if os.path.exists(winget_base):
        for root, dirs, files in os.walk(winget_base):
            if "ffmpeg.exe" in files:
                return os.path.join(root, "ffmpeg.exe")

    return None

def fix_path(ffmpeg_exe):
    ffmpeg_dir = os.path.dirname(ffmpeg_exe)
    print(f"Adding to PATH: {ffmpeg_dir}")
    
    # Use setx to permanently add to User PATH
    # setx PATH "%PATH%;C:\your\path"
    try:
        # Get current user path
        current_path = os.environ.get('PATH', '')
        if ffmpeg_dir.lower() not in current_path.lower():
            cmd = f'setx PATH "%PATH%;{ffmpeg_dir}"'
            subprocess.run(cmd, shell=True, check=True)
            print("[SUCCESS] FFmpeg directory added to User PATH.")
            print("[IMPORTANT] You MUST restart your terminal, IDE (VS Code), and backend for changes to take effect.")
        else:
            print("[INFO] FFmpeg directory is already in the current session's PATH.")
    except Exception as e:
        print(f"[ERROR] Failed to update PATH: {e}")

if __name__ == "__main__":
    print("--- FFmpeg Fix Utility ---")
    path = get_ffmpeg_path()
    if path:
        print(f"Found FFmpeg at: {path}")
        fix_path(path)
    else:
        print("[ERROR] FFmpeg not found on this system.")
        print("Please install it: winget install ffmpeg")
