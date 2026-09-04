import React from 'react';
import { ArrowLeftRight, Zap } from 'lucide-react';
import { calculateStrikeRate } from '../../lib/cricketEngine';

export default function BatsmenCard({ currentInnings, onSwitchStrike }) {
  if (!currentInnings) return null;

  const strikerId = currentInnings.currentStrikerId;
  const nonStrikerId = currentInnings.currentNonStrikerId;

  const striker = currentInnings.batsmen.find((b) => b.id === strikerId) || {
    name: 'Striker',
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0,
  };

  const nonStriker = currentInnings.batsmen.find((b) => b.id === nonStrikerId) || {
    name: 'Non-Striker',
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0,
  };

  const batsmenList = [
    { ...striker, isStriker: true },
    { ...nonStriker, isStriker: false },
  ];

  return (
    <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl glass-panel border border-white/[0.12] shadow-xl space-y-3 sm:space-y-4 font-sans">
      <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-300">
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white font-display">
            Current Batsmen
          </h3>
        </div>

        <button
          type="button"
          onClick={onSwitchStrike}
          className="liquid-btn liquid-btn-secondary px-2.5 sm:px-3.5 py-1.5 rounded-xl text-cyan-300 hover:text-white font-sans text-xs font-semibold flex items-center gap-1.5 shrink-0"
          title="Manual Strike Rotation (Hotkey: S)"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>
            <span className="hidden xs:inline">Switch Strike</span>
            <span className="xs:hidden">Switch</span> (S)
          </span>
        </button>
      </div>

      <div className="overflow-x-auto scrollbar-thin -mx-1 px-1 sm:mx-0 sm:px-0">
        <table className="w-full text-left text-xs min-w-[280px]">
          <thead>
            <tr className="text-slate-400 border-b border-white/[0.08] text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider">
              <th className="pb-2 pl-1 sm:pl-2 sticky left-0 bg-[#060919]/90 backdrop-blur-md z-10">Batter</th>
              <th className="pb-2 text-right">R</th>
              <th className="pb-2 text-right">B</th>
              <th className="pb-2 text-right">4s</th>
              <th className="pb-2 text-right">6s</th>
              <th className="pb-2 text-right pr-1 sm:pr-2">SR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {batsmenList.map((b, idx) => {
              const sr = calculateStrikeRate(b.runs, b.balls);
              return (
                <tr
                  key={idx}
                  className={`transition-colors ${
                    b.isStriker
                      ? 'bg-cyan-500/10 text-white font-bold'
                      : 'text-slate-300 hover:bg-white/[0.02]'
                  }`}
                >
                  <td className="py-2.5 pl-1 sm:pl-2 flex items-center gap-1.5 sm:gap-2 sticky left-0 bg-[#060919]/90 backdrop-blur-md z-10 min-w-[120px]">
                    <span className="font-bold text-xs sm:text-sm text-slate-100 font-display truncate">
                      {b.name}
                    </span>
                    {b.isStriker && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold bg-amber-400 text-slate-950 uppercase tracking-tight shadow-sm shrink-0">
                        *
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 text-right font-digit text-base sm:text-lg font-black text-amber-300">
                    {b.runs}
                  </td>
                  <td className="py-2.5 text-right font-digit text-slate-300 text-xs sm:text-sm">
                    {b.balls}
                  </td>
                  <td className="py-2.5 text-right font-digit text-slate-400 text-xs sm:text-sm">
                    {b.fours}
                  </td>
                  <td className="py-2.5 text-right font-digit text-slate-400 text-xs sm:text-sm">
                    {b.sixes}
                  </td>
                  <td className="py-2.5 text-right font-digit font-bold text-cyan-300 pr-1 sm:pr-2 text-xs sm:text-sm">
                    {sr}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
