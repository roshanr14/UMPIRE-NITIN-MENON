import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  X,
  Smartphone,
  Laptop,
  WifiOff,
  Mic,
  Zap,
  CheckCircle2,
  Share,
  PlusSquare,
  Sparkles,
} from 'lucide-react';

export default function InstallAppModal({
  isOpen,
  onClose,
  onInstall,
  isInstalled,
  isStandalone,
  platform,
  hasPrompt,
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 font-sans">
        {/* Backdrop Glass Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#050713]/80 backdrop-blur-xl -z-10"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="w-full max-w-lg rounded-3xl glass-panel-elevated border border-cyan-500/30 p-5 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.6)] text-slate-100 relative overflow-hidden"
        >
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/[0.08] relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/25 shrink-0 flex items-center justify-center">
                <div className="w-full h-full bg-[#050713] rounded-[14px] flex items-center justify-center">
                  <Download className="w-6 h-6 text-cyan-300" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-white font-display">
                    Install CricScore Web App
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                    PWA
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Download and use directly on your PC, Android, or iOS device.
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

          {/* Benefits Feature Cards */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 my-5 relative z-10">
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                <WifiOff className="w-4 h-4 text-cyan-400" />
                <span>100% Offline</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Score matches anywhere without Wi-Fi or cellular data.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                <Mic className="w-4 h-4 text-rose-400" />
                <span>Voice Umpire</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Hands-free speech scoring active on app launch.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Instant Load</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Zero lag launch from your desktop taskbar or home screen.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Standalone UI</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Full-screen app experience without browser URL bars.
              </p>
            </div>
          </div>

          {/* Interactive Install Guide / Action Area */}
          <div className="space-y-3 relative z-10">
            {isStandalone || isInstalled ? (
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-emerald-300 text-xs font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>CricScore is installed on this device!</span>
                </div>
                <button
                  onClick={onClose}
                  className="liquid-btn liquid-btn-primary px-3 py-1.5 rounded-xl text-xs font-bold"
                >
                  Done
                </button>
              </div>
            ) : platform.isIOS ? (
              /* iOS Safari Manual Instructions */
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-cyan-400/30 space-y-3">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                  <Smartphone className="w-4 h-4" />
                  <span>How to install on iPhone & iPad (Safari):</span>
                </div>
                <ol className="text-xs text-slate-300 space-y-2 font-medium">
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-white/[0.08] text-cyan-300 flex items-center justify-center text-[10px] font-bold">1</span>
                    <span>Tap the <strong className="text-white">Share</strong> button <Share className="w-3.5 h-3.5 inline mx-1 text-cyan-400" /> in Safari's bottom toolbar.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-white/[0.08] text-cyan-300 flex items-center justify-center text-[10px] font-bold">2</span>
                    <span>Scroll down and select <strong className="text-white">"Add to Home Screen"</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-cyan-400" />.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-white/[0.08] text-cyan-300 flex items-center justify-center text-[10px] font-bold">3</span>
                    <span>Tap <strong className="text-white">Add</strong> in the top-right corner to finish.</span>
                  </li>
                </ol>
              </div>
            ) : (
              /* Chrome, Edge & Android Direct Install Button */
              <div className="space-y-2">
                <button
                  onClick={onInstall}
                  className="liquid-btn liquid-btn-primary w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-cyan-500/20 text-white"
                >
                  <Download className="w-5 h-5 text-cyan-200" />
                  <span>Download & Install Web App Now</span>
                </button>
                <p className="text-[11px] text-center text-slate-400">
                  {platform.isDesktop
                    ? 'Adds CricScore as a standalone app to your Windows or Mac desktop.'
                    : 'Adds CricScore as a native web app to your Android home screen.'}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
