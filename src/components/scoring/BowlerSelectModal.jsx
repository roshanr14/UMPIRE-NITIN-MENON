import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X, Shield, Check } from 'lucide-react';
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="w-full max-w-lg max-h-[85vh] glass-panel-elevated border border-white/[0.18] rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col relative overflow-hidden font-sans"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-display">
                  {isOverEnd ? 'Over Completed - Select Next Bowler' : 'Select Bowler'}
                </h3>
                <p className="text-xs text-slate-300">
                  {currentInnings.bowlingTeamName} Bowlers
                </p>
              </div>
            </div>
            {!isOverEnd && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/[0.08] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Bowler List */}
          <div className="flex-1 overflow-y-auto mt-4 space-y-2.5 pr-1">
            {bowlers.map((b) => {
              const isConsecutive = b.id === lastBowlerId && isOverEnd;
              const isSelected = selectedId === b.id;
              const overs = formatOvers(b.balls);
              const econ = calculateEconomy(b.runsConceded, b.balls);

              return (
                <div
                  key={b.id}
                  onClick={() => !isConsecutive && setSelectedId(b.id)}
                  className={`p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 ${
                    isConsecutive
                      ? 'opacity-30 bg-white/[0.01] border-white/[0.04] cursor-not-allowed'
                      : isSelected
                      ? 'bg-cyan-500/20 border-cyan-400/70 text-white shadow-lg shadow-cyan-500/15 cursor-pointer'
                      : 'bg-white/[0.03] border-white/[0.08] hover:border-white/20 text-slate-300 cursor-pointer hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center font-bold text-xs text-cyan-300 font-display">
                      {b.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-100 font-display">{b.name}</h4>
                        {b.id === currentBowlerId && !isOverEnd && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                            Current Bowler
                          </span>
                        )}
                        {isConsecutive && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Just Bowled
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-digit mt-0.5">
                        {overs} ov • {b.runsConceded} runs • {b.wickets} wkts • Econ: {econ}
                      </p>
                    </div>
                  </div>

                  {isSelected && !isConsecutive && (
                    <div className="w-6 h-6 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shrink-0 shadow-md shadow-cyan-400/40">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-white/[0.08] shrink-0 flex items-center justify-between">
            {!isOverEnd ? (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/[0.08]"
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
              className="px-6 py-2.5 rounded-xl glass-btn-primary font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-95 ml-auto"
            >
              <Check className="w-4 h-4" />
              Set Bowler
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
