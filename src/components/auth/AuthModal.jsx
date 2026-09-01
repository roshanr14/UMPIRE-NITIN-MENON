import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, X, Mail, Lock, Shield, CheckCircle, ArrowRight, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const { user, login, signup, logout, updateProfile } = useAuth();

  const [mode, setMode] = useState('profile'); // 'login' | 'signup' | 'profile'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(user?.user_metadata?.name || 'Official Umpire');
  const [role, setRole] = useState(user?.user_metadata?.role || 'Lead Match Umpire');
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-100 font-display">
                  {mode === 'profile'
                    ? 'Umpire Profile & Session'
                    : mode === 'login'
                    ? 'Umpire Sign In'
                    : 'Register Scorer Account'}
                </h3>
                <p className="text-xs text-slate-400">
                  {mode === 'profile'
                    ? 'Manage audit identity and credentials'
                    : 'Supabase Authentication'}
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

          {errorMsg && (
            <div className="mt-4 p-3 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-300">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              {successMsg}
            </div>
          )}

          {/* Profile Mode */}
          {mode === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="mt-6 space-y-4">
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="w-12 h-12 rounded-xl bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-lg">
                  {name.charAt(0) || 'U'}
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">{name}</h4>
                  <p className="text-xs text-slate-400">{user?.email || 'Guest Scorer'}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                    {role}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Scorer / Umpire Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm text-slate-100 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Official Match Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm text-slate-100 outline-none"
                >
                  <option value="Lead Match Umpire">Lead Match Umpire</option>
                  <option value="Leg Umpire">Leg Umpire</option>
                  <option value="Third Umpire">Third Umpire / TV Umpire</option>
                  <option value="Official Scorer">Official Match Scorer</option>
                  <option value="Match Referee">Match Referee</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  Switch / Sign in with Supabase
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 transition-all"
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
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="umpire@ground.org"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm text-slate-100 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm text-slate-100 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-xs text-slate-400 hover:text-emerald-400"
                >
                  Need an account? Sign up
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 transition-all"
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>
              </div>

              <div className="pt-3 border-t border-slate-800 text-center">
                <button
                  type="button"
                  onClick={() => setMode('profile')}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Continue as Guest Scorer
                </button>
              </div>
            </form>
          )}

          {/* Signup Mode */}
          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Richard Kettleborough"
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm text-slate-100 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="umpire@ground.org"
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm text-slate-100 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm text-slate-100 outline-none"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs text-slate-400 hover:text-emerald-400"
                >
                  Already registered? Sign in
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 transition-all"
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
