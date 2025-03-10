// Init-Skript für die erweiterte Bewerbungsverwaltung
// Dieses Skript erstellt die notwendigen Tabellen für die erweiterte Bewerbungsverwaltung
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
const schemaFilePath = path.join(__dirname, '../../database/create_applications_extended.sql');
const schemaSql = fs.readFileSync(schemaFilePath, 'utf8');

// Datenbank-Transaktion starten
db.serialize(() => {
  db.run('BEGIN TRANSACTION');

  console.log('Prüfe Datenbankstruktur...');
  
  // Prüfen ob die Tabelle bereits existiert
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='applications_extended'", (err, row) => {
    if (err) {
      console.error('Fehler beim Prüfen der Tabellen:', err.message);
      db.run('ROLLBACK');
      db.close();
      return;
    }
    
    if (row) {
      console.log('Tabelle applications_extended existiert bereits. Überspringe Schema-Erstellung.');
      
      // Schemastruktur anzeigen
      db.all("PRAGMA table_info(applications_extended)", (err, columns) => {
        if (err) {
          console.error('Fehler beim Lesen der Tabellenspalten:', err.message);
        } else {
          console.log('Spalten in applications_extended:');
          columns.forEach(col => {
            console.log(`- ${col.name} (${col.type})`);
          });
        }
        completeTransaction();
      });
      
      return;
    }
    
    console.log('Erstelle Tabellenschema für erweiterte Bewerbungsverwaltung...');
    
    // SQL-Skript für Tabellenerstellung ausführen
    const statements = schemaSql
      .split(');') // Trenne an Semikolons
      .filter(stmt => stmt.trim() !== '') // Leere Zeilen entfernen
      .map(stmt => stmt + ');'); // Semikolons wieder anhängen
      
    let currentIndex = 0;
    
    function executeNextStatement() {
      if (currentIndex >= statements.length) {
        console.log('Alle Schema-Statements wurden erfolgreich ausgeführt');
        completeTransaction();
        return;
      }
      
      const statement = statements[currentIndex];
      
      if (statement.trim().startsWith('--')) {
        // Kommentar überspringen
        currentIndex++;
        executeNextStatement();
        return;
      }
      
      db.run(statement, function(err) {
        if (err) {
          console.error(`Fehler bei Statement #${currentIndex + 1}:`, err.message);
          console.error('SQL:', statement);
          db.run('ROLLBACK');
          db.close();
          return;
        }
        
        console.log(`Statement #${currentIndex + 1} erfolgreich ausgeführt`);
        currentIndex++;
        executeNextStatement();
      });
    }
    
    executeNextStatement();
  });
  
  function completeTransaction() {
    // Transaktion abschließen
    db.run('COMMIT', (err) => {
      if (err) {
        console.error('Fehler beim Commit der Transaktion:', err.message);
        process.exit(1);
      }
      
      console.log('Datenbankstruktur erfolgreich aktualisiert');
      
      // Verbindung schließen
      db.close((err) => {
        if (err) {
          console.error('Fehler beim Schließen der Datenbank:', err.message);
          process.exit(1);
        }
        console.log('Datenbankverbindung geschlossen');
      });
    });
  }
});
