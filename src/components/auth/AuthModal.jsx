import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, X, Mail, Lock, Shield, CheckCircle, ArrowRight, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const { user, login, signup, logout, updateProfile } = useAuth();

  const [mode, setMode] = useState('profile'); // 'login' | 'signup' | 'profile'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(user?.user_metadata?.name || 'Nitin Menon');
  const [role, setRole] = useState(user?.user_metadata?.role || 'ICC Elite Panel Umpire');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    const res = await login(email, password);
    if (res.error) {
      setErrorMsg(res.error.message);
    } else {
      setSuccessMsg('Logged in successfully!');
      setTimeout(() => {
        setMode('profile');
        setSuccessMsg('');
      }, 700);
    }
    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    const res = await signup(email, password, name, role);
    if (res.error) {
      setErrorMsg(res.error.message);
    } else {
      setSuccessMsg('Account registered successfully!');
      setTimeout(() => {
        setMode('profile');
        setSuccessMsg('');
      }, 700);
    }
    setLoading(false);
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    updateProfile(name, role);
    setSuccessMsg('Umpire Profile updated!');
    setTimeout(() => setSuccessMsg(''), 1500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-md max-h-[90vh] overflow-y-auto scrollbar-thin glass-panel-elevated border border-white/[0.18] rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-2xl relative font-sans"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
                <User className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white font-display">
                  {mode === 'profile'
                    ? 'Umpire Profile & Session'
                    : mode === 'login'
                    ? 'Umpire Sign In'
                    : 'Register Scorer Account'}
                </h3>
                <p className="text-xs text-slate-300">
                  {mode === 'profile'
                    ? 'Manage official identity and credentials'
                    : 'Cloud Database Synchronization'}
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

          {errorMsg && (
            <div className="mt-4 p-3 rounded-2xl bg-rose-500/20 border border-rose-400/30 text-xs text-rose-300">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mt-4 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              {successMsg}
            </div>
          )}

          {/* Profile Mode */}
          {mode === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="mt-6 space-y-4">
              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-500 text-slate-950 font-black text-xl flex items-center justify-center shadow-md">
                  {name.charAt(0) || 'N'}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{name}</h4>
                  <p className="text-xs text-slate-400">{user?.email || 'Official Scorer'}</p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                    {role}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Official Scorer / Umpire Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900/90 border border-white/[0.12] focus:border-cyan-400 rounded-xl text-sm text-slate-100 outline-none backdrop-blur-md"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Official Match Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900/90 border border-white/[0.12] focus:border-cyan-400 rounded-xl text-sm text-slate-100 outline-none backdrop-blur-md"
                >
                  <option value="ICC Elite Panel Umpire" className="bg-slate-900 text-white">ICC Elite Panel Umpire</option>
                  <option value="Lead Match Umpire" className="bg-slate-900 text-white">Lead Match Umpire</option>
                  <option value="Leg Umpire" className="bg-slate-900 text-white">Leg Umpire</option>
                  <option value="Third Umpire" className="bg-slate-900 text-white">Third Umpire / TV Umpire</option>
                  <option value="Official Scorer" className="bg-slate-900 text-white">Official Match Scorer</option>
                  <option value="Match Referee" className="bg-slate-900 text-white">Match Referee</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs text-cyan-300 hover:underline flex items-center gap-1 font-semibold"
                >
                  Switch / Cloud Account
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="submit"
                  className="liquid-btn liquid-btn-primary px-5 py-2.5 rounded-xl font-bold text-xs"
                >
                  Save Profile
                </button>
              </div>
            </form>
          )}

          {/* Login Mode */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="umpire@cricket.org"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-white/[0.12] focus:border-cyan-400 rounded-xl text-sm text-slate-100 outline-none backdrop-blur-md"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-white/[0.12] focus:border-cyan-400 rounded-xl text-sm text-slate-100 outline-none backdrop-blur-md"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-xs text-slate-400 hover:text-cyan-300"
                >
                  Need an account? Sign up
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="liquid-btn liquid-btn-primary px-5 py-2.5 rounded-xl font-bold text-xs"
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>
              </div>

              <div className="pt-3 border-t border-white/[0.08] text-center">
                <button
                  type="button"
                  onClick={() => setMode('profile')}
                  className="liquid-btn liquid-btn-secondary px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white"
                >
                  Continue as Guest Umpire
                </button>
              </div>
            </form>
          )}

          {/* Signup Mode */}
          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Nitin Menon"
                  className="w-full px-4 py-2.5 bg-slate-900/90 border border-white/[0.12] focus:border-cyan-400 rounded-xl text-sm text-slate-100 outline-none backdrop-blur-md"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="umpire@cricket.org"
                  className="w-full px-4 py-2.5 bg-slate-900/90 border border-white/[0.12] focus:border-cyan-400 rounded-xl text-sm text-slate-100 outline-none backdrop-blur-md"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full px-4 py-2.5 bg-slate-900/90 border border-white/[0.12] focus:border-cyan-400 rounded-xl text-sm text-slate-100 outline-none backdrop-blur-md"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs text-slate-400 hover:text-cyan-300"
                >
                  Already registered? Sign in
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="liquid-btn liquid-btn-primary px-5 py-2.5 rounded-xl font-bold text-xs"
                >
                  {loading ? 'Registering...' : 'Create Account'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
