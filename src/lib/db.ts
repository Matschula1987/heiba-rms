﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿'use server';

import bcrypt from 'bcryptjs';

let dbInstance: any = null;

/**
 * Asynchrone Funktion, die eine Datenbankverbindung zurückgibt.
 * Diese Funktion ist serverseitig und sollte nicht im Browser verwendet werden.
 */
export async function getDb() {
  if (typeof window !== 'undefined') {
    console.error('Datenbankzugriff kann nur auf dem Server erfolgen!');
    throw new Error('Datenbankzugriff kann nur auf dem Server erfolgen!');
  }
  
  if (!dbInstance) {
    // Dynamische Imports für SQLite, um Browser-Probleme zu vermeiden
    const { open } = await import('sqlite');
    const sqlite3 = await import('sqlite3');
    
    // Bestimme den Datenbankpfad basierend auf der Umgebung
    // In Render.com verwenden wir das persistente Verzeichnis /data
    const dbPath = process.env.NODE_ENV === 'production' 
      ? '/data/heiba.db'  // Pfad im persistenten Speicher auf Render
      : './heiba.db';     // Lokaler Pfad für Entwicklung
    
    console.log(`Verwende Datenbankpfad: ${dbPath}`);
    
    dbInstance = await open({
      filename: dbPath,
      driver: sqlite3.default.Database
    });
  }
  return dbInstance;
}

