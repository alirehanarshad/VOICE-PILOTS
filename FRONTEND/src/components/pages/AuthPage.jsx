import React from 'react';
import Logo from '../common/Logo';
import {
  ArrowLeft,
  Mail,
  Lock,
  Github,
  Linkedin,
  Youtube,
  Instagram
} from 'lucide-react';

const AuthPage = ({ type, onViewChange, onLoginSubmit }) => {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative">
      <button onClick={() => onViewChange('landing')} className="absolute top-10 left-10 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors uppercase text-[10px] font-black tracking-widest">
        <ArrowLeft size={16} /> Back Home
      </button>
      <div className="w-full max-w-md bg-zinc-900/50 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl">
        <div className="mb-8">
          <Logo onViewChange={onViewChange} />
        </div>
        <h2 className="text-3xl font-bold mb-2 uppercase italic tracking-tighter">{type === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
        <p className="text-zinc-500 text-sm mb-8 font-medium">
          {type === 'login' ? 'Please log in to access the assistants.' : 'New to Voice Professional? Register to start.'}
        </p>

        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            onLoginSubmit();
          }}
        >
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input type="email" required className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-purple-500 outline-none transition-all font-bold text-sm" placeholder="name@company.com" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input type="password" required className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-purple-500 outline-none transition-all font-bold text-sm" placeholder="••••••••" />
            </div>
          </div>
          <button type="submit" className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-xl shadow-white/5">
            {type === 'login' ? 'Sign In' : 'Get Started'}
          </button>
        </form>

        <p className="text-center mt-8 text-xs text-zinc-500 font-bold">
          {type === 'login' ? "Don't have an account?" : "Already have an account?"}
          <button onClick={() => onViewChange(type === 'login' ? 'signup' : 'login')} className="ml-2 text-purple-400 hover:underline">
            {type === 'login' ? 'Create One' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
