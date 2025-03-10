-- Backup der bestehenden Jobs-Tabelle erstellen (falls nötig)
-- CREATE TABLE IF NOT EXISTS jobs_backup AS SELECT * FROM jobs;

-- Erweiterte Jobs-Tabelle
CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    -- Basisdaten der Stelle
    title TEXT NOT NULL,
    description TEXT NOT NULL, -- Einfache Beschreibung
    rich_description TEXT,     -- HTML/Rich-Text formatierte Beschreibung
    company TEXT NOT NULL,
    location TEXT NOT NULL,
    salary_range TEXT,
    job_type TEXT NOT NULL,
    requirements TEXT,
    
    -- Erweiterte Daten für besseres Job-Management
    customer_id TEXT,                    -- Verknüpfung mit Kunden/Interessenten
    external_job_id TEXT,                -- Anpassbare externe Job-ID
    contact_person_id TEXT,              -- Ansprechpartner beim Kunden
    department TEXT,                     -- Abteilung
    company_description TEXT,            -- Beschreibung des Unternehmens
    benefits TEXT,                       -- Vorteile/Benefits für Bewerber
    requirements_profile TEXT,           -- Detailliertes Anforderungsprofil
    keywords TEXT,                       -- Für SEO und Matching
    internal_notes TEXT,                 -- Interne Notizen
    
    -- Veröffentlichungsmanagement
    publication_start_date DATE,         -- Startdatum der Veröffentlichung
    publication_end_date DATE,           -- Enddatum der Veröffentlichung
    republish_cycle INTEGER DEFAULT 30,  -- Zyklus in Tagen
    
    -- Workflow und Verantwortlichkeiten
    assigned_to TEXT,                    -- Verantwortlicher Mitarbeiter
    status TEXT NOT NULL DEFAULT 'draft', -- Status: draft, active, inactive, archived
    
    -- Zeitstempel
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Beziehungen
    FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE SET NULL,
    FOREIGN KEY (contact_person_id) REFERENCES contacts (id) ON DELETE SET NULL
);

-- Tabelle für Textbausteine (Templates)
CREATE TABLE IF NOT EXISTS job_templates (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
    name TEXT NOT NULL,
    category TEXT NOT NULL,  -- z.B. 'intro', 'benefits', 'requirements', etc.
    content TEXT NOT NULL,   -- Rich-Text-formatierter Inhalt
    created_by TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabelle für Veröffentlichungen (Multiposting)
CREATE TABLE IF NOT EXISTS job_postings (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
    job_id INTEGER NOT NULL,
    platform TEXT NOT NULL,           -- z.B. 'indeed', 'stepstone', 'arbeitsagentur', etc.
    platform_job_id TEXT,             -- ID auf der externen Plattform
    posting_url TEXT,                 -- URL zur veröffentlichten Stelle
    status TEXT CHECK(status IN ('draft', 'pending', 'published', 'expired', 'rejected', 'error')) NOT NULL DEFAULT 'draft',
    publication_date TIMESTAMP,
    expiry_date TIMESTAMP,
    auto_republish BOOLEAN DEFAULT FALSE,
    analytics TEXT,                  -- JSON-Daten für Statistiken (Aufrufe, Bewerbungen, etc.)
    error_message TEXT,              -- Fehlermeldungen bei failed postings
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE CASCADE
);

-- Tabelle für Social-Media-Posts
CREATE TABLE IF NOT EXISTS job_social_posts (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
    job_id INTEGER NOT NULL,
    platform TEXT NOT NULL,          -- z.B. 'linkedin', 'xing', 'facebook', etc.
    content TEXT NOT NULL,
    media_url TEXT,                  -- URL zum Bild/Video
    posting_date TIMESTAMP,
    status TEXT CHECK(status IN ('draft', 'scheduled', 'published', 'failed', 'cancelled')) NOT NULL DEFAULT 'draft',
    post_url TEXT,                   -- URL zum fertigen Post
    analytics TEXT,                  -- JSON-Daten für Performance-Metriken
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE CASCADE
);

-- Tabelle für Bearbeitungshistorie
CREATE TABLE IF NOT EXISTS job_edit_history (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
    job_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,             -- z.B. 'create', 'update', 'publish', etc.
    details TEXT,                     -- JSON mit Änderungsdetails
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE CASCADE
);

-- Tabelle für Bearbeitungssperren
CREATE TABLE IF NOT EXISTS job_edit_locks (
    job_id INTEGER PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,          -- Name des sperrenden Benutzers
    locked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,             -- Automatisches Verfallsdatum
    FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE CASCADE
);

-- Tabelle für Job-Bewerbungen
CREATE TABLE IF NOT EXISTS job_applications (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
    job_id INTEGER NOT NULL,
    candidate_id TEXT,                -- Null, wenn noch kein Kandidat angelegt wurde
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    source TEXT NOT NULL,             -- Woher kam die Bewerbung: 'website', 'email', 'indeed', etc.
    cv_url TEXT,                      -- URL/Pfad zum Lebenslauf
    cover_letter_url TEXT,            -- URL/Pfad zum Anschreiben
    additional_documents TEXT,        -- JSON-Array mit weiteren Dokumenten
    status TEXT CHECK(status IN ('new', 'review', 'interview', 'offer', 'hired', 'rejected', 'withdrawn')) NOT NULL DEFAULT 'new',
    matching_score INTEGER,           -- Matching-Score (0-100)
    notes TEXT,
    rejection_reason TEXT,
    rejection_email_sent BOOLEAN DEFAULT FALSE,
    rejection_email_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES candidates (id) ON DELETE SET NULL
);

-- A/B Testing für Stellenanzeigen
CREATE TABLE IF NOT EXISTS job_ab_tests (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
    job_id INTEGER NOT NULL,
    name TEXT NOT NULL,                -- Name des Tests
    status TEXT CHECK(status IN ('active', 'completed', 'cancelled')) NOT NULL DEFAULT 'active',
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS job_ab_test_variants (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
    test_id TEXT NOT NULL,
    variant_name TEXT NOT NULL,         -- z.B. 'A', 'B', etc.
    title TEXT,                         -- Alternative Titel
    description TEXT,                   -- Alternative Beschreibung
    benefits TEXT,                      -- Alternative Benefits
    impressions INTEGER DEFAULT 0,      -- Anzahl der Impressionen
    clicks INTEGER DEFAULT 0,           -- Anzahl der Klicks
    applications INTEGER DEFAULT 0,     -- Anzahl der Bewerbungen
    is_control BOOLEAN DEFAULT FALSE,   -- Ist dies die Kontrollvariante?
    FOREIGN KEY (test_id) REFERENCES job_ab_tests (id) ON DELETE CASCADE
);

-- Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs (status);
CREATE INDEX IF NOT EXISTS idx_jobs_customer_id ON jobs (customer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_assigned_to ON jobs (assigned_to);
CREATE INDEX IF NOT EXISTS idx_job_postings_job_id ON job_postings (job_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_platform ON job_postings (platform);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings (status);
CREATE INDEX IF NOT EXISTS idx_job_social_posts_job_id ON job_social_posts (job_id);
CREATE INDEX IF NOT EXISTS idx_job_edit_history_job_id ON job_edit_history (job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications (job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications (status);
CREATE INDEX IF NOT EXISTS idx_job_applications_candidate_id ON job_applications (candidate_id);
CREATE INDEX IF NOT EXISTS idx_job_templates_category ON job_templates (category);
