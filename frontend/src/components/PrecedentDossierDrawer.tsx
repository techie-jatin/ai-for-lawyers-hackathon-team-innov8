import { useState } from 'react';
import { createPortal } from 'react-dom';

export interface RealCasePrecedentItem {
  id: number;
  title: string;
  citation: string;
  court: string;
  bench: string;
  decision_year: number;
  category: string;
  governing_provisions?: string[];
  factual_matrix: string;
  legal_controversy: string;
  court_holding: string;
  advocate_strategy: string;
  sanhita_mapping_2024: string;
  key_takeaways?: string[];
  official_databank?: string;
  source_url?: string;
}

interface PrecedentDossierDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  precedent: RealCasePrecedentItem | null;
  theme?: 'dark' | 'light';
  onConsultInChat?: (precedent: RealCasePrecedentItem) => void;
}

export function PrecedentDossierDrawer({
  isOpen,
  onClose,
  precedent,
  theme = 'dark',
  onConsultInChat,
}: PrecedentDossierDrawerProps) {
  const isDark = theme === 'dark';
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'strategy' | 'ruling' | 'sanhita'>('all');

  if (!isOpen || !precedent || typeof document === 'undefined') return null;

  const handleCopyPlaybook = () => {
    const textToCopy = `=================================================================
COURTROOM PRECEDENT DOSSIER: ${precedent.title.toUpperCase()}
CITATION: ${precedent.citation}
COURT & BENCH: ${precedent.court} | ${precedent.bench} (${precedent.decision_year})
CATEGORY: ${precedent.category}
GOVERNING PROVISIONS: ${(precedent.governing_provisions || []).join(', ')}
=================================================================

1. FACTUAL MATRIX:
${precedent.factual_matrix}

2. LEGAL CONTROVERSY:
${precedent.legal_controversy}

3. OPERATIVE COURT HOLDING & RELIEF:
${precedent.court_holding}

4. WINNING ADVOCATE DEFENSE STRATEGY:
${precedent.advocate_strategy}

5. 2024 SANHITA TRANSITION (BNS/BNSS/BSA):
${precedent.sanhita_mapping_2024}

6. KEY ADVOCATE TAKEAWAYS:
${(precedent.key_takeaways || []).map((t) => `• ${t}`).join('\n')}
=================================================================
Generated via भारत Legal Intelligence Engine`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return createPortal(
    <div className="fixed inset-0 z-[10040] flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-out Drawer */}
      <div
        className={`relative w-full max-w-2xl h-full shadow-2xl flex flex-col z-10 transition-colors duration-200 ${
          isDark
            ? 'bg-slate-900 border-l border-slate-800 text-slate-100'
            : 'bg-white border-l border-slate-200 text-slate-800'
        }`}
      >
        {/* Header */}
        <div
          className={`p-5 sm:p-6 border-b flex flex-col gap-3 shrink-0 ${
            isDark ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-slate-50/90'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-22px">gavel</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
                    Supreme Court Precedent
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {precedent.decision_year}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight mt-1 line-clamp-1">
                  {precedent.title}
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isDark
                  ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                  : 'hover:bg-slate-200 text-slate-500 hover:text-slate-700'
              }`}
              title="Close Drawer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* Neutral Citation & Bench Meta Bar */}
          <div
            className={`p-3 rounded-lg text-xs flex flex-wrap items-center gap-x-4 gap-y-1.5 border font-mono ${
              isDark
                ? 'bg-slate-950/70 border-slate-800 text-slate-300'
                : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-14px text-amber-500">menu_book</span>
              <span className={`font-semibold ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>{precedent.citation}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`material-symbols-outlined text-14px ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>group</span>
              <span>{precedent.bench}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`material-symbols-outlined text-14px ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>account_balance</span>
              <span>{precedent.court}</span>
            </div>
            <a
              href={
                precedent.source_url ||
                (precedent.official_databank?.toLowerCase().includes('escr')
                  ? 'https://escr.sci.gov.in/'
                  : precedent.official_databank?.toLowerCase().includes('kanoon')
                  ? 'https://indiankanoon.org/'
                  : 'https://www.aironline.in/')
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-amber-500 hover:text-amber-400 font-bold hover:underline transition-colors ml-auto"
            >
              <span className="material-symbols-outlined text-14px">open_in_new</span>
              <span>{precedent.official_databank || 'AIR Online Verified'}</span>
            </a>
          </div>

          {/* Quick Action Navigation Tabs */}
          <div className="flex items-center gap-2 pt-1 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : isDark
                  ? 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  : 'bg-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              Complete Dossier
            </button>
            <button
              onClick={() => setActiveTab('strategy')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'strategy'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : isDark
                  ? 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  : 'bg-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-13px">target</span>
              Advocate Strategy
            </button>
            <button
              onClick={() => setActiveTab('ruling')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'ruling'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : isDark
                  ? 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  : 'bg-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-13px">balance</span>
              Court Holding
            </button>
            <button
              onClick={() => setActiveTab('sanhita')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'sanhita'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : isDark
                  ? 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  : 'bg-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-13px">update</span>
              2024 Sanhitas
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Governing Provisions Pills */}
          {precedent.governing_provisions && precedent.governing_provisions.length > 0 && (
            <div>
              <label
                className={`text-2xs font-bold uppercase tracking-wider block mb-2 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Statutory Provisions & Concordance Covered
              </label>
              <div className="flex flex-wrap gap-1.5">
                {precedent.governing_provisions.map((prov, i) => (
                  <span
                    key={i}
                    className={`text-xs px-2.5 py-1 rounded-md font-mono border ${
                      isDark
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    {prov}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Section 1: Factual Matrix */}
          {(activeTab === 'all' || activeTab === 'ruling') && (
            <div
              className={`p-4 rounded-xl border transition-all ${
                isDark ? 'bg-slate-950/50 border-slate-800/90' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2.5">
                <span className={`material-symbols-outlined text-18px ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>fact_check</span>
                <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>
                  1. Factual Matrix (What Actually Occurred)
                </h3>
              </div>
              <p
                className={`text-sm leading-relaxed whitespace-pre-line ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                {precedent.factual_matrix}
              </p>
            </div>
          )}

          {/* Section 2: Legal Controversy */}
          {(activeTab === 'all' || activeTab === 'ruling') && (
            <div
              className={`p-4 rounded-xl border transition-all ${
                isDark ? 'bg-slate-950/50 border-slate-800/90' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2.5">
                <span className={`material-symbols-outlined text-18px ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>help</span>
                <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                  2. Legal Controversy Framed
                </h3>
              </div>
              <p
                className={`text-sm leading-relaxed whitespace-pre-line ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                {precedent.legal_controversy}
              </p>
            </div>
          )}

          {/* Section 3: Operative Court Holding & Relief */}
          {(activeTab === 'all' || activeTab === 'ruling') && (
            <div
              className={`p-4 rounded-xl border transition-all ${
                isDark
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-100'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              <div className="flex items-center gap-2 mb-2.5">
                <span className="material-symbols-outlined text-emerald-500 text-18px">balance</span>
                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-500">
                  3. Operative Court Holding & Relief
                </h3>
              </div>
              <div
                className={`text-sm leading-relaxed whitespace-pre-line font-medium ${
                  isDark ? 'text-emerald-200/90' : 'text-emerald-900'
                }`}
              >
                {precedent.court_holding}
              </div>
            </div>
          )}

          {/* Section 4: Winning Advocate Defense Strategy */}
          {(activeTab === 'all' || activeTab === 'strategy') && (
            <div
              className={`p-4 rounded-xl border transition-all ${
                isDark
                  ? 'bg-amber-950/20 border-amber-500/30 text-amber-100'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}
            >
              <div className="flex items-center gap-2 mb-2.5">
                <span className={`material-symbols-outlined text-18px ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>psychology</span>
                <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>
                  4. Winning Advocate Defense Strategy & Playbook
                </h3>
              </div>
              <div
                className={`text-sm leading-relaxed whitespace-pre-line ${
                  isDark ? 'text-amber-200/90' : 'text-amber-900'
                }`}
              >
                {precedent.advocate_strategy}
              </div>
            </div>
          )}

          {/* Section 5: Modern 2024 Sanhita Transition */}
          {(activeTab === 'all' || activeTab === 'sanhita') && (
            <div
              className={`p-4 rounded-xl border transition-all ${
                isDark
                  ? 'bg-indigo-950/20 border-indigo-500/30 text-indigo-100'
                  : 'bg-indigo-50 border-indigo-200 text-indigo-950'
              }`}
            >
              <div className="flex items-center gap-2 mb-2.5">
                <span className={`material-symbols-outlined text-18px ${isDark ? 'text-indigo-400' : 'text-indigo-700'}`}>change_circle</span>
                <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-indigo-400' : 'text-indigo-800'}`}>
                  5. 2024 Sanhita Application (BNS / BNSS / BSA)
                </h3>
              </div>
              <p
                className={`text-sm leading-relaxed whitespace-pre-line ${
                  isDark ? 'text-indigo-200/90' : 'text-indigo-900'
                }`}
              >
                {precedent.sanhita_mapping_2024}
              </p>
            </div>
          )}

          {/* Section 6: Actionable Bullet Takeaways */}
          {precedent.key_takeaways && precedent.key_takeaways.length > 0 && (
            <div
              className={`p-4 rounded-xl border transition-all ${
                isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className={`material-symbols-outlined text-18px ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>checklist</span>
                <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>
                  6. Chamber Takeaways & Evidentiary Checklist
                </h3>
              </div>
              <ul className="space-y-2">
                {precedent.key_takeaways.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                    <span className="material-symbols-outlined text-emerald-500 text-16px shrink-0 mt-0.5">
                      check_circle
                    </span>
                    <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          className={`p-4 sm:p-5 border-t flex flex-wrap items-center justify-between gap-3 shrink-0 ${
            isDark ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-slate-50/90'
          }`}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyPlaybook}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border ${
                copied
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-2xs'
              }`}
            >
              <span className="material-symbols-outlined text-16px">
                {copied ? 'done_all' : 'content_copy'}
              </span>
              {copied ? 'Copied Full Dossier!' : 'Copy Playbook'}
            </button>
          </div>

          {onConsultInChat && (
            <button
              onClick={() => {
                onConsultInChat(precedent);
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-16px">chat_bubble</span>
              Consult in Legal Chat
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
