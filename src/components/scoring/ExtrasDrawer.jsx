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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg cyber-card border-2 border-[#fcee0a]/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#fcee0a]/20">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#fcee0a]/10 text-[#fcee0a] border border-[#fcee0a]/30">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-cyber text-glow-yellow">
                  RECORD EXTRAS
                </h3>
                <p className="text-xs font-mono text-slate-400">
                  Wide, No-Ball, Byes, Leg Byes & Penalties
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4 font-mono">
            {/* Extra Type Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Extra Delivery Type
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
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
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                      extraType === item.id
                        ? 'bg-[#fcee0a] text-black border-[#fcee0a] shadow-md shadow-[#fcee0a]/30 font-black'
                        : 'bg-[#050814] text-slate-300 border-[#fcee0a]/20 hover:border-[#fcee0a]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Extra Runs Count */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                {extraType === 'wide' ? 'Total Wide Runs (1 default + running/boundaries)' : 'Extra Runs'}
              </label>
              <div className="grid grid-cols-5 gap-2">
                {(extraType === 'penalty' ? [5, 10] : [1, 2, 3, 4, 5]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRuns(r)}
                    className={`py-2.5 rounded-xl font-digit font-black text-sm border transition-all ${
                      runs === r
                        ? 'bg-[#fcee0a] text-black border-[#fcee0a] shadow-md shadow-[#fcee0a]/30'
                        : 'bg-[#050814] text-slate-300 border-[#fcee0a]/20 hover:border-[#fcee0a]'
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
                className="p-3.5 rounded-2xl bg-[#050814] border border-[#00f0ff]/30 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#00f0ff] uppercase tracking-wider">
                    Runs Scored Off Bat (No-Ball)
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Credited to batter
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {[0, 1, 2, 3, 4, 6].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRunsOffBat(r)}
                      className={`py-2 rounded-xl font-digit font-bold text-xs border transition-all ${
                        runsOffBat === r
                          ? 'bg-[#00f0ff] text-black border-[#00f0ff] font-black'
                          : 'bg-[#090e1f] text-slate-300 border-slate-700 hover:border-[#00f0ff]'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-[#fcee0a] font-mono mt-1">
                  ⚡ Total: {runs + runsOffBat} runs (+1 NB extra + {runsOffBat} off bat) + Free Hit awarded
                </p>
              </motion.div>
            )}

            <div className="pt-4 border-t border-[#fcee0a]/20 flex items-center justify-between font-cyber">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#fcee0a] hover:bg-[#fff033] text-black font-black text-xs flex items-center gap-2 shadow-lg shadow-[#fcee0a]/30 active:scale-95 border border-[#fcee0a]"
              >
                <Check className="w-4 h-4" />
                Add Extras (+{runs + runsOffBat})
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
