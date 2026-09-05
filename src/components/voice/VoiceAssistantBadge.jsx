import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Sparkles, X, HelpCircle, Volume2, CheckCircle2 } from 'lucide-react';

export default function VoiceAssistantBadge({
  isListening,
  lastTranscript,
  lastCommand,
  onToggle,
  onClose,
}) {
  const [showCheatsheet, setShowCheatsheet] = useState(false);

  if (!isListening && !lastCommand) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 z-40 sm:max-w-sm p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl glass-panel-elevated border border-cyan-500/25 shadow-2xl text-slate-100 space-y-2.5 font-sans backdrop-blur-xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                isListening
                  ? 'bg-gradient-to-br from-rose-500/40 to-pink-600/30 text-rose-300 border border-rose-400/50 animate-pulse shadow-lg shadow-rose-500/25'
                  : 'bg-white/[0.04] text-slate-400 border border-white/[0.08]'
              }`}
            >
              {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold font-display text-white flex items-center gap-1">
                  {isListening ? 'Voice Assistant Active' : 'Voice Assistant'}
                </h4>
                {isListening && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                )}
              </div>
              <p className="text-[10px] text-cyan-300 font-medium">
                {isListening ? 'Speak any call: "four", "single", "six", "wicket"...' : 'Assistant Muted'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowCheatsheet(!showCheatsheet)}
              title="Voice Commands Guide"
              className={`liquid-btn-icon w-6 h-6 rounded-lg ${
                showCheatsheet ? 'text-cyan-300 bg-cyan-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onToggle}
              className={`liquid-btn px-3 py-1 rounded-xl text-[10px] font-bold ${
                isListening ? 'liquid-btn-rose text-white' : 'liquid-btn-primary text-cyan-200'
              }`}
            >
              {isListening ? 'Mute' : 'Listen'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="liquid-btn-icon w-6 h-6 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Audio Wave Visualizer animation while actively listening */}
        {isListening && (
          <div className="flex items-center justify-center gap-1.5 py-2 bg-black/20 rounded-2xl border border-white/[0.06]">
            {[35, 70, 95, 55, 85, 40, 75, 50, 90, 30, 65, 80].map((h, i) => (
              <motion.div
                key={i}
                animate={{
                  height: [4, h * 0.22, 4],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 0.5 + (i % 4) * 0.15,
                  ease: 'easeInOut',
                }}
                className="w-1 bg-gradient-to-t from-cyan-400 via-sky-300 to-indigo-300 rounded-full"
              />
            ))}
          </div>
        )}

        {/* Real-time recognized speech transcript */}
        {lastTranscript && isListening && (
          <div className="px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center gap-2">
            <Volume2 className="w-3 h-3 text-cyan-400 shrink-0" />
            <p className="text-[11px] text-slate-200 italic font-sans truncate">
              "{lastTranscript}"
            </p>
          </div>
        )}

        {/* Last Executed Command Feedback Toast */}
        {lastCommand && (
          <div className="p-2.5 rounded-2xl bg-cyan-500/15 border border-cyan-400/35 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-cyan-300 font-semibold truncate">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Scored Live: <strong className="text-white">{lastCommand.text}</strong></span>
            </div>
            <span className="text-[10px] font-digit text-cyan-400/80 shrink-0">Updated</span>
          </div>
        )}

        {/* Voice Commands Guide Cheatsheet */}
        {showCheatsheet && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-2 border-t border-white/[0.08] space-y-1.5 text-[10px]"
          >
            <p className="font-bold text-white uppercase tracking-wider text-[9px]">Voice Command Guide:</p>
            <div className="grid grid-cols-2 gap-1 text-slate-300 font-medium">
              <div className="bg-white/[0.03] p-1.5 rounded-lg">
                <span className="text-amber-300 font-bold">"Four" / "Boundary"</span>: 4 Runs
              </div>
              <div className="bg-white/[0.03] p-1.5 rounded-lg">
                <span className="text-rose-300 font-bold">"Six" / "Maximum"</span>: 6 Runs
              </div>
              <div className="bg-white/[0.03] p-1.5 rounded-lg">
                <span className="text-cyan-300 font-bold">"Single" / "One"</span>: 1 Run
              </div>
              <div className="bg-white/[0.03] p-1.5 rounded-lg">
                <span className="text-cyan-300 font-bold">"Two" / "Double"</span>: 2 Runs
              </div>
              <div className="bg-white/[0.03] p-1.5 rounded-lg">
                <span className="text-slate-300 font-bold">"Dot" / "Zero"</span>: 0 Runs
              </div>
              <div className="bg-white/[0.03] p-1.5 rounded-lg">
                <span className="text-rose-400 font-bold">"Wicket" / "Out"</span>: Wicket
              </div>
              <div className="bg-white/[0.03] p-1.5 rounded-lg">
                <span className="text-purple-300 font-bold">"Wide" / "No Ball"</span>: Extras
              </div>
              <div className="bg-white/[0.03] p-1.5 rounded-lg">
                <span className="text-amber-400 font-bold">"Undo"</span>: Undo Ball
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

