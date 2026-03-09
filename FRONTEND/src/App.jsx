import React, { useState, useEffect, Suspense, lazy } from 'react';
import LandingPage from './components/pages/LandingPage';
import { voices } from './data/voices';

const AuthPage = lazy(() => import('./components/pages/AuthPage'));
const PricingPage = lazy(() => import('./components/pages/PricingPage'));
const AboutPage = lazy(() => import('./components/pages/AboutPage'));
const MindsPage = lazy(() => import('./components/pages/MindsPage'));
const PrivacyPage = lazy(() => import('./components/pages/PrivacyPage'));
const ContactPage = lazy(() => import('./components/pages/ContactPage'));
const SelectionPage = lazy(() => import('./components/pages/SelectionPage'));
const ChatPage = lazy(() => import('./components/pages/ChatPage'));
const PilotsPage = lazy(() => import('./components/pages/Pilots'));
const PaymentPage = lazy(() => import('./components/pages/PaymentPage'));
const DownloadPage = lazy(() => import('./components/pages/DownloadPage'));
const ShoutoutsPage = lazy(() => import('./components/pages/ShoutoutsPage'));


const App = () => {
  const [view, setView] = useState('landing'); // 'landing', 'selection', 'chat', 'login', 'signup', 'contact', 'about', 'privacy', 'pricing', 'minds', 'pilots', 'payment', 'download'
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [savedSessions, setSavedSessions] = useState([]);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasPlan, setHasPlan] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  const handleSetSelectedVoice = (voice) => {
    if (selectedVoice?.id !== voice.id) {
      setMessages([]); // Start a fresh Link for a different Agent
      setActiveSessionId(`session_${Date.now()}`); // Force new backend session
    }
    setSelectedVoice(voice);
  };

  const handleLaunchAgent = () => {
    if (isLoggedIn) {
      if (hasPlan) {
        setView('selection');
      } else {
        setView('pricing');
      }
    } else {
      setView('login');
    }
  };

  const handleLoginSubmit = () => {
    setIsLoggedIn(true);
    setView('landing'); // Redirect to home after login
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setView('landing');
  };

  const renderView = () => {
    if (view === 'login' || view === 'signup') return <AuthPage type={view} onViewChange={setView} onLoginSubmit={handleLoginSubmit} />;
    if (view === 'pricing') return <PricingPage isLoggedIn={isLoggedIn} onViewChange={setView} onLogout={handleLogout} />;
    if (view === 'payment') return <PaymentPage isLoggedIn={isLoggedIn} onViewChange={setView} onLogout={handleLogout} setHasPlan={setHasPlan} />;
    if (view === 'download') return <DownloadPage isLoggedIn={isLoggedIn} onViewChange={setView} onLogout={handleLogout} />;
    if (view === 'about') return <AboutPage isLoggedIn={isLoggedIn} onViewChange={setView} onLogout={handleLogout} />;
    if (view === 'minds') return <MindsPage isLoggedIn={isLoggedIn} onViewChange={setView} onLogout={handleLogout} />;
    if (view === 'pilots') return <PilotsPage isLoggedIn={isLoggedIn} onViewChange={setView} onLogout={handleLogout} onSetSelectedVoice={handleSetSelectedVoice} voices={voices} />;
    if (view === 'privacy') return <PrivacyPage isLoggedIn={isLoggedIn} onViewChange={setView} onLogout={handleLogout} />;
    if (view === 'contact') return <ContactPage isLoggedIn={isLoggedIn} onViewChange={setView} onLogout={handleLogout} />;
    if (view === 'selection') return <SelectionPage onViewChange={setView} onSetSelectedVoice={handleSetSelectedVoice} voices={voices} />;

    if (view === 'chat') {
      return <ChatPage
        selectedVoice={selectedVoice}
        onViewChange={setView}
        messages={messages}
        setMessages={setMessages}
        isRecording={isRecording}
        setIsRecording={setIsRecording}
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
        savedSessions={savedSessions}
        setSavedSessions={setSavedSessions}
        activeSessionId={activeSessionId}
        setActiveSessionId={setActiveSessionId}
        voices={voices}
        onSetSelectedVoice={handleSetSelectedVoice}
      />;
    }

    if (view === 'shoutouts') return <ShoutoutsPage isLoggedIn={isLoggedIn} onViewChange={setView} onLogout={handleLogout} />;

    return <LandingPage isLoggedIn={isLoggedIn} onViewChange={setView} onLaunchAgent={handleLaunchAgent} />;
  };

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#020203] flex items-center justify-center text-white">
        <div className="w-8 h-8 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
      </div>
    }>
      {renderView()}
    </Suspense>
  );
};

export default App;