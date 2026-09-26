import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Download,
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
  CheckCircle2,
  X,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { useMatch } from '../../context/MatchContext';
import { useAuth } from '../../context/AuthContext';
import { formatOvers, calculateEconomy, calculateStrikeRate, calculateCRR } from '../../lib/cricketEngine';

export default function MatchSummary({ onNavigateToScoring }) {
  const { match } = useMatch();
  const { user } = useAuth();
  const scorecardRef = useRef(null);
  const pdfPrintRef = useRef(null);

  const [activeTab, setActiveTab] = useState('full'); // 'full' | 'innings1' | 'innings2' | 'partnerships'
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [exportStatus, setExportStatus] = useState(null);

  if (!match) {
    return (
      <div className="text-center py-20 text-slate-400 font-sans">
        <Trophy className="w-14 h-14 mx-auto mb-3 text-slate-600 animate-pulse" />
        <h3 className="text-xl font-bold text-slate-200 font-display">No Match Selected</h3>
        <p className="text-xs text-slate-400 mt-1">Please select or start a match from the Dashboard.</p>
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

  // Export High-Resolution Multi-Page PDF using Dedicated Official Print Template
  const handleExportPDF = async () => {
    if (!pdfPrintRef.current) return;
    setIsExportingPDF(true);
    setExportStatus(null);

    try {
      const element = pdfPrintRef.current;
      const canvas = await html2canvas(element, {
        scale: 2.2, // High-DPI crystal clear typography
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        windowWidth: 850,
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const pdfHeight = 297;
      
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      if (imgHeight <= pdfHeight) {
        // Fits on a single A4 page
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight, undefined, 'FAST');
      } else {
        // Multi-page clean slicing on pure white canvas
        const pageCanvasHeight = Math.floor((canvas.width * pdfHeight) / pdfWidth);
        const totalPages = Math.ceil(canvas.height / pageCanvasHeight);

        for (let p = 0; p < totalPages; p++) {
          if (p > 0) pdf.addPage();

          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = pageCanvasHeight;

          const ctx = pageCanvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

          const sourceY = p * pageCanvasHeight;
          const sourceH = Math.min(pageCanvasHeight, canvas.height - sourceY);

          ctx.drawImage(
            canvas,
            0, sourceY, canvas.width, sourceH,
            0, 0, canvas.width, sourceH
          );

          const pageDataUrl = pageCanvas.toDataURL('image/png');
          pdf.addImage(pageDataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
        }
      }

      const cleanA = (match.teamA?.name || 'TeamA').replace(/\s+/g, '_');
      const cleanB = (match.teamB?.name || 'TeamB').replace(/\s+/g, '_');
      const filename = `${cleanA}_vs_${cleanB}_Official_Scorecard.pdf`;

      pdf.save(filename);

      let blobUrl = null;
      try {
        const pdfBlob = pdf.output('blob');
        blobUrl = URL.createObjectURL(pdfBlob);
      } catch (previewErr) {
        console.warn('Could not generate blob URL:', previewErr);
      }

      setExportStatus({
        type: 'success',
        text: `Official Scorecard PDF downloaded successfully! Saved as ${filename}`,
        previewUrl: blobUrl,
      });
      setTimeout(() => setExportStatus(null), 12000);
    } catch (err) {
      console.error('PDF export error:', err);
      setExportStatus({
        type: 'error',
        text: 'PDF generation encountered an error. Please try again.',
      });
      setTimeout(() => setExportStatus(null), 8000);
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 font-sans">
      {/* Top Action Toolbar (Liquid Glass Bar) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl glass-panel border border-white/[0.12] shadow-lg no-print">
        <div className="flex items-center gap-2">
          {match.status === 'live' && (
            <button
              onClick={onNavigateToScoring}
              className="liquid-btn liquid-btn-primary w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-xl sm:rounded-2xl font-bold text-xs flex items-center justify-center gap-2"
            >
              <Activity className="w-3.5 h-3.5 animate-pulse text-cyan-200" />
              <span>Resume Live Scoring</span>
            </button>
          )}
        </div>

        {/* Unified Scorecard PDF Download Button */}
        <div className="flex items-center gap-2 text-xs font-semibold w-full sm:w-auto">
          <button
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            className="liquid-btn liquid-btn-primary w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-cyan-500/20 text-white disabled:opacity-40"
          >
            <Download className="w-4 h-4 text-cyan-200" />
            <span>{isExportingPDF ? 'Generating Scorecard PDF...' : 'Download Scorecard (PDF)'}</span>
          </button>
        </div>
      </div>

      {/* Export Status Feedback Banner */}
      {exportStatus && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-3xl border flex flex-wrap items-center justify-between gap-3 text-xs font-sans font-medium no-print shadow-xl ${
            exportStatus.type === 'error'
              ? 'bg-rose-500/20 border-rose-400/40 text-rose-200'
              : 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2.5 flex-1 min-w-[240px]">
            {exportStatus.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <span className="leading-relaxed">{exportStatus.text}</span>
          </div>

          <div className="flex items-center gap-2">
            {exportStatus.previewUrl && (
              <a
                href={exportStatus.previewUrl}
                target="_blank"
                rel="noreferrer"
                className="liquid-btn liquid-btn-primary px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0"
              >
                <span>Open PDF in Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {exportStatus.type === 'error' && (
              <button
                type="button"
                onClick={handlePrint}
                className="liquid-btn liquid-btn-primary px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Open Print to PDF</span>
              </button>
            )}

            <button
              onClick={() => setExportStatus(null)}
              className="liquid-btn-icon w-7 h-7 rounded-xl text-slate-400 hover:text-white shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Printable Scorecard Wrapper */}
      <div ref={scorecardRef} className="space-y-6">
        {/* GRAND VICTORY & MATCH HEADER HERO */}
        <div className="relative overflow-hidden rounded-3xl glass-panel border border-white/[0.14] p-6 sm:p-9 shadow-2xl">
          {/* Ambient Radial Glass Glow */}
          <div className="absolute -right-16 -top-16 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* Top Match Meta */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-400/30 flex items-center gap-1.5 shadow-sm">
                  <Trophy className="w-3.5 h-3.5 text-cyan-400" />
                  Official Match Report
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  {match.format} • {match.totalOvers} Overs Limited Match
                </span>
              </div>

              <div className="text-xs text-slate-300 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  {match.venue}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  {match.date}
                </span>
              </div>
            </div>

            {/* Victory Headline Announcement */}
            <div className="text-center sm:text-left space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-300">
                Match Result
              </span>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white font-display tracking-tight leading-tight">
                {match.result || (match.status === 'live' ? 'Match In Progress' : 'Innings Completed')}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                Toss won by <strong className="text-white">{match.toss.winnerName}</strong> who elected to{' '}
                <strong className="text-cyan-300">{match.toss.decision === 'bat' ? 'Bat First' : 'Bowl First'}</strong>.
              </p>
            </div>

            {/* Comparative Dual Team Scorecards Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* 1st Innings Box */}
              <div
                onClick={() => setActiveTab('innings1')}
                className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  activeTab === 'innings1'
                    ? 'bg-gradient-to-br from-cyan-500/20 via-white/[0.04] to-transparent border-cyan-400/60 shadow-xl shadow-cyan-500/15'
                    : 'bg-white/[0.03] border-white/[0.08] hover:border-white/20'
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
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/[0.06] text-slate-200 uppercase tracking-wider border border-white/[0.08]">
                    1st Innings
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-4xl sm:text-5xl font-black font-digit text-white">
                      {innings1?.totalRuns}
                      <span className="text-rose-400 font-light mx-1">/</span>
                      {innings1?.wickets}
                    </span>
                    <span className="text-sm font-bold text-slate-400 font-digit ml-2">
                      ({formatOvers(innings1?.validBalls)} ov)
                    </span>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Run Rate</p>
                    <p className="text-base font-black font-digit text-cyan-300">
                      {calculateCRR(innings1?.totalRuns, innings1?.validBalls)}
                    </p>
                  </div>
                </div>
              </div>

              {/* 2nd Innings Box */}
              {innings2 ? (
                <div
                  onClick={() => setActiveTab('innings2')}
                  className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    activeTab === 'innings2'
                      ? 'bg-gradient-to-br from-purple-500/20 via-white/[0.04] to-transparent border-purple-400/60 shadow-xl shadow-purple-500/15'
                      : 'bg-white/[0.03] border-white/[0.08] hover:border-white/20'
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
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/[0.06] text-slate-200 uppercase tracking-wider border border-white/[0.08]">
                      2nd Innings (Target: {innings2.target})
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-4xl sm:text-5xl font-black font-digit text-white">
                        {innings2.totalRuns}
                        <span className="text-rose-400 font-light mx-1">/</span>
                        {innings2.wickets}
                      </span>
                      <span className="text-sm font-bold text-slate-400 font-digit ml-2">
                        ({formatOvers(innings2.validBalls)} ov)
                      </span>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Run Rate</p>
                      <p className="text-base font-black font-digit text-purple-300">
                        {calculateCRR(innings2.totalRuns, innings2.validBalls)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.02] flex items-center justify-center text-xs text-slate-400 italic">
                  2nd Innings has not commenced yet.
                </div>
              )}
            </div>

            {/* Top Match Performers Badges */}
            {(topBatter || topBowler) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {topBatter && topBatter.runs > 0 && (
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-amber-400/30 backdrop-blur-xl flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center justify-center font-bold text-lg">
                        🏏
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">
                          Top Batter of the Match
                        </p>
                        <h4 className="font-bold text-white text-sm mt-0.5">{topBatter.name}</h4>
                        <p className="text-xs text-slate-300 font-digit">
                          {topBatter.runs} runs ({topBatter.balls}b • {topBatter.fours}x4 • {topBatter.sixes}x6)
                        </p>
                      </div>
                    </div>
                    <span className="text-base font-bold font-digit text-amber-300">
                      SR {calculateStrikeRate(topBatter.runs, topBatter.balls)}
                    </span>
                  </div>
                )}

                {topBowler && (topBowler.wickets > 0 || topBowler.balls > 0) && (
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-cyan-400/30 backdrop-blur-xl flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 flex items-center justify-center font-bold text-lg">
                        ⚾
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-cyan-300 tracking-wider">
                          Top Bowler of the Match
                        </p>
                        <h4 className="font-bold text-white text-sm mt-0.5">{topBowler.name}</h4>
                        <p className="text-xs text-slate-300 font-digit">
                          {topBowler.wickets} wkts • {topBowler.runsConceded} runs ({formatOvers(topBowler.balls)} ov)
                        </p>
                      </div>
                    </div>
                    <span className="text-base font-bold font-digit text-cyan-300">
                      Econ {calculateEconomy(topBowler.runsConceded, topBowler.balls)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* INNINGS TABS NAVIGATION (Liquid Glass Pill Bar) */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl glass-panel border border-white/[0.08] no-print">
          <button
            onClick={() => setActiveTab('full')}
            className={`liquid-btn flex-1 py-2 sm:py-3 px-2.5 sm:px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 min-w-[110px] sm:min-w-[140px] ${
              activeTab === 'full'
                ? 'liquid-btn-primary'
                : 'liquid-btn-secondary'
            }`}
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span>Both Innings</span>
          </button>

          <button
            onClick={() => setActiveTab('innings1')}
            className={`liquid-btn flex-1 py-2 sm:py-3 px-2.5 sm:px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 min-w-[110px] sm:min-w-[140px] ${
              activeTab === 'innings1'
                ? 'liquid-btn-primary'
                : 'liquid-btn-secondary'
            }`}
          >
            <span className="truncate">1st: {innings1?.battingTeamName}</span>
            <span className="px-1.5 py-0.5 rounded-full bg-white/[0.08] text-slate-200 font-digit text-[10px] sm:text-[11px] shrink-0">
              {innings1?.totalRuns}/{innings1?.wickets}
            </span>
          </button>

          {innings2 && (
            <button
              onClick={() => setActiveTab('innings2')}
              className={`liquid-btn flex-1 py-2 sm:py-3 px-2.5 sm:px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 min-w-[110px] sm:min-w-[140px] ${
                activeTab === 'innings2'
                  ? 'liquid-btn-primary'
                  : 'liquid-btn-secondary'
              }`}
            >
              <span className="truncate">2nd: {innings2.battingTeamName}</span>
              <span className="px-1.5 py-0.5 rounded-full bg-white/[0.08] text-slate-200 font-digit text-[10px] sm:text-[11px] shrink-0">
                {innings2.totalRuns}/{innings2.wickets}
              </span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('partnerships')}
            className={`liquid-btn px-3.5 sm:px-5 py-2 sm:py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
              activeTab === 'partnerships'
                ? 'liquid-btn-amber'
                : 'liquid-btn-secondary'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-amber-300" />
            <span>Wickets</span>
          </button>
        </div>

        {/* 1. FULL SCORECARD VIEW (BOTH INNINGS + COMPLETE MATCH REPORT) */}
        {activeTab === 'full' && (
          <div className="space-y-8">
            <InningsScorecardSection innings={innings1} inningsNumber={1} />
            {innings2 && (
              <InningsScorecardSection innings={innings2} inningsNumber={2} />
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FallOfWicketsCard innings={innings1} />
              {innings2 && <FallOfWicketsCard innings={innings2} />}
            </div>
          </div>
        )}

        {/* 2. 1ST INNINGS ONLY VIEW */}
        {activeTab === 'innings1' && (
          <div className="space-y-6">
            <InningsScorecardSection innings={innings1} inningsNumber={1} />
            <FallOfWicketsCard innings={innings1} />
          </div>
        )}

        {/* 3. 2ND INNINGS ONLY VIEW */}
        {activeTab === 'innings2' && innings2 && (
          <div className="space-y-6">
            <InningsScorecardSection innings={innings2} inningsNumber={2} />
            <FallOfWicketsCard innings={innings2} />
          </div>
        )}

        {/* 4. PARTNERSHIPS & FALL OF WICKETS VIEW */}
        {activeTab === 'partnerships' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FallOfWicketsCard innings={innings1} />
            {innings2 && <FallOfWicketsCard innings={innings2} />}
          </div>
        )}

        {/* OFFICIAL UMPIRE VERIFICATION SEAL */}
        <div className="p-4 sm:p-6 rounded-3xl glass-panel border border-white/[0.12] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white font-display">
                Certified Official Match Record
              </p>
              <p className="text-[11px] text-slate-300">
                Official Umpire: {user?.user_metadata?.name || 'Nitin Menon'} (ICC Elite Panel)
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
              Digital Signature Verified
            </span>
            <span className="text-xs font-semibold text-cyan-300">
              Umpire Nitin Menon System
            </span>
          </div>
        </div>
      </div>

      {/* OFF-SCREEN HIGH-RESOLUTION OFFICIAL SCORECARD PDF TEMPLATE */}
      <div
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '800px',
          zIndex: -999,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
        aria-hidden="true"
      >
        <OfficialScorecardPrintTemplate
          ref={pdfPrintRef}
          match={match}
          innings1={innings1}
          innings2={innings2}
          topBatter={topBatter}
          topBowler={topBowler}
          umpireName={user?.user_metadata?.name || 'Nitin Menon'}
        />
      </div>
    </div>
  );
}

// Subcomponent: Complete Innings Scorecard (Batting + Extras + Total + Bowling)
function InningsScorecardSection({ innings, inningsNumber }) {
  if (!innings) return null;

  return (
    <div className="space-y-6">
      {/* Batting Card */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/[0.12] shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
          <div>
            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              Innings {inningsNumber}
            </span>
            <h3 className="text-xl font-bold text-white font-display uppercase tracking-tight mt-1">
              {innings.battingTeamName} Batting Scorecard
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Run Rate: <strong className="text-white font-digit">{calculateCRR(innings.totalRuns, innings.validBalls)}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 font-digit">
            <span className="text-3xl font-black text-amber-300">
              {innings.totalRuns}
              <span className="text-rose-400 font-light mx-1">/</span>
              {innings.wickets}
            </span>
            <span className="text-sm font-bold text-slate-300">
              ({formatOvers(innings.validBalls)} Overs)
            </span>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-thin -mx-2 px-2 sm:mx-0 sm:px-0">
          <table className="w-full text-left text-xs min-w-[500px]">
            <thead>
              <tr className="text-slate-300 border-b border-white/[0.12] text-[11px] font-bold uppercase tracking-wider bg-white/[0.02]">
                <th className="py-2.5 pl-3 sticky left-0 bg-[#060919]/95 backdrop-blur-md z-10">Batter</th>
                <th className="py-2.5">Dismissal</th>
                <th className="py-2.5 text-right font-digit">R</th>
                <th className="py-2.5 text-right font-digit">B</th>
                <th className="py-2.5 text-right font-digit">4s</th>
                <th className="py-2.5 text-right font-digit">6s</th>
                <th className="py-2.5 text-right font-digit pr-3">SR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {innings.batsmen.map((b, idx) => {
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
                  <tr key={idx} className="hover:bg-white/[0.04] transition-colors">
                    <td className="py-3 pl-3 sticky left-0 bg-[#060919]/95 backdrop-blur-md z-10 min-w-[140px]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white font-display truncate">{b.name}</span>
                        {b.isBatting && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-cyan-400 text-slate-950">
                            NOT OUT *
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-xs text-slate-300">
                      {dismissalText === 'not out' || dismissalText === 'batting *' ? (
                        <span className="text-emerald-400 font-bold">not out</span>
                      ) : (
                        <span>{dismissalText}</span>
                      )}
                    </td>
                    <td className="py-3 text-right font-digit text-lg font-black text-amber-300">
                      {b.runs}
                    </td>
                    <td className="py-3 text-right font-digit text-slate-200 text-sm font-semibold">
                      {b.balls}
                    </td>
                    <td className="py-3 text-right font-digit text-slate-300 text-sm font-medium">
                      {b.fours}
                    </td>
                    <td className="py-3 text-right font-digit text-slate-300 text-sm font-medium">
                      {b.sixes}
                    </td>
                    <td className="py-3 text-right font-digit font-bold text-slate-100 text-sm pr-3">
                      <span className={isHighSR ? 'text-amber-400 font-black' : 'text-cyan-300'}>
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
        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.1] backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <p className="font-semibold text-slate-200">
              Extras:{' '}
              <strong className="text-white font-digit text-sm font-black">{innings.extras?.total || 0}</strong>{' '}
              <span className="text-slate-300 text-[11px]">
                (wd {innings.extras?.wides || 0}, nb {innings.extras?.noBalls || 0}, b {innings.extras?.byes || 0}, lb {innings.extras?.legByes || 0})
              </span>
            </p>
          </div>

          <div className="text-right">
            <p className="text-[11px] uppercase font-bold text-slate-300">Total Innings Score</p>
            <p className="text-2xl font-black font-digit text-white">
              {innings.totalRuns}/{innings.wickets}{' '}
              <span className="text-sm font-semibold text-slate-300">
                ({formatOvers(innings.validBalls)} ov, CRR: {calculateCRR(innings.totalRuns, innings.validBalls)})
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Bowling Card */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/[0.12] shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div>
            <h3 className="text-xl font-bold text-white font-display uppercase tracking-tight">
              {innings.bowlingTeamName} Bowling Figures
            </h3>
            <p className="text-xs text-slate-300">
              Wickets, Runs Conceded & Economy Rates
            </p>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-thin -mx-2 px-2 sm:mx-0 sm:px-0">
          <table className="w-full text-left text-xs min-w-[420px]">
            <thead>
              <tr className="text-slate-300 border-b border-white/[0.12] text-[11px] font-bold uppercase tracking-wider bg-white/[0.02]">
                <th className="py-2.5 pl-3 sticky left-0 bg-[#060919]/95 backdrop-blur-md z-10">Bowler</th>
                <th className="py-2.5 text-right">O</th>
                <th className="py-2.5 text-right">M</th>
                <th className="py-2.5 text-right">R</th>
                <th className="py-2.5 text-right">W</th>
                <th className="py-2.5 text-right">Dots</th>
                <th className="py-2.5 text-right pr-3">Econ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {innings.bowlers
                .filter((bw) => bw.balls > 0 || bw.runsConceded > 0 || bw.wickets > 0)
                .map((bw, idx) => {
                  const overs = formatOvers(bw.balls);
                  const econ = calculateEconomy(bw.runsConceded, bw.balls);
                  const isGreatEcon = parseFloat(econ) <= 6.0 && bw.balls >= 6;

                  return (
                    <tr key={idx} className="hover:bg-white/[0.04] transition-colors">
                      <td className="py-3 pl-3 font-bold text-sm text-white font-display sticky left-0 bg-[#060919]/95 backdrop-blur-md z-10 min-w-[120px] truncate">
                        {bw.name}
                      </td>
                      <td className="py-3 text-right font-digit text-slate-100 text-sm font-semibold">
                        {overs}
                      </td>
                      <td className="py-3 text-right font-digit text-slate-300 text-sm font-medium">
                        {bw.maidens}
                      </td>
                      <td className="py-3 text-right font-digit text-amber-300 text-sm font-bold">
                        {bw.runsConceded}
                      </td>
                      <td className="py-3 text-right font-digit text-lg font-black text-rose-400">
                        {bw.wickets}
                      </td>
                      <td className="py-3 text-right font-digit text-slate-300 text-sm">
                        {bw.dots || 0}
                      </td>
                      <td className="py-3 text-right font-digit font-bold text-sm pr-3">
                        <span className={isGreatEcon ? 'text-emerald-400 font-black' : 'text-cyan-300'}>
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
  );
}

// Subcomponent: Fall of Wickets Card
function FallOfWicketsCard({ innings }) {
  if (!innings) return null;

  return (
    <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/[0.12] shadow-xl space-y-4">
      <h3 className="text-lg font-bold text-white font-display uppercase tracking-tight pb-3 border-b border-white/[0.08] flex items-center justify-between">
        <span>Fall of Wickets ({innings.battingTeamName})</span>
        <span className="text-xs font-digit text-cyan-300 font-bold">
          {innings.wickets} Wickets Fallen
        </span>
      </h3>

      {!innings.fallOfWickets || innings.fallOfWickets.length === 0 ? (
        <p className="text-xs text-slate-300 italic py-4">No wickets lost in this innings.</p>
      ) : (
        <div className="space-y-2.5">
          {innings.fallOfWickets.map((fow, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.1] flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-400/30 font-digit font-black text-xs flex items-center justify-center shrink-0">
                  W{fow.wicketNumber}
                </span>
                <div>
                  <p className="text-sm font-bold text-white">
                    {fow.score}/{fow.wicketNumber}{' '}
                    <span className="text-xs text-slate-300 font-normal">
                      ({fow.playerOutName})
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-300">
                    b {fow.bowlerName}
                  </p>
                </div>
              </div>

              <span className="text-xs font-digit font-bold text-cyan-300 px-3 py-1 rounded-xl bg-white/[0.06] border border-white/[0.1]">
                {fow.overs} ov
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Subcomponent: Dedicated High-Resolution Printable Official Scorecard Template
const OfficialScorecardPrintTemplate = React.forwardRef(
  ({ match, innings1, innings2, topBatter, topBowler, umpireName }, ref) => {
    if (!match) return null;

    const teamAName = match.teamA?.name || 'Team A';
    const teamBName = match.teamB?.name || 'Team B';

    return (
      <div
        ref={ref}
        style={{
          width: '800px',
          backgroundColor: '#ffffff',
          color: '#0f172a',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          padding: '36px 40px',
          boxSizing: 'border-box',
          lineHeight: '1.4',
        }}
      >
        {/* 1. OFFICIAL TOURNAMENT HEADER */}
        <div
          style={{
            backgroundColor: '#0f172a',
            color: '#ffffff',
            borderRadius: '12px',
            padding: '24px 28px',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '800',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  color: '#38bdf8',
                  display: 'block',
                }}
              >
                CRICSCORE • OFFICIAL MATCH SCORECARD
              </span>
              <h1 style={{ fontSize: '26px', fontWeight: '900', margin: '4px 0 0 0', letterSpacing: '-0.5px' }}>
                {teamAName} <span style={{ color: '#94a3b8', fontWeight: '400' }}>vs</span> {teamBName}
              </h1>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span
                style={{
                  display: 'inline-block',
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '20px',
                  padding: '4px 12px',
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#f8fafc',
                }}
              >
                {match.format || 'T20'} • {match.totalOvers} Overs
              </span>
            </div>
          </div>

          {/* Match Meta Information */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              fontSize: '12px',
              color: '#cbd5e1',
              paddingTop: '12px',
              borderTop: '1px solid #334155',
              marginBottom: '16px',
            }}
          >
            <span>📍 <strong>Venue:</strong> {match.venue || 'Stadium'}</span>
            <span>📅 <strong>Date:</strong> {match.date || 'Today'}</span>
            <span>🪙 <strong>Toss:</strong> Won by <strong>{match.toss?.winnerName}</strong> (elected to {match.toss?.decision === 'bat' ? 'Bat First' : 'Bowl First'})</span>
          </div>

          {/* Victory / Result Announcement Ribbon */}
          <div
            style={{
              backgroundColor: '#059669',
              color: '#ffffff',
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: '800',
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>🏆 RESULT: {match.result || (match.status === 'live' ? 'MATCH IN PROGRESS' : 'INNINGS COMPLETED')}</span>
            <span style={{ fontSize: '11px', fontWeight: '600', opacity: 0.9 }}>VERIFIED OFFICIAL</span>
          </div>
        </div>

        {/* 2. MATCH SNAPSHOT SUMMARY (DUAL INNINGS BOXES) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          {/* Innings 1 Summary Card */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '14px 18px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <strong style={{ fontSize: '14px', color: '#0f172a', textTransform: 'uppercase' }}>
                1st Inn: {innings1?.battingTeamName || teamAName}
              </strong>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>
                CRR: {calculateCRR(innings1?.totalRuns, innings1?.validBalls)}
              </span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>
              {innings1?.totalRuns || 0}/{innings1?.wickets || 0}{' '}
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>
                ({formatOvers(innings1?.validBalls)} / {match.totalOvers} ov)
              </span>
            </div>
          </div>

          {/* Innings 2 Summary Card */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '14px 18px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <strong style={{ fontSize: '14px', color: '#0f172a', textTransform: 'uppercase' }}>
                2nd Inn: {innings2?.battingTeamName || teamBName}
              </strong>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>
                {innings2?.target ? `Target: ${innings2.target}` : '2nd Innings'}
              </span>
            </div>
            {innings2 ? (
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>
                {innings2.totalRuns || 0}/{innings2.wickets || 0}{' '}
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>
                  ({formatOvers(innings2.validBalls)} / {match.totalOvers} ov)
                </span>
              </div>
            ) : (
              <div style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', marginTop: '6px' }}>
                2nd Innings not commenced yet
              </div>
            )}
          </div>
        </div>

        {/* 3. 1ST INNINGS DETAILED SCORECARD */}
        {innings1 && (
          <PrintableInningsBlock
            innings={innings1}
            inningsNumber={1}
            totalMatchOvers={match.totalOvers}
          />
        )}

        {/* 4. 2ND INNINGS DETAILED SCORECARD */}
        {innings2 && (
          <PrintableInningsBlock
            innings={innings2}
            inningsNumber={2}
            totalMatchOvers={match.totalOvers}
          />
        )}

        {/* 5. TOP PERFORMERS HIGHLIGHTS */}
        {(topBatter || topBowler) && (
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              padding: '16px 20px',
              marginBottom: '24px',
            }}
          >
            <h3
              style={{
                fontSize: '12px',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: '#475569',
                margin: '0 0 12px 0',
              }}
            >
              🌟 Match Top Performers
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {topBatter && topBatter.runs > 0 && (
                <div style={{ borderLeft: '3px solid #f59e0b', paddingLeft: '12px' }}>
                  <span style={{ fontSize: '10px', fontWeight: '700', color: '#d97706', textTransform: 'uppercase' }}>
                    Top Batter
                  </span>
                  <p style={{ fontSize: '14px', fontWeight: '800', margin: '2px 0', color: '#0f172a' }}>
                    {topBatter.name} ({topBatter.teamName})
                  </p>
                  <p style={{ fontSize: '12px', color: '#475569', margin: 0 }}>
                    <strong>{topBatter.runs}</strong> runs ({topBatter.balls} balls, {topBatter.fours}x4, {topBatter.sixes}x6, SR: {calculateStrikeRate(topBatter.runs, topBatter.balls)})
                  </p>
                </div>
              )}

              {topBowler && (topBowler.wickets > 0 || topBowler.balls > 0) && (
                <div style={{ borderLeft: '3px solid #0284c7', paddingLeft: '12px' }}>
                  <span style={{ fontSize: '10px', fontWeight: '700', color: '#0284c7', textTransform: 'uppercase' }}>
                    Top Bowler
                  </span>
                  <p style={{ fontSize: '14px', fontWeight: '800', margin: '2px 0', color: '#0f172a' }}>
                    {topBowler.name} ({topBowler.teamName})
                  </p>
                  <p style={{ fontSize: '12px', color: '#475569', margin: 0 }}>
                    <strong>{topBowler.wickets}</strong> wkts for {topBowler.runsConceded} runs ({formatOvers(topBowler.balls)} ov, Econ: {calculateEconomy(topBowler.runsConceded, topBowler.balls)})
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. OFFICIAL UMPIRE CERTIFICATION FOOTER */}
        <div
          style={{
            borderTop: '2px solid #0f172a',
            paddingTop: '16px',
            marginTop: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            color: '#475569',
          }}
        >
          <div>
            <p style={{ margin: 0, fontWeight: '800', color: '#0f172a' }}>
              OFFICIAL CERTIFIED MATCH RECORD
            </p>
            <p style={{ margin: '2px 0 0 0' }}>
              Lead Umpire: <strong>{umpireName}</strong> (ICC Elite Panel System)
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontWeight: '700', color: '#0f172a' }}>
              Digital Seal Verified
            </p>
            <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#94a3b8' }}>
              Generated: {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    );
  }
);

OfficialScorecardPrintTemplate.displayName = 'OfficialScorecardPrintTemplate';

// Helper Subcomponent for Print Innings Block (Batting + Extras + Bowling + FOW)
function PrintableInningsBlock({ innings, inningsNumber, totalMatchOvers }) {
  if (!innings) return null;

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Innings Section Header */}
      <div
        style={{
          backgroundColor: '#1e293b',
          color: '#ffffff',
          padding: '8px 16px',
          borderRadius: '6px 6px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <strong style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {inningsNumber === 1 ? '1st' : '2nd'} Innings — {innings.battingTeamName} Batting
        </strong>
        <span style={{ fontSize: '12px', fontWeight: '700', color: '#38bdf8' }}>
          {innings.totalRuns}/{innings.wickets} ({formatOvers(innings.validBalls)}/{totalMatchOvers} ov)
        </span>
      </div>

      {/* Batting Table */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '11px',
          border: '1px solid #cbd5e1',
          borderTop: 'none',
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#f1f5f9', color: '#475569', textAlign: 'left', fontWeight: '700', borderBottom: '1px solid #cbd5e1' }}>
            <th style={{ padding: '7px 10px' }}>Batter</th>
            <th style={{ padding: '7px 10px' }}>Dismissal</th>
            <th style={{ padding: '7px 10px', textAlign: 'right' }}>R</th>
            <th style={{ padding: '7px 10px', textAlign: 'right' }}>B</th>
            <th style={{ padding: '7px 10px', textAlign: 'right' }}>4s</th>
            <th style={{ padding: '7px 10px', textAlign: 'right' }}>6s</th>
            <th style={{ padding: '7px 10px', textAlign: 'right' }}>SR</th>
          </tr>
        </thead>
        <tbody>
          {innings.batsmen?.map((b, idx) => {
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
              dismissalText = 'not out *';
            }

            return (
              <tr
                key={idx}
                style={{
                  backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  color: '#0f172a',
                }}
              >
                <td style={{ padding: '6px 10px', fontWeight: '700' }}>
                  {b.name}{' '}
                  {b.isBatting && (
                    <span style={{ fontSize: '9px', backgroundColor: '#dcfce7', color: '#15803d', padding: '1px 5px', borderRadius: '4px', marginLeft: '4px', fontWeight: '800' }}>
                      NOT OUT
                    </span>
                  )}
                </td>
                <td style={{ padding: '6px 10px', color: '#64748b' }}>{dismissalText}</td>
                <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: '800', fontSize: '12px' }}>{b.runs}</td>
                <td style={{ padding: '6px 10px', textAlign: 'right', color: '#475569' }}>{b.balls}</td>
                <td style={{ padding: '6px 10px', textAlign: 'right', color: '#475569' }}>{b.fours}</td>
                <td style={{ padding: '6px 10px', textAlign: 'right', color: '#475569' }}>{b.sixes}</td>
                <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>
                  {calculateStrikeRate(b.runs, b.balls)}
                </td>
              </tr>
            );
          })}

          {/* Extras and Totals Rows */}
          <tr style={{ backgroundColor: '#f1f5f9', borderTop: '2px solid #cbd5e1', fontSize: '11px', color: '#334155' }}>
            <td colSpan="2" style={{ padding: '6px 10px', fontWeight: '600' }}>
              Extras: <strong>{innings.extras?.total || 0}</strong>{' '}
              <span style={{ color: '#64748b', fontSize: '10px' }}>
                (wd {innings.extras?.wides || 0}, nb {innings.extras?.noBalls || 0}, b {innings.extras?.byes || 0}, lb {innings.extras?.legByes || 0})
              </span>
            </td>
            <td colSpan="5" style={{ padding: '6px 10px', textAlign: 'right', fontWeight: '800', fontSize: '12px', color: '#0f172a' }}>
              TOTAL: {innings.totalRuns}/{innings.wickets}{' '}
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748b' }}>
                ({formatOvers(innings.validBalls)} ov, CRR: {calculateCRR(innings.totalRuns, innings.validBalls)})
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Bowling Section */}
      <div style={{ marginTop: '12px' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '11px',
            border: '1px solid #cbd5e1',
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', color: '#475569', textAlign: 'left', fontWeight: '700', borderBottom: '1px solid #cbd5e1' }}>
              <th style={{ padding: '6px 10px' }}>Bowler ({innings.bowlingTeamName})</th>
              <th style={{ padding: '6px 10px', textAlign: 'right' }}>O</th>
              <th style={{ padding: '6px 10px', textAlign: 'right' }}>M</th>
              <th style={{ padding: '6px 10px', textAlign: 'right' }}>R</th>
              <th style={{ padding: '6px 10px', textAlign: 'right' }}>W</th>
              <th style={{ padding: '6px 10px', textAlign: 'right' }}>Dots</th>
              <th style={{ padding: '6px 10px', textAlign: 'right' }}>Econ</th>
            </tr>
          </thead>
          <tbody>
            {innings.bowlers
              ?.filter((bw) => bw.balls > 0 || bw.runsConceded > 0 || bw.wickets > 0)
              ?.map((bw, idx) => (
                <tr
                  key={idx}
                  style={{
                    backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    color: '#0f172a',
                  }}
                >
                  <td style={{ padding: '5px 10px', fontWeight: '700' }}>{bw.name}</td>
                  <td style={{ padding: '5px 10px', textAlign: 'right', fontWeight: '600' }}>{formatOvers(bw.balls)}</td>
                  <td style={{ padding: '5px 10px', textAlign: 'right', color: '#475569' }}>{bw.maidens}</td>
                  <td style={{ padding: '5px 10px', textAlign: 'right', color: '#475569' }}>{bw.runsConceded}</td>
                  <td style={{ padding: '5px 10px', textAlign: 'right', fontWeight: '800', color: '#dc2626', fontSize: '12px' }}>{bw.wickets}</td>
                  <td style={{ padding: '5px 10px', textAlign: 'right', color: '#475569' }}>{bw.dots || 0}</td>
                  <td style={{ padding: '5px 10px', textAlign: 'right', fontWeight: '700' }}>
                    {calculateEconomy(bw.runsConceded, bw.balls)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Fall of Wickets Summary */}
      {innings.fallOfWickets && innings.fallOfWickets.length > 0 && (
        <div
          style={{
            marginTop: '8px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '10px',
            color: '#475569',
          }}
        >
          <strong style={{ color: '#0f172a', marginRight: '6px' }}>Fall of Wickets:</strong>
          {innings.fallOfWickets.map((fow, idx) => (
            <span key={idx} style={{ marginRight: '10px', display: 'inline-block' }}>
              <strong>{fow.score}/{fow.wicketNumber}</strong> ({fow.playerOutName}, {fow.overs} ov)
              {idx < innings.fallOfWickets.length - 1 ? ' • ' : ''}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

