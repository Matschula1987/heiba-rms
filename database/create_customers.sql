-- Kunden-Tabelle
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
  name TEXT NOT NULL,
  type TEXT CHECK(type IN ('customer', 'prospect')) NOT NULL,
  status TEXT CHECK(status IN ('active', 'inactive', 'prospect', 'former')) NOT NULL DEFAULT 'active',
  industry TEXT,
  website TEXT,
  address TEXT, -- JSON-Feld für Adressdaten
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Kontakte-Tabelle (Ansprechpartner bei Kunden)
CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
  customer_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  position TEXT,
  department TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  mobile TEXT,
  is_main_contact BOOLEAN DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE
);

-- Kontakthistorie-Tabelle
CREATE TABLE IF NOT EXISTS contact_history (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
  customer_id TEXT NOT NULL,
  contact_id TEXT,
  type TEXT CHECK(type IN ('phone', 'email', 'meeting', 'other')) NOT NULL,
  date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  subject TEXT,
  content TEXT NOT NULL,
  created_by TEXT NOT NULL,
  follow_up_date TIMESTAMP,
  follow_up_completed BOOLEAN DEFAULT 0,
  FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES contacts (id) ON DELETE SET NULL
);

-- Tabelle für Anhänge zur Kontakthistorie
CREATE TABLE IF NOT EXISTS contact_history_attachments (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
  contact_history_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contact_history_id) REFERENCES contact_history (id) ON DELETE CASCADE
);

-- Anforderungen-Tabelle
CREATE TABLE IF NOT EXISTS requirements (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
  customer_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  department TEXT,
  location TEXT,
  skills TEXT, -- JSON-Array mit Skills
  experience INTEGER, -- Erfahrung in Jahren
  education TEXT,
  status TEXT CHECK(status IN ('open', 'in_progress', 'filled', 'cancelled')) NOT NULL DEFAULT 'open',
  priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'urgent')) NOT NULL DEFAULT 'medium',
  start_date DATE,
  end_date DATE,
  is_remote BOOLEAN DEFAULT 0,
  assigned_to TEXT, -- Mitarbeiter-ID
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE
);

-- Tabelle für Gehaltsangaben zu Anforderungen
CREATE TABLE IF NOT EXISTS requirement_salary (
  requirement_id TEXT PRIMARY KEY,
  min_salary INTEGER,
  max_salary INTEGER,
  currency TEXT DEFAULT 'EUR',
  FOREIGN KEY (requirement_id) REFERENCES requirements (id) ON DELETE CASCADE
);

-- Tabelle für Matches zwischen Anforderungen und Kandidaten
CREATE TABLE IF NOT EXISTS requirement_candidate_matches (
  requirement_id TEXT NOT NULL,
  candidate_id TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  status TEXT CHECK(status IN ('new', 'contacted', 'rejected', 'accepted')) DEFAULT 'new',
  last_contact TIMESTAMP,
  PRIMARY KEY (requirement_id, candidate_id),
  FOREIGN KEY (requirement_id) REFERENCES requirements (id) ON DELETE CASCADE,
  FOREIGN KEY (candidate_id) REFERENCES candidates (id) ON DELETE CASCADE
);

-- Email-Templates-Tabelle
CREATE TABLE IF NOT EXISTS email_templates (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT CHECK(category IN ('candidate', 'customer', 'general')) NOT NULL,
  variables TEXT, -- JSON-Array mit verfügbaren Variablen
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT NOT NULL
);

-- Verzögerte E-Mails
CREATE TABLE IF NOT EXISTS delayed_emails (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
  recipient TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  scheduled_date TIMESTAMP NOT NULL,
  status TEXT CHECK(status IN ('pending', 'sent', 'failed', 'cancelled')) DEFAULT 'pending',
  related_entity_id TEXT,
  related_entity_type TEXT CHECK(related_entity_type IN ('candidate', 'customer') OR related_entity_type IS NULL),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT NOT NULL
);

-- Indizes
CREATE INDEX IF NOT EXISTS idx_customers_type ON customers (type);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers (status);
CREATE INDEX IF NOT EXISTS idx_contacts_customer_id ON contacts (customer_id);
CREATE INDEX IF NOT EXISTS idx_contacts_main ON contacts (customer_id, is_main_contact);
CREATE INDEX IF NOT EXISTS idx_contact_history_customer_id ON contact_history (customer_id);
CREATE INDEX IF NOT EXISTS idx_contact_history_date ON contact_history (date);
CREATE INDEX IF NOT EXISTS idx_requirements_customer_id ON requirements (customer_id);
CREATE INDEX IF NOT EXISTS idx_requirements_status ON requirements (status);
CREATE INDEX IF NOT EXISTS idx_requirements_priority ON requirements (priority);
CREATE INDEX IF NOT EXISTS idx_delayed_emails_status ON delayed_emails (status);
CREATE INDEX IF NOT EXISTS idx_delayed_emails_scheduled_date ON delayed_emails (scheduled_date);
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates (category);
