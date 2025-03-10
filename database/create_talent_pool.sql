-- Talent Pool Tabelle erstellen 
-- Diese Tabelle enthält Einträge für den Talent-Pool, unabhängig davon, ob es Bewerber oder Kandidaten sind
CREATE TABLE IF NOT EXISTS talent_pool (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
  entity_id TEXT NOT NULL,             -- ID des Bewerbers oder Kandidaten
  entity_type TEXT NOT NULL,           -- 'candidate' oder 'application'
  added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  added_by TEXT,                       -- User ID, der den Eintrag hinzugefügt hat
  reason TEXT,                         -- Grund für die Aufnahme in den Talent-Pool
  notes TEXT,                          -- Zusätzliche Notizen
  last_contacted TIMESTAMP,            -- Wann wurde der Kandidat/Bewerber zuletzt kontaktiert
  rating INTEGER,                      -- Bewertung (1-5 Sterne)
  tags TEXT,                           -- JSON Array mit Tags/Kategorien
  skills_snapshot TEXT,                -- JSON Snapshot der Skills zum Zeitpunkt der Aufnahme
  experience_snapshot TEXT,            -- JSON Snapshot der Berufserfahrung zum Zeitpunkt der Aufnahme
  status TEXT CHECK(status IN ('active', 'inactive', 'contacted', 'not_interested')) DEFAULT 'active',
  reminder_date TIMESTAMP,             -- Optional: Erinnerung für Follow-up
  UNIQUE(entity_id, entity_type)       -- Verhindert Duplikate
);

-- Index für schnellere Suche nach Kandidaten-/Bewerber-Typ
CREATE INDEX IF NOT EXISTS idx_talent_pool_entity_type ON talent_pool(entity_type);

-- Index für schnellere Suche nach Status
CREATE INDEX IF NOT EXISTS idx_talent_pool_status ON talent_pool(status);

-- Index für effiziente Suche nach dem Zeitpunkt des Hinzufügens
CREATE INDEX IF NOT EXISTS idx_talent_pool_added_date ON talent_pool(added_date);

-- Tabelle für Job Matches im Talent Pool
-- Speichert automatisch berechnete Matches zwischen Talent-Pool-Einträgen und offenen Stellen
CREATE TABLE IF NOT EXISTS talent_pool_job_matches (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
  talent_pool_id TEXT NOT NULL,
  job_id TEXT NOT NULL,
  match_score REAL,                    -- Match-Score zwischen 0 und 100
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  match_details TEXT,                  -- JSON mit Details zum Match (Skill-Matches, etc.)
  status TEXT CHECK(status IN ('new', 'reviewed', 'contacted', 'rejected', 'accepted')) DEFAULT 'new',
  FOREIGN KEY (talent_pool_id) REFERENCES talent_pool(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  UNIQUE(talent_pool_id, job_id)       -- Verhindert Duplikate
);

-- Index für schnelle Abfragen nach Talent Pool Einträgen
CREATE INDEX IF NOT EXISTS idx_talent_pool_job_matches_talent ON talent_pool_job_matches(talent_pool_id);

-- Index für schnelle Abfragen nach Jobs
CREATE INDEX IF NOT EXISTS idx_talent_pool_job_matches_job ON talent_pool_job_matches(job_id);

-- Index für Sortierung nach Match-Score
CREATE INDEX IF NOT EXISTS idx_talent_pool_job_matches_score ON talent_pool_job_matches(match_score);

-- Tabelle für manuelle Notizen zu Talent-Pool-Einträgen
CREATE TABLE IF NOT EXISTS talent_pool_notes (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
  talent_pool_id TEXT NOT NULL,
  created_by TEXT NOT NULL,            -- User ID, der die Notiz erstellt hat
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  content TEXT NOT NULL,               -- Inhalt der Notiz
  note_type TEXT DEFAULT 'general',    -- Typ der Notiz (z.B. 'general', 'interview', 'contact')
  FOREIGN KEY (talent_pool_id) REFERENCES talent_pool(id) ON DELETE CASCADE
);

-- Index für Notizen zu einem Talent-Pool-Eintrag
CREATE INDEX IF NOT EXISTS idx_talent_pool_notes_talent ON talent_pool_notes(talent_pool_id);

-- Tabelle für Aktivitäten im Talent-Pool
-- Verfolgt alle Aktionen, die mit einem Talent-Pool-Eintrag durchgeführt wurden
CREATE TABLE IF NOT EXISTS talent_pool_activities (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
  talent_pool_id TEXT NOT NULL,
  activity_type TEXT NOT NULL,         -- Typ der Aktivität (z.B. 'added', 'contacted', 'matched', 'status_changed')
  activity_data TEXT,                  -- JSON mit zusätzlichen Daten zur Aktivität
  created_by TEXT,                     -- User ID, der die Aktivität durchgeführt hat
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (talent_pool_id) REFERENCES talent_pool(id) ON DELETE CASCADE
);

-- Index für Aktivitäten zu einem Talent-Pool-Eintrag
CREATE INDEX IF NOT EXISTS idx_talent_pool_activities_talent ON talent_pool_activities(talent_pool_id);

-- Index für Typ der Aktivitäten
CREATE INDEX IF NOT EXISTS idx_talent_pool_activities_type ON talent_pool_activities(activity_type);

-- Trigger, um bei Änderungen an einem Talent-Pool-Eintrag ein Aktivitätslog zu erstellen
CREATE TRIGGER IF NOT EXISTS trg_talent_pool_update_activity
AFTER UPDATE ON talent_pool
BEGIN
  INSERT INTO talent_pool_activities (talent_pool_id, activity_type, activity_data, created_by)
  VALUES (
    NEW.id, 
    'status_changed',
    json_object('old_status', OLD.status, 'new_status', NEW.status),
    NEW.added_by
  );
END;

-- Trigger, um beim Hinzufügen eines Talent-Pool-Eintrags ein Aktivitätslog zu erstellen
CREATE TRIGGER IF NOT EXISTS trg_talent_pool_insert_activity
AFTER INSERT ON talent_pool
BEGIN
  INSERT INTO talent_pool_activities (talent_pool_id, activity_type, created_by)
  VALUES (NEW.id, 'added_to_pool', NEW.added_by);
END;
