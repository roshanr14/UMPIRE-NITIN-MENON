import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Sparkles, X } from 'lucide-react';

export default function VoiceAssistantBadge({
  isListening,
  lastTranscript,
  lastCommand,
  onToggle,
  onClose,
}) {
  if (!isListening && !lastCommand) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="fixed bottom-6 right-6 z-40 max-w-sm w-full p-4 rounded-3xl glass-panel-elevated border border-white/[0.18] shadow-2xl text-slate-100 space-y-2.5 font-sans"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
                isListening
                  ? 'bg-rose-500/30 text-rose-300 border border-rose-400/50 animate-pulse shadow-md shadow-rose-500/20'
                  : 'bg-white/[0.04] text-slate-400 border border-white/[0.08]'
              }`}
            >
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold font-display text-white">
                {isListening ? 'Voice Assistant Active' : 'Voice Assistant'}
              </h4>
              <p className="text-[10px] text-cyan-300 font-medium">
                {isListening ? 'Listening for calls ("four", "wicket", "wide")...' : 'Paused'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggle}
              className="liquid-btn liquid-btn-secondary px-3 py-1 rounded-xl text-[10px] font-bold text-slate-200"
            >
              {isListening ? 'Mute' : 'Listen'}
            </button>
            <button
              onClick={onClose}
              className="liquid-btn-icon w-6 h-6 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Audio Wave animation while listening */}
        {isListening && (
          <div className="flex items-center justify-center gap-1.5 py-2 bg-white/[0.03] rounded-2xl border border-white/[0.06]">
            {[40, 75, 100, 60, 90, 45, 80, 55, 95, 30].map((h, i) => (
              <motion.div
                key={i}
                animate={{
                  height: [6, h * 0.22, 6],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 0.6 + (i % 3) * 0.2,
                  ease: 'easeInOut',
                }}
                className="w-1 bg-gradient-to-t from-cyan-400 via-sky-300 to-indigo-300 rounded-full"
              />
            ))}
          </div>
        )}

        {/* Last Command feedback */}
        {lastCommand && (
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-cyan-300 font-semibold truncate">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">Executed: {lastCommand.text}</span>
            </div>
            <span className="text-[10px] font-digit text-cyan-400/80">Just now</span>
          </div>
        )}

        {/* Interim Speech Transcript */}
        {lastTranscript && isListening && (
          <p className="text-[11px] text-slate-300 italic font-sans truncate px-1">
            "{lastTranscript}"
          </p>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
