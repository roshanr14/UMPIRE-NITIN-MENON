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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner & Quick Stat Badges */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/40 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-400" />
                Umpire Match Centre
              </span>
              <span className="text-xs text-slate-400">
                Welcome, <strong className="text-slate-200">{user?.user_metadata?.name || 'Official Umpire'}</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-display">
              Live Cricket Scorecard Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-2xl">
              Real-time ball-by-ball scoring, instant statistics recalculations, offline storage, and cloud synchronization.
            </p>
          </div>

          <button
            onClick={onOpenCreateMatch}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm flex items-center gap-2.5 shadow-xl shadow-emerald-950/60 transition-all transform hover:-translate-y-0.5 active:scale-95 shrink-0 border border-emerald-400/30"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Create New Match</span>
          </button>
        </div>

        {/* Quick Stat Counter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Matches</p>
            <p className="text-2xl font-black text-white font-digit mt-1">{matchList.length}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Live Matches</p>
            <p className="text-2xl font-black text-emerald-400 font-digit mt-1">
              {matchList.filter((m) => m.status === 'live' || m.status === 'innings_break').length}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Sync Engine</p>
            <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-slate-200">
              {isOnline ? (
                <>
                  <Wifi className="w-4 h-4 text-emerald-400" />
                  <span>Cloud Ready</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-300">Offline Active</span>
                </>
              )}
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Scorer In-Charge</p>
            <p className="text-xs font-bold text-slate-200 truncate mt-2">
              {user?.user_metadata?.name || 'Umpire'}
            </p>
          </div>
        </div>
      </div>

      {/* Active Match Spotlight Card (If match loaded) */}
      {match && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl bg-slate-900/90 border-2 border-emerald-500/40 shadow-xl relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  CURRENT ACTIVE MATCH
                </span>
                <span className="text-xs text-slate-400">• {match.format} ({match.totalOvers} Overs)</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white font-display">
                {match.teamA.name} vs {match.teamB.name}
              </h2>
              <p className="text-xs text-slate-300 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{match.venue}</span>
                <span>•</span>
                <span>Toss: {match.toss.winnerName} ({match.toss.decision})</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <button
                onClick={onNavigateToScoring}
                className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all active:scale-95"
              >
                <Activity className="w-4 h-4 text-emerald-200" />
                Resume Live Scoring
              </button>
              <button
                onClick={onNavigateToSummary}
                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700"
              >
                <FileText className="w-4 h-4" />
                Scorecard
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Match History & Matches List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-white font-display">
              Match History & Archive
            </h3>
            <p className="text-xs text-slate-400">
              Select any past or live match to resume scoring or export scorecard
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({matchList.length})
            </button>
            <button
              onClick={() => setFilter('live')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === 'live'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Live
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === 'completed'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {filteredMatches.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl bg-slate-900/50 border border-slate-800/80">
            <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-300 font-display">
              No matches found
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Start by creating your first live cricket match using the quick setup wizard above.
            </p>
            <button
              onClick={onOpenCreateMatch}
              className="mt-4 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-2 shadow-md shadow-emerald-950"
            >
              <PlusCircle className="w-4 h-4" />
              Create Match
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredMatches.map((m) => {
              const isMatchLive = m.status === 'live' || m.status === 'innings_break';
              return (
                <div
                  key={m.id}
                  onClick={() => handleSelectMatch(m.id)}
                  className="p-5 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800/90 hover:border-emerald-500/40 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(m.date).toLocaleDateString()}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isMatchLive
                            ? 'bg-red-950/80 text-red-400 border border-red-800/60 animate-pulse'
                            : m.status === 'completed'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                            : 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                        }`}
                      >
                        {m.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-white font-display group-hover:text-emerald-400 transition-colors">
                      {m.name || `${m.teamA} vs ${m.teamB}`}
                    </h4>

                    <div className="mt-2 text-xs text-slate-400 flex items-center gap-3">
                      <span>{m.format} ({m.overs} Overs)</span>
                      <span>•</span>
                      <span className="truncate">{m.venue}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleOpenScorecard(m.id, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-all"
                        title="View Full Scorecard"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMatchToDelete(m.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all"
                        title="Delete Match"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <span className="text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      {isMatchLive ? 'Resume Score' : 'Open Match'}
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmModal
        isOpen={Boolean(matchToDelete)}
        title="Delete Match Permanently?"
        message="Are you sure you want to delete this match? All ball-by-ball records and audit logs will be permanently erased."
        confirmText="Delete Match"
        confirmVariant="danger"
        onCancel={() => setMatchToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
