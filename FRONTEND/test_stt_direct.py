import asyncio
import sys
import os
import io
import wave

# Add backend to path
sys.path.append(r'C:\Users\ALI REHAN ARSHAD\Desktop\backend')

from dotenv import load_dotenv
load_dotenv(r'C:\Users\ALI REHAN ARSHAD\Desktop\backend\.env')

async def test_stt_class():
    try:
        from config.settings import settings
        from stt.service import STTService
        
        service = STTService()
        
        # 1. Test with a tiny silent WAV (should be rejected/hallucination or return empty)
        with io.BytesIO() as wav_io:
            with wave.open(wav_io, 'wb') as wav_file:
                wav_file.setnchannels(1)
                wav_file.setsampwidth(2)
                wav_file.setframerate(16000)
                wav_file.writeframes(b'\x00' * 32000) # 1 second of silence
            wav_data = wav_io.getvalue()

        print(f"Testing STTService with dummy WAV ({len(wav_data)} bytes)...")
        transcript = await service.transcribe(wav_data, pilot_name="Sofia")
        
        print(f"Transcript Result: \"{transcript}\"")
        
        if transcript == "":
            print("\nSUCCESS: Service is reachable and returned a clean result for silence.")
        else:
            print(f"\nNOTE: Service returned: \"{transcript}\"")
            
    except Exception as e:
        print(f"\nERROR: STT Class Test failed.\n{e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_stt_class())
