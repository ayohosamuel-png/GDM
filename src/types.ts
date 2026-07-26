export type UserRole = 'ADMIN' | 'DEPOSANT' | 'VISITEUR' | 'ENCADREUR';

export type Filiere =
  | 'Informatique & Intelligence Artificielle'
  | 'Droit Public & Droit Privé'
  | 'Sciences Économiques & Gestion'
  | 'Génie Civil & Architecture'
  | 'Médecine & Sciences de la Santé'
  | 'Agronomie & Agro-industrie'
  | 'Sciences Politiques & Relations Internationales'
  | 'Sociologie & Sciences Humaines';

export type ThesisStatus = 'EN_ATTENTE' | 'VALIDE' | 'REJETE';

export type PaymentMethod = 'MTN_MOMO' | 'MOOV_MONEY' | 'CELTIS_CASH' | 'VISA_CARD';

export type PaymentStatus = 'PAYE' | 'NON_PAYE' | 'EXPIRE';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  filiere: Filiere;
  createdAt: string;
}

export interface Thesis {
  id: string;
  title: string;
  author: string;
  director: string;
  filiere: Filiere;
  specialty?: string;
  university?: string;
  department?: string;
  scientificDomain?: string;
  year: number;
  abstract: string;
  keywords: string[];
  pdfUrl: string;
  fileName: string;
  fileSize: string;
  status: ThesisStatus;
  submittedByUserId: string;
  submittedByUserName: string;
  submissionDate: string;
  validationDate?: string;
  rejectionReason?: string;
  downloadCount: number;
  priceFcfa: number;
  duplicateScore?: number; // percentage similarity with existing database
  certificateId?: string;
  qrCodeDataUrl?: string;
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  thesisId: string;
  thesisTitle: string;
  amountFcfa: number;
  paymentMethod: PaymentMethod;
  phoneNumber?: string;
  cardNumberMasked?: string;
  status: PaymentStatus;
  transactionRef: string;
  createdAt: string;
}

export interface DownloadRecord {
  id: string;
  userId: string;
  userName: string;
  thesisId: string;
  thesisTitle: string;
  downloadedAt: string;
  transactionRef: string;
}

export interface NotificationItem {
  id: string;
  userId: string; // 'ALL' or specific user ID
  title: string;
  message: string;
  type: 'SUCCESS' | 'WARNING' | 'INFO' | 'DANGER';
  read: boolean;
  createdAt: string;
}

export interface AdminStats {
  totalValidated: number;
  totalRejected: number;
  totalPending: number;
  totalUsers: number;
  totalDownloads: number;
  totalRevenueFcfa: number;
  filiereStats?: Record<string, number>;
  monthlyRevenue?: Array<{ month: string; amount: number }>;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}

// -------------------------------------------------------------
// NEW FEATURE TYPES (AI SIMILARITY, SUPERVISOR, CERTIFICATES)
// -------------------------------------------------------------

export type SupervisionStatus =
  | 'THEME_PROPOSE'
  | 'EN_REDACTION'
  | 'CORRECTIONS_DEMANDEES'
  | 'VALIDE_ENCADREUR'
  | 'SOUMIS_ADMIN';

export interface ThesisVersion {
  id: string;
  versionNumber: number;
  fileName: string;
  fileUrl: string;
  submittedAt: string;
  notes: string;
}

export interface PDFAnnotation {
  id: string;
  versionNumber: number;
  pageNumber: number;
  comment: string;
  authorName: string;
  authorRole: string;
  createdAt: string;
}

export interface StudentProject {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  supervisorId: string;
  supervisorName: string;
  filiere: Filiere;
  proposedTheme: string;
  originalityScore: number;
  riskLevel: 'Faible' | 'Moyen' | 'Élevé';
  progressPercentage: number;
  status: SupervisionStatus;
  versions: ThesisVersion[];
  annotations: PDFAnnotation[];
  createdAt: string;
  updatedAt: string;
}

export interface SimilarityReport {
  thesisId?: string;
  thesisTitle: string;
  originalityScore: number; // e.g. 88%
  similarityPercentage: number; // e.g. 12%
  riskLevel: 'FAIBLE' | 'MOYEN' | 'ELEVE';
  similarDocuments: Array<{
    id: string;
    title: string;
    author: string;
    filiere: string;
    year: number;
    similarityScore: number;
    matchedExcerpt: string;
  }>;
  similarExcerpts: Array<{
    sourceText: string;
    matchedText: string;
    documentTitle: string;
    similarity: number;
  }>;
  aiRecommendations: string[];
}

export interface ThemeVerificationResult {
  themeTitle: string;
  filiere: string;
  originalityIndex: number;
  riskLevel: 'Original' | 'Moyennement similaire' | 'Fortement similaire';
  similarTopicsFound: Array<{
    title: string;
    author: string;
    year: number;
    similarityPercent: number;
  }>;
  reformulations: string[];
  unexploredAvenues: string[];
}

export interface StudentAIAssistance {
  scientificAbstract: string;
  extractedKeywords: string[];
  structureCheck: Array<{
    section: string;
    status: 'VALIDE' | 'INCOMPLET' | 'A_AMELIORER';
    notes: string;
  }>;
  bibliographyCheck: {
    validCount: number;
    issuesFound: string[];
    suggestions: string[];
  };
  grammarAndStyleSuggestions: string[];
  incompleteSections: string[];
}

export interface AISubjectProposal {
  id: string;
  title: string;
  filiere: Filiere;
  whyOriginal: string;
  difficultyLevel: 'Facile' | 'Moyen' | 'Avancé';
  researchObjectives: string[];
  researchQuestions: string[];
}

export interface SmartSearchResult {
  query: string;
  understoodIntent: string;
  results: Array<Thesis & { matchReason: string; relevanceScore: number }>;
}

export interface SupervisorStats {
  totalStudents: number;
  pendingThemes: number;
  validatedTheses: number;
  pendingCorrections: number;
}

export interface CertificateData {
  certificateId: string;
  thesisId: string;
  title: string;
  author: string;
  director: string;
  filiere: Filiere;
  university: string;
  department: string;
  validationDate: string;
  qrCodeDataUrl: string;
  verificationUrl: string;
  digitalSignatureHash: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  role: string;
  action: string;
  details: string;
  timestamp: string;
}

