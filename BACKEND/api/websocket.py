import json
import asyncio
import base64
import numpy as np
import torch
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from brain.llm import LLMHandler
from brain.router import IntentRouter
from brain.memory import MemoryHandler
from brain.actions import ActionHandler
from tts.edge_tts_service import tts_service

router = APIRouter()
from brain.service import llm, memory, actions, intent_router, pm
from brain.memory_learning import learn_from_conversation
import time
import traceback

async def safe_send_json(websocket: WebSocket, data: dict):
    """Sends JSON only if the connection is still open."""
    try:
        if websocket.client_state.name == "CONNECTED" and websocket.application_state.name == "CONNECTED":
            await websocket.send_json(data)
    except Exception as e:
        # Don't log if it's just a closure
        if "WebSocket is not connected" not in str(e):
            print(f"  [WS] Safe send failed: {e}")

async def send_tts_for_sentence(websocket: WebSocket, text_to_speak: str, pilot_name: str):
    """Process TTS for a single sentence and send audio chunks over WebSocket."""
    try:
        async for audio_tensor, words_metadata in tts_service.stream_speech(text_to_speak, pilot_name):
            if audio_tensor is not None:
                import io
                import soundfile as sf
                
                # Convert torch tensor to numpy array
                audio_np = audio_tensor.numpy()
                
                # Write to an in-memory WAV file
                wav_io = io.BytesIO()
                sf.write(wav_io, audio_np, 24000, format='WAV', subtype='PCM_16')
                audio_bytes = wav_io.getvalue()
                
                audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
                
                await safe_send_json(websocket, {
                    "type": "audio",
                    "data": audio_base64,
                    "format": "wav",
                    "words": words_metadata
                })
    except Exception as e:
        print(f"  [WS] TTS streaming error: {e}")

def clean_text_for_tts(text: str) -> str:
    """
    Speech-optimized text cleaner for Edge TTS.
    Preserves word integrity while removing problematic symbols.
    """
    import re
    # Remove markdown formatting
    cleaned = re.sub(r'[*_#`~]', '', text)
    # STRIP EMOJIS: Remove all characters in the emoji/extended symbol range
    # This prevents Edge TTS from reading "smiling face with heart eyes" etc.
    cleaned = re.sub(r'[^\x00-\x7F\u00A0-\u017F\u0400-\u04FF\u0600-\u06FF\u0900-\u097F]+', ' ', cleaned)
    # REPLACE problematic symbols with spaces, but KEEP apostrophes and natural pause markers (. , ! ? ')
    cleaned = re.sub(r'[;:\-\(\)\[\]\{\}\/\\|<>@#$%^&*=+~—–]', ' ', cleaned)
    # Ensure punctuation has a space after it if it doesn't already, except for apostrophes
    cleaned = re.sub(r'([.,!?])(?=[^\s])', r'\1 ', cleaned)
    # Collapse multiple spaces
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned

