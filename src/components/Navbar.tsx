import React from 'react';
import {
  GraduationCap,
  Upload,
  User as UserIcon,
  Bell,
  LogOut,
  ShieldCheck,
  FileText,
  Download,
  BookOpen,
} from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  onOpenAuth: () => void;
  onOpenDeposit: () => void;
  onOpenAdmin: () => void;
  onOpenSupervisor?: () => void;
  onOpenThemeVerify?: () => void;
  onOpenStudentAIAssistant?: () => void;
  onOpenCertVerify?: () => void;
  onOpenMyDeposits: () => void;
  onOpenMyDownloads: () => void;
  onOpenNotifications: () => void;
  onLogout: () => void;
  unreadNotifsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenAuth,
  onOpenDeposit,
  onOpenAdmin,
  onOpenSupervisor,
  onOpenThemeVerify,
  onOpenStudentAIAssistant,
  onOpenCertVerify,
  onOpenMyDeposits,
  onOpenMyDownloads,
  onOpenNotifications,
  onLogout,
  unreadNotifsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-sky-400 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                e-Mémoires
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full uppercase tracking-wider">
                Académique
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              Portail National des Travaux de Recherche
            </p>
          </div>
        </div>

        {/* Center Quick AI Navigation */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs">
          {onOpenThemeVerify && (
            <button
              onClick={onOpenThemeVerify}
              className="px-3 py-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl transition flex items-center gap-1.5 font-medium"
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>Vérifier Thème</span>
            </button>
          )}

          {onOpenStudentAIAssistant && (
            <button
              onClick={onOpenStudentAIAssistant}
              className="px-3 py-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl transition flex items-center gap-1.5 font-medium"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Assistant Rédaction</span>
            </button>
          )}

          {onOpenCertVerify && (
            <button
              onClick={onOpenCertVerify}
              className="px-3 py-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl transition flex items-center gap-1.5 font-medium"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Vérifier Certificat</span>
            </button>
          )}
        </div>

        {/* Quick Actions & Navigation */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Deposit CTA Button for Students */}
          {user && user.role === 'DEPOSANT' && (
            <button
              onClick={onOpenDeposit}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all duration-200 active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden md:inline">Déposer un Mémoire</span>
            </button>
          )}

          {/* Supervisor Dashboard CTA */}
          {user && (user.role === 'ENCADREUR' || user.role === 'ADMIN') && onOpenSupervisor && (
            <button
              onClick={onOpenSupervisor}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 hover:bg-purple-500/30 text-xs sm:text-sm font-semibold transition-all shadow-md shadow-purple-500/10"
            >
              <GraduationCap className="w-4 h-4 text-purple-400" />
              <span>Espace Encadreur</span>
            </button>
          )}

          {/* Admin Dashboard CTA */}
          {user && user.role === 'ADMIN' && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs sm:text-sm font-semibold transition-all shadow-md shadow-amber-500/10"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Espace Admin</span>
            </button>
          )}

          {/* Notifications Trigger */}
          {user && (
            <button
              onClick={onOpenNotifications}
              className="relative p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/50 transition-all"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotifsCount}
                </span>
              )}
            </button>
          )}

          {/* User Account State */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              {/* User Menu Quick Actions */}
              <div className="hidden lg:flex items-center gap-1.5">
                {user.role === 'DEPOSANT' && (
                  <button
                    onClick={onOpenMyDeposits}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    Mes Dépôts
                  </button>
                )}
                <button
                  onClick={onOpenMyDownloads}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  Mes Achats
                </button>
              </div>

              {/* User Profile Pill */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-xs uppercase border border-indigo-500/30">
                  {user.fullName.substring(0, 2)}
                </div>
                <div className="hidden xl:block text-left">
                  <p className="text-xs font-semibold text-white truncate max-w-[120px]">
                    {user.fullName}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium capitalize">
                    {user.role === 'ADMIN'
                      ? 'Super-Admin'
                      : user.role === 'DEPOSANT'
                      ? 'Déposant (Étudiant)'
                      : 'Visiteur'}
                  </p>
                </div>
                <button
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                  title="Déconnexion"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/20 transition-all duration-200 active:scale-95"
            >
              <UserIcon className="w-4 h-4" />
              <span>Se Connecter</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

