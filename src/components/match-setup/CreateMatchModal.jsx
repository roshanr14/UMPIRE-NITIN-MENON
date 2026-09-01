import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  X,
  Shield,
  Play,
  Users,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Award,
  UserCheck,
} from 'lucide-react';
import { createDefaultTeam } from '../../lib/cricketEngine';

const PRESETS = [
  {
    title: 'International T20 Blitz',
    teamA: 'India',
    teamAShort: 'IND',
    teamAColor: '#0284c7',
    teamB: 'Australia',
    teamBShort: 'AUS',
    teamBColor: '#eab308',
    overs: 20,
    venue: 'Melbourne Cricket Ground',
    format: 'T20',
  },
  {
    title: 'Club Premier Derby',
    teamA: 'Royal Strikers',
    teamAShort: 'RST',
    teamAColor: '#ef4444',
    teamB: 'Coastal Titans',
    teamBShort: 'CTN',
    teamBColor: '#10b981',
    overs: 15,
    venue: 'County Oval Ground',
    format: 'Club 15-Over',
  },
  {
    title: 'Super 10 Powerplay League',
    teamA: 'Thunderbolts',
    teamAShort: 'THU',
    teamAColor: '#8b5cf6',
    teamB: 'Sunrisers',
    teamBShort: 'SUN',
    teamBColor: '#f97316',
    overs: 10,
    venue: 'National Sports Complex',
    format: 'T10 Blitz',
  },
];

