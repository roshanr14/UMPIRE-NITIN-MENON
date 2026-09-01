import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X, Sparkles, CornerDownLeft } from 'lucide-react';

export default function ShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '0 or .', desc: 'Dot Ball (0 runs)', category: 'Scoring' },
    { key: '1', desc: 'Single (1 run & rotate strike)', category: 'Scoring' },
    { key: '2', desc: 'Double (2 runs)', category: 'Scoring' },
    { key: '3', desc: 'Three (3 runs & rotate strike)', category: 'Scoring' },
    { key: '4', desc: 'Boundary (4 runs)', category: 'Scoring' },
    { key: '6', desc: 'Maximum (6 runs)', category: 'Scoring' },
    { key: 'W', desc: 'Wide Delivery (+1)', category: 'Extras' },
    { key: 'N', desc: 'No Ball (+1 & Free Hit)', category: 'Extras' },
    { key: 'B', desc: 'Bye (+1 run)', category: 'Extras' },
    { key: 'L', desc: 'Leg Bye (+1 run)', category: 'Extras' },
    { key: 'K', desc: 'Wicket / Dismissal Dialog', category: 'Wickets' },
    { key: 'Ctrl + Z / U', desc: 'Undo Last Action', category: 'Actions' },
    { key: 'S', desc: 'Switch / Rotate Strike', category: 'Actions' },
    { key: 'P', desc: 'Pause / Resume Match', category: 'Actions' },
    { key: '?', desc: 'Toggle this Shortcuts Guide', category: 'System' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Keyboard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-100 font-display">
                  Umpire Keyboard Shortcuts
                </h3>
                <p className="text-xs text-slate-400">
                  Operate the live scoreboard at lightning speed with single keypresses
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

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
            {shortcuts.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-emerald-500/30 transition-all group"
              >
                <span className="text-sm font-medium text-slate-300 group-hover:text-white">
                  {item.desc}
                </span>
                <kbd className="px-2.5 py-1 text-xs font-mono font-bold text-emerald-400 bg-slate-900 border border-slate-700 rounded-lg shadow-sm group-hover:border-emerald-500/50">
                  {item.key}
                </kbd>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400/90 font-medium">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Hotkeys active anytime on Live Scoring screen
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950 transition-all"
            >
              Got it
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
