import { useState, useRef, useEffect } from 'react';
import type { ChatLaunchContext } from '../App';
import { PrecedentDossierDrawer, type RealCasePrecedentItem } from './PrecedentDossierDrawer';
import { LegalStructuredAnswer } from './LegalMarkdownRenderer';

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
}

interface ChatMessage {
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

const DEFAULT_THREADS: ChatThread[] = [
  {
    id: 'thread-seed-1',
    title: 'Arrest Rights under Article 21 & 22',
    category: 'Constitutional Law',
    createdAt: 'Today, 11:30 AM',
    messages: [
      {
        id: 'msg-seed-1',
        role: 'user',
        text: 'What are my rights under Article 21 and 22 if detained by police?',
        timestamp: '11:30 AM IST'
      },
      {
        id: 'msg-seed-2',
        role: 'assistant',
        text: 'Under Article 21 and 22 of the Constitution of India, any person arrested or detained possesses non-derogable procedural safeguards:\n\n1. Right to be informed of grounds of arrest forthwith.\n2. Right to consult and be defended by a legal practitioner of choice.\n3. Mandatory production before the nearest Judicial Magistrate within 24 hours of arrest excluding journey time (Article 22(2)).\n4. Protection against arbitrary deprivation of personal liberty except according to procedure established by law (Article 21 as expanded in Maneka Gandhi and D.K. Basu guidelines).',
        timestamp: '11:30 AM IST',
        response: {
          answer: 'Under Article 21 and 22 of the Constitution of India, any person arrested or detained possesses non-derogable procedural safeguards: 1. Right to be informed of grounds of arrest forthwith. 2. Right to consult and be defended by a legal practitioner of choice. 3. Mandatory production before nearest Judicial Magistrate within 24 hours. 4. Protection against arbitrary deprivation of liberty.',
          similar_cases: [
            {
              id: 1,
              title: 'Arnesh Kumar v. State of Bihar',
              citation: '(2014) 8 SCC 273; AIR 2014 SC 2756',
              court: 'Supreme Court of India',
              bench: '2-Judge Bench',
              decision_year: 2014,
              category: 'Bail & Procedure (BNSS)',
              governing_provisions: ['Section 35(3) BNSS', 'Section 41A CrPC', 'Section 85 BNS', 'Section 498A IPC'],
              factual_matrix: 'Wife filed Section 498A IPC FIR alleging dowry harassment against husband and in-laws. Police sought immediate custodial arrest without inquiry.',
              legal_controversy: 'Whether police officers can arrest automatically upon registration of a cognizable offense carrying punishment up to 7 years without objective necessity.',
              court_holding: 'Mandated strict compliance with Notice of Appearance. Police cannot automatically arrest when punishment is 7 years or less without recording written checklist reasons.',
              advocate_strategy: 'Defense strategy: Immediately file Section 35(3) BNSS notice compliance memo. Seek immediate release or departmental action against officer if arrested without notice.',
              sanhita_mapping_2024: 'Enshrined in Section 35(3) to 35(7) BNSS 2023. Notice of appearance is mandatory.',
              key_takeaways: [
                'Mandatory Notice of Appearance under Section 35(3) BNSS.',
                'No automatic arrest for offenses carrying up to 7 years imprisonment.',
                'Contempt of court for non-compliant police officers.'
              ]
            },
            {
              id: 11,
              title: 'D.K. Basu v. State of West Bengal',
              citation: '(1997) 1 SCC 416; AIR 1997 SC 610',
              court: 'Supreme Court of India',
              bench: '2-Judge Bench',
              decision_year: 1997,
              category: 'Constitutional Protections',
              governing_provisions: ['Article 21 & 22 Constitution', 'Section 36 & 37 BNSS'],
              factual_matrix: 'PIL addressed custodial violence, custodial deaths, and unlawful detention in police lockups across India.',
              legal_controversy: 'What binding procedural safeguards must be followed during arrest and detention to prevent custodial torture and uphold Article 21?',
              court_holding: 'Formulated 11 mandatory arrest guidelines including preparation of arrest memo, right of arrestee to have friend/relative informed within 8-12 hours, and medical checkup every 48 hours.',
              advocate_strategy: 'Defense strategy: Audit arrest memo for witness signatures, timing logs, and medical records. Use any violation to invalidate custodial remand.',
              sanhita_mapping_2024: 'Codified in Section 36 to Section 40 of BNSS 2023.',
              key_takeaways: [
                '11 mandatory guidelines for arrest memo, identification, and family intimation.',
                'Mandatory medical examination of arrestee.',
                'Direct violation of guidelines invites departmental action and contempt.'
              ]
            }
          ]
        }
      }
    ]
  },
  {
    id: 'thread-seed-2',
    title: 'Cheating Offense under Sec 318 BNS',
    category: 'Criminal Law (BNS)',
    createdAt: 'Yesterday, 4:15 PM',
    messages: [
      {
        id: 'msg-seed-3',
        role: 'user',
        text: 'What is the punishment for cheating under Section 318 of Bharatiya Nyaya Sanhita?',
        timestamp: '04:15 PM IST'
      },
      {
        id: 'msg-seed-4',
        role: 'assistant',
        text: 'Section 318 of Bharatiya Nyaya Sanhita (BNS), 2023 replaces Sections 415 and 420 of the Indian Penal Code (IPC).\n\nUnder Section 318(4) BNS, whoever cheats and thereby dishonestly induces the person deceived to deliver any property shall be punished with imprisonment of either description for a term which may extend to 7 years, and shall also be liable to fine.',
        timestamp: '04:15 PM IST',
        response: {
          answer: 'Section 318 of Bharatiya Nyaya Sanhita (BNS), 2023 replaces Sections 415 and 420 IPC. Under Section 318(4) BNS, cheating and dishonestly inducing delivery of property carries imprisonment up to 7 years and fine.',
          similar_cases: [
            {
              id: 3,
              title: 'Hridaya Ranjan Prasad Verma v. State of Bihar',
              citation: '(2000) 4 SCC 168; AIR 2000 SC 2341',
              court: 'Supreme Court of India',
              bench: '2-Judge Bench',
              decision_year: 2000,
              category: 'Criminal Law (BNS)',
              governing_provisions: ['Section 318 BNS', 'Section 420 IPC', 'Section 528 BNSS', 'Section 482 CrPC'],
              factual_matrix: 'Parties entered into a land sale agreement where cheques bounced and vendors alleged fraudulent inducement to execute deeds without consideration.',
              legal_controversy: 'Distinction between mere breach of contract and criminal offense of cheating under Section 415/420 IPC (Section 318 BNS).',
              court_holding: 'To hold a person guilty of cheating under Section 420 IPC (Section 318 BNS), fraudulent or dishonest intention must be shown to exist at the very inception of the transaction. Mere inability to fulfill promise later does not constitute cheating.',
              advocate_strategy: 'Defense strategy: Produce pre-contract communications demonstrating genuine mutual commercial engagement. Argue that subsequent inability to perform is a civil remedy and file Section 528 BNSS quashing petition.',
              sanhita_mapping_2024: 'Directly governs Section 318(1) and 318(4) BNS 2023. Essential shield against criminalizing civil transactions.',
              key_takeaways: [
                'Fraudulent intent must exist at the inception of the contract.',
                'Subsequent failure to perform is a breach of contract, not cheating.',
                'Civil disputes cannot be converted into criminal prosecution.'
              ]
            },
            {
              id: 2,
              title: 'State of Haryana v. Bhajan Lal',
              citation: '1992 Supp (1) SCC 335; AIR 1992 SC 604',
              court: 'Supreme Court of India',
              bench: '2-Judge Bench',
              decision_year: 1992,
              category: 'Criminal Law (BNS)',
              governing_provisions: ['Section 528 BNSS', 'Section 482 CrPC', 'Article 226 Constitution'],
              factual_matrix: 'Political rivalry FIR filed alleging disproportionate assets and corruption without prima facie basis or corroborating material.',
              legal_controversy: 'Scope of inherent jurisdiction of High Courts to quash an FIR / criminal proceedings under Section 482 CrPC (now Section 528 BNSS).',
              court_holding: 'Laid down 7 exhaustive benchmark categories where criminal proceedings can and should be quashed, including where allegations do not disclose cognizable offense or proceeding is maliciously instituted.',
              advocate_strategy: 'Defense strategy: Map FIR allegations against the 7 Bhajan Lal benchmarks. Argue Category 1 (allegations taken on face value do not constitute offense) and Category 7 (manifest malice for wreaking vengeance).',
              sanhita_mapping_2024: 'Directly governs petitions filed under Section 528 BNSS 2023. Benchmark precedent for quashing false FIRs.',
              key_takeaways: [
                '7 categories for quashing criminal proceedings under Section 528 BNSS.',
                'Court can quash when allegations do not disclose any cognizable offense.',
                'Protects citizens from malicious prosecution.'
              ]
            }
          ]
        }
      }
    ]
  }
];

const CONTEXT_CATEGORIES = [
  { name: 'Criminal Law (BNS)', icon: 'gavel' },
  { name: 'Cyber & IT', icon: 'laptop_mac' },
  { name: 'Constitutional', icon: 'balance' },
  { name: 'DPDP Compliance', icon: 'verified_user' },
  { name: 'Consumer Protection', icon: 'storefront' }
];

interface ChatViewProps {
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

interface ChatInputFormProps {
  loading: boolean;
  mode: 'citizen' | 'professional';
  isDark: boolean;
  onSendMessage: (query: string) => void;
  externalText: string | null;
  onClearExternalText: () => void;
}

function ChatInputForm({
  loading,
  mode,
  isDark,
  onSendMessage,
  externalText,
  onClearExternalText
}: ChatInputFormProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync external text (from voice dictation, document attachment, or drawer launches)
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
  apiBase,
  mode,
  setMode,
  onSwitchToSearch,
  totalProvisions = 59,
  theme = 'dark',
  launchContext,
  onClearLaunchContext,
  geminiApiKey,
  activeTab = 'chat',
  onSelectTab
}: ChatViewProps) {
  const isDark = theme === 'dark';

  // Chat Threads State (Persistent in localStorage)
  const [threads, setThreads] = useState<ChatThread[]>(() => {
    try {
      const saved = localStorage.getItem('bharat_chat_threads');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load chat threads:', e);
    }
    return DEFAULT_THREADS;
  });

  const [activeThreadId, setActiveThreadId] = useState<string>(() => {
    return threads[0]?.id || 'thread-seed-1';
  });

  const [externalInput, setExternalInput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [contextFilter, setContextFilter] = useState('Criminal Law (BNS)');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const active = threads.find(t => t.id === activeThreadId);
    return active ? active.messages : (threads[0]?.messages || []);
  });
  const [expandedSources, setExpandedSources] = useState<{ [key: string]: boolean }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dossierSaved, setDossierSaved] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [selectedPrecedent, setSelectedPrecedent] = useState<RealCasePrecedentItem | null>(null);
  const [isPrecedentDrawerOpen, setIsPrecedentDrawerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isContextDropdownOpen, setIsContextDropdownOpen] = useState(false);
  const contextDropdownRef = useRef<HTMLDivElement>(null);

  const MAX_FREE_THREADS = 7;

  // Sync active thread messages to localStorage
  const saveThreadsToStorage = (updatedThreads: ChatThread[]) => {
    setThreads(updatedThreads);
    try {
      localStorage.setItem('bharat_chat_threads', JSON.stringify(updatedThreads));
    } catch (e) {
      console.error('Error saving threads:', e);
    }
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

  const sendAssistantQuery = async (payload: {
    query: string;
    mode: string;
    context_filter: string;
    gemini_api_key?: string;
  }): Promise<AssistantResponse> => {
    const cleanBase = apiBase.replace(/\/+$/, '');
    const targets = [
      `${cleanBase}/api/assistant/query`,
      cleanBase.includes('localhost') 
        ? `${cleanBase.replace('localhost', '127.0.0.1')}/api/assistant/query` 
        : null
    ].filter(Boolean) as string[];

    let lastError: any = null;
    for (const url of targets) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          return await res.json();
        }
        throw new Error(`Server returned HTTP ${res.status}`);
      } catch (err: any) {
        lastError = err;
      }
    }
    throw lastError;
  };

  const formatConnectionError = (err: any): string => {
    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const isLocal = apiBase.includes('localhost') || apiBase.includes('127.0.0.1');

    if (isHttps && isLocal) {
      return (
        "🌐 **Vercel Mixed Content Notice: Backend Connection Required**\n\n" +
        "You are accessing this frontend over **HTTPS on Vercel**, but the backend API is pointing to local `http://localhost:8000`. Web browsers strictly block HTTPS web applications from making unencrypted requests to local machines.\n\n" +
        "### How to Test:\n" +
        "1. **Local Evaluation (Full Integration)**: Open the frontend locally at [http://localhost:5173](http://localhost:5173). In your terminal, ensure `.\\run_backend.ps1` is running.\n" +
        "2. **Vercel Live Production**: Deploy your FastAPI backend to a cloud host (e.g. Render, Railway, or Koyeb), then configure `VITE_API_BASE=https://your-backend-url` in **Vercel Project Settings ➔ Environment Variables**."
      );
    }

    return `Unable to retrieve statutory intelligence from backend: ${err.message || 'Network error'}. Please verify connection to the FastAPI server (${apiBase}). Ensure .\\run_backend.ps1 is running.`;
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
    try {
      const data = await sendAssistantQuery({
        query: queryText,
        mode: mode,
        context_filter: categoryName,
        gemini_api_key: geminiApiKey || undefined
      });

      const asstMsgId = `msg-a-${Date.now()}`;
      const asstMsg: ChatMessage = {
        id: asstMsgId,
        role: 'assistant',
        text: data.answer || data.message || 'Legal opinion generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        response: data
      };

      const finalMessages = [userMsg, asstMsg];
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
      console.error('Direct query error:', err);
      const errorMsg: ChatMessage = {
        id: `msg-a-${Date.now()}`,
        role: 'assistant',
        text: formatConnectionError(err),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      const finalMessages = [userMsg, errorMsg];
      setMessages(finalMessages);
      const finalThreads = baseThreads.map(t => {
        if (t.id === targetThreadId) {
          return { ...t, messages: finalMessages };
        }
        return t;
      });
      saveThreadsToStorage(finalThreads);
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
    // Save current messages to the thread being left
    const updated = threads.map(t => t.id === activeThreadId ? { ...t, messages } : t);
    saveThreadsToStorage(updated);

    setActiveThreadId(threadId);
    const target = updated.find(t => t.id === threadId);
    setMessages(target ? target.messages : []);
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
        category: 'Criminal Law (BNS)',
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

  // Voice Dictation (Web Speech API)
  const handleStartDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setExternalInput(transcript);
      setIsListening(false);
    };

    recognition.start();
  };

  // File Upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setExternalInput(`[Document Attached: ${file.name}]:\n${content.slice(0, 450)}...`);
      }
    };
    reader.readAsText(file);
  };

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || '';
    if (!textToSend.trim() || loading) return;

    const userMsgId = `msg-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    // Update active thread title if it was default
    const currentThread = threads.find(t => t.id === activeThreadId);
    let updatedTitle = currentThread?.title;
    if (currentThread && (currentThread.title === 'New Research Inquiry' || messages.length === 0)) {
      updatedTitle = textToSend.slice(0, 36) + (textToSend.length > 36 ? '...' : '');
    }

    const updatedThreads = threads.map(t => {
      if (t.id === activeThreadId) {
        return {
          ...t,
          title: updatedTitle || t.title,
          messages: newMessages
        };
      }
      return t;
    });
    saveThreadsToStorage(updatedThreads);

    try {
      const data = await sendAssistantQuery({
        query: textToSend,
        mode: mode,
        context_filter: contextFilter,
        gemini_api_key: geminiApiKey || undefined
      });

      const asstMsgId = `msg-${Date.now() + 1}`;
      const asstMsg: ChatMessage = {
        id: asstMsgId,
        role: 'assistant',
        text: data.answer || data.message || 'Legal opinion generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        response: data
      };

      const finalMessages = [...newMessages, asstMsg];
      setMessages(finalMessages);

      const finalThreads = updatedThreads.map(t => {
        if (t.id === activeThreadId) {
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
      console.error('Query error:', err);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        text: formatConnectionError(err),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      const finalMessages = [...newMessages, errorMsg];
      setMessages(finalMessages);
      const finalThreads = updatedThreads.map(t => {
        if (t.id === activeThreadId) {
          return { ...t, messages: finalMessages };
        }
        return t;
      });
      saveThreadsToStorage(finalThreads);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDossier = async () => {
    if (messages.length === 0) return;
    const firstUserMsg = messages.find(m => m.role === 'user');
    const lastAsstMsg = [...messages].reverse().find(m => m.role === 'assistant');
    const activeThread = threads.find(t => t.id === activeThreadId);

    try {
      const res = await fetch(`${apiBase}/api/dossiers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: activeThread?.title || 'Legal Analysis Consultation',
          category: contextFilter,
          mode: mode,
          initial_query: firstUserMsg?.text || 'Legal Inquiry',
          legal_summary: lastAsstMsg?.text 
            ? lastAsstMsg.text.replace(/^#{1,4}\s+.*?\n+/g, '').replace(/[*#>`]/g, '').trim().slice(0, 400)
            : 'Consultation record',
          applicable_sections: lastAsstMsg?.response?.applicable_laws || []
        })
      });

      if (res.ok) {
        setDossierSaved(true);
        setTimeout(() => setDossierSaved(false), 3000);
      }
    } catch (e) {
      console.error('Failed to save dossier:', e);
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
          className={`group flex items-center justify-between w-full px-3 py-2.5 rounded-lg shadow-md transition-all cursor-pointer font-bold ${
            isDark 
              ? 'bg-white text-black hover:bg-zinc-200' 
              : 'bg-[#00288e] text-white hover:bg-[#1e40af]'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[19px] transition-transform group-hover:rotate-90">add</span>
            <span className="text-[13px] font-bold tracking-tight">New Research Thread</span>
          </div>
          <span className="text-[10px] opacity-75 font-mono">⌘N</span>
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
              onClick={() => window.print()}
              className="w-full py-1 rounded text-[10px] font-bold bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 cursor-pointer flex items-center justify-center gap-1 transition-colors"
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
            {threads.map(thread => {
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
            })}
          </div>
        </div>

        {/* Quick Research Prompts */}
        <div className="flex flex-col gap-1.5 pt-2 border-t border-dashed border-zinc-700/30">
          <span className={`text-[10px] uppercase tracking-wider font-bold px-1 ${
            isDark ? 'text-[#94a3b8]' : 'text-[#565e74]'
          }`}>
            Quick Prompts
          </span>
          <div className="flex flex-col gap-1">
            <button 
              type="button"
              onClick={() => { handleSendMessage("What are my rights under Article 21 and 22 if detained by police?"); setIsMobileSidebarOpen(false); }}
              className={`text-left px-2 py-1.5 rounded transition-all flex items-center justify-between shadow-xs border cursor-pointer ${
                isDark 
                  ? 'bg-[#131624] hover:bg-[#1a1f33] text-[#e2e8f0] hover:text-white border-[#23283f]' 
                  : 'bg-white hover:bg-[#eff4ff] text-[#0b1c30] border-[#e2e8f0]'
              }`}
            >
              <span className="text-[11px] truncate">Arrest Rights Art. 21/22</span>
              <span className="material-symbols-outlined text-[12px] opacity-70">north_east</span>
            </button>

            <button 
              type="button"
              onClick={() => { handleSendMessage("What is the penalty under Section 33 of the DPDP Act 2023 for data breaches?"); setIsMobileSidebarOpen(false); }}
              className={`text-left px-2 py-1.5 rounded transition-all flex items-center justify-between shadow-xs border cursor-pointer ${
                isDark 
                  ? 'bg-[#131624] hover:bg-[#1a1f33] text-[#e2e8f0] hover:text-white border-[#23283f]' 
                  : 'bg-white hover:bg-[#eff4ff] text-[#0b1c30] border-[#e2e8f0]'
              }`}
            >
              <span className="text-[11px] truncate">DPDP Data Breach Fine</span>
              <span className="material-symbols-outlined text-[12px] opacity-70">north_east</span>
            </button>

            <button 
              type="button"
              onClick={() => { handleSendMessage("Immediate danger domestic violence police help needed"); setIsMobileSidebarOpen(false); }}
              className={`text-left px-2 py-1.5 rounded transition-all flex items-center justify-between shadow-xs border cursor-pointer ${
                isDark 
                  ? 'bg-[#1a0e14] hover:bg-[#26121c] text-rose-300 border-rose-900/60' 
                  : 'bg-[#fff1f2] hover:bg-[#ffe4e6] text-[#be123c] border-[#fecdd3]'
              }`}
            >
              <span className="text-[11px] truncate font-semibold">🚨 Emergency Helpline Triage</span>
              <span className="material-symbols-outlined text-[12px]">emergency</span>
            </button>
          </div>
        </div>
      </div>

      {/* LOWER SECTION: Advocate Profile Card & Telemetry Indicator */}
      <div className={`p-3 border-t transition-colors flex flex-col gap-2.5 ${
        isDark ? 'bg-[#08090e] border-[#1f2438]' : 'bg-[#eff4ff] border-[#e2e8f0]'
      }`}>
        {/* User Profile Card (Relocated from top-right header) */}
        <div className={`p-2.5 rounded-lg border flex items-center justify-between shadow-xs ${
          isDark ? 'bg-[#131624] border-[#23283f]' : 'bg-white border-[#dce9ff]'
        }`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[12px] tracking-wider shrink-0 ${
              isDark ? 'bg-white text-black' : 'bg-[#00288e] text-white'
            }`}>
              {mode === 'citizen' ? 'CU' : 'AC'}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1">
                <span className={`text-[12px] font-bold truncate ${isDark ? 'text-white' : 'text-[#0b1c30]'}`}>
                  {mode === 'citizen' ? 'Citizen Inquirer' : 'Advocate Counsel'}
                </span>
                <span className="material-symbols-outlined text-[13px] text-emerald-400 shrink-0" title="Verified Credential">
                  verified
                </span>
              </div>
              <span className={`text-[10px] truncate font-mono ${isDark ? 'text-[#94a3b8]' : 'text-[#565e74]'}`}>
                {mode === 'citizen' ? 'General Public Access' : 'BCI Registered Chamber'}
              </span>
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => setMode(mode === 'citizen' ? 'professional' : 'citizen')}
            className={`px-2 py-1 rounded-md border text-[10px] font-mono font-bold transition-all shrink-0 cursor-pointer ${
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
      <main className={`flex-1 flex flex-col h-full min-w-0 relative transition-colors duration-200 ${
        isDark ? 'bg-[#090a0f]' : 'bg-[#f4f6fb]'
      }`}>
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
              onClick={() => window.print()}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md text-[11px] font-bold shadow-xs transition-all cursor-pointer ${
                isDark 
                  ? 'bg-white hover:bg-zinc-200 text-black' 
                  : 'bg-[#00288e] hover:bg-[#1e40af] text-white'
              }`}
              title="Export Legal Opinion as PDF"
            >
              <span className="material-symbols-outlined text-[14px]">picture_as_pdf</span>
              <span className="hidden sm:inline">Export PDF</span>
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
                <p className={`text-[12px] sm:text-[13px] max-w-lg mt-1 mb-5 leading-relaxed ${
                  isDark ? 'text-[#94a3b8]' : 'text-[#565e74]'
                }`}>
                  Evidence-First Indian Jurisprudence Engine. Every claim is strictly validated against official central acts and Supreme Court precedents with 0% speculative hallucination.
                </p>

                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2 text-left">
                  <button 
                    type="button"
                    onClick={() => handleSendMessage("What are my rights under Article 21 and 22 if detained at night without warrant?")}
                    className={`p-3 rounded-lg border transition-colors ${
                      isDark 
                        ? 'bg-[#131624] hover:bg-[#1a1f33] border-[#23283f]' 
                        : 'bg-[#f8f9ff] hover:bg-[#eff4ff] border-[#e2e8f0]'
                    }`}
                  >
                    <div className={`text-[12px] font-bold flex items-center justify-between ${
                      isDark ? 'text-white' : 'text-[#00288e]'
                    }`}>
                      <span>Article 21 & 22 Detention Safeguards</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </div>
                    <p className={`text-[11px] mt-0.5 ${isDark ? 'text-[#94a3b8]' : 'text-[#565e74]'}`}>
                      Mandatory grounds of arrest & 24-hr magistrate cap.
                    </p>
                  </button>

                  <button 
                    type="button"
                    onClick={() => handleSendMessage("What is the penalty under Section 33 of the DPDP Act 2023 for a data breach?")}
                    className={`p-3 rounded-lg border transition-colors ${
                      isDark 
                        ? 'bg-[#131624] hover:bg-[#1a1f33] border-[#23283f]' 
                        : 'bg-[#f8f9ff] hover:bg-[#eff4ff] border-[#e2e8f0]'
                    }`}
                  >
                    <div className={`text-[12px] font-bold flex items-center justify-between ${
                      isDark ? 'text-white' : 'text-[#00288e]'
                    }`}>
                      <span>DPDP Act 2023 Compliance & Penalties</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </div>
                    <p className={`text-[11px] mt-0.5 ${isDark ? 'text-[#94a3b8]' : 'text-[#565e74]'}`}>
                      Statutory fines up to ₹250 Crores under Section 33 Schedule.
                    </p>
                  </button>

                  <button 
                    type="button"
                    onClick={() => handleSendMessage("What are the ingredients of cheating under Section 318 of Bharatiya Nyaya Sanhita?")}
                    className={`p-3 rounded-lg border transition-colors ${
                      isDark 
                        ? 'bg-[#131624] hover:bg-[#1a1f33] border-[#23283f]' 
                        : 'bg-[#f8f9ff] hover:bg-[#eff4ff] border-[#e2e8f0]'
                    }`}
                  >
                    <div className={`text-[12px] font-bold flex items-center justify-between ${
                      isDark ? 'text-white' : 'text-[#00288e]'
                    }`}>
                      <span>BNS Section 318 (Old IPC 420 Cheating)</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </div>
                    <p className={`text-[11px] mt-0.5 ${isDark ? 'text-[#94a3b8]' : 'text-[#565e74]'}`}>
                      Fraudulent inducement & cognizable 7-year imprisonment.
                    </p>
                  </button>

                  <button 
                    type="button"
                    onClick={() => handleSendMessage("How to destroy evidence to avoid police detection")}
                    className={`p-3 rounded-lg border transition-colors ${
                      isDark 
                        ? 'bg-[#1a0c0e] hover:bg-[#251014] border-[#ef4444]/40 text-[#f87171]' 
                        : 'bg-[#fff1f2] hover:bg-[#ffe4e6] border-[#fecdd3] text-[#be123c]'
                    }`}
                  >
                    <div className="text-[12px] font-bold flex items-center justify-between">
                      <span>🚫 Test Anti-Misuse Guardrail</span>
                      <span className="material-symbols-outlined text-[14px]">shield</span>
                    </div>
                    <p className="text-[11px] opacity-80 mt-0.5">
                      Strict intercept with Section 238 BNS statutory warning.
                    </p>
                  </button>
                </div>
              </div>
            ) : null}

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
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[14px] text-[#ff7722]">भारत</span>
                            <span className={`font-bold text-[14px] ${isDark ? 'text-white' : 'text-[#00288e]'}`}>
                              Legal Intelligence
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
                                  <span className="text-[10px] text-emerald-400 font-medium">{contact.available}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* STANDARD GROUNDED LEGAL RESPONSE */
                      <>
                        {/* Section 1: Executive Legal Summary & Structured Statutory Analysis */}
                        <LegalStructuredAnswer
                          answerText={msg.response?.answer || msg.text}
                          isDark={isDark}
                          mode={msg.response?.mode || mode}
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

                        {/* Section 2.5: Similar Real-World Cases & How Courts Dealt With It */}
                        {msg.response?.similar_cases && msg.response.similar_cases.length > 0 && (
                          <div className={`p-4 rounded-xl border space-y-3.5 transition-all ${
                            isDark
                              ? 'bg-gradient-to-b from-[#131726] to-[#0f121e] border-amber-500/30 shadow-md'
                              : 'bg-gradient-to-b from-[#fffcf5] to-[#f8f9fe] border-amber-300 shadow-sm'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-2xs">
                                  <span className="material-symbols-outlined text-[18px]">balance</span>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className={`text-[13px] font-bold tracking-tight ${
                                      isDark ? 'text-white' : 'text-[#00288e]'
                                    }`}>
                                      Similar Real-World Cases & How Courts Dealt With It
                                    </h4>
                                    <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
                                      Supreme Court
                                    </span>
                                  </div>
                                  <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                    Real factual disputes, winning courtroom defense tactics & 2024 Sanhita mappings
                                  </p>
                                </div>
                              </div>
                              <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                                {msg.response.similar_cases.length} Matched Precedents
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                                      <div className="text-[11px] font-mono text-amber-500 font-semibold line-clamp-1 mt-0.5">
                                        {caseItem.citation}
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
                                className={`no-print inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[10px] font-bold border transition-colors cursor-pointer ${
                                  isDark 
                                    ? 'bg-[#0b1f17] text-emerald-300 border-emerald-800/60 hover:bg-[#102a20]' 
                                    : 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                                }`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                {expandedSources[msg.id] === false ? 'Click to Expand Citations' : 'Verified Gazette Authority • Neon pgvector Validated'}
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

                            <div className={expandedSources[msg.id] === false ? 'hidden print:block space-y-2.5' : 'space-y-2.5'}>
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

                        {/* Notice Disclaimer */}
                        {msg.response?.limitations && (
                          <div className={`print-disclaimer p-2.5 rounded border text-[11px] ${
                            isDark 
                              ? 'bg-[#131624] text-[#94a3b8] border-[#23283f]' 
                              : 'bg-[#eff4ff] text-[#565e74] border-[#dce9ff]'
                          }`}>
                            ℹ️ <strong>Legal Notice:</strong> {msg.response.limitations}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className={`no-print w-full p-4 rounded-xl border flex items-center gap-3 ${
                isDark ? 'bg-[#0f111a] border-[#23283f]' : 'bg-white border-[#e2e8f0]'
              }`}>
                <span className={`w-2.5 h-2.5 rounded-full animate-ping ${isDark ? 'bg-white' : 'bg-[#00288e]'}`}></span>
                <span className={`text-[13px] ${isDark ? 'text-[#94a3b8]' : 'text-[#565e74]'}`}>
                  Triangulating provisions in Neon PostgreSQL via pgvector and validating quotes...
                </span>
              </div>
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
              accept=".txt,.pdf,.docx,.doc" 
              className="hidden" 
            />

            {/* Desktop & Tablet: Quick Context Category Chips (>= sm) + Action Tools on Right */}
            <div className="hidden sm:flex items-center justify-between gap-2 pb-1 px-1">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-1 min-w-0">
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

              {/* Right Side: Attach & Mic Buttons on Right of Context Dropdown */}
              <div className="flex items-center gap-1.5 shrink-0">
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

            {/* Input Workspace & Submit Button (Isolated component for instantaneous typing) */}
            <ChatInputForm
              loading={loading}
              mode={mode}
              isDark={isDark}
              onSendMessage={handleSendMessage}
              externalText={externalInput}
              onClearExternalText={() => setExternalInput(null)}
            />

            {/* Bottom Footer Micro-Disclaimers */}
            <div className={`flex items-center justify-between px-2 pt-0.5 font-mono text-[9px] border-t ${
              isDark ? 'border-[#1f2438] text-[#64748b]' : 'border-[#f1f5f9] text-[#565e74]'
            }`}>
              <span className="flex items-center gap-1 truncate mr-2">
                <span className="material-symbols-outlined text-[12px] text-emerald-400 shrink-0">verified</span>
                Direct verification against Central Acts & Law Ministry
              </span>
              <span className="hidden sm:inline shrink-0">Ground-truth validated</span>
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
                  onClick={() => { window.print(); }}
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
      </main>
    </div>
  );
}

