-- ====================================================================
-- SCHEMA DE BASE DE DONNEES CLOUDFLARE D1 (COMPATIBLE POSTGRESQL/SQLITE)
-- Plateforme de Gestion Électronique des Mémoires Académiques
-- ====================================================================

-- 1. TABLE UTILISATEURS (USERS)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    role TEXT NOT NULL CHECK (role IN ('DEPOSANT', 'ENCADREUR', 'ADMIN', 'VISITEUR')),
    filiere TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLE MEMOIRES (THESES)
CREATE TABLE IF NOT EXISTS theses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    author_email TEXT,
    filiere TEXT NOT NULL,
    specialty TEXT,
    director TEXT NOT NULL,
    year INTEGER NOT NULL,
    abstract TEXT NOT NULL,
    keywords TEXT NOT NULL, -- JSON String Array ["IA", "Machine Learning"]
    pdf_url TEXT NOT NULL,
    r2_key TEXT, -- Clé unique d'objet dans Cloudflare R2
    page_count INTEGER DEFAULT 0,
    file_size_mb REAL DEFAULT 0.0,
    download_price REAL DEFAULT 2000.0,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VALIDATED', 'REJECTED')),
    rejection_reason TEXT,
    depositor_id TEXT NOT NULL REFERENCES users(id),
    supervisor_id TEXT REFERENCES users(id),
    similarity_score REAL DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    validated_at TIMESTAMP
);

-- 3. TABLE PROJETS ET SUJETS ETUDIANTS (STUDENT_PROJECTS)
CREATE TABLE IF NOT EXISTS student_projects (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES users(id),
    student_name TEXT NOT NULL,
    filiere TEXT NOT NULL,
    proposed_title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'APPROVED', 'REJECTED', 'NEEDS_REVISION')),
    comments TEXT,
    supervisor_id TEXT REFERENCES users(id),
    similarity_risk TEXT DEFAULT 'LOW',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABLE TRANSACTIONS & PAIEMENTS (TRANSACTIONS)
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    thesis_id TEXT NOT NULL REFERENCES theses(id),
    thesis_title TEXT NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id),
    user_email TEXT NOT NULL,
    amount REAL NOT NULL,
    payment_method TEXT NOT NULL,
    phone_number TEXT,
    status TEXT NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),
    transaction_ref TEXT UNIQUE NOT NULL,
    download_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABLE NOTIFICATIONS (NOTIFICATIONS)
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read INTEGER DEFAULT 0, -- 0 = Unread, 1 = Read
    type TEXT DEFAULT 'INFO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABLE CERTIFICATS DE HOMOLOGATION (CERTIFICATES)
CREATE TABLE IF NOT EXISTS certificates (
    id TEXT PRIMARY KEY,
    thesis_id TEXT UNIQUE NOT NULL REFERENCES theses(id),
    certificate_number TEXT UNIQUE NOT NULL,
    author_name TEXT NOT NULL,
    thesis_title TEXT NOT NULL,
    filiere TEXT NOT NULL,
    supervisor_name TEXT NOT NULL,
    qr_code_url TEXT NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABLE LOGS D'AUDIT & SECURITE (AUDIT_LOGS)
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. TABLE TELECHARGEMENTS (DOWNLOADS)
CREATE TABLE IF NOT EXISTS downloads (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    thesis_id TEXT NOT NULL REFERENCES theses(id),
    downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES POUR ACCELERER LES RECHERCHES ET FILTRES D1
CREATE INDEX IF NOT EXISTS idx_theses_filiere ON theses(filiere);
CREATE INDEX IF NOT EXISTS idx_theses_status ON theses(status);
CREATE INDEX IF NOT EXISTS idx_theses_depositor ON theses(depositor_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- INSERTS DE SEED INITIAL (COMPTE SUPER-ADMINISTRATEUR PRÉCONFIGURÉ)
INSERT OR IGNORE INTO users (id, full_name, email, role, filiere, status)
VALUES (
    'admin-super-001',
    'Administrateur Général',
    'goodluckelishaagboguin@gmail.com',
    'ADMIN',
    'ALL',
    'ACTIVE'
);
