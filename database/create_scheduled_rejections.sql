-- Tabelle für geplante Absagen für Bewerbungen
CREATE TABLE scheduled_rejections (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL,
  scheduled_date TEXT NOT NULL,
  template_id TEXT,
  email_config_id TEXT,
  processed INTEGER DEFAULT 0,
  processed_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (application_id) REFERENCES applications_extended(id) ON DELETE CASCADE
);

-- Index für schnelles Abrufen von fälligen Absagen
CREATE INDEX IF NOT EXISTS idx_scheduled_rejections_date ON scheduled_rejections(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_scheduled_rejections_processed ON scheduled_rejections(processed);

-- Zusätzliche Spalte für die incoming_emails Tabelle
ALTER TABLE incoming_emails ADD COLUMN IF NOT EXISTS processed_for_application INTEGER DEFAULT 0;
ALTER TABLE incoming_emails ADD COLUMN IF NOT EXISTS processing_error TEXT;

-- Tabelle für E-Mail-Vorlagen
CREATE TABLE IF NOT EXISTS email_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  body_plain TEXT,
  category TEXT,
  variables TEXT,
  active INTEGER DEFAULT 1,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT
);
