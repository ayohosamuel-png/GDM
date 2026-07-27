import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Download,
  DollarSign,
  Search,
  Filter,
  Eye,
  Trash2,
  AlertCircle,
  Copy,
  RefreshCw,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../services/api';
import { AdminStats, Thesis, User, PaymentTransaction, ThesisStatus } from '../types';

interface AdminDashboardProps {
  onClose: () => void;
  onRefreshTheses: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onClose,
  onRefreshTheses,
}) => {
  const [activeTab, setActiveTab] = useState<'PENDING' | 'ALL_THESES' | 'USERS' | 'TRANSACTIONS'>('PENDING');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data
  const [theses, setTheses] = useState<Thesis[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);

  // Action modals
  const [selectedThesis, setSelectedThesis] = useState<Thesis | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [duplicateMatches, setDuplicateMatches] = useState<any | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, tList, uList, txList] = await Promise.all([
        api.fetchAdminStats(),
        api.fetchTheses({ status: 'ALL' }),
        api.fetchUsersList(),
        api.fetchTransactionsList(),
      ]);
      setStats(s);
      setTheses(tList);
      setUsers(uList);
      setTransactions(txList);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement du tableau de bord administrateur');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (thesisId: string, status: ThesisStatus) => {
    setStatusLoading(true);
    try {
      await api.updateThesisStatus(thesisId, status, rejectionReason);
      setSelectedThesis(null);
      setRejectionReason('');
      await loadAdminData();
      onRefreshTheses();
    } catch (err: any) {
      alert(err.message || 'Échec de la mise à jour');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDeleteThesis = async (thesisId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer définitivement ce mémoire ?')) return;
    try {
      await api.deleteThesis(thesisId);
      await loadAdminData();
      onRefreshTheses();
    } catch (err: any) {
      alert(err.message || 'Suppression échouée');
    }
  };

  const handleCheckDuplicates = async (thesisId: string) => {
    try {
      const res = await api.checkDuplicates(thesisId);
      setDuplicateMatches(res);
    } catch (err: any) {
      alert(err.message || 'Vérification de doublons échouée');
    }
  };

  const pendingTheses = theses.filter((t) => t.status === 'EN_ATTENTE');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md overflow-y-auto p-4 sm:p-6">
      <div className="max-w-7xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-4">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 px-6 py-6 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Panneau d'Administration Général</h2>
                <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full uppercase">
                  Super-Admin Unique
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Connecté en tant que : <span className="text-amber-200">goodluckelishaagboguin@gmail.com</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAdminData}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
              title="Actualiser les données"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
            >
              Quitter l'Espace Admin
            </button>
          </div>
        </div>

        {/* 6 Real-Time Global Stats Cards */}
        <div className="p-6 grid grid-cols-2 lg:grid-cols-6 gap-3 border-b border-slate-800 bg-slate-950/50">
          {/* Validated */}
          <div className="p-4 bg-slate-900 border border-emerald-500/20 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">Validés</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-2">
              {stats ? stats.totalValidated : '...'}
            </div>
          </div>

          {/* Rejected */}
          <div className="p-4 bg-slate-900 border border-rose-500/20 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">Rejetés</span>
              <XCircle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-400 mt-2">
              {stats ? stats.totalRejected : '...'}
            </div>
          </div>

          {/* Pending */}
          <div className="p-4 bg-slate-900 border border-amber-500/20 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">En attente</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 mt-2">
              {stats ? stats.totalPending : '...'}
            </div>
          </div>

          {/* Total Users */}
          <div className="p-4 bg-slate-900 border border-indigo-500/20 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">Inscrits</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-indigo-400 mt-2">
              {stats ? stats.totalUsers : '...'}
            </div>
          </div>

          {/* Total Downloads */}
          <div className="p-4 bg-slate-900 border border-purple-500/20 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">Téléchargements</span>
              <Download className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-purple-400 mt-2">
              {stats ? stats.totalDownloads : '...'}
            </div>
          </div>

          {/* Total Revenue */}
          <div className="p-4 bg-slate-900 border border-sky-500/20 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">Recettes FCFA</span>
              <DollarSign className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-lg font-black text-sky-300 mt-2 truncate">
              {stats ? `${stats.totalRevenueFcfa.toLocaleString()} F` : '...'}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/80 px-6 pt-2">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-5 py-3 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'PENDING'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            Validation des Dépôts ({pendingTheses.length})
          </button>

          <button
            onClick={() => setActiveTab('ALL_THESES')}
            className={`px-5 py-3 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'ALL_THESES'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            Tous les Mémoires ({theses.length})
          </button>

          <button
            onClick={() => setActiveTab('USERS')}
            className={`px-5 py-3 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'USERS'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Utilisateurs Inscrits ({users.length})
          </button>

          <button
            onClick={() => setActiveTab('TRANSACTIONS')}
            className={`px-5 py-3 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'TRANSACTIONS'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Paiements & Téléchargements ({transactions.length})
          </button>
        </div>

        {/* TAB 1: PENDING THESES VALIDATION QUEUE */}
        {activeTab === 'PENDING' && (
          <div className="p-6 space-y-4">
            {pendingTheses.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="text-sm font-semibold">Aucun mémoire en attente de validation !</p>
                <p className="text-xs text-slate-500 mt-1">
                  Toutes les soumissions soumises ont été examinées par l'administration.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingTheses.map((thesis) => (
                  <div
                    key={thesis.id}
                    className="p-5 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
                          En Attente de Décision
                        </span>
                        <span className="text-xs text-slate-400">{thesis.filiere}</span>
                        {thesis.duplicateScore !== undefined && thesis.duplicateScore > 30 && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Alerte Doublon : {thesis.duplicateScore}%
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-bold text-white">{thesis.title}</h4>

                      <div className="text-xs text-slate-400 flex flex-wrap gap-x-4 gap-y-1 pt-1">
                        <span>Auteur : <strong className="text-slate-200">{thesis.author}</strong></span>
                        <span>Directeur : {thesis.director}</span>
                        <span>Année : {thesis.year}</span>
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-2 mt-2 font-normal">
                        {thesis.abstract}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleCheckDuplicates(thesis.id)}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Détecter Doublon
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(thesis.id, 'VALIDE')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Valider
                      </button>

                      <button
                        onClick={() => setSelectedThesis(thesis)}
                        className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        Rejeter...
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ALL THESES */}
        {activeTab === 'ALL_THESES' && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Mémoire & Titre</th>
                    <th className="p-3">Filière</th>
                    <th className="p-3">Auteur</th>
                    <th className="p-3">Statut</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {theses.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-950/40 transition">
                      <td className="p-3 font-semibold text-white max-w-md">
                        <div className="truncate">{t.title}</div>
                        <div className="text-[10px] text-slate-500">
                          {t.fileName} • {t.downloadCount} dl
                        </div>
                      </td>
                      <td className="p-3 text-slate-300">{t.filiere}</td>
                      <td className="p-3 text-slate-200">{t.author}</td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                            t.status === 'VALIDE'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : t.status === 'EN_ATTENTE'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => handleDeleteThesis(t.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: REGISTERED USERS */}
        {activeTab === 'USERS' && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Utilisateur</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Rôle Métier</th>
                    <th className="p-3">Filière Renseignée</th>
                    <th className="p-3">Date d'Inscription</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-950/40 transition">
                      <td className="p-3 font-semibold text-white">{u.fullName}</td>
                      <td className="p-3 text-slate-300">{u.email}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                            u.role === 'ADMIN'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : u.role === 'DEPOSANT'
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{u.filiere}</td>
                      <td className="p-3 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: TRANSACTIONS & DOWNLOAD LOGS */}
        {activeTab === 'TRANSACTIONS' && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Réf. Transaction</th>
                    <th className="p-3">Acheteur</th>
                    <th className="p-3">Mémoire Pris</th>
                    <th className="p-3">Opérateur</th>
                    <th className="p-3">Montant</th>
                    <th className="p-3">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-950/40 transition">
                      <td className="p-3 font-mono text-indigo-300 font-semibold">{tx.transactionRef}</td>
                      <td className="p-3 text-white">
                        <div>{tx.userName}</div>
                        <div className="text-[10px] text-slate-500">{tx.userEmail}</div>
                      </td>
                      <td className="p-3 text-slate-300 max-w-xs truncate">{tx.thesisTitle}</td>
                      <td className="p-3 text-slate-200 font-semibold">{tx.paymentMethod.replace('_', ' ')}</td>
                      <td className="p-3 font-bold text-emerald-400">{tx.amountFcfa} FCFA</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 rounded-full">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REJECTION REASON DIALOG MODAL */}
        {selectedThesis && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full space-y-4">
              <h3 className="text-lg font-bold text-white">Rejeter le Mémoire</h3>
              <p className="text-xs text-slate-400">
                Saisissez le motif du rejet qui sera transmis à l'étudiant ({selectedThesis.author}) :
              </p>

              <textarea
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Ex: Document incomplet, mise en page non conforme ou plagiat partiel..."
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setSelectedThesis(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedThesis.id, 'REJETE')}
                  disabled={statusLoading}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl"
                >
                  {statusLoading ? 'Mise à jour...' : 'Confirmer le Rejet'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DUPLICATE CHECK RESULT MODAL */}
        {duplicateMatches && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-lg w-full space-y-4">
              <h3 className="text-lg font-bold text-white">Rapport d'Analyse Anti-Plagiat / Doublon</h3>
              <p className="text-xs text-slate-400">
                Score maximal de similarité détecté :{' '}
                <strong className="text-rose-400">{duplicateMatches.highestSimilarity}%</strong>
              </p>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {duplicateMatches.matches.length === 0 ? (
                  <p className="text-xs text-emerald-400">Aucun doublon significatif détecté dans la base.</p>
                ) : (
                  duplicateMatches.matches.map((m: any, i: number) => (
                    <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                      <div className="font-bold text-white">{m.otherTitle}</div>
                      <div className="text-slate-400">Auteur : {m.otherAuthor} | Filière : {m.otherFiliere}</div>
                      <div className="text-rose-400 font-semibold">Taux de ressemblance : {m.overallSimilarity}%</div>
                    </div>
                  ))
                )}
              </div>

              <div className="text-right">
                <button
                  onClick={() => setDuplicateMatches(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Fermer le Rapport
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
