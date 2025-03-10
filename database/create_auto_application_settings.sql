-- Tabelle für Einstellungen der automatischen Bewerbungsverarbeitung
CREATE TABLE IF NOT EXISTS auto_application_settings (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Matching-Einstellungen
  min_match_score_auto_conversion INTEGER NOT NULL DEFAULT 85, -- Min. Score für Auto-Konvertierung (%)
  max_match_score_auto_rejection INTEGER NOT NULL DEFAULT 50,  -- Max. Score für Auto-Absage (%)
  
  -- Absage-Einstellungen
  enable_auto_rejection INTEGER NOT NULL DEFAULT 1,           -- Auto-Absage aktiv (0=nein, 1=ja)
  rejection_delay_days INTEGER NOT NULL DEFAULT 3,            -- Verzögerung für Absagen in Tagen
  rejection_template_id TEXT,                                 -- Vorlage für Absage-E-Mails
  
  -- E-Mail-Einstellungen
  email_config_id TEXT,                                       -- E-Mail-Konfiguration
  
  -- Benachrichtigungseinstellungen
  notify_team_new_application INTEGER NOT NULL DEFAULT 1,     -- Benachrichtigung bei neuer Bewerbung
  notify_team_auto_conversion INTEGER NOT NULL DEFAULT 1,     -- Benachrichtigung bei Auto-Konvertierung
  notify_team_auto_rejection INTEGER NOT NULL DEFAULT 1,      -- Benachrichtigung bei Auto-Absage
  
  -- Talent-Pool-Einstellungen
  auto_add_to_talent_pool INTEGER NOT NULL DEFAULT 1,         -- Auto. zu Talent-Pool hinzufügen
  
  -- Sonstiges
  active INTEGER NOT NULL DEFAULT 1,                          -- Aktiv (0=nein, 1=ja)
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index für schnelleres Abrufen der aktiven Einstellungen
CREATE INDEX IF NOT EXISTS idx_auto_application_settings_active ON auto_application_settings(active);

-- Standardeinstellungen einfügen, falls keine vorhanden
INSERT OR IGNORE INTO auto_application_settings (
  id, name, description, 
  min_match_score_auto_conversion, max_match_score_auto_rejection,
  enable_auto_rejection, rejection_delay_days,
  notify_team_new_application, notify_team_auto_conversion, notify_team_auto_rejection,
  auto_add_to_talent_pool, active, created_by
) 
SELECT 
  'default', 'Standardeinstellungen', 'Automatisch erstellte Standardeinstellungen', 
  85, 50, 
  1, 3, 
  1, 1, 1, 
  1, 1, 'system'
WHERE NOT EXISTS (SELECT 1 FROM auto_application_settings LIMIT 1);
