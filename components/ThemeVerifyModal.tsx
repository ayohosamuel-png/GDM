import React, { useState } from 'react';
import { X, Search, Sparkles, AlertTriangle, CheckCircle2, ArrowRight, Lightbulb } from 'lucide-react';
import { Filiere, ThemeVerificationResult } from '../types';
import { ALL_FILIERES } from '../data/seedData';
import { api } from '../services/api';

interface ThemeVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFiliere?: Filiere;
}

export const ThemeVerifyModal: React.FC<ThemeVerifyModalProps> = ({
  isOpen,
  onClose,
  defaultFiliere = 'Informatique & Intelligence Artificielle',
}) => {
  const [title, setTitle] = useState('');
  const [filiere, setFiliere] = useState<Filiere>(defaultFiliere);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ThemeVerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await api.verifyTheme({
        themeTitle: title.trim(),
        filiere,
        draftDescription: description.trim(),
      });
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la vérification du thème');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 px-6 py-5 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/20 rounded-xl border border-purple-400/30">
              <Search className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Vérification Préalable de Thème de Mémoire</h3>
              <p className="text-xs text-purple-200">Analyse d'originalité et détection d'antériorités avant rédaction</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          <form onSubmit={handleVerify} className="space-y-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Titre ou sujet envisagé du mémoire <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Analyse de la résilience financière des PME via Mobile Money au Bénin..."
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Filière / Domaine</label>
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

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Problématique ou résumé succinct (Optionnel)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Objectif de recherche principal, contexte..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analyse d'Originalité IA en cours...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Lancer l'Analyse d'Originalité</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-300">
              {error}
            </div>
          )}

          {result && (
            <div className="space-y-5 animate-fadeIn">
              {/* Score header */}
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-xs text-slate-400 font-medium">Diagnostic de l'IA Académique</span>
                  <h4 className="text-base font-bold text-white">{result.themeTitle}</h4>
                  <p className="text-xs text-indigo-300">Filière : {result.filiere}</p>
                </div>

                <div className="text-center shrink-0 p-3 bg-slate-900 rounded-xl border border-slate-800 min-w-[140px]">
                  <div className="text-2xl font-black text-indigo-400">{result.originalityIndex}%</div>
                  <span className="text-[11px] font-bold">
                    {result.riskLevel === 'Original' && (
                      <span className="text-emerald-400 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Sujet Original
                      </span>
                    )}
                    {result.riskLevel === 'Moyennement similaire' && (
                      <span className="text-amber-400 flex items-center justify-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Moyennement Similaire
                      </span>
                    )}
                    {result.riskLevel === 'Fortement similaire' && (
                      <span className="text-rose-400 flex items-center justify-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Fortement Similaire
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* Reformulations */}
              <div className="p-5 bg-indigo-950/30 border border-indigo-500/30 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-indigo-400" />
                  Propositions de Reformulation Plus Innovantes
                </h4>
                <div className="space-y-2">
                  {result.reformulations.map((ref, idx) => (
                    <div key={idx} className="p-3 bg-slate-950 border border-indigo-500/20 rounded-xl text-xs text-slate-200 flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{ref}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Unexplored Research Avenues */}
              <div className="p-5 bg-purple-950/30 border border-purple-500/30 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Pistes de Recherche Peu Explorées Suggérées
                </h4>
                <div className="space-y-2">
                  {result.unexploredAvenues.map((av, idx) => (
                    <div key={idx} className="p-3 bg-slate-950 border border-purple-500/20 rounded-xl text-xs text-slate-200 flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <span>{av}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Similar Topics List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Sujets Similaires Existants Répertoriés ({result.similarTopicsFound.length})
                </h4>
                <div className="space-y-2">
                  {result.similarTopicsFound.map((topic, i) => (
                    <div key={i} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-200">{topic.title}</p>
                        <p className="text-[11px] text-slate-500">Par {topic.author} ({topic.year})</p>
                      </div>
                      <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-mono text-indigo-300 shrink-0">
                        {topic.similarityPercent}% de proximité
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
