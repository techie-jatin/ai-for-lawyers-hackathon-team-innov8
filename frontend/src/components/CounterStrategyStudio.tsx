import { useState, useEffect } from 'react';
import {
  CLIENT_COUNTER_STRATEGY_PRESETS,
  generateClientCounterStrategy,
  type CounterStrategyPreset,
  type CounterStrategyResult
} from '../services/clientCounterStrategyEngine';

interface CounterStrategyStudioProps {
  isDark: boolean;
  apiBase?: string;
  initialFacts?: string;
  onClose?: () => void;
}

export function CounterStrategyStudio({
  isDark,
  apiBase,
  initialFacts = '',
  onClose
}: CounterStrategyStudioProps) {
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>('bns_248_false_charge');
  const [applicantName, setApplicantName] = useState<string>('Vikramaditya Sharma');
  const [applicantDetails, setApplicantDetails] = useState<string>('Resident of Saket, South Delhi, Citizen of India');
  const [oppositePartyName, setOppositePartyName] = useState<string>('Ramesh Verma & Associates');
  const [oppositePartyDetails, setOppositePartyDetails] = useState<string>('Complainant in FIR No. 102/2024');
  const [courtName, setCourtName] = useState<string>('Court of Chief Judicial Magistrate, Saket Courts');
  const [stateName, setStateName] = useState<string>('State (NCT of Delhi)');
  const [caseRef, setCaseRef] = useState<string>('FIR No. 102/2024 u/s 318 BNS');
  const [policeStation, setPoliceStation] = useState<string>('P.S. Saket');
  const [claimAmount, setClaimAmount] = useState<string>('₹25,00,000/-');
  const [factsSummary, setFactsSummary] = useState<string>(
    initialFacts ||
    'The Opposite Party has deliberately, maliciously, and without reasonable or probable cause ' +
    'instituted false, vexatious, and fabricated criminal proceedings against the Applicant after defaulting ' +
    'on commercial contract dues, with the corrupt intention of causing wrongful loss and extortion.'
  );
  const [advocateName, setAdvocateName] = useState<string>('Adv. Rajeshwar Rao');
  const [advocateEnrolment, setAdvocateEnrolment] = useState<string>('D/1428/2015');
  const [advocateOffice, setAdvocateOffice] = useState<string>('Chamber No. 412, Lawyers Chambers Block, Delhi High Court');

  const [activeTab, setActiveTab] = useState<'config' | 'preview'>('config');
  const [generating, setGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [result, setResult] = useState<CounterStrategyResult>(() =>
    generateClientCounterStrategy({
      preset_key: 'bns_248_false_charge',
      applicant_name: 'Vikramaditya Sharma',
      applicant_details: 'Resident of Saket, South Delhi, Citizen of India',
      opposite_party_name: 'Ramesh Verma & Associates',
      opposite_party_details: 'Complainant in FIR No. 102/2024',
      court_name: 'Court of Chief Judicial Magistrate, Saket Courts',
      state_name: 'State (NCT of Delhi)',
      case_ref: 'FIR No. 102/2024 u/s 318 BNS',
      police_station: 'P.S. Saket',
      claim_amount: '₹25,00,000/-',
      facts_summary:
        'The Opposite Party has deliberately, maliciously, and without reasonable or probable cause ' +
        'instituted false, vexatious, and fabricated criminal proceedings against the Applicant after defaulting ' +
        'on commercial contract dues, with the corrupt intention of causing wrongful loss and extortion.',
      advocate_name: 'Adv. Rajeshwar Rao',
      advocate_enrolment: 'D/1428/2015',
      advocate_office: 'Chamber No. 412, Lawyers Chambers Block, Delhi High Court'
    })
  );

  const activePreset: CounterStrategyPreset =
    CLIENT_COUNTER_STRATEGY_PRESETS.find(p => p.key === selectedPresetKey) || CLIENT_COUNTER_STRATEGY_PRESETS[0];

  const handleGenerate = async () => {
    setGenerating(true);
    const payload = {
      preset_key: selectedPresetKey,
      applicant_name: applicantName,
      applicant_details: applicantDetails,
      opposite_party_name: oppositePartyName,
      opposite_party_details: oppositePartyDetails,
      court_name: courtName,
      state_name: stateName,
      case_ref: caseRef,
      police_station: policeStation,
      claim_amount: claimAmount,
      facts_summary: factsSummary,
      advocate_name: advocateName,
      advocate_enrolment: advocateEnrolment,
      advocate_office: advocateOffice
    };

    if (apiBase) {
      try {
        const res = await fetch(`${apiBase}/api/contracts/counter-strategy/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json();
          setResult(data);
          setActiveTab('preview');
          setGenerating(false);
          return;
        }
      } catch {
        // Fall back gracefully to client engine
      }
    }

    const clientRes = generateClientCounterStrategy(payload);
    setResult(clientRes);
    setActiveTab('preview');
    setGenerating(false);
  };

  useEffect(() => {
    // When preset changes, update default court if user hasn't heavily customized
    setCourtName(activePreset.target_forum);
  }, [selectedPresetKey, activePreset.target_forum]);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.pleading_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDoc = () => {
    const blob = new Blob([result.pleading_text], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedPresetKey}_counter_strategy.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
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
  <title>${result.title}</title>
  <style>
    @page { size: legal portrait; margin: 38mm 25mm 25mm 38mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body {
      font-family: 'Times New Roman', Times, Georgia, serif;
      font-size: 13pt;
      line-height: 2.0;
      color: #000;
      text-align: justify;
      margin: 0;
      padding: 0;
      white-space: pre-wrap;
    }
  </style>
</head>
<body>${result.pleading_text}</body>
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

  return (
    <div className={`w-full rounded-2xl flex flex-col font-sans transition-colors ${
      isDark ? 'bg-[#0b0d17] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* 1. TOP HEADER & CLOSE BUTTON */}
      <div className={`p-4 sm:p-5 border-b flex flex-col gap-4 ${
        isDark ? 'bg-[#101322] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
              isDark ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              <span className="material-symbols-outlined text-[22px]">shield_with_heart</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[17px] font-black tracking-tight">
                  Defensive Counter-Strategy Generator
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-500 border border-red-500/25">
                  Anti-Vexatious Sanctions
                </span>
              </div>
              <p className={`text-[12px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Cross-complaints u/s 248 BNS, Section 379 BNSS perjury inquiries, caveats & malicious prosecution damages.
              </p>
            </div>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                isDark
                  ? 'bg-[#181c2d] hover:bg-red-950/40 text-slate-400 hover:text-red-400 border-slate-700'
                  : 'bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 border-slate-300'
              }`}
              title="Close Studio"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Preset Selector Rail */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {CLIENT_COUNTER_STRATEGY_PRESETS.map((p) => {
            const isSelected = p.key === selectedPresetKey;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => setSelectedPresetKey(p.key)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  isSelected
                    ? isDark
                      ? 'bg-red-500/15 border-red-500 text-white shadow-sm ring-1 ring-red-500/50'
                      : 'bg-red-50/80 border-red-600 text-red-900 shadow-sm ring-1 ring-red-600/30'
                    : isDark
                      ? 'bg-[#141829] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className={`material-symbols-outlined text-[20px] ${
                    isSelected ? 'text-red-500' : 'text-slate-400'
                  }`}>
                    {p.icon}
                  </span>
                  <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-red-500/10 text-red-500">
                    {p.category.split(' ')[0]}
                  </span>
                </div>
                <div>
                  <h4 className="text-[12px] font-bold leading-snug line-clamp-2">
                    {p.title}
                  </h4>
                  <div className="text-[9.5px] font-mono text-slate-400 mt-1 truncate">
                    {p.statutory_basis.split('(')[0]}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. DUAL-TAB WORKSPACE: CONFIGURATION VS HIGH COURT PREVIEW */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Tab Switcher */}
        <div className={`flex items-center p-1 rounded-xl border text-[12px] font-bold max-w-sm ${
          isDark ? 'bg-[#121526] border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'config'
                ? isDark ? 'bg-white text-black font-extrabold shadow-xs' : 'bg-[#00288e] text-white font-extrabold shadow-xs'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">tune</span>
            <span>1. Configure Grounds</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'preview'
                ? isDark ? 'bg-white text-black font-extrabold shadow-xs' : 'bg-[#00288e] text-white font-extrabold shadow-xs'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">description</span>
            <span>2. Court Pleading</span>
          </button>
        </div>

        {activeTab === 'config' ? (
          /* CONFIGURATION FORM */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Form Inputs (7 Cols) */}
            <div className={`lg:col-span-7 p-4 sm:p-5 rounded-2xl border space-y-4 ${
              isDark ? 'bg-[#101322] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <h3 className={`text-[13px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                isDark ? 'text-red-400' : 'text-red-700'
              }`}>
                <span className="material-symbols-outlined text-[16px]">edit_note</span>
                Litigation Particulars & Malice Demonstration
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400">Applicant / Caveator / Plaintiff Name</label>
                  <input
                    type="text"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border text-[12px] font-medium focus:outline-none ${
                      isDark ? 'bg-[#181c2f] border-slate-700 text-white focus:border-red-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-red-600'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400">Applicant Address / Status</label>
                  <input
                    type="text"
                    value={applicantDetails}
                    onChange={(e) => setApplicantDetails(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border text-[12px] font-medium focus:outline-none ${
                      isDark ? 'bg-[#181c2f] border-slate-700 text-white focus:border-red-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-red-600'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400">Opposite Party / Accused / Contemnor</label>
                  <input
                    type="text"
                    value={oppositePartyName}
                    onChange={(e) => setOppositePartyName(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border text-[12px] font-medium focus:outline-none ${
                      isDark ? 'bg-[#181c2f] border-slate-700 text-white focus:border-red-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-red-600'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400">Opposite Party Details</label>
                  <input
                    type="text"
                    value={oppositePartyDetails}
                    onChange={(e) => setOppositePartyDetails(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border text-[12px] font-medium focus:outline-none ${
                      isDark ? 'bg-[#181c2f] border-slate-700 text-white focus:border-red-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-red-600'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400">Target Court / Forum</label>
                  <input
                    type="text"
                    value={courtName}
                    onChange={(e) => setCourtName(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border text-[12px] font-medium focus:outline-none ${
                      isDark ? 'bg-[#181c2f] border-slate-700 text-white focus:border-red-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-red-600'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400">State / Territory</label>
                  <input
                    type="text"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border text-[12px] font-medium focus:outline-none ${
                      isDark ? 'bg-[#181c2f] border-slate-700 text-white focus:border-red-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-red-600'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400">Impugned Case Reference / FIR No.</label>
                  <input
                    type="text"
                    value={caseRef}
                    onChange={(e) => setCaseRef(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border text-[12px] font-medium focus:outline-none ${
                      isDark ? 'bg-[#181c2f] border-slate-700 text-white focus:border-red-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-red-600'
                    }`}
                  />
                </div>

                {selectedPresetKey === 'malicious_prosecution_tort' ? (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">Exemplary Damages Claim</label>
                    <input
                      type="text"
                      value={claimAmount}
                      onChange={(e) => setClaimAmount(e.target.value)}
                      className={`w-full p-2.5 rounded-lg border text-[12px] font-medium focus:outline-none ${
                        isDark ? 'bg-[#181c2f] border-slate-700 text-white focus:border-red-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-red-600'
                      }`}
                    />
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">Police Station</label>
                    <input
                      type="text"
                      value={policeStation}
                      onChange={(e) => setPoliceStation(e.target.value)}
                      className={`w-full p-2.5 rounded-lg border text-[12px] font-medium focus:outline-none ${
                        isDark ? 'bg-[#181c2f] border-slate-700 text-white focus:border-red-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-red-600'
                      }`}
                    />
                  </div>
                )}
              </div>

              {/* Factual Malice Narrative */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400">
                  Facts Demonstrating Absence of Reasonable Cause & Malicious Extortion
                </label>
                <textarea
                  rows={4}
                  value={factsSummary}
                  onChange={(e) => setFactsSummary(e.target.value)}
                  className={`w-full p-3 rounded-lg border text-[12px] leading-relaxed focus:outline-none ${
                    isDark ? 'bg-[#181c2f] border-slate-700 text-white focus:border-red-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-red-600'
                  }`}
                />
              </div>

              {/* Advocate Particulars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[10.5px] font-bold text-slate-400">Advocate Name</label>
                  <input
                    type="text"
                    value={advocateName}
                    onChange={(e) => setAdvocateName(e.target.value)}
                    className={`w-full p-2 rounded border text-[11.5px] font-medium focus:outline-none ${
                      isDark ? 'bg-[#181c2f] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10.5px] font-bold text-slate-400">Enrolment No.</label>
                  <input
                    type="text"
                    value={advocateEnrolment}
                    onChange={(e) => setAdvocateEnrolment(e.target.value)}
                    className={`w-full p-2 rounded border text-[11.5px] font-medium focus:outline-none ${
                      isDark ? 'bg-[#181c2f] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10.5px] font-bold text-slate-400">Chamber Address</label>
                  <input
                    type="text"
                    value={advocateOffice}
                    onChange={(e) => setAdvocateOffice(e.target.value)}
                    className={`w-full p-2 rounded border text-[11.5px] font-medium focus:outline-none ${
                      isDark ? 'bg-[#181c2f] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>
              </div>

              {/* Generate Button */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating}
                className="w-full py-3 px-4 rounded-xl font-black text-[13px] bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:opacity-90 text-white flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {generating ? 'hourglass_top' : 'shield'}
                </span>
                <span>{generating ? 'Generating Court-Ready Instrument...' : 'Generate Counter-Strategy Instrument'}</span>
              </button>
            </div>

            {/* Right Column: Statutory Analysis & Precedents (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className={`p-4 sm:p-5 rounded-2xl border space-y-3.5 ${
                isDark ? 'bg-[#101322] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-500 text-[20px]">gavel</span>
                  <h4 className="text-[13px] font-black uppercase tracking-wider">
                    Statutory Framework
                  </h4>
                </div>

                <div className={`p-3 rounded-xl border text-[12px] font-mono leading-relaxed ${
                  isDark ? 'bg-[#181c2f] border-slate-800 text-red-300' : 'bg-red-50 border-red-200 text-red-900'
                }`}>
                  {activePreset.statutory_basis}
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Strategic Objective</span>
                  <p className={`text-[12px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {activePreset.objective}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Statutory Penal Sanction</span>
                  <div className={`p-2.5 rounded-lg border text-[11.5px] ${
                    isDark ? 'bg-[#15192c] border-slate-800 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}>
                    {activePreset.punishment}
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Binding Supreme Court Benchmarks</span>
                  <div className="space-y-1.5">
                    {activePreset.landmark_precedents.map((prec, i) => (
                      <div
                        key={i}
                        className={`p-2 rounded-lg border text-[11px] font-serif italic ${
                          isDark ? 'bg-[#15192c] border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        {prec}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* PREVIEW HIGH COURT GREEN LEGAL LEDGER */
          <div className="space-y-3">
            {/* Action Bar */}
            <div className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              isDark ? 'bg-[#101322] border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-red-500/15 text-red-500">
                  {result.engine}
                </span>
                <span className="text-[12px] font-bold truncate max-w-md">
                  {result.title}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                    copied
                      ? 'bg-emerald-500 text-white border-emerald-600'
                      : isDark ? 'bg-[#181c2f] hover:bg-[#222742] text-slate-200 border-slate-700' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">{copied ? 'check' : 'content_copy'}</span>
                  <span>{copied ? 'Copied Pleading!' : 'Copy Text'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadDoc}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                    isDark ? 'bg-[#181c2f] hover:bg-[#222742] text-slate-200 border-slate-700' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">download</span>
                  <span>Download .doc</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 rounded-lg text-[12px] font-black bg-gradient-to-r from-red-600 to-rose-600 hover:opacity-90 text-white flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                >
                  <span className="material-symbols-outlined text-[15px]">print</span>
                  <span>Print Court Pleading</span>
                </button>
              </div>
            </div>

            {/* Green Legal Ledger / Parchment Viewer */}
            <div className={`p-6 sm:p-10 rounded-2xl border shadow-xl overflow-x-auto ${
              isDark ? 'bg-[#0a0f0d] border-emerald-900/40 text-[#d1fae5]' : 'bg-[#f4fbf7] border-emerald-300 text-[#064e3b]'
            }`} style={{
              boxShadow: 'inset 0 0 40px rgba(16, 185, 129, 0.05)',
              fontFamily: 'Times New Roman, Times, Georgia, serif'
            }}>
              <div className="max-w-[760px] mx-auto space-y-4">
                <div className="border-l-4 border-emerald-600/60 pl-6 space-y-4">
                  <pre className="whitespace-pre-wrap font-serif text-[13pt] leading-[1.85] text-justify select-text">
                    {result.pleading_text}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
