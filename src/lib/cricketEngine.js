/**
 * Cricket Statistics & Rules Computation Engine
 */

export const DISMISSAL_TYPES = [
  { id: 'bowled', label: 'Bowled', bowlerCredit: true, needsFielder: false },
  { id: 'caught', label: 'Caught', bowlerCredit: true, needsFielder: true, fielderRole: 'Catcher' },
  { id: 'lbw', label: 'LBW', bowlerCredit: true, needsFielder: false },
  { id: 'run_out', label: 'Run Out', bowlerCredit: false, needsFielder: true, fielderRole: 'Fielder' },
  { id: 'stumped', label: 'Stumped', bowlerCredit: true, needsFielder: true, fielderRole: 'Wicketkeeper' },
  { id: 'hit_wicket', label: 'Hit Wicket', bowlerCredit: true, needsFielder: false },
  { id: 'handled_ball', label: 'Handled Ball', bowlerCredit: false, needsFielder: false },
  { id: 'obstructing', label: 'Obstructing Field', bowlerCredit: false, needsFielder: false },
  { id: 'timed_out', label: 'Timed Out', bowlerCredit: false, needsFielder: false },
  { id: 'retired_out', label: 'Retired Out', bowlerCredit: false, needsFielder: false },
  { id: 'retired_hurt', label: 'Retired Hurt', bowlerCredit: false, needsFielder: false, isWicketCount: false },
];

/**
 * Format balls to cricket overs string (e.g. 15 balls -> 2.3 overs)
 */
export function formatOvers(balls) {
  if (!balls || balls < 0) return '0.0';
  const completedOvers = Math.floor(balls / 6);
  const remainingBalls = balls % 6;
  return `${completedOvers}.${remainingBalls}`;
}

/**
 * Convert overs string or number to total valid balls (e.g. 2.3 -> 15)
 */
export function oversToBalls(overs) {
  if (!overs) return 0;
  if (typeof overs === 'number') {
    const o = Math.floor(overs);
    const b = Math.round((overs - o) * 10);
    return o * 6 + b;
  }
  const parts = String(overs).split('.');
  const o = parseInt(parts[0], 10) || 0;
  const b = parseInt(parts[1], 10) || 0;
  return o * 6 + b;
}

/**
 * Calculate Current Run Rate (CRR)
 */
export function calculateCRR(runs, balls) {
  if (!balls || balls <= 0) return '0.00';
  const crr = (runs / balls) * 6;
  return crr.toFixed(2);
}

/**
 * Calculate Required Run Rate (RRR)
 */
export function calculateRRR(target, currentScore, totalBalls, ballsBowled) {
  if (!target) return null;
  const runsNeeded = target - currentScore;
  const ballsLeft = totalBalls - ballsBowled;
  if (runsNeeded <= 0) return '0.00';
  if (ballsLeft <= 0) return runsNeeded > 0 ? '∞' : '0.00';
  const rrr = (runsNeeded / ballsLeft) * 6;
  return rrr.toFixed(2);
}

/**
 * Calculate Economy Rate
 */
export function calculateEconomy(runsConceded, ballsBowled) {
  if (!ballsBowled || ballsBowled <= 0) return '0.00';
  const econ = (runsConceded / ballsBowled) * 6;
  return econ.toFixed(2);
}

/**
 * Calculate Strike Rate
 */
export function calculateStrikeRate(runs, ballsFaced) {
  if (!ballsFaced || ballsFaced <= 0) return '0.00';
  return ((runs / ballsFaced) * 100).toFixed(2);
}

/**
 * Generate a unique ball ID
 */
export function generateBallId() {
  return 'ball_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
}

/**
 * Helper to produce a human-friendly ball label (e.g., "•", "1", "4", "6", "Wd+1", "Nb+4", "W")
 */
