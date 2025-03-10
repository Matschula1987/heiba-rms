-- Tabelle für E-Mail-Konfiguration (z.B. Tobit David)
CREATE TABLE IF NOT EXISTS email_configurations (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
  name TEXT NOT NULL,                             -- Name der Konfiguration (z.B. "Tobit David")
  provider_type TEXT NOT NULL,                    -- Art des Anbieters (z.B. "tobit_david", "exchange", "smtp")
  server_url TEXT,                                -- Server-URL
  api_key TEXT,                                   -- API-Schlüssel (falls erforderlich)
  username TEXT,                                  -- Benutzername
  password TEXT,                                  -- Passwort (sollte verschlüsselt werden)
  default_sender TEXT,                            -- Standard-Absender
  signature TEXT,                                 -- E-Mail-Signatur
  active BOOLEAN NOT NULL DEFAULT 1,              -- Ob die Konfiguration aktiv ist
  settings TEXT,                                  -- Weitere Einstellungen als JSON
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabelle für eingehende E-Mails
CREATE TABLE IF NOT EXISTS incoming_emails (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
  email_configuration_id TEXT NOT NULL,           -- Referenz zur E-Mail-Konfiguration
  external_id TEXT,                               -- Externe ID der E-Mail
  sender TEXT NOT NULL,                           -- Absender
  recipient TEXT NOT NULL,                        -- Empfänger
  cc TEXT,                                        -- CC-Empfänger
  bcc TEXT,                                       -- BCC-Empfänger
  subject TEXT NOT NULL,                          -- Betreff
  body TEXT NOT NULL,                             -- Inhalt (kann HTML sein)
  body_plain TEXT,                                -- Inhalt als Plaintext
  received_at TIMESTAMP NOT NULL,                 -- Empfangsdatum
  read BOOLEAN NOT NULL DEFAULT 0,                -- Ob die E-Mail gelesen wurde
  flagged BOOLEAN NOT NULL DEFAULT 0,             -- Ob die E-Mail markiert wurde
  status TEXT NOT NULL DEFAULT 'new',             -- Status der E-Mail (new, processed, archived)
  assigned_to_id TEXT,                            -- Referenz zum zugewiesenen Benutzer
  candidate_id TEXT,                              -- Verknüpfung mit einem Kandidaten (falls vorhanden)
  application_id TEXT,                            -- Verknüpfung mit einer Bewerbung (falls vorhanden)
  job_id TEXT,                                    -- Verknüpfung mit einer Stellenanzeige (falls vorhanden)
  talent_pool_id TEXT,                            -- Verknüpfung mit einem Talent-Pool-Eintrag (falls vorhanden)
  raw_data TEXT,                                  -- Rohdaten als JSON
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (email_configuration_id) REFERENCES email_configurations(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE SET NULL,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE SET NULL,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL,
  FOREIGN KEY (talent_pool_id) REFERENCES talent_pool(id) ON DELETE SET NULL
);

-- Tabelle für E-Mail-Anhänge
CREATE TABLE IF NOT EXISTS email_attachments (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
  email_id TEXT NOT NULL,                         -- Referenz zur E-Mail
  filename TEXT NOT NULL,                         -- Dateiname
  content_type TEXT NOT NULL,                     -- MIME-Typ
  size INTEGER NOT NULL,                          -- Größe in Bytes
  content BLOB,                                   -- Inhalt als BLOB
  storage_path TEXT,                              -- Pfad zur Speicherung (falls extern gespeichert)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (email_id) REFERENCES incoming_emails(id) ON DELETE CASCADE
);

-- Tabelle für ausgehende E-Mails
CREATE TABLE IF NOT EXISTS outgoing_emails (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
  email_configuration_id TEXT NOT NULL,           -- Referenz zur E-Mail-Konfiguration
  external_id TEXT,                               -- Externe ID der E-Mail
  sender TEXT NOT NULL,                           -- Absender
  recipient TEXT NOT NULL,                        -- Empfänger
  cc TEXT,                                        -- CC-Empfänger
  bcc TEXT,                                       -- BCC-Empfänger
  subject TEXT NOT NULL,                          -- Betreff
  body TEXT NOT NULL,                             -- Inhalt (kann HTML sein)
  body_plain TEXT,                                -- Inhalt als Plaintext
  scheduled_at TIMESTAMP,                         -- Geplanter Versandzeitpunkt
  sent_at TIMESTAMP,                              -- Tatsächlicher Versandzeitpunkt
  status TEXT NOT NULL DEFAULT 'draft',           -- Status der E-Mail (draft, queued, sent, error)
  error_message TEXT,                             -- Fehlermeldung (falls vorhanden)
  reply_to_email_id TEXT,                         -- Referenz zur E-Mail, auf die geantwortet wird
  candidate_id TEXT,                              -- Verknüpfung mit einem Kandidaten (falls vorhanden)
  application_id TEXT,                            -- Verknüpfung mit einer Bewerbung (falls vorhanden)
  job_id TEXT,                                    -- Verknüpfung mit einer Stellenanzeige (falls vorhanden)
  talent_pool_id TEXT,                            -- Verknüpfung mit einem Talent-Pool-Eintrag (falls vorhanden)
  created_by TEXT NOT NULL,                       -- Benutzer, der die E-Mail erstellt hat
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (email_configuration_id) REFERENCES email_configurations(id) ON DELETE CASCADE,
  FOREIGN KEY (reply_to_email_id) REFERENCES incoming_emails(id) ON DELETE SET NULL,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE SET NULL,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE SET NULL,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL,
  FOREIGN KEY (talent_pool_id) REFERENCES talent_pool(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabelle für Anhänge von ausgehenden E-Mails
CREATE TABLE IF NOT EXISTS outgoing_email_attachments (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
  email_id TEXT NOT NULL,                         -- Referenz zur E-Mail
  filename TEXT NOT NULL,                         -- Dateiname
  content_type TEXT NOT NULL,                     -- MIME-Typ
  size INTEGER NOT NULL,                          -- Größe in Bytes
  content BLOB,                                   -- Inhalt als BLOB
  storage_path TEXT,                              -- Pfad zur Speicherung (falls extern gespeichert)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (email_id) REFERENCES outgoing_emails(id) ON DELETE CASCADE
);

-- Tabelle für E-Mail-Vorlagen
CREATE TABLE IF NOT EXISTS email_templates (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
  name TEXT NOT NULL,                             -- Name der Vorlage
  description TEXT,                               -- Beschreibung
  subject TEXT NOT NULL,                          -- Betreff
  body TEXT NOT NULL,                             -- Inhalt (kann HTML sein)
  body_plain TEXT,                                -- Inhalt als Plaintext
  category TEXT,                                  -- Kategorie (z.B. "Bewerbungen", "Angebote")
  variables TEXT,                                 -- Liste der verwendbaren Variablen als JSON
  created_by TEXT NOT NULL,                       -- Benutzer, der die Vorlage erstellt hat
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabelle für automatische E-Mail-Regeln
CREATE TABLE IF NOT EXISTS email_rules (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
  name TEXT NOT NULL,                             -- Name der Regel
  description TEXT,                               -- Beschreibung
  email_configuration_id TEXT NOT NULL,           -- Referenz zur E-Mail-Konfiguration
  conditions TEXT NOT NULL,                       -- Bedingungen als JSON
  actions TEXT NOT NULL,                          -- Aktionen als JSON
  priority INTEGER NOT NULL DEFAULT 0,            -- Priorität der Regel
  active BOOLEAN NOT NULL DEFAULT 1,              -- Ob die Regel aktiv ist
  created_by TEXT NOT NULL,                       -- Benutzer, der die Regel erstellt hat
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (email_configuration_id) REFERENCES email_configurations(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabelle für Nachfassaktionen
CREATE TABLE IF NOT EXISTS follow_up_actions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
  type TEXT NOT NULL,                             -- Art der Aktion (email, call, meeting)
  name TEXT NOT NULL,                             -- Name der Aktion
  description TEXT,                               -- Beschreibung
  scheduled_at TIMESTAMP NOT NULL,                -- Geplanter Zeitpunkt
  completed_at TIMESTAMP,                         -- Abschlusszeitpunkt
  status TEXT NOT NULL DEFAULT 'pending',         -- Status (pending, completed, cancelled)
  candidate_id TEXT,                              -- Verknüpfung mit einem Kandidaten (falls vorhanden)
  application_id TEXT,                            -- Verknüpfung mit einer Bewerbung (falls vorhanden)
  job_id TEXT,                                    -- Verknüpfung mit einer Stellenanzeige (falls vorhanden)
  talent_pool_id TEXT,                            -- Verknüpfung mit einem Talent-Pool-Eintrag (falls vorhanden)
  email_template_id TEXT,                         -- Referenz zur E-Mail-Vorlage (falls vorhanden)
  assigned_to_id TEXT NOT NULL,                   -- Referenz zum zugewiesenen Benutzer
  reminder_sent BOOLEAN NOT NULL DEFAULT 0,       -- Ob eine Erinnerung gesendet wurde
  result TEXT,                                    -- Ergebnis der Aktion
  created_by TEXT NOT NULL,                       -- Benutzer, der die Aktion erstellt hat
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE SET NULL,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE SET NULL,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL,
  FOREIGN KEY (talent_pool_id) REFERENCES talent_pool(id) ON DELETE SET NULL,
  FOREIGN KEY (email_template_id) REFERENCES email_templates(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_to_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexe für Performance
CREATE INDEX IF NOT EXISTS idx_incoming_emails_status ON incoming_emails(status);
CREATE INDEX IF NOT EXISTS idx_incoming_emails_candidate ON incoming_emails(candidate_id);
CREATE INDEX IF NOT EXISTS idx_incoming_emails_application ON incoming_emails(application_id);
CREATE INDEX IF NOT EXISTS idx_incoming_emails_received ON incoming_emails(received_at);
CREATE INDEX IF NOT EXISTS idx_outgoing_emails_status ON outgoing_emails(status);
CREATE INDEX IF NOT EXISTS idx_outgoing_emails_scheduled ON outgoing_emails(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_outgoing_emails_candidate ON outgoing_emails(candidate_id);
CREATE INDEX IF NOT EXISTS idx_outgoing_emails_application ON outgoing_emails(application_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_actions_status ON follow_up_actions(status);
CREATE INDEX IF NOT EXISTS idx_follow_up_actions_scheduled ON follow_up_actions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_follow_up_actions_assigned ON follow_up_actions(assigned_to_id);
