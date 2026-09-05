import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider } from './context/AuthContext';
import { MatchProvider, useMatch } from './context/MatchContext';
import Header from './components/common/Header';
import Dashboard from './components/dashboard/Dashboard';
import LiveScoringView from './components/scoring/LiveScoringView';
import MatchSummary from './components/summary/MatchSummary';
import CreateMatchModal from './components/match-setup/CreateMatchModal';
import ShortcutsModal from './components/common/ShortcutsModal';
import AuthModal from './components/auth/AuthModal';
import VoiceAssistantBadge from './components/voice/VoiceAssistantBadge';
import { voiceEngine, speakConfirmation } from './lib/speech';
import { createDefaultTeam } from './lib/cricketEngine';

function MainApp() {
  const {
    match,
    createMatch,
    recordRun,
    recordExtra,
    recordWicket,
    undoLastAction,
    switchStrikeManual,
    setPendingOverChange,
  } = useMatch();

  // Auto-resume active scoring session if a match is live
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const activeMatch = localStorage.getItem('cric_active_match');
      if (activeMatch) {
        const parsed = JSON.parse(activeMatch);
        if (parsed && (parsed.status === 'live' || parsed.status === 'innings_break')) {
          return 'scoring';
        }
      }
    } catch {}
    return 'dashboard';
  });

  // Global Dialogs
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Voice Assistant state
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState(null);

  // Auto-initialize demo match if none exists on first launch
  useEffect(() => {
    if (!match) {
      const existing = localStorage.getItem('cric_matches_index');
      if (!existing || JSON.parse(existing).length === 0) {
        // Create initial demo match
        const tA = createDefaultTeam('Falcons Cricket Club', 'FCC', '#10b981');
        const tB = createDefaultTeam('Warriors XI', 'WAR', '#3b82f6');
        createMatch({
          teamA: tA,
          teamB: tB,
          format: 'T20',
          overs: 20,
          venue: 'Melbourne Cricket Ground',
          tossWinnerId: tA.id,
          tossDecision: 'bat',
          date: new Date().toISOString().split('T')[0],
          time: '14:30',
        });
      }
    }
  }, [match, createMatch]);

  // Voice Command Dispatcher (Handles live scorecard updates)
  const handleVoiceCommand = useCallback((cmd) => {
    if (!cmd) return;
    setLastCommand(cmd);

    // If match is not currently live, notify user
    if (!match || (match.status !== 'live' && match.status !== 'innings_break')) {
      speakConfirmation('No live match in progress');
      return;
    }

    switch (cmd.type) {
      case 'run':
        recordRun(cmd.value);
        if (cmd.value === 4) speakConfirmation('Four runs added');
        else if (cmd.value === 6) speakConfirmation('Sixer added');
        else if (cmd.value === 0) speakConfirmation('Dot ball');
        else speakConfirmation(`${cmd.value} run added`);
        break;
      case 'extra':
        recordExtra(cmd.extraType, cmd.runs || 1);
        if (cmd.extraType === 'wide') speakConfirmation('Wide ball recorded');
        else if (cmd.extraType === 'no_ball') speakConfirmation('No ball recorded');
        else if (cmd.extraType === 'leg_bye') speakConfirmation('Leg bye recorded');
        else if (cmd.extraType === 'bye') speakConfirmation('Bye recorded');
        break;
      case 'wicket':
        recordWicket({ dismissalType: cmd.dismissalType || 'bowled' });
        speakConfirmation('Wicket recorded');
        break;
      case 'undo':
        undoLastAction();
        speakConfirmation('Last ball undone');
        break;
      case 'switch_strike':
        switchStrikeManual();
        speakConfirmation('Strike switched');
        break;
      case 'end_over':
        setPendingOverChange(true);
        speakConfirmation('Over complete');
        break;
      default:
        break;
    }
  }, [match, recordRun, recordExtra, recordWicket, undoLastAction, switchStrikeManual, setPendingOverChange]);

  // Continuously sync fresh command handler to VoiceScoringEngine (eliminates stale closures)
  useEffect(() => {
    voiceEngine.setCommandHandler(handleVoiceCommand);
  }, [handleVoiceCommand]);

  useEffect(() => {
    voiceEngine.setStatusHandler((listening) => {
      setIsListeningVoice(listening);
    });
    voiceEngine.setTranscriptHandler((transcript) => {
      setLastTranscript(transcript);
    });
  }, []);

  const handleToggleVoice = () => {
    const active = voiceEngine.toggle(
      handleVoiceCommand,
      (listening) => {
        setIsListeningVoice(listening);
      },
      (transcript) => {
        setLastTranscript(transcript);
      }
    );
    setIsListeningVoice(active);
  };

  const handleCreateNewMatch = async (setupData) => {
    await createMatch(setupData);
    setActiveTab('scoring');
  };

  return (
    <div className="min-h-screen bg-[#050713] text-slate-100 flex flex-col relative selection:bg-cyan-500/30 selection:text-white font-sans">
      {/* Dynamic Animated Liquid Glass Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 transform-gpu">
        {/* Top-Left Fluid Cyan Orb */}
        <div className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full bg-cyan-500/15 blur-[120px] animate-fluid-1" />
        
        {/* Top-Right Fluid Violet Orb */}
        <div className="absolute -top-24 -right-24 w-[650px] h-[650px] rounded-full bg-purple-600/15 blur-[140px] animate-fluid-2" />
        
        {/* Center Accent Floating Aqua Orb */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[450px] h-[450px] rounded-full bg-indigo-500/10 blur-[130px] animate-fluid-3" />
        
        {/* Bottom-Left Fluid Rose Orb */}
        <div className="absolute -bottom-32 -left-20 w-[500px] h-[500px] rounded-full bg-rose-500/10 blur-[130px] animate-fluid-2" />
        
        {/* Bottom-Right Fluid Emerald Orb */}
        <div className="absolute -bottom-24 -right-24 w-[550px] h-[550px] rounded-full bg-emerald-500/10 blur-[120px] animate-fluid-1" />
      </div>

      {/* Top Floating Application Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        isListeningVoice={isListeningVoice}
        onToggleVoice={handleToggleVoice}
      />

      {/* Main Liquid Glass View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2.5 sm:px-6 lg:px-8 py-3 sm:py-6 relative z-10">
        {activeTab === 'dashboard' && (
          <Dashboard
            onOpenCreateMatch={() => setIsCreateOpen(true)}
            onNavigateToScoring={() => setActiveTab('scoring')}
            onNavigateToSummary={() => setActiveTab('summary')}
          />
        )}

        {activeTab === 'scoring' && (
          <LiveScoringView
            onNavigateToSummary={() => setActiveTab('summary')}
            onNavigateToDashboard={() => setActiveTab('dashboard')}
            onOpenShortcuts={() => setIsShortcutsOpen(true)}
            isListeningVoice={isListeningVoice}
            onToggleVoice={handleToggleVoice}
            lastVoiceTranscript={lastTranscript}
            lastVoiceCommand={lastCommand}
          />
        )}

        {activeTab === 'summary' && (
          <MatchSummary
            onNavigateToScoring={() => setActiveTab('scoring')}
          />
        )}
      </main>

      {/* Voice Assistant Floating Status Badge */}
      <VoiceAssistantBadge
        isListening={isListeningVoice}
        lastTranscript={lastTranscript}
        lastCommand={lastCommand}
        onToggle={handleToggleVoice}
        onClose={() => {
          voiceEngine.stop();
          setIsListeningVoice(false);
        }}
      />

      {/* Global Modals */}
      <CreateMatchModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreateMatch={handleCreateNewMatch}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MatchProvider>
        <MainApp />
      </MatchProvider>
    </AuthProvider>
  );
}
