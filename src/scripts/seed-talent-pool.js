// Seed-Skript für Talent-Pool
// Dieses Skript lädt Testdaten für den Talent-Pool in die Datenbank
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

// Hauptfunktion
async function seedTalentPool() {
  try {
    db.run('BEGIN TRANSACTION');

    // Prüfe ob die Tabellen existieren, bevor wir Daten löschen
    console.log('Prüfe Talent-Pool-Tabellen...');
    
    // Prüfen, ob die Talent-Pool-Tabellen existieren
    const tablesExist = {
      talentPool: await tableExists('talent_pool'),
      talentPoolNotes: await tableExists('talent_pool_notes'),
      talentPoolActivities: await tableExists('talent_pool_activities'),
      talentPoolJobMatches: await tableExists('talent_pool_job_matches'),
    };

    // Wenn Tabellen nicht existieren, erstelle sie
    if (!tablesExist.talentPool || !tablesExist.talentPoolNotes || 
        !tablesExist.talentPoolActivities || !tablesExist.talentPoolJobMatches) {
      console.log('Talent-Pool-Tabellen fehlen. Initialisiere Talent-Pool-Tabellen...');
      await initializeTables();
    }

    // Löschen vorhandener Testdaten
    await clearTestData();

    // Testdaten definieren
    // Talent-Pool-Einträge
    const talentPoolEntries = [
      {
        id: 'tp1',
        entity_id: 'app10',
        entity_type: 'application',
        added_date: '2025-02-15 14:30:00',
        added_by: 'admin',
        reason: 'Gute Fähigkeiten, aber nicht genug Erfahrung für die aktuelle Position. Potenzial für zukünftige Stellen.',
        notes: 'Bewerber hat starke React-Kenntnisse, aber erst 2 Jahre Berufserfahrung. Für Junior-Positionen interessant.',
        last_contacted: '2025-02-20 11:15:00',
        rating: 4,
        tags: JSON.stringify(['Frontend', 'React', 'Junior', 'Berlin']),
        skills_snapshot: JSON.stringify({
          'React': 'fortgeschritten',
          'JavaScript': 'fortgeschritten',
          'CSS': 'fortgeschritten'
        }),
        experience_snapshot: JSON.stringify([
          {
            'title': 'Junior Frontend-Entwickler',
            'company': 'Digital Solutions GmbH',
            'location': 'Berlin',
            'start_date': '2023-03',
            'end_date': '2025-02',
            'description': 'Entwicklung von Webanwendungen mit React'
          }
        ]),
        status: 'active',
        reminder_date: '2025-06-15 09:00:00'
      },
      {
        id: 'tp2',
        entity_id: 'cand15',
        entity_type: 'candidate',
        added_date: '2025-01-20 09:45:00',
        added_by: 'admin',
        reason: 'Über LinkedIn-Netzwerk identifiziert. Erfahrener Backend-Entwickler mit Java-Expertise.',
        notes: 'Ist aktuell nicht aktiv auf der Suche, aber offen für interessante Projekte. Bevorzugt Remote-Arbeit.',
        last_contacted: '2025-03-01 15:30:00',
        rating: 5,
        tags: JSON.stringify(['Backend', 'Java', 'Spring', 'Senior', 'Remote']),
        skills_snapshot: JSON.stringify({
          'Java': 'experte',
          'Spring Boot': 'experte'
        }),
        experience_snapshot: JSON.stringify([
          {
            'title': 'Senior Backend-Entwickler',
            'company': 'Enterprise Solutions AG',
            'location': 'München',
            'start_date': '2020-05',
            'end_date': null,
            'description': 'Entwicklung skalierbarer Microservices'
          }
        ]),
        status: 'active',
        reminder_date: '2025-05-01 10:00:00'
      }
    ];

    // Talent-Pool-Notizen
    const talentPoolNotes = [
      {
        talent_pool_id: 'tp1',
        created_by: 'admin',
        created_at: '2025-02-15 14:35:00',
        content: 'Bewerber hat sich auf die Senior Frontend-Entwickler-Stelle beworben, aber zu wenig Erfahrung. Potenzial für Junior-Positionen.',
        note_type: 'general'
      },
      {
        talent_pool_id: 'tp1',
        created_by: 'admin',
        created_at: '2025-02-20 11:20:00',
        content: 'Telefonat geführt. Bewerber ist interessiert, in unserem Talent-Pool zu bleiben.',
        note_type: 'contact'
      },
      {
        talent_pool_id: 'tp2',
        created_by: 'admin',
        created_at: '2025-01-20 09:50:00',
        content: 'Über LinkedIn gefunden. Profil zeigt umfangreiche Erfahrung mit Java und Spring-Ökosystem.',
        note_type: 'general'
      }
    ];

    // Talent-Pool-Aktivitäten
    const talentPoolActivities = [
      {
        talent_pool_id: 'tp1',
        activity_type: 'added_to_pool',
        activity_data: JSON.stringify({source: 'application', reason: 'potential_future_fit'}),
        created_by: 'admin',
        created_at: '2025-02-15 14:30:00'
      },
      {
        talent_pool_id: 'tp1',
        activity_type: 'contacted',
        activity_data: JSON.stringify({method: 'phone', purpose: 'initial_contact'}),
        created_by: 'admin',
        created_at: '2025-02-20 11:15:00'
      },
      {
        talent_pool_id: 'tp2',
        activity_type: 'added_to_pool',
        activity_data: JSON.stringify({source: 'linkedin', reason: 'promising_profile'}),
        created_by: 'admin',
        created_at: '2025-01-20 09:45:00'
      }
    ];

    // Talent-Pool-Job-Matches
    const talentPoolJobMatches = [
      {
        id: 'tpm1',
        talent_pool_id: 'tp1',
        job_id: '5', // Junior Frontend-Entwickler
        match_score: 87.5,
        created_at: '2025-03-01 08:00:00',
        last_updated: '2025-03-01 08:00:00',
        match_details: JSON.stringify({
          overall_score: 87.5,
          skills_score: 90,
          experience_score: 82,
          location_score: 100,
          matched_skills: [
            {skill: 'React', weight: 5, score: 95},
            {skill: 'JavaScript', weight: 4, score: 90}
          ]
        }),
        status: 'new'
      },
      {
        id: 'tpm2',
        talent_pool_id: 'tp2',
        job_id: '2', // Backend-Entwickler
        match_score: 91.4,
        created_at: '2025-03-01 08:00:00',
        last_updated: '2025-03-01 08:00:00',
        match_details: JSON.stringify({
          overall_score: 91.4,
          skills_score: 95,
          experience_score: 90,
          location_score: 80,
          matched_skills: [
            {skill: 'Java', weight: 5, score: 98},
            {skill: 'Spring Boot', weight: 5, score: 95}
          ]
        }),
        status: 'contacted'
      }
    ];

    // Daten einfügen
    console.log('Füge Talent-Pool-Testdaten ein...');
    await insertData('talent_pool', talentPoolEntries);
    await insertData('talent_pool_notes', talentPoolNotes);
    await insertData('talent_pool_activities', talentPoolActivities);
    await insertData('talent_pool_job_matches', talentPoolJobMatches);

    // Transaktion abschließen
    db.run('COMMIT', (err) => {
      if (err) {
        console.error('Fehler beim Commit der Transaktion:', err.message);
        db.run('ROLLBACK');
      } else {
        console.log('Talent-Pool-Testdaten wurden erfolgreich eingefügt');
      }
      
      // Verbindung schließen
      db.close((err) => {
        if (err) {
          console.error('Fehler beim Schließen der Datenbankverbindung:', err.message);
        } else {
          console.log('Datenbankverbindung geschlossen');
        }
      });
    });
  } catch (error) {
    console.error('Fehler beim Seeden des Talent-Pools:', error);
    db.run('ROLLBACK');
    db.close();
  }
}

