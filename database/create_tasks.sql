-- Aufgaben (Tasks) Tabelle

CREATE TABLE IF NOT EXISTS tasks (
  id VARCHAR(36) PRIMARY KEY, -- UUID
  title TEXT NOT NULL,
  description TEXT,
  due_date DATETIME NOT NULL,
  priority VARCHAR(10) NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  status VARCHAR(15) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  task_type VARCHAR(20) NOT NULL CHECK (task_type IN ('application_followup', 'job_expiry', 'candidate_interview', 'matching_review', 'document_approval', 'manual')),
  
  -- Verknüpfungen
  assigned_to VARCHAR(36),
  related_entity_type VARCHAR(15) CHECK (related_entity_type IN ('application', 'job', 'candidate', 'talent_pool', 'other')),
  related_entity_id VARCHAR(36),
  
  -- Automatisierung
  is_automated BOOLEAN NOT NULL DEFAULT 0,
  reminder_sent BOOLEAN NOT NULL DEFAULT 0,
  
  -- Zeitstempel
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- Index für schnelles Auflisten von anstehenden Aufgaben
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Index für schnelles Auflisten von Aufgaben nach Status
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Index für schnelles Auflisten von Aufgaben nach Priorität
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);

-- Index für schnelles Auflisten von Aufgaben nach Benutzer
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);

-- Index für schnelles Auflisten von Aufgaben nach verknüpften Entitäten
CREATE INDEX IF NOT EXISTS idx_tasks_related_entity ON tasks(related_entity_type, related_entity_id);

-- Index für Kombination von Status und Fälligkeitsdatum (häufige Abfrage für "Anstehende offene Aufgaben")
CREATE INDEX IF NOT EXISTS idx_tasks_status_due_date ON tasks(status, due_date);

-- Index für automatisierte Aufgaben-Abfragen
CREATE INDEX IF NOT EXISTS idx_tasks_automated ON tasks(is_automated);

-- Trigger für automatische Aktualisierung des updated_at-Zeitstempels
CREATE TRIGGER IF NOT EXISTS trig_tasks_update_timestamp 
AFTER UPDATE ON tasks
FOR EACH ROW
BEGIN
  UPDATE tasks SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Beispiel-Aufgaben einfügen
INSERT OR IGNORE INTO tasks (id, title, description, due_date, priority, status, task_type, is_automated, reminder_sent)
VALUES 
  ('task-001', 'Bewerbungsgespräch vorbereiten', 'Unterlagen für das Interview mit Thomas Müller durchgehen', '2025-03-10 10:00:00', 'high', 'open', 'candidate_interview', 0, 0),
  ('task-002', 'Stellenanzeige überarbeiten', 'Anzeige für Frontend-Entwickler aktualisieren und neu veröffentlichen', '2025-03-12 14:00:00', 'medium', 'open', 'job_expiry', 0, 0),
  ('task-003', 'Matching-Algorithmus anpassen', 'Algorithmus für bessere Ergebnisse optimieren', '2025-03-15 09:00:00', 'low', 'open', 'matching_review', 0, 0);
