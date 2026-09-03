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
    <div className="p-5 rounded-3xl glass-panel border border-white/[0.12] shadow-xl space-y-4 font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300">
            <Shield className="w-4 h-4" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white font-display">
            Current Bowler
          </h3>
        </div>

        <button
          type="button"
          onClick={onOpenChangeBowler}
          className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-amber-500/15 text-amber-300 hover:text-white font-sans text-xs font-semibold flex items-center gap-1.5 border border-white/[0.08] hover:border-amber-400/30 transition-all active:scale-95 shadow-sm"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Change Bowler</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-400 border-b border-white/[0.08] text-[11px] font-semibold uppercase tracking-wider">
              <th className="pb-2.5 pl-2">Bowler</th>
              <th className="pb-2.5 text-right">O</th>
              <th className="pb-2.5 text-right">M</th>
              <th className="pb-2.5 text-right">R</th>
              <th className="pb-2.5 text-right">W</th>
              <th className="pb-2.5 text-right">Dots</th>
              <th className="pb-2.5 text-right pr-2">Econ</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-cyan-500/10 text-white font-bold">
              <td className="py-3 pl-2 flex items-center gap-2">
                <span className="font-bold text-sm text-slate-100 font-display">{bowler.name}</span>
              </td>
              <td className="py-3 text-right font-digit text-slate-200">
                {oversStr}
              </td>
              <td className="py-3 text-right font-digit text-slate-400">
                {bowler.maidens}
              </td>
              <td className="py-3 text-right font-digit text-amber-300">
                {bowler.runsConceded}
              </td>
              <td className="py-3 text-right font-digit text-lg text-rose-400 font-black">
                {bowler.wickets}
              </td>
              <td className="py-3 text-right font-digit text-slate-400">
                {bowler.dots || 0}
              </td>
              <td className="py-3 text-right font-digit font-bold text-cyan-300 pr-2">
                {econ}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
