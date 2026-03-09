import asyncio
import httpx
import wave
import io
import os

async def test_stt_endpoint():
    url = "http://127.0.0.1:8000/api/voice/process?pilot=Sofia"
    
    # Create a dummy silent WAV file (1 second, 16kHz, mono)
    with io.BytesIO() as wav_io:
        with wave.open(wav_io, 'wb') as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2)
            wav_file.setframerate(16000)
            wav_file.writeframes(b'\x00' * 32000) # 1 second of silence
        wav_data = wav_io.getvalue()

    print(f"Sending dummy WAV ({len(wav_data)} bytes) to {url}...")
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            files = {'file': ('test.wav', wav_data, 'audio/wav')}
            response = await client.post(url, files=files)
            
            print(f"Status Code: {response.status_code}")
            print(f"Response Body: {response.text}")
            
            if response.status_code == 200:
                data = response.json()
                transcript = data.get("user_transcript")
                print(f"\nSUCCESS: Endpoint reached.")
                print(f"Transcript: \"{transcript}\"")
                if not transcript:
                    print("Note: Empty transcript is expected for silence, but the connection worked!")
            else:
                print(f"\nFAILURE: Server returned error.")
                
    except Exception as e:
        print(f"\nERROR: Could not connect to server. Is it running on port 8000?\n{e}")

if __name__ == "__main__":
    asyncio.run(test_stt_endpoint())
