import subprocess
import os

def test_ffmpeg():
    print(f"Current PATH: {os.environ.get('PATH')}")
    try:
        result = subprocess.run(['ffmpeg', '-version'], capture_output=True, text=True)
        print("FFmpeg output received:")
        print(result.stdout[:100])
        return True
    except FileNotFoundError:
        print("Error: FFmpeg (ffmpeg.exe) was not found in the PATH.")
        return False
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return False

if __name__ == "__main__":
    if test_ffmpeg():
        print("\n[SUCCESS] FFmpeg is accessible from Python.")
    else:
        print("\n[FAILURE] FFmpeg is NOT accessible from Python.")
