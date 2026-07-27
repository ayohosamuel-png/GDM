import {
  User,
  Thesis,
  PaymentTransaction,
  NotificationItem,
  AdminStats,
  Filiere,
  ThesisStatus,
  PaymentMethod,
  ThemeVerificationResult,
  SimilarityReport,
  StudentAIAssistance,
  SmartSearchResult,
  AISubjectProposal,
  StudentProject,
  SupervisorStats,
  CertificateData,
  AuditLog,
} from '../types';

const API_BASE = '';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('academic_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Échec de la connexion');
    localStorage.setItem('academic_auth_token', data.token);
    return data;
  },

  async register(payload: {
    fullName: string;
    email: string;
    password: string;
    role: 'DEPOSANT' | 'VISITEUR';
    filiere: Filiere;
  }): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Échec de l\'inscription');
    localStorage.setItem('academic_auth_token', data.token);
    return data;
  },

  async getMe(): Promise<User | null> {
    const token = localStorage.getItem('academic_auth_token');
    if (!token) return null;
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        localStorage.removeItem('academic_auth_token');
        return null;
      }
      const data = await res.json();
      return data.user;
    } catch {
      return null;
    }
  },

  logout(): void {
    localStorage.removeItem('academic_auth_token');
  },

  // Theses
  async fetchTheses(params?: {
    filiere?: string;
    search?: string;
    year?: string;
    status?: string;
  }): Promise<Thesis[]> {
    const query = new URLSearchParams();
    if (params?.filiere) query.append('filiere', params.filiere);
    if (params?.search) query.append('search', params.search);
    if (params?.year) query.append('year', params.year);
    if (params?.status) query.append('status', params.status);

    const res = await fetch(`${API_BASE}/api/theses?${query.toString()}`);
    if (!res.ok) throw new Error('Impossible de charger la liste des mémoires');
    return res.json();
  },

  async fetchMyTheses(): Promise<Thesis[]> {
    const res = await fetch(`${API_BASE}/api/theses/my`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Erreur lors du chargement de vos mémoires');
    return res.json();
  },

  async uploadThesis(formData: FormData): Promise<{ message: string; thesis: Thesis }> {
    const token = localStorage.getItem('academic_auth_token');
    const res = await fetch(`${API_BASE}/api/theses/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Échec du dépôt de mémoire');
    return data;
  },

  // Admin Actions
  async updateThesisStatus(
    id: string,
    status: ThesisStatus,
    rejectionReason?: string
  ): Promise<{ message: string; thesis: Thesis }> {
    const res = await fetch(`${API_BASE}/api/theses/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, rejectionReason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur de mise à jour');
    return data;
  },

  async checkDuplicates(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/api/theses/${id}/duplicate-check`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Analyse de similarité échouée');
    return res.json();
  },

  async deleteThesis(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/theses/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Échec de la suppression');
  },

  // Payments & Downloads
  async initiatePayment(payload: {
    thesisId: string;
    paymentMethod: PaymentMethod;
    phoneNumber?: string;
    cardNumber?: string;
  }): Promise<{ message: string; transaction: PaymentTransaction }> {
    const res = await fetch(`${API_BASE}/api/payments/initiate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur lors du paiement');
    return data;
  },

  async checkAccess(thesisId: string): Promise<{ hasAccess: boolean; reason?: string }> {
    const token = localStorage.getItem('academic_auth_token');
    if (!token) return { hasAccess: false };

    try {
      const res = await fetch(`${API_BASE}/api/payments/check-access/${thesisId}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) return { hasAccess: false };
      return res.json();
    } catch {
      return { hasAccess: false };
    }
  },

  async fetchMyDownloads(): Promise<PaymentTransaction[]> {
    const res = await fetch(`${API_BASE}/api/payments/my-downloads`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Erreur de chargement des téléchargements');
    return res.json();
  },

  getDownloadUrl(thesisId: string): string {
    return `${API_BASE}/api/theses/${thesisId}/download`;
  },

  // Admin Metrics
  async fetchAdminStats(): Promise<AdminStats> {
    const res = await fetch(`${API_BASE}/api/admin/stats`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Erreur lors du chargement des statistiques');
    return res.json();
  },

  async fetchUsersList(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/api/admin/users`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Erreur de chargement des utilisateurs');
    return res.json();
  },

  async fetchTransactionsList(): Promise<PaymentTransaction[]> {
    const res = await fetch(`${API_BASE}/api/admin/transactions`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Erreur de chargement de l\'historique des transactions');
    return res.json();
  },

  // Notifications
  async fetchNotifications(): Promise<NotificationItem[]> {
    const res = await fetch(`${API_BASE}/api/notifications`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  },

  async markNotificationsRead(): Promise<void> {
    await fetch(`${API_BASE}/api/notifications/mark-read`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
  },

  // -------------------------------------------------------------
  // NEW ADVANCED FEATURES (AI SIMILARITY, THEME VERIFY, SUPERVISOR)
  // -------------------------------------------------------------

  async verifyTheme(payload: {
    themeTitle: string;
    filiere: string;
    draftDescription: string;
  }): Promise<ThemeVerificationResult> {
    const res = await fetch(`${API_BASE}/api/ai/verify-theme`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur lors de la vérification du thème');
    return data;
  },

  async generateSimilarityReport(payload: {
    title: string;
    abstract: string;
    thesisId?: string;
  }): Promise<SimilarityReport> {
    const res = await fetch(`${API_BASE}/api/ai/similarity-report`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur lors de la génération du rapport de similitude');
    return data;
  },

  async runStudentAIAssistant(payload: {
    draftTitle: string;
    filiere: string;
    draftContent: string;
  }): Promise<StudentAIAssistance> {
    const res = await fetch(`${API_BASE}/api/ai/student-assistant`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur de l\'assistant IA');
    return data;
  },

  async smartSearch(query: string): Promise<SmartSearchResult> {
    const res = await fetch(`${API_BASE}/api/ai/smart-search`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ query }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur de recherche intelligente');
    return data;
  },

  async generateSupervisorSubjects(payload: {
    filiere: string;
    domainInterest?: string;
  }): Promise<AISubjectProposal[]> {
    const res = await fetch(`${API_BASE}/api/ai/generate-subjects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur lors de la génération des sujets');
    return data;
  },

  // Supervisor Management API
  async fetchSupervisorProjects(): Promise<StudentProject[]> {
    const res = await fetch(`${API_BASE}/api/supervisor/projects`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Erreur lors du chargement des étudiants suivis');
    return res.json();
  },

  async updateSupervisorProject(
    id: string,
    payload: Partial<StudentProject>
  ): Promise<StudentProject> {
    const res = await fetch(`${API_BASE}/api/supervisor/projects/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur de mise à jour du projet');
    return data.project;
  },

  async addProjectAnnotation(
    projectId: string,
    annotation: { pageNumber: number; comment: string; versionNumber: number }
  ): Promise<StudentProject> {
    const res = await fetch(`${API_BASE}/api/supervisor/projects/${projectId}/annotations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(annotation),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur lors de l\'ajout de l\'annotation');
    return data.project;
  },

  async uploadProjectVersion(
    projectId: string,
    versionData: { fileName: string; notes: string }
  ): Promise<StudentProject> {
    const res = await fetch(`${API_BASE}/api/supervisor/projects/${projectId}/versions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(versionData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur lors du dépôt de la nouvelle version');
    return data.project;
  },

  async fetchSupervisorStats(): Promise<SupervisorStats> {
    const res = await fetch(`${API_BASE}/api/supervisor/stats`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Erreur de chargement des statistiques d\'encadrement');
    return res.json();
  },

  // Public Certificate Verification
  async verifyCertificate(certificateId: string): Promise<CertificateData> {
    const res = await fetch(`${API_BASE}/api/certificates/verify/${certificateId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Certificat invalide ou introuvable');
    return data;
  },

  // Admin Audit Logs
  async fetchAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch(`${API_BASE}/api/admin/audit-logs`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  },
};
