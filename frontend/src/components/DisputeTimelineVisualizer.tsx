import { useState, useEffect, useMemo } from 'react';
import {
  CLIENT_TIMELINE_ARCHETYPES,
  calculateClientTimeline,
  type CalculatedTimeline,
  type TimelineMilestone
} from '../services/clientTimelineEngine';
import {
  generateCustomDisputeTimeline,
  extractDisputeEntities
} from '../services/clientSeniorAdvocateBrain';

interface DisputeTimelineVisualizerProps {
  isDark: boolean;
  apiBase?: string;
  initialArchetype?: string;
  initialAnchorDate?: string;
  initialFacts?: string;
  onClose?: () => void;
}

const SAMPLE_CASE_SNIPPETS = [
  {
    label: '🏠 Tenancy Deposit',
    facts: 'I rented an apartment in Bengaluru on 1st March 2025. I vacated on 31st January 2026 after 30 days notice. The landlord Ramesh Rao has withheld my ₹85,000 security deposit citing false painting charges.'
  },
  {
    label: '📜 Cheque Bounce',
    facts: 'M/s Skyline Infra issued a cheque of ₹4,50,000 on 10-09-2026 which bounced with return memo dated 12-09-2026 for insufficient funds. They have refused to pay despite calls.'
  },
  {
    label: '🛡️ Consumer Deficiency',
    facts: 'I purchased an electronic appliance on Flipkart on 15-05-2025 for ₹38,000. It arrived defective, customer service closed tickets without resolution, and warranty refund was rejected on 25-05-2025.'
  },
  {
    label: '🏢 Builder RERA Delay',
    facts: 'I booked a flat with Apex Promoters in Noida for ₹65 Lakhs on 10-01-2023. Promised possession date was 31-12-2024. Project is halted and promoter refuses interest or refund.'
  },
  {
    label: '⚖️ False FIR Quashing',
    facts: 'Opposite party filed a false criminal complaint under Sections 318 & 351 BNS on 14-03-2026 at P.S. Connaught Place to extort money arising out of a purely civil contractual disagreement.'
  }
];

