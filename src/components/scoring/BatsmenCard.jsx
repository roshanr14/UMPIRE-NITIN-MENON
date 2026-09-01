import React from 'react';
import { ArrowLeftRight, User } from 'lucide-react';
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
    <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">🏏</span>
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-200 font-display">
            Current Batsmen
          </h3>
        </div>

        <button
          type="button"
          onClick={onSwitchStrike}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-all active:scale-95 shadow-sm"
          title="Manual Strike Rotation (Hotkey: S)"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>Switch Strike (S)</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-400 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider">
              <th className="pb-2 pl-2">Batter</th>
              <th className="pb-2 text-right">R</th>
              <th className="pb-2 text-right">B</th>
              <th className="pb-2 text-right">4s</th>
              <th className="pb-2 text-right">6s</th>
              <th className="pb-2 text-right pr-2">SR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {batsmenList.map((b, idx) => {
              const sr = calculateStrikeRate(b.runs, b.balls);
              return (
                <tr
                  key={idx}
                  className={`transition-colors ${
                    b.isStriker
                      ? 'bg-emerald-950/30 text-white font-bold'
                      : 'text-slate-300'
                  }`}
                >
                  <td className="py-3 pl-2 flex items-center gap-2">
                    <span className="font-semibold text-sm">
                      {b.name}
                    </span>
                    {b.isStriker && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-500 text-slate-950 uppercase">
                        STRIKE *
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right font-digit text-base font-bold text-emerald-400">
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
                  <td className="py-3 text-right font-digit font-semibold text-slate-200 pr-2">
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
