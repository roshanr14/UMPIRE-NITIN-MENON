import React from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Clock, Zap, Activity } from 'lucide-react';
import { formatOvers, calculateCRR, calculateRRR } from '../../lib/cricketEngine';

export default function ScoreboardBanner({ match, currentInnings }) {
  if (!match || !currentInnings) return null;

  const is2ndInnings = match.currentInningsNumber === 2;
  const battingTeam = currentInnings.battingTeamName;

  const totalRuns = currentInnings.totalRuns;
  const wickets = currentInnings.wickets;
  const validBalls = currentInnings.validBalls;
  const oversStr = formatOvers(validBalls);
  const totalOvers = match.totalOvers;
  const totalBalls = match.totalBalls;

  const crr = calculateCRR(totalRuns, validBalls);
  const target = currentInnings.target;
  const rrr = is2ndInnings && target ? calculateRRR(target, totalRuns, totalBalls, validBalls) : null;
  const runsRemaining = target ? target - totalRuns : null;
  const ballsRemaining = totalBalls - validBalls;

  // Overs progress percentage
  const progressPercent = Math.min(100, (validBalls / totalBalls) * 100);

  return (
    <div className="relative overflow-hidden rounded-3xl glass-panel border border-white/[0.14] p-5 sm:p-7 shadow-2xl">
      {/* Top Liquid Accent Highlight Strip */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 via-indigo-400 to-rose-400" />
      
      {/* Ambient Inner Glass Glow */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Match Header info */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-white/[0.08] relative z-10">
        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-400/30 backdrop-blur-md flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            Innings {match.currentInningsNumber}
          </span>
          <span className="text-xs text-slate-300 font-sans">
            {match.format} • {match.venue}
          </span>
        </div>

        {/* Match state indicator */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          {match.status === 'live' && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              LIVE
            </span>
          )}
          {match.status === 'paused' && (
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
              PAUSED
            </span>
          )}
          {match.status === 'innings_break' && (
            <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              INNINGS BREAK
            </span>
          )}
          {match.status === 'completed' && (
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              MATCH COMPLETED
            </span>
          )}
        </div>
      </div>

      {/* Main Scoreboard Display */}
      <div className="py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">
              {battingTeam}
            </h2>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
              Batting
            </span>
          </div>

          <div className="flex items-baseline gap-3 mt-2">
            <motion.span
              key={`${totalRuns}-${wickets}`}
              initial={{ scale: 1.08, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="text-5xl sm:text-7xl font-black text-white font-digit tracking-tight drop-shadow-sm"
            >
              {totalRuns}
              <span className="text-rose-400 font-light mx-1">/</span>
              <span className="text-amber-300">{wickets}</span>
            </motion.span>

            <span className="text-xl sm:text-2xl font-bold text-slate-400 font-digit">
              ({oversStr} <span className="text-xs text-cyan-300 font-sans">/ {totalOvers} ov</span>)
            </span>
          </div>
        </div>

        {/* Target & Run Rates Box (Liquid Glass Micro-Cards) */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {is2ndInnings && target && (
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-amber-400/30 backdrop-blur-xl min-w-[140px] shadow-sm">
              <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                <span>Target</span>
              </div>
              <p className="text-2xl font-black text-amber-300 font-digit mt-0.5">
                {target}
              </p>
              <p className="text-[11px] text-slate-300">
                Need <strong className="text-cyan-300">{Math.max(0, runsRemaining)}</strong> off <strong className="text-amber-300">{Math.max(0, ballsRemaining)}b</strong>
              </p>
            </div>
          )}

          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-cyan-400/30 backdrop-blur-xl min-w-[110px] shadow-sm">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>CRR</span>
            </div>
            <p className="text-2xl font-black text-cyan-300 font-digit mt-0.5">
              {crr}
            </p>
            <p className="text-[10px] text-slate-400">runs/ov</p>
          </div>

          {is2ndInnings && rrr && (
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-rose-400/30 backdrop-blur-xl min-w-[110px] shadow-sm">
              <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
                <Clock className="w-3.5 h-3.5 text-rose-400" />
                <span>Req RR</span>
              </div>
              <p className="text-2xl font-black text-rose-300 font-digit mt-0.5">
                {rrr}
              </p>
              <p className="text-[10px] text-slate-400">req/ov</p>
            </div>
          )}
        </div>
      </div>

      {/* Innings Overs Progress Bar (Liquid Gradient) */}
      <div className="mt-2 space-y-1.5 relative z-10">
        <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
          <span>Overs: {oversStr} / {totalOvers}.0</span>
          <span className="text-cyan-300 font-semibold">{progressPercent.toFixed(1)}% Completed</span>
        </div>
        <div className="h-2 w-full bg-white/[0.06] rounded-full overflow-hidden border border-white/[0.08] backdrop-blur-md p-[1px]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-rose-400 shadow-sm"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>
    </div>
  );
}
