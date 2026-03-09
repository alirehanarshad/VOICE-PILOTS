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

const SharedFooter = ({ onViewChange }) => {
  const handleItemClick = (page) => {
    if (onViewChange) onViewChange(page);
  };

  return (
    <footer className="bg-black border-t border-white/5 pt-20 pb-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-20 text-center md:text-left">
        <div>
          <div className="mb-6 flex justify-center md:justify-start">
            <Logo onViewChange={onViewChange} />
          </div>
          <p className="text-zinc-500 text-sm font-medium leading-relaxed">
            The most powerful autonomous voice engine for modern creators and developers.
          </p>
        </div>
        <div>
          <h4 className="font-black text-[10px] uppercase tracking-[0.2em] mb-8 text-zinc-300">Resources</h4>
          <ul className="space-y-4 text-xs text-zinc-500 font-bold uppercase tracking-widest">
            <li className="hover:text-purple-400 cursor-pointer"><a href="https://github.com/alirehanarshad/voicepilots-Documentation-" target="_blank">Documentation</a></li>
            <li className="hover:text-purple-400 cursor-pointer" onClick={() => handleItemClick('contact')}>Support</li>
            <li className="hover:text-purple-400 cursor-pointer" onClick={() => handleItemClick('pricing')}>Pricing</li>
            <li className="hover:text-purple-400 cursor-pointer flex items-center gap-1.5 justify-center md:justify-start" onClick={() => handleItemClick('download')}><Download size={12} />Download</li>
          </ul>
        </div>
        <div>
          <h4 className="font-black text-[10px] uppercase tracking-[0.2em] mb-8 text-zinc-300">Company</h4>
          <ul className="space-y-4 text-xs text-zinc-500 font-bold uppercase tracking-widest">
            <li className="hover:text-purple-400 cursor-pointer" onClick={() => handleItemClick('about')}>About Us</li>
            <li className="hover:text-purple-400 cursor-pointer" onClick={() => handleItemClick('pilots')}>Pilots</li>
            <li className="hover:text-purple-400 cursor-pointer" onClick={() => handleItemClick('contact')}>Contact Us</li>
            <li className="hover:text-purple-400 cursor-pointer" onClick={() => handleItemClick('privacy')}>Privacy Policy</li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex justify-center md:justify-start gap-4">
            <a href="https://www.youtube.com/@ALI_REHAN_ARSHAD" target="_blank" rel="noopener noreferrer">
              <Youtube size={18} className="text-zinc-600 hover:text-white cursor-pointer" />
            </a>
            <a href="https://www.instagram.com/ali_rehan_arshad.1/" target="_blank" rel="noopener noreferrer">
              <Instagram size={18} className="text-zinc-600 hover:text-white cursor-pointer" />
            </a>
            <a href="https://github.com/alirehanarshad" target="_blank" rel="noopener noreferrer">
              <Github size={18} className="text-zinc-600 hover:text-white cursor-pointer" />
            </a>
            <a href="https://www.linkedin.com/in/ali-rehan-arshad-82676437a/" target="_blank" rel="noopener noreferrer">
              <Linkedin size={18} className="text-zinc-600 hover:text-white cursor-pointer" />
            </a>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Global Status: Operational</span>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 text-center">
        <span className="text-[10px] text-zinc-700 font-black uppercase tracking-[0.3em]">Built for the future of interaction</span>
      </div>
    </footer>
  );
};

export default SharedFooter;