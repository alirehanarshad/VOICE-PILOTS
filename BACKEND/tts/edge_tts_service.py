import asyncio
import io
import traceback
import numpy as np
import torch
import edge_tts
from pydub import AudioSegment

class EdgeTTSService:
    """
    Streaming TTS Service using edge-tts.
    Provides fast, word-by-word streaming generation natively handling symbols.
    """
    
    VOICE_MAP = {
        "Sofia": "en-US-AvaNeural",
        "Dutch": "en-US-AndrewNeural",
        "Eva": "en-US-EmmaNeural",
        "Zoya": "ur-IN-GulNeural",
        "Aarav": "hi-IN-SwaraNeural"
    }

    async def stream_speech(self, text: str, pilot_name: str):
        """
        Generate audio from text using Edge TTS.
        Yields (audio_tensor, words_metadata)
        """
        if not text or not text.strip():
            yield None, []
            return

        voice = self.VOICE_MAP.get(pilot_name, "en-US-AvaNeural")
        
        try:
            communicate = edge_tts.Communicate(text, voice)
            audio_bytes = b""
            words = []
            
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_bytes += chunk["data"]
                elif chunk["type"] == "WordBoundary":
                    # offset and duration are in 100ns units in edge-tts
                    words.append({
                        "text": chunk["text"],
                        "offset": chunk["offset"] / 10**7, # Convert to seconds
                        "duration": chunk["duration"] / 10**7
                    })
            
            if not audio_bytes:
                yield None, []
                return

            # Decode MP3 to raw PCM using pydub
            audio_segment = AudioSegment.from_file(io.BytesIO(audio_bytes), format="mp3")
            audio_segment = audio_segment.set_channels(1).set_frame_rate(24000)

            # SILENCE TRIM: Remove inter-chunk pauses.
            from pydub.silence import detect_nonsilent
            non_silent = detect_nonsilent(audio_segment, min_silence_len=50, silence_thresh=-45)
            
            leading_silence_sec = 0
            if non_silent:
                start_trim = max(0, non_silent[0][0] - 10)
                end_trim   = min(len(audio_segment), non_silent[-1][1] + 10)
                
                leading_silence_sec = start_trim / 1000.0
                audio_segment = audio_segment[start_trim:end_trim]
            
            # Sync word offsets with the trimmed audio
            synced_words = []
            for w in words:
                new_offset = w["offset"] - leading_silence_sec
                # Only include words that fall within the trimmed segment
                if new_offset >= 0:
                    synced_words.append({
                        "text": w["text"],
                        "offset": new_offset,
                        "duration": w["duration"]
                    })

            audio_np = np.array(audio_segment.get_array_of_samples()).astype(np.float32) / 32768.0
            audio_tensor = torch.from_numpy(audio_np)
            
            yield audio_tensor, synced_words
            
        except Exception as e:
            print(f"  [TTS] Edge TTS Error: {e}")
            yield None, []

    async def generate_speech(self, text: str, agent_name: str) -> str:
        """
        Generate audio from text using Edge TTS without saving to disk.
        Returns base64 encoded string containing the raw WAV data.
        """
        if not text or not text.strip():
            return None
            
        voice = self.VOICE_MAP.get(agent_name, "en-US-AvaNeural")
        
        try:
            communicate = edge_tts.Communicate(text, voice)
            audio_bytes = b""
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_bytes += chunk["data"]
            
            if audio_bytes:
                import io
                from pydub import AudioSegment
                import base64
                
                # Decode MP3 from memory
                audio_segment = AudioSegment.from_file(io.BytesIO(audio_bytes), format="mp3")
                audio_segment = audio_segment.set_channels(1).set_frame_rate(24000)
                
                # Export to memory buffer as WAV
                wav_io = io.BytesIO()
                audio_segment.export(wav_io, format="wav")
                wav_bytes = wav_io.getvalue()
                
                # Return base64 string directly
                b64 = base64.b64encode(wav_bytes).decode('utf-8')
                return f"data:audio/wav;base64,{b64}"
                
            return None
        except Exception as e:
            print(f"  [TTS] Edge TTS Error generating speech: {e}")
            traceback.print_exc()
            return None

    async def save_to_voices_folder(self, text: str, pilot_name: str, session_id: str):
        """
        Generate audio for the full response and save to the 'voices' folder.
        """
        if not text or not text.strip():
            return
            
        voice = self.VOICE_MAP.get(pilot_name, "en-US-AvaNeural")
        try:
            communicate = edge_tts.Communicate(text, voice)
            audio_bytes = b""
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_bytes += chunk["data"]
                    
            if audio_bytes:
                import io
                import time
                import os
                import asyncio
                from pydub import AudioSegment
                
                def _process_and_save():
                    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                    voices_dir = os.path.join(backend_dir, "voices")
                    os.makedirs(voices_dir, exist_ok=True)
                    
                    # Sanitize name
                    safe_name = "".join([c for c in pilot_name if c.isalpha() or c.isdigit()]).rstrip()
                    filename = f"response_{safe_name}_{int(time.time())}.wav"
                    filepath = os.path.join(voices_dir, filename)
                    
                    audio_segment = AudioSegment.from_file(io.BytesIO(audio_bytes), format="mp3")
                    audio_segment = audio_segment.set_channels(1).set_frame_rate(24000)
                    
                    with open(filepath, "wb") as f:
                        audio_segment.export(f, format="wav")
                    return filepath

                filepath = await asyncio.to_thread(_process_and_save)    
                print(f"  [TTS] Safely saved LLM full response audio to {filepath}")
        except Exception as e:
            print(f"  [TTS] Failed to save full response to voices folder: {e}")

# Export singleton instance
tts_service = EdgeTTSService()
