import { useState, useMemo } from 'react';
import {
  getClientPreamble,
  getClientSchedules,
  getClientParts,
  searchClientConstitution,
  analyzeClientConstitutionalControversy,
  type ConstitutionalArticleAST,
  type ConstitutionalAnalysisResult
} from '../services/clientConstitutionEngine';

interface ConstitutionStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  onLaunchPleadingWithArticle?: (art: ConstitutionalArticleAST) => void;
  onSendToChat?: (text: string, title?: string) => void;
}

export function ConstitutionStudioModal({
  isOpen,
  onClose,
  isDark,
  onLaunchPleadingWithArticle,
  onSendToChat
}: ConstitutionStudioModalProps) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'explorer' | 'analyzer' | 'preamble' | 'schedules'>('explorer');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPart, setSelectedPart] = useState('ALL');
  const [selectedClassification, setSelectedClassification] = useState('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Default article to display
  const [selectedArticle, setSelectedArticle] = useState<ConstitutionalArticleAST>(() => {
    return searchClientConstitution('21', undefined, undefined, 1)[0] || searchClientConstitution('', undefined, undefined, 1)[0];
  });

  // Controversy Analyzer State
  const [analyzerInput, setAnalyzerInput] = useState(
    'Municipal corporation issued a 2-hour verbal notice and brought bulldozers to demolish my commercial shop and warehouse without providing statutory compensation or an opportunity for hearing.'
  );
  const [analysisResult, setAnalysisResult] = useState<ConstitutionalAnalysisResult>(() => {
    return analyzeClientConstitutionalControversy(
      'Municipal corporation issued a 2-hour verbal notice and brought bulldozers to demolish my commercial shop and warehouse without providing statutory compensation or an opportunity for hearing.'
    );
  });

  const parts = useMemo(() => getClientParts(), []);
  const schedules = useMemo(() => getClientSchedules(), []);
  const preamble = useMemo(() => getClientPreamble(), []);

  // Filtered articles
  const searchResults = useMemo(() => {
    return searchClientConstitution(searchQuery, selectedPart, selectedClassification, 60);
  }, [searchQuery, selectedPart, selectedClassification]);

  const handleCopyCitation = (art: ConstitutionalArticleAST) => {
    const text = `${art.article_number} (${art.heading}), Constitution of India - ${art.plain_explanation}`;
    navigator.clipboard.writeText(text);
    setCopiedId(art.article_id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRunAnalysis = () => {
    if (!analyzerInput.trim()) return;
    const res = analyzeClientConstitutionalControversy(analyzerInput);
    setAnalysisResult(res);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in font-sans">
      <div className={`w-full max-w-6xl h-[92vh] max-h-[920px] rounded-2xl flex flex-col shadow-2xl border overflow-hidden transition-all ${
        isDark ? 'bg-[#0c0f1d] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* ================= MODAL HEADER ================= */}
        <div className={`p-4 sm:p-5 border-b shrink-0 flex flex-col gap-3 ${
          isDark ? 'bg-[#101426] border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                isDark ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-[#00288e]/10 text-[#00288e] border border-[#00288e]/20'
              }`}>
                <span className="material-symbols-outlined text-[24px]">account_balance</span>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-[17px] font-black tracking-tight flex items-center gap-1.5">
                    <span>The Constitution of India</span>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/25">
                      Supreme Code of Bharat
                    </span>
                  </h2>
                  <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/25">
                    25 Parts • 456+ Articles • 12 Schedules
                  </span>
                </div>
                <p className={`text-[12px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Decompiled Reverse-Engineered Constitutional Knowledge: Fundamental Rights, Writ Remedies, Precedents & Doctrines.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                isDark ? 'bg-[#171b30] hover:bg-red-950/40 text-slate-400 hover:text-red-400 border-slate-700' : 'bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 border-slate-300'
              }`}
              title="Close Constitution Studio"
            >
              <span className="material-symbols-outlined text-[19px]">close</span>
            </button>
          </div>

          {/* Navigation Mode Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('explorer')}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'explorer'
                  ? isDark ? 'bg-amber-500 text-black font-black shadow-xs' : 'bg-[#00288e] text-white shadow-xs'
                  : isDark ? 'text-slate-400 hover:text-white bg-[#14182a]' : 'text-slate-600 hover:text-slate-900 bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">menu_book</span>
              <span>Articles & Parts Explorer</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('analyzer')}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'analyzer'
                  ? isDark ? 'bg-amber-500 text-black font-black shadow-xs' : 'bg-[#00288e] text-white shadow-xs'
                  : isDark ? 'text-slate-400 hover:text-white bg-[#14182a]' : 'text-slate-600 hover:text-slate-900 bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">psychology</span>
              <span>🧠 Senior Advocate Constitutional Analyzer</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('preamble')}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'preamble'
                  ? isDark ? 'bg-amber-500 text-black font-black shadow-xs' : 'bg-[#00288e] text-white shadow-xs'
                  : isDark ? 'text-slate-400 hover:text-white bg-[#14182a]' : 'text-slate-600 hover:text-slate-900 bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">history_edu</span>
              <span>Preamble & Basic Structure</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('schedules')}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'schedules'
                  ? isDark ? 'bg-amber-500 text-black font-black shadow-xs' : 'bg-[#00288e] text-white shadow-xs'
                  : isDark ? 'text-slate-400 hover:text-white bg-[#14182a]' : 'text-slate-600 hover:text-slate-900 bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">table_rows</span>
              <span>12 Schedules</span>
            </button>
          </div>
        </div>

        {/* ================= MODAL BODY ================= */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* TAB 1: ARTICLE & PART EXPLORER */}
          {activeTab === 'explorer' && (
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              {/* Left Column: Filter & Article Rail (5 Cols) */}
              <div className={`w-full lg:w-[42%] border-r flex flex-col overflow-hidden shrink-0 ${
                isDark ? 'border-slate-800 bg-[#0f1222]' : 'border-slate-200 bg-slate-50'
              }`}>
                {/* Search & Filter Bar */}
                <div className={`p-3 border-b space-y-2 shrink-0 ${
                  isDark ? 'border-slate-800 bg-[#121628]' : 'border-slate-200 bg-white'
                }`}>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-slate-400 text-[18px]">
                      search
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search Article (e.g. 21, privacy, 300A, arrest)..."
                      className={`w-full text-[12.5px] pl-8 pr-3 py-1.5 rounded-lg border focus:outline-none ${
                        isDark ? 'bg-[#181d33] border-slate-700 text-white focus:border-amber-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#00288e]'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={selectedPart}
                      onChange={(e) => setSelectedPart(e.target.value)}
                      className={`text-[11px] p-1.5 rounded-lg border focus:outline-none ${
                        isDark ? 'bg-[#181d33] border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                      }`}
                    >
                      <option value="ALL">All Parts (I to XXII)</option>
                      {parts.map((p) => (
                        <option key={p.part_number} value={p.part_number}>
                          {p.part_number}: {p.title}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedClassification}
                      onChange={(e) => setSelectedClassification(e.target.value)}
                      className={`text-[11px] p-1.5 rounded-lg border focus:outline-none ${
                        isDark ? 'bg-[#181d33] border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                      }`}
                    >
                      <option value="ALL">All Categories</option>
                      <option value="FUNDAMENTAL_RIGHT">Fundamental Rights</option>
                      <option value="PROCEDURAL_REMEDY">Writ Remedies</option>
                      <option value="DPSP">Directive Principles</option>
                      <option value="FUNDAMENTAL_DUTY">Fundamental Duties</option>
                      <option value="JUDICIAL_POWER">Judicial Powers</option>
                      <option value="LEGISLATIVE_COMPETENCE">Legislative Powers</option>
                      <option value="EXECUTIVE_POWER">Executive Powers</option>
                      <option value="EMERGENCY">Emergency</option>
                      <option value="GOVERNANCE">Governance</option>
                    </select>
                  </div>
                </div>

                {/* Article List Rail */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
                  <div className="px-2 py-1 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                    <span>Matches: {searchResults.length} Articles</span>
                    {selectedPart !== 'ALL' && <span>Filter: {selectedPart}</span>}
                  </div>

                  {searchResults.map((art) => {
                    const isSelected = selectedArticle.article_id === art.article_id;
                    return (
                      <div
                        key={art.article_id}
                        onClick={() => setSelectedArticle(art)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? isDark
                              ? 'bg-amber-500/15 border-amber-500 text-white shadow-sm ring-1 ring-amber-500/30'
                              : 'bg-[#eff4ff] border-[#00288e] text-[#00288e] shadow-sm ring-1 ring-[#00288e]/30'
                            : isDark
                              ? 'bg-[#131626] border-slate-800 hover:border-slate-700 hover:bg-[#181c2f] text-slate-300'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className={`text-[12px] font-black font-mono ${
                            isSelected ? (isDark ? 'text-amber-400' : 'text-[#00288e]') : ''
                          }`}>
                            {art.article_number}
                          </span>
                          <span className={`text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded ${
                            art.classification === 'FUNDAMENTAL_RIGHT'
                              ? 'bg-red-500/15 text-red-500 border border-red-500/30'
                              : art.classification === 'PROCEDURAL_REMEDY'
                                ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                                : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {art.classification.replace('_', ' ')}
                          </span>
                        </div>
                        <h4 className="text-[12px] font-bold line-clamp-1">{art.heading}</h4>
                        <p className={`text-[11px] line-clamp-1 mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {art.plain_explanation}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Complete Article Dossier (7 Cols) */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 scrollbar-thin">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-500 border border-amber-500/25">
                        {selectedArticle.part_number}: {selectedArticle.part_title}
                      </span>
                      {selectedArticle.chapter_title && (
                        <span className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          • {selectedArticle.chapter_title}
                        </span>
                      )}
                    </div>
                    <h3 className="text-[20px] font-black tracking-tight mt-1 text-[#ff7722]">
                      {selectedArticle.article_number} — {selectedArticle.heading}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyCitation(selectedArticle)}
                      className={`px-3 py-1.5 rounded-lg text-[11.5px] font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                        copiedId === selectedArticle.article_id
                          ? 'bg-emerald-500 text-white border-emerald-600'
                          : isDark
                            ? 'bg-[#181c2f] hover:bg-[#222740] text-slate-200 border-slate-700'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        {copiedId === selectedArticle.article_id ? 'check' : 'content_copy'}
                      </span>
                      <span>{copiedId === selectedArticle.article_id ? 'Copied!' : 'Copy Citation'}</span>
                    </button>

                    {onLaunchPleadingWithArticle && (
                      <button
                        type="button"
                        onClick={() => onLaunchPleadingWithArticle(selectedArticle)}
                        className={`px-3 py-1.5 rounded-lg text-[11.5px] font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                          isDark ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">edit_document</span>
                        <span>Draft Writ</span>
                      </button>
                    )}

                    {onSendToChat && (
                      <button
                        type="button"
                        onClick={() => onSendToChat(
                          `Explain the practical application and High Court petition remedies under ${selectedArticle.article_number} of the Constitution of India regarding ${selectedArticle.heading}.`,
                          selectedArticle.article_number
                        )}
                        className={`px-3 py-1.5 rounded-lg text-[11.5px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isDark ? 'bg-amber-500 hover:bg-amber-400 text-black font-black' : 'bg-[#00288e] hover:bg-blue-900 text-white'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">chat</span>
                        <span>Discuss in Chamber</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Verbatim Gazette Text */}
                <div className={`p-4 rounded-xl border space-y-2 ${
                  isDark ? 'bg-[#121526] border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-black uppercase text-amber-500 tracking-wider">
                      Authentic Gazette Text
                    </span>
                    <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Legislative Dept, MoL&J
                    </span>
                  </div>
                  <p className="text-[13px] font-serif leading-relaxed italic">
                    "{selectedArticle.verbatim_text}"
                  </p>
                </div>

                {/* Plain Explanation */}
                <div className={`p-4 rounded-xl border space-y-1.5 ${
                  isDark ? 'bg-[#161a30] border-slate-700' : 'bg-blue-50/50 border-blue-200'
                }`}>
                  <h5 className="text-[11px] font-mono font-bold uppercase text-blue-400 tracking-wider">
                    Senior Advocate Plain Explanation
                  </h5>
                  <p className="text-[12.5px] leading-relaxed">
                    {selectedArticle.plain_explanation}
                  </p>
                </div>

                {/* Reasonable Restrictions & Doctrines */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className={`p-3.5 rounded-xl border space-y-1.5 ${
                    isDark ? 'bg-[#131626] border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <span className="text-[10.5px] font-mono font-black uppercase text-amber-500">
                      Constitutional Doctrines
                    </span>
                    {selectedArticle.applicable_doctrines.length > 0 ? (
                      <ul className="text-[11.5px] space-y-1 pl-4 list-disc text-slate-300">
                        {selectedArticle.applicable_doctrines.map((doc, i) => (
                          <li key={i}><strong className="text-amber-400">{doc}</strong></li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[11.5px] text-slate-500">General constitutional governance doctrine applies.</p>
                    )}
                  </div>

                  <div className={`p-3.5 rounded-xl border space-y-1.5 ${
                    isDark ? 'bg-[#131626] border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <span className="text-[10.5px] font-mono font-black uppercase text-red-400">
                      Scrutiny Standard & Limitations
                    </span>
                    {selectedArticle.reasonable_restrictions.length > 0 ? (
                      <ul className="text-[11.5px] space-y-1 pl-4 list-disc text-slate-300">
                        {selectedArticle.reasonable_restrictions.map((res, i) => (
                          <li key={i}>{res}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[11.5px] text-slate-500">Procedure established by law & non-arbitrariness standards apply.</p>
                    )}
                  </div>
                </div>

                {/* Landmark Constitution Bench Precedents */}
                {selectedArticle.landmark_precedents.length > 0 && (
                  <div className={`p-4 rounded-xl border space-y-3 ${
                    isDark ? 'bg-[#121526] border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <h5 className="text-[11px] font-mono font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">gavel</span>
                      Supreme Court Constitution Bench Authority
                    </h5>
                    <div className="space-y-2.5">
                      {selectedArticle.landmark_precedents.map((p, idx) => (
                        <div key={idx} className={`p-3 rounded-lg border text-[12px] space-y-1 ${
                          isDark ? 'bg-[#181c30] border-slate-700/80' : 'bg-slate-50 border-slate-200'
                        }`}>
                          <div className="flex flex-wrap items-center justify-between gap-1">
                            <strong className="text-amber-400 text-[12.5px]">{p.case_title}</strong>
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                              {p.neutral_citation} • {p.bench_strength} Judges
                            </span>
                          </div>
                          <p className="text-[11.5px] leading-relaxed text-slate-300">
                            <strong>Ratio Decidendi:</strong> {p.ratio_decidendi}
                          </p>
                          <div className="text-[10.5px] font-mono text-slate-400">
                            <strong>Doctrine:</strong> {p.doctrine_established}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Advocate Pleading Guidance & Citizen Rights */}
                <div className={`p-4 rounded-xl border space-y-2 ${
                  isDark ? 'bg-amber-950/20 border-amber-900/40 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    <h5 className="text-[12px] font-bold uppercase tracking-wide">
                      Senior Advocate Pleading & Citizen Action Strategy
                    </h5>
                  </div>
                  <p className="text-[12px] leading-relaxed font-sans">
                    {selectedArticle.advocate_pleading_notes}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SENIOR ADVOCATE CONSTITUTIONAL ANALYZER */}
          {activeTab === 'analyzer' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 scrollbar-thin">
              <div className={`p-4 rounded-xl border space-y-3 ${
                isDark ? 'bg-[#131626] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500 text-[22px]">psychology</span>
                    <h3 className="text-[14px] font-black uppercase tracking-wider">
                      Real-Time Constitutional Threat & Controversy Decompiler
                    </h3>
                  </div>
                  <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Zero Hardcoding • Analyzes any government action, demolition, arrest or tender dispute
                  </span>
                </div>

                <textarea
                  rows={4}
                  value={analyzerInput}
                  onChange={(e) => setAnalyzerInput(e.target.value)}
                  placeholder="Paste raw narrative of controversy: e.g. police detained citizen without warrant, municipal bulldozer demolition without notice, arbitrary tender cancellation, internet shutdown, employee dismissed without inquiry..."
                  className={`w-full text-[12.5px] p-3 rounded-xl border font-sans focus:outline-none transition-all ${
                    isDark ? 'bg-[#181c2f] border-slate-700 text-white focus:border-amber-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#00288e]'
                  }`}
                />

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Quick Samples:</span>
                    {[
                      { label: 'Bulldozer Demolition', text: 'Municipal authorities brought bulldozers and demolished my residential building without any prior notice, compensation, or hearing opportunity.' },
                      { label: 'Illegal 36h Arrest', text: 'Police arrested my brother without warrant last evening and have not produced him before any Magistrate for 36 hours.' },
                      { label: 'Arbitrary Tender Blacklist', text: 'Government department cancelled our lowest bid and blacklisted our company arbitrarily without issuing show-cause notice.' },
                      { label: 'Internet Shutdown', text: 'District administration suspended internet services for 14 days without publishing written review orders.' }
                    ].map((s) => (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => {
                          setAnalyzerInput(s.text);
                          setAnalysisResult(analyzeClientConstitutionalControversy(s.text));
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold border transition-all cursor-pointer ${
                          isDark ? 'bg-[#181c2f] hover:bg-[#232840] border-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleRunAnalysis}
                    className={`px-4 py-2 rounded-xl text-[12px] font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                      isDark ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-md' : 'bg-[#00288e] hover:bg-blue-900 text-white shadow-md'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">bolt</span>
                    <span>Decompile Constitutional Remedies</span>
                  </button>
                </div>
              </div>

              {/* Analysis Result Display */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-7 space-y-4">
                  {/* Strategic Remedy Banner */}
                  <div className={`p-4 rounded-xl border space-y-2 ${
                    isDark ? 'bg-[#101426] border-emerald-900/50 text-emerald-100' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                        Recommended Prerogative Writ
                      </span>
                      <span className="text-[12px] font-black font-mono px-2 py-0.5 rounded bg-emerald-500 text-white">
                        {analysisResult.recommended_writ}
                      </span>
                    </div>
                    <h4 className="text-[15px] font-black">{analysisResult.recommended_forum}</h4>
                    <p className="text-[12px] leading-relaxed opacity-90">
                      {analysisResult.advocate_pleading_summary}
                    </p>
                  </div>

                  {/* Scrutiny Standard */}
                  <div className={`p-4 rounded-xl border space-y-1.5 ${
                    isDark ? 'bg-[#131628] border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <span className="text-[10.5px] font-mono font-black uppercase text-amber-500">
                      Judicial Scrutiny Standard
                    </span>
                    <p className="text-[12.5px] leading-relaxed font-serif">
                      {analysisResult.scrutiny_standard}
                    </p>
                  </div>

                  {/* Precedents Card */}
                  <div className={`p-4 rounded-xl border space-y-2.5 ${
                    isDark ? 'bg-[#131628] border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <span className="text-[10.5px] font-mono font-black uppercase text-blue-400">
                      Binding Constitution Bench Precedents
                    </span>
                    <div className="space-y-2">
                      {analysisResult.key_precedents.map((p, idx) => (
                        <div key={idx} className={`p-2.5 rounded-lg border text-[11.5px] ${
                          isDark ? 'bg-[#181c30] border-slate-700' : 'bg-slate-50 border-slate-200'
                        }`}>
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-amber-400">{p.case_title}</span>
                            <span className="font-mono text-[10px] text-slate-400">{p.neutral_citation}</span>
                          </div>
                          <p className="text-[11px] mt-1 text-slate-300">{p.ratio_decidendi}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Invoked Constitutional Articles */}
                <div className="lg:col-span-5 space-y-3">
                  <h4 className={`text-[12px] font-black uppercase tracking-wider ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Invoked Constitutional Provisions ({analysisResult.invoked_articles.length})
                  </h4>

                  <div className="space-y-2.5">
                    {analysisResult.invoked_articles.map((art) => (
                      <div
                        key={art.article_id}
                        className={`p-3 rounded-xl border space-y-1 ${
                          isDark ? 'bg-[#131628] border-slate-800' : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] font-black text-amber-400 font-mono">
                            {art.article_number}
                          </span>
                          <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-500 border border-amber-500/25">
                            {art.classification}
                          </span>
                        </div>
                        <h5 className="text-[12px] font-bold">{art.heading}</h5>
                        <p className={`text-[11px] line-clamp-2 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          {art.plain_explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PREAMBLE & BASIC STRUCTURE */}
          {activeTab === 'preamble' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 max-w-4xl mx-auto scrollbar-thin">
              <div className={`p-6 sm:p-8 rounded-2xl border text-center space-y-4 shadow-lg ${
                isDark ? 'bg-[#121526] border-amber-500/30' : 'bg-amber-50/50 border-amber-200'
              }`}>
                <span className="text-[11px] font-mono font-black uppercase tracking-widest text-amber-500">
                  The Preamble to the Constitution of India
                </span>
                <p className="text-[16px] sm:text-[18px] font-serif leading-loose tracking-wide text-amber-100 dark:text-amber-200">
                  "{preamble.verbatim_text}"
                </p>
                <div className={`p-3 rounded-xl text-[12px] font-mono max-w-xl mx-auto ${
                  isDark ? 'bg-black/40 text-amber-300' : 'bg-white text-slate-800'
                }`}>
                  Adopted by Constituent Assembly on 26th November 1949 • In Effect 26th January 1950
                </div>
              </div>

              {/* Landmark Precedents on Preamble */}
              <div className="space-y-3">
                <h4 className="text-[13px] font-black uppercase tracking-wider text-amber-400">
                  Landmark Constitution Bench Authority on Basic Structure
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {preamble.landmark_precedents.map((p, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border space-y-1.5 ${
                      isDark ? 'bg-[#131626] border-slate-800' : 'bg-white border-slate-200'
                    }`}>
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-amber-400 text-[13px]">{p.case_title}</span>
                        <span className="text-[10px] font-mono text-emerald-400">{p.bench_strength} Judges</span>
                      </div>
                      <p className="text-[11.5px] leading-relaxed text-slate-300">
                        {p.ratio_decidendi}
                      </p>
                      <span className="text-[10px] font-mono text-slate-400">
                        Citation: {p.neutral_citation}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 12 SCHEDULES */}
          {activeTab === 'schedules' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 scrollbar-thin">
              <h3 className={`text-[13px] font-black uppercase tracking-wider mb-2 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Complete 12 Schedules of the Constitution of India
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {schedules.map((s) => (
                  <div
                    key={s.schedule_number}
                    className={`p-4 rounded-xl border space-y-2 ${
                      isDark ? 'bg-[#121526] border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-black text-amber-400 font-mono">
                        {s.schedule_number}
                      </span>
                      <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {s.articles_covered.join(', ')}
                      </span>
                    </div>
                    <h4 className="text-[13px] font-bold">{s.title}</h4>
                    <p className={`text-[11.5px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {s.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
