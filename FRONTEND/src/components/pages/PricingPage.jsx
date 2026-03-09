import React from 'react';
import SharedNav from '../layout/SharedNav';
import SharedFooter from '../layout/SharedFooter';
import {
  CreditCard,
  CheckCircle2
} from 'lucide-react';

const PricingPage = ({ isLoggedIn, onViewChange, onLogout }) => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      features: "2 Models | 5 Tasks",
      desc: "Entry-level access for system exploration.",
      details: [
        "2 Specialized Models",
        "5 Autonomous Tasks / mo",
        "Community Support",
        "Base Response Speed",
        "Public Neural Link"
      ],
      color: "text-zinc-400",
      btn: "border border-white/5 hover:bg-white/5"
    },
    {
      name: "Basic",
      price: "$19",
      features: "10 Core Features",
      desc: "Essential voice automation for personal efficiency.",
      details: [
        "Voice Command Interpretation",
        "Email & Calendar Sync",
        "Basic Note Taking",
        "Standard Assistant Access",
        "Standard Response Speed",
        "1 Connected Service"
      ],
      color: "text-blue-400",
      btn: "border border-white/10 hover:bg-white/5"
    },
    {
      name: "Professional",
      price: "$49",
      features: "50 Premium Features",
      desc: "Advanced execution engine for power users.",
      details: [
        "Everything in Basic",
        "Browser Automation Node",
        "Custom Agent Training",
        "Multi-Session Memory",
        "Sub-200ms Latency",
        "10 Connected Services"
      ],
      color: "text-purple-500",
      featured: true,
      btn: "bg-purple-600 hover:bg-purple-500 shadow-xl shadow-purple-500/20"
    },
    {
      name: "Ultra",
      price: "$99",
      features: "100+ Elite Features",
      desc: "Complete autonomous control for agencies.",
      details: [
        "Everything in Pro",
        "Full Vision Engine Sync",
        "Developer API Access",
        "Unlimited Agents",
        "Zero-Latency Tier",
        "Global Identity Security"
      ],
      color: "text-emerald-400",
      btn: "border border-white/10 hover:bg-white/5"
    }
  ];

  return (
    <div style={{ backgroundColor: '#020203' }} className="text-white flex flex-col font-sans selection:bg-purple-500/30 ">
      <SharedNav view="pricing" onViewChange={onViewChange} isLoggedIn={isLoggedIn} onLogout={onLogout} />

      <main className="flex-1 max-w-[90rem] mx-auto w-full px-6 pt-40 pb-20">

        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full premium-glass border border-purple-500/20 text-[10px] font-black text-purple-400 uppercase tracking-[0.3em] mb-8 holographic-sheen">
            <CreditCard size={14} className="animate-pulse" /> INVESTMENT TIERS
          </div>
          <h1 className="text-6xl md:text-[7rem] font-black tracking-tighter italic uppercase mb-6 leading-[0.85] bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent">
            Choose Your <br /><span className="text-indigo-500">Service Tier.</span>
          </h1>
          <p className="text-zinc-500 max-w-2xl mx-auto font-bold uppercase tracking-[0.4em] text-[10px] italic opacity-80">Unleash the full potential of your cognitive workspace</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {plans.map((plan, i) => (
            <div key={i} className={`relative p-12 overflow-hidden transition-pro hover:scale-[1.02] group flex flex-col ${plan.featured ? 'scale-105 z-10' : ''}`}>
              <div className={`absolute inset-0 premium-glass border transition-all duration-700 rounded-[3rem] ${plan.featured ? 'border-purple-500/30 bg-purple-500/5' : 'border-white/5 bg-white/[0.02] hover:border-white/20'}`} />
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none rounded-[3rem]" />



              {plan.featured && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-2.5 rounded-bl-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-lg animate-pulse z-20">Most Popular</div>
              )}

              <div className="relative z-10 flex flex-col h-full">
                <h3 className="text-4xl font-black uppercase italic tracking-tighter mb-2 text-white">{plan.name}</h3>
                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-4xl font-black tracking-tighter">{plan.price}</span>
                  <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] italic">/ monthly</span>
                </div>

                <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-10 inline-block border-2 holographic-sheen ${plan.featured ? 'bg-purple-500/20 border-purple-500/30 text-purple-400' : 'bg-white/5 border-white/10 ' + plan.color}`}>
                  {plan.features}
                </div>

                <p className="text-zinc-400 text-xs font-bold mb-10 leading-relaxed uppercase tracking-widest opacity-60 italic">{plan.desc}</p>

                <div className="space-y-5 mb-14">
                  {plan.details.map((detail, idx) => (
                    <div key={idx} className="flex items-center gap-4 text-[11px] font-bold text-zinc-300 uppercase tracking-tight group/item transition-all hover:translate-x-1">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${plan.featured ? 'border-purple-500/30 bg-purple-500/10' : 'border-white/10 bg-white/5'}`}>
                        <CheckCircle2 size={10} className={plan.color} />
                      </div>
                      {detail}
                    </div>
                  ))}
                </div>

                <button onClick={() => onViewChange('payment')} className={`mt-auto w-full py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] transition-all duration-500 relative overflow-hidden group/btn shadow-2xl ${plan.btn}`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                  <span className="relative z-10">Initialize {plan.name}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-40 p-16 premium-glass border-white/5 rounded-[4rem] text-center relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="relative z-10">
            <h4 className="text-3xl font-black uppercase italic tracking-tighter mb-6">Need a custom node grid?</h4>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs max-w-xl mx-auto mb-10 leading-relaxed">For enterprise teams requiring dedicated server pods and custom agent training sessions.</p>
            <button onClick={() => onViewChange('contact')} className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400 hover:text-purple-300 transition-all border-b-2 border-purple-500/30 hover:border-purple-500 pb-1 italic">Contact Mission Control</button>
          </div>
        </div>
      </main>
      <SharedFooter onViewChange={onViewChange} />
    </div>
  );
};

export default PricingPage;
