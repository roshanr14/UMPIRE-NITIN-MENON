import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon, X, UserMinus, UserCheck, ShieldAlert, Check } from 'lucide-react';
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="w-full max-w-xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-100 font-display">
                  Wicket Dismissal
                </h3>
                <p className="text-xs text-slate-400">
                  Select dismissal mode, batter dismissed, and incoming batsman
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

          <form id="wicket-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto mt-4 space-y-4 pr-1">
            {/* Batter Out Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Batter Dismissed (Out)
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPlayerOutId(striker.id)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    playerOutId === striker.id
                      ? 'bg-red-950/80 text-white border-red-500 shadow-md ring-1 ring-red-500'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <p className="text-[10px] uppercase tracking-wider font-extrabold text-red-400">
                    Striker (On Strike)
                  </p>
                  <p className="text-sm font-bold mt-0.5">{striker.name}</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPlayerOutId(nonStriker.id)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    playerOutId === nonStriker.id
                      ? 'bg-red-950/80 text-white border-red-500 shadow-md ring-1 ring-red-500'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <p className="text-[10px] uppercase tracking-wider font-extrabold text-red-400">
                    Non-Striker
                  </p>
                  <p className="text-sm font-bold mt-0.5">{nonStriker.name}</p>
                </button>
              </div>
            </div>

            {/* Dismissal Type Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Method of Dismissal
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {DISMISSAL_TYPES.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDismissalType(d.id)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                      dismissalType === d.id
                        ? 'bg-red-600 text-white border-red-400 shadow-md scale-102'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Fielder Name (If caught, run out, stumped) */}
            {selectedDismissal?.needsFielder && (
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  {selectedDismissal.fielderRole || 'Fielder'} Name (Optional)
                </label>
                <input
                  type="text"
                  value={fielderName}
                  onChange={(e) => setFielderName(e.target.value)}
                  placeholder="e.g. Fielder in deep"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl text-xs text-slate-100 outline-none"
                />
              </div>
            )}

            {/* Incoming Batsman (If not 10th wicket) */}
            {currentInnings.wickets < 9 && availableNextBatsmen.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Next Incoming Batter</span>
                  <span className="text-[10px] text-emerald-400 font-normal">
                    {availableNextBatsmen.length} batters remaining
                  </span>
                </label>
                <select
                  value={newBatterId}
                  onChange={(e) => setNewBatterId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-xs text-slate-100 outline-none font-semibold"
                  required
                >
                  {availableNextBatsmen.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Optional Runs on Wicket (e.g. Run out on 2nd run) */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Runs Completed
                </label>
                <div className="flex items-center gap-1">
                  {[0, 1, 2, 3].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRunsScored(r)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-digit font-bold border ${
                        runsScored === r
                          ? 'bg-slate-700 text-white border-slate-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Delivery Type
                </label>
                <select
                  value={extraType}
                  onChange={(e) => setExtraType(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 outline-none"
                >
                  <option value="none">Legal Ball</option>
                  <option value="wide">Wide (Run Out)</option>
                  <option value="no_ball">No Ball (Run Out)</option>
                </select>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-800 shrink-0 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="wicket-form"
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-red-950 active:scale-95 border border-red-500"
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
