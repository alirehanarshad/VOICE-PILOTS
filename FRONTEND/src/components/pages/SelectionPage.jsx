import React, { useState, useRef, useEffect } from 'react';
import Logo from '../common/Logo';
import { User, Activity, Zap, Brain, Code2, CalendarCheck, Shield } from 'lucide-react';

import Typewriter from '../common/Typewriter';

const SelectionPage = ({ onViewChange, onSetSelectedVoice, voices }) => {
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [hoveredAgentId, setHoveredAgentId] = useState(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onloadedmetadata = null;
        audioRef.current = null;
      }
    };
  }, []);

  const handleMouseEnter = (agent) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onloadedmetadata = null;
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    setHoveredAgentId(agent.id);

    const audio = new Audio(agent.audio);
    audio.playbackRate = agent.speed || 1;
    audioRef.current = audio;

    audio.onloadedmetadata = () => {
      if (audioRef.current === audio) {
        const effectiveDuration = audio.duration / audio.playbackRate;
        setAudioDuration(effectiveDuration);
        audio.play().catch(err => {
          if (err.name !== 'AbortError') console.error("Audio playback failed:", err);
        });
      }
    };
  };

  const handleMouseLeave = () => {
    setHoveredAgentId(null);
    if (audioRef.current) {
      audioRef.current.onloadedmetadata = null;
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
  };

  const handleVoiceSelect = (voice) => {
    setSelectedVoice(voice);
    onSetSelectedVoice(voice);
  };

  const handleInitializeSync = () => {
    onViewChange('chat');
  };

  return (
    <div className="min-h-screen bg-[#020203] text-white flex flex-col items-center p-8 font-sans selection:bg-purple-500/30">
      <header className="w-full max-w-7xl flex justify-between items-center mb-24">
        <Logo onViewChange={onViewChange} />
        <div className="flex items-center gap-6">
          <button onClick={() => onViewChange('contact')} className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Support</button>
          <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <User size={18} className="text-zinc-400" />
          </div>
        </div>
      </header>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[1200px] pointer-events-none opacity-20">
        <img src="/hero_render.png" alt="Nexus Core" className="w-full h-full object-contain animate-pilot-spin blur-[80px]" />
      </div>

      <div className="text-center mb-20 max-w-5xl relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-[9px] font-black text-purple-300 uppercase tracking-[0.4em] mb-6">
          <Activity size={12} /> SECURE INTERFACE
        </div>
        <h2 className="text-4xl md:text-5xl lg:text-7xl font-black uppercase italic tracking-tighter leading-tight mb-6 whitespace-nowrap">
          Assemble Your <span className="text-indigo-500">System Core.</span>
        </h2>
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs italic">
          Sync with a specialized intelligence to amplify your cognitive reach.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-6 w-full max-w-[90rem]">
        {voices.map((v) => (
          <div
            key={v.id}
            onMouseEnter={() => handleMouseEnter(v)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleVoiceSelect(v)}
            className={`flex-1 min-w-[200px] cursor-pointer group p-8 rounded-[2.5rem] border transition-all duration-500 relative overflow-hidden ${selectedVoice?.id === v.id
              ? `${v.activeBorder} bg-zinc-900 shadow-2xl shadow-${v.color}-500/10 scale-105`
              : `border-white/5 bg-zinc-900/40 hover:border-white/20 hover:bg-zinc-900/60`
              }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${v.gradient} opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem]`} />

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="relative mb-8">
                <div className={`absolute inset-0 bg-${v.color}-500/20 blur-2xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity`} />
                <img
                  src={v.image}
                  alt={v.name}
                  className="w-24 h-24 object-cover animate-pilot-spin relative z-10 rounded-full border-2 border-white/10"
                />
              </div>

              <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-2">{v.name}</h3>

              <div className={`text-[9px] font-black uppercase tracking-widest ${v.text_color} mb-4 min-h-[3rem] flex items-center justify-center px-2 text-center`}>
                {hoveredAgentId === v.id ? (
                  <Typewriter
                    text={v.text}
                    speed={audioDuration}
                    isHovered={hoveredAgentId === v.id}
                  />
                ) : v.role}
              </div>

              <div className={`w-8 h-8 rounded-full border-2 border-white/10 flex items-center justify-center transition-all ${selectedVoice?.id === v.id ? `bg-${v.color}-500 border-${v.color}-500 shadow-lg shadow-${v.color}-500/30` : ''}`}>
                {selectedVoice?.id === v.id && <Shield size={14} className="text-white" />}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        disabled={!selectedVoice}
        onClick={handleInitializeSync}
        className="mt-20 px-20 py-6 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] disabled:opacity-5 hover:bg-zinc-200 transition-all hover:-translate-y-1 active:scale-95 shadow-xl shadow-white/5"
      >
        Initialize Secure Link
      </button>
    </div>
  );
};

export default SelectionPage;
