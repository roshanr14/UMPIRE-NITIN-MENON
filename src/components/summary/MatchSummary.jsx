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

  const [activeTab, setActiveTab] = useState('full'); // 'full' | 'innings1' | 'innings2' | 'partnerships'
  const [copiedShare, setCopiedShare] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);
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

  // Print scorecard
  const handlePrint = () => {
    window.print();
  };

  // Export High-Resolution Multi-Page PDF with Lossless PNG & Zero Sliced Rows
  const handleExportPDF = async () => {
    if (!scorecardRef.current) return;
    setIsExportingPDF(true);
    setExportStatus(null);
    const prevTab = activeTab;

    try {
      // Ensure the complete scorecard (both innings) is visible
      if (activeTab !== 'full') {
        setActiveTab('full');
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      const element = scorecardRef.current;
      const canvas = await html2canvas(element, {
        scale: 2.2,
        backgroundColor: '#060919',
        useCORS: true,
        logging: false,
        windowWidth: 1200,
        ignoreElements: (el) => el.classList.contains('no-print'),
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const pdfHeight = 297;
      const pageCanvasHeight = Math.floor((canvas.width * pdfHeight) / pdfWidth);
      const totalPages = Math.ceil(canvas.height / pageCanvasHeight);

      for (let p = 0; p < totalPages; p++) {
        if (p > 0) pdf.addPage();

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = pageCanvasHeight;

        const ctx = pageCanvas.getContext('2d');
        ctx.fillStyle = '#060919';
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

        const sourceY = p * pageCanvasHeight;
        const sourceH = Math.min(pageCanvasHeight, canvas.height - sourceY);

        ctx.drawImage(
          canvas,
          0, sourceY, canvas.width, sourceH,
          0, 0, canvas.width, sourceH
        );

        // Lossless PNG format: crystal-clear typography, zero JPEG blur
        const pageDataUrl = pageCanvas.toDataURL('image/png');
        pdf.addImage(pageDataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      }

      const cleanA = (match.teamA?.name || 'TeamA').replace(/\s+/g, '_');
      const cleanB = (match.teamB?.name || 'TeamB').replace(/\s+/g, '_');
      const filename = `${cleanA}_vs_${cleanB}_Official_Scorecard.pdf`;

      pdf.save(filename);

      let blobUrl = null;
      try {
        const pdfBlob = pdf.output('blob');
        blobUrl = URL.createObjectURL(pdfBlob);
        window.open(blobUrl, '_blank');
      } catch (previewErr) {
        console.warn('Could not open preview tab:', previewErr);
      }

      setExportStatus({
        type: 'success',
        text: `Official Complete Match PDF generated! Saved to your computer and ready to view in high definition.`,
        previewUrl: blobUrl,
      });
      setTimeout(() => setExportStatus(null), 12000);
    } catch (err) {
      console.error('PDF export error:', err);
      setExportStatus({
        type: 'error',
        text: 'Custom canvas rendering was blocked by browser. You can save as PDF directly using Print Sheet.',
      });
      setTimeout(() => setExportStatus(null), 10000);
    } finally {
      setIsExportingPDF(false);
      if (prevTab !== 'full') {
        setActiveTab(prevTab);
      }
    }
  };

  // Export High-Definition Image (PNG) with Full Match Coverage
  const handleExportImage = async () => {
    if (!scorecardRef.current) return;
    setIsExportingImage(true);
    setExportStatus(null);
    const prevTab = activeTab;

    try {
      if (activeTab !== 'full') {
        setActiveTab('full');
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      const element = scorecardRef.current;
      const canvas = await html2canvas(element, {
        scale: 2.2,
        backgroundColor: '#060919',
        useCORS: true,
        logging: false,
        windowWidth: 1200,
        ignoreElements: (element) => element.classList.contains('no-print'),
      });

      const cleanA = (match.teamA?.name || 'TeamA').replace(/\s+/g, '_');
      const cleanB = (match.teamB?.name || 'TeamB').replace(/\s+/g, '_');
      const filename = `${cleanA}_vs_${cleanB}_Complete_Scorecard.png`;

      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png'); // 100% Lossless High-DPI PNG
      link.click();

      setExportStatus({
        type: 'success',
        text: `High-Definition Complete Scorecard PNG image exported! Check your Downloads or Desktop folder.`,
      });
      setTimeout(() => setExportStatus(null), 6000);
    } catch (err) {
      console.error('Image export error:', err);
      setExportStatus({
        type: 'error',
        text: 'Image export encountered an error.',
      });
      setTimeout(() => setExportStatus(null), 6000);
    } finally {
      setIsExportingImage(false);
      if (prevTab !== 'full') {
        setActiveTab(prevTab);
      }
    }
  };

  // Copy share text for WhatsApp / SMS
  const handleShare = () => {
    const text = `🏏 *UMPIRE NITIN MENON - OFFICIAL MATCH REPORT*
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
Lead Umpire: Nitin Menon`;

    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 font-sans">
      {/* Top Action Toolbar (Liquid Glass Bar) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-3xl glass-panel border border-white/[0.12] shadow-lg no-print">
        <div className="flex items-center gap-2">
          {match.status === 'live' && (
            <button
              onClick={onNavigateToScoring}
              className="liquid-btn liquid-btn-primary px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2"
            >
              <Activity className="w-3.5 h-3.5 animate-pulse text-cyan-200" />
              <span>Resume Live Scoring</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <button
            onClick={handleShare}
            className="liquid-btn liquid-btn-secondary px-4 py-2.5 rounded-2xl flex items-center gap-1.5"
          >
            {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-cyan-300" />}
            <span>{copiedShare ? 'Copied!' : 'Share Match'}</span>
          </button>

          <button
            onClick={handleExportImage}
            disabled={isExportingImage}
            className="liquid-btn liquid-btn-secondary px-4 py-2.5 rounded-2xl flex items-center gap-1.5 disabled:opacity-40"
          >
            <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
            <span>{isExportingImage ? 'Exporting...' : 'Save PNG'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="liquid-btn liquid-btn-secondary px-4 py-2.5 rounded-2xl flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-purple-400" />
            <span>Print Sheet</span>
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            className="liquid-btn liquid-btn-primary px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-cyan-200" />
            <span>{isExportingPDF ? 'Generating PDF...' : 'Download Scorecard PDF'}</span>
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
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl glass-panel border border-white/[0.08] no-print">
          <button
            onClick={() => setActiveTab('full')}
            className={`liquid-btn flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 min-w-[150px] ${
              activeTab === 'full'
                ? 'liquid-btn-primary'
                : 'liquid-btn-secondary'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Full Scorecard (Both Innings)</span>
          </button>

          <button
            onClick={() => setActiveTab('innings1')}
            className={`liquid-btn flex-1 py-3 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 min-w-[140px] ${
              activeTab === 'innings1'
                ? 'liquid-btn-primary'
                : 'liquid-btn-secondary'
            }`}
          >
            <span>1st Innings: {innings1?.battingTeamName}</span>
            <span className="px-2 py-0.5 rounded-full bg-white/[0.08] text-slate-200 font-digit text-[11px]">
              {innings1?.totalRuns}/{innings1?.wickets} ({formatOvers(innings1?.validBalls)} ov)
            </span>
          </button>

          {innings2 && (
            <button
              onClick={() => setActiveTab('innings2')}
              className={`liquid-btn flex-1 py-3 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 min-w-[140px] ${
                activeTab === 'innings2'
                  ? 'liquid-btn-primary'
                  : 'liquid-btn-secondary'
              }`}
            >
              <span>2nd Innings: {innings2.battingTeamName}</span>
              <span className="px-2 py-0.5 rounded-full bg-white/[0.08] text-slate-200 font-digit text-[11px]">
                {innings2.totalRuns}/{innings2.wickets} ({formatOvers(innings2.validBalls)} ov)
              </span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('partnerships')}
            className={`liquid-btn px-5 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
              activeTab === 'partnerships'
                ? 'liquid-btn-amber'
                : 'liquid-btn-secondary'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-amber-300" />
            <span>Fall of Wickets</span>
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

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-300 border-b border-white/[0.12] text-[11px] font-bold uppercase tracking-wider bg-white/[0.02]">
                <th className="py-2.5 pl-3">Batter</th>
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
                    <td className="py-3 pl-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white font-display">{b.name}</span>
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

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-300 border-b border-white/[0.12] text-[11px] font-bold uppercase tracking-wider bg-white/[0.02]">
                <th className="py-2.5 pl-3">Bowler</th>
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
                      <td className="py-3 pl-3 font-bold text-sm text-white font-display">
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
