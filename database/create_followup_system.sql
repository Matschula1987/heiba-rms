-- Tabelle für Nachfassaktionen/Follow-Ups
CREATE TABLE IF NOT EXISTS followup_actions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
  title TEXT NOT NULL,                                -- Titel der Nachfassaktion
  description TEXT,                                   -- Beschreibung
  due_date TIMESTAMP NOT NULL,                        -- Fälligkeitsdatum
  completed BOOLEAN NOT NULL DEFAULT 0,               -- Ob die Aktion abgeschlossen ist
  completed_at TIMESTAMP,                             -- Wann die Aktion abgeschlossen wurde
  priority TEXT NOT NULL DEFAULT 'medium',            -- Priorität (high, medium, low)
  action_type TEXT NOT NULL,                          -- Art der Aktion (email, call, meeting, etc.)
  assigned_to TEXT NOT NULL,                          -- Benutzer, dem die Aktion zugewiesen ist
  assigned_by TEXT NOT NULL,                          -- Benutzer, der die Aktion zugewiesen hat
  reminder_sent BOOLEAN NOT NULL DEFAULT 0,           -- Ob eine Erinnerung gesendet wurde
  reminder_date TIMESTAMP,                            -- Wann die Erinnerung gesendet werden soll
  candidate_id TEXT,                                  -- Verknüpfung mit einem Kandidaten (falls vorhanden)
  application_id TEXT,                                -- Verknüpfung mit einer Bewerbung (falls vorhanden)
  job_id TEXT,                                        -- Verknüpfung mit einer Stellenanzeige (falls vorhanden)
  talent_pool_id TEXT,                                -- Verknüpfung mit einem Talent-Pool-Eintrag (falls vorhanden)
  notes TEXT,                                         -- Notizen zur Aktion
  status TEXT NOT NULL DEFAULT 'pending',             -- Status (pending, in_progress, completed, cancelled)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE SET NULL,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE SET NULL,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL,
  FOREIGN KEY (talent_pool_id) REFERENCES talent_pool(id) ON DELETE SET NULL
);

