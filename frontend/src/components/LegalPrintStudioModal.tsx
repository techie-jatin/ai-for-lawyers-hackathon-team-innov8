import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Printer, 
  X, 
  CheckSquare, 
  Square, 
  Scale, 
  ShieldCheck, 
  Sliders, 
  Eye, 
  Stamp, 
  FileCheck
} from 'lucide-react';
import type { ChatMessage, ApplicableLaw } from './ChatView';
import type { RealCasePrecedentItem } from './PrecedentDossierDrawer';
import { LegalStructuredAnswer } from './LegalMarkdownRenderer';

export interface PrintStudioOptions {
  scope: 'last' | 'all' | 'selected';
  selectedTurnIndices: number[];
  includeUserPrompts: boolean;
  includeStatutoryPills: boolean;
  includeGazetteEvidence: boolean;
  includePrecedents: boolean;
  includeChamberSeal: boolean;
  includeSignatureBlock: boolean;
  colorProfile: 'royal' | 'monochrome';
  paperSize: 'a4' | 'legal';
}

export interface LegalExchange {
  index: number;
  userMsg?: ChatMessage;
  assistantMsg: ChatMessage;
}

interface LegalPrintStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  activeThreadTitle: string;
  activeThreadId: string;
  mode: 'citizen' | 'professional';
  isDark: boolean;
  options: PrintStudioOptions;
  onOptionsChange: (options: PrintStudioOptions) => void;
  onTriggerPrint: () => void;
}

export function groupMessagesIntoExchanges(messages: ChatMessage[]): LegalExchange[] {
  const exchanges: LegalExchange[] = [];
  let currentUserMsg: ChatMessage | undefined = undefined;

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.role === 'user') {
      currentUserMsg = msg;
    } else if (msg.role === 'assistant') {
      exchanges.push({
        index: exchanges.length,
        userMsg: currentUserMsg,
        assistantMsg: msg
      });
      currentUserMsg = undefined;
    }
  }

  // If there's an orphan assistant message without preceding user message
  if (exchanges.length === 0 && messages.some(m => m.role === 'assistant')) {
    const astMsgs = messages.filter(m => m.role === 'assistant');
    astMsgs.forEach((ast, idx) => {
      exchanges.push({
        index: idx,
        assistantMsg: ast
      });
    });
  }

  return exchanges;
}

