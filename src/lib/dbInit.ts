import { getDb } from './db';
import fs from 'fs';
import path from 'path';

// Cache für die DB-Initialisierung
let dbInitialized = false;

/**
 * Stellt sicher, dass die Datenbank initialisiert ist
 * Diese Funktion wird vom Layout beim Start der Anwendung aufgerufen
 */
export async function ensureDbInitialized() {
  if (dbInitialized) {
    return true; // Bereits initialisiert
  }
  
  const result = await initializeDatabase();
  
  if (result) {
    dbInitialized = true;
  }
  
  return result;
}

/**
 * Initialisiert die Datenbank mit allen Tabellen
 * Diese Funktion sollte beim Starten der Anwendung aufgerufen werden.
 */
export async function initializeDatabase() {
  try {
    const db = await getDb();
    
    // Lese alle SQL-Dateien im database-Verzeichnis
    const databaseDir = path.join(process.cwd(), 'database');
    const sqlFiles = fs.readdirSync(databaseDir)
      .filter(file => file.endsWith('.sql') && file.startsWith('create_'))
      .sort(); // Sortieren, damit Abhängigkeiten berücksichtigt werden
    
    // Führe alle SQL-Dateien aus
    for (const sqlFile of sqlFiles) {
      const filePath = path.join(databaseDir, sqlFile);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      try {
        await db.exec(sql);
        console.log(`SQL-Datei ausgeführt: ${sqlFile}`);
      } catch (error) {
        // Fehler ignorieren, wenn Tabelle bereits existiert
        console.warn(`Warnung bei ${sqlFile}: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Fehler bei der Initialisierung der Datenbank:', error);
    return false;
  }
}

/**
 * Führt ein SQL-Skript auf der Datenbank aus.
 * 
 * @param sqlFilePath Pfad zur SQL-Datei (relativ zum Projekt-Root)
 * @returns true bei Erfolg, false bei Fehler
 */
export async function executeSqlFile(sqlFilePath: string): Promise<boolean> {
  try {
    const db = await getDb();
    const filePath = path.join(process.cwd(), sqlFilePath);
    
    if (!fs.existsSync(filePath)) {
      console.error(`SQL-Datei nicht gefunden: ${filePath}`);
      return false;
    }
    
    const sql = fs.readFileSync(filePath, 'utf8');
    
    await db.exec(sql);
    console.log(`SQL-Datei ausgeführt: ${sqlFilePath}`);
    
    return true;
  } catch (error) {
    console.error(`Fehler beim Ausführen der SQL-Datei ${sqlFilePath}:`, error);
    return false;
  }
}

/**
 * Initialisiert den Scheduler in der Datenbank
 * Diese Funktion wird aufgerufen, wenn die Scheduler-Funktionalität benötigt wird.
 */
export async function initializeScheduler(): Promise<boolean> {
  try {
    return await executeSqlFile('database/create_scheduler_system.sql');
  } catch (error) {
    console.error('Fehler bei der Initialisierung des Schedulers:', error);
    return false;
  }
}
