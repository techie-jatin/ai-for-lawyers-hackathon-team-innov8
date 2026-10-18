import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  ArrowRightLeft, 
  Calendar, 
  ShieldCheck, 
  AlertTriangle, 
  Copy, 
  Check, 
  MessageSquare,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { 
  ClientConcordanceEngine, 
  type ConcordanceItem, 
  type TransitionAdvisorResult 
} from '../services/clientConcordanceEngine';

export interface StatutoryConcordanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  onConsultInChat?: (item: ConcordanceItem) => void;
}

export const StatutoryConcordanceModal: React.FC<StatutoryConcordanceModalProps> = ({
  isOpen,
  onClose,
  isDark,
  onConsultInChat
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [incidentDate, setIncidentDate] = useState<string>('2024-05-15');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<ConcordanceItem | null>(null);

  // Transition evaluation
  const transitionAdvice: TransitionAdvisorResult = useMemo(() => {
    if (!incidentDate) return { status: 'error', message: 'Enter date' };
    return ClientConcordanceEngine.evaluateTransitionDate(incidentDate);
  }, [incidentDate]);

  // Filtered concordance list
  const filteredItems = useMemo(() => {
    return ClientConcordanceEngine.search(searchQuery, categoryFilter, 120);
  }, [searchQuery, categoryFilter]);

  if (!isOpen) return null;

  const handleCopyItem = (item: ConcordanceItem) => {
    const text = `
### STATUTORY CONCORDANCE: ${item.old_act} ${item.old_section} ⟷ ${item.new_act} ${item.new_section}
- Offense: ${item.offense_title}
- Classification: ${item.cognizable_status} | ${item.bailable_status}
- Penalty: ${item.penalty_summary}
- 2024 Legislative Shift: ${item.key_change}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-[10060] bg-black/80 flex items-center justify-center p-3 sm:p-5 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-colors ${
          isDark ? 'bg-[#0d101a] border-[#22283d] text-white' : 'bg-white border-[#e2e8f0] text-[#0f172a]'
        }`}
      >
        {/* MODAL HEADER */}
        <div className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
          isDark ? 'border-[#22283d] bg-[#121624]' : 'border-[#e2e8f0] bg-[#f8fafc]'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00288e] via-[#4338ca] to-[#ff7722] flex items-center justify-center text-white shadow-md shrink-0">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  100+ Statutory Concordance & Dual-Lookup Engine
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  2024–2026 Ready
                </span>
              </div>
              <p className={`text-[11.5px] font-medium mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                Bi-directional mapping: IPC ⟷ BNS • CrPC ⟷ BNSS • IEA ⟷ BSA • Savings Clause Advisor
              </p>
            </div>
          </div>

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

        {/* TRANSITION DATE & SAVINGS ADVISOR BANNER */}
        <div className={`px-5 py-3 border-b flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 ${
          isDark ? 'border-[#22283d] bg-[#090c14]' : 'border-[#e2e8f0] bg-[#eff6ff]'
        }`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-indigo-500/15 text-indigo-400 shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#ff7722]">
                  Date of Incident / Offence:
                </span>
                <input 
                  type="date"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  className={`px-2 py-0.5 rounded border text-xs font-mono font-bold focus:outline-none ${
                    isDark ? 'bg-[#14192b] border-[#293252] text-white' : 'bg-white border-slate-300 text-black'
                  }`}
                />
              </div>
              <p className={`text-[11px] truncate mt-0.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                {transitionAdvice.status === 'success' ? (
                  <span>
                    <strong>Governing Regime:</strong> {transitionAdvice.substantive_law} • {transitionAdvice.governing_savings_section}
                  </span>
                ) : (
                  <span>Select date to evaluate applicable substantive and procedural law.</span>
                )}
              </p>
            </div>
          </div>

          {transitionAdvice.status === 'success' && (
            <div className={`p-2 rounded-lg border text-xs flex items-center gap-2 shrink-0 ${
              transitionAdvice.regime === 'PRE_JULY_2024_COLONIAL_LAWS'
                ? isDark ? 'bg-amber-950/30 border-amber-800/40 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-900'
                : isDark ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <div className="leading-tight">
                <span className="font-bold block text-[10.5px]">
                  {transitionAdvice.regime === 'PRE_JULY_2024_COLONIAL_LAWS' ? 'IPC 1860 Applicable' : 'BNS 2023 Applicable'}
                </span>
                <span className="text-[9.5px] opacity-80">
                  {transitionAdvice.constitutional_safeguard?.split('(')[0]}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* SEARCH & CATEGORY FILTER BAR */}
        <div className={`p-4 border-b flex flex-col sm:flex-row items-center gap-3 shrink-0 ${
          isDark ? 'border-[#22283d] bg-[#101422]' : 'border-[#e2e8f0] bg-slate-50'
        }`}>
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text"
              placeholder="Search by colonial section (IPC 420), new section (BNS 318), or keyword (cheating, quash, arrest, bail)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 rounded-xl border text-xs font-medium focus:outline-none transition-all ${
                isDark 
                  ? 'bg-[#161a2c] border-[#293252] text-white placeholder-zinc-500 focus:border-[#ff7722]' 
                  : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-[#00288e]'
              }`}
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'ALL', label: 'All 100+ Transitions' },
              { id: 'IPC_BNS', label: 'IPC ⟷ BNS' },
              { id: 'CrPC_BNSS', label: 'CrPC ⟷ BNSS' },
              { id: 'IEA_BSA', label: 'IEA ⟷ BSA' },
              { id: 'SAVINGS_TRANSITION', label: 'Savings & Transition' },
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id)}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  categoryFilter === cat.id
                    ? isDark ? 'bg-white text-black border-white' : 'bg-[#00288e] text-white border-[#00288e]'
                    : isDark ? 'bg-[#161a2c] border-[#293252] text-zinc-300 hover:bg-[#1d233a]' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* MODAL MAIN CONTENT: SPLIT OR FULL LIST */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* LEFT: Concordance Transitions List (8 Cols) */}
          <div className={`${selectedItem ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-3`}>
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-1">
              <span>Showing {filteredItems.length} Provisions</span>
              <span className="hidden sm:inline">Click any card to inspect legislative shifts</span>
            </div>

            {filteredItems.length === 0 ? (
              <div className="p-12 text-center text-zinc-400">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-[#ff7722]" />
                <p className="text-sm font-bold">No statutory transitions matched "{searchQuery}".</p>
                <p className="text-xs mt-1">Try searching by section number like "420", "302", "438", or offense names.</p>
              </div>
            ) : (
              filteredItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedItem?.id === item.id
                      ? isDark 
                        ? 'bg-[#181d33] border-[#ff7722] shadow-md' 
                        : 'bg-orange-50/50 border-[#ff7722] shadow-md'
                      : isDark
                        ? 'bg-[#111422] border-[#21273d] hover:bg-[#161a2c]'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    {/* Section Mapping Pills */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${
                        isDark ? 'bg-zinc-800/60 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-300 text-slate-700'
                      }`}>
                        {item.old_act} • {item.old_section}
                      </span>
                      <ArrowRightLeft className="w-3.5 h-3.5 text-[#ff7722] shrink-0" />
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-extrabold bg-[#00288e]/15 text-[#60a5fa] border border-[#00288e]/40">
                        {item.new_act} • {item.new_section}
                      </span>
                    </div>

                    {/* Tags */}
                    <div className="flex items-center gap-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold ${
                        item.bailable_status.includes('Non-Bailable')
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {item.bailable_status.split(' ')[0]}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                        {item.cognizable_status.split(' ')[0]}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-[#ff7722]">
                    {item.offense_title}
                  </h4>

                  <p className={`text-[11px] leading-relaxed mt-1 line-clamp-2 ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
                    <strong>2024 Shift:</strong> {item.key_change}
                  </p>

                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-zinc-700/20 text-[10px] text-zinc-400">
                    <span className="truncate max-w-[280px]">
                      ⚖️ {item.penalty_summary}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyItem(item);
                        }}
                        className={`p-1 rounded flex items-center gap-1 transition-colors cursor-pointer ${
                          copiedId === item.id ? 'text-emerald-400' : 'hover:text-white'
                        }`}
                        title="Copy transition citation"
                      >
                        {copiedId === item.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === item.id ? 'Copied' : 'Copy'}</span>
                      </button>

                      {onConsultInChat && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onConsultInChat(item);
                            onClose();
                          }}
                          className="p-1 rounded text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer font-bold"
                          title="Open in Chat for Senior Advocate Strategy"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Consult in Chat</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* RIGHT: Detailed Legislative Shift Drawer (5 Cols) */}
          {selectedItem && (
            <div className="lg:col-span-5 space-y-4">
              <div className={`p-5 rounded-2xl border sticky top-0 transition-colors ${
                isDark ? 'bg-[#121626] border-[#222944]' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between pb-3 border-b border-zinc-700/20 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff7722]">
                    Legislative Evolution Profile
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-base font-black text-[#ff7722] mb-1">
                  {selectedItem.offense_title}
                </h3>

                {/* Section Comparison */}
                <div className="grid grid-cols-2 gap-2 my-3">
                  <div className={`p-3 rounded-xl border text-center ${
                    isDark ? 'bg-[#0a0d18] border-[#1d233a]' : 'bg-white border-slate-200'
                  }`}>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Colonial Law</span>
                    <strong className="text-xs font-mono block mt-0.5">{selectedItem.old_act}</strong>
                    <span className="text-xs font-black text-rose-400">{selectedItem.old_section}</span>
                  </div>

                  <div className={`p-3 rounded-xl border text-center ${
                    isDark ? 'bg-[#0a0d18] border-[#1d233a]' : 'bg-white border-slate-200'
                  }`}>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">2023–2024 Sanhita</span>
                    <strong className="text-xs font-mono block mt-0.5">{selectedItem.new_act}</strong>
                    <span className="text-xs font-black text-emerald-400">{selectedItem.new_section}</span>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-2 flex-wrap mb-3 text-xs font-mono">
                  <span className="px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                    Status: {selectedItem.status}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
                    {selectedItem.cognizable_status}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    {selectedItem.bailable_status}
                  </span>
                </div>

                {/* Substantive Change Highlight */}
                <div className={`p-3.5 rounded-xl border text-xs leading-relaxed space-y-1 mb-3 ${
                  isDark ? 'bg-blue-950/20 border-blue-900/40 text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-900'
                }`}>
                  <strong className="flex items-center gap-1.5 font-bold uppercase text-[10.5px]">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    Substantive Legislative Shift:
                  </strong>
                  <p>{selectedItem.key_change}</p>
                </div>

                {/* Penalty & Sentencing */}
                <div className={`p-3.5 rounded-xl border text-xs leading-relaxed space-y-1 mb-4 ${
                  isDark ? 'bg-[#0a0d18] border-[#1d233a] text-zinc-300' : 'bg-white border-slate-200 text-slate-800'
                }`}>
                  <strong className="flex items-center gap-1.5 font-bold uppercase text-[10.5px] text-[#ff7722]">
                    <BookOpen className="w-3.5 h-3.5" />
                    Penal / Sentencing Sanction:
                  </strong>
                  <p>{selectedItem.penalty_summary}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyItem(selectedItem)}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      copiedId === selectedItem.id 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                        : isDark ? 'bg-[#181d30] hover:bg-[#202742] text-white border-[#2d3552]' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                    }`}
                  >
                    {copiedId === selectedItem.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedId === selectedItem.id ? 'Copied Citation' : 'Copy Citation'}</span>
                  </button>

                  {onConsultInChat && (
                    <button
                      type="button"
                      onClick={() => {
                        onConsultInChat(selectedItem);
                        onClose();
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#00288e] to-[#ff7722] hover:opacity-90 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Consult in Chat</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className={`px-5 py-3 border-t flex items-center justify-between shrink-0 ${
          isDark ? 'border-[#22283d] bg-[#121624]' : 'border-[#e2e8f0] bg-[#f8fafc]'
        }`}>
          <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>100+ Enactments Aligned with Gazette Notification S.O. 850(E)</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isDark ? 'bg-[#181d30] hover:bg-[#202742] text-white border-[#2d3552]' : 'bg-slate-200 hover:bg-slate-300 text-slate-800 border-slate-300'
            }`}
          >
            Close Concordance
          </button>
        </div>
      </div>
    </div>
  );
};
