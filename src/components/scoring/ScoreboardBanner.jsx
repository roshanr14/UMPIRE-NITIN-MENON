import React from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Users, AlertCircle, Clock, Award } from 'lucide-react';
import { formatOvers, calculateCRR, calculateRRR } from '../../lib/cricketEngine';

export default function ScoreboardBanner({ match, currentInnings }) {
  if (!match || !currentInnings) return null;

  const is2ndInnings = match.currentInningsNumber === 2;
  const battingTeam = currentInnings.battingTeamName;
  const bowlingTeam = currentInnings.bowlingTeamName;

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
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-5 sm:p-7 shadow-2xl">
      {/* Top Accent Strip */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

      {/* Match Header info */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800/60">
            Innings {match.currentInningsNumber}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            {match.format} • {match.venue}
          </span>
        </div>

        {/* Match state indicator */}
        <div className="flex items-center gap-2">
          {match.status === 'live' && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-950/70 text-red-400 border border-red-800/50">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              LIVE MATCH
            </span>
          )}
          {match.status === 'paused' && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-950/70 text-amber-400 border border-amber-800/50">
              PAUSED
            </span>
          )}
          {match.status === 'innings_break' && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-950/70 text-sky-400 border border-sky-800/50">
              INNINGS BREAK
            </span>
          )}
          {match.status === 'completed' && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/70 text-emerald-400 border border-emerald-800/50">
              MATCH COMPLETED
            </span>
          )}
        </div>
      </div>

      {/* Main Scoreboard Numbers */}
      <div className="py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100 font-display tracking-tight uppercase">
              {battingTeam}
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              Batting
            </span>
          </div>

          <div className="flex items-baseline gap-3 mt-2">
            <motion.span
              key={`${totalRuns}-${wickets}`}
              initial={{ scale: 1.1, color: '#34d399' }}
              animate={{ scale: 1, color: '#ffffff' }}
              transition={{ duration: 0.25 }}
              className="text-5xl sm:text-7xl font-black text-white font-digit tracking-tighter"
            >
              {totalRuns}<span className="text-emerald-500 font-light">/</span>{wickets}
            </motion.span>

            <span className="text-xl sm:text-2xl font-bold text-slate-400 font-digit">
              ({oversStr} <span className="text-xs text-slate-500 font-normal">/ {totalOvers} ov</span>)
            </span>
          </div>
        </div>

        {/* Target & Run Rates Box */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {is2ndInnings && target && (
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 min-w-[140px]">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                <span>Target</span>
              </div>
              <p className="text-2xl font-black text-amber-400 font-digit mt-0.5">
                {target}
              </p>
              <p className="text-[11px] text-slate-400 font-medium">
                Need {Math.max(0, runsRemaining)} in {Math.max(0, ballsRemaining)}b
              </p>
            </div>
          )}

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 min-w-[110px]">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Current RR</span>
            </div>
            <p className="text-2xl font-black text-emerald-400 font-digit mt-0.5">
              {crr}
            </p>
            <p className="text-[11px] text-slate-500">runs / over</p>
          </div>

          {is2ndInnings && rrr && (
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 min-w-[110px]">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>Required RR</span>
              </div>
              <p className="text-2xl font-black text-sky-400 font-digit mt-0.5">
                {rrr}
              </p>
              <p className="text-[11px] text-slate-500">runs / over</p>
            </div>
          )}
        </div>
      </div>

      {/* Progress & Extras Footer */}
      <div className="space-y-3 pt-4 border-t border-slate-800/80">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1">
            <span>Overs Progress: {oversStr} of {totalOvers} Overs</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Partnership & Extras strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>
              Current Partnership:{' '}
              <strong className="text-white font-digit">
                {currentInnings.currentPartnership?.runs || 0}
              </strong>{' '}
              runs ({currentInnings.currentPartnership?.balls || 0} balls)
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
            <span>
              Extras:{' '}
              <strong className="text-slate-200">
                {currentInnings.extras?.total || 0}
              </strong>
            </span>
            <span>(WD: {currentInnings.extras?.wides || 0}, NB: {currentInnings.extras?.noBalls || 0}, B: {currentInnings.extras?.byes || 0}, LB: {currentInnings.extras?.legByes || 0})</span>
          </div>
        </div>
      </div>
    </div>
  );
}
