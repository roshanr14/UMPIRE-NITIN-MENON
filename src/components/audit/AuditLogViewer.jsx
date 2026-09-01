import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Edit3,
  Flame,
  Plus,
  Shield,
  Download,
  Copy,
  Check,
} from 'lucide-react';
import { useMatch } from '../../context/MatchContext';

export default function AuditLogViewer() {
  const { match, auditLogs } = useMatch();
  const [filterType, setFilterType] = useState('all'); // 'all' | 'score' | 'wicket' | 'extra' | 'undo' | 'edit' | 'system'
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const filteredLogs = auditLogs.filter((log) => {
    if (filterType !== 'all' && log.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.user.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopyLogs = () => {
    const text = filteredLogs
      .map((l) => `${l.timeStr} – ${l.user}: ${l.action} ${l.details ? `(${l.details})` : ''}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `match_audit_${match?.id || 'logs'}.json`);
    dlAnchor.click();
  };

  const getLogBadge = (type) => {
    switch (type) {
      case 'wicket':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-950/80 text-red-400 border border-red-800/60">
            Wicket
          </span>
        );
      case 'extra':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-950/80 text-amber-400 border border-amber-800/60">
            Extra
          </span>
        );
      case 'undo':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-purple-950/80 text-purple-400 border border-purple-800/60">
            Undo
          </span>
        );
      case 'edit':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
            Correction
          </span>
        );
      case 'system':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
            System
          </span>
        );
      case 'score':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
            Score
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800">
              Audit Transparency
            </span>
            <span className="text-xs text-slate-400">Match Log Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display mt-1">
            Official Scoring Audit Trail
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable chronological record of all runs, wickets, extras, undos, corrections, and sync events.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLogs}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Trail'}</span>
          </button>
          <button
            onClick={handleDownloadJSON}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        {/* Search box */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by action, batter, bowler, or scorer name..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-xs text-slate-100 outline-none placeholder:text-slate-600"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Logs' },
            { id: 'score', label: 'Runs' },
            { id: 'wicket', label: 'Wickets' },
            { id: 'extra', label: 'Extras' },
            { id: 'undo', label: 'Undos' },
            { id: 'edit', label: 'Edits' },
            { id: 'system', label: 'System' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                filterType === tab.id
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Entries List */}
      <div className="p-5 sm:p-7 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs italic">
            No audit logs match your search or filter.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-slate-800/30 px-3 rounded-xl transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <span className="font-mono text-xs font-bold text-slate-400 shrink-0 mt-0.5 sm:mt-0">
                    {log.timeStr}
                  </span>

                  <div className="shrink-0">{getLogBadge(log.type)}</div>

                  <div>
                    <p className="text-sm font-bold text-slate-100">
                      <strong className="text-emerald-400 font-semibold">{log.user}:</strong>{' '}
                      {log.action}
                    </p>
                    {log.details && (
                      <p className="text-xs text-slate-400 mt-0.5 font-mono">
                        {log.details}
                      </p>
                    )}
                  </div>
                </div>

                <span className="text-[10px] text-slate-500 font-mono self-end sm:self-center">
                  ID: {log.id.slice(-6)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
