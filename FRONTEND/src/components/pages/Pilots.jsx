import React, { useState, useRef, useEffect } from 'react';
import SharedNav from '../layout/SharedNav';
import SharedFooter from '../layout/SharedFooter';
import Typewriter from '../common/Typewriter';
import '../../App.css';
import {
    Zap,
    Sparkles,
    Brain,
    Code2,
    CalendarCheck,
    ArrowRight,
    Bot
} from 'lucide-react';

const PilotsPage = ({ onViewChange, isLoggedIn, onSetSelectedVoice, voices }) => {
    const [hoveredAgentId, setHoveredAgentId] = useState(null);
    const [audioDuration, setAudioDuration] = useState(0);
    const audioRef = useRef(null);

    // Cleanup audio on unmount
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
        // Stop current audio immediately if it exists
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.onloadedmetadata = null; // Clear listener to prevent it from firing late
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }

        setHoveredAgentId(agent.id);

        // Create new audio instance
        const audio = new Audio(agent.audio);
        audio.playbackRate = agent.speed || 1;

        // Save reference immediately to allow cleanup even before metadata loads
        audioRef.current = audio;

        // When metadata is loaded, we know the duration
        audio.onloadedmetadata = () => {
            // Check if this audio instance is still the intended one
            if (audioRef.current === audio) {
                const effectiveDuration = audio.duration / audio.playbackRate;
                setAudioDuration(effectiveDuration);
                audio.play().catch(err => {
                    // Ignore AbortError which happens naturally when pausing/resetting
                    if (err.name !== 'AbortError') {
                        console.error("Audio playback failed:", err);
                    }
                });
            }
        };
    };

    const handleMouseLeave = () => {
        setHoveredAgentId(null);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.onloadedmetadata = null;
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }
    };

    const handleSelect = (agent) => {
        onSetSelectedVoice(agent);
        if (isLoggedIn) {
            onViewChange('chat');
        } else {
            onViewChange('login');
        }
    };

    return (
        <div className="min-h-screen bg-[#020203] text-white flex flex-col font-sans selection:bg-purple-500/30 overflow-x-hidden">
            <SharedNav view="minds" onViewChange={onViewChange} isLoggedIn={isLoggedIn} onLogout={() => { }} />

            <main className="flex-1 py-32 px-6">
                <div className="max-w-7xl mx-auto relative">
                    <div className="text-center mb-24 relative">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full premium-glass border border-purple-500/20 text-[9px] font-black text-purple-300 uppercase tracking-[0.4em] mb-8 holographic-sheen">
                            <Bot size={14} className="animate-pulse" /> THE SQUAD
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.85] mb-8 bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent whitespace-nowrap">
                            Meet Your <span className="text-purple-500">Pilots.</span>
                        </h1>
                        <p className="text-zinc-500 text-lg md:text-xl max-w-2xl mx-auto font-bold uppercase tracking-[0.3em] italic opacity-80 leading-relaxed">
                            Five specialized intelligences. One unified mission. <br />
                            <span className="text-zinc-600 italic">Choose the perfect co-pilot for your neural workspace.</span>
                        </p>
                    </div>

                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[1400px] pointer-events-none opacity-10">
                        <img src="/hero_render.png" alt="Nexus Center" className="w-full h-full object-contain animate-pilot-spin blur-[100px]" />
                    </div>

                    <div className="flex flex-wrap justify-center gap-10 relative z-10">
                        {voices.map((agent) => (
                            <div
                                key={agent.id}
                                className={`w-full md:w-[45%] lg:w-[30%] p-10 overflow-hidden relative group transition-pro hover:scale-[1.02] hover:shadow-2xl hover:shadow-${agent.color}-500/10`}
                                onMouseEnter={() => handleMouseEnter(agent)}
                                onMouseLeave={handleMouseLeave}
                            >
                                <div className={`absolute inset-0 premium-glass border-2 transition-all duration-700 rounded-[3rem] ${hoveredAgentId === agent.id ? 'border-' + agent.color + '-500/40 bg-' + agent.color + '-500/5' : 'border-white/5 bg-white/[0.02] group-hover:border-white/20'}`} />
                                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none rounded-[3rem]" />

                                <div className={`absolute inset-0 bg-gradient-to-br ${agent.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[3rem]`} />

                                <div className="relative z-10 w-full flex flex-col items-center">
                                    <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-6 text-white">{agent.name}</h3>

                                    <div className="relative mb-8 group-hover:scale-110 transition-transform duration-700">
                                        <div className={`absolute inset-0 bg-${agent.color}-500/30 blur-3xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-1000`} />
                                        <img
                                            src={agent.image}
                                            alt={agent.name}
                                            className="w-40 h-40 object-contain animate-pilot-spin relative z-10 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                                        />
                                    </div>

                                    <div className={`text-[10px] font-black uppercase tracking-[0.3em] ${agent.text_color} mb-10 min-h-[5rem] flex items-center justify-center px-6 text-center italic leading-relaxed`}>
                                        {hoveredAgentId === agent.id ? (
                                            <div className="holographic-sheen">
                                                <Typewriter
                                                    text={agent.text}
                                                    speed={audioDuration}
                                                    isHovered={hoveredAgentId === agent.id}
                                                />
                                            </div>
                                        ) : (
                                            <span className="opacity-60">{agent.role}</span>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => handleSelect(agent)}
                                        className="w-full py-5 bg-white/5 hover:bg-white text-white hover:text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] transition-all duration-500 flex items-center justify-center gap-3 group/btn border border-white/10 overflow-hidden relative"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-600 opacity-0 group-hover/btn:opacity-10 group-hover:scale-x-110 transition-all duration-700" />
                                        <span className="relative z-10">Select Pilot</span>
                                        <ArrowRight size={16} className="relative z-10 group-hover/btn:translate-x-2 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            <SharedFooter onViewChange={onViewChange} />
        </div>
    );
};

export default PilotsPage;