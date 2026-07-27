import React, { useState } from 'react';
import { X, Sparkles, Lightbulb, BookOpen, Layers, CheckCircle2, HelpCircle } from 'lucide-react';
import { Filiere, AISubjectProposal } from '../types';
import { ALL_FILIERES } from '../data/seedData';
import { api } from '../services/api';

interface AISubjectGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFiliere?: Filiere;
  onSelectSubject?: (title: string) => void;
}

export const AISubjectGeneratorModal: React.FC<AISubjectGeneratorModalProps> = ({
  isOpen,
  onClose,
  defaultFiliere = 'Informatique & Intelligence Artificielle',
  onSelectSubject,
}) => {
  const [filiere, setFiliere] = useState<Filiere>(defaultFiliere);
  const [domainInterest, setDomainInterest] = useState('');
  const [loading, setLoading] = useState(false);
  const [proposals, setProposals] = useState<AISubjectProposal[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await api.generateSupervisorSubjects({
        filiere,
        domainInterest: domainInterest.trim(),
      });
      setProposals(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la génération des sujets de mémoire');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 px-6 py-5 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-yellow-500/20 rounded-xl border border-yellow-400/30">
              <Lightbulb className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Générateur Intelligent de Sujets de Mémoire</h3>
              <p className="text-xs text-yellow-100">Proposition de thèmes de recherche innovants pour encadreurs & étudiants</p>
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
          <form onSubmit={handleGenerate} className="space-y-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Filière / Département</label>
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
                  Mots-clés ou domaine spécifique (Optionnel)
                </label>
                <input
                  type="text"
                  value={domainInterest}
                  onChange={(e) => setDomainInterest(e.target.value)}
                  placeholder="Ex: Fintech, Santé publique, Cybersécurité, Énergies..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Génération de thèmes novateurs en cours...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>Générer de Nouveaux Sujets Innovants</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-300">
              {error}
            </div>
          )}

          {proposals.length > 0 && (
            <div className="space-y-4 animate-fadeIn">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Propositions de Sujets Recommandées ({proposals.length})
              </h4>

              <div className="space-y-4">
                {proposals.map((prop, index) => (
                  <div
                    key={prop.id || index}
                    className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 hover:border-indigo-500/40 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2.5 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                            {prop.filiere}
                          </span>
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
                            Niveau : {prop.difficultyLevel}
                          </span>
                        </div>
                        <h5 className="text-sm font-bold text-white">{prop.title}</h5>
                      </div>

                      {onSelectSubject && (
                        <button
                          onClick={() => {
                            onSelectSubject(prop.title);
                            onClose();
                          }}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shrink-0 transition flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Choisir ce sujet
                        </button>
                      )}
                    </div>

                    <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-300 space-y-2">
                      <p className="text-indigo-200">
                        <strong>Pourquoi ce sujet est original :</strong> {prop.whyOriginal}
                      </p>

                      <div className="space-y-1 pt-1 border-t border-slate-800">
                        <strong className="text-slate-400 block text-[11px] flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-purple-400" /> Objectifs de recherche principaux :
                        </strong>
                        <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-slate-300">
                          {prop.researchObjectives?.map((obj, i) => (
                            <li key={i}>{obj}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-1 pt-1 border-t border-slate-800">
                        <strong className="text-slate-400 block text-[11px] flex items-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5 text-indigo-400" /> Questions de recherche clés :
                        </strong>
                        <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-slate-300">
                          {prop.researchQuestions?.map((q, i) => (
                            <li key={i}>{q}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

