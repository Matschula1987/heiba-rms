-- Aktualisierung der Users-Tabelle für erweiterte Benutzerverwaltung
-- Hinzufügen von customer_id als Fremdschlüssel und permissions

-- 1. Hinzufügen des customer_id Felds zur users-Tabelle
ALTER TABLE users ADD COLUMN customer_id INTEGER REFERENCES customers(id);
ALTER TABLE users ADD COLUMN last_login TIMESTAMP;
ALTER TABLE users ADD COLUMN active BOOLEAN DEFAULT 1;
ALTER TABLE users ADD COLUMN permissions TEXT DEFAULT '{}';

-- 2. Erstellung der Tabelle für Benutzerrollen
CREATE TABLE IF NOT EXISTS user_roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    permissions TEXT NOT NULL DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Hinzufügen des role_id Felds zur Tabelle users
ALTER TABLE users ADD COLUMN role_id INTEGER REFERENCES user_roles(id);

-- 4. Erstellung der Standardrollen
INSERT INTO user_roles (name, description, permissions) VALUES 
('system_admin', 'Systemadministrator mit vollen Berechtigungen', '{"all": true}'),
('customer_admin', 'Kundenadministrator mit Berechtigungen zur Verwaltung des eigenen Kundenbereichs', '{"manage_users": true, "manage_settings": true, "manage_jobs": true, "manage_applications": true}'),
('recruiter', 'Recruiter mit Berechtigungen zur Verwaltung von Jobs und Bewerbungen', '{"manage_jobs": true, "manage_applications": true}'),
('viewer', 'Nur-Lese-Benutzer mit eingeschränktem Zugriff', '{"view_jobs": true, "view_applications": true}');

-- 5. Logging-Tabelle für Benutzeraktivitäten
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    action TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
