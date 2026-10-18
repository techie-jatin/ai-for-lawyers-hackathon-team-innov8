import { useState, useEffect } from 'react';
import {
  CLIENT_COUNTER_STRATEGY_PRESETS,
  generateClientCounterStrategy,
  type CounterStrategyPreset,
  type CounterStrategyResult
} from '../services/clientCounterStrategyEngine';
import {
  extractDisputeEntities
} from '../services/clientSeniorAdvocateBrain';

interface CounterStrategyStudioProps {
  isDark: boolean;
  apiBase?: string;
  initialFacts?: string;
  onClose?: () => void;
}

const SAMPLE_THREAT_SCENARIOS = [
  {
    label: '🚨 Extortionate False Charge (§248 BNS)',
    preset: 'bns_248_false_charge',
    facts: 'Ramesh Verma defaulted on contractual invoices of ₹15,00,000/-. To avoid payment and extort money, he filed a fabricated criminal police complaint alleging cheating u/s 318 BNS at P.S. Saket without any basis.'
  },
  {
    label: '📑 Perjury & Fake Affidavits (§379 BNSS)',
    preset: 'bnss_379_perjury',
    facts: 'The Opposite Party filed a fabricated email printout and false affidavit in civil proceedings knowingly lying under oath to obtain an unlawful ex-parte status quo order.'
  },
  {
    label: '⚠️ Threat of Ex-Parte Injunction (Caveat)',
    preset: 'cpc_148a_caveat',
    facts: 'Aggrieved party anticipates that Builder/Opposite Party will secretly move an ex-parte stay application before Commercial Court Saket regarding ongoing possession without serving prior notice.'
  },
  {
    label: '💰 Malicious Prosecution Damages',
    preset: 'tort_malicious_prosecution',
    facts: 'Opposite party maliciously dragged the Applicant through 2 years of false proceedings which were entirely dismissed by the Magistrate. Claiming ₹25 Lakhs for catastrophic reputational and commercial damage.'
  },
  {
    label: '⚖️ Contempt for Illegal Arrest Threats',
    preset: 'contempt_arnesh_kumar',
    facts: 'Investigating Officer and complainant threatened immediate physical arrest without serving mandatory Section 35(3) BNSS notice of appearance in an alleged offence carrying less than 7 years sentence.'
  }
];

