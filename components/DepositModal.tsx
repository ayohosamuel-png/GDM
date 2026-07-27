import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle, BookOpen, User, Calendar, Tag } from 'lucide-react';
import { ALL_FILIERES } from '../data/seedData';
import { Filiere } from '../types';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  userFiliere?: Filiere;
  userName?: string;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  userFiliere,
  userName,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState(userName || '');
  const [director, setDirector] = useState('');
  const [filiere, setFiliere] = useState<Filiere>(userFiliere || ALL_FILIERES[0]);
  const [specialty, setSpecialty] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [abstract, setAbstract] = useState('');
  const [keywords, setKeywords] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.endsWith('.pdf') && file.type !== 'application/pdf') {
        setError('Le fichier téléversé doit obligatoirement être un document PDF (.pdf)');
        setSelectedFile(null);
        return;
      }
      setError(null);
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedFile) {
      setError('Veuillez sélectionner un fichier PDF pour votre mémoire.');
      return;
    }

    if (abstract.trim().length < 50) {
      setError('Le résumé académique doit comporter au moins 50 caractères.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('author', author);
      formData.append('director', director);
      formData.append('filiere', filiere);
      formData.append('specialty', specialty);
      formData.append('year', year.toString());
      formData.append('abstract', abstract);
      formData.append('keywords', keywords);
      formData.append('pdfFile', selectedFile);

      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Échec de la soumission du mémoire');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-900 px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/30 rounded-xl border border-indigo-400/30">
              <Upload className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Dépôt d'un Mémoire Académique</h3>
              <p className="text-xs text-indigo-200">
                Soumission officielle au comité de validation (Format PDF exigé)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Titre du Mémoire <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Optimisation des modèles d'IA pour le diagnostic médical..."
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Grid: Author & Director */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Auteur (Étudiant) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Ex: Koffi Bienvenu SOGLO"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Directeur de Mémoire <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={director}
                onChange={(e) => setDirector(e.target.value)}
                placeholder="Ex: Prof. Florentin HOUNGBO"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Grid: Filiere & Specialty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Filière Académique <span className="text-rose-400">*</span>
              </label>
              <select
                value={filiere}
                onChange={(e) => setFiliere(e.target.value as Filiere)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition"
              >
                {ALL_FILIERES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Spécialité / Option</label>
              <input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="Ex: Intelligence Artificielle & Data"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Year & Keywords */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Année de Soutenance <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                required
                min={2000}
                max={2026}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Mots-clés (séparés par des virgules)
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="IA, Deep Learning, Vision par Ordinateur"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Abstract */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Résumé du Mémoire <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              placeholder="Saisissez ou collez le résumé détaillé de vos travaux de recherche..."
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition leading-relaxed"
            />
          </div>

          {/* File Upload Zone */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Fichier PDF du Mémoire <span className="text-rose-400">* (PDF uniquement)</span>
            </label>

            <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 text-center bg-slate-950 transition cursor-pointer relative">
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <FileText className="w-10 h-10 text-indigo-400 mx-auto mb-2" />
              {selectedFile ? (
                <div>
                  <div className="text-sm font-semibold text-emerald-400 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    {selectedFile.name}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Fichier validé
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-sm font-semibold text-slate-200">
                    Cliquez ou glissez-déposez le fichier PDF ici
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Format obligatoire : PDF (Taille maximale : 25 Mo)
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
            >
              {loading ? 'Téléversement en cours...' : 'Soumettre le Mémoire'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
