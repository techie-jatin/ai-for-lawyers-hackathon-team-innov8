import { useState, useEffect, useRef } from 'react';
import './App.css';
import { ChatView } from './components/ChatView';
import { ContractStudioView } from './components/ContractStudioView';
import { SearchView } from './components/SearchView';
import { InfoView } from './components/InfoView';
import { DossiersDrawer, type ChamberDossier } from './components/DossiersDrawer';
import { getGuestId, resetGuestId, hasSeenGuestNotice, markGuestNoticeSeen } from './utils/guestSession';

export interface ChatLaunchContext {
  type: 'search_provision' | 'concordance' | 'gazette' | 'dossier';
  title: string;
  query: string;
  category?: string;
  autoExecute?: boolean;
  dossier?: ChamberDossier;
}

export interface DailyLegalTip {
  title: string;
  provision: string;
  description: string;
  actionableTip: string;
  category: string;
  icon: string;
}

const DAILY_LEGAL_TIPS: DailyLegalTip[] = [
  {
    title: "Mandatory Notice Before Arrest",
    provision: "Section 35(3) BNSS 2023 (Arnesh Kumar Mandate)",
    description: "For offenses punishable with imprisonment up to 7 years, police cannot arrest mechanically without objective necessity and recording written reasons. They must issue a formal Notice of Appearance.",
    actionableTip: "If police summon you for an inquiry without arrest warrants, demand a formal written Section 35(3) BNSS notice.",
    category: "Criminal Procedure",
    icon: "gavel"
  },
  {
    title: "Right to Lodge Zero FIR",
    provision: "Section 173 BNSS 2023",
    description: "Any citizen can file an FIR at ANY police station in India, regardless of where the incident occurred. The station cannot refuse registration on grounds of territorial jurisdiction.",
    actionableTip: "Request a 'Zero FIR' acknowledgment number if an officer claims the incident occurred outside their police station limits.",
    category: "Citizens' Rights",
    icon: "local_police"
  },
  {
    title: "Safeguards for Women's Arrest",
    provision: "Section 35 BNSS 2023 & D.K. Basu Directives",
    description: "No female person can be arrested after sunset and before sunrise, except in extraordinary circumstances with prior permission of a Judicial Magistrate First Class.",
    actionableTip: "All searches and arrests of female persons must strictly be conducted by female police officers.",
    category: "Constitutional Protections",
    icon: "shield"
  },
  {
    title: "Legal Equality of DigiLocker Documents",
    provision: "Section 139A Motor Vehicles Act & IT Rules 2018",
    description: "Digital Driving Licenses, Registration Certificates (RC), and Insurance presented via DigiLocker or mParivahan are legally valid and on par with physical documents.",
    actionableTip: "Traffic police cannot impound your physical smartphone or demand plastic cards if DigiLocker copies are produced.",
    category: "Cyber & Transport",
    icon: "badge"
  },
  {
    title: "Constitutional Entitlement to Free Legal Aid",
    provision: "Article 39A Constitution of India & NALSA Act",
    description: "Every person unable to afford an advocate—including all women, children, undertrials, and low-income citizens—is entitled to free legal counsel from the State.",
    actionableTip: "Approach the District Legal Services Authority (DLSA) at any district court for free advocate assignment.",
    category: "Constitutional Law",
    icon: "balance"
  },
  {
    title: "Mandatory 24-Hour Magistrate Production",
    provision: "Article 22(2) Constitution & Section 57 BNSS",
    description: "Every person arrested or detained by police must be produced before the nearest Judicial Magistrate within 24 hours of arrest, excluding travel time.",
    actionableTip: "Detention in police lockup beyond 24 hours without a Magistrate's remand order is strictly unconstitutional and illegal.",
    category: "Personal Liberty",
    icon: "lock_clock"
  },
  {
    title: "Invalidity of 'Goods Once Sold Won't Be Returned'",
    provision: "Consumer Protection Act 2019 (Section 2(47))",
    description: "Printing 'Goods once sold will not be exchanged or refunded' on cash memos is an unfair trade practice under law. Consumers are legally entitled to refunds or replacement for defective products or deficient services.",
    actionableTip: "Consumers can lodge complaints directly through the National Consumer Helpline (1915) or e-Daakhil.",
    category: "Consumer Rights",
    icon: "shopping_cart_checkout"
  },
  {
    title: "Mandatory 30-Day RTI Response",
    provision: "Right to Information Act 2005 (Section 7)",
    description: "Public Information Officers are legally obligated to provide requested government information within 30 days of application (or within 48 hours if it concerns life and personal liberty).",
    actionableTip: "Failure to respond attracts a personal financial penalty of ₹250 per day on the defaulting officer.",
    category: "Administrative Transparency",
    icon: "fact_check"
  }
];

