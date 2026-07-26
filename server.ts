import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_USERS,
  INITIAL_THESES,
  INITIAL_TRANSACTIONS,
  INITIAL_NOTIFICATIONS,
  SUPER_ADMIN_USER,
} from './src/data/seedData.js';
import {
  User,
  Thesis,
  PaymentTransaction,
  NotificationItem,
  AdminStats,
  Filiere,
  ThesisStatus,
  PaymentMethod,
} from './src/types.js';
import { calculateTextSimilarity } from './src/utils/similarity.js';

const JWT_SECRET = process.env.JWT_SECRET || 'academic-theses-super-secret-key-2026';
const PORT = 3000;

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage for persistence
let dbUsers: User[] = [...INITIAL_USERS];
let dbTheses: Thesis[] = [...INITIAL_THESES];
let dbTransactions: PaymentTransaction[] = [...INITIAL_TRANSACTIONS];
let dbNotifications: NotificationItem[] = [...INITIAL_NOTIFICATIONS];
let dbDownloads: { id: string; userId: string; thesisId: string; downloadedAt: string }[] = [];

// Multer config for PDF files only
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

// Authenticated Request interface
interface AuthRequest extends Request {
  user?: User;
}

// Auth Middleware
function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Accès non autorisé : Jeton manquant' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = dbUsers.find((u) => u.id === decoded.userId);
    if (!user) {
      res.status(403).json({ error: 'Utilisateur introuvable' });
      return;
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Jeton invalide ou expiré' });
    return;
  }
}

// Require Admin Middleware
function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Droits d\'administration requis pour cette opération' });
    return;
  }
  next();
}

