-- Tabelle für Telefonanlagen-Konfiguration (z.B. ProCall)
CREATE TABLE IF NOT EXISTS phone_configurations (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
  name TEXT NOT NULL,                             -- Name der Konfiguration (z.B. "ProCall")
  provider_type TEXT NOT NULL,                    -- Art des Anbieters (z.B. "procall", "asterisk", "twilio")
  server_url TEXT,                                -- Server-URL oder IP-Adresse
  api_key TEXT,                                   -- API-Schlüssel (falls erforderlich)
  username TEXT,                                  -- Benutzername
  password TEXT,                                  -- Passwort (sollte verschlüsselt werden)
  extension TEXT,                                 -- Telefonische Durchwahl
  active BOOLEAN NOT NULL DEFAULT 1,              -- Ob die Konfiguration aktiv ist
  settings TEXT,                                  -- Weitere Einstellungen als JSON
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabelle für Telefonanschlüsse der Benutzer
CREATE TABLE IF NOT EXISTS user_phone_extensions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
  user_id TEXT NOT NULL,                          -- Referenz zum Benutzer
  phone_configuration_id TEXT NOT NULL,           -- Referenz zur Telefonanlagen-Konfiguration
  extension TEXT NOT NULL,                        -- Telefonische Durchwahl
  display_name TEXT,                              -- Anzeigename für die Durchwahl
  primary_extension BOOLEAN NOT NULL DEFAULT 0,   -- Ob dies die Haupt-Durchwahl ist
  active BOOLEAN NOT NULL DEFAULT 1,              -- Ob die Durchwahl aktiv ist
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (phone_configuration_id) REFERENCES phone_configurations(id) ON DELETE CASCADE
);

-- Tabelle für Anrufprotokolle
CREATE TABLE IF NOT EXISTS call_logs (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
  phone_configuration_id TEXT NOT NULL,           -- Referenz zur Telefonanlagen-Konfiguration
  external_id TEXT,                               -- Externe ID des Anrufs
  call_type TEXT NOT NULL,                        -- Art des Anrufs (incoming, outgoing, missed)
  caller_number TEXT NOT NULL,                    -- Telefonnummer des Anrufers
  caller_name TEXT,                               -- Name des Anrufers (wenn verfügbar)
  recipient_number TEXT NOT NULL,                 -- Telefonnummer des Empfängers
  recipient_name TEXT,                            -- Name des Empfängers (wenn verfügbar)
  extension TEXT,                                 -- Verwendete Durchwahl
  start_time TIMESTAMP NOT NULL,                  -- Startzeit des Anrufs
  end_time TIMESTAMP,                             -- Endzeit des Anrufs
  duration INTEGER,                               -- Dauer in Sekunden
  status TEXT NOT NULL,                           -- Status des Anrufs (connected, no_answer, busy, failed)
  recording_url TEXT,                             -- URL zur Aufnahme (falls vorhanden)
  notes TEXT,                                     -- Notizen zum Anruf
  user_id TEXT,                                   -- Referenz zum verantwortlichen Benutzer
  candidate_id TEXT,                              -- Verknüpfung mit einem Kandidaten (falls vorhanden)
  application_id TEXT,                            -- Verknüpfung mit einer Bewerbung (falls vorhanden)
  job_id TEXT,                                    -- Verknüpfung mit einer Stellenanzeige (falls vorhanden)
  talent_pool_id TEXT,                            -- Verknüpfung mit einem Talent-Pool-Eintrag (falls vorhanden)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (phone_configuration_id) REFERENCES phone_configurations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE SET NULL,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE SET NULL,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL,
  FOREIGN KEY (talent_pool_id) REFERENCES talent_pool(id) ON DELETE SET NULL
);

