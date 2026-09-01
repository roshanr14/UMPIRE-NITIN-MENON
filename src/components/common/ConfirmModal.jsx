import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Check } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title = 'Are you sure?',
  message = 'This action may affect match statistics.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger', // 'danger' | 'warning' | 'primary'
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  const getConfirmStyle = () => {
    switch (confirmVariant) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/30 border border-red-500/30';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/30 border border-amber-500/30';
      case 'primary':
      default:
        return 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 border border-emerald-500/30';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
        >
          {/* Accent top gradient */}
          <div
            className={`absolute top-0 left-0 right-0 h-1.5 ${
              confirmVariant === 'danger'
                ? 'bg-gradient-to-r from-red-600 via-rose-500 to-amber-500'
                : confirmVariant === 'warning'
                ? 'bg-gradient-to-r from-amber-600 via-yellow-500 to-orange-500'
                : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500'
            }`}
          />

          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-xl shrink-0 ${
                confirmVariant === 'danger'
                  ? 'bg-red-950/80 text-red-400 border border-red-800/40'
                  : confirmVariant === 'warning'
                  ? 'bg-amber-950/80 text-amber-400 border border-amber-800/40'
                  : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40'
              }`}
            >
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-100 font-display tracking-tight">
                {title}
              </h3>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed font-normal">
                {message}
              </p>
            </div>

            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-800/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-slate-100 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 transition-all"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95 ${getConfirmStyle()}`}
            >
              <Check className="w-4 h-4" />
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
