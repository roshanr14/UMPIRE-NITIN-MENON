import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Printer,
  Download,
  Share2,
  Calendar,
  MapPin,
  Clock,
  Award,
  Check,
  ChevronRight,
  Shield,
  FileText,
  Copy,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useMatch } from '../../context/MatchContext';
import { formatOvers, calculateEconomy, calculateStrikeRate } from '../../lib/cricketEngine';

export default function MatchSummary({ onNavigateToScoring, onNavigateToAudit }) {
  const { match } = useMatch();
  const scorecardRef = useRef(null);

  const [selectedInnings, setSelectedInnings] = useState(1);
  const [copiedShare, setCopiedShare] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!match) {
    return (
      <div className="text-center py-16 text-slate-400">
        <Trophy className="w-12 h-12 mx-auto mb-3 text-slate-600" />
        <h3 className="text-lg font-bold text-slate-200">No Match Selected</h3>
        <p className="text-xs text-slate-500 mt-1">Please select or create a match from the Dashboard.</p>
      </div>
    );
  }

  const innings1 = match.innings1;
  const innings2 = match.innings2;
  const activeInningsData = selectedInnings === 2 ? innings2 : innings1;

  // Print scorecard
  const handlePrint = () => {
    window.print();
  };

  // Export to PDF
  const handleExportPDF = async () => {
    if (!scorecardRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(scorecardRef.current, {
        scale: 2,
        backgroundColor: '#090d16',
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${match.teamA.name}_vs_${match.teamB.name}_Scorecard.pdf`);
    } catch (err) {
      console.warn('PDF export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Copy share text
  const handleShare = () => {
    const text = `🏏 Match Summary: ${match.teamA.name} vs ${match.teamB.name}
Result: ${match.result || (match.status === 'live' ? 'Match Live in progress' : 'Innings Complete')}
1st Innings (${innings1?.battingTeamName}): ${innings1?.totalRuns}/${innings1?.wickets} (${formatOvers(innings1?.validBalls)} ov)
${innings2 ? `2nd Innings (${innings2?.battingTeamName}): ${innings2?.totalRuns}/${innings2?.wickets} (${formatOvers(innings2?.validBalls)} ov)` : ''}
Venue: ${match.venue}
Generated via CricUmpire Pro Scorecard`;

    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-3xl bg-slate-900 border border-slate-800 no-print">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedInnings(1)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedInnings === 1
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            1st Innings ({innings1?.battingTeamName})
          </button>

          {innings2 && (
            <button
              onClick={() => setSelectedInnings(2)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedInnings === 2
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              2nd Innings ({innings2?.battingTeamName})
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleShare}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700"
          >
            {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedShare ? 'Copied Link' : 'Share Text'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Sheet</span>
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      {/* Printable Scorecard Container */}
      <div ref={scorecardRef} className="space-y-6">
        {/* Match Result Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/40 border border-slate-800 p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800/80 flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-emerald-400" />
                  Official Match Scorecard
                </span>
                <span className="text-xs text-slate-400">
                  {match.format} • {match.totalOvers} Overs per side
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-display">
                {match.teamA.name} vs {match.teamB.name}
              </h1>

              {/* Match Result announcement */}
              <div className="mt-2">
                {match.result ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-950/80 border border-emerald-600/50 text-emerald-300 font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-950">
                    <Trophy className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>{match.result}</span>
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-amber-400">
                    Match Status: {match.status.replace('_', ' ').toUpperCase()}
                  </p>
                )}
              </div>

              <p className="text-xs text-slate-400 flex items-center gap-3 pt-1">
                <span><MapPin className="w-3.5 h-3.5 inline mr-1" />{match.venue}</span>
                <span>•</span>
                <span><Calendar className="w-3.5 h-3.5 inline mr-1" />{match.date}</span>
                <span>•</span>
                <span>Toss won by <strong>{match.toss.winnerName}</strong> (elected to {match.toss.decision})</span>
              </p>
            </div>

            {/* Innings Summary Pill Boxes */}
            <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full md:w-auto">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 min-w-[150px]">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  1st Inn: {innings1?.battingTeamName}
                </p>
                <p className="text-2xl font-black text-white font-digit mt-1">
                  {innings1?.totalRuns}/{innings1?.wickets}
                </p>
                <p className="text-xs text-slate-400 font-digit">
                  ({formatOvers(innings1?.validBalls)} ov)
                </p>
              </div>

              {innings2 && (
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 min-w-[150px]">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    2nd Inn: {innings2?.battingTeamName}
                  </p>
                  <p className="text-2xl font-black text-emerald-400 font-digit mt-1">
                    {innings2?.totalRuns}/{innings2?.wickets}
                  </p>
                  <p className="text-xs text-slate-400 font-digit">
                    ({formatOvers(innings2?.validBalls)} ov)
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {activeInningsData ? (
          <>
            {/* Batting Scorecard Table */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-white font-display">
                    {activeInningsData.battingTeamName} Batting
                  </h3>
                  <p className="text-xs text-slate-400">
                    Innings {selectedInnings} Full Batting Figures
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black text-white font-digit">
                    {activeInningsData.totalRuns}/{activeInningsData.wickets}
                  </span>
                  <span className="text-xs text-slate-400 font-digit ml-2">
                    ({formatOvers(activeInningsData.validBalls)} ov)
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider">
                      <th className="pb-2 pl-2">Batter</th>
                      <th className="pb-2">Dismissal</th>
                      <th className="pb-2 text-right">R</th>
                      <th className="pb-2 text-right">B</th>
                      <th className="pb-2 text-right">4s</th>
                      <th className="pb-2 text-right">6s</th>
                      <th className="pb-2 text-right pr-2">SR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {activeInningsData.batsmen.map((b, idx) => {
                      const sr = calculateStrikeRate(b.runs, b.balls);
                      const hasBatted = b.balls > 0 || b.runs > 0 || b.isOut || b.isBatting;
                      if (!hasBatted) return null;

                      let dismissalText = 'not out';
                      if (b.isOut && b.dismissal) {
                        const d = b.dismissal;
                        if (d.type === 'bowled') dismissalText = `b ${d.bowlerName}`;
                        else if (d.type === 'caught') dismissalText = `c ${d.fielderName || 'Fielder'} b ${d.bowlerName}`;
                        else if (d.type === 'lbw') dismissalText = `lbw b ${d.bowlerName}`;
                        else if (d.type === 'run_out') dismissalText = `run out (${d.fielderName || 'Fielder'})`;
                        else if (d.type === 'stumped') dismissalText = `st ${d.fielderName || 'Wk'} b ${d.bowlerName}`;
                        else dismissalText = d.type.replace('_', ' ');
                      } else if (b.isBatting) {
                        dismissalText = 'batting *';
                      }

                      return (
                        <tr key={idx} className="hover:bg-slate-800/30">
                          <td className="py-3 pl-2 font-bold text-sm text-slate-100">
                            {b.name}
                          </td>
                          <td className="py-3 text-xs text-slate-400 font-mono">
                            {dismissalText}
                          </td>
                          <td className="py-3 text-right font-digit text-base font-bold text-emerald-400">
                            {b.runs}
                          </td>
                          <td className="py-3 text-right font-digit text-slate-300">
                            {b.balls}
                          </td>
                          <td className="py-3 text-right font-digit text-slate-400">
                            {b.fours}
                          </td>
                          <td className="py-3 text-right font-digit text-slate-400">
                            {b.sixes}
                          </td>
                          <td className="py-3 text-right font-digit font-semibold text-slate-200 pr-2">
                            {sr}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Extras breakdown row */}
              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-300">
                <span className="font-semibold">
                  Extras: <strong className="text-white font-digit">{activeInningsData.extras?.total || 0}</strong> (wd {activeInningsData.extras?.wides || 0}, nb {activeInningsData.extras?.noBalls || 0}, b {activeInningsData.extras?.byes || 0}, lb {activeInningsData.extras?.legByes || 0}, p {activeInningsData.extras?.penalty || 0})
                </span>
                <span className="font-semibold font-digit text-slate-200">
                  Total: {activeInningsData.totalRuns}/{activeInningsData.wickets} in {formatOvers(activeInningsData.validBalls)} Overs
                </span>
              </div>
            </div>

            {/* Bowling Scorecard Table */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-white font-display">
                    {activeInningsData.bowlingTeamName} Bowling
                  </h3>
                  <p className="text-xs text-slate-400">
                    Overs, Maidens, Runs & Wickets
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider">
                      <th className="pb-2 pl-2">Bowler</th>
                      <th className="pb-2 text-right">O</th>
                      <th className="pb-2 text-right">M</th>
                      <th className="pb-2 text-right">R</th>
                      <th className="pb-2 text-right">W</th>
                      <th className="pb-2 text-right">Dots</th>
                      <th className="pb-2 text-right pr-2">Econ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {activeInningsData.bowlers
                      .filter((bw) => bw.balls > 0 || bw.runsConceded > 0 || bw.wickets > 0)
                      .map((bw, idx) => {
                        const overs = formatOvers(bw.balls);
                        const econ = calculateEconomy(bw.runsConceded, bw.balls);
                        return (
                          <tr key={idx} className="hover:bg-slate-800/30">
                            <td className="py-3 pl-2 font-bold text-sm text-slate-100">
                              {bw.name}
                            </td>
                            <td className="py-3 text-right font-digit text-slate-200">
                              {overs}
                            </td>
                            <td className="py-3 text-right font-digit text-slate-400">
                              {bw.maidens}
                            </td>
                            <td className="py-3 text-right font-digit text-amber-400">
                              {bw.runsConceded}
                            </td>
                            <td className="py-3 text-right font-digit text-base font-bold text-emerald-400">
                              {bw.wickets}
                            </td>
                            <td className="py-3 text-right font-digit text-slate-400">
                              {bw.dots || 0}
                            </td>
                            <td className="py-3 text-right font-digit font-semibold text-slate-200 pr-2">
                              {econ}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Fall of Wickets (FoW) Table */}
            {activeInningsData.fallOfWickets?.length > 0 && (
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                <h3 className="text-lg font-bold text-white font-display pb-3 border-b border-slate-800">
                  Fall of Wickets
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {activeInningsData.fallOfWickets.map((fow, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-200">
                          {fow.wicketNumber}-{fow.score}{' '}
                          <span className="text-slate-400 font-normal">
                            ({fow.playerOutName})
                          </span>
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Bowled by {fow.bowlerName}
                        </p>
                      </div>
                      <span className="text-xs font-digit font-bold text-emerald-400 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                        {fow.overs} ov
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center text-slate-500 text-xs">
            2nd Innings has not begun yet.
          </div>
        )}
      </div>
    </div>
  );
}
