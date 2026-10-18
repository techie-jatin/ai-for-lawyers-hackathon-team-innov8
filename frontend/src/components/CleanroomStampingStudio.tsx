import { useState } from 'react';
import {
  CLIENT_STATE_STAMP_DIRECTORY,
  CLIENT_CLEANROOM_PRESETS,
  type CleanroomPreset,
  type CleanroomRewriteResult,
  rewriteClientCleanroomClause
} from '../services/clientCleanroomEngine';

interface CleanroomStampingStudioProps {
  isDark: boolean;
  apiBase?: string;
  onClose?: () => void;
}

export function CleanroomStampingStudio({
  isDark,
  apiBase = 'http://localhost:8000',
  onClose
}: CleanroomStampingStudioProps) {
  const [activeTab, setActiveTab] = useState<'cleanroom' | 'stamping'>('cleanroom');

  // Clean-Room State
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>('void_non_compete');
  const [clauseInput, setClauseInput] = useState<string>(
    'The Employee / Service Provider shall not, for a period of twenty-four (24) months following termination of this Agreement, directly or indirectly provide services, consult, or engage in any business competing with the Client anywhere in India.'
  );
  const [rewriteResult, setRewriteResult] = useState<CleanroomRewriteResult>(() =>
    rewriteClientCleanroomClause(clauseInput, 'void_non_compete')
  );
  const [isRewriting, setIsRewriting] = useState(false);
  const [copiedClause, setCopiedClause] = useState(false);
  const [copiedTalkTrack, setCopiedTalkTrack] = useState(false);

  // e-Stamping Directory State
  const [selectedState, setSelectedState] = useState<string>('Delhi');
  const [selectedDocType, setSelectedDocType] = useState<'commercial' | 'lease' | 'nda' | 'service'>('commercial');

  const currentStampData = CLIENT_STATE_STAMP_DIRECTORY[selectedState] || CLIENT_STATE_STAMP_DIRECTORY['Delhi'];

  const handleSelectPreset = (p: CleanroomPreset) => {
    setSelectedPresetKey(p.key);
    let sample = '';
    if (p.key === 'void_non_compete') {
      sample = 'The Employee shall not engage in or start any competing business for 24 months post termination anywhere in the Republic of India.';
    } else if (p.key === 'uncapped_indemnity') {
      sample = 'Service Provider agrees to indemnify, defend, and hold harmless Client from any and all claims, demands, liabilities, and consequential or remote losses without limitation whatsoever.';
    } else if (p.key === 'penal_forfeiture') {
      sample = 'The caution security deposit of ₹35,000/- will only be adjusted on completion of 10 months and is strictly non-refundable upon premature exit under any circumstances.';
    } else if (p.key === 'unilateral_termination') {
      sample = 'Client reserves the absolute right to terminate this agreement immediately at its sole discretion without cause and without giving any prior notice or opportunity to cure.';
    } else {
      sample = 'This Agreement shall be governed exclusively by the laws of the State of Delaware, USA, and the courts in Wilmington, Delaware shall have exclusive jurisdiction.';
    }
    setClauseInput(sample);
    setRewriteResult(rewriteClientCleanroomClause(sample, p.key));
  };

  const handleRewrite = async () => {
    setIsRewriting(true);
    try {
      const res = await fetch(`${apiBase}/api/contracts/cleanroom/rewrite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clause_text: clauseInput,
          preset_key: selectedPresetKey
        })
      });
      if (res.ok) {
        const data = await res.json();
        setRewriteResult(data);
      } else {
        setRewriteResult(rewriteClientCleanroomClause(clauseInput, selectedPresetKey));
      }
    } catch {
      setRewriteResult(rewriteClientCleanroomClause(clauseInput, selectedPresetKey));
    } finally {
      setIsRewriting(false);
    }
  };

  const handleCopyClause = () => {
    navigator.clipboard.writeText(rewriteResult.clean_clause);
    setCopiedClause(true);
    setTimeout(() => setCopiedClause(false), 2000);
  };

  const handleCopyTalkTrack = () => {
    navigator.clipboard.writeText(rewriteResult.negotiation_talk_track);
    setCopiedTalkTrack(true);
    setTimeout(() => setCopiedTalkTrack(false), 2000);
  };

  const getDocTypeRate = () => {
    switch (selectedDocType) {
      case 'commercial':
        return currentStampData.commercial_rate;
      case 'lease':
        return currentStampData.lease_rate;
      case 'nda':
        return currentStampData.nda_rate;
      case 'service':
        return currentStampData.service_agreement_rate;
      default:
        return currentStampData.commercial_rate;
    }
  };

  return (
    <div className={`flex flex-col h-full rounded-2xl overflow-hidden border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
      {/* Studio Header */}
      <div className={`p-4 sm:p-5 border-b flex flex-wrap items-center justify-between gap-3 ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🛡️</span>
            <h2 className={`font-bold text-lg sm:text-xl tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Clean-Room Clause Rewriter & e-Stamping Directory
            </h2>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              Indian Contract Act §27, §73, §74 & N.N. Global
            </span>
          </div>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Decompile predatory boilerplate terms into balanced, court-enforceable clauses and calculate state-by-state e-stamp duty compliance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub-view switcher */}
          <div className={`flex p-0.5 rounded-lg border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
            <button
              onClick={() => setActiveTab('cleanroom')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'cleanroom'
                  ? isDark ? 'bg-amber-600 text-white' : 'bg-[#00288e] text-white shadow-xs'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-black'
              }`}
            >
              ✍️ Clean-Room Rewriter
            </button>
            <button
              onClick={() => setActiveTab('stamping')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'stamping'
                  ? isDark ? 'bg-amber-600 text-white' : 'bg-[#00288e] text-white shadow-xs'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-black'
              }`}
            >
              📜 10-State e-Stamping
            </button>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {activeTab === 'cleanroom' ? (
          /* ================= SUB-VIEW 1: CLEAN-ROOM CLAUSE REWRITER ================= */
          <div className="space-y-6 max-w-6xl mx-auto">
            {/* Preset Selector Grid */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-75">
                Select Predatory Clause Archetype:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                {CLIENT_CLEANROOM_PRESETS.map(p => {
                  const isSelected = p.key === selectedPresetKey;
                  return (
                    <button
                      key={p.key}
                      onClick={() => handleSelectPreset(p)}
                      className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/40 shadow-xs'
                          : isDark
                          ? 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="text-[11px] font-bold leading-tight">
                        {p.title.split('->')[0].trim()}
                      </div>
                      <div className="text-[9.5px] font-mono text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                        {p.statutory_violation.split('(')[0]}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input & Redline Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Flagged Clause Input */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Flagged Predatory Clause (Counterparty Term)
                  </span>
                  <span className="text-[10px] font-mono opacity-60">Paste from draft contract</span>
                </div>

                <textarea
                  rows={8}
                  value={clauseInput}
                  onChange={e => setClauseInput(e.target.value)}
                  placeholder="Paste counterparty's clause here..."
                  className={`w-full text-xs p-3.5 rounded-xl border outline-none leading-relaxed font-mono ${
                    isDark ? 'bg-slate-950 border-red-900/40 text-red-200 focus:border-red-500' : 'bg-red-50/50 border-red-200 text-red-950 focus:border-red-400'
                  }`}
                />

                <button
                  onClick={handleRewrite}
                  disabled={isRewriting}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isRewriting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Decompiling & Clean-Room Rewriting...
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      Generate Clean-Room Counter-Clause
                    </>
                  )}
                </button>

                {/* Statutory Basis Box */}
                <div className={`p-3.5 rounded-xl border text-xs leading-relaxed space-y-1.5 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                }`}>
                  <div className="text-[10.5px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Statutory Ground of Invalidity:
                  </div>
                  <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                    {rewriteResult.statutory_violation}
                  </div>
                  <p className="text-[11px] opacity-85">
                    {rewriteResult.rationale}
                  </p>
                </div>
              </div>

              {/* Right Column: Clean-Room Replacement & Negotiation Talk-Track */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Clean-Room Balanced Replacement (Court-Enforceable)
                  </span>
                  <button
                    onClick={handleCopyClause}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500"
                  >
                    {copiedClause ? '✓ Copied!' : '📋 Copy Clean Clause'}
                  </button>
                </div>

                {/* Clean Clause Box */}
                <div className={`p-4 rounded-xl border font-serif text-[13px] leading-relaxed select-text shadow-sm ${
                  isDark ? 'bg-slate-950/80 border-emerald-900/50 text-slate-100' : 'bg-emerald-50/40 border-emerald-200 text-slate-900'
                }`}>
                  {rewriteResult.clean_clause}
                </div>

                {/* Tactical Negotiation Talk-Track */}
                <div className={`p-4 rounded-xl border space-y-2 ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                      <span>💬</span>
                      Counsel / Founder Redline Comment (Send to Counterparty)
                    </span>
                    <button
                      onClick={handleCopyTalkTrack}
                      className={`px-2 py-1 rounded text-[11px] font-semibold border transition-colors ${
                        copiedTalkTrack
                          ? 'bg-blue-600 text-white border-blue-600'
                          : isDark
                          ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                          : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {copiedTalkTrack ? '✓ Copied' : 'Copy Redline Note'}
                    </button>
                  </div>
                  <div className={`p-3 rounded-lg text-xs leading-relaxed italic ${
                    isDark ? 'bg-slate-950 text-blue-200' : 'bg-blue-50/60 text-blue-950'
                  }`}>
                    {rewriteResult.negotiation_talk_track}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ================= SUB-VIEW 2: 10-STATE E-STAMPING DIRECTORY ================= */
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* State Selector Buttons */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-75">
                Select Jurisdiction / State of Execution:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {Object.keys(CLIENT_STATE_STAMP_DIRECTORY).map(st => {
                  const isSelected = st === selectedState;
                  return (
                    <button
                      key={st}
                      onClick={() => setSelectedState(st)}
                      className={`p-2.5 rounded-xl text-center border font-semibold text-xs transition-all ${
                        isSelected
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                          : isDark
                          ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {st}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Document Type Selector */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold opacity-75 mr-2">Instrument Type:</span>
              {[
                { key: 'commercial', label: 'Commercial Contract (General)' },
                { key: 'lease', label: 'Commercial Lease / Licence' },
                { key: 'nda', label: 'NDA / Confidentiality Deed' },
                { key: 'service', label: 'Services / MSA Agreement' }
              ].map(d => (
                <button
                  key={d.key}
                  onClick={() => setSelectedDocType(d.key as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    selectedDocType === d.key
                      ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                      : isDark
                      ? 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                      : 'border-slate-300 bg-white text-slate-600 hover:text-black'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* Official State Stamp Duty Dossier Card */}
            <div className={`p-6 rounded-2xl border space-y-5 shadow-sm ${
              isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
            }`}>
              <div className="flex flex-wrap items-center justify-between border-b pb-4 gap-3 border-slate-200 dark:border-slate-800">
                <div>
                  <div className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-bold uppercase">
                    Official Stamp Schedule Reference
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    {currentStampData.state_name} — {currentStampData.governing_act}
                  </h3>
                </div>
                <div className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                  {currentStampData.online_facility.split('/')[0]}
                </div>
              </div>

              {/* Rate Callout Banner */}
              <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                isDark ? 'bg-amber-950/20 border-amber-500/30 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}>
                <div>
                  <div className="text-[10.5px] uppercase font-bold tracking-wider opacity-75">
                    Mandatory Stamp Duty Payable:
                  </div>
                  <div className="text-base sm:text-lg font-mono font-bold mt-0.5">
                    {getDocTypeRate()}
                  </div>
                </div>
                <div className="text-xs font-sans opacity-85">
                  e-Stamp Paper (SHCIL / State Treasury)
                </div>
              </div>

              {/* Portal & Admissibility Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border space-y-1.5 ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                    <span>🌐</span>
                    Official Authorized e-Stamping Portal
                  </div>
                  <p className="text-xs font-mono font-medium">
                    {currentStampData.stamping_portal}
                  </p>
                  <p className="text-[11px] opacity-75">
                    Facility: {currentStampData.online_facility}
                  </p>
                </div>

                <div className={`p-4 rounded-xl border space-y-1.5 ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <span>⚖️</span>
                    Judicial Admissibility Benchmark (N.N. Global)
                  </div>
                  <p className="text-xs leading-relaxed">
                    {currentStampData.admissibility_mandate}
                  </p>
                </div>
              </div>

              {/* Statutory Regularization Notice */}
              <div className="border-t pt-4 border-slate-200 dark:border-slate-800 text-[11px] font-mono leading-relaxed opacity-75">
                <strong>Statutory Advisory:</strong> Pursuant to Sections 33 & 35 of the Indian Stamp Act, 1899 and the Constitution Bench judgment in <em>N.N. Global Mercantile v. Indo Unique Flame Ltd.</em> [2023] INSC 1066, an unstamped commercial instrument cannot be acted upon or admitted in evidence by courts or arbitrators until regularized before the Collector with deficit stamp duty and statutory penalty.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default CleanroomStampingStudio;
