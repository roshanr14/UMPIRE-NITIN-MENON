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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="w-full max-w-xl max-h-[90vh] cyber-card border-2 border-[#ff0055]/50 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#ff0055]/20 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#ff0055]/10 text-[#ff0055] border border-[#ff0055]/30">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-cyber text-glow-pink">
                  WICKET DISMISSAL
                </h3>
                <p className="text-xs font-mono text-slate-400">
                  Select dismissal type, player out, and incoming batsman
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

          <form id="wicket-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto mt-4 space-y-4 pr-1 font-mono">
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
                      ? 'bg-[#2b000a] text-white border-[#ff0055] shadow-lg shadow-[#ff0055]/30 ring-1 ring-[#ff0055]'
                      : 'bg-[#050814] text-slate-300 border-[#ff0055]/20 hover:border-[#ff0055]'
                  }`}
                >
                  <p className="text-[10px] uppercase tracking-wider font-extrabold text-[#ff0055]">
                    Striker
                  </p>
                  <p className="text-sm font-bold font-cyber mt-0.5">{striker.name}</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPlayerOutId(nonStriker.id)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    playerOutId === nonStriker.id
                      ? 'bg-[#2b000a] text-white border-[#ff0055] shadow-lg shadow-[#ff0055]/30 ring-1 ring-[#ff0055]'
                      : 'bg-[#050814] text-slate-300 border-[#ff0055]/20 hover:border-[#ff0055]'
                  }`}
                >
                  <p className="text-[10px] uppercase tracking-wider font-extrabold text-[#ff0055]">
                    Non-Striker
                  </p>
                  <p className="text-sm font-bold font-cyber mt-0.5">{nonStriker.name}</p>
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
                        ? 'bg-[#ff0055] text-white border-[#ff0055] shadow-md shadow-[#ff0055]/30 font-black'
                        : 'bg-[#050814] text-slate-300 border-[#ff0055]/20 hover:border-[#ff0055]'
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
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Fielder Name
                </label>
                <input
                  type="text"
                  value={fielderName}
                  onChange={(e) => setFielderName(e.target.value)}
                  placeholder="Enter Fielder Name"
                  className="w-full px-3.5 py-2.5 bg-[#050814] border border-[#ff0055]/30 focus:border-[#ff0055] rounded-xl text-xs text-white outline-none"
                  autoFocus
                />
              </div>
            )}

            {/* Next Incoming Batsman Picker */}
            {currentInnings.wickets < 9 && (
              <div>
                <label className="block text-xs font-bold text-[#00f0ff] uppercase tracking-wider mb-1.5">
                  Incoming Batter
                </label>
                {availableNextBatsmen.length > 0 ? (
                  <select
                    value={newBatterId}
                    onChange={(e) => setNewBatterId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#050814] border border-[#00f0ff]/40 focus:border-[#00f0ff] rounded-xl text-xs text-[#00f0ff] outline-none font-bold"
                  >
                    {availableNextBatsmen.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.role})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-slate-500 italic p-2 bg-[#050814] rounded-xl border border-slate-800">
                    No further players available in roster. Innings will close automatically.
                  </p>
                )}
              </div>
            )}

            {/* Runs scored on the delivery */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Runs Scored
                </label>
                <select
                  value={runsScored}
                  onChange={(e) => setRunsScored(e.target.value)}
                  className="w-full px-3 py-2 bg-[#050814] border border-slate-800 rounded-xl text-xs text-slate-100 outline-none"
                >
                  <option value="0">0 (No Runs)</option>
                  <option value="1">1 Run</option>
                  <option value="2">2 Runs</option>
                  <option value="3">3 Runs</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Extra Type
                </label>
                <select
                  value={extraType}
                  onChange={(e) => setExtraType(e.target.value)}
                  className="w-full px-3 py-2 bg-[#050814] border border-slate-800 rounded-xl text-xs text-slate-100 outline-none"
                >
                  <option value="none">None (Legal Ball)</option>
                  <option value="wide">Wide Ball (+1)</option>
                  <option value="no_ball">No Ball (+1)</option>
                </select>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="pt-4 border-t border-[#ff0055]/20 shrink-0 flex items-center justify-between font-cyber">
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
              className="px-6 py-2.5 rounded-xl bg-[#ff0055] hover:bg-[#ff2470] text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-[#ff0055]/40 active:scale-95 border border-[#ff0055]"
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
