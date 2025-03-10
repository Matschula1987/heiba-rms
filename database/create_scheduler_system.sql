-- Scheduler und Pipeline System
-- Tabellen für geplante Aufgaben und Pipeline-Items

-- Geplante Aufgaben/Jobs
CREATE TABLE IF NOT EXISTS scheduled_tasks (
  id TEXT PRIMARY KEY,
  task_type TEXT NOT NULL, -- 'sync', 'social_post', 'movido_post', etc.
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed', 'cancelled'
  scheduled_for DATETIME NOT NULL,
  interval_type TEXT, -- 'once', 'hourly', 'daily', 'weekly', 'monthly', 'custom'
  interval_value INTEGER, -- z.B. alle X Stunden, Tage, etc.
  interval_unit TEXT, -- 'minutes', 'hours', 'days', 'weeks'
  custom_schedule TEXT, -- Für komplexere Zeitpläne (JSON-Format)
  config TEXT, -- Konfigurationsparameter (JSON-Format)
  entity_id TEXT, -- ID des betroffenen Elements (Job, Portal, etc.)
  entity_type TEXT, -- Typ des betroffenen Elements ('job', 'portal', etc.)
  created_at DATETIME,
  updated_at DATETIME,
  last_run DATETIME,
  next_run DATETIME,
  result TEXT, -- Ergebnis der letzten Ausführung (JSON-Format)
  error TEXT -- Fehlerdetails, falls vorhanden
);

-- Indizes für schnellere Abfragen
CREATE INDEX IF NOT EXISTS idx_tasks_status ON scheduled_tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_next_run ON scheduled_tasks(next_run);
CREATE INDEX IF NOT EXISTS idx_tasks_entity ON scheduled_tasks(entity_type, entity_id);

-- Posting-Pipeline für soziale Medien und Portale
CREATE TABLE IF NOT EXISTS post_pipeline_items (
  id TEXT PRIMARY KEY,
  pipeline_type TEXT NOT NULL, -- 'social_media', 'movido', etc.
  platform TEXT, -- 'linkedin', 'xing', 'facebook', etc.
  entity_type TEXT NOT NULL, -- 'job', 'profile', etc.
  entity_id TEXT NOT NULL, -- ID des zu veröffentlichenden Objekts
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'scheduled', 'posted', 'failed', 'cancelled'
  scheduled_for DATETIME,
  priority INTEGER DEFAULT 0, -- Höhere Zahlen = höhere Priorität
  content_template TEXT, -- Vorlage für den Inhalt des Posts
  content_params TEXT, -- Parameter für die Vorlage (JSON-Format)
  target_audience TEXT, -- Zielgruppe (JSON-Format)
  scheduled_task_id TEXT, -- Verknüpfung mit einer geplanten Aufgabe
  created_at DATETIME,
  updated_at DATETIME,
  posted_at DATETIME,
  result TEXT, -- Ergebnis des Postings (JSON-Format)
  error TEXT, -- Fehlerdetails, falls vorhanden
  FOREIGN KEY (scheduled_task_id) REFERENCES scheduled_tasks(id) ON DELETE SET NULL
);

-- Indizes für schnellere Abfragen
CREATE INDEX IF NOT EXISTS idx_pipeline_status ON post_pipeline_items(status);
CREATE INDEX IF NOT EXISTS idx_pipeline_scheduled ON post_pipeline_items(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_pipeline_entity ON post_pipeline_items(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_type_platform ON post_pipeline_items(pipeline_type, platform);

-- Pipeline-Einstellungen
CREATE TABLE IF NOT EXISTS pipeline_settings (
  id TEXT PRIMARY KEY,
  pipeline_type TEXT NOT NULL, -- 'social_media', 'movido', etc.
  platform TEXT, -- 'linkedin', 'xing', 'facebook', etc.
  daily_limit INTEGER DEFAULT 5, -- Maximale Anzahl an Posts pro Tag
  posting_hours TEXT, -- Bevorzugte Stunden für Posts (JSON-Array)
  posting_days TEXT, -- Bevorzugte Tage für Posts (JSON-Array)
  min_interval_minutes INTEGER DEFAULT 30, -- Mindestabstand zwischen Posts in Minuten
  enabled BOOLEAN DEFAULT 1,
  created_at DATETIME,
  updated_at DATETIME,
  config TEXT -- Zusätzliche Konfigurationsparameter (JSON-Format)
);

-- Synchronisations-Einstellungen
CREATE TABLE IF NOT EXISTS sync_settings (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL, -- 'job_portal', 'social_media', etc.
  entity_id TEXT NOT NULL, -- ID des zu synchronisierenden Portals oder der Plattform
  sync_interval_type TEXT NOT NULL, -- 'hourly', 'daily', 'weekly', 'custom'
  sync_interval_value INTEGER, -- z.B. alle X Stunden, Tage, etc.
  sync_interval_unit TEXT, -- 'minutes', 'hours', 'days'
  custom_schedule TEXT, -- Für komplexere Zeitpläne (JSON-Format)
  last_sync DATETIME,
  next_sync DATETIME,
  enabled BOOLEAN DEFAULT 1,
  created_at DATETIME,
  updated_at DATETIME,
  config TEXT -- Zusätzliche Konfigurationsparameter (JSON-Format)
);

-- Indizes für schnellere Abfragen
CREATE INDEX IF NOT EXISTS idx_sync_entity ON sync_settings(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_sync_next ON sync_settings(next_sync);

-- Protokollierung der Ausführung
CREATE TABLE IF NOT EXISTS scheduler_logs (
  id TEXT PRIMARY KEY,
  task_id TEXT,
  task_type TEXT NOT NULL,
  action TEXT NOT NULL, -- 'start', 'complete', 'fail', 'cancel', etc.
  status TEXT NOT NULL,
  details TEXT, -- Zusätzliche Details (JSON-Format)
  created_at DATETIME,
  FOREIGN KEY (task_id) REFERENCES scheduled_tasks(id) ON DELETE CASCADE
);

-- Indizes für schnellere Abfragen
CREATE INDEX IF NOT EXISTS idx_logs_task ON scheduler_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_logs_created ON scheduler_logs(created_at);
