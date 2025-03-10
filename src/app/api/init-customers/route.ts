import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDb();
    
    // Überprüfen, ob die customers-Tabelle bereits existiert
    const tableExists = await db.get(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='customers'
    `);
    
    if (tableExists) {
      return NextResponse.json({ message: 'Kunden-Tabellen existieren bereits' });
    }
    
    // Kunden-Tabellen erstellen
    await db.exec(`
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
      
      -- Indizes für Kunden-Tabellen
      CREATE INDEX IF NOT EXISTS idx_customers_type ON customers (type);
      CREATE INDEX IF NOT EXISTS idx_customers_status ON customers (status);
      CREATE INDEX IF NOT EXISTS idx_contacts_customer_id ON contacts (customer_id);
      CREATE INDEX IF NOT EXISTS idx_contacts_main ON contacts (customer_id, is_main_contact);
      CREATE INDEX IF NOT EXISTS idx_contact_history_customer_id ON contact_history (customer_id);
      CREATE INDEX IF NOT EXISTS idx_contact_history_date ON contact_history (date);
      CREATE INDEX IF NOT EXISTS idx_requirements_customer_id ON requirements (customer_id);
      CREATE INDEX IF NOT EXISTS idx_requirements_status ON requirements (status);
    `);
    
    // Füge ein paar Beispieldaten hinzu
    await db.exec(`
      INSERT INTO customers (id, name, type, status, industry, website, notes)
      VALUES 
        ('cust1', 'TechSolutions GmbH', 'customer', 'active', 'IT & Software', 'https://techsolutions.de', 'Großer Kunde mit vielen Stellenanfragen'),
        ('cust2', 'Mustermann AG', 'customer', 'active', 'Fertigung', 'https://mustermann-ag.de', 'Langjähriger Kunde aus dem Fertigungsbereich'),
        ('cust3', 'Innovate Startup', 'prospect', 'prospect', 'Technologie', 'https://innovate-startup.de', 'Vielversprechender Kontakt aus Tech-Branche');
    `);
    
    await db.exec(`
      INSERT INTO contacts (id, customer_id, first_name, last_name, position, department, email, phone, is_main_contact)
      VALUES
        ('cont1', 'cust1', 'Max', 'Müller', 'HR Manager', 'Personal', 'max.mueller@techsolutions.de', '+49123456789', 1),
        ('cont2', 'cust1', 'Laura', 'Schmidt', 'CEO', 'Geschäftsführung', 'l.schmidt@techsolutions.de', '+49987654321', 0),
        ('cont3', 'cust2', 'Thomas', 'Weber', 'Personalleiter', 'HR', 'weber@mustermann-ag.de', '+4955557777', 1),
        ('cont4', 'cust3', 'Sarah', 'Fischer', 'Gründerin', 'Management', 'sarah@innovate-startup.de', '+49111222333', 1);
    `);

    return NextResponse.json({ message: 'Kunden-Tabellen erfolgreich erstellt' });
  } catch (error: any) {
    console.error('Fehler bei der Initialisierung der Kunden-Tabellen:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