export async function initDb(): Promise<void> {
  const db = await getDb();
  
  // Benutzer-Tabelle
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      role TEXT NOT NULL,
      company_id INTEGER,
      data_deletion_requested BOOLEAN DEFAULT 0,
      last_login TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Unternehmen-Tabelle
  await db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT,
      phone TEXT,
      website TEXT,
      data_processing_agreement BOOLEAN DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Lizenzen-Tabelle
  await db.exec(`
    CREATE TABLE IF NOT EXISTS licenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      license_type TEXT NOT NULL,
      license_key TEXT UNIQUE NOT NULL,
      valid_from TIMESTAMP NOT NULL,
      valid_until TIMESTAMP NOT NULL,
      max_users INTEGER NOT NULL,
      max_jobs INTEGER NOT NULL,
      max_candidates INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id)
    )
  `);
  
  // Kandidaten-Tabelle
  await db.exec(`
    CREATE TABLE IF NOT EXISTS candidates (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      position TEXT,
      status TEXT CHECK(status IN ('new', 'in_process', 'hired', 'rejected', 'inactive', 'active')) DEFAULT 'new',
      location TEXT,
      phone TEXT,
      experience TEXT, -- JSON String
      documents TEXT, -- JSON String
      qualifications TEXT, -- JSON String
      qualification_profile TEXT, -- JSON String
      company_id INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id)
    )
  `);
  
  // Jobs-Tabellen
  await db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
      company TEXT,
      title TEXT NOT NULL,
      description TEXT,
      location TEXT,
      salary_range TEXT,
      job_type TEXT,
      requirements TEXT,
      department TEXT,
      status TEXT CHECK(status IN ('active', 'inactive', 'draft', 'archived')) DEFAULT 'draft',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS job_skills (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
      job_id TEXT NOT NULL,
      skill_name TEXT NOT NULL,
      required_level INTEGER CHECK(required_level BETWEEN 1 AND 5),
      is_required BOOLEAN DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    )
  `);
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS job_applications (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
      job_id TEXT NOT NULL,
      candidate_id TEXT NOT NULL,
      status TEXT CHECK(status IN ('new', 'in_review', 'interview', 'offer', 'rejected', 'accepted')) DEFAULT 'new',
      application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      documents TEXT, -- JSON für CV, Anschreiben etc.
      notes TEXT, -- JSON für Notizen
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
      FOREIGN KEY (candidate_id) REFERENCES candidates(id)
    )
  `);
  
  // Kunden-Tabellen
  await db.exec(`
    -- Kunden-Tabelle
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
      name TEXT NOT NULL,
      type TEXT CHECK(type IN ('customer', 'prospect')) NOT NULL,
      status TEXT CHECK(status IN ('active', 'inactive', 'prospect', 'former')) NOT NULL DEFAULT 'active',
      industry TEXT,
      website TEXT,
      address TEXT, -- JSON-Feld für Adressdaten
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Kontakte-Tabelle (Ansprechpartner bei Kunden)
    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
      customer_id TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      position TEXT,
      department TEXT,
      email TEXT NOT NULL,
      phone TEXT,
      mobile TEXT,
      is_main_contact BOOLEAN DEFAULT 0,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE
    );

    -- Kontakthistorie-Tabelle
    CREATE TABLE IF NOT EXISTS contact_history (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
      customer_id TEXT NOT NULL,
      contact_id TEXT,
      type TEXT CHECK(type IN ('phone', 'email', 'meeting', 'other')) NOT NULL,
      date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      subject TEXT,
      content TEXT NOT NULL,
      created_by TEXT NOT NULL,
      follow_up_date TIMESTAMP,
      follow_up_completed BOOLEAN DEFAULT 0,
      FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE,
      FOREIGN KEY (contact_id) REFERENCES contacts (id) ON DELETE SET NULL
    );

    -- Anforderungen-Tabelle
    CREATE TABLE IF NOT EXISTS requirements (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
      customer_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      department TEXT,
      location TEXT,
      skills TEXT, -- JSON-Array mit Skills
      experience INTEGER, -- Erfahrung in Jahren
      education TEXT,
      status TEXT CHECK(status IN ('open', 'in_progress', 'filled', 'cancelled')) NOT NULL DEFAULT 'open',
      priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'urgent')) NOT NULL DEFAULT 'medium',
      start_date DATE,
      end_date DATE,
      is_remote BOOLEAN DEFAULT 0,
      assigned_to TEXT, -- Mitarbeiter-ID
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE
    );

    -- Tabelle für Gehaltsangaben zu Anforderungen
    CREATE TABLE IF NOT EXISTS requirement_salary (
      requirement_id TEXT PRIMARY KEY,
      min_salary INTEGER,
      max_salary INTEGER,
      currency TEXT DEFAULT 'EUR',
      FOREIGN KEY (requirement_id) REFERENCES requirements (id) ON DELETE CASCADE
    );

    -- Tabelle für Matches zwischen Anforderungen und Kandidaten
    CREATE TABLE IF NOT EXISTS requirement_candidate_matches (
      requirement_id TEXT NOT NULL,
      candidate_id TEXT NOT NULL,
      score INTEGER DEFAULT 0,
      status TEXT CHECK(status IN ('new', 'contacted', 'rejected', 'accepted')) DEFAULT 'new',
      last_contact TIMESTAMP,
      PRIMARY KEY (requirement_id, candidate_id),
      FOREIGN KEY (requirement_id) REFERENCES requirements (id) ON DELETE CASCADE,
      FOREIGN KEY (candidate_id) REFERENCES candidates (id) ON DELETE CASCADE
    );

    -- Indizes für Kunden-Tabellen
    CREATE INDEX IF NOT EXISTS idx_customers_type ON customers (type);
    CREATE INDEX IF NOT EXISTS idx_customers_status ON customers (status);
    CREATE INDEX IF NOT EXISTS idx_contacts_customer_id ON contacts (customer_id);
    CREATE INDEX IF NOT EXISTS idx_contacts_main ON contacts (customer_id, is_main_contact);
    CREATE INDEX IF NOT EXISTS idx_contact_history_customer_id ON contact_history (customer_id);
    CREATE INDEX IF NOT EXISTS idx_contact_history_date ON contact_history (date);
    CREATE INDEX IF NOT EXISTS idx_requirements_customer_id ON requirements (customer_id);
    CREATE INDEX IF NOT EXISTS idx_requirements_status ON requirements (status);
    CREATE INDEX IF NOT EXISTS idx_requirements_priority ON requirements (priority);
  `);
  
  // DSGVO-Tabellen
  await db.exec(`
    CREATE TABLE IF NOT EXISTS user_consents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      essential_cookies BOOLEAN NOT NULL DEFAULT 1,
      functional_cookies BOOLEAN NOT NULL DEFAULT 0,
      analytical_cookies BOOLEAN NOT NULL DEFAULT 0,
      marketing_cookies BOOLEAN NOT NULL DEFAULT 0,
      consent_date TIMESTAMP NOT NULL,
      ip_address TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS data_access_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      accessed_data_type TEXT NOT NULL,
      accessed_data_id INTEGER,
      access_type TEXT NOT NULL,
      access_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  
  // Indizes für bessere Performance
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company);
    CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
    CREATE INDEX IF NOT EXISTS idx_job_skills ON job_skills(job_id);
    CREATE INDEX IF NOT EXISTS idx_applications_job ON job_applications(job_id);
    CREATE INDEX IF NOT EXISTS idx_applications_candidate ON job_applications(candidate_id);
    CREATE INDEX IF NOT EXISTS idx_candidates_company ON candidates(company_id);
    CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
  `);
  
  // Erweiterte Bewerbungstabellen
  await db.exec(`
    -- Erweiterte Bewerbungen-Tabelle
    CREATE TABLE IF NOT EXISTS applications_extended (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
      job_id TEXT NOT NULL, 
      candidate_id TEXT,  -- Kann NULL sein für Bewerbungen ohne existierenden Kandidaten
      
      -- Bewerberdaten (falls kein existierender Kandidat)
      applicant_name TEXT NOT NULL,
      applicant_email TEXT NOT NULL,
      applicant_phone TEXT,
      applicant_location TEXT,
      
      -- Bewerbungsstatus
      status TEXT NOT NULL DEFAULT 'new',  -- new, in_review, interview, rejected, accepted, archived
      status_reason TEXT,  -- Begründung für Statusänderung (z.B. Ablehnungsgrund)
      status_changed_at TIMESTAMP,
      status_changed_by TEXT,  -- User ID, der Status geändert hat
      
      -- Bewerbungsdetails
      source TEXT NOT NULL,  -- email, portal, website, direct, referral, etc.
      source_detail TEXT,  -- Portal-Name, E-Mail-Adresse, Referrer-Name etc.
      cover_letter TEXT,  -- Anschreiben
      has_cv BOOLEAN DEFAULT FALSE,  -- Hat Lebenslauf
      cv_file_path TEXT,  -- Pfad zur Lebenslauf-Datei
      has_documents BOOLEAN DEFAULT FALSE,  -- Hat Zusatzdokumente
      documents_paths TEXT,  -- JSON-Array mit Pfaden zu Dokumenten
      
      -- Matching-Informationen
      match_score REAL,  -- Matching-Score (0-100)
      match_data TEXT,  -- JSON mit detaillierten Matching-Daten
      
      -- Kommunikation
      communication_history TEXT,  -- JSON-Array mit Kommunikationshistorie
      last_contact_at TIMESTAMP,  -- Letzte Kontaktaufnahme
      
      -- Workflow und Tracking
      next_step TEXT,  -- interview_scheduling, feedback_required, etc.
      next_step_due_date TIMESTAMP,  -- Fälligkeitsdatum für nächsten Schritt
      assigned_to TEXT,  -- User ID, dem die Bewerbung zugewiesen ist
      
      -- Zeitstempel
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      
      -- Fremdschlüssel
      FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE CASCADE,
      FOREIGN KEY (candidate_id) REFERENCES candidates (id) ON DELETE SET NULL
    );

    -- Indizes für Performance-optimierung
    CREATE INDEX IF NOT EXISTS idx_applications_extended_job ON applications_extended(job_id);
    CREATE INDEX IF NOT EXISTS idx_applications_extended_candidate ON applications_extended(candidate_id);
    CREATE INDEX IF NOT EXISTS idx_applications_extended_status ON applications_extended(status);
    CREATE INDEX IF NOT EXISTS idx_applications_extended_match_score ON applications_extended(match_score);
    CREATE INDEX IF NOT EXISTS idx_applications_extended_assigned_to ON applications_extended(assigned_to);
    CREATE INDEX IF NOT EXISTS idx_applications_extended_next_step_due ON applications_extended(next_step_due_date);
    CREATE INDEX IF NOT EXISTS idx_applications_extended_source ON applications_extended(source);

    -- Bewerbungsnotizen-Tabelle
    CREATE TABLE IF NOT EXISTS application_notes (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
      application_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (application_id) REFERENCES applications_extended (id) ON DELETE CASCADE
    );

    -- Index für Bewerbungsnotizen
    CREATE INDEX IF NOT EXISTS idx_application_notes_application ON application_notes(application_id);

    -- Bewerbungs-Tags-Tabelle (für Kategorisierung und Filterung)
    CREATE TABLE IF NOT EXISTS application_tags (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
      application_id TEXT NOT NULL,
      tag TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_by TEXT,
      FOREIGN KEY (application_id) REFERENCES applications_extended (id) ON DELETE CASCADE,
      UNIQUE(application_id, tag)
    );

    -- Index für Bewerbungs-Tags
    CREATE INDEX IF NOT EXISTS idx_application_tags_application ON application_tags(application_id);
    CREATE INDEX IF NOT EXISTS idx_application_tags_tag ON application_tags(tag);

    -- Bewerbungsanhänge-Tabelle 
    CREATE TABLE IF NOT EXISTS application_attachments (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
      application_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_type TEXT NOT NULL, -- resume, cover_letter, certificate, etc.
      file_size INTEGER,
      upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (application_id) REFERENCES applications_extended (id) ON DELETE CASCADE
    );

    -- Index für Bewerbungsanhänge
    CREATE INDEX IF NOT EXISTS idx_application_attachments_application ON application_attachments(application_id);
  `);

  // Admin-Benutzer erstellen, falls noch keiner existiert
  const adminExists = await db.get('SELECT * FROM users WHERE role = ?', ['admin']);
  
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.run(`
      INSERT INTO users (email, password_hash, first_name, last_name, role) 
      VALUES (?, ?, ?, ?, ?)
    `, ['admin@heiba.de', hashedPassword, 'Admin', 'User', 'admin']);
}
}