async function startServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // -------------------------------------------------------------
  // AUTHENTICATION ROUTES
  // -------------------------------------------------------------

  // Login
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Veuillez saisir votre email et votre mot de passe' });
      return;
    }

    // Check Super-Admin strict credentials
    if (email.trim().toLowerCase() === 'goodluckelishaagboguin@gmail.com') {
      if (password !== 'Goodluck2003@') {
        res.status(401).json({ error: 'Mot de passe administrateur incorrect' });
        return;
      }
      let adminUser = dbUsers.find((u) => u.email === SUPER_ADMIN_USER.email);
      if (!adminUser) {
        adminUser = { ...SUPER_ADMIN_USER };
        dbUsers.push(adminUser);
      }
      const token = jwt.sign({ userId: adminUser.id, role: adminUser.role }, JWT_SECRET, {
        expiresIn: '7d',
      });
      res.json({ token, user: adminUser });
      return;
    }

    // Regular users login
    const user = dbUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      res.status(401).json({ error: 'Identifiants introuvables. Veuillez créer un compte.' });
      return;
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  });

  // Register
  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { fullName, email, password, role, filiere } = req.body;

    if (!fullName || !email || !password || !role || !filiere) {
      res.status(400).json({ error: 'Veuillez remplir tous les champs obligatoires' });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Prevent usurping Super-Admin
    if (trimmedEmail === 'goodluckelishaagboguin@gmail.com') {
      res.status(400).json({
        error: 'Cet email est réservé au Super-Administrateur. Veuillez utiliser la connexion administrateur.',
      });
      return;
    }

    // Prevent regular user from assigning ADMIN role
    if (role === 'ADMIN') {
      res.status(403).json({
        error: 'Seul l\'administrateur unique préconfiguré peut posséder le rôle Admin.',
      });
      return;
    }

    const existingUser = dbUsers.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (existingUser) {
      res.status(400).json({ error: 'Un compte existe déjà avec cette adresse email.' });
      return;
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      fullName: fullName.trim(),
      email: trimmedEmail,
      role: role === 'DEPOSANT' ? 'DEPOSANT' : 'VISITEUR',
      filiere: filiere as Filiere,
      createdAt: new Date().toISOString(),
    };

    dbUsers.push(newUser);

    const token = jwt.sign({ userId: newUser.id, role: newUser.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({ token, user: newUser });
  });

  // Get Current User profile
  app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
    res.json({ user: req.user });
  });

  // -------------------------------------------------------------
  // THESES & PUBLIC SHOWCASE API
  // -------------------------------------------------------------

  // Get Thesis List (Public filter: Validated only unless Admin or Owner)
  app.get('/api/theses', (req: Request, res: Response) => {
    const { filiere, search, year, status } = req.query;

    let result = [...dbTheses];

    // Status filter
    if (status && typeof status === 'string') {
      result = result.filter((t) => t.status === status);
    } else {
      // By default for standard request, return only validated
      // If client requests all, they specify status parameter
    }

    // Filiere filter
    if (filiere && typeof filiere === 'string' && filiere !== 'ALL') {
      result = result.filter((t) => t.filiere === filiere);
    }

    // Search query filter
    if (search && typeof search === 'string' && search.trim().length > 0) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.author.toLowerCase().includes(q) ||
          t.director.toLowerCase().includes(q) ||
          t.abstract.toLowerCase().includes(q) ||
          t.keywords.some((k) => k.toLowerCase().includes(q))
      );
    }

    // Year filter
    if (year && !isNaN(Number(year))) {
      result = result.filter((t) => t.year === Number(year));
    }

    res.json(result);
  });

  // Get My Deposits (For Students / Deposants)
  app.get('/api/theses/my', authenticateToken, (req: AuthRequest, res: Response) => {
    const myTheses = dbTheses.filter((t) => t.submittedByUserId === req.user?.id);
    res.json(myTheses);
  });

  // Get Single Thesis
  app.get('/api/theses/:id', (req: Request, res: Response) => {
    const thesis = dbTheses.find((t) => t.id === req.params.id);
    if (!thesis) {
      res.status(404).json({ error: 'Mémoire introuvable' });
      return;
    }
    res.json(thesis);
  });

  // Upload Thesis (PDF only)
  app.post(
    '/api/theses/upload',
    authenticateToken,
    upload.single('pdfFile'),
    (req: AuthRequest, res: Response) => {
      if (!req.user) {
        res.status(401).json({ error: 'Non authentifié' });
        return;
      }

      if (req.user.role === 'VISITEUR') {
        res.status(403).json({
          error: 'Les visiteurs ne peuvent pas déposer de mémoire. Votre compte doit être un compte Déposant.',
        });
        return;
      }

      const { title, author, director, filiere, specialty, year, abstract, keywords } = req.body;

      if (!title || !author || !director || !filiere || !year || !abstract) {
        res.status(400).json({ error: 'Veuillez remplir tous les champs requis du mémoire.' });
        return;
      }

      const file = req.file;
      const pdfUrl = file ? `/uploads/${file.filename}` : `/api/sample-pdf/default.pdf`;
      const fileName = file ? file.originalname : 'Memoire_Academique.pdf';
      const fileSize = file ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : '3.2 MB';

      // Calculate duplicate score against existing validated theses
      let maxSimilarity = 0;
      dbTheses.forEach((existing) => {
        const titleSim = calculateTextSimilarity(title, existing.title);
        const absSim = calculateTextSimilarity(abstract, existing.abstract);
        const sim = Math.max(titleSim, absSim);
        if (sim > maxSimilarity) maxSimilarity = sim;
      });

      const parsedKeywords = typeof keywords === 'string'
        ? keywords.split(',').map((k) => k.trim()).filter(Boolean)
        : Array.isArray(keywords) ? keywords : ['Académique', 'Mémoire'];

      const newThesis: Thesis = {
        id: `thm-${Date.now()}`,
        title: title.trim(),
        author: author.trim(),
        director: director.trim(),
        filiere: filiere as Filiere,
        specialty: specialty ? specialty.trim() : undefined,
        year: Number(year) || new Date().getFullYear(),
        abstract: abstract.trim(),
        keywords: parsedKeywords,
        pdfUrl,
        fileName,
        fileSize,
        status: 'EN_ATTENTE', // Automatic status as requested!
        submittedByUserId: req.user.id,
        submittedByUserName: req.user.fullName,
        submissionDate: new Date().toISOString(),
        downloadCount: 0,
        priceFcfa: 5000,
        duplicateScore: maxSimilarity,
      };

      dbTheses.unshift(newThesis);

      // Create notification for admin
      dbNotifications.unshift({
        id: `notif-${Date.now()}`,
        userId: SUPER_ADMIN_USER.id,
        title: 'Nouveau mémoire déposé',
        message: `L'étudiant ${req.user.fullName} a déposé : "${newThesis.title.substring(0, 60)}..."`,
        type: 'INFO',
        read: false,
        createdAt: new Date().toISOString(),
      });

      res.status(201).json({
        message: 'Mémoire soumis avec succès ! Il est actuellement en attente de validation par l\'administrateur.',
        thesis: newThesis,
      });
    }
  );

  // Admin validation/rejection action
  app.put('/api/theses/:id/status', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
    const { status, rejectionReason } = req.body;
    const thesisIndex = dbTheses.findIndex((t) => t.id === req.params.id);

    if (thesisIndex === -1) {
      res.status(404).json({ error: 'Mémoire introuvable' });
      return;
    }

    if (status !== 'VALIDE' && status !== 'REJETE') {
      res.status(400).json({ error: 'Statut invalide' });
      return;
    }

    const thesis = dbTheses[thesisIndex];
    thesis.status = status as ThesisStatus;
    thesis.validationDate = new Date().toISOString();

    if (status === 'REJETE') {
      thesis.rejectionReason = rejectionReason || 'Non conforme aux normes académiques requises.';
    } else {
      thesis.rejectionReason = undefined;
    }

    // Send notification to depositor
    dbNotifications.unshift({
      id: `notif-${Date.now()}`,
      userId: thesis.submittedByUserId,
      title: status === 'VALIDE' ? 'Mémoire Validé ! 🎉' : 'Mémoire Rejeté ⚠️',
      message:
        status === 'VALIDE'
          ? `Votre mémoire "${thesis.title.substring(0, 50)}..." a été approuvé et est désormais publié.`
          : `Votre mémoire "${thesis.title.substring(0, 50)}..." a été rejeté. Motif : ${thesis.rejectionReason}`,
      type: status === 'VALIDE' ? 'SUCCESS' : 'DANGER',
      read: false,
      createdAt: new Date().toISOString(),
    });

    res.json({ message: `Statut du mémoire mis à jour en ${status}`, thesis });
  });

  // Duplicate similarity check API
  app.get('/api/theses/:id/duplicate-check', authenticateToken, requireAdmin, (req: Request, res: Response) => {
    const thesis = dbTheses.find((t) => t.id === req.params.id);
    if (!thesis) {
      res.status(404).json({ error: 'Mémoire introuvable' });
      return;
    }

    const comparisons = dbTheses
      .filter((t) => t.id !== thesis.id)
      .map((other) => {
        const titleSim = calculateTextSimilarity(thesis.title, other.title);
        const abstractSim = calculateTextSimilarity(thesis.abstract, other.abstract);
        const overall = Math.max(titleSim, abstractSim);
        return {
          otherThesisId: other.id,
          otherTitle: other.title,
          otherAuthor: other.author,
          otherFiliere: other.filiere,
          titleSimilarity: titleSim,
          abstractSimilarity: abstractSim,
          overallSimilarity: overall,
        };
      })
      .filter((c) => c.overallSimilarity > 10)
      .sort((a, b) => b.overallSimilarity - a.overallSimilarity);

    res.json({
      thesisId: thesis.id,
      thesisTitle: thesis.title,
      highestSimilarity: comparisons.length > 0 ? comparisons[0].overallSimilarity : 0,
      matches: comparisons,
    });
  });

  // Delete Thesis (Admin only)
  app.delete('/api/theses/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
    const index = dbTheses.findIndex((t) => t.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ error: 'Mémoire introuvable' });
      return;
    }
    const deleted = dbTheses.splice(index, 1)[0];
    res.json({ message: 'Mémoire supprimé avec succès', thesis: deleted });
  });

  // -------------------------------------------------------------
  // PAYMENT & DOWNLOAD SYSTEM
  // -------------------------------------------------------------

  // Initiate Payment
  app.post('/api/payments/initiate', authenticateToken, (req: AuthRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: 'Non authentifié' });
      return;
    }

    const { thesisId, paymentMethod, phoneNumber, cardNumber } = req.body;

    const thesis = dbTheses.find((t) => t.id === thesisId);
    if (!thesis) {
      res.status(404).json({ error: 'Mémoire introuvable' });
      return;
    }

    if (thesis.status !== 'VALIDE' && req.user.role !== 'ADMIN') {
      res.status(400).json({ error: 'Ce mémoire n\'est pas encore validé.' });
      return;
    }

    // Validate payment parameters
    if (paymentMethod === 'MTN_MOMO' || paymentMethod === 'MOOV_MONEY' || paymentMethod === 'CELTIS_CASH') {
      if (!phoneNumber || phoneNumber.trim().length < 8) {
        res.status(400).json({ error: 'Numéro de téléphone requis pour le paiement Mobile Money.' });
        return;
      }
    } else if (paymentMethod === 'VISA_CARD') {
      if (!cardNumber || cardNumber.trim().length < 12) {
        res.status(400).json({ error: 'Numéro de carte Visa valide requis.' });
        return;
      }
    } else {
      res.status(400).json({ error: 'Mode de paiement non pris en charge.' });
      return;
    }

    // Generate transaction reference
    const refPrefix = paymentMethod.split('_')[0];
    const transactionRef = `${refPrefix}-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const transaction: PaymentTransaction = {
      id: `tx-${Date.now()}`,
      userId: req.user.id,
      userName: req.user.fullName,
      userEmail: req.user.email,
      thesisId: thesis.id,
      thesisTitle: thesis.title,
      amountFcfa: thesis.priceFcfa || 5000,
      paymentMethod: paymentMethod as PaymentMethod,
      phoneNumber: phoneNumber ? phoneNumber.trim() : undefined,
      cardNumberMasked: cardNumber ? `**** **** **** ${cardNumber.slice(-4)}` : undefined,
      status: 'PAYE', // Successful payment confirmation
      transactionRef,
      createdAt: new Date().toISOString(),
    };

    dbTransactions.unshift(transaction);

    // Notify user of successful payment
    dbNotifications.unshift({
      id: `notif-${Date.now()}`,
      userId: req.user.id,
      title: 'Paiement Confirmé ! 💳',
      message: `Votre paiement de ${transaction.amountFcfa} FCFA pour "${thesis.title.substring(0, 45)}..." a été validé. Téléchargement débloqué.`,
      type: 'SUCCESS',
      read: false,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      message: 'Paiement effectué avec succès ! Accès au téléchargement débloqué.',
      transaction,
    });
  });

  // Verify Download Permission
  app.get('/api/payments/check-access/:thesisId', authenticateToken, (req: AuthRequest, res: Response) => {
    if (!req.user) {
      res.json({ hasAccess: false });
      return;
    }

    // Super Admin or Author always has access
    if (req.user.role === 'ADMIN') {
      res.json({ hasAccess: true, reason: 'ADMIN' });
      return;
    }

    const thesis = dbTheses.find((t) => t.id === req.params.thesisId);
    if (thesis && thesis.submittedByUserId === req.user.id) {
      res.json({ hasAccess: true, reason: 'AUTHOR' });
      return;
    }

    // Check payment history
    const paid = dbTransactions.find(
      (tx) => tx.userId === req.user?.id && tx.thesisId === req.params.thesisId && tx.status === 'PAYE'
    );

    if (paid) {
      res.json({ hasAccess: true, reason: 'PURCHASED', transactionRef: paid.transactionRef });
    } else {
      res.json({ hasAccess: false });
    }
  });

  // My Purchased Downloads History
  app.get('/api/payments/my-downloads', authenticateToken, (req: AuthRequest, res: Response) => {
    const paidTxs = dbTransactions.filter((tx) => tx.userId === req.user?.id && tx.status === 'PAYE');
    res.json(paidTxs);
  });

  // Download PDF file
  app.get('/api/theses/:id/download', authenticateToken, (req: AuthRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: 'Non authentifié' });
      return;
    }

    const thesis = dbTheses.find((t) => t.id === req.params.id);
    if (!thesis) {
      res.status(404).json({ error: 'Mémoire introuvable' });
      return;
    }

    // Access check: Admin OR Author OR Paid User
    const isOwner = thesis.submittedByUserId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';
    const isPaid = dbTransactions.some(
      (tx) => tx.userId === req.user?.id && tx.thesisId === thesis.id && tx.status === 'PAYE'
    );

    if (!isAdmin && !isOwner && !isPaid) {
      res.status(403).json({
        error: 'Paiement requis pour télécharger ce mémoire académique.',
      });
      return;
    }

    // Increment download count
    thesis.downloadCount += 1;
    dbDownloads.push({
      id: `dl-${Date.now()}`,
      userId: req.user.id,
      thesisId: thesis.id,
      downloadedAt: new Date().toISOString(),
    });

    // Generate dynamic readable PDF buffer
    const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 595 842] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 450 >>
stream
BT
/F1 18 Tf
50 780 Td
(REPUBLIQUE DU BENIN - MINISTERE DE L'ENSEIGNEMENT SUPERIEUR) Tj
/F1 14 Tf
0 -30 Td
(UNIVERSITE D'ETAT - PLATEFORME ELECTRONIQUE DES MEMOIRES) Tj
/F1 16 Tf
0 -50 Td
(MEMOIRE ACADEMIQUE : ${thesis.title.substring(0, 40)}...) Tj
/F1 12 Tf
0 -30 Td
(Auteur : ${thesis.author}) Tj
0 -20 Td
(Directeur : ${thesis.director}) Tj
0 -20 Td
(Filiere : ${thesis.filiere}) Tj
0 -20 Td
(Annee Academique : ${thesis.year}) Tj
0 -40 Td
(RESUME ACADEMIQUE :) Tj
0 -20 Td
(${thesis.abstract.substring(0, 100)}...) Tj
0 -40 Td
(Document officiel valide et certifie par l'Administration Academique.) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000318 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
820
%%EOF`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${thesis.fileName}"`);
    res.send(Buffer.from(pdfContent));
  });

  // Serve Dynamic Preview Sample PDF for Viewer Frame
  app.get('/api/sample-pdf/:id', (req: Request, res: Response) => {
    const thesis = dbTheses.find((t) => t.id === req.params.id || t.fileName.includes(req.params.id)) || dbTheses[0];

    const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 595 842] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 500 >>
stream
BT
/F1 18 Tf
40 780 Td
(MEMOIRE ACADEMIQUE - DOCUMENT APERCU) Tj
/F1 14 Tf
0 -30 Td
(${thesis.title.substring(0, 45)}) Tj
/F1 12 Tf
0 -25 Td
(Auteur: ${thesis.author} | Annee: ${thesis.year}) Tj
0 -20 Td
(Filiere: ${thesis.filiere}) Tj
0 -30 Td
(Directeur de Memoire: ${thesis.director}) Tj
0 -40 Td
(RESUME ACADEMIQUE :) Tj
0 -20 Td
(${thesis.abstract.substring(0, 120)}...) Tj
0 -40 Td
(MOTS-CLES: ${thesis.keywords.join(', ')}) Tj
0 -40 Td
(Apercu fourni par la Plateforme de Gestion Electronique des Memoires) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000318 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
860
%%EOF`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Apercu_${thesis.fileName}"`);
    res.send(Buffer.from(pdfContent));
  });

  // Serve static uploads
  app.use('/uploads', express.static(uploadDir));

  // -------------------------------------------------------------
  // ADMIN & SYSTEM METRICS API
  // -------------------------------------------------------------

  // Real-time Global Stats
  app.get('/api/admin/stats', authenticateToken, requireAdmin, (_req: Request, res: Response) => {
    const totalValidated = dbTheses.filter((t) => t.status === 'VALIDE').length;
    const totalRejected = dbTheses.filter((t) => t.status === 'REJETE').length;
    const totalPending = dbTheses.filter((t) => t.status === 'EN_ATTENTE').length;
    const totalUsers = dbUsers.length;
    
    const totalDownloads = dbTheses.reduce((sum, t) => sum + t.downloadCount, 0) + dbDownloads.length;
    const totalRevenueFcfa = dbTransactions
      .filter((tx) => tx.status === 'PAYE')
      .reduce((sum, tx) => sum + tx.amountFcfa, 0);

    const stats: AdminStats = {
      totalValidated,
      totalRejected,
      totalPending,
      totalUsers,
      totalDownloads,
      totalRevenueFcfa,
    };

    res.json(stats);
  });

  // Get All Users (Admin only)
  app.get('/api/admin/users', authenticateToken, requireAdmin, (_req: Request, res: Response) => {
    res.json(dbUsers);
  });

  // Get Transactions Log (Admin only)
  app.get('/api/admin/transactions', authenticateToken, requireAdmin, (_req: Request, res: Response) => {
    res.json(dbTransactions);
  });

  // -------------------------------------------------------------
  // NOTIFICATIONS API
  // -------------------------------------------------------------
  app.get('/api/notifications', authenticateToken, (req: AuthRequest, res: Response) => {
    if (!req.user) {
      res.json([]);
      return;
    }

    const userNotifs = dbNotifications.filter(
      (n) => n.userId === 'ALL' || n.userId === req.user?.id
    );
    res.json(userNotifs);
  });

  app.put('/api/notifications/mark-read', authenticateToken, (req: AuthRequest, res: Response) => {
    dbNotifications.forEach((n) => {
      if (n.userId === 'ALL' || n.userId === req.user?.id) {
        n.read = true;
      }
    });
    res.json({ message: 'Toutes les notifications ont été marquées comme lues.' });
  });

  // -------------------------------------------------------------
  // VITE DEVELOPMENT MIDDLEWARE / PRODUCTION FALLBACK
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server executing at http://0.0.0.0:${PORT}`);
  });
}

startServer();
