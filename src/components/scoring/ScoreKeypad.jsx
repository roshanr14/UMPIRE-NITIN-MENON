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
  Terminal,
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
    {
      runs: 0,
      label: '0',
      sub: 'DOT_BALL',
      style: 'bg-[#050814] text-slate-300 border-[#00f0ff]/30 hover:border-[#00f0ff] hover:text-[#00f0ff]',
    },
    {
      runs: 1,
      label: '1',
      sub: 'SINGLE',
      style: 'bg-[#050814] text-[#00f0ff] border-[#00f0ff]/40 hover:bg-[#00f0ff]/10 hover:border-[#00f0ff]',
    },
    {
      runs: 2,
      label: '2',
      sub: 'DOUBLE',
      style: 'bg-[#050814] text-[#00f0ff] border-[#00f0ff]/40 hover:bg-[#00f0ff]/10 hover:border-[#00f0ff]',
    },
    {
      runs: 3,
      label: '3',
      sub: 'TRIPLE',
      style: 'bg-[#050814] text-[#00f0ff] border-[#00f0ff]/40 hover:bg-[#00f0ff]/10 hover:border-[#00f0ff]',
    },
    {
      runs: 4,
      label: '4',
      sub: 'BOUNDARY',
      style: 'bg-gradient-to-br from-[#1a1700] to-[#0a0800] text-[#fcee0a] border-[#fcee0a] hover:bg-[#fcee0a]/20 shadow-lg shadow-[#fcee0a]/20 text-glow-yellow font-black',
    },
    {
      runs: 6,
      label: '6',
      sub: 'MAXIMUM',
      style: 'bg-gradient-to-br from-[#240011] to-[#0a0005] text-[#ff0055] border-[#ff0055] hover:bg-[#ff0055]/20 shadow-lg shadow-[#ff0055]/30 text-glow-pink font-black',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Primary Cyberpunk Scoring Console */}
      <div className="p-5 sm:p-7 rounded-3xl cyber-card border-2 border-[#00f0ff]/30 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#00f0ff]/15">
          <div className="flex items-center gap-2 font-cyber">
            <Zap className="w-5 h-5 text-[#fcee0a]" />
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
              HUD // SCORING_MATRIX_2077
            </h3>
          </div>

          {/* Large Undo Button */}
          <button
            type="button"
            onClick={onUndo}
            disabled={undoCount === 0}
            className={`px-4 py-2 rounded-xl border font-mono text-xs font-bold flex items-center gap-2 transition-all active:scale-95 ${
              undoCount > 0
                ? 'bg-[#fcee0a]/15 hover:bg-[#fcee0a]/30 text-[#fcee0a] border-[#fcee0a] shadow-md shadow-[#fcee0a]/20 cursor-pointer'
                : 'bg-[#050814] text-slate-600 border-slate-800 cursor-not-allowed opacity-40'
            }`}
            title="Undo Last Ball (Ctrl+Z)"
          >
            <RotateCcw className="w-4 h-4" />
            <span>ROLLBACK</span>
            {undoCount > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-[#fcee0a] text-black text-[10px] font-black">
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
              className={`h-24 sm:h-28 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all score-btn cursor-pointer ${
                btn.style
              } ${!canScore || !isLive ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <span className="text-3xl sm:text-4xl font-black font-digit tracking-tight">
                {btn.label}
              </span>
              <span className="text-[9px] sm:text-[10px] font-black font-mono uppercase tracking-widest">
                {btn.sub}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Wicket & Extras Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
          {/* Extras Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            disabled={!canScore || !isLive}
            onClick={onOpenExtras}
            className={`py-4 px-5 rounded-2xl bg-gradient-to-r from-[#1f1600] to-[#0a0800] border-2 border-[#fcee0a]/80 text-[#fcee0a] flex items-center justify-center gap-3.5 shadow-lg shadow-[#fcee0a]/15 transition-all score-btn cursor-pointer ${
              !canScore || !isLive ? 'opacity-40 cursor-not-allowed' : ''
            }`}
          >
            <Plus className="w-6 h-6 stroke-[3] text-[#fcee0a]" />
            <div className="text-left">
              <p className="text-base sm:text-lg font-black font-cyber uppercase tracking-wider text-glow-yellow">
                EXTRAS // PROTOCOL
              </p>
              <p className="text-[10px] font-mono text-slate-300">
                Wide • No Ball • Bye • Leg Bye • Penalty
              </p>
            </div>
          </motion.button>

          {/* Wicket Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            disabled={!canScore || !isLive}
            onClick={onOpenWicket}
            className={`py-4 px-5 rounded-2xl bg-gradient-to-r from-[#29000a] to-[#0d0004] border-2 border-[#ff0055] text-white flex items-center justify-center gap-3.5 shadow-xl shadow-[#ff0055]/30 transition-all score-btn cursor-pointer ${
              !canScore || !isLive ? 'opacity-40 cursor-not-allowed' : ''
            }`}
          >
            <AlertOctagon className="w-6 h-6 text-[#ff0055] animate-pulse" />
            <div className="text-left">
              <p className="text-base sm:text-lg font-black font-cyber uppercase tracking-wider text-[#ff0055] text-glow-pink">
                WICKET // ELIMINATED
              </p>
              <p className="text-[10px] font-mono text-slate-300">
                Bowled • Caught • LBW • Run Out • Stumped
              </p>
            </div>
          </motion.button>
        </div>

        {/* Secondary Match Flow Controls Toolbar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-[#00f0ff]/15 font-mono text-xs">
          {/* Switch Strike */}
          <button
            type="button"
            onClick={onSwitchStrike}
            disabled={!isLive}
            className="py-2.5 px-3 rounded-xl bg-[#050814] hover:bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>SWAP_STRIKE</span>
          </button>

          {/* Change Bowler */}
          <button
            type="button"
            onClick={onOpenChangeBowler}
            disabled={!isLive}
            className="py-2.5 px-3 rounded-xl bg-[#050814] hover:bg-[#fcee0a]/10 text-[#fcee0a] border border-[#fcee0a]/30 font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>BOWLER_SWAP</span>
          </button>

          {/* Pause / Resume Match */}
          <button
            type="button"
            onClick={onTogglePause}
            className={`py-2.5 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition-all ${
              isPaused
                ? 'bg-[#39ff14]/20 text-[#39ff14] border-[#39ff14]'
                : 'bg-[#050814] text-slate-300 border-[#00f0ff]/30 hover:border-[#00f0ff]'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-[#39ff14]" /> : <Pause className="w-3.5 h-3.5 text-[#fcee0a]" />}
            <span>{isPaused ? 'RESUME_HUD' : 'PAUSE_HUD'}</span>
          </button>

          {/* End Match / Innings */}
          {match.currentInningsNumber === 1 ? (
            <button
              type="button"
              onClick={onConfirmEndInnings}
              className="py-2.5 px-3 rounded-xl bg-[#050814] hover:bg-[#ff0055]/20 text-[#ff0055] border border-[#ff0055]/40 font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>END_INN_1</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onConfirmEndMatch}
              className="py-2.5 px-3 rounded-xl bg-[#050814] hover:bg-[#ff0055]/20 text-[#ff0055] border border-[#ff0055]/40 font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>FINISH_MATCH</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
