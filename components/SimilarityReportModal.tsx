import React from 'react';
import { X, ShieldCheck, AlertTriangle, FileText, Sparkles, CheckCircle2, ChevronRight, Download } from 'lucide-react';
import { SimilarityReport } from '../types';

interface SimilarityReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: SimilarityReport | null;
  loading?: boolean;
}

export const SimilarityReportModal: React.FC<SimilarityReportModalProps> = ({
  isOpen,
  onClose,
  report,
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 px-6 py-5 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-400/30">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Rapport IA de Similitude & Plagiat</h3>
              <p className="text-xs text-indigo-200">Analyse algorithmique et sémantique comparative</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-300">Analyse IA des textes en cours...</p>
              <p className="text-xs text-slate-500">Comparaison avec l'ensemble de la base nationale des mémoires</p>
            </div>
          ) : !report ? (
            <div className="text-center py-10 text-slate-400">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucun rapport disponible.</p>
            </div>
          ) : (
            <>
              {/* Score Banners */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-center space-y-1">
                  <span className="text-xs font-medium text-slate-400">Score d'Originalité</span>
                  <div className="text-3xl font-black text-emerald-400">{report.originalityScore}%</div>
                  <span className="text-[10px] text-emerald-400/80 font-semibold flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Texte Inédit
                  </span>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-center space-y-1">
                  <span className="text-xs font-medium text-slate-400">Taux de Similitude</span>
                  <div className={`text-3xl font-black ${report.similarityPercentage > 30 ? 'text-rose-400' : 'text-amber-400'}`}>
                    {report.similarityPercentage}%
                  </div>
                  <span className="text-[10px] text-slate-400">Matchs Détectés</span>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-center space-y-1">
                  <span className="text-xs font-medium text-slate-400">Niveau de Risque</span>
                  <div className="text-lg font-bold mt-1">
                    {report.riskLevel === 'FAIBLE' && (
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs inline-flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Faible Risque
                      </span>
                    )}
                    {report.riskLevel === 'MOYEN' && (
                      <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs inline-flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Risque Modéré
                      </span>
                    )}
                    {report.riskLevel === 'ELEVE' && (
                      <span className="px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full text-xs inline-flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Risque Élevé
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Recommendations */}
              <div className="p-5 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  Recommandations d'Amélioration IA
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {report.aiRecommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Similar Documents Found */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Documents Similaires Identifiés dans la Base ({report.similarDocuments.length})
                </h4>
                {report.similarDocuments.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Aucune correspondance significative trouvée dans la base.</p>
                ) : (
                  <div className="space-y-2.5">
                    {report.similarDocuments.map((doc) => (
                      <div key={doc.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h5 className="text-xs font-bold text-white">{doc.title}</h5>
                          <span className="px-2 py-0.5 text-[10px] font-mono bg-indigo-500/20 text-indigo-300 rounded-md shrink-0">
                            {doc.similarityScore}% similaire
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex gap-3">
                          <span>Auteur : {doc.author}</span>
                          <span>Année : {doc.year}</span>
                          <span>Filière : {doc.filiere}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 italic bg-slate-900/60 p-2 rounded-lg border border-slate-800/50 mt-1">
                          "{doc.matchedExcerpt}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition"
          >
            Fermer le Rapport
          </button>
        </div>
      </div>
    </div>
  );
};
