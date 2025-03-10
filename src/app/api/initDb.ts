import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import fs from 'fs';
import path from 'path';

// Cache für die DB-Initialisierung
let dbInitialized = false;

/**
 * Stellt sicher, dass die Datenbank initialisiert ist
 * Diese Funktion wird von den API-Routen aufgerufen
 */
export async function ensureDbInitializedForApi() {
  if (dbInitialized) {
    return; // Bereits initialisiert
  }
  
  try {
    const db = await getDb();
    
    // Lies alle SQL-Dateien im database-Verzeichnis
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
      } catch (error) {
        // Fehler ignorieren, wenn Tabelle bereits existiert
        console.warn(`Warnung bei ${sqlFile}: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
      }
    }
    
    dbInitialized = true;
  } catch (error) {
    console.error('Fehler bei der Initialisierung der Datenbank:', error);
    throw error;
  }
}

/**
 * Initialisiert die Datenbank mit allen Tabellen
 * Liest alle SQL-Dateien im database-Verzeichnis ein und führt sie aus
 */
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    
    // Lies alle SQL-Dateien im database-Verzeichnis
    const databaseDir = path.join(process.cwd(), 'database');
    const sqlFiles = fs.readdirSync(databaseDir)
      .filter(file => file.endsWith('.sql') && file.startsWith('create_'))
      .sort(); // Sortieren, damit Abhängigkeiten berücksichtigt werden
    
    const results: { [key: string]: string } = {};
    
    // Führe alle SQL-Dateien aus
    for (const sqlFile of sqlFiles) {
      const filePath = path.join(databaseDir, sqlFile);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      try {
        await db.exec(sql);
        results[sqlFile] = 'Erfolgreich ausgeführt';
      } catch (error) {
        results[sqlFile] = `Fehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`;
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Datenbank initialisiert',
      results
    });
  } catch (error) {
    console.error('Fehler bei der Initialisierung der Datenbank:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unbekannter Fehler'
    }, { status: 500 });
  }
}
