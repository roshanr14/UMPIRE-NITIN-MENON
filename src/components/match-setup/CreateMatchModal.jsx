import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  X,
  Play,
  Users,
  Plus,
  Trash2,
  Crown,
  Shield,
  Sparkles,
} from 'lucide-react';

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
        updated.forEach((p, i) => (p.isCaptain = i === index));
      } else if (field === 'isKeeper' && value === true) {
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
        name: '',
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

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const tA = {
      id: 'team_' + Math.random().toString(36).substring(2, 9),
      name: teamAName.trim() || 'Team 1',
      shortName: teamAShort.trim() || 'TM1',
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
      name: teamBName.trim() || 'Team 2',
      shortName: teamBShort.trim() || 'TM2',
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
      venue: venue.trim() || 'Cricket Stadium',
      date,
      time,
      tossWinnerId: tossWinner === 'A' ? tA.id : tB.id,
      tossDecision,
    });
    onClose();
  };

  // Squad Summary Stats
  const batCount = currentPlayers.filter((p) => p.role === 'Batsman').length;
  const arCount = currentPlayers.filter((p) => p.role === 'All-Rounder').length;
  const bowlCount = currentPlayers.filter((p) => p.role === 'Bowler').length;
  const hasCap = currentPlayers.some((p) => p.isCaptain);
  const hasWk = currentPlayers.some((p) => p.isKeeper);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="w-full max-w-4xl max-h-[92vh] glass-panel-elevated border border-white/[0.18] rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col relative overflow-hidden font-sans"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08] shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-display">
                  Create New Match & Playing 11
                </h3>
                <p className="text-xs text-slate-300">
                  Enter match details, custom team names, and squad roster
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

          {/* Form Body */}
          <div className="flex-1 overflow-y-auto mt-4 pr-1">
            <form id="custom-match-form" onSubmit={handleFormSubmit} className="space-y-5">
              {/* Match Format & Ground Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
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
                    className="w-full px-3 py-2 bg-slate-900/90 border border-white/[0.12] focus:border-cyan-400 rounded-xl text-xs text-slate-100 outline-none backdrop-blur-md"
                  >
                    <option value="T20" className="bg-slate-900 text-white">Twenty20 (T20)</option>
                    <option value="T10" className="bg-slate-900 text-white">T10 Blitz</option>
                    <option value="ODI" className="bg-slate-900 text-white">One Day International (50 Overs)</option>
                    <option value="Club 15" className="bg-slate-900 text-white">Club Derby (15 Overs)</option>
                    <option value="Custom" className="bg-slate-900 text-white">Custom Overs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Overs per Innings
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={overs}
                    onChange={(e) => setOvers(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900/90 border border-white/[0.12] focus:border-cyan-400 rounded-xl text-xs text-slate-100 outline-none font-digit font-bold backdrop-blur-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Venue / Ground
                  </label>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="e.g. City Sports Ground"
                    className="w-full px-3 py-2 bg-slate-900/90 border border-white/[0.12] focus:border-cyan-400 rounded-xl text-xs text-slate-100 outline-none backdrop-blur-md"
                    required
                  />
                </div>
              </div>

              {/* Team Names & Colors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl">
                {/* Team A Info */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Team 1 (Host Team)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={teamAColor}
                      onChange={(e) => setTeamAColor(e.target.value)}
                      className="w-9 h-9 rounded-xl bg-transparent cursor-pointer shrink-0 border border-white/20"
                      title="Choose Team 1 Color"
                    />
                    <input
                      type="text"
                      value={teamAName}
                      onChange={(e) => setTeamAName(e.target.value)}
                      placeholder="Enter Team 1 Name"
                      className="flex-1 px-3 py-2 bg-slate-900/90 border border-white/[0.12] focus:border-cyan-400 rounded-xl text-xs text-slate-100 font-bold outline-none backdrop-blur-md"
                      required
                    />
                    <input
                      type="text"
                      maxLength="4"
                      value={teamAShort}
                      onChange={(e) => setTeamAShort(e.target.value.toUpperCase())}
                      placeholder="CODE"
                      className="w-16 px-2 py-2 bg-slate-900/90 border border-white/[0.12] focus:border-cyan-400 rounded-xl text-xs text-slate-100 font-bold outline-none uppercase text-center backdrop-blur-md"
                    />
                  </div>
                </div>

                {/* Team B Info */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Team 2 (Visiting Team)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={teamBColor}
                      onChange={(e) => setTeamBColor(e.target.value)}
                      className="w-9 h-9 rounded-xl bg-transparent cursor-pointer shrink-0 border border-white/20"
                      title="Choose Team 2 Color"
                    />
                    <input
                      type="text"
                      value={teamBName}
                      onChange={(e) => setTeamBName(e.target.value)}
                      placeholder="Enter Team 2 Name"
                      className="flex-1 px-3 py-2 bg-slate-900/90 border border-white/[0.12] focus:border-cyan-400 rounded-xl text-xs text-slate-100 font-bold outline-none backdrop-blur-md"
                      required
                    />
                    <input
                      type="text"
                      maxLength="4"
                      value={teamBShort}
                      onChange={(e) => setTeamBShort(e.target.value.toUpperCase())}
                      placeholder="CODE"
                      className="w-16 px-2 py-2 bg-slate-900/90 border border-white/[0.12] focus:border-cyan-400 rounded-xl text-xs text-slate-100 font-bold outline-none uppercase text-center backdrop-blur-md"
                    />
                  </div>
                </div>
              </div>

              {/* Toss Picker */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-white/[0.02] to-transparent border border-cyan-400/30 backdrop-blur-xl grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-1.5">
                    Toss Winner
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTossWinner('A')}
                      className={`liquid-btn py-2.5 rounded-xl text-xs font-bold transition-all ${
                        tossWinner === 'A'
                          ? 'liquid-btn-primary'
                          : 'liquid-btn-secondary'
                      }`}
                    >
                      {teamAName || 'Team 1'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTossWinner('B')}
                      className={`liquid-btn py-2.5 rounded-xl text-xs font-bold transition-all ${
                        tossWinner === 'B'
                          ? 'liquid-btn-primary'
                          : 'liquid-btn-secondary'
                      }`}
                    >
                      {teamBName || 'Team 2'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-1.5">
                    Toss Decision
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTossDecision('bat')}
                      className={`liquid-btn py-2.5 rounded-xl text-xs font-bold transition-all ${
                        tossDecision === 'bat'
                          ? 'liquid-btn-amber'
                          : 'liquid-btn-secondary'
                      }`}
                    >
                      Elected to Bat 🏏
                    </button>
                    <button
                      type="button"
                      onClick={() => setTossDecision('bowl')}
                      className={`liquid-btn py-2.5 rounded-xl text-xs font-bold transition-all ${
                        tossDecision === 'bowl'
                          ? 'liquid-btn-primary'
                          : 'liquid-btn-secondary'
                      }`}
                    >
                      Elected to Bowl ⚾
                    </button>
                  </div>
                </div>
              </div>

              {/* PLAYING 11 ROSTER BUILDER */}
              <div className="p-4 sm:p-5 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl space-y-4">
                {/* Roster Team Switcher Tab */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-white font-display flex items-center gap-2">
                      <Users className="w-4 h-4 text-cyan-400" />
                      Playing 11 Squad Entry
                    </h4>
                    <p className="text-[11px] text-slate-300">
                      Set batting order, player roles, team captain (C), and wicketkeeper (WK)
                    </p>
                  </div>

                  {/* Team Switcher Buttons */}
                  <div className="flex items-center gap-1.5 bg-white/[0.04] p-1.5 rounded-2xl border border-white/[0.08]">
                    <button
                      type="button"
                      onClick={() => setActiveRosterTeam('A')}
                      className={`liquid-btn px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                        activeRosterTeam === 'A'
                          ? 'liquid-btn-primary font-bold'
                          : 'liquid-btn-secondary'
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
                      className={`liquid-btn px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                        activeRosterTeam === 'B'
                          ? 'liquid-btn-primary font-bold'
                          : 'liquid-btn-secondary'
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
                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs text-slate-300 font-medium">
                  <div className="flex items-center gap-3">
                    <span>🏏 {batCount} Batsmen</span>
                    <span>⚡ {arCount} All-Rounders</span>
                    <span>⚾ {bowlCount} Bowlers</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        hasCap
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {hasCap ? '👑 Captain Set' : '⚠️ No Captain'}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        hasWk
                          ? 'bg-sky-400/20 text-sky-300 border border-sky-400/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
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
                        className="p-2.5 sm:p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-cyan-400/30 hover:bg-white/[0.06] flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 transition-all group"
                      >
                        {/* Order Number & Tag */}
                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className="w-7 h-7 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center font-digit font-bold text-xs text-cyan-300">
                            #{idx + 1}
                          </span>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 hidden md:inline w-16">
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
                            className="w-full px-3 py-1.5 bg-slate-900/90 border border-white/[0.12] focus:border-cyan-400 rounded-xl text-xs font-semibold text-slate-100 outline-none transition-all placeholder:text-slate-500"
                          />
                        </div>

                        {/* Role Selector */}
                        <div className="w-28 shrink-0">
                          <select
                            value={player.role}
                            onChange={(e) => handleUpdatePlayer(idx, 'role', e.target.value)}
                            className="w-full px-2 py-1.5 bg-slate-900/90 border border-white/[0.12] focus:border-cyan-400 rounded-xl text-[11px] font-semibold text-slate-200 outline-none"
                          >
                            <option value="Batsman" className="bg-slate-900 text-white">🏏 Batsman</option>
                            <option value="All-Rounder" className="bg-slate-900 text-white">⚡ All-Rounder</option>
                            <option value="Bowler" className="bg-slate-900 text-white">⚾ Bowler</option>
                          </select>
                        </div>

                        {/* Captain (C) & Wicketkeeper (WK) Action Badges */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleUpdatePlayer(idx, 'isCaptain', !player.isCaptain)}
                            className={`liquid-btn px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 ${
                              player.isCaptain
                                ? 'liquid-btn-amber font-extrabold shadow-md scale-105'
                                : 'liquid-btn-secondary'
                            }`}
                            title="Toggle Captain"
                          >
                            <Crown className="w-3.5 h-3.5" />
                            <span>(C)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleUpdatePlayer(idx, 'isKeeper', !player.isKeeper)}
                            className={`liquid-btn px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 ${
                              player.isKeeper
                                ? 'liquid-btn-primary font-extrabold shadow-md scale-105'
                                : 'liquid-btn-secondary'
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
                              className="liquid-btn-icon w-7 h-7 rounded-xl text-slate-400 hover:text-rose-400"
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
                    className="liquid-btn liquid-btn-secondary w-full py-2.5 rounded-2xl border-dashed border-white/20 hover:border-cyan-400/60 text-xs font-semibold text-slate-300 hover:text-cyan-300 flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Extra Player / Substitute (#{currentPlayers.length + 1})</span>
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="pt-3.5 border-t border-white/[0.08] shrink-0 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="liquid-btn liquid-btn-secondary px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="custom-match-form"
              className="liquid-btn liquid-btn-primary px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              Start Match Live
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
