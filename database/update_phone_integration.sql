-- Erweiterung der Telefonintegration um Kundenanforderungen und Kunden

-- Anrufprotokolle um Kundenanforderungen und Kunden erweitern
ALTER TABLE call_logs ADD COLUMN requirement_id TEXT;
ALTER TABLE call_logs ADD COLUMN customer_id TEXT;

-- Foreign Keys für neue Spalten hinzufügen
-- Die FOREIGN KEYs nutzen "REFERENCES requirements(id)" und "REFERENCES customers(id)",
-- basierend auf der Annahme, dass diese Tabellen existieren
ALTER TABLE call_logs ADD FOREIGN KEY (requirement_id) REFERENCES requirements(id) ON DELETE SET NULL;
ALTER TABLE call_logs ADD FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;

-- Indexe für neue Spalten für bessere Performance
CREATE INDEX IF NOT EXISTS idx_call_logs_requirement ON call_logs(requirement_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_customer ON call_logs(customer_id);

-- Click-to-Call Zuweisungen um Kundenanforderungen und Kunden erweitern
ALTER TABLE click_to_call_assignments ADD COLUMN requirement_id TEXT;
ALTER TABLE click_to_call_assignments ADD COLUMN customer_id TEXT;

-- Foreign Keys für neue Spalten hinzufügen
ALTER TABLE click_to_call_assignments ADD FOREIGN KEY (requirement_id) REFERENCES requirements(id) ON DELETE SET NULL;
ALTER TABLE click_to_call_assignments ADD FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;

-- Indexe für neue Spalten für bessere Performance
CREATE INDEX IF NOT EXISTS idx_click_to_call_requirement ON click_to_call_assignments(requirement_id);
CREATE INDEX IF NOT EXISTS idx_click_to_call_customer ON click_to_call_assignments(customer_id);
