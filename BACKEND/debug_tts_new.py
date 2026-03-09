import asyncio
import io
import os
import sys
from pydub import AudioSegment
import edge_tts

async def test_tts():
    text = "Hello, I am testing the audio system."
    voice = "en-US-AvaNeural"
    output_path = "debug_tts_output.wav"
    
    print(f"--- [TTS DEBUG] Starting test ---")
    print(f"Text: {text}")
    print(f"Voice: {voice}")
    
    try:
        communicate = edge_tts.Communicate(text, voice)
        audio_bytes = b""
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_bytes += chunk["data"]
        
        if not audio_bytes:
            print("ERROR: No audio bytes received from Edge TTS")
            return

        print(f"Received {len(audio_bytes)} bytes from Edge TTS (MP3)")
        
        try:
            audio_segment = AudioSegment.from_file(io.BytesIO(audio_bytes), format="mp3")
            print(f"Pydub: Format={audio_segment.sample_width*8}bit, Rate={audio_segment.frame_rate}Hz, Channels={audio_segment.channels}")
            
            audio_segment = audio_segment.set_channels(1).set_frame_rate(24000)
            audio_segment.export(output_path, format="wav")
            
            if os.path.exists(output_path):
                size = os.path.getsize(output_path)
                print(f"SUCCESS: WAV file created at {output_path} ({size} bytes)")
            else:
                print("ERROR: WAV file was not created")
        except Exception as e:
            print(f"ERROR: Pydub conversion failed: {e}")
            import traceback
            traceback.print_exc()
            
    except Exception as e:
        print(f"ERROR: Edge TTS failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_tts())
