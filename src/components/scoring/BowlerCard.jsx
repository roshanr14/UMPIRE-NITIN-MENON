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
    <div className="p-5 rounded-3xl cyber-card border border-[#00f0ff]/25 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#00f0ff]/15">
        <div className="flex items-center gap-2 font-cyber">
          <Shield className="w-4 h-4 text-[#00f0ff]" />
          <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
            CURRENT BOWLER
          </h3>
        </div>

        <button
          type="button"
          onClick={onOpenChangeBowler}
          className="px-3 py-1.5 rounded-xl bg-[#050814] hover:bg-[#fcee0a]/20 text-[#fcee0a] font-mono text-xs font-bold flex items-center gap-1.5 border border-[#fcee0a]/30 transition-all active:scale-95 shadow-sm"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Change Bowler</span>
        </button>
      </div>

      <div className="overflow-x-auto font-mono">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-400 border-b border-[#00f0ff]/15 text-[10px] font-bold uppercase tracking-wider">
              <th className="pb-2 pl-2">BOWLER</th>
              <th className="pb-2 text-right">O</th>
              <th className="pb-2 text-right">M</th>
              <th className="pb-2 text-right">R</th>
              <th className="pb-2 text-right">W</th>
              <th className="pb-2 text-right">DOTS</th>
              <th className="pb-2 text-right pr-2">ECON</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-[#00f0ff]/10 text-white font-bold">
              <td className="py-3 pl-2 flex items-center gap-2">
                <span className="font-bold text-sm text-slate-100 font-cyber">{bowler.name}</span>
              </td>
              <td className="py-3 text-right font-digit text-slate-200">
                {oversStr}
              </td>
              <td className="py-3 text-right font-digit text-slate-400">
                {bowler.maidens}
              </td>
              <td className="py-3 text-right font-digit text-[#fcee0a] text-glow-yellow">
                {bowler.runsConceded}
              </td>
              <td className="py-3 text-right font-digit text-lg text-[#ff0055] font-black text-glow-pink">
                {bowler.wickets}
              </td>
              <td className="py-3 text-right font-digit text-slate-400">
                {bowler.dots || 0}
              </td>
              <td className="py-3 text-right font-digit font-bold text-[#00f0ff] pr-2">
                {econ}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
