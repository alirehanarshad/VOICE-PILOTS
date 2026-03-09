import React from 'react';
import SharedNav from '../layout/SharedNav';
import SharedFooter from '../layout/SharedFooter';
import {
  Info,
  Zap,
  ShieldCheck,
  Globe,
  Lightbulb,
  Rocket,
  ArrowRight,
  Activity,
  User
} from 'lucide-react';

const AboutPage = ({ onViewChange, isLoggedIn, onLogout }) => {
  return (
    <div style={{ backgroundColor: '#020203' }} className="text-white flex flex-col font-sans selection:bg-purple-500/30 ">
      <SharedNav view="about" onViewChange={onViewChange} isLoggedIn={isLoggedIn} onLogout={onLogout} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-40 pb-20">

        <div className="grid lg:grid-cols-2 gap-20 mb-32 items-center">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full premium-glass border border-purple-500/20 text-[10px] font-black text-purple-400 uppercase tracking-[0.3em] mb-8 holographic-sheen">
              <Info size={14} className="animate-pulse" /> THE MISSION
            </div>
            <h1 className="text-6xl md:text-[8rem] font-black tracking-tighter leading-[0.85] mb-10 italic uppercase bg-gradient-to-b from-white via-white to-white/30 bg-clip-text text-transparent">
              Bridging <br /> <span className="text-purple-500">Thought & Action.</span>
            </h1>
            <p className="text-zinc-400 text-xl font-medium leading-relaxed mb-12 italic opacity-80">
              Born in 2025 and launched in 2026, Voice Professional is redefining digital interaction through natural, voice-first autonomy.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="px-6 py-3 rounded-2xl premium-glass border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">Est. 2025</div>
              <div className="px-6 py-3 rounded-2xl premium-glass border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">Islamabad, Pakistan</div>
            </div>
          </div>
          <div className="relative group lg:block hidden">
            <div className="absolute inset-x-0 -bottom-10 h-32 bg-gradient-to-t from-[#020203] z-10" />
            <img src="/office_render.png" alt="Mission Vision" className="w-full h-auto rounded-[4rem] grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-[2s] border border-white/5" />
          </div>
        </div>

        <div className="mb-40 relative group">
          <div className="absolute -inset-20 bg-blue-500/5 blur-[150px] rounded-full pointer-events-none group-hover:bg-blue-500/10 transition-all duration-1000" />
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="relative rounded-[3.5rem] overflow-hidden border border-white/5 bg-white/5 p-4 order-2 lg:order-1">
              <img src="/network_render.png" alt="Global Network" className="w-full h-auto rounded-[2.5rem] opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[3s]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
            <div className="order-1 lg:order-2">
              <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 mb-8">THE GLOBAL REACH</h4>
              <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-tight mb-8">
                Operating at <br /> <span className="text-blue-500">Global Scale.</span>
              </h2>
              <p className="text-zinc-500 text-lg font-bold leading-relaxed italic mb-10">
                Our infrastructure is built to handle millions of concurrent voice streams with zero-latency handoffs across any region.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl premium-glass border border-white/5">
                  <div className="text-blue-400 text-2xl font-black italic mb-1">12+</div>
                  <div className="text-zinc-600 text-[8px] font-black uppercase tracking-widest">Global Nodes</div>
                </div>
                <div className="p-6 rounded-2xl premium-glass border border-white/5">
                  <div className="text-emerald-400 text-2xl font-black italic mb-1">99.9%</div>
                  <div className="text-zinc-600 text-[8px] font-black uppercase tracking-widest">Uptime Record</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-32 relative">
          <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 mb-16 text-center md:text-left">THE CORE PILLARS</h4>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Zap className="text-indigo-500" />, title: "Speed", desc: "Responses processed in sub-200ms processing loops." },
              { icon: <ShieldCheck className="text-emerald-500" />, title: "Security", desc: "Zero-knowledge protocols for every vocal command." },
              { icon: <Globe className="text-blue-500" />, title: "Scale", desc: "Autonomous execution across any digital environment." }
            ].map((pillar, i) => (
              <div key={i} className="p-12 premium-glass border border-white/5 rounded-[3rem] group hover:border-white/20 transition-pro hover:scale-[1.02] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />
                <div className="mb-8 relative transition-transform duration-500 group-hover:scale-110">{pillar.icon}</div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-4 text-white">{pillar.title}</h3>
                <p className="text-zinc-500 text-xs font-bold leading-relaxed uppercase tracking-widest opacity-60 italic">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-40 relative">
          <div className="p-16 premium-glass border border-white/5 rounded-[4rem] group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-8 flex items-center gap-3 text-white">
              <Lightbulb className="text-purple-500" size={32} /> Our Philosophy
            </h3>
            <p className="text-zinc-500 leading-relaxed font-bold uppercase tracking-tight text-sm opacity-80 italic">We don't just build voice assistants; we build cognitive agents. They don't just "reply"—they execute, coordinate, and anticipate your needs across your entire digital stack.</p>
          </div>
          <div className="p-16 premium-glass border border-purple-500/20 rounded-[4rem] group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-transparent" />
            <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-8 text-purple-400 flex items-center gap-3">
              <Rocket className="text-purple-400" size={32} /> The Future
            </h3>
            <p className="text-zinc-400 leading-relaxed font-bold uppercase tracking-tight text-sm italic">By 2027, we aim to eliminate the concept of "Software UI" entirely, replacing it with a fluid, voice-first collaborative experience that lives where you live.</p>
          </div>
        </div>

        <div className="mb-40 relative">
          <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 mb-20 text-center">TIMELINE OF INNOVATION</h4>
          <div className="max-w-4xl mx-auto space-y-16">
            {[
              { year: "2025", title: "The Inception", desc: "Initial system framework developed in secret by our founding team." },
              { year: "2026", title: "Public Launch", desc: "Release of Dutch and Sofia agents to the global creator community." },
              { year: "2027", title: "The Autonomy Era", desc: "Projected rollout of full-environment agentic control (V3)." }
            ].map((item, i) => (
              <div key={i} className="flex gap-12 group">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-[1.5rem] premium-glass border border-white/10 flex items-center justify-center font-black italic text-zinc-400 group-hover:bg-purple-600 group-hover:text-white transition-pro group-hover:scale-110 shadow-2xl">{item.year}</div>
                  <div className="flex-1 w-px bg-gradient-to-b from-white/10 to-transparent my-6" />
                </div>
                <div className="pb-16 pt-2">
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-4 text-white">{item.title}</h3>
                  <p className="text-zinc-500 font-bold text-[11px] uppercase tracking-widest leading-relaxed opacity-60 italic">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center py-20 border-t border-white/5 relative">
          <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 mb-16">THE MIND BEHIND THE SYSTEM</h4>
          <div className="max-w-md mx-auto">
            <div
              onClick={() => onViewChange('minds')}
              className="group cursor-pointer relative"
            >
              <div className="absolute -inset-10 bg-purple-600/10 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-all duration-1000 animate-pulse" />

              <div className="relative aspect-square premium-glass rounded-[4rem] mb-8 grayscale group-hover:grayscale-0 group-hover:-translate-y-4 transition-pro border border-white/10 overflow-hidden shadow-2xl">
                <img
                  src="/profile.jpg"
                  alt="Ali Rehan Arshad"
                  className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-12">
                  <div className="flex items-center gap-2 text-purple-400 text-[10px] font-black uppercase tracking-[0.3em] mb-1">
                    <Activity size={14} className="animate-pulse" /> VIEW DOSSIER
                  </div>
                </div>
              </div>

              <h3 className="text-4xl font-black uppercase italic tracking-tighter mb-2 group-hover:text-purple-400 transition-colors bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">Ali Rehan Arshad</h3>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.4em] italic opacity-60">Founder & Cloud Engineer</p>

              <div className="mt-8 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 group-hover:text-white transition-colors">
                Explore The Origin <ArrowRight size={14} className="group-hover:translate-x-3 transition-transform duration-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 p-20 premium-glass border border-purple-500/20 rounded-[5rem] text-center relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="relative z-10">
            <h2 className="text-6xl md:text-[7rem] font-black uppercase italic tracking-tighter mb-10 leading-none">ready to <span className="text-purple-500">flight?</span></h2>
            <p className="text-zinc-500 font-bold mb-14 max-w-xl mx-auto uppercase tracking-widest text-[10px] leading-relaxed italic">Join thousands of high-performance creators who trust Voice Professional to automate their workflow.</p>
            <button
              onClick={() => { onViewChange('login'); }}
              className="px-16 py-7 bg-white text-black rounded-[2rem] font-black uppercase tracking-[0.4em] text-xs hover:bg-zinc-200 transition-pro shadow-2xl shadow-white/10 hover:scale-105 active:scale-95 italic"
            >
              lets fly with us
            </button>
          </div>
        </div>
      </main>
      <SharedFooter onViewChange={onViewChange} />
    </div>
  );
};

export default AboutPage;
