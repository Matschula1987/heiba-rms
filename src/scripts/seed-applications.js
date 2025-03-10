// Seed-Skript für Bewerbungen
// Dieses Skript lädt die Testdaten für erweiterte Bewerbungen in die Datenbank
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Datenbank öffnen
const db = new sqlite3.Database('./heiba.db', (err) => {
  if (err) {
    console.error('Fehler beim Öffnen der Datenbank:', err.message);
    process.exit(1);
  }
  console.log('Verbindung zur Datenbank hergestellt');
});

// SQL-Datei einlesen
const seedFilePath = path.join(__dirname, '../../database/seed_applications_extended.sql');
const sql = fs.readFileSync(seedFilePath, 'utf8');

// Datenbank-Transaktion starten
db.serialize(async () => {
  db.run('BEGIN TRANSACTION');

  // Prüfe ob die Tabellen existieren, bevor wir Daten löschen
  console.log('Prüfe Tabellen...');
  
  // Funktion um zu prüfen, ob eine Tabelle existiert
  const tableExists = (tableName) => {
    return new Promise((resolve) => {
      db.get(
        `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
        [tableName],
        (err, row) => {
          if (err || !row) {
            console.log(`Tabelle ${tableName} existiert nicht oder ist nicht zugänglich`);
            resolve(false);
          } else {
            console.log(`Tabelle ${tableName} existiert`);
            resolve(true);
          }
        }
      );
    });
  };

  // Tabellenstruktur prüfen
  const checkTableColumns = async (tableName) => {
    return new Promise((resolve) => {
      db.all(`PRAGMA table_info(${tableName})`, (err, columns) => {
        if (err) {
          console.error(`Fehler beim Prüfen der Spalten für ${tableName}:`, err.message);
          resolve([]);
        } else {
          const columnNames = columns.map(col => col.name);
          console.log(`Spalten in ${tableName}:`, columnNames.join(', '));
          resolve(columnNames);
        }
      });
    });
  };

  // Vorhandene Testdaten löschen
  console.log('Lösche vorhandene Testdaten...');
  
  const deleteTables = [
    { name: 'applications_extended', idColumn: 'id' }
  ];
  
  for (const table of deleteTables) {
    const exists = await tableExists(table.name);
    if (exists) {
      const columns = await checkTableColumns(table.name);
      
      // Lösche Daten basierend auf ID-Muster
      db.run(`DELETE FROM ${table.name} WHERE ${table.idColumn} LIKE 'app%'`, (err) => {
        if (err) {
          console.error(`Fehler beim Löschen von Daten aus ${table.name}:`, err.message);
        } else {
          console.log(`Daten aus ${table.name} gelöscht`);
        }
      });
    }
  }

  // Testdaten direkt einfügen
  console.log('Füge Testdaten ein...');
  
  // Neue Bewerbungen
  const applications = [
    // Neue Bewerbung: Frontend-Entwickler
    {
      id: 'app1',
      job_id: '1',
      applicant_name: 'Julia Meier',
      applicant_email: 'julia.meier@example.com',
      applicant_phone: '+4915123456789',
      applicant_location: 'Berlin',
      status: 'new',
      source: 'email',
      source_detail: 'bewerbungen@heiba.de',
      cover_letter: 'Sehr geehrte Damen und Herren,\n\nich bewerbe mich hiermit als Frontend-Entwicklerin in Ihrem Unternehmen. Mit 5 Jahren Erfahrung in der Webentwicklung und fundierten Kenntnissen in React, TypeScript und modernen CSS-Frameworks bin ich überzeugt, einen wertvollen Beitrag zu Ihrem Team leisten zu können.\n\nZu meinen Stärken zählen insbesondere:\n- Entwicklung komplexer, responsiver Benutzeroberflächen\n- Optimierung der Performance von Webanwendungen\n- Agile Arbeitsweise und Teamarbeit\n\nIch freue mich auf ein persönliches Gespräch.\n\nMit freundlichen Grüßen,\nJulia Meier',
      has_cv: 1,
      cv_file_path: '/uploads/resumes/julia_meier_cv.pdf',
      has_documents: 1,
      documents_paths: JSON.stringify(['uploads/documents/julia_meier_zertifikat1.pdf', 'uploads/documents/julia_meier_arbeitszeugnis.pdf']),
      match_score: 85.4,
      match_data: JSON.stringify({
        overallScore: 85.4, 
        categoryScores: {skills: 92, experience: 85, education: 80, location: 100}, 
        matchedSkills: [{skill: 'React', score: 95}, {skill: 'TypeScript', score: 90}, {skill: 'CSS', score: 85}, {skill: 'JavaScript', score: 95}]
      }),
      next_step: 'review_application',
      next_step_due_date: '2025-03-15 12:00:00',
      assigned_to: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },

    // Backend-Entwickler
    {
      id: 'app2',
      job_id: '2',
      applicant_name: 'Michael Schmidt',
      applicant_email: 'michael.schmidt@example.com',
      applicant_phone: '+4917987654321',
      applicant_location: 'München',
      status: 'new',
      source: 'portal',
      source_detail: 'Indeed',
      cover_letter: 'Als erfahrener Backend-Entwickler mit Schwerpunkt auf Java und Spring Boot möchte ich mich auf Ihre ausgeschriebene Position bewerben. In meiner 7-jährigen Berufserfahrung habe ich mehrere große Systeme entwickelt und gewartet.',
      has_cv: 1,
      cv_file_path: '/uploads/resumes/michael_schmidt_cv.pdf',
      has_documents: 0,
      match_score: 72.5,
      match_data: JSON.stringify({
        overallScore: 72.5, 
        categoryScores: {skills: 80, experience: 90, education: 65, location: 60}, 
        matchedSkills: [{skill: 'Java', score: 95}, {skill: 'Spring Boot', score: 90}, {skill: 'REST API', score: 85}, {skill: 'SQL', score: 80}]
      }),
      next_step: 'review_application',
      next_step_due_date: '2025-03-14 14:30:00',
      assigned_to: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },

    // DevOps Engineer
    {
      id: 'app3',
      job_id: '3',
      applicant_name: 'Sophie Weber',
      applicant_email: 'sophie.weber@example.com',
      applicant_phone: '+4917612345678',
      applicant_location: 'Hamburg',
      status: 'new', 
      source: 'website',
      source_detail: 'Karriereseite',
      cover_letter: 'Als DevOps-Ingenieurin mit umfangreicher Erfahrung in der Automatisierung von Infrastruktur und CI/CD-Pipelines bewerbe ich mich auf die ausgeschriebene Position. Ich verfüge über fundierte Kenntnisse in Docker, Kubernetes und verschiedenen Cloud-Plattformen.',
      has_cv: 1,
      cv_file_path: '/uploads/resumes/sophie_weber_cv.pdf',
      has_documents: 1,
      documents_paths: JSON.stringify(['uploads/documents/sophie_weber_zertifikate.pdf']),
      match_score: 91.2,
      match_data: JSON.stringify({
        overallScore: 91.2, 
        categoryScores: {skills: 95, experience: 90, education: 85, location: 90}, 
        matchedSkills: [{skill: 'Docker', score: 98}, {skill: 'Kubernetes', score: 95}, {skill: 'AWS', score: 90}, {skill: 'CI/CD', score: 95}]
      }),
      communication_history: JSON.stringify([{date: '2025-03-08T10:15:00Z', type: 'email', content: 'Automatische Eingangsbestätigung', sender: 'system'}]),
      next_step: 'review_application',
      next_step_due_date: '2025-03-13 09:00:00',
      assigned_to: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },

    // In Bearbeitung: Data Scientist
    {
      id: 'app4',
      job_id: '4',
      applicant_name: 'Daniel Müller',
      applicant_email: 'daniel.mueller@example.com',
      applicant_phone: '+4915712345678',
      applicant_location: 'Berlin',
      status: 'in_review',
      status_reason: 'Interessanter Kandidat mit starken analytischen Fähigkeiten',
      status_changed_at: '2025-03-05 15:30:00',
      status_changed_by: 'admin',
      source: 'referral',
      source_detail: 'Lisa Berger (Mitarbeiterin)',
      cover_letter: 'Als Data Scientist mit Erfahrung in der Analyse großer Datenmengen und maschinellem Lernen bewerbe ich mich für die ausgeschriebene Position. Ich bin vertraut mit Python, TensorFlow und SQL und habe bereits mehrere Projekte im Bereich Predictive Analytics umgesetzt.',
      has_cv: 1,
      cv_file_path: '/uploads/resumes/daniel_mueller_cv.pdf',
      has_documents: 1,
      documents_paths: JSON.stringify(['uploads/documents/daniel_mueller_zeugnisse.pdf', 'uploads/documents/daniel_mueller_projekte.pdf']),
      match_score: 88.7,
      match_data: JSON.stringify({
        overallScore: 88.7, 
        categoryScores: {skills: 90, experience: 85, education: 95, location: 100}, 
        matchedSkills: [{skill: 'Python', score: 95}, {skill: 'Machine Learning', score: 90}, {skill: 'SQL', score: 85}, {skill: 'Data Analysis', score: 90}]
      }),
      communication_history: JSON.stringify([
        {date: '2025-03-05T10:00:00Z', type: 'email', content: 'Automatische Eingangsbestätigung', sender: 'system'}, 
        {date: '2025-03-06T14:15:00Z', type: 'note', content: 'Kandidat wurde über die weitere Bearbeitung informiert', user: 'admin'}
      ]),
      next_step: 'schedule_interview',
      next_step_due_date: '2025-03-12 11:00:00',
      assigned_to: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },

    // Interview: Frontend-Entwickler
    {
      id: 'app5',
      job_id: '1',
      applicant_name: 'Laura Becker',
      applicant_email: 'laura.becker@example.com',
      applicant_phone: '+4917812345678',
      applicant_location: 'Frankfurt',
      status: 'interview',
      status_reason: 'Erster Interviewtermin vereinbart',
      status_changed_at: '2025-03-03 10:15:00',
      status_changed_by: 'admin',
      source: 'email',
      source_detail: 'bewerbungen@heiba.de',
      cover_letter: 'Als Frontend-Entwickler mit 6 Jahren Erfahrung und Spezialisierung auf React.js bewerbe ich mich auf die ausgeschriebene Position.',
      has_cv: 1,
      cv_file_path: '/uploads/resumes/laura_becker_cv.pdf',
      has_documents: 0,
      match_score: 78.9,
      match_data: JSON.stringify({
        overallScore: 78.9, 
        categoryScores: {skills: 85, experience: 75, education: 80, location: 70}, 
        matchedSkills: [{skill: 'React', score: 90}, {skill: 'UI/UX Design', score: 95}, {skill: 'CSS', score: 90}, {skill: 'HTML', score: 85}]
      }),
      communication_history: JSON.stringify([
        {date: '2025-03-01T14:00:00Z', type: 'email', content: 'Automatische Eingangsbestätigung', sender: 'system'}, 
        {date: '2025-03-02T11:30:00Z', type: 'email', content: 'Einladung zum ersten Gespräch', sender: 'admin'}, 
        {date: '2025-03-02T16:45:00Z', type: 'email', content: 'Terminbestätigung für den 15.03.2025', user: 'laura.becker@example.com'}
      ]),
      next_step: 'conduct_interview',
      next_step_due_date: '2025-03-15 14:00:00',
      assigned_to: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // Funktion zum Einfügen einer Bewerbung
  const insertApplication = (app, callback) => {
    const columns = Object.keys(app).join(', ');
    const placeholders = Object.keys(app).map(() => '?').join(', ');
    const values = Object.values(app);

    const query = `INSERT INTO applications_extended (${columns}) VALUES (${placeholders})`;
    
    db.run(query, values, function(err) {
      if (err) {
        console.error(`Fehler beim Einfügen der Bewerbung ${app.id}:`, err.message);
        console.error('SQL:', query);
        console.error('Werte:', values);
      } else {
        console.log(`Bewerbung ${app.id} erfolgreich eingefügt`);
      }
      
      if (callback) callback();
    });
  };

  // Einfügen aller Bewerbungen
  const insertAllApplications = (index = 0) => {
    if (index >= applications.length) {
      console.log(`Alle ${applications.length} Bewerbungen wurden eingefügt`);
      return;
    }
    
    insertApplication(applications[index], () => {
      insertAllApplications(index + 1);
    });
  };

  // Starte den Einfügungsprozess
  insertAllApplications();

  // Transaktion abschließen
  db.run('COMMIT', (err) => {
    if (err) {
      console.error('Fehler beim Commit der Transaktion:', err.message);
      process.exit(1);
    }
    console.log('Testdaten erfolgreich geladen');
    
    // Prüfen, wie viele Bewerbungen eingefügt wurden
    db.get('SELECT COUNT(*) as count FROM applications_extended', (err, row) => {
      if (err) {
        console.error('Fehler beim Zählen der Bewerbungen:', err.message);
      } else {
        console.log(`Anzahl der Bewerbungen in der Datenbank: ${row.count}`);
      }
      
      // Verbindung schließen
      db.close((err) => {
        if (err) {
          console.error('Fehler beim Schließen der Datenbank:', err.message);
          process.exit(1);
        }
        console.log('Datenbankverbindung geschlossen');
      });
    });
  });
});
