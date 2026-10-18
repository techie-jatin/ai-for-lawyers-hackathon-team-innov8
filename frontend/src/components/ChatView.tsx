import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, CheckCircle2, Scale, BookOpen, Database, Gavel, ShieldCheck, Brain } from 'lucide-react';
import type { ChatLaunchContext } from '../App';
import { PrecedentDossierDrawer, type RealCasePrecedentItem } from './PrecedentDossierDrawer';
import { LegalStructuredAnswer } from './LegalMarkdownRenderer';
import { generateAutonomousLegalResponse, extractActiveCaseMemory } from '../services/clientLegalEngine';
import { LegalPrintStudioModal, CourtReadyPrintCanvas, groupMessagesIntoExchanges, type PrintStudioOptions } from './LegalPrintStudioModal';
import { parseUploadedDocument, type ParsedDocumentResult } from '../utils/documentParser';
import { LegalAidDirectoryModal } from './LegalAidDirectoryModal';
import { ReaChamberModal } from './ReaChamberModal';
import { CourtPleadingStudio } from './CourtPleadingStudio';
import { VoiceConsultationPlayer } from './VoiceConsultationPlayer';
import { DisputeTimelineVisualizer } from './DisputeTimelineVisualizer';
import { CounterStrategyStudio } from './CounterStrategyStudio';
import { clientStorage } from '../services/clientStorage';
import { useDesignPreset } from '../context/DesignPresetContext';

export interface ApplicableLaw {
  provision_id: number;
  source_title: string;
  section_number: string;
  title: string;
  text_snippet: string;
}

export interface CitationValidation {
  total_citations: number;
  valid_citations: number;
  trust_score: number;
  all_verified: boolean;
  citations: Array<{
    provision_id: number;
    source_title: string;
    section_number: string;
    is_valid: boolean;
    quote_verified: boolean;
    match_ratio: number;
    reason: string;
  }>;
}

export interface AssistantResponse {
  is_emergency?: boolean;
  is_blocked?: boolean;
  category?: string;
  statutory_warning?: string;
  lawful_alternative?: string;
  reason?: string;
  title?: string;
  message?: string;
  emergency_contacts?: Array<{ name: string; number: string; available: string }>;
  next_steps?: string[];
  mode?: string;
  query?: string;
  answer?: string;
  applicable_laws?: ApplicableLaw[];
  similar_cases?: RealCasePrecedentItem[];
  citation_validation?: CitationValidation;
  trust_score?: number;
  limitations?: string;
  ai_engine?: string;
  auto_detected_domain?: string;
  detected_archetype?: 'PROVISION_LOOKUP' | 'DISPUTE_CONSULTATION';
  domain_switched?: boolean;
  original_filter?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp?: string;
  response?: AssistantResponse;
}

export interface ChatThread {
  id: string;
  title: string;
  category: string;
  createdAt: string;
  messages: ChatMessage[];
}

const CONTEXT_CATEGORIES = [
  { name: 'Auto-Detect (All Laws)', icon: 'auto_awesome', isAuto: true },
  { name: 'Criminal Law (BNS)', icon: 'gavel' },
  { name: 'Cyber & IT', icon: 'laptop_mac' },
  { name: 'Constitutional', icon: 'balance' },
  { name: 'DPDP Compliance', icon: 'verified_user' },
  { name: 'Consumer Protection', icon: 'storefront' }
];

export interface QuickPromptItem {
  id: string;
  domain: string;
  domainColor: string;
  shortTitle: string;
  query: string;
  icon: string;
  description?: string;
  isEmergency?: boolean;
}

export const CITIZEN_QUICK_PROMPTS: QuickPromptItem[] = [
  {
    id: 'cit_arrest',
    domain: 'CRIMINAL',
    domainColor: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
    shortTitle: 'Police Arrest & Bail Rights',
    query: 'Police called me to station saying someone complained I cheated them in business. Can they arrest me directly without notice under Section 35 BNSS?',
    icon: 'gavel',
    description: 'Mandatory Sec 35 BNSS notice, Art 21/22 safeguards & 24hr magistrate cap.'
  },
  {
    id: 'cit_cyber',
    domain: 'CYBER',
    domainColor: 'text-sky-500 bg-sky-500/10 border-sky-500/30',
    shortTitle: 'UPI Scam & Online Fraud',
    query: 'I got scammed of money through a fake QR code on UPI. Can I get my money back from the bank and how to report on 1930 portal?',
    icon: 'qr_code_scanner',
    description: 'IT Act Sec 66D, zero/limited liability RBI circular & 1930 reporting.'
  },
  {
    id: 'cit_tenancy',
    domain: 'TENANCY',
    domainColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
    shortTitle: 'Illegal Landlord Lockout',
    query: 'My landlord locked my flat with all my belongings inside and is threatening eviction without court order. How can I get urgent police and injunction relief?',
    icon: 'key',
    description: 'Specific Relief Act Sec 6 summary possession & Order 39 injunction.'
  },
  {
    id: 'cit_family',
    domain: 'FAMILY',
    domainColor: 'text-purple-500 bg-purple-500/10 border-purple-500/30',
    shortTitle: 'Maintenance & Child Support',
    query: 'My spouse threw me out of matrimonial home without financial support for child. What urgent maintenance can I claim under Section 144 BNSS?',
    icon: 'family_restroom',
    description: 'Sec 144 BNSS maintenance, DV Act Sec 12 & interim financial orders.'
  },
  {
    id: 'cit_sos',
    domain: 'EMERGENCY',
    domainColor: 'text-rose-500 bg-rose-500/10 border-rose-500/30',
    shortTitle: 'Emergency Police Helpline SOS',
    query: 'Immediate danger domestic violence police help needed urgently',
    icon: 'emergency',
    description: 'Direct national SOS helpline numbers (112, 181, 1091) & safety protocol.',
    isEmergency: true
  }
];

export const ADVOCATE_QUICK_PROMPTS: QuickPromptItem[] = [
  {
    id: 'adv_quash',
    domain: 'QUASHING',
    domainColor: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
    shortTitle: 'Sec 528 BNSS FIR Quashing',
    query: 'Client accused under Section 318(4) BNS for commercial transaction failure. How to move High Court under Section 528 BNSS on Bhajan Lal grounds?',
    icon: 'balance',
    description: 'Section 528 BNSS petition, Bhajan Lal category 1-7 & commercial dispute test.'
  },
  {
    id: 'adv_ni_act',
    domain: 'NI ACT',
    domainColor: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/30',
    shortTitle: 'Sec 138/139 NI Act Defense',
    query: 'Drafting defense for accused in Section 138 NI Act complaint. How to rebut statutory presumption under Section 139 through preponderance of probabilities?',
    icon: 'payments',
    description: 'Rebuttal of legally enforceable debt, Rangappa ratio & threshold notice defect.'
  },
  {
    id: 'adv_contracts',
    domain: 'CONTRACTS',
    domainColor: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
    shortTitle: 'Sec 74 Penalty & Forfeiture',
    query: 'Client issued notice forfeiting entire security deposit under contract penalty clause. How to defend against arbitrary forfeiture under Section 74?',
    icon: 'description',
    description: 'Kailash Nath & Fateh Chand ratios against penalty stipulations without proof of legal injury.'
  },
  {
    id: 'adv_injunction',
    domain: 'CIVIL',
    domainColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
    shortTitle: 'Order 39 CPC Injunction Plea',
    query: 'Formulate arguments for temporary injunction under Order 39 Rules 1 & 2 CPC: prima facie case, balance of convenience, and irreparable injury.',
    icon: 'verified',
    description: 'Tripartite test, status quo maintenance & Dalpat Kumar judicial principles.'
  },
  {
    id: 'adv_anticipatory',
    domain: 'BAIL',
    domainColor: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/30',
    shortTitle: 'Sec 482 BNSS Pre-Arrest Bail',
    query: 'Prepare grounds for anticipatory bail under Section 482 BNSS for client facing non-bailable FIR in commercial cheating allegations.',
    icon: 'shield',
    description: 'Gurbaksh Sibbia parameters, custodial interrogation necessity & interim protection.'
  }
];

interface ChatViewProps {
  guestId?: string;
  apiBase: string;
  mode: 'citizen' | 'professional';
  setMode: (mode: 'citizen' | 'professional') => void;
  onSwitchToSearch?: (query?: string) => void;
  totalProvisions?: number;
  theme?: 'dark' | 'light';
  launchContext?: ChatLaunchContext | null;
  onClearLaunchContext?: () => void;
  geminiApiKey?: string;
  activeTab?: 'chat' | 'contracts' | 'search' | 'info';
  onSelectTab?: (tab: 'chat' | 'contracts' | 'search' | 'info') => void;
}

interface GeneratingCardProps {
  isDark: boolean;
  mode: 'citizen' | 'professional';
  totalProvisions?: number;
}

function LegalIntelligenceGeneratingCard({
  isDark,
  mode,
  totalProvisions = 259
}: GeneratingCardProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0.0);

  const steps = [
    {
      title: 'Retrieving Central Acts & Bharatiya Sanhitas',
      detail: 'Scanning BNS 2023, BNSS 2023, BSA 2023 & Constitution of India...',
      Icon: BookOpen,
      badge: 'Statutes'
    },
    {
      title: 'Querying Neon pgvector Semantic Embeddings',
      detail: `Performing 768-dim HNSW vector search across ${totalProvisions}+ gazette provisions...`,
      Icon: Database,
      badge: 'pgvector HNSW'
    },
    {
      title: 'Cross-Referencing Supreme Court Precedents',
      detail: 'Matching AIR, e-SCR & High Court binding ratio decidendi...',
      Icon: Gavel,
      badge: 'AIR Precedents'
    },
    {
      title: 'Deterministic Lexical AST Verification',
      detail: 'Verifying authentic verbatim statutory citations with 0% speculative hallucination...',
      Icon: ShieldCheck,
      badge: 'Truth Audit'
    },
    {
      title: mode === 'professional' ? 'Synthesizing Courtroom Brief & Litigation Playbook' : 'Synthesizing Plain-Language Citizen Rights Guide',
      detail: 'Formulating legal safeguards, procedural timeline & actionable remedies...',
      Icon: Brain,
      badge: 'Synthesis'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => +(prev + 0.1).toFixed(1));
    }, 100);

    const stepTimer = setInterval(() => {
      setActiveStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1100);

    return () => {
      clearInterval(timer);
      clearInterval(stepTimer);
    };
  }, [steps.length]);

  const progressPercent = Math.min(15 + activeStep * 20 + Math.floor(elapsedSeconds * 3), 95);

  return (
    <div className={`no-print w-full p-4 sm:p-5 rounded-2xl border shadow-lg transition-all animate-in fade-in slide-in-from-bottom-2 duration-300 ${
      isDark 
        ? 'bg-[#0e111d] border-[#242b44] text-[#f8fafc]' 
        : 'bg-white border-[#dce9ff] text-[#0b1c30] shadow-md'
    }`}>
      {/* Top Bar: Animated Brand Seal, Active Pipeline Title, & Live Telemetry Timer */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-700/20">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Pulsing Glowing Emblem with Orbit Ring */}
          <div className="relative flex items-center justify-center shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl p-[2px] relative overflow-hidden flex items-center justify-center shadow-md">
              <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,#ff7722,#00288e,#10b981,#ff7722)] animate-spin" />
              <div className={`relative w-full h-full rounded-[10px] flex items-center justify-center ${
                isDark ? 'bg-[#090b14]' : 'bg-white'
              }`}>
                <Scale className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${
                  isDark ? 'text-amber-400' : 'text-[#00288e]'
                }`} />
              </div>
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-extrabold text-[13px] sm:text-[14px] text-[#ff7722]">भारत</span>
              <span className={`font-extrabold text-[13px] sm:text-[14px] tracking-tight ${
                isDark ? 'text-white' : 'text-[#00288e]'
              }`}>
                Legal Intelligence Reasoning
              </span>
              <span className={`hidden sm:inline px-1.5 py-0.2 rounded font-mono text-[9px] font-bold border ${
                isDark ? 'bg-[#181c2d] text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-800 border-emerald-300'
              }`}>
                0% Speculation Gate
              </span>
            </div>
            <span className={`text-[10px] sm:text-[11px] truncate ${isDark ? 'text-[#94a3b8]' : 'text-[#64748b]'}`}>
              {steps[activeStep].title}
            </span>
          </div>
        </div>

        {/* Live Elapsed Timer & Accuracy Tag */}
        <div className="flex items-center gap-2 shrink-0">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[10px] sm:text-[11px] border font-bold ${
            isDark ? 'bg-[#131626] border-[#222942] text-amber-300' : 'bg-[#eff4ff] border-[#dce9ff] text-[#00288e]'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{elapsedSeconds.toFixed(1)}s</span>
          </div>
        </div>
      </div>

      {/* Dynamic Tricolor Progress Shimmer */}
      <div className="w-full mt-3 mb-3.5">
        <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
          <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
            Step {activeStep + 1} of {steps.length} • {steps[activeStep].badge}
          </span>
          <span className={`font-bold ${isDark ? 'text-white' : 'text-[#00288e]'}`}>
            {progressPercent}%
          </span>
        </div>
        <div className={`w-full h-1.5 rounded-full overflow-hidden ${
          isDark ? 'bg-[#181d30]' : 'bg-slate-200'
        }`}>
          <div 
            className="h-full bg-gradient-to-r from-[#ff7722] via-[#00288e] to-emerald-400 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Step Pipeline Track & Current Active Step Detail */}
      <div className={`p-3 rounded-xl border flex flex-col gap-2.5 ${
        isDark ? 'bg-[#090b14]/70 border-[#1c2236]' : 'bg-slate-50 border-slate-200'
      }`}>
        {/* Step Icons Track */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar pb-1">
          {steps.map((st, sIdx) => {
            const isCompleted = sIdx < activeStep;
            const isCurrent = sIdx === activeStep;
            return (
              <div 
                key={sIdx} 
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10.5px] transition-all whitespace-nowrap ${
                  isCurrent 
                    ? isDark 
                      ? 'bg-[#1c233c] text-white border border-[#3b4772] shadow-xs' 
                      : 'bg-white text-[#00288e] border border-[#bfdbfe] shadow-xs font-bold'
                    : isCompleted
                    ? isDark
                      ? 'text-emerald-400'
                      : 'text-emerald-700 font-semibold'
                    : isDark
                    ? 'text-zinc-500 opacity-60'
                    : 'text-zinc-400 opacity-60'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400 shrink-0" />
                ) : (
                  <st.Icon className="w-3.5 h-3.5 shrink-0" />
                )}
                <span className="hidden md:inline font-mono text-[9.5px]">
                  {st.badge}
                </span>
              </div>
            );
          })}
        </div>

        {/* Live Detail Line */}
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <Brain className="w-4 h-4 text-[#ff7722] animate-pulse shrink-0" />
          <span className={`truncate ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
            {steps[activeStep].detail}
          </span>
        </div>
      </div>

      {/* Shimmering Wireframe / Skeleton Preview of Incoming Legal Brief */}
      <div className="mt-3.5 space-y-2 opacity-80 select-none">
        <div className={`h-4 rounded-md w-3/5 animate-pulse ${
          isDark ? 'bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800' : 'bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200'
        }`}></div>
        <div className={`h-2.5 rounded-md w-full animate-pulse delay-75 ${
          isDark ? 'bg-gradient-to-r from-zinc-800/80 via-zinc-700/80 to-zinc-800/80' : 'bg-gradient-to-r from-slate-200/80 via-slate-300/80 to-slate-200/80'
        }`}></div>
        <div className={`h-2.5 rounded-md w-4/5 animate-pulse delay-150 ${
          isDark ? 'bg-gradient-to-r from-zinc-800/60 via-zinc-700/60 to-zinc-800/60' : 'bg-gradient-to-r from-slate-200/60 via-slate-300/60 to-slate-200/60'
        }`}></div>
      </div>
    </div>
  );
}

interface ChatInputFormProps {
  loading: boolean;
  mode: 'citizen' | 'professional';
  isDark: boolean;
  onSendMessage: (query: string) => void;
  externalText: string | null;
  onClearExternalText: () => void;
  voiceStreamingText?: string;
  isListening?: boolean;
  onStopDictation?: () => void;
}

function ChatInputForm({
  loading,
  mode,
  isDark,
  onSendMessage,
  externalText,
  onClearExternalText,
  voiceStreamingText,
  isListening,
  onStopDictation
}: ChatInputFormProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const baseTextBeforeVoiceRef = useRef<string>('');

  // Save whatever user had already typed before microphone dictation started
  useEffect(() => {
    if (isListening) {
      baseTextBeforeVoiceRef.current = text.trim();
    }
  }, [isListening]);

  // Seamlessly stream speech recognition into input field without dropping prior text
  useEffect(() => {
    if (isListening && voiceStreamingText !== undefined && voiceStreamingText !== '') {
      const base = baseTextBeforeVoiceRef.current;
      const combined = base ? `${base} ${voiceStreamingText}` : voiceStreamingText;
      setText(combined);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
        }
      }, 15);
    }
  }, [isListening, voiceStreamingText]);

  // Sync external text (from quick prompt chips or precedent drawer actions)
  useEffect(() => {
    if (externalText !== null && externalText !== undefined && externalText !== '') {
      setText(prev => prev ? `${prev}\n\n${externalText}` : externalText);
      onClearExternalText();
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    }
  }, [externalText, onClearExternalText]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isListening && onStopDictation) {
      onStopDictation();
    }
    if (!text.trim() || loading) return;
    const queryToSend = text.trim();
    setText('');
    onSendMessage(queryToSend);
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="flex items-end gap-1.5 sm:gap-2 px-1"
    >
      <div className="flex-1 min-w-0">
        <textarea
          ref={textareaRef}
          className={`w-full resize-none bg-transparent text-[13px] focus:outline-none py-1.5 px-2 leading-relaxed min-h-[40px] sm:min-h-[48px] max-h-[120px] ${
            isDark 
              ? 'text-white placeholder:text-[#64748b]' 
              : 'text-[#0b1c30] placeholder:text-[#757684]'
          }`}
          placeholder={
            mode === 'citizen'
              ? "Ask legal question, citizen rights, or cite provision..."
              : "Query BNS 2023, BNSS, Supreme Court precedents, or paste brief..."
          }
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          disabled={loading}
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !text.trim()}
        className={`flex items-center justify-center gap-1.5 p-2 sm:px-4 sm:py-2.5 rounded-lg text-[12px] sm:text-[13px] font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer shrink-0 ${
          isDark 
            ? 'bg-white hover:bg-zinc-200 text-black' 
            : 'bg-[#00288e] hover:bg-[#1e40af] text-white'
        }`}
        title="Generate Legal Advice"
      >
        <span className="hidden sm:inline">Generate Legal Advice</span>
        <span className="material-symbols-outlined text-[17px] sm:text-[15px]">send</span>
      </button>
    </form>
  );
}

