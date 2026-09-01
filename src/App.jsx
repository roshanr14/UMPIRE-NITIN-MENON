import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MatchProvider, useMatch } from './context/MatchContext';
import Header from './components/common/Header';
import Dashboard from './components/dashboard/Dashboard';
import LiveScoringView from './components/scoring/LiveScoringView';
import MatchSummary from './components/summary/MatchSummary';
import AuditLogViewer from './components/audit/AuditLogViewer';
import CreateMatchModal from './components/match-setup/CreateMatchModal';
import ShortcutsModal from './components/common/ShortcutsModal';
import SupabaseModal from './components/common/SupabaseModal';
import AuthModal from './components/auth/AuthModal';
import VoiceAssistantBadge from './components/voice/VoiceAssistantBadge';
import { voiceEngine } from './lib/speech';
import { createDefaultTeam } from './lib/cricketEngine';

function MainApp() {
  const { match, createMatch, recordRun, recordExtra, undoLastAction, switchStrikeManual } = useMatch();

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'scoring' | 'summary' | 'audit'

  // Global Dialogs
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isSupabaseOpen, setIsSupabaseOpen] = useState(false);
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

  // Voice Command Dispatcher
  const handleVoiceCommand = useCallback((cmd) => {
    setLastCommand(cmd);
    if (!cmd) return;

    switch (cmd.type) {
      case 'run':
        recordRun(cmd.value);
        break;
      case 'extra':
        recordExtra(cmd.extraType, cmd.runs || 1);
        break;
      case 'undo':
        undoLastAction();
        break;
      case 'switch_strike':
        switchStrikeManual();
        break;
      default:
        break;
    }
  }, [recordRun, recordExtra, undoLastAction, switchStrikeManual]);

  const handleToggleVoice = () => {
    const active = voiceEngine.toggle(
      handleVoiceCommand,
      (listening, msg) => {
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
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Application Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenSupabase={() => setIsSupabaseOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        isListeningVoice={isListeningVoice}
        onToggleVoice={handleToggleVoice}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            onOpenCreateMatch={() => setIsCreateOpen(true)}
            onNavigateToScoring={() => setActiveTab('scoring')}
            onNavigateToSummary={() => setActiveTab('summary')}
            onNavigateToAudit={() => setActiveTab('audit')}
          />
        )}

        {activeTab === 'scoring' && (
          <LiveScoringView
            onNavigateToSummary={() => setActiveTab('summary')}
            onNavigateToDashboard={() => setActiveTab('dashboard')}
            onOpenShortcuts={() => setIsShortcutsOpen(true)}
          />
        )}

        {activeTab === 'summary' && (
          <MatchSummary
            onNavigateToScoring={() => setActiveTab('scoring')}
            onNavigateToAudit={() => setActiveTab('audit')}
          />
        )}

        {activeTab === 'audit' && <AuditLogViewer />}
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

      <SupabaseModal
        isOpen={isSupabaseOpen}
        onClose={() => setIsSupabaseOpen(false)}
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
