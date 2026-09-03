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
    <div className="p-5 rounded-3xl glass-panel border border-white/[0.12] shadow-xl space-y-4 font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-300">
            <Zap className="w-4 h-4" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white font-display">
            Current Batsmen
          </h3>
        </div>

        <button
          type="button"
          onClick={onSwitchStrike}
          className="liquid-btn liquid-btn-secondary px-3.5 py-1.5 rounded-xl text-cyan-300 hover:text-white font-sans text-xs font-semibold flex items-center gap-1.5"
          title="Manual Strike Rotation (Hotkey: S)"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>Switch Strike (S)</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-400 border-b border-white/[0.08] text-[11px] font-semibold uppercase tracking-wider">
              <th className="pb-2.5 pl-2">Batter</th>
              <th className="pb-2.5 text-right">R</th>
              <th className="pb-2.5 text-right">B</th>
              <th className="pb-2.5 text-right">4s</th>
              <th className="pb-2.5 text-right">6s</th>
              <th className="pb-2.5 text-right pr-2">SR</th>
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
                  <td className="py-3 pl-2 flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-100 font-display">
                      {b.name}
                    </span>
                    {b.isStriker && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-950 uppercase tracking-wide shadow-sm">
                        Striker *
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right font-digit text-lg font-black text-amber-300">
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
                  <td className="py-3 text-right font-digit font-bold text-cyan-300 pr-2">
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
