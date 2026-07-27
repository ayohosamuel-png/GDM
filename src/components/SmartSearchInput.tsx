import React, { useState } from 'react';
import { Search, Sparkles, Filter, X, ArrowRight } from 'lucide-react';

interface SmartSearchInputProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onAISmartSearch?: (query: string) => void;
}

export const SmartSearchInput: React.FC<SmartSearchInputProps> = ({
  searchQuery,
  onSearchChange,
  onAISmartSearch,
}) => {
  const [isAISearching, setIsAISearching] = useState(false);

  const sampleQueries = [
    'Cybersécurité banques 2021-2025',
    'Paludisme IA vision par ordinateur',
    'Mobile Money inclusion PME Bénin',
  ];

  const handleAISearchTrigger = () => {
    if (!searchQuery.trim()) return;
    setIsAISearching(true);
    if (onAISmartSearch) {
      onAISmartSearch(searchQuery);
    }
    setTimeout(() => setIsAISearching(false), 800);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-2">
      <div className="relative flex items-center">
        <div className="absolute left-4 text-indigo-400 pointer-events-none">
          <Sparkles className="w-5 h-5 text-indigo-400" />
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleAISearchTrigger();
            }
          }}
          placeholder="Recherche assistée par IA : 'Mémoires cybersécurité banques africaines 2021-2025'..."
          className="w-full pl-12 pr-28 py-3.5 bg-slate-900/90 border-2 border-indigo-500/40 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400 shadow-xl backdrop-blur-md transition"
        />

        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-24 p-1 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={handleAISearchTrigger}
          disabled={isAISearching || !searchQuery.trim()}
          className="absolute right-2.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 shadow-md shadow-indigo-600/30"
        >
          {isAISearching ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Search className="w-3.5 h-3.5" />
              <span>Rechercher</span>
            </>
          )}
        </button>
      </div>

      {/* Suggested chips */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none text-[11px] text-slate-400">
        <span className="font-semibold text-indigo-300 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Idées de recherche IA :
        </span>
        {sampleQueries.map((q, idx) => (
          <button
            key={idx}
            onClick={() => {
              onSearchChange(q);
              if (onAISmartSearch) onAISmartSearch(q);
            }}
            className="px-2.5 py-1 bg-slate-900/80 hover:bg-indigo-600/30 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-white rounded-lg whitespace-nowrap transition"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
};

