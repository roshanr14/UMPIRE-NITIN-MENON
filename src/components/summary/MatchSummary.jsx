import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Flame,
  Zap,
  TrendingUp,
  Activity,
  Users,
  Target,
  ArrowUpRight,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useMatch } from '../../context/MatchContext';
import { useAuth } from '../../context/AuthContext';
import { formatOvers, calculateEconomy, calculateStrikeRate, calculateCRR } from '../../lib/cricketEngine';

export default function MatchSummary({ onNavigateToScoring, onNavigateToAudit }) {
  const { match } = useMatch();
  const { user } = useAuth();
  const scorecardRef = useRef(null);

  const [activeTab, setActiveTab] = useState('innings1'); // 'innings1' | 'innings2' | 'partnerships' | 'all'
  const [copiedShare, setCopiedShare] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);

  if (!match) {
    return (
      <div className="text-center py-20 text-slate-400">
        <Trophy className="w-14 h-14 mx-auto mb-3 text-slate-700 animate-pulse" />
        <h3 className="text-xl font-bold text-slate-200 font-display">No Match Selected</h3>
        <p className="text-xs text-slate-500 mt-1">Please select or start a match from the Dashboard.</p>
      </div>
    );
  }

  const innings1 = match.innings1;
  const innings2 = match.innings2;

  // Compute Top Performers across the match
  const allBatsmen = [
    ...(innings1?.batsmen || []).map((b) => ({ ...b, teamName: innings1.battingTeamName })),
    ...(innings2?.batsmen || []).map((b) => ({ ...b, teamName: innings2.battingTeamName })),
  ];
  const allBowlers = [
    ...(innings1?.bowlers || []).map((bw) => ({ ...bw, teamName: innings1.bowlingTeamName })),
    ...(innings2?.bowlers || []).map((bw) => ({ ...bw, teamName: innings2.bowlingTeamName })),
  ];

  const topBatter = allBatsmen.reduce((max, b) => (b.runs > (max?.runs || 0) ? b : max), null);
  const topBowler = allBowlers.reduce((max, bw) => {
    if (bw.wickets > (max?.wickets || 0)) return bw;
    if (bw.wickets === max?.wickets && bw.runsConceded < (max?.runsConceded || 999)) return bw;
    return max;
  }, null);

  // Active Innings Data based on tab
  const activeInningsData = activeTab === 'innings2' ? innings2 : innings1;
  const activeInningNumber = activeTab === 'innings2' ? 2 : 1;

  // Print scorecard
  const handlePrint = () => {
    window.print();
  };

  // Export High-Resolution PDF
  const handleExportPDF = async () => {
    if (!scorecardRef.current) return;
    setIsExportingPDF(true);
    try {
      const canvas = await html2canvas(scorecardRef.current, {
        scale: 2,
        backgroundColor: '#070a12',
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const filename = `${match.teamA.name.replace(/\s+/g, '_')}_vs_${match.teamB.name.replace(/\s+/g, '_')}_Official_Scorecard.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.warn('PDF export error:', err);
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Export High-Definition Image (PNG)
  const handleExportImage = async () => {
    if (!scorecardRef.current) return;
    setIsExportingImage(true);
    try {
      const canvas = await html2canvas(scorecardRef.current, {
        scale: 2,
        backgroundColor: '#070a12',
        useCORS: true,
        logging: false,
      });

      const link = document.createElement('a');
      link.download = `${match.teamA.name.replace(/\s+/g, '_')}_vs_${match.teamB.name.replace(/\s+/g, '_')}_Scorecard.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.warn('Image export error:', err);
    } finally {
      setIsExportingImage(false);
    }
  };

  // Copy share text for WhatsApp / SMS
  const handleShare = () => {
    const text = `🏏 *CRICUMPIRE PRO MATCH REPORT*
*${match.teamA.name} vs ${match.teamB.name}*
🏆 *Result:* ${match.result || (match.status === 'live' ? 'Match Live in Progress' : 'Innings Complete')}

📊 *1st Innings (${innings1?.battingTeamName}):*
${innings1?.totalRuns}/${innings1?.wickets} in ${formatOvers(innings1?.validBalls)} ov (CRR: ${calculateCRR(innings1?.totalRuns, innings1?.validBalls)})
${
  topBatter && topBatter.runs > 0
    ? `⭐ Top Batter: ${topBatter.name} ${topBatter.runs} (${topBatter.balls}b, ${topBatter.fours}x4, ${topBatter.sixes}x6)`
    : ''
}

${
  innings2
    ? `📊 *2nd Innings (${innings2?.battingTeamName}):*
${innings2?.totalRuns}/${innings2?.wickets} in ${formatOvers(innings2?.validBalls)} ov (Target: ${innings2?.target})`
    : ''
}
📍 Venue: ${match.venue}
Generated via CricUmpire Pro Scorecard`;

    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Top Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-lg no-print">
        <div className="flex items-center gap-2">
          {match.status === 'live' && (
            <button
              onClick={onNavigateToScoring}
              className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-emerald-950 transition-all active:scale-95"
            >
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>Resume Live Scoring</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleShare}
            className="px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-all active:scale-95"
          >
            {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedShare ? 'Copied to Clipboard!' : 'Share Match'}</span>
          </button>

          <button
            onClick={handleExportImage}
            disabled={isExportingImage}
            className="px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-all active:scale-95 disabled:opacity-50"
          >
            <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
            <span>{isExportingImage ? 'Exporting...' : 'Save PNG'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Sheet</span>
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950 transition-all active:scale-95 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExportingPDF ? 'Generating PDF...' : 'Download Scorecard PDF'}</span>
          </button>
        </div>
      </div>

      {/* Main Printable Scorecard Wrapper */}
      <div ref={scorecardRef} className="space-y-6">
        {/* GRAND VICTORY & MATCH HEADER HERO */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#0c1222] to-emerald-950/60 border-2 border-slate-800/90 p-6 sm:p-9 shadow-2xl">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* Top Match Meta */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                  Official Match Report
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {match.format} • {match.totalOvers} Overs Limited Match
                </span>
              </div>

              <div className="text-xs text-slate-400 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {match.venue}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {match.date}
                </span>
              </div>
            </div>

            {/* Victory Headline Announcement */}
            <div className="text-center sm:text-left space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-400">
                Match Result
              </span>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white font-display tracking-tight leading-tight">
                {match.result || (match.status === 'live' ? 'Match In Progress' : 'Innings Completed')}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                Toss won by <strong className="text-white">{match.toss.winnerName}</strong> who elected to{' '}
                <strong className="text-emerald-400">{match.toss.decision === 'bat' ? 'Bat First' : 'Bowl First'}</strong>.
              </p>
            </div>

            {/* Comparative Dual Team Scorecards Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* 1st Innings Box */}
              <div
                onClick={() => setActiveTab('innings1')}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  activeTab === 'innings1'
                    ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-emerald-500/80 shadow-xl shadow-emerald-950/40 ring-1 ring-emerald-500/40'
                    : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-4 h-4 rounded-full shadow-md"
                      style={{ backgroundColor: match.teamA.color || '#10b981' }}
                    />
                    <h3 className="text-base font-extrabold text-white font-display uppercase">
                      {innings1?.battingTeamName}
                    </h3>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 uppercase tracking-wider">
                    1st Innings
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-4xl sm:text-5xl font-black font-digit text-white">
                      {innings1?.totalRuns}
                      <span className="text-emerald-400 font-light">/</span>
                      {innings1?.wickets}
                    </span>
                    <span className="text-sm font-bold text-slate-400 font-digit ml-2">
                      ({formatOvers(innings1?.validBalls)} ov)
                    </span>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Run Rate</p>
                    <p className="text-base font-black font-digit text-emerald-400">
                      {calculateCRR(innings1?.totalRuns, innings1?.validBalls)}
                    </p>
                  </div>
                </div>
              </div>

              {/* 2nd Innings Box */}
              {innings2 ? (
                <div
                  onClick={() => setActiveTab('innings2')}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    activeTab === 'innings2'
                      ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-emerald-500/80 shadow-xl shadow-emerald-950/40 ring-1 ring-emerald-500/40'
                      : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-4 h-4 rounded-full shadow-md"
                        style={{ backgroundColor: match.teamB.color || '#3b82f6' }}
                      />
                      <h3 className="text-base font-extrabold text-white font-display uppercase">
                        {innings2.battingTeamName}
                      </h3>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 uppercase tracking-wider">
                      2nd Innings (Target: {innings2.target})
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-4xl sm:text-5xl font-black font-digit text-white">
                        {innings2.totalRuns}
                        <span className="text-emerald-400 font-light">/</span>
                        {innings2.wickets}
                      </span>
                      <span className="text-sm font-bold text-slate-400 font-digit ml-2">
                        ({formatOvers(innings2.validBalls)} ov)
                      </span>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-slate-500">Run Rate</p>
                      <p className="text-base font-black font-digit text-emerald-400">
                        {calculateCRR(innings2.totalRuns, innings2.validBalls)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 flex items-center justify-center text-xs text-slate-500 italic">
                  2nd Innings has not commenced yet.
                </div>
              )}
            </div>

            {/* Top Match Performers Badges */}
            {(topBatter || topBowler) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {topBatter && topBatter.runs > 0 && (
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold">
                        🏏
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-extrabold text-amber-400 tracking-wider">
                          Top Batter of the Match
                        </p>
                        <h4 className="font-bold text-white text-sm mt-0.5">{topBatter.name}</h4>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {topBatter.runs} runs ({topBatter.balls}b • {topBatter.fours}x4 • {topBatter.sixes}x6)
                        </p>
                      </div>
                    </div>
                    <span className="text-base font-black font-digit text-amber-400">
                      SR {calculateStrikeRate(topBatter.runs, topBatter.balls)}
                    </span>
                  </div>
                )}

                {topBowler && (topBowler.wickets > 0 || topBowler.balls > 0) && (
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center font-bold">
                        ⚾
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-extrabold text-sky-400 tracking-wider">
                          Top Bowler of the Match
                        </p>
                        <h4 className="font-bold text-white text-sm mt-0.5">{topBowler.name}</h4>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {topBowler.wickets} wkts • {topBowler.runsConceded} runs ({formatOvers(topBowler.balls)} ov)
                        </p>
                      </div>
                    </div>
                    <span className="text-base font-black font-digit text-sky-400">
                      Econ {calculateEconomy(topBowler.runsConceded, topBowler.balls)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* INNINGS TABS NAVIGATION */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 no-print">
          <button
            onClick={() => setActiveTab('innings1')}
            className={`flex-1 py-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'innings1'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>1st Innings: {innings1?.battingTeamName}</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-950/60 text-slate-200 font-digit text-[11px]">
              {innings1?.totalRuns}/{innings1?.wickets} ({formatOvers(innings1?.validBalls)} ov)
            </span>
          </button>

          {innings2 && (
            <button
              onClick={() => setActiveTab('innings2')}
              className={`flex-1 py-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'innings2'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>2nd Innings: {innings2.battingTeamName}</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-950/60 text-slate-200 font-digit text-[11px]">
                {innings2.totalRuns}/{innings2.wickets} ({formatOvers(innings2.validBalls)} ov)
              </span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('partnerships')}
            className={`px-5 py-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'partnerships'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Partnerships & FoW</span>
          </button>
        </div>

        {/* ACTIVE INNINGS SCORECARD VIEWS */}
        {activeTab !== 'partnerships' && activeInningsData && (
          <div className="space-y-6">
            {/* Batting Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-xl font-extrabold text-white font-display uppercase tracking-tight">
                    {activeInningsData.battingTeamName} Batting Scorecard
                  </h3>
                  <p className="text-xs text-slate-400">
                    Innings {activeInningNumber} • Run Rate: {calculateCRR(activeInningsData.totalRuns, activeInningsData.validBalls)}
                  </p>
                </div>

                <div className="flex items-center gap-2 font-digit">
                  <span className="text-3xl font-black text-emerald-400">
                    {activeInningsData.totalRuns}
                    <span className="text-slate-500 font-light">/</span>
                    {activeInningsData.wickets}
                  </span>
                  <span className="text-sm font-bold text-slate-400">
                    ({formatOvers(activeInningsData.validBalls)} Overs)
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider">
                      <th className="pb-3 pl-3">Batter</th>
                      <th className="pb-3">Dismissal</th>
                      <th className="pb-3 text-right">R</th>
                      <th className="pb-3 text-right">B</th>
                      <th className="pb-3 text-right">4s</th>
                      <th className="pb-3 text-right">6s</th>
                      <th className="pb-3 text-right pr-3">SR</th>
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

                      const isHighSR = parseFloat(sr) >= 150 && b.balls >= 6;

                      return (
                        <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 pl-3">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-100">{b.name}</span>
                              {b.isBatting && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500 text-slate-950">
                                  NOT OUT *
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 text-xs text-slate-400 font-mono">
                            {dismissalText === 'not out' || dismissalText === 'batting *' ? (
                              <span className="text-emerald-400 font-bold">not out</span>
                            ) : (
                              <span>{dismissalText}</span>
                            )}
                          </td>
                          <td className="py-3 text-right font-digit text-lg font-black text-emerald-400">
                            {b.runs}
                          </td>
                          <td className="py-3 text-right font-digit text-slate-300 text-sm">
                            {b.balls}
                          </td>
                          <td className="py-3 text-right font-digit text-slate-400 text-sm font-semibold">
                            {b.fours}
                          </td>
                          <td className="py-3 text-right font-digit text-slate-400 text-sm font-semibold">
                            {b.sixes}
                          </td>
                          <td className="py-3 text-right font-digit font-bold text-slate-200 text-sm pr-3">
                            <span className={isHighSR ? 'text-amber-400 font-black' : ''}>
                              {sr}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Extras & Summary Footer Bar */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <p className="font-semibold text-slate-300">
                    Extras:{' '}
                    <strong className="text-white font-digit text-sm">{activeInningsData.extras?.total || 0}</strong>{' '}
                    <span className="text-slate-500 font-mono text-[11px]">
                      (wd {activeInningsData.extras?.wides || 0}, nb {activeInningsData.extras?.noBalls || 0}, b {activeInningsData.extras?.byes || 0}, lb {activeInningsData.extras?.legByes || 0})
                    </span>
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[11px] uppercase font-bold text-slate-400">Total Innings Score</p>
                  <p className="text-xl font-black font-digit text-white">
                    {activeInningsData.totalRuns}/{activeInningsData.wickets}{' '}
                    <span className="text-sm font-semibold text-slate-400 font-mono">
                      ({formatOvers(activeInningsData.validBalls)} ov, CRR: {calculateCRR(activeInningsData.totalRuns, activeInningsData.validBalls)})
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Bowling Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-xl font-extrabold text-white font-display uppercase tracking-tight">
                    {activeInningsData.bowlingTeamName} Bowling Figures
                  </h3>
                  <p className="text-xs text-slate-400">
                    Wickets, Runs Conceded & Economy Rates
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider">
                      <th className="pb-3 pl-3">Bowler</th>
                      <th className="pb-3 text-right">O</th>
                      <th className="pb-3 text-right">M</th>
                      <th className="pb-3 text-right">R</th>
                      <th className="pb-3 text-right">W</th>
                      <th className="pb-3 text-right">Dots</th>
                      <th className="pb-3 text-right pr-3">Econ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {activeInningsData.bowlers
                      .filter((bw) => bw.balls > 0 || bw.runsConceded > 0 || bw.wickets > 0)
                      .map((bw, idx) => {
                        const overs = formatOvers(bw.balls);
                        const econ = calculateEconomy(bw.runsConceded, bw.balls);
                        const isGreatEcon = parseFloat(econ) <= 6.0 && bw.balls >= 6;

                        return (
                          <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-3 pl-3 font-bold text-sm text-slate-100">
                              {bw.name}
                            </td>
                            <td className="py-3 text-right font-digit text-slate-200 text-sm font-semibold">
                              {overs}
                            </td>
                            <td className="py-3 text-right font-digit text-slate-400 text-sm font-semibold">
                              {bw.maidens}
                            </td>
                            <td className="py-3 text-right font-digit text-amber-400 text-sm font-bold">
                              {bw.runsConceded}
                            </td>
                            <td className="py-3 text-right font-digit text-lg font-black text-emerald-400">
                              {bw.wickets}
                            </td>
                            <td className="py-3 text-right font-digit text-slate-400 text-sm">
                              {bw.dots || 0}
                            </td>
                            <td className="py-3 text-right font-digit font-bold text-sm pr-3">
                              <span className={isGreatEcon ? 'text-emerald-400 font-black' : 'text-sky-300'}>
                                {econ}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PARTNERSHIPS & FALL OF WICKETS VIEW */}
        {activeTab === 'partnerships' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fall of Wickets 1st Innings */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-lg font-extrabold text-white font-display uppercase tracking-tight pb-3 border-b border-slate-800 flex items-center justify-between">
                <span>Fall of Wickets ({innings1?.battingTeamName})</span>
                <span className="text-xs font-digit text-emerald-400 font-bold">
                  {innings1?.wickets} Wickets Fallen
                </span>
              </h3>

              {innings1?.fallOfWickets?.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4">No wickets lost in 1st innings.</p>
              ) : (
                <div className="space-y-2.5">
                  {innings1?.fallOfWickets?.map((fow, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-red-950 text-red-400 border border-red-800/60 font-digit font-black text-xs flex items-center justify-center shrink-0">
                          W{fow.wicketNumber}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-white">
                            {fow.score}/{fow.wicketNumber}{' '}
                            <span className="text-xs text-slate-400 font-normal">
                              ({fow.playerOutName})
                            </span>
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            b {fow.bowlerName}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-digit font-bold text-emerald-400 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800">
                        {fow.overs} ov
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Fall of Wickets 2nd Innings */}
            {innings2 && (
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                <h3 className="text-lg font-extrabold text-white font-display uppercase tracking-tight pb-3 border-b border-slate-800 flex items-center justify-between">
                  <span>Fall of Wickets ({innings2.battingTeamName})</span>
                  <span className="text-xs font-digit text-emerald-400 font-bold">
                    {innings2.wickets} Wickets Fallen
                  </span>
                </h3>

                {innings2.fallOfWickets?.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-4">No wickets lost in 2nd innings.</p>
                ) : (
                  <div className="space-y-2.5">
                    {innings2.fallOfWickets?.map((fow, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl bg-red-950 text-red-400 border border-red-800/60 font-digit font-black text-xs flex items-center justify-center shrink-0">
                            W{fow.wicketNumber}
                          </span>
                          <div>
                            <p className="text-sm font-bold text-white">
                              {fow.score}/{fow.wicketNumber}{' '}
                              <span className="text-xs text-slate-400 font-normal">
                                ({fow.playerOutName})
                              </span>
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              b {fow.bowlerName}
                            </p>
                          </div>
                        </div>

                        <span className="text-xs font-digit font-bold text-emerald-400 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800">
                          {fow.overs} ov
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* OFFICIAL UMPIRE VERIFICATION SEAL */}
        <div className="p-4 sm:p-6 rounded-3xl bg-slate-950/90 border border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white font-display">
                Certified Official Match Record
              </p>
              <p className="text-[11px] text-slate-400">
                Scored by {user?.user_metadata?.name || 'Lead Umpire'} ({user?.user_metadata?.role || 'Official Scorer'})
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">
              Digital Signature Verified
            </span>
            <span className="text-xs font-mono font-semibold text-emerald-400">
              CricUmpire Pro System
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
