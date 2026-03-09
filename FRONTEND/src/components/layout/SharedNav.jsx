import React from 'react';
import Logo from '../common/Logo';
import {
  Github,
  Linkedin,
  Youtube,
  Instagram,
  ArrowLeft,
  Download
} from 'lucide-react';

const SharedNav = ({ view, onViewChange, isLoggedIn, onLogout }) => {
  const handleNavClick = (page) => {
    if (onViewChange) onViewChange(page);
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        <Logo onViewChange={onViewChange} />
        <nav className="hidden md:flex items-center gap-10 text-sm font-bold uppercase tracking-widest text-zinc-400">
          <button onClick={() => handleNavClick('landing')} className={`hover:text-white transition-colors ${view === 'landing' ? 'text-white' : ''}`}>Home</button>
          <button onClick={() => handleNavClick('pilots')} className={`hover:text-white transition-colors ${view === 'pilots' ? 'text-white' : ''}`}>Pilots</button>
          <a href="https://github.com/alirehanarshad/voicepilots-Documentation-" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Docs</a>
          <button onClick={() => handleNavClick('about')} className={`hover:text-white transition-colors ${view === 'about' || view === 'minds' ? 'text-white' : ''}`}>About</button>
          <button onClick={() => handleNavClick('pricing')} className={`hover:text-white transition-colors ${view === 'pricing' ? 'text-white' : ''}`}>Pricing</button>
          <button onClick={() => handleNavClick('download')} className={`hover:text-white transition-colors flex items-center gap-1.5 ${view === 'download' ? 'text-white' : ''}`}><Download size={14} />Download</button>
          <button onClick={() => handleNavClick('contact')} className={`hover:text-white transition-colors ${view === 'contact' ? 'text-white' : ''}`}>Contact</button>
        </nav>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <button onClick={onLogout} className="px-6 py-2.5 rounded-full bg-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10">Logout</button>
          ) : (
            <button onClick={() => handleNavClick('login')} className="px-6 py-2.5 rounded-full bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-zinc-200 transition-all">Login</button>
          )}
        </div>
      </div>
    </header>
  );
};

export default SharedNav;