import React from 'react';
import { Search, Filter, BookOpen, CheckCircle, Download, Award } from 'lucide-react';
import { ALL_FILIERES } from '../data/seedData';
import { Filiere } from '../types';

interface HeroBannerProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedFiliere: string;
  onSelectFiliere: (filiere: string) => void;
  selectedYear: string;
  onSelectYear: (year: string) => void;
  totalValidatedCount: number;
  totalDownloadsCount: number;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  searchQuery,
  onSearchChange,
  selectedFiliere,
  onSelectFiliere,
  selectedYear,
  onSelectYear,
  totalValidatedCount,
  totalDownloadsCount,
}) => {
  return (
    <div className="relative bg-slate-950 border-b border-slate-800/80 text-white overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 text-center">
        {/* Academic Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6">
          <Award className="w-4 h-4 text-indigo-400" />
          <span>Portail National de Recherche & Valorisation Scientifique</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
          Bibliothèque Électronique des{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-sky-300 bg-clip-text text-transparent">
            Mémoires Académiques
          </span>
        </h1>

        <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Accédez aux travaux de fin d'études validés par les comités scientifiques universitaires,
          effectuez des recherches ciblées par filière et téléchargez les publications certifiées.
        </p>

        {/* Global Search Bar */}
        <div className="mt-8 max-w-3xl mx-auto">
          <div className="relative flex items-center bg-slate-900/90 border border-slate-700/80 rounded-2xl p-2 shadow-2xl focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
            <Search className="w-5 h-5 text-slate-400 ml-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Rechercher par titre, auteur, résumé, directeur ou mots-clés..."
              className="w-full bg-transparent border-0 px-4 py-2.5 text-sm text-white focus:outline-none placeholder-slate-500"
            />
            {/* Year Selector */}
            <select
              value={selectedYear}
              onChange={(e) => onSelectYear(e.target.value)}
              className="bg-slate-800 text-xs text-slate-200 font-medium px-3 py-2 rounded-xl border border-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Toutes Années</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>
        </div>

        {/* Filières Quick Pill Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-5xl mx-auto">
          <button
            onClick={() => onSelectFiliere('ALL')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              selectedFiliere === 'ALL'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/30'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
            }`}
          >
            Toutes les filières
          </button>

          {ALL_FILIERES.map((filiere) => (
            <button
              key={filiere}
              onClick={() => onSelectFiliere(filiere)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedFiliere === filiere
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              {filiere}
            </button>
          ))}
        </div>

        {/* Stats Strip */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-3xl mx-auto border-t border-slate-800/80 pt-6">
          <div className="flex items-center justify-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xl font-bold text-white">{totalValidatedCount}</div>
              <div className="text-xs text-slate-400">Mémoires Validés</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xl font-bold text-white">{ALL_FILIERES.length}</div>
              <div className="text-xs text-slate-400">Filières Couvertes</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 col-span-2 sm:col-span-1">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Download className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xl font-bold text-white">{totalDownloadsCount}</div>
              <div className="text-xs text-slate-400">Téléchargements</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

