import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  ArrowRight,
  Play,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Clock,
  Shield,
} from 'lucide-react';
import { useMatch } from '../../context/MatchContext';
import ScoreboardBanner from './ScoreboardBanner';
import BatsmenCard from './BatsmenCard';
import BowlerCard from './BowlerCard';
import OverTimeline from '../timeline/OverTimeline';
import ScoreKeypad from './ScoreKeypad';
import WicketModal from './WicketModal';
import ExtrasDrawer from './ExtrasDrawer';
import BowlerSelectModal from './BowlerSelectModal';
import EditBallModal from '../timeline/EditBallModal';
import ConfirmModal from '../common/ConfirmModal';

export default function LiveScoringView({
  onNavigateToSummary,
  onNavigateToDashboard,
  onOpenShortcuts,
}) {
  const {
    match,
    currentInnings,
    undoStack,
    pendingOverChange,
    setPendingOverChange,
    pendingInningsBreak,
    setPendingInningsBreak,
    pendingMatchCompletion,
    setPendingMatchCompletion,
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
  } = useMatch();

  // Modals state
  const [isWicketOpen, setIsWicketOpen] = useState(false);
  const [isExtrasOpen, setIsExtrasOpen] = useState(false);
  const [isBowlerChangeOpen, setIsBowlerChangeOpen] = useState(false);
  const [ballToEdit, setBallToEdit] = useState(null);

  // Safety Confirmation states
  const [confirmEndInnings, setConfirmEndInnings] = useState(false);
  const [confirmEndMatch, setConfirmEndMatch] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore when inside input/textarea/select
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (!match || match.status !== 'live') return;

      const key = e.key.toLowerCase();

      // Undo Ctrl+Z
      if (e.ctrlKey && key === 'z') {
        e.preventDefault();
        undoLastAction();
        return;
      }

      switch (key) {
        case '0':
        case '.':
          recordRun(0);
          break;
        case '1':
          recordRun(1);
          break;
        case '2':
          recordRun(2);
          break;
        case '3':
          recordRun(3);
          break;
        case '4':
          recordRun(4);
          break;
        case '6':
          recordRun(6);
          break;
        case 'w':
          setIsExtrasOpen(true);
          break;
        case 'n':
          setIsExtrasOpen(true);
          break;
        case 'b':
          recordExtra('bye', 1);
          break;
        case 'l':
          recordExtra('leg_bye', 1);
          break;
        case 'k':
          setIsWicketOpen(true);
          break;
        case 'u':
          undoLastAction();
          break;
        case 's':
          switchStrikeManual();
          break;
        case 'p':
          togglePauseMatch();
          break;
        case '?':
          onOpenShortcuts();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [match, recordRun, recordExtra, undoLastAction, switchStrikeManual, togglePauseMatch, onOpenShortcuts]);

  if (!match) {
    return (
      <div className="text-center py-16 space-y-3">
        <Trophy className="w-12 h-12 text-slate-600 mx-auto" />
        <h3 className="text-xl font-bold text-slate-200 font-display">
          No Active Match Selected
        </h3>
        <p className="text-xs text-slate-400">
          Return to Dashboard to create a new match or load an existing match.
        </p>
        <button
          onClick={onNavigateToDashboard}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-16 font-sans">
      {/* Broadcast Header Scorecard Banner */}
      <ScoreboardBanner match={match} currentInnings={currentInnings} />

      {/* Innings Break Notification Overlay Banner */}
      {match.status === 'innings_break' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-3xl glass-panel border border-cyan-400/40 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 uppercase tracking-wider">
              1st Innings Concluded
            </span>
            <h3 className="text-2xl font-bold text-white font-display mt-2">
              Target for {match.innings2?.battingTeamName}: {match.innings2?.target} Runs
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              {match.innings1?.battingTeamName} scored {match.innings1?.totalRuns}/{match.innings1?.wickets} in {match.totalOvers} overs.
            </p>
          </div>

          <button
            onClick={startInnings2}
            className="px-6 py-3.5 rounded-2xl glass-btn-primary font-bold text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all active:scale-95 shrink-0 relative z-10"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start 2nd Innings</span>
          </button>
        </motion.div>
      )}

      {/* Match Completed Banner */}
      {match.status === 'completed' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-3xl glass-panel border border-emerald-400/40 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Match Concluded
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white font-display mt-1">
              {match.result || 'Match Completed!'}
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Review full batting figures, bowling figures, and fall of wickets.
            </p>
          </div>

          <button
            onClick={onNavigateToSummary}
            className="px-6 py-3.5 rounded-2xl glass-btn-primary font-bold text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all active:scale-95 shrink-0 relative z-10"
          >
            <span>View Full Scorecard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* 2-Column Batsmen & Bowler Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BatsmenCard
          currentInnings={currentInnings}
          onSwitchStrike={switchStrikeManual}
        />
        <BowlerCard
          currentInnings={currentInnings}
          onOpenChangeBowler={() => setIsBowlerChangeOpen(true)}
        />
      </div>

      {/* Current Over Timeline with Edit Ball Trigger */}
      <OverTimeline
        currentInnings={currentInnings}
        onSelectBallToEdit={(ball) => setBallToEdit(ball)}
      />

      {/* Big Tactical Scoring Keypad */}
      <ScoreKeypad
        match={match}
        canScore={match.status === 'live'}
        undoCount={undoStack.length}
        onRecordRun={recordRun}
        onOpenExtras={() => setIsExtrasOpen(true)}
        onOpenWicket={() => setIsWicketOpen(true)}
        onUndo={undoLastAction}
        onSwitchStrike={switchStrikeManual}
        onOpenChangeBowler={() => setIsBowlerChangeOpen(true)}
        onTogglePause={togglePauseMatch}
        onConfirmEndInnings={() => setConfirmEndInnings(true)}
        onConfirmEndMatch={() => setConfirmEndMatch(true)}
        onConfirmReset={() => setConfirmReset(true)}
      />

      {/* Modals */}
      {/* 1. Wicket Modal */}
      <WicketModal
        isOpen={isWicketOpen}
        currentInnings={currentInnings}
        onClose={() => setIsWicketOpen(false)}
        onSubmitWicket={recordWicket}
      />

      {/* 2. Extras Drawer */}
      <ExtrasDrawer
        isOpen={isExtrasOpen}
        onClose={() => setIsExtrasOpen(false)}
        onSubmitExtra={recordExtra}
      />

      {/* 3. Bowler Change / Over End Bowler Selection Modal */}
      <BowlerSelectModal
        isOpen={isBowlerChangeOpen || pendingOverChange}
        isOverEnd={pendingOverChange}
        currentInnings={currentInnings}
        onClose={() => {
          setIsBowlerChangeOpen(false);
          setPendingOverChange(false);
        }}
        onSelectBowler={changeBowler}
      />

      {/* 4. Edit Ball Modal */}
      <EditBallModal
        isOpen={Boolean(ballToEdit)}
        ball={ballToEdit}
        onClose={() => setBallToEdit(null)}
        onSaveEdit={editBall}
      />

      {/* 5. Confirmation Dialog: End Innings */}
      <ConfirmModal
        isOpen={confirmEndInnings}
        title="End This Innings?"
        message="Are you sure you want to end this innings? This action will finalize the current innings score and set the target for the next innings."
        confirmText="End Innings"
        confirmVariant="warning"
        onCancel={() => setConfirmEndInnings(false)}
        onConfirm={() => {
          setConfirmEndInnings(false);
          endInningsManual();
        }}
      />

      {/* 6. Confirmation Dialog: End Match */}
      <ConfirmModal
        isOpen={confirmEndMatch}
        title="Conclude Match?"
        message="Are you sure you want to end this match? Match status will be set to Completed."
        confirmText="Conclude Match"
        confirmVariant="danger"
        onCancel={() => setConfirmEndMatch(false)}
        onConfirm={() => {
          setConfirmEndMatch(false);
          endMatchManual();
        }}
      />

      {/* 7. Confirmation Dialog: Reset Scoreboard */}
      <ConfirmModal
        isOpen={confirmReset}
        title="Reset Scoreboard to 0/0?"
        message="Are you sure you want to reset the scoreboard? All current innings deliveries, wickets, and player runs will be cleared."
        confirmText="Reset Scoreboard"
        confirmVariant="danger"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          setConfirmReset(false);
          resetScoreboard();
        }}
      />
    </div>
  );
}
