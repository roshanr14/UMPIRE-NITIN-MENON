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
        className="fixed bottom-6 right-6 z-40 max-w-sm w-full p-4 rounded-3xl bg-slate-900/95 border border-emerald-500/50 shadow-2xl backdrop-blur-md text-slate-100 space-y-2"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-950'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold font-display text-white">
                {isListening ? 'Voice Scoring Active' : 'Voice Assistant'}
              </h4>
              <p className="text-[10px] text-emerald-400 font-medium">
                {isListening ? 'Listening for calls ("four", "wicket", "wide")...' : 'Paused'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggle}
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            >
              {isListening ? 'Mute' : 'Listen'}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Audio Wave animation while listening */}
        {isListening && (
          <div className="flex items-center justify-center gap-1 py-1.5 bg-slate-950/70 rounded-xl border border-slate-800/80">
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
                className="w-1 bg-gradient-to-t from-emerald-500 to-teal-300 rounded-full"
              />
            ))}
          </div>
        )}

        {/* Last Command feedback */}
        {lastCommand && (
          <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-emerald-300 font-semibold truncate">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Executed: {lastCommand.text}</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400/80">Just now</span>
          </div>
        )}

        {/* Interim Speech Transcript */}
        {lastTranscript && isListening && (
          <p className="text-[11px] text-slate-400 italic font-mono truncate px-1">
            "{lastTranscript}"
          </p>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
