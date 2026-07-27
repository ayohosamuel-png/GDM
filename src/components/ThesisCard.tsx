import React from 'react';
import { BookOpen, User, Download, Calendar, Tag, ShieldCheck, Clock, AlertTriangle, Eye } from 'lucide-react';
import { Thesis } from '../types';

interface ThesisCardProps {
  thesis: Thesis;
  onSelect: (thesis: Thesis) => void;
  onInitiatePayment: (thesis: Thesis) => void;
  hasAccess: boolean;
}

export const ThesisCard: React.FC<ThesisCardProps> = ({
  thesis,
  onSelect,
  onInitiatePayment,
  hasAccess,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col justify-between group">
      <div>
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 truncate max-w-[220px]">
            {thesis.filiere}
          </span>

          {/* Status Badge */}
          {thesis.status === 'VALIDE' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" />
              Validé
            </span>
          )}

          {thesis.status === 'EN_ATTENTE' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-3 h-3" />
              En attente
            </span>
          )}

          {thesis.status === 'REJETE' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-3 h-3" />
              Rejeté
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          onClick={() => onSelect(thesis)}
          className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2 cursor-pointer leading-snug"
        >
          {thesis.title}
        </h3>

        {/* Meta Info */}
        <div className="mt-3 space-y-1.5 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">
              Auteur : <strong className="text-slate-200">{thesis.author}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">
              Directeur : <span className="text-slate-300">{thesis.director}</span>
            </span>
          </div>

          <div className="flex items-center gap-4 pt-1">
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <Calendar className="w-3 h-3 text-slate-500" />
              Année : {thesis.year}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <Download className="w-3 h-3 text-slate-500" />
              {thesis.downloadCount} téléchargements
            </span>
          </div>
        </div>

        {/* Abstract snippet */}
        <p className="mt-3 text-xs text-slate-300 line-clamp-3 font-normal leading-relaxed">
          {thesis.abstract}
        </p>

        {/* Keywords */}
        {thesis.keywords && thesis.keywords.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {thesis.keywords.slice(0, 3).map((kw, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-medium text-slate-400"
              >
                #{kw}
              </span>
            ))}
            {thesis.keywords.length > 3 && (
              <span className="px-1.5 py-0.5 text-[10px] text-slate-500">
                +{thesis.keywords.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center gap-2">
        <button
          onClick={() => onSelect(thesis)}
          className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
        >
          <Eye className="w-3.5 h-3.5 text-indigo-400" />
          Aperçu & Résumé
        </button>

        {thesis.status === 'VALIDE' && (
          <button
            onClick={() => onInitiatePayment(thesis)}
            className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-md ${
              hasAccess
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{hasAccess ? 'Télécharger' : 'Télécharger (5 000 FCFA)'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

