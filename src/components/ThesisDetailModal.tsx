import React from 'react';
import { X, BookOpen, User, Calendar, Tag, ShieldCheck, Download, Lock, FileText, Share2, Eye } from 'lucide-react';
import { Thesis } from '../types';

interface ThesisDetailModalProps {
  thesis: Thesis | null;
  onClose: () => void;
  onInitiatePayment: (thesis: Thesis) => void;
  onOpenCertificate?: (thesis: Thesis) => void;
  onOpenSimilarityReport?: (title: string, abstract: string, id: string) => void;
  hasAccess: boolean;
  isAdmin: boolean;
}

export const ThesisDetailModal: React.FC<ThesisDetailModalProps> = ({
  thesis,
  onClose,
  onInitiatePayment,
  onOpenCertificate,
  onOpenSimilarityReport,
  hasAccess,
  isAdmin,
}) => {
  if (!thesis) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-5 border-b border-slate-800 flex items-start justify-between">
          <div className="pr-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {thesis.filiere} {thesis.specialty ? `• ${thesis.specialty}` : ''}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Homologué
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-2 leading-snug">{thesis.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Metadata Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-950/80 rounded-xl border border-slate-800">
            <div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Auteur</div>
              <div className="text-sm font-semibold text-white mt-0.5">{thesis.author}</div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Directeur de Mémoire
              </div>
              <div className="text-sm font-semibold text-slate-200 mt-0.5">{thesis.director}</div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Année & Fichier
              </div>
              <div className="text-sm font-semibold text-slate-200 mt-0.5">
                {thesis.year} • {thesis.fileSize}
              </div>
            </div>
          </div>

          {/* Abstract */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              Résumé Académique Complété
            </h4>
            <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 text-sm text-slate-300 leading-relaxed font-normal">
              {thesis.abstract}
            </div>
          </div>

          {/* Keywords */}
          {thesis.keywords && thesis.keywords.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-slate-500" />
                Mots-clés Indexés
              </h4>
              <div className="flex flex-wrap gap-2">
                {thesis.keywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-slate-800 text-xs font-medium text-indigo-300 rounded-lg border border-slate-700"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Advanced Action Bar */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
            {onOpenCertificate && (
              <button
                onClick={() => {
                  onClose();
                  onOpenCertificate(thesis);
                }}
                className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Voir le Certificat & QR Code</span>
              </button>
            )}

            {onOpenSimilarityReport && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSimilarityReport(thesis.title, thesis.abstract, thesis.id);
                }}
                className="px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Rapport IA de Similitude</span>
              </button>
            )}
          </div>

          {/* PDF Live Document Preview Box */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-slate-500" />
              Aperçu du Document PDF
            </h4>
            <div className="w-full h-64 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden relative flex flex-col items-center justify-center">
              <iframe
                src={`/api/sample-pdf/${thesis.id}`}
                className="w-full h-full border-0"
                title="Aperçu PDF"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Tarif de téléchargement : <strong className="text-indigo-300">5 000 FCFA</strong>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition"
            >
              Fermer
            </button>

            {thesis.status === 'VALIDE' && (
              <button
                onClick={() => {
                  onClose();
                  onInitiatePayment(thesis);
                }}
                className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-lg ${
                  hasAccess
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                }`}
              >
                <Download className="w-4 h-4" />
                <span>{hasAccess ? 'Télécharger Immédiatement' : 'Télécharger (5 000 FCFA)'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

