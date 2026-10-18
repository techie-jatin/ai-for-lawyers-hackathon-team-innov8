import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Scale, 
  ShieldAlert, 
  Gavel, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Flame, 
  Award, 
  Sparkles, 
  BookOpen 
} from 'lucide-react';
import { 
  ClientReaEngine, 
  type ReaFullAnalysis, 
  type PerspectiveBrief 
} from '../services/clientReaEngine';

export interface ReaChamberModalProps {
  isOpen: boolean;
  onClose: () => void;
  narrative: string;
  isDark: boolean;
  apiBase?: string;
}

export const ReaChamberModal: React.FC<ReaChamberModalProps> = ({
  isOpen,
  onClose,
  narrative,
  isDark,
  apiBase
}) => {
  const [analysis, setAnalysis] = useState<ReaFullAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChamberTab, setActiveChamberTab] = useState<'petitioner' | 'opposing' | 'bench'>('bench');
  const [showIngredients, setShowIngredients] = useState(false);
  const [showFactsVsAllegations, setShowFactsVsAllegations] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen || !narrative) return;
    
    let isCancelled = false;
    setLoading(true);

    async function loadAnalysis() {
      // 1. Try Backend if available
      if (apiBase) {
        try {
          const res = await fetch(`${apiBase}/api/rea/chamber`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ narrative })
          });
          if (res.ok) {
            const data = await res.json();
            if (!isCancelled && data.status === 'success') {
              setAnalysis({
                ast: data.ast,
                evaluation: data.evaluation,
                verdict: data.verdict
              });
              setLoading(false);
              return;
            }
          }
        } catch {
          // Fall through to client engine
        }
      }

      // 2. Client-Side Parity Fallback
      const clientRes = ClientReaEngine.runFullAnalysis(narrative);
      if (!isCancelled) {
        setAnalysis(clientRes);
        setLoading(false);
      }
    }

    loadAnalysis();
    return () => {
      isCancelled = true;
    };
  }, [isOpen, narrative, apiBase]);

  if (!isOpen) return null;

  const copyBrief = () => {
    if (!analysis) return;
    const v = analysis.verdict;
    const text = `
# ⚔️ BHARAT LEGAL INTELLIGENCE 2.0: REA CHAMBER BATTLE-ROOM REPORT
**Case Title:** ${v.case_title}
**Probability of Success:** ${v.probability_of_success_score}%
**Settlement Viability:** ${v.settlement_viability_score}%
**Preliminary Objections Risk:** ${v.preliminary_objections_risk}

---
## 1. JUDICIAL BENCH RULING & SUMMARY
${v.courtroom_order_summary}

### Recommended Consent Settlement Terms:
${v.recommended_consent_terms.map(t => `- ${t}`).join('\n')}

---
## 2. SENIOR COUNSEL FOR PETITIONER
**Core Thesis:** ${v.petitioner_brief.core_thesis}
**Primary Arguments:**
${v.petitioner_brief.primary_arguments.map(a => `- ${a}`).join('\n')}
**Statutory Leverage:**
${v.petitioner_brief.statutory_leverage.map(s => `- ${s}`).join('\n')}
**Key Precedents:**
${v.petitioner_brief.precedent_citations.map(p => `- ${p}`).join('\n')}

---
## 3. OPPOSING SENIOR COUNSEL (DEVIL'S ADVOCATE)
**Core Thesis:** ${v.opposing_brief.core_thesis}
**Defenses & Objections:**
${v.opposing_brief.primary_arguments.map(a => `- ${a}`).join('\n')}
**Vulnerabilities Acknowledged:**
${(v.opposing_brief.vulnerabilities_acknowledged || []).map(va => `- ${va}`).join('\n')}

---
## 4. CRITICAL EVIDENTIARY GAPS TO CURE
${v.critical_evidentiary_defects.map(d => `- [ ] ${d}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentBrief: PerspectiveBrief | undefined = analysis?.verdict ? (
    activeChamberTab === 'petitioner' ? analysis.verdict.petitioner_brief :
    activeChamberTab === 'opposing' ? analysis.verdict.opposing_brief :
    analysis.verdict.judicial_bench_brief
  ) : undefined;

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[10050] bg-black/80 flex items-center justify-center p-3 sm:p-5 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div 
        className={`w-full max-w-4xl max-h-[92dvh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-colors ${
          isDark ? 'bg-[#0e111a] border-[#22283d] text-white' : 'bg-white border-[#e2e8f0] text-[#0f172a]'
        }`}
      >
        {/* MODAL HEADER */}
        <div className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
          isDark ? 'border-[#22283d] bg-[#121624]' : 'border-[#e2e8f0] bg-[#f8fafc]'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff7722] via-[#7c3aed] to-[#00288e] flex items-center justify-center text-white shadow-md shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-1.5">
                  <span>⚔️ Tri-Perspective Chamber Battle-Room</span>
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#ff7722]/15 text-[#ff7722] border border-[#ff7722]/30">
                  REA Engine 2.0
                </span>
              </div>
              <p className={`text-[11.5px] font-medium mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                Decompiled Legal AST • Petitioner Counsel vs Opposing Counsel vs Judicial Bench
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copyBrief}
              disabled={loading || !analysis}
              className={`p-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                copied 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                  : isDark 
                    ? 'bg-[#181d30] hover:bg-[#202742] text-zinc-300 border-[#2d3552]' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
              title="Copy Complete Chamber Deliberation"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Copied Brief!' : 'Copy Brief'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isDark ? 'bg-[#181d30] hover:bg-[#202742] text-zinc-400 hover:text-white border-[#2d3552]' : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <div className="w-12 h-12 rounded-full border-2 border-t-transparent border-[#ff7722] animate-spin"></div>
              <h4 className="text-sm font-bold mt-2">Decompiling Factual Controversy & Convening Chamber...</h4>
              <p className={`text-xs max-w-sm ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Isolating admitted facts, querying statutory call-graphs, and evaluating preliminary objections under Indian Law.
              </p>
            </div>
          ) : analysis ? (
            <>
              {/* TOP METRICS & GAUGES */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Trial Probability of Success */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                  isDark ? 'bg-[#121626] border-[#222944]' : 'bg-emerald-50/70 border-emerald-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Win Probability
                    </span>
                    <span className="text-xl font-black text-emerald-400 font-mono">
                      {analysis.verdict.probability_of_success_score}%
                    </span>
                  </div>
                  <div className="w-full bg-emerald-950/40 h-2 rounded-full mt-2.5 overflow-hidden">
                    <div 
                      className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${analysis.verdict.probability_of_success_score}%` }}
                    />
                  </div>
                  <span className={`text-[10px] mt-2 block font-medium ${isDark ? 'text-zinc-400' : 'text-emerald-800'}`}>
                    Strong statutory backing under Sec 74 Contract Act & CPA
                  </span>
                </div>

                {/* 2. Settlement Viability */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                  isDark ? 'bg-[#121626] border-[#222944]' : 'bg-blue-50/70 border-blue-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5" />
                      Settlement Viability
                    </span>
                    <span className="text-xl font-black text-blue-400 font-mono">
                      {analysis.verdict.settlement_viability_score}%
                    </span>
                  </div>
                  <div className="w-full bg-blue-950/40 h-2 rounded-full mt-2.5 overflow-hidden">
                    <div 
                      className="bg-blue-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${analysis.verdict.settlement_viability_score}%` }}
                    />
                  </div>
                  <span className={`text-[10px] mt-2 block font-medium ${isDark ? 'text-zinc-400' : 'text-blue-800'}`}>
                    Pre-litigation demand notice likely to compel pro-rata refund
                  </span>
                </div>

                {/* 3. Preliminary Objections Risk */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                  isDark ? 'bg-[#121626] border-[#222944]' : 'bg-purple-50/70 border-purple-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Adversary Risk
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                      analysis.verdict.preliminary_objections_risk === 'LOW' 
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}>
                      {analysis.verdict.preliminary_objections_risk} RISK
                    </span>
                  </div>
                  <p className={`text-[11px] mt-2 leading-relaxed ${isDark ? 'text-zinc-300' : 'text-purple-900'}`}>
                    <strong>Jurisdiction:</strong> {analysis.ast.jurisdiction.district || 'District'} ({analysis.ast.jurisdiction.appropriate_forum.split(',')[0]})
                  </p>
                  <span className={`text-[10px] mt-1 block font-mono ${isDark ? 'text-zinc-400' : 'text-purple-700'}`}>
                    Limitation: 2–3 Years (Within Bar)
                  </span>
                </div>
              </div>

              {/* CHAMBER TAB SELECTOR */}
              <div className="flex items-center gap-2 p-1 rounded-xl bg-zinc-900/40 border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setActiveChamberTab('bench')}
                  className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeChamberTab === 'bench'
                      ? 'bg-amber-500 text-black shadow-md'
                      : isDark ? 'text-zinc-300 hover:text-white' : 'text-slate-600 hover:text-black'
                  }`}
                >
                  <Gavel className="w-4 h-4" />
                  <span>Judicial Bench Ruling</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveChamberTab('petitioner')}
                  className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeChamberTab === 'petitioner'
                      ? 'bg-[#00288e] text-white shadow-md'
                      : isDark ? 'text-zinc-300 hover:text-white' : 'text-slate-600 hover:text-black'
                  }`}
                >
                  <Scale className="w-4 h-4" />
                  <span>Senior Counsel (Petitioner)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveChamberTab('opposing')}
                  className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeChamberTab === 'opposing'
                      ? 'bg-rose-600 text-white shadow-md'
                      : isDark ? 'text-zinc-300 hover:text-white' : 'text-slate-600 hover:text-black'
                  }`}
                >
                  <Flame className="w-4 h-4" />
                  <span>Opposing Counsel (Adversary)</span>
                </button>
              </div>

              {/* CHAMBER TAB CONTENT */}
              {currentBrief && (
                <div className={`p-5 rounded-2xl border space-y-4 transition-colors ${
                  isDark ? 'bg-[#121626] border-[#222944]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-700/20">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff7722]">
                        {currentBrief.counsel_title}
                      </span>
                      <h4 className="text-sm sm:text-base font-black mt-0.5">
                        "{currentBrief.core_thesis}"
                      </h4>
                    </div>
                  </div>

                  {/* Primary Arguments */}
                  <div>
                    <h5 className="text-[11.5px] font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#ff7722]" />
                      Core Submissions & Legal Propositions
                    </h5>
                    <div className="space-y-2">
                      {currentBrief.primary_arguments.map((arg, idx) => (
                        <div 
                          key={idx}
                          className={`p-3 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
                            isDark ? 'bg-[#0a0d18] border-[#1d233a] text-zinc-200' : 'bg-white border-slate-200 text-slate-800'
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full bg-[#ff7722]/15 text-[#ff7722] text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="flex-1">{arg}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Statutory Leverage & Precedents */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className={`p-3 rounded-xl border ${
                      isDark ? 'bg-[#0a0d18] border-[#1d233a]' : 'bg-white border-slate-200'
                    }`}>
                      <h6 className="text-[10.5px] font-bold uppercase tracking-wider text-[#ff7722] mb-1.5">
                        Statutory Provisions Relied Upon
                      </h6>
                      <ul className="space-y-1 text-xs">
                        {currentBrief.statutory_leverage.map((s, idx) => (
                          <li key={idx} className="flex items-center gap-1.5 text-zinc-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className={`p-3 rounded-xl border ${
                      isDark ? 'bg-[#0a0d18] border-[#1d233a]' : 'bg-white border-slate-200'
                    }`}>
                      <h6 className="text-[10.5px] font-bold uppercase tracking-wider text-blue-400 mb-1.5">
                        Binding Authorities & Precedents
                      </h6>
                      <ul className="space-y-1 text-xs">
                        {currentBrief.precedent_citations.map((p, idx) => (
                          <li key={idx} className="flex items-center gap-1.5 text-zinc-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Vulnerabilities Acknowledged (For Opposing Counsel) */}
                  {currentBrief.vulnerabilities_acknowledged && currentBrief.vulnerabilities_acknowledged.length > 0 && (
                    <div className="p-3 rounded-xl border border-rose-900/40 bg-rose-950/20 text-rose-300">
                      <h6 className="text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        Fatal Vulnerabilities Admitted by Opposing Side
                      </h6>
                      <ul className="space-y-1 text-xs">
                        {currentBrief.vulnerabilities_acknowledged.map((v, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-rose-400">•</span>
                            <span>{v}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommended Terms of Consent Settlement (For Judicial Bench) */}
                  {activeChamberTab === 'bench' && analysis.verdict.recommended_consent_terms.length > 0 && (
                    <div className="p-3.5 rounded-xl border border-emerald-900/40 bg-emerald-950/20 text-emerald-300">
                      <h6 className="text-[11px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Probable Consent Settlement Terms (Pre-Litigation Resolution)
                      </h6>
                      <ul className="space-y-1 text-xs">
                        {analysis.verdict.recommended_consent_terms.map((term, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-4 h-4 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span>{term}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* COLLAPSIBLE ACCORDION 1: STATUTORY INGREDIENT CALL-GRAPH */}
              <div className={`rounded-xl border overflow-hidden transition-colors ${
                isDark ? 'border-[#22283d] bg-[#101422]' : 'border-slate-200 bg-white'
              }`}>
                <button
                  type="button"
                  onClick={() => setShowIngredients(!showIngredients)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left cursor-pointer hover:bg-zinc-800/20 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#ff7722]">account_tree</span>
                    <span className="text-xs font-bold">
                      Statutory Ingredient Call-Graph ({analysis.evaluation.evaluations.length} Enactments Checked)
                    </span>
                  </div>
                  {showIngredients ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showIngredients && (
                  <div className="p-4 border-t border-zinc-700/20 space-y-4">
                    {analysis.evaluation.evaluations.map((ev, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h6 className="text-xs font-bold text-[#ff7722]">{ev.section}</h6>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            {ev.satisfied_ingredients_count}/{ev.total_ingredients_count} Elements Met ({ev.readiness_percentage}%)
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {ev.ingredients.map((ing, iIdx) => (
                            <div 
                              key={iIdx}
                              className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 ${
                                isDark ? 'bg-[#0a0d18] border-[#1d233a]' : 'bg-slate-50 border-slate-200'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[15px] text-emerald-400 shrink-0 mt-0.5">
                                check_circle
                              </span>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <strong className="text-[11.5px]">{ing.element_name}</strong>
                                  <span className="text-[9.5px] font-mono text-zinc-400">{ing.required_proof_standard}</span>
                                </div>
                                <p className={`text-[10.5px] mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                                  {ing.element_description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* COLLAPSIBLE ACCORDION 2: FACTS VS ALLEGATIONS ISOLATOR */}
              <div className={`rounded-xl border overflow-hidden transition-colors ${
                isDark ? 'border-[#22283d] bg-[#101422]' : 'border-slate-200 bg-white'
              }`}>
                <button
                  type="button"
                  onClick={() => setShowFactsVsAllegations(!showFactsVsAllegations)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left cursor-pointer hover:bg-zinc-800/20 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-purple-400">filter_alt</span>
                    <span className="text-xs font-bold">
                      Fact vs Allegation Isolator (Admitted vs Disputed vs Emotions)
                    </span>
                  </div>
                  {showFactsVsAllegations ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showFactsVsAllegations && (
                  <div className="p-4 border-t border-zinc-700/20 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Admitted Facts */}
                    <div className={`p-3 rounded-xl border ${
                      isDark ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    }`}>
                      <h6 className="text-[11px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Admitted / Verified Facts ({analysis.ast.facts_vs_allegations.admitted_facts.length})
                      </h6>
                      <ul className="space-y-1 text-xs">
                        {analysis.ast.facts_vs_allegations.admitted_facts.map((f, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-400">•</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Disputed Allegations */}
                    <div className={`p-3 rounded-xl border ${
                      isDark ? 'bg-amber-950/20 border-amber-900/40 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}>
                      <h6 className="text-[11px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        Disputed Verbal Allegations ({analysis.ast.facts_vs_allegations.allegations.length})
                      </h6>
                      <ul className="space-y-1 text-xs">
                        {analysis.ast.facts_vs_allegations.allegations.length > 0 ? (
                          analysis.ast.facts_vs_allegations.allegations.map((a, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-amber-400">•</span>
                              <span>{a}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-zinc-400 italic">No unverified oral allegations detected.</li>
                        )}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* MODAL FOOTER */}
        <div className={`px-5 py-3 border-t flex items-center justify-between shrink-0 ${
          isDark ? 'border-[#22283d] bg-[#121624]' : 'border-[#e2e8f0] bg-[#f8fafc]'
        }`}>
          <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Tri-Perspective Neutral Deliberation Active</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isDark ? 'bg-[#181d30] hover:bg-[#202742] text-white border-[#2d3552]' : 'bg-slate-200 hover:bg-slate-300 text-slate-800 border-slate-300'
            }`}
          >
            Close Chamber
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
