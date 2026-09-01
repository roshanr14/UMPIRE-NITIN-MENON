import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { storage } from '../lib/storage';
import { supabaseManager } from '../lib/supabase';
import { soundFx } from '../lib/audio';
import {
  formatOvers,
  generateBallId,
  createDefaultTeam,
  initializeInningsState,
} from '../lib/cricketEngine';
import { useAuth } from './AuthContext';

const MatchContext = createContext(null);

export function MatchProvider({ children }) {
  const { user } = useAuth();

  // Active Match State
  const [match, setMatch] = useState(null);
  const [matchList, setMatchList] = useState(() => storage.getMatchListIndex());
  const [undoStack, setUndoStack] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Network & Sync State
  const [isOnline, setIsOnline] = useState(storage.isOnline);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'synced' | 'offline_saved'
  const [syncMessage, setSyncMessage] = useState('All Scores Successfully Synced');

  // UI Modals & Alerts
  const [pendingOverChange, setPendingOverChange] = useState(false);
  const [pendingInningsBreak, setPendingInningsBreak] = useState(false);
  const [pendingMatchCompletion, setPendingMatchCompletion] = useState(false);

  // Settings State
  const [settings, setSettings] = useState(() => storage.getSettings());

  // Listen to network status & sync
  useEffect(() => {
    const unsubNet = storage.subscribeNetwork((online) => {
      setIsOnline(online);
      if (online) {
        setSyncStatus('synced');
        setSyncMessage('All Scores Successfully Synced');
      } else {
        setSyncStatus('offline_saved');
        setSyncMessage('Offline – Scores Saved Locally');
      }
    });

    return () => unsubNet();
  }, []);

  // Save settings when changed
  const updateSettings = useCallback((newSettings) => {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    storage.saveSettings(merged);
    soundFx.enabled = merged.soundEnabled;
    soundFx.hapticsEnabled = merged.hapticsEnabled;
    if (merged.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [settings]);

  // Apply initial theme/contrast
  useEffect(() => {
    if (settings.highContrast) {
      document.body.classList.add('high-contrast');
    }
    soundFx.enabled = settings.soundEnabled;
    soundFx.hapticsEnabled = settings.hapticsEnabled;
  }, [settings.highContrast, settings.soundEnabled, settings.hapticsEnabled]);

  // Push match state & audit log to persistent local storage and Supabase
  const persistMatchState = useCallback(async (updatedMatch, logAction = null, logDetails = '', logType = 'score') => {
    setMatch(updatedMatch);
    await storage.saveMatch(updatedMatch);
    setMatchList(storage.getMatchListIndex());

    const scorerName = user?.user_metadata?.name || settings.scorerName || 'Umpire';
    if (logAction) {
      const entry = storage.saveAuditLog(updatedMatch.id, {
        user: scorerName,
        action: logAction,
        details: logDetails,
        type: logType,
      });
      if (entry) {
        setAuditLogs((prev) => [entry, ...prev]);
        supabaseManager.syncAuditLog(entry);
      }
    }

    // Auto-sync
    if (navigator.onLine) {
      setSyncStatus('syncing');
      setSyncMessage('Syncing Match Data...');
      const syncRes = await supabaseManager.syncMatch(updatedMatch);
      if (syncRes.success) {
        setSyncStatus('synced');
        setSyncMessage('All Scores Successfully Synced');
      }
    } else {
      setSyncStatus('offline_saved');
      setSyncMessage('Offline – Scores Saved Locally');
    }
  }, [user, settings.scorerName]);

  // Check Innings & Match Completion helper
  const checkInningsAndMatchProgression = useCallback((m, inn) => {
    const isAllOut = inn.wickets >= 10;
    const isOversFinished = inn.validBalls >= m.totalBalls;

    if (m.currentInningsNumber === 1) {
      if (isAllOut || isOversFinished) {
        inn.isCompleted = true;
        const target = inn.totalRuns + 1;
        // Start 2nd innings
        const batting2ndTeam = inn.battingTeamId === m.teamA.id ? m.teamB : m.teamA;
        const bowling2ndTeam = inn.battingTeamId === m.teamA.id ? m.teamA : m.teamB;

        m.currentInningsNumber = 2;
        m.status = 'innings_break';
        m.innings2 = initializeInningsState(batting2ndTeam, bowling2ndTeam, target);
        setPendingInningsBreak(true);
      }
    } else if (m.currentInningsNumber === 2) {
      const target = inn.target;
      const chasingTeam = inn.battingTeamName;
      const defendingTeam = inn.bowlingTeamName;

      // Target Reached (Chasing team won)
      if (inn.totalRuns >= target) {
        inn.isCompleted = true;
        m.status = 'completed';
        const wicketsRemaining = 10 - inn.wickets;
        const ballsRemaining = m.totalBalls - inn.validBalls;
        m.result = `${chasingTeam} won by ${wicketsRemaining} wicket${wicketsRemaining > 1 ? 's' : ''} (${ballsRemaining} ball${ballsRemaining !== 1 ? 's' : ''} remaining)`;
        setPendingMatchCompletion(true);
        try { confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } }); } catch {}
      }
      // All Out or Overs Complete
      else if (isAllOut || isOversFinished) {
        inn.isCompleted = true;
        m.status = 'completed';
        if (inn.totalRuns < target - 1) {
          const runMargin = target - 1 - inn.totalRuns;
          m.result = `${defendingTeam} won by ${runMargin} run${runMargin > 1 ? 's' : ''}`;
        } else if (inn.totalRuns === target - 1) {
          m.result = `Match Tied! Scores level at ${inn.totalRuns}`;
        }
        setPendingMatchCompletion(true);
        try { confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }); } catch {}
      }
    }
  }, []);

  // Load an existing match
  const loadMatch = useCallback((matchId) => {
    const loaded = storage.getMatch(matchId);
    if (loaded) {
      setMatch(loaded);
      setUndoStack([]);
      setAuditLogs(storage.getAuditLogs(matchId));
      return true;
    }
    return false;
  }, []);

  // Delete a match
  const deleteMatch = useCallback((matchId) => {
    storage.deleteMatch(matchId);
    setMatchList(storage.getMatchListIndex());
    if (match?.id === matchId) {
      setMatch(null);
      setUndoStack([]);
      setAuditLogs([]);
    }
  }, [match]);

  // Create & Start a New Match
  const createMatch = useCallback(async (setupData) => {
    const teamA = setupData.teamA || createDefaultTeam('Team Red', 'RED', '#ef4444');
    const teamB = setupData.teamB || createDefaultTeam('Team Blue', 'BLU', '#3b82f6');

    const tossWinnerId = setupData.tossWinnerId || teamA.id;
    const tossDecision = setupData.tossDecision || 'bat'; // 'bat' | 'bowl'

    let battingFirstTeam = teamA;
    let bowlingFirstTeam = teamB;

    if (tossWinnerId === teamA.id) {
      if (tossDecision === 'bowl') {
        battingFirstTeam = teamB;
        bowlingFirstTeam = teamA;
      }
    } else {
      if (tossDecision === 'bat') {
        battingFirstTeam = teamB;
        bowlingFirstTeam = teamA;
      }
    }

    const totalOvers = parseInt(setupData.overs, 10) || 20;

    const newMatch = {
      id: 'match_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: `${teamA.name} vs ${teamB.name}`,
      format: setupData.format || 'T20',
      totalOvers: totalOvers,
      totalBalls: totalOvers * 6,
      venue: setupData.venue || 'City Sports Arena',
      date: setupData.date || new Date().toISOString().split('T')[0],
      time: setupData.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'live', // 'upcoming' | 'live' | 'innings_break' | 'completed' | 'paused'
      teamA: teamA,
      teamB: teamB,
      toss: {
        winnerId: tossWinnerId,
        winnerName: tossWinnerId === teamA.id ? teamA.name : teamB.name,
        decision: tossDecision,
      },
      currentInningsNumber: 1,
      innings1: initializeInningsState(battingFirstTeam, bowlingFirstTeam, null),
      innings2: null,
      result: null,
      createdAt: new Date().toISOString(),
    };

    setUndoStack([]);
    await persistMatchState(
      newMatch,
      `Match Created & Started: ${teamA.name} vs ${teamB.name}`,
      `Toss won by ${newMatch.toss.winnerName} who elected to ${tossDecision}`,
      'system'
    );
    return newMatch;
  }, [persistMatchState]);

  // Current Active Innings getter
  const currentInnings = match?.currentInningsNumber === 2 ? match?.innings2 : match?.innings1;

  // Record Run (0, 1, 2, 3, 4, 6)
  const recordRun = useCallback((runs) => {
    if (!match || match.status !== 'live' || !currentInnings) return;

    // Snapshot for Undo
    setUndoStack((prev) => [...prev, JSON.parse(JSON.stringify(match))]);

    // Audio / Haptic feedback
    if (runs === 4) soundFx.playBoundary();
    else if (runs === 6) soundFx.playSix();
    else soundFx.playTap();

    const m = JSON.parse(JSON.stringify(match));
    const inn = m.currentInningsNumber === 2 ? m.innings2 : m.innings1;

    const striker = inn.batsmen.find((b) => b.id === inn.currentStrikerId);
    const nonStriker = inn.batsmen.find((b) => b.id === inn.currentNonStrikerId);
    const bowler = inn.bowlers.find((b) => b.id === inn.currentBowlerId);

    // Update Team score & valid balls
    inn.totalRuns += runs;
    inn.validBalls += 1;

    // Update Batsman
    if (striker) {
      striker.runs += runs;
      striker.balls += 1;
      if (runs === 4) striker.fours += 1;
      if (runs === 6) striker.sixes += 1;
    }

    // Update Bowler
    if (bowler) {
      bowler.balls += 1;
      bowler.runsConceded += runs;
      if (runs === 0) bowler.dots += 1;
    }

    // Update Partnership
    inn.currentPartnership.runs += runs;
    inn.currentPartnership.balls += 1;

    // Create Ball Event
    const ballEvent = {
      id: generateBallId(),
      inningsNumber: m.currentInningsNumber,
      ballNumber: inn.validBalls,
      overNumber: Math.floor((inn.validBalls - 1) / 6) + 1,
      ballInOver: ((inn.validBalls - 1) % 6) + 1,
      runsScored: runs,
      extraRuns: 0,
      extraType: null,
      isLegalDelivery: true,
      isWicket: false,
      strikerId: striker?.id,
      strikerName: striker?.name,
      nonStrikerId: nonStriker?.id,
      bowlerId: bowler?.id,
      bowlerName: bowler?.name,
      timestamp: Date.now(),
      scoreAfter: `${inn.totalRuns}/${inn.wickets}`,
      oversAfter: formatOvers(inn.validBalls),
    };

    inn.currentOverBalls.push(ballEvent);
    inn.allBalls.push(ballEvent);

    // Strike Rotation for odd runs (1, 3, 5)
    if (runs % 2 !== 0) {
      const temp = inn.currentStrikerId;
      inn.currentStrikerId = inn.currentNonStrikerId;
      inn.currentNonStrikerId = temp;
    }

    // Check Over Complete (6 valid balls)
    const isOverComplete = inn.validBalls % 6 === 0;
    if (isOverComplete) {
      // Rotate strike at end of over
      const temp = inn.currentStrikerId;
      inn.currentStrikerId = inn.currentNonStrikerId;
      inn.currentNonStrikerId = temp;

      // Check maiden over for bowler
      const overBalls = inn.currentOverBalls;
      const runsInThisOver = overBalls.reduce((acc, b) => acc + (b.runsScored || 0) + (b.extraType === 'wide' || b.extraType === 'no_ball' ? b.extraRuns : 0), 0);
      if (runsInThisOver === 0 && overBalls.length >= 6) {
        if (bowler) bowler.maidens += 1;
      }

      inn.lastBowlerId = inn.currentBowlerId;
      inn.currentOverBalls = [];
      setPendingOverChange(true);
    }

    // Check Match / Innings Complete
    checkInningsAndMatchProgression(m, inn);

    const logText = runs === 0 ? 'Dot Ball (0)' : `${runs} run${runs > 1 ? 's' : ''}`;
    persistMatchState(
      m,
      `${striker?.name || 'Batter'} scored ${logText}`,
      `Bowler: ${bowler?.name || 'Bowler'} | Score: ${inn.totalRuns}/${inn.wickets} (${formatOvers(inn.validBalls)} ov)`
    );
  }, [match, currentInnings, persistMatchState, checkInningsAndMatchProgression]);

  // Record Extras (Wide, No Ball, Bye, Leg Bye, Penalty)
  const recordExtra = useCallback((extraType, runs = 1, runsOffBat = 0) => {
    if (!match || match.status !== 'live' || !currentInnings) return;

    setUndoStack((prev) => [...prev, JSON.parse(JSON.stringify(match))]);
    soundFx.playTap();

    const m = JSON.parse(JSON.stringify(match));
    const inn = m.currentInningsNumber === 2 ? m.innings2 : m.innings1;

    const striker = inn.batsmen.find((b) => b.id === inn.currentStrikerId);
    const nonStriker = inn.batsmen.find((b) => b.id === inn.currentNonStrikerId);
    const bowler = inn.bowlers.find((b) => b.id === inn.currentBowlerId);

    let isLegal = true;

    if (extraType === 'wide') {
      isLegal = false;
      inn.totalRuns += runs;
      inn.extras.wides += runs;
      inn.extras.total += runs;
      if (bowler) {
        bowler.wides += 1;
        bowler.runsConceded += runs;
      }
      inn.currentPartnership.runs += runs;
      // Strikers do not rotate on standard wide unless running runs was odd
      if (runs > 1 && (runs - 1) % 2 !== 0) {
        const temp = inn.currentStrikerId;
        inn.currentStrikerId = inn.currentNonStrikerId;
        inn.currentNonStrikerId = temp;
      }
    } else if (extraType === 'no_ball') {
      isLegal = false;
      const totalNBRuns = runs + runsOffBat;
      inn.totalRuns += totalNBRuns;
      inn.extras.noBalls += runs;
      inn.extras.total += runs;
      if (striker && runsOffBat > 0) {
        striker.runs += runsOffBat;
        striker.balls += 1;
        if (runsOffBat === 4) striker.fours += 1;
        if (runsOffBat === 6) striker.sixes += 1;
      }
      if (bowler) {
        bowler.noBalls += 1;
        bowler.runsConceded += totalNBRuns;
      }
      inn.currentPartnership.runs += totalNBRuns;
      if (runsOffBat % 2 !== 0) {
        const temp = inn.currentStrikerId;
        inn.currentStrikerId = inn.currentNonStrikerId;
        inn.currentNonStrikerId = temp;
      }
    } else if (extraType === 'bye') {
      isLegal = true;
      inn.totalRuns += runs;
      inn.validBalls += 1;
      inn.extras.byes += runs;
      inn.extras.total += runs;
      if (striker) striker.balls += 1;
      if (bowler) bowler.balls += 1; // Byes do not charge bowler runsConceded
      inn.currentPartnership.runs += runs;
      inn.currentPartnership.balls += 1;
      if (runs % 2 !== 0) {
        const temp = inn.currentStrikerId;
        inn.currentStrikerId = inn.currentNonStrikerId;
        inn.currentNonStrikerId = temp;
      }
    } else if (extraType === 'leg_bye') {
      isLegal = true;
      inn.totalRuns += runs;
      inn.validBalls += 1;
      inn.extras.legByes += runs;
      inn.extras.total += runs;
      if (striker) striker.balls += 1;
      if (bowler) bowler.balls += 1;
      inn.currentPartnership.runs += runs;
      inn.currentPartnership.balls += 1;
      if (runs % 2 !== 0) {
        const temp = inn.currentStrikerId;
        inn.currentStrikerId = inn.currentNonStrikerId;
        inn.currentNonStrikerId = temp;
      }
    } else if (extraType === 'penalty') {
      isLegal = false;
      inn.totalRuns += runs;
      inn.extras.penalty += runs;
      inn.extras.total += runs;
    }

    const ballEvent = {
      id: generateBallId(),
      inningsNumber: m.currentInningsNumber,
      ballNumber: inn.validBalls,
      overNumber: Math.floor((inn.validBalls - 1) / 6) + 1,
      ballInOver: isLegal ? ((inn.validBalls - 1) % 6) + 1 : 'extra',
      runsScored: runsOffBat,
      extraRuns: runs,
      extraType: extraType,
      isLegalDelivery: isLegal,
      isWicket: false,
      strikerId: striker?.id,
      strikerName: striker?.name,
      nonStrikerId: nonStriker?.id,
      bowlerId: bowler?.id,
      bowlerName: bowler?.name,
      timestamp: Date.now(),
      scoreAfter: `${inn.totalRuns}/${inn.wickets}`,
      oversAfter: formatOvers(inn.validBalls),
    };

    inn.currentOverBalls.push(ballEvent);
    inn.allBalls.push(ballEvent);

    if (isLegal && inn.validBalls % 6 === 0) {
      const temp = inn.currentStrikerId;
      inn.currentStrikerId = inn.currentNonStrikerId;
      inn.currentNonStrikerId = temp;
      inn.lastBowlerId = inn.currentBowlerId;
      inn.currentOverBalls = [];
      setPendingOverChange(true);
    }

    checkInningsAndMatchProgression(m, inn);

    persistMatchState(
      m,
      `Extra: ${extraType.toUpperCase().replace('_', ' ')} (+${runs + runsOffBat})`,
      `Bowler: ${bowler?.name || ''} | Score: ${inn.totalRuns}/${inn.wickets}`,
      'extra'
    );
  }, [match, currentInnings, persistMatchState, checkInningsAndMatchProgression]);

  // Record Wicket
  const recordWicket = useCallback((wicketData) => {
    if (!match || match.status !== 'live' || !currentInnings) return;

    setUndoStack((prev) => [...prev, JSON.parse(JSON.stringify(match))]);
    soundFx.playWicket();

    const m = JSON.parse(JSON.stringify(match));
    const inn = m.currentInningsNumber === 2 ? m.innings2 : m.innings1;

    const {
      dismissalType, // 'bowled', 'caught', 'lbw', 'run_out', 'stumped', etc.
      playerOutId, // striker or non-striker
      fielderName,
      newBatterId,
      runsScored = 0,
      extraType = null,
      extraRuns = 0,
    } = wicketData;

    const striker = inn.batsmen.find((b) => b.id === inn.currentStrikerId);
    const nonStriker = inn.batsmen.find((b) => b.id === inn.currentNonStrikerId);
    const bowler = inn.bowlers.find((b) => b.id === inn.currentBowlerId);

    const outBatter = inn.batsmen.find((b) => b.id === (playerOutId || inn.currentStrikerId));
    const isBowlerWicket = ['bowled', 'caught', 'lbw', 'stumped', 'hit_wicket'].includes(dismissalType);

    const isLegal = !(extraType === 'wide' || extraType === 'no_ball');

    // Update Runs if any
    const totalBallRuns = runsScored + extraRuns;
    if (totalBallRuns > 0) {
      inn.totalRuns += totalBallRuns;
      inn.currentPartnership.runs += totalBallRuns;
    }

    if (isLegal) {
      inn.validBalls += 1;
      if (striker) striker.balls += 1;
      if (bowler) bowler.balls += 1;
      inn.currentPartnership.balls += 1;
    }

    // Dismiss Batter
    inn.wickets += 1;
    if (outBatter) {
      outBatter.isOut = true;
      outBatter.isBatting = false;
      outBatter.dismissal = {
        type: dismissalType,
        bowlerId: bowler?.id,
        bowlerName: bowler?.name,
        fielderName: fielderName || null,
      };
    }

    // Credit Bowler Wicket
    if (bowler && isBowlerWicket) {
      bowler.wickets += 1;
    }
    if (bowler && totalBallRuns > 0) {
      bowler.runsConceded += totalBallRuns;
    }

    // Record Fall of Wicket
    inn.fallOfWickets.push({
      wicketNumber: inn.wickets,
      score: inn.totalRuns,
      overs: formatOvers(inn.validBalls),
      playerOutName: outBatter?.name || 'Batsman',
      bowlerName: bowler?.name || 'Bowler',
      partnershipRuns: inn.currentPartnership.runs,
    });

    // Reset partnership
    inn.currentPartnership = {
      runs: 0,
      balls: 0,
      player1Id: outBatter?.id === inn.currentStrikerId ? newBatterId : inn.currentStrikerId,
      player2Id: outBatter?.id === inn.currentNonStrikerId ? newBatterId : inn.currentNonStrikerId,
    };

    // Assign New Batter
    if (newBatterId) {
      const nextBatter = inn.batsmen.find((b) => b.id === newBatterId);
      if (nextBatter) {
        nextBatter.isBatting = true;
        nextBatter.battingOrder = inn.wickets + 2;
      }
      if (outBatter?.id === inn.currentStrikerId) {
        inn.currentStrikerId = newBatterId;
      } else {
        inn.currentNonStrikerId = newBatterId;
      }
    }

    // Ball Event
    const ballEvent = {
      id: generateBallId(),
      inningsNumber: m.currentInningsNumber,
      ballNumber: inn.validBalls,
      overNumber: Math.floor((inn.validBalls - 1) / 6) + 1,
      ballInOver: isLegal ? ((inn.validBalls - 1) % 6) + 1 : 'extra',
      runsScored: runsScored,
      extraRuns: extraRuns,
      extraType: extraType,
      isLegalDelivery: isLegal,
      isWicket: true,
      dismissalType: dismissalType,
      playerOutName: outBatter?.name,
      fielderName: fielderName,
      strikerId: striker?.id,
      strikerName: striker?.name,
      nonStrikerId: nonStriker?.id,
      bowlerId: bowler?.id,
      bowlerName: bowler?.name,
      timestamp: Date.now(),
      scoreAfter: `${inn.totalRuns}/${inn.wickets}`,
      oversAfter: formatOvers(inn.validBalls),
    };

    inn.currentOverBalls.push(ballEvent);
    inn.allBalls.push(ballEvent);

    // Over completion check
    if (isLegal && inn.validBalls % 6 === 0) {
      const temp = inn.currentStrikerId;
      inn.currentStrikerId = inn.currentNonStrikerId;
      inn.currentNonStrikerId = temp;
      inn.lastBowlerId = inn.currentBowlerId;
      inn.currentOverBalls = [];
      setPendingOverChange(true);
    }

    checkInningsAndMatchProgression(m, inn);

    persistMatchState(
      m,
      `WICKET! ${outBatter?.name} (${dismissalType.replace('_', ' ').toUpperCase()})`,
      `Bowler: ${bowler?.name || ''} | ${inn.totalRuns}/${inn.wickets} in ${formatOvers(inn.validBalls)} ov`,
      'wicket'
    );
  }, [match, currentInnings, persistMatchState, checkInningsAndMatchProgression]);

  // Undo Last Action
  const undoLastAction = useCallback(async () => {
    if (undoStack.length === 0) return false;
    soundFx.playUndo();

    const previousSnapshot = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, prev.length - 1));

    await persistMatchState(
      previousSnapshot,
      'Last scoring event was undone',
      'Scoreboard rolled back 1 delivery',
      'undo'
    );
    return true;
  }, [undoStack, persistMatchState]);

  // Edit Ball
  const editBall = useCallback(async (ballId, updatedData) => {
    if (!match || !currentInnings) return;

    // Snapshot
    setUndoStack((prev) => [...prev, JSON.parse(JSON.stringify(match))]);

    // Recalculate innings from all balls
    const m = JSON.parse(JSON.stringify(match));
    const inn = m.currentInningsNumber === 2 ? m.innings2 : m.innings1;

    const ballIdx = inn.allBalls.findIndex((b) => b.id === ballId);
    if (ballIdx >= 0) {
      inn.allBalls[ballIdx] = { ...inn.allBalls[ballIdx], ...updatedData };
    }

    await persistMatchState(
      m,
      `Ball event corrected by Umpire`,
      `Ball ID: ${ballId} updated to ${JSON.stringify(updatedData)}`,
      'edit'
    );
  }, [match, currentInnings, persistMatchState]);

  // Switch Strike Manually
  const switchStrikeManual = useCallback(() => {
    if (!match || !currentInnings) return;
    soundFx.playTap();

    const m = JSON.parse(JSON.stringify(match));
    const inn = m.currentInningsNumber === 2 ? m.innings2 : m.innings1;

    const temp = inn.currentStrikerId;
    inn.currentStrikerId = inn.currentNonStrikerId;
    inn.currentNonStrikerId = temp;

    persistMatchState(
      m,
      'Umpire rotated strike manually',
      `Striker is now: ${inn.batsmen.find((b) => b.id === inn.currentStrikerId)?.name}`,
      'system'
    );
  }, [match, currentInnings, persistMatchState]);

  // Change Bowler
  const changeBowler = useCallback((newBowlerId) => {
    if (!match || !currentInnings) return;
    soundFx.playTap();

    const m = JSON.parse(JSON.stringify(match));
    const inn = m.currentInningsNumber === 2 ? m.innings2 : m.innings1;

    inn.currentBowlerId = newBowlerId;
    setPendingOverChange(false);

    const bowlerObj = inn.bowlers.find((b) => b.id === newBowlerId);
    persistMatchState(
      m,
      `Bowler changed to ${bowlerObj?.name || 'Bowler'}`,
      `Over: ${formatOvers(inn.validBalls)}`,
      'system'
    );
  }, [match, currentInnings, persistMatchState]);

  // Start Innings 2 after break
  const startInnings2 = useCallback(() => {
    if (!match) return;
    const m = JSON.parse(JSON.stringify(match));
    m.status = 'live';
    setPendingInningsBreak(false);
    persistMatchState(m, '2nd Innings Resumed', `Target: ${m.innings2?.target} runs`, 'system');
  }, [match, persistMatchState]);

  // End Innings Manually
  const endInningsManual = useCallback(() => {
    if (!match || !currentInnings) return;
    const m = JSON.parse(JSON.stringify(match));
    const inn = m.currentInningsNumber === 2 ? m.innings2 : m.innings1;
    inn.isCompleted = true;

    if (m.currentInningsNumber === 1) {
      const target = inn.totalRuns + 1;
      const batting2ndTeam = inn.battingTeamId === m.teamA.id ? m.teamB : m.teamA;
      const bowling2ndTeam = inn.battingTeamId === m.teamA.id ? m.teamA : m.teamB;

      m.currentInningsNumber = 2;
      m.status = 'innings_break';
      m.innings2 = initializeInningsState(batting2ndTeam, bowling2ndTeam, target);
      setPendingInningsBreak(true);
      persistMatchState(m, '1st Innings Ended by Umpire', `Target set to ${target}`, 'system');
    } else {
      m.status = 'completed';
      checkInningsAndMatchProgression(m, inn);
      persistMatchState(m, '2nd Innings Ended by Umpire', m.result || 'Match Concluded', 'system');
    }
  }, [match, currentInnings, persistMatchState, checkInningsAndMatchProgression]);

  // End Match Manually
  const endMatchManual = useCallback((customResult = null) => {
    if (!match) return;
    const m = JSON.parse(JSON.stringify(match));
    m.status = 'completed';
    m.result = customResult || m.result || 'Match Concluded by Umpire';
    persistMatchState(m, 'Match Ended by Umpire', m.result, 'system');
  }, [match, persistMatchState]);

  // Pause / Resume
  const togglePauseMatch = useCallback(() => {
    if (!match) return;
    const m = JSON.parse(JSON.stringify(match));
    const nextStatus = m.status === 'paused' ? 'live' : 'paused';
    m.status = nextStatus;
    persistMatchState(
      m,
      `Match ${nextStatus === 'paused' ? 'Paused' : 'Resumed'} by Umpire`,
      '',
      'system'
    );
  }, [match, persistMatchState]);

  // Reset Scoreboard
  const resetScoreboard = useCallback(() => {
    if (!match) return;
    setUndoStack((prev) => [...prev, JSON.parse(JSON.stringify(match))]);
    const m = JSON.parse(JSON.stringify(match));
    const inn = m.currentInningsNumber === 2 ? m.innings2 : m.innings1;

    inn.totalRuns = 0;
    inn.wickets = 0;
    inn.validBalls = 0;
    inn.allBalls = [];
    inn.currentOverBalls = [];
    inn.fallOfWickets = [];
    inn.extras = { wides: 0, noBalls: 0, byes: 0, legByes: 0, penalty: 0, total: 0 };
    inn.batsmen.forEach((b, idx) => {
      b.runs = 0;
      b.balls = 0;
      b.fours = 0;
      b.sixes = 0;
      b.isOut = false;
      b.dismissal = null;
      b.isBatting = idx < 2;
    });
    inn.bowlers.forEach((bw) => {
      bw.balls = 0;
      bw.maidens = 0;
      bw.runsConceded = 0;
      bw.wickets = 0;
      bw.wides = 0;
      bw.noBalls = 0;
      bw.dots = 0;
    });

    persistMatchState(m, 'Scoreboard Reset to 0/0 by Umpire', '', 'system');
  }, [match, persistMatchState]);

  return (
    <MatchContext.Provider
      value={{
        match,
        matchList,
        currentInnings,
        undoStack,
        auditLogs,
        isOnline,
        syncStatus,
        syncMessage,
        pendingOverChange,
        setPendingOverChange,
        pendingInningsBreak,
        setPendingInningsBreak,
        pendingMatchCompletion,
        setPendingMatchCompletion,
        settings,
        updateSettings,
        createMatch,
        loadMatch,
        deleteMatch,
        recordRun,
        recordExtra,
        recordWicket,
        undoLastAction,
        editBall,
        switchStrikeManual,
        changeBowler,
        startInnings2,
        endInningsManual,
        endMatchManual,
        togglePauseMatch,
        resetScoreboard,
      }}
    >
      {children}
    </MatchContext.Provider>
  );
}

export function useMatch() {
  const context = useContext(MatchContext);
  if (!context) {
    throw new Error('useMatch must be used within a MatchProvider');
  }
  return context;
}
