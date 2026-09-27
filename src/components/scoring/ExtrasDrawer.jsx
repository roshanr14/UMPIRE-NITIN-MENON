import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, Check, Zap, Sparkles } from 'lucide-react';

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
    e?.preventDefault?.();
    onSubmitExtra(extraType, parseInt(runs, 10) || 1, parseInt(runsOffBat, 10) || 0);
    onClose();
  };

  const handleQuickPreset = (type, extraRuns, batRuns = 0) => {
    onSubmitExtra(type, extraRuns, batRuns);
    onClose();
  };

  const quickPresets = [
    { label: 'Wide (+1)', sub: 'Standard Wide', type: 'wide', extraRuns: 1, batRuns: 0, style: 'liquid-btn-amber' },
    { label: 'Wide + 4 (5R)', sub: 'Wide Boundary', type: 'wide', extraRuns: 5, batRuns: 0, style: 'liquid-btn-amber' },
    { label: 'No Ball (+1)', sub: 'Free Hit', type: 'no_ball', extraRuns: 1, batRuns: 0, style: 'liquid-btn-amber' },
    { label: 'NB + 4 (5R)', sub: 'Four Off Bat + NB', type: 'no_ball', extraRuns: 1, batRuns: 4, style: 'liquid-btn-amber' },
    { label: 'NB + 6 (7R)', sub: 'Six Off Bat + NB', type: 'no_ball', extraRuns: 1, batRuns: 6, style: 'liquid-btn-amber' },
    { label: 'Bye (+1)', sub: '1 Bye Run', type: 'bye', extraRuns: 1, batRuns: 0, style: 'liquid-btn-primary' },
    { label: 'Bye + 4 (4R)', sub: 'Bye Boundary', type: 'bye', extraRuns: 4, batRuns: 0, style: 'liquid-btn-primary' },
    { label: 'Leg Bye (+1)', sub: '1 Leg Bye Run', type: 'leg_bye', extraRuns: 1, batRuns: 0, style: 'liquid-btn-primary' },
    { label: 'Leg Bye + 4 (4R)', sub: 'Leg Bye Boundary', type: 'leg_bye', extraRuns: 4, batRuns: 0, style: 'liquid-btn-primary' },
    { label: 'Penalty (+5)', sub: 'Fielding Penalty', type: 'penalty', extraRuns: 5, batRuns: 0, style: 'liquid-btn-secondary' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-xl max-h-[92vh] overflow-y-auto scrollbar-thin glass-panel-elevated border border-white/[0.18] rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-2xl relative font-sans space-y-4 sm:space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-amber-500/15 text-amber-300 border border-amber-400/30">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white font-display">
                  Record Extras & Penalties
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-300">
                  Quick 1-tap presets or custom extra delivery builder
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

          {/* 1. Quick 1-Tap Presets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-amber-300 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Quick 1-Tap Presets (Instant Add)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {quickPresets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickPreset(p.type, p.extraRuns, p.batRuns)}
                  className={`liquid-btn ${p.style} py-2.5 px-2 rounded-xl text-center flex flex-col items-center justify-center gap-0.5`}
                >
                  <span className="text-xs sm:text-sm font-black font-digit text-white">
                    {p.label}
                  </span>
                  <span className="text-[9px] text-slate-200 truncate font-medium">
                    {p.sub}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Custom Extra Delivery Builder */}
          <form onSubmit={handleSubmit} className="pt-3 border-t border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              <span>Custom Extra Builder</span>
            </div>

            {/* Extra Type Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Extra Type
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
                    className={`liquid-btn py-2 px-2 rounded-xl text-xs font-semibold text-center ${
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
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                {extraType === 'wide' ? 'Total Wide Runs (1 default + running)' : 'Extra Runs'}
              </label>
              <div className="grid grid-cols-5 gap-2">
                {(extraType === 'penalty' ? [5, 10, 15] : [1, 2, 3, 4, 5]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRuns(r)}
                    className={`liquid-btn py-2 rounded-xl font-digit font-bold text-sm ${
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
                className="p-3.5 rounded-2xl bg-white/[0.03] border border-cyan-400/30 backdrop-blur-xl space-y-2"
              >
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                    Runs Scored Off Bat (Credited to Batter)
                  </label>
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
                  ⚡ Total Added: {runs + runsOffBat} runs (+{runs} NB extra + {runsOffBat} off bat) + Free Hit
                </p>
              </motion.div>
            )}

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="liquid-btn liquid-btn-secondary px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="liquid-btn liquid-btn-amber px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                Apply Custom Extra (+{runs + runsOffBat})
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
