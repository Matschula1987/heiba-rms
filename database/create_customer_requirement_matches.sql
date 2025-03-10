-- Tabelle für Matches zwischen Kundenanforderungen und Kandidaten/Bewerbungen/Talent-Pool-Einträgen
CREATE TABLE customer_requirement_matches (
  id TEXT PRIMARY KEY,
  requirement_id TEXT NOT NULL,  -- ID der Kundenanforderung
  entity_type TEXT NOT NULL,     -- 'candidate', 'application', 'talent_pool'
  entity_id TEXT NOT NULL,       -- ID des Kandidaten, der Bewerbung oder des Talent-Pool-Eintrags
  match_score INTEGER NOT NULL,  -- Match-Score (0-100)
  status TEXT DEFAULT 'new',     -- 'new', 'viewed', 'contacted', 'rejected', 'accepted'
  last_contact TEXT,             -- Datum des letzten Kontakts
  notes TEXT,                    -- Zusätzliche Notizen
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (requirement_id) REFERENCES requirements(id) ON DELETE CASCADE
);

-- Index für schnelles Abrufen von Matches für eine bestimmte Anforderung
CREATE INDEX IF NOT EXISTS idx_requirement_matches_requirement_id ON customer_requirement_matches(requirement_id);

-- Index für schnelles Abrufen von Matches für eine bestimmte Entität
CREATE INDEX IF NOT EXISTS idx_requirement_matches_entity ON customer_requirement_matches(entity_type, entity_id);

-- Index für Sortierung nach Match-Score
CREATE INDEX IF NOT EXISTS idx_requirement_matches_score ON customer_requirement_matches(match_score DESC);

-- Erweiterung der Notifications-Tabelle um Informationen zu direkten Links
-- Diese Änderung nur durchführen, wenn die Spalten noch nicht existieren
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS link_type TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS link_entity_type TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS link_entity_id TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS secondary_link_type TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS secondary_link_entity_type TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS secondary_link_entity_id TEXT;
