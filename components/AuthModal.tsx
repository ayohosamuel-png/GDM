import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, BookOpen, ShieldCheck, GraduationCap, CheckCircle2 } from 'lucide-react';
import { ALL_FILIERES } from '../data/seedData';
import { Filiere, UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, pass: string) => Promise<void>;
  onRegister: (payload: {
    fullName: string;
    email: string;
    password: string;
    role: UserRole;
    filiere: Filiere;
  }) => Promise<void>;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
}) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('DEPOSANT');
  const [selectedFiliere, setSelectedFiliere] = useState<Filiere>(ALL_FILIERES[0]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'LOGIN') {
        await onLogin(email, password);
      } else {
        await onRegister({
          fullName,
          email,
          password,
          role: selectedRole,
          filiere: selectedFiliere,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const fillSuperAdmin = () => {
    setMode('LOGIN');
    setEmail('goodluckelishaagboguin@gmail.com');
    setPassword('Goodluck2003@');
    setError(null);
  };

  const fillSampleStudent = () => {
    setMode('LOGIN');
    setEmail('koffi.soglo@student.univ.bj');
    setPassword('password123');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-900 px-6 py-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600/30 rounded-xl border border-indigo-400/30">
              <GraduationCap className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <h3 className="text-xl font-bold">
                {mode === 'LOGIN' ? 'Connexion au Portail' : 'Création de Compte'}
              </h3>
              <p className="text-xs text-indigo-200 mt-0.5">
                {mode === 'LOGIN'
                  ? 'Accédez à votre espace étudiant ou administratif'
                  : 'Choisissez votre rôle et renseignez votre filière académique'}
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-950/60 p-1 rounded-xl mt-5 border border-white/10">
            <button
              type="button"
              onClick={() => {
                setMode('LOGIN');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'LOGIN'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Se Connecter
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('REGISTER');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'REGISTER'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Créer un Compte
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {mode === 'REGISTER' && (
            <>
              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nom & Prénoms complets <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Koffi Bienvenu SOGLO"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              {/* Role Selection Mandate */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Sélectionnez votre Rôle Obligatoire <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('DEPOSANT')}
                    className={`p-2.5 rounded-xl border text-left transition relative ${
                      selectedRole === 'DEPOSANT'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-xs text-white">🧑🎓 Déposant</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">Étudiant</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('ENCADREUR')}
                    className={`p-2.5 rounded-xl border text-left transition relative ${
                      selectedRole === 'ENCADREUR'
                        ? 'bg-purple-600/20 border-purple-500 text-purple-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-xs text-white">👨🏫 Encadreur</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">Professeur</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('VISITEUR')}
                    className={`p-2.5 rounded-xl border text-left transition relative ${
                      selectedRole === 'VISITEUR'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-xs text-white">👀 Visiteur</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">Acheteur</div>
                  </button>
                </div>
              </div>

              {/* Filière Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Renseignez votre Filière Académique <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <select
                    value={selectedFiliere}
                    onChange={(e) => setSelectedFiliere(e.target.value as Filiere)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition appearance-none"
                  >
                    {ALL_FILIERES.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Adresse Email <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: etudiant@universite.bj"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Mot de passe <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-600/30 transition-all duration-200 active:scale-95 disabled:opacity-50 mt-2"
          >
            {loading ? 'Traitement en cours...' : mode === 'LOGIN' ? 'Se Connecter' : 'S\'inscrire'}
          </button>

          {/* Quick Demo Pre-fill Links */}
          {mode === 'LOGIN' && (
            <div className="pt-3 border-t border-slate-800/80 space-y-2">
              <p className="text-[11px] text-slate-400 font-medium text-center">Accès rapide pour démo :</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={fillSuperAdmin}
                  className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg text-[11px] text-amber-300 font-medium flex items-center justify-center gap-1 transition"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Super-Admin
                </button>
                <button
                  type="button"
                  onClick={fillSampleStudent}
                  className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-[11px] text-indigo-300 font-medium flex items-center justify-center gap-1 transition"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  Compte Étudiant
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
