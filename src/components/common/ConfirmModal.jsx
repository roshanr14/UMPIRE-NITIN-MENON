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
        return 'liquid-btn-rose';
      case 'warning':
        return 'liquid-btn-amber';
      case 'primary':
      default:
        return 'liquid-btn-primary';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="w-full max-w-md glass-panel-elevated border border-white/[0.18] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden font-sans"
        >
          {/* Accent top gradient */}
          <div
            className={`absolute top-0 left-0 right-0 h-1 ${
              confirmVariant === 'danger'
                ? 'bg-gradient-to-r from-rose-500 via-pink-400 to-amber-400'
                : confirmVariant === 'warning'
                ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-400'
                : 'bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400'
            }`}
          />

          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-2xl shrink-0 ${
                confirmVariant === 'danger'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-400/40'
                  : confirmVariant === 'warning'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
              }`}
            >
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-bold text-white font-display tracking-tight">
                {title}
              </h3>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed font-normal">
                {message}
              </p>
            </div>

            <button
              onClick={onCancel}
              className="liquid-btn-icon w-8 h-8 rounded-xl text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onCancel}
              className="liquid-btn liquid-btn-secondary px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`liquid-btn px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${getConfirmStyle()}`}
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
