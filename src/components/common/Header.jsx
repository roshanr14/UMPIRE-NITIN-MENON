import React from 'react';
import {
  Wifi,
  WifiOff,
  Cloud,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Mic,
  MicOff,
  Keyboard,
  Activity,
  FileText,
  Home,
  Zap,
  Terminal,
} from 'lucide-react';
import { useMatch } from '../../context/MatchContext';
import { useAuth } from '../../context/AuthContext';

export default function Header({
  activeTab,
  setActiveTab,
  onOpenShortcuts,
  onOpenAuth,
  isListeningVoice,
  onToggleVoice,
}) {
  const { match, isOnline, syncStatus, settings, updateSettings } = useMatch();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#030712]/95 backdrop-blur-md border-b border-[#00f0ff]/20 px-3 sm:px-6 lg:px-8 py-2.5 transition-colors shadow-lg shadow-[#00f0ff]/5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Cyberpunk HUD Title */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#fcee0a] to-[#ff0055] p-[1.5px] cyber-clip">
              <div className="w-full h-full bg-[#050814] flex items-center justify-center group-hover:bg-[#00f0ff]/10 transition-colors">
                <span className="text-lg">🏏</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black tracking-wider text-white font-cyber">
                  CRIC<span className="text-[#00f0ff] text-glow-cyan">//</span><span className="text-[#fcee0a] text-glow-yellow">2077</span>
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#fcee0a]/10 text-[#fcee0a] border border-[#fcee0a]/40 font-mono">
                  HUD
                </span>
              </div>
              <p className="text-[10px] text-[#00f0ff]/70 font-mono tracking-tight flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-ping" />
                LIVE UMPIRE SCORING
              </p>
            </div>
          </div>

          {/* Cyber Sync & Network Status Badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-[#050814] border border-[#00f0ff]/20 rounded-md font-mono text-[11px]">
            {isOnline ? (
              syncStatus === 'syncing' ? (
                <span className="flex items-center gap-1.5 text-[#00f0ff]">
                  <Cloud className="w-3.5 h-3.5 animate-spin" />
                  <span>SYNCING...</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[#39ff14]">
                  <Wifi className="w-3.5 h-3.5" />
                  <span>SYNCED</span>
                </span>
              )
            ) : (
              <span className="flex items-center gap-1.5 text-[#fcee0a]">
                <WifiOff className="w-3.5 h-3.5" />
                <span>OFFLINE READY</span>
              </span>
            )}
          </div>
        </div>

        {/* View Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-[#050814] p-1 border border-[#00f0ff]/25 rounded-xl font-cyber text-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-[#00f0ff] text-[#030712] shadow-md shadow-[#00f0ff]/40'
                : 'text-slate-400 hover:text-[#00f0ff] hover:bg-[#00f0ff]/5'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Dashboard</span>
          </button>

          {match && (
            <>
              <button
                onClick={() => setActiveTab('scoring')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === 'scoring'
                    ? 'bg-[#fcee0a] text-[#030712] shadow-md shadow-[#fcee0a]/40 font-black'
                    : 'text-slate-400 hover:text-[#fcee0a] hover:bg-[#fcee0a]/5'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-[#ff0055]" />
                <span>Live Scoring</span>
                {match.status === 'live' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff0055] animate-ping" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('summary')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === 'summary'
                    ? 'bg-[#00f0ff] text-[#030712] shadow-md shadow-[#00f0ff]/40 font-black'
                    : 'text-slate-400 hover:text-[#00f0ff] hover:bg-[#00f0ff]/5'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Scorecard</span>
              </button>
            </>
          )}
        </nav>

        {/* Quick Tools & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Voice Input Assistant Button */}
          <button
            type="button"
            onClick={onToggleVoice}
            title={isListeningVoice ? 'Voice Active (Mute)' : 'Enable Voice'}
            className={`p-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              isListeningVoice
                ? 'bg-[#ff0055] text-white border-[#ff0055] shadow-lg shadow-[#ff0055]/50 animate-pulse'
                : 'bg-[#050814] text-[#00f0ff] border-[#00f0ff]/30 hover:border-[#00f0ff]'
            }`}
          >
            {isListeningVoice ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4 text-slate-400" />}
            <span className="hidden xl:inline">{isListeningVoice ? 'VOICE ON' : 'VOICE'}</span>
          </button>

          {/* Outdoor High Contrast Mode */}
          <button
            type="button"
            onClick={() => updateSettings({ highContrast: !settings.highContrast })}
            title={settings.highContrast ? 'Disable High-Contrast' : 'Enable High-Contrast HUD'}
            className={`p-2 rounded-xl border transition-all ${
              settings.highContrast
                ? 'bg-[#fcee0a] text-black border-[#fcee0a] font-black'
                : 'bg-[#050814] text-slate-300 border-[#00f0ff]/20 hover:border-[#00f0ff]/60'
            }`}
          >
            {settings.highContrast ? <Sun className="w-4 h-4 text-black" /> : <Moon className="w-4 h-4 text-[#00f0ff]" />}
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            title={settings.soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
            className="p-2 rounded-xl bg-[#050814] text-slate-300 border border-[#00f0ff]/20 hover:border-[#00f0ff]/60 transition-all"
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-[#39ff14]" /> : <VolumeX className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Keyboard Shortcuts Button */}
          <button
            type="button"
            onClick={onOpenShortcuts}
            title="Keyboard Hotkeys (Press ? or Space)"
            className="p-2 rounded-xl bg-[#050814] text-[#00f0ff] border border-[#00f0ff]/20 hover:border-[#00f0ff]/60 transition-all hidden md:flex items-center"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* User Account / Scorer Profile */}
          <button
            type="button"
            onClick={onOpenAuth}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-[#050814] border border-[#00f0ff]/25 hover:border-[#00f0ff] transition-all text-left"
          >
            <div className="w-7 h-7 bg-gradient-to-br from-[#00f0ff] to-[#b000ff] text-[#030712] font-black font-cyber text-xs flex items-center justify-center rounded-lg">
              {user?.user_metadata?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden lg:block text-left leading-tight">
              <p className="text-xs font-bold text-white font-cyber truncate max-w-[90px]">
                {user?.user_metadata?.name || 'Umpire'}
              </p>
              <p className="text-[9px] text-[#00f0ff] font-mono">
                {user?.user_metadata?.role || 'Lead Scorer'}
              </p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
