import React from 'react';
import SharedNav from '../layout/SharedNav';
import SharedFooter from '../layout/SharedFooter';
import {
  ShieldCheck,
  Lock
} from 'lucide-react';

const PrivacyPage = ({ onViewChange, isLoggedIn, onLogout }) => {
  return (
    <div className="min-h-screen bg-[#020203] text-white flex flex-col font-sans">
      <SharedNav view="privacy" onViewChange={onViewChange} isLoggedIn={isLoggedIn} onLogout={onLogout} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-40 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-8">
            <ShieldCheck size={14} /> SECURITY PROTOCOL
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-12 italic uppercase">Privacy <span className="text-emerald-500">Manifesto.</span></h1>

          <div className="space-y-16 text-zinc-400 font-medium leading-relaxed">
            <section>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-6">01. Voice Sovereignty</h2>
              <p>Your vocal data is never stored on our central servers. All audio processing happens in localized, encrypted "pods" that self-destruct after the command is executed. Your voice is your identity, and we treat it as sacred cryptographic material.</p>
            </section>

            <section>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-6">02. The "Ghost" Policy</h2>
              <p>Voice Professional uses Zero-Knowledge Proofs for command verification. We know <i>that</i> a command was authorized, but we do not store metadata about <i>who</i> you are unless you explicitly opt-in to Secure Storage features.</p>
            </section>

            <section>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-6">03. Data Extraction</h2>
              <p>You own your agent's memory. At any time, you can trigger a "Global Flush" which wipes every secure connection your agent has made across our infrastructure. Once flushed, that data is mathematically unrecoverable.</p>
            </section>

            <div className="p-10 bg-zinc-900/50 rounded-3xl border border-white/5 flex gap-8 items-center">
              <Lock className="text-emerald-500 shrink-0" size={40} />
              <p className="text-xs font-bold uppercase tracking-widest leading-loose">This document was last hashed on February 2026. <br />All changes are tracked on our public ledger for complete transparency.</p>
            </div>
          </div>
        </div>
      </main>
      <SharedFooter onViewChange={onViewChange} />
    </div>
  );
};

export default PrivacyPage;
