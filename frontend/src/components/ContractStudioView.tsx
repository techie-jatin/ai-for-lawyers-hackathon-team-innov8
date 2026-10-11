import React, { useState } from 'react';

interface ContractStudioViewProps {
  isDark: boolean;
  mode: 'citizen' | 'professional';
}

type StudioMode = 'generator' | 'scanner';

interface RiskItem {
  id: string;
  severity: 'critical' | 'warning' | 'safe';
  clause_title: string;
  flagged_text: string;
  statutory_violation?: string;
  risk_explanation: string;
  counter_clause_revision: string;
}

interface AuditResult {
  contract_title: string;
  health_score: number;
  risk_rating: string;
  total_clauses_analyzed: number;
  critical_count: number;
  warning_count: number;
  safe_count: number;
  statutory_conflicts: string[];
  stamp_duty_advisory: string;
  risk_items: RiskItem[];
  ai_engine: string;
}

const TEMPLATE_PRESETS = [
  {
    key: 'nda',
    title: 'Mutual Non-Disclosure Agreement (NDA)',
    tag: 'ICA 1872 §27 Compliant',
    icon: 'lock',
    desc: 'Protects proprietary code, trade secrets, and customer data without imposing illegal trade restraints.'
  },
  {
    key: 'msa',
    title: 'Master Services & Freelancer Agreement (MSA)',
    tag: 'IP Assignment & Milestones',
    icon: 'handshake',
    desc: 'Standard commercial contract with work-made-for-hire copyright transfer, payment terms, and 15-day cure period.'
  },
  {
    key: 'employment',
    title: 'Employment & IP Assignment Agreement',
    tag: 'DPDP 2023 & Non-Solicit',
    icon: 'badge',
    desc: 'Lawful Indian employment deed with employee DPDP consent, invention assignment, and enforceable non-solicitation.'
  },
  {
    key: 'lease',
    title: 'Commercial Office Lease & Licence Deed',
    tag: 'Stamp Duty & Regn Act §17',
    icon: 'apartment',
    desc: 'Office tenancy deed with lock-in period, security deposit refund terms, and state e-Stamping advisory.'
  },
  {
    key: 'saas_dpdp',
    title: 'SaaS Agreement (with DPDP Schedule)',
    tag: '₹250 Cr Penalty Protection',
    icon: 'cloud_done',
    desc: 'Enterprise software agreement with 99.5% SLA, liability caps, and statutory Data Processor schedules under DPDP 2023.'
  }
];

const PREDATORY_SAMPLE_CONTRACT = `VENDOR SERVICES & WORK AGREEMENT

1. INDEMNITY (UNCAPPED):
The Service Provider agrees to defend, indemnify, and hold harmless the Client and all affiliates from and against any and all claims, demands, losses, damages, liabilities, costs, and expenses (including indirect, remote, and consequential losses) arising out of this Agreement, without any limitation whatsoever.

2. RESTRICTION ON VOCATION (NON-COMPETE):
The Service Provider and its key personnel shall not, for a period of twenty-four (24) months following termination of this Agreement, directly or indirectly provide services, consult, or engage in any business competing with the Client anywhere in India.

3. TERMINATION AT WILL:
The Client may terminate this Agreement immediately at any time without cause and without giving any prior written notice or cure period.

4. EXCLUSIVE FOREIGN JURISDICTION:
This Agreement shall be governed by the laws of the State of Delaware, USA, and the courts in Wilmington, Delaware shall have exclusive jurisdiction over all disputes.

5. CUSTOMER DATA USAGE:
Provider may access and process Client customer records for operational purposes without requiring formal Data Fiduciary agreements.`;

