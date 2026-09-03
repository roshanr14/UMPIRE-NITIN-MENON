import React from 'react';
import { motion } from 'framer-motion';
import { getBallLabel } from '../../lib/cricketEngine';
import { Edit3, Clock, Activity } from 'lucide-react';

export default function OverTimeline({ currentInnings, onSelectBallToEdit }) {
  if (!currentInnings) return null;

  const currentOverBalls = currentInnings.currentOverBalls || [];
  const allBalls = currentInnings.allBalls || [];
  const recentBalls = allBalls.slice(-12).reverse();

  const getBadgeStyle = (ball) => {
    if (ball.isWicket) {
      return 'bg-rose-500/30 text-rose-200 border-rose-400/60 font-black shadow-lg shadow-rose-500/25 animate-pulse';
    }
    if (ball.extraType) {
      return 'bg-amber-500/25 text-amber-200 border-amber-400/50 font-bold shadow-md shadow-amber-500/20';
    }
    if (ball.runsScored === 4) {
      return 'bg-amber-400/25 text-amber-300 border-amber-400/60 font-black shadow-md shadow-amber-500/20';
    }
    if (ball.runsScored === 6) {
      return 'bg-rose-500/30 text-rose-200 border-rose-400/60 font-black shadow-lg shadow-rose-500/25';
    }
    if (ball.runsScored > 0) {
      return 'bg-cyan-500/25 text-cyan-200 border-cyan-400/50 font-bold';
    }
    // Dot ball (0)
    return 'bg-white/[0.04] text-slate-300 border-white/[0.1] hover:border-cyan-400/40 font-semibold';
  };

  return (
    <div className="p-5 rounded-3xl glass-panel border border-white/[0.12] shadow-xl space-y-4 font-sans">
      {/* Current Over Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300">
            <Activity className="w-4 h-4" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white font-display">
            Current Over Deliveries
          </h3>
        </div>
        <span className="text-xs text-slate-400">
          Click any ball to edit score
        </span>
      </div>

      {/* Current Over Ball Badges Strip */}
      <div className="flex items-center gap-2.5 overflow-x-auto py-2 pr-2">
        {currentOverBalls.length === 0 ? (
          <div className="text-xs text-slate-400 italic py-2">
            No deliveries bowled yet in this over. Click a scoring button below.
          </div>
        ) : (
          currentOverBalls.map((ball, idx) => (
            <motion.button
              key={ball.id || idx}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.12, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectBallToEdit(ball)}
              className={`liquid-btn w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-digit border backdrop-blur-xl ${getBadgeStyle(
                ball
              )}`}
              title={`Ball ${idx + 1}: ${ball.strikerName} facing ${ball.bowlerName} - Click to Edit`}
            >
              {getBallLabel(ball)}
            </motion.button>
          ))
        )}
      </div>

      {/* Recent Match Deliveries Roll */}
      {recentBalls.length > 0 && (
        <div className="pt-3 border-t border-white/[0.08]">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-slate-400 mb-2.5 font-medium">
            <span>Recent Match Deliveries (Last 12 Balls)</span>
            <span className="text-cyan-300 flex items-center gap-1 font-semibold">
              <Edit3 className="w-3 h-3" />
              Editable
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {recentBalls.map((ball) => (
              <button
                key={ball.id}
                onClick={() => onSelectBallToEdit(ball)}
                className={`liquid-btn w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-digit border backdrop-blur-xl ${getBadgeStyle(
                  ball
                )}`}
                title={`${ball.oversAfter} ov: ${getBallLabel(ball)} - Click to Edit`}
              >
                {getBallLabel(ball)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
