const Database = require('better-sqlite3');
const path = require('path');
const { testCandidates } = require('../src/data/testCandidates');

// Erstelle die Datenbankdatei im Projektverzeichnis
const db = new Database(path.join(__dirname, '..', 'heiba.db'));

try {
  // Aktiviere Foreign Keys
  db.pragma('foreign_keys = ON');

  // Erstelle die Tabellen
  db.exec(`
    CREATE TABLE IF NOT EXISTS candidates (
      id TEXT PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      mobile TEXT,
      date_of_birth TEXT,
      position TEXT NOT NULL,
      location TEXT NOT NULL,
      address TEXT NOT NULL,
      skills TEXT NOT NULL,
      experience INTEGER NOT NULL,
      education TEXT NOT NULL,
      salary_expectation INTEGER,
      status TEXT NOT NULL,
      source TEXT NOT NULL,
      application_date TEXT NOT NULL,
      documents TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Lösche vorhandene Testdaten
  db.exec('DELETE FROM candidates;');

  // Füge Testdaten ein
  const insertCandidate = db.prepare(`
    INSERT INTO candidates (
      id, first_name, last_name, email, phone, mobile, date_of_birth,
      position, location, address, skills, experience, education,
      salary_expectation, status, source, application_date,
      documents, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const candidate of testCandidates) {
    insertCandidate.run(
      candidate.id,
      candidate.firstName,
      candidate.lastName,
      candidate.email,
      candidate.phone || null,
      candidate.mobile || null,
      candidate.dateOfBirth || null,
      candidate.position,
      candidate.location,
      JSON.stringify(candidate.address),
      JSON.stringify(candidate.skills),
      candidate.experience,
      candidate.education,
      candidate.salaryExpectation || null,
      candidate.status,
      candidate.source,
      candidate.applicationDate,
      JSON.stringify(candidate.documents),
      candidate.createdAt,
      candidate.updatedAt
    );
  }

  console.log('Datenbank erfolgreich initialisiert!');
  console.log(testCandidates.length + ' Testkandidaten wurden eingefügt.');

  // Überprüfe die eingefügten Daten
  const count = db.prepare('SELECT COUNT(*) as count FROM candidates').get();
  console.log('Anzahl der Kandidaten in der Datenbank:', count.count);

  // Zeige die ersten paar Einträge zur Überprüfung
  const firstEntries = db.prepare('SELECT * FROM candidates LIMIT 3').all();
  console.log('Erste Einträge zur Überprüfung:', firstEntries);

} catch (error) {
  console.error('Fehler bei der Datenbankinitialisierung:', error);
  console.error('Details:', error.message);
} finally {
  db.close();
}