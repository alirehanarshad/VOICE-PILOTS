import React from 'react';
import SharedNav from '../layout/SharedNav';
import SharedFooter from '../layout/SharedFooter';
import {
  ArrowLeft,
  MapPin,
  Linkedin,
  Github,
  Instagram,
  BrainCircuit,
  Cpu,
  Shield,
  Workflow,
  Code2,
  User
} from 'lucide-react';

const MindsPage = ({ onViewChange, isLoggedIn, onLogout }) => {
  return (
    <div className="min-h-screen bg-[#020203] text-white flex flex-col font-sans">
      <SharedNav view="minds" onViewChange={onViewChange} isLoggedIn={isLoggedIn} onLogout={onLogout} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-40 pb-20">
        <button
          onClick={() => onViewChange('about')}
          className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 hover:text-white transition-all mb-16"
        >
          <ArrowLeft size={16} /> Back to About
        </button>

        <div className="grid lg:grid-cols-2 gap-20 items-start">
          <div className="sticky top-40">
            <div className="aspect-square bg-zinc-900 rounded-[4rem] border border-white/10 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-transparent opacity-50" />
              <img
                src="/profile.jpg"
                alt="Ali Rehan Arshad"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-12 space-y-6">
              <div className="flex items-center gap-4 p-6 bg-zinc-900/50 rounded-3xl border border-white/5">
                <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-500">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Base of Operations</p>
                  <p className="text-lg font-bold">Islamabad, Pakistan</p>
                </div>
              </div>
              <div className="flex gap-4">
                <a href="https://www.linkedin.com/in/ali-rehan-arshad-82676437a/" target="_blank" rel="noopener noreferrer" className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
                  <Linkedin size={18} />
                </a>
                <a href="https://github.com/alirehanarshad" target="_blank" rel="noopener noreferrer" className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
                  <Github size={18} />
                </a>
                <a href="https://www.instagram.com/ali_rehan_arshad.1/" target="_blank" rel="noopener noreferrer" className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
                  <Instagram size={18} />
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-16">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-black text-purple-400 uppercase tracking-[0.3em] mb-8">
                <BrainCircuit size={14} /> PERSONNEL DOSSIER
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none mb-4">
                Ali Rehan <span className="text-purple-500">Arshad.</span>
              </h1>
              <p className="text-zinc-500 font-black uppercase tracking-[0.4em] mb-12">Founder & Cloud Engineer</p>
              <div className="text-zinc-400 text-xl font-medium leading-relaxed italic">
                "We are not building tools; we are building partners. The goal is to make the computer invisible, leaving only the power of the human voice."
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter border-b border-white/5 pb-4">Specializations</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <BrainCircuit />, label: "Agentic AI" },
                  { icon: <Cpu />, label: "Cloud Computing" },
                  { icon: <Workflow />, label: "LLM Orchestration" },
                  { icon: <Code2 />, label: "Full Stack AI Dev" }
                ].map((spec, i) => (
                  <div key={i} className="p-6 bg-zinc-900/30 border border-white/5 rounded-3xl flex items-center gap-4">
                    <div className="text-purple-500">{spec.icon}</div>
                    <span className="text-xs font-black uppercase tracking-widest">{spec.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter border-b border-white/5 pb-4">The Vision</h3>
              <div className="space-y-6 text-zinc-500 font-bold text-sm leading-relaxed">
                <p>
                  As the Founder and Lead Cloud Engineer, Ali Rehan Arshad established Voice Professional in 2025 with a singular mission: to liberate people from the "keyboard-mouse" paradigm using robust cloud infrastructure and AI.
                </p>
                <p>
                  His current focus lies in the development of sub-200ms latency processing loops, ensuring that the agents (Dutch and Sofia) respond with human-like immediacy. Under his leadership, Voice Professional has grown from a research project in Islamabad to a global standard in autonomous voice AI.
                </p>
              </div>
            </div>

            <div className="space-y-12">
              <div className="p-10 bg-purple-600/10 border border-purple-500/20 rounded-[3rem]">
                <p className="text-purple-400 font-black uppercase tracking-widest text-[10px] mb-4">Current Directive</p>
                <p className="text-zinc-300 font-bold">Scaling the V3 Intelligent Engine for full browser control and multi-step autonomous reasoning across global nodes.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SharedFooter onViewChange={onViewChange} />
    </div>
  );
};

export default MindsPage;
