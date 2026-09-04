import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, Check } from 'lucide-react';

export default function ExtrasDrawer({
  isOpen,
  onClose,
  onSubmitExtra,
}) {
  if (!isOpen) return null;

  const [extraType, setExtraType] = useState('wide');
  const [runs, setRuns] = useState(1);
  const [runsOffBat, setRunsOffBat] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitExtra(extraType, parseInt(runs, 10) || 1, parseInt(runsOffBat, 10) || 0);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg max-h-[92vh] overflow-y-auto scrollbar-thin glass-panel-elevated border border-white/[0.18] rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-2xl relative font-sans"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-amber-500/15 text-amber-300 border border-amber-400/30">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white font-display">
                  Record Extras
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-300">
                  Wide, No-Ball, Byes, Leg Byes & Penalties
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="liquid-btn-icon w-8 h-8 rounded-xl text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 sm:mt-6 space-y-4 sm:space-y-5">
            {/* Extra Type Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Extra Delivery Type
              </label>
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2">
                {[
                  { id: 'wide', label: 'Wide' },
                  { id: 'no_ball', label: 'No Ball' },
                  { id: 'bye', label: 'Bye' },
                  { id: 'leg_bye', label: 'Leg Bye' },
                  { id: 'penalty', label: 'Penalty' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setExtraType(item.id);
                      if (item.id === 'penalty') setRuns(5);
                      else setRuns(1);
                    }}
                    className={`liquid-btn py-2.5 px-2 rounded-xl text-xs font-semibold text-center ${
                      extraType === item.id
                        ? 'liquid-btn-amber font-bold'
                        : 'liquid-btn-secondary'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Extra Runs Count */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
                {extraType === 'wide' ? 'Total Wide Runs (1 default + running/boundaries)' : 'Extra Runs'}
              </label>
              <div className="grid grid-cols-5 gap-2">
                {(extraType === 'penalty' ? [5, 10] : [1, 2, 3, 4, 5]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRuns(r)}
                    className={`liquid-btn py-2.5 rounded-xl font-digit font-bold text-sm ${
                      runs === r
                        ? 'liquid-btn-amber font-black'
                        : 'liquid-btn-secondary'
                    }`}
                  >
                    +{r}
                  </button>
                ))}
              </div>
            </div>

            {/* If No-Ball: Option for runs scored off the bat */}
            {extraType === 'no_ball' && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-white/[0.03] border border-cyan-400/30 backdrop-blur-xl space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                    Runs Scored Off Bat (No-Ball)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Credited to batter
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {[0, 1, 2, 3, 4, 6].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRunsOffBat(r)}
                      className={`liquid-btn py-2 rounded-xl font-digit font-bold text-xs ${
                        runsOffBat === r
                          ? 'liquid-btn-primary font-black'
                          : 'liquid-btn-secondary'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-amber-300 font-medium mt-1">
                  ⚡ Total Added: {runs + runsOffBat} runs (+1 NB extra + {runsOffBat} off bat) + Free Hit awarded
                </p>
              </motion.div>
            )}

            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="liquid-btn liquid-btn-secondary px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="liquid-btn liquid-btn-amber px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Add Extras
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
