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
    <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-[#060919]/80 border-b border-white/[0.08] px-2.5 sm:px-6 lg:px-8 py-2 sm:py-3 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        {/* Brand & Glass Logo Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none"
          >
            {/* Liquid Glass Icon Token */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl p-[1px] bg-gradient-to-br from-cyan-400/40 via-purple-500/30 to-rose-400/40 shadow-lg shadow-cyan-500/10 transition-transform duration-300 group-hover:scale-105 shrink-0">
              <div className="w-full h-full bg-[#0a0f26]/80 backdrop-blur-xl rounded-[11px] sm:rounded-[15px] flex items-center justify-center border border-white/10 group-hover:bg-[#0e1638]/90 transition-colors">
                <span className="text-sm sm:text-lg">🏏</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-sm sm:text-base lg:text-lg font-black tracking-tight sm:tracking-wide text-white font-sans">
                  UMPIRE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 text-glass-cyan">NITIN </span><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400">MENON</span>
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-400/30 font-mono shadow-sm">
                  ICC
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-sans tracking-normal hidden xs:flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                Live Umpire Scoring Console
              </p>
            </div>
          </div>

          {/* Liquid Glass Sync & Network Status Badge */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl rounded-full text-xs font-sans">
            {isOnline ? (
              syncStatus === 'syncing' ? (
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <Cloud className="w-3.5 h-3.5 animate-spin" />
                  <span className="font-medium">Syncing...</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Wifi className="w-3.5 h-3.5" />
                  <span className="font-medium">Cloud Synced</span>
                </span>
              )
            ) : (
              <span className="flex items-center gap-1.5 text-amber-300">
                <WifiOff className="w-3.5 h-3.5" />
                <span className="font-medium">Offline Active</span>
              </span>
            )}
          </div>
        </div>

        {/* View Navigation Tabs (Liquid Glass Pill Bar) */}
        <nav className="flex items-center gap-1 sm:gap-1.5 bg-white/[0.04] p-1 sm:p-1.5 border border-white/[0.08] backdrop-blur-2xl rounded-xl sm:rounded-2xl text-xs font-sans shadow-inner order-last sm:order-none w-full sm:w-auto justify-center">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`liquid-btn flex items-center justify-center gap-1.5 flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-semibold transition-all duration-200 text-xs ${
              activeTab === 'dashboard'
                ? 'liquid-btn-primary font-bold'
                : 'liquid-btn-secondary'
            }`}
          >
            <Home className="w-3.5 h-3.5 text-cyan-300" />
            <span>Dashboard</span>
          </button>

          {match && (
            <>
              <button
                onClick={() => setActiveTab('scoring')}
                className={`liquid-btn flex items-center justify-center gap-1.5 flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-bold transition-all duration-200 text-xs ${
                  activeTab === 'scoring'
                    ? 'liquid-btn-amber font-extrabold'
                    : 'liquid-btn-secondary'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-amber-300" />
                <span>Live Scoring</span>
                {match.status === 'live' && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('summary')}
                className={`liquid-btn flex items-center justify-center gap-1.5 flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-semibold transition-all duration-200 text-xs ${
                  activeTab === 'summary'
                    ? 'liquid-btn-primary font-bold'
                    : 'liquid-btn-secondary'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-purple-300" />
                <span>Scorecard</span>
              </button>
            </>
          )}
        </nav>

        {/* Quick Tools & Controls (Liquid Glass Buttons) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Voice Input Assistant Button */}
          <button
            type="button"
            onClick={onToggleVoice}
            title={isListeningVoice ? 'Voice Active (Mute)' : 'Enable Voice Assistant'}
            className={`liquid-btn px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-sans font-semibold flex items-center gap-1.5 sm:gap-2 ${
              isListeningVoice
                ? 'liquid-btn-rose font-bold animate-pulse'
                : 'liquid-btn-secondary'
            }`}
          >
            {isListeningVoice ? <Mic className="w-4 h-4 text-rose-300" /> : <MicOff className="w-4 h-4 text-slate-400" />}
            <span className="hidden md:inline">{isListeningVoice ? 'Voice Active' : 'Voice'}</span>
          </button>

          {/* Outdoor High Contrast Mode */}
          <button
            type="button"
            onClick={() => updateSettings({ highContrast: !settings.highContrast })}
            title={settings.highContrast ? 'Disable High-Contrast' : 'Enable High-Contrast'}
            className={`liquid-btn-icon w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${
              settings.highContrast
                ? 'liquid-btn-amber text-slate-950 font-bold'
                : 'liquid-btn-secondary'
            }`}
          >
            {settings.highContrast ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            title={settings.soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
            className="liquid-btn-icon w-8 h-8 sm:w-9 sm:h-9 rounded-xl liquid-btn-secondary"
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Keyboard Shortcuts Button */}
          <button
            type="button"
            onClick={onOpenShortcuts}
            title="Keyboard Hotkeys (Press ? or Space)"
            className="liquid-btn-icon w-8 h-8 sm:w-9 sm:h-9 rounded-xl liquid-btn-secondary hidden lg:inline-flex"
          >
            <Keyboard className="w-4 h-4 text-cyan-300" />
          </button>

          {/* User Account / Scorer Profile (Liquid Glass Card Button) */}
          <button
            type="button"
            onClick={onOpenAuth}
            className="liquid-btn p-1 sm:pl-2 sm:pr-3 sm:py-1.5 rounded-xl sm:rounded-2xl text-left gap-2"
          >
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 text-slate-950 font-extrabold text-xs flex items-center justify-center shadow-sm shrink-0">
              {user?.user_metadata?.name?.charAt(0) || 'N'}
            </div>
            <div className="hidden xl:block text-left leading-tight">
              <p className="text-xs font-bold text-white truncate max-w-[100px]">
                {user?.user_metadata?.name || 'Nitin Menon'}
              </p>
              <p className="text-[10px] text-cyan-300 font-medium">
                {user?.user_metadata?.role || 'Elite Umpire'}
              </p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
