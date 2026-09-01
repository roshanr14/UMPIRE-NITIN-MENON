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
  Terminal,
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
      {/* Cyberpunk Top Banner & HUD Stat Badges */}
      <div className="relative overflow-hidden rounded-3xl cyber-card border-2 border-[#00f0ff]/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-[#00f0ff]/10 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/40 flex items-center gap-1 font-mono">
                <Terminal className="w-3 h-3 text-[#00f0ff]" />
                SYS_CORE // UMPIRE_COMMAND
              </span>
              <span className="text-xs text-slate-400 font-mono">
                OPERATOR: <strong className="text-[#fcee0a]">{user?.user_metadata?.name || 'Official Umpire'}</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white font-cyber">
              CRIC<span className="text-[#00f0ff] text-glow-cyan">//</span>UMPIRE <span className="text-[#fcee0a] text-glow-yellow">2077</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-2xl font-mono">
              High-frequency live delivery telemetry, instant run rate analytics, and fault-tolerant local cache.
            </p>
          </div>

          <button
            onClick={onOpenCreateMatch}
            className="px-6 py-3.5 rounded-2xl bg-[#fcee0a] hover:bg-[#fff033] text-black font-black font-cyber text-xs sm:text-sm flex items-center gap-2.5 shadow-xl shadow-[#fcee0a]/30 transition-all transform hover:-translate-y-0.5 active:scale-95 shrink-0 border border-[#fcee0a]"
          >
            <PlusCircle className="w-5 h-5 text-black" />
            <span>CREATE_NEW_MATCH</span>
          </button>
        </div>

        {/* Cyber Stat Counter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-[#00f0ff]/15 font-mono">
          <div className="p-3.5 rounded-2xl bg-[#050814] border border-[#00f0ff]/20">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">TOTAL_MATCHES</p>
            <p className="text-2xl font-black text-white font-digit mt-1 text-glow-cyan">{matchList.length}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#050814] border border-[#ff0055]/30">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">ACTIVE_COMBAT</p>
            <p className="text-2xl font-black text-[#ff0055] font-digit mt-1 text-glow-pink">
              {matchList.filter((m) => m.status === 'live' || m.status === 'innings_break').length}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#050814] border border-[#00f0ff]/20">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SYNC_MATRIX</p>
            <div className="flex items-center gap-1.5 mt-1 text-xs font-bold">
              {isOnline ? (
                <>
                  <Wifi className="w-4 h-4 text-[#39ff14]" />
                  <span className="text-[#39ff14]">ONLINE_READY</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-[#fcee0a]" />
                  <span className="text-[#fcee0a]">OFFLINE_ACTIVE</span>
                </>
              )}
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#050814] border border-[#00f0ff]/20">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SCORER_ID</p>
            <p className="text-xs font-bold text-slate-200 truncate mt-2 font-cyber">
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
          className="p-6 rounded-3xl cyber-card border-2 border-[#fcee0a]/40 shadow-xl relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#ff0055]/20 text-[#ff0055] border border-[#ff0055]/40 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-[#ff0055]" />
                  ACTIVE_FEED // LIVE
                </span>
                <span className="text-xs text-slate-400 font-mono">• {match.format} ({match.totalOvers} Overs)</span>
              </div>
              <h2 className="text-2xl font-black text-white font-cyber uppercase tracking-wider text-glow-cyan">
                {match.teamA.name} <span className="text-[#ff0055]">vs</span> {match.teamB.name}
              </h2>
              <p className="text-xs text-slate-300 font-mono flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#00f0ff]" />
                <span>{match.venue}</span>
                <span>•</span>
                <span>Toss: {match.toss.winnerName} ({match.toss.decision})</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto font-cyber text-xs">
              <button
                onClick={onNavigateToScoring}
                className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-[#fcee0a] hover:bg-[#fff033] text-black font-black flex items-center justify-center gap-2 shadow-lg shadow-[#fcee0a]/30 transition-all active:scale-95"
              >
                <Activity className="w-4 h-4 text-black" />
                <span>RESUME_SCORING</span>
              </button>
              <button
                onClick={onNavigateToSummary}
                className="px-4 py-3 rounded-xl bg-[#050814] hover:bg-[#00f0ff]/20 text-[#00f0ff] font-bold flex items-center justify-center gap-1.5 border border-[#00f0ff]/30"
              >
                <FileText className="w-4 h-4" />
                <span>SCORECARD</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Match History & Matches List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-white font-cyber">
              MATCH_ARCHIVE // LOGS
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Select recorded matches to resume scoring or download official PDF report
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-[#050814] p-1 rounded-xl border border-[#00f0ff]/20 font-mono text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filter === 'all'
                  ? 'bg-[#00f0ff] text-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ALL ({matchList.length})
            </button>
            <button
              onClick={() => setFilter('live')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filter === 'live'
                  ? 'bg-[#ff0055] text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              LIVE
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filter === 'completed'
                  ? 'bg-[#39ff14] text-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              FINISHED
            </button>
          </div>
        </div>

        {filteredMatches.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl cyber-card border border-[#00f0ff]/20 font-mono">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <p className="text-sm font-bold text-slate-300">// NO_MATCH_RECORDS_FOUND</p>
            <p className="text-xs text-slate-500 mt-1">Initiate a match using the button above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMatches.map((m) => (
              <div
                key={m.id}
                onClick={() => handleSelectMatch(m.id)}
                className="p-5 rounded-3xl cyber-card border border-[#00f0ff]/25 hover:border-[#00f0ff] transition-all cursor-pointer group space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#00f0ff]">
                    {m.format} • {m.totalOvers} OVERS
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded ${
                        m.status === 'live'
                          ? 'bg-[#ff0055]/20 text-[#ff0055] border border-[#ff0055]/40 animate-pulse'
                          : 'bg-[#39ff14]/20 text-[#39ff14] border border-[#39ff14]/40'
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
                      className="p-1 rounded text-slate-500 hover:text-[#ff0055] transition-colors"
                      title="Delete match"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-cyber font-black text-white text-base group-hover:text-[#00f0ff] transition-colors">
                      {m.teamA.name} <span className="text-[#ff0055]">vs</span> {m.teamB.name}
                    </h4>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">
                      {m.result || 'In Progress'}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#00f0ff]/10 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>{m.date}</span>
                  <button
                    type="button"
                    onClick={(e) => handleOpenScorecard(m.id, e)}
                    className="text-[#00f0ff] hover:text-[#fcee0a] font-bold flex items-center gap-1"
                  >
                    <span>VIEW_REPORT</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={Boolean(matchToDelete)}
        title="DELETE_MATCH_RECORD?"
        message="Are you sure you want to delete this match? All scorecard records will be erased."
        confirmText="ERASE"
        onConfirm={confirmDelete}
        onCancel={() => setMatchToDelete(null)}
      />
    </div>
  );
}
