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
