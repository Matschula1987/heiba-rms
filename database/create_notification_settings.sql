-- Tabelle für Benachrichtigungseinstellungen
CREATE TABLE IF NOT EXISTS notification_settings (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
  user_id TEXT NOT NULL,
  
  -- Benachrichtigungskanäle
  email_enabled BOOLEAN DEFAULT 1,
  push_enabled BOOLEAN DEFAULT 1,
  sms_enabled BOOLEAN DEFAULT 0,
  
  -- Benachrichtigungstypen
  notify_followup BOOLEAN DEFAULT 1,
  notify_applications BOOLEAN DEFAULT 1,
  notify_status_changes BOOLEAN DEFAULT 1,
  notify_due_actions BOOLEAN DEFAULT 1,
  notify_profile_sending BOOLEAN DEFAULT 1,
  notify_matchings BOOLEAN DEFAULT 1,
  
  -- Häufigkeit
  frequency TEXT CHECK(frequency IN ('instant', 'daily', 'weekly')) DEFAULT 'instant',
  
  -- Ruhige Zeiten
  quiet_hours_start TEXT,
  quiet_hours_end TEXT,
  weekend_disabled BOOLEAN DEFAULT 0,
  
  -- Priorität
  min_priority TEXT CHECK(min_priority IN ('high', 'normal', 'low')) DEFAULT 'normal',
  
  -- KI-Modus
  ai_mode_enabled BOOLEAN DEFAULT 0,
  ai_mode_level TEXT CHECK(ai_mode_level IN ('assist', 'enhanced', 'full')) DEFAULT 'assist',
  ai_failure_notification BOOLEAN DEFAULT 1,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index für schnellen Zugriff auf Benutzereinstellungen
CREATE INDEX IF NOT EXISTS idx_notification_settings_user ON notification_settings(user_id);

-- Standardeinstellungen für alle existierenden Benutzer einfügen (falls nötig)
INSERT OR IGNORE INTO notification_settings (id, user_id)
SELECT lower(hex(randomblob(4))), id FROM users;
