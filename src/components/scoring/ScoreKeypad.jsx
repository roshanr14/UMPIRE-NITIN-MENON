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
}) {
  const isLive = match?.status === 'live';
  const isPaused = match?.status === 'paused';

  const runButtons = [
    {
      runs: 0,
      label: '0',
      sub: 'Dot Ball',
      style: 'bg-white/[0.04] text-slate-200 border-white/[0.1] hover:border-cyan-400/50 hover:bg-white/[0.08]',
    },
    {
      runs: 1,
      label: '1',
      sub: '1 Run',
      style: 'bg-white/[0.04] text-cyan-300 border-white/[0.1] hover:border-cyan-400/60 hover:bg-cyan-500/10',
    },
    {
      runs: 2,
      label: '2',
      sub: '2 Runs',
      style: 'bg-white/[0.04] text-cyan-300 border-white/[0.1] hover:border-cyan-400/60 hover:bg-cyan-500/10',
    },
    {
      runs: 3,
      label: '3',
      sub: '3 Runs',
      style: 'bg-white/[0.04] text-cyan-300 border-white/[0.1] hover:border-cyan-400/60 hover:bg-cyan-500/10',
    },
    {
      runs: 4,
      label: '4',
      sub: 'FOUR (4)',
      style: 'bg-gradient-to-br from-amber-500/25 to-amber-600/10 text-amber-300 border-amber-400/50 hover:bg-amber-500/35 hover:border-amber-400/70 shadow-lg shadow-amber-500/15 font-black',
    },
    {
      runs: 6,
      label: '6',
      sub: 'SIX (6)',
      style: 'bg-gradient-to-br from-rose-500/25 to-purple-600/20 text-rose-300 border-rose-400/50 hover:bg-rose-500/35 hover:border-rose-400/70 shadow-lg shadow-rose-500/20 font-black',
    },
  ];

  return (
    <div className="space-y-4 font-sans">
      {/* Primary Liquid Glass Scoring Console */}
      <div className="p-5 sm:p-7 rounded-3xl glass-panel border border-white/[0.14] shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300">
              <Zap className="w-4 h-4 text-cyan-400" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white font-display">
              Scoring Console
            </h3>
          </div>

          {/* Large Undo Button (Frosted Glass Pill) */}
          <button
            type="button"
            onClick={onUndo}
            disabled={undoCount === 0}
            className={`liquid-btn px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              undoCount > 0
                ? 'liquid-btn-amber'
                : 'liquid-btn-secondary opacity-40 cursor-not-allowed'
            }`}
            title="Undo Last Ball (Ctrl+Z)"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Undo Ball</span>
            {undoCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
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
              whileTap={{ scale: 0.94 }}
              disabled={!canScore || !isLive}
              onClick={() => onRecordRun(btn.runs)}
              className={`score-btn liquid-btn h-24 sm:h-28 rounded-2xl flex flex-col items-center justify-center gap-1 ${
                btn.runs === 4
                  ? 'liquid-btn-amber font-black'
                  : btn.runs === 6
                  ? 'liquid-btn-rose font-black'
                  : btn.runs > 0
                  ? 'liquid-btn-primary font-bold'
                  : 'liquid-btn-secondary font-semibold'
              } ${!canScore || !isLive ? 'opacity-35 cursor-not-allowed' : ''}`}
            >
              <span className="text-3xl sm:text-4xl font-black font-digit tracking-tight">
                {btn.label}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider opacity-90 font-sans">
                {btn.sub}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Wicket & Extras Row (Frosted Glass Panels) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
          {/* Extras Button */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            disabled={!canScore || !isLive}
            onClick={onOpenExtras}
            className={`liquid-btn liquid-btn-amber py-4 px-5 rounded-2xl flex items-center justify-center gap-3.5 ${
              !canScore || !isLive ? 'opacity-35 cursor-not-allowed' : ''
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="text-left">
              <p className="text-base sm:text-lg font-bold font-display tracking-tight text-amber-300">
                Extras
              </p>
              <p className="text-[11px] text-slate-300">
                Wide • No Ball • Bye • Leg Bye • Penalty
              </p>
            </div>
          </motion.button>

          {/* Wicket Button */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            disabled={!canScore || !isLive}
            onClick={onOpenWicket}
            className={`liquid-btn liquid-btn-rose py-4 px-5 rounded-2xl flex items-center justify-center gap-3.5 ${
              !canScore || !isLive ? 'opacity-35 cursor-not-allowed' : ''
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-300 animate-pulse shrink-0">
              <AlertOctagon className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="text-left">
              <p className="text-base sm:text-lg font-bold font-display tracking-tight text-rose-300">
                Wicket (OUT)
              </p>
              <p className="text-[11px] text-slate-300">
                Bowled • Caught • LBW • Run Out • Stumped
              </p>
            </div>
          </motion.button>
        </div>

        {/* Secondary Match Flow Controls Toolbar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-white/[0.08] text-xs font-semibold">
          {/* Switch Strike */}
          <button
            type="button"
            onClick={onSwitchStrike}
            disabled={!isLive}
            className="liquid-btn liquid-btn-secondary py-2.5 px-3 rounded-xl text-cyan-300 hover:text-white flex items-center justify-center gap-2"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Switch Strike</span>
          </button>

          {/* Change Bowler */}
          <button
            type="button"
            onClick={onOpenChangeBowler}
            disabled={!isLive}
            className="liquid-btn liquid-btn-secondary py-2.5 px-3 rounded-xl text-amber-300 hover:text-white flex items-center justify-center gap-2"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Change Bowler</span>
          </button>

          {/* Pause / Resume Match */}
          <button
            type="button"
            onClick={onTogglePause}
            className={`liquid-btn py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 ${
              isPaused
                ? 'liquid-btn-emerald font-bold'
                : 'liquid-btn-secondary'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-300" /> : <Pause className="w-3.5 h-3.5 text-amber-300" />}
            <span>{isPaused ? 'Resume Match' : 'Pause Match'}</span>
          </button>

          {/* End Match / Innings */}
          {match.currentInningsNumber === 1 ? (
            <button
              type="button"
              onClick={onConfirmEndInnings}
              className="liquid-btn liquid-btn-rose py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>End 1st Innings</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onConfirmEndMatch}
              className="liquid-btn liquid-btn-rose py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>End Match</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
