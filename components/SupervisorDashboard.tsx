import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Sparkles,
  Lightbulb,
  FileText,
  History,
  MessageSquare,
  Plus,
  BarChart3,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { StudentProject, SupervisorStats, User } from '../types';
import { api } from '../services/api';
import { ThemeVerifyModal } from './ThemeVerifyModal';
import { AISubjectGeneratorModal } from './AISubjectGeneratorModal';
import { PDFAnnotatorModal } from './PDFAnnotatorModal';

interface SupervisorDashboardProps {
  user: User;
  onClose: () => void;
}

export const SupervisorDashboard: React.FC<SupervisorDashboardProps> = ({ user, onClose }) => {
  const [projects, setProjects] = useState<StudentProject[]>([]);
  const [stats, setStats] = useState<SupervisorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'PROJECTS' | 'STATS'>('PROJECTS');

  // Modals
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [subjectGenOpen, setSubjectGenOpen] = useState(false);
  const [selectedProjectForAnnotate, setSelectedProjectForAnnotate] = useState<StudentProject | null>(null);

  // New Student Project Form
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newProposedTheme, setNewProposedTheme] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [projList, st] = await Promise.all([
        api.fetchSupervisorProjects(),
        api.fetchSupervisorStats(),
      ]);
      setProjects(projList);
      setStats(st);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newProposedTheme.trim()) return;

    try {
      const created: StudentProject = {
        id: `proj-${Date.now()}`,
        studentId: `usr-st-${Date.now()}`,
        studentName: newStudentName.trim(),
        studentEmail: newStudentEmail.trim() || 'etudiant@univ.bj',
        supervisorId: user.id,
        supervisorName: user.fullName,
        filiere: user.filiere,
        proposedTheme: newProposedTheme.trim(),
        originalityScore: 92,
        riskLevel: 'Faible',
        progressPercentage: 15,
        status: 'THEME_PROPOSE',
        versions: [
          {
            id: `ver-1`,
            versionNumber: 1,
            fileName: 'Proposition_Theme_Propose.pdf',
            fileUrl: '/api/sample-pdf/default.pdf',
            submittedAt: new Date().toISOString(),
            notes: 'Thème initial soumis à l\'encadreur.',
          },
        ],
        annotations: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setProjects((prev) => [created, ...prev]);
      setNewProjectModalOpen(false);
      setNewStudentName('');
      setNewStudentEmail('');
      setNewProposedTheme('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProjectState = (updated: StudentProject) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (selectedProjectForAnnotate?.id === updated.id) {
      setSelectedProjectForAnnotate(updated);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6 h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 px-6 py-5 border-b border-slate-800 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/20 rounded-xl border border-purple-400/30">
              <Users className="w-6 h-6 text-purple-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">Espace Encadreur / Professeur</h3>
                <span className="px-2.5 py-0.5 text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
                  {user.filiere}
                </span>
              </div>
              <p className="text-xs text-purple-200">
                Suivi académique, annotations PDF, vérification d'originalité & générateur IA
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSubjectGenOpen(true)}
              className="px-3.5 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/40 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
            >
              <Lightbulb className="w-4 h-4 text-yellow-300" />
              Générateur de Sujets IA
            </button>
            <button
              onClick={() => setVerifyModalOpen(true)}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-purple-600/20"
            >
              <Search className="w-4 h-4" />
              Vérifier un Thème
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('PROJECTS')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
                activeTab === 'PROJECTS'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Étudiants & Mémoires Suivis ({projects.length})
            </button>
            <button
              onClick={() => setActiveTab('STATS')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
                activeTab === 'STATS'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Tableau de Bord & Statistiques
            </button>
          </div>

          <button
            onClick={() => setNewProjectModalOpen(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Assigner un Nouvel Étudiant
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-medium">Chargement des données d'encadrement...</p>
            </div>
          ) : activeTab === 'STATS' ? (
            /* Stats Tab */
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                  <span className="text-xs text-slate-400 font-medium">Étudiants Suivis</span>
                  <div className="text-3xl font-black text-white">{stats?.totalStudents || projects.length}</div>
                  <span className="text-[10px] text-indigo-400 font-semibold">Promotion Active</span>
                </div>

                <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                  <span className="text-xs text-slate-400 font-medium">Thèmes en Attente</span>
                  <div className="text-3xl font-black text-amber-400">{stats?.pendingThemes || 2}</div>
                  <span className="text-[10px] text-amber-400/80 font-semibold">À valider</span>
                </div>

                <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                  <span className="text-xs text-slate-400 font-medium">Mémoires Validés</span>
                  <div className="text-3xl font-black text-emerald-400">{stats?.validatedTheses || 1}</div>
                  <span className="text-[10px] text-emerald-400/80 font-semibold">Prêts pour l'Admin</span>
                </div>

                <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                  <span className="text-xs text-slate-400 font-medium">Corrections en Cours</span>
                  <div className="text-3xl font-black text-purple-400">{stats?.pendingCorrections || 1}</div>
                  <span className="text-[10px] text-purple-400 font-semibold">En révision</span>
                </div>
              </div>

              {/* Progress Distribution */}
              <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Avancement Global des Travaux de Recherche
                </h4>
                <div className="space-y-4">
                  {projects.map((p) => (
                    <div key={p.id} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-white">{p.studentName} — {p.proposedTheme}</span>
                        <span className="font-mono text-purple-400 font-bold">{p.progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${p.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Projects List Tab */
            <div className="space-y-4">
              {projects.length === 0 ? (
                <div className="text-center py-16 text-slate-500">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-semibold">Aucun étudiant assigné pour le moment.</p>
                  <p className="text-xs text-slate-600 mt-1">Cliquez sur "Assigner un Nouvel Étudiant" pour démarrer un suivi.</p>
                </div>
              ) : (
                projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 hover:border-purple-500/40 transition"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2.5 py-0.5 text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
                            {proj.filiere}
                          </span>
                          <span className="text-xs font-bold text-white">{proj.studentName}</span>
                          <span className="text-[11px] text-slate-500">({proj.studentEmail})</span>
                        </div>
                        <h4 className="text-sm font-bold text-white">{proj.proposedTheme}</h4>
                      </div>

                      {/* Status Badges */}
                      <div className="shrink-0 flex items-center gap-2">
                        {proj.status === 'THEME_PROPOSE' && (
                          <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Thème Proposé
                          </span>
                        )}
                        {proj.status === 'EN_REDACTION' && (
                          <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-bold flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" /> En Rédaction
                          </span>
                        )}
                        {proj.status === 'CORRECTIONS_DEMANDEES' && (
                          <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full text-xs font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Corrections Demandées
                          </span>
                        )}
                        {proj.status === 'VALIDE_ENCADREUR' && (
                          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Validé par l'Encadreur
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress & Originality score */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-900 text-xs">
                      <div>
                        <span className="text-slate-400 text-[11px]">Progression Générale ({proj.progressPercentage}%)</span>
                        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden mt-1 border border-slate-800">
                          <div
                            className="bg-purple-500 h-full rounded-full"
                            style={{ width: `${proj.progressPercentage}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 text-[11px]">Score d'Originalité IA</span>
                        <p className="font-bold text-emerald-400 mt-0.5">{proj.originalityScore}% (Risque {proj.riskLevel})</p>
                      </div>

                      <div>
                        <span className="text-slate-400 text-[11px]">Versions & Annotations</span>
                        <p className="font-bold text-white mt-0.5">
                          {proj.versions.length} version(s) • {proj.annotations.length} annotation(s)
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-900/60 justify-end">
                      <button
                        onClick={() => setSelectedProjectForAnnotate(proj)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-purple-600/20"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Ouvrir l'Espace Annotations PDF & Révision
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* New Student Assign Modal */}
      {newProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white">Assigner un Nouvel Étudiant</h4>
              <button onClick={() => setNewProjectModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Nom complet de l'étudiant</label>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Ex: Armel HOUNGBEDJI"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Email universitaire</label>
                <input
                  type="email"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  placeholder="armel.houngbedji@student.univ.bj"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Thème de mémoire validé</label>
                <textarea
                  rows={2}
                  required
                  value={newProposedTheme}
                  onChange={(e) => setNewProposedTheme(e.target.value)}
                  placeholder="Intitulé officiel du sujet..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition"
              >
                Créer la Fiche de Suivi
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Sub Modals */}
      <ThemeVerifyModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        defaultFiliere={user.filiere}
      />

      <AISubjectGeneratorModal
        isOpen={subjectGenOpen}
        onClose={() => setSubjectGenOpen(false)}
        defaultFiliere={user.filiere}
      />

      <PDFAnnotatorModal
        isOpen={!!selectedProjectForAnnotate}
        onClose={() => setSelectedProjectForAnnotate(null)}
        project={selectedProjectForAnnotate}
        onUpdateProject={handleUpdateProjectState}
      />
    </div>
  );
};
