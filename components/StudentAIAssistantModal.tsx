import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, AlertTriangle, FileText, BookOpen, Edit3, ArrowRight } from 'lucide-react';
import { Filiere, StudentAIAssistance } from '../types';
import { ALL_FILIERES } from '../data/seedData';
import { api } from '../services/api';

interface StudentAIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTitle?: string;
  defaultFiliere?: Filiere;
  onApplyAbstractAndKeywords?: (abstract: string, keywords: string[]) => void;
}

export const StudentAIAssistantModal: React.FC<StudentAIAssistantModalProps> = ({
  isOpen,
  onClose,
  defaultTitle = '',
  defaultFiliere = 'Informatique & Intelligence Artificielle',
  onApplyAbstractAndKeywords,
}) => {
  const [draftTitle, setDraftTitle] = useState(defaultTitle);
  const [filiere, setFiliere] = useState<Filiere>(defaultFiliere);
  const [draftContent, setDraftContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [assistance, setAssistance] = useState<StudentAIAssistance | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunAssistant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftTitle.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await api.runStudentAIAssistant({
        draftTitle: draftTitle.trim(),
        filiere,
        draftContent: draftContent.trim(),
      });
      setAssistance(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'exécution de l\'assistant IA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900 px-6 py-5 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-400/30">
              <Sparkles className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Assistant IA de Rédaction & Révision Académique</h3>
              <p className="text-xs text-indigo-200">Génération de résumé scientifique, extraction de mots-clés, contrôle de structure & bibliographie</p>
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
          <form onSubmit={handleRunAssistant} className="space-y-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Sujet / Titre de travail du mémoire <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  placeholder="Ex: Application des algorithmes de vision par ordinateur pour la télédétection..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Filière / Spécialité</label>
                <select
                  value={filiere}
                  onChange={(e) => setFiliere(e.target.value as Filiere)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {ALL_FILIERES.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Extrait de texte, ébauche ou notes de plan (Optionnel)
              </label>
              <textarea
                rows={3}
                value={draftContent}
                onChange={(e) => setDraftContent(e.target.value)}
                placeholder="Collez ici votre introduction, problématique ou notes de recherche..."
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !draftTitle.trim()}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analyse globale par l'IA en cours...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>Analyser mon projet & Générer le Résumé Scientifique</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-300">
              {error}
            </div>
          )}

          {assistance && (
            <div className="space-y-6 animate-fadeIn">
              {/* Abstract & Keywords generated */}
              <div className="p-5 bg-gradient-to-br from-indigo-950/60 via-slate-950 to-slate-950 border border-indigo-500/30 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    Résumé Scientifique Proposé par l'IA
                  </h4>
                  {onApplyAbstractAndKeywords && (
                    <button
                      onClick={() => {
                        onApplyAbstractAndKeywords(
                          assistance.scientificAbstract,
                          assistance.extractedKeywords
                        );
                        onClose();
                      }}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Appliquer au formulaire de dépôt
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/80 p-4 rounded-xl border border-slate-800 italic">
                  "{assistance.scientificAbstract}"
                </p>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 block mb-1.5">Mots-clés extraits :</span>
                  <div className="flex flex-wrap gap-1.5">
                    {assistance.extractedKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Structural Check & Bibliography */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Structure */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-purple-400" />
                    Contrôle de la Structure du Mémoire
                  </h4>
                  <div className="space-y-2">
                    {assistance.structureCheck.map((st, i) => (
                      <div key={i} className="p-2.5 bg-slate-900 rounded-xl border border-slate-800/80 text-xs">
                        <div className="flex items-center justify-between font-bold text-slate-200 mb-0.5">
                          <span>{st.section}</span>
                          {st.status === 'VALIDE' && (
                            <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Conforme
                            </span>
                          )}
                          {st.status === 'A_AMELIORER' && (
                            <span className="text-[10px] font-semibold text-amber-400 flex items-center gap-0.5">
                              <AlertTriangle className="w-3 h-3" /> À améliorer
                            </span>
                          )}
                          {st.status === 'INCOMPLET' && (
                            <span className="text-[10px] font-semibold text-rose-400 flex items-center gap-0.5">
                              <AlertTriangle className="w-3 h-3" /> Incomplet
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">{st.notes}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bibliography */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Edit3 className="w-4 h-4 text-indigo-400" />
                    Contrôle Références Bibliographiques
                  </h4>
                  <div className="text-xs text-slate-300 space-y-2">
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                      <span>Sources académiques identifiées</span>
                      <strong className="text-indigo-400">{assistance.bibliographyCheck.validCount} références</strong>
                    </div>

                    {assistance.bibliographyCheck.issuesFound.map((issue, idx) => (
                      <div key={idx} className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl flex items-start gap-1.5 text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{issue}</span>
                      </div>
                    ))}

                    {assistance.bibliographyCheck.suggestions.map((sug, idx) => (
                      <div key={idx} className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 rounded-xl flex items-start gap-1.5 text-[11px]">
                        <ArrowRight className="w-3.5 h-3.5 shrink-0 mt-0.5 text-indigo-400" />
                        <span>{sug}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Incomplete sections warning */}
              {assistance.incompleteSections.length > 0 && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs rounded-2xl space-y-1">
                  <strong className="font-bold flex items-center gap-1.5 text-amber-300">
                    <AlertTriangle className="w-4 h-4" />
                    Parties ou Chapitres Détectés Comme Incomplets :
                  </strong>
                  <ul className="list-disc pl-5 space-y-1 text-slate-300">
                    {assistance.incompleteSections.map((inc, i) => (
                      <li key={i}>{inc}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
