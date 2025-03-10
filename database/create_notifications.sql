-- Tabelle für Benachrichtigungen
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  entity_type TEXT, -- z.B. 'job', 'candidate', 'application', etc.
  entity_id TEXT,   -- Referenz auf die Entity-ID
  action TEXT,      -- z.B. 'created', 'updated', 'commented', etc.
  sender_id TEXT,   -- Benutzer, der die Aktion ausgeführt hat
  read INTEGER DEFAULT 0,
  importance TEXT CHECK(importance IN ('low', 'normal', 'high')) DEFAULT 'normal',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP
);

-- Index für schnellen Zugriff auf ungelesene Nachrichten pro Benutzer
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read);

-- Index für Sortierung nach Erstellungsdatum
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Index für Entitätstyp und ID für einfache Filterung
CREATE INDEX IF NOT EXISTS idx_notifications_entity ON notifications(entity_type, entity_id);

-- Tabelle für Bearbeitungssperren
CREATE TABLE IF NOT EXISTS editing_locks (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
  entity_type TEXT NOT NULL,  -- z.B. 'job', 'candidate', etc.
  entity_id TEXT NOT NULL,    -- Referenz auf die Entity-ID
  user_id TEXT NOT NULL,      -- Benutzer, der die Sperre hält
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,       -- Automatisches Ablaufdatum der Sperre
  UNIQUE(entity_type, entity_id)  -- Nur eine aktive Sperre pro Entity
);

-- Index für Ablauf von Sperren
CREATE INDEX IF NOT EXISTS idx_editing_locks_expires_at ON editing_locks(expires_at);

-- Index für Benutzer-Sperren
CREATE INDEX IF NOT EXISTS idx_editing_locks_user_id ON editing_locks(user_id);
