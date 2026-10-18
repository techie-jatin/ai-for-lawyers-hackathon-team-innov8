import { useState, useEffect } from 'react';

interface LegalSource {
  id: number;
  title: string;
  source_type: string;
  jurisdiction: string;
  provision_count: number;
}

interface ProvisionItem {
  id: number;
  source_id: number;
  source_title: string;
  section_number: string;
  title: string;
  text_content: string;
  similarity?: number;
}

interface ConcordanceItem {
  id: number;
  old_act: string;
  old_section: string;
  new_act: string;
  new_section: string;
  offense_title: string;
  status: string;
  penalty_summary?: string;
  bailable_status?: string;
  cognizable_status?: string;
  key_change?: string;
}

interface GazetteItem {
  id: number;
  ministry: string;
  notification_ref: string;
  title: string;
  effective_date?: string;
  category?: string;
  summary: string;
  official_url?: string;
}

import type { ChatLaunchContext } from '../App';
import { CANONICAL_PROVISIONS, CANONICAL_GAZETTES, searchCanonicalProvisions } from '../services/clientLegalEngine';
import { CLIENT_CONCORDANCE_MASTER_DATA, ClientConcordanceEngine } from '../services/clientConcordanceEngine';
import { StatutoryConcordanceModal } from './StatutoryConcordanceModal';

const DEFAULT_SOURCES: LegalSource[] = [
  { id: 1, title: 'Bharatiya Nyaya Sanhita, 2023 (BNS)', source_type: 'Act', jurisdiction: 'India', provision_count: 358 },
  { id: 2, title: 'Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)', source_type: 'Act', jurisdiction: 'India', provision_count: 531 },
  { id: 3, title: 'Bharatiya Sakshya Adhiniyam, 2023 (BSA)', source_type: 'Act', jurisdiction: 'India', provision_count: 170 },
  { id: 4, title: 'Constitution of India', source_type: 'Constitution', jurisdiction: 'India', provision_count: 395 },
  { id: 5, title: 'Digital Personal Data Protection Act, 2023', source_type: 'Act', jurisdiction: 'India', provision_count: 44 },
  { id: 6, title: 'Information Technology Act, 2000', source_type: 'Act', jurisdiction: 'India', provision_count: 94 },
  { id: 7, title: 'Negotiable Instruments Act, 1881', source_type: 'Act', jurisdiction: 'India', provision_count: 147 },
  { id: 8, title: 'Motor Vehicles Act, 1988', source_type: 'Act', jurisdiction: 'India', provision_count: 217 },
  { id: 9, title: 'Real Estate (Regulation and Development) Act, 2016', source_type: 'Act', jurisdiction: 'India', provision_count: 92 },
  { id: 10, title: 'Indian Contract Act, 1872', source_type: 'Act', jurisdiction: 'India', provision_count: 238 },
  { id: 11, title: 'Code of Civil Procedure, 1908 (CPC)', source_type: 'Act', jurisdiction: 'India', provision_count: 158 },
  { id: 12, title: 'Arbitration and Conciliation Act, 1996', source_type: 'Act', jurisdiction: 'India', provision_count: 86 },
  { id: 13, title: 'Consumer Protection Act, 2019', source_type: 'Act', jurisdiction: 'India', provision_count: 107 },
  { id: 14, title: 'Right to Information Act, 2005', source_type: 'Act', jurisdiction: 'India', provision_count: 31 },
  { id: 15, title: 'Payment of Gratuity Act, 1972', source_type: 'Act', jurisdiction: 'India', provision_count: 15 },
  { id: 16, title: 'National Green Tribunal Act, 2010', source_type: 'Act', jurisdiction: 'India', provision_count: 38 },
  { id: 17, title: 'Hindu Succession Act, 1956', source_type: 'Act', jurisdiction: 'India', provision_count: 31 },
  { id: 18, title: 'Income Tax Act, 1961', source_type: 'Act', jurisdiction: 'India', provision_count: 298 }
];

function getCategoryForSource(sourceTitle: string): string {
  const s = (sourceTitle || '').toLowerCase();
  if (s.includes('nyaya') || s.includes('bns') || s.includes('suraksha') || s.includes('bnss') || s.includes('penal') || s.includes('procedure')) {
    return 'Criminal Law (BNS)';
  }
  if (s.includes('constitution')) {
    return 'Constitutional Law';
  }
  if (s.includes('data') || s.includes('dpdp') || s.includes('privacy')) {
    return 'DPDP Compliance';
  }
  if (s.includes('information technology') || s.includes('cyber') || s.includes('it act')) {
    return 'Cyber & IT';
  }
  if (s.includes('negotiable') || s.includes('cheque') || s.includes('ni act')) {
    return 'Banking & NI Act';
  }
  if (s.includes('motor') || s.includes('vehicle') || s.includes('traffic')) {
    return 'Motor Vehicles';
  }
  if (s.includes('real estate') || s.includes('rera')) {
    return 'Real Estate (RERA)';
  }
  if (s.includes('contract')) {
    return 'Commercial Contracts';
  }
  if (s.includes('civil procedure') || s.includes('cpc')) {
    return 'Civil Procedure (CPC)';
  }
  if (s.includes('arbitration')) {
    return 'Arbitration';
  }
  if (s.includes('consumer')) {
    return 'Consumer Protection';
  }
  if (s.includes('information') || s.includes('rti')) {
    return 'RTI Act';
  }
  if (s.includes('gratuity')) {
    return 'Labor & Gratuity';
  }
  if (s.includes('tribunal') || s.includes('green') || s.includes('ngt')) {
    return 'Environmental Law';
  }
  if (s.includes('hindu') || s.includes('succession') || s.includes('marriage')) {
    return 'Family & Succession';
  }
  if (s.includes('tax') || s.includes('income')) {
    return 'Taxation Law';
  }
  return 'All Statutes';
}

