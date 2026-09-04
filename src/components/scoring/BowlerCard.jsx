import React from 'react';
import { RotateCw, Shield } from 'lucide-react';
import { formatOvers, calculateEconomy } from '../../lib/cricketEngine';

export default function BowlerCard({ currentInnings, onOpenChangeBowler }) {
  if (!currentInnings) return null;

  const currentBowlerId = currentInnings.currentBowlerId;
  const bowler = currentInnings.bowlers.find((b) => b.id === currentBowlerId) || {
    name: 'Current Bowler',
    balls: 0,
    maidens: 0,
    runsConceded: 0,
    wickets: 0,
    wides: 0,
    noBalls: 0,
    dots: 0,
  };

  const oversStr = formatOvers(bowler.balls);
  const econ = calculateEconomy(bowler.runsConceded, bowler.balls);

  return (
    <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl glass-panel border border-white/[0.12] shadow-xl space-y-3 sm:space-y-4 font-sans">
      <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300">
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white font-display">
            Current Bowler
          </h3>
        </div>

        <button
          type="button"
          onClick={onOpenChangeBowler}
          className="liquid-btn liquid-btn-secondary px-2.5 sm:px-3.5 py-1.5 rounded-xl text-amber-300 hover:text-white font-sans text-xs font-semibold flex items-center gap-1.5 shrink-0"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>
            <span className="hidden xs:inline">Change Bowler</span>
            <span className="xs:hidden">Change</span>
          </span>
        </button>
      </div>

      <div className="overflow-x-auto scrollbar-thin -mx-1 px-1 sm:mx-0 sm:px-0">
        <table className="w-full text-left text-xs min-w-[300px]">
          <thead>
            <tr className="text-slate-400 border-b border-white/[0.08] text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider">
              <th className="pb-2 pl-1 sm:pl-2 sticky left-0 bg-[#060919]/90 backdrop-blur-md z-10">Bowler</th>
              <th className="pb-2 text-right">O</th>
              <th className="pb-2 text-right">M</th>
              <th className="pb-2 text-right">R</th>
              <th className="pb-2 text-right">W</th>
              <th className="pb-2 text-right">Dots</th>
              <th className="pb-2 text-right pr-1 sm:pr-2">Econ</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-cyan-500/10 text-white font-bold">
              <td className="py-2.5 pl-1 sm:pl-2 flex items-center gap-2 sticky left-0 bg-[#060919]/90 backdrop-blur-md z-10 min-w-[120px]">
                <span className="font-bold text-xs sm:text-sm text-slate-100 font-display truncate">{bowler.name}</span>
              </td>
              <td className="py-2.5 text-right font-digit text-slate-200 text-xs sm:text-sm">
                {oversStr}
              </td>
              <td className="py-2.5 text-right font-digit text-slate-400 text-xs sm:text-sm">
                {bowler.maidens}
              </td>
              <td className="py-2.5 text-right font-digit text-amber-300 text-xs sm:text-sm font-semibold">
                {bowler.runsConceded}
              </td>
              <td className="py-2.5 text-right font-digit text-base sm:text-lg text-rose-400 font-black">
                {bowler.wickets}
              </td>
              <td className="py-2.5 text-right font-digit text-slate-400 text-xs sm:text-sm">
                {bowler.dots || 0}
              </td>
              <td className="py-2.5 text-right font-digit font-bold text-cyan-300 pr-1 sm:pr-2 text-xs sm:text-sm">
                {econ}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
