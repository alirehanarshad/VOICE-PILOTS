import React from 'react';
import SharedNav from '../layout/SharedNav';
import SharedFooter from '../layout/SharedFooter';
import {
    Download,
    ArrowLeft,
    ShieldCheck,
    Zap,
    Globe,
    Settings,
    RefreshCw,
    CheckCircle2,
    Sparkles,
    Layers,
    Cpu,
    Lock
} from 'lucide-react';

const DownloadPage = ({ onViewChange, isLoggedIn, onLogout }) => {
    return (
        <div style={{ backgroundColor: '#020203' }} className="text-white min-h-screen flex flex-col font-sans selection:bg-indigo-500/30 overflow-x-hidden relative">
            <div className="fixed inset-0 stardust-bg opacity-30 pointer-events-none" style={{ zIndex: -1 }} />
            <SharedNav view="download" onViewChange={onViewChange} isLoggedIn={isLoggedIn} onLogout={onLogout} />

            <main className="flex-1 relative z-10">
                {/* ── Ultra-Premium Hero ────────────────────────────────────────── */}
                <section className="relative pt-48 pb-32 px-6 flex flex-col items-center justify-center text-center">

                    {/* Logo Focal Point */}
                    <div className="relative mb-20 group">
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-[80px] opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />

                        <div className="w-48 h-48 bg-transparent rounded-[3rem] p-4 flex items-center justify-center relative z-10 transition-pro hover:scale-105">
                            <img
                                src="/vioce pilot logo.png"
                                alt="VoicePilots Logo"
                                className="w-full h-full object-contain animate-spin-slow"
                            />
                        </div>
                    </div>

                    <div className="max-w-5xl mx-auto flex flex-col items-center z-10">
                        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black tracking-[0.3em] uppercase text-zinc-400 mb-12 holographic-sheen">
                            <ShieldCheck size={14} className="text-emerald-500" /> Enterprise Deployment Ready
                        </div>

                        <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-tight mb-16 italic uppercase select-none whitespace-nowrap">
                            Redefining <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]">
                                the future.
                            </span>
                        </h1>

                        <div className="flex flex-col items-center gap-8">
                            <button className="relative group px-16 py-8 bg-blue-600 rounded-[3rem] overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-[0_0_80px_rgba(37,99,235,0.4)]">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                <div className="relative flex items-center gap-4 text-2xl font-black italic uppercase tracking-tighter text-white">
                                    <Download size={28} />
                                    <span>Download For Windows</span>
                                </div>
                            </button>

                            <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 italic opacity-60">
                                <span>Version 2.4.0 (LTS)</span>
                                <span className="w-1 h-1 rounded-full bg-zinc-800" />
                                <span>Windows 10/11 x64</span>
                                <span className="w-1 h-1 rounded-full bg-zinc-800" />
                                <span>Built on Quantum V3</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Precision Engineering Section (Custom Render) ──────────────── */}
                <section className="py-32 px-6 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent">
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
                        <div className="relative order-2 lg:order-1">
                            {/* Decorative Frame */}
                            <div className="absolute -inset-4 bg-indigo-500/5 rounded-[4rem] blur-2xl" />
                            <div className="relative rounded-[3.5rem] overflow-hidden border border-white/5 p-4 bg-white/5 backdrop-blur-sm group">
                                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                <img
                                    src="/engine_render.png"
                                    alt="Precision Engine"
                                    className="w-full h-auto rounded-[2.5rem] transform group-hover:scale-105 transition-transform duration-[2s] ease-out"
                                />
                                {/* Overlay Stats */}
                                <div className="absolute bottom-12 left-12 right-12 flex justify-between">
                                    <div className="p-6 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10">
                                        <div className="text-zinc-500 text-[8px] font-black uppercase mb-1">Latency</div>
                                        <div className="text-emerald-400 text-xl font-black italic">14ms</div>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10">
                                        <div className="text-zinc-500 text-[8px] font-black uppercase mb-1">Stability</div>
                                        <div className="text-blue-400 text-xl font-black italic">99.9%</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="order-1 lg:order-2 space-y-12">
                            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase tracking-widest italic">
                                <Cpu size={14} /> Neural Core Integrated
                            </div>
                            <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">
                                Performance <br /> without <span className="text-zinc-500">compromise</span>
                            </h2>
                            <p className="text-zinc-400 text-lg font-bold leading-relaxed max-w-lg italic">
                                Designed for the most demanding creators and developers. Our engine leverages custom silicon acceleration and cloud-sync memory for a truly seamless experience.
                            </p>
                            <div className="grid grid-cols-2 gap-8 pt-8">
                                <div className="space-y-3 p-8 rounded-3xl premium-glass border border-white/5">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-blue-400">
                                        <Layers size={20} />
                                    </div>
                                    <h4 className="text-sm font-black uppercase tracking-widest italic">Multi-Layer Context</h4>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase leading-relaxed">Processing 1M+ tokens per second with full context awareness.</p>
                                </div>
                                <div className="space-y-3 p-8 rounded-3xl premium-glass border border-white/5">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-rose-400">
                                        <Lock size={20} />
                                    </div>
                                    <h4 className="text-sm font-black uppercase tracking-widest italic">Zero Trust Security</h4>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase leading-relaxed">Local-first encryption ensuring your data stays truly yours.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Global Infrastructure Section (Banner) ────────────────────── */}
                <section className="relative h-[600px] flex items-center justify-center px-6 overflow-hidden">
                    <div className="absolute inset-0">
                        <img
                            src="/investor_banner.png"
                            alt="Global Infrastructure"
                            className="w-full h-full object-cover scale-110 lg:scale-100 opacity-40 group-hover:scale-105 transition-transform duration-[10s]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-[#020203] via-transparent to-[#020203]" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#020203] via-transparent to-[#020203]" />
                    </div>

                    <div className="relative text-center max-w-3xl">
                        <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-8 leading-tight">
                            Infrastructure for <br /> global <span className="text-indigo-500">scale.</span>
                        </h2>
                        <p className="text-zinc-400 font-bold text-lg mb-12 italic">
                            Backing the future of interaction with resilient, distributed systems built for millions of concurrent connections.
                        </p>
                        <div className="flex flex-wrap justify-center gap-12 grayscale opacity-40">
                            <div className="flex items-center gap-2 font-black tracking-widest text-xs italic uppercase"><Globe size={16} /> 12 Regions</div>
                            <div className="flex items-center gap-2 font-black tracking-widest text-xs italic uppercase"><Zap size={16} /> 99.99% Uptime</div>
                            <div className="flex items-center gap-2 font-black tracking-widest text-xs italic uppercase"><ShieldCheck size={16} /> SOC2 Compliant</div>
                        </div>
                    </div>
                </section>

                {/* ── Final Call to Action ───────────────────────────────────────── */}
                <section className="py-48 px-6 text-center">
                    <div className="max-w-2xl mx-auto space-y-12">

                        <h3 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter">Ready to evolve?</h3>
                        <p className="text-zinc-500 font-bold text-lg italic">Join the next generation of voice assistance.</p>
                        <div className="pt-8">
                            <button className="px-12 py-6 bg-white text-black rounded-full font-black uppercase tracking-tighter italic text-xl hover:bg-zinc-200 transition-all hover:scale-105">
                                Start Free Download
                            </button>
                        </div>
                        <div className="pt-12">
                            <button
                                onClick={() => onViewChange('landing')}
                                className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 hover:text-white transition-all border-b border-transparent hover:border-white/20 pb-1 italic"
                            >
                                <ArrowLeft size={14} className="group-hover:-translate-x-2 transition-transform" /> Return to Core
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            <SharedFooter onViewChange={onViewChange} />
        </div>
    );
};

export default DownloadPage;
