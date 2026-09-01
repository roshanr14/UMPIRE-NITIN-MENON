import React from 'react';
import { RefreshCw, User, Flame } from 'lucide-react';
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
    <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">⚾</span>
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-200 font-display">
            Current Bowler
          </h3>
        </div>

        <button
          type="button"
          onClick={onOpenChangeBowler}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-all active:scale-95 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Change Bowler</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-400 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider">
              <th className="pb-2 pl-2">Bowler</th>
              <th className="pb-2 text-right">O</th>
              <th className="pb-2 text-right">M</th>
              <th className="pb-2 text-right">R</th>
              <th className="pb-2 text-right">W</th>
              <th className="pb-2 text-right">Dots</th>
              <th className="pb-2 text-right pr-2">Econ</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-sky-950/20 text-white font-bold">
              <td className="py-3 pl-2 flex items-center gap-2">
                <span className="font-semibold text-sm">{bowler.name}</span>
              </td>
              <td className="py-3 text-right font-digit text-slate-200">
                {oversStr}
              </td>
              <td className="py-3 text-right font-digit text-slate-400">
                {bowler.maidens}
              </td>
              <td className="py-3 text-right font-digit text-amber-400">
                {bowler.runsConceded}
              </td>
              <td className="py-3 text-right font-digit text-base text-emerald-400 font-bold">
                {bowler.wickets}
              </td>
              <td className="py-3 text-right font-digit text-slate-400">
                {bowler.dots || 0}
              </td>
              <td className="py-3 text-right font-digit font-semibold text-sky-300 pr-2">
                {econ}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