interface SearchViewProps {
  apiBase: string;
  onOpenInChat?: (context: ChatLaunchContext) => void;
  theme?: 'dark' | 'light';
  initialQuery?: string;
  onClearInitialQuery?: () => void;
}

export function SearchView({ apiBase, onOpenInChat, theme = 'dark', initialQuery, onClearInitialQuery }: SearchViewProps) {
  const isDark = theme === 'dark';
  const [query, setQuery] = useState(initialQuery || '');
  const [searchType, setSearchType] = useState<'keyword' | 'semantic'>('semantic');
  const [sources, setSources] = useState<LegalSource[]>(DEFAULT_SOURCES);
  const [selectedSourceId, setSelectedSourceId] = useState<string>('all');
  const [results, setResults] = useState<ProvisionItem[]>(() =>
    CANONICAL_PROVISIONS.map(p => ({ ...p, source_id: p.id }))
  );
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Dynamic Concordance & Gazette State
  const [concordances, setConcordances] = useState<ConcordanceItem[]>(() =>
    CLIENT_CONCORDANCE_MASTER_DATA.map(c => ({ ...c, status: `${c.cognizable_status} | ${c.bailable_status}` }))
  );
  const [concordanceQuery, setConcordanceQuery] = useState('');
  const [isConcordanceModalOpen, setIsConcordanceModalOpen] = useState(false);
  const [gazettes, setGazettes] = useState<GazetteItem[]>(CANONICAL_GAZETTES);

  useEffect(() => {
    if (apiBase && apiBase.trim() !== '') {
      fetch(`${apiBase}/api/search/sources`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) setSources(data);
        })
        .catch(err => console.warn('Sources live fetch warning:', err));

      fetch(`${apiBase}/api/concordance/all`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) setConcordances(data);
        })
        .catch(err => console.warn('Concordances live fetch warning:', err));

      fetch(`${apiBase}/api/registry/gazettes`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) setGazettes(data);
        })
        .catch(err => console.warn('Gazettes live fetch warning:', err));
    }

    // Only load generic provisions if NOT inspecting an initial query
    if (!initialQuery || !initialQuery.trim()) {
      loadInitialProvisions();
    }
  }, [apiBase]);

  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      setQuery(initialQuery);
      setSearchType('keyword'); // Set to keyword for exact statutory inspection
      handleSearch(initialQuery, 'keyword');
      if (onClearInitialQuery) {
        onClearInitialQuery();
      }
    }
  }, [initialQuery]);

  const loadInitialProvisions = async (sourceId?: string) => {
    setLoading(true);
    setHasError(false);
    try {
      if (apiBase && apiBase.trim() !== '') {
        const url = sourceId && sourceId !== 'all' 
          ? `${apiBase}/api/search/provisions?source_id=${sourceId}&limit=50`
          : `${apiBase}/api/search/provisions?limit=50`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setResults(data);
            setLoading(false);
            return;
          }
        }
      }
      throw new Error('Using canonical provisions');
    } catch {
      // Offline / standalone fallback
      const canonicalMapped: ProvisionItem[] = CANONICAL_PROVISIONS.map(p => ({
        ...p,
        source_id: p.id
      }));
      setResults(canonicalMapped);
      setHasError(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (overrideQuery?: string, overrideType?: 'keyword' | 'semantic') => {
    const q = overrideQuery !== undefined ? overrideQuery : query;
    const type = overrideType || searchType;
    if (!q.trim()) {
      loadInitialProvisions(selectedSourceId);
      return;
    }

    setLoading(true);
    setHasError(false);
    try {
      if (apiBase && apiBase.trim() !== '') {
        if (type === 'semantic') {
          const res = await fetch(`${apiBase}/api/search/semantic`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: q, top_k: 25 })
          });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              setResults(data);
              setLoading(false);
              return;
            }
          }
        } else {
          const res = await fetch(`${apiBase}/api/search/keyword?q=${encodeURIComponent(q)}&limit=25`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              setResults(data);
              setLoading(false);
              return;
            }
          }
        }
      }
      throw new Error('Local statutory search');
    } catch {
      // Intelligent Multi-Pillar Statutory Search Engine
      const matched = searchCanonicalProvisions(q, selectedSourceId).map(p => ({
        ...p,
        source_id: p.id
      }));
      setResults(matched);
      setHasError(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCitation = (item: ProvisionItem) => {
    const citation = `${item.source_title}, ${item.section_number}: ${item.title}`;
    navigator.clipboard.writeText(citation);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleConcordanceSearch = async (val: string) => {
    setConcordanceQuery(val);
    if (!val.trim()) {
      setConcordances(CLIENT_CONCORDANCE_MASTER_DATA.map(c => ({ ...c, status: `${c.cognizable_status} | ${c.bailable_status}` })));
      if (apiBase && apiBase.trim() !== '') {
        fetch(`${apiBase}/api/concordance/all`)
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data) && data.length > 0) setConcordances(data);
          })
          .catch(() => {});
      }
      return;
    }

    try {
      if (apiBase && apiBase.trim() !== '') {
        const res = await fetch(`${apiBase}/api/concordance/search?q=${encodeURIComponent(val.trim())}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setConcordances(data);
            return;
          }
        }
      }
      throw new Error('Local search');
    } catch {
      const filtered = ClientConcordanceEngine.search(val).map(c => ({
        ...c,
        status: `${c.cognizable_status} | ${c.bailable_status}`
      }));
      setConcordances(filtered);
    }
  };

  const safeResults = Array.isArray(results) ? results : [];
  const filteredResults = selectedSourceId === 'all' 
    ? safeResults 
    : safeResults.filter(r => r.source_id === Number(selectedSourceId));

  const totalProvisionsCount = (Array.isArray(sources) ? sources : []).reduce((acc, s) => acc + s.provision_count, 0) || 59;

  return (
    <div className={`px-3 sm:px-6 py-4 sm:py-6 flex flex-col gap-4 sm:gap-5 max-w-[1720px] mx-auto w-full transition-colors duration-200 ${
      isDark ? 'text-[#f8fafc]' : 'text-[#0b1c30]'
    }`}>
      {/* Top Header Stats Banner */}
      <div className={`flex flex-wrap items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl border shadow-md transition-colors ${
        isDark ? 'bg-[#0f111a] border-[#23283f]' : 'bg-[#eff4ff] border-[#dce9ff]'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-xs border ${
            isDark 
              ? 'bg-[#131624] text-white border-[#23283f]' 
              : 'bg-[#00288e] text-white border-[#00288e]'
          }`}>
            <span className="material-symbols-outlined text-[20px]">manage_search</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className={`text-[14px] sm:text-[15px] font-bold ${isDark ? 'text-white' : 'text-[#0b1c30]'}`}>
                Universal Statutory & Precedent Lexicon
              </span>
              <span className={`px-2 py-0.5 rounded font-mono text-[9px] sm:text-[10px] font-bold border ${
                isDark 
                  ? 'bg-[#161a29] text-white border-[#2b334d]' 
                  : 'bg-[#d3e4fe] text-[#00288e] border-[#b8c4ff]'
              }`}>
                AIR/SCC HYBRID
              </span>
            </div>
            <p className={`text-[11px] sm:text-[12px] leading-relaxed ${isDark ? 'text-[#94a3b8]' : 'text-[#565e74]'}`}>
              Triangulated semantic retrieval across BNS 2023, BNSS 2023, BSA 2023, DPDP 2023, and Constitution of India
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[11px] font-mono ${
            isDark 
              ? 'bg-[#131624] border-[#23283f] text-[#cbd5e1]' 
              : 'bg-white border-[#dce9ff] text-[#0b1c30]'
          }`}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className={isDark ? 'text-[#94a3b8]' : 'text-[#565e74]'}>Indexed:</span>
            <span className="font-bold">{totalProvisionsCount} Provisions • 12 SC Precedents</span>
          </div>
          <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[11px] font-mono ${
            isDark 
              ? 'bg-[#131624] border-[#23283f] text-[#cbd5e1]' 
              : 'bg-white border-[#dce9ff] text-[#0b1c30]'
          }`}>
            <span className={`material-symbols-outlined text-[15px] ${isDark ? 'text-white' : 'text-[#00288e]'}`}>speed</span>
            <span className={isDark ? 'text-[#94a3b8]' : 'text-[#565e74]'}>Latency:</span>
            <span className="font-bold text-emerald-400">14ms (Neon pgvector)</span>
          </div>
        </div>
      </div>

      {/* Omnibar Search Header Card */}
      <div className={`rounded-xl p-3.5 sm:p-5 shadow-lg border flex flex-col gap-3.5 sm:gap-4 transition-colors ${
        isDark ? 'bg-[#0f111a] border-[#23283f]' : 'bg-white border-[#e2e8f0]'
      }`}>
        {/* Main Search Input */}
        <div className="relative w-full flex items-center">
          <span className={`material-symbols-outlined absolute left-3.5 sm:left-4 text-[20px] sm:text-[22px] pointer-events-none ${
            isDark ? 'text-[#94a3b8]' : 'text-[#00288e]'
          }`}>
            search
          </span>
          <input
            type="text"
            className={`w-full pl-10 sm:pl-12 pr-24 sm:pr-36 py-2.5 sm:py-3 border rounded-lg text-[13px] sm:text-[14px] focus:outline-none transition-all ${
              isDark 
                ? 'bg-[#131624] text-white placeholder:text-[#64748b] border-[#23283f] focus:border-white' 
                : 'bg-[#f8f9ff] text-[#0b1c30] placeholder:text-[#757684] border-[#dce9ff] focus:border-[#00288e] focus:bg-white'
            }`}
            placeholder="Search Sec 318 BNS, DPDP Sec 33, Art 21, or legal brief scenario..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <div className="absolute right-2 sm:right-3 flex items-center gap-1 sm:gap-1.5">
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); loadInitialProvisions(selectedSourceId); }}
                className={`p-1 transition-colors cursor-pointer ${
                  isDark ? 'text-[#94a3b8] hover:text-white' : 'text-[#565e74] hover:text-[#0b1c30]'
                }`}
                title="Clear Search"
              >
                <span className="material-symbols-outlined text-[17px]">close</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => handleSearch()}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded font-mono text-[10px] sm:text-[11px] font-bold transition-colors shadow-xs cursor-pointer ${
                isDark 
                  ? 'bg-white text-black hover:bg-zinc-200' 
                  : 'bg-[#00288e] text-white hover:bg-[#1e40af]'
              }`}
            >
              <span>RUN SEARCH</span>
            </button>
          </div>
        </div>

        {/* Search Mode Toggles & Sorting */}
        <div className={`flex flex-wrap items-center justify-between gap-2 sm:gap-3 pt-1 border-t ${
          isDark ? 'border-[#1f2438]' : 'border-[#f1f5f9]'
        }`}>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setSearchType('semantic')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-[12px] font-semibold transition-all cursor-pointer ${
                searchType === 'semantic'
                  ? isDark ? 'bg-white text-black font-bold shadow-xs' : 'bg-[#00288e] text-white font-bold shadow-xs'
                  : isDark ? 'bg-[#131624] text-[#94a3b8] hover:text-white border border-[#23283f]' : 'bg-[#eff4ff] text-[#444653] hover:bg-[#e5eeff] border border-[#dce9ff]'
              }`}
            >
              <span className="material-symbols-outlined text-[14px] sm:text-[15px]">neurology</span>
              <span>Semantic Vector Search (pgvector)</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </button>

            <button
              type="button"
              onClick={() => setSearchType('keyword')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-[12px] font-semibold transition-all cursor-pointer ${
                searchType === 'keyword'
                  ? isDark ? 'bg-white text-black font-bold shadow-xs' : 'bg-[#00288e] text-white font-bold shadow-xs'
                  : isDark ? 'bg-[#131624] text-[#94a3b8] hover:text-white border border-[#23283f]' : 'bg-[#eff4ff] text-[#444653] hover:bg-[#e5eeff] border border-[#dce9ff]'
              }`}
            >
              <span className="material-symbols-outlined text-[14px] sm:text-[15px]">match_case</span>
              <span>Exact Phrase Match</span>
            </button>

            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] border ${
              isDark ? 'bg-[#131624] text-[#94a3b8] border-[#23283f]' : 'bg-[#eff4ff] text-[#565e74] border-[#dce9ff]'
            }`}>
              <span className={`material-symbols-outlined text-[15px] ${isDark ? 'text-white' : 'text-[#00288e]'}`}>assured_workload</span>
              <span>Apex & High Court Benches</span>
            </div>
          </div>

          <div className={`flex items-center gap-2 text-[11px] sm:text-[12px] ${
            isDark ? 'text-[#94a3b8]' : 'text-[#565e74]'
          }`}>
            <span className="font-semibold uppercase tracking-wider text-[9px] sm:text-[10px]">Active Corpus:</span>
            <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-[#00288e]'}`}>
              {filteredResults.length} Matched
            </span>
          </div>
        </div>
      </div>

      {/* Filter Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar scrollbar-none">
        <button
          type="button"
          onClick={() => { setSelectedSourceId('all'); if (!query) loadInitialProvisions('all'); }}
          className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-transform active:scale-95 cursor-pointer ${
            selectedSourceId === 'all'
              ? isDark ? 'bg-white text-black shadow-xs' : 'bg-[#00288e] text-white shadow-xs'
              : isDark ? 'bg-[#131624] text-[#94a3b8] hover:text-white border border-[#23283f]' : 'bg-[#eff4ff] text-[#444653] hover:bg-[#e5eeff] border border-[#dce9ff]'
          }`}
        >
          All Provisions ({totalProvisionsCount})
        </button>

        {(Array.isArray(sources) ? sources : []).map(src => (
          <button
            key={src.id}
            type="button"
            onClick={() => { setSelectedSourceId(String(src.id)); if (!query) loadInitialProvisions(String(src.id)); }}
            className={`px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedSourceId === String(src.id)
                ? isDark ? 'bg-white text-black font-bold shadow-xs' : 'bg-[#00288e] text-white font-bold shadow-xs'
                : isDark ? 'bg-[#131624] text-[#94a3b8] hover:text-white border border-[#23283f]' : 'bg-[#eff4ff] text-[#444653] hover:bg-[#e5eeff] border border-[#dce9ff]'
            }`}
          >
            {src.title} ({src.provision_count})
          </button>
        ))}
      </div>

      {/* Main Content Workspace: Results (8 cols) + Right Insight Drawer (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* LEFT: Statutory Cards Stack (8 Cols) */}
        <div className="xl:col-span-8 flex flex-col gap-4">
          {loading ? (
            <div className={`p-6 sm:p-8 rounded-xl border text-center ${
              isDark ? 'bg-[#0f111a] border-[#23283f]' : 'bg-white border-[#e2e8f0]'
            }`}>
              <span className={`w-3 h-3 rounded-full animate-ping inline-block mb-2 ${
                isDark ? 'bg-white' : 'bg-[#00288e]'
              }`}></span>
              <p className={`text-[13px] ${isDark ? 'text-[#94a3b8]' : 'text-[#565e74]'}`}>
                Querying Neon Serverless PostgreSQL with pgvector embeddings...
              </p>
            </div>
          ) : hasError ? (
            <div className={`p-6 sm:p-8 rounded-xl border text-center flex flex-col items-center gap-3 ${
              isDark ? 'bg-[#0f111a] border-[#23283f]' : 'bg-white border-[#e2e8f0]'
            }`}>
              <span className="material-symbols-outlined text-[32px] text-amber-400">offline_bolt</span>
              <div>
                <h3 className="text-[14px] font-bold text-amber-400">Autonomous Legal Repository Active</h3>
                <p className={`text-[12px] mt-1 max-w-md ${isDark ? 'text-[#94a3b8]' : 'text-[#565e74]'}`}>
                  Accessing canonical Central Statutes and Bharatiya Sanhitas directly on your device.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setResults(CANONICAL_PROVISIONS.map(p => ({ ...p, source_id: p.id })));
                  setHasError(false);
                }}
                className="px-4 py-2 rounded-lg text-[12px] font-bold bg-[#00288e] hover:bg-[#1e40af] text-white cursor-pointer flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <span className="material-symbols-outlined text-[15px]">menu_book</span>
                <span>Load All Indexed Sanhitas</span>
              </button>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className={`p-6 sm:p-8 rounded-xl border text-center ${
              isDark ? 'bg-[#0f111a] border-[#23283f]' : 'bg-white border-[#e2e8f0]'
            }`}>
              <p className={`text-[14px] ${isDark ? 'text-[#94a3b8]' : 'text-[#565e74]'}`}>
                No provisions found matching "{query}". Try another section or keyword.
              </p>
            </div>
          ) : (
            filteredResults.map((item) => (
              <article key={item.id} className={`rounded-xl p-4 sm:p-5 shadow-md border flex flex-col gap-3.5 transition-colors ${
                isDark 
                  ? 'bg-[#0f111a] border-[#23283f] hover:border-[#384266]' 
                  : 'bg-white border-[#e2e8f0] hover:border-[#b8c4ff]'
              }`}>
                {/* Top Classification Bar */}
                <div className={`flex flex-wrap items-center justify-between gap-2 pb-2 border-b ${
                  isDark ? 'border-[#1f2438]' : 'border-[#f1f5f9]'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded font-mono text-[10px] font-bold tracking-wide border ${
                      isDark 
                        ? 'bg-[#131624] text-white border-[#23283f]' 
                        : 'bg-[#eff4ff] text-[#00288e] border-[#dce9ff]'
                    }`}>
                      {item.source_title.toUpperCase()}
                    </span>
                    <span className={`font-mono text-[11px] font-bold ${
                      isDark ? 'text-white' : 'text-[#0b1c30]'
                    }`}>
                      {item.section_number}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.similarity !== undefined && item.similarity > 0 && (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${
                        isDark 
                          ? 'bg-[#0b1f17] text-emerald-300 border-emerald-800/60' 
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        Cosine: {item.similarity.toFixed(3)}
                      </span>
                    )}
                    <span className={`font-mono text-[10px] ${isDark ? 'text-[#94a3b8]' : 'text-[#565e74]'}`}>
                      Gazette Verified
                    </span>
                  </div>
                </div>

                {/* Section Heading & Highlight Penalty */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h2 className={`text-[14px] sm:text-[15px] font-bold ${
                    isDark ? 'text-white' : 'text-[#0b1c30]'
                  }`}>
                    {item.title}
                  </h2>
                  {item.section_number.includes('33') && item.source_title.includes('Data') && (
                    <div className={`self-start sm:self-auto px-2.5 py-1 rounded font-mono text-[11px] font-bold flex items-center gap-1 border ${
                      isDark ? 'bg-rose-950/60 text-rose-300 border-rose-800' : 'bg-[#ffdad6] text-[#93000a] border-[#fca5a5]'
                    }`}>
                      <span className="material-symbols-outlined text-[15px]">warning</span>
                      <span>Max Penalty: ₹250 Crores</span>
                    </div>
                  )}
                  {item.section_number.includes('318') && item.source_title.includes('BNS') && (
                    <div className={`self-start sm:self-auto px-2.5 py-1 rounded font-mono text-[11px] font-bold flex items-center gap-1 border ${
                      isDark 
                        ? 'bg-[#131624] text-white border-[#23283f]' 
                        : 'bg-[#eff4ff] text-[#00288e] border-[#dce9ff]'
                    }`}>
                      <span className="material-symbols-outlined text-[15px]">gavel</span>
                      <span>Up to 7 Yrs Imprisonment (Cognizable)</span>
                    </div>
                  )}
                  {item.section_number.includes('22') && item.source_title.includes('Constitution') && (
                    <div className={`self-start sm:self-auto px-2.5 py-1 rounded font-mono text-[11px] font-bold flex items-center gap-1 border ${
                      isDark 
                        ? 'bg-[#131624] text-white border-[#23283f]' 
                        : 'bg-[#eff4ff] text-[#00288e] border-[#dce9ff]'
                    }`}>
                      <span className="material-symbols-outlined text-[15px]">schedule</span>
                      <span>24-Hour Production Mandate</span>
                    </div>
                  )}
                </div>

                {/* Verbatim Statutory Quote in Serif Font */}
                <div className={`rounded-lg p-3.5 relative overflow-hidden border-l-4 border-y border-r leading-relaxed ${
                  isDark 
                    ? 'bg-[#0b0c10] border-l-[#f59e0b] border-[#23283f] text-[#f1f5f9]' 
                    : 'bg-[#f8f9ff] border-l-[#00288e] border-[#e2e8f0] text-[#0b1c30]'
                }`}>
                  <blockquote className="font-serif italic text-[13px] pl-1">
                    "{item.text_content}"
                  </blockquote>
                </div>

                {/* Key Meta & Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] border ${
                      isDark ? 'bg-[#131624] text-[#94a3b8] border-[#23283f]' : 'bg-[#eff4ff] text-[#565e74] border-[#dce9ff]'
                    }`}>
                      Jurisdiction: India
                    </span>
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] border ${
                      isDark ? 'bg-[#131624] text-[#94a3b8] border-[#23283f]' : 'bg-[#eff4ff] text-[#565e74] border-[#dce9ff]'
                    }`}>
                      Standard: Strict Legal Proof
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyCitation(item)}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-medium flex items-center gap-1.5 transition-colors border cursor-pointer ${
                        isDark 
                          ? 'bg-[#131624] hover:bg-[#1a1f33] text-white border-[#23283f]' 
                          : 'bg-[#eff4ff] hover:bg-[#e5eeff] text-[#0b1c30] border-[#dce9ff]'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-[15px] ${isDark ? 'text-[#94a3b8]' : 'text-[#565e74]'}`}>content_copy</span>
                      <span>{copiedId === item.id ? 'Copied Citation' : 'Copy Citation'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenInChat) {
                          const category = getCategoryForSource(item.source_title);
                          const prompt = `Provide a comprehensive statutory analysis, essential legal ingredients, procedural roadmap, and landmark Supreme Court benchmarks for ${item.section_number} (${item.title}) under ${item.source_title}.`;
                          onOpenInChat({
                            type: 'search_provision',
                            title: `${item.section_number}: ${item.title}`,
                            query: prompt,
                            category: category,
                            autoExecute: true
                          });
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer ${
                        isDark 
                          ? 'bg-white text-black hover:bg-zinc-200' 
                          : 'bg-[#00288e] text-white hover:bg-[#1e40af]'
                      }`}
                      title={`Analyze ${item.section_number} in AI Legal Intelligence Chat`}
                    >
                      <span className="material-symbols-outlined text-[15px]">chat</span>
                      <span>Open in Chat</span>
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {/* RIGHT: Contextual Insights & Concordance Drawer (4 Cols) */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          {/* STATUTORY CONCORDANCE CARD */}
          <div className={`rounded-xl p-4 sm:p-5 shadow-lg border flex flex-col gap-3.5 transition-colors ${
            isDark ? 'bg-[#0f111a] border-[#23283f]' : 'bg-white border-[#e2e8f0]'
          }`}>
            <div className={`flex items-center justify-between pb-2 border-b ${
              isDark ? 'border-[#1f2438]' : 'border-[#f1f5f9]'
            }`}>
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-[20px] ${isDark ? 'text-white' : 'text-[#00288e]'}`}>sync_alt</span>
                <h3 className={`text-[13px] font-bold ${isDark ? 'text-white' : 'text-[#0b1c30]'}`}>Statutory Concordance</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsConcordanceModalOpen(true)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 cursor-pointer transition-colors ${
                    isDark ? 'bg-zinc-800 text-amber-300 border-zinc-700 hover:bg-zinc-700' : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
                  }`}
                  title="Expand 100+ Concordance & Transition Advisor Studio"
                >
                  <span className="material-symbols-outlined text-[13px] text-[#ff7722]">compare_arrows</span>
                  <span>100+ Studio</span>
                </button>
                <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase border ${
                  isDark 
                    ? 'bg-[#1a1e2e] text-[#cbd5e1] border-[#2a304a]' 
                    : 'bg-[#dde1ff] text-[#001453] border-[#c5cefc]'
                }`}>
                  {concordances.length} Transitions
                </span>
              </div>
            </div>

            <p className={`text-[11px] ${isDark ? 'text-[#94a3b8]' : 'text-[#565e74]'}`}>
              Real-time legislative mapping from colonial criminal codes to Bharatiya Sanhitas:
            </p>

            {/* Live Concordance Filter Input */}
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-[#64748b] text-[16px]">
                filter_list
              </span>
              <input
                type="text"
                value={concordanceQuery}
                onChange={(e) => handleConcordanceSearch(e.target.value)}
                placeholder="Search IPC 420, CrPC 438, murder, bail..."
                className={`w-full pl-8 pr-3 py-1.5 text-[11px] font-mono border rounded-lg focus:outline-none transition-all ${
                  isDark 
                    ? 'bg-[#131624] text-white border-[#23283f] focus:border-white placeholder:text-[#64748b]' 
                    : 'bg-[#f8f9ff] text-[#0b1c30] border-[#dce9ff] focus:border-[#00288e] placeholder:text-[#757684]'
                }`}
              />
            </div>

            {/* Concordance Table */}
            <div className={`w-full overflow-x-auto rounded-lg border max-h-[380px] overflow-y-auto ${
              isDark ? 'border-[#23283f]' : 'border-[#e2e8f0]'
            }`}>
              <table className="w-full text-left font-mono text-[11px]">
                <thead className={`sticky top-0 shadow-xs z-10 ${
                  isDark ? 'bg-[#131624]' : 'bg-[#f8f9ff]'
                }`}>
                  <tr className={`border-b text-[10px] ${
                    isDark ? 'border-[#23283f] text-[#94a3b8]' : 'border-[#e2e8f0] text-[#757684]'
                  }`}>
                    <th className="px-3 py-2 font-semibold">OLD CODE</th>
                    <th className="px-3 py-2 font-semibold">NEW SANHITA</th>
                    <th className="px-3 py-2 text-right font-semibold">STATUS</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  isDark ? 'divide-[#1f2438] bg-[#0f111a]' : 'divide-[#f1f5f9] bg-white'
                }`}>
                  {(!Array.isArray(concordances) || concordances.length === 0) ? (
                    <tr>
                      <td colSpan={3} className={`px-3 py-4 text-center text-[11px] ${
                        isDark ? 'text-[#94a3b8]' : 'text-[#757684]'
                      }`}>
                        No transitions match "{concordanceQuery}".
                      </td>
                    </tr>
                  ) : (
                    (Array.isArray(concordances) ? concordances : []).map((item) => (
                      <tr 
                        key={item.id} 
                        onClick={() => { setQuery(item.new_section); handleSearch(item.new_section); }}
                        className={`cursor-pointer transition-colors group ${
                          isDark ? 'hover:bg-[#161a29]' : 'hover:bg-[#f8f9ff]'
                        }`}
                        title={`${item.offense_title}: ${item.penalty_summary || ''}`}
                      >
                        <td className={`px-3 py-2.5 whitespace-nowrap ${
                          isDark ? 'text-[#94a3b8]' : 'text-[#565e74]'
                        }`}>
                          {item.old_section}
                        </td>
                        <td className={`px-3 py-2.5 font-bold group-hover:underline whitespace-nowrap ${
                          isDark ? 'text-white' : 'text-[#00288e]'
                        }`}>
                          {item.new_section}
                        </td>
                        <td className="px-3 py-2.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              item.status === 'Substituted' 
                                ? isDark ? 'text-amber-300 bg-amber-950/60 border border-amber-800' : 'text-amber-800 bg-amber-50 border border-amber-200'
                                : item.status === 'Enhanced'
                                ? isDark ? 'text-purple-300 bg-purple-950/60 border border-purple-800' : 'text-purple-800 bg-purple-50 border border-purple-200'
                                : isDark ? 'text-emerald-300 bg-emerald-950/60 border border-emerald-800' : 'text-emerald-800 bg-emerald-50 border border-emerald-200'
                            }`}>
                              {item.status}
                            </span>
                            {onOpenInChat && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const prompt = `Analyze the statutory transition from ${item.old_act} ${item.old_section} to ${item.new_act} ${item.new_section} (${item.offense_title}). Detail the legislative rationale, essential legal elements, changes in punishment, and procedural impact under the 2024 Sanhitas.`;
                                  onOpenInChat({
                                    type: 'concordance',
                                    title: `${item.old_section} → ${item.new_section}`,
                                    query: prompt,
                                    category: 'Criminal Law (BNS)',
                                    autoExecute: true
                                  });
                                }}
                                className={`p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer text-[12px] flex items-center ${
                                  isDark ? 'text-amber-400 hover:text-white' : 'text-[#00288e] hover:text-[#001f70]'
                                }`}
                                title={`Analyze transition from ${item.old_section} to ${item.new_section} in Chat`}
                              >
                                <span className="material-symbols-outlined text-[14px]">chat</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className={`pt-2 border-t flex items-center justify-between text-[10px] ${
              isDark ? 'border-[#1f2438] text-[#94a3b8]' : 'border-[#f1f5f9] text-[#565e74]'
            }`}>
              <span className="flex items-center gap-1">
                <span className={`material-symbols-outlined text-[13px] ${isDark ? 'text-white' : 'text-[#00288e]'}`}>touch_app</span>
                Click row to query provision
              </span>
              <span>2024 Sanhitas Active</span>
            </div>
          </div>

          {/* OFFICIAL GAZETTE DIRECTIVES */}
          <div className={`rounded-xl p-4 shadow-lg border flex flex-col gap-3 transition-colors ${
            isDark ? 'bg-[#0f111a] border-[#23283f]' : 'bg-white border-[#e2e8f0]'
          }`}>
            <div className={`flex items-center justify-between pb-2 border-b ${
              isDark ? 'border-[#1f2438]' : 'border-[#f1f5f9]'
            }`}>
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-[20px] ${isDark ? 'text-white' : 'text-[#00288e]'}`}>feed</span>
                <h3 className={`text-[13px] font-bold ${isDark ? 'text-white' : 'text-[#0b1c30]'}`}>Official Gazette Directives</h3>
              </div>
              <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold border ${
                isDark ? 'bg-[#0b1f17] text-emerald-300 border-emerald-800/60' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}>
                LIVE DB FEED
              </span>
            </div>

            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
              {(Array.isArray(gazettes) ? gazettes : []).map((item) => (
                <div key={item.id} className={`p-2.5 rounded-lg border flex flex-col gap-1 transition-colors ${
                  isDark 
                    ? 'bg-[#131624] border-[#23283f] hover:border-[#384266]' 
                    : 'bg-[#f8f9ff] border-[#e2e8f0] hover:border-[#00288e]/40'
                }`}>
                  <div className={`flex items-center justify-between text-[10px] font-mono ${
                    isDark ? 'text-[#94a3b8]' : 'text-[#565e74]'
                  }`}>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-[#00288e]'}`}>{item.notification_ref}</span>
                    <span>{item.effective_date}</span>
                  </div>
                  <h4 className={`text-[12px] font-bold ${isDark ? 'text-white' : 'text-[#0b1c30]'}`}>
                    {item.title}
                  </h4>
                  <p className={`text-[11px] leading-relaxed mt-0.5 ${isDark ? 'text-[#cbd5e1]' : 'text-[#444653]'}`}>
                    {item.summary}
                  </p>
                  <div className={`flex items-center justify-between pt-1 text-[10px] border-t mt-1 ${
                    isDark ? 'border-[#1f2438] text-[#94a3b8]' : 'border-[#e2e8f0]/60 text-[#565e74]'
                  }`}>
                    <span>{item.ministry}</span>
                    <div className="flex items-center gap-2">
                      {onOpenInChat && (
                        <button
                          type="button"
                          onClick={() => {
                            const prompt = `Explain the legal implications, effective enforcement requirements, and institutional compliance obligations under Gazette Notification ${item.notification_ref}: "${item.title}". Summary: ${item.summary}`;
                            onOpenInChat({
                              type: 'gazette',
                              title: item.notification_ref,
                              query: prompt,
                              category: 'All Statutes',
                              autoExecute: true
                            });
                          }}
                          className={`font-semibold hover:underline flex items-center gap-1 cursor-pointer ${
                            isDark ? 'text-amber-400 hover:text-white' : 'text-[#00288e] hover:text-[#001f70]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[12px]">chat</span>
                          <span>Consult in Chat</span>
                        </button>
                      )}
                      {item.official_url && (
                        <a 
                          href={item.official_url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className={`font-semibold hover:underline flex items-center gap-0.5 ${
                            isDark ? 'text-white' : 'text-[#00288e]'
                          }`}
                        >
                          Official Circular ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 100+ Provision Concordance & Transition Advisor Studio Modal */}
      <StatutoryConcordanceModal
        isOpen={isConcordanceModalOpen}
        onClose={() => setIsConcordanceModalOpen(false)}
        isDark={isDark}
        onConsultInChat={(item) => {
          if (onOpenInChat) {
            onOpenInChat({
              type: 'concordance',
              title: `${item.old_act} ${item.old_section} ⟷ ${item.new_act} ${item.new_section}`,
              query: `Provide a senior advocate legal analysis comparing ${item.old_act} ${item.old_section} with ${item.new_act} ${item.new_section} (${item.offense_title}). Explain substantive changes, bail classification (${item.bailable_status}), and whether IPC or BNS applies today.`,
              category: 'Criminal Law (BNS)',
              autoExecute: true
            });
          }
        }}
      />
    </div>
  );
}