@router.websocket("/stream")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("  [WS] Client connected")
    
    try:
        while True:
            # Receive text data (prompt) from frontend
            data = await websocket.receive_text()
            payload = json.loads(data)
            user_message = payload.get("message", "")
            pilot_name = payload.get("pilot", "Sofia")
            session_id = payload.get("session_id", "default")
            
            start_time = time.time()
            print(f"  [WS] Received prompt: {user_message}")
            print(f"  [WS] Active Pilot: {pilot_name}")

            # 1. Store user message in memory (Wait until AFTER Grand Route to store corrected text!)
            if user_message == "NO_SPEECH_DETECTED_FALLBACK_PHRASE":
                # INSTANT FALLBACK: Don't call LLM, just provide a standard response
                fallback_text = "I'm sorry, I didn't quite catch that. Could you please repeat?"
                await safe_send_json(websocket, {"type": "text_delta", "content": fallback_text})
                await send_tts_for_sentence(websocket, fallback_text, pilot_name)
                await safe_send_json(websocket, {"type": "end"})
                continue

            try:
                # ── GRAND ROUTING ──
                start_route_time = time.time()
                print(f"  [WS] Routing input: \"{user_message[:50]}...\"")
                
                if pilot_name in ["Zoya", "Aarav"]:
                    grand_route = {
                        "Corrected_Text": user_message,
                        "Intent": "Response",
                        "Category": None,
                        "Task": None,
                        "Permission": "not_required",
                        "Confidence_Score": 1.0,
                        "Action_Description": "None",
                        "Clarification_Question": "None"
                    }
                else:
                    try:
                        # Safety timeout for Grand Router to prevent silent hangs
                        print("  [WS] Calling Grand Router...")
                        router_start = time.time()
                        grand_route = await asyncio.wait_for(llm.parse_grand_route(user_message), timeout=5.0) # Reduced timeout for faster failure
                        print(f"  [WS] Grand Router Response received in {time.time() - router_start:.2f}s")
                    except asyncio.TimeoutError:
                        print("  [WS] Grand Router TIMEOUT - using raw message as fallback")
                        grand_route = {"Corrected_Text": user_message, "Intent": "Response"}
                    
                print(f"  [WS] Grand Route total cycle: {time.time() - start_route_time:.2f}s (Intent: {grand_route.get('Intent')})")
                
                corrected_message = grand_route.get("Corrected_Text", user_message)
                intent_result = grand_route.get("Intent", "Response").lower()
                
                # Send the corrected text back to the frontend to update the user's chat bubble
                print(f"  [WS] Sending corrected text: \"{corrected_message[:30]}...\"")
                await safe_send_json(websocket, {
                    "type": "corrected_text", 
                    "content": corrected_message,
                    "intent": intent_result
                })

                memory.add_message("user", corrected_message, session_id)
                
                history = memory.get_history(session_id)
                history_for_llm = history[:-1] if history else []
                
                # Use the Corrected Text for generation
                stream_source = llm.generate_stream(corrected_message, history=history_for_llm, pilot_name=pilot_name)

                # ── PARALLEL STREAMING ENGINES ──
                tts_queue = asyncio.Queue()
                
                async def tts_worker():
                    """Consumes sentences from the queue and streams audio chunks."""
                    while True:
                        try:
                            # Wait for chunk with timeout to prevent hangs on long responses
                            chunk = await asyncio.wait_for(tts_queue.get(), timeout=30.0)
                            if chunk is None:
                                tts_queue.task_done()  # Mark sentinel as done BEFORE break
                                break
                            
                            clean_chunk = clean_text_for_tts(chunk)
                            if clean_chunk:
                                await send_tts_for_sentence(websocket, clean_chunk, pilot_name)
                            tts_queue.task_done()  # Mark real chunk as done
                        except asyncio.TimeoutError:
                            print("  [WS] TTS Worker timed out - likely a hang or extremely slow response.")
                            break
                        except Exception as worker_err:
                            print(f"  [WS] Worker error: {worker_err}")
                            try: tts_queue.task_done()
                            except: pass

                tts_task = asyncio.create_task(tts_worker())

                sentence_buffer = ""
                full_response = ""
                first_text_sent = False
                first_audio_sent = False
                
                print(f"  [WS] Starting LLM stream for prompt: \"{user_message}\"")
                async for token in stream_source:
                    if not first_text_sent:
                        print(f"  [WS] First text token after {time.time() - start_time:.2f}s")
                        first_text_sent = True


                    full_response += token
                    sentence_buffer += token
                    
                    await safe_send_json(websocket, {"type": "text_delta", "content": token})

                    # SPEECH-OPTIMIZED CHUNKING:
                    # We only flush when the buffer ends with a space, ensuring we don't cut words.
                    # SPECIAL SPEED FIX: Flush immediately if it's the very first word to reduce time-to-first-sound.
                    words_in_buffer = sentence_buffer.split()
                    has_trailing_space = token.endswith(" ") or token.endswith("\n") or token.endswith("\r")
                    
                    # Check if we have enough words AND the last word is complete (trailing space)
                    should_flush = (len(words_in_buffer) >= 7 and has_trailing_space) or \
                                  (not first_audio_sent and len(words_in_buffer) >= 1 and has_trailing_space)
                    
                    if should_flush:
                        chunk = sentence_buffer.strip()
                        if chunk:
                            if not first_audio_sent:
                                print(f"  [WS] First audio chunk out after {time.time() - start_time:.2f}s (Buffer: \"{chunk}\")")
                                first_audio_sent = True
                            await tts_queue.put(chunk)
                        sentence_buffer = ""


                    # Heartbeat: Keep connection alive every 5 words during long streams
                    if len(full_response.split()) % 15 == 0:
                        await safe_send_json(websocket, {"type": "heartbeat"})

                # Handle Actions AFTER the LLM stream has fully completed
                if intent_result == "action" or intent_result == "action.":
                    print("  [WS] Intent confirmed as ACTION. Processing...")
                    
                    # Map the Grand Router payload to the format expected by actions.handle
                    action_data = {
                        "action_type": grand_route.get("Task", "unknown"),
                        "action_description": grand_route.get("Action_Description", corrected_message),
                        "arguments": {}, # You can enhance prompt to parse arguments later if needed
                        "requires_approval": grand_route.get("Permission", "required") == "required"
                    }
                    
                    action_result = await actions.handle(action_data)
                    
                    # SENSITIVE ACTION: Pause for user approval if required
                    if action_result.get("status") == "pending_approval":
                        await safe_send_json(websocket, {
                            "type": "approval_required",
                            "action_type": action_result["action_type"],
                            "description": action_result["message"],
                            "is_risky": action_result.get("is_risky", False)
                        })
                        
                        print(f"  [WS] Waiting for approval: \"{action_data.get('action_description')}\"")
                        # Wait for approval response from frontend, ignoring non-approval messages
                        try:
                            async def wait_for_approval():
                                while True:
                                    data = await websocket.receive_text()
                                    payload = json.loads(data)
                                    if payload.get("type") == "action_approval":
                                        return payload
                                    print("  [WS] Ignoring non-approval message during wait phase")

                            approval_payload = await asyncio.wait_for(wait_for_approval(), timeout=120.0)
                            
                            if approval_payload.get("approved"):
                                print("  [WS] User APPROVED action. Executing via MCP...")
                                # Execute the tool since approved
                                tool_result = await actions.mcp.execute(
                                    action_result["action_type"], 
                                    action_data.get("arguments", {})
                                )
                                action_result["status"] = "completed"
                                action_result["message"] = str(tool_result)
                                
                                await safe_send_json(websocket, {
                                    "type": "action_result",
                                    "status": "completed",
                                    "result": str(tool_result)
                                })
                            else:
                                print("  [WS] User CANCELLED action.")
                                await safe_send_json(websocket, {
                                    "type": "action_result",
                                    "status": "cancelled",
                                    "message": "Action cancelled by user."
                                })
                                action_result["status"] = "cancelled"
                        except asyncio.TimeoutError:
                            print("  [WS] Approval timed out.")
                            action_result["status"] = "timeout"
                    elif action_result.get("status") == "completed":
                        # Action already executed (no approval needed)
                        await safe_send_json(websocket, {
                            "type": "action_result",
                            "status": "completed",
                            "result": action_result["message"]
                        })
                    
                    # Final task logging
                    from brain.guardrails import process_filter
                    filter_result = process_filter(
                        intent="action", 
                        user_message=user_message, 
                        ai_response=full_response, 
                        action_data=action_data
                    )
                    
                    await safe_send_json(websocket, {
                        "type": "metadata",
                        "intent": "action",
                        "output_type": "task",
                        "task_file": filter_result["task_file"]
                    })


                # Flush any remaining text and signal worker to stop
                final_chunk = sentence_buffer.strip()
                if final_chunk and len(final_chunk) > 1:
                    print(f"  [DEBUG] Flushing last sentence: \"{final_chunk[:30]}...\"")
                    await tts_queue.put(final_chunk)
                
                # Ensure we don't hang if first_audio_sent was never set (e.g. very short response)
                if not first_audio_sent and final_chunk:
                     first_audio_sent = True # Signal end of first wait
                
                await tts_queue.put(None)  # Sentinel
                try:
                    # Increased timeout to 300s to handle very long paragraphs without closing prematurely
                    await asyncio.wait_for(tts_task, timeout=300.0) 
                except asyncio.TimeoutError:
                    print("  [WS] TTS Task took too long to finish (timeout 300s), cancelling.")
                    tts_task.cancel()

                # 3. Store assistant response in memory (only if we actually got a response)
                if full_response.strip():
                    print(f"  [WS] Saving response to memory ({len(full_response)} chars)")
                    memory.add_message("assistant", full_response, session_id)
                
                # Start background learning to extract facts from the turn
                if full_response.strip():
                    asyncio.create_task(learn_from_conversation(session_id, memory))
                    
                    # Convert full response to audio and save in "voices" folder
                    asyncio.create_task(tts_service.save_to_voices_folder(full_response.strip(), pilot_name, session_id))

            except Exception as e:
                print(f"  [WS] Inner Error: {e}")
                traceback.print_exc()
                await safe_send_json(websocket, {"type": "error", "message": str(e)})
            finally:
                # Signal end of stream NO MATTER WHAT
                await safe_send_json(websocket, {"type": "end"})
                duration = time.time() - start_time
                print(f"  [WS] Turn completed in {duration:.2f}s")

    except WebSocketDisconnect:
        print("  [WS] Client disconnected")
        # Ensure partial response is saved even on sudden disconnect
        if 'full_response' in locals() and full_response.strip():
            print(f"  [WS] Saving partial response to memory after disconnect")
            memory.add_message("assistant", full_response, session_id)
    except Exception as e:
        print(f"  [WS] Error: {e}")
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
        except:
            pass
