import SofiaImg from '../assets/SOFIA.png';
import DutchImg from '../assets/DUTCH.png';
import EvaImg from '../assets/EVA.png'; // Need to check path
import NovaImg from '../assets/NOVA.png';
import GobiImg from '../assets/GOBI.png';

import SofiaAudio from '../assets/sofia_agent.wav';
import DutchAudio from '../assets/dutch_agent.wav';
import EvaAudio from '../assets/eva_agent.wav';
import ZoyaAudio from '../assets/zoya_agent.wav';
import AaravAudio from '../assets/aarav_agent.wav';

import React from 'react';
import { Sparkles, Zap, CalendarCheck, Code2, Brain } from 'lucide-react';

export const voices = [
    {
        id: "sofia",
        name: "Sofia",
        speaker: "Sofia Hellen",
        role: "Social Architect",
        text: "Hello! I am Sofia, your neural companion.",
        audio: SofiaAudio,
        speed: 1.25,
        image: SofiaImg,
        icon: <Sparkles size={24} />,
        color: "rose",
        gradient: "from-rose-500/20 to-rose-600/5",
        border: "border-rose-500/30",
        text_color: "text-rose-500",
        activeBorder: "border-rose-500",
        bg: "bg-rose-500/20"
    },
    {
        id: "dutch",
        name: "Dutch",
        speaker: "Baldur Sanjin",
        role: "Tactical Vanguard",
        text: "Dutch here. Systems are optimized and ready for deployment.",
        audio: DutchAudio,
        speed: 1.25,
        image: DutchImg,
        icon: <Zap size={24} />,
        color: "blue",
        gradient: "from-blue-500/20 to-blue-600/5",
        border: "border-blue-500/30",
        text_color: "text-blue-500",
        activeBorder: "border-blue-500",
        bg: "bg-blue-500/20"
    },
    {
        id: "eva",
        name: "Eva",
        speaker: "Annmarie Nele",
        role: "Operations Officer",
        text: "Eva here. I've organized your schedule for maximum efficiency.",
        audio: EvaAudio,
        speed: 1.25,
        image: EvaImg,
        icon: <CalendarCheck size={24} />,
        color: "emerald",
        gradient: "from-emerald-500/20 to-emerald-600/5",
        border: "border-emerald-500/30",
        text_color: "text-emerald-500",
        activeBorder: "border-emerald-500",
        bg: "bg-emerald-500/20"
    },
    {
        id: "zoya",
        name: "Zoya",
        speaker: "Zoya Khan",
        role: "Urdu Specialist",
        text: "السلام علیکم! میں زویا ہوں۔ میں آپ کی اردو اسپیشلسٹ ہوں اور آپ کی بہتر مدد کے لیے تیار ہوں۔",
        audio: ZoyaAudio,
        speed: 1.25,
        image: NovaImg,
        icon: <Code2 size={24} />,
        color: "violet",
        gradient: "from-violet-500/20 to-violet-600/5",
        border: "border-violet-500/30",
        text_color: "text-violet-500",
        activeBorder: "border-violet-500",
        bg: "bg-violet-500/20"
    },
    {
        id: "aarav",
        name: "Aarav",
        speaker: "Aarav Sharma",
        role: "Hindi Specialist",
        text: "नमस्ते! मैं आरव हूँ, आपका हिंदी असिस्टेंट।",
        audio: AaravAudio,
        speed: 1.3,
        image: GobiImg,
        icon: <Brain size={24} />,
        color: "amber",
        gradient: "from-amber-500/20 to-amber-600/5",
        border: "border-amber-500/30",
        text_color: "text-amber-500",
        activeBorder: "border-amber-500",
        bg: "bg-amber-500/20"
    }
];
