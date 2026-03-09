import * as React from 'react';
import SharedNav from '../layout/SharedNav';
import SharedFooter from '../layout/SharedFooter';
import {
  Cpu,
  ArrowRight,
  MousePointer2,
  Database,
  CloudLightning,
  Eye,
  Mic,
  Brain,
  BrainCircuit,
  Activity,
  Zap,
  Target,
  Users,
  Info,
  CheckCircle2,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const CORE_NODES = [
  "System & OS Control",
  "Files & Documents",
  "Communication",
  "Productivity & Planning",
  "Internet & Information",
  "Media & Entertainment",
  "Smart Assistant Features",
  "Automation & Concierge Style"
];

const REVIEWS = [
  { name: "Dave Morin", handle: "@davemorin", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dave", quote: "At this point I don't even know what to call @voicepilots. It is something new. After a few weeks in with it, this is the first time I have felt like the future is here." },
  { name: "C. Nakazawa", handle: "@cnakazawa", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chris", quote: "VoicePilots is the first tool which I constantly check on GitHub. It's hard to put into words how much it has changed my productivity workflow." },
  { name: "Nofil AI", handle: "@nofil_ai", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nofil", quote: "@voicepilots is Jarvis. It already exists. The speed at which it converts voice to complex autonomous actions is simply mind-blowing." },
  { name: "Greg S.", handle: "@thesayheygreg", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Greg", quote: "Updates from @voicepilots absolutely rule. Every time I think they've reached the limit of autonomous execution, they push it even further." },
  { name: "Sarah Chen", handle: "@sarahc_dev", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", quote: "The way it understands semantic intent rather than just literal commands is a game-changer. It feels like it's actually listening to me." },
  { name: "Alex Rivera", handle: "@arivera_os", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex", quote: "Finally, a voice assistant that doesn't just talk back, but actually gets work done. My browser is now an extension of my voice." }
];

const LandingPage = React.memo(({ isLoggedIn, onViewChange, onLaunchAgent }) => {
  const [isNodesExpanded, setIsNodesExpanded] = React.useState(false);
  const videoRef = React.useRef(null);

  const visibleNodes = isNodesExpanded ? CORE_NODES : CORE_NODES.slice(0, 4);

  const handleExploreClick = () => {
    if (!isNodesExpanded) {
      setIsNodesExpanded(true);
    } else {
      onViewChange('pricing'); // Navigate to Plan page
    }
  };

  return (
    <div className="min-h-screen bg-[#020203] text-white flex flex-col font-sans selection:bg-purple-500/30 ">
      <div className="fixed inset-0 stardust-bg opacity-30 pointer-events-none" style={{ zIndex: -1 }} />
      <SharedNav view="landing" onViewChange={onViewChange} isLoggedIn={isLoggedIn} onLogout={() => { }} />
      <main className="flex-1">
        {/* Hero Section (No Grid) */}
        <section className="min-h-screen flex flex-col items-center justify-center pt-20 pb-20 relative px-6 overflow-hidden text-center">
          {/* Max Visibility Background Video */}
          <div className="absolute inset-0 z-0 opacity-50 overflow-hidden pointer-events-none">
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              disablePictureInPicture
              controlsList="nodownload"
              onTimeUpdate={(e) => {
                if (e.target.duration && e.target.duration - e.target.currentTime <= 0.3) {
                  e.target.currentTime = 0.05;
                  e.target.play().catch(() => { });
                }
              }}
              onCanPlayThrough={(e) => e.target.play()}
              className="w-full h-full object-cover blur-[2px] transform-gpu will-change-transform"
            >
              <source src="/Red and White Dynamic Countdown Video.mp4" type="video/mp4" />
            </video>
          </div>

          {/* Hero Content Container */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full premium-glass text-[10px] font-black text-purple-400 uppercase tracking-[0.3em] mb-10 holographic-sheen">
              <Cpu size={14} className="animate-pulse" /> NEXT GENERATION AI
            </div>

            <div className="relative mb-10 select-none w-full flex flex-col items-center">
              <h1 className="text-6xl md:text-[6.5rem] lg:text-[8.5rem] font-black tracking-tighter leading-[0.85] bg-gradient-to-b from-white via-white to-white/20 bg-clip-text text-transparent italic uppercase text-center w-full">
                Speak Your Mind, <br />
                <span className="text-purple-500 italic">Watch</span> Tasks Happen.
              </h1>
            </div>

            <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-16 font-medium leading-relaxed italic opacity-80">
              Speak naturally, watch your commands come alive in real time. <br />
              <span className="text-zinc-500">The ultimate bridge between human thought and digital execution.</span>
            </p>

            <button
              onClick={onLaunchAgent}
              className="group px-14 py-7 bg-purple-600 text-white rounded-[2rem] font-black text-xl flex items-center gap-4 hover:bg-purple-500 transition-all hover:scale-105 hover:shadow-[0_0_60px_rgba(147,51,234,0.5)] shadow-2xl shadow-purple-500/20 uppercase italic tracking-tighter"
            >
              Launch Your Agent
              <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform h-6 w-6" />
            </button>
          </div>
        </section>

        {/* Global Wrapper for everything else with Grid Background */}
        <div className="relative overflow-hidden">
          {/* Global Cyber Grid Background */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#a855f715_1px,transparent_1px),linear-gradient(to_bottom,#a855f715_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            <Motion.div
              animate={{
                opacity: [0.1, 0.2, 0.1],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-600/15 blur-[120px] rounded-full"
            />
            <Motion.div
              animate={{
                opacity: [0.05, 0.1, 0.05],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 5 }}
              className="absolute bottom-40 right-0 w-[800px] h-[800px] bg-purple-500/15 blur-[150px] rounded-full"
            />
          </div>

          <section className="py-32 px-6 bg-[#050507]/40 relative z-10">
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-20 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-[9px] font-black text-rose-300 uppercase tracking-[0.4em] mb-6">
                    CORE ABILITIES
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-tight mb-8">
                    Extreme <span className="text-rose-500">Autonomous</span> Capability.
                  </h2>
                  <p className="text-zinc-500 text-lg font-bold mb-12 leading-relaxed italic">
                    Our agents aren't just responders. They are active participants in your digital workflow.
                  </p>

                  {[
                    { icon: <MousePointer2 />, title: "Live Execution", desc: "Agents control browsers and local apps with human-like precision." },
                    { icon: <Database />, title: "Knowledge Sync", desc: "Connects to your Notion, Github, and Slack for full context." },
                    { icon: <CloudLightning />, title: "Zero Latency", desc: "Optimized system pathways for sub-100ms response times." },
                    { icon: <Eye />, title: "Vision Engine", desc: "Can 'see' and interpret your screen to assist in real-time." }
                  ].map((ability, idx) => (
                    <div key={idx} className="group p-6 rounded-3xl bg-white/[0.05] backdrop-blur-xl border border-white/5 hover:border-rose-500/30 transition-all duration-500 hover:translate-y-[-4px]">
                      <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center text-rose-500 mb-4 group-hover:scale-110 transition-transform">
                        {ability.icon}
                      </div>
                      <h4 className="text-sm font-black uppercase tracking-widest text-white italic">{ability.title}</h4>
                      <p className="text-xs text-zinc-500 font-bold leading-relaxed mt-2">{ability.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="relative group">
                  <div className="relative aspect-square bg-white/[0.05] backdrop-blur-xl border border-white/5 rounded-[3.5rem] overflow-hidden group-hover:border-rose-500/30 transition-all duration-700">
                    <img src="/sync_render.png" alt="Knowledge Sync" className="w-full h-full object-cover opacity-60 group-hover:scale-110 group-hover:opacity-80 transition-all duration-[3s]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-transparent to-transparent" />
                    <div className="absolute bottom-8 left-8 right-8">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-400 italic">Autonomous Neural Processing...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="py-32 px-6 bg-transparent relative z-10">
            <div className="max-w-7xl mx-auto text-center mb-24 relative z-10">
              <Motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-[9px] font-black text-blue-300 uppercase tracking-[0.4em] mb-6"
              >
                THE WORKFLOW
              </Motion.div>
              <Motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-tight"
              >
                How Our <span className="text-blue-500 font-black relative">
                  Agent Works.
                  <Motion.span
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="absolute bottom-0 left-0 h-1 bg-blue-500/30 rounded-full"
                  />
                </span>
              </Motion.h2>
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
              <div className="grid lg:grid-cols-3 gap-8 relative">
                {/* Animated Connecting Line (Desktop) - Centered on icons */}
                <div className="hidden lg:block absolute top-[5rem] left-[16.6%] right-[16.6%] h-[2px] bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-emerald-500/20 z-0">
                  <Motion.div
                    animate={{ left: ["-100%", "100%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
                  />
                </div>

                {[
                  {
                    title: "Semantic Acquisition",
                    desc: "Proprietary capture technology that isolates intent with sub-millisecond precision, filtering environmental noise to identify core semantic markers.",
                    textColor: "text-purple-500",
                    spotlight: "from-purple-500/10",
                    glow: "shadow-purple-500/20",
                    border: "hover:border-purple-500/50"
                  },
                  {
                    title: "Contextual Synthesis",
                    desc: "Intelligent intent resolution through multi-layered cross-referencing of personal knowledge graphs and active toolset ecosystems.",
                    textColor: "text-blue-500",
                    spotlight: "from-blue-500/10",
                    glow: "shadow-blue-500/20",
                    border: "hover:border-blue-500/50"
                  },
                  {
                    title: "Autonomous Orchestration",
                    desc: "Concurrent execution of complex workflows across diverse digital environments with zero intervention—converting thought into distributed action.",
                    textColor: "text-emerald-500",
                    spotlight: "from-emerald-500/10",
                    glow: "shadow-emerald-500/20",
                    border: "hover:border-emerald-500/50"
                  }
                ].map((item, idx) => (
                  <Motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.2 }}
                    whileHover={{ y: -10, transition: { duration: 0.3 } }}
                    className={`group relative p-12 bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-[4rem] ${item.border} transition-all duration-500 text-left overflow-hidden`}
                  >
                    {/* Subtle Accent Glow */}
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${item.spotlight} to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                    <h3 className={`text-2xl font-black uppercase italic tracking-tighter mb-6 ${item.textColor} group-hover:translate-x-1 transition-transform duration-500`}>
                      {item.title}
                    </h3>

                    <p className="text-zinc-400 text-sm font-medium leading-[1.8] mb-8 relative z-10">
                      {item.desc}
                    </p>

                    <div className="w-12 h-[2px] bg-white/10 group-hover:w-full group-hover:bg-gradient-to-r group-hover:from-transparent group-hover:via-white/20 group-hover:to-transparent transition-all duration-700" />
                  </Motion.div>
                ))}
              </div>
            </div>

            <Motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              className="mt-24 text-center relative z-10"
            >
              <button onClick={onLaunchAgent} className="inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 hover:text-white transition-all group">
                Start Your First Session
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-1000" />
                </div>
              </button>
            </Motion.div>
          </section>

          <section className="py-32 px-6 bg-transparent border-t border-white/5 relative z-10">
            <div className="max-w-7xl mx-auto mb-16 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-xl font-black text-rose-500 italic leading-none">{'>'}</span>
                <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-white">What People Say</h2>
              </div>
              <button
                onClick={() => onViewChange('shoutouts')}
                className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500 hover:text-rose-400 transition-colors flex items-center gap-2 group"
              >
                View all <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="relative">
              {/* Infinite Marquee Row 1 */}
              <div className="flex overflow-hidden group">
                <Motion.div
                  animate={{ x: ["0%", "-50%"] }}
                  transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                  className="flex gap-6 whitespace-nowrap py-8"
                >
                  {[...REVIEWS, ...REVIEWS].map((review, i) => (
                    <div
                      key={i}
                      onClick={() => onViewChange('shoutouts')}
                      className="w-[360px] shrink-0 p-6 bg-white/[0.05] border border-white/5 rounded-[2rem] backdrop-blur-md hover:border-rose-500/30 transition-all duration-500 cursor-pointer"
                    >
                      <div className="flex gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10 shrink-0">
                          <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col justify-center overflow-hidden">
                          <p className="text-[13px] font-bold text-white uppercase italic tracking-tighter truncate">"{review.quote.split(' ').slice(0, 4).join(' ')}..."</p>
                        </div>
                      </div>
                      <p className="text-zinc-500 text-[12px] font-medium leading-relaxed mb-5 whitespace-normal h-16 line-clamp-3 italic">
                        "{review.quote}"
                      </p>
                      <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest italic">{review.handle}</p>
                    </div>
                  ))}
                </Motion.div>
              </div>

              {/* Infinite Marquee Row 2 */}
              <div className="flex overflow-hidden mt-4">
                <Motion.div
                  animate={{ x: ["-50%", "0%"] }}
                  transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
                  className="flex gap-6 whitespace-nowrap pb-8"
                >
                  {[...REVIEWS, ...REVIEWS].reverse().map((review, i) => (
                    <div
                      key={i}
                      onClick={() => onViewChange('shoutouts')}
                      className="w-[360px] shrink-0 p-6 bg-white/[0.05] border border-white/5 rounded-[2rem] backdrop-blur-md hover:border-rose-500/30 transition-all duration-500 cursor-pointer"
                    >
                      <div className="flex gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10 shrink-0">
                          <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col justify-center overflow-hidden">
                          <p className="text-[13px] font-bold text-white uppercase italic tracking-tighter truncate">"{review.quote.split(' ').slice(0, 4).join(' ')}..."</p>
                        </div>
                      </div>
                      <p className="text-zinc-500 text-[12px] font-medium leading-relaxed mb-5 whitespace-normal h-16 line-clamp-3 italic">
                        "{review.quote}"
                      </p>
                      <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest italic">{review.handle}</p>
                    </div>
                  ))}
                </Motion.div>
              </div>

              {/* Gradient Fades for edges */}
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#020203] to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#020203] to-transparent z-10 pointer-events-none" />
            </div>
          </section>

          <section className="py-32 px-6 border-t border-white/5 bg-transparent relative z-10">
            <div className="max-w-7xl mx-auto">
              <div className="mb-20">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-[9px] font-black text-purple-300 uppercase tracking-[0.4em] mb-6">
                  AGENTIC INTELLIGENCE
                </div>
                <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-tight">
                  What{" "}<span className="text-purple-500">VoicePilots Provides.</span>
                </h2>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                <div className="p-10 bg-white/[0.05] backdrop-blur-xl border border-white/5 rounded-[4rem] flex flex-col h-full relative group hover:border-purple-500/50 transition-all duration-700 hover:translate-y-[-8px]">
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-4 text-white text-balance">Core Capabilities</h3>
                  <p className="text-zinc-500 text-sm font-bold mb-8 leading-relaxed italic border-l-2 border-purple-500 pl-4">
                    "The most extensive collection of automation modules, ready for your commands."
                  </p>
                  <div className="flex-1 space-y-4 mb-10">
                    {visibleNodes.map((t, i) => (
                      <div key={i} className="flex items-center gap-4 text-xs text-zinc-300 font-bold group-hover:translate-x-1 transition-transform" style={{ transitionDelay: `${i * 50}ms` }}>
                        <CheckCircle2 size={16} className="text-purple-500 shrink-0" />
                        {t}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleExploreClick}
                    className="w-full py-5 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 hover:border-white/20 italic"
                  >
                    {isNodesExpanded ? "Choose a Plan" : "Explore All Nodes"}
                  </button>
                </div>

                <div className="p-10 bg-white/[0.05] backdrop-blur-xl border border-white/5 rounded-[4rem] flex flex-col h-full relative group hover:border-blue-500/50 transition-all duration-700 hover:translate-y-[-8px]">
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-4 text-white text-balance">Voice Agents</h3>
                  <p className="text-zinc-500 text-sm font-bold mb-8 leading-relaxed italic border-l-2 border-blue-500 pl-4">
                    "Your specialized intelligence squad. Eva, Sofia, Dutch, Zoya, and Aarav—ready to manifest your thoughts."
                  </p>
                  <div className="flex-1 w-full mb-10 flex items-center justify-center overflow-hidden group">
                    <img src="/voice squad.jpg" alt="Voice Squad" className="w-full h-full object-contain group-hover:scale-105 transition-all duration-[2s]" />
                  </div>
                  <Motion.button onClick={() => onViewChange('pilots')} className="w-full py-5 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 hover:border-white/20 italic whitespace-nowrap">Meet Your Pilots.</Motion.button>
                </div>

                <div className="p-10 bg-white/[0.05] backdrop-blur-xl border border-white/5 rounded-[4rem] flex flex-col h-full relative group hover:border-emerald-500/50 transition-all duration-700 hover:translate-y-[-8px]">
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-4 text-white text-balance">Architecture</h3>
                  <p className="text-zinc-500 text-sm font-bold mb-8 leading-relaxed italic border-l-2 border-emerald-500 pl-4">
                    "Distributed, resilient, and built for the infinite scale of human innovation."
                  </p>
                  <div className="space-y-8 flex-1">
                    <div className="flex gap-5 group-hover:translate-x-1 transition-transform">
                      <div className="w-1.5 h-12 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)]" />
                      <div>
                        <p className="text-xs font-black text-white uppercase mb-2 italic tracking-wider">Semantic Sync</p>
                        <p className="text-[11px] text-zinc-500 leading-relaxed font-bold">Unlike basic GPTs, we understand intent through voice modulation and past context.</p>
                      </div>
                    </div>
                    <div className="flex gap-5 group-hover:translate-x-1 transition-transform duration-500">
                      <div className="w-1.5 h-12 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)]" />
                      <div>
                        <p className="text-xs font-black text-white uppercase mb-2 italic tracking-wider">Security Grid</p>
                        <p className="text-[11px] text-zinc-500 leading-relaxed font-bold">Military-grade voice-print encryption for every transmission node.</p>
                      </div>
                    </div>
                  </div>
                  <a
                    href="https://github.com/alirehanarshad/voicepilots-Documentation-"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-5 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all mt-auto flex items-center justify-center text-center border border-white/5 hover:border-white/20 italic"
                  >
                    Read Documentation
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <SharedFooter onViewChange={onViewChange} />
    </div>
  );
});

export default LandingPage;
