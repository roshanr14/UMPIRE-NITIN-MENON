import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PlusCircle,
  Trophy,
  Calendar,
  MapPin,
  ChevronRight,
  Trash2,
  FileText,
  Activity,
  Wifi,
  WifiOff,
  Shield,
  Zap,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useMatch } from '../../context/MatchContext';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../common/ConfirmModal';

export default function Dashboard({
  onOpenCreateMatch,
  onNavigateToScoring,
  onNavigateToSummary,
}) {
  const { match, matchList, loadMatch, deleteMatch, isOnline } = useMatch();
  const { user } = useAuth();

  const [filter, setFilter] = useState('all'); // 'all' | 'live' | 'completed'
  const [matchToDelete, setMatchToDelete] = useState(null);

  const filteredMatches = matchList.filter((m) => {
    if (filter === 'live') return m.status === 'live' || m.status === 'innings_break' || m.status === 'paused';
    if (filter === 'completed') return m.status === 'completed';
    return true;
  });

  const handleSelectMatch = (mId) => {
    loadMatch(mId);
    onNavigateToScoring();
  };

  const handleOpenScorecard = (mId, e) => {
    e.stopPropagation();
    loadMatch(mId);
    onNavigateToSummary();
  };

  const confirmDelete = () => {
    if (matchToDelete) {
      deleteMatch(matchToDelete);
      setMatchToDelete(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Liquid Glass Hero Banner & Statistics */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl glass-panel p-4 sm:p-6 lg:p-8 shadow-2xl border border-white/[0.12]">
        {/* Soft Ambient Light Glow within Glass */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-white/[0.06] text-cyan-300 border border-cyan-400/30 backdrop-blur-md flex items-center gap-1.5 shadow-sm">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                Umpire Match Centre
              </span>
              <span className="text-[11px] sm:text-xs text-slate-400 truncate max-w-[180px] sm:max-w-none">
                Official: <strong className="text-white font-semibold">{user?.user_metadata?.name || 'Nitin Menon'}</strong>
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white font-display">
              UMPIRE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300">NITIN </span><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400">MENON</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed font-semibold tracking-wide">
              NAA THAAN INGA KING UHH ,NAA SOLRATHU THAAN INGA RULES UHH
            </p>
          </div>

          <button
            onClick={onOpenCreateMatch}
            className="liquid-btn liquid-btn-primary w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shrink-0"
          >
            <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-200" />
            <span>Create New Match</span>
          </button>
        </div>

        {/* Liquid Glass Stat Counter Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/[0.08]">
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl shadow-inner">
            <p className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-slate-400">Total Matches</p>
            <p className="text-xl sm:text-2xl font-black text-white font-digit mt-0.5 sm:mt-1">{matchList.length}</p>
          </div>
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/[0.03] border border-rose-500/20 backdrop-blur-xl shadow-inner">
            <p className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-slate-400">Active Matches</p>
            <p className="text-xl sm:text-2xl font-black text-rose-400 font-digit mt-0.5 sm:mt-1">
              {matchList.filter((m) => m.status === 'live' || m.status === 'innings_break').length}
            </p>
          </div>
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl shadow-inner">
            <p className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-slate-400">Cloud Sync</p>
            <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-1.5 text-xs font-semibold">
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                  <span className="text-emerald-300 text-[11px] sm:text-xs truncate">Synced</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
                  <span className="text-amber-200 text-[11px] sm:text-xs truncate">Offline</span>
                </>
              )}
            </div>
          </div>
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl shadow-inner">
            <p className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-slate-400">Scorer</p>
            <p className="text-xs font-bold text-slate-200 truncate mt-1 sm:mt-2 font-display">
              {user?.user_metadata?.name || 'Nitin Menon'}
            </p>
          </div>
        </div>
      </div>

      {/* Active Match Spotlight Card (If match loaded) */}
      {match && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl glass-panel-interactive border-cyan-400/30 shadow-[0_20px_50px_rgba(0,0,0,0.35)] relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1 sm:space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-rose-400" />
                  LIVE MATCH
                </span>
                <span className="text-[11px] sm:text-xs text-slate-400">• {match.format} ({match.totalOvers} Overs)</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white font-display tracking-tight">
                {match.teamA.name} <span className="text-slate-400 font-normal">vs</span> {match.teamB.name}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-300 flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  {match.venue}
                </span>
                <span>•</span>
                <span>Toss: {match.toss.winnerName} ({match.toss.decision})</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto text-xs font-semibold">
              <button
                onClick={onNavigateToScoring}
                className="liquid-btn liquid-btn-amber flex-1 md:flex-none px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-white font-bold gap-2 justify-center"
              >
                <Activity className="w-4 h-4 text-amber-200" />
                <span>Resume Scoring</span>
              </button>
              <button
                onClick={onNavigateToSummary}
                className="liquid-btn liquid-btn-secondary flex-1 md:flex-none px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-cyan-300 hover:text-white font-medium gap-2 justify-center"
              >
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Scorecard</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Match History & Matches List */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3">
          <div>
            <h3 className="text-base sm:text-xl font-black text-white font-display">
              Match Archive
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400">
              Select recorded matches to resume scoring or download official PDF report
            </p>
          </div>

          <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl sm:rounded-2xl border border-white/[0.08] backdrop-blur-xl text-xs font-medium w-full sm:w-auto">
            <button
              onClick={() => setFilter('all')}
              className={`liquid-btn flex-1 sm:flex-none px-3 py-1.5 rounded-lg sm:rounded-xl transition-all duration-200 text-xs justify-center ${
                filter === 'all'
                  ? 'liquid-btn-primary font-bold'
                  : 'liquid-btn-secondary'
              }`}
            >
              All ({matchList.length})
            </button>
            <button
              onClick={() => setFilter('live')}
              className={`liquid-btn flex-1 sm:flex-none px-3 py-1.5 rounded-lg sm:rounded-xl transition-all duration-200 text-xs justify-center ${
                filter === 'live'
                  ? 'liquid-btn-rose font-bold'
                  : 'liquid-btn-secondary'
              }`}
            >
              Live
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`liquid-btn flex-1 sm:flex-none px-3 py-1.5 rounded-lg sm:rounded-xl transition-all duration-200 text-xs justify-center ${
                filter === 'completed'
                  ? 'liquid-btn-emerald font-bold'
                  : 'liquid-btn-secondary'
              }`}
            >
              Finished
            </button>
          </div>
        </div>

        {filteredMatches.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl sm:rounded-3xl glass-panel border border-white/[0.08]">
            <Trophy className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2.5 text-slate-500" />
            <p className="text-sm font-semibold text-slate-300">No Match Records Found</p>
            <p className="text-xs text-slate-400 mt-1">Initiate a new cricket match using the button above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {filteredMatches.map((m) => (
              <div
                key={m.id}
                onClick={() => handleSelectMatch(m.id)}
                className="p-5 rounded-3xl glass-panel-interactive border border-white/[0.08] hover:border-cyan-400/40 transition-all cursor-pointer group space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase font-semibold text-cyan-300">
                    {m.format} • {m.totalOvers} OVERS
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        m.status === 'live'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {m.status}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMatchToDelete(m.id);
                      }}
                      className="liquid-btn-icon w-7 h-7 rounded-xl text-slate-400 hover:text-rose-400"
                      title="Delete match"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-display font-bold text-white text-base group-hover:text-cyan-300 transition-colors">
                      {m.teamA.name} <span className="text-slate-400 font-normal">vs</span> {m.teamB.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {m.result || 'Match in Progress'}
                    </p>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
                  <span>{m.date}</span>
                  <button
                    type="button"
                    onClick={(e) => handleOpenScorecard(m.id, e)}
                    className="liquid-btn liquid-btn-secondary px-3 py-1 rounded-xl text-cyan-300 hover:text-white font-medium flex items-center gap-1"
                  >
                    <span>View Scorecard</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={Boolean(matchToDelete)}
        title="Delete Match Record?"
        message="Are you sure you want to delete this match record? All scorecard stats will be permanently removed."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setMatchToDelete(null)}
      />
    </div>
  );
}