export default function CreateMatchModal({ isOpen, onClose, onCreateMatch }) {
  const [tab, setTab] = useState('quick'); // 'quick' | 'custom'

  // Form State
  const [format, setFormat] = useState('T20');
  const [overs, setOvers] = useState(20);
  const [venue, setVenue] = useState('National Cricket Stadium');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('14:30');

  // Team 1
  const [teamAName, setTeamAName] = useState('Falcons CC');
  const [teamAShort, setTeamAShort] = useState('FAL');
  const [teamAColor, setTeamAColor] = useState('#10b981');
  const [teamAPlayers, setTeamAPlayers] = useState([
    'V. Sharma', 'R. Patel', 'S. Khan', 'A. Singh (wk)', 'K. Rahul (c)',
    'D. Miller', 'H. Pandya', 'R. Jadeja', 'J. Bumrah', 'M. Shami', 'Y. Chahal'
  ]);

  // Team 2
  const [teamBName, setTeamBName] = useState('Warriors XI');
  const [teamBShort, setTeamBShort] = useState('WAR');
  const [teamBColor, setTeamBColor] = useState('#3b82f6');
  const [teamBPlayers, setTeamBPlayers] = useState([
    'T. Head', 'D. Warner', 'M. Marsh (c)', 'G. Maxwell', 'M. Stoinis',
    'A. Carey (wk)', 'P. Cummins', 'M. Starc', 'N. Lyon', 'A. Zampa', 'J. Hazlewood'
  ]);

  // Toss
  const [tossWinner, setTossWinner] = useState('A'); // 'A' | 'B'
  const [tossDecision, setTossDecision] = useState('bat'); // 'bat' | 'bowl'

  if (!isOpen) return null;

  const handleApplyPreset = (preset) => {
    setTeamAName(preset.teamA);
    setTeamAShort(preset.teamAShort);
    setTeamAColor(preset.teamAColor);
    setTeamBName(preset.teamB);
    setTeamBShort(preset.teamBShort);
    setTeamBColor(preset.teamBColor);
    setOvers(preset.overs);
    setVenue(preset.venue);
    setFormat(preset.format);
  };

  const handleStartPresetDirect = (preset) => {
    const tA = createDefaultTeam(preset.teamA, preset.teamAShort, preset.teamAColor);
    const tB = createDefaultTeam(preset.teamB, preset.teamBShort, preset.teamBColor);

    onCreateMatch({
      teamA: tA,
      teamB: tB,
      format: preset.format,
      overs: preset.overs,
      venue: preset.venue,
      tossWinnerId: tA.id,
      tossDecision: 'bat',
      date,
      time,
    });
    onClose();
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const tA = {
      id: 'team_' + Math.random().toString(36).substring(2, 9),
      name: teamAName.trim() || 'Team A',
      shortName: teamAShort.trim() || 'TMA',
      color: teamAColor,
      players: teamAPlayers.map((pName, idx) => ({
        id: `pA_${idx + 1}`,
        name: pName.replace('(c)', '').replace('(wk)', '').trim(),
        role: idx < 5 ? 'Batsman' : idx < 7 ? 'All-Rounder' : 'Bowler',
        isCaptain: pName.includes('(c)'),
        isKeeper: pName.includes('(wk)'),
      })),
    };

    const tB = {
      id: 'team_' + Math.random().toString(36).substring(2, 9),
      name: teamBName.trim() || 'Team B',
      shortName: teamBShort.trim() || 'TMB',
      color: teamBColor,
      players: teamBPlayers.map((pName, idx) => ({
        id: `pB_${idx + 1}`,
        name: pName.replace('(c)', '').replace('(wk)', '').trim(),
        role: idx < 5 ? 'Batsman' : idx < 7 ? 'All-Rounder' : 'Bowler',
        isCaptain: pName.includes('(c)'),
        isKeeper: pName.includes('(wk)'),
      })),
    };

    onCreateMatch({
      teamA: tA,
      teamB: tB,
      format,
      overs: parseInt(overs, 10) || 20,
      venue,
      date,
      time,
      tossWinnerId: tossWinner === 'A' ? tA.id : tB.id,
      tossDecision,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-100 font-display">
                  Create New Cricket Match
                </h3>
                <p className="text-xs text-slate-400">
                  Configure teams, match format, overs, and toss details
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

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 mt-4 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => setTab('quick')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                tab === 'quick'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              1-Click Match Presets
            </button>
            <button
              type="button"
              onClick={() => setTab('custom')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                tab === 'custom'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Custom Match & Rosters
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto mt-4 pr-1">
            {tab === 'quick' ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-400">
                  Select a pre-configured tournament or derby setup to start live scoring right away:
                </p>

                <div className="grid grid-cols-1 gap-3">
                  {PRESETS.map((preset, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="flex -space-x-2 overflow-hidden">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs text-white border-2 border-slate-900 shadow-md"
                            style={{ backgroundColor: preset.teamAColor }}
                          >
                            {preset.teamAShort}
                          </div>
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs text-white border-2 border-slate-900 shadow-md"
                            style={{ backgroundColor: preset.teamBColor }}
                          >
                            {preset.teamBShort}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-100 text-sm font-display">
                              {preset.teamA} vs {preset.teamB}
                            </h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                              {preset.overs} Overs
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                            <span>{preset.format}</span>
                            <span>•</span>
                            <span>{preset.venue}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => {
                            handleApplyPreset(preset);
                            setTab('custom');
                          }}
                          className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                        >
                          Customize
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartPresetDirect(preset)}
                          className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950 transition-all active:scale-95"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          Start Match
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <form id="custom-match-form" onSubmit={handleFormSubmit} className="space-y-5">
                {/* Match Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Match Format
                    </label>
                    <select
                      value={format}
                      onChange={(e) => {
                        setFormat(e.target.value);
                        if (e.target.value === 'T20') setOvers(20);
                        if (e.target.value === 'ODI') setOvers(50);
                        if (e.target.value === 'T10') setOvers(10);
                        if (e.target.value === 'The Hundred') setOvers(16);
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-xs text-slate-100 outline-none"
                    >
                      <option value="T20">Twenty20 (T20)</option>
                      <option value="T10">T10 League</option>
                      <option value="ODI">One Day International (50 Overs)</option>
                      <option value="Club 15">Club Derby (15 Overs)</option>
                      <option value="Custom">Custom Overs</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Overs per Innings
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={overs}
                      onChange={(e) => setOvers(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-xs text-slate-100 outline-none font-digit font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Venue / Ground
                    </label>
                    <input
                      type="text"
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-xs text-slate-100 outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Team A & Team B Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Team A */}
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: teamAColor }}
                      />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                        Team 1 (Host)
                      </h4>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={teamAName}
                          onChange={(e) => setTeamAName(e.target.value)}
                          placeholder="Team Name"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-100 outline-none"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          maxLength="4"
                          value={teamAShort}
                          onChange={(e) => setTeamAShort(e.target.value.toUpperCase())}
                          placeholder="CODE"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-100 outline-none uppercase font-bold text-center"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Team 1 Playing XI (Comma Separated)
                      </label>
                      <textarea
                        rows="3"
                        value={teamAPlayers.join(', ')}
                        onChange={(e) =>
                          setTeamAPlayers(
                            e.target.value
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean)
                          )
                        }
                        className="w-full p-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 outline-none leading-relaxed"
                      />
                      <span className="text-[10px] text-slate-500 block">
                        Tip: Add (c) for captain, (wk) for wicketkeeper
                      </span>
                    </div>
                  </div>

                  {/* Team B */}
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: teamBColor }}
                      />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                        Team 2 (Visitors)
                      </h4>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={teamBName}
                          onChange={(e) => setTeamBName(e.target.value)}
                          placeholder="Team Name"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-100 outline-none"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          maxLength="4"
                          value={teamBShort}
                          onChange={(e) => setTeamBShort(e.target.value.toUpperCase())}
                          placeholder="CODE"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-100 outline-none uppercase font-bold text-center"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Team 2 Playing XI (Comma Separated)
                      </label>
                      <textarea
                        rows="3"
                        value={teamBPlayers.join(', ')}
                        onChange={(e) =>
                          setTeamBPlayers(
                            e.target.value
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean)
                          )
                        }
                        className="w-full p-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 outline-none leading-relaxed"
                      />
                      <span className="text-[10px] text-slate-500 block">
                        Tip: Add (c) for captain, (wk) for wicketkeeper
                      </span>
                    </div>
                  </div>
                </div>

                {/* Toss Section */}
                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1.5">
                      Toss Winner
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setTossWinner('A')}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          tossWinner === 'A'
                            ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        {teamAName || 'Team A'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setTossWinner('B')}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          tossWinner === 'B'
                            ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        {teamBName || 'Team B'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1.5">
                      Toss Decision
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setTossDecision('bat')}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          tossDecision === 'bat'
                            ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        Elected to Bat 🏏
                      </button>
                      <button
                        type="button"
                        onClick={() => setTossDecision('bowl')}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          tossDecision === 'bowl'
                            ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        Elected to Bowl ⚾
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-800 shrink-0 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>

            {tab === 'custom' && (
              <button
                type="submit"
                form="custom-match-form"
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950 transition-all active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                Start Match Live
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
