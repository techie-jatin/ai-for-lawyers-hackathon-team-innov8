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

export interface ConstitutionViewProps {
  isDark: boolean;
  onLaunchPleadingWithArticle?: (art: ConstitutionalArticleAST) => void;
  onSendToChat?: (text: string, title?: string) => void;
  initialQuery?: string;
  onBackToChat?: () => void;
}

export function ConstitutionView({
  isDark,
  onLaunchPleadingWithArticle,
  onSendToChat,
  initialQuery = '',
  onBackToChat
}: ConstitutionViewProps) {
  const [activeTab, setActiveTab] = useState<'explorer' | 'analyzer' | 'preamble' | 'schedules'>('explorer');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedPart, setSelectedPart] = useState('ALL');
  const [selectedClassification, setSelectedClassification] = useState('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mobileExplorerView, setMobileExplorerView] = useState<'list' | 'detail'>('list');

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

  const handleSelectArticle = (art: ConstitutionalArticleAST) => {
    setSelectedArticle(art);
    setMobileExplorerView('detail');
  };

  const handleRunAnalysis = () => {
    if (!analyzerInput.trim()) return;
    const res = analyzeClientConstitutionalControversy(analyzerInput);
    setAnalysisResult(res);
  };

  return (
    <div className={`w-full h-full flex flex-col overflow-hidden font-sans ${
      isDark ? 'bg-[#0c0f1d] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* ================= VIEW HEADER ================= */}
      <div className={`px-4 py-3 sm:px-6 sm:py-3.5 border-b shrink-0 flex flex-col gap-2.5 sm:gap-3 transition-colors ${
        isDark ? 'bg-[#101426] border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
      }`}>
        <div className="flex items-start sm:items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
              isDark ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-[#00288e]/10 text-[#00288e] border border-[#00288e]/20'
            }`}>
              <span className="material-symbols-outlined text-[22px] sm:text-[26px]">account_balance</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h1 className="text-[15px] sm:text-[18px] font-black tracking-tight flex items-center gap-1.5 text-inherit">
                  <span>Constitution of India</span>
                </h1>
                <span className="text-[9.5px] sm:text-[10px] font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/25 shrink-0">
                  Supreme Code
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/25 shrink-0">
                  25 Parts • 456+ Articles • 12 Schedules
                </span>
              </div>
              <p className={`text-[11px] sm:text-[12.5px] mt-0.5 leading-snug sm:leading-normal sm:truncate ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Fundamental Rights, Writ Remedies, Precedents & Doctrines.
              </p>
            </div>
          </div>

          {onBackToChat && (
            <button
              type="button"
              onClick={onBackToChat}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg border text-[11px] sm:text-[12px] font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                isDark ? 'bg-[#171b30] hover:bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span className="hidden sm:inline">Back to Chat</span>
            </button>
          )}
        </div>

        {/* Navigation Mode Bar */}
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar scrollbar-none pt-1 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => { setActiveTab('explorer'); setMobileExplorerView('list'); }}
            className={`px-3 py-1.5 rounded-lg text-[11px] sm:text-[12px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              activeTab === 'explorer'
                ? isDark ? 'bg-amber-500 text-black font-black shadow-xs' : 'bg-[#00288e] text-white shadow-xs'
                : isDark ? 'text-slate-400 hover:text-white bg-[#14182a]' : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">menu_book</span>
            <span>Articles & Parts</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analyzer')}
            className={`px-3 py-1.5 rounded-lg text-[11px] sm:text-[12px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              activeTab === 'analyzer'
                ? isDark ? 'bg-amber-500 text-black font-black shadow-xs' : 'bg-[#00288e] text-white shadow-xs'
                : isDark ? 'text-slate-400 hover:text-white bg-[#14182a]' : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">psychology</span>
            <span className="hidden xs:inline">Constitutional</span>
            <span>Analyzer</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preamble')}
            className={`px-3 py-1.5 rounded-lg text-[11px] sm:text-[12px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              activeTab === 'preamble'
                ? isDark ? 'bg-amber-500 text-black font-black shadow-xs' : 'bg-[#00288e] text-white shadow-xs'
                : isDark ? 'text-slate-400 hover:text-white bg-[#14182a]' : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">history_edu</span>
            <span>Preamble</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('schedules')}
            className={`px-3 py-1.5 rounded-lg text-[11px] sm:text-[12px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
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

      {/* ================= VIEW BODY ================= */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* TAB 1: ARTICLE & PART EXPLORER */}
        {activeTab === 'explorer' && (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Mobile Segmented Switcher (< lg only) */}
            <div className="lg:hidden flex items-center p-2 border-b border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-[#121628] shrink-0 gap-1.5">
              <button
                type="button"
                onClick={() => setMobileExplorerView('list')}
                className={`flex-1 py-1.5 px-2.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  mobileExplorerView === 'list'
                    ? isDark ? 'bg-amber-500 text-black shadow-xs font-black' : 'bg-[#00288e] text-white shadow-xs'
                    : isDark ? 'bg-[#181d33] text-slate-300 hover:text-white' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">format_list_bulleted</span>
                <span>Articles List ({searchResults.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileExplorerView('detail')}
                className={`flex-1 py-1.5 px-2.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  mobileExplorerView === 'detail'
                    ? isDark ? 'bg-amber-500 text-black shadow-xs font-black' : 'bg-[#00288e] text-white shadow-xs'
                    : isDark ? 'bg-[#181d33] text-slate-300 hover:text-white' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">article</span>
                <span className="truncate">{selectedArticle.article_number} Dossier</span>
              </button>
            </div>

            {/* Left Column: Filter & Article Rail */}
            <div className={`w-full lg:w-[40%] xl:w-[36%] border-r flex flex-col overflow-hidden shrink-0 ${
              mobileExplorerView === 'detail' ? 'hidden lg:flex' : 'flex flex-1'
            } ${isDark ? 'border-slate-800 bg-[#0f1222]' : 'border-slate-200 bg-slate-50'}`}>
              {/* Search & Filter Bar */}
              <div className={`p-2.5 sm:p-3 border-b space-y-2 shrink-0 ${
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
                    className={`w-full text-[12px] sm:text-[12.5px] pl-8 pr-8 py-1.5 rounded-lg border focus:outline-none ${
                      isDark ? 'bg-[#181d33] border-slate-700 text-white focus:border-amber-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#00288e]'
                    }`}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 gap-1.5 sm:gap-2">
                  <select
                    value={selectedPart}
                    onChange={(e) => setSelectedPart(e.target.value)}
                    className={`text-[10.5px] sm:text-[11px] p-1.5 rounded-lg border focus:outline-none ${
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
                    className={`text-[10.5px] sm:text-[11px] p-1.5 rounded-lg border focus:outline-none ${
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

              {/* Articles Scrollable Rail */}
              <div className="flex-1 overflow-y-auto p-2 sm:p-2.5 space-y-1.5 scrollbar-thin">
                {searchResults.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-[12px]">
                    No constitutional provisions matched your search criteria.
                  </div>
                ) : (
                  searchResults.map((art) => {
                    const isSelected = selectedArticle.article_id === art.article_id;
                    return (
                      <div
                        key={art.article_id}
                        onClick={() => handleSelectArticle(art)}
                        className={`w-full text-left p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? isDark
                              ? 'bg-[#181c30] border-amber-500/50 shadow-sm'
                              : 'bg-amber-50/70 border-amber-400/60 shadow-sm'
                            : isDark
                              ? 'bg-[#131626] border-slate-800 hover:border-slate-700 hover:bg-[#181c2f] text-slate-300'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className={`text-[11.5px] sm:text-[12px] font-black font-mono ${
                            isSelected ? (isDark ? 'text-amber-400' : 'text-[#00288e]') : ''
                          }`}>
                            {art.article_number}
                          </span>
                          <span className={`text-[9px] sm:text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded truncate max-w-[130px] ${
                            art.classification === 'FUNDAMENTAL_RIGHT'
                              ? 'bg-red-500/15 text-red-500 border border-red-500/30'
                              : art.classification === 'PROCEDURAL_REMEDY'
                                ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                                : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {art.classification.replace('_', ' ')}
                          </span>
                        </div>
                        <h4 className="text-[11.5px] sm:text-[12px] font-bold line-clamp-1">{art.heading}</h4>
                        <p className={`text-[10.5px] sm:text-[11px] line-clamp-1 mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {art.plain_explanation}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column: Complete Article Dossier */}
            <div className={`flex-1 overflow-y-auto p-3.5 sm:p-5 md:p-6 space-y-4 sm:space-y-5 scrollbar-thin ${
              mobileExplorerView === 'list' ? 'hidden lg:block' : 'block'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="min-w-0 flex-1">
                  {/* Mobile Back Button (< lg only) */}
                  <div className="lg:hidden mb-2">
                    <button
                      type="button"
                      onClick={() => setMobileExplorerView('list')}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                        isDark ? 'bg-[#181c2f] hover:bg-[#222740] text-amber-400 border-amber-500/30' : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                      <span>Back to Articles ({searchResults.length})</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className="text-[10px] sm:text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-500 border border-amber-500/25">
                      {selectedArticle.part_number}: {selectedArticle.part_title}
                    </span>
                    {selectedArticle.chapter_title && (
                      <span className={`text-[10px] sm:text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        • {selectedArticle.chapter_title}
                      </span>
                    )}
                    <span className={`text-[9.5px] sm:text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      selectedArticle.classification === 'FUNDAMENTAL_RIGHT'
                        ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                        : selectedArticle.classification === 'PROCEDURAL_REMEDY'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {selectedArticle.classification.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="text-[16px] sm:text-[19px] font-black tracking-tight mt-1 flex items-center gap-2">
                    <span className="font-mono text-amber-500">{selectedArticle.article_number}:</span>
                    <span>{selectedArticle.heading}</span>
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleCopyCitation(selectedArticle)}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg border text-[11px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      copiedId === selectedArticle.article_id
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : isDark ? 'bg-[#181c2f] hover:bg-[#222740] border-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {copiedId === selectedArticle.article_id ? 'check' : 'content_copy'}
                    </span>
                    <span>{copiedId === selectedArticle.article_id ? 'Copied' : 'Cite'}</span>
                  </button>

                  {onSendToChat && (
                    <button
                      type="button"
                      onClick={() => onSendToChat(`${selectedArticle.article_number} (${selectedArticle.heading}): ${selectedArticle.plain_explanation}`, `Constitutional Article ${selectedArticle.article_number}`)}
                      className={`px-2.5 sm:px-3 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        isDark ? 'bg-[#181c2f] hover:bg-[#222740] border-slate-700 text-amber-400' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-[#00288e]'
                      }`}
                      title="Analyze this article inside Legal Chat"
                    >
                      <span className="material-symbols-outlined text-[14px]">chat</span>
                      <span>Chat</span>
                    </button>
                  )}

                  {onLaunchPleadingWithArticle && (
                    <button
                      type="button"
                      onClick={() => onLaunchPleadingWithArticle(selectedArticle)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs ${
                        isDark ? 'bg-amber-500 hover:bg-amber-400 text-black font-black' : 'bg-[#00288e] hover:bg-blue-900 text-white'
                      }`}
                      title="Draft Writ Petition under this Article"
                    >
                      <span className="material-symbols-outlined text-[14px]">gavel</span>
                      <span>Writ Pleading</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Verbatim Gazette Enactment Text */}
              <div className={`p-3.5 sm:p-4 rounded-xl border space-y-2 ${
                isDark ? 'bg-[#101426] border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    Verbatim Gazette Text • Official Enactment
                  </span>
                  <span className="text-[10px] font-mono text-amber-500">
                    Source: Gazette of India
                  </span>
                </div>
                <p className="text-[12px] sm:text-[12.5px] font-serif leading-relaxed whitespace-pre-wrap">
                  {selectedArticle.verbatim_text}
                </p>
              </div>

              {/* Plain Language Citizen Meaning */}
              <div className={`p-3.5 sm:p-4 rounded-xl border space-y-1.5 ${
                isDark ? 'bg-[#15192c] border-amber-500/25 text-amber-100' : 'bg-amber-50/70 border-amber-200 text-amber-950'
              }`}>
                <h5 className="text-[11px] font-mono font-bold uppercase text-amber-500 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px]">verified_user</span>
                  Plain Language Meaning for Citizens
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

        {/* TAB 2: CONTROVERSY ANALYZER */}
        {activeTab === 'analyzer' && (
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 md:p-6 space-y-3.5 sm:space-y-5 scrollbar-thin">
            <div className={`p-3.5 sm:p-4 rounded-xl border space-y-2.5 sm:space-y-3 ${
              isDark ? 'bg-[#131626] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500 text-[20px] sm:text-[22px]">psychology</span>
                  <h3 className="text-[13px] sm:text-[14px] font-black uppercase tracking-wider">
                    Real-Time Constitutional Threat & Controversy Decompiler
                  </h3>
                </div>
                <span className={`text-[10px] sm:text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Zero Hardcoding • Analyzes any government action, demolition, arrest or tender dispute
                </span>
              </div>

              <textarea
                rows={3}
                value={analyzerInput}
                onChange={(e) => setAnalyzerInput(e.target.value)}
                placeholder="Paste raw narrative of controversy: e.g. police detained citizen without warrant, municipal bulldozer demolition without notice, arbitrary tender cancellation, internet shutdown, employee dismissed without inquiry..."
                className={`w-full text-[12px] sm:text-[12.5px] p-2.5 sm:p-3 rounded-xl border font-sans focus:outline-none transition-all ${
                  isDark ? 'bg-[#181c2f] border-slate-700 text-white focus:border-amber-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#00288e]'
                }`}
              />

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`text-[10.5px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Quick Samples:</span>
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
                      className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-[10.5px] font-bold border transition-all cursor-pointer ${
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
                  className={`w-full sm:w-auto px-4 py-2 sm:py-2.5 rounded-xl text-[11.5px] sm:text-[12px] font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                    isDark ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-md' : 'bg-[#00288e] hover:bg-blue-900 text-white shadow-md'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">bolt</span>
                  <span>Decompile Constitutional Remedies</span>
                </button>
              </div>
            </div>

            {/* Analysis Result Display */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
              <div className="lg:col-span-7 space-y-3 sm:space-y-4">
                {/* Strategic Remedy Banner */}
                <div className={`p-3.5 sm:p-4 rounded-xl border space-y-2 ${
                  isDark ? 'bg-[#101426] border-emerald-900/50 text-emerald-100' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <span className="text-[10.5px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                      Recommended Prerogative Writ
                    </span>
                    <span className="text-[11px] sm:text-[12px] font-black font-mono px-2 py-0.5 rounded bg-emerald-500 text-white shrink-0">
                      {analysisResult.recommended_writ}
                    </span>
                  </div>
                  <h4 className="text-[14px] sm:text-[15px] font-black">{analysisResult.recommended_forum}</h4>
                  <p className="text-[11.5px] sm:text-[12px] leading-relaxed opacity-90">
                    {analysisResult.advocate_pleading_summary}
                  </p>
                </div>

                {/* Scrutiny Standard */}
                <div className={`p-3.5 sm:p-4 rounded-xl border space-y-1.5 ${
                  isDark ? 'bg-[#131628] border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <span className="text-[10px] sm:text-[10.5px] font-mono font-black uppercase text-amber-500">
                    Judicial Scrutiny Standard
                  </span>
                  <p className="text-[11.5px] sm:text-[12.5px] leading-relaxed font-serif">
                    {analysisResult.scrutiny_standard}
                  </p>
                </div>

                {/* Precedents Card */}
                <div className={`p-3.5 sm:p-4 rounded-xl border space-y-2.5 ${
                  isDark ? 'bg-[#131628] border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <span className="text-[10px] sm:text-[10.5px] font-mono font-black uppercase text-blue-400">
                    Binding Constitution Bench Precedents
                  </span>
                  <div className="space-y-2">
                    {analysisResult.key_precedents.map((p, idx) => (
                      <div key={idx} className={`p-2.5 rounded-lg border text-[11px] sm:text-[11.5px] ${
                        isDark ? 'bg-[#181c30] border-slate-700' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="flex flex-wrap items-center justify-between gap-1 font-bold">
                          <span className="text-amber-400">{p.case_title}</span>
                          <span className="font-mono text-[9.5px] sm:text-[10px] text-slate-400">{p.neutral_citation}</span>
                        </div>
                        <p className="text-[11px] mt-1 text-slate-300">{p.ratio_decidendi}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Invoked Constitutional Articles */}
              <div className="lg:col-span-5 space-y-2.5 sm:space-y-3">
                <h4 className={`text-[11.5px] sm:text-[12px] font-black uppercase tracking-wider ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Invoked Constitutional Provisions ({analysisResult.invoked_articles.length})
                </h4>

                <div className="space-y-2 sm:space-y-2.5">
                  {analysisResult.invoked_articles.map((art) => (
                    <div
                      key={art.article_id}
                      className={`p-2.5 sm:p-3 rounded-xl border space-y-1 ${
                        isDark ? 'bg-[#131628] border-slate-800' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[12px] sm:text-[13px] font-black text-amber-400 font-mono">
                          {art.article_number}
                        </span>
                        <span className="text-[9px] sm:text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-500 border border-amber-500/25 truncate max-w-[140px]">
                          {art.classification}
                        </span>
                      </div>
                      <h5 className="text-[11.5px] sm:text-[12px] font-bold line-clamp-1">{art.heading}</h5>
                      <p className={`text-[10.5px] sm:text-[11px] line-clamp-2 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {art.plain_explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PREAMBLE */}
        {activeTab === 'preamble' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 max-w-4xl mx-auto scrollbar-thin">
            <div className={`p-6 sm:p-8 rounded-2xl border text-center space-y-4 shadow-xl ${
              isDark ? 'bg-gradient-to-b from-[#181c33] to-[#0d1020] border-amber-500/30' : 'bg-gradient-to-b from-amber-50/80 to-white border-amber-200'
            }`}>
              <span className="text-[11px] sm:text-[12px] font-mono font-black uppercase tracking-widest text-amber-500">
                Preamble to the Sovereign Constitution of India
              </span>
              <p className="text-[14px] sm:text-[17px] md:text-[19px] font-serif leading-relaxed sm:leading-loose tracking-wide text-amber-100 dark:text-amber-200">
                "{preamble.verbatim_text}"
              </p>
              <div className={`p-2.5 sm:p-3 rounded-xl text-[11px] sm:text-[12px] font-mono max-w-xl mx-auto ${
                isDark ? 'bg-black/40 text-amber-300' : 'bg-white text-slate-800 border border-slate-200'
              }`}>
                Adopted by Constituent Assembly on 26th November 1949 • In Effect 26th January 1950
              </div>
            </div>

            {/* Landmark Precedents on Preamble */}
            <div className="space-y-2.5 sm:space-y-3">
              <h4 className="text-[12px] sm:text-[13px] font-black uppercase tracking-wider text-amber-400">
                Landmark Constitution Bench Authority on Basic Structure
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
                {preamble.landmark_precedents.map((p, idx) => (
                  <div key={idx} className={`p-3.5 sm:p-4 rounded-xl border space-y-1.5 ${
                    isDark ? 'bg-[#131626] border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <div className="flex flex-wrap items-center justify-between gap-1 font-bold">
                      <span className="text-amber-400 text-[12px] sm:text-[13px]">{p.case_title}</span>
                      <span className="text-[9.5px] sm:text-[10px] font-mono text-emerald-400">{p.bench_strength} Judges</span>
                    </div>
                    <p className="text-[11px] sm:text-[11.5px] leading-relaxed text-slate-300">
                      {p.ratio_decidendi}
                    </p>
                    <span className="text-[9.5px] sm:text-[10px] font-mono text-slate-400">
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
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 md:p-6 space-y-3 scrollbar-thin">
            <h3 className={`text-[12px] sm:text-[13px] font-black uppercase tracking-wider mb-2 ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}>
              Complete 12 Schedules of the Constitution of India
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
              {schedules.map((s) => (
                <div
                  key={s.schedule_number}
                  className={`p-3.5 sm:p-4 rounded-xl border space-y-1.5 sm:space-y-2 ${
                    isDark ? 'bg-[#121526] border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[12px] sm:text-[13px] font-black text-amber-400 font-mono">
                      {s.schedule_number}
                    </span>
                    <span className={`text-[9.5px] sm:text-[10px] font-mono truncate max-w-[150px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {s.articles_covered.join(', ')}
                    </span>
                  </div>
                  <h4 className="text-[12px] sm:text-[13px] font-bold">{s.title}</h4>
                  <p className={`text-[11px] sm:text-[11.5px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {s.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
