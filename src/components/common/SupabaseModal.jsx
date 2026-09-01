import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, X, CheckCircle2, ShieldCheck, RefreshCw, AlertCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabaseManager } from '../../lib/supabase';

export default function SupabaseModal({ isOpen, onClose }) {
  const { isConfigured, updateSupabaseConfig } = useAuth();
  const currentConfig = supabaseManager.getConfig();

  const [url, setUrl] = useState(currentConfig.url || '');
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey || '');
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState(null); // { success: boolean, msg: string }

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setTesting(true);
    setStatus(null);

    const ok = updateSupabaseConfig(url.trim(), anonKey.trim());
    if (ok && url.trim() && anonKey.trim()) {
      setStatus({ success: true, msg: 'Supabase PostgreSQL credentials saved and active!' });
    } else if (!url.trim() && !anonKey.trim()) {
      supabaseManager.clearConfig();
      setStatus({ success: true, msg: 'Cleared Supabase configuration. Switched to offline-first local database.' });
    } else {
      setStatus({ success: false, msg: 'Please provide valid Supabase Project URL and Anon API key.' });
    }
    setTesting(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-100 font-display">
                  Supabase Cloud Synchronization
                </h3>
                <p className="text-xs text-slate-400">
                  Connect your Supabase PostgreSQL backend for live cloud sync
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

          <form onSubmit={handleSave} className="mt-6 space-y-4">
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-200">
                  Offline-First Architecture Active
                </p>
                <p className="mt-0.5 text-slate-400">
                  All match statistics, balls, and audit logs are continuously saved to your device's IndexedDB. When connected to Supabase, matches sync automatically in real-time.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Supabase Project URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm text-slate-100 outline-none transition-all placeholder:text-slate-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Supabase Anon / Public Key
              </label>
              <input
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm text-slate-100 outline-none transition-all placeholder:text-slate-600 font-mono"
              />
            </div>

            {status && (
              <div
                className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  status.success
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                    : 'bg-red-950/60 text-red-300 border border-red-800/60'
                }`}
              >
                {status.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <span>{status.msg}</span>
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <a
                href="https://supabase.com/docs"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
              >
                <span>Supabase Docs</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-all"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={testing}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950 transition-all active:scale-95 disabled:opacity-50"
                >
                  {testing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Save Credentials
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