export function App() {
  const [guestId] = useState<string>(() => getGuestId());
  const [showGuestNoticeModal, setShowGuestNoticeModal] = useState<boolean>(() => !hasSeenGuestNotice());
  const [isGuestMenuOpen, setIsGuestMenuOpen] = useState(false);
  const [guestIdCopied, setGuestIdCopied] = useState(false);
  const guestMenuRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<'chat' | 'contracts' | 'search' | 'info'>('chat');
  const [mode, setMode] = useState<'citizen' | 'professional'>('professional');
  const [dossierCount, setDossierCount] = useState<number>(0);
  const [isDossiersOpen, setIsDossiersOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [chatLaunchContext, setChatLaunchContext] = useState<ChatLaunchContext | null>(null);
  const [searchInitialQuery, setSearchInitialQuery] = useState<string | null>(null);
  const [totalProvisions, setTotalProvisions] = useState<number>(59);
  const [geminiApiKey] = useState<string>(() => {
    return localStorage.getItem('bharat_gemini_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
  });
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('bharat_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });
  const API_BASE = (import.meta.env.VITE_API_BASE || 'http://localhost:8000').replace(/\/+$/, '');

  // Splash Screen State
  const [isLoading, setIsLoading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [splashTip] = useState<DailyLegalTip>(() => {
    return DAILY_LEGAL_TIPS[Math.floor(Math.random() * DAILY_LEGAL_TIPS.length)];
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 400);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  // Click-outside & Escape key listener for menus
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (guestMenuRef.current && !guestMenuRef.current.contains(event.target as Node)) {
        setIsGuestMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsGuestMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('bharat_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.body.className = 'bg-[#090a0f] text-[#f8fafc] antialiased m-0 p-0 font-sans';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.body.className = 'bg-[#f4f6fb] text-[#0b1c30] antialiased m-0 p-0 font-sans';
    }
  }, [theme]);

  useEffect(() => {
    fetch(`${API_BASE}/api/dossiers?guest_id=${guestId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDossierCount(data.length);
      })
      .catch(err => console.error('Error fetching dossier count:', err));

    fetch(`${API_BASE}/api/search/sources`)
      .then(res => res.json())
      .then((data: Array<{ provision_count?: number }>) => {
        if (Array.isArray(data)) {
          const count = data.reduce((acc, s) => acc + (s.provision_count || 0), 0);
          if (count > 0) setTotalProvisions(count);
        }
      })
      .catch(err => console.error('Error fetching sources count:', err));
  }, [guestId]);

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      isDark ? 'bg-[#090a0f] text-[#f8fafc]' : 'bg-[#f4f6fb] text-[#0b1c30]'
    }`}>
      {/* INSTITUTIONAL DAILY LAWS LOADING / SPLASH SCREEN */}
      {isLoading && (
        <div 
          id="app-splash-screen"
          className={`fixed inset-0 z-[10000] flex flex-col items-center justify-between p-4 sm:p-8 transition-opacity duration-400 select-none ${
            isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          style={{ backgroundColor: isDark ? '#090a0f' : '#f4f6fb' }}
        >
          {/* Top Status Header */}
          <div className="w-full flex items-center justify-between max-w-xl opacity-75 text-[10px] sm:text-[11px] font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-emerald-400 font-semibold">Bharatiya Statutory Engine</span>
            </span>
            <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
              BNS • BNSS • BSA 2023
            </span>
          </div>

          {/* Central Emblem & Daily Legal Right Card */}
          <div className="flex flex-col items-center max-w-md w-full text-center gap-4 sm:gap-5 my-auto">
            {/* Pulsing Brand Emblem */}
            <div className="relative flex items-center justify-center">
              <div className="absolute -inset-2.5 rounded-2xl bg-gradient-to-r from-[#ff7722]/30 via-[#3755c3]/30 to-emerald-500/30 blur-md animate-pulse"></div>
              <img 
                src="/logo.png" 
                alt="भारत Legal Intelligence" 
                className={`relative w-14 h-14 sm:w-20 sm:h-20 rounded-2xl object-contain shadow-2xl p-1 border ${
                  isDark ? 'bg-[#131726] border-[#242b42]' : 'bg-white border-[#e2e8f0]'
                }`}
              />
            </div>

            {/* Brand Title */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-black text-xl sm:text-2xl tracking-tight text-[#ff7722]">भारत</span>
                <span className={`font-black text-xl sm:text-2xl tracking-tight ${isDark ? 'text-white' : 'text-[#00288e]'}`}>
                  Legal Intelligence
                </span>
              </div>
              <p className={`text-[11px] sm:text-[12px] font-medium mt-0.5 ${isDark ? 'text-[#94a3b8]' : 'text-[#565e74]'}`}>
                Official Constitutional & Courtroom Precedents Platform
              </p>
            </div>

            {/* Smooth Progress Indicator */}
            <div className="w-full max-w-xs flex flex-col items-center gap-1.5">
              <div className="w-full h-1.5 rounded-full overflow-hidden bg-zinc-700/20">
                <div className="h-full bg-gradient-to-r from-[#ff7722] via-[#00288e] to-emerald-400 rounded-full w-full animate-pulse"></div>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px] animate-spin text-emerald-400">sync</span>
                Loading Central Acts & Landmark Precedents...
              </span>
            </div>

            {/* Daily Practical Law Tip for Citizens & Advocates */}
            <div className={`w-full p-3.5 sm:p-4 rounded-xl border text-left shadow-lg transition-colors ${
              isDark ? 'bg-[#111422] border-[#242b42]' : 'bg-white border-[#dce9ff]'
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-amber-400">lightbulb</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    Daily Law for Everyday Use
                  </span>
                </div>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                  isDark ? 'bg-white/5 border-white/10 text-zinc-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}>
                  {splashTip.category}
                </span>
              </div>

              <h4 className="text-[13px] sm:text-[14px] font-bold text-[#ff7722] mb-0.5">
                {splashTip.title}
              </h4>
              <p className="text-[10.5px] font-mono text-emerald-400 font-semibold mb-1.5">
                ⚖️ {splashTip.provision}
              </p>
              <p className={`text-[11.5px] leading-relaxed mb-2.5 ${isDark ? 'text-[#cbd5e1]' : 'text-[#334155]'}`}>
                {splashTip.description}
              </p>
              <div className={`p-2 rounded-lg text-[10.5px] flex items-center gap-1.5 ${
                isDark ? 'bg-emerald-950/30 border border-emerald-900/40 text-emerald-300' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              }`}>
                <span className="material-symbols-outlined text-[14px] shrink-0 text-emerald-400">verified</span>
                <span><strong>Citizen / Advocate Rule:</strong> {splashTip.actionableTip}</span>
              </div>
            </div>
          </div>

          {/* Bottom Legal Note */}
          <div className="text-[9.5px] font-mono opacity-50 text-center">
            Grounded in Central Acts • Law Ministry Directives • Supreme Court of India
          </div>
        </div>
      )}

      {/* FIXED TOP HEADER (Exact 84px on sm+, 56px on mobile, z-[99] overflow-visible) */}
      <header id="app-header" className={`no-print fixed top-0 left-0 right-0 z-[99] backdrop-blur-md border-b shadow-md transition-colors duration-200 overflow-visible ${
        isDark 
          ? 'bg-[#0d0f17]/95 border-[#1f2438]' 
          : 'bg-white/95 border-[#e2e8f0]'
      }`}>
        {/* Main Bar (h-14 / 56px across all viewports to minimize wasted vertical space) */}
        <div className="h-14 w-full px-2 sm:px-4 md:px-6 flex items-center justify-between gap-1.5 sm:gap-3">
          {/* ZONE 1: BRAND IDENTITY (Left, Fluid & Compact) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 sm:max-w-[28%] min-w-0">
            {/* Clickable Brand seal & title (Returns to Chat Assistant Home) */}
            <button
              type="button"
              onClick={() => { setActiveTab('chat'); setIsMobileMenuOpen(false); }}
              className="flex items-center gap-1.5 sm:gap-2 text-left cursor-pointer group shrink-0 focus:outline-none"
              title="Return to Bharat Legal Assistant Home"
            >
              <img 
                src="/logo.png" 
                alt="भारत Legal Intelligence" 
                className={`w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg object-contain shadow-xs p-0.5 border group-hover:scale-105 transition-transform ${
                  isDark ? 'bg-[#131726] border-[#242b42]' : 'bg-white border-[#e2e8f0]'
                }`}
              />
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1 whitespace-nowrap">
                  <span className="font-extrabold text-[13px] sm:text-[14px] tracking-tight text-[#ff7722]">भारत</span>
                  <span className={`font-extrabold text-[13px] sm:text-[14px] tracking-tight ${
                    isDark ? 'text-white' : 'text-[#00288e]'
                  }`}>
                    Legal
                  </span>
                  <span className={`font-extrabold text-[13px] sm:text-[14px] tracking-tight hidden min-[400px]:inline ${
                    isDark ? 'text-white' : 'text-[#00288e]'
                  }`}>
                    Intelligence
                  </span>
                </div>
                <span className={`text-[8.5px] font-medium leading-tight hidden lg:block truncate ${
                  isDark ? 'text-[#94a3b8]' : 'text-[#565e74]'
                }`}>
                  Constitutional & Statutory Platform
                </span>
              </div>
            </button>
          </div>

          {/* ZONE 2A: MOBILE ACTIVE MODULE INDICATOR (< sm / < 640px) */}
          <div className="sm:hidden flex items-center justify-center flex-1 min-w-0 px-1">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className={`h-8 flex items-center gap-1 px-2 rounded-lg border text-[11px] font-bold transition-all cursor-pointer shadow-xs max-w-[130px] truncate ${
                isDark 
                  ? 'bg-[#131624] text-white border-[#23283f] hover:bg-[#1a1f33]' 
                  : 'bg-[#eff4ff] text-[#00288e] border-[#dce9ff] hover:bg-[#e5eeff]'
              }`}
              title="Open Chamber Navigation Menu"
              aria-label="Open Chamber Navigation Menu"
            >
              <span className="material-symbols-outlined text-[14px] text-[#ff7722] shrink-0">
                {activeTab === 'chat' ? 'chat' : activeTab === 'contracts' ? 'edit_document' : activeTab === 'search' ? 'account_balance' : 'fact_check'}
              </span>
              <span className="font-semibold tracking-tight truncate">
                {activeTab === 'chat' ? 'Chat' : activeTab === 'contracts' ? 'Contracts' : activeTab === 'search' ? 'Search' : 'Validator'}
              </span>
              <span className="material-symbols-outlined text-[13px] text-zinc-400 shrink-0">
                expand_more
              </span>
            </button>
          </div>

          {/* ZONE 2: PRIMARY NAVIGATION (Center, Fluid 4-Column Proportional Flex Grid) */}
          <div className="hidden sm:flex items-center justify-center flex-1 min-w-0 px-1 sm:px-2">
            {/* Desktop Full Navigation Tabs (>= lg / 1024px+): Fluid 4-Column Grid, Equal 25% Share Each */}
            <nav className={`hidden lg:flex items-center w-full max-w-[clamp(440px,46vw,660px)] gap-1 p-0.5 rounded-lg border shadow-2xs ${
              isDark ? 'bg-[#131624] border-[#23283f]' : 'bg-[#eff4ff] border-[#dce9ff]'
            }`}>
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`flex-1 min-w-0 px-1.5 xl:px-2 py-0.5 xl:py-1 rounded-md text-[clamp(9.5px,0.72vw,10.5px)] font-medium transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                  activeTab === 'chat'
                    ? isDark ? 'bg-white text-black shadow-2xs font-bold' : 'bg-[#00288e] text-white shadow-2xs font-bold'
                    : isDark ? 'text-[#94a3b8] hover:text-white hover:bg-white/5' : 'text-[#565e74] hover:text-[#0b1c30] hover:bg-[#e5eeff]'
                }`}
                title="Legal Chat Assistant"
              >
                <span className="material-symbols-outlined text-[12.5px] xl:text-[13px] shrink-0">chat</span>
                <span className="tracking-tight truncate">Chat Assistant</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('contracts')}
                className={`flex-1 min-w-0 px-1.5 xl:px-2 py-0.5 xl:py-1 rounded-md text-[clamp(9.5px,0.72vw,10.5px)] font-medium transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                  activeTab === 'contracts'
                    ? isDark ? 'bg-white text-black shadow-2xs font-bold' : 'bg-[#00288e] text-white shadow-2xs font-bold'
                    : isDark ? 'text-[#94a3b8] hover:text-white hover:bg-white/5' : 'text-[#565e74] hover:text-[#0b1c30] hover:bg-[#e5eeff]'
                }`}
                title="AI Contract Studio & Redline Risk Scanner"
              >
                <span className="material-symbols-outlined text-[12.5px] xl:text-[13px] shrink-0">edit_document</span>
                <span className="tracking-tight truncate">AI Contract Studio</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('search')}
                className={`flex-1 min-w-0 px-1.5 xl:px-2 py-0.5 xl:py-1 rounded-md text-[clamp(9.5px,0.72vw,10.5px)] font-medium transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                  activeTab === 'search'
                    ? isDark ? 'bg-white text-black shadow-2xs font-bold' : 'bg-[#00288e] text-white shadow-2xs font-bold'
                    : isDark ? 'text-[#94a3b8] hover:text-white hover:bg-white/5' : 'text-[#565e74] hover:text-[#0b1c30] hover:bg-[#e5eeff]'
                }`}
                title="Statute & Case Search"
              >
                <span className="material-symbols-outlined text-[12.5px] xl:text-[13px] shrink-0">account_balance</span>
                <span className="tracking-tight truncate">Statute Search</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('info')}
                className={`flex-1 min-w-0 px-1.5 xl:px-2 py-0.5 xl:py-1 rounded-md text-[clamp(9.5px,0.72vw,10.5px)] font-medium transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                  activeTab === 'info'
                    ? isDark ? 'bg-white text-black shadow-2xs font-bold' : 'bg-[#00288e] text-white shadow-2xs font-bold'
                    : isDark ? 'text-[#94a3b8] hover:text-white hover:bg-white/5' : 'text-[#565e74] hover:text-[#0b1c30] hover:bg-[#e5eeff]'
                }`}
                title="Knowledge & Validator Hub"
              >
                <span className="material-symbols-outlined text-[12.5px] xl:text-[13px] shrink-0">fact_check</span>
                <span className="tracking-tight truncate">Validator Hub</span>
              </button>
            </nav>

            {/* Medium Screens Compact Segmented Bar (sm to lg: 640px - 1023px) */}
            <nav className={`flex lg:hidden items-center gap-0.5 p-0.5 rounded-lg border ${
              isDark ? 'bg-[#131624] border-[#23283f]' : 'bg-[#eff4ff] border-[#dce9ff]'
            }`}>
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`px-1.5 py-0.5 rounded-md text-[9.5px] font-medium transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                  activeTab === 'chat'
                    ? isDark ? 'bg-white text-black shadow-2xs font-bold' : 'bg-[#00288e] text-white shadow-2xs font-bold'
                    : isDark ? 'text-[#94a3b8] hover:text-white hover:bg-white/5' : 'text-[#565e74] hover:text-[#0b1c30] hover:bg-[#e5eeff]'
                }`}
                title="Legal Chat Assistant"
              >
                <span className="material-symbols-outlined text-[12px]">chat</span>
                <span>Chat</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('contracts')}
                className={`px-1.5 py-0.5 rounded-md text-[9.5px] font-medium transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                  activeTab === 'contracts'
                    ? isDark ? 'bg-white text-black shadow-2xs font-bold' : 'bg-[#00288e] text-white shadow-2xs font-bold'
                    : isDark ? 'text-[#94a3b8] hover:text-white hover:bg-white/5' : 'text-[#565e74] hover:text-[#0b1c30] hover:bg-[#e5eeff]'
                }`}
                title="AI Contract Studio"
              >
                <span className="material-symbols-outlined text-[12px]">edit_document</span>
                <span>Contracts</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('search')}
                className={`px-1.5 py-0.5 rounded-md text-[9.5px] font-medium transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                  activeTab === 'search'
                    ? isDark ? 'bg-white text-black shadow-2xs font-bold' : 'bg-[#00288e] text-white shadow-2xs font-bold'
                    : isDark ? 'text-[#94a3b8] hover:text-white hover:bg-white/5' : 'text-[#565e74] hover:text-[#0b1c30] hover:bg-[#e5eeff]'
                }`}
                title="Statute & Case Search"
              >
                <span className="material-symbols-outlined text-[12px]">account_balance</span>
                <span>Search</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('info')}
                className={`px-1.5 py-0.5 rounded-md text-[9.5px] font-medium transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                  activeTab === 'info'
                    ? isDark ? 'bg-white text-black shadow-2xs font-bold' : 'bg-[#00288e] text-white shadow-2xs font-bold'
                    : isDark ? 'text-[#94a3b8] hover:text-white hover:bg-white/5' : 'text-[#565e74] hover:text-[#0b1c30] hover:bg-[#e5eeff]'
                }`}
                title="Knowledge & Validator Hub"
              >
                <span className="material-symbols-outlined text-[12px]">fact_check</span>
                <span>Validator</span>
              </button>
            </nav>
          </div>

          {/* ZONE 3: UTILITY CONTROLS (Right, Fluid & Flexible) */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0">
            {/* Neon pgvector Telemetry Pill (Large Desktop >= xl / 1280px+) */}
            <div className={`hidden xl:flex items-center gap-[clamp(4px,0.4vw,8px)] px-[clamp(8px,0.7vw,12px)] py-0.5 xl:py-1 rounded-full text-[clamp(9.5px,0.72vw,11px)] font-mono border shadow-2xs whitespace-nowrap ${
              isDark 
                ? 'bg-[#0d1f17] border-emerald-900/60 text-emerald-300' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
              <span className="w-1.5 h-1.5 2xl:w-2 2xl:h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span className="font-semibold hidden 2xl:inline">Neon pgvector: Active • {totalProvisions} Provisions</span>
              <span className="font-semibold inline 2xl:hidden">Neon pgvector: {totalProvisions} Provisions</span>
            </div>

            {/* Citizen vs Advocate Mode Segmented Control (Desktop >= sm) */}
            <div className={`hidden sm:flex items-center p-0.5 2xl:p-1 rounded-full border shadow-2xs whitespace-nowrap ${
              isDark ? 'bg-[#131624] border-[#23283f]' : 'bg-[#eff4ff] border-[#dce9ff]'
            }`}>
              <button
                type="button"
                onClick={() => setMode('citizen')}
                className={`px-[clamp(8px,0.7vw,14px)] py-0.5 xl:py-1 rounded-full text-[clamp(9.5px,0.72vw,11px)] font-semibold transition-all cursor-pointer ${
                  mode === 'citizen'
                    ? isDark ? 'bg-white text-black shadow-md font-bold' : 'bg-[#00288e] text-white shadow-md font-bold'
                    : isDark ? 'text-[#94a3b8] hover:text-white' : 'text-[#565e74] hover:text-[#0b1c30]'
                }`}
              >
                Citizen
              </button>
              <button
                type="button"
                onClick={() => setMode('professional')}
                className={`flex items-center gap-1.5 px-[clamp(8px,0.7vw,14px)] py-0.5 xl:py-1 rounded-full text-[clamp(9.5px,0.72vw,11px)] font-semibold transition-all cursor-pointer ${
                  mode === 'professional'
                    ? isDark ? 'bg-white text-black shadow-md font-bold' : 'bg-[#00288e] text-white shadow-md font-bold'
                    : isDark ? 'text-[#94a3b8] hover:text-white' : 'text-[#565e74] hover:text-[#0b1c30]'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                <span>Advocate</span>
              </button>
            </div>

            {/* GUEST SESSION IDENTITY PILL & MENU (Desktop >= sm) */}
            <div className="hidden sm:block relative shrink-0" ref={guestMenuRef}>
              <button
                type="button"
                onClick={() => setIsGuestMenuOpen(!isGuestMenuOpen)}
                className={`h-8 flex items-center gap-1.5 px-2.5 rounded-full text-[clamp(9.5px,0.72vw,11.5px)] font-mono border transition-all cursor-pointer shadow-2xs whitespace-nowrap ${
                  isDark 
                    ? 'bg-[#131624] text-[#cbd5e1] border-[#23283f] hover:border-[#ff7722]/50 hover:text-white' 
                    : 'bg-[#eff4ff] text-[#0b1c30] border-[#dce9ff] hover:border-[#00288e]/40 hover:bg-[#e5eeff]'
                }`}
                title={`Guest Session #${guestId} • Click for session details`}
                aria-label="Guest Session Details"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff7722] animate-pulse shrink-0"></span>
                <span className="material-symbols-outlined text-[14px] 2xl:text-[16px] text-[#ff7722] shrink-0">shield_person</span>
                <span className="font-bold hidden md:inline">Guest</span>
                <span className="font-extrabold text-[#ff7722]">{guestId.slice(0, 8)}</span>
                <span className={`material-symbols-outlined text-[13px] shrink-0 transition-transform duration-200 ${isGuestMenuOpen ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>

              {isGuestMenuOpen && (
                <div 
                  className={`absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-24px)] rounded-xl shadow-2xl border p-3 z-[9999] animate-in fade-in zoom-in-95 duration-150 ${
                    isDark ? 'border-[#23283f] text-white' : 'border-[#e2e8f0] text-[#0b1c30]'
                  }`}
                  style={{ backgroundColor: isDark ? '#0f121e' : '#ffffff', opacity: 1, zIndex: 9999 }}
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-700/20">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-[#ff7722]">fingerprint</span>
                      <span className="text-[11px] font-black uppercase tracking-wider">Guest Session Identity</span>
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                      Private
                    </span>
                  </div>

                  <div className={`p-2 rounded-lg font-mono text-[11px] break-all border mb-2.5 flex items-center justify-between gap-1.5 ${
                    isDark ? 'bg-[#090b12] border-[#1f2438] text-amber-300' : 'bg-slate-50 border-slate-200 text-[#00288e]'
                  }`}>
                    <span className="font-bold select-all">{guestId}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(guestId);
                        setGuestIdCopied(true);
                        setTimeout(() => setGuestIdCopied(false), 2000);
                      }}
                      className={`p-1 rounded cursor-pointer transition-all ${
                        guestIdCopied ? 'text-emerald-400' : 'text-slate-400 hover:text-white'
                      }`}
                      title="Copy Guest ID"
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        {guestIdCopied ? 'check' : 'content_copy'}
                      </span>
                    </button>
                  </div>

                  <p className={`text-[10px] leading-relaxed mb-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    🔒 Your chat history and chamber research briefs are safely stored locally in this browser. To sync across devices, advocate/citizen profile registration is launching soon.
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Start a fresh session? This will create a new Guest ID and start a new clean chat workspace.')) {
                          resetGuestId();
                          window.location.reload();
                        }
                      }}
                      className={`w-full py-1.5 px-2 rounded-lg text-[10.5px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        isDark ? 'bg-[#181c2d] hover:bg-[#20253d] text-rose-300 border-rose-900/40' : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[13px]">refresh</span>
                      <span>Start Fresh Session</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* THEME TOGGLE SWITCH (Desktop >= sm) */}
            <button
              type="button"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`hidden sm:flex items-center justify-center h-8 px-2.5 rounded-full text-[clamp(9.5px,0.72vw,11.5px)] font-semibold transition-all border cursor-pointer shadow-2xs whitespace-nowrap shrink-0 ${
                isDark 
                  ? 'bg-[#131624] hover:bg-[#1a1f33] text-amber-300 border-[#23283f] hover:border-amber-400/40' 
                  : 'bg-[#eff4ff] hover:bg-[#e5eeff] text-[#00288e] border-[#dce9ff] hover:border-[#00288e]/30'
              }`}
              title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle Theme"
            >
              <span className="material-symbols-outlined text-[15px] sm:text-[16px] 2xl:text-[18px]">
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
              <span className="hidden md:inline font-mono text-[clamp(9.5px,0.72vw,11px)] ml-1 font-bold">
                {isDark ? 'Light' : 'Dark'}
              </span>
            </button>

            {/* Chamber Dossiers Action Button (Available on BOTH Mobile and Desktop!) */}
            <button
              type="button"
              onClick={() => setIsDossiersOpen(true)}
              className={`h-8 flex items-center gap-1.5 px-2.5 sm:px-3 rounded-lg sm:rounded-xl text-[10.5px] sm:text-[clamp(9.5px,0.72vw,11.5px)] font-medium border transition-colors cursor-pointer shadow-xs whitespace-nowrap shrink-0 ${
                isDark 
                  ? 'bg-[#131624] text-[#e2e8f0] border-[#23283f] hover:bg-[#1a1f33]' 
                  : 'bg-[#eff4ff] text-[#0b1c30] border-[#dce9ff] hover:bg-[#e5eeff]'
              }`}
              title="Open Chamber Dossiers Repository"
              aria-label="Open Chamber Dossiers Repository"
            >
              <span className="material-symbols-outlined text-[14px] sm:text-[15px] 2xl:text-[18px] text-[#60a5fa] shrink-0">folder_special</span>
              <span className="hidden sm:inline font-bold">Dossiers</span>
              <span className={`px-1.5 py-0.2 rounded-full font-mono text-[8.5px] sm:text-[9px] 2xl:text-[10px] font-extrabold shadow-xs ${
                isDark ? 'bg-white text-black' : 'bg-[#00288e] text-white'
              }`}>
                {dossierCount}
              </span>
            </button>

            {/* Mobile Chamber Menu Hamburger Trigger (< sm ONLY) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className={`sm:hidden h-8 w-8 rounded-lg border flex items-center justify-center cursor-pointer shadow-2xs shrink-0 transition-all ${
                isMobileMenuOpen
                  ? isDark ? 'bg-white text-black border-white' : 'bg-[#00288e] text-white border-[#00288e]'
                  : isDark ? 'bg-[#131624] text-white border-[#23283f] hover:bg-[#1a1f33]' : 'bg-[#eff4ff] text-[#00288e] border-[#dce9ff] hover:bg-[#e5eeff]'
              }`}
              title="Open Chamber Navigation & Settings"
              aria-label="Open Mobile Menu"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isMobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* MOBILE CHAMBER HUB SLIDE-OVER DRAWER (< sm / < 640px) */}
        {isMobileMenuOpen && (
          <div className="sm:hidden fixed inset-0 z-[1000] flex justify-end animate-in fade-in duration-200">
            {/* Backdrop Blur Overlay */}
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Slide-out Drawer Panel */}
            <div 
              className={`relative w-[85%] max-w-[340px] h-full shadow-2xl flex flex-col z-[1001] border-l animate-in slide-in-from-right duration-200 overflow-y-auto ${
                isDark ? 'bg-[#0d0f17] border-[#1f2438] text-white' : 'bg-white border-[#e2e8f0] text-[#0b1c30]'
              }`}
              style={{ backgroundColor: isDark ? '#0d0f17' : '#ffffff' }}
            >
              {/* Drawer Top Header */}
              <div className="p-4 border-b border-zinc-700/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="Logo" className="w-6 h-6 rounded-md object-contain" />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1 font-extrabold text-[13px] tracking-tight">
                      <span className="text-[#ff7722]">भारत</span>
                      <span className={isDark ? 'text-white' : 'text-[#00288e]'}>Chamber Hub</span>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-400">Controls & Navigation</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center border cursor-pointer ${
                    isDark ? 'bg-[#181c2d] border-[#242b42] text-zinc-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-black'
                  }`}
                  aria-label="Close menu"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              {/* Drawer Body Content */}
              <div className="p-4 flex flex-col gap-4">
                {/* 1. Platform Modules */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Platform Modules
                    </span>
                    <span className="text-[9px] font-mono text-[#ff7722] font-semibold">4 Modules</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { id: 'chat', label: 'Chat Assistant', icon: 'chat', desc: 'Constitutional AI & Precedents' },
                      { id: 'contracts', label: 'AI Contract Studio', icon: 'edit_document', desc: 'Drafting & Redline Risk Audit' },
                      { id: 'search', label: 'Statute Search', icon: 'account_balance', desc: '59+ Acts, BNS Concordance' },
                      { id: 'info', label: 'Validator Hub', icon: 'fact_check', desc: 'Truth Audit & Hash Verification' },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(tab.id as any);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                          activeTab === tab.id
                            ? isDark
                              ? 'bg-white text-black font-bold border-white shadow-md'
                              : 'bg-[#00288e] text-white font-bold border-[#00288e] shadow-md'
                            : isDark
                              ? 'bg-[#131624] text-zinc-300 border-[#23283f] hover:bg-[#1a1f33]'
                              : 'bg-[#f8f9ff] text-[#334155] border-[#e2e8f0] hover:bg-[#eff4ff]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`material-symbols-outlined text-[18px] shrink-0 ${
                            activeTab === tab.id ? (isDark ? 'text-black' : 'text-white') : 'text-[#ff7722]'
                          }`}>
                            {tab.icon}
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[12px] font-bold leading-snug truncate">{tab.label}</span>
                            <span className={`text-[9px] truncate ${
                              activeTab === tab.id ? (isDark ? 'text-black/70' : 'text-white/80') : 'text-zinc-400'
                            }`}>
                              {tab.desc}
                            </span>
                          </div>
                        </div>
                        {activeTab === tab.id && (
                          <span className="material-symbols-outlined text-[16px] shrink-0">check_circle</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Legal Persona Mode */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 block">
                    Legal Persona Mode
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMode('citizen')}
                      className={`p-2.5 rounded-xl border flex flex-col gap-1 text-left cursor-pointer transition-all ${
                        mode === 'citizen'
                          ? isDark ? 'bg-[#ff7722]/15 border-[#ff7722] text-[#ff7722] font-bold' : 'bg-orange-50 border-[#ff7722] text-[#ff7722] font-bold'
                          : isDark ? 'bg-[#131624] border-[#23283f] text-zinc-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="material-symbols-outlined text-[16px]">person</span>
                        {mode === 'citizen' && <span className="material-symbols-outlined text-[14px]">check</span>}
                      </div>
                      <span className="text-[11px] font-bold">Citizen</span>
                      <span className="text-[8.5px] leading-tight opacity-75">Everyday rights & plain terms</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMode('professional')}
                      className={`p-2.5 rounded-xl border flex flex-col gap-1 text-left cursor-pointer transition-all ${
                        mode === 'professional'
                          ? isDark ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400 font-bold' : 'bg-emerald-50 border-emerald-600 text-emerald-800 font-bold'
                          : isDark ? 'bg-[#131624] border-[#23283f] text-zinc-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="material-symbols-outlined text-[16px]">gavel</span>
                        {mode === 'professional' && <span className="material-symbols-outlined text-[14px]">check</span>}
                      </div>
                      <span className="text-[11px] font-bold">Advocate</span>
                      <span className="text-[8.5px] leading-tight opacity-75">Court citations & sections</span>
                    </button>
                  </div>
                </div>

                {/* 3. Theme Toggle */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 block">
                    Appearance & Theme
                  </span>
                  <div className={`p-1 rounded-xl border flex items-center ${
                    isDark ? 'bg-[#131624] border-[#23283f]' : 'bg-[#eff4ff] border-[#dce9ff]'
                  }`}>
                    <button
                      type="button"
                      onClick={() => setTheme('dark')}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        isDark ? 'bg-white text-black shadow-xs' : 'text-zinc-500 hover:text-black'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">dark_mode</span>
                      <span>Dark</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme('light')}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        !isDark ? 'bg-[#00288e] text-white shadow-xs' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">light_mode</span>
                      <span>Light</span>
                    </button>
                  </div>
                </div>

                {/* 4. Guest Session Identity */}
                <div className={`p-3 rounded-xl border ${
                  isDark ? 'bg-[#131624]/60 border-[#23283f]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px] text-[#ff7722]">shield_person</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider">Guest Session</span>
                    </div>
                    <span className="text-[8.5px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                      Private
                    </span>
                  </div>

                  <div className={`p-1.5 px-2 rounded-lg font-mono text-[10px] flex items-center justify-between gap-1 mb-2 border ${
                    isDark ? 'bg-[#090b12] border-[#1f2438] text-amber-300' : 'bg-white border-slate-200 text-[#00288e]'
                  }`}>
                    <span className="font-bold select-all truncate">{guestId}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(guestId);
                        setGuestIdCopied(true);
                        setTimeout(() => setGuestIdCopied(false), 2000);
                      }}
                      className="p-1 rounded cursor-pointer text-slate-400 hover:text-white"
                      title="Copy Guest ID"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {guestIdCopied ? 'check' : 'content_copy'}
                      </span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Start a fresh session? This will create a new Guest ID and clean chat workspace.')) {
                        resetGuestId();
                        window.location.reload();
                      }
                    }}
                    className={`w-full py-1.5 rounded-lg text-[10.5px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      isDark ? 'bg-[#181c2d] hover:bg-[#20253d] text-rose-300 border-rose-900/40' : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[13px]">refresh</span>
                    <span>Start Fresh Session</span>
                  </button>
                </div>

                {/* 5. System Status */}
                <div className="flex items-center justify-between px-1 text-[9.5px] font-mono text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Neon pgvector: Active</span>
                  </span>
                  <span>{totalProvisions} Provisions</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Secondary Statutory Sub-Header (Ticker Bar - h-7 / 28px, hidden on small mobile to maximize screen) */}
        <div id="statutory-ticker" className={`hidden sm:block h-7 w-full border-t overflow-hidden transition-colors ${
          isDark 
            ? 'bg-[#06070a] border-[#1a1e2e] text-[#94a3b8]' 
            : 'bg-[#f8f9ff] border-[#e2e8f0] text-[#565e74]'
        }`}>
          <div className="w-full h-full px-[clamp(10px,1.8vw,32px)] flex items-center justify-between text-[clamp(9.5px,0.7vw,11px)] font-mono">
            <div className="flex items-center gap-2 truncate">
              <span className={`px-1.5 py-0.2 rounded font-bold uppercase tracking-wider text-[8.5px] 2xl:text-[9.5px] border shrink-0 ${
                isDark 
                  ? 'bg-white/10 text-white border-white/15' 
                  : 'bg-[#00288e]/10 text-[#00288e] border-[#00288e]/20'
              }`}>
                Statutory Engine
              </span>
              <span className={`truncate ${isDark ? 'text-[#cbd5e1]' : 'text-[#334155]'}`}>
                Institutional Legal Intelligence Engine • Aligned with BNS 2023, BNSS 2023 & Constitution of India
              </span>
            </div>
            <div className={`hidden lg:flex items-center gap-3 shrink-0 ${
              isDark ? 'text-[#94a3b8]' : 'text-[#565e74]'
            }`}>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                AIR / SCC Benchmarks: Synced
              </span>
              <span>•</span>
              <span>Art. 141 Binding Precedent</span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN SCREEN CANVAS (Responsive top padding: 56px on mobile, 84px on sm+) */}
      <div className="pt-14 sm:pt-[84px] flex-1 flex flex-col min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-84px)] w-full">
        <main className={`flex-1 flex flex-col w-full transition-colors duration-200 ${
          isDark ? 'bg-[#090a0f]' : 'bg-[#f4f6fb]'
        }`}>
          {activeTab === 'chat' && (
            <ChatView 
              guestId={guestId}
              apiBase={API_BASE} 
              mode={mode} 
              setMode={setMode} 
              totalProvisions={totalProvisions}
              theme={theme}
              activeTab={activeTab}
              onSelectTab={(tab) => setActiveTab(tab)}
              launchContext={chatLaunchContext}
              onClearLaunchContext={() => setChatLaunchContext(null)}
              onSwitchToSearch={(query?: string) => {
                setSearchInitialQuery(query || null);
                setActiveTab('search');
              }} 
              geminiApiKey={geminiApiKey}
            />
          )}
          {activeTab === 'contracts' && (
            <ContractStudioView 
              isDark={isDark} 
              mode={mode} 
              apiBase={API_BASE}
            />
          )}
          {activeTab === 'search' && (
            <SearchView 
              apiBase={API_BASE} 
              theme={theme}
              initialQuery={searchInitialQuery || undefined}
              onClearInitialQuery={() => setSearchInitialQuery(null)}
              onOpenInChat={(ctx) => {
                setChatLaunchContext(ctx);
                setActiveTab('chat');
              }} 
            />
          )}
          {activeTab === 'info' && (
            <InfoView 
              apiBase={API_BASE} 
              theme={theme}
            />
          )}
        </main>
      </div>

      {/* Chamber Dossiers Slide-Over Drawer */}
      <DossiersDrawer
        guestId={guestId}
        isOpen={isDossiersOpen}
        onClose={() => setIsDossiersOpen(false)}
        apiBase={API_BASE}
        theme={theme}
        onDossierCountChange={setDossierCount}
        onLoadInChat={(dossier) => {
          setChatLaunchContext({
            type: 'dossier',
            title: dossier.title,
            query: dossier.initial_query || `Docket ${dossier.docket_number}: ${dossier.title}`,
            category: dossier.category,
            autoExecute: false,
            dossier: dossier
          });
          setActiveTab('chat');
          setIsDossiersOpen(false);
        }}
      />

      {/* FIRST-VISIT GUEST NOTICE MODAL */}
      {showGuestNoticeModal && (
        <div className="fixed inset-0 z-[10001] bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs select-none animate-in fade-in duration-200">
          <div className={`w-full max-w-md rounded-2xl border shadow-2xl p-5 sm:p-6 space-y-4 ${
            isDark ? 'bg-[#0f121e] border-[#242b42] text-white' : 'bg-white border-[#e2e8f0] text-[#0b1c30]'
          }`}>
            {/* Header with Seal and Guest ID */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00288e] to-[#ff7722] flex items-center justify-center text-white shadow-md shrink-0">
                  <span className="material-symbols-outlined text-[22px]">shield_person</span>
                </div>
                <div>
                  <h3 className="text-[15px] font-black tracking-tight">Private Guest Session Active</h3>
                  <span className="text-[11px] font-mono font-bold text-[#ff7722]">
                    Assigned ID: {guestId}
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9.5px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Device Private
              </span>
            </div>

            <div className={`p-3.5 rounded-xl border text-[11.5px] leading-relaxed space-y-2 ${
              isDark ? 'bg-[#090b12] border-[#1f2438] text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <p>
                Welcome to <strong>Bharat Legal Intelligence</strong>. To protect judicial confidentiality and citizen privacy, your legal inquiries, statutory analyses, and chamber briefs are saved <strong>exclusively in this browser</strong> on your device under your unique Guest ID.
              </p>
              <p className="text-[10.5px] text-slate-400">
                ⚖️ <em>We are currently enabling our secure Bar Council verified Advocate & Citizen Profile System. Until then, you can freely use all AI research tools, contract generators, and precedent databases as a Guest user.</em>
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(guestId);
                  setGuestIdCopied(true);
                  setTimeout(() => setGuestIdCopied(false), 2000);
                }}
                className={`px-3 py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  guestIdCopied
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : isDark ? 'bg-[#181c2d] hover:bg-[#20253d] text-white border-[#2b334d]' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">
                  {guestIdCopied ? 'check' : 'content_copy'}
                </span>
                <span>{guestIdCopied ? 'Copied ID' : 'Copy Guest ID'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  markGuestNoticeSeen();
                  setShowGuestNoticeModal(false);
                }}
                className="px-4 py-2 rounded-xl text-[11.5px] font-black bg-gradient-to-r from-[#00288e] to-[#ff7722] hover:opacity-90 text-white flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
              >
                <span>Start Legal Research</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
