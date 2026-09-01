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
  History,
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
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Match Status */}
        <div className="flex items-center gap-3.5">
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-950/50 group-hover:scale-105 transition-transform border border-emerald-400/30">
              <span className="text-xl">🏏</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-white font-display">
                  Cric<span className="text-emerald-400">Umpire</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/50">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Official Umpire Live Control
              </p>
            </div>
          </div>

          {/* Sync & Connectivity Status Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all">
            {isOnline ? (
              syncStatus === 'syncing' ? (
                <span className="flex items-center gap-1.5 text-sky-400 bg-sky-950/50 border-sky-800/40 px-2.5 py-0.5 rounded-full border">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                  <Cloud className="w-3.5 h-3.5 animate-spin" />
                  Syncing Match Data...
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/50 border-emerald-800/40 px-2.5 py-0.5 rounded-full border">
                  <Wifi className="w-3.5 h-3.5" />
                  All Scores Successfully Synced
                </span>
              )
            ) : (
              <span className="flex items-center gap-1.5 text-amber-300 bg-amber-950/60 border-amber-800/50 px-2.5 py-0.5 rounded-full border shadow-sm">
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                Offline – Scores Saved Locally
              </span>
            )}
          </div>
        </div>

        {/* View Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Dashboard</span>
          </button>

          {match && (
            <>
              <button
                onClick={() => setActiveTab('scoring')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'scoring'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live Scoring</span>
                {match.status === 'live' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('summary')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'summary'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
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
            title={isListeningVoice ? 'Voice Assistant Active (Click to mute)' : 'Enable Voice Scoring'}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isListeningVoice
                ? 'bg-rose-600 text-white border-rose-400 shadow-md shadow-rose-900/40 animate-pulse'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
            }`}
          >
            {isListeningVoice ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4 text-slate-400" />}
            <span className="hidden xl:inline">{isListeningVoice ? 'Listening...' : 'Voice'}</span>
          </button>

          {/* Outdoor High Contrast Toggle */}
          <button
            type="button"
            onClick={() => updateSettings({ highContrast: !settings.highContrast })}
            title={settings.highContrast ? 'Disable Outdoor Mode' : 'Enable High-Contrast Outdoor Mode'}
            className={`p-2 rounded-xl border transition-all ${
              settings.highContrast
                ? 'bg-amber-500 text-black border-amber-400 font-bold'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
            }`}
          >
            {settings.highContrast ? <Sun className="w-4 h-4 text-black" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            title={settings.soundEnabled ? 'Mute Scoring Audio' : 'Unmute Scoring Audio'}
            className="p-2 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white transition-all"
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Keyboard Shortcuts Button */}
          <button
            type="button"
            onClick={onOpenShortcuts}
            title="Keyboard Hotkeys (Press ? or Space)"
            className="p-2 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white transition-all hidden md:flex items-center"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* User Account / Scorer Profile */}
          <button
            type="button"
            onClick={onOpenAuth}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-left"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
              {user?.user_metadata?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden lg:block text-left leading-tight">
              <p className="text-xs font-bold text-slate-200 truncate max-w-[90px]">
                {user?.user_metadata?.name || 'Umpire'}
              </p>
              <p className="text-[10px] text-slate-400">
                {user?.user_metadata?.role || 'Lead Scorer'}
              </p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
