import React, { useState } from 'react';
import CONFIG from '../../config';
import SharedNav from '../layout/SharedNav';
import SharedFooter from '../layout/SharedFooter';
import {
  Mail,
  MapPin,
  Send,
  CheckCircle2
} from 'lucide-react';

const ContactPage = ({ onViewChange, isLoggedIn, onLogout }) => {
  const [formStatus, setFormStatus] = useState('idle'); // idle | submitting | success | error
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'General Inquiry', message: '' });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('submitting');
    try {
      const res = await fetch(`${CONFIG.API_URL}/api/contact/send`, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setFormStatus('success');
        setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
      } else {
        setFormStatus('error');
      }
    } catch {
      setFormStatus('error');
    }
  };

  return (
    <div style={{ backgroundColor: '#020203' }} className="text-white min-h-screen flex flex-col font-sans selection:bg-purple-500/30 relative">
      <div className="fixed inset-0 stardust-bg opacity-30 pointer-events-none" style={{ zIndex: -1 }} />
      <SharedNav view="contact" onViewChange={onViewChange} isLoggedIn={isLoggedIn} onLogout={onLogout} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-40 pb-20 relative z-10">

        <div className="grid lg:grid-cols-2 gap-20 items-start">
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full premium-glass border border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-10 holographic-sheen">
              <Mail size={14} className="animate-pulse" /> CONTACT CHANNEL
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] mb-10 italic uppercase bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent">
              Contact <br /> <span className="text-indigo-500">Us.</span>
            </h1>
            <p className="text-zinc-400 text-xl mb-12 max-w-md font-medium leading-relaxed italic opacity-80">
              Have questions about our voice agents or custom integration? Our team is ready to help you launch your next big idea.
            </p>

            <div className="space-y-8">
              <div className="flex gap-8 items-center group">
                <div className="w-16 h-16 rounded-2xl premium-glass border border-white/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-pro shadow-2xl">
                  <Mail size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-1 italic opacity-60">Email Us</p>
                  <p className="text-sm font-bold text-white/80 lowercase tracking-wide">ali.rehan5100@gmail.com</p>
                </div>
              </div>
              <div className="flex gap-8 items-center group">
                <div className="w-16 h-16 rounded-2xl premium-glass border border-white/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-pro shadow-2xl">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-1 italic opacity-60">Global HQ</p>
                  <p className="text-xl font-black uppercase tracking-tighter text-white">Islamabad, Pakistan</p>
                </div>
              </div>
            </div>
          </div>

          <div className="premium-glass border border-white/5 p-12 rounded-[4rem] relative overflow-hidden group shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

            <div className="relative z-10">
              {formStatus === 'success' ? (
                <div className="py-24 text-center animate-in zoom-in duration-700">
                  <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-emerald-500/20 border-4 border-emerald-500/30 animate-bounce">
                    <CheckCircle2 size={48} />
                  </div>
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-6">Message Received</h3>
                  <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs opacity-60 italic">Our team will respond to your request shortly.</p>
                  <button onClick={() => setFormStatus('idle')} className="mt-12 text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 hover:text-indigo-300 transition-all border-b border-indigo-500/30 hover:border-indigo-500 pb-1 italic">Send another message</button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-8">
                  {/* Recipient indicator */}
                  <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                    <Mail size={14} className="text-indigo-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] leading-none mb-1">Message will be sent to</p>
                      <p className="text-sm font-bold text-white/80 lowercase tracking-wide truncate">ali.rehan5100@gmail.com</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] italic opacity-60 ml-1">Full Name</label>
                      <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 focus:border-purple-500/50 outline-none transition-pro font-bold text-sm text-white placeholder:text-zinc-600 shadow-inner" placeholder="John Doe" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] italic opacity-60 ml-1">Email Address</label>
                      <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 focus:border-purple-500/50 outline-none transition-pro font-bold text-sm text-white placeholder:text-zinc-600 shadow-inner" placeholder="john@example.com" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] italic opacity-60 ml-1">Subject</label>
                    <div className="relative">
                      <select name="subject" value={formData.subject} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 focus:border-purple-500/50 outline-none transition-pro font-bold text-sm text-white appearance-none cursor-pointer shadow-inner">
                        <option className="bg-zinc-900">General Inquiry</option>
                        <option className="bg-zinc-900">Technical Support</option>
                        <option className="bg-zinc-900">Partnership</option>
                        <option className="bg-zinc-900">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] italic opacity-60 ml-1">Message</label>
                    <textarea required rows="5" name="message" value={formData.message} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 px-8 focus:border-purple-500/50 outline-none transition-pro font-bold text-sm text-white resize-none placeholder:text-zinc-600 shadow-inner" placeholder="Your message here..."></textarea>
                  </div>
                  <button
                    disabled={formStatus === 'submitting'}
                    className="w-full py-7 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white rounded-[2rem] font-black uppercase tracking-[0.4em] text-[10px] transition-pro flex items-center justify-center gap-4 shadow-2xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 italic group/btn overflow-hidden relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                    {formStatus === 'submitting' ? (
                      <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send size={18} className="relative z-10 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                        <span className="relative z-10">Send Message</span>
                      </>
                    )}
                  </button>
                  {formStatus === 'error' && (
                    <p className="text-rose-400 text-[11px] font-bold uppercase tracking-widest text-center mt-4">
                      ⚠ Failed to send. Please try again or email us at <span className="lowercase">ali.rehan5100@gmail.com</span>
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <SharedFooter onViewChange={onViewChange} />
    </div>
  );
};

export default ContactPage;