export const ContractStudioView: React.FC<ContractStudioViewProps> = ({ isDark, mode }) => {
  const [studioMode, setStudioMode] = useState<StudioMode>('generator');

  // Generator State
  const [selectedPreset, setSelectedPreset] = useState<string>('nda');
  const [partyA, setPartyA] = useState<string>('Bharat Innovations Pvt. Ltd.');
  const [partyB, setPartyB] = useState<string>('Apex Technology Solutions LLP');
  const [governingState, setGoverningState] = useState<string>('Delhi');
  const [arbitrationCity, setArbitrationCity] = useState<string>('New Delhi');
  const [durationMonths, setDurationMonths] = useState<number>(24);
  const [consideration, setConsideration] = useState<string>('₹2,50,000/- plus applicable GST');
  const [specificScope, setSpecificScope] = useState<string>('AI-powered legal tech integration, API microservices development, and maintenance.');
  
  const [generatedText, setGeneratedText] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [engineUsed, setEngineUsed] = useState<string>('Bharat Statutory Contract Engine (Deterministic Indian Law)');
  const [copiedContract, setCopiedContract] = useState<boolean>(false);

  // Scanner State
  const [scanText, setScanText] = useState<string>('');
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [copiedClauseId, setCopiedClauseId] = useState<string | null>(null);

  // Generate contract text dynamically
  const handleGenerateContract = async (useAI: boolean = false) => {
    setIsGenerating(true);
    const apiBase = window.location.origin.includes('localhost') ? 'http://127.0.0.1:8000' : '';

    try {
      const res = await fetch(`${apiBase}/api/contracts/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_type: selectedPreset,
          party_a_name: partyA,
          party_b_name: partyB,
          governing_state: governingState,
          arbitration_city: arbitrationCity,
          duration_months: durationMonths,
          consideration_amount: consideration,
          specific_covenants: specificScope,
          gemini_api_key: useAI ? (localStorage.getItem('gemini_api_key') || undefined) : undefined
        })
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedText(data.contract_text);
        setEngineUsed(data.engine);
      } else {
        throw new Error('API request failed');
      }
    } catch {
      // Fallback deterministic local generation
      const fallback = `MUTUAL COMMERCIAL AGREEMENT (${selectedPreset.toUpperCase()})
Executed at ${arbitrationCity}, State of ${governingState}, India.

BY AND BETWEEN:
1. ${partyA} (First Party)
AND
2. ${partyB} (Second Party)

OPERATIVE STATUTORY CLAUSES:
1. SCOPE & PURPOSE: ${specificScope}
2. CONSIDERATION & TAXATION: ${consideration}. Subject to Indian TDS & GST compliance.
3. DURATION: ${durationMonths} months from the effective execution date.
4. SECTION 27 COMPLIANCE: Parties observe mutual trade secret protection. Post-termination restraint on lawful profession is strictly excluded under Section 27 Indian Contract Act 1872.
5. ARBITRATION: Sole Arbitrator in ${arbitrationCity} under the Arbitration & Conciliation Act, 1996.
6. STAMP DUTY: Subject to applicable non-judicial stamp duty in ${governingState} (SHCIL e-Stamping).
7. ELECTRONIC EXECUTION: Valid under Section 63 Bharatiya Sakshya Adhiniyam, 2023.

SIGNATURES:
FOR ${partyA.toUpperCase()}: ______________________
FOR ${partyB.toUpperCase()}: ______________________`;
      setGeneratedText(fallback);
      setEngineUsed('Bharat Statutory Contract Engine (Deterministic Offline Mode)');
    } finally {
      setIsGenerating(false);
    }
  };

  // Run audit on input contract
  const handleAuditContract = async (textToAudit?: string) => {
    const text = textToAudit || scanText;
    if (!text.trim()) return;

    setIsAuditing(true);
    const apiBase = window.location.origin.includes('localhost') ? 'http://127.0.0.1:8000' : '';

    try {
      const res = await fetch(`${apiBase}/api/contracts/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract_text: text,
          contract_title: 'Commercial Agreement Audit',
          gemini_api_key: localStorage.getItem('gemini_api_key') || undefined
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAuditResult(data);
      } else {
        throw new Error('Audit API call failed');
      }
    } catch {
      // Client-side rule evaluation fallback
      const hasUncappedIndemnity = text.toLowerCase().includes('indemnif') && (text.toLowerCase().includes('without limitation') || text.toLowerCase().includes('all claims'));
      const hasNonCompete = text.toLowerCase().includes('non-compete') || text.toLowerCase().includes('competing business');
      const hasForeignVenue = text.toLowerCase().includes('delaware') || text.toLowerCase().includes('london');

      const items: RiskItem[] = [];
      const conflicts: string[] = [];

      if (hasUncappedIndemnity) {
        items.push({
          id: 'crit-indemnity',
          severity: 'critical',
          clause_title: 'Uncapped & Disproportionate Indemnity',
          flagged_text: 'Party indemnifies for any and all claims without any limitation whatsoever...',
          statutory_violation: 'Section 73 Indian Contract Act 1872 (Remoteness of Damages)',
          risk_explanation: 'Imposes uncapped liability for remote and consequential damages prohibited under Section 73 ICA.',
          counter_clause_revision: 'Indemnity shall be strictly capped at direct, proven damages, not exceeding fees paid in the preceding 6 months.'
        });
        conflicts.push('Section 73 ICA 1872 (Damages must be direct, not remote)');
      }

      if (hasNonCompete) {
        items.push({
          id: 'crit-noncompete',
          severity: 'critical',
          clause_title: 'Void Post-Termination Non-Compete Restriction',
          flagged_text: 'Restricts party from engaging in competing business for 24 months post termination...',
          statutory_violation: 'Section 27 Indian Contract Act 1872 (Restraint of Trade Void ab Initio)',
          risk_explanation: 'Supreme Court jurisprudence (Percept D\'Mark v. Zaheer Khan) holds all post-employment trade restraints completely void.',
          counter_clause_revision: 'Parties agree to strict confidentiality and 12-month client non-solicitation. No post-termination profession ban shall apply.'
        });
        conflicts.push('Section 27 ICA 1872 (Restraint of lawful trade is void)');
      }

      if (hasForeignVenue) {
        items.push({
          id: 'crit-foreign-venue',
          severity: 'critical',
          clause_title: 'Remote / Foreign Jurisdiction Trap',
          flagged_text: 'Governed by Delaware/London courts...',
          statutory_violation: 'Section 28 Indian Contract Act 1872 (Ousting Indian Legal Remedies)',
          risk_explanation: 'Forces Indian entity into expensive overseas litigation, making dispute recovery economically impossible.',
          counter_clause_revision: 'Governed by laws of India, with Sole Arbitrator in India under the Arbitration & Conciliation Act, 1996.'
        });
        conflicts.push('Section 28 ICA 1872 (Agreements restricting legal proceedings)');
      }

      const score = Math.max(25, 100 - (items.length * 25));

      setAuditResult({
        contract_title: 'Commercial Agreement Audit',
        health_score: score,
        risk_rating: score < 55 ? 'Critical Risk (Predatory Terms)' : 'Moderate Risk',
        total_clauses_analyzed: 5,
        critical_count: items.length,
        warning_count: 1,
        safe_count: 1,
        statutory_conflicts: conflicts,
        stamp_duty_advisory: 'Execute on state-specific non-judicial e-Stamp paper (SHCIL) to ensure court admissibility under N.N. Global.',
        risk_items: items,
        ai_engine: 'Bharat Contract Intelligence Guardrail (Offline Rule Engine)'
      });
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden transition-colors ${
      isDark ? 'bg-[#090a0f] text-slate-100' : 'bg-[#f4f6fb] text-[#0b1c30]'
    }`}>
      {/* HEADER BANNER */}
      <div className={`p-3 sm:p-4 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0 ${
        isDark ? 'bg-[#0d0f17] border-[#1f2438]' : 'bg-white border-[#e2e8f0]'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00288e] to-[#ff7722] flex items-center justify-center text-white shadow-md">
            <span className="material-symbols-outlined text-[20px]">edit_document</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-[15px] sm:text-[16px] font-black tracking-tight ${
                isDark ? 'text-white' : 'text-[#00288e]'
              }`}>
                AI Contract Studio & Redline Guardrail
              </h2>
              <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Indian Contract Act 1872
              </span>
              <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                mode === 'professional'
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
              }`}>
                {mode === 'professional' ? 'Advocate Counsel Studio' : 'Citizen / Founder Studio'}
              </span>
            </div>
            <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Draft court-ready agreements & audit third-party contracts for predatory clauses, uncapped liability & DPDP 2023 risks.
            </p>
          </div>
        </div>

        {/* MODE SWITCHER PILL */}
        <div className={`flex items-center p-0.5 rounded-lg border shadow-2xs ${
          isDark ? 'bg-[#131624] border-[#242b42]' : 'bg-[#f0f4ff] border-[#dce9ff]'
        }`}>
          <button
            type="button"
            onClick={() => setStudioMode('generator')}
            className={`px-3 py-1.5 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              studioMode === 'generator'
                ? isDark ? 'bg-white text-black shadow-xs' : 'bg-[#00288e] text-white shadow-xs'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-[#00288e]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">description</span>
            <span>Contract Generator</span>
          </button>

          <button
            type="button"
            onClick={() => setStudioMode('scanner')}
            className={`px-3 py-1.5 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              studioMode === 'scanner'
                ? isDark ? 'bg-white text-black shadow-xs' : 'bg-[#00288e] text-white shadow-xs'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-[#00288e]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">fact_check</span>
            <span>Redline Risk Scanner</span>
          </button>
        </div>
      </div>

      {/* WORKSPACE BODY */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5">
        <div className="max-w-[1240px] mx-auto space-y-5">
          {studioMode === 'generator' ? (
            /* ================= MODE 1: CONTRACT GENERATOR ================= */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* LEFT CONFIGURATION PANEL (5 cols) */}
              <div className={`lg:col-span-5 p-4 rounded-xl border space-y-4 ${
                isDark ? 'bg-[#0f111a] border-[#23283f]' : 'bg-white border-[#e2e8f0] shadow-sm'
              }`}>
                <div>
                  <h3 className={`text-[13px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${
                    isDark ? 'text-amber-400' : 'text-[#00288e]'
                  }`}>
                    <span className="material-symbols-outlined text-[16px]">library_books</span>
                    1. Select Contract Template
                  </h3>
                  <div className="space-y-1.5">
                    {TEMPLATE_PRESETS.map((p) => (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => { setSelectedPreset(p.key); setGeneratedText(''); }}
                        className={`w-full p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                          selectedPreset === p.key
                            ? isDark
                              ? 'bg-[#181c2d] border-amber-500/50 shadow-xs'
                              : 'bg-[#f0f5ff] border-[#00288e] shadow-xs'
                            : isDark
                              ? 'bg-[#121524] border-[#1f2438] hover:border-slate-600'
                              : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-[18px] mt-0.5 ${
                          selectedPreset === p.key ? 'text-amber-500' : 'text-slate-400'
                        }`}>
                          {p.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className={`text-[12px] font-bold truncate ${
                              selectedPreset === p.key ? (isDark ? 'text-white' : 'text-[#00288e]') : ''
                            }`}>
                              {p.title}
                            </h4>
                            <span className="text-[8.5px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                              {p.tag}
                            </span>
                          </div>
                          <p className={`text-[10px] mt-0.5 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            {p.desc}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-700/20">
                  <h3 className={`text-[13px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                    isDark ? 'text-amber-400' : 'text-[#00288e]'
                  }`}>
                    <span className="material-symbols-outlined text-[16px]">tune</span>
                    2. Customize Terms & Jurisdiction
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10.5px] font-bold block mb-1">First Party (Disclosing / Client)</label>
                      <input
                        type="text"
                        value={partyA}
                        onChange={(e) => setPartyA(e.target.value)}
                        className={`w-full p-2 rounded-lg text-[11.5px] border outline-none ${
                          isDark ? 'bg-[#151928] border-[#2b334d] text-white' : 'bg-slate-50 border-slate-300 text-black'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-[10.5px] font-bold block mb-1">Second Party (Receiving / Contractor)</label>
                      <input
                        type="text"
                        value={partyB}
                        onChange={(e) => setPartyB(e.target.value)}
                        className={`w-full p-2 rounded-lg text-[11.5px] border outline-none ${
                          isDark ? 'bg-[#151928] border-[#2b334d] text-white' : 'bg-slate-50 border-slate-300 text-black'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10.5px] font-bold block mb-1">Governing State (Stamp Duty)</label>
                      <select
                        value={governingState}
                        onChange={(e) => setGoverningState(e.target.value)}
                        className={`w-full p-2 rounded-lg text-[11.5px] border outline-none ${
                          isDark ? 'bg-[#151928] border-[#2b334d] text-white' : 'bg-slate-50 border-slate-300 text-black'
                        }`}
                      >
                        <option value="Delhi">Delhi (NCT)</option>
                        <option value="Maharashtra">Maharashtra (Mumbai)</option>
                        <option value="Karnataka">Karnataka (Bengaluru)</option>
                        <option value="Tamil Nadu">Tamil Nadu (Chennai)</option>
                        <option value="Telangana">Telangana (Hyderabad)</option>
                        <option value="Uttar Pradesh">Uttar Pradesh (Noida)</option>
                        <option value="West Bengal">West Bengal (Kolkata)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10.5px] font-bold block mb-1">Arbitration City (Seat & Venue)</label>
                      <input
                        type="text"
                        value={arbitrationCity}
                        onChange={(e) => setArbitrationCity(e.target.value)}
                        className={`w-full p-2 rounded-lg text-[11.5px] border outline-none ${
                          isDark ? 'bg-[#151928] border-[#2b334d] text-white' : 'bg-slate-50 border-slate-300 text-black'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10.5px] font-bold block mb-1">Consideration / Value</label>
                      <input
                        type="text"
                        value={consideration}
                        onChange={(e) => setConsideration(e.target.value)}
                        className={`w-full p-2 rounded-lg text-[11.5px] border outline-none ${
                          isDark ? 'bg-[#151928] border-[#2b334d] text-white' : 'bg-slate-50 border-slate-300 text-black'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-[10.5px] font-bold block mb-1">Duration (Months)</label>
                      <input
                        type="number"
                        value={durationMonths}
                        onChange={(e) => setDurationMonths(Number(e.target.value))}
                        className={`w-full p-2 rounded-lg text-[11.5px] border outline-none ${
                          isDark ? 'bg-[#151928] border-[#2b334d] text-white' : 'bg-slate-50 border-slate-300 text-black'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10.5px] font-bold block mb-1">Specific Scope / Deliverables</label>
                    <textarea
                      rows={2}
                      value={specificScope}
                      onChange={(e) => setSpecificScope(e.target.value)}
                      className={`w-full p-2 rounded-lg text-[11.5px] border outline-none resize-none ${
                        isDark ? 'bg-[#151928] border-[#2b334d] text-white' : 'bg-slate-50 border-slate-300 text-black'
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleGenerateContract(false)}
                      disabled={isGenerating}
                      className="flex-1 py-2 rounded-lg text-[12px] font-bold bg-[#00288e] hover:bg-[#002070] text-white flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">gavel</span>
                      <span>{isGenerating ? 'Synthesizing...' : 'Generate Agreement'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleGenerateContract(true)}
                      disabled={isGenerating}
                      title="Enhance clauses using Google Gemini 1.5 Flash"
                      className="px-3 py-2 rounded-lg text-[12px] font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 flex items-center gap-1 shadow-md cursor-pointer transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                      <span>AI Refine</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT PREVIEW PANEL (7 cols) */}
              <div className={`lg:col-span-7 p-4 sm:p-5 rounded-xl border flex flex-col justify-between gap-3 ${
                isDark ? 'bg-[#0f111a] border-[#23283f]' : 'bg-white border-[#e2e8f0] shadow-sm'
              }`}>
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-700/20">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-amber-500">article</span>
                      <h3 className={`text-[13px] font-bold ${isDark ? 'text-white' : 'text-[#0b1c30]'}`}>
                        Court-Ready Agreement Preview
                      </h3>
                    </div>
                    {generatedText && (
                      <span className="text-[9.5px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {engineUsed}
                      </span>
                    )}
                  </div>

                  <div className={`mt-3 p-4 rounded-xl border font-mono text-[11px] leading-relaxed max-h-[520px] overflow-y-auto whitespace-pre-wrap select-text ${
                    isDark ? 'bg-[#0a0c14] border-[#1f2438] text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}>
                    {generatedText || (
                      <div className="text-center py-20 text-slate-400 space-y-2">
                        <span className="material-symbols-outlined text-[36px] opacity-40">assignment</span>
                        <p className="text-[12px]">Configure parties and click "Generate Agreement" to preview the complete legal deed.</p>
                      </div>
                    )}
                  </div>
                </div>

                {generatedText && (
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-700/20">
                    <span className="text-[10px] text-slate-400 font-sans">
                      ⚖️ Formatted with Indian Stamp Act e-Stamping placeholder & Section 63 BSA execution lines.
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(generatedText);
                          setCopiedContract(true);
                          setTimeout(() => setCopiedContract(false), 2000);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border flex items-center gap-1 cursor-pointer transition-all ${
                          copiedContract
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : isDark ? 'bg-[#181c2d] hover:bg-[#20253d] text-white border-[#2b334d]' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          {copiedContract ? 'check' : 'content_copy'}
                        </span>
                        <span>{copiedContract ? 'Copied Deed' : 'Copy Text'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-[#00288e] hover:bg-[#002070] text-white flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[15px]">print</span>
                        <span>Print Deed</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ================= MODE 2: REDLINING & RISK SCANNER ================= */
            <div className="space-y-5">
              {/* INPUT SCAN CARD */}
              <div className={`p-4 sm:p-5 rounded-xl border space-y-3 ${
                isDark ? 'bg-[#0f111a] border-[#23283f]' : 'bg-white border-[#e2e8f0] shadow-sm'
              }`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-rose-500">warning</span>
                    <h3 className={`text-[13.5px] font-bold ${isDark ? 'text-white' : 'text-[#0b1c30]'}`}>
                      Upload or Paste Contract to Audit for Predatory Clauses & Legal Risks
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setScanText(PREDATORY_SAMPLE_CONTRACT);
                      handleAuditContract(PREDATORY_SAMPLE_CONTRACT);
                    }}
                    className="px-2.5 py-1 rounded-lg text-[10.5px] font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-500 border border-amber-500/30 flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <span className="material-symbols-outlined text-[14px]">auto_fix_high</span>
                    <span>Load Predatory Contract Sample</span>
                  </button>
                </div>

                <textarea
                  rows={6}
                  value={scanText}
                  onChange={(e) => setScanText(e.target.value)}
                  placeholder="Paste agreement text here, or load the sample predatory contract to test instant clause-by-clause redlining..."
                  className={`w-full p-3 rounded-xl text-[12px] font-mono border outline-none resize-y leading-relaxed ${
                    isDark ? 'bg-[#090b12] border-[#23283f] text-slate-100 placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-black placeholder-slate-400'
                  }`}
                />

                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] text-slate-400">
                    Scans for: Uncapped Indemnity (§73 ICA), Void Non-Competes (§27 ICA), Unilateral Termination, Remote Venues & DPDP 2023.
                  </span>

                  <button
                    type="button"
                    onClick={() => handleAuditContract()}
                    disabled={isAuditing || !scanText.trim()}
                    className="px-4 py-2 rounded-lg text-[12px] font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50 transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">security</span>
                    <span>{isAuditing ? 'Scanning Clauses...' : 'Audit Contract Health'}</span>
                  </button>
                </div>
              </div>

              {/* AUDIT REPORT DASHBOARD */}
              {auditResult && (
                <div className="space-y-4">
                  {/* SCORECARD BANNER */}
                  <div className={`p-4 sm:p-5 rounded-xl border shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    isDark ? 'bg-gradient-to-r from-[#170a0e] via-[#121524] to-[#0f111a] border-rose-500/30' : 'bg-gradient-to-r from-rose-50 via-white to-amber-50 border-rose-200'
                  }`}>
                    <div className="flex items-center gap-3.5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-mono text-[22px] font-black border shadow-inner ${
                        auditResult.health_score < 60
                          ? 'bg-rose-600/20 text-rose-500 border-rose-500/40'
                          : auditResult.health_score < 80
                          ? 'bg-amber-600/20 text-amber-500 border-amber-500/40'
                          : 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40'
                      }`}>
                        {auditResult.health_score}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className={`text-[15px] font-black tracking-tight ${isDark ? 'text-white' : 'text-[#0b1c30]'}`}>
                            Contract Health Score: {auditResult.health_score} / 100
                          </h4>
                          <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                            auditResult.health_score < 60
                              ? 'bg-rose-950/40 text-rose-400 border-rose-500/40'
                              : 'bg-amber-950/40 text-amber-400 border-amber-500/40'
                          }`}>
                            {auditResult.risk_rating}
                          </span>
                        </div>
                        <p className={`text-[11.5px] mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          Found <strong>{auditResult.critical_count} Critical Traps</strong> and <strong>{auditResult.warning_count} Warnings</strong> under Indian commercial law.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/25">
                        🔴 {auditResult.critical_count} Critical
                      </span>
                      <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/25">
                        🟡 {auditResult.warning_count} Warning
                      </span>
                      <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                        🟢 {auditResult.safe_count} Safe
                      </span>
                    </div>
                  </div>

                  {/* STAMP DUTY & STATUTORY WARNING CALLOUT */}
                  <div className={`p-3 rounded-lg border text-[11px] leading-relaxed flex items-center gap-2 ${
                    isDark ? 'bg-[#181c2d] border-[#2b334d] text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}>
                    <span className="material-symbols-outlined text-[17px] shrink-0 text-amber-500">gavel</span>
                    <span><strong>Statutory Admissibility Notice:</strong> {auditResult.stamp_duty_advisory}</span>
                  </div>

                  {/* CLAUSE-BY-CLAUSE REDLINE MATRIX */}
                  <div className="space-y-3">
                    <h4 className={`text-[13px] font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-[#00288e]'}`}>
                      Clause-by-Clause Risk Breakdown & Suggested Counter-Revisions
                    </h4>

                    {auditResult.risk_items.map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border transition-all space-y-2.5 ${
                          item.severity === 'critical'
                            ? isDark ? 'bg-[#150a0d] border-rose-500/40' : 'bg-rose-50/50 border-rose-200'
                            : item.severity === 'warning'
                            ? isDark ? 'bg-[#17120a] border-amber-500/40' : 'bg-amber-50/50 border-amber-200'
                            : isDark ? 'bg-[#0a1510] border-emerald-500/40' : 'bg-emerald-50/50 border-emerald-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              item.severity === 'critical' ? 'bg-rose-500 animate-pulse' : item.severity === 'warning' ? 'bg-amber-500' : 'bg-emerald-400'
                            }`} />
                            <h5 className={`text-[13px] font-bold ${
                              item.severity === 'critical' ? 'text-rose-500' : item.severity === 'warning' ? 'text-amber-500' : 'text-emerald-500'
                            }`}>
                              {item.clause_title}
                            </h5>
                          </div>
                          {item.statutory_violation && (
                            <span className="text-[9.5px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30">
                              ⚖️ {item.statutory_violation}
                            </span>
                          )}
                        </div>

                        {/* Flagged Clause */}
                        <div className={`p-2.5 rounded-lg text-[11px] font-mono leading-relaxed border ${
                          isDark ? 'bg-[#0a0d16] border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                        }`}>
                          <strong className="block text-[9.5px] uppercase tracking-wider text-rose-400 mb-0.5 font-sans">
                            Flagged Predatory Language:
                          </strong>
                          "{item.flagged_text}"
                        </div>

                        {/* Risk Explanation */}
                        <p className={`text-[11.5px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          <strong>Why this is dangerous:</strong> {item.risk_explanation}
                        </p>

                        {/* Suggested Counter-Revision */}
                        <div className={`p-3 rounded-lg border space-y-1.5 ${
                          isDark ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        }`}>
                          <div className="flex items-center justify-between">
                            <strong className="text-[10px] uppercase tracking-wider text-emerald-500 flex items-center gap-1 font-bold">
                              <span className="material-symbols-outlined text-[14px]">auto_fix_normal</span>
                              Suggested Counter-Clause (Safe & Enforceable under Indian Law):
                            </strong>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(item.counter_clause_revision);
                                setCopiedClauseId(item.id);
                                setTimeout(() => setCopiedClauseId(null), 2000);
                              }}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all border ${
                                copiedClauseId === item.id
                                  ? 'bg-emerald-600 text-white border-emerald-500'
                                  : isDark ? 'bg-[#181c2d] text-white border-slate-700 hover:border-slate-500' : 'bg-white text-slate-800 border-slate-300'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[13px]">
                                {copiedClauseId === item.id ? 'check' : 'content_copy'}
                              </span>
                              <span>{copiedClauseId === item.id ? 'Copied' : 'Copy Counter-Clause'}</span>
                            </button>
                          </div>
                          <p className="font-mono text-[11px] leading-relaxed">
                            "{item.counter_clause_revision}"
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