-- Tabelle für Nachfassaktionsvorlagen
CREATE TABLE IF NOT EXISTS followup_templates (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
  name TEXT NOT NULL,                                 -- Name der Vorlage
  description TEXT,                                   -- Beschreibung
  action_type TEXT NOT NULL,                          -- Art der Aktion (email, call, meeting, etc.)
  template_content TEXT,                              -- Inhalt der Vorlage (z.B. E-Mail-Text, Anrufskript)
  default_priority TEXT NOT NULL DEFAULT 'medium',    -- Standardpriorität
  default_days_offset INTEGER NOT NULL DEFAULT 2,     -- Standardmäßige Anzahl Tage zwischen Auslöser und Fälligkeit
  created_by TEXT NOT NULL,                           -- Benutzer, der die Vorlage erstellt hat
  trigger_on TEXT,                                    -- Auslöseereignis (z.B. profile_sent, interview_scheduled)
  applicability TEXT,                                 -- Wo die Vorlage anwendbar ist (candidate, application, job, talent_pool)
  is_active BOOLEAN NOT NULL DEFAULT 1,               -- Ob die Vorlage aktiv ist
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabelle für automatische Nachfassregeln
CREATE TABLE IF NOT EXISTS followup_rules (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
  name TEXT NOT NULL,                                 -- Name der Regel
  description TEXT,                                   -- Beschreibung
  is_active BOOLEAN NOT NULL DEFAULT 1,               -- Ob die Regel aktiv ist
  trigger_event TEXT NOT NULL,                        -- Auslöseereignis (z.B. profile_sent, interview_scheduled)
  entity_type TEXT NOT NULL,                          -- Art der Entity (candidate, application, job, talent_pool)
  days_offset INTEGER NOT NULL DEFAULT 2,             -- Anzahl Tage zwischen Auslöser und Fälligkeit
  action_type TEXT NOT NULL,                          -- Art der Aktion (email, call, meeting, etc.)
  priority TEXT NOT NULL DEFAULT 'medium',            -- Priorität der Nachfassaktion
  template_id TEXT,                                   -- Referenz zu einer Vorlage (falls vorhanden)
  assigned_to_type TEXT NOT NULL,                     -- Wem die Aktion zugewiesen wird (creator, manager, recruiter, specific_user)
  assigned_to_user_id TEXT,                           -- Spezifischer Benutzer für die Zuweisung (falls assigned_to_type = specific_user)
  conditions TEXT,                                    -- Bedingungen als JSON (optional)
  created_by TEXT NOT NULL,                           -- Benutzer, der die Regel erstellt hat
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (template_id) REFERENCES followup_templates(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_to_user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabelle für Follow-Up-Logs (Protokollierung von Follow-Up-Aktivitäten)
CREATE TABLE IF NOT EXISTS followup_logs (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
  followup_action_id TEXT NOT NULL,                   -- Referenz zur Nachfassaktion
  action_type TEXT NOT NULL,                          -- Art der Aktion (create, update, complete, cancel, remind)
  user_id TEXT NOT NULL,                              -- Benutzer, der die Aktion durchgeführt hat
  details TEXT,                                       -- Details zur Aktion als JSON
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (followup_action_id) REFERENCES followup_actions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Spezielle Tabelle für Profilversand-Nachverfolgung (2-Tage-Erinnerung)
CREATE TABLE IF NOT EXISTS profile_submission_followups (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
  application_id TEXT NOT NULL,                       -- Verknüpfung mit der Bewerbung
  customer_id TEXT NOT NULL,                          -- Verknüpfung mit dem Kunden, an den das Profil gesendet wurde
  sent_by TEXT NOT NULL,                              -- Benutzer, der das Profil gesendet hat
  sent_at TIMESTAMP NOT NULL,                         -- Wann das Profil gesendet wurde
  followup_action_id TEXT,                            -- Referenz zur Nachfassaktion
  status TEXT NOT NULL DEFAULT 'pending',             -- Status (pending, followed_up, no_response, response_received, cancelled)
  response_received_at TIMESTAMP,                     -- Wann eine Antwort erhalten wurde
  response_details TEXT,                              -- Details zur Antwort
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (sent_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (followup_action_id) REFERENCES followup_actions(id) ON DELETE SET NULL
);

-- Verbindungstabelle zwischen Benachrichtigungen und Nachfassaktionen
CREATE TABLE IF NOT EXISTS notification_followup_links (
  notification_id TEXT NOT NULL,                      -- Referenz zur Benachrichtigung
  followup_action_id TEXT NOT NULL,                   -- Referenz zur Nachfassaktion
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (notification_id, followup_action_id),
  FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
  FOREIGN KEY (followup_action_id) REFERENCES followup_actions(id) ON DELETE CASCADE
);

-- Indexe für Performance
CREATE INDEX IF NOT EXISTS idx_followup_actions_due_date ON followup_actions(due_date);
CREATE INDEX IF NOT EXISTS idx_followup_actions_assigned_to ON followup_actions(assigned_to);
CREATE INDEX IF NOT EXISTS idx_followup_actions_status ON followup_actions(status);
CREATE INDEX IF NOT EXISTS idx_followup_actions_entity ON followup_actions(candidate_id, application_id, job_id, talent_pool_id);
CREATE INDEX IF NOT EXISTS idx_followup_templates_trigger ON followup_templates(trigger_on);
CREATE INDEX IF NOT EXISTS idx_followup_rules_trigger ON followup_rules(trigger_event, entity_type);
CREATE INDEX IF NOT EXISTS idx_profile_submission_status ON profile_submission_followups(status);
CREATE INDEX IF NOT EXISTS idx_profile_submission_sent_at ON profile_submission_followups(sent_at);
