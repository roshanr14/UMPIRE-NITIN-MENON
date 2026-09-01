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
    <div className="relative overflow-hidden rounded-3xl cyber-card border-2 border-[#00f0ff]/30 p-5 sm:p-7 shadow-2xl">
      {/* Top Cyber Accent Strip */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00f0ff] via-[#fcee0a] to-[#ff0055]" />

      {/* Match Header info */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-[#00f0ff]/20">
        <div className="flex items-center gap-2.5">
          <span className="px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/40 font-mono flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-ping" />
            Innings {match.currentInningsNumber}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {match.format} • {match.venue}
          </span>
        </div>

        {/* Match state indicator */}
        <div className="flex items-center gap-2 font-cyber text-xs">
          {match.status === 'live' && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full font-black bg-[#ff0055]/15 text-[#ff0055] border border-[#ff0055]/50 shadow-md shadow-[#ff0055]/20">
              <span className="w-2 h-2 rounded-full bg-[#ff0055] animate-ping" />
              LIVE
            </span>
          )}
          {match.status === 'paused' && (
            <span className="px-3 py-1 rounded-full font-bold bg-[#fcee0a]/15 text-[#fcee0a] border border-[#fcee0a]/50">
              PAUSED
            </span>
          )}
          {match.status === 'innings_break' && (
            <span className="px-3 py-1 rounded-full font-bold bg-[#00f0ff]/15 text-[#00f0ff] border border-[#00f0ff]/50">
              INNINGS BREAK
            </span>
          )}
          {match.status === 'completed' && (
            <span className="px-3 py-1 rounded-full font-bold bg-[#39ff14]/15 text-[#39ff14] border border-[#39ff14]/50">
              MATCH COMPLETED
            </span>
          )}
        </div>
      </div>

      {/* Main Scoreboard Display */}
      <div className="py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-black text-white font-cyber tracking-wider uppercase text-glow-cyan">
              {battingTeam}
            </h2>
            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[#fcee0a]/20 text-[#fcee0a] border border-[#fcee0a]/40 font-mono uppercase">
              BATTING
            </span>
          </div>

          <div className="flex items-baseline gap-3 mt-1.5">
            <motion.span
              key={`${totalRuns}-${wickets}`}
              initial={{ scale: 1.15, color: '#fcee0a' }}
              animate={{ scale: 1, color: '#ffffff' }}
              transition={{ duration: 0.2 }}
              className="text-5xl sm:text-7xl font-black text-white font-digit tracking-tight"
            >
              {totalRuns}
              <span className="text-[#ff0055] font-light">/</span>
              <span className="text-[#fcee0a]">{wickets}</span>
            </motion.span>

            <span className="text-xl sm:text-2xl font-bold text-slate-400 font-digit">
              ({oversStr} <span className="text-xs text-[#00f0ff] font-mono">/ {totalOvers} ov</span>)
            </span>
          </div>
        </div>

        {/* Target & Run Rates Box */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto font-mono">
          {is2ndInnings && target && (
            <div className="p-3.5 rounded-2xl bg-[#050814] border border-[#fcee0a]/40 min-w-[140px] shadow-lg shadow-[#fcee0a]/10">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                <Target className="w-3.5 h-3.5 text-[#fcee0a]" />
                <span>TARGET</span>
              </div>
              <p className="text-2xl font-black text-[#fcee0a] font-digit mt-0.5 text-glow-yellow">
                {target}
              </p>
              <p className="text-[10px] text-slate-300">
                Need <strong className="text-[#00f0ff]">{Math.max(0, runsRemaining)}</strong> off <strong className="text-[#fcee0a]">{Math.max(0, ballsRemaining)}b</strong>
              </p>
            </div>
          )}

          <div className="p-3.5 rounded-2xl bg-[#050814] border border-[#00f0ff]/30 min-w-[110px]">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
              <TrendingUp className="w-3.5 h-3.5 text-[#00f0ff]" />
              <span>CRR</span>
            </div>
            <p className="text-2xl font-black text-[#00f0ff] font-digit mt-0.5 text-glow-cyan">
              {crr}
            </p>
            <p className="text-[10px] text-slate-500 font-mono">runs/ov</p>
          </div>

          {is2ndInnings && rrr && (
            <div className="p-3.5 rounded-2xl bg-[#050814] border border-[#ff0055]/30 min-w-[110px]">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                <Clock className="w-3.5 h-3.5 text-[#ff0055]" />
                <span>REQ RR</span>
              </div>
              <p className="text-2xl font-black text-[#ff0055] font-digit mt-0.5 text-glow-pink">
                {rrr}
              </p>
              <p className="text-[10px] text-slate-500 font-mono">req/ov</p>
            </div>
          )}
        </div>
      </div>

      {/* Innings Overs Progress Bar */}
      <div className="mt-2 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>OVERS: {oversStr} / {totalOvers}.0</span>
          <span className="text-[#00f0ff] font-bold">{progressPercent.toFixed(1)}%</span>
        </div>
        <div className="h-2 w-full bg-[#050814] rounded-full overflow-hidden border border-[#00f0ff]/20">
          <motion.div
            className="h-full bg-gradient-to-r from-[#00f0ff] via-[#fcee0a] to-[#ff0055]"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>
    </div>
  );
}