-- Tabelle für geplante Anrufe
CREATE TABLE IF NOT EXISTS scheduled_calls (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
  user_id TEXT NOT NULL,                          -- Referenz zum verantwortlichen Benutzer
  phone_number TEXT NOT NULL,                     -- Zu wählende Telefonnummer
  contact_name TEXT,                              -- Name des Kontakts
  scheduled_time TIMESTAMP NOT NULL,              -- Geplante Zeit für den Anruf
  notes TEXT,                                     -- Notizen zum Anruf
  status TEXT NOT NULL DEFAULT 'pending',         -- Status (pending, completed, cancelled)
  completed_at TIMESTAMP,                         -- Zeitpunkt der Erledigung
  call_log_id TEXT,                               -- Referenz zum Anrufprotokoll (falls der Anruf erfolgt ist)
  reminder_sent BOOLEAN NOT NULL DEFAULT 0,       -- Ob eine Erinnerung gesendet wurde
  candidate_id TEXT,                              -- Verknüpfung mit einem Kandidaten (falls vorhanden)
  application_id TEXT,                            -- Verknüpfung mit einer Bewerbung (falls vorhanden)
  job_id TEXT,                                    -- Verknüpfung mit einer Stellenanzeige (falls vorhanden)
  talent_pool_id TEXT,                            -- Verknüpfung mit einem Talent-Pool-Eintrag (falls vorhanden)
  created_by TEXT NOT NULL,                       -- Benutzer, der den Anruf geplant hat
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (call_log_id) REFERENCES call_logs(id) ON DELETE SET NULL,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE SET NULL,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE SET NULL,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL,
  FOREIGN KEY (talent_pool_id) REFERENCES talent_pool(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabelle für Anruftemplates
CREATE TABLE IF NOT EXISTS call_templates (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
  name TEXT NOT NULL,                             -- Name des Templates
  description TEXT,                               -- Beschreibung
  script TEXT,                                    -- Skript/Text für den Anruf
  category TEXT,                                  -- Kategorie (z.B. "Bewerbungsgespräch", "Nachfassanruf")
  estimated_duration INTEGER,                     -- Geschätzte Dauer in Minuten
  questions TEXT,                                 -- Fragen als JSON-Array
  created_by TEXT NOT NULL,                       -- Benutzer, der das Template erstellt hat
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabelle für Kontakt-Routing-Regeln
CREATE TABLE IF NOT EXISTS contact_routing_rules (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
  name TEXT NOT NULL,                             -- Name der Regel
  description TEXT,                               -- Beschreibung
  phone_configuration_id TEXT NOT NULL,           -- Referenz zur Telefonanlagen-Konfiguration
  conditions TEXT NOT NULL,                       -- Bedingungen als JSON
  actions TEXT NOT NULL,                          -- Aktionen als JSON
  priority INTEGER NOT NULL DEFAULT 0,            -- Priorität der Regel
  active BOOLEAN NOT NULL DEFAULT 1,              -- Ob die Regel aktiv ist
  created_by TEXT NOT NULL,                       -- Benutzer, der die Regel erstellt hat
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (phone_configuration_id) REFERENCES phone_configurations(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabelle für Click-to-Call Zuweisungen
CREATE TABLE IF NOT EXISTS click_to_call_assignments (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
  phone_number TEXT NOT NULL,                     -- Telefonnummer
  display_name TEXT,                              -- Anzeigename für die Nummer
  priority INTEGER NOT NULL DEFAULT 0,            -- Priorität (höher = wichtiger)
  candidate_id TEXT,                              -- Verknüpfung mit einem Kandidaten (falls vorhanden)
  application_id TEXT,                            -- Verknüpfung mit einer Bewerbung (falls vorhanden)
  job_id TEXT,                                    -- Verknüpfung mit einer Stellenanzeige (falls vorhanden)
  talent_pool_id TEXT,                            -- Verknüpfung mit einem Talent-Pool-Eintrag (falls vorhanden)
  created_by TEXT NOT NULL,                       -- Benutzer, der die Zuweisung erstellt hat
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE SET NULL,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE SET NULL,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL,
  FOREIGN KEY (talent_pool_id) REFERENCES talent_pool(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexe für Performance
CREATE INDEX IF NOT EXISTS idx_call_logs_user ON call_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_candidate ON call_logs(candidate_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_application ON call_logs(application_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_start_time ON call_logs(start_time);
CREATE INDEX IF NOT EXISTS idx_scheduled_calls_user ON scheduled_calls(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_calls_status ON scheduled_calls(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_calls_scheduled_time ON scheduled_calls(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_user_phone_extensions_user ON user_phone_extensions(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_routing_rules_active ON contact_routing_rules(active);