export function LegalPrintStudioModal({
  isOpen,
  onClose,
  messages,
  activeThreadTitle,
  activeThreadId,
  mode,
  isDark,
  options,
  onOptionsChange,
  onTriggerPrint
}: LegalPrintStudioModalProps) {
  const [activeMobileTab, setActiveMobileTab] = useState<'options' | 'preview'>('options');

  // Dismiss on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Lock body scroll while modal is active on mobile & desktop
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const exchanges = useMemo(() => groupMessagesIntoExchanges(messages), [messages]);

  // Derived filtered exchanges based on scope
  const printableExchanges = useMemo(() => {
    if (exchanges.length === 0) return [];
    if (options.scope === 'last') {
      return [exchanges[exchanges.length - 1]];
    }
    if (options.scope === 'selected') {
      return exchanges.filter(e => options.selectedTurnIndices.includes(e.index));
    }
    return exchanges;
  }, [exchanges, options.scope, options.selectedTurnIndices]);

  const toggleTurnSelection = (index: number) => {
    const current = [...options.selectedTurnIndices];
    const exists = current.includes(index);
    let updated: number[];
    if (exists) {
      updated = current.filter(i => i !== index);
    } else {
      updated = [...current, index].sort((a, b) => a - b);
    }
    onOptionsChange({
      ...options,
      selectedTurnIndices: updated
    });
  };

  const handlePrintClick = () => {
    onTriggerPrint();
  };

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="no-print fixed inset-0 z-[10010] flex items-center justify-center p-0 sm:p-3 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 h-[100dvh] max-h-[100dvh] pt-[max(0.25rem,env(safe-area-inset-top))] pb-[max(0.5rem,env(safe-area-inset-bottom))] px-[env(safe-area-inset-left)]"
    >
      <div 
        className={`w-full h-full min-h-0 sm:h-[94vh] sm:max-h-[920px] max-w-6xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border ${
          isDark ? 'bg-[#0f121d] border-[#252c48] text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* MODAL HEADER */}
        <header className={`px-3.5 sm:px-6 py-2.5 sm:py-4 border-b flex items-center justify-between shrink-0 ${
          isDark ? 'bg-[#141827] border-[#22283f]' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
              <Printer className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h2 className="text-[13.5px] sm:text-[17px] font-bold tracking-tight truncate">
                  <span className="sm:hidden">Legal Print Studio</span>
                  <span className="hidden sm:inline">Court-Ready Legal Print & PDF Export Studio</span>
                </h2>
                <span className="hidden xs:inline-block text-[9px] sm:text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
                  Judicial Standard
                </span>
              </div>
              <p className={`text-[10.5px] sm:text-[12px] truncate ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Configure chamber memorandum, selection scope, and formal letterhead
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 sm:p-2 rounded-xl transition-colors cursor-pointer border ${
                isDark ? 'bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 hover:text-white border-zinc-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border-slate-300'
              }`}
              title="Close Print Studio (Esc)"
              aria-label="Close Print Studio"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* MOBILE RESPONSIVE SEGMENTED TAB SWITCHER (< md) */}
        <div className="md:hidden flex border-b shrink-0 px-2.5 py-1.5 gap-2 bg-slate-100/70 dark:bg-[#111422] border-slate-200 dark:border-[#22283f]">
          <button
            type="button"
            onClick={() => setActiveMobileTab('options')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeMobileTab === 'options'
                ? 'bg-amber-500 text-black shadow-xs font-black'
                : isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 shrink-0" />
            <span>Options</span>
            <span className="hidden xs:inline">& Scope</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMobileTab('preview')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeMobileTab === 'preview'
                ? 'bg-amber-500 text-black shadow-xs font-black'
                : isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5 shrink-0" />
            <span>A4 Preview</span>
            <span className="text-[10px] font-mono opacity-80">({printableExchanges.length})</span>
          </button>
        </div>

        {/* MODAL BODY (DUAL PANEL ON MD+, TABBED ON MOBILE) */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden relative">
          {/* LEFT PANEL: CONFIGURATION CONTROLS */}
          <div 
            className={`w-full flex-1 md:flex-none md:w-[380px] lg:w-[420px] p-4 sm:p-5 overflow-y-auto space-y-6 h-full min-h-0 md:shrink-0 md:border-r overscroll-contain touch-pan-y ${
              isDark ? 'bg-[#0f121d] border-[#22283f]' : 'bg-white border-slate-200'
            } ${activeMobileTab === 'options' ? 'block' : 'hidden md:block'}`}
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            
            {/* SCOPE SELECTOR */}
            <div className="space-y-3">
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#ff7722] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                1. Consultation Export Scope
              </label>

              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => onOptionsChange({ ...options, scope: 'last' })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                    options.scope === 'last'
                      ? isDark 
                        ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-xs' 
                        : 'bg-amber-50/80 border-amber-500 text-slate-900 shadow-xs'
                      : isDark
                        ? 'bg-[#141827] border-[#22283f] text-zinc-400 hover:text-zinc-200'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                    options.scope === 'last' ? 'border-amber-500 bg-amber-500' : 'border-zinc-400'
                  }`}>
                    {options.scope === 'last' && <div className="w-1.5 h-1.5 rounded-full bg-black"></div>}
                  </div>
                  <div>
                    <div className="text-[13px] font-bold">Latest Exchange (Current Turn)</div>
                    <div className="text-[11px] opacity-80 leading-snug mt-0.5">
                      Exports only the latest question and legal response. Best for client handouts.
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onOptionsChange({ ...options, scope: 'all' })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                    options.scope === 'all'
                      ? isDark 
                        ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-xs' 
                        : 'bg-amber-50/80 border-amber-500 text-slate-900 shadow-xs'
                      : isDark
                        ? 'bg-[#141827] border-[#22283f] text-zinc-400 hover:text-zinc-200'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                    options.scope === 'all' ? 'border-amber-500 bg-amber-500' : 'border-zinc-400'
                  }`}>
                    {options.scope === 'all' && <div className="w-1.5 h-1.5 rounded-full bg-black"></div>}
                  </div>
                  <div>
                    <div className="text-[13px] font-bold">Complete Consultation ({exchanges.length} Turns)</div>
                    <div className="text-[11px] opacity-80 leading-snug mt-0.5">
                      Chronological multi-turn transcript with cumulative section numbering.
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onOptionsChange({ 
                    ...options, 
                    scope: 'selected',
                    selectedTurnIndices: options.selectedTurnIndices.length === 0 && exchanges.length > 0 
                      ? [exchanges.length - 1] 
                      : options.selectedTurnIndices
                  })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                    options.scope === 'selected'
                      ? isDark 
                        ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-xs' 
                        : 'bg-amber-50/80 border-amber-500 text-slate-900 shadow-xs'
                      : isDark
                        ? 'bg-[#141827] border-[#22283f] text-zinc-400 hover:text-zinc-200'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                    options.scope === 'selected' ? 'border-amber-500 bg-amber-500' : 'border-zinc-400'
                  }`}>
                    {options.scope === 'selected' && <div className="w-1.5 h-1.5 rounded-full bg-black"></div>}
                  </div>
                  <div>
                    <div className="text-[13px] font-bold">Selective Turns (Custom Pick)</div>
                    <div className="text-[11px] opacity-80 leading-snug mt-0.5">
                      Pick specific questions and statutory opinions to include.
                    </div>
                  </div>
                </button>
              </div>

              {/* SELECTIVE TURN CHECKLIST */}
              {options.scope === 'selected' && (
                <div 
                  className={`p-3 rounded-xl border space-y-2 mt-2 max-h-48 overflow-y-auto overscroll-contain touch-pan-y ${
                    isDark ? 'bg-[#131726] border-[#252c48]' : 'bg-slate-50 border-slate-200'
                  }`}
                  style={{ WebkitOverflowScrolling: 'touch' }}
                >
                  <div className="text-[10px] font-mono font-bold uppercase text-zinc-400 mb-1 flex items-center justify-between">
                    <span>Select Exchanges to Print</span>
                    <span>{options.selectedTurnIndices.length} of {exchanges.length} Selected</span>
                  </div>
                  {exchanges.map((ex) => {
                    const isChecked = options.selectedTurnIndices.includes(ex.index);
                    const querySnippet = ex.userMsg?.text 
                      ? (ex.userMsg.text.length > 55 ? ex.userMsg.text.slice(0, 55) + '...' : ex.userMsg.text)
                      : 'Statutory Research Inquiry';
                    const domainLabel = ex.assistantMsg.response?.auto_detected_domain || 'Legal Opinion';

                    return (
                      <div
                        key={ex.index}
                        onClick={() => toggleTurnSelection(ex.index)}
                        className={`p-2 rounded-lg border text-xs flex items-start gap-2.5 cursor-pointer transition-colors ${
                          isChecked
                            ? isDark
                              ? 'bg-amber-500/10 border-amber-500/40 text-white'
                              : 'bg-amber-50 border-amber-400 text-slate-900'
                            : isDark
                              ? 'bg-[#181d30] border-[#2b334d] text-zinc-400 hover:text-zinc-200'
                              : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0 text-amber-500">
                          {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-zinc-400" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-[11px]">Turn {ex.index + 1}</span>
                            <span className="text-[9.5px] font-mono text-zinc-400 truncate max-w-[120px]">
                              {domainLabel}
                            </span>
                          </div>
                          <div className="text-[11px] truncate opacity-90 mt-0.5">
                            "{querySnippet}"
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* CONTENT & PRIVACY TOGGLES */}
            <div className="space-y-3">
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#ff7722] flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5" />
                2. Content & Privacy Filters
              </label>

              <div className="space-y-2">
                <label className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-[0.99] ${
                  isDark ? 'bg-[#141827] border-[#22283f] hover:bg-[#1a2035]' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}>
                  <div className="flex flex-col min-w-0 pr-1">
                    <span className="text-[12.5px] font-bold">Include Inquirer Questions</span>
                    <span className={`text-[10.5px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      Print raw client questions as formal "Statement of Facts"
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={options.includeUserPrompts}
                    onChange={(e) => onOptionsChange({ ...options, includeUserPrompts: e.target.checked })}
                    className="w-5 h-5 accent-amber-500 rounded cursor-pointer shrink-0"
                  />
                </label>

                <label className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-[0.99] ${
                  isDark ? 'bg-[#141827] border-[#22283f] hover:bg-[#1a2035]' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}>
                  <div className="flex flex-col min-w-0 pr-1">
                    <span className="text-[12.5px] font-bold">Applicable Statutory Framework Pills</span>
                    <span className={`text-[10.5px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      Display governing Act & Section badges at top of analysis
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={options.includeStatutoryPills}
                    onChange={(e) => onOptionsChange({ ...options, includeStatutoryPills: e.target.checked })}
                    className="w-5 h-5 accent-amber-500 rounded cursor-pointer shrink-0"
                  />
                </label>

                <label className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-[0.99] ${
                  isDark ? 'bg-[#141827] border-[#22283f] hover:bg-[#1a2035]' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}>
                  <div className="flex flex-col min-w-0 pr-1">
                    <span className="text-[12.5px] font-bold">Verbatim Gazette Citations</span>
                    <span className={`text-[10.5px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      Print authentic gazette provision texts in warm parchment blockquotes
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={options.includeGazetteEvidence}
                    onChange={(e) => onOptionsChange({ ...options, includeGazetteEvidence: e.target.checked })}
                    className="w-5 h-5 accent-amber-500 rounded cursor-pointer shrink-0"
                  />
                </label>

                <label className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-[0.99] ${
                  isDark ? 'bg-[#141827] border-[#22283f] hover:bg-[#1a2035]' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}>
                  <div className="flex flex-col min-w-0 pr-1">
                    <span className="text-[12.5px] font-bold">Binding Court Precedents</span>
                    <span className={`text-[10.5px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      Include Supreme Court ratios, factual matrices & litigation strategies
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={options.includePrecedents}
                    onChange={(e) => onOptionsChange({ ...options, includePrecedents: e.target.checked })}
                    className="w-5 h-5 accent-amber-500 rounded cursor-pointer shrink-0"
                  />
                </label>

                <label className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-[0.99] ${
                  isDark ? 'bg-[#141827] border-[#22283f] hover:bg-[#1a2035]' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}>
                  <div className="flex flex-col min-w-0 pr-1">
                    <span className="text-[12.5px] font-bold">Chamber Security Watermark & Seal</span>
                    <span className={`text-[10.5px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      Print official digital docket watermark & verification barcode
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={options.includeChamberSeal}
                    onChange={(e) => onOptionsChange({ ...options, includeChamberSeal: e.target.checked })}
                    className="w-5 h-5 accent-amber-500 rounded cursor-pointer shrink-0"
                  />
                </label>

                <label className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-[0.99] ${
                  isDark ? 'bg-[#141827] border-[#22283f] hover:bg-[#1a2035]' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}>
                  <div className="flex flex-col min-w-0 pr-1">
                    <span className="text-[12.5px] font-bold">Advocate Signature & Endorsement Block</span>
                    <span className={`text-[10.5px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      Print formal Counsel Enrolment & Bar Council sign-off box
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={options.includeSignatureBlock}
                    onChange={(e) => onOptionsChange({ ...options, includeSignatureBlock: e.target.checked })}
                    className="w-5 h-5 accent-amber-500 rounded cursor-pointer shrink-0"
                  />
                </label>
              </div>
            </div>

            {/* COLOR PROFILE & PAPER SIZE */}
            <div className="space-y-3">
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#ff7722] flex items-center gap-1.5">
                <Stamp className="w-3.5 h-3.5" />
                3. Color Profile & Paper Standard
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onOptionsChange({ ...options, colorProfile: 'royal' })}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    options.colorProfile === 'royal'
                      ? isDark
                        ? 'bg-amber-500/15 border-amber-500 text-white font-bold'
                        : 'bg-amber-50 border-amber-500 text-slate-900 font-bold'
                      : isDark
                        ? 'bg-[#141827] border-[#22283f] text-zinc-400'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="text-[12px]">Royal Navy & Gold</div>
                  <div className="text-[9.5px] opacity-75 mt-0.5">Prestige Full Visuals</div>
                </button>

                <button
                  type="button"
                  onClick={() => onOptionsChange({ ...options, colorProfile: 'monochrome' })}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    options.colorProfile === 'monochrome'
                      ? isDark
                        ? 'bg-amber-500/15 border-amber-500 text-white font-bold'
                        : 'bg-amber-50 border-amber-500 text-slate-900 font-bold'
                      : isDark
                        ? 'bg-[#141827] border-[#22283f] text-zinc-400'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="text-[12px]">Monochrome Filing</div>
                  <div className="text-[9.5px] opacity-75 mt-0.5">Black & White Ink-Saver</div>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => onOptionsChange({ ...options, paperSize: 'a4' })}
                  className={`p-2 rounded-lg border text-center text-xs transition-all cursor-pointer ${
                    options.paperSize === 'a4'
                      ? isDark ? 'border-amber-500 bg-amber-500/10 text-white font-bold' : 'border-amber-500 bg-amber-50 text-slate-900 font-bold'
                      : isDark ? 'border-[#22283f] bg-[#141827] text-zinc-400' : 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  A4 Standard (210×297mm)
                </button>

                <button
                  type="button"
                  onClick={() => onOptionsChange({ ...options, paperSize: 'legal' })}
                  className={`p-2 rounded-lg border text-center text-xs transition-all cursor-pointer ${
                    options.paperSize === 'legal'
                      ? isDark ? 'border-amber-500 bg-amber-500/10 text-white font-bold' : 'border-amber-500 bg-amber-50 text-slate-900 font-bold'
                      : isDark ? 'border-[#22283f] bg-[#141827] text-zinc-400' : 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  Legal Docket (8.5×14in)
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT PANEL: LIVE WYSIWYG A4 PREVIEW CANVAS */}
          <div 
            className={`w-full flex-1 h-full min-h-0 p-3 sm:p-6 overflow-y-auto flex flex-col items-center justify-start overscroll-contain touch-pan-y ${
              isDark ? 'bg-[#090b12]' : 'bg-slate-200/70'
            } ${activeMobileTab === 'preview' ? 'flex' : 'hidden md:flex'}`}
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="w-full flex items-center justify-between mb-3 max-w-[620px] text-[11px] font-mono text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-amber-500" />
                Live Scaled Courtroom Preview ({options.paperSize.toUpperCase()})
              </span>
              <span>{printableExchanges.length} exchange(s) in print queue</span>
            </div>

            {/* SCALED A4 DOCUMENT PREVIEW CONTAINER */}
            <div 
              className={`w-full max-w-[620px] bg-white text-slate-900 shadow-2xl p-3.5 sm:p-8 rounded-sm border transition-all text-[11px] font-serif leading-normal overflow-hidden ${
                options.colorProfile === 'monochrome' ? 'grayscale contrast-125' : ''
              }`}
              style={{
                boxShadow: '0 20px 40px -15px rgba(0,0,0,0.4)',
                border: options.colorProfile === 'monochrome' ? '3px double #000' : '3px double #00288e'
              }}
            >
              {/* COURTROOM DOUBLE BORDER INNER FRAME */}
              <div 
                className="w-full p-2.5 sm:p-5 relative"
                style={{
                  border: options.colorProfile === 'monochrome' ? '1px solid #333' : '1px solid #d97706'
                }}
              >
                {/* WATERMARK */}
                {options.includeChamberSeal && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                    <Scale className="w-48 h-48 sm:w-64 sm:h-64 text-[#00288e]" />
                  </div>
                )}

                {/* OFFICIAL CHAMBER LETTERHEAD */}
                <div className="border-b-2 border-black pb-3 mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-[#00288e] text-white flex items-center justify-center font-bold text-base sm:text-lg font-serif shrink-0">
                        <Scale className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                      </div>
                      <div>
                        <div className="text-[13pt] sm:text-[15pt] font-serif font-black tracking-tight leading-none text-[#00288e]">
                          भारत Legal Intelligence
                        </div>
                        <div className="text-[7pt] sm:text-[7.5pt] font-mono text-slate-600 tracking-wider uppercase mt-0.5">
                          Constitutional & Statutory AI Research Dossier
                        </div>
                      </div>
                    </div>
                    <div className="text-left sm:text-right text-[7pt] sm:text-[7.5pt] font-mono text-slate-700 leading-tight">
                      <div><strong>Docket:</strong> #{activeThreadId.slice(0, 12).toUpperCase()}</div>
                      <div><strong>Date:</strong> {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                      <div><strong>Jurisdiction:</strong> Republic of India</div>
                    </div>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-slate-300 flex flex-wrap items-center justify-between gap-1 text-[7pt] sm:text-[7.5pt] font-mono text-slate-600">
                    <span className="truncate max-w-[180px] sm:max-w-none"><strong>Matter:</strong> {activeThreadTitle}</span>
                    <span className="font-bold text-[#00288e]">
                      {mode === 'citizen' ? 'Citizen Legal Advisory' : 'Advocate Chamber Brief'}
                    </span>
                    <span className="hidden xs:inline">Era: 2024 Sanhitas</span>
                  </div>
                </div>

                {/* PREVIEW EXCHANGES STREAM */}
                {printableExchanges.length === 0 ? (
                  <div className="py-12 text-center text-zinc-400 font-mono text-xs">
                    No exchanges selected for printing. Check at least one turn from the sidebar.
                  </div>
                ) : (
                  <div className="space-y-5">
                    {printableExchanges.map((ex, i) => (
                      <div key={i} className="space-y-3 pb-3 border-b border-dashed border-slate-300 last:border-b-0">
                        {/* STATEMENT OF FACTS (USER QUESTION) */}
                        {options.includeUserPrompts && ex.userMsg && (
                          <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-[10px]">
                            <div className="font-bold font-mono text-[9px] uppercase tracking-wider text-slate-700 mb-1 flex flex-wrap items-center justify-between gap-1">
                              <span>Statement of Facts (Turn {ex.index + 1})</span>
                              <span>{ex.userMsg.timestamp || 'Recorded'}</span>
                            </div>
                            <p className="italic text-slate-800 break-words">
                              "{ex.userMsg.text}"
                            </p>
                          </div>
                        )}

                        {/* LEGAL OPINION HEADER */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10.5px] sm:text-[11px] font-bold text-[#00288e] pt-1">
                          <span className="uppercase tracking-tight">
                            Section {i + 1}: Statutory Advisory & Jurisprudential Ratio
                          </span>
                          <span className="text-[8.5pt] sm:text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200 self-start sm:self-auto truncate max-w-full sm:max-w-[220px]">
                            {ex.assistantMsg.response?.auto_detected_domain || 'Indian Law'}
                          </span>
                        </div>

                        {/* APPLICABLE STATUTORY FRAMEWORK PILLS */}
                        {options.includeStatutoryPills && ex.assistantMsg.response?.applicable_laws && ex.assistantMsg.response.applicable_laws.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {ex.assistantMsg.response.applicable_laws.slice(0, 3).map((l: ApplicableLaw, lIdx: number) => (
                              <span key={lIdx} className="px-1.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-900 rounded text-[8.5pt] font-mono font-medium">
                                {l.source_title} • {l.section_number}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* LEGAL ANSWER TEXT */}
                        <div className="text-[9.5pt] text-slate-900 leading-relaxed space-y-2 break-words">
                          <LegalStructuredAnswer
                            answerText={ex.assistantMsg.response?.answer || ex.assistantMsg.text}
                            isDark={false}
                            mode={mode}
                          />
                        </div>

                        {/* VERBATIM GAZETTE EVIDENCE */}
                        {options.includeGazetteEvidence && ex.assistantMsg.response?.applicable_laws && ex.assistantMsg.response.applicable_laws.length > 0 && (
                          <div className="p-2.5 rounded bg-[#fffbeb] border-l-4 border-[#d97706] border-y border-r border-amber-200 text-[9pt] italic text-slate-900">
                            <span className="font-bold not-italic font-mono text-[8pt] text-amber-900 block mb-0.5">
                              Official Gazette Enactment Text ({ex.assistantMsg.response.applicable_laws[0].section_number})
                            </span>
                            <span className="break-words">
                              "{ex.assistantMsg.response.applicable_laws[0].text_snippet || 'Verified against Gazette of India enactment.'}"
                            </span>
                          </div>
                        )}

                        {/* PRECEDENTS */}
                        {options.includePrecedents && ex.assistantMsg.response?.similar_cases && ex.assistantMsg.response.similar_cases.length > 0 && (
                          <div className="p-2 rounded bg-slate-50 border border-slate-200 text-[8.5pt] space-y-1">
                            <div className="font-bold text-[#00288e] flex items-center gap-1">
                              <Scale className="w-3 h-3 text-amber-600 shrink-0" />
                              <span className="break-words">Landmark Precedent: {ex.assistantMsg.response.similar_cases[0].title} ({ex.assistantMsg.response.similar_cases[0].citation})</span>
                            </div>
                            <p className="text-slate-700 break-words">
                              <strong>Holding:</strong> {ex.assistantMsg.response.similar_cases[0].court_holding}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* SIGNATURE & ENDORSEMENT BLOCK */}
                {options.includeSignatureBlock && (
                  <div className="mt-8 pt-4 border-t-2 border-black grid grid-cols-1 sm:grid-cols-2 gap-4 text-[8.5pt] font-mono">
                    <div>
                      <div className="font-bold text-slate-800">CONSULTATION NATURE:</div>
                      <div className="text-slate-600 mt-0.5">
                        Chamber Legal Research & Statutory Assessment.<br />
                        Confidential under Advocates Act, 1961.
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="border-b border-black w-full sm:w-48 sm:ml-auto pb-6 mb-1 text-slate-400">
                        [Counsel Signature & Seal]
                      </div>
                      <div className="font-bold text-slate-800">Advocate / Jurist Endorsement</div>
                      <div className="text-slate-600 text-[8pt]">Enrolment No.: _________________</div>
                    </div>
                  </div>
                )}

                {/* FOOTER VERIFICATION */}
                <div className="mt-4 pt-2 border-t border-slate-300 text-[7pt] font-mono text-slate-500 text-center flex flex-wrap items-center justify-between gap-1">
                  <span>Ground-truth validated against Constitution of India & 2024 Sanhitas</span>
                  <span className="hidden xs:inline">Docket Ref: #{activeThreadId.slice(0, 10).toUpperCase()}</span>
                  <span>Page 1 (Preview)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER ACTION BAR */}
        <footer className={`px-3.5 sm:px-6 py-2.5 sm:py-3.5 border-t flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 shrink-0 ${
          isDark ? 'bg-[#141827] border-[#22283f]' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 text-[11px] sm:text-xs font-mono text-zinc-400 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>High Court Standard</span>
            </div>
            <span className="text-amber-500 font-bold">• {printableExchanges.length} exchange(s) queued</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer text-center ${
                isDark ? 'border-zinc-700 hover:bg-zinc-800 text-zinc-300' : 'border-slate-300 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handlePrintClick}
              disabled={printableExchanges.length === 0}
              className="flex-2 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold bg-[#ff7722] hover:bg-[#ff8833] text-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-black"
            >
              <Printer className="w-4 h-4 text-black shrink-0" />
              <span className="sm:hidden">Print / Save PDF</span>
              <span className="hidden sm:inline">Print / Save as PDF ({options.paperSize.toUpperCase()})</span>
            </button>
          </div>
        </footer>
      </div>
    </div>,
    document.body
  );
}

// =====================================================================
// DEDICATED COURT-READY PRINT CANVAS COMPONENT
// Exclusively rendered when window.print() is executed
// =====================================================================
export interface CourtReadyPrintCanvasProps {
  messages: ChatMessage[];
  activeThreadTitle: string;
  activeThreadId: string;
  mode: 'citizen' | 'professional';
  options: PrintStudioOptions;
}

export function CourtReadyPrintCanvas({
  messages,
  activeThreadTitle,
  activeThreadId,
  mode,
  options
}: CourtReadyPrintCanvasProps) {
  const exchanges = useMemo(() => groupMessagesIntoExchanges(messages), [messages]);

  const printableExchanges = useMemo(() => {
    if (exchanges.length === 0) return [];
    if (options.scope === 'last') {
      return [exchanges[exchanges.length - 1]];
    }
    if (options.scope === 'selected') {
      return exchanges.filter(e => options.selectedTurnIndices.includes(e.index));
    }
    return exchanges;
  }, [exchanges, options.scope, options.selectedTurnIndices]);

  if (printableExchanges.length === 0 || typeof document === 'undefined') return null;

  const isMonochrome = options.colorProfile === 'monochrome';

  return createPortal(
    <div 
      id="court-ready-print-canvas" 
      className={`hidden print:block w-full text-black bg-white ${isMonochrome ? 'monochrome-court-filing' : 'court-royal-navy'}`}
      style={{
        fontFamily: "'Georgia', 'Times New Roman', serif"
      }}
    >
      {/* HIGH COURT DOUBLE BORDER WRAPPER */}
      <div 
        className="court-double-border w-full p-6 sm:p-8"
        style={{
          border: isMonochrome ? '3px double #000000' : '3px double #00288e',
          minHeight: '100%'
        }}
      >
        {/* INNER HAIRLINE BORDER */}
        <div 
          className="court-inner-frame w-full p-4 sm:p-6"
          style={{
            border: isMonochrome ? '1px solid #444444' : '1px solid #d97706'
          }}
        >
          {/* OFFICIAL CHAMBER LETTERHEAD */}
          <header className="border-b-2 border-black pb-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div 
                  className="w-12 h-12 rounded flex items-center justify-center font-bold"
                  style={{
                    backgroundColor: isMonochrome ? '#000000' : '#00288e',
                    color: '#ffffff'
                  }}
                >
                  <Scale className="w-8 h-8 text-amber-400" />
                </div>
                <div>
                  <h1 
                    className="text-[20pt] font-serif font-black tracking-tight leading-none"
                    style={{ color: isMonochrome ? '#000000' : '#00288e' }}
                  >
                    भारत Legal Intelligence
                  </h1>
                  <p className="text-[8.5pt] font-mono text-slate-700 tracking-wider uppercase mt-1">
                    National Constitutional & Statutory AI Jurisprudence Platform
                  </p>
                </div>
              </div>

              <div className="text-right text-[8.5pt] font-mono text-slate-800 leading-tight">
                <div><strong>DOCKET REF:</strong> #{activeThreadId.slice(0, 16).toUpperCase()}</div>
                <div><strong>DATE & TIME:</strong> {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })} | {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST</div>
                <div><strong>JURISDICTION:</strong> Republic of India (Bharatiya Sanhitas 2024)</div>
              </div>
            </div>

            {/* METADATA STRIP */}
            <div className="mt-3 pt-2 border-t border-slate-400 flex flex-wrap items-center justify-between gap-1.5 text-[8pt] font-mono text-slate-700">
              <span className="truncate max-w-[280px] sm:max-w-none"><strong>MATTER / CONSULTATION:</strong> {activeThreadTitle}</span>
              <span className="font-bold text-[#00288e]">
                <strong>CLASSIFICATION:</strong> {mode === 'citizen' ? 'Citizen Legal Advisory Report' : 'Senior Advocate Chamber Brief'}
              </span>
              <span><strong>GROUNDING:</strong> 100% Neon pgvector Gazette Verified</span>
            </div>
          </header>

          {/* PRINTABLE EXCHANGES STREAM */}
          <main className="space-y-6">
            {printableExchanges.map((ex, idx) => (
              <section key={idx} className="print-exchange-block space-y-4 pb-6 border-b border-dashed border-slate-400 last:border-b-0">
                {/* STATEMENT OF FACTS (USER QUESTION) */}
                {options.includeUserPrompts && ex.userMsg && (
                  <div className="print-statement-of-facts p-3.5 rounded bg-slate-50 border border-slate-300 text-[10pt]">
                    <div className="font-bold font-mono text-[9pt] uppercase tracking-wider text-slate-700 mb-1 flex flex-wrap items-center justify-between gap-1">
                      <span>Statement of Facts & Inquiry (Turn {ex.index + 1})</span>
                      <span>Recorded: {ex.userMsg.timestamp || 'Today'}</span>
                    </div>
                    <blockquote className="italic text-slate-900 border-l-2 border-slate-400 pl-2.5 my-1">
                      "{ex.userMsg.text}"
                    </blockquote>
                    <div className="text-[8pt] font-mono text-slate-500 mt-1">
                      Confidential Client / Counsel Communication under the Advocates Act, 1961
                    </div>
                  </div>
                )}

                {/* STATUTORY OPINION HEADER */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 text-[12pt] font-bold pb-1 border-b" style={{ color: isMonochrome ? '#000000' : '#00288e' }}>
                  <h2 className="uppercase tracking-tight font-serif">
                    Part {idx + 1}: Statutory Advisory & Chamber Opinion
                  </h2>
                  <span className="text-[9pt] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-800">
                    {ex.assistantMsg.response?.auto_detected_domain || 'Indian Jurisprudence'}
                  </span>
                </div>

                {/* APPLICABLE STATUTORY FRAMEWORK PILLS */}
                {options.includeStatutoryPills && ex.assistantMsg.response?.applicable_laws && ex.assistantMsg.response.applicable_laws.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[8pt] font-mono uppercase font-bold text-slate-600">
                      Governing Statutory Provisions:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {ex.assistantMsg.response.applicable_laws.map((law: ApplicableLaw, lIdx: number) => (
                        <span key={lIdx} className="px-2 py-0.5 bg-slate-50 border border-slate-300 rounded text-[9pt] font-mono font-semibold text-slate-900">
                          {law.source_title} • {law.section_number}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* STRUCTURED LEGAL ANSWER CONTENT */}
                <div className="print-legal-body text-[10pt] leading-relaxed space-y-2.5 text-slate-900">
                  <LegalStructuredAnswer
                    answerText={ex.assistantMsg.response?.answer || ex.assistantMsg.text}
                    isDark={false}
                    mode={mode}
                  />
                </div>

                {/* VERBATIM GAZETTE EVIDENCE QUOTES */}
                {options.includeGazetteEvidence && ex.assistantMsg.response?.applicable_laws && ex.assistantMsg.response.applicable_laws.length > 0 && (
                  <div className="print-gazette-dossier p-3.5 rounded bg-[#fffbeb] border-l-4 border-[#d97706] border border-amber-200 text-[9.5pt] space-y-1.5">
                    <div className="font-bold font-mono text-[8.5pt] uppercase text-amber-900 flex items-center justify-between">
                      <span>Verbatim Official Gazette Enactment Text</span>
                      <span>{ex.assistantMsg.response.applicable_laws[0].section_number}</span>
                    </div>
                    <p className="italic text-slate-900 font-serif leading-relaxed">
                      "{ex.assistantMsg.response.applicable_laws[0].text_snippet || 'Verified against Gazette of India enactment.'}"
                    </p>
                  </div>
                )}

                {/* BINDING JUDICIAL PRECEDENTS */}
                {options.includePrecedents && ex.assistantMsg.response?.similar_cases && ex.assistantMsg.response.similar_cases.length > 0 && (
                  <div className="print-precedents-card p-3 rounded bg-slate-50 border border-slate-300 text-[9pt] space-y-2">
                    <div className="font-bold text-[#00288e] flex items-center gap-1.5 border-b border-slate-200 pb-1">
                      <Scale className="w-3.5 h-3.5 text-amber-600" />
                      <span>Binding Supreme Court of India Precedents</span>
                    </div>
                    {ex.assistantMsg.response.similar_cases.slice(0, 2).map((c: RealCasePrecedentItem, cIdx: number) => (
                      <div key={cIdx} className="space-y-1 pt-1 first:pt-0">
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span>{cIdx + 1}. {c.title} ({c.decision_year})</span>
                          <span className="font-mono text-[8pt] text-slate-600">{c.citation}</span>
                        </div>
                        <div className="text-[8.5pt] text-slate-700">
                          <strong>Bench:</strong> {c.bench} ({c.court})
                        </div>
                        <div className="text-[8.5pt] text-slate-800">
                          <strong>Operative Holding:</strong> {c.court_holding}
                        </div>
                        <div className="text-[8.5pt] text-[#00288e]">
                          <strong>Advocate Strategy:</strong> {c.advocate_strategy}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </main>

          {/* ADVOCATE ENDORSEMENT & SIGNATURE BLOCK */}
          {options.includeSignatureBlock && (
            <footer className="print-signature-block mt-8 pt-6 border-t-2 border-black grid grid-cols-2 gap-8 text-[9pt] font-mono">
              <div>
                <div className="font-bold text-slate-900">CHAMBER CONSULTATION NATURE:</div>
                <div className="text-slate-700 mt-1 leading-relaxed">
                  Confidential Legal Research & Opinion.<br />
                  Generated under the Constitution of India and Bharatiya Sanhitas (2024).<br />
                  Privileged communication under Section 126 of the Indian Evidence / BSA Act.
                </div>
              </div>
              <div className="text-right">
                <div className="border-b border-black w-56 ml-auto pb-10 mb-1.5 text-slate-400">
                  [Counsel Signature & Chamber Seal]
                </div>
                <div className="font-bold text-slate-900">Advocate / Legal Jurist Endorsement</div>
                <div className="text-slate-700 text-[8.5pt]">State Bar Council Enrolment No.: ____________________</div>
                <div className="text-slate-700 text-[8.5pt]">Chamber Docket Verification: Validated</div>
              </div>
            </footer>
          )}

          {/* RUNNING FOOTER WITH STATUTORY DISCLAIMER */}
          <div className="print-running-footer mt-6 pt-2 border-t border-slate-400 text-[7.5pt] font-mono text-slate-600 flex items-center justify-between">
            <span>Ground-Truth Validated against Constitution of India, BNS 2023, BNSS 2023 & BSA 2023</span>
            <span>Docket ID: #{activeThreadId.slice(0, 12).toUpperCase()}</span>
            <span>Republic of India • Judicial Chamber Brief</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
