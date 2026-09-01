import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X, Shield, Check, Flame, AlertCircle } from 'lucide-react';
import { formatOvers, calculateEconomy } from '../../lib/cricketEngine';

export default function BowlerSelectModal({
  isOpen,
  currentInnings,
  isOverEnd = false,
  onClose,
  onSelectBowler,
}) {
  if (!isOpen || !currentInnings) return null;

  const lastBowlerId = currentInnings.lastBowlerId;
  const currentBowlerId = currentInnings.currentBowlerId;
  const bowlers = currentInnings.bowlers || [];

  const [selectedId, setSelectedId] = useState(
    bowlers.find((b) => b.id !== lastBowlerId)?.id || bowlers[0]?.id
  );

  const handleConfirm = () => {
    if (selectedId) {
      onSelectBowler(selectedId);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="w-full max-w-lg max-h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-100 font-display">
                  {isOverEnd ? 'Over Completed! Select Next Bowler' : 'Change Current Bowler'}
                </h3>
                <p className="text-xs text-slate-400">
                  {currentInnings.bowlingTeamName} Bowling Roster
                </p>
              </div>
            </div>
            {!isOverEnd && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Bowler List */}
          <div className="flex-1 overflow-y-auto mt-4 space-y-2 pr-1">
            {bowlers.map((b) => {
              const isConsecutive = b.id === lastBowlerId && isOverEnd;
              const isSelected = selectedId === b.id;
              const overs = formatOvers(b.balls);
              const econ = calculateEconomy(b.runsConceded, b.balls);

              return (
                <div
                  key={b.id}
                  onClick={() => !isConsecutive && setSelectedId(b.id)}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isConsecutive
                      ? 'opacity-40 bg-slate-950/40 border-slate-800/40 cursor-not-allowed'
                      : isSelected
                      ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-md ring-1 ring-emerald-500/50 cursor-pointer'
                      : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700 text-slate-300 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-200">
                      {b.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-100">{b.name}</h4>
                        {b.id === currentBowlerId && !isOverEnd && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                            Current
                          </span>
                        )}
                        {isConsecutive && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-800">
                            Just Bowled
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        {overs} ov • {b.runsConceded} runs • {b.wickets} wkts • Econ: {econ}
                      </p>
                    </div>
                  </div>

                  {isSelected && !isConsecutive && (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-800 shrink-0 flex items-center justify-between">
            {!isOverEnd ? (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
            ) : (
              <span className="text-xs text-slate-400">
                Strike rotated automatically for the new over.
              </span>
            )}

            <button
              type="button"
              onClick={handleConfirm}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950 active:scale-95 ml-auto"
            >
              <Check className="w-4 h-4" />
              Set Active Bowler
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