export function DisputeTimelineVisualizer({
  isDark,
  apiBase,
  initialArchetype = 'cheque_bounce_138_ni',
  initialAnchorDate,
  initialFacts,
  onClose
}: DisputeTimelineVisualizerProps) {
  const todayStr = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  // Mode: Custom Brain (real-world arbitrary case) vs Static Archetypes
  const [activeMode, setActiveMode] = useState<'custom_brain' | 'archetype'>(
    initialFacts ? 'custom_brain' : 'custom_brain'
  );

  const [customFacts, setCustomFacts] = useState<string>(
    initialFacts || SAMPLE_CASE_SNIPPETS[0].facts
  );
  const [selectedArchetypeKey, setSelectedArchetypeKey] = useState<string>(initialArchetype);
  const [anchorDate, setAnchorDate] = useState<string>(initialAnchorDate || todayStr);
  const [selectedMilestone, setSelectedMilestone] = useState<TimelineMilestone | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Initial timeline calculation
  const [timelineData, setTimelineData] = useState<CalculatedTimeline>(() => {
    if (initialFacts) {
      return generateCustomDisputeTimeline(initialFacts, initialAnchorDate || todayStr);
    }
    return generateCustomDisputeTimeline(SAMPLE_CASE_SNIPPETS[0].facts, initialAnchorDate || todayStr);
  });

  // Calculate timeline when mode, archetype, or custom facts change
  const handleAnalyzeCustomDispute = async (factsToAnalyze?: string) => {
    const text = factsToAnalyze || customFacts;
    if (!text.trim()) return;

    setIsAnalyzing(true);
    if (apiBase) {
      try {
        const res = await fetch(`${apiBase}/api/contracts/brain/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            facts: text,
            anchor_date: anchorDate
          })
        });
        if (res.ok) {
          const data = await res.json();
          setTimelineData(data);
          setIsAnalyzing(false);
          return;
        }
      } catch {
        // Fall back gracefully to browser client engine
      }
    }

    const clientRes = generateCustomDisputeTimeline(text, anchorDate);
    setTimelineData(clientRes);
    setIsAnalyzing(false);
  };

  // When switching to archetype mode or changing archetype
  useEffect(() => {
    if (activeMode === 'archetype') {
      const calculateArchetype = async () => {
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
            // fallback
          }
        }
        const clientCalc = calculateClientTimeline(selectedArchetypeKey, anchorDate);
        setTimelineData(clientCalc);
      };
      calculateArchetype();
    }
  }, [activeMode, selectedArchetypeKey, anchorDate, apiBase]);

  // Update selected milestone whenever timeline data updates
  useEffect(() => {
    if (timelineData.milestones && timelineData.milestones.length > 0) {
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
    const newDate = `${y}-${m}-${day}`;
    setAnchorDate(newDate);

    if (activeMode === 'custom_brain') {
      handleAnalyzeCustomDispute(customFacts);
    }
  };

  // Copy structured Synopsis & List of Dates for court filing
  const handleCopyCourtChronology = () => {
    const matterTitle = timelineData.dispute_title || activeArchetype.title;
    const lines = [
      `SYNOPSIS & CHRONOLOGICAL LIST OF DATES & EVENTS`,
      `MATTER: ${matterTitle.toUpperCase()}`,
      `STATUTORY FRAMEWORK: ${timelineData.statute_badge}`,
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

    const matterTitle = timelineData.dispute_title || activeArchetype.title;

    doc.open();
    doc.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Chronological List of Dates and Events - ${matterTitle}</title>
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
    <p>Matter: ${matterTitle} • Statutory Base: ${timelineData.statute_badge}</p>
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
    Generated via Bharat Legal Intelligence 2.0 • Senior Advocate Dynamic Case Engine
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
    <div className={`w-full h-full flex flex-col overflow-hidden rounded-2xl font-sans transition-colors ${
      isDark ? 'bg-[#0b0d17] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* 1. TOP HEADER & MODE CONTROLS */}
      <div className={`p-4 sm:p-5 border-b shrink-0 flex flex-col gap-3 ${
        isDark ? 'bg-[#101322] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
              isDark ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-[#00288e]/10 text-[#00288e] border border-[#00288e]/20'
            }`}>
              <span className="material-symbols-outlined text-[22px]">event_repeat</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[17px] font-black tracking-tight">
                  Dispute Timeline & Limitation Visualizer
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/25">
                  Limitation Act 1963
                </span>
                {timelineData.dispute_title && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/25">
                    Live Case Analysis
                  </span>
                )}
              </div>
              <p className={`text-[12px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Dynamically deconstructs any dispute into statutory milestones, calculates limitation cutoffs & procedural remedy warnings.
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

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveMode('custom_brain')}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeMode === 'custom_brain'
                ? isDark
                  ? 'bg-amber-500 text-black shadow-xs font-black'
                  : 'bg-[#00288e] text-white shadow-xs'
                : isDark
                  ? 'text-slate-400 hover:text-white bg-[#141829]'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">psychology</span>
            <span>🧠 Senior Advocate Dynamic Brain (Custom Dispute)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('archetype')}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeMode === 'archetype'
                ? isDark
                  ? 'bg-amber-500 text-black shadow-xs font-black'
                  : 'bg-[#00288e] text-white shadow-xs'
                : isDark
                  ? 'text-slate-400 hover:text-white bg-[#141829]'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">auto_stories</span>
            <span>📚 Statutory Procedural Guides (7 Archetypes)</span>
          </button>
        </div>

        {/* Archetype Selector Rail (Only in archetype mode) */}
        {activeMode === 'archetype' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin pt-1">
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
        )}
      </div>

      {/* 2. SCROLLABLE BODY AREA */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 scrollbar-thin">
        
        {/* ================= CUSTOM DISPUTE INTAKE DRAWER (Senior Advocate Brain) ================= */}
        {activeMode === 'custom_brain' && (
          <div className={`p-4 rounded-xl border space-y-3 ${
            isDark ? 'bg-[#131626] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-[20px]">smart_toy</span>
                <h3 className="text-[13px] font-black uppercase tracking-wider">
                  Real-World Case Facts & Scenario Intake (Zero Hardcoding)
                </h3>
              </div>
              <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Paste raw narrative • Senior Advocate Brain extracts dates, parties & statutes
              </span>
            </div>

            <textarea
              rows={3}
              value={customFacts}
              onChange={(e) => setCustomFacts(e.target.value)}
              placeholder="Describe your actual controversy: parties involved, transaction dates, breach/incident date, amounts, notices sent, etc."
              className={`w-full text-[12.5px] p-3 rounded-xl border font-sans focus:outline-none transition-all ${
                isDark
                  ? 'bg-[#181c2f] border-slate-700 text-white focus:border-amber-500'
                  : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#00288e]'
              }`}
            />

            {/* Quick Scenario Fillers */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={`text-[11px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Quick Load:
                </span>
                {SAMPLE_CASE_SNIPPETS.map((snippet) => (
                  <button
                    key={snippet.label}
                    type="button"
                    onClick={() => {
                      setCustomFacts(snippet.facts);
                      handleAnalyzeCustomDispute(snippet.facts);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                      isDark
                        ? 'bg-[#181c2f] hover:bg-[#232942] border-slate-700 text-slate-300'
                        : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                    }`}
                  >
                    {snippet.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleAnalyzeCustomDispute()}
                disabled={isAnalyzing}
                className={`px-4 py-1.5 rounded-lg text-[12px] font-black flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                  isDark
                    ? 'bg-amber-500 hover:bg-amber-400 text-black'
                    : 'bg-[#00288e] hover:bg-blue-900 text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isAnalyzing ? 'sync' : 'bolt'}
                </span>
                <span>{isAnalyzing ? 'Analyzing Scenario...' : 'Calculate Custom Timeline'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= ANCHOR DATE CONTROLS & URGENCY STATUS BANNER ================= */}
        <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isDark ? 'bg-[#131626] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          {/* Anchor Date Picker */}
          <div className="flex-1 space-y-1.5">
            <label className={`text-[12px] font-bold flex items-center gap-1.5 ${
              isDark ? 'text-amber-400' : 'text-[#00288e]'
            }`}>
              <span className="material-symbols-outlined text-[16px]">pin_drop</span>
              <span>
                Trigger Event Anchor: {timelineData.anchor_label || activeArchetype.anchor_label}
              </span>
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={anchorDate}
                onChange={(e) => {
                  setAnchorDate(e.target.value);
                  if (activeMode === 'custom_brain') {
                    handleAnalyzeCustomDispute(customFacts);
                  }
                }}
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
              {timelineData.limitation_summary.days_remaining < 0 ? 'error' : 'timer'}
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
                {timelineData.limitation_summary.days_remaining < 0
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
          timelineData.limitation_summary.days_remaining < 0
            ? isDark ? 'bg-red-950/30 border-red-800/40 text-red-200' : 'bg-red-50 border-red-200 text-red-900'
            : isDark ? 'bg-blue-950/30 border-blue-800/40 text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-900'
        }`}>
          <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">
            {timelineData.limitation_summary.days_remaining < 0 ? 'warning' : 'gavel'}
          </span>
          <div className="flex-1 leading-relaxed">
            <span className="font-bold">Senior Advocate Remedial Notice: </span>
            {timelineData.limitation_summary.remedy_status}
          </div>
        </div>

        {/* ================= DUAL-PANE TIMELINE WORKSPACE ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
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

              {timelineData.milestones.map((milestone, idx) => {
                const isSelected = selectedMilestone?.id === milestone.id;
                return (
                  <div
                    key={milestone.id || idx}
                    onClick={() => setSelectedMilestone(milestone)}
                    className={`relative p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? isDark
                          ? 'bg-amber-500/10 border-amber-500 shadow-md ring-1 ring-amber-500/30'
                          : 'bg-[#eff4ff] border-[#00288e] shadow-md ring-1 ring-[#00288e]/30'
                        : isDark
                          ? 'bg-[#131626] border-slate-800 hover:border-slate-700 hover:bg-[#181c2f]'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {/* Node Dot on Vertical Line */}
                    <div className={`absolute -left-[27px] top-4 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      milestone.is_deadline
                        ? 'bg-red-500 border-white text-white'
                        : isSelected
                          ? isDark ? 'bg-amber-400 border-black' : 'bg-[#00288e] border-white'
                          : isDark ? 'bg-[#181c2d] border-slate-600' : 'bg-slate-100 border-slate-400'
                    }`}>
                      {milestone.is_deadline && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                            milestone.is_deadline
                              ? 'bg-red-500/15 text-red-500 border border-red-500/25'
                              : isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {milestone.formatted_date}
                          </span>
                          <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Day +{milestone.days_from_anchor}
                          </span>
                          {milestone.is_deadline && (
                            <span className="text-[9px] font-mono font-black uppercase px-1.5 py-0.2 rounded bg-red-500 text-white">
                              DEADLINE
                            </span>
                          )}
                        </div>

                        <h4 className="text-[13.5px] font-bold mt-1 tracking-tight">
                          {milestone.title}
                        </h4>

                        <p className={`text-[11px] font-mono mt-0.5 ${
                          isDark ? 'text-amber-400/90' : 'text-[#00288e]'
                        }`}>
                          § {milestone.statutory_provision}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`text-[10.5px] font-mono font-bold px-2 py-0.5 rounded ${
                          milestone.days_to_event < 0
                            ? isDark ? 'text-slate-500 bg-slate-900' : 'text-slate-400 bg-slate-100'
                            : milestone.days_to_event <= 15
                              ? 'text-red-500 bg-red-500/10'
                              : isDark ? 'text-emerald-400 bg-emerald-950/40' : 'text-emerald-700 bg-emerald-50'
                        }`}>
                          {milestone.days_to_event < 0
                            ? `${Math.abs(milestone.days_to_event)}d ago`
                            : milestone.days_to_event === 0
                              ? 'Today'
                              : `in ${milestone.days_to_event}d`}
                        </span>
                      </div>
                    </div>

                    <p className={`text-[11.5px] mt-2 line-clamp-2 leading-relaxed ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      {milestone.legal_consequence}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: SELECTED MILESTONE DETAILS & PRECEDENTS (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {selectedMilestone ? (
              <div className={`p-4 sm:p-5 rounded-xl border sticky top-2 space-y-4 ${
                isDark ? 'bg-[#131626] border-slate-800' : 'bg-white border-slate-200 shadow-md'
              }`}>
                <div className="flex items-start justify-between gap-3 border-b pb-3 border-slate-200 dark:border-slate-800">
                  <div>
                    <span className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded ${
                      selectedMilestone.is_deadline
                        ? 'bg-red-500/15 text-red-500 border border-red-500/25'
                        : isDark ? 'bg-amber-500/15 text-amber-400' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {selectedMilestone.phase.toUpperCase().replace('_', ' ')}
                    </span>
                    <h3 className="text-[15px] font-bold mt-1.5 leading-snug">
                      {selectedMilestone.title}
                    </h3>
                  </div>
                  <div className="text-right shrink-0 font-mono text-[11px]">
                    <div className="font-bold">{selectedMilestone.formatted_date}</div>
                    <div className="text-slate-500 text-[10px]">Day +{selectedMilestone.days_from_anchor}</div>
                  </div>
                </div>

                {/* Statutory Provision Box */}
                <div className={`p-3 rounded-lg border text-[12px] space-y-1 ${
                  isDark ? 'bg-[#181c2f] border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className={`text-[10px] font-mono font-bold uppercase ${
                    isDark ? 'text-amber-400' : 'text-[#00288e]'
                  }`}>
                    Governing Statutory Authority:
                  </div>
                  <div className="font-bold font-mono text-[12.5px]">
                    {selectedMilestone.statutory_provision}
                  </div>
                </div>

                {/* Legal Consequence */}
                <div className="space-y-1">
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Legal Consequence & Substantive Effect:
                  </div>
                  <p className={`text-[12px] leading-relaxed ${
                    isDark ? 'text-slate-200' : 'text-slate-700'
                  }`}>
                    {selectedMilestone.legal_consequence}
                  </p>
                </div>

                {/* Actionable Guidance */}
                <div className="space-y-1">
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Advocate Actionable Checklist:
                  </div>
                  <div className={`p-3 rounded-lg text-[11.5px] border leading-relaxed ${
                    isDark ? 'bg-emerald-950/20 border-emerald-800/30 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}>
                    {selectedMilestone.actionable_guidance}
                  </div>
                </div>

                {/* Precedent Citation */}
                {selectedMilestone.precedent_citation && (
                  <div className="space-y-1 border-t pt-3 border-slate-200 dark:border-slate-800">
                    <div className={`text-[10px] font-bold uppercase tracking-wider ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      Landmark Judicial Precedent:
                    </div>
                    <div className={`p-2.5 rounded-lg text-[11.5px] italic border ${
                      isDark ? 'bg-[#181c2f] border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}>
                      ⚖️ {selectedMilestone.precedent_citation}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={`p-6 rounded-xl border text-center ${
                isDark ? 'bg-[#131626] border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
              }`}>
                Select a milestone from the chronological rail to inspect statutory consequences and precedents.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
