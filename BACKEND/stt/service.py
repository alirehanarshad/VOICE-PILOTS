# STT Service — Rebuilt from scratch for Windows/Groq Zero-Latency
import os
import io
import tempfile
import asyncio
from typing import Optional
from config.settings import settings
from groq import AsyncGroq

class STTService:
    def __init__(self):
        """
        Robust STT Service using Groq's Whisper Large V3 Turbo.
        Optimized for zero latency and Windows stability.
        """
        self.texts_dir = os.path.join(os.path.dirname(__file__), "texts")
        os.makedirs(self.texts_dir, exist_ok=True)
        
        # Initialize Async client
        self.api_key = settings.GROQ_API_KEY
        if self.api_key:
            self.client = AsyncGroq(api_key=self.api_key)
        else:
            self.client = None
            print("  [STT] WARNING: GROQ_API_KEY is missing in settings!")

    async def transcribe(self, audio_data: bytes, **kwargs) -> str:
        """
        Robust transcription using Groq Cloud.
        Handles webm/ogg/wav input from browser MediaRecorder.
        """
        if not audio_data or len(audio_data) < 100:
            print("  [STT] REJECTED: Audio too small")
            return ""

        if not self.client:
            print("  [STT] ERROR: Cannot transcribe, Groq client not initialized.")
            return ""

        pilot_name = kwargs.get('pilot_name', 'Sofia')
        language = self._get_language(pilot_name)
        
        # Detect format from magic bytes
        is_wav = audio_data[:4] == b'RIFF'
        is_webm = audio_data[:4] == b'\x1a\x45\xdf\xa3'  # EBML header = webm/mkv
        is_ogg = audio_data[:4] == b'OggS'
        
        if is_wav:
            fmt = "wav"
        elif is_webm:
            fmt = "webm"
        elif is_ogg:
            fmt = "ogg"
        else:
            fmt = "webm"  # Default assumption for browser audio
            
        print(f"  [STT] Processing {len(audio_data)/1024:.1f}KB for {pilot_name} ({language}) format={fmt}")

        # --- NORMALIZATION ---
        # Browser MediaRecorder usually outputs webm/opus. 
        # Groq accepts webm directly, but normalizing to wav gives better results.
        normalized_data = audio_data
        file_ext = fmt
        temp_input = None
        temp_output = None
        
        if fmt != "wav":
            print(f"  [STT] Normalizing {fmt} -> wav via FFmpeg...")
            try:
                with tempfile.NamedTemporaryFile(suffix=f'.{fmt}', delete=False) as f_in:
                    f_in.write(audio_data)
                    temp_input = f_in.name
                
                temp_output = temp_input + ".wav"
                
                cmd = [
                    'ffmpeg', '-y', '-hide_banner', '-loglevel', 'error',
                    '-i', temp_input,
                    '-ar', '16000', '-ac', '1', '-sample_fmt', 's16',
                    '-f', 'wav', temp_output
                ]
                
                # Use asyncio subprocess to not block the event loop
                process = await asyncio.create_subprocess_exec(
                    *cmd,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                stdout, stderr = await process.communicate()
                
                if process.returncode == 0 and os.path.exists(temp_output):
                    with open(temp_output, 'rb') as f_out:
                        normalized_data = f_out.read()
                    file_ext = "wav"
                    print(f"  [STT] Normalization OK -> {len(normalized_data)/1024:.1f}KB")
                else:
                    err_msg = stderr.decode(errors='ignore')
                    print(f"  [STT] FFmpeg FAILED (code {process.returncode}): {err_msg}")
                    # Fall back to sending raw audio — Groq can handle webm
                    print(f"  [STT] Falling back to raw {fmt} upload")
            except Exception as e:
                print(f"  [STT] FFmpeg Error: {e} — using raw audio")
            finally:
                for p in [temp_input, temp_output]:
                    if p and os.path.exists(p):
                        try: os.remove(p)
                        except: pass

        # --- GROQ TRANSCRIPTION ---
        try:
            bio = io.BytesIO(normalized_data)
            bio.name = f"audio.{file_ext}"
            
            model = getattr(settings, 'STT_MODEL', 'whisper-large-v3-turbo')
            
            print(f"  [STT] Sending to Groq ({model}) as {bio.name}...")
            response = await self.client.audio.transcriptions.create(
                file=bio,
                model=model,
                response_format="json",
                language=language,
            )
            
            transcript = response.text.strip()
            
            if self._is_hallucination(transcript):
                print(f"  [STT] Hallucination filtered: \"{transcript}\"")
                return ""

            print(f"  [STT] Final Result: \"{transcript}\"")
            return transcript

        except Exception as e:
            print(f"  [STT] Groq API Error: {e}")
            return ""

    def _get_language(self, pilot_name: str) -> str:
        """Maps pilot names to ISO language codes."""
        return {
            "Zoya": "ur",
            "Aarav": "hi",
            "Sofia": "en",
            "Dutch": "en",
            "Eva": "en"
        }.get(pilot_name, "en")

    def _is_hallucination(self, text: str) -> bool:
        """Filters out common Whisper 'silent' hallucinations."""
        if not text or len(text.strip()) < 2: 
            return True
            
        hallucinations = [
            "thanks for watching", "thank you for watching", "subtitles by",
            "please subscribe", "like and subscribe", "retranslated by",
            "you also", "and you", "thank you for listening",
            "hello this is a conversation", "this is a conversation with an ai assistant",
            "transcribe accurately", "ignore noise"
        ]
        
        clean_text = text.lower().strip().rstrip('.')
        if clean_text in hallucinations:
            return True
        
        return False
