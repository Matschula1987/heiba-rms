-- Tabelle für Bearbeitungssperren
-- Verhindert gleichzeitige Bearbeitung von Datensätzen durch mehrere Benutzer

-- Prüfen und löschen des Indexes, falls vorhanden
DROP INDEX IF EXISTS idx_editing_locks_user;
DROP INDEX IF EXISTS idx_editing_locks_expiry;

-- Tabelle erstellen
CREATE TABLE IF NOT EXISTS editing_locks (
  id TEXT PRIMARY KEY,
  entity_id TEXT NOT NULL,          -- ID der Entität (z.B. job_id, candidate_id)
  entity_type TEXT NOT NULL,        -- Typ der Entität (z.B. 'job', 'candidate')
  user_id TEXT NOT NULL,            -- ID des Benutzers, der die Sperre hält
  user_name TEXT NOT NULL,          -- Name des Benutzers (für Anzeige)
  locked_at TEXT NOT NULL,          -- Zeitpunkt der Sperrung (ISO-Format)
  expires_at TEXT NOT NULL,         -- Ablaufzeitpunkt der Sperre (ISO-Format)
  active INTEGER NOT NULL DEFAULT 1, -- 1 = aktiv, 0 = inaktiv
  created_at TEXT NOT NULL,         -- Erstellungszeitpunkt
  updated_at TEXT NOT NULL          -- Letzter Aktualisierungszeitpunkt
);

-- Unique-Constraint wird separat hinzugefügt
CREATE UNIQUE INDEX IF NOT EXISTS idx_editing_locks_entity ON editing_locks(entity_id, entity_type);

-- Separate Indizes für schnelle Abfragen
CREATE INDEX IF NOT EXISTS idx_editing_locks_user ON editing_locks(user_id);
CREATE INDEX IF NOT EXISTS idx_editing_locks_expiry ON editing_locks(expires_at);
