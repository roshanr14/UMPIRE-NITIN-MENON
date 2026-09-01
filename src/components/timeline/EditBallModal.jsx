import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, X, AlertTriangle, Check, RotateCcw } from 'lucide-react';
import { getBallLabel } from '../../lib/cricketEngine';

export default function EditBallModal({
  isOpen,
  ball,
  onClose,
  onSaveEdit,
}) {
  if (!isOpen || !ball) return null;

  const [runs, setRuns] = useState(ball.runsScored ?? 0);
  const [extraType, setExtraType] = useState(ball.extraType || 'none');
  const [extraRuns, setExtraRuns] = useState(ball.extraRuns || 0);
  const [isWicket, setIsWicket] = useState(ball.isWicket || false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleApply = (e) => {
    e.preventDefault();
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    const isLegal = !(extraType === 'wide' || extraType === 'no_ball');
    onSaveEdit(ball.id, {
      runsScored: parseInt(runs, 10) || 0,
      extraType: extraType === 'none' ? null : extraType,
      extraRuns: extraType === 'none' ? 0 : parseInt(extraRuns, 10) || 1,
      isLegalDelivery: isLegal,
      isWicket: Boolean(isWicket),
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Edit3 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-100 font-display">
                  Edit Scoring Event
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Ball at {ball.oversAfter || '0.0'} ov ({ball.strikerName} vs {ball.bowlerName})
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

          <form onSubmit={handleApply} className="mt-6 space-y-4">
            {/* Current Ball Badge Preview */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">
                Original Recorded Result:
              </span>
              <span className="px-3 py-1 rounded-xl bg-slate-800 text-white font-digit font-bold text-sm border border-slate-700">
                {getBallLabel(ball)}
              </span>
            </div>

            {/* Change Runs */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Runs Off Bat
              </label>
              <div className="grid grid-cols-6 gap-2">
                {[0, 1, 2, 3, 4, 6].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRuns(r)}
                    className={`py-2.5 rounded-xl font-digit font-black text-sm border transition-all ${
                      runs === r
                        ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Change Extra Type */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Extra Delivery Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'none', label: 'None (Legal)' },
                  { id: 'wide', label: 'Wide' },
                  { id: 'no_ball', label: 'No Ball' },
                  { id: 'bye', label: 'Bye' },
                  { id: 'leg_bye', label: 'Leg Bye' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setExtraType(item.id);
                      if (item.id === 'wide' || item.id === 'no_ball') setExtraRuns(1);
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                      extraType === item.id
                        ? 'bg-amber-600 text-white border-amber-400 shadow-md'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle Wicket */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Dismissal / Wicket
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsWicket(false)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    !isWicket
                      ? 'bg-slate-800 text-white border-slate-600'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  Not Out
                </button>
                <button
                  type="button"
                  onClick={() => setIsWicket(true)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    isWicket
                      ? 'bg-red-600 text-white border-red-400 shadow-md'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-red-300'
                  }`}
                >
                  Wicket Dismissal (Out)
                </button>
              </div>
            </div>

            {/* Confirmation Box Before Saving */}
            {showConfirm && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-2xl bg-amber-950/70 border border-amber-800/80 text-xs text-amber-200 flex items-start gap-2.5"
              >
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">
                    Are you sure you want to edit this scoring event?
                  </p>
                  <p className="mt-0.5 text-amber-300/90">
                    This will adjust team totals, batter figures, and bowler records and create an audit log entry.
                  </p>
                </div>
              </motion.div>
            )}

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950 active:scale-95"
              >
                <Check className="w-4 h-4" />
                {showConfirm ? 'Confirm & Apply Edit' : 'Save Changes'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
