import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ThesisCard } from './components/ThesisCard';
import { ThesisDetailModal } from './components/ThesisDetailModal';
import { DepositModal } from './components/DepositModal';
import { PaymentModal } from './components/PaymentModal';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/AdminDashboard';
import { MyDepositsModal } from './components/MyDepositsModal';
import { MyDownloadsModal } from './components/MyDownloadsModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { SupervisorDashboard } from './components/SupervisorDashboard';
import { ThemeVerifyModal } from './components/ThemeVerifyModal';
import { StudentAIAssistantModal } from './components/StudentAIAssistantModal';
import { CertificateVerificationModal } from './components/CertificateVerificationModal';
import { SimilarityReportModal } from './components/SimilarityReportModal';
import { SmartSearchInput } from './components/SmartSearchInput';
import { api } from './services/api';
import { User, Thesis, PaymentTransaction, NotificationItem, PaymentMethod, SimilarityReport } from './types';
import { BookOpen, Search, AlertCircle, RefreshCw, Sparkles, ShieldCheck, FileText, GraduationCap } from 'lucide-react';

export default function App() {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Showcase state
  const [theses, setTheses] = useState<Thesis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiliere, setSelectedFiliere] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');

  // User access mapping (paid thesis IDs)
  const [paidThesisIds, setPaidThesisIds] = useState<Set<string>>(new Set());

  // Modal controls
  const [selectedThesis, setSelectedThesis] = useState<Thesis | null>(null);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [paymentThesis, setPaymentThesis] = useState<Thesis | null>(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const [supervisorOpen, setSupervisorOpen] = useState(false);
  const [myDepositsOpen, setMyDepositsOpen] = useState(false);
  const [myDepositsList, setMyDepositsList] = useState<Thesis[]>([]);
  const [myDownloadsOpen, setMyDownloadsOpen] = useState(false);
  const [myDownloadsList, setMyDownloadsList] = useState<PaymentTransaction[]>([]);

  // Advanced AI Modals
  const [themeVerifyOpen, setThemeVerifyOpen] = useState(false);
  const [studentAIAssistantOpen, setStudentAIAssistantOpen] = useState(false);
  const [certVerifyModalOpen, setCertVerifyModalOpen] = useState(false);
  const [certVerifyThesis, setCertVerifyThesis] = useState<Thesis | null>(null);
  const [similarityReportModalOpen, setSimilarityReportModalOpen] = useState(false);
  const [similarityReport, setSimilarityReport] = useState<SimilarityReport | null>(null);
  const [similarityLoading, setSimilarityLoading] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Toast feedback banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Initial Boot
  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    setLoading(true);
    try {
      const u = await api.getMe();
      setUser(u);
      await loadData(u);
    } catch (err) {
      console.error('Failed to boot application state', err);
    } finally {
      setLoading(false);
    }
  };

  const loadData = async (currentUser: User | null = user) => {
    try {
      const [tList, notifs] = await Promise.all([
        api.fetchTheses({ status: 'VALIDE' }),
        currentUser ? api.fetchNotifications() : Promise.resolve([]),
      ]);
      setTheses(tList);
      setNotifications(notifs);

      if (currentUser) {
        const myDownloads = await api.fetchMyDownloads();
        setMyDownloadsList(myDownloads);
        setPaidThesisIds(new Set(myDownloads.map((tx) => tx.thesisId)));

        if (currentUser.role === 'DEPOSANT') {
          const myDep = await api.fetchMyTheses();
          setMyDepositsList(myDep);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Impossible de charger la base de données de mémoires');
    }
  };

  // Auth Handlers
  const handleLogin = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    setUser(res.user);
    showToast(`Bienvenue ${res.user.fullName} ! (${res.user.role})`);
    await loadData(res.user);
  };

  const handleRegister = async (payload: any) => {
    const res = await api.register(payload);
    setUser(res.user);
    showToast(`Compte créé avec succès ! Rôle : ${res.user.role}`);
    await loadData(res.user);
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setPaidThesisIds(new Set());
    setMyDepositsList([]);
    setMyDownloadsList([]);
    showToast('Vous avez été déconnecté.');
  };

  // Deposit Handler
  const handleUploadThesis = async (formData: FormData) => {
    const res = await api.uploadThesis(formData);
    showToast(res.message);
    await loadData();
    if (user?.role === 'DEPOSANT') {
      const myDep = await api.fetchMyTheses();
      setMyDepositsList(myDep);
    }
  };

  // Payment Handler
  const handleConfirmPayment = async (payload: {
    thesisId: string;
    paymentMethod: PaymentMethod;
    phoneNumber?: string;
    cardNumber?: string;
  }) => {
    const res = await api.initiatePayment(payload);
    showToast('Paiement confirmé ! Téléchargement débloqué.');
    setPaidThesisIds((prev) => new Set([...prev, payload.thesisId]));
    await loadData();
    return res.transaction;
  };

  // Trigger Download PDF
  const handleDownloadFile = (thesisId: string) => {
    const url = api.getDownloadUrl(thesisId);
    window.open(url, '_blank');
  };

  // Notifications
  const handleMarkNotificationsRead = async () => {
    await api.markNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // AI Smart Search
  const handleAISmartSearch = async (query: string) => {
    try {
      const res = await api.smartSearch(query);
      if (res.results && res.results.length > 0) {
        showToast(`Analyse IA terminée (${res.results.length} résultat(s) pertinent(s))`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Generate Similarity Report for Thesis
  const handleGenerateSimilarityReport = async (title: string, abstract: string, thesisId?: string) => {
    setSimilarityReportModalOpen(true);
    setSimilarityLoading(true);
    try {
      const rep = await api.generateSimilarityReport({ title, abstract, thesisId });
      setSimilarityReport(rep);
    } catch (err: any) {
      showToast(err.message || 'Erreur du rapport de similitude');
    } finally {
      setSimilarityLoading(false);
    }
  };

  // Filtered Showcase
  const filteredTheses = theses.filter((t) => {
    if (selectedFiliere !== 'ALL' && t.filiere !== selectedFiliere) return false;
    if (selectedYear !== 'ALL' && t.year.toString() !== selectedYear) return false;
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      return (
        t.title.toLowerCase().includes(q) ||
        t.author.toLowerCase().includes(q) ||
        t.director.toLowerCase().includes(q) ||
        t.abstract.toLowerCase().includes(q) ||
        t.keywords.some((k) => k.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-xs shadow-2xl border border-white/20 animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenDeposit={() => {
          if (!user) setAuthModalOpen(true);
          else setDepositModalOpen(true);
        }}
        onOpenAdmin={() => setAdminOpen(true)}
        onOpenSupervisor={() => setSupervisorOpen(true)}
        onOpenThemeVerify={() => setThemeVerifyOpen(true)}
        onOpenStudentAIAssistant={() => setStudentAIAssistantOpen(true)}
        onOpenCertVerify={() => {
          setCertVerifyThesis(null);
          setCertVerifyModalOpen(true);
        }}
        onOpenMyDeposits={() => setMyDepositsOpen(true)}
        onOpenMyDownloads={() => setMyDownloadsOpen(true)}
        onOpenNotifications={() => setNotificationsOpen(true)}
        onLogout={handleLogout}
        unreadNotifsCount={unreadNotifsCount}
      />

      {/* Hero Header with Search & Stats */}
      <HeroBanner
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedFiliere={selectedFiliere}
        onSelectFiliere={setSelectedFiliere}
        selectedYear={selectedYear}
        onSelectYear={setSelectedYear}
        totalValidatedCount={theses.length}
        totalDownloadsCount={theses.reduce((acc, t) => acc + t.downloadCount, 0)}
      />

      {/* Main Grid Showcase */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <span>Mémoires Publiés & Validés</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {filteredTheses.length} mémoire(s) disponible(s) selon vos critères de recherche
            </p>
          </div>

          <button
            onClick={() => loadData()}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition"
            title="Actualiser la liste"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-medium">
              Chargement des mémoires académiques en cours...
            </p>
          </div>
        ) : error ? (
          <div className="p-6 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-center max-w-md mx-auto my-10">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-rose-300">{error}</p>
          </div>
        ) : filteredTheses.length === 0 ? (
          <div className="py-20 text-center space-y-3 max-w-md mx-auto">
            <Search className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-200">Aucun mémoire trouvé</h3>
            <p className="text-xs text-slate-400">
              Ajustez vos termes de recherche ou sélectionnez une autre filière.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedFiliere('ALL');
                setSelectedYear('ALL');
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTheses.map((thesis) => {
              const hasAccess =
                user?.role === 'ADMIN' ||
                thesis.submittedByUserId === user?.id ||
                paidThesisIds.has(thesis.id);

              return (
                <ThesisCard
                  key={thesis.id}
                  thesis={thesis}
                  onSelect={(t) => setSelectedThesis(t)}
                  onInitiatePayment={(t) => {
                    if (hasAccess) {
                      handleDownloadFile(t.id);
                    } else if (!user) {
                      setAuthModalOpen(true);
                    } else {
                      setPaymentThesis(t);
                    }
                  }}
                  hasAccess={hasAccess}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto space-y-2">
          <p className="font-semibold text-slate-400">
            📚 Plateforme de Gestion Électronique des Mémoires Académiques
          </p>
          <p>
            Conforme aux normes universitaires nationales • Hébergement Cloudflare Edge & R2 • Validation
            Agréée
          </p>
        </div>
      </footer>

      {/* MODALS */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      <DepositModal
        isOpen={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
        onSubmit={handleUploadThesis}
        userFiliere={user?.filiere}
        userName={user?.fullName}
      />

      <ThesisDetailModal
        thesis={selectedThesis}
        onClose={() => setSelectedThesis(null)}
        onInitiatePayment={(t) => {
          const hasAccess =
            user?.role === 'ADMIN' ||
            t.submittedByUserId === user?.id ||
            paidThesisIds.has(t.id);

          if (hasAccess) {
            handleDownloadFile(t.id);
          } else if (!user) {
            setAuthModalOpen(true);
          } else {
            setPaymentThesis(t);
          }
        }}
        onOpenCertificate={(t) => {
          setCertVerifyThesis(t);
          setCertVerifyModalOpen(true);
        }}
        onOpenSimilarityReport={(title, abstract, id) => {
          handleGenerateSimilarityReport(title, abstract, id);
        }}
        hasAccess={
          selectedThesis
            ? user?.role === 'ADMIN' ||
              selectedThesis.submittedByUserId === user?.id ||
              paidThesisIds.has(selectedThesis.id)
            : false
        }
        isAdmin={user?.role === 'ADMIN'}
      />

      <PaymentModal
        thesis={paymentThesis}
        isOpen={!!paymentThesis}
        onClose={() => setPaymentThesis(null)}
        onConfirmPayment={handleConfirmPayment}
        onDownload={handleDownloadFile}
      />

      {adminOpen && user?.role === 'ADMIN' && (
        <AdminDashboard
          onClose={() => setAdminOpen(false)}
          onRefreshTheses={() => loadData()}
        />
      )}

      <MyDepositsModal
        isOpen={myDepositsOpen}
        onClose={() => setMyDepositsOpen(false)}
        theses={myDepositsList}
        onOpenDeposit={() => setDepositModalOpen(true)}
        onDownload={handleDownloadFile}
      />

      <MyDownloadsModal
        isOpen={myDownloadsOpen}
        onClose={() => setMyDownloadsOpen(false)}
        transactions={myDownloadsList}
        onDownload={handleDownloadFile}
      />

      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkNotificationsRead}
      />

      {/* NEW MODALS FOR ADVANCED AI & SUPERVISOR SUITE */}
      {supervisorOpen && user && (user.role === 'ENCADREUR' || user.role === 'ADMIN') && (
        <SupervisorDashboard
          user={user}
          onClose={() => setSupervisorOpen(false)}
        />
      )}

      <ThemeVerifyModal
        isOpen={themeVerifyOpen}
        onClose={() => setThemeVerifyOpen(false)}
        defaultFiliere={user?.filiere}
      />

      <StudentAIAssistantModal
        isOpen={studentAIAssistantOpen}
        onClose={() => setStudentAIAssistantOpen(false)}
        defaultFiliere={user?.filiere}
      />

      <CertificateVerificationModal
        isOpen={certVerifyModalOpen}
        onClose={() => setCertVerifyModalOpen(false)}
        thesis={certVerifyThesis}
      />

      <SimilarityReportModal
        isOpen={similarityReportModalOpen}
        onClose={() => setSimilarityReportModalOpen(false)}
        report={similarityReport}
        loading={similarityLoading}
      />
    </div>
  );
}
