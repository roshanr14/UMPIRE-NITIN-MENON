import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  X,
  Play,
  Users,
  Sparkles,
  Plus,
  Trash2,
  Crown,
  Shield,
  Check,
  RefreshCw,
  Star,
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

const DEFAULT_TEAM_A_PLAYERS = Array.from({ length: 11 }, (_, i) => ({
  name: '',
  role: i < 5 ? 'Batsman' : i < 8 ? 'All-Rounder' : 'Bowler',
  isCaptain: i === 0,
  isKeeper: i === 4,
}));

const DEFAULT_TEAM_B_PLAYERS = Array.from({ length: 11 }, (_, i) => ({
  name: '',
  role: i < 5 ? 'Batsman' : i < 8 ? 'All-Rounder' : 'Bowler',
  isCaptain: i === 0,
  isKeeper: i === 4,
}));

export default function CreateMatchModal({ isOpen, onClose, onCreateMatch }) {
  const [tab, setTab] = useState('custom'); // 'quick' | 'custom'
  const [activeRosterTeam, setActiveRosterTeam] = useState('A'); // 'A' | 'B'

  // Match Info
  const [format, setFormat] = useState('T20');
  const [overs, setOvers] = useState(20);
  const [venue, setVenue] = useState('National Cricket Stadium');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('14:30');

  // Team 1 Info & Playing XI
  const [teamAName, setTeamAName] = useState('');
  const [teamAShort, setTeamAShort] = useState('');
  const [teamAColor, setTeamAColor] = useState('#10b981');
  const [teamAPlayers, setTeamAPlayers] = useState(DEFAULT_TEAM_A_PLAYERS);

  // Team 2 Info & Playing XI
  const [teamBName, setTeamBName] = useState('');
  const [teamBShort, setTeamBShort] = useState('');
  const [teamBColor, setTeamBColor] = useState('#3b82f6');
  const [teamBPlayers, setTeamBPlayers] = useState(DEFAULT_TEAM_B_PLAYERS);

  // Toss
  const [tossWinner, setTossWinner] = useState('A'); // 'A' | 'B'
  const [tossDecision, setTossDecision] = useState('bat'); // 'bat' | 'bowl'

  if (!isOpen) return null;

  const currentPlayers = activeRosterTeam === 'A' ? teamAPlayers : teamBPlayers;
  const setPlayers = activeRosterTeam === 'A' ? setTeamAPlayers : setTeamBPlayers;

  // Handlers for individual player fields
  const handleUpdatePlayer = (index, field, value) => {
    setPlayers((prev) => {
      const updated = [...prev];
      if (field === 'isCaptain' && value === true) {
        // Only one captain at a time
        updated.forEach((p, i) => (p.isCaptain = i === index));
      } else if (field === 'isKeeper' && value === true) {
        // Only one primary keeper at a time
        updated.forEach((p, i) => (p.isKeeper = i === index));
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  const handleAddPlayer = () => {
    if (currentPlayers.length >= 15) return;
    setPlayers((prev) => [
      ...prev,
      {
        name: `Player ${prev.length + 1}`,
        role: prev.length < 5 ? 'Batsman' : prev.length < 8 ? 'All-Rounder' : 'Bowler',
        isCaptain: false,
        isKeeper: false,
      },
    ]);
  };

  const handleRemovePlayer = (index) => {
    if (currentPlayers.length <= 2) return;
    setPlayers((prev) => prev.filter((_, i) => i !== index));
  };

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
      players: teamAPlayers.map((p, idx) => ({
        id: `pA_${idx + 1}`,
        name: p.name.trim() || `Player ${idx + 1}`,
        role: p.role || 'Batsman',
        isCaptain: Boolean(p.isCaptain),
        isKeeper: Boolean(p.isKeeper),
      })),
    };

    const tB = {
      id: 'team_' + Math.random().toString(36).substring(2, 9),
      name: teamBName.trim() || 'Team B',
      shortName: teamBShort.trim() || 'TMB',
      color: teamBColor,
      players: teamBPlayers.map((p, idx) => ({
        id: `pB_${idx + 1}`,
        name: p.name.trim() || `Player ${idx + 1}`,
        role: p.role || 'Batsman',
        isCaptain: Boolean(p.isCaptain),
        isKeeper: Boolean(p.isKeeper),
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

  // Squad Stats breakdown
  const batCount = currentPlayers.filter((p) => p.role === 'Batsman').length;
  const arCount = currentPlayers.filter((p) => p.role === 'All-Rounder').length;
  const bowlCount = currentPlayers.filter((p) => p.role === 'Bowler').length;
  const hasCap = currentPlayers.some((p) => p.isCaptain);
  const hasWk = currentPlayers.some((p) => p.isKeeper);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-100 font-display">
                  Match Setup & Playing XI
                </h3>
                <p className="text-xs text-slate-400">
                  Configure match format, team rosters, captain & wicketkeeper
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
          <div className="flex items-center gap-2 mt-3 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
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
              Custom Match & Playing 11 Builder
            </button>
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
              1-Click Tournament Presets
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto mt-4 pr-1">
            {tab === 'quick' ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-400">
                  Select a pre-configured international or league setup to begin scoring immediately:
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
                          <p className="text-xs text-slate-400 mt-0.5">
                            {preset.format} • {preset.venue}
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
                          Customize XI
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
                {/* Match Format & Ground Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
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
                      <option value="T10">T10 Blitz</option>
                      <option value="ODI">One Day International (50 Overs)</option>
                      <option value="Club 15">Club Derby (15 Overs)</option>
                      <option value="Custom">Custom Overs</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
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
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
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

                {/* Team Names & Colors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                  {/* Team A Info */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Team 1 (Host Team)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={teamAColor}
                        onChange={(e) => setTeamAColor(e.target.value)}
                        className="w-9 h-9 rounded-xl bg-transparent cursor-pointer shrink-0 border border-slate-700"
                        title="Choose Team 1 Color"
                      />
                      <input
                        type="text"
                        value={teamAName}
                        onChange={(e) => setTeamAName(e.target.value)}
                        placeholder="Team 1 Name"
                        className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 font-bold outline-none"
                        required
                      />
                      <input
                        type="text"
                        maxLength="4"
                        value={teamAShort}
                        onChange={(e) => setTeamAShort(e.target.value.toUpperCase())}
                        placeholder="CODE"
                        className="w-16 px-2 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 font-bold outline-none uppercase text-center"
                        required
                      />
                    </div>
                  </div>

                  {/* Team B Info */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Team 2 (Visiting Team)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={teamBColor}
                        onChange={(e) => setTeamBColor(e.target.value)}
                        className="w-9 h-9 rounded-xl bg-transparent cursor-pointer shrink-0 border border-slate-700"
                        title="Choose Team 2 Color"
                      />
                      <input
                        type="text"
                        value={teamBName}
                        onChange={(e) => setTeamBName(e.target.value)}
                        placeholder="Team 2 Name"
                        className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 font-bold outline-none"
                        required
                      />
                      <input
                        type="text"
                        maxLength="4"
                        value={teamBShort}
                        onChange={(e) => setTeamBShort(e.target.value.toUpperCase())}
                        placeholder="CODE"
                        className="w-16 px-2 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 font-bold outline-none uppercase text-center"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Toss Picker */}
                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                            : 'bg-slate-900 text-slate-300 border-slate-800'
                        }`}
                      >
                        {teamAName || 'Team 1'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setTossWinner('B')}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          tossWinner === 'B'
                            ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                            : 'bg-slate-900 text-slate-300 border-slate-800'
                        }`}
                      >
                        {teamBName || 'Team 2'}
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
                            : 'bg-slate-900 text-slate-300 border-slate-800'
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
                            : 'bg-slate-900 text-slate-300 border-slate-800'
                        }`}
                      >
                        Elected to Bowl ⚾
                      </button>
                    </div>
                  </div>
                </div>

                {/* PLAYING 11 ROSTER BUILDER SECTION */}
                <div className="p-4 sm:p-5 rounded-3xl bg-slate-950/90 border border-slate-800 space-y-4">
                  {/* Roster Team Switcher Tab */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div>
                      <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-100 font-display flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-400" />
                        Playing 11 Squad Builder
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Set batting order, player roles, team captain (C), and wicketkeeper (WK)
                      </p>
                    </div>

                    {/* Team Switcher Buttons */}
                    <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setActiveRosterTeam('A')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                          activeRosterTeam === 'A'
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: teamAColor }}
                        />
                        <span>{teamAName || 'Team 1'} XI ({teamAPlayers.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveRosterTeam('B')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                          activeRosterTeam === 'B'
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: teamBColor }}
                        />
                        <span>{teamBName || 'Team 2'} XI ({teamBPlayers.length})</span>
                      </button>
                    </div>
                  </div>

                  {/* Squad Summary Pill */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 font-semibold">
                    <div className="flex items-center gap-3">
                      <span>🏏 {batCount} Batsmen</span>
                      <span>⚡ {arCount} All-Rounders</span>
                      <span>⚾ {bowlCount} Bowlers</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          hasCap
                            ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                            : 'bg-red-950 text-red-400 border border-red-800/60'
                        }`}
                      >
                        {hasCap ? '👑 Captain Set' : '⚠️ No Captain'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          hasWk
                            ? 'bg-sky-950 text-sky-300 border border-sky-800/60'
                            : 'bg-red-950 text-red-400 border border-red-800/60'
                        }`}
                      >
                        {hasWk ? '🧤 Keeper Set' : '⚠️ No Keeper'}
                      </span>
                    </div>
                  </div>

                  {/* Player Cards Grid */}
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {currentPlayers.map((player, idx) => {
                      const positionTag =
                        idx < 2 ? 'Opener' : idx < 4 ? 'Top Order' : idx < 7 ? 'Middle Order' : 'Lower Order';

                      return (
                        <div
                          key={idx}
                          className="p-2.5 sm:p-3 rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 transition-all group"
                        >
                          {/* Order Number & Tag */}
                          <div className="flex items-center gap-2.5 shrink-0">
                            <span className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center font-digit font-black text-xs text-emerald-400">
                              #{idx + 1}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hidden md:inline w-16">
                              {positionTag}
                            </span>
                          </div>

                          {/* Player Name Input */}
                          <div className="flex-1 min-w-[140px]">
                            <input
                              type="text"
                              value={player.name}
                              onChange={(e) => handleUpdatePlayer(idx, 'name', e.target.value)}
                              placeholder={`Enter player ${idx + 1} name...`}
                              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-xs font-semibold text-slate-100 outline-none transition-all placeholder:text-slate-500"
                            />
                          </div>

                          {/* Role Selector */}
                          <div className="w-28 shrink-0">
                            <select
                              value={player.role}
                              onChange={(e) => handleUpdatePlayer(idx, 'role', e.target.value)}
                              className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-[11px] font-bold text-slate-300 outline-none"
                            >
                              <option value="Batsman">🏏 Batsman</option>
                              <option value="All-Rounder">⚡ All-Rounder</option>
                              <option value="Bowler">⚾ Bowler</option>
                            </select>
                          </div>

                          {/* Captain (C) & Wicketkeeper (WK) Action Badges */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleUpdatePlayer(idx, 'isCaptain', !player.isCaptain)}
                              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold flex items-center gap-1 transition-all ${
                                player.isCaptain
                                  ? 'bg-amber-500 text-black shadow-md shadow-amber-950 scale-105 border border-amber-400'
                                  : 'bg-slate-950 text-slate-400 hover:text-amber-300 border border-slate-800'
                              }`}
                              title="Toggle Captain"
                            >
                              <Crown className="w-3.5 h-3.5" />
                              <span>(C)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleUpdatePlayer(idx, 'isKeeper', !player.isKeeper)}
                              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold flex items-center gap-1 transition-all ${
                                player.isKeeper
                                  ? 'bg-sky-500 text-black shadow-md shadow-sky-950 scale-105 border border-sky-400'
                                  : 'bg-slate-950 text-slate-400 hover:text-sky-300 border border-slate-800'
                              }`}
                              title="Toggle Wicketkeeper"
                            >
                              <Shield className="w-3.5 h-3.5" />
                              <span>(WK)</span>
                            </button>

                            {/* Delete Player from XI */}
                            {currentPlayers.length > 2 && (
                              <button
                                type="button"
                                onClick={() => handleRemovePlayer(idx)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                                title="Remove player"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Player button */}
                  {currentPlayers.length < 15 && (
                    <button
                      type="button"
                      onClick={handleAddPlayer}
                      className="w-full py-2.5 rounded-2xl border border-dashed border-slate-800 hover:border-emerald-500/60 bg-slate-950/50 hover:bg-slate-900 text-xs font-bold text-slate-400 hover:text-emerald-400 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Extra Player / Substitute (#{currentPlayers.length + 1})</span>
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="pt-3.5 border-t border-slate-800 shrink-0 flex items-center justify-between">
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
