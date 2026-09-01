import React from 'react';
import { motion } from 'framer-motion';
import { getBallLabel } from '../../lib/cricketEngine';
import { Edit3, Clock } from 'lucide-react';

export default function OverTimeline({ currentInnings, onSelectBallToEdit }) {
  if (!currentInnings) return null;

  const currentOverBalls = currentInnings.currentOverBalls || [];
  const allBalls = currentInnings.allBalls || [];
  const recentBalls = allBalls.slice(-12).reverse();

  const getBadgeStyle = (ball) => {
    if (ball.isWicket) {
      return 'bg-red-600 text-white border-red-400 font-black shadow-lg shadow-red-950/60 ring-2 ring-red-500/50';
    }
    if (ball.extraType) {
      return 'bg-amber-600 text-white border-amber-400 font-bold shadow-md shadow-amber-950/40';
    }
    if (ball.runsScored === 4) {
      return 'bg-cyan-600 text-white border-cyan-300 font-black shadow-lg shadow-cyan-950/60';
    }
    if (ball.runsScored === 6) {
      return 'bg-gradient-to-tr from-purple-600 to-pink-600 text-white border-pink-300 font-black shadow-lg shadow-pink-950/60';
    }
    if (ball.runsScored > 0) {
      return 'bg-emerald-700 text-white border-emerald-400 font-bold';
    }
    // Dot ball (0)
    return 'bg-slate-800 text-slate-300 border-slate-700 font-medium';
  };

  return (
    <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
      {/* Current Over Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-200 font-display">
            Current Over Timeline
          </h3>
        </div>
        <span className="text-xs text-slate-400">
          Click any ball badge to edit or correct score
        </span>
      </div>

      {/* Current Over Ball Badges Strip */}
      <div className="flex items-center gap-2 overflow-x-auto py-2 pr-2">
        {currentOverBalls.length === 0 ? (
          <div className="text-xs text-slate-500 italic py-2">
            No deliveries bowled yet in this over. Click a scoring button below.
          </div>
        ) : (
          currentOverBalls.map((ball, idx) => (
            <motion.button
              key={ball.id || idx}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectBallToEdit(ball)}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-digit border transition-all cursor-pointer ${getBadgeStyle(
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
        <div className="pt-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            <span>Recent Match Deliveries (Last 12 Balls)</span>
            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
              <Edit3 className="w-3 h-3" />
              Editable
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {recentBalls.map((ball) => (
              <button
                key={ball.id}
                onClick={() => onSelectBallToEdit(ball)}
                className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-digit border transition-all hover:scale-105 active:scale-95 ${getBadgeStyle(
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
