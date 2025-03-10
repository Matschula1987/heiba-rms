-- Movido-Automation-Datenbank-Schema

-- Tabelle für Zugangsdaten und Konfiguration
CREATE TABLE IF NOT EXISTS movido_configurations (
    id TEXT PRIMARY KEY,
    api_key TEXT NOT NULL,
    api_secret TEXT NOT NULL,
    company_id TEXT NOT NULL,
    default_premium INTEGER DEFAULT 0,
    default_target_portals TEXT,  -- JSON-Array als String
    auto_login_enabled INTEGER DEFAULT 1,
    session_timeout_minutes INTEGER DEFAULT 120,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabelle für gespeicherte Sitzungen
CREATE TABLE IF NOT EXISTS movido_sessions (
    id TEXT PRIMARY KEY,
    session_token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    last_used_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabelle für die Posting-Warteschlange
CREATE TABLE IF NOT EXISTS movido_job_queue (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL,
    status TEXT NOT NULL, -- 'pending', 'processing', 'completed', 'failed', 'scheduled'
    target_portals TEXT,  -- JSON-Array als String
    scheduled_for TIMESTAMP,
    priority INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMP,
    error_message TEXT,
    result_data TEXT, -- JSON als String für Ergebnisdaten
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- Tabelle für hochgeladene Medien
CREATE TABLE IF NOT EXISTS movido_media (
    id TEXT PRIMARY KEY,
    original_path TEXT NOT NULL,
    movido_media_id TEXT,
    media_type TEXT NOT NULL, -- 'logo', 'image', 'document', etc.
    file_name TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    upload_status TEXT NOT NULL, -- 'pending', 'uploaded', 'failed'
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabelle für Job-Media-Verknüpfungen
CREATE TABLE IF NOT EXISTS movido_job_media (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL,
    media_id TEXT NOT NULL,
    media_role TEXT NOT NULL, -- 'main_image', 'logo', 'additional_image', etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (media_id) REFERENCES movido_media(id) ON DELETE CASCADE
);

-- Tabelle für Zeitplaneinstellungen
CREATE TABLE IF NOT EXISTS movido_schedule_settings (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    schedule_type TEXT NOT NULL, -- 'one_time', 'daily', 'weekly', 'monthly'
    schedule_data TEXT NOT NULL, -- JSON für spezifische Scheduling-Daten
    enabled INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabelle für Veröffentlichungsstatistiken
CREATE TABLE IF NOT EXISTS movido_posting_stats (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL,
    platform TEXT NOT NULL,
    views INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    applications INTEGER DEFAULT 0,
    last_updated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- Tabelle für automatisierte Job-Veröffentlichungszyklen
CREATE TABLE IF NOT EXISTS movido_posting_cycles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    cycle_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'custom'
    interval_days INTEGER,
    platforms TEXT NOT NULL, -- JSON-Array der Zielplattformen
    auto_refresh BOOLEAN DEFAULT 0,
    refresh_interval_days INTEGER,
    enabled INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabelle für zugewiesene Posting-Zyklen zu Jobs
CREATE TABLE IF NOT EXISTS movido_job_posting_cycles (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL,
    cycle_id TEXT NOT NULL,
    next_posting_date TIMESTAMP,
    last_posted_at TIMESTAMP,
    status TEXT NOT NULL, -- 'active', 'completed', 'paused', 'cancelled'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (cycle_id) REFERENCES movido_posting_cycles(id) ON DELETE CASCADE
);

-- Indexe für Performance
CREATE INDEX IF NOT EXISTS idx_movido_job_queue_status ON movido_job_queue(status);
CREATE INDEX IF NOT EXISTS idx_movido_job_queue_scheduled ON movido_job_queue(scheduled_for) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_movido_job_posting_cycles_next ON movido_job_posting_cycles(next_posting_date) WHERE status = 'active';
