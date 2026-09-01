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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="w-full max-w-lg max-h-[85vh] cyber-card border-2 border-[#00f0ff]/40 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#00f0ff]/20 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-cyber text-glow-cyan">
                  {isOverEnd ? 'Over Completed - Select Next Bowler' : 'Select Bowler'}
                </h3>
                <p className="text-xs font-mono text-slate-400">
                  {currentInnings.bowlingTeamName} Bowlers
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
          <div className="flex-1 overflow-y-auto mt-4 space-y-2 pr-1 font-mono">
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
                      ? 'opacity-30 bg-[#050814] border-slate-800 cursor-not-allowed'
                      : isSelected
                      ? 'bg-[#00f0ff]/15 border-[#00f0ff] text-white shadow-md shadow-[#00f0ff]/20 ring-1 ring-[#00f0ff] cursor-pointer'
                      : 'bg-[#050814] border-[#00f0ff]/20 hover:border-[#00f0ff]/60 text-slate-300 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#090e1f] border border-[#00f0ff]/30 flex items-center justify-center font-bold text-xs text-[#00f0ff] font-cyber">
                      {b.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-100 font-cyber">{b.name}</h4>
                        {b.id === currentBowlerId && !isOverEnd && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#fcee0a]/20 text-[#fcee0a] border border-[#fcee0a]/40 font-mono">
                            Current Bowler
                          </span>
                        )}
                        {isConsecutive && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#ff0055]/20 text-[#ff0055] border border-[#ff0055]/40 font-mono">
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
                    <div className="w-6 h-6 rounded-full bg-[#00f0ff] text-black flex items-center justify-center shrink-0 shadow-md shadow-[#00f0ff]/40">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-[#00f0ff]/20 shrink-0 flex items-center justify-between font-cyber">
            {!isOverEnd ? (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                CANCEL
              </button>
            ) : (
              <span className="text-xs text-slate-400 font-mono">
                Strike rotated automatically for the new over.
              </span>
            )}

            <button
              type="button"
              onClick={handleConfirm}
              className="px-6 py-2.5 rounded-xl bg-[#00f0ff] hover:bg-[#38f4ff] text-black font-black text-xs flex items-center gap-2 shadow-lg shadow-[#00f0ff]/30 active:scale-95 ml-auto border border-[#00f0ff]"
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