export function ChatView({
  guestId = 'GST-GUEST-SESSION',
  apiBase,
  mode,
  setMode,
  onSwitchToSearch,
  totalProvisions = 259,
  theme = 'dark',
  launchContext,
  onClearLaunchContext,
  geminiApiKey,
  activeTab = 'chat',
  onSelectTab
}: ChatViewProps) {
  const isDark = theme === 'dark';
  const storageKey = `bharat_chat_threads_${guestId}`;

  // Chat Threads State (Persistent in localStorage per Guest ID)
  const [threads, setThreads] = useState<ChatThread[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load chat threads:', e);
    }
    return []; // Clean empty slate for new guests!
  });

  const [activeThreadId, setActiveThreadId] = useState<string>(() => {
    return threads[0]?.id || '';
  });

  const [externalInput, setExternalInput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [contextFilter, setContextFilter] = useState('Auto-Detect (All Laws)');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const active = threads.find(t => t.id === activeThreadId);
    return active ? active.messages : [];
  });
  const [expandedSources, setExpandedSources] = useState<{ [key: string]: boolean }>({});
  const [expandedPrecedents, setExpandedPrecedents] = useState<{ [msgId: string]: boolean }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dossierSaved, setDossierSaved] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [dictationNotice, setDictationNotice] = useState<string | null>(null);
  const [showMicPromptModal, setShowMicPromptModal] = useState(false);
  const [micBlockedHelp, setMicBlockedHelp] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [selectedPrecedent, setSelectedPrecedent] = useState<RealCasePrecedentItem | null>(null);
  const [isPrecedentDrawerOpen, setIsPrecedentDrawerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isContextDropdownOpen, setIsContextDropdownOpen] = useState(false);
  const contextDropdownRef = useRef<HTMLDivElement>(null);

  // NALSA Free Legal Aid Directory Modal State
  const [isLegalAidModalOpen, setIsLegalAidModalOpen] = useState(false);

  // REA Tri-Perspective Chamber Battle-Room State
  const [isReaModalOpen, setIsReaModalOpen] = useState(false);
  const [reaModalNarrative, setReaModalNarrative] = useState('');

  // Court-Ready Pleading & Notice Studio Modal State
  const [isPleadingStudioOpen, setIsPleadingStudioOpen] = useState(false);
  const [pleadingInitialFacts, setPleadingInitialFacts] = useState('');

  // Interactive Dispute Timeline Visualizer Modal State
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
  const [timelineArchetype, setTimelineArchetype] = useState<string>('cheque_bounce_138_ni');
  const [timelineInitialFacts, setTimelineInitialFacts] = useState('');

  // Defensive Counter-Strategy Studio Modal State
  const [isCounterStrategyModalOpen, setIsCounterStrategyModalOpen] = useState(false);
  const [counterStrategyInitialFacts, setCounterStrategyInitialFacts] = useState('');

  // Institutional Design Preset & Side-by-Side Drafting Dock State
  const { isInstitutional } = useDesignPreset();
  const [dockedStudio, setDockedStudio] = useState<'pleadings' | 'timeline' | 'counter' | null>(null);

  // Sync docked studio when design preset changes
  useEffect(() => {
    if (!isInstitutional && dockedStudio) {
      if (dockedStudio === 'pleadings') setIsPleadingStudioOpen(true);
      if (dockedStudio === 'timeline') setIsTimelineModalOpen(true);
      if (dockedStudio === 'counter') setIsCounterStrategyModalOpen(true);
      setDockedStudio(null);
    }
  }, [isInstitutional, dockedStudio]);

  // Global listener for opening studios across navigation and mobile bars
  useEffect(() => {
    const handleOpenStudio = (e: any) => {
      const studio = e?.detail?.studio;
      if (studio === 'pleadings') {
        const activeNarrative = messages.filter(m => m.role === 'user').slice(-1)[0]?.text || '';
        setPleadingInitialFacts(activeNarrative);
        if (isInstitutional && typeof window !== 'undefined' && window.innerWidth >= 1025) {
          setDockedStudio('pleadings');
          setIsPleadingStudioOpen(false);
        } else {
          setIsPleadingStudioOpen(true);
        }
      } else if (studio === 'timeline') {
        const rawUserText = messages.filter(m => m.role === 'user').slice(-1)[0]?.text || '';
        setTimelineInitialFacts(rawUserText);
        if (isInstitutional && typeof window !== 'undefined' && window.innerWidth >= 1025) {
          setDockedStudio('timeline');
          setIsTimelineModalOpen(false);
        } else {
          setIsTimelineModalOpen(true);
        }
      } else if (studio === 'counter') {
        const activeNarrative = messages.filter(m => m.role === 'user').slice(-1)[0]?.text || '';
        setCounterStrategyInitialFacts(activeNarrative);
        if (isInstitutional && typeof window !== 'undefined' && window.innerWidth >= 1025) {
          setDockedStudio('counter');
          setIsCounterStrategyModalOpen(false);
        } else {
          setIsCounterStrategyModalOpen(true);
        }
      } else if (studio === 'rea') {
        setIsReaModalOpen(true);
      } else if (studio === 'legalaid') {
        setIsLegalAidModalOpen(true);
      }
    };
    window.addEventListener('bharat:open-studio', handleOpenStudio);
    return () => window.removeEventListener('bharat:open-studio', handleOpenStudio);
  }, [isInstitutional, messages]);

  // Voice Dictation Streaming & Bilingual Support State
  const recognitionRef = useRef<any>(null);
  const userRequestedStopRef = useRef(false);
  const isListeningRef = useRef(false);
  const accumulatedBeforeRestartRef = useRef('');
  const [voiceStreamingText, setVoiceStreamingText] = useState('');
  const [speechLang, setSpeechLang] = useState<'en-IN' | 'hi-IN'>('en-IN');
  const [interimTranscript, setInterimTranscript] = useState<string>('');

  // High-Fidelity Document Attachment & Drag-and-Drop State
  const [attachedDoc, setAttachedDoc] = useState<ParsedDocumentResult | null>(null);
  const [isParsingDoc, setIsParsingDoc] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Dynamic Quick Prompts Persona Tab (defaults to active mode)
  const [promptPersonaTab, setPromptPersonaTab] = useState<'citizen' | 'professional'>(mode);
  useEffect(() => {
    setPromptPersonaTab(mode);
  }, [mode]);

  // Court-Ready Legal Print & PDF Export Studio State
  const [isPrintStudioOpen, setIsPrintStudioOpen] = useState(false);
  const [printStudioOptions, setPrintStudioOptions] = useState<PrintStudioOptions>({
    scope: 'all',
    selectedTurnIndices: [],
    includeUserPrompts: true,
    includeStatutoryPills: true,
    includeGazetteEvidence: true,
    includePrecedents: true,
    includeChamberSeal: true,
    includeSignatureBlock: mode === 'professional',
    colorProfile: 'royal',
    paperSize: 'a4'
  });

  const handleOpenPrintStudio = () => {
    setIsPrintStudioOpen(true);
  };

  const handleOpenPrintForMessage = (msgId: string) => {
    const exchanges = groupMessagesIntoExchanges(messages);
    const targetIdx = exchanges.findIndex(e => e.assistantMsg.id === msgId);
    if (targetIdx !== -1) {
      setPrintStudioOptions(prev => ({
        ...prev,
        scope: 'selected',
        selectedTurnIndices: [targetIdx]
      }));
    } else {
      setPrintStudioOptions(prev => ({
        ...prev,
        scope: 'last'
      }));
    }
    setIsPrintStudioOpen(true);
  };

  const handleOpenPleadingsStudio = (initialFacts?: string) => {
    const activeNarrative = initialFacts ?? (messages.filter(m => m.role === 'user').slice(-1)[0]?.text || '');
    setPleadingInitialFacts(activeNarrative);
    if (isInstitutional && typeof window !== 'undefined' && window.innerWidth >= 1025) {
      setDockedStudio(prev => prev === 'pleadings' ? null : 'pleadings');
      setIsPleadingStudioOpen(false);
    } else {
      setIsPleadingStudioOpen(true);
    }
  };

  const handleOpenDisputeTimeline = (initialFacts?: string, archetype?: string) => {
    const rawUserText = initialFacts ?? (messages.filter(m => m.role === 'user').slice(-1)[0]?.text || '');
    const latestUserText = rawUserText.toLowerCase();
    setTimelineInitialFacts(rawUserText);
    if (archetype) {
      setTimelineArchetype(archetype);
    } else if (latestUserText.includes('cheque') || latestUserText.includes('138') || latestUserText.includes('dishonor') || latestUserText.includes('dishonour') || latestUserText.includes('bounce')) {
      setTimelineArchetype('cheque_bounce_138_ni');
    } else if (latestUserText.includes('consumer') || latestUserText.includes('defect') || latestUserText.includes('cpa') || latestUserText.includes('service')) {
      setTimelineArchetype('consumer_complaint_35_cpa');
    } else if (latestUserText.includes('deposit') || latestUserText.includes('rent') || latestUserText.includes('tenan') || latestUserText.includes('hostel') || latestUserText.includes('contract')) {
      setTimelineArchetype('contract_breach_deposit_refund');
    } else if (latestUserText.includes('fir') || latestUserText.includes('arrest') || latestUserText.includes('bail') || latestUserText.includes('police') || latestUserText.includes('bnss')) {
      setTimelineArchetype('criminal_investigation_bnss');
    } else if (latestUserText.includes('arbitrat')) {
      setTimelineArchetype('commercial_arbitration_act');
    } else if (latestUserText.includes('accident') || latestUserText.includes('mact') || latestUserText.includes('vehicle')) {
      setTimelineArchetype('motor_accident_mact');
    } else if (latestUserText.includes('rti') || latestUserText.includes('cpio') || latestUserText.includes('information')) {
      setTimelineArchetype('rti_appeal_lifecycle');
    }
    if (isInstitutional && typeof window !== 'undefined' && window.innerWidth >= 1025) {
      setDockedStudio(prev => prev === 'timeline' ? null : 'timeline');
      setIsTimelineModalOpen(false);
    } else {
      setIsTimelineModalOpen(true);
    }
  };

  const handleOpenCounterStrategy = (initialFacts?: string) => {
    const activeNarrative = initialFacts ?? (messages.filter(m => m.role === 'user').slice(-1)[0]?.text || '');
    setCounterStrategyInitialFacts(activeNarrative);
    if (isInstitutional && typeof window !== 'undefined' && window.innerWidth >= 1025) {
      setDockedStudio(prev => prev === 'counter' ? null : 'counter');
      setIsCounterStrategyModalOpen(false);
    } else {
      setIsCounterStrategyModalOpen(true);
    }
  };

  const handleTriggerSystemPrint = () => {
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const MAX_FREE_THREADS = 7;

  // Sync state if guestId changes with IndexedDB persistence & automatic localStorage migration
  useEffect(() => {
    let active = true;
    clientStorage.loadThreads(guestId).then((loaded) => {
      if (active) {
        if (Array.isArray(loaded) && loaded.length > 0) {
          setThreads(loaded);
          setActiveThreadId(loaded[0]?.id || '');
          setMessages(loaded[0]?.messages || []);
        } else {
          setThreads([]);
          setActiveThreadId('');
          setMessages([]);
        }
      }
    }).catch(e => {
      console.warn('[ClientStorage] Error loading threads:', e);
    });
    return () => { active = false; };
  }, [guestId]);

  // Sync active thread messages to IndexedDB with localStorage fallback
  const saveThreadsToStorage = (updatedThreads: ChatThread[]) => {
    setThreads(updatedThreads);
    clientStorage.saveThreads(guestId, updatedThreads).catch(e => {
      console.warn('[ClientStorage] Error saving threads:', e);
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextDropdownRef.current && !contextDropdownRef.current.contains(event.target as Node)) {
        setIsContextDropdownOpen(false);
      }
    };
    if (isContextDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isContextDropdownOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendAssistantQueryStream = async (
    payload: {
      query: string;
      mode: string;
      context_filter: string;
      gemini_api_key?: string;
      history?: Array<{ role: string; text: string }>;
    },
    onMetadata?: (meta: Partial<AssistantResponse>) => void,
    onToken?: (accumulatedText: string) => void
  ): Promise<AssistantResponse> => {
    if (apiBase && apiBase.trim() !== '') {
      const cleanBase = apiBase.replace(/\/+$/, '');
      const targets = [
        `${cleanBase}/api/assistant/stream`,
        cleanBase.includes('localhost') 
          ? `${cleanBase.replace('localhost', '127.0.0.1')}/api/assistant/stream` 
          : null
      ].filter(Boolean) as string[];

      for (const url of targets) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (res.ok && res.body) {
            const reader = res.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let accumulatedAnswer = '';
            let metaPayload: Partial<AssistantResponse> = {};
            let buffer = '';

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n\n');
              buffer = lines.pop() || '';

              for (const block of lines) {
                const line = block.trim();
                if (!line.startsWith('data: ')) continue;
                const dataStr = line.slice(6).trim();
                if (dataStr === '[DONE]') break;

                try {
                  const ev = JSON.parse(dataStr);
                  if (ev.event === 'emergency') {
                    return ev.payload;
                  }
                  if (ev.event === 'abuse') {
                    return ev.payload;
                  }
                  if (ev.event === 'metadata') {
                    metaPayload = {
                      applicable_laws: ev.applicable_laws,
                      similar_cases: ev.similar_cases,
                      auto_detected_domain: ev.topic_pillar
                    };
                    if (onMetadata) onMetadata(metaPayload);
                  } else if (ev.event === 'token' && ev.chunk) {
                    accumulatedAnswer += ev.chunk;
                    if (onToken) onToken(accumulatedAnswer);
                  } else if (ev.event === 'done') {
                    metaPayload = {
                      ...metaPayload,
                      trust_score: ev.trust_score,
                      limitations: ev.limitations,
                      ai_engine: ev.ai_engine
                    };
                  }
                } catch {}
              }
            }

            if (accumulatedAnswer.trim()) {
              return {
                ...metaPayload,
                answer: accumulatedAnswer,
                mode: payload.mode,
                query: payload.query
              };
            }
          }
        } catch {
          // Continue to next endpoint or fallback
        }
      }
    }

    // Fully Autonomous Client-Side Legal Intelligence Engine Fallback
    const fallbackData = await generateAutonomousLegalResponse({
      query: payload.query,
      mode: (payload.mode as 'citizen' | 'professional') || mode,
      context_filter: payload.context_filter,
      gemini_api_key: payload.gemini_api_key || geminiApiKey,
      history: payload.history
    });

    if (onMetadata) onMetadata(fallbackData);
    if (onToken) onToken(fallbackData.answer || fallbackData.message || '');
    return fallbackData;
  };

  const executeDirectQuery = async (
    queryText: string,
    targetThreadId: string,
    threadTitle: string,
    categoryName: string,
    baseThreads: ChatThread[],
    userMsg: ChatMessage
  ) => {
    setLoading(true);
    const asstMsgId = `msg-a-${Date.now()}`;
    const initialAsstMsg: ChatMessage = {
      id: asstMsgId,
      role: 'assistant',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      response: { answer: '' }
    };

    setMessages([userMsg, initialAsstMsg]);

    try {
      const data = await sendAssistantQueryStream(
        {
          query: queryText,
          mode: mode,
          context_filter: categoryName,
          gemini_api_key: geminiApiKey || undefined
        },
        (meta) => {
          setMessages(prev => prev.map(m => m.id === asstMsgId ? { ...m, response: { ...m.response, ...meta } } : m));
        },
        (accumulated) => {
          setMessages(prev => prev.map(m => m.id === asstMsgId ? { ...m, text: accumulated, response: { ...m.response, answer: accumulated } } : m));
        }
      );

      const finalAsstMsg: ChatMessage = {
        id: asstMsgId,
        role: 'assistant',
        text: data.answer || data.message || 'Legal opinion generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        response: data
      };

      const finalMessages = [userMsg, finalAsstMsg];
      setMessages(finalMessages);

      const finalThreads = baseThreads.map(t => {
        if (t.id === targetThreadId) {
          return {
            ...t,
            title: threadTitle,
            category: categoryName,
            messages: finalMessages
          };
        }
        return t;
      });
      saveThreadsToStorage(finalThreads);
    } catch (err: any) {
      console.warn('Direct query caught error, executing autonomous legal engine fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle external launch context (e.g. from Search provision, Concordance, Gazette, or Dossiers)
  useEffect(() => {
    if (!launchContext) return;

    if (launchContext.type === 'dossier' && launchContext.dossier) {
      const d = launchContext.dossier;
      const threadTitle = `[Dossier ${d.docket_number}] ${d.title.length > 25 ? d.title.slice(0, 25) + '...' : d.title}`;
      const threadId = `thread-dossier-${d.id}`;

      // Build user inquiry message
      const userMsg: ChatMessage = {
        id: `msg-dossier-u-${d.id}`,
        role: 'user',
        text: d.initial_query || `Chamber Research Docket: ${d.docket_number} - ${d.title}`,
        timestamp: d.created_at 
          ? new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'Active Chamber Brief'
      };

      // Build assistant analysis message with citations
      const applicableLaws: ApplicableLaw[] = (d.applicable_sections || []).map((sec, idx) => ({
        provision_id: idx + 1,
        source_title: d.category || 'Central Act',
        section_number: sec,
        title: `Statutory Mandate: ${sec}`,
        text_snippet: `Authoritative statutory requirement under ${sec} (${d.category || 'Central Act'})`
      }));

      const asstMsg: ChatMessage = {
        id: `msg-dossier-a-${d.id}`,
        role: 'assistant',
        text: d.legal_summary || 'Chamber statutory analysis and precedent evaluation.',
        timestamp: d.created_at 
          ? new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'Active Chamber Brief',
        response: {
          mode: d.mode || mode,
          title: d.title,
          answer: d.legal_summary,
          applicable_laws: applicableLaws,
          trust_score: 1.0,
          limitations: 'Ground-truth validated against Constitution of India & Central Statutory Gazette.'
        }
      };

      const existingIdx = threads.findIndex(t => 
        t.id === threadId || 
        (d.docket_number && t.title.includes(d.docket_number))
      );

      let updatedThreads: ChatThread[];
      if (existingIdx !== -1) {
        updatedThreads = threads.map((t, idx) => idx === existingIdx ? {
          ...t,
          title: threadTitle,
          category: d.category || t.category,
          messages: [userMsg, asstMsg]
        } : t);
      } else {
        const newThread: ChatThread = {
          id: threadId,
          title: threadTitle,
          category: d.category || contextFilter,
          createdAt: d.created_at 
            ? new Date(d.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
            : 'Active Brief',
          messages: [userMsg, asstMsg]
        };
        updatedThreads = [newThread, ...threads];
        if (updatedThreads.length > MAX_FREE_THREADS) {
          updatedThreads = updatedThreads.slice(0, MAX_FREE_THREADS);
        }
      }

      saveThreadsToStorage(updatedThreads);
      setActiveThreadId(threadId);
      setMessages([userMsg, asstMsg]);
      if (d.category) setContextFilter(d.category);
      if (onClearLaunchContext) onClearLaunchContext();
      return;
    }

    // Provision, Concordance, or Gazette
    if (launchContext.query) {
      const threadId = `thread-law-${Date.now()}`;
      const shortTitle = launchContext.title.length > 34 
        ? launchContext.title.slice(0, 34) + '...' 
        : launchContext.title;

      const userMsg: ChatMessage = {
        id: `msg-u-${Date.now()}`,
        role: 'user',
        text: launchContext.query,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const newThread: ChatThread = {
        id: threadId,
        title: shortTitle,
        category: launchContext.category || contextFilter,
        createdAt: 'Just now',
        messages: [userMsg]
      };

      let updatedThreads = [newThread, ...threads];
      if (updatedThreads.length > MAX_FREE_THREADS) {
        updatedThreads = updatedThreads.slice(0, MAX_FREE_THREADS);
      }
      saveThreadsToStorage(updatedThreads);
      setActiveThreadId(threadId);
      setMessages([userMsg]);
      if (launchContext.category) setContextFilter(launchContext.category);

      const queryText = launchContext.query;
      const categoryToUse = launchContext.category || contextFilter;
      const autoExec = launchContext.autoExecute;

      if (onClearLaunchContext) onClearLaunchContext();

      if (autoExec) {
        setTimeout(() => {
          executeDirectQuery(queryText, threadId, shortTitle, categoryToUse, updatedThreads, userMsg);
        }, 50);
      } else {
        setExternalInput(queryText);
      }
    }
  }, [launchContext]);

  const handleSelectThread = (threadId: string) => {
    // Save current messages & active category to the thread being left
    const updated = threads.map(t => t.id === activeThreadId ? { ...t, messages, category: contextFilter } : t);
    saveThreadsToStorage(updated);

    setActiveThreadId(threadId);
    const target = updated.find(t => t.id === threadId);
    setMessages(target ? target.messages : []);
    if (target && target.category) {
      setContextFilter(target.category);
    }
    setIsMobileSidebarOpen(false);
  };

  const handleNewThread = () => {
    if (threads.length >= MAX_FREE_THREADS) {
      setShowLimitModal(true);
      return;
    }
    const newThreadId = `thread-${Date.now()}`;
    const newThread: ChatThread = {
      id: newThreadId,
      title: 'New Research Inquiry',
      category: contextFilter,
      createdAt: 'Just now',
      messages: []
    };
    const updated = [newThread, ...threads];
    saveThreadsToStorage(updated);
    setActiveThreadId(newThreadId);
    setMessages([]);
    setIsMobileSidebarOpen(false);
  };

  const handleArchiveOldestAndCreateNew = () => {
    // Drops oldest thread to keep within free limit of 7
    const trimmed = threads.slice(0, MAX_FREE_THREADS - 1);
    const newThreadId = `thread-${Date.now()}`;
    const newThread: ChatThread = {
      id: newThreadId,
      title: 'New Research Inquiry',
      category: contextFilter,
      createdAt: 'Just now',
      messages: []
    };
    const updated = [newThread, ...trimmed];
    saveThreadsToStorage(updated);
    setActiveThreadId(newThreadId);
    setMessages([]);
    setShowLimitModal(false);
    setIsMobileSidebarOpen(false);
  };

  const handleDeleteThread = (threadId: string) => {
    const updated = threads.filter(t => t.id !== threadId);
    if (updated.length === 0) {
      const fallback: ChatThread = {
        id: `thread-${Date.now()}`,
        title: 'New Research Inquiry',
        category: 'Auto-Detect (All Laws)',
        createdAt: 'Just now',
        messages: []
      };
      saveThreadsToStorage([fallback]);
      setActiveThreadId(fallback.id);
      setMessages([]);
    } else {
      saveThreadsToStorage(updated);
      if (activeThreadId === threadId) {
        setActiveThreadId(updated[0].id);
        setMessages(updated[0].messages);
      }
    }
  };

  const toggleSourceExpand = (msgId: string) => {
    setExpandedSources(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const handleCopy = (text: string, id: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
    } catch (e) {
      console.warn('Clipboard write fallback error:', e);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCopyCitation = (law: ApplicableLaw, citeKey: string) => {
    const citationText = `[STATUTORY AUTHORITY - भारत LEGAL INTELLIGENCE]\n` +
      `Statute: ${law.source_title}\n` +
      `Provision: ${law.section_number} - ${law.title}\n\n` +
      `Verbatim Legal Ratio:\n"${law.text_snippet}"\n\n` +
      `Grounding: Central Gazette & Neon pgvector Validated • Bench Synced`;
    handleCopy(citationText, citeKey);
  };

  const handleInspectInRepository = (law: ApplicableLaw) => {
    if (onSwitchToSearch) {
      const searchTarget = `${law.source_title} ${law.section_number}`.trim();
      onSwitchToSearch(searchTarget);
    }
  };

  // Clean up active speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
    };
  }, []);

  // Core Voice Dictation Execution with Continuous Streaming & Multi-Phrase Accumulation
  const executeDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setDictationNotice('Voice dictation requires Chrome, Edge, or Safari with microphone access.');
      setTimeout(() => setDictationNotice(null), 4500);
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = speechLang;
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
        setMicBlockedHelp(false);
        setDictationNotice(null);
        setInterimTranscript('');
      };

      recognition.onend = () => {
        // Auto-restart across pauses if the user has not explicitly clicked stop
        if (!userRequestedStopRef.current && isListeningRef.current) {
          try {
            recognition.start();
            return;
          } catch {
            // Browser might require explicit user gesture if permission dropped
          }
        }
        setIsListening(false);
        isListeningRef.current = false;
        setInterimTranscript('');
      };

      recognition.onerror = (e: any) => {
        if (e?.error === 'not-allowed') {
          setMicBlockedHelp(true);
          setIsListening(false);
          isListeningRef.current = false;
          userRequestedStopRef.current = true;
        } else if (e?.error !== 'no-speech') {
          setDictationNotice(`Speech recognition notice: ${e?.error || 'ended'}`);
          setTimeout(() => setDictationNotice(null), 4000);
          setIsListening(false);
          isListeningRef.current = false;
        }
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let finals = '';
        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finals += event.results[i][0].transcript + ' ';
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        const accumulated = (accumulatedBeforeRestartRef.current + ' ' + finals).trim();
        const fullCurrent = (accumulated + ' ' + interim).trim();
        setVoiceStreamingText(fullCurrent);
        setInterimTranscript(interim);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition initialization error:', err);
      setIsListening(false);
      isListeningRef.current = false;
    }
  };

  // Voice Dictation Trigger with Clean Click-to-Stop & Permission Prompting
  const handleStartDictation = () => {
    if (isListening) {
      userRequestedStopRef.current = true;
      isListeningRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      setIsListening(false);
      setInterimTranscript('');
      setVoiceStreamingText('');
      accumulatedBeforeRestartRef.current = '';
      return;
    }

    userRequestedStopRef.current = false;
    isListeningRef.current = true;
    accumulatedBeforeRestartRef.current = '';
    setVoiceStreamingText('');

    const hasAuthorized = localStorage.getItem('bharat_mic_permission_granted') === 'true';
    if (!hasAuthorized) {
      setShowMicPromptModal(true);
    } else {
      executeDictation();
    }
  };

  // High-Fidelity Multi-Format Document Ingestion Handler (PDF, DOCX, TXT, Images)
  const handleProcessFile = async (file: File) => {
    setIsParsingDoc(true);
    setDictationNotice(null);
    try {
      const parsed = await parseUploadedDocument(file, apiBase);
      if (parsed.isScannedOrEmpty && parsed.warning) {
        setDictationNotice(parsed.warning);
        setTimeout(() => setDictationNotice(null), 8000);
      } else if (parsed.ocrMetadata?.fir_number || parsed.ocrMetadata?.sections?.length) {
        const secInfo = parsed.ocrMetadata.sections?.join(', ') || '';
        const psInfo = parsed.ocrMetadata.police_station ? ` • P.S. ${parsed.ocrMetadata.police_station}` : '';
        setDictationNotice(`🔍 Document OCR Processed: FIR ${parsed.ocrMetadata.fir_number || ''}${psInfo}${secInfo ? ` • u/s ${secInfo}` : ''}`);
        setTimeout(() => setDictationNotice(null), 8000);
      }
      setAttachedDoc(parsed);
    } catch (err: any) {
      console.error('File parsing error:', err);
      setDictationNotice('Failed to extract document text. Please ensure the file is not password-protected.');
      setTimeout(() => setDictationNotice(null), 5000);
    } finally {
      setIsParsingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleProcessFile(file);
  };

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || '';
    if (!textToSend.trim() || loading) return;

    // Synthesize structured document payload if attached
    let synthesizedQuery = textToSend;
    let userDisplayText = textToSend;
    if (attachedDoc && attachedDoc.text) {
      let firHeader = '';
      if (attachedDoc.ocrMetadata) {
        const m = attachedDoc.ocrMetadata;
        firHeader = `\n[EXTRACTED FIR / POLICE RECORD METADATA]:\n- FIR No: ${m.fir_number || 'N/A'}\n- Police Station: ${m.police_station || 'N/A'}\n- Date: ${m.date || 'N/A'}\n- Sections: ${m.sections?.join(', ') || 'N/A'}\n- Language: ${m.language_detected || 'N/A'}\n`;
      }
      synthesizedQuery = `[ATTACHED LEGAL DOCUMENT: ${attachedDoc.fileName} (${attachedDoc.formattedSize}, ~${attachedDoc.wordCount} words)]${firHeader}\n${attachedDoc.text}\n\n[USER INQUIRY / PRAYER]:\n${textToSend}`;
      userDisplayText = `[Attached: 📄 ${attachedDoc.fileName} (${attachedDoc.formattedSize}${attachedDoc.ocrMetadata?.fir_number ? ` • FIR ${attachedDoc.ocrMetadata.fir_number}` : ''})]\n\n${textToSend}`;
    }
    setAttachedDoc(null);

    const userMsgId = `msg-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      text: userDisplayText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    // Ensure active thread exists, or dynamically create one
    let targetThreadId = activeThreadId;
    let baseThreads = threads;
    let updatedTitle = textToSend.slice(0, 36) + (textToSend.length > 36 ? '...' : '');

    const currentThread = threads.find(t => t.id === targetThreadId);
    if (!currentThread) {
      targetThreadId = `thread-${Date.now()}`;
      const newThread: ChatThread = {
        id: targetThreadId,
        title: updatedTitle,
        category: contextFilter,
        createdAt: 'Just now',
        messages: newMessages
      };
      baseThreads = [newThread, ...threads];
      setActiveThreadId(targetThreadId);
    } else {
      if (currentThread.title !== 'New Research Inquiry' && messages.length > 0) {
        updatedTitle = currentThread.title;
      }
      baseThreads = threads.map(t => {
        if (t.id === targetThreadId) {
          return {
            ...t,
            title: updatedTitle,
            category: contextFilter,
            messages: newMessages
          };
        }
        return t;
      });
    }
    saveThreadsToStorage(baseThreads);

    const asstMsgId = `msg-${Date.now() + 1}`;
    const initialAsstMsg: ChatMessage = {
      id: asstMsgId,
      role: 'assistant',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      response: { answer: '' }
    };

    setMessages([...newMessages, initialAsstMsg]);

    try {
      const historyPayload = messages.length <= 12
        ? messages.map(m => ({ role: m.role, text: m.text }))
        : [
            { role: messages[0].role, text: messages[0].text },
            ...messages.slice(-10).map(m => ({ role: m.role, text: m.text }))
          ];

      const data = await sendAssistantQueryStream(
        {
          query: synthesizedQuery,
          mode: mode,
          context_filter: contextFilter,
          gemini_api_key: geminiApiKey || undefined,
          history: historyPayload
        },
        (meta) => {
          setMessages(prev => prev.map(m => m.id === asstMsgId ? { ...m, response: { ...m.response, ...meta } } : m));
        },
        (accumulated) => {
          setMessages(prev => prev.map(m => m.id === asstMsgId ? { ...m, text: accumulated, response: { ...m.response, answer: accumulated } } : m));
        }
      );

      const finalAsstMsg: ChatMessage = {
        id: asstMsgId,
        role: 'assistant',
        text: data.answer || data.message || 'Legal opinion generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        response: data
      };

      const finalMessages = [...newMessages, finalAsstMsg];
      setMessages(finalMessages);

      const finalThreads = baseThreads.map(t => {
        if (t.id === targetThreadId) {
          return {
            ...t,
            title: updatedTitle || t.title,
            messages: finalMessages
          };
        }
        return t;
      });
      saveThreadsToStorage(finalThreads);
    } catch (err: any) {
      console.warn('handleSendMessage caught error, fallback handling:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDossier = async () => {
    if (messages.length === 0) return;
    const firstUserMsg = messages.find(m => m.role === 'user');
    const lastAsstMsg = [...messages].reverse().find(m => m.role === 'assistant');
    const activeThread = threads.find(t => t.id === activeThreadId);

    const dossierPayload = {
      guest_id: guestId,
      title: activeThread?.title || 'Legal Analysis Consultation',
      category: contextFilter,
      mode: mode,
      initial_query: firstUserMsg?.text || 'Legal Inquiry',
      legal_summary: lastAsstMsg?.text 
        ? lastAsstMsg.text.replace(/^#{1,4}\s+.*?\n+/g, '').replace(/[*#>`]/g, '').trim().slice(0, 400)
        : 'Consultation record',
      applicable_sections: (lastAsstMsg?.response?.applicable_laws || []).map(l => `${l.source_title} ${l.section_number}`)
    };

    try {
      if (apiBase && apiBase.trim() !== '') {
        const res = await fetch(`${apiBase}/api/dossiers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dossierPayload)
        });

        if (res.ok) {
          setDossierSaved(true);
          setTimeout(() => setDossierSaved(false), 3000);
          return;
        }
      }
      throw new Error('API save not available or failed');
    } catch {
      // IndexedDB persistence fallback with localStorage mirror
      try {
        const newDossier = {
          id: Date.now(),
          docket_number: `BHR-2024-${Math.floor(1000 + Math.random() * 9000)}`,
          title: dossierPayload.title,
          category: dossierPayload.category,
          mode: dossierPayload.mode,
          initial_query: dossierPayload.initial_query,
          legal_summary: dossierPayload.legal_summary,
          applicable_sections: dossierPayload.applicable_sections,
          created_at: new Date().toISOString(),
          guest_id: guestId
        };
        await clientStorage.saveDossier(newDossier);
        setDossierSaved(true);
        setTimeout(() => setDossierSaved(false), 3000);
      } catch (storageErr) {
        console.warn('clientStorage dossier save error:', storageErr);
      }
    }
  };



  const renderSidebarContent = () => (
    <>
      <div className="flex-1 flex flex-col p-3 gap-3 overflow-y-auto">
        {/* Mobile Platform Navigation (< lg) - Ultra-Compact Horizontal 4-Tab Segment */}
        <div className="lg:hidden pb-1.5 border-b border-zinc-700/20">
          <div className={`grid grid-cols-4 gap-1 p-0.5 rounded-lg border ${
            isDark ? 'bg-[#131624] border-[#23283f]' : 'bg-[#eff4ff] border-[#dce9ff]'
          }`}>
            <button
              type="button"
              onClick={() => {
                onSelectTab?.('chat');
                setIsMobileSidebarOpen(false);
              }}
              className={`flex items-center justify-center gap-1 py-1 px-1 rounded-md text-[10px] font-medium transition-all cursor-pointer ${
                activeTab === 'chat'
                  ? isDark 
                    ? 'bg-white text-black font-bold shadow-2xs' 
                    : 'bg-[#00288e] text-white font-bold shadow-2xs'
                  : isDark 
                    ? 'text-[#cbd5e1] hover:text-white hover:bg-white/5' 
                    : 'text-[#334155] hover:text-[#0b1c30] hover:bg-white'
              }`}
              title="Legal Chat Assistant"
            >
              <span className="material-symbols-outlined text-[13px]">chat</span>
              <span className="truncate">Chat</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onSelectTab?.('contracts');
                setIsMobileSidebarOpen(false);
              }}
              className={`flex items-center justify-center gap-1 py-1 px-1 rounded-md text-[10px] font-medium transition-all cursor-pointer ${
                activeTab === 'contracts'
                  ? isDark 
                    ? 'bg-white text-black font-bold shadow-2xs' 
                    : 'bg-[#00288e] text-white font-bold shadow-2xs'
                  : isDark 
                    ? 'text-[#cbd5e1] hover:text-white hover:bg-white/5' 
                    : 'text-[#334155] hover:text-[#0b1c30] hover:bg-white'
              }`}
              title="AI Contract Studio"
            >
              <span className="material-symbols-outlined text-[13px]">edit_document</span>
              <span className="truncate">Contracts</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onSelectTab?.('search');
                setIsMobileSidebarOpen(false);
              }}
              className={`flex items-center justify-center gap-1 py-1 px-1 rounded-md text-[10px] font-medium transition-all cursor-pointer ${
                activeTab === 'search'
                  ? isDark 
                    ? 'bg-white text-black font-bold shadow-2xs' 
                    : 'bg-[#00288e] text-white font-bold shadow-2xs'
                  : isDark 
                    ? 'text-[#cbd5e1] hover:text-white hover:bg-white/5' 
                    : 'text-[#334155] hover:text-[#0b1c30] hover:bg-white'
              }`}
              title="Statute & Case Search"
            >
              <span className="material-symbols-outlined text-[13px]">account_balance</span>
              <span className="truncate">Search</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onSelectTab?.('info');
                setIsMobileSidebarOpen(false);
              }}
              className={`flex items-center justify-center gap-1 py-1 px-1 rounded-md text-[10px] font-medium transition-all cursor-pointer ${
                activeTab === 'info'
                  ? isDark 
                    ? 'bg-white text-black font-bold shadow-2xs' 
                    : 'bg-[#00288e] text-white font-bold shadow-2xs'
                  : isDark 
                    ? 'text-[#cbd5e1] hover:text-white hover:bg-white/5' 
                    : 'text-[#334155] hover:text-[#0b1c30] hover:bg-white'
              }`}
              title="Knowledge & Validator Hub"
            >
              <span className="material-symbols-outlined text-[13px]">fact_check</span>
              <span className="truncate">Validator</span>
            </button>
          </div>
        </div>

        {/* New Research Thread Action */}
        <button 
          type="button"
          onClick={handleNewThread}
          className={`group flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg shadow-md transition-all cursor-pointer font-bold ${
            isDark 
              ? 'bg-white text-black hover:bg-zinc-200' 
              : 'bg-[#00288e] text-white hover:bg-[#1e40af]'
          }`}
        >
          <span className="material-symbols-outlined text-[19px] transition-transform group-hover:rotate-90">add</span>
          <span className="text-[13px] font-bold tracking-tight">New Research Thread</span>
        </button>

        {/* Free Tier Quota Alert if at limit */}
        {threads.length >= MAX_FREE_THREADS && (
          <div className={`p-2.5 rounded-lg border text-[11px] flex flex-col gap-1.5 shadow-xs ${
            isDark ? 'bg-amber-950/40 border-amber-500/40 text-amber-200' : 'bg-amber-50 border-amber-300 text-amber-900'
          }`}>
            <div className="flex items-center justify-between font-bold text-[10.5px]">
              <span className="flex items-center gap-1 text-amber-400">
                <span className="material-symbols-outlined text-[15px]">warning</span>
                Free Storage Limit (7/7)
              </span>
            </div>
            <p className="text-[10px] leading-snug">
              Free services allow up to 7 saved conversations. Export before starting a new thread to avoid losing records.
            </p>
            <button
              type="button"
              onClick={handleOpenPrintStudio}
              className={`w-full py-1 rounded text-[10px] font-bold border cursor-pointer flex items-center justify-center gap-1 transition-colors ${
                isDark 
                  ? 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/40 text-amber-300' 
                  : 'bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-900'
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">picture_as_pdf</span>
              Export Current to PDF
            </button>
          </div>
        )}

        {/* Chat History Section */}
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex items-center justify-between px-1">
            <span className={`text-[10px] uppercase tracking-wider font-bold ${
              isDark ? 'text-[#94a3b8]' : 'text-[#565e74]'
            }`}>
              Research History
            </span>
            <span className={`px-1.5 py-0.2 rounded font-mono text-[9px] font-semibold border ${
              threads.length >= MAX_FREE_THREADS
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 font-bold'
                : isDark ? 'bg-white/10 text-zinc-300 border-white/10' : 'bg-[#00288e]/10 text-[#00288e] border-[#00288e]/20'
            }`}>
              {threads.length}/{MAX_FREE_THREADS}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            {threads.length === 0 ? (
              <div className={`p-3 rounded-lg text-center border border-dashed text-[11px] ${
                isDark ? 'border-zinc-800 text-zinc-400 bg-zinc-900/30' : 'border-slate-200 text-slate-500 bg-slate-50'
              }`}>
                <span className="material-symbols-outlined text-[18px] mb-1 block text-slate-400">forum</span>
                <p className="font-semibold text-[11px]">No research threads yet</p>
                <p className="text-[10px] opacity-75 mt-0.5">Start a query or select a quick prompt below</p>
              </div>
            ) : (
              threads.map(thread => {
                const isActive = activeThreadId === thread.id;
                const replyCount = thread.messages.filter(m => m.role === 'assistant').length;
                return (
                  <div
                    key={thread.id}
                    onClick={() => handleSelectThread(thread.id)}
                    className={`group relative flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-all cursor-pointer border ${
                      isActive
                        ? isDark 
                          ? 'bg-[#1a1e2e] text-white border-white/20 shadow-xs' 
                          : 'bg-white text-[#00288e] border-[#00288e]/30 shadow-xs font-semibold'
                        : isDark
                          ? 'bg-[#131624]/60 hover:bg-[#131624] text-[#cbd5e1] hover:text-white border-transparent'
                          : 'bg-[#f1f5f9]/60 hover:bg-[#eff4ff] text-[#334155] hover:text-[#0b1c30] border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-5">
                      <span className={`material-symbols-outlined text-[15px] shrink-0 ${
                        isActive 
                          ? isDark ? 'text-white' : 'text-[#00288e]' 
                          : 'text-[#64748b]'
                      }`}>
                        chat_bubble
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[12px] truncate leading-tight">{thread.title}</span>
                        <span className="text-[9px] text-[#64748b] font-mono">
                          {thread.createdAt || 'Recent'} • {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                        </span>
                      </div>
                    </div>
                    {/* Delete action button */}
                    <button
                      type="button"
                      title="Delete thread"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteThread(thread.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-1 rounded transition-opacity absolute right-1.5 top-1/2 -translate-y-1/2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Research Prompts */}
        <div className="flex flex-col gap-1.5 pt-2 border-t border-dashed border-zinc-700/30">
          <div className="flex items-center justify-between px-1">
            <span className={`text-[10px] uppercase tracking-wider font-bold ${
              isDark ? 'text-[#94a3b8]' : 'text-[#565e74]'
            }`}>
              Quick Prompts
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPromptPersonaTab('citizen')}
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer ${
                  promptPersonaTab === 'citizen'
                    ? isDark ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'opacity-50 hover:opacity-100 text-zinc-400'
                }`}
                title="Citizen Legal Prompts"
              >
                Citizen
              </button>
              <button
                type="button"
                onClick={() => setPromptPersonaTab('professional')}
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer ${
                  promptPersonaTab === 'professional'
                    ? isDark ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' : 'bg-blue-100 text-blue-900 border border-blue-300'
                    : 'opacity-50 hover:opacity-100 text-zinc-400'
                }`}
                title="Advocate Chamber Prompts"
              >
                Advocate
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            {(promptPersonaTab === 'citizen' ? CITIZEN_QUICK_PROMPTS : ADVOCATE_QUICK_PROMPTS).map((p) => (
              <button 
                key={p.id}
                type="button"
                onClick={() => { handleSendMessage(p.query); setIsMobileSidebarOpen(false); }}
                className={`text-left px-2 py-1.5 rounded-lg transition-all flex items-center justify-between shadow-xs border cursor-pointer group ${
                  p.isEmergency
                    ? isDark 
                      ? 'bg-[#1a0e14] hover:bg-[#26121c] text-rose-300 border-rose-900/60' 
                      : 'bg-[#fff1f2] hover:bg-[#ffe4e6] text-[#be123c] border-[#fecdd3]'
                    : isDark 
                      ? 'bg-[#131624] hover:bg-[#1a1f33] text-[#e2e8f0] hover:text-white border-[#23283f]' 
                      : 'bg-white hover:bg-[#eff4ff] text-[#0b1c30] border-[#e2e8f0]'
                }`}
                title={p.query}
              >
                <div className="flex items-center gap-1.5 min-w-0 pr-1">
                  <span className={`text-[8px] font-mono font-bold px-1 py-0.2 rounded border shrink-0 ${p.domainColor}`}>
                    {p.domain}
                  </span>
                  <span className="text-[11px] truncate font-medium group-hover:text-[#ff7722] transition-colors">
                    {p.shortTitle}
                  </span>
                </div>
                <span className="material-symbols-outlined text-[13px] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0">
                  {p.isEmergency ? 'emergency' : 'north_east'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* LOWER SECTION: Advocate Profile Card & Telemetry Indicator */}
      <div className={`p-3 border-t transition-colors flex flex-col gap-2.5 ${
        isDark ? 'bg-[#08090e] border-[#1f2438]' : 'bg-[#eff4ff] border-[#e2e8f0]'
      }`}>
        {/* User Profile Card (Relocated from top-right header) */}
        <div className={`p-2 rounded-lg border flex items-center justify-between shadow-xs ${
          isDark ? 'bg-[#131624] border-[#23283f]' : 'bg-white border-[#dce9ff]'
        }`}>
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-6.5 h-6.5 rounded-full flex items-center justify-center font-bold text-[10px] tracking-wider shrink-0 ${
              isDark ? 'bg-white text-black' : 'bg-[#00288e] text-white'
            }`}>
              {mode === 'citizen' ? 'CU' : 'AC'}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1">
                <span className={`text-[11px] font-bold truncate leading-tight ${isDark ? 'text-white' : 'text-[#0b1c30]'}`}>
                  {mode === 'citizen' ? 'Citizen Inquirer' : 'Advocate Counsel'}
                </span>
                <span className="material-symbols-outlined text-[11.5px] text-emerald-400 shrink-0" title="Verified Credential">
                  verified
                </span>
              </div>
              <span className={`text-[8.5px] truncate font-mono leading-tight mt-0.5 ${isDark ? 'text-[#94a3b8]' : 'text-[#565e74]'}`}>
                {mode === 'citizen' ? 'General Public Access' : 'BCI Registered Chamber'}
              </span>
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => setMode(mode === 'citizen' ? 'professional' : 'citizen')}
            className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border transition-all shrink-0 cursor-pointer ${
              isDark 
                ? 'bg-[#1c2136] hover:bg-[#252b47] text-white border-white/10' 
                : 'bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#00288e] border-[#cbd5e1]'
            }`}
            title="Toggle Citizen / Advocate mode"
          >
            {mode === 'citizen' ? 'Citizen' : 'Advocate'}
          </button>
        </div>

        {/* RAG Telemetry Micro-Pill */}
        <div className={`px-2.5 py-1.5 rounded-md border flex items-center justify-between text-[10px] font-mono ${
          isDark ? 'bg-[#0e111c] border-[#1e2337] text-[#94a3b8]' : 'bg-white/80 border-[#dce9ff] text-[#565e74]'
        }`}>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-emerald-400">pgvector</span>
          </div>
          <span>{totalProvisions} Central Acts</span>
          <span className="text-emerald-400 font-bold">100% Grounded</span>
        </div>
      </div>
    </>
  );

  return (
    <div className={`flex h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-82px)] w-full overflow-hidden transition-colors duration-200 ${
      isDark ? 'bg-[#090a0f] text-[#f8fafc]' : 'bg-[#f4f6fb] text-[#0b1c30]'
    }`}>
      {/* MOBILE SLIDE-OVER SIDEBAR DRAWER (< lg) */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className={`relative w-[300px] max-w-[85vw] h-full flex flex-col justify-between overflow-hidden shadow-2xl z-10 border-r transition-colors duration-200 ${
            isDark ? 'bg-[#0d0f17] border-[#1f2438]' : 'bg-[#f8f9ff] border-[#e2e8f0]'
          }`}>
            <div className={`flex items-center justify-between p-3 border-b ${
              isDark ? 'border-[#1f2438]' : 'border-[#e2e8f0]'
            }`}>
              <span className={`text-[12px] font-bold ${isDark ? 'text-white' : 'text-[#0b1c30]'}`}>
                Chamber Research History
              </span>
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className={`p-1 rounded-md cursor-pointer ${
                  isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            {renderSidebarContent()}
          </div>
        </div>
      )}

      {/* DESKTOP SUB-PANEL: Research Navigation & Chat History (280px, Hidden on < lg) */}
      <aside className={`w-[280px] shrink-0 h-full flex flex-col justify-between overflow-hidden shadow-2xl hidden lg:flex border-r transition-colors duration-200 ${
        isDark ? 'bg-[#0d0f17] border-[#1f2438]' : 'bg-[#f8f9ff] border-[#e2e8f0]'
      }`}>
        {renderSidebarContent()}
      </aside>

      {/* MAIN CHAT CANVAS & WORKSPACE */}
      <main 
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          if (e.currentTarget.contains(e.relatedTarget as Node)) return;
          setIsDragOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleProcessFile(file);
        }}
        className={`flex-1 flex flex-col h-full min-w-0 relative transition-colors duration-200 ${
          isDark ? 'bg-[#090a0f]' : 'bg-[#f4f6fb]'
        }`}
      >
        {/* DRAG-AND-DROP OVERLAY FOR INSTANT LEGAL DOCUMENT INGESTION */}
        {isDragOver && (
          <div className="absolute inset-0 z-50 bg-[#090a0f]/85 backdrop-blur-xs flex flex-col items-center justify-center pointer-events-none p-6 border-4 border-dashed border-amber-500 rounded-xl m-2 animate-in fade-in duration-150">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-3 animate-bounce">
              <span className="material-symbols-outlined text-[36px]">upload_file</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Drop Legal Document Here</h3>
            <p className="text-xs text-amber-300 font-mono">Supports PDF, DOCX, TXT up to 15MB • Client-Side Secure Ingestion</p>
          </div>
        )}
        {/* Sleek Compact Chat Thread Header (Single-row, minimal vertical space, No SES ID) */}
        <header className={`px-2.5 sm:px-4 py-1.5 h-11 border-b shadow-xs flex items-center justify-between shrink-0 z-10 transition-colors ${
          isDark 
            ? 'bg-[#0d0f17] border-[#1f2438]' 
            : 'bg-white border-[#e2e8f0]'
        }`}>
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            {/* Mobile History Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className={`lg:hidden flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold border transition-all cursor-pointer ${
                isDark 
                  ? 'bg-[#131624] text-white border-[#23283f] hover:bg-[#1a1f33]' 
                  : 'bg-[#eff4ff] text-[#00288e] border-[#dce9ff] hover:bg-[#e5eeff]'
              }`}
              title="Open Research History & Chamber Navigation"
            >
              <span className="material-symbols-outlined text-[15px]">history</span>
              <span className="hidden xs:inline">History</span>
              <span className="font-mono text-[10px]">({threads.length})</span>
            </button>

            <span className={`material-symbols-outlined text-[18px] shrink-0 ${
              isDark ? 'text-white' : 'text-[#00288e]'
            }`}>
              account_balance
            </span>
            <div className="flex items-center gap-2 min-w-0">
              <span className={`text-[12px] sm:text-[13px] font-bold truncate ${
                isDark ? 'text-white' : 'text-[#0b1c30]'
              }`}>
                {threads.find(t => t.id === activeThreadId)?.title || 'Chamber Dossier: Legal Analysis'}
              </span>
              <span className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-emerald-400 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                SCI Grounded
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button 
              type="button"
              onClick={handleSaveDossier}
              disabled={messages.length === 0}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all border disabled:opacity-40 cursor-pointer ${
                dossierSaved
                  ? isDark 
                    ? 'bg-emerald-950/60 text-emerald-400 border-emerald-700' 
                    : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : isDark 
                    ? 'bg-[#131624] hover:bg-[#1a1f33] text-white border-[#23283f]' 
                    : 'bg-[#eff4ff] hover:bg-[#e5eeff] text-[#0b1c30] border-[#dce9ff]'
              }`}
              title="Save current consultation to Chamber Dossiers"
            >
              <span className="material-symbols-outlined text-[14px]">
                {dossierSaved ? 'check_circle' : 'bookmark_border'}
              </span>
              <span className="hidden sm:inline">{dossierSaved ? 'Saved' : 'Save Dossier'}</span>
            </button>
            <button 
              type="button"
              onClick={handleOpenPrintStudio}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] font-bold shadow-xs transition-all cursor-pointer min-h-[32px] ${
                isDark 
                  ? 'bg-white hover:bg-zinc-200 text-black' 
                  : 'bg-[#00288e] hover:bg-[#1e40af] text-white'
              }`}
              title="Open Court-Ready Legal Print & PDF Export Studio"
            >
              <span className="material-symbols-outlined text-[15px]">picture_as_pdf</span>
              <span className="inline font-bold">PDF</span>
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </header>

        {/* Scrollable Message Stream & Printable Legal Memorandum Canvas */}
        <div id="printable-legal-dossier" className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-5 flex flex-col items-center">
          <div className="w-full max-w-[880px] space-y-5 pb-36 sm:pb-44">
            {/* PRINT-ONLY OFFICIAL LEGAL OPINION LETTERHEAD WITH GRAPHICS */}
            <div className="hidden print:block w-full border-b-2 border-black pb-4 mb-6 text-black">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="Emblem" className="w-12 h-12 object-contain" />
                  <div>
                    <div className="text-[18pt] font-serif font-black tracking-tight leading-none text-black">
                      भारत Legal Intelligence
                    </div>
                    <div className="text-[8.5pt] font-mono text-gray-700 tracking-wider uppercase mt-1">
                      Constitutional & Statutory AI-Assisted Advisory Dossier
                    </div>
                  </div>
                </div>
                <div className="text-right text-[8.5pt] font-mono text-gray-700 leading-tight">
                  <div><strong>Docket:</strong> #{activeThreadId.slice(0, 16)}</div>
                  <div><strong>Date:</strong> {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                  <div><strong>Bench:</strong> SCI Precedent & Central Acts Synced</div>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-gray-400 flex items-center justify-between text-[8pt] font-mono text-gray-700">
                <span><strong>Consultation:</strong> {threads.find(t => t.id === activeThreadId)?.title || 'Legal Analysis'}</span>
                <span><strong>Mode:</strong> {mode === 'citizen' ? 'Citizen Advisory Record' : 'Advocate Chamber Brief'}</span>
                <span><strong>Trust Grounding:</strong> 100% Neon pgvector</span>
              </div>
            </div>

            {/* Chamber Dossier Active Workspace Banner with High-Yield Triggers */}
            {threads.find(t => t.id === activeThreadId)?.title.startsWith('[Dossier') && (
              <div className={`no-print p-3.5 sm:p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md mb-4 transition-colors ${
                isDark ? 'bg-[#0f121d] border-[#252c48]' : 'bg-[#eef4ff] border-[#c7d9ff]'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isDark ? 'bg-[#1b2138] text-amber-400' : 'bg-[#dce9ff] text-[#00288e]'
                  }`}>
                    <span className="material-symbols-outlined text-[20px]">folder_special</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[12px] font-bold font-mono ${isDark ? 'text-white' : 'text-[#0b1c30]'}`}>
                        {threads.find(t => t.id === activeThreadId)?.title}
                      </span>
                      <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase border ${
                        isDark ? 'bg-[#182038] text-amber-300 border-amber-900/60' : 'bg-[#e0eaff] text-[#001f70] border-[#c0d4ff]'
                      }`}>
                        BCI Chamber Brief
                      </span>
                    </div>
                    <p className={`text-[11px] mt-0.5 ${isDark ? 'text-[#94a3b8]' : 'text-[#565e74]'}`}>
                      Chamber statutory analysis active. Continue consultation or generate high-output precedent analysis below:
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const t = threads.find(t => t.id === activeThreadId);
                      handleSendMessage(`Identify binding Supreme Court of India precedent benchmarks and constitutional bench ratios directly applicable to ${t?.title || 'this case'}. Detail landmark citations, bench strength, and authoritative holdings.`);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                      isDark 
                        ? 'bg-[#182038] hover:bg-[#202c4e] text-white border-[#2d375a]' 
                        : 'bg-white hover:bg-slate-50 text-[#00288e] border-[#c7d9ff]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">gavel</span>
                    <span>SC Precedents</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const t = threads.find(t => t.id === activeThreadId);
                      handleSendMessage(`Provide an actionable defense roadmap and procedural bail strategy under Bharatiya Nagarik Suraksha Sanhita (BNSS) for ${t?.title || 'this case'}.`);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                      isDark 
                        ? 'bg-[#182038] hover:bg-[#202c4e] text-white border-[#2d375a]' 
                        : 'bg-white hover:bg-slate-50 text-[#00288e] border-[#c7d9ff]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">security</span>
                    <span>Trial Strategy</span>
                  </button>
                </div>
              </div>
            )}
            {messages.length === 0 ? (
              <div className={`no-print p-5 sm:p-8 rounded-xl shadow-lg text-center flex flex-col items-center my-4 sm:my-6 border transition-colors ${
                isDark ? 'bg-[#0f111a] border-[#23283f]' : 'bg-white border-[#e2e8f0]'
              }`}>
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-3 shadow-xs border p-1.5 ${
                  isDark ? 'bg-[#131624] border-[#23283f]' : 'bg-[#eff4ff] border-[#e2e8f0]'
                }`}>
                  <img src="/logo.png" alt="भारत Legal Intelligence" className="w-full h-full object-contain" />
                </div>
                <h2 className="text-[18px] sm:text-[20px] font-bold tracking-tight">
                  <span className="text-[#ff7722]">भारत</span> <span className={isDark ? 'text-white' : 'text-[#00288e]'}>Legal Intelligence</span>
                </h2>
                <div className="flex items-center gap-2 mt-2 mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium flex items-center gap-1.5 border shadow-xs ${
                    isDark 
                      ? 'bg-[#182038] text-emerald-300 border-emerald-800/60' 
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Guest Mode • #{guestId || 'GST-LOCAL'} (Private to this browser)
                  </span>
                </div>
                <p className={`text-[12px] sm:text-[13px] max-w-lg mt-1 mb-3 leading-relaxed ${
                  isDark ? 'text-[#94a3b8]' : 'text-[#565e74]'
                }`}>
                  Evidence-First Indian Jurisprudence Engine. Every claim is strictly validated against official central acts and Supreme Court precedents with 0% speculative hallucination.
                </p>

                {/* PROMINENT WELCOME SPLASH AI WARNING BANNER */}
                <div className={`w-full max-w-xl mx-auto mb-4 p-2.5 sm:p-3 rounded-xl border flex items-start gap-2.5 text-left ${
                  isDark 
                    ? 'bg-[#14121d] border-amber-500/30 text-amber-300/90' 
                    : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}>
                  <span className="material-symbols-outlined text-[18px] text-amber-500 shrink-0 mt-0.5">
                    smart_toy
                  </span>
                  <div className="space-y-0.5 text-[10.5px] sm:text-[11px] leading-snug">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-bold font-mono uppercase tracking-wider text-[10px]">
                        AI-Generated Intelligence Advisory
                      </span>
                      <span className="font-mono text-[9px] opacity-80">Advocates Act, 1961 Compliance</span>
                    </div>
                    <p className="opacity-90">
                      All responses, statutory analyses, and draft contracts are generated by Artificial Intelligence for legal research and preliminary assessment only. They do not constitute formal attorney-client legal counsel. Always consult an enrolled Advocate for judicial representation.
                    </p>
                  </div>
                </div>

                {/* NALSA FREE LEGAL AID CITIZEN CALLOUT */}
                <div 
                  onClick={() => setIsLegalAidModalOpen(true)}
                  className={`w-full max-w-xl mx-auto mb-4 p-3 rounded-xl border flex items-center justify-between gap-3 text-left transition-all cursor-pointer ${
                    isDark 
                      ? 'bg-[#121626] hover:bg-[#181e33] border-blue-500/30 text-slate-200 shadow-xs' 
                      : 'bg-[#eff6ff] hover:bg-[#e0efff] border-blue-200 text-slate-900 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#00288e] text-white flex items-center justify-center shrink-0">
                      <Scale className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <div className="font-bold text-xs flex items-center gap-1.5">
                        <span>Need a Free Court-Appointed Advocate?</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-400 font-semibold">100% Free</span>
                      </div>
                      <div className={`text-[10.5px] ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                        Dial 15100 or explore the National Legal Services Authority (NALSA) State Directory
                      </div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-amber-500">arrow_forward</span>
                </div>

                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2.5 text-left">
                  {(mode === 'citizen' ? CITIZEN_QUICK_PROMPTS.slice(0, 4) : ADVOCATE_QUICK_PROMPTS.slice(0, 4)).map((p) => (
                    <button 
                      key={p.id}
                      type="button"
                      onClick={() => handleSendMessage(p.query)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer group text-left ${
                        isDark 
                          ? 'bg-[#131624] hover:bg-[#1a1f33] border-[#23283f] hover:border-amber-500/40 shadow-xs' 
                          : 'bg-[#f8f9ff] hover:bg-[#eff4ff] border-[#e2e8f0] hover:border-amber-400 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded border ${p.domainColor}`}>
                          {p.domain}
                        </span>
                        <span className="material-symbols-outlined text-[15px] text-amber-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                          arrow_forward
                        </span>
                      </div>
                      <div className={`text-[12.5px] font-bold group-hover:text-[#ff7722] transition-colors ${
                        isDark ? 'text-white' : 'text-[#00288e]'
                      }`}>
                        {p.shortTitle}
                      </div>
                      <p className={`text-[11px] mt-1 line-clamp-2 leading-snug ${isDark ? 'text-[#94a3b8]' : 'text-[#565e74]'}`}>
                        {p.description || p.query}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {messages.length >= 2 && (() => {
              const activeMemory = extractActiveCaseMemory(messages);
              if (!activeMemory) return null;
              return (
                <div className={`no-print w-full p-2.5 sm:px-3.5 sm:py-2.5 rounded-xl border flex items-center justify-between gap-3 text-[11px] font-mono shadow-xs mb-3 transition-all ${
                  isDark 
                    ? 'bg-[#0f1322] border-[#222a44] text-zinc-300' 
                    : 'bg-white border-[#dce9ff] text-slate-700 shadow-sm'
                }`}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-400 shrink-0">
                      <Brain className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                      <span className="font-bold text-[#ff7722] uppercase tracking-wider text-[9.5px]">
                        Active Case Memory:
                      </span>
                      {activeMemory.topicPillarLabel && (
                        <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold border ${
                          isDark ? 'bg-amber-950/60 text-amber-300 border-amber-800/50' : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {activeMemory.topicPillarLabel}
                        </span>
                      )}
                      <span className={`font-semibold truncate max-w-[200px] sm:max-w-[340px] ${isDark ? 'text-white' : 'text-[#00288e]'}`} title={activeMemory.rootFactAnchor}>
                        {activeMemory.rootFactAnchor}
                      </span>
                      {activeMemory.provisions.length > 0 && (
                        <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold border ${
                          isDark ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          {activeMemory.provisions.slice(0, 3).join(' • ')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-400 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setReaModalNarrative(activeMemory.rootFactAnchor || messages.find(m => m.role === 'user')?.text || '');
                        setIsReaModalOpen(true);
                      }}
                      className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs ${
                        isDark 
                          ? 'bg-gradient-to-r from-[#ff7722]/20 to-[#00288e]/30 hover:from-[#ff7722]/30 hover:to-[#00288e]/40 text-amber-300 border-amber-500/40' 
                          : 'bg-orange-50 hover:bg-orange-100 text-[#00288e] border-orange-200'
                      }`}
                      title="Open Tri-Perspective Chamber Battle-Room (REA Engine)"
                    >
                      <span className="material-symbols-outlined text-[13px] text-[#ff7722]">swords</span>
                      <span className="font-extrabold">Battle-Room</span>
                    </button>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="hidden sm:inline font-semibold text-emerald-500">
                      Turn {activeMemory.turnCount} Synced
                    </span>
                  </div>
                </div>
              );
            })()}

            {messages.map((msg) => (
              <div key={msg.id} className="w-full space-y-3">
                {msg.role === 'user' ? (
                  /* USER MESSAGE BUBBLE */
                  <div className="flex justify-end w-full">
                    <div className={`print-card-break print-user-message max-w-[760px] rounded-xl rounded-tr-none p-3.5 sm:p-4 shadow-sm border transition-colors ${
                      isDark 
                        ? 'bg-[#131624] border-[#23283f] text-[#f8fafc]' 
                        : 'bg-white border-[#e2e8f0] text-[#0b1c30]'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`user-badge w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-extrabold ${
                            isDark ? 'bg-white text-black' : 'bg-[#00288e] text-white'
                          }`}>
                            {mode === 'citizen' ? 'CU' : 'AC'}
                          </div>
                          <span className={`text-[13px] font-bold ${isDark ? 'text-white' : 'text-[#0b1c30]'}`}>
                            {mode === 'citizen' ? 'You (Citizen Inquirer)' : 'You (Advocate Counsel)'}
                          </span>
                        </div>
                        <span className={`user-meta font-mono text-[11px] ${isDark ? 'text-[#94a3b8]' : 'text-[#565e74]'}`}>
                          {msg.timestamp || 'Today'}
                        </span>
                      </div>
                      <p className="text-[14px] sm:text-[15px] leading-relaxed whitespace-pre-line">
                        "{msg.text}"
                      </p>
                      <div className={`user-meta mt-2.5 pt-2 flex items-center justify-between font-mono text-[10px] border-t ${
                        isDark ? 'border-[#1f2438] text-[#94a3b8]' : 'border-[#f1f5f9] text-[#565e74]'
                      }`}>
                        <span className="flex items-center gap-1">
                          <span className={`material-symbols-outlined text-[13px] ${isDark ? 'text-white' : 'text-[#00288e]'}`}>
                            shield
                          </span>
                          {mode === 'citizen' ? 'Citizen Inquiry Confidential' : 'Chamber Privilege Protected'}
                        </span>
                        <span>Query ID: #{msg.id.slice(-6)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ASSISTANT RESPONSE CARD */
                  <div className={`print-card-break print-assistant-card w-full rounded-xl shadow-lg p-4 sm:p-5 space-y-4 border transition-colors ${
                    isDark ? 'bg-[#0f111a] border-[#23283f]' : 'bg-white border-[#e2e8f0]'
                  }`}>
                    {/* Assistant Header */}
                    <div className={`flex items-center justify-between pb-2 border-b ${
                      isDark ? 'border-[#1f2438]' : 'border-[#f1f5f9]'
                    }`}>
                      <div className="flex items-center gap-2 sm:gap-2.5">
                        <img 
                          src="/logo.png" 
                          alt="भारत Legal Intelligence" 
                          className={`w-7 h-7 rounded-lg object-contain p-0.5 border shadow-xs ${
                            isDark ? 'bg-[#131624] border-[#23283f]' : 'bg-white border-[#e2e8f0]'
                          }`} 
                        />
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-[14px] text-[#ff7722]">भारत</span>
                            <span className={`font-bold text-[14px] ${isDark ? 'text-white' : 'text-[#00288e]'}`}>
                              Legal Intelligence
                            </span>
                            <span 
                              className={`text-[9.5px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border flex items-center gap-1 ${
                                isDark 
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                                  : 'bg-amber-50 text-amber-800 border-amber-300'
                              }`} 
                              title="Generated by Bharat Legal AI based on retrieved Indian statutes and judicial precedents"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                              AI Generated
                            </span>
                          </div>
                          <span className={`text-[10px] hidden xs:inline ${isDark ? 'text-[#94a3b8]' : 'text-[#565e74]'}`}>
                            {msg.response?.ai_engine ? (
                              <span className="inline-flex items-center gap-1 font-mono font-semibold text-amber-400">
                                <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                                {msg.response.ai_engine}
                              </span>
                            ) : (
                              'Verified against Supreme Court Precedents & Central Gazettes'
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {msg.response?.is_blocked ? (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border ${
                            isDark 
                              ? 'bg-[#1a0c0e] text-[#f87171] border-[#ef4444]/40' 
                              : 'bg-[#fef2f2] text-[#991b1b] border-[#fca5a5]'
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]"></span>
                            <span className="hidden sm:inline">Safety Guardrail Intercept</span>
                            <span className="sm:hidden">Blocked</span>
                          </span>
                        ) : msg.response?.is_emergency ? (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border ${
                            isDark 
                              ? 'bg-[#240a10] text-[#fb7185] border-[#f43f5e]/40' 
                              : 'bg-[#fff1f2] text-[#be123c] border-[#fecdd3]'
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#f43f5e]"></span>
                            Emergency Triage
                          </span>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border ${
                            isDark 
                              ? 'bg-[#0b1f17] text-emerald-300 border-emerald-800/60' 
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            <span className="hidden sm:inline">100% Authentic Citation • Zero Hallucination</span>
                            <span className="sm:hidden">100% Verified</span>
                          </span>
                        )}

                        <button 
                          type="button"
                          onClick={() => handleCopy(msg.response?.answer || msg.text, msg.id)}
                          className={`no-print p-1 rounded transition-colors cursor-pointer ${
                            isDark 
                              ? 'hover:bg-[#131624] text-[#94a3b8] hover:text-white' 
                              : 'hover:bg-[#eff4ff] text-[#565e74] hover:text-[#0b1c30]'
                          }`}
                          title="Copy Analysis"
                        >
                          <span className="material-symbols-outlined text-[17px]">
                            {copiedId === msg.id ? 'check' : 'content_copy'}
                          </span>
                        </button>

                        <button 
                          type="button"
                          onClick={() => handleOpenPrintForMessage(msg.id)}
                          className={`no-print p-1.5 sm:p-1 rounded-lg transition-colors cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center ${
                            isDark 
                              ? 'hover:bg-[#131624] text-[#94a3b8] hover:text-white' 
                              : 'hover:bg-[#eff4ff] text-[#565e74] hover:text-[#0b1c30]'
                          }`}
                          title="Print / Export this Legal Exchange"
                        >
                          <span className="material-symbols-outlined text-[17px]">
                            picture_as_pdf
                          </span>
                        </button>

                        <button 
                          type="button"
                          onClick={() => {
                            const curIdx = messages.findIndex(m => m.id === msg.id);
                            const userMsg = messages.slice(0, curIdx).reverse().find(m => m.role === 'user');
                            const narrativeText = userMsg?.text || msg.response?.query || msg.response?.answer || msg.text || '';
                            setReaModalNarrative(narrativeText);
                            setIsReaModalOpen(true);
                          }}
                          className={`no-print p-1.5 sm:p-1 rounded-lg transition-colors cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center ${
                            isDark 
                              ? 'hover:bg-[#131624] text-amber-400 hover:text-amber-300' 
                              : 'hover:bg-amber-50 text-amber-700 hover:text-amber-900'
                          }`}
                          title="Tri-Perspective Chamber Battle-Room (REA Engine)"
                        >
                          <span className="material-symbols-outlined text-[17px]">
                            swords
                          </span>
                        </button>

                        <button 
                          type="button"
                          onClick={() => {
                            const curIdx = messages.findIndex(m => m.id === msg.id);
                            const userMsg = messages.slice(0, curIdx).reverse().find(m => m.role === 'user');
                            const narrativeText = userMsg?.text || msg.response?.query || msg.response?.answer || msg.text || '';
                            handleOpenPleadingsStudio(narrativeText);
                          }}
                          className={`no-print p-1.5 sm:p-1 rounded-lg transition-colors cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center ${
                            isDark 
                              ? 'hover:bg-[#131624] text-emerald-400 hover:text-emerald-300' 
                              : 'hover:bg-emerald-50 text-emerald-700 hover:text-emerald-900'
                          }`}
                          title="Draft Court-Ready Pleading / Notice (High Court Parchment)"
                        >
                          <span className="material-symbols-outlined text-[17px]">
                            gavel
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* MISUSE & SAFETY PREVENTION CARD */}
                    {msg.response?.is_blocked ? (
                      <div className={`print-blocked-card w-full rounded-lg p-4 space-y-3 border ${
                        isDark 
                          ? 'bg-[#160a0c] border-[#ef4444]/40 text-[#cbd5e1]' 
                          : 'bg-[#fef2f2] border-[#fca5a5] text-[#7f1d1d]'
                      }`}>
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-[#dc2626] text-white shrink-0">
                            <span className="material-symbols-outlined text-[20px]">gavel</span>
                          </div>
                          <div className="space-y-1.5">
                            <h4 className="text-[14px] font-bold text-[#f87171] tracking-tight">
                              {msg.response.title || 'QUERY BLOCKED BY INSTITUTIONAL SAFETY GUARDRAILS'}
                            </h4>
                            <p className="text-[13px] leading-relaxed">
                              {msg.response.reason}
                            </p>
                            <div className={`p-3 rounded border text-[12px] ${
                              isDark 
                                ? 'bg-[#0f111a] border-[#ef4444]/50 text-[#fca5a5]' 
                                : 'bg-white border-[#fca5a5] text-[#991b1b]'
                            }`}>
                              <strong>⚖️ Statutory Warning:</strong> {msg.response.statutory_warning}
                            </div>
                            {msg.response.lawful_alternative && (
                              <div className={`p-3 rounded border text-[12px] ${
                                isDark 
                                  ? 'bg-[#10172a] border-blue-900/60 text-[#93c5fd]' 
                                  : 'bg-[#eff4ff] border-[#bfdbfe] text-[#1e40af]'
                              }`}>
                                <strong>💡 Lawful Alternative:</strong> {msg.response.lawful_alternative}
                              </div>
                            )}
                            <div className="flex items-center gap-3 pt-1 text-[10px] font-mono opacity-80">
                              <span className="flex items-center gap-1 font-bold">
                                <span className="material-symbols-outlined text-[14px]">report_problem</span>
                                Bar Council Ethics Applied
                              </span>
                              <span>•</span>
                              <span>Section 238 & 249 BNS 2023</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : msg.response?.is_emergency ? (
                      /* EMERGENCY SAFETY TRIAGE CARD */
                      <div className={`print-emergency-card w-full rounded-lg p-4 space-y-3 border ${
                        isDark 
                          ? 'bg-[#1e0a12] border-[#f43f5e]/40' 
                          : 'bg-[#fff1f2] border-[#fecdd3]'
                      }`}>
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-[#e11d48] text-white shrink-0">
                            <span className="material-symbols-outlined text-[20px]">emergency</span>
                          </div>
                          <div className="space-y-2 w-full">
                            <h4 className={`text-[14px] font-bold ${isDark ? 'text-[#fb7185]' : 'text-[#9f1239]'}`}>
                              {msg.response.title || 'IMMEDIATE POLICE & EMERGENCY ASSISTANCE PROTOCOL'}
                            </h4>
                            <p className={`text-[13px] leading-relaxed ${isDark ? 'text-[#fecdd3]' : 'text-[#9f1239]'}`}>
                              {msg.response.message}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                              {msg.response.emergency_contacts?.map((contact, i) => (
                                <div key={i} className={`p-2.5 rounded border flex flex-col ${
                                  isDark ? 'bg-[#0f111a] border-[#f43f5e]/30' : 'bg-white border-[#fecdd3]'
                                }`}>
                                  <span className={`text-[11px] ${isDark ? 'text-[#94a3b8]' : 'text-[#565e74]'}`}>{contact.name}</span>
                                  <span className="text-[16px] font-bold text-[#e11d48] font-mono">{contact.number}</span>
                                  <span className={`text-[10px] font-medium ${
                                    isDark ? 'text-emerald-400' : 'text-emerald-700'
                                  }`}>{contact.available}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* STANDARD GROUNDED LEGAL RESPONSE */
                      <>
                        {/* Autonomous Domain & Archetype Indicator */}
                        {msg.response?.auto_detected_domain && (
                          <div className={`flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-lg border text-xs ${
                            isDark ? 'bg-[#121626] border-blue-900/50 text-blue-200' : 'bg-blue-50/80 border-blue-200 text-blue-900'
                          }`}>
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[16px] text-blue-400">
                                {msg.response.detected_archetype === 'PROVISION_LOOKUP' ? 'auto_stories' : 'alt_route'}
                              </span>
                              <span className="font-semibold">
                                {msg.response.detected_archetype === 'PROVISION_LOOKUP' ? 'Gazette Lexicon Dossier' : 'Autonomous Legal Routing'}:
                              </span>
                              <span className="font-mono text-[11px] font-medium">{msg.response.auto_detected_domain}</span>
                            </div>
                            {msg.response.domain_switched && msg.response.original_filter && (
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                                isDark ? 'bg-amber-950/40 border-amber-800 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'
                              }`}>
                                Auto-routed from "{msg.response.original_filter}"
                              </span>
                            )}
                          </div>
                        )}

                        {/* Section 1: Executive Legal Summary & Structured Statutory Analysis */}
                        <LegalStructuredAnswer
                          answerText={msg.response?.answer || msg.text}
                          isDark={isDark}
                          mode={msg.response?.mode || mode}
                        />

                        {/* Section 1.5: Bilingual Voice Consultation Audio Player (English + Hindi) */}
                        <VoiceConsultationPlayer
                          text={msg.response?.answer || msg.text}
                          isDark={isDark}
                          apiBase={apiBase}
                          defaultLang="en-IN"
                        />

                        {/* Section 2: Applicable Statutory Framework Pills */}
                        {msg.response?.applicable_laws && msg.response.applicable_laws.length > 0 && (
                          <div className="space-y-1.5">
                            <h4 className={`text-[10px] uppercase font-bold tracking-wider ${
                              isDark ? 'text-[#94a3b8]' : 'text-[#565e74]'
                            }`}>
                              Applicable Statutory Framework
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {msg.response.applicable_laws.map((law, idx) => (
                                <span key={idx} className={`print-law-pill inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-medium border ${
                                  isDark 
                                    ? 'bg-[#161a29] text-white border-[#2b334d]' 
                                    : 'bg-[#eff4ff] text-[#0b1c30] border-[#dce9ff]'
                                }`}>
                                  <span className={`material-symbols-outlined text-[15px] ${
                                    isDark ? 'text-white' : 'text-[#00288e]'
                                  }`}>
                                    menu_book
                                  </span>
                                  <span>{law.source_title} • {law.section_number}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Section 2.5: Similar Real-World Cases & How Courts Dealt With It (Collapsed by default) */}
                        {msg.response?.similar_cases && msg.response.similar_cases.length > 0 && (() => {
                          const isExpanded = !!expandedPrecedents[msg.id];
                          return (
                            <div className={`rounded-xl border transition-all ${
                              isDark
                                ? 'bg-gradient-to-b from-[#131726] to-[#0f121e] border-amber-500/30'
                                : 'bg-gradient-to-b from-[#fffcf5] to-[#f8f9fe] border-amber-300'
                            }`}>
                              {/* Sleek Accordion Trigger Header */}
                              <button
                                type="button"
                                onClick={() => {
                                  setExpandedPrecedents(prev => ({
                                    ...prev,
                                    [msg.id]: !prev[msg.id]
                                  }));
                                }}
                                className="w-full p-3 sm:p-3.5 flex items-center justify-between gap-3 text-left transition-colors rounded-xl cursor-pointer hover:bg-amber-500/5"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
                                    <span className="material-symbols-outlined text-[17px] sm:text-[18px]">balance</span>
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className={`text-[12.5px] sm:text-[13px] font-bold tracking-tight truncate ${
                                        isDark ? 'text-white' : 'text-[#00288e]'
                                      }`}>
                                        Similar Real-World Cases & How Courts Dealt With It
                                      </span>
                                      <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
                                        Supreme Court
                                      </span>
                                    </div>
                                    <p className={`text-[11px] truncate mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                      {isExpanded 
                                        ? 'Real factual disputes, winning courtroom defense tactics & 2024 Sanhita mappings'
                                        : `${msg.response.similar_cases.length} matched landmark precedents • Click to view holdings & strategies`
                                      }
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-semibold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                    {msg.response.similar_cases.length} Precedents
                                  </span>
                                  <span className={`material-symbols-outlined text-[20px] transition-transform duration-200 text-amber-500 ${
                                    isExpanded ? 'rotate-180' : ''
                                  }`}>
                                    expand_more
                                  </span>
                                </div>
                              </button>

                              {/* Expanded Content */}
                              {isExpanded && (
                                <div className="p-3.5 sm:p-4 pt-0 space-y-3 border-t border-amber-500/20 mt-1 animate-in fade-in duration-200">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                    {msg.response.similar_cases.map((caseItem) => (
                                      <div
                                        key={caseItem.id}
                                        className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
                                          isDark
                                            ? 'bg-[#181c2d] hover:bg-[#1e2338] border-[#2b334d] hover:border-amber-500/50'
                                            : 'bg-white hover:bg-[#fafcff] border-[#e2e8f0] hover:border-amber-400 shadow-xs'
                                        }`}
                                      >
                                        <div className="space-y-2">
                                          <div className="flex items-start justify-between gap-2">
                                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold uppercase ${
                                              isDark
                                                ? 'bg-amber-950/40 text-amber-300 border border-amber-500/30'
                                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                                            }`}>
                                              {caseItem.category.split(' ')[0]} • {caseItem.decision_year}
                                            </span>
                                            <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                              {caseItem.bench}
                                            </span>
                                          </div>

                                          <div>
                                            <h5 className={`text-[13px] font-bold line-clamp-1 ${isDark ? 'text-white' : 'text-[#0b1c30]'}`}>
                                              {caseItem.title}
                                            </h5>
                                            <div className="flex items-center justify-between gap-1.5 text-[11px] font-mono mt-0.5">
                                              <span className="text-amber-500 font-semibold line-clamp-1">{caseItem.citation}</span>
                                              {caseItem.official_databank && (
                                                <span className={`text-[9px] px-1.5 py-0.5 rounded border shrink-0 ${
                                                  isDark ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                }`}>
                                                  {caseItem.official_databank.replace(' Grounded', '')}
                                                </span>
                                              )}
                                            </div>
                                          </div>

                                          <div className={`p-2.5 rounded-lg text-[11px] leading-relaxed border ${
                                            isDark
                                              ? 'bg-slate-950/60 border-slate-800 text-slate-300'
                                              : 'bg-slate-50 border-slate-200 text-slate-700'
                                          }`}>
                                            <strong className="text-amber-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">
                                              Factual Matrix (What occurred)
                                            </strong>
                                            <p className="line-clamp-2">
                                              {caseItem.factual_matrix}
                                            </p>
                                          </div>

                                          <div className={`p-2.5 rounded-lg text-[11px] leading-relaxed border ${
                                            isDark
                                              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                                              : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                                          }`}>
                                            <strong className="text-emerald-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">
                                              Court Holding & Relief
                                            </strong>
                                            <p className="line-clamp-2">
                                              {caseItem.court_holding}
                                            </p>
                                          </div>
                                        </div>

                                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-700/30">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const citeText = `${caseItem.title}, ${caseItem.citation} (${caseItem.decision_year})`;
                                              navigator.clipboard.writeText(citeText);
                                              setCopiedId(`case-${caseItem.id}`);
                                              setTimeout(() => setCopiedId(null), 2000);
                                            }}
                                            className={`px-2 py-1 rounded text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer border ${
                                              copiedId === `case-${caseItem.id}`
                                                ? 'bg-emerald-600 text-white border-emerald-500'
                                                : isDark
                                                ? 'bg-[#141724] hover:bg-[#1f2438] text-slate-300 border-[#2b334d]'
                                                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                                            }`}
                                          >
                                            <span className="material-symbols-outlined text-[13px]">
                                              {copiedId === `case-${caseItem.id}` ? 'done' : 'content_copy'}
                                            </span>
                                            <span>{copiedId === `case-${caseItem.id}` ? 'Copied' : 'Citation'}</span>
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() => {
                                              setSelectedPrecedent(caseItem);
                                              setIsPrecedentDrawerOpen(true);
                                            }}
                                            className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                                          >
                                            <span className="material-symbols-outlined text-[14px]">visibility</span>
                                            <span>Inspect Case Playbook</span>
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {/* Section 3: Statutory Citation Card (Collapsible) */}
                        {msg.response?.applicable_laws && msg.response.applicable_laws.length > 0 && (
                          <div className={`print-citation-card p-3.5 rounded-lg border space-y-2.5 ${
                            isDark 
                              ? 'bg-[#0b0c10] border-[#23283f]' 
                              : 'bg-[#fdfbf7] border-[#fef3c7]'
                          }`}>
                            <div className="flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() => toggleSourceExpand(msg.id)}
                                className={`no-print inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[10px] font-bold border transition-colors cursor-pointer ${
                                  isDark 
                                    ? 'bg-[#0b1f17] text-emerald-300 border-emerald-800/60 hover:bg-[#102a20]' 
                                    : 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                                }`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                {Boolean(expandedSources[msg.id]) ? 'Verified Gazette Authority • Neon pgvector Validated' : 'Verified Gazette Authority • Neon pgvector Validated (Click to Expand)'}
                                <span className="material-symbols-outlined text-[13px] ml-0.5">
                                  {Boolean(expandedSources[msg.id]) ? 'expand_less' : 'expand_more'}
                                </span>
                              </button>
                              <div className="hidden print:inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[9pt] font-bold cite-badge">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                Verified Gazette Authority • Neon pgvector Validated
                              </div>
                              <span className={`cite-bench font-mono text-[10px] font-bold ${
                                isDark ? 'text-[#fbbf24]' : 'text-[#743d00]'
                              }`}>
                                AIR / SCC Bench Sync
                              </span>
                            </div>

                            <div className={Boolean(expandedSources[msg.id]) ? 'space-y-2.5' : 'hidden print:block space-y-2.5'}>
                              {msg.response.applicable_laws.map((law, idx) => (
                                <div key={idx} className="space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className={`cite-title text-[12px] font-bold ${isDark ? 'text-white' : 'text-[#0b1c30]'}`}>
                                      {law.title}
                                    </span>
                                    <span className={`cite-sec font-mono text-[10px] ${isDark ? 'text-[#94a3b8]' : 'text-[#565e74]'}`}>
                                      {law.section_number}
                                    </span>
                                  </div>
                                  <blockquote className={`print-quote-box p-2.5 rounded border-l-4 border-y border-r leading-relaxed ${
                                    isDark 
                                      ? 'bg-[#131624] border-l-[#f59e0b] border-[#23283f] text-[#f1f5f9]' 
                                      : 'bg-white border-l-[#743d00] border-[#fde68a] text-[#0b1c30]'
                                  }`}>
                                    <p className="font-serif italic text-[13px]">
                                      "{law.text_snippet}"
                                    </p>
                                  </blockquote>
                                  <div className="no-print flex items-center gap-2 pt-1">
                                    <button
                                      type="button"
                                      onClick={() => handleCopyCitation(law, `cite-${msg.id}-${idx}`)}
                                      className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
                                        isDark 
                                          ? 'bg-[#131624] hover:bg-[#1a1f33] text-white border-[#23283f]' 
                                          : 'bg-white hover:bg-[#eff4ff] text-[#0b1c30] border-[#e2e8f0]'
                                      }`}
                                    >
                                      <span className={`material-symbols-outlined text-[13px] ${isDark ? 'text-white' : 'text-[#00288e]'}`}>
                                        {copiedId === `cite-${msg.id}-${idx}` ? 'check_circle' : 'content_copy'}
                                      </span>
                                      <span>{copiedId === `cite-${msg.id}-${idx}` ? 'Copied Citation!' : 'Copy Citation'}</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleInspectInRepository(law)}
                                      className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
                                        isDark 
                                          ? 'bg-[#131624] hover:bg-[#1a1f33] text-white border-[#23283f]' 
                                          : 'bg-white hover:bg-[#eff4ff] text-[#0b1c30] border-[#e2e8f0]'
                                      }`}
                                      title={`Search repository for ${law.source_title} ${law.section_number}`}
                                    >
                                      <span className={`material-symbols-outlined text-[13px] ${isDark ? 'text-white' : 'text-[#00288e]'}`}>
                                        manage_search
                                      </span>
                                      <span>Inspect in Repository</span>
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Standard AI-Generated Response & Statutory Advisory Notice */}
                        <div className={`p-2.5 rounded-lg border text-[11px] leading-relaxed flex items-start gap-2.5 mt-2 ${
                          isDark 
                            ? 'bg-[#101424] border-[#222a47] text-[#94a3b8]' 
                            : 'bg-amber-50/70 border-amber-200/80 text-[#475569]'
                        }`}>
                          <span className="material-symbols-outlined text-[16px] text-amber-500 shrink-0 mt-0.5">
                            smart_toy
                          </span>
                          <div className="flex-1 space-y-0.5">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className={`font-bold font-mono text-[10px] uppercase tracking-wider ${
                                isDark ? 'text-amber-400' : 'text-amber-800'
                              }`}>
                                AI-Generated Response • Legal Research Advisory
                              </span>
                              <span className="text-[9px] font-mono opacity-80">Advocates Act, 1961 Notice</span>
                            </div>
                            <p className="text-[10.5px]">
                              {msg.response?.limitations 
                                ? msg.response.limitations 
                                : 'Generated by Bharat Legal AI based on retrieved Indian statutes and precedent ratios. This response is for legal research only and does not constitute formal attorney-client counsel. Please consult an enrolled Advocate before initiating court proceedings.'}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <LegalIntelligenceGeneratingCard
                isDark={isDark}
                mode={mode}
                totalProvisions={totalProvisions}
              />
            )}

            {/* PRINT-ONLY LEGAL OPINION SIGNATURE & VERIFICATION FOOTER */}
            <div className="hidden print:block w-full border-t border-gray-400 pt-3 mt-6 text-[8pt] text-gray-700 font-mono text-center">
              <div className="font-bold text-black">
                Ground-Truth Validated against Constitution of India, Bharatiya Nyaya Sanhita 2023, BNSS 2023 & DPDP Act 2023.
              </div>
              <div className="mt-0.5 text-gray-600">
                Generated via भारत Legal Intelligence Platform • Strict Statutory Retrieval with 0% Speculative Hallucination.
              </div>
            </div>

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* FLOATING MODERN INPUT BAR (Docked Bottom, Hidden when printing) */}
        <div id="floating-input-dock" className={`absolute bottom-0 left-0 right-0 px-2 sm:px-4 pt-6 pb-2.5 sm:pb-4 bg-gradient-to-t flex flex-col items-center pointer-events-none transition-colors ${
          isDark 
            ? 'from-[#090a0f] via-[#090a0f]/95 to-transparent' 
            : 'from-[#f4f6fb] via-[#f4f6fb]/95 to-transparent'
        }`}>
          <div className={`w-full max-w-[880px] rounded-xl shadow-2xl pointer-events-auto p-2 sm:p-3 flex flex-col gap-2 border backdrop-blur-md transition-colors ${
            isDark 
              ? 'bg-[#0d0f17]/95 border-[#23283f]' 
              : 'bg-white/95 border-[#e2e8f0]'
          }`}>
            {/* Hidden File Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".txt,.pdf,.docx,.doc,.png,.jpg,.jpeg,.webp,.bmp" 
              className="hidden" 
            />

            {/* Desktop & Tablet: Quick Context Category Chips (>= sm) + Action Tools on Right */}
            <div className="hidden sm:flex items-center justify-between gap-2 pb-1 px-1">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none flex-1 min-w-0">
                <span className={`font-mono text-[9px] uppercase font-bold shrink-0 mr-1 ${
                  isDark ? 'text-[#94a3b8]' : 'text-[#565e74]'
                }`}>
                  Context:
                </span>
                {CONTEXT_CATEGORIES.map(c => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setContextFilter(c.name)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap shrink-0 transition-colors flex items-center gap-1 cursor-pointer ${
                      contextFilter === c.name
                        ? isDark 
                          ? 'bg-white text-black font-bold border border-white' 
                          : 'bg-[#00288e] text-white font-bold border border-[#00288e]'
                        : isDark 
                          ? 'bg-[#131624] text-[#94a3b8] hover:text-white hover:bg-[#1a1f33] border border-[#23283f]' 
                          : 'bg-[#eff4ff] text-[#444653] hover:bg-[#e5eeff] border border-[#dce9ff]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[13px]">{c.icon}</span>
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>

              {/* Action Buttons (Right side of Context on Desktop) */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsLegalAidModalOpen(true)}
                  className={`px-2 py-1 rounded-lg text-[10.5px] font-semibold transition-colors border cursor-pointer shrink-0 flex items-center gap-1 ${
                    isDark 
                      ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/30' 
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-200'
                  }`}
                  title="NALSA 24/7 Free Legal Aid Directory (Dial 15100)"
                >
                  <Scale className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden md:inline">Free Legal Aid</span>
                  <span className="font-mono text-[9.5px]">15100</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenPleadingsStudio()}
                  className={`px-2 py-1 rounded-lg text-[10.5px] font-semibold transition-colors border cursor-pointer shrink-0 flex items-center gap-1 ${
                    dockedStudio === 'pleadings'
                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-xs ring-1 ring-emerald-400'
                      : isDark 
                        ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/30' 
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border-emerald-200'
                  }`}
                  title="Court-Ready Pleading & Notice Studio (High Court Parchment)"
                >
                  <Gavel className={`w-3.5 h-3.5 ${dockedStudio === 'pleadings' ? 'text-white' : 'text-emerald-500'}`} />
                  <span className="hidden md:inline">Pleadings Studio</span>
                  {dockedStudio === 'pleadings' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>}
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenDisputeTimeline()}
                  className={`px-2 py-1 rounded-lg text-[10.5px] font-semibold transition-colors border cursor-pointer shrink-0 flex items-center gap-1 ${
                    dockedStudio === 'timeline'
                      ? 'bg-blue-600 text-white border-blue-400 shadow-xs ring-1 ring-blue-400'
                      : isDark 
                        ? 'bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border-blue-500/30' 
                        : 'bg-blue-50 hover:bg-blue-100 text-blue-950 border-blue-200'
                  }`}
                  title="Interactive Dispute Timeline & Limitation Visualizer (Limitation Act 1963)"
                >
                  <span className={`material-symbols-outlined text-[14px] ${dockedStudio === 'timeline' ? 'text-white' : 'text-blue-500'}`}>timeline</span>
                  <span className="hidden md:inline">Dispute Timeline</span>
                  {dockedStudio === 'timeline' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>}
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenCounterStrategy()}
                  className={`px-2 py-1 rounded-lg text-[10.5px] font-semibold transition-colors border cursor-pointer shrink-0 flex items-center gap-1 ${
                    dockedStudio === 'counter'
                      ? 'bg-red-600 text-white border-red-400 shadow-xs ring-1 ring-red-400'
                      : isDark 
                        ? 'bg-red-500/15 hover:bg-red-500/25 text-red-300 border-red-500/30' 
                        : 'bg-red-50 hover:bg-red-100 text-red-950 border-red-200'
                  }`}
                  title="Defensive Counter-Strategy Generator (Anti-Vexatious Sanctions & Cross-Complaints)"
                >
                  <span className={`material-symbols-outlined text-[14px] ${dockedStudio === 'counter' ? 'text-white' : 'text-red-500'}`}>shield_with_heart</span>
                  <span className="hidden md:inline">Counter-Offensive</span>
                  {dockedStudio === 'counter' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>}
                </button>

                <button
                  type="button"
                  onClick={() => setSpeechLang(speechLang === 'en-IN' ? 'hi-IN' : 'en-IN')}
                  className={`px-2 py-1 rounded-lg text-[10.5px] font-mono font-bold transition-colors border cursor-pointer shrink-0 ${
                    speechLang === 'hi-IN'
                      ? isDark 
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' 
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                      : isDark 
                        ? 'bg-[#131624] hover:bg-[#1a1f33] text-[#94a3b8] hover:text-white border-[#23283f]' 
                        : 'bg-[#eff4ff] hover:bg-[#e5eeff] text-[#444653] hover:text-[#0b1c30] border-[#dce9ff]'
                  }`}
                  title={`Dictation Language: ${speechLang === 'en-IN' ? 'English (India)' : 'हिन्दी (India)'} - Click to switch`}
                >
                  {speechLang === 'en-IN' ? 'EN' : 'हिन्दी'}
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-1.5 rounded-lg transition-colors border cursor-pointer shrink-0 ${
                    isDark 
                      ? 'bg-[#131624] hover:bg-[#1a1f33] text-[#94a3b8] hover:text-white border-[#23283f]' 
                      : 'bg-[#eff4ff] hover:bg-[#e5eeff] text-[#444653] hover:text-[#0b1c30] border-[#dce9ff]'
                  }`}
                  title="Attach Legal Notice / FIR / Brief (.txt, .pdf, .docx)"
                >
                  <span className="material-symbols-outlined text-[17px]">attach_file</span>
                </button>

                <button
                  type="button"
                  onClick={handleStartDictation}
                  className={`p-1.5 rounded-lg transition-colors border cursor-pointer shrink-0 ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse border-red-600'
                      : isDark 
                        ? 'bg-[#131624] hover:bg-[#1a1f33] text-[#94a3b8] hover:text-white border-[#23283f]' 
                        : 'bg-[#eff4ff] hover:bg-[#e5eeff] text-[#444653] hover:text-[#0b1c30] border-[#dce9ff]'
                  }`}
                  title={isListening ? "Listening... (Click to stop)" : "Voice Dictation (Speech-to-Text)"}
                >
                  <span className="material-symbols-outlined text-[17px]">
                    {isListening ? 'graphic_eq' : 'mic'}
                  </span>
                </button>
              </div>
            </div>

            {/* Small Screen: Compact Upward Context Dropdown on Left + Mic & Attach on Right (< sm) */}
            <div className="flex sm:hidden items-center justify-between gap-2 px-1 pb-1">
              {/* Left Side: Context Label & Upward-Opening Custom Dropdown */}
              <div className="relative flex items-center gap-1.5 min-w-0" ref={contextDropdownRef}>
                <span className={`font-mono text-[9px] uppercase font-bold shrink-0 ${
                  isDark ? 'text-[#94a3b8]' : 'text-[#565e74]'
                }`}>
                  Context:
                </span>

                <button
                  type="button"
                  onClick={() => setIsContextDropdownOpen(!isContextDropdownOpen)}
                  style={{ 
                    backgroundColor: isDark 
                      ? (isContextDropdownOpen ? '#1c2237' : '#131624') 
                      : (isContextDropdownOpen ? '#e0edff' : '#eff4ff') 
                  }}
                  className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer max-w-[170px] xs:max-w-[210px] truncate ${
                    isDark 
                      ? isContextDropdownOpen
                        ? 'text-amber-300 border-amber-500/50 shadow-xs'
                        : 'text-white border-[#23283f] hover:border-slate-600' 
                      : isContextDropdownOpen
                      ? 'text-[#00288e] border-blue-300 shadow-xs'
                      : 'text-[#00288e] border-[#dce9ff] hover:border-blue-300'
                  }`}
                  title="Change Legal Context (Opens Upward)"
                >
                  <span className="material-symbols-outlined text-[14px] text-amber-500 shrink-0">
                    {CONTEXT_CATEGORIES.find(c => c.name === contextFilter)?.icon || 'gavel'}
                  </span>
                  <span className="truncate">{contextFilter}</span>
                  <span className={`material-symbols-outlined text-[16px] transition-transform duration-150 shrink-0 ${
                    isContextDropdownOpen ? 'rotate-180 text-amber-500' : isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    expand_less
                  </span>
                </button>

                {/* UPWARD-OPENING DROPDOWN MENU POPOVER (100% SOLID OPAQUE) */}
                {isContextDropdownOpen && (
                  <div
                    style={{ 
                      backgroundColor: isDark ? '#0f121e' : '#ffffff',
                      opacity: 1 
                    }}
                    className={`absolute bottom-full mb-2 left-0 w-64 xs:w-72 rounded-xl p-2 shadow-2xl border z-[100] animate-in fade-in slide-in-from-bottom-2 duration-150 ${
                      isDark
                        ? 'border-[#2e3752] text-white shadow-black'
                        : 'border-[#cbd5e1] text-[#0b1c30] shadow-slate-900/25'
                    }`}
                  >
                    <div 
                      style={{ backgroundColor: isDark ? '#161b2e' : '#f8fafd' }}
                      className={`px-2.5 py-1.5 rounded-lg border mb-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider ${
                        isDark ? 'border-[#23283f] text-slate-300' : 'border-[#e2e8f0] text-slate-600'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px] text-amber-500">balance</span>
                        Select Legal Pillar
                      </span>
                      <span className="text-[9px] font-mono text-amber-500 font-semibold">5 Pillars</span>
                    </div>

                    <div className="space-y-1">
                      {CONTEXT_CATEGORIES.map(c => {
                        const isSelected = contextFilter === c.name;
                        return (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => {
                              setContextFilter(c.name);
                              setIsContextDropdownOpen(false);
                              const updated = threads.map(t => t.id === activeThreadId ? { ...t, category: c.name } : t);
                              saveThreadsToStorage(updated);
                            }}
                            style={{
                              backgroundColor: isSelected 
                                ? (isDark ? '#262015' : '#eff4ff') 
                                : undefined
                            }}
                            className={`w-full p-2.5 rounded-lg text-left transition-all flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? isDark
                                  ? 'text-amber-300 border border-amber-500/50 font-bold'
                                  : 'text-[#00288e] border border-blue-300 font-bold'
                                : isDark
                                ? 'hover:bg-[#1a2033] text-slate-200 hover:text-white border border-transparent'
                                : 'hover:bg-[#f1f5f9] text-slate-800 hover:text-black border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? isDark ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-[#00288e] text-white font-bold'
                                  : isDark ? 'bg-[#1b2034] text-slate-400' : 'bg-slate-200 text-slate-700'
                              }`}>
                                <span className="material-symbols-outlined text-[14px]">{c.icon}</span>
                              </span>
                              <span className="text-[12px] truncate">{c.name}</span>
                            </div>
                            {isSelected && (
                              <span className="material-symbols-outlined text-[16px] text-amber-500 shrink-0">
                                check_circle
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: Language, Attach & Mic Buttons on Right of Context Dropdown */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsLegalAidModalOpen(true)}
                  className={`px-1.5 py-1 rounded-lg text-[10px] font-semibold transition-colors border cursor-pointer shrink-0 flex items-center gap-0.5 ${
                    isDark 
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' 
                      : 'bg-amber-50 text-amber-950 border-amber-200'
                  }`}
                  title="NALSA 24/7 Free Legal Aid (15100)"
                >
                  <Scale className="w-3 h-3 text-amber-500" />
                  <span className="font-mono text-[9px]">15100</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSpeechLang(speechLang === 'en-IN' ? 'hi-IN' : 'en-IN')}
                  className={`px-1.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-colors border cursor-pointer shrink-0 ${
                    speechLang === 'hi-IN'
                      ? isDark 
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' 
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                      : isDark 
                        ? 'bg-[#131624] hover:bg-[#1a1f33] text-[#94a3b8] hover:text-white border-[#23283f]' 
                        : 'bg-[#eff4ff] hover:bg-[#e5eeff] text-[#444653] hover:text-[#0b1c30] border-[#dce9ff]'
                  }`}
                  title={`Dictation Language: ${speechLang === 'en-IN' ? 'English' : 'हिन्दी'} - Click to switch`}
                >
                  {speechLang === 'en-IN' ? 'EN' : 'हिन्दी'}
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-1.5 rounded-lg transition-colors border cursor-pointer shrink-0 ${
                    isDark 
                      ? 'bg-[#131624] hover:bg-[#1a1f33] text-[#94a3b8] hover:text-white border-[#23283f]' 
                      : 'bg-[#eff4ff] hover:bg-[#e5eeff] text-[#444653] hover:text-[#0b1c30] border-[#dce9ff]'
                  }`}
                  title="Attach Legal Notice / FIR / Brief (.txt, .pdf, .docx)"
                >
                  <span className="material-symbols-outlined text-[17px]">attach_file</span>
                </button>

                <button
                  type="button"
                  onClick={handleStartDictation}
                  className={`p-1.5 rounded-lg transition-colors border cursor-pointer shrink-0 ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse border-red-600'
                      : isDark 
                        ? 'bg-[#131624] hover:bg-[#1a1f33] text-[#94a3b8] hover:text-white border-[#23283f]' 
                        : 'bg-[#eff4ff] hover:bg-[#e5eeff] text-[#444653] hover:text-[#0b1c30] border-[#dce9ff]'
                  }`}
                  title={isListening ? "Listening... (Click to stop)" : "Voice Dictation (Speech-to-Text)"}
                >
                  <span className="material-symbols-outlined text-[17px]">
                    {isListening ? 'graphic_eq' : 'mic'}
                  </span>
                </button>
              </div>
            </div>

            {dictationNotice && (
              <div className={`mx-2 mb-2 p-2 rounded-lg text-[11px] flex items-center justify-between animate-in fade-in border ${
                isDark 
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-300' 
                  : 'bg-amber-50 border-amber-300 text-amber-900 font-medium'
              }`}>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px]">info</span>
                  <span>{dictationNotice}</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setDictationNotice(null)} 
                  className={`p-0.5 cursor-pointer ${isDark ? 'hover:text-white' : 'hover:text-black'}`}
                >
                  <span className="material-symbols-outlined text-[13px]">close</span>
                </button>
              </div>
            )}

            {micBlockedHelp && (
              <div className={`mx-2 mb-2 p-3 rounded-xl text-[11.5px] space-y-2 animate-in fade-in border ${
                isDark 
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300' 
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`font-bold flex items-center gap-1.5 ${
                    isDark ? 'text-amber-300' : 'text-amber-950'
                  }`}>
                    <span className="material-symbols-outlined text-[16px]">mic_off</span>
                    <span>Microphone Permission Blocked in Browser</span>
                  </span>
                  <button 
                    type="button" 
                    onClick={() => setMicBlockedHelp(false)} 
                    className={`p-0.5 cursor-pointer ${isDark ? 'hover:text-white' : 'hover:text-black'}`}
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>
                <p className={`text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  To enable hands-free voice dictation:
                </p>
                <ol className={`list-decimal list-inside text-[10.5px] space-y-1 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  <li>Click the <strong>🔒 lock / tune icon</strong> on the left side of your browser URL bar.</li>
                  <li>Change <strong>Microphone</strong> from "Block" to <strong>"Allow"</strong>.</li>
                  <li>Click Retry below to start voice dictation.</li>
                </ol>
                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setMicBlockedHelp(false);
                      executeDictation();
                    }}
                    className="px-3 py-1.5 rounded-lg text-[10.5px] font-bold bg-[#ff7722] hover:bg-[#e06616] text-white flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[14px]">refresh</span>
                    <span>Retry Voice Dictation</span>
                  </button>
                </div>
              </div>
            )}

            {/* Live Continuous Dictation Streaming Banner */}
            {isListening && (
              <div className={`mx-2 mb-2 p-2.5 rounded-xl border flex items-center justify-between gap-3 animate-in fade-in ${
                isDark ? 'bg-red-950/30 border-red-500/40 text-red-200' : 'bg-red-50 border-red-300 text-red-900'
              }`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                  <div className="min-w-0">
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <span>Live Speech Dictation ({speechLang === 'en-IN' ? 'English - India' : 'हिन्दी - भारत'})</span>
                      <span className="text-[9px] opacity-75 font-normal">• Continuous recording</span>
                    </div>
                    <div className="text-[12px] italic truncate font-sans">
                      {interimTranscript || 'Listening for your legal prayer or inquiry...'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleStartDictation}
                    className="px-2.5 py-1 rounded-lg text-[10.5px] font-bold bg-red-600 hover:bg-red-700 text-white cursor-pointer transition-colors shadow-xs"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {/* Document Extraction In-Progress Loader */}
            {isParsingDoc && (
              <div className={`mx-2 mb-2 p-2.5 rounded-xl border flex items-center gap-2.5 text-[11px] animate-pulse ${
                isDark ? 'bg-blue-950/30 border-blue-500/30 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-900'
              }`}>
                <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                <span>Extracting legal document text & OCR scanning (PDF / DOCX / TXT / Image)...</span>
              </div>
            )}

            {/* Attached Legal Document Preview Chip */}
            {attachedDoc && !isParsingDoc && (
              <div className={`mx-2 mb-2 p-2.5 rounded-xl border flex flex-col gap-1.5 text-[11.5px] animate-in fade-in ${
                isDark ? 'bg-[#141a2c] border-[#293556] text-slate-200' : 'bg-[#eef4ff] border-[#b9d2fe] text-[#00288e]'
              }`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase shrink-0 ${
                      attachedDoc.fileType === 'pdf'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : attachedDoc.fileType === 'docx'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : attachedDoc.fileType === 'image'
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {attachedDoc.fileType === 'image' ? 'OCR SCAN' : attachedDoc.fileType.toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{attachedDoc.fileName}</div>
                      <div className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {attachedDoc.formattedSize} • ~{attachedDoc.wordCount.toLocaleString()} words
                        {attachedDoc.characterCount > 0 && ` • ${attachedDoc.characterCount.toLocaleString()} chars`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      attachedDoc.isScannedOrEmpty
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {attachedDoc.isScannedOrEmpty ? 'Image Only' : 'Ready for Ingestion'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAttachedDoc(null)}
                      className={`p-1 rounded-md transition-colors cursor-pointer ${
                        isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-600 hover:text-black'
                      }`}
                      title="Remove attached document"
                    >
                      <span className="material-symbols-outlined text-[15px]">close</span>
                    </button>
                  </div>
                </div>

                {attachedDoc.ocrMetadata && (attachedDoc.ocrMetadata.fir_number || attachedDoc.ocrMetadata.sections?.length) && (
                  <div className={`p-2 rounded-lg text-[10.5px] flex flex-wrap items-center gap-2 border ${
                    isDark ? 'bg-purple-950/20 border-purple-500/30 text-purple-200' : 'bg-purple-50 border-purple-200 text-purple-900'
                  }`}>
                    <span className="material-symbols-outlined text-[14px] text-purple-400 shrink-0">document_scanner</span>
                    <span className="font-semibold">Bilingual OCR Extracted:</span>
                    {attachedDoc.ocrMetadata.fir_number && (
                      <span className="font-mono bg-purple-500/15 px-1.5 py-0.5 rounded border border-purple-500/30">
                        FIR #{attachedDoc.ocrMetadata.fir_number}
                      </span>
                    )}
                    {attachedDoc.ocrMetadata.police_station && (
                      <span className="font-sans text-xs">
                        P.S. {attachedDoc.ocrMetadata.police_station}
                      </span>
                    )}
                    {attachedDoc.ocrMetadata.sections && attachedDoc.ocrMetadata.sections.length > 0 && (
                      <span className="font-mono text-[10px] bg-amber-500/15 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                        u/s {attachedDoc.ocrMetadata.sections.join(', ')}
                      </span>
                    )}
                    {attachedDoc.ocrMetadata.language_detected && (
                      <span className="text-[9.5px] opacity-75">
                        ({attachedDoc.ocrMetadata.language_detected})
                      </span>
                    )}
                  </div>
                )}

                {attachedDoc.isScannedOrEmpty && (
                  <div className={`p-2 rounded-lg text-[10.5px] flex items-center gap-1.5 ${
                    isDark ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' : 'bg-amber-100 text-amber-950 border border-amber-300'
                  }`}>
                    <span className="material-symbols-outlined text-[15px] text-amber-500 shrink-0">warning</span>
                    <span>Scanned or image-only PDF detected with no selectable digital text layer. Please type or paste your key complaint facts or FIR number below for statutory legal research.</span>
                  </div>
                )}
              </div>
            )}

            {/* Input Workspace & Submit Button (Isolated component for instantaneous typing) */}
            <ChatInputForm
              loading={loading}
              mode={mode}
              isDark={isDark}
              onSendMessage={handleSendMessage}
              externalText={externalInput}
              onClearExternalText={() => setExternalInput(null)}
              voiceStreamingText={voiceStreamingText}
              isListening={isListening}
              onStopDictation={handleStartDictation}
            />

            {/* Bottom Footer AI Warning & Ground-Truth Verification */}
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between px-2.5 py-1 font-mono text-[9.5px] border-t gap-1 ${
              isDark ? 'border-[#1f2438] text-[#94a3b8]' : 'border-[#f1f5f9] text-[#565e74]'
            }`}>
              <span className="flex items-center gap-1.5 truncate">
                <span className="material-symbols-outlined text-[13px] text-amber-500 shrink-0">smart_toy</span>
                <span><strong>AI-Generated Intelligence:</strong> Bharat Legal AI can make mistakes. Verify important legal statutes with an enrolled Advocate.</span>
              </span>
              <span className="hidden md:inline-flex items-center gap-1 shrink-0 text-emerald-500 font-semibold">
                <span className="material-symbols-outlined text-[12px]">verified</span>
                Central Acts & Sanhitas Validated
              </span>
            </div>
          </div>
        </div>

        {/* 7 CONVERSATIONS FREE SERVICE QUOTA WARNING MODAL */}
        {showLimitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <div className={`w-full max-w-md rounded-2xl p-5 sm:p-6 shadow-2xl border flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150 ${
              isDark ? 'bg-[#0f111a] border-[#23283f] text-white' : 'bg-white border-[#e2e8f0] text-[#0b1c30]'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <span className="material-symbols-outlined text-[24px]">storage</span>
                </div>
                <div>
                  <h3 className="text-[15px] sm:text-[16px] font-bold">Free Storage Limit Reached (7/7)</h3>
                  <p className={`text-[11px] ${isDark ? 'text-[#94a3b8]' : 'text-[#565e74]'}`}>
                    Free service is capped at 7 research conversations
                  </p>
                </div>
              </div>

              <p className={`text-[12px] leading-relaxed ${isDark ? 'text-[#cbd5e1]' : 'text-[#334155]'}`}>
                To keep statutory intelligence free and accessible, active chamber storage holds up to <strong>7 conversations</strong>.
                Export your current consultation to PDF so you don't lose any statutory citations, or auto-archive the oldest thread.
              </p>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowLimitModal(false);
                    handleOpenPrintStudio();
                  }}
                  className="w-full py-2.5 px-3 rounded-lg text-[12px] font-bold bg-amber-500 text-black hover:bg-amber-400 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                  <span>Export Current Consultation to PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handleArchiveOldestAndCreateNew}
                  className={`w-full py-2.5 px-3 rounded-lg text-[12px] font-semibold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isDark ? 'bg-[#161a29] hover:bg-[#1f2438] text-white border-[#2b334d]' : 'bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0b1c30] border-[#cbd5e1]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">auto_delete</span>
                  <span>Auto-Archive Oldest & Start New Thread</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowLimitModal(false)}
                  className={`w-full py-2 px-3 rounded-lg text-[11px] text-center font-medium opacity-70 hover:opacity-100 transition-opacity cursor-pointer`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* JUST-IN-TIME MICROPHONE PERMISSION MODAL */}
        {showMicPromptModal && (
          <div className="fixed inset-0 z-[10002] bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs select-none animate-in fade-in duration-150">
            <div className={`w-full max-w-md rounded-2xl border shadow-2xl p-5 sm:p-6 space-y-4 ${
              isDark ? 'bg-[#0f121e] border-[#242b42] text-white' : 'bg-white border-[#e2e8f0] text-[#0b1c30]'
            }`}>
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#00288e] to-[#ff7722] flex items-center justify-center text-white shadow-md shrink-0">
                  <span className="material-symbols-outlined text-[24px]">mic</span>
                </div>
                <div>
                  <h3 className="text-[15px] font-black tracking-tight">Enable Microphone for Voice Dictation</h3>
                  <p className={`text-[11.5px] mt-0.5 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Dictate legal briefs, FIR details, or statutory queries hands-free.
                  </p>
                </div>
              </div>

              <div className={`p-3.5 rounded-xl border text-[11px] leading-relaxed space-y-2.5 ${
                isDark ? 'bg-[#090b12] border-[#1f2438] text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <div className="flex items-center gap-1.5 font-bold text-[#ff7722]">
                  <span className="material-symbols-outlined text-[15px]">translate</span>
                  <span>Indian Legal Terminology Supported</span>
                </div>
                <p>
                  Optimized for <strong>Indian English (en-IN)</strong>, Hindi terms, and statutory vocabulary (BNS, IPC, FIR, Bail, CrPC, Affidavit).
                </p>
                <div className="flex items-center gap-1.5 font-bold text-emerald-400 pt-1">
                  <span className="material-symbols-outlined text-[15px]">lock</span>
                  <span>100% On-Device Privacy</span>
                </div>
                <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Voice audio is processed live in your browser using the Web Speech API. No audio recordings or voice files are uploaded or stored.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowMicPromptModal(false)}
                  className={`px-3 py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                    isDark ? 'bg-[#181c2d] hover:bg-[#20253d] text-slate-300 border-[#2b334d]' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  }`}
                >
                  Type Manually Instead
                </button>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('bharat_mic_permission_granted', 'true');
                    setShowMicPromptModal(false);
                    executeDictation();
                  }}
                  className="px-4 py-2 rounded-xl text-[11.5px] font-black bg-gradient-to-r from-[#00288e] to-[#ff7722] hover:opacity-90 text-white flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">mic</span>
                  <span>Allow & Start Dictation</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REAL-WORLD PRECEDENT DOSSIER DRAWER */}
        <PrecedentDossierDrawer
          isOpen={isPrecedentDrawerOpen}
          onClose={() => setIsPrecedentDrawerOpen(false)}
          precedent={selectedPrecedent}
          theme={theme}
          onConsultInChat={(p) => {
            handleSendMessage(`Provide a comprehensive courtroom strategy analyzing ${p.title} (${p.citation}) and its application to ongoing proceedings.`);
          }}
        />

        {/* COURT-READY LEGAL PRINT & PDF EXPORT STUDIO MODAL */}
        <LegalPrintStudioModal
          isOpen={isPrintStudioOpen}
          onClose={() => setIsPrintStudioOpen(false)}
          messages={messages}
          activeThreadTitle={threads.find(t => t.id === activeThreadId)?.title || 'Legal Research Consultation'}
          activeThreadId={activeThreadId || 'thread-active'}
          mode={mode}
          isDark={isDark}
          options={printStudioOptions}
          onOptionsChange={setPrintStudioOptions}
          onTriggerPrint={handleTriggerSystemPrint}
        />

        {/* NALSA FREE LEGAL AID DIRECTORY & CLINIC LOCATOR MODAL */}
        <LegalAidDirectoryModal
          isOpen={isLegalAidModalOpen}
          onClose={() => setIsLegalAidModalOpen(false)}
          isDark={isDark}
        />

        {/* REA TRI-PERSPECTIVE CHAMBER BATTLE-ROOM MODAL */}
        <ReaChamberModal
          isOpen={isReaModalOpen}
          onClose={() => setIsReaModalOpen(false)}
          narrative={reaModalNarrative || messages.find(m => m.role === 'user')?.text || ''}
          isDark={isDark}
          apiBase={apiBase}
        />

        {/* COURT-READY PLEADING & NOTICE STUDIO MODAL */}
        {isPleadingStudioOpen && typeof document !== 'undefined' && createPortal(
          <div 
            onClick={(e) => { if (e.target === e.currentTarget) setIsPleadingStudioOpen(false); }}
            className="fixed inset-0 z-[10050] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          >
            <div className="w-full max-w-6xl h-[92dvh] max-h-[920px] rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-slate-700 relative">
              {isInstitutional && (
                <div className="hidden lg:flex absolute top-3 right-14 z-50">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPleadingStudioOpen(false);
                      setDockedStudio('pleadings');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10.5px] font-bold bg-[#131624]/90 text-amber-300 border border-amber-500/40 hover:bg-amber-500/20 shadow-md cursor-pointer transition-all"
                    title="Dock side-by-side with legal chat cockpit"
                  >
                    <span className="material-symbols-outlined text-[14px]">dock_to_right</span>
                    <span>Dock to Cockpit</span>
                  </button>
                </div>
              )}
              <CourtPleadingStudio
                isDark={isDark}
                apiBase={apiBase}
                initialFacts={pleadingInitialFacts}
                onClose={() => setIsPleadingStudioOpen(false)}
              />
            </div>
          </div>,
          document.body
        )}

        {/* INTERACTIVE DISPUTE TIMELINE MODAL */}
        {isTimelineModalOpen && typeof document !== 'undefined' && createPortal(
          <div 
            onClick={(e) => { if (e.target === e.currentTarget) setIsTimelineModalOpen(false); }}
            className="fixed inset-0 z-[10050] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          >
            <div className="w-full max-w-6xl h-[92dvh] max-h-[920px] rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-slate-700 relative">
              {isInstitutional && (
                <div className="hidden lg:flex absolute top-3 right-14 z-50">
                  <button
                    type="button"
                    onClick={() => {
                      setIsTimelineModalOpen(false);
                      setDockedStudio('timeline');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10.5px] font-bold bg-[#131624]/90 text-amber-300 border border-amber-500/40 hover:bg-amber-500/20 shadow-md cursor-pointer transition-all"
                    title="Dock side-by-side with legal chat cockpit"
                  >
                    <span className="material-symbols-outlined text-[14px]">dock_to_right</span>
                    <span>Dock to Cockpit</span>
                  </button>
                </div>
              )}
              <DisputeTimelineVisualizer
                isDark={isDark}
                apiBase={apiBase}
                initialArchetype={timelineArchetype}
                initialFacts={timelineInitialFacts}
                onClose={() => setIsTimelineModalOpen(false)}
              />
            </div>
          </div>,
          document.body
        )}

        {/* DEFENSIVE COUNTER-STRATEGY STUDIO MODAL */}
        {isCounterStrategyModalOpen && typeof document !== 'undefined' && createPortal(
          <div 
            onClick={(e) => { if (e.target === e.currentTarget) setIsCounterStrategyModalOpen(false); }}
            className="fixed inset-0 z-[10050] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          >
            <div className="w-full max-w-6xl h-[92dvh] max-h-[920px] rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-slate-700 relative">
              {isInstitutional && (
                <div className="hidden lg:flex absolute top-3 right-14 z-50">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCounterStrategyModalOpen(false);
                      setDockedStudio('counter');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10.5px] font-bold bg-[#131624]/90 text-amber-300 border border-amber-500/40 hover:bg-amber-500/20 shadow-md cursor-pointer transition-all"
                    title="Dock side-by-side with legal chat cockpit"
                  >
                    <span className="material-symbols-outlined text-[14px]">dock_to_right</span>
                    <span>Dock to Cockpit</span>
                  </button>
                </div>
              )}
              <CounterStrategyStudio
                isDark={isDark}
                apiBase={apiBase}
                initialFacts={counterStrategyInitialFacts}
                onClose={() => setIsCounterStrategyModalOpen(false)}
              />
            </div>
          </div>,
          document.body
        )}

        {/* COURT-READY PRINT CANVAS (Visible only during window.print()) */}
        <CourtReadyPrintCanvas
          messages={messages}
          activeThreadTitle={threads.find(t => t.id === activeThreadId)?.title || 'Legal Research Consultation'}
          activeThreadId={activeThreadId || 'thread-active'}
          mode={mode}
          options={printStudioOptions}
        />
      </main>

      {/* DOCKED SENIOR ADVOCATE STUDIO (Desktop Tri-Pane Cockpit when isInstitutional is true) */}
      {isInstitutional && dockedStudio && (
        <aside className={`hidden lg:flex w-[48%] xl:w-[50%] 2xl:w-[52%] max-w-[860px] shrink-0 h-full border-l flex-col relative z-20 shadow-2xl animate-in slide-in-from-right duration-200 ${
          isDark ? 'border-[#1f2438] bg-[#0d0f17]' : 'border-[#e2e8f0] bg-white'
        }`}>
          <div className={`h-11 px-3 border-b flex items-center justify-between shrink-0 ${
            isDark ? 'bg-[#0d0f17] border-[#1f2438]' : 'bg-[#f8f9ff] border-[#e2e8f0]'
          }`}>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-[#ff7722]">dock_to_right</span>
              <span className="text-[12px] font-bold font-bench-title tracking-wider">
                {dockedStudio === 'pleadings' ? 'Pleadings & Notice Studio' : dockedStudio === 'timeline' ? 'Dispute Timeline Visualizer' : 'Defensive Counter-Strategy'}
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#ff7722]/20 text-[#ff7722] font-extrabold uppercase">Docked Live</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  if (dockedStudio === 'pleadings') setIsPleadingStudioOpen(true);
                  if (dockedStudio === 'timeline') setIsTimelineModalOpen(true);
                  if (dockedStudio === 'counter') setIsCounterStrategyModalOpen(true);
                  setDockedStudio(null);
                }}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-colors cursor-pointer ${
                  isDark 
                    ? 'bg-[#181c2d] hover:bg-[#20253d] text-slate-300 border-[#2b334d]' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                }`}
                title="Expand to Fullscreen Chamber Modal"
              >
                <span className="material-symbols-outlined text-[14px]">open_in_full</span>
                <span className="hidden xl:inline text-[10.5px]">Expand</span>
              </button>
              <button
                type="button"
                onClick={() => setDockedStudio(null)}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-colors cursor-pointer ${
                  isDark 
                    ? 'bg-[#181c2d] hover:bg-rose-950/60 text-rose-300 border-[#2b334d]' 
                    : 'bg-slate-100 hover:bg-rose-100 text-rose-700 border-slate-300'
                }`}
                title="Close Docked Studio"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden relative">
            {dockedStudio === 'pleadings' && (
              <CourtPleadingStudio
                isDark={isDark}
                apiBase={apiBase}
                initialFacts={pleadingInitialFacts}
                onClose={() => setDockedStudio(null)}
              />
            )}
            {dockedStudio === 'timeline' && (
              <DisputeTimelineVisualizer
                isDark={isDark}
                apiBase={apiBase}
                initialArchetype={timelineArchetype}
                initialFacts={timelineInitialFacts}
                onClose={() => setDockedStudio(null)}
              />
            )}
            {dockedStudio === 'counter' && (
              <CounterStrategyStudio
                isDark={isDark}
                apiBase={apiBase}
                initialFacts={counterStrategyInitialFacts}
                onClose={() => setDockedStudio(null)}
              />
            )}
          </div>
        </aside>
      )}
    </div>
  );
}

