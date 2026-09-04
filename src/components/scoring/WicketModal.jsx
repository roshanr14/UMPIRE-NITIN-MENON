import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon, X, Check } from 'lucide-react';
import { DISMISSAL_TYPES } from '../../lib/cricketEngine';

export default function WicketModal({
  isOpen,
  currentInnings,
  onClose,
  onSubmitWicket,
}) {
  if (!isOpen || !currentInnings) return null;

  const strikerId = currentInnings.currentStrikerId;
  const nonStrikerId = currentInnings.currentNonStrikerId;

  const striker = currentInnings.batsmen.find((b) => b.id === strikerId) || { id: strikerId, name: 'Striker' };
  const nonStriker = currentInnings.batsmen.find((b) => b.id === nonStrikerId) || { id: nonStrikerId, name: 'Non-Striker' };

  // Available batsmen who haven't batted and aren't currently batting
  const availableNextBatsmen = currentInnings.batsmen.filter(
    (b) => !b.isOut && !b.isBatting
  );

  const [dismissalType, setDismissalType] = useState('caught');
  const [playerOutId, setPlayerOutId] = useState(strikerId);
  const [fielderName, setFielderName] = useState('');
  const [newBatterId, setNewBatterId] = useState(availableNextBatsmen[0]?.id || '');
  const [runsScored, setRunsScored] = useState(0);
  const [extraType, setExtraType] = useState('none');

  const selectedDismissal = DISMISSAL_TYPES.find((d) => d.id === dismissalType);

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmitWicket({
      dismissalType,
      playerOutId,
      fielderName: selectedDismissal?.needsFielder ? fielderName.trim() : null,
      newBatterId: currentInnings.wickets < 9 ? newBatterId : null,
      runsScored: parseInt(runsScored, 10) || 0,
      extraType: extraType === 'none' ? null : extraType,
      extraRuns: extraType === 'wide' || extraType === 'no_ball' ? 1 : 0,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="w-full max-w-xl max-h-[90vh] glass-panel-elevated border border-white/[0.18] rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-2xl flex flex-col relative overflow-hidden font-sans"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-400/40 animate-pulse">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-display">
                  Wicket Dismissal
                </h3>
                <p className="text-xs text-slate-300">
                  Select dismissal type, player out, and incoming batsman
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

          <form id="wicket-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto mt-4 space-y-4 pr-1">
            {/* Batter Out Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Batter Dismissed (Out)
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPlayerOutId(striker.id)}
                  className={`liquid-btn p-3.5 rounded-2xl text-left flex-col items-start ${
                    playerOutId === striker.id
                      ? 'liquid-btn-rose'
                      : 'liquid-btn-secondary'
                  }`}
                >
                  <p className="text-[10px] uppercase tracking-wider font-bold text-rose-300">
                    Striker
                  </p>
                  <p className="text-sm font-bold mt-0.5 text-white">{striker.name}</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPlayerOutId(nonStriker.id)}
                  className={`liquid-btn p-3.5 rounded-2xl text-left flex-col items-start ${
                    playerOutId === nonStriker.id
                      ? 'liquid-btn-rose'
                      : 'liquid-btn-secondary'
                  }`}
                >
                  <p className="text-[10px] uppercase tracking-wider font-bold text-rose-300">
                    Non-Striker
                  </p>
                  <p className="text-sm font-bold mt-0.5 text-white">{nonStriker.name}</p>
                </button>
              </div>
            </div>

            {/* Dismissal Type Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Method of Dismissal
              </label>
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2">
                {DISMISSAL_TYPES.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDismissalType(d.id)}
                    className={`liquid-btn py-2.5 px-2 rounded-xl text-xs font-semibold text-center ${
                      dismissalType === d.id
                        ? 'liquid-btn-rose font-bold'
                        : 'liquid-btn-secondary'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Fielder Name if needed */}
            {selectedDismissal?.needsFielder && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Fielder Name
                </label>
                <input
                  type="text"
                  value={fielderName}
                  onChange={(e) => setFielderName(e.target.value)}
                  placeholder="Enter Fielder Name"
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.12] focus:border-rose-400 rounded-xl text-xs text-white outline-none backdrop-blur-md"
                  autoFocus
                />
              </div>
            )}

            {/* Next Incoming Batsman Picker */}
            {currentInnings.wickets < 9 && (
              <div>
                <label className="block text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-1.5">
                  Incoming Batter
                </label>
                {availableNextBatsmen.length > 0 ? (
                  <select
                    value={newBatterId}
                    onChange={(e) => setNewBatterId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-cyan-400/40 focus:border-cyan-400 rounded-xl text-xs text-cyan-200 outline-none font-semibold backdrop-blur-md"
                  >
                    {availableNextBatsmen.map((b) => (
                      <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                        {b.name} ({b.role})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-slate-400 italic p-3 bg-white/[0.03] rounded-xl border border-white/[0.08]">
                    No further players available in roster. Innings will close automatically.
                  </p>
                )}
              </div>
            )}

            {/* Runs scored on the delivery */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Runs Scored
                </label>
                <select
                  value={runsScored}
                  onChange={(e) => setRunsScored(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900/90 border border-white/[0.1] rounded-xl text-xs text-slate-200 outline-none backdrop-blur-md"
                >
                  <option value="0" className="bg-slate-900 text-white">0 (No Runs)</option>
                  <option value="1" className="bg-slate-900 text-white">1 Run</option>
                  <option value="2" className="bg-slate-900 text-white">2 Runs</option>
                  <option value="3" className="bg-slate-900 text-white">3 Runs</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Extra Type
                </label>
                <select
                  value={extraType}
                  onChange={(e) => setExtraType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900/90 border border-white/[0.1] rounded-xl text-xs text-slate-200 outline-none backdrop-blur-md"
                >
                  <option value="none" className="bg-slate-900 text-white">None (Legal Ball)</option>
                  <option value="wide" className="bg-slate-900 text-white">Wide Ball (+1)</option>
                  <option value="no_ball" className="bg-slate-900 text-white">No Ball (+1)</option>
                </select>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="pt-4 border-t border-white/[0.08] shrink-0 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="liquid-btn liquid-btn-secondary px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="wicket-form"
              className="liquid-btn liquid-btn-rose px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Confirm Wicket
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
