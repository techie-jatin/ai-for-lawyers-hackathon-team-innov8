import { useState, useEffect } from 'react';

export interface ChamberDossier {
  id: number;
  docket_number: string;
  title: string;
  category: string;
  mode: string;
  initial_query?: string;
  legal_summary?: string;
  applicable_sections?: string[];
  notes?: string;
  created_at?: string;
}

interface DossiersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  apiBase: string;
  theme?: 'dark' | 'light';
  guestId?: string;
  onDossierCountChange?: (count: number) => void;
  onLoadInChat?: (dossier: ChamberDossier) => void;
}

export function DossiersDrawer({
  isOpen,
  onClose,
  apiBase,
  theme = 'dark',
  guestId,
  onDossierCountChange,
  onLoadInChat
}: DossiersDrawerProps) {
  const isDark = theme === 'dark';
  const [dossiers, setDossiers] = useState<ChamberDossier[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const fetchDossiers = async () => {
    setLoading(true);
    try {
      if (apiBase && apiBase.trim() !== '') {
        const url = guestId 
          ? `${apiBase}/api/dossiers?guest_id=${encodeURIComponent(guestId)}`
          : `${apiBase}/api/dossiers`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const localSaved: ChamberDossier[] = JSON.parse(localStorage.getItem('bharat_saved_dossiers') || '[]');
            const combinedMap = new Map<string, ChamberDossier>();
            data.forEach(d => combinedMap.set(d.docket_number || String(d.id), d));
            localSaved.forEach(d => {
              const key = d.docket_number || String(d.id);
              if (!combinedMap.has(key)) combinedMap.set(key, d);
            });
            const merged = Array.from(combinedMap.values());
            setDossiers(merged);
            if (onDossierCountChange) onDossierCountChange(merged.length);
            return;
          }
        }
      }
      throw new Error('Local fallback');
    } catch {
      const localSaved: ChamberDossier[] = JSON.parse(localStorage.getItem('bharat_saved_dossiers') || '[]');
      setDossiers(localSaved);
      if (onDossierCountChange) onDossierCountChange(localSaved.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDossiers();
    }
  }, [isOpen]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this case brief from your Chamber Dossiers?')) return;
    try {
      if (apiBase && apiBase.trim() !== '') {
        await fetch(`${apiBase}/api/dossiers/${id}`, { method: 'DELETE' }).catch(() => {});
      }
    } finally {
      const updated = dossiers.filter(d => d.id !== id);
      setDossiers(updated);
      try {
        const localSaved: ChamberDossier[] = JSON.parse(localStorage.getItem('bharat_saved_dossiers') || '[]');
        const updatedLocal = localSaved.filter(d => d.id !== id);
        localStorage.setItem('bharat_saved_dossiers', JSON.stringify(updatedLocal));
      } catch {}
      if (onDossierCountChange) onDossierCountChange(updated.length);
    }
  };

  const handleCopy = (dossier: ChamberDossier) => {
    const textToCopy = `DOCKET: ${dossier.docket_number}\nTITLE: ${dossier.title}\nCATEGORY: ${dossier.category}\n\nLEGAL QUERY:\n${dossier.initial_query || ''}\n\nSTATUTORY ANALYSIS:\n${dossier.legal_summary || ''}\n\nAPPLICABLE SECTIONS:\n${(dossier.applicable_sections || []).join(', ')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(dossier.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  const filteredDossiers = dossiers.filter(d => 
    d.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
    d.docket_number.toLowerCase().includes(searchFilter.toLowerCase()) ||
    d.category.toLowerCase().includes(searchFilter.toLowerCase()) ||
    (d.initial_query && d.initial_query.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-out Drawer */}
      <div className={`relative w-full max-w-xl h-full shadow-2xl flex flex-col z-10 transition-colors duration-200 ${
        isDark ? 'bg-[#0b0d14] text-[#f8fafc] border-l border-[#23283f]' : 'bg-white text-[#0b1c30] border-l border-[#e2e8f0]'
      }`}>
        {/* Drawer Header */}
        <div className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
          isDark ? 'bg-[#0f111a] border-[#1f2438]' : 'bg-[#f8fafc] border-[#e2e8f0]'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg border ${
              isDark ? 'bg-[#131624] text-[#60a5fa] border-[#23283f]' : 'bg-[#eff4ff] text-[#00288e] border-[#dce9ff]'
            }`}>
              <span className="material-symbols-outlined text-[20px]">folder_special</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-[15px] font-bold ${isDark ? 'text-white' : 'text-[#0b1c30]'}`}>
                  Chamber Dossiers Repository
                </h2>
                <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                  isDark ? 'bg-white text-black' : 'bg-[#00288e] text-white'
                }`}>
                  {dossiers.length} Saved
                </span>
                {guestId && (
                  <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] border hidden sm:inline-block ${
                    isDark ? 'bg-[#182038] text-slate-300 border-white/10' : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    #{guestId}
                  </span>
                )}
              </div>
              <p className={`text-[11px] ${isDark ? 'text-[#94a3b8]' : 'text-[#64748b]'}`}>
                Saved legal analyses, case briefs, and statutory advisory notes
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isDark ? 'bg-[#131624] text-[#94a3b8] hover:text-white border-[#23283f]' : 'bg-white text-[#64748b] hover:text-[#0b1c30] border-[#cbd5e1]'
            }`}
            title="Close Drawer"
          >
            <span className="material-symbols-outlined text-[19px]">close</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className={`p-4 border-b ${isDark ? 'border-[#1f2438] bg-[#0d0f17]' : 'border-[#e2e8f0] bg-slate-50'}`}>
          <div className="relative">
            <span className={`material-symbols-outlined absolute left-3 top-2.5 text-[18px] ${
              isDark ? 'text-[#64748b]' : 'text-[#94a3b8]'
            }`}>
              search
            </span>
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter by docket, title, or category..."
              className={`w-full pl-9 pr-3 py-2 rounded-lg text-[12px] border focus:outline-none transition-colors ${
                isDark 
                  ? 'bg-[#131624] text-white placeholder:text-[#64748b] border-[#23283f] focus:border-white' 
                  : 'bg-white text-[#0b1c30] placeholder:text-[#94a3b8] border-[#cbd5e1] focus:border-[#00288e]'
              }`}
            />
          </div>
        </div>

        {/* Dossiers List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-[13px] text-[#94a3b8]">
              <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
              <span>Loading saved chamber dossiers...</span>
            </div>
          ) : filteredDossiers.length === 0 ? (
            <div className={`text-center py-16 px-4 rounded-xl border ${
              isDark ? 'bg-[#0f111a] border-[#23283f]' : 'bg-slate-50 border-[#e2e8f0]'
            }`}>
              <span className="material-symbols-outlined text-[36px] text-[#94a3b8] mb-2">folder_off</span>
              <h3 className={`text-[14px] font-bold ${isDark ? 'text-white' : 'text-[#0b1c30]'}`}>
                {searchFilter ? 'No matching dossiers found' : 'No Chamber Dossiers Saved Yet'}
              </h3>
              <p className={`text-[12px] mt-1 max-w-sm mx-auto ${isDark ? 'text-[#94a3b8]' : 'text-[#64748b]'}`}>
                When examining legal queries in the chat, click <strong className={isDark ? 'text-white' : 'text-[#00288e]'}>"Save Dossier"</strong> in the top header to archive your research opinion here. Dossiers are scoped to your private guest session.
              </p>
            </div>
          ) : (
            filteredDossiers.map((dossier) => (
              <div
                key={dossier.id}
                className={`p-4 rounded-xl border shadow-xs transition-all flex flex-col gap-3 ${
                  isDark ? 'bg-[#0f111a] border-[#23283f] hover:border-[#384266]' : 'bg-white border-[#e2e8f0] hover:border-[#cbd5e1]'
                }`}
              >
                {/* Dossier Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${
                        isDark ? 'bg-[#131624] text-white border-[#23283f]' : 'bg-[#eff4ff] text-[#00288e] border-[#bfdbfe]'
                      }`}>
                        {dossier.docket_number}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                        isDark ? 'bg-amber-950/50 text-amber-300 border-amber-800/60' : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {dossier.category}
                      </span>
                    </div>
                    <h3 className={`text-[13px] font-bold leading-snug ${isDark ? 'text-white' : 'text-[#0b1c30]'}`}>
                      {dossier.title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(dossier.id)}
                    className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Delete Dossier"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>

                {/* Initial Query Snippet */}
                {dossier.initial_query && (
                  <div className={`p-2.5 rounded-lg text-[11px] border font-serif ${
                    isDark ? 'bg-[#131624] text-[#cbd5e1] border-[#1f2438]' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}>
                    <span className="font-sans font-bold text-[9px] uppercase tracking-wider block text-[#94a3b8] mb-0.5">
                      Client Query / Fact Scenario
                    </span>
                    <p className="line-clamp-2 leading-relaxed italic">"{dossier.initial_query}"</p>
                  </div>
                )}

                {/* Legal Summary Snippet */}
                {dossier.legal_summary && (
                  <div className="text-[11px] leading-relaxed space-y-1">
                    <span className={`font-mono text-[9px] font-bold uppercase tracking-wider block ${
                      isDark ? 'text-[#94a3b8]' : 'text-[#64748b]'
                    }`}>
                      Advocate Opinion Summary
                    </span>
                    <p className={`line-clamp-3 ${isDark ? 'text-[#e2e8f0]' : 'text-slate-800'}`}>
                      {dossier.legal_summary}
                    </p>
                  </div>
                )}

                {/* Applicable Sections Tags */}
                {dossier.applicable_sections && dossier.applicable_sections.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-dashed border-[#1f2438] dark:border-[#1f2438]">
                    {dossier.applicable_sections.map((sec, idx) => (
                      <span
                        key={idx}
                        className={`px-1.5 py-0.5 rounded font-mono text-[9px] border ${
                          isDark ? 'bg-[#1a1f33] text-blue-300 border-[#2b334d]' : 'bg-blue-50 text-[#00288e] border-blue-200'
                        }`}
                      >
                        {sec}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Bar */}
                <div className={`pt-2 border-t flex items-center justify-between text-[11px] ${
                  isDark ? 'border-[#1f2438]' : 'border-[#e2e8f0]'
                }`}>
                  <span className={`font-mono text-[9px] ${isDark ? 'text-[#64748b]' : 'text-[#94a3b8]'}`}>
                    {dossier.created_at ? new Date(dossier.created_at).toLocaleDateString() : 'Active Chamber Brief'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopy(dossier)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
                        copiedId === dossier.id
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                          : isDark
                            ? 'bg-[#131624] text-[#cbd5e1] hover:text-white border-[#23283f]'
                            : 'bg-white text-slate-700 hover:text-slate-900 border-[#cbd5e1]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[13px]">
                        {copiedId === dossier.id ? 'check' : 'content_copy'}
                      </span>
                      <span>{copiedId === dossier.id ? 'Copied' : 'Copy'}</span>
                    </button>

                    {onLoadInChat && (
                      <button
                        type="button"
                        onClick={() => {
                          onLoadInChat(dossier);
                          onClose();
                        }}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold shadow-xs transition-colors cursor-pointer ${
                          isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-[#00288e] text-white hover:bg-[#001f70]'
                        }`}
                        title="Load this legal brief and analysis into active chat"
                      >
                        <span className="material-symbols-outlined text-[13px]">chat</span>
                        <span>Open in Chat</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
