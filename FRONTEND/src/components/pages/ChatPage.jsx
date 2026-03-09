import * as React from 'react';
const { useState, useRef, useEffect } = React;
import { motion as Motion, AnimatePresence } from 'framer-motion';
import Logo from '../common/Logo';
import VADVisualizer from '../common/VADVisualizer';
import { float32ToWav } from '../../utils/wavHelper';
import { TenVAD } from '../../utils/ten-vad';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Clipboard, Check, Copy } from 'lucide-react';
import {
  Settings,
  Plus,
  Search,
  Mail,
  User,
  ArrowLeft,
  Volume2,
  VolumeX,
  Mic,
  Square,
  Zap,
  Sun,
  Moon,
  ShieldAlert,
  CheckCircle,
  XCircle,
  Trash2,
  Menu,
  X,
  RefreshCw,
  ChevronDown,
  FileText,
  MessageSquare,
  Send,
  Gauge,
  Cpu,
  BrainCircuit,
  Database
} from 'lucide-react';
import CONFIG from '../../config';

const ChatPage = ({
  selectedVoice,
  onViewChange,
  messages,
  setMessages,
  isRecording,
  setIsRecording,
  isProcessing,
  setIsProcessing,
  savedSessions,
  setSavedSessions,
  activeSessionId,
  setActiveSessionId,
  voices = [],
  onSetSelectedVoice
}) => {
  const [volume, setVolume] = useState(0.8);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [themeMode, setThemeMode] = useState('void');
  const [showThemeModal, setShowThemeModal] = useState(false);
  const isDarkMode = themeMode === 'void' || themeMode === 'nebula';
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  // Voice Speed Control
  const [voiceSpeed, setVoiceSpeed] = useState(1);
  const [showSpeedSlider, setShowSpeedSlider] = useState(false);

  const [isCapturing, setIsCapturing] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  const [showPuff, setShowPuff] = useState(false);
  const [inputText, setInputText] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [showAgentSelector, setShowAgentSelector] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  // --- Wake-Word & Privacy Controls ---
  const [isWakeWordEnabled, setIsWakeWordEnabled] = useState(true);
  const [isManualMicEnabled, setIsManualMicEnabled] = useState(true);
  const [isWakeWordListening, setIsWakeWordListening] = useState(false);
  const [wakeWordError, setWakeWordError] = useState(null);
  const wakeWordRecognitionRef = useRef(null);
  const isWakeWordEnabledRef = useRef(isWakeWordEnabled);
  const audioChunksRef = useRef([]);
  const tenVadRef = useRef(null);

  // TEN-VAD handles audio analysis internally via onAudioLevel callback.
  // No separate analyser useEffect needed — TEN-VAD feeds the level directly.
  useEffect(() => {
    if (!isRecording) {
      setAudioLevel(0);
    }
    // TEN-VAD's onAudioLevel callback updates audioLevel while recording
  }, [isRecording]);

  // Sync ref with state
  useEffect(() => {
    isWakeWordEnabledRef.current = isWakeWordEnabled;
  }, [isWakeWordEnabled]);

  // --- Memory State ---
  const [showMemoryPanel, setShowMemoryPanel] = useState(false);
  const [memoryData, setMemoryData] = useState({ facts: [], preferences: {} });
  const [newFact, setNewFact] = useState('');

  const fetchMemory = async () => {
    try {
      const res = await fetch(`${CONFIG.API_URL}/api/memory/`);
      if (res.ok) {
        const data = await res.json();
        setMemoryData({
          facts: data.facts || [],
          preferences: data.preferences || {}
        });
      }
    } catch (err) {
      console.error("Failed to fetch memory", err);
    }
  };

  useEffect(() => {
    fetchMemory();
  }, [activeSessionId]);

  const handleAddFact = async () => {
    if (!newFact.trim()) return;
    try {
      const res = await fetch(`${CONFIG.API_URL}/api/memory/facts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fact: newFact.trim() })
      });
      if (res.ok) {
        setNewFact('');
        fetchMemory();
      }
    } catch (err) {
      console.error("Failed to add fact", err);
    }
  };

  const handleDeleteFact = async (fact) => {
    try {
      const res = await fetch(`${CONFIG.API_URL}/api/memory/facts`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fact })
      });
      if (res.ok) fetchMemory();
    } catch (err) {
      console.error("Failed to delete fact", err);
    }
  };

  const handleDeletePreference = async (key) => {
    try {
      const res = await fetch(`${CONFIG.API_URL}/api/memory/preferences`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key })
      });
      if (res.ok) fetchMemory();
    } catch (err) {
      console.error("Failed to delete preference", err);
    }
  };

  const handleClearMemory = async () => {
    if (confirm("Are you sure you want to clear all memory? This action cannot be undone.")) {
      try {
        const res = await fetch(`${CONFIG.API_URL}/api/memory/clear`, { method: 'DELETE' });
        if (res.ok) {
          setMemoryData({ facts: [], preferences: {} });
          fetchMemory();
        }
      } catch (err) {
        console.error("Failed to clear memory", err);
      }
    }
  };

  const inputRef = useRef(null);
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  const scrollAreaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const isCancelledRef = useRef(false);
  const wsRef = useRef(null);
  const audioCtxRef = useRef(null);
  const nextStartTimeRef = useRef(0);
  const gainNodeRef = useRef(null);

  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const wordTimersRef = useRef([]); // To clear word reveal timeouts
  const thinkingAudioRef = useRef(null);
  const sourceNodesRef = useRef([]); // Track active AudioBufferSourceNodes
  const wordCountRef = useRef(0); // Track number of words synced to prevent duplicates
  const isCapturingRef = useRef(false); // Immediate sync for prevent double triggers


  // --- Wake-Word Detection Logic ---
  useEffect(() => {
    // Prime the mic access once if enabled to ensure permissions are held
    if (isWakeWordEnabled && !isCapturing && !isSpeaking && !isProcessing && !wakeWordRecognitionRef.current) {
      const timer = setTimeout(() => {
        startWakeWordDetection();
      }, 500);
      return () => clearTimeout(timer);
    } else if (!isWakeWordEnabled) {
      stopWakeWordDetection();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWakeWordEnabled, isCapturing, isSpeaking, isProcessing, selectedVoice]);
  const startWakeWordDetection = () => {
    if (wakeWordRecognitionRef.current) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported in this browser.");
      setWakeWordError("Not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false; // RESTART PATTERN: Much faster than continuous for interim results
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsWakeWordListening(true);
      setWakeWordError(null);
      wakeWordRecognitionRef.current = recognition;
      console.log(`[WakeWord] Activated. Listening for: ${selectedVoice?.name}`);
    };

    recognition.onresult = (event) => {
      // SENSITIVITY FIX: Check the very latest result (including interim) for faster response
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript.toLowerCase();
      }

      console.log(`[WakeWord] Hearing: "${transcript}"`);

      const agentName = (selectedVoice?.name || "Sofia").toLowerCase();

      // Phonetic Name Variations for each agent (keys must match voice.name.toLowerCase())
      const nameVariations = {
        'sofia': ['sofia', 'sophia', 'sofea', 'sofi', 'sophie', 'safia', 'safaya', 'sepia', 'sofia hellen', 'sofia assistant'],
        'dutch': ['dutch', 'datch', 'dach', 'dash', 'touch', 'baldur sanjin', 'dutch agent'],
        'eva': ['eva', 'ava', 'eve', 'ifa', 'iva', 'annmarie nele', 'eva agent'],
        'zoya': ['zoya', 'zoia', 'joya', 'zuya', 'zoey', 'zoya khan', 'zoya urdu'],
        'aarav': ['aarav', 'arav', 'aravv', 'arab', 'ahrav', 'aarav sharma', 'aarav hindi']
      };

      const selectedNames = nameVariations[agentName] || [agentName];

      // Build all possible trigger combinations: just "Name"
      const allTriggers = [...selectedNames];

      // INSTANT MATCH Logic:
      // Ensure we match whole words to avoid partial triggers (e.g., "Hello Zoy" matching "Hello Zoya")
      const lowerTranscript = transcript.toLowerCase().trim();
      const isMatch = allTriggers.some(trigger => {
        const lowerTrigger = trigger.toLowerCase();
        // Exact match or match with trailing space/punctuation
        const regex = new RegExp(`(^|\\s)${lowerTrigger}($|\\s|[.,!?])`, 'i');
        return regex.test(lowerTranscript);
      });

      if (isMatch) {
        console.log(`[WakeWord] MATCH DETECTED for ${agentName} with transcript: "${transcript}"`);
        playActivationSound();
        stopWakeWordDetection();
        startRecording();
      }
    };

    const playActivationSound = () => {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } catch (e) { console.error("Sound play failed", e); }
    };

    recognition.onerror = (event) => {
      console.error("[WakeWord] Error:", event.error);
      if (event.error === 'not-allowed') {
        setWakeWordError("Mic blocked");
      } else if (event.error === 'network') {
        setWakeWordError("Network error");
      } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setWakeWordError(`Err: ${event.error}`);
      }
      stopWakeWordDetection();
    };

    recognition.onend = () => {
      setIsWakeWordListening(false);
      wakeWordRecognitionRef.current = null;
      // Restart with a delay to prevent flickering or double starts
      if (isWakeWordEnabledRef.current && !isCapturingRef.current) {
        setTimeout(() => {
          if (isWakeWordEnabledRef.current && !isCapturingRef.current && !wakeWordRecognitionRef.current) {
            startWakeWordDetection();
          }
        }, 300);
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("[WakeWord] Start error:", e);
      setWakeWordError("Start fail");
    }
  };

  const stopWakeWordDetection = () => {
    if (wakeWordRecognitionRef.current) {
      wakeWordRecognitionRef.current.stop();
      wakeWordRecognitionRef.current = null;
      setIsWakeWordListening(false);
      console.log("[WakeWord] Stopped");
    }
  };

  // Resource cleanup and Global Keydown for Auto-focus
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Check if user is typing a printable character and not using a modifier key (except Shift)
      // And also check if they aren't already focusing another input/textarea
      if (
        e.key.length === 1 &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        document.activeElement.tagName !== 'INPUT' &&
        document.activeElement.tagName !== 'TEXTAREA'
      ) {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);

    // Initialize thinking sound
    // Thinking sound: only initialize if the file exists
    try {
      const thinkingAudio = new Audio('/assets/sounds/thinking.wav');
      thinkingAudio.loop = true;
      thinkingAudio.addEventListener('error', () => {
        console.warn('[Audio] thinking.wav not found, disabling thinking sound.');
        thinkingAudioRef.current = null;
      });
      thinkingAudioRef.current = thinkingAudio;
    } catch (e) {
      console.warn('[Audio] Could not initialize thinking sound:', e);
      thinkingAudioRef.current = null;
    }

    const currentStream = streamRef.current;
    const currentRecorder = mediaRecorderRef.current;

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      if (thinkingAudioRef.current) {
        thinkingAudioRef.current.pause();
        thinkingAudioRef.current = null;
      }
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
      if (currentRecorder && currentRecorder.state === 'recording') {
        currentRecorder.stop();
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
      stopWakeWordDetection();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Control thinking sound based on isThinking state
  useEffect(() => {
    if (isThinking) {
      if (thinkingAudioRef.current) {
        thinkingAudioRef.current.currentTime = 0;
        thinkingAudioRef.current.play().catch(e => console.log("Thinking sound play blocked:", e));
      }
    } else {
      if (thinkingAudioRef.current) {
        thinkingAudioRef.current.pause();
      }
    }
  }, [isThinking]);


  // Real-time volume synchronization
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      const targetVolume = isMuted ? 0 : volume;
      // Smoothly transition volume over 0.1s to avoid pops
      gainNodeRef.current.gain.setTargetAtTime(
        targetVolume,
        audioCtxRef.current.currentTime,
        0.1
      );
    }
  }, [volume, isMuted]);

  const scrollToBottom = (behavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
      // Double tap for reliability on dynamic content
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
      }, 100);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const handleScroll = () => {
    if (!scrollAreaRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
  };

  const initAudioContext = async () => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      console.log("[Audio] Initializing persistent AudioContext...");
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
      gainNodeRef.current = null;
    }
    if (!gainNodeRef.current) {
      gainNodeRef.current = audioCtxRef.current.createGain();
      gainNodeRef.current.connect(audioCtxRef.current.destination);
    }
    if (audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume();
    }
    gainNodeRef.current.gain.value = isMuted ? 0 : volume;
  };

  const startRecording = async () => {
    // Ensure AudioContext is ready on user gesture
    await initAudioContext();

    if (isCapturingRef.current) {
      console.log("[ChatPage] Blocked recording start: already capturing.");
      return;
    }

    // INTERRUPT/BARGE-IN: If AI is speaking, stop it immediately
    if (isSpeaking) {
      console.log("[ChatPage] Interrupting AI speech for new voice capture.");
      cancelAudio();
    }

    isCapturingRef.current = true;

    try {
      setIsRecording(true);
      setIsCapturing(true);
      isCapturingRef.current = true;
      isCancelledRef.current = false;

      setMessages(prev => [
        ...prev.filter(m => m.type !== 'status' || !(m.content || "").includes("Listening")),
        { role: 'system', content: `Listening with ${selectedVoice?.name || 'Assistant'}...`, type: 'status' }
      ]);

      // Initialize TEN-VAD — handles mic, energy detection, and recording internally
      const vad = new TenVAD({
        silenceTimeout: 250,
        minSpeechDuration: 300,
        maxRecordingDuration: 30000,
      });
      tenVadRef.current = vad;

      // Speech detected
      vad.onSpeechStart = () => {
        console.log('%c[TEN-VAD] 🎤 Speaking...', 'color: #00ff00; font-weight: bold;');
      };

      // Speech ended → send audio to backend
      vad.onSpeechEnd = (samples, meta) => {
        console.log(`%c[TEN-VAD] Samples ready: ${samples.length}, ${(meta.duration / 1000).toFixed(1)}s`, 'color: #ff8800; font-weight: bold;');

        if (!isCancelledRef.current) {
          // Convert Float32 samples to perfect 16kHz WAV
          const wavBlob = float32ToWav(samples, meta.sampleRate);
          console.log(`%c[WAV] Generated: ${(wavBlob.size / 1024).toFixed(1)}KB`, 'color: #00ccff;');
          SendAudioToBackend(wavBlob);
        }

        // Auto-reset UI state
        setIsRecording(false);
        setIsCapturing(false);
        isCapturingRef.current = false;
        setIsProcessing(true);
        // Cleanup VAD
        if (tenVadRef.current) {
          tenVadRef.current.stop();
          tenVadRef.current = null;
        }
      };

      // Real-time audio level for visualizer
      vad.onAudioLevel = (level) => {
        setAudioLevel(level);
      };

      // Error handling
      vad.onError = (err) => {
        console.error('[TEN-VAD] Error:', err);
        setIsRecording(false);
        setIsCapturing(false);
        isCapturingRef.current = false;
        tenVadRef.current = null;
      };

      // Start listening — returns the mic stream
      const micStream = await vad.start();
      streamRef.current = micStream;

    } catch (err) {
      console.error("Error starting TEN-VAD:", err);
      setIsRecording(false);
      setIsCapturing(false);
      isCapturingRef.current = false;
    }
  };

  const stopRecording = () => {
    if (!isCapturingRef.current) return;

    console.log("[ChatPage] stopRecording called");

    // Force TEN-VAD to end speech and send audio
    if (tenVadRef.current) {
      tenVadRef.current.forceStop();
      // forceStop triggers onSpeechEnd if speaking, which cleans up
      // If only listening (no speech detected), forceStop calls stop() directly
    }

    setIsRecording(false);
    setIsCapturing(false);
    isCapturingRef.current = false;
    setIsProcessing(true);
  };

  const cancelRecording = () => {
    isCancelledRef.current = true;

    if (tenVadRef.current) {
      tenVadRef.current.stop(); // Full stop, no audio sent
      tenVadRef.current = null;
    }

    setIsRecording(false);
    setIsCapturing(false);
    isCapturingRef.current = false;
    setIsProcessing(false);
    setMessages(prev => prev.filter(m => m.type !== 'status' || !(m.content || "").includes("Listening")));
  };

  const SendAudioToBackend = async (audioBlob) => {
    const formData = new FormData();
    // Replaced extension detection with fixed .wav
    formData.append('file', audioBlob, `command.wav`);
    formData.append('pilot', selectedVoice?.name || 'Assistant');

    try {
      console.log(`[ChatPage] Sending audio for pilot: ${selectedVoice?.name}...`);
      const response = await fetch(`${CONFIG.API_URL}/api/voice/process`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        const transcript = data.user_transcript?.trim();
        if (!transcript) {
          console.warn("[ChatPage] Empty transcript, triggering fallback voice response.");
          // Instead of just setting text, we trigger an AI response that will be spoken
          // using the existing handleSendMessageWithTranscript flow but with a dummy message
          // Or better: just play a synthesized "I didn't catch that"
          handleSendMessageWithTranscript("NO_SPEECH_DETECTED_FALLBACK_PHRASE", true);
          return;
        }
        console.log(`[ChatPage] Transcription received: "${transcript}"`);
        handleSendMessageWithTranscript(transcript, true);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Backend communication failed");
      }
    } catch (err) {
      console.error("Error sending audio:", err);
      setMessages(prev => {
        const filtered = prev.filter(m => m.type !== 'status');
        return [
          ...filtered,
          { role: 'assistant', content: `Error: ${err.message}` }
        ];
      });
      setIsProcessing(false);
      setIsThinking(false);
      setMessages(prev => prev.filter(m => m.type !== 'status' || !(m.content || "").includes("Listening")));
    }
  };



  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;

    // Trigger paper plane animation
    setIsFlying(true);
    setShowPuff(true);
    setTimeout(() => setIsFlying(false), 600);
    setTimeout(() => setShowPuff(false), 500);

    const userMessage = inputText.trim();
    setInputText('');

    // Ensure AudioContext is ready on user gesture
    await initAudioContext();

    handleSendMessageWithTranscript(userMessage);
  };

  const handleSendMessageWithTranscript = async (userMessage, fromVoice = false) => {
    console.log(`[ChatPage] --- START handleSendMessageWithTranscript ---`);
    console.log(`[ChatPage] Message: "${userMessage}", isProcessing: ${isProcessing}, fromVoice: ${fromVoice}`);

    try {
      if (!userMessage || !userMessage.trim()) {
        console.warn("[ChatPage] Empty message, aborting.");
        return;
      }

      // Check for active Security Checkpoint FIRST using the latest messages ref
      const activeCheckpoint = messagesRef.current.find(m => m.approvalRequired);
      if (activeCheckpoint) {
        const msgLower = userMessage.toLowerCase().trim();
        const authorizeKeywords = ['authorize', 'yes', 'approve', 'confirm', 'do it'];
        const denyKeywords = ['deny', 'deny access', 'no', 'cancel', 'stop', 'abort'];

        const isAuthorize = authorizeKeywords.some(kw => msgLower.includes(kw));
        const isDeny = denyKeywords.some(kw => msgLower.includes(kw));

        if (isAuthorize && !isDeny) {
          console.log("[ChatPage] Voice authorized checkpoint.");
          // Send approval to websocket
          if (wsRef.current) wsRef.current.send(JSON.stringify({ type: 'action_approval', approved: true }));
          // Update the message state to remove the modal and mark as executing
          setMessages(prev => {
            const updated = prev.map(msg => msg === activeCheckpoint ? { ...msg, approvalRequired: false, actionStatus: 'executing' } : msg);
            return [...updated.filter(m => m.type !== 'status'), { role: 'user', content: userMessage }, { role: 'system', content: 'Action authorized via voice command.', type: 'status' }];
          });
          // Remove the status message after a short delay
          setTimeout(() => setMessages(prev => prev.filter(m => m.type !== 'status' || m.content !== 'Action authorized via voice command.')), 3000);
          setIsProcessing(false);
          setIsThinking(false);
          return;
        } else if (isDeny) {
          console.log("[ChatPage] Voice denied checkpoint.");
          // Send denial to websocket
          if (wsRef.current) wsRef.current.send(JSON.stringify({ type: 'action_approval', approved: false }));
          // Update the message state to remove the modal and mark as cancelled
          setMessages(prev => {
            const updated = prev.map(msg => msg === activeCheckpoint ? { ...msg, approvalRequired: false, actionStatus: 'cancelled' } : msg);
            return [...updated.filter(m => m.type !== 'status'), { role: 'user', content: userMessage }, { role: 'system', content: 'Action denied via voice command.', type: 'status' }];
          });
          // Remove the status message after a short delay
          setTimeout(() => setMessages(prev => prev.filter(m => m.type !== 'status' || m.content !== 'Action denied via voice command.')), 3000);
          setIsProcessing(false);
          setIsThinking(false);
          return;
        } else {
          console.log("[ChatPage] Checkpoint active. Voice input ignored.");
          // Block normal message processing and show warning
          setMessages(prev => {
            const filtered = prev.filter(m => m.type !== 'status' || m.content !== 'Awaiting authorization. Please say "Authorize" or "Deny access".');
            return [...filtered, { role: 'system', content: 'Awaiting authorization. Please say "Authorize" or "Deny access".', type: 'status' }];
          });
          setTimeout(() => setMessages(prev => prev.filter(m => m.type !== 'status' || m.content !== 'Awaiting authorization. Please say "Authorize" or "Deny access".')), 3000);
          setIsProcessing(false);
          setIsThinking(false);
          return;
        }
      }

      if (isProcessing && !fromVoice) {
        console.warn("[ChatPage] Already processing, block message.");
        return;
      }
      // Step 1: Show the user's transcript in the chat FIRST (before LLM)
      setMessages(prev => {
        const filtered = prev.filter(m => m.type !== 'status');
        if (userMessage === "NO_SPEECH_DETECTED_FALLBACK_PHRASE") return filtered;
        const isDuplicate = filtered.some(m => m.role === 'user' && m.content === userMessage);
        if (isDuplicate) return filtered;
        return [...filtered, { role: 'user', content: userMessage }];
      });

      // Step 2: If from voice, pause briefly so user can SEE their transcript 
      // before the AI starts processing
      if (fromVoice) {
        console.log("[ChatPage] Transcript displayed → waiting before LLM...");
        await new Promise(resolve => setTimeout(resolve, 600));
      }

      // Step 3: NOW transition to Processing/Thinking state
      console.log("[ChatPage] Transitioning to Processing state...");
      setIsProcessing(true);
      setIsThinking(true);
      setIsSpeaking(false);

      console.log("[ChatPage] Ensuring AudioContext is active...");
      await initAudioContext();
      nextStartTimeRef.current = 0;
      wordCountRef.current = 0; // Reset sync count for new message
      wordTimersRef.current.forEach(clearTimeout); // Clear any stray timers
      wordTimersRef.current = [];


      // Initialize WebSocket for streaming
      console.log("[ChatPage] Closing existing WebSocket if any...");
      if (wsRef.current) wsRef.current.close();

      console.log(`[WS] Connecting to ${CONFIG.WS_URL}/api/ws/stream for ${selectedVoice?.name}...`);
      const ws = new WebSocket(`${CONFIG.WS_URL}/api/ws/stream`);
      wsRef.current = ws;

      // Add connecting status
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Connecting to stream...', type: 'status' }
      ]);

      const currentMsgId = Date.now() + Math.random().toString(36).substring(7);

      // Add empty assistant message for streaming
      setMessages(prev => [
        ...prev.filter(m => m.type !== 'status' || !(m.content || "").includes("Connecting")),
        {
          id: currentMsgId,
          role: 'assistant',
          content: '',
          rawContent: '',
          syncedContent: '',
          isStreaming: true,
          intent: 'conversation',
          output_type: 'response'
        }
      ]);

      ws.onopen = () => {
        ws.send(JSON.stringify({
          message: userMessage,
          pilot: selectedVoice?.name || 'Sofia',
          session_id: activeSessionId || 'default'
        }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'heartbeat') {
          // console.log("[WS] Heartbeat received");
          return;
        }

        if (data.type === 'text_delta') {
          // Optimization: First text token clears thinking state immediately
          setIsThinking(false);
          setIsProcessing(false); // Signal that we are now receiving the response

          // Store text delta in rawContent, not content, to prevent early reveal
          setMessages(prev => prev.map(msg => {
            if (msg.id === currentMsgId) {
              return { ...msg, rawContent: (msg.rawContent || "") + data.content, isStreaming: true };
            }
            return msg;
          }));
        } else if (data.type === 'corrected_text') {
          setIsThinking(false); // Brain finished first routing step
          setMessages(prev => {
            const newMessages = [...prev];
            // Find the most recent user message and update it
            for (let i = newMessages.length - 1; i >= 0; i--) {
              if (newMessages[i].role === 'user') {
                newMessages[i].content = data.content;
                break;
              }
            }
            // Also update intent intent state if needed for assistant msg
            const index = newMessages.findIndex(m => m.id === currentMsgId);
            if (index !== -1) {
              newMessages[index].intent = data.intent;
            }
            return newMessages;
          });
        } else if (data.type === 'metadata') {
          setMessages(prev => prev.map(msg => {
            if (msg.id === currentMsgId) {
              return {
                ...msg,
                intent: data.intent,
                output_type: data.output_type,
                task_file: data.task_file
              };
            }
            return msg;
          }));
        } else if (data.type === 'approval_required') {
          // Pause and show approval UI
          console.log("[ChatPage] Security Checkpoint triggered! Stopping background audio...");
          stopGenerating(); // Immediately halt any speaking so agent doesn't talk over the checkpoint

          setMessages(prev => prev.map(msg => {
            if (msg.id === currentMsgId) {
              return {
                ...msg,
                approvalRequired: true,
                actionDescription: data.description,
                actionType: data.action_type,
                isRisky: data.is_risky
              };
            }
            return msg;
          }));
        } else if (data.type === 'action_result') {
          // Update message with execution result
          setMessages(prev => prev.map(msg => {
            if (msg.id === currentMsgId) {
              return {
                ...msg,
                approvalRequired: false,
                actionStatus: data.status,
                actionMessage: data.message || data.result
              };
            }
            return msg;
          }));
        } else if (data.type === 'audio') {
          queueAudioChunk(data.data, data.sample_rate, data.words, currentMsgId);
        } else if (data.type === 'end') {
          setIsProcessing(false);
          setIsThinking(false); // Safety: ensure thinking is cleared even if no audio/text arrived

          // FINAL SYNC: On end, if we haven't synced all content, do it now
          setMessages(prev => prev.map(msg => {
            if (msg.id === currentMsgId) {
              if (msg.rawContent && (!msg.content || msg.content.length < msg.rawContent.length)) {
                return { ...msg, content: msg.rawContent, syncedContent: msg.rawContent, isStreaming: false };
              }
              return { ...msg, isStreaming: false };
            }
            return msg;
          }));
        }
        else if (data.type === 'error') {
          console.error("WS Error:", data.message);
          setIsProcessing(false);
          setIsThinking(false);
          setIsSpeaking(false);
        }

      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        setIsProcessing(false);
        setIsThinking(false);
        setIsSpeaking(false);
      };

      ws.onclose = (event) => {
        console.log(`[WS] Connection closed for ID ${currentMsgId}: ${event.code} ${event.reason}`);

        // Only reset isProcessing if this IS the current active stream
        if (wsRef.current === ws) {
          setIsProcessing(false);
          setIsThinking(false);
          setIsSpeaking(false);
        }

        // Single setMessages call to avoid race condition from double setState
        setMessages(prev => {
          let newMessages = [...prev];
          const index = newMessages.findIndex(m => m.id === currentMsgId);
          if (index !== -1) {
            const msg = { ...newMessages[index] };

            // FLUSH: Ensure synced content matches raw content on close
            if (msg.rawContent && (!msg.content || msg.content.length < msg.rawContent.length)) {
              msg.content = msg.rawContent;
              msg.syncedContent = msg.rawContent;
            }

            msg.isStreaming = false;

            // CLEANUP: If the message is empty after streaming/syncing, remove it to prevent ghost bubbles
            if (!msg.content && !msg.rawContent) {
              newMessages.splice(index, 1);
            } else {
              newMessages[index] = msg;
            }
          }
          // Also clear status messages in the same update
          return newMessages.filter(m => m.type !== 'status');
        });
      };
    } catch (err) {
      console.error("[ChatPage] FATAL ERROR in handleSendMessageWithTranscript:", err);
      setIsProcessing(false);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `Fatal Error: ${err.message}`, type: 'error' }
      ]);
    }
  };

  const queueAudioChunk = (base64Data, sampleRate, wordsMetadata = [], targetMsgId) => {
    const audioCtx = audioCtxRef.current;
    if (!audioCtx || audioCtx.state === 'closed') return;

    if (audioCtx.state === 'suspended') audioCtx.resume();

    try {
      if (gainNodeRef.current) {
        const targetVolume = isMuted ? 0 : volume;
        gainNodeRef.current.gain.setTargetAtTime(targetVolume, audioCtx.currentTime, 0.05);
      }

      const binaryString = window.atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      console.log(`[Audio] Received chunk: ${base64Data.length} chars, format=wav/mp3`);

      audioCtx.decodeAudioData(bytes.buffer, (buffer) => {
        console.log(`[Audio] Decode SUCCESS: ${buffer.duration.toFixed(2)}s, ${buffer.sampleRate}Hz`);
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.playbackRate.value = voiceSpeed;
        source.connect(gainNodeRef.current || audioCtx.destination);

        sourceNodesRef.current.push(source);
        source.onended = () => {
          sourceNodesRef.current = sourceNodesRef.current.filter(n => n !== source);
          if (audioCtxRef.current && audioCtxRef.current.currentTime >= nextStartTimeRef.current - 0.1) {
            setIsSpeaking(false);
          }
        };

        const now = audioCtx.currentTime;
        const isFirstChunk = (nextStartTimeRef.current <= now);
        setIsThinking(false);

        const LEAD_TIME = isFirstChunk ? 0.05 : 0.00;
        const startAt = Math.max(now + LEAD_TIME, nextStartTimeRef.current);
        source.start(startAt);
        const chunkDuration = buffer.duration / voiceSpeed;
        nextStartTimeRef.current = startAt + chunkDuration;

        wordsMetadata.forEach(word => {
          const relativeOffset = word.offset / voiceSpeed;
          const absoluteStartTime = startAt + relativeOffset;
          const delayMs = (absoluteStartTime - now) * 1000;

          if (delayMs > 0) {
            const timer = setTimeout(() => {
              setMessages(prev => {
                const index = prev.findIndex(m => m.id === targetMsgId);
                if (index !== -1 && prev[index].role === 'assistant') {
                  const newMessages = [...prev];
                  const msg = { ...newMessages[index] };
                  if (!msg.syncedContent) msg.syncedContent = "";
                  const currentText = msg.syncedContent || "";
                  const nextWord = word.text;
                  const needsSpace = currentText && !currentText.endsWith(" ") && !currentText.endsWith("\n");
                  const updatedContent = currentText + (needsSpace ? " " : "") + nextWord;
                  msg.syncedContent = updatedContent;
                  msg.content = updatedContent;
                  wordCountRef.current += 1;
                  newMessages[index] = msg;
                  return newMessages;
                }
                return prev;
              });
            }, delayMs);
            wordTimersRef.current.push(timer);
          }
        });

        setIsSpeaking(true);
      }, (err) => console.error("[Audio] Decode Error:", err));
    } catch (e) {
      console.error("[Audio] FATAL exception in queueAudioChunk:", e);
    }
  };

  const stopGenerating = () => {
    console.log("[ChatPage] Force stopping generation...");
    isCancelledRef.current = true;

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Stop all active and queued audio sources
    if (sourceNodesRef.current) {
      sourceNodesRef.current.forEach(node => {
        try { node.stop(); } catch (e) { console.log("Source stop error:", e); }
      });
      sourceNodesRef.current = [];
    }

    // Clear all scheduled word reveals
    if (wordTimersRef.current) {
      wordTimersRef.current.forEach(timer => clearTimeout(timer));
      wordTimersRef.current = [];
    }

    // Reset synchronization refs
    nextStartTimeRef.current = 0;
    wordCountRef.current = 0;

    setIsProcessing(false);
    setIsSpeaking(false);
    setIsThinking(false);

    // 4. Mark the last message as no longer streaming
    // 4. Mark any currently streaming assistant messages as no longer streaming
    setMessages(prev => prev.map(msg =>
      msg.role === 'assistant' && msg.isStreaming ? { ...msg, isStreaming: false } : msg
    ));
  };

  const handleMicAction = () => {
    // If AI is talking or thinking, make the Motion.button act as a STOP button
    if (isSpeaking || isProcessing) {
      stopGenerating();
      return;
    }

    if (isCapturing) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleGuardrailDecision = (messageRef, decision) => {
    setMessages(prev => prev.map((msg) => {
      if (msg === messageRef) {
        return { ...msg, status: decision === 'approve' ? 'authorized' : 'blocked' };
      }
      return msg;
    }));

    console.log(`Guardrail decision: ${decision}`);

    if (decision === 'approve') {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: "Action executed successfully. I've updated the records." }
        ]);
      }, 1000);
    }
  };

  const CodeBlock = ({ code, language }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className="code-block-container my-4">
        <div className="code-block-header">
          <span>{language || 'code'}</span>
          <button onClick={handleCopy} className={`copy-button ${copied ? 'copied' : ''}`}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy code'}</span>
          </button>
        </div>
        <SyntaxHighlighter
          language={language || 'text'}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            borderRadius: '0 0 0.75rem 0.75rem',
            padding: '1.25rem',
            fontSize: '0.85rem',
            background: '#0d0d0d',
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    );
  };

  const formatMessage = (content, isAssistant = false, syncedContent = "") => {
    if (typeof content !== 'string') return content;

    return (
      <div className="prose-chat">
        {renderFormattedParts(content, isAssistant, syncedContent)}
      </div>
    );
  };

  const renderFormattedParts = (content, isAssistant = false, syncedContent = "") => {
    // Detect Code Blocks
    const regex = /```(\w*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      const textBefore = content.substring(lastIndex, match.index);
      if (textBefore) parts.push({ type: 'text', content: textBefore });
      parts.push({ type: 'codeblock', language: match[1], code: match[2].trim() });
      lastIndex = regex.lastIndex;
    }

    const remainingText = content.substring(lastIndex);
    if (remainingText) parts.push({ type: 'text', content: remainingText });

    // Track total words processed across all text parts for highlighting
    let totalWordCounter = 0;
    const syncedWordCount = (syncedContent || "").split(/\s+/).filter(w => w.length > 0).length;

    return parts.map((part, i) => {
      if (part.type === 'codeblock') {
        return <CodeBlock key={i} code={part.code} language={part.language} />;
      }

      // Handle Lists, Bold, Italic, and Inline Code
      const lines = part.content.split('\n');
      let renderedLines = [];
      let currentList = null;
      let listType = null;
      // Formatting for Bold, Italic, and Inline Code with word-level highlighting support
      const formatText = (txt) => {
        let segments = [{ type: 't', val: txt }];

        // Bold (**text**)
        segments = segments.flatMap(s => s.type === 't' ? s.val.split(/(\*\*.*?\*\*)/).map(v => v.startsWith('**') && v.endsWith('**') ? { type: 'b', val: v.slice(2, -2) } : { type: 't', val: v }) : s);
        // Italic (*text*)
        segments = segments.flatMap(s => s.type === 't' ? s.val.split(/(\*.*?\*)/).map(v => v.startsWith('*') && v.endsWith('*') ? { type: 'i', val: v.slice(1, -1) } : { type: 't', val: v }) : s);
        // Inline Code (`code`)
        segments = segments.flatMap(s => s.type === 't' ? s.val.split(/(`.*?`)/).map(v => v.startsWith('`') && v.endsWith('`') ? { type: 'c', val: v.slice(1, -1) } : { type: 't', val: v }) : s);

        return segments.map((s, idx) => {
          const content = s.val;
          const words = content.split(/(\s+)/); // Keep spaces for accurate rendering

          const renderedWords = words.map((word, wIdx) => {
            if (word.trim().length === 0) return word;

            totalWordCounter++;
            const isHighlighted = !isAssistant || totalWordCounter <= syncedWordCount;

            const className = isAssistant
              ? `transition-all duration-300 ${isHighlighted
                ? 'text-white font-bold opacity-100 [text-shadow:0_0_12px_rgba(255,255,255,0.4)]'
                : 'text-zinc-500/70 opacity-70'}`
              : '';

            return (
              <span key={`${idx}-${wIdx}`} className={className}>
                {word}
              </span>
            );
          });

          if (s.type === 'b') return <strong key={idx}>{renderedWords}</strong>;
          if (s.type === 'i') return <em key={idx}>{renderedWords}</em>;
          if (s.type === 'c') return <code key={idx}>{renderedWords}</code>;
          return <span key={idx}>{renderedWords}</span>;
        });
      };

      lines.forEach((line, index) => {
        const trimmedLine = line.trim();

        // Match bullet points
        const ulMatch = trimmedLine.match(/^[-*•]\s+(.*)/);
        // Match numbered lists
        const olMatch = trimmedLine.match(/^(\d+)[.)]\s+(.*)/);

        if (ulMatch) {
          if (listType !== 'ul') {
            if (currentList) renderedLines.push(currentList);
            currentList = { type: 'ul', items: [] };
            listType = 'ul';
          }
          currentList.items.push(formatText(ulMatch[1]));
        } else if (olMatch) {
          const startNum = parseInt(olMatch[1]);
          if (listType !== 'ol') {
            if (currentList) renderedLines.push(currentList);
            currentList = { type: 'ol', items: [], start: startNum };
            listType = 'ol';
          }
          currentList.items.push(formatText(olMatch[2]));
        } else {
          if (currentList) {
            renderedLines.push(currentList);
            currentList = null;
            listType = null;
          }
          if (trimmedLine) {
            renderedLines.push({ type: 'p', content: formatText(trimmedLine) });
          } else if (index < lines.length - 1) {
            renderedLines.push({ type: 'br' });
          }
        }
      });

      if (currentList) renderedLines.push(currentList);

      return (
        <React.Fragment key={i}>
          {renderedLines.map((rl, j) => {
            if (rl.type === 'p') return <p key={j}>{rl.content}</p>;
            if (rl.type === 'br') return <div key={j} className="h-2" />;
            if (rl.type === 'ul') return (
              <ul key={j}>
                {rl.items.map((item, k) => <li key={k}>{item}</li>)}
              </ul>
            );
            if (rl.type === 'ol') return (
              <ol key={j} start={rl.start}>
                {rl.items.map((item, k) => <li key={k}>{item}</li>)}
              </ol>
            );
            return null;
          })}
        </React.Fragment>
      );
    });
  };



  const toggleMute = () => {
    setIsMuted(!isMuted);
    setShowVolumeSlider(true);
  };

  const toggleTheme = () => setShowThemeModal(true);

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to delete all session history? This action cannot be undone.")) {
      setSavedSessions([]);
    }
  };

  const handleNewConversation = () => {
    setShowAgentSelector(true);
  };

  const startNewConversation = (agent) => {
    if (messages.length > 0) {
      const newSession = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        title: messages[0].content.substring(0, 30) + (messages[0].content.length > 30 ? '...' : ''),
        messages: [...messages]
      };
      setSavedSessions(prev => [newSession, ...prev]);
    }

    // Switch the agent
    if (agent && onSetSelectedVoice) {
      onSetSelectedVoice(agent);
    }

    setMessages([]);
    setActiveSessionId(Date.now().toString());
    setShowAgentSelector(false);
  };

  const handleLoadSession = (session) => {
    setMessages(session.messages);
    setActiveSessionId(session.id);
  };

  return (
    <div className={`flex h-screen overflow-hidden font-inter theme-${themeMode} ${isDarkMode ? 'dark bg-[#020203] text-white' : 'bg-white text-zinc-900'} transition-all duration-700`}>
      <aside className={`border-r-2 flex flex-col transition-all duration-500 overflow-hidden ${isSidebarVisible ? 'w-80 opacity-100' : 'w-0 opacity-0 border-none'
        } ${isDarkMode ? 'bg-zinc-900/50 border-white/5' : 'bg-zinc-50 border-zinc-100'}`}>
        <div className={`h-20 px-6 flex items-center justify-between border-b transition-colors duration-500 ${isDarkMode ? 'border-white/5' : 'border-zinc-100'}`}>
          <Logo onViewChange={onViewChange} />
        </div>

        <div className="flex-1 flex flex-col p-6 overflow-hidden">
          {/* ── MEMORY MANAGER SECTION ── */}
          <div className="mb-4">
            <button
              onClick={() => setShowMemoryPanel(!showMemoryPanel)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 group ${isDarkMode
                ? 'bg-zinc-800/50 text-indigo-400 hover:bg-indigo-500/10 border border-white/5 hover:border-indigo-500/40'
                : 'bg-zinc-50 text-indigo-600 hover:bg-indigo-50 border border-zinc-200 hover:border-indigo-300'
                }`}
            >
              <div className="flex items-center gap-2">
                <BrainCircuit size={14} className={`transition-transform duration-500 ${showMemoryPanel ? 'rotate-12 scale-110' : 'group-hover:rotate-12'}`} />
                <span>Memory Engine</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[9px] px-2 py-0.5 rounded-lg font-mono ${isDarkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-600'
                  }`}>{memoryData.facts.length + Object.keys(memoryData.preferences).length}</span>
                <ChevronDown size={14} className={`transition-transform duration-500 ${showMemoryPanel ? 'rotate-180' : ''}`} />
              </div>
            </button>

            <AnimatePresence>
              {showMemoryPanel && (
                <Motion.div
                  initial={{ height: 0, opacity: 0, y: -10 }}
                  animate={{ height: "auto", opacity: 1, y: 0 }}
                  exit={{ height: 0, opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  className="overflow-hidden"
                >
                  <div className={`mt-3 rounded-2xl border p-4 space-y-4 backdrop-blur-xl shadow-2xl ${isDarkMode ? 'bg-zinc-900/80 border-white/10 shadow-black/40' : 'bg-white/80 border-zinc-200 shadow-zinc-200/50'
                    }`}>
                    {/* Add a fact */}
                    <div className="flex gap-2">
                      <input
                        value={newFact}
                        onChange={e => setNewFact(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddFact()}
                        placeholder="Commit to memory..."
                        className={`flex-1 text-[11px] px-4 py-2.5 rounded-xl border outline-none transition-all ${isDarkMode ? 'bg-black/40 border-white/10 text-white placeholder-zinc-600 focus:border-indigo-500/50' : 'bg-white border-zinc-200 text-zinc-800 focus:border-indigo-400'
                          }`}
                      />
                      <button
                        onClick={handleAddFact}
                        className="px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20"
                      >Add</button>
                    </div>

                    {/* Facts list */}
                    {memoryData.facts.length > 0 && (
                      <div className="space-y-3">
                        <p className={`text-[9px] uppercase font-black tracking-[0.3em] pl-1 ${isDarkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>Synaptic Logs</p>
                        <div className="space-y-1.5 max-h-52 overflow-y-auto custom-scrollbar pr-1">
                          {memoryData.facts.map((fact, i) => (
                            <Motion.div
                              key={i}
                              initial={{ x: -10, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: i * 0.05 }}
                              className={`flex items-start gap-3 group px-3 py-2.5 rounded-xl border border-transparent transition-all ${isDarkMode ? 'hover:bg-white/5 hover:border-white/5' : 'hover:bg-zinc-50 hover:border-zinc-100'
                                }`}
                            >
                              <div className={`mt-1.5 w-1 h-1 rounded-full shrink-0 ${isDarkMode ? 'bg-indigo-500/40' : 'bg-indigo-400/40'}`} />
                              <span className={`flex-1 text-[11px] leading-relaxed font-medium ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>{fact}</span>
                              <button onClick={() => handleDeleteFact(fact)}
                                className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-500 transition-all p-1 hover:bg-rose-500/10 rounded-lg">
                                <Trash2 size={12} />
                              </button>
                            </Motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Preferences list */}
                    {Object.keys(memoryData.preferences).length > 0 && (
                      <div className="space-y-3">
                        <p className={`text-[9px] uppercase font-black tracking-[0.3em] pl-1 ${isDarkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>Pattern Matrix</p>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                          {Object.entries(memoryData.preferences).map(([k, v], i) => (
                            <Motion.div
                              key={k}
                              initial={{ x: -10, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: (memoryData.facts.length + i) * 0.05 }}
                              className={`flex flex-col gap-1 group px-4 py-3 rounded-xl border ${isDarkMode ? 'bg-black/20 border-white/5 hover:border-indigo-500/20' : 'bg-zinc-50/50 border-zinc-100 hover:border-indigo-200'} transition-all`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500">{k}</span>
                                <button onClick={() => handleDeletePreference(k)}
                                  className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-500 transition-all">
                                  <X size={12} />
                                </button>
                              </div>
                              <span className={`text-[11px] leading-relaxed font-medium ${isDarkMode ? 'text-zinc-200' : 'text-zinc-700'}`}>{v}</span>
                            </Motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {memoryData.facts.length === 0 && Object.keys(memoryData.preferences).length === 0 && (
                      <div className="py-8 text-center space-y-2">
                        <Database size={20} className={`mx-auto opacity-20 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`} />
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>Matrix Empty</p>
                      </div>
                    )}

                    {/* Clear All */}
                    <button onClick={handleClearMemory}
                      className={`w-full text-[10px] font-black py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${isDarkMode ? 'text-rose-400 hover:bg-rose-500/10 border border-rose-500/20' : 'text-rose-500 hover:bg-rose-50 border border-rose-200'
                        }`}>
                      <Trash2 size={12} /> Clear Neural Bank
                    </button>
                  </div>
                </Motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* ─────────────────────────── */}
          <button
            onClick={() => {
              try {
                const ctx = audioCtxRef.current || new (window.AudioContext || window.webkitAudioContext)();
                if (ctx.state === 'suspended') ctx.resume();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                gain.gain.setValueAtTime(0, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
                gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
                osc.start();
                osc.stop(ctx.currentTime + 0.3);
                console.log("[AudioDebug] Test Tone played, State:", ctx.state);
              } catch (e) {
                console.error("[AudioDebug] Failed:", e);
              }
            }}
            className="w-full text-[8px] opacity-20 hover:opacity-100 transition-opacity mb-2 uppercase font-bold"
          >
            Force Audio Test
          </button>
          {/* ─────────────────────────── */}

          <div className="flex-1 overflow-y-auto mt-4">
            <div className="flex items-center justify-between px-2 mb-8">
              <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>Memory Bank</span>
              <div className="flex items-center gap-3">
                {savedSessions.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-rose-500/10 text-zinc-600 hover:text-rose-500' : 'hover:bg-rose-50 text-zinc-300 hover:text-rose-500'}`}
                    title="Clear All History"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <Search size={14} className={isDarkMode ? 'text-zinc-600' : 'text-zinc-300'} />
              </div>
            </div>
            <div className="space-y-2">
              {savedSessions.length > 0 ? (
                savedSessions.map(session => (
                  <div
                    key={session.id}
                    onClick={() => handleLoadSession(session)}
                    className={`flex items-center gap-4 p-4 text-[11px] font-bold rounded-2xl cursor-pointer transition-all border group ${activeSessionId === session.id
                      ? (isDarkMode ? 'bg-purple-500/10 border-purple-500/50 text-white' : 'bg-purple-50 border-purple-200 text-purple-600')
                      : (isDarkMode ? 'text-zinc-500 hover:bg-white/5 hover:text-white border-transparent hover:border-white/10' : 'text-zinc-500 hover:bg-white hover:text-black border-transparent hover:border-zinc-200')
                      }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full transition-colors ${activeSessionId === session.id ? 'bg-purple-500' : (isDarkMode ? 'bg-zinc-700 group-hover:bg-purple-500' : 'bg-zinc-300 group-hover:bg-purple-500')
                      }`} />
                    <div className="flex flex-col min-w-0">
                      <span className="truncate uppercase tracking-wider italic">{session.title}</span>
                      <span className="text-[8px] opacity-40 font-bold mt-0.5">{session.date}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">No logs found</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-4">
            <button onClick={() => onViewChange('contact')} className={`p-4 border rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${isDarkMode ? 'bg-zinc-800 border-white/10 text-zinc-400 hover:text-white' : 'bg-white border-zinc-200 text-zinc-400 hover:text-black'}`}>
              <Mail size={14} /> Contact Us
            </button>

            <div className={`p-6 rounded-[2.5rem] border transition-all duration-700 hover:scale-[1.02] holographic-sheen hover:shadow-purple-500/20 shadow-2xl flex items-center gap-5 ${isDarkMode ? 'premium-glass border-white/5' : 'premium-glass-light border-zinc-200'}`}>
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/10 shadow-xl group/prof relative">
                <img src="/profile.jpg" alt="User" className="w-full h-full object-cover transition-transform duration-700 group-hover/prof:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-black uppercase tracking-tight truncate italic ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>Ali Rehan</p>
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] leading-none mt-1.5 animate-pulse">Connected</p>
              </div>
            </div>

            <div className={`p-6 rounded-[2.5rem] border transition-all duration-700 hover:scale-[1.02] holographic-sheen hover:shadow-indigo-500/20 shadow-2xl flex items-center gap-5 ${isDarkMode ? 'premium-glass border-white/5' : 'premium-glass-light border-zinc-200'}`}>
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${selectedVoice?.gradient || 'from-zinc-400 to-zinc-600'} flex items-center justify-center text-white shadow-xl overflow-hidden border-2 border-white/10 relative animate-float`}>
                <img src={selectedVoice?.image || '/voicepilots__1.png'} alt="" className="w-10 h-10 object-contain relative z-10" />
                <div className="absolute inset-0 animate-pilot-spin opacity-20" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-black uppercase tracking-tight truncate italic ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>{selectedVoice?.name || 'Unknown'}</p>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] leading-none mt-1.5">Assistant Active</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className={`flex-1 flex flex-col relative transition-colors duration-700 ${isDarkMode ? 'bg-[#050507]' : 'bg-[#fcfcfc]'}`}>
        <header className={`h-24 border-b flex items-center justify-between px-12 backdrop-blur-3xl z-40 transition-all duration-700 ${isDarkMode ? 'border-white/5 bg-black/60 text-white' : 'border-zinc-200 bg-white/80 text-zinc-900'}`}>
          <div className="flex items-center gap-8">
            <button
              onClick={() => setIsSidebarVisible(!isSidebarVisible)}
              className={`p-3 rounded-xl transition-all ${isDarkMode ? 'hover:bg-white/5 text-zinc-400 hover:text-white' : 'hover:bg-zinc-100 text-zinc-500 hover:text-black'}`}
              title={isSidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
            >
              {isSidebarVisible ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-4">
              {!isSidebarVisible && <Logo onViewChange={onViewChange} />}
              {isRecording && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span className="text-[8px] font-mono font-bold uppercase tracking-[0.2em] text-rose-500">Sync_Active</span>
                </div>
              )}
              {isWakeWordListening && !isRecording && (
                <div
                  onClick={() => { if (wakeWordError === "Mic blocked") startWakeWordDetection(); }}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full border cursor-pointer group transition-all ${wakeWordError ? 'bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20' : 'bg-indigo-500/10 border-indigo-500/20'}`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${wakeWordError ? 'bg-rose-500' : 'bg-indigo-500'}`} />
                  <span className={`text-[8px] font-mono font-bold uppercase tracking-[0.2em] ${wakeWordError ? 'text-rose-500' : 'text-indigo-500'}`}>
                    {wakeWordError ? `${wakeWordError} (Fix)` : `Wake_Ready: ${selectedVoice?.name}`}
                  </span>
                  {!wakeWordError && (
                    <div className="flex gap-0.5 ml-1">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={`w-0.5 bg-indigo-500 animate-[bounce_1s_infinite]`} style={{ animationDelay: `${i * 0.2}s`, height: `${4 + Math.random() * 4}px` }} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 relative">
            <div className="flex items-center gap-2 mr-4 border-r border-white/10 pr-4">
              <button
                onClick={() => setIsWakeWordEnabled(!isWakeWordEnabled)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${isWakeWordEnabled ? 'bg-indigo-500 text-white' : 'bg-zinc-800 text-zinc-500'}`}
                title="Toggle Wake-Word Detection"
              >
                <Mic size={12} /> Wake: {isWakeWordEnabled ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={() => setIsManualMicEnabled(!isManualMicEnabled)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${isManualMicEnabled ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-500'}`}
                title="Toggle Manual Mic Button"
              >
                <Zap size={12} /> Button: {isManualMicEnabled ? 'VIEW' : 'HIDE'}
              </button>
            </div>
            <button onClick={() => onViewChange('landing')} className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'}`}>
              <ArrowLeft size={14} /> Back
            </button>
            <button
              onClick={handleNewConversation}
              className={`p-3 rounded-xl transition-all shadow-sm border ${isDarkMode ? 'bg-zinc-800 border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-700' : 'bg-white border-zinc-200 text-zinc-400 hover:text-black hover:bg-zinc-50'}`}
              title="Refresh Conversation"
            >
              <RefreshCw size={20} className="hover:rotate-180 transition-transform duration-500" />
            </button>
            <div className="flex items-center gap-2">
              {/* --- SPEED CONTROL --- */}
              {showSpeedSlider && (
                <div
                  className={`flex items-center gap-3 px-4 py-2 border rounded-2xl shadow-xl animate-in fade-in slide-in-from-right-4 transition-all ${isDarkMode ? 'bg-zinc-800 border-white/10' : 'bg-white border-zinc-200'}`}
                  onMouseLeave={() => setShowSpeedSlider(false)}
                >
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={voiceSpeed}
                    onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                    className={`w-24 h-1.5 rounded-lg appearance-none cursor-pointer accent-purple-500 ${isDarkMode ? 'bg-zinc-700' : 'bg-zinc-100'}`}
                  />
                  <span className={`text-[9px] font-bold w-8 transition-colors ${isDarkMode ? 'text-zinc-400' : 'text-zinc-400'}`}>{voiceSpeed}x</span>
                </div>
              )}
              <button
                onMouseEnter={() => setShowSpeedSlider(true)}
                className={`p-3 rounded-xl transition-all shadow-sm border border-transparent transition-all duration-300 ${isDarkMode ? 'bg-zinc-800 text-zinc-400 hover:text-white border-white/10' : 'bg-white border-zinc-200 text-zinc-400 hover:text-black'
                  }`}
                title="Voice Speed"
              >
                <Gauge size={20} />
              </button>

              {/* --- VOLUME CONTROL --- */}
              {showVolumeSlider && (
                <div
                  className={`flex items-center gap-3 px-4 py-2 border rounded-2xl shadow-xl animate-in fade-in slide-in-from-right-4 transition-all ${isDarkMode ? 'bg-zinc-800 border-white/10' : 'bg-white border-zinc-200'}`}
                  onMouseLeave={() => setShowVolumeSlider(false)}
                >
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      const newVol = parseFloat(e.target.value);
                      setVolume(newVol);
                      if (newVol > 0) setIsMuted(false);
                      else setIsMuted(true);
                    }}
                    className={`w-24 h-1.5 rounded-lg appearance-none cursor-pointer accent-purple-500 ${isDarkMode ? 'bg-zinc-700' : 'bg-zinc-100'}`}
                  />
                  <span className={`text-[9px] font-bold w-8 transition-colors ${isDarkMode ? 'text-zinc-400' : 'text-zinc-400'}`}>{Math.round((isMuted ? 0 : volume) * 100)}%</span>
                </div>
              )}
              <button
                onClick={toggleMute}
                onMouseEnter={() => setShowVolumeSlider(true)}
                className={`p-3 rounded-xl transition-all shadow-sm border ${isMuted
                  ? 'bg-rose-50 border-rose-100 text-rose-500'
                  : `border-transparent transition-all duration-300 ${isDarkMode ? 'bg-zinc-800 text-zinc-400 hover:text-white border-white/10' : 'bg-white border-zinc-200 text-zinc-400 hover:text-black'}`
                  }`}
              >
                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <button
                onClick={toggleTheme}
                className={`p-3.5 rounded-2xl transition-all duration-500 shadow-xl border flex items-center justify-center ${isDarkMode
                  ? 'bg-zinc-800/80 border-white/10 text-amber-400 hover:text-amber-300 hover:scale-110 active:scale-95'
                  : 'bg-white border-zinc-200 text-zinc-400 hover:text-purple-600 hover:scale-110 active:scale-95'
                  }`}
              >
                {isDarkMode ? <Sun size={20} className="animate-pulse" /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </header>

        <div
          ref={scrollAreaRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto w-full custom-scrollbar relative"
        >
          <div className="p-12 space-y-10 max-w-5xl mx-auto w-full">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-20">
                <div className={`w-48 h-48 rounded-[3.5rem] bg-gradient-to-br ${selectedVoice?.gradient || 'from-zinc-400 to-zinc-600'} mb-12 flex items-center justify-center text-white shadow-[0_0_50px_rgba(0,0,0,0.3)] relative group cursor-pointer`}>
                  <div className="absolute inset-0 rounded-[3.5rem] bg-current opacity-20 blur-2xl group-hover:opacity-40 transition-opacity duration-700" />
                  <img
                    src={selectedVoice?.image || '/voicepilots__1.png'}
                    alt={selectedVoice?.name || 'Assistant'}
                    className="w-32 h-32 object-cover animate-pilot-spin relative z-10 rounded-full border-4 border-white/20 shadow-2xl transition-pro group-hover:scale-110"
                  />
                  <div className="absolute inset-0 rounded-[3.5rem] border-4 border-white/10 animate-ping opacity-10" />
                </div>
                <h2 className={`text-7xl md:text-8xl font-outfit font-black tracking-tighter mb-8 italic uppercase leading-[0.85] animate-in fade-in slide-in-from-bottom-6 duration-1000 transition-colors ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                  Where should <br /> <span className="text-indigo-500">we begin?</span>
                </h2>
                <div className="flex flex-col items-center gap-4">
                  <div className={`px-6 py-2 rounded-full border text-[10px] font-black uppercase tracking-[0.4em] holographic-sheen ${isDarkMode ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-zinc-50 border-zinc-200 text-zinc-400'}`}>System Ready</div>
                  <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px] max-w-sm leading-relaxed opacity-60 italic">Online and ready to assist you</p>
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out`}>
                  {m.type === 'status' ? (
                    <div className="flex justify-center w-full my-6">
                      <div className={`px-6 py-2.5 rounded-full border text-[10px] font-bold uppercase tracking-[0.25em] animate-pulse flex items-center gap-3 backdrop-blur-md ${isDarkMode ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-purple-50 border-purple-100 text-purple-500'}`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-current" />
                        {m.content}
                        {m.isVAD && (
                          <div className="ml-2 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-500 text-[8px] tracking-widest border border-emerald-500/20">
                            VAD Active
                          </div>
                        )}
                      </div>
                    </div>
                  ) : m.type === 'guardrail' || m.type === 'task' ? (
                    <div className={`max-w-[85%] shadow-3xl rounded-[2.5rem] rounded-tl-none p-1 border-2 transition-all duration-700 hover:scale-[1.01] ${m.status === 'pending' || m.type === 'task' ? 'border-amber-500/30 bg-amber-500/5' :
                      m.status === 'authorized' ? 'border-emerald-500/30 bg-emerald-500/5' :
                        'border-rose-500/30 bg-rose-500/5'
                      }`}>
                      <div className={`rounded-[2.3rem] p-8 backdrop-blur-xl ${isDarkMode ? 'bg-zinc-900/90' : 'bg-white/90'}`}>
                        <div className="flex items-center gap-5 mb-8">
                          <div className={`p-4 rounded-2xl shadow-lg ${m.status === 'pending' || m.type === 'task' ? 'bg-amber-500/20 text-amber-500 shadow-amber-500/10' :
                            m.status === 'authorized' ? 'bg-emerald-500/20 text-emerald-500 shadow-emerald-500/10' :
                              'bg-rose-500/20 text-rose-500 shadow-rose-500/10'
                            }`}>
                            {m.type === 'task' ? <Zap size={28} /> :
                              m.status === 'pending' ? <ShieldAlert size={28} /> :
                                m.status === 'authorized' ? <CheckCircle size={28} /> :
                                  <XCircle size={28} />}
                          </div>
                          <div>
                            <p className={`text-[10px] font-bold uppercase tracking-[0.3em] ${m.type === 'task' ? 'text-amber-500' :
                              m.status === 'pending' ? 'text-amber-500' :
                                m.status === 'authorized' ? 'text-emerald-500' :
                                  'text-rose-500'
                              }`}>
                              {m.type === 'task' ? 'Task Session Logged' :
                                m.status === 'pending' ? 'Permission Required' :
                                  m.status === 'authorized' ? 'Action Authorized' :
                                    'Action Blocked'}
                            </p>
                            <h4 className="text-lg font-bold uppercase tracking-tight italic mt-1 bg-gradient-to-r from-current to-zinc-500 bg-clip-text text-transparent">
                              {m.type === 'task' ? 'Task Queue' : 'Operation Review'}
                            </h4>
                          </div>
                        </div>

                        <div className={`p-6 rounded-3xl mb-8 border-b-2 shadow-inner ${isDarkMode ? 'bg-black/40 border-white/5' : 'bg-zinc-50 border-zinc-100'}`}>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3 opacity-60">Proposed Action</p>
                          <p className={`text-base font-bold tracking-tight leading-relaxed ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>{m.action || m.content}</p>
                          {m.warning && (
                            <div className="mt-5 flex items-start gap-3 text-[11px] text-rose-500 font-bold bg-rose-500/5 p-4 rounded-xl border border-rose-500/10 backdrop-blur-sm">
                              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                              {m.warning}
                            </div>
                          )}
                        </div>

                        {m.type === 'guardrail' && (
                          m.status === 'pending' ? (
                            <div className="flex gap-4">
                              <button
                                onClick={() => handleGuardrailDecision(m, 'approve')}
                                className="flex-1 py-5 bg-emerald-500 text-white rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-emerald-600 hover:-translate-y-0.5 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                              >
                                Approve Access
                              </button>
                              <button
                                onClick={() => handleGuardrailDecision(m, 'deny')}
                                className="flex-1 py-5 bg-rose-500 text-white rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-rose-600 hover:-translate-y-0.5 transition-all shadow-xl shadow-rose-500/20 active:scale-95"
                              >
                                Deny Request
                              </button>
                            </div>
                          ) : (
                            <div className={`text-center py-4 rounded-2xl border border-dashed text-[11px] font-bold uppercase tracking-[0.2em] backdrop-blur-sm ${m.status === 'authorized' ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5' : 'border-rose-500/30 text-rose-500 bg-rose-500/5'
                              }`}>
                              Result: {m.status}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  ) : m.output_type === 'task' ? (
                    <div className="group relative max-w-[85%] shadow-3xl rounded-[2.5rem] rounded-tl-none p-1 border-2 border-purple-500/30 bg-purple-500/5 transition-all duration-700 hover:scale-[1.01]">
                      <div className={`rounded-[2.3rem] p-6 backdrop-blur-xl ${isDarkMode ? 'bg-zinc-900/90' : 'bg-white/90'}`}>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-500 shadow-lg shadow-purple-500/10">
                            <FileText size={20} />
                          </div>
                          <div>
                            <p className="text-[9px] font-mono font-bold uppercase tracking-[0.3em] text-indigo-500 animate-pulse">Activity Log // Status_Saved</p>
                            <h4 className="text-sm font-outfit font-black uppercase tracking-tight italic mt-0.5 bg-gradient-to-r from-indigo-500 to-blue-400 bg-clip-text text-transparent">
                              {m.task_file || 'task.txt'}
                            </h4>
                          </div>
                        </div>
                        <div className={`p-4 rounded-2xl border-b-2 shadow-inner ${isDarkMode ? 'bg-black/40 border-white/5' : 'bg-zinc-50 border-zinc-100'}`}>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 opacity-60">Task Summary</p>
                          <p className={`text-sm font-medium tracking-tight leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>{m.content}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-4 px-2">
                          <CheckCircle size={12} className="text-emerald-500" />
                          <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Stored in Memory</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    (m.role === 'user' || (m.role === 'assistant' && (m.content || m.isStreaming))) ? (
                      <div className={`group relative max-w-[85%] bubble-shadow transition-pro hover:scale-[1.01] ${m.role === 'user'
                        ? `bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white rounded-[2.5rem] rounded-tr-none px-10 py-7 text-[16px] font-bold tracking-tight leading-relaxed border-2 border-white/20 shadow-2xl shadow-purple-500/20 italic`
                        : `premium-glass stardust-bg holographic-sheen border-white/10 px-12 py-10 text-[17px] leading-8 font-medium rounded-[3rem] rounded-tl-none transition-pro shadow-2xl ${isDarkMode ? 'text-zinc-200 hover:bg-white/10 shadow-black/60' : 'bg-white/80 border-zinc-200 text-zinc-900 shadow-zinc-200/50'
                        }`
                        }`}>
                        {m.role === 'assistant' ? (
                          <div className="relative z-10">
                            {formatMessage(m.isStreaming ? (m.rawContent || "") : (m.content || ""), true, m.syncedContent || "")}
                          </div>
                        ) : (
                          formatMessage(m.content)
                        )}
                        <div className={`absolute bottom-2 right-4 opacity-0 group-hover:opacity-40 transition-opacity text-[8px] font-black uppercase tracking-widest ${m.role === 'user' ? 'text-white/40' : 'text-zinc-500'}`}>
                          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ) : null
                  )}
                </div>
              ))
            )}
            {isThinking && (
              <div className="flex justify-start">
                <div className={`px-10 py-7 rounded-[3rem] rounded-tl-none border-2 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ${isDarkMode ? 'premium-glass border-white/5 bg-white/5' : 'bg-white border-zinc-100 shadow-sm'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                    <span className={`text-[11px] font-bold uppercase tracking-[0.3em] ml-2 ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            {isProcessing && !isThinking && (

              <div className="flex justify-start">
                <div className={`px-8 py-5 rounded-full flex gap-2 items-center shadow-lg border-2 transition-colors duration-500 ${isDarkMode ? 'bg-zinc-900 border-white/5 shadow-white/5' : 'bg-white border-zinc-100 shadow-sm'}`}>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Global Action Approval Overlay */}
        {messages.some(m => m.approvalRequired) && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 backdrop-blur-xl bg-black/60">
            {messages.filter(m => m.approvalRequired).map((m, idx) => (
              <div key={idx} className="w-full max-w-lg premium-glass border-white/20 rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-500">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-4 rounded-2xl ${m.isRisky ? 'bg-rose-500/20 text-rose-500' : 'bg-amber-500/20 text-amber-500'}`}>
                    {m.isRisky ? <ShieldAlert size={32} /> : <Zap size={32} />}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">Security <span className="text-indigo-500">Checkpoint</span></h3>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Awaiting Authorization</p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                  <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-2">Requested Action</p>
                  <p className="text-white text-lg font-medium tracking-tight leading-relaxed">{m.actionDescription}</p>
                  {m.isRisky && (
                    <div className="mt-4 flex items-center gap-2 text-rose-500 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20 text-[10px] font-black uppercase tracking-widest">
                      <ShieldAlert size={14} /> High Risk Operation Identified
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      if (wsRef.current) wsRef.current.send(JSON.stringify({ type: 'action_approval', approved: false }));
                      setMessages(prev => prev.map(msg => msg === m ? { ...msg, approvalRequired: false, actionStatus: 'cancelled' } : msg));
                    }}
                    className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest transition-all border border-white/10 active:scale-95"
                  >
                    Deny access
                  </button>
                  <button
                    onClick={() => {
                      if (wsRef.current) wsRef.current.send(JSON.stringify({ type: 'action_approval', approved: true }));
                      setMessages(prev => prev.map(msg => msg === m ? { ...msg, approvalRequired: false, actionStatus: 'executing' } : msg));
                    }}
                    className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold uppercase tracking-widest shadow-lg shadow-purple-500/20 hover:scale-105 transition-all active:scale-95"
                  >
                    Authorize
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}


        <div className={`px-10 pb-4 pt-16 bg-gradient-to-t transition-all duration-700 ${isDarkMode ? 'from-[#020203] via-[#020203]/95 to-transparent' : 'from-white via-white/95 to-transparent'}`}>

          <div className="max-w-4xl mx-auto">
            <div className={`relative group transition-all duration-700 ${isRecording ? 'scale-[1.02]' : ''}`}>
              {showScrollButton && (
                <button
                  onClick={() => scrollToBottom()}
                  className="absolute -top-16 left-1/2 -translate-x-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white shadow-[0_0_30px_rgba(236,72,153,0.5)] z-50 animate-bounce active:scale-95 transition-transform"
                  title="Jump to Bottom"
                >
                  <ChevronDown size={24} strokeWidth={3} />
                </button>
              )}
              {isRecording && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-[9px] font-mono font-black uppercase tracking-[0.3em] text-rose-500 italic">Voice_Input_Active</span>
                </div>
              )}

              <div className={`flex items-end gap-5 p-4 rounded-[2.5rem] transition-all duration-700 shadow-2xl border-2 ${isRecording ? 'bg-rose-500/10 border-rose-500/30 shadow-rose-500/20 ring-4 ring-rose-500/10' :
                isDarkMode ? 'premium-glass border-white/5 focus-glow' : 'premium-glass-light border-zinc-200 focus-glow'
                }`}>
                {/* Visualizer for Voice Input */}
                {isRecording && (
                  <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-full flex justify-center pointer-events-none">
                    <VADVisualizer
                      isActive={isRecording}
                      audioLevel={audioLevel}
                      themeColor={isDarkMode ? '#818cf8' : '#6366f1'}
                    />
                  </div>
                )}
                {/* Agent Avatar Indicator */}
                <div className={`flex items-center self-center px-4 py-1.5 border-r hidden sm:flex ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}>
                  <div
                    className="relative group/avatar cursor-pointer"
                    onClick={handleNewConversation}
                    title="Start New Conversation"
                  >
                    <div className={`absolute inset-0 rounded-full blur-md opacity-30 transition-opacity group-hover/avatar:opacity-60 bg-purple-500`} />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 z-20 transition-opacity duration-300">
                      <Plus size={20} className="text-white" strokeWidth={3} />
                    </div>
                    <img
                      src={selectedVoice?.image || "https://ui-avatars.com/api/?name=Brain&background=9333ea&color=fff"}
                      alt={selectedVoice?.name || "Agent"}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white/20 relative z-10 transition-pro group-hover/avatar:scale-110 group-hover/avatar:blur-sm group-hover/avatar:opacity-40 animate-float"
                    />
                  </div>
                </div>

                <textarea
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder={isRecording ? "Listening..." : "Ask anything..."}
                  maxLength={1000}
                  className="flex-1 bg-transparent border-none focus:ring-0 outline-none py-3 px-3 text-sm font-bold tracking-tight resize-none max-h-32 custom-scrollbar placeholder:text-zinc-500 placeholder:italic"
                  rows={1}
                />

                <div className="flex gap-2 pb-1 pr-1">
                  {isRecording && (
                    <button
                      type="button"
                      onClick={cancelRecording}
                      className="p-3.5 rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all duration-300 active:scale-95 border border-rose-500/20"
                      title="Cancel Recording"
                    >
                      <X size={18} strokeWidth={3} />
                    </button>
                  )}
                  {isManualMicEnabled && (
                    <button
                      onClick={handleMicAction}
                      className={`p-3.5 rounded-2xl transition-all duration-300 active:scale-95 relative group ${isRecording
                        ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/40'
                        : isDarkMode ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white' : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'
                        }`}
                      title={isRecording ? "Stop Recording" : "Start Voice Sync"}
                      style={isRecording ? { transform: `scale(${1 + audioLevel * 0.4})` } : {}}
                    >
                      {isRecording && (
                        <div className="absolute inset-0 rounded-2xl bg-rose-400 animate-ping opacity-20 pointer-events-none" />
                      )}
                      {isRecording ? <Square size={18} fill="currentColor" /> : <Mic size={18} />}
                    </button>
                  )}

                  {(isProcessing || isSpeaking) ? (
                    <button
                      type="button"
                      onClick={stopGenerating}
                      className="p-3.5 rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-500/20 hover:scale-105 transition-all duration-500 active:scale-95 z-50"
                      title="Stop Generating"
                    >
                      <Square size={18} fill="currentColor" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputText.trim() || isProcessing}
                      className={`p-3.5 rounded-2xl transition-all duration-500 active:scale-95 relative ${inputText.trim()
                        ? 'ready-to-send text-white hover-bounce'
                        : 'bg-zinc-800 text-zinc-600 cursor-not-allowed opacity-50'
                        } overflow-visible`}
                    >
                      {showPuff && <div className="launch-puff" />}
                      <Send size={18} strokeWidth={2.5} className={isFlying ? 'animate-fly' : ''} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {
        showThemeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-black/40 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-full max-w-2xl premium-glass border-white/10 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] relative">
              <button
                onClick={() => setShowThemeModal(false)}
                className="absolute top-8 right-8 p-3 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition-all z-10"
              >
                <X size={24} />
              </button>

              <div className="p-12">
                <div className="mb-10 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-4">
                    Interface Settings
                  </div>
                  <h3 className="text-4xl font-black uppercase italic tracking-tighter text-white">System <span className="text-indigo-500">Theme</span></h3>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {[
                    { id: 'cosmos', name: 'Cosmos', desc: 'Standard Professional', color: 'bg-white', text: 'text-slate-900', accent: 'bg-indigo-500' },
                    { id: 'nova', name: 'Nova', desc: 'Vibrant & Modern', color: 'bg-pink-50', text: 'text-pink-900', accent: 'bg-pink-500' },
                    { id: 'void', name: 'Void', desc: 'Deep Cyberpunk', color: 'bg-zinc-950', text: 'text-white', accent: 'bg-purple-600' },
                    { id: 'nebula', name: 'Nebula', desc: 'Mystical Cyan', color: 'bg-cyan-950', text: 'text-cyan-50', accent: 'bg-cyan-500' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setThemeMode(t.id);
                        setShowThemeModal(false);
                      }}
                      className={`relative group p-6 rounded-[2rem] border-2 transition-all duration-500 text-left overflow-hidden ${themeMode === t.id ? 'border-purple-500 bg-purple-500/10' : 'border-white/5 bg-white/5 hover:border-white/20'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-2xl ${t.color} flex flex-col gap-1.5 p-2 items-center justify-center shadow-xl`}>
                          <div className={`w-full h-1 rounded-full ${t.accent}`} />
                          <div className={`w-2/3 h-1 rounded-full ${t.accent} opacity-40`} />
                        </div>
                        {themeMode === t.id && <CheckCircle className="text-purple-500" size={20} />}
                      </div>
                      <p className={`text-lg font-black uppercase italic tracking-tighter ${themeMode === t.id ? 'text-white' : 'text-zinc-400'}`}>{t.name}</p>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      }

      {
        showAgentSelector && (

          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-black/40 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-full max-w-4xl premium-glass border-white/10 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] relative">
              <button
                onClick={() => setShowAgentSelector(false)}
                className="absolute top-8 right-8 p-3 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition-all z-10"
              >
                <X size={24} />
              </button>

              <div className="p-12">
                <div className="mb-10 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-4">
                    Voice Selection
                  </div>
                  <h3 className="text-4xl font-black uppercase italic tracking-tighter text-white">Select Your <span className="text-indigo-500">Assistant</span></h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {voices.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => startNewConversation(v)}
                      className={`relative group p-6 rounded-[2rem] border-2 transition-all duration-500 text-center overflow-hidden flex flex-col items-center gap-4 ${selectedVoice?.id === v.id ? 'border-purple-500 bg-purple-500/10' : 'border-white/5 bg-white/5 hover:border-white/20'
                        }`}
                    >
                      <div className="relative">
                        <div className={`absolute inset-0 bg-${v.color}-500/20 blur-xl rounded-full scale-125 opacity-0 group-hover:opacity-100 transition-opacity`} />
                        <img
                          src={v.image}
                          alt={v.name}
                          className="w-16 h-16 object-cover animate-pilot-spin relative z-10 rounded-full border-2 border-white/10 group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div>
                        <p className={`text-lg font-black uppercase italic tracking-tighter ${selectedVoice?.id === v.id ? 'text-white' : 'text-zinc-400'}`}>{v.name}</p>
                        <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">{v.role}</p>
                      </div>
                      {selectedVoice?.id === v.id && (
                        <div className="absolute top-3 right-3">
                          <CheckCircle className="text-purple-500" size={16} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="mt-12 text-center opacity-40">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">Current Session: {selectedVoice?.name || 'None'}</p>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default ChatPage;
