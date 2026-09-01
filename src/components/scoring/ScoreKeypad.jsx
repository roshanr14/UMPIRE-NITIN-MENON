import React from 'react';
import { motion } from 'framer-motion';
import {
  RotateCcw,
  AlertOctagon,
  Plus,
  Play,
  Pause,
  ArrowLeftRight,
  Flag,
  RotateCw,
  RefreshCcw,
  Sparkles,
  Zap,
} from 'lucide-react';

export default function ScoreKeypad({
  match,
  canScore = true,
  undoCount = 0,
  onRecordRun,
  onOpenExtras,
  onOpenWicket,
  onUndo,
  onSwitchStrike,
  onOpenChangeBowler,
  onTogglePause,
  onConfirmEndInnings,
  onConfirmEndMatch,
  onConfirmReset,
}) {
  const isLive = match?.status === 'live';
  const isPaused = match?.status === 'paused';

  const runButtons = [
    { runs: 0, label: '0', sub: 'Dot Ball', style: 'bg-slate-900 hover:bg-slate-800 text-slate-100 border-slate-700/80' },
    { runs: 1, label: '1', sub: '1 Run', style: 'bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-200 border-emerald-700/60' },
    { runs: 2, label: '2', sub: '2 Runs', style: 'bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-200 border-emerald-700/60' },
    { runs: 3, label: '3', sub: '3 Runs', style: 'bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-200 border-emerald-700/60' },
    { runs: 4, label: '4', sub: 'FOUR', style: 'bg-gradient-to-br from-cyan-900 to-sky-950 hover:from-cyan-800 hover:to-sky-900 text-cyan-200 border-cyan-500/60 shadow-lg shadow-cyan-950/40' },
    { runs: 6, label: '6', sub: 'SIX', style: 'bg-gradient-to-br from-purple-900 via-indigo-950 to-pink-950 hover:from-purple-800 hover:to-pink-900 text-pink-200 border-pink-500/60 shadow-lg shadow-pink-950/40' },
  ];

  return (
    <div className="space-y-4">
      {/* Primary 1-Tap Scoring Buttons Grid */}
      <div className="p-5 sm:p-7 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-200 font-display">
              Umpire 1-Tap Scoring Console
            </h3>
          </div>

          {/* Large Undo Button */}
          <button
            type="button"
            onClick={onUndo}
            disabled={undoCount === 0}
            className={`px-4 py-2 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all active:scale-95 ${
              undoCount > 0
                ? 'bg-amber-950/80 hover:bg-amber-900 text-amber-300 border-amber-600 shadow-md shadow-amber-950/40 cursor-pointer'
                : 'bg-slate-950/50 text-slate-600 border-slate-800 cursor-not-allowed opacity-50'
            }`}
            title="Undo Last Action (Ctrl+Z)"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Undo Last Ball</span>
            {undoCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-black">
                {undoCount}
              </span>
            )}
          </button>
        </div>

        {/* Big Large Score Buttons */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-3.5">
          {runButtons.map((btn) => (
            <motion.button
              key={btn.runs}
              whileTap={{ scale: 0.92 }}
              disabled={!canScore || !isLive}
              onClick={() => onRecordRun(btn.runs)}
              className={`h-24 sm:h-28 rounded-2xl sm:rounded-3xl border flex flex-col items-center justify-center gap-1 transition-all score-btn cursor-pointer ${
                btn.style
              } ${!canScore || !isLive ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <span className="text-3xl sm:text-4xl font-black font-digit tracking-tight">
                {btn.label}
              </span>
              <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider opacity-80">
                {btn.sub}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Wicket & Extras Row */}
        <div className="grid grid-cols-2 gap-3.5 pt-2">
          {/* Extras Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            disabled={!canScore || !isLive}
            onClick={onOpenExtras}
            className={`py-4 sm:py-5 px-4 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-950 to-orange-950 hover:from-amber-900 hover:to-orange-900 border border-amber-500/60 text-amber-200 flex items-center justify-center gap-3 shadow-lg shadow-amber-950/40 transition-all score-btn cursor-pointer ${
              !canScore || !isLive ? 'opacity-40 cursor-not-allowed' : ''
            }`}
          >
            <Plus className="w-6 h-6 stroke-[3] text-amber-400" />
            <div className="text-left">
              <p className="text-base sm:text-lg font-black font-display uppercase tracking-tight">
                Extras
              </p>
              <p className="text-[10px] sm:text-xs text-amber-300/80 font-medium">
                Wide, No Ball, Bye, Leg Bye
              </p>
            </div>
          </motion.button>

          {/* Wicket Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            disabled={!canScore || !isLive}
            onClick={onOpenWicket}
            className={`py-4 sm:py-5 px-4 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-red-950 via-rose-950 to-red-900 hover:from-red-900 hover:to-rose-900 border-2 border-red-500 text-white flex items-center justify-center gap-3 shadow-xl shadow-red-950/60 transition-all score-btn cursor-pointer ${
              !canScore || !isLive ? 'opacity-40 cursor-not-allowed' : ''
            }`}
          >
            <AlertOctagon className="w-6 h-6 text-red-400 animate-pulse" />
            <div className="text-left">
              <p className="text-base sm:text-lg font-black font-display uppercase tracking-tight text-red-200">
                Wicket (OUT)
              </p>
              <p className="text-[10px] sm:text-xs text-red-300/80 font-medium">
                Bowled, Caught, LBW, Run Out
              </p>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Secondary Match Flow Actions Panel */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/70 border border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Switch Strike */}
          <button
            type="button"
            onClick={onSwitchStrike}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-all active:scale-95"
            title="Switch Striker Ends"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-400" />
            <span>Switch Strike</span>
          </button>

          {/* Change Bowler */}
          <button
            type="button"
            onClick={onOpenChangeBowler}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-all active:scale-95"
          >
            <RotateCw className="w-3.5 h-3.5 text-sky-400" />
            <span>Change Bowler</span>
          </button>

          {/* Pause / Resume */}
          <button
            type="button"
            onClick={onTogglePause}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition-all active:scale-95 ${
              isPaused
                ? 'bg-emerald-950 text-emerald-300 border-emerald-700 hover:bg-emerald-900'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isPaused ? 'Resume Match' : 'Pause Match'}</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* End Innings */}
          <button
            type="button"
            onClick={onConfirmEndInnings}
            className="px-3.5 py-2 rounded-xl bg-amber-950/50 hover:bg-amber-900 text-amber-300 font-bold text-xs flex items-center gap-1.5 border border-amber-800/60 transition-all active:scale-95"
          >
            <Flag className="w-3.5 h-3.5 text-amber-400" />
            <span>End Innings</span>
          </button>

          {/* End Match */}
          <button
            type="button"
            onClick={onConfirmEndMatch}
            className="px-3.5 py-2 rounded-xl bg-red-950/50 hover:bg-red-900 text-red-300 font-bold text-xs flex items-center gap-1.5 border border-red-800/60 transition-all active:scale-95"
          >
            <span>Conclude Match</span>
          </button>

          {/* Reset Scoreboard */}
          <button
            type="button"
            onClick={onConfirmReset}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-all"
            title="Reset Scoreboard"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
