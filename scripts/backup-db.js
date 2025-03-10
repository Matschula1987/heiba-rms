/**
 * Backup-Skript für die SQLite-Datenbank
 * Kann als geplanter Job auf Render.com ausgeführt werden
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Konfiguration
const DB_PATH = process.env.NODE_ENV === 'production' 
  ? '/data/heiba.db'
  : './heiba.db';

// Backup-Verzeichnis erstellen, falls es nicht existiert
const BACKUP_DIR = process.env.NODE_ENV === 'production' 
  ? '/data/backups'
  : './backups';

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`Backup-Verzeichnis erstellt: ${BACKUP_DIR}`);
}

// Timestamp für den Dateinamen generieren
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFileName = `heiba-backup-${timestamp}.db`;
const backupFilePath = path.join(BACKUP_DIR, backupFileName);

// Prüfen, ob die Datenbank existiert
if (!fs.existsSync(DB_PATH)) {
  console.error(`Fehler: Datenbank existiert nicht am Pfad: ${DB_PATH}`);
  process.exit(1);
}

// In Produktionsumgebung nutzen wir die SQLite-CLI für ein sicheres Backup
if (process.env.NODE_ENV === 'production') {
  // Zeitpunkt des Backups in einer Logdatei speichern
  fs.appendFileSync(path.join(BACKUP_DIR, 'backup-log.txt'), 
    `${new Date().toISOString()} - Backup gestartet: ${backupFileName}\n`);
  
  // SQLite-Befehl ausführen, um die Datenbank zu sichern (falls sqlite3 installiert ist)
  exec(`sqlite3 ${DB_PATH} ".backup '${backupFilePath}'"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Fehler beim SQLite-Backup: ${error.message}`);
      // Fallback: Datei kopieren
      try {
        fs.copyFileSync(DB_PATH, backupFilePath);
        console.log(`Backup erfolgreich erstellt: ${backupFilePath} (Fallback-Methode)`);
        // Log-Eintrag aktualisieren
        fs.appendFileSync(path.join(BACKUP_DIR, 'backup-log.txt'), 
          `${new Date().toISOString()} - Backup abgeschlossen (Fallback): ${backupFileName}\n`);
      } catch (copyError) {
        console.error(`Fehler beim Kopieren der Datenbank: ${copyError.message}`);
        fs.appendFileSync(path.join(BACKUP_DIR, 'backup-log.txt'), 
          `${new Date().toISOString()} - Backup fehlgeschlagen: ${error.message}, ${copyError.message}\n`);
        process.exit(1);
      }
    } else {
      console.log(`Backup erfolgreich erstellt: ${backupFilePath}`);
      // Log-Eintrag aktualisieren
      fs.appendFileSync(path.join(BACKUP_DIR, 'backup-log.txt'), 
        `${new Date().toISOString()} - Backup abgeschlossen: ${backupFileName}\n`);
    }
  });
} else {
  // Entwicklungsumgebung: Einfach die Datei kopieren
  try {
    fs.copyFileSync(DB_PATH, backupFilePath);
    console.log(`Backup erfolgreich erstellt: ${backupFilePath}`);
  } catch (error) {
    console.error(`Fehler beim Kopieren der Datenbank: ${error.message}`);
    process.exit(1);
  }
}

// Alte Backups aufräumen (optional) - behalte nur die letzten 10
const backupFiles = fs.readdirSync(BACKUP_DIR)
  .filter(file => file.startsWith('heiba-backup-') && file.endsWith('.db'))
  .sort((a, b) => b.localeCompare(a)); // In umgekehrter Reihenfolge sortieren (neueste zuerst)

if (backupFiles.length > 10) {
  const filesToDelete = backupFiles.slice(10);
  filesToDelete.forEach(file => {
    const filePath = path.join(BACKUP_DIR, file);
    fs.unlinkSync(filePath);
    console.log(`Altes Backup gelöscht: ${filePath}`);
  });
}

console.log('Backup-Vorgang abgeschlossen.');
