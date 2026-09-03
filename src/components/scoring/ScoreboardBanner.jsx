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
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl glass-panel border border-white/[0.14] px-4 py-3 sm:px-6 sm:py-4 shadow-xl">
      {/* Top Liquid Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 via-indigo-400 to-rose-400" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 relative z-10">
        {/* Left: Batting Team & Live Indicator */}
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight">
                {battingTeam}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-digit">
                Inn {match.currentInningsNumber}
              </span>
              {match.status === 'live' && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  LIVE
                </span>
              )}
              {match.status === 'paused' && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                  PAUSED
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-300 font-sans mt-0.5">
              {match.format} • {match.venue}
            </p>
          </div>
        </div>

        {/* Center: Main Score Figures */}
        <div className="flex items-baseline gap-3">
          <motion.div
            key={`${totalRuns}-${wickets}`}
            initial={{ scale: 1.05, opacity: 0.9 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="text-3xl sm:text-4xl font-black text-white font-digit tracking-tight"
          >
            <span>{totalRuns}</span>
            <span className="text-rose-400 font-light mx-1">/</span>
            <span className="text-amber-300">{wickets}</span>
          </motion.div>

          <span className="text-sm sm:text-base font-bold text-slate-300 font-digit">
            ({oversStr} <span className="text-xs text-slate-400">/ {totalOvers} ov</span>)
          </span>
        </div>

        {/* Right: Telemetry Mini-Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          {/* CRR Pill */}
          <div className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.1] backdrop-blur-md flex items-center gap-1.5">
            <span className="text-slate-400 text-[10px] uppercase">CRR</span>
            <span className="text-cyan-300 font-bold font-digit">{crr}</span>
          </div>

          {/* Target & RRR Pills (2nd Innings) */}
          {is2ndInnings && target && (
            <>
              <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-400/30 backdrop-blur-md flex items-center gap-1.5">
                <span className="text-amber-300 text-[10px] uppercase font-bold">Target</span>
                <span className="text-amber-300 font-black font-digit">{target}</span>
                <span className="text-[10px] text-slate-300">
                  (need {Math.max(0, runsRemaining)} off {Math.max(0, ballsRemaining)}b)
                </span>
              </div>

              {rrr && (
                <div className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-400/30 backdrop-blur-md flex items-center gap-1.5">
                  <span className="text-rose-300 text-[10px] uppercase font-bold">Req RR</span>
                  <span className="text-rose-300 font-black font-digit">{rrr}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Slim Integrated Progress Bar along bottom */}
      <div className="mt-2.5 h-1 w-full bg-white/[0.06] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-rose-400"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}
