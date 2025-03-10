-- Tabelle für gespeicherte Filter
CREATE TABLE IF NOT EXISTS saved_filters (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
  name TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK(entity_type IN ('job', 'candidate', 'customer')),
  filter_json TEXT NOT NULL, -- JSON-Darstellung des Filters
  is_default INTEGER DEFAULT 0,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Zusammengesetzter eindeutiger Index, damit ein Benutzer nicht mehrere Filter mit demselben Namen 
  -- für denselben Entitätstyp haben kann
  UNIQUE(name, entity_type, created_by)
);

-- Index für schnellen Zugriff auf Filter pro Benutzer und Entitätstyp
CREATE INDEX IF NOT EXISTS idx_saved_filters_user_entity 
ON saved_filters(created_by, entity_type);

-- Index für Standardfilter
CREATE INDEX IF NOT EXISTS idx_saved_filters_default 
ON saved_filters(entity_type, is_default) 
WHERE is_default = 1;