export function CounterStrategyStudio({
  isDark,
  apiBase,
  initialFacts = '',
  onClose
}: CounterStrategyStudioProps) {
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>('bns_248_false_charge');
  const [aiThreatText, setAiThreatText] = useState<string>(initialFacts || '');
  const [isAiDecompiling, setIsAiDecompiling] = useState<boolean>(false);

  const [applicantName, setApplicantName] = useState<string>('Vikramaditya Sharma');
  const [applicantDetails, setApplicantDetails] = useState<string>('Citizen of India & Aggrieved Party');
  const [oppositePartyName, setOppositePartyName] = useState<string>('Ramesh Verma & Associates');
  const [oppositePartyDetails, setOppositePartyDetails] = useState<string>('Malicious Complainant / Extortionate Entity');
  const [courtName, setCourtName] = useState<string>('Court of Chief Judicial Magistrate, Saket Courts');
  const [stateName] = useState<string>('State (NCT of Delhi)');
  const [caseRef, setCaseRef] = useState<string>('Complaint Diary No. 102/2026');
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
  const [advocateOffice] = useState<string>('Chamber No. 412, Lawyers Chambers Block, High Court');


  const [activeTab, setActiveTab] = useState<'config' | 'preview'>('config');
  const [generating, setGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  
  const [result, setResult] = useState<CounterStrategyResult>(() =>
    generateClientCounterStrategy({
      preset_key: 'bns_248_false_charge',
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
    })
  );

  const activePreset: CounterStrategyPreset =
    CLIENT_COUNTER_STRATEGY_PRESETS.find(p => p.key === selectedPresetKey) || CLIENT_COUNTER_STRATEGY_PRESETS[0];

  // Auto-decompile on mount if initialFacts was provided from Chat
  useEffect(() => {
    if (initialFacts && initialFacts.trim().length > 15) {
      handleAutoDecompileThreat(initialFacts);
    }
  }, [initialFacts]);

  // Senior Advocate Threat Decompiler: auto-extracts adversary and sets grounds
  const handleAutoDecompileThreat = (textToAnalyze?: string) => {
    const raw = textToAnalyze || aiThreatText;
    if (!raw.trim()) return;

    setIsAiDecompiling(true);
    const extracted = extractDisputeEntities(raw);

    setApplicantName(extracted.petitioner_name || 'Aggrieved Citizen');
    setOppositePartyName(extracted.respondent_name || 'Opposite Party');
    setCourtName(extracted.court_forum || 'Court of Competent Jurisdiction');
    setClaimAmount(extracted.dispute_amount || '₹25,00,000/-');
    setFactsSummary(raw);

    const payload = {
      preset_key: selectedPresetKey,
      applicant_name: extracted.petitioner_name || 'Aggrieved Citizen',
      applicant_details: 'Citizen of India & Aggrieved Deponent',
      opposite_party_name: extracted.respondent_name || 'Opposite Party',
      opposite_party_details: 'Opposite Party / Malicious Entity',
      court_name: extracted.court_forum || 'Court of Competent Jurisdiction',
      state_name: stateName,
      case_ref: caseRef,
      police_station: policeStation,
      claim_amount: extracted.dispute_amount || '₹25,00,000/-',
      facts_summary: raw,
      advocate_name: advocateName,
      advocate_enrolment: advocateEnrolment,
      advocate_office: advocateOffice
    };

    const clientRes = generateClientCounterStrategy(payload);
    setResult(clientRes);
    setIsAiDecompiling(false);
    setActiveTab('preview');
  };

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

  const handleCopy = () => {
    navigator.clipboard.writeText(result.pleading_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDoc = () => {
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>${result.title}</title>
    <style>
      @page { size: legal portrait; margin: 1.5in 1.0in 1.0in 1.0in; }
      body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 2.0; text-align: justify; }
      h1, h2 { text-align: center; font-size: 14pt; font-weight: bold; }
    </style></head><body>`;
    const footer = `</body></html>`;
    const content = `<pre style="font-family: 'Times New Roman', serif; font-size: 12pt; white-space: pre-wrap; line-height: 1.9;">${result.pleading_text}</pre>`;
    const blob = new Blob([header + content + footer], { type: 'application/msword' });
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
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${result.title} - High Court Filing</title>
          <style>
            @page {
              size: legal portrait;
              margin: 1.5in 1.0in 1.0in 1.0in;
            }
            body {
              font-family: 'Times New Roman', Times, serif;
              font-size: 13pt;
              line-height: 2.0;
              color: #000;
              margin: 0;
              padding: 0;
              text-align: justify;
            }
            pre {
              white-space: pre-wrap;
              word-wrap: break-word;
              font-family: 'Times New Roman', Times, serif;
              font-size: 12pt;
              line-height: 1.9;
            }
            .header-rule {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
              margin-bottom: 24px;
              font-size: 12pt;
              font-weight: bold;
              text-transform: uppercase;
            }
          </style>
        </head>
        <body>
          <div class="header-rule">
            <div>HIGH COURT OF JUDICATURE • DEFENSIVE COUNTER-PROCEEDING</div>
            <div style="font-size: 13pt; margin-top: 4px;">${courtName.toUpperCase()}</div>
            <div style="font-size: 9.5pt; font-style: italic; margin-top: 2px;">Prepared via Bharat Legal Intelligence 2.0 • Anti-Vexatious Litigation Studio</div>
          </div>
          <pre>${result.pleading_text}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 400);
  };

  return (
    <div className={`w-full h-full flex flex-col overflow-hidden rounded-2xl font-sans transition-colors ${
      isDark ? 'bg-[#0b0d17] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* 1. TOP HEADER & INSTRUMENT SELECTOR */}
      <div className={`p-4 sm:p-5 border-b shrink-0 flex flex-col gap-3 ${
        isDark ? 'bg-[#101322] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
              isDark ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-red-600/10 text-red-700 border border-red-600/20'
            }`}>
              <span className="material-symbols-outlined text-[22px]">security</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[17px] font-black tracking-tight">
                  Defensive Counter-Strategy Generator
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-500 border border-red-500/25">
                  Anti-Vexatious Litigation Studio
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/25">
                  Zero Hardcoding
                </span>
              </div>
              <p className={`text-[12px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Deconstruct extortionate allegations and synthesize court-ready counter-complaints, perjury applications, caveats, and exemplary damages plaints.
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

        {/* Counter-Offensive Preset Rail */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {CLIENT_COUNTER_STRATEGY_PRESETS.map((p) => {
            const isSelected = p.key === selectedPresetKey;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => {
                  setSelectedPresetKey(p.key);
                  const updated = {
                    preset_key: p.key,
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
                  setResult(generateClientCounterStrategy(updated));
                }}
                className={`p-2 sm:p-2.5 rounded-xl border text-left shrink-0 transition-all cursor-pointer min-w-[190px] max-w-[240px] flex flex-col justify-between ${
                  isSelected
                    ? isDark
                      ? 'bg-red-950/20 border-red-500 text-white shadow-xs'
                      : 'bg-red-50/70 border-red-600 text-red-900 shadow-xs'
                    : isDark
                      ? 'bg-[#141829] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className={`material-symbols-outlined text-[18px] ${
                    isSelected ? 'text-red-500' : 'text-slate-400'
                  }`}>
                    {p.icon}
                  </span>
                  <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-red-500/10 text-red-500">
                    {p.category.split(' ')[0]}
                  </span>
                </div>
                <div>
                  <h4 className="text-[11.5px] font-bold leading-snug line-clamp-1">
                    {p.title}
                  </h4>
                  <div className="text-[9.5px] font-mono text-slate-400 mt-0.5 truncate">
                    {p.statutory_basis.split('(')[0]}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. DUAL-TAB WORKSPACE HEADER */}
      <div className={`px-4 sm:px-6 py-2 border-b shrink-0 flex items-center justify-between gap-3 ${
        isDark ? 'bg-[#101322] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className={`flex items-center p-1 rounded-xl border text-[12px] font-bold ${
          isDark ? 'bg-[#141829] border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'config'
                ? isDark ? 'bg-amber-500 text-black font-extrabold shadow-xs' : 'bg-[#00288e] text-white font-extrabold shadow-xs'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">tune</span>
            <span>1. Threat & Parties Config</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'preview'
                ? isDark ? 'bg-amber-500 text-black font-extrabold shadow-xs' : 'bg-[#00288e] text-white font-extrabold shadow-xs'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">description</span>
            <span>2. Court Legal Ledger Preview</span>
          </button>
        </div>

        {activeTab === 'preview' && (
          <div className="flex items-center gap-1.5">
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
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadDoc}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                isDark ? 'bg-[#181c2f] hover:bg-[#222742] text-slate-200 border-slate-700' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">download</span>
              <span>.doc</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg text-[12px] font-black bg-gradient-to-r from-red-600 to-rose-600 hover:opacity-90 text-white flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">print</span>
              <span>Print Ledger</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. SCROLLABLE BODY CONTAINER */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin">
        {activeTab === 'config' ? (
          /* CONFIGURATION FORM WITH AI THREAT DECOMPILER */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Form Inputs (7 Cols) */}
            <div className={`lg:col-span-7 p-4 sm:p-5 rounded-2xl border space-y-4 ${
              isDark ? 'bg-[#101322] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              
              {/* ================= SENIOR ADVOCATE THREAT DECOMPILER ================= */}
              <div className={`p-4 rounded-xl border space-y-3 ${
                isDark ? 'bg-[#15192c] border-red-900/40 shadow-md' : 'bg-red-50/50 border-red-200 shadow-xs'
              }`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-500 text-[20px]">smart_toy</span>
                    <h4 className="text-[12.5px] font-black uppercase tracking-wider text-red-700 dark:text-red-400">
                      Senior Advocate Threat Decompiler (Zero Hardcoding)
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono opacity-70">
                    Auto-Extract Adversary
                  </span>
                </div>

                <textarea
                  rows={3}
                  value={aiThreatText}
                  onChange={(e) => setAiThreatText(e.target.value)}
                  placeholder="Paste the opposing party's threat, police complaint allegations, legal demand notice, or false claims..."
                  className={`w-full text-xs p-2.5 rounded-lg border font-sans focus:outline-none ${
                    isDark ? 'bg-[#181c2f] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />

                {/* Quick Threat Scenario Presets */}
                <div className="space-y-1.5">
                  <div className="text-[10.5px] font-semibold opacity-75">Quick Load Adversary Threat:</div>
                  <div className="flex flex-wrap gap-1">
                    {SAMPLE_THREAT_SCENARIOS.map((st) => (
                      <button
                        key={st.label}
                        type="button"
                        onClick={() => {
                          setSelectedPresetKey(st.preset);
                          setAiThreatText(st.facts);
                          handleAutoDecompileThreat(st.facts);
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors cursor-pointer ${
                          isDark ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300' : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleAutoDecompileThreat()}
                  disabled={isAiDecompiling}
                  className="w-full py-2 px-3 rounded-lg text-xs font-black bg-red-600 hover:bg-red-500 text-white shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <span>{isAiDecompiling ? '⚡ Decompiling Threat...' : '⚡ Deconstruct Threat & Auto-Draft Counter-Strategy'}</span>
                </button>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
                <h3 className={`text-[13px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                  isDark ? 'text-red-400' : 'text-red-700'
                }`}>
                  <span className="material-symbols-outlined text-[16px]">edit_note</span>
                  Litigation Particulars & Malice Demonstration
                </h3>
              </div>

              {/* Applicant Particulars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold opacity-80">Applicant / Deponent Name</label>
                  <input
                    type="text"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className={`w-full p-2 rounded-lg border text-xs font-medium focus:outline-none ${
                      isDark ? 'bg-[#181c2f] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold opacity-80">Applicant Address & Capacity</label>
                  <input
                    type="text"
                    value={applicantDetails}
                    onChange={(e) => setApplicantDetails(e.target.value)}
                    className={`w-full p-2 rounded-lg border text-xs font-medium focus:outline-none ${
                      isDark ? 'bg-[#181c2f] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Opposite Party / Adversary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold opacity-80">Malicious Complainant / Opposite Party</label>
                  <input
                    type="text"
                    value={oppositePartyName}
                    onChange={(e) => setOppositePartyName(e.target.value)}
                    className={`w-full p-2 rounded-lg border text-xs font-medium focus:outline-none ${
                      isDark ? 'bg-[#181c2f] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold opacity-80">Opposite Party Description / Role</label>
                  <input
                    type="text"
                    value={oppositePartyDetails}
                    onChange={(e) => setOppositePartyDetails(e.target.value)}
                    className={`w-full p-2 rounded-lg border text-xs font-medium focus:outline-none ${
                      isDark ? 'bg-[#181c2f] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Court & Police Station */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold opacity-80">Appropriate Court / Forum</label>
                  <input
                    type="text"
                    value={courtName}
                    onChange={(e) => setCourtName(e.target.value)}
                    className={`w-full p-2 rounded-lg border text-xs font-medium focus:outline-none ${
                      isDark ? 'bg-[#181c2f] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold opacity-80">Police Station & Jurisdiction</label>
                  <input
                    type="text"
                    value={policeStation}
                    onChange={(e) => setPoliceStation(e.target.value)}
                    className={`w-full p-2 rounded-lg border text-xs font-medium focus:outline-none ${
                      isDark ? 'bg-[#181c2f] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Exemplary Damages & Case Reference */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold opacity-80">Exemplary Damages Claimed</label>
                  <input
                    type="text"
                    value={claimAmount}
                    onChange={(e) => setClaimAmount(e.target.value)}
                    className={`w-full p-2 rounded-lg border text-xs font-mono font-bold focus:outline-none ${
                      isDark ? 'bg-[#181c2f] border-slate-700 text-amber-400' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold opacity-80">Adversary Case Reference / Diary No.</label>
                  <input
                    type="text"
                    value={caseRef}
                    onChange={(e) => setCaseRef(e.target.value)}
                    className={`w-full p-2 rounded-lg border text-xs font-mono focus:outline-none ${
                      isDark ? 'bg-[#181c2f] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Factual Narrative of Malice */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold opacity-80">
                  Factual Narrative of Vexatious Motives & Lack of Probable Cause
                </label>
                <textarea
                  rows={4}
                  value={factsSummary}
                  onChange={(e) => setFactsSummary(e.target.value)}
                  className={`w-full p-3 rounded-lg border text-xs font-sans leading-relaxed focus:outline-none ${
                    isDark ? 'bg-[#181c2f] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {/* Advocate Particulars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold opacity-80">Advocate Name</label>
                  <input
                    type="text"
                    value={advocateName}
                    onChange={(e) => setAdvocateName(e.target.value)}
                    className={`w-full p-2 rounded-lg border text-xs font-medium focus:outline-none ${
                      isDark ? 'bg-[#181c2f] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold opacity-80">Enrolment No.</label>
                  <input
                    type="text"
                    value={advocateEnrolment}
                    onChange={(e) => setAdvocateEnrolment(e.target.value)}
                    className={`w-full p-2 rounded-lg border text-xs font-mono focus:outline-none ${
                      isDark ? 'bg-[#181c2f] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Generate Button */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating}
                className="w-full py-3 px-4 rounded-xl font-black text-xs bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:opacity-90 text-white flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {generating ? 'hourglass_top' : 'shield'}
                </span>
                <span>{generating ? 'Compiling Defensive Instrument...' : 'Re-Compile Counter-Strategy Instrument'}</span>
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
                        ⚖️ {prec}
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
            {/* Green Legal Ledger / Parchment Viewer */}
            <div className={`p-6 sm:p-10 rounded-2xl border shadow-xl overflow-x-auto ${
              isDark ? 'bg-[#0a0f0d] border-emerald-900/40 text-[#d1fae5]' : 'bg-[#f4fbf7] border-emerald-300 text-[#064e3b]'
            }`} style={{
              boxShadow: 'inset 0 0 40px rgba(16, 185, 129, 0.05)',
              fontFamily: 'Times New Roman, Times, Georgia, serif'
            }}>
              <div className="max-w-[760px] mx-auto space-y-4">
                <div className="border-l-4 border-emerald-600/60 pl-6 space-y-4">
                  <pre className="whitespace-pre-wrap font-serif text-[12.5pt] sm:text-[13pt] leading-[1.85] text-justify select-text">
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
export default CounterStrategyStudio;
