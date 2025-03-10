import { getDb } from './db';
import fs from 'fs';
import path from 'path';

/**
 * Diese Funktion führt das SQL-Migrations-Skript für die erweiterte Jobs-Funktionalität aus
 */
export async function migrateJobsSchema() {
  const db = await getDb();
  
  try {
    // Prüfe, ob die Migration bereits durchgeführt wurde
    const rich_description_exists = await db.get(`
      SELECT name FROM pragma_table_info('jobs') WHERE name='rich_description'
    `);
    
    if (rich_description_exists) {
      console.log('Jobs-Migration scheint bereits durchgeführt zu sein.');
      return;
    }
    
    // Lese und führe die SQL-Datei aus
    const migrationsPath = path.join(process.cwd(), 'database', 'migrate_jobs_table.sql');
    
    if (!fs.existsSync(migrationsPath)) {
      console.error('Migrations-Datei nicht gefunden:', migrationsPath);
      return;
    }
    
    const migrationsSql = fs.readFileSync(migrationsPath, 'utf8');
    
    // Teile das SQL in einzelne Statements auf und führe sie sequentiell aus
    const statements = migrationsSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`Führe ${statements.length} SQL-Statements für die Jobs-Migration aus...`);
    
    // Führe jedes Statement einzeln aus
    for (const statement of statements) {
      try {
        await db.exec(statement + ';');
      } catch (error: any) {
        // Ignoriere Fehler, wenn die Spalte oder Tabelle bereits existiert
        if (!error.message?.includes('duplicate column name') && 
            !error.message?.includes('table already exists')) {
          console.error('Fehler beim Ausführen von SQL:', error);
          console.error('Statement:', statement);
          throw error;
        }
      }
    }
    
    console.log('Jobs-Migration erfolgreich abgeschlossen.');
  } catch (error) {
    console.error('Fehler bei der Jobs-Migration:', error);
    throw error;
  }
}

/**
 * Prüfe, ob die erweiterten Job-Tabellen existieren
 */
export async function checkJobTablesExist() {
  const db = await getDb();
  
  try {
    const requiredTables = [
      'jobs', 
      'job_templates', 
      'job_postings', 
      'job_social_posts', 
      'job_edit_history',
      'job_applications',
      'job_ab_tests'
    ];
    
    for (const tableName of requiredTables) {
      const tableExists = await db.get(`
        SELECT name 
        FROM sqlite_master 
        WHERE type='table' AND name=?
      `, [tableName]);
      
      if (!tableExists) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Fehler beim Prüfen der Job-Tabellen:', error);
    return false;
  }
}
