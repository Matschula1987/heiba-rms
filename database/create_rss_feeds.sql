-- Tabelle für RSS-Feed-Quellen
CREATE TABLE IF NOT EXISTS rss_feed_sources (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
  name TEXT NOT NULL,                             -- Name des Feeds (z.B. "Bundesagentur für Arbeit - IT Jobs")
  url TEXT NOT NULL,                              -- URL des RSS-Feeds
  category TEXT,                                  -- Kategorie des Feeds (z.B. "IT", "Marketing", etc.)
  source_type TEXT NOT NULL,                      -- Art der Quelle (z.B. "arbeitsagentur", "github", "generic", etc.)
  format_template TEXT,                           -- Optional: JSON mit Format-Template für spezielle Feeds
  active BOOLEAN NOT NULL DEFAULT 1,              -- Ob der Feed aktiv ist
  update_interval INTEGER NOT NULL DEFAULT 60,    -- Aktualisierungsintervall in Minuten
  last_update TIMESTAMP,                          -- Zeitpunkt der letzten Aktualisierung
  error_count INTEGER NOT NULL DEFAULT 0,         -- Anzahl der Fehler bei der letzten Aktualisierung
  last_error TEXT,                                -- Letzte Fehlermeldung
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabelle für importierte Jobs aus RSS-Feeds
CREATE TABLE IF NOT EXISTS rss_imported_jobs (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
  feed_source_id TEXT NOT NULL,                   -- Referenz zur Feed-Quelle
  external_id TEXT NOT NULL,                      -- Externe ID/GUID aus dem Feed
  job_id TEXT,                                    -- Referenz zum importierten Job in der jobs-Tabelle
  title TEXT NOT NULL,                            -- Titel aus dem Feed
  description TEXT,                               -- Beschreibung aus dem Feed
  link TEXT,                                      -- Link zur Originalseite
  pub_date TIMESTAMP,                             -- Veröffentlichungsdatum im Feed
  import_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Datum des Imports
  raw_data TEXT,                                  -- Originaldaten als JSON oder XML
  status TEXT NOT NULL DEFAULT 'new',             -- Status des importierten Jobs (new, imported, error)
  FOREIGN KEY (feed_source_id) REFERENCES rss_feed_sources(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL,
  UNIQUE(feed_source_id, external_id)             -- Verhindert Duplikate
);

-- Tabelle für ausgehende RSS-Feed-Konfiguration
CREATE TABLE IF NOT EXISTS rss_outgoing_feed_config (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
  feed_title TEXT NOT NULL DEFAULT 'Stellenangebote',
  feed_description TEXT NOT NULL DEFAULT 'RSS-Feed mit Stellenangeboten',
  feed_language TEXT NOT NULL DEFAULT 'de',
  feed_copyright TEXT,
  feed_ttl INTEGER NOT NULL DEFAULT 60,           -- Time to Live in Minuten
  feed_image_url TEXT,                            -- URL zum Feed-Bild/Logo
  max_items INTEGER NOT NULL DEFAULT 50,          -- Maximale Anzahl der Elemente im Feed
  include_inactive_jobs BOOLEAN NOT NULL DEFAULT 0, -- Ob inaktive Jobs eingeschlossen werden sollen
  enabled BOOLEAN NOT NULL DEFAULT 0,             -- Ob der ausgehende Feed aktiviert ist
  access_token TEXT,                              -- Optionaler Zugriffsschutz/Token
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabelle für Kategorisierung von Jobs im ausgehenden Feed
CREATE TABLE IF NOT EXISTS rss_outgoing_feed_jobs (
  job_id TEXT NOT NULL,
  include_in_feed BOOLEAN NOT NULL DEFAULT 1,     -- Ob der Job im Feed enthalten sein soll
  category TEXT,                                  -- Kategorie für den Feed (optional)
  custom_description TEXT,                        -- Benutzerdefinierte Beschreibung für den Feed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (job_id),
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- Format-Templates für verschiedene RSS-Feed-Typen
CREATE TABLE IF NOT EXISTS rss_format_templates (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
  name TEXT NOT NULL,                             -- Name des Templates (z.B. "Arbeitsagentur", "GitHub", etc.)
  description TEXT,                               -- Beschreibung des Templates
  format_json TEXT NOT NULL,                      -- JSON mit Format-Mapping
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_rss_feed_sources_active ON rss_feed_sources(active);
CREATE INDEX IF NOT EXISTS idx_rss_feed_sources_source_type ON rss_feed_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_rss_imported_jobs_feed_source ON rss_imported_jobs(feed_source_id);
CREATE INDEX IF NOT EXISTS idx_rss_imported_jobs_status ON rss_imported_jobs(status);
CREATE INDEX IF NOT EXISTS idx_rss_imported_jobs_job_id ON rss_imported_jobs(job_id);
CREATE INDEX IF NOT EXISTS idx_rss_outgoing_feed_jobs_include ON rss_outgoing_feed_jobs(include_in_feed);