// Hilfsfunktionen
// Funktion zum Prüfen, ob eine Tabelle existiert
function tableExists(tableName) {
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
}

// Funktion zum Initialisieren der Tabellen
async function initializeTables() {
  // SQL-Datei einlesen
  const sqlFilePath = path.join(__dirname, '../../database/create_talent_pool.sql');
  const sql = fs.readFileSync(sqlFilePath, 'utf8');
  
  // Führe SQL-Anweisungen aus
  const statements = sql
    .split(';')
    .filter(statement => statement.trim().length > 0);
  
  for (const statement of statements) {
    await new Promise((resolve, reject) => {
      db.run(statement + ';', (err) => {
        if (err) {
          console.error('Fehler beim Ausführen von SQL:', err.message);
          console.error('SQL:', statement);
          reject(err);
        } else {
          resolve();
        }
      });
    }).catch(err => {
      console.error('Fehler beim Initialisieren der Talent-Pool-Tabellen:', err);
    });
  }
  
  console.log('Talent-Pool-Tabellen wurden initialisiert');
}

// Funktion zum Löschen vorhandener Testdaten
async function clearTestData() {
  console.log('Lösche vorhandene Talent-Pool-Testdaten...');
  
  // Löschen in umgekehrter Reihenfolge der Abhängigkeiten
  const tables = [
    'talent_pool_job_matches',
    'talent_pool_activities',
    'talent_pool_notes',
    'talent_pool'
  ];
  
  for (const table of tables) {
    await new Promise((resolve, reject) => {
      db.run(`DELETE FROM ${table} WHERE ${table === 'talent_pool_job_matches' ? 'talent_pool_id' : 'id'} LIKE 'tp%'`, (err) => {
        if (err) {
          console.error(`Fehler beim Löschen von Daten aus ${table}:`, err.message);
          resolve(false); // Weiter machen, auch wenn ein Fehler auftritt
        } else {
          console.log(`Daten aus ${table} gelöscht`);
          resolve(true);
        }
      });
    });
  }
}

// Funktion zum Einfügen von Daten
function insertData(tableName, data) {
  return new Promise((resolve, reject) => {
    const promises = data.map(item => {
      return new Promise((resolveItem, rejectItem) => {
        const columns = Object.keys(item).join(', ');
        const placeholders = Object.keys(item).map(() => '?').join(', ');
        const values = Object.values(item);

        const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
        
        db.run(query, values, function(err) {
          if (err) {
            console.error(`Fehler beim Einfügen in ${tableName}:`, err.message);
            console.error('Daten:', JSON.stringify(item));
            rejectItem(err);
          } else {
            console.log(`Eintrag in ${tableName} eingefügt, ID: ${this.lastID}`);
            resolveItem();
          }
        });
      });
    });

    Promise.all(promises)
      .then(() => {
        console.log(`Alle Datensätze wurden in ${tableName} eingefügt`);
        resolve();
      })
      .catch(err => {
        console.error(`Fehler beim Einfügen der Datensätze in ${tableName}:`, err);
        reject(err);
      });
  });
}

// Skript ausführen
seedTalentPool();