export function getBallLabel(ball) {
  if (!ball) return '';
  if (ball.isWicket) {
    if (ball.extraType === 'wide') return `W+Wd`;
    if (ball.extraType === 'no_ball') return `W+Nb`;
    return ball.runsScored > 0 ? `W+${ball.runsScored}` : 'W';
  }
  if (ball.extraType === 'wide') {
    return ball.extraRuns > 1 ? `Wd+${ball.extraRuns - 1}` : 'Wd';
  }
  if (ball.extraType === 'no_ball') {
    return ball.runsScored > 0 ? `Nb+${ball.runsScored}` : 'Nb';
  }
  if (ball.extraType === 'bye') {
    return `B${ball.extraRuns}`;
  }
  if (ball.extraType === 'leg_bye') {
    return `Lb${ball.extraRuns}`;
  }
  if (ball.extraType === 'penalty') {
    return `+${ball.extraRuns}P`;
  }
  if (ball.runsScored === 0) return '•';
  return String(ball.runsScored);
}

/**
 * Creates default team structure
 */
export function createDefaultTeam(name, shortName, color = '#10b981') {
  return {
    id: 'team_' + Math.random().toString(36).substring(2, 9),
    name: name,
    shortName: shortName || name.substring(0, 3).toUpperCase(),
    color: color,
    players: [
      { id: 'p1', name: 'Player 1', role: 'Batsman', isCaptain: true, isKeeper: false },
      { id: 'p2', name: 'Player 2', role: 'Batsman', isCaptain: false, isKeeper: false },
      { id: 'p3', name: 'Player 3', role: 'All-Rounder', isCaptain: false, isKeeper: false },
      { id: 'p4', name: 'Player 4', role: 'Batsman', isCaptain: false, isKeeper: true },
      { id: 'p5', name: 'Player 5', role: 'All-Rounder', isCaptain: false, isKeeper: false },
      { id: 'p6', name: 'Player 6', role: 'All-Rounder', isCaptain: false, isKeeper: false },
      { id: 'p7', name: 'Player 7', role: 'Bowler', isCaptain: false, isKeeper: false },
      { id: 'p8', name: 'Player 8', role: 'Bowler', isCaptain: false, isKeeper: false },
      { id: 'p9', name: 'Player 9', role: 'Bowler', isCaptain: false, isKeeper: false },
      { id: 'p10', name: 'Player 10', role: 'Bowler', isCaptain: false, isKeeper: false },
      { id: 'p11', name: 'Player 11', role: 'Bowler', isCaptain: false, isKeeper: false },
    ]
  };
}

/**
 * Initialize fresh innings state
 */
export function initializeInningsState(battingTeam, bowlingTeam, target = null) {
  const p1 = battingTeam.players[0] || { id: 'p1', name: 'Opener 1' };
  const p2 = battingTeam.players[1] || { id: 'p2', name: 'Opener 2' };
  const b1 = bowlingTeam.players[bowlingTeam.players.length - 1] || { id: 'b1', name: 'Opening Bowler' };

  return {
    battingTeamId: battingTeam.id,
    bowlingTeamId: bowlingTeam.id,
    battingTeamName: battingTeam.name,
    bowlingTeamName: bowlingTeam.name,
    totalRuns: 0,
    wickets: 0,
    validBalls: 0,
    target: target,
    isCompleted: false,
    currentStrikerId: p1.id,
    currentNonStrikerId: p2.id,
    currentBowlerId: b1.id,
    lastBowlerId: null,
    extras: {
      wides: 0,
      noBalls: 0,
      byes: 0,
      legByes: 0,
      penalty: 0,
      total: 0,
    },
    // Player batting records
    batsmen: battingTeam.players.map((p, idx) => ({
      id: p.id,
      name: p.name,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      isOut: false,
      dismissal: null, // { type, bowlerId, bowlerName, fielderId, fielderName }
      battingOrder: idx < 2 ? idx + 1 : null,
      isBatting: idx < 2,
    })),
    // Player bowling records
    bowlers: bowlingTeam.players.map((p) => ({
      id: p.id,
      name: p.name,
      balls: 0,
      maidens: 0,
      runsConceded: 0,
      wickets: 0,
      wides: 0,
      noBalls: 0,
      dots: 0,
    })),
    currentOverBalls: [], // array of ball objects in current over
    allBalls: [], // chronological ball objects
    fallOfWickets: [], // [{ wicketNumber, score, overs, playerOutName, bowlerName, partnership }]
    currentPartnership: {
      runs: 0,
      balls: 0,
      player1Id: p1.id,
      player2Id: p2.id,
    },
  };
}
