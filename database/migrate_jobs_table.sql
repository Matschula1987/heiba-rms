-- Migration der Jobs-Tabelle

-- 1. Sicherung der bestehenden Jobs-Tabelle
CREATE TABLE IF NOT EXISTS jobs_backup AS SELECT * FROM jobs;

-- 2. Überprüfen, ob die Spaltenerweiterungen bereits existieren
PRAGMA table_info(jobs);

-- 3. Neue Spalten zur Jobs-Tabelle hinzufügen
-- Anmerkung: SQLite erlaubt kein ALTER TABLE mit mehreren Spalten in einem Statement,
-- daher müssen wir jeden ALTER TABLE einzeln ausführen

-- Erweiterte Beschreibung in Rich-Text
ALTER TABLE jobs ADD COLUMN rich_description TEXT;

-- Kundenverwaltung
ALTER TABLE jobs ADD COLUMN customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL;
ALTER TABLE jobs ADD COLUMN external_job_id TEXT;
ALTER TABLE jobs ADD COLUMN contact_person_id TEXT REFERENCES contacts(id) ON DELETE SET NULL;

-- Erweiterte Inhaltsbereiche
ALTER TABLE jobs ADD COLUMN company_description TEXT;
ALTER TABLE jobs ADD COLUMN benefits TEXT;
ALTER TABLE jobs ADD COLUMN requirements_profile TEXT;
ALTER TABLE jobs ADD COLUMN keywords TEXT;
ALTER TABLE jobs ADD COLUMN internal_notes TEXT;

-- Veröffentlichungsmanagement
ALTER TABLE jobs ADD COLUMN publication_start_date DATE;
ALTER TABLE jobs ADD COLUMN publication_end_date DATE;
ALTER TABLE jobs ADD COLUMN republish_cycle INTEGER DEFAULT 30;

-- Workflow und Verantwortlichkeiten
ALTER TABLE jobs ADD COLUMN assigned_to TEXT;

-- 4. Neue Tabellen erstellen (falls sie noch nicht existieren)

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
    auto_republish BOOLEAN DEFAULT 0,
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
    rejection_email_sent BOOLEAN DEFAULT 0,
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
    is_control BOOLEAN DEFAULT 0,       -- Ist dies die Kontrollvariante?
    FOREIGN KEY (test_id) REFERENCES job_ab_tests (id) ON DELETE CASCADE
);

-- 5. Indizes erstellen für bessere Performance
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

-- 6. Einige Beispiel-Textbausteine hinzufügen
INSERT INTO job_templates (name, category, content, created_by) VALUES 
('Standard Unternehmensvorstellung', 'company_description', '<p>Als führendes Unternehmen in unserer Branche bieten wir ein dynamisches Arbeitsumfeld mit flachen Hierarchien und kurzen Entscheidungswegen. Bei uns erwartet Sie ein engagiertes Team, das gemeinsam an innovativen Lösungen arbeitet.</p>', 'System');

INSERT INTO job_templates (name, category, content, created_by) VALUES 
('Standard Benefits', 'benefits', '<ul><li>Attraktives Gehalt</li><li>Flexible Arbeitszeiten</li><li>30 Tage Urlaub</li><li>Betriebliche Altersvorsorge</li><li>Regelmäßige Weiterbildungen</li><li>Moderner Arbeitsplatz</li></ul>', 'System');

INSERT INTO job_templates (name, category, content, created_by) VALUES 
('IT-Qualifikationen', 'requirements', '<ul><li>Abgeschlossenes Studium der Informatik oder vergleichbare Ausbildung</li><li>Mehrjährige Berufserfahrung in der Softwareentwicklung</li><li>Sehr gute Kenntnisse in [Technologie]</li><li>Teamfähigkeit und eigenverantwortliches Arbeiten</li><li>Gute Deutsch- und Englischkenntnisse</li></ul>', 'System');

INSERT INTO job_templates (name, category, content, created_by) VALUES 
('Kaufmännische Qualifikationen', 'requirements', '<ul><li>Abgeschlossene kaufmännische Ausbildung</li><li>Mehrjährige Berufserfahrung im kaufmännischen Bereich</li><li>Sicherer Umgang mit MS Office</li><li>Strukturierte und sorgfältige Arbeitsweise</li><li>Teamfähigkeit und Kommunikationsstärke</li></ul>', 'System');

INSERT INTO job_templates (name, category, content, created_by) VALUES 
('Standard Abschlusstext', 'closing', '<p>Haben wir Ihr Interesse geweckt? Dann freuen wir uns auf Ihre aussagekräftige Bewerbung mit Angabe Ihres frühestmöglichen Eintrittstermins und Ihrer Gehaltsvorstellung.</p>', 'System');
