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
    <div className="p-5 rounded-3xl cyber-card border border-[#00f0ff]/25 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#00f0ff]/15">
        <div className="flex items-center gap-2 font-cyber">
          <Zap className="w-4 h-4 text-[#fcee0a]" />
          <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
            BATTERS // LIVE_MATRIX
          </h3>
        </div>

        <button
          type="button"
          onClick={onSwitchStrike}
          className="px-3 py-1.5 rounded-xl bg-[#050814] hover:bg-[#00f0ff]/20 text-[#00f0ff] font-mono text-xs font-bold flex items-center gap-1.5 border border-[#00f0ff]/30 transition-all active:scale-95 shadow-sm"
          title="Manual Strike Rotation (Hotkey: S)"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>SWAP (S)</span>
        </button>
      </div>

      <div className="overflow-x-auto font-mono">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-400 border-b border-[#00f0ff]/15 text-[10px] font-bold uppercase tracking-wider">
              <th className="pb-2 pl-2">BATTER</th>
              <th className="pb-2 text-right">R</th>
              <th className="pb-2 text-right">B</th>
              <th className="pb-2 text-right">4s</th>
              <th className="pb-2 text-right">6s</th>
              <th className="pb-2 text-right pr-2">SR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#00f0ff]/10">
            {batsmenList.map((b, idx) => {
              const sr = calculateStrikeRate(b.runs, b.balls);
              return (
                <tr
                  key={idx}
                  className={`transition-colors ${
                    b.isStriker
                      ? 'bg-[#00f0ff]/10 text-white font-bold'
                      : 'text-slate-300'
                  }`}
                >
                  <td className="py-3 pl-2 flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-100 font-cyber">
                      {b.name}
                    </span>
                    {b.isStriker && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#fcee0a] text-black font-mono uppercase tracking-widest shadow-sm shadow-[#fcee0a]/40">
                        ON_STRIKE *
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right font-digit text-lg font-black text-[#fcee0a] text-glow-yellow">
                    {b.runs}
                  </td>
                  <td className="py-3 text-right font-digit text-slate-300">
                    {b.balls}
                  </td>
                  <td className="py-3 text-right font-digit text-slate-400">
                    {b.fours}
                  </td>
                  <td className="py-3 text-right font-digit text-slate-400">
                    {b.sixes}
                  </td>
                  <td className="py-3 text-right font-digit font-bold text-[#00f0ff] pr-2">
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
