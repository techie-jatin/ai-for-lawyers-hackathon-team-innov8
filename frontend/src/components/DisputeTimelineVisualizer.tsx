import { useState, useEffect, useMemo } from 'react';
import {
  CLIENT_TIMELINE_ARCHETYPES,
  calculateClientTimeline,
  type CalculatedTimeline,
  type TimelineMilestone
} from '../services/clientTimelineEngine';

interface DisputeTimelineVisualizerProps {
  isDark: boolean;
  apiBase?: string;
  initialArchetype?: string;
  initialAnchorDate?: string;
  onClose?: () => void;
}

export function DisputeTimelineVisualizer({
  isDark,
  apiBase,
  initialArchetype = 'cheque_bounce_138_ni',
  initialAnchorDate,
  onClose
}: DisputeTimelineVisualizerProps) {
  // Today formatted as YYYY-MM-DD
  const todayStr = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  const [selectedArchetypeKey, setSelectedArchetypeKey] = useState<string>(initialArchetype);
  const [anchorDate, setAnchorDate] = useState<string>(initialAnchorDate || todayStr);
  const [selectedMilestone, setSelectedMilestone] = useState<TimelineMilestone | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [timelineData, setTimelineData] = useState<CalculatedTimeline>(() =>
    calculateClientTimeline(initialArchetype, initialAnchorDate || todayStr)
  );

  // Recalculate timeline on archetype or date changes
  useEffect(() => {
    const calculate = async () => {
      if (apiBase) {
        try {
          const res = await fetch(`${apiBase}/api/contracts/timeline/calculate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              archetype_key: selectedArchetypeKey,
              anchor_date: anchorDate
            })
          });
          if (res.ok) {
            const data = await res.json();
            setTimelineData(data);
            return;
          }
        } catch {
          // Fall back gracefully to client engine
        }
      }
      const clientCalc = calculateClientTimeline(selectedArchetypeKey, anchorDate);
      setTimelineData(clientCalc);
    };

    calculate();
  }, [selectedArchetypeKey, anchorDate, apiBase]);

  // Update selected milestone when milestones change
  useEffect(() => {
    if (timelineData.milestones.length > 0) {
      // Default to the first deadline or first active milestone
      const deadline = timelineData.milestones.find(m => m.is_deadline) || timelineData.milestones[0];
      setSelectedMilestone(deadline);
    }
  }, [timelineData]);

  const activeArchetype = useMemo(() => {
    return CLIENT_TIMELINE_ARCHETYPES.find(a => a.key === selectedArchetypeKey) || CLIENT_TIMELINE_ARCHETYPES[0];
  }, [selectedArchetypeKey]);

  // Quick anchor date presets
  const handleDatePreset = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setAnchorDate(`${y}-${m}-${day}`);
  };

  // Copy structured Synopsis & List of Dates for court filing
  const handleCopyCourtChronology = () => {
    const lines = [
      `SYNOPSIS & CHRONOLOGICAL LIST OF DATES & EVENTS`,
      `MATTER: ${activeArchetype.title.toUpperCase()}`,
      `STATUTORY FRAMEWORK: ${activeArchetype.statute_badge}`,
      `ANCHOR DATE: ${timelineData.anchor_date}`,
      `LIMITATION STATUS: ${timelineData.limitation_summary.urgency_rating} (${timelineData.limitation_summary.remedy_status})`,
      ``,
      `DATE         | EVENT / STATUTORY MILESTONE`,
      `--------------------------------------------------------------------------------`
    ];

    timelineData.milestones.forEach(m => {
      lines.push(`${m.formatted_date.padEnd(12)} | ${m.title}`);
      lines.push(`             | Provision: ${m.statutory_provision}`);
      lines.push(`             | Consequence: ${m.legal_consequence}`);
      if (m.precedent_citation) {
        lines.push(`             | Precedent: ${m.precedent_citation}`);
      }
      lines.push(`--------------------------------------------------------------------------------`);
    });

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  // Print Court-Ready Chronology Chart
  const handlePrintChronology = () => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) {
      window.print();
      return;
    }

    doc.open();
    doc.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Chronological List of Dates and Events - ${activeArchetype.title}</title>
  <style>
    @page { size: A4 portrait; margin: 20mm 15mm 20mm 20mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.6; color: #000; margin: 0; padding: 0; }
    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 18px; }
    .header h2 { margin: 0 0 6px 0; font-size: 14pt; text-transform: uppercase; letter-spacing: 1px; }
    .header p { margin: 2px 0; font-size: 10pt; font-style: italic; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th, td { border: 1px solid #000; padding: 8px 10px; vertical-align: top; text-align: left; }
    th { background: #f1f5f9; font-weight: bold; text-transform: uppercase; font-size: 10pt; }
    .date-col { width: 22%; font-weight: bold; }
    .badge { display: inline-block; font-size: 9pt; padding: 2px 5px; border: 1px solid #000; border-radius: 3px; font-weight: bold; margin-top: 4px; }
    .deadline { background: #fee2e2; }
    .footer { margin-top: 25px; font-size: 9pt; text-align: right; border-top: 1px solid #888; padding-top: 6px; }
  </style>
</head>
<body>
  <div class="header">
    <h2>Chronological List of Dates & Events</h2>
    <p>Admissibility & Limitation Chart under the Limitation Act, 1963</p>
    <p>Matter: ${activeArchetype.title} • Statutory Base: ${activeArchetype.statute_badge}</p>
  </div>

  <p><strong>Primary Limitation Deadline:</strong> ${timelineData.limitation_summary.name} on ${timelineData.limitation_summary.date} (${timelineData.limitation_summary.days_remaining >= 0 ? `${timelineData.limitation_summary.days_remaining} days remaining` : `Expired ${Math.abs(timelineData.limitation_summary.days_remaining)} days ago`})</p>
  <p><strong>Procedural Assessment:</strong> ${timelineData.limitation_summary.remedy_status}</p>

  <table>
    <thead>
      <tr>
        <th class="date-col">Date & Days</th>
        <th>Event, Statutory Provision & Legal Consequence</th>
      </tr>
    </thead>
    <tbody>
      ${timelineData.milestones.map(m => `
        <tr>
          <td class="date-col">
            <div>${m.formatted_date}</div>
            <div style="font-size: 9pt; color: #555;">(Day +${m.days_from_anchor})</div>
            ${m.is_deadline ? '<div class="badge deadline">STATUTORY DEADLINE</div>' : ''}
          </td>
          <td>
            <strong>${m.title}</strong>
            <div style="margin-top: 3px; font-size: 10pt; color: #1e3a8a;"><strong>Provision:</strong> ${m.statutory_provision}</div>
            <div style="margin-top: 3px; font-size: 10pt;">${m.legal_consequence}</div>
            ${m.precedent_citation ? `<div style="margin-top: 3px; font-size: 9.5pt; font-style: italic; color: #475569;"><strong>Precedent:</strong> ${m.precedent_citation}</div>` : ''}
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    Generated via Bharat Legal Intelligence 2.0 • Senior Advocate Verification Engine
  </div>
</body>
</html>`);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 2000);
    }, 400);
  };

  const getUrgencyBadgeClasses = (urgency: string) => {
    switch (urgency) {
      case 'FATAL_EXPIRED':
        return 'bg-red-500/15 text-red-500 border-red-500/30';
      case 'CRITICAL':
        return 'bg-amber-500/15 text-amber-500 border-amber-500/30';
      case 'ATTENTION':
        return 'bg-yellow-500/15 text-yellow-500 border-yellow-500/30';
      default:
        return 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30';
    }
  };

  return (
    <div className={`w-full rounded-2xl flex flex-col font-sans transition-colors ${
      isDark ? 'bg-[#0b0d17] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* 1. TOP HEADER & ARCHETYPE SELECTOR */}
      <div className={`p-4 sm:p-5 border-b flex flex-col gap-4 ${
        isDark ? 'bg-[#101322] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
              isDark ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-[#00288e]/10 text-[#00288e] border border-[#00288e]/20'
            }`}>
              <span className="material-symbols-outlined text-[22px]">event_repeat</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[17px] font-black tracking-tight">
                  Interactive Dispute Timeline Visualizer
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/25">
                  Limitation Act 1963
                </span>
              </div>
              <p className={`text-[12px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Algorithmic statutory milestones, limitation cutoffs & procedural remedy warnings.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyCourtChronology}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-500 text-white border-emerald-600'
                  : isDark
                    ? 'bg-[#181c2d] hover:bg-[#20263d] text-slate-200 border-slate-700'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
              title="Copy List of Dates for Plaint/Petition"
            >
              <span className="material-symbols-outlined text-[15px]">
                {copied ? 'check' : 'content_copy'}
              </span>
              <span>{copied ? 'Copied Chronology!' : 'Copy Dates & Events'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrintChronology}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isDark ? 'bg-amber-500 hover:bg-amber-400 text-black font-extrabold' : 'bg-[#00288e] hover:bg-blue-900 text-white'
              }`}
              title="Print High Court Formatted Dates & Events Chart"
            >
              <span className="material-symbols-outlined text-[15px]">print</span>
              <span>Print Annexure</span>
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                  isDark
                    ? 'bg-[#181c2d] hover:bg-red-950/40 text-slate-400 hover:text-red-400 border-slate-700'
                    : 'bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 border-slate-300'
                }`}
                title="Close Visualizer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Archetype Selector Horizontal Rail */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {CLIENT_TIMELINE_ARCHETYPES.map((arch) => {
            const isSelected = arch.key === selectedArchetypeKey;
            return (
              <button
                key={arch.key}
                type="button"
                onClick={() => setSelectedArchetypeKey(arch.key)}
                className={`px-3 py-2 rounded-xl border text-left shrink-0 transition-all cursor-pointer flex items-center gap-2.5 ${
                  isSelected
                    ? isDark
                      ? 'bg-amber-500/15 border-amber-500 text-white shadow-sm'
                      : 'bg-[#eff4ff] border-[#00288e] text-[#00288e] shadow-sm'
                    : isDark
                      ? 'bg-[#141829] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <span className={`material-symbols-outlined text-[18px] ${
                  isSelected ? (isDark ? 'text-amber-400' : 'text-[#00288e]') : 'text-slate-400'
                }`}>
                  {arch.icon}
                </span>
                <div>
                  <div className="text-[12px] font-bold truncate max-w-[200px]">
                    {arch.title}
                  </div>
                  <div className="text-[10px] font-mono opacity-80 truncate max-w-[200px]">
                    {arch.statute_badge}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. ANCHOR DATE CONTROLS & URGENCY STATUS BANNER */}
      <div className="p-4 sm:p-5 space-y-4">
        <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isDark ? 'bg-[#131626] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          {/* Anchor Date Picker */}
          <div className="flex-1 space-y-1.5">
            <label className={`text-[12px] font-bold flex items-center gap-1.5 ${
              isDark ? 'text-amber-400' : 'text-[#00288e]'
            }`}>
              <span className="material-symbols-outlined text-[16px]">pin_drop</span>
              <span>Trigger Event Anchor: {activeArchetype.anchor_label}</span>
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={anchorDate}
                onChange={(e) => setAnchorDate(e.target.value)}
                className={`px-3 py-1.5 rounded-lg border text-[13px] font-mono font-bold focus:outline-none ${
                  isDark
                    ? 'bg-[#1a1e33] border-slate-700 text-white focus:border-amber-500'
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#00288e]'
                }`}
              />
              <span className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Quick:</span>
              {[
                { label: 'Today', days: 0 },
                { label: '15d Ago', days: 15 },
                { label: '30d Ago', days: 30 },
                { label: '3m Ago', days: 90 },
                { label: '1y Ago', days: 365 }
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleDatePreset(p.days)}
                  className={`px-2 py-1 rounded text-[10.5px] font-semibold border transition-all cursor-pointer ${
                    isDark
                      ? 'bg-[#181c2f] hover:bg-[#232942] border-slate-700 text-slate-300'
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Limitation Countdown Badge */}
          <div className={`p-3.5 rounded-xl border flex items-center gap-3 shrink-0 ${
            getUrgencyBadgeClasses(timelineData.limitation_summary.urgency_rating)
          }`}>
            <span className="material-symbols-outlined text-[28px] animate-pulse">
              {timelineData.limitation_summary.is_expired ? 'error' : 'timer'}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black uppercase tracking-wider">
                  {timelineData.limitation_summary.urgency_rating.replace('_', ' ')}
                </span>
                <span className="text-[11px] font-mono">
                  {timelineData.limitation_summary.date}
                </span>
              </div>
              <div className="text-[14px] font-black">
                {timelineData.limitation_summary.is_expired
                  ? `Overdue by ${Math.abs(timelineData.limitation_summary.days_remaining)} Days`
                  : timelineData.limitation_summary.days_remaining === 0
                    ? 'Final Day Today!'
                    : `${timelineData.limitation_summary.days_remaining} Days Remaining`}
              </div>
            </div>
          </div>
        </div>

        {/* Remedial Guidance Callout */}
        <div className={`p-3.5 rounded-xl border text-[12px] flex items-start gap-2.5 ${
          timelineData.limitation_summary.is_expired
            ? isDark ? 'bg-red-950/30 border-red-800/40 text-red-200' : 'bg-red-50 border-red-200 text-red-900'
            : isDark ? 'bg-blue-950/30 border-blue-800/40 text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-900'
        }`}>
          <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">
            {timelineData.limitation_summary.is_expired ? 'warning' : 'gavel'}
          </span>
          <div className="flex-1 leading-relaxed">
            <span className="font-bold">Senior Advocate Remedial Notice: </span>
            {timelineData.limitation_summary.remedy_status}
          </div>
        </div>

        {/* 3. DUAL-PANE TIMELINE WORKSPACE: RAIL + DETAIL CARD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
          {/* LEFT: INTERACTIVE MILESTONES RAIL (7 Cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between pb-1">
              <h3 className={`text-[13px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <span className="material-symbols-outlined text-[16px]">timeline</span>
                Chronological Milestone Chain ({timelineData.milestones.length} Events)
              </h3>
              <span className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Anchor: {timelineData.anchor_date}
              </span>
            </div>

            <div className="relative pl-6 space-y-4">
              {/* Vertical Connecting Line */}
              <div className={`absolute left-2.5 top-3 bottom-3 w-0.5 ${
                isDark ? 'bg-slate-800' : 'bg-slate-300'
              }`} />

              {timelineData.milestones.map((m) => {
                const isSelected = selectedMilestone?.id === m.id;
                const isPast = m.days_remaining < 0;
                const isToday = m.days_remaining === 0;

                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMilestone(m)}
                    className={`relative rounded-xl border p-3.5 transition-all cursor-pointer ${
                      isSelected
                        ? isDark
                          ? 'bg-[#181c2d] border-amber-500 shadow-md ring-1 ring-amber-500/50'
                          : 'bg-[#f0f5ff] border-[#00288e] shadow-md ring-1 ring-[#00288e]/30'
                        : isDark
                          ? 'bg-[#111422] border-slate-800 hover:border-slate-700'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    {/* Node Dot / Pin */}
                    <div className={`absolute -left-[27px] top-4 w-5 h-5 rounded-full flex items-center justify-center text-[11px] border ${
                      m.is_deadline
                        ? isPast
                          ? 'bg-red-500 border-red-600 text-white'
                          : 'bg-amber-500 border-amber-600 text-black font-bold animate-pulse'
                        : isPast
                          ? 'bg-emerald-600 border-emerald-700 text-white'
                          : isToday
                            ? 'bg-blue-600 border-blue-700 text-white ring-2 ring-blue-400'
                            : isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-200 border-slate-300 text-slate-600'
                    }`}>
                      {m.is_deadline ? (
                        <span className="material-symbols-outlined text-[13px]">gavel</span>
                      ) : isPast ? (
                        <span className="material-symbols-outlined text-[13px]">check</span>
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      )}
                    </div>

                    {/* Milestone Card Content */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                            isPast
                              ? isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                              : isDark ? 'bg-blue-950/60 text-blue-300' : 'bg-blue-50 text-blue-800'
                          }`}>
                            {m.formatted_date}
                          </span>
                          <span className="text-[10.5px] font-mono text-slate-400">
                            Day +{m.days_from_anchor}
                          </span>
                          {m.is_deadline && (
                            <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded bg-red-500/15 text-red-500 border border-red-500/25">
                              STATUTORY DEADLINE
                            </span>
                          )}
                        </div>

                        <h4 className={`text-[13.5px] font-bold mt-1.5 ${
                          isSelected
                            ? isDark ? 'text-amber-400' : 'text-[#00288e]'
                            : isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                          {m.title}
                        </h4>

                        <div className={`text-[11px] font-mono mt-0.5 ${
                          isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          {m.statutory_provision}
                        </div>
                      </div>

                      {/* Urgency Badge */}
                      <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded shrink-0 border ${
                        m.days_remaining < 0
                          ? isDark ? 'bg-slate-800/80 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-500 border-slate-200'
                          : m.days_remaining <= 14
                            ? 'bg-red-500/15 text-red-500 border-red-500/30'
                            : m.days_remaining <= 30
                              ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                              : isDark ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        {m.days_remaining < 0
                          ? `${Math.abs(m.days_remaining)}d ago`
                          : m.days_remaining === 0
                            ? 'Today'
                            : `In ${m.days_remaining}d`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: DEEP-DIVE MILESTONE LEGAL ANALYSIS DRAWER (5 Cols) */}
          <div className="lg:col-span-5">
            <div className={`p-4 sm:p-5 rounded-2xl border space-y-4 sticky top-4 ${
              isDark ? 'bg-[#101322] border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-md'
            }`}>
              {selectedMilestone ? (
                <>
                  <div className="border-b pb-3 border-slate-700/20">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10.5px] font-mono uppercase tracking-wider font-bold text-amber-500">
                        Milestone Detail
                      </span>
                      <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                        selectedMilestone.days_remaining < 0
                          ? 'bg-slate-700/40 text-slate-400'
                          : 'bg-emerald-500/15 text-emerald-500'
                      }`}>
                        {selectedMilestone.days_remaining < 0
                          ? `Passed ${Math.abs(selectedMilestone.days_remaining)} days ago`
                          : `Remaining: ${selectedMilestone.days_remaining} days`}
                      </span>
                    </div>
                    <h3 className="text-[16px] font-black mt-1 leading-snug">
                      {selectedMilestone.title}
                    </h3>
                    <div className="text-[12px] font-mono text-slate-400 mt-0.5">
                      Target Date: {selectedMilestone.formatted_date} (Day +{selectedMilestone.days_from_anchor})
                    </div>
                  </div>

                  {/* Statutory Provision */}
                  <div className="space-y-1">
                    <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                      isDark ? 'text-amber-400' : 'text-[#00288e]'
                    }`}>
                      <span className="material-symbols-outlined text-[14px]">menu_book</span>
                      Statutory Provision
                    </span>
                    <div className={`p-2.5 rounded-lg border text-[12px] font-mono leading-relaxed ${
                      isDark ? 'bg-[#15192c] border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}>
                      {selectedMilestone.statutory_provision}
                    </div>
                  </div>

                  {/* Legal Consequence */}
                  <div className="space-y-1">
                    <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                      isDark ? 'text-amber-400' : 'text-[#00288e]'
                    }`}>
                      <span className="material-symbols-outlined text-[14px]">warning</span>
                      Procedural & Judicial Consequence
                    </span>
                    <p className={`text-[12px] leading-relaxed p-2.5 rounded-lg border ${
                      isDark ? 'bg-[#15192c] border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}>
                      {selectedMilestone.legal_consequence}
                    </p>
                  </div>

                  {/* Binding Supreme Court Precedent */}
                  {selectedMilestone.precedent_citation && (
                    <div className="space-y-1">
                      <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                        isDark ? 'text-amber-400' : 'text-[#00288e]'
                      }`}>
                        <span className="material-symbols-outlined text-[14px]">gavel</span>
                        Binding Supreme Court Benchmark
                      </span>
                      <div className={`p-2.5 rounded-lg border text-[12px] font-serif italic ${
                        isDark ? 'bg-[#181c2f] border-slate-800 text-amber-200' : 'bg-amber-50/60 border-amber-200 text-amber-900'
                      }`}>
                        {selectedMilestone.precedent_citation}
                      </div>
                    </div>
                  )}

                  {/* Actionable Counsel Instruction */}
                  <div className="space-y-1">
                    <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                      isDark ? 'text-emerald-400' : 'text-emerald-700'
                    }`}>
                      <span className="material-symbols-outlined text-[14px]">lightbulb</span>
                      Senior Counsel Action Plan
                    </span>
                    <div className={`p-3 rounded-lg border text-[12px] leading-relaxed ${
                      isDark ? 'bg-emerald-950/20 border-emerald-800/30 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    }`}>
                      {selectedMilestone.actionable_guidance}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-slate-400 text-[13px]">
                  Select any milestone node on the timeline rail to view senior advocate procedural analysis.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
