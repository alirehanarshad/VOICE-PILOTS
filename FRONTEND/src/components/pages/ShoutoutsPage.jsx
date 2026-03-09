import * as React from 'react';
import { motion as Motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import SharedNav from '../layout/SharedNav';
import SharedFooter from '../layout/SharedFooter';

const REVIEWS = [
    { name: "Dave Morin", handle: "@davemorin", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dave", quote: "At this point I don't even know what to call @voicepilots. It is something new. After a few weeks in with it, this is the first time I have felt like the future is here." },
    { name: "C. Nakazawa", handle: "@cnakazawa", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chris", quote: "VoicePilots is the first tool which I constantly check on GitHub. It's hard to put into words how much it has changed my productivity workflow. The integration is seamless." },
    { name: "Nofil AI", handle: "@nofil_ai", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nofil", quote: "@voicepilots is Jarvis. It already exists. The speed at which it converts voice to complex autonomous actions is simply mind-blowing. Truly a generational leap in AI interaction." },
    { name: "Greg S.", handle: "@thesayheygreg", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Greg", quote: "Updates from @voicepilots absolutely rule. Every time I think they've reached the limit of autonomous execution, they push it even further. It's my daily driver now." },
    { name: "Sarah Chen", handle: "@sarahc_dev", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", quote: "The way it understands semantic intent rather than just literal commands is a game-changer. It feels like it's actually listening to me and anticipating my next move." },
    { name: "Alex Rivera", handle: "@arivera_os", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex", quote: "Finally, a voice assistant that doesn't just talk back, but actually gets work done. My browser is now an extension of my voice. I can't imagine going back to typing everything." },
    { name: "Jonah Ships", handle: "@jonahships_", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jonah", quote: "Setup @voicepilots by @steipete yesterday. All I have to say is, wow. First I was using my Claude Max sub and I used all of my limit quickly... now it just runs on that. Incredible." },
    { name: "Aryeh Dubois", handle: "@AryehDubois", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aryeh", quote: "Tried VoicePilots. I tried to build my own AI assistant bots before, and I am very impressed how many hard things they get right. Persistent memory, persona onboarding, COMMS integration. AWESOME." },
    { name: "Mark Jaquith", handle: "@markjaquith", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mark", quote: "I've been saying for like six months that even if LLMs suddenly stopped improving, we could spend *years* discovering new transformative uses. @voicepilots feels like that kind of 'just had to glue all the parts together' leap forward." }
];

const ShoutoutsPage = ({ isLoggedIn, onViewChange, onLogout }) => {
    return (
        <div className="min-h-screen bg-[#020203] text-white selection:bg-rose-500/30">
            <SharedNav view="shoutouts" onViewChange={onViewChange} isLoggedIn={isLoggedIn} onLogout={onLogout} />

            <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                {/* Back Button */}
                <Motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => onViewChange('landing')}
                    className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest mb-12 group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to home
                </Motion.button>

                {/* Header Section */}
                <div className="text-center mb-24">
                    <Motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-center gap-4 mb-6"
                    >
                        <span className="text-4xl md:text-5xl font-black text-rose-500 italic leading-none">{'>'}</span>
                        <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-tight">Shoutouts</h1>
                    </Motion.div>
                    <Motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-zinc-500 text-lg md:text-xl font-medium"
                    >
                        What the community is saying about VoicePilots
                    </Motion.p>
                </div>

                {/* Reviews Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {REVIEWS.map((review, idx) => (
                        <Motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ y: -5, transition: { duration: 0.2 } }}
                            className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] backdrop-blur-xl hover:border-rose-500/30 transition-all duration-500 group flex flex-col h-full"
                        >
                            <div className="flex gap-4 mb-6">
                                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/10 shrink-0">
                                    <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex flex-col justify-center overflow-hidden">
                                    <p className="text-sm font-bold text-white uppercase italic tracking-tighter truncate">
                                        {review.name}
                                    </p>
                                    <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest italic">{review.handle}</p>
                                </div>
                            </div>

                            <div className="flex-grow">
                                <p className="text-white text-[15px] font-medium leading-relaxed italic mb-4">
                                    "{review.quote}"
                                </p>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-[9px] font-black text-rose-500 uppercase tracking-[0.3em]">Verified Community Member</p>
                            </div>
                        </Motion.div>
                    ))}
                </div>
            </main>

            {/* Footer-like CTA */}
            <section className="py-24 border-t border-white/5 bg-white/[0.01]">
                <div className="max-w-4xl mx-auto text-center px-6">
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-8">Ready to join the community?</h2>
                    <button
                        onClick={() => onViewChange('login')}
                        className="px-10 py-5 bg-rose-500 hover:bg-rose-600 text-white rounded-full font-black uppercase tracking-[0.2em] transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-rose-500/20"
                    >
                        Launch Your Agent
                    </button>
                </div>
            </section>

            <SharedFooter onViewChange={onViewChange} />
        </div>
    );
};

export default ShoutoutsPage;
