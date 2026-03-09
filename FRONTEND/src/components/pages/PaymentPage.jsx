import React, { useState } from 'react';
import SharedNav from '../layout/SharedNav';
import SharedFooter from '../layout/SharedFooter';
import { CreditCard, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

const PaymentPage = ({ onViewChange, isLoggedIn, onLogout, setHasPlan }) => {
    const [cardDetails, setCardDetails] = useState({
        number: '',
        expiry: '',
        cvv: '',
        name: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate payment processing
        if (setHasPlan) setHasPlan(true);
        onViewChange('landing');
    };

    return (
        <div className="min-h-screen bg-[#020203] text-white flex flex-col font-sans selection:bg-purple-500/30">
            <SharedNav view="payment" onViewChange={onViewChange} isLoggedIn={isLoggedIn} onLogout={onLogout} />

            <main className="flex-1 py-32 px-6 flex items-center justify-center">
                <div className="max-w-md w-full">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-[9px] font-black text-purple-300 uppercase tracking-[0.4em] mb-6">
                            SECURE CHECKOUT
                        </div>
                        <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-tight mb-4">
                            Finalize Your <span className="text-purple-500">Access.</span>
                        </h1>
                        <p className="text-zinc-400 text-sm font-medium">
                            Complete your details to activate your neural co-pilot.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-zinc-900/50 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-[2.5rem] -z-10" />

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase italic tracking-widest text-zinc-500 mb-2">Cardholder Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 transition-colors uppercase font-bold tracking-tight"
                                    placeholder="BALDUR SANJIN"
                                    onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase italic tracking-widest text-zinc-500 mb-2">Card Number</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        maxLength="19"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-11 text-sm focus:outline-none focus:border-purple-500/50 transition-colors font-mono tracking-widest"
                                        placeholder="0000 0000 0000 0000"
                                        onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                                    />
                                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase italic tracking-widest text-zinc-500 mb-2">Expiry Date</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 transition-colors font-mono tracking-widest"
                                        placeholder="MM/YY"
                                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase italic tracking-widest text-zinc-500 mb-2">CVV</label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            required
                                            maxLength="3"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-purple-500/50 transition-colors font-mono tracking-widest"
                                            placeholder="***"
                                            onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                                        />
                                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="w-full py-4 bg-purple-600 hover:bg-purple-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2 group/btn mt-4">
                                Authorize Payment <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                            <ShieldCheck size={14} className="text-emerald-500" />
                            Encrypted 256-bit Secure System Link
                        </div>
                    </form>
                </div>
            </main>

            <SharedFooter onViewChange={onViewChange} />
        </div>
    );
};

export default PaymentPage;
