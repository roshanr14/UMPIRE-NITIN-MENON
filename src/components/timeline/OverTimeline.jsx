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
      return 'bg-[#2b000a] text-[#ff0055] border-2 border-[#ff0055] font-black shadow-lg shadow-[#ff0055]/40 text-glow-pink animate-pulse';
    }
    if (ball.extraType) {
      return 'bg-[#291e00] text-[#fcee0a] border border-[#fcee0a] font-bold shadow-md shadow-[#fcee0a]/20';
    }
    if (ball.runsScored === 4) {
      return 'bg-[#1a1700] text-[#fcee0a] border-2 border-[#fcee0a] font-black shadow-lg shadow-[#fcee0a]/30 text-glow-yellow';
    }
    if (ball.runsScored === 6) {
      return 'bg-[#240011] text-[#ff0055] border-2 border-[#ff0055] font-black shadow-lg shadow-[#ff0055]/30 text-glow-pink';
    }
    if (ball.runsScored > 0) {
      return 'bg-[#00242b] text-[#00f0ff] border border-[#00f0ff] font-bold shadow-sm shadow-[#00f0ff]/20';
    }
    // Dot ball (0)
    return 'bg-[#050814] text-slate-400 border border-[#00f0ff]/25 font-semibold';
  };

  return (
    <div className="p-5 rounded-3xl cyber-card border border-[#00f0ff]/25 shadow-xl space-y-4">
      {/* Current Over Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#00f0ff]/15">
        <div className="flex items-center gap-2 font-cyber">
          <Activity className="w-4 h-4 text-[#00f0ff]" />
          <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
            DELIVERY_FEED // CURRENT_OVER
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          [ TAP_BALL_TO_EDIT_SCORE ]
        </span>
      </div>

      {/* Current Over Ball Badges Strip */}
      <div className="flex items-center gap-2 overflow-x-auto py-2 pr-2">
        {currentOverBalls.length === 0 ? (
          <div className="text-xs font-mono text-slate-500 italic py-2">
            // NO_DELIVERIES_RECORDED_THIS_OVER. INITIATE SCORING VIA MATRIX BELOW.
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
        <div className="pt-3 border-t border-[#00f0ff]/15">
          <div className="flex items-center justify-between text-[10px] font-bold font-mono uppercase tracking-wider text-slate-400 mb-2">
            <span>PACKET_LOG // LAST 12 DELIVERIES</span>
            <span className="text-[#00f0ff] flex items-center gap-1 font-semibold">
              <Edit3 className="w-3 h-3" />
              EDITABLE
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
