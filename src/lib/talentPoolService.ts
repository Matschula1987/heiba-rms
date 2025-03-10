import { getDb } from './db';
import { 
  TalentPoolEntry, 
  TalentPoolEntryExtended,
  TalentPoolNote, 
  TalentPoolActivity,
  TalentPoolJobMatch,
  TalentPoolFilter,
  CreateTalentPoolEntryParams,
  UpdateTalentPoolEntryParams,
  AddTalentPoolNoteParams,
  TalentPoolStatus,
  TalentPoolEntityType
} from '@/types/talentPool';
import { Candidate } from '@/types';
import { ApplicationExtended } from '@/types/applications';
import { Job } from '@/types/jobs';
import { ensureDbInitialized } from './dbInit';

/**
 * Service-Klasse für Talent-Pool-Funktionalitäten
 */
export class TalentPoolService {
  /**
   * Prüft, ob die Talent-Pool-Tabellen bereits existieren
   */
  public static async checkTablesExist(): Promise<boolean> {
    const db = await getDb();
    
    try {
      const result = await db.get(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='talent_pool'
      `);
      
      return !!result;
    } catch (error) {
      console.error('Fehler bei der Überprüfung der Talent-Pool-Tabellen:', error);
      return false;
    }
  }
  
  /**
   * Initialisiert die Talent-Pool-Tabellen in der Datenbank
   */
  public static async initTalentPoolTables(): Promise<boolean> {
    try {
      const exists = await this.checkTablesExist();
      
      if (exists) {
        return true;
      }
      
      // Stellen sicher, dass die Haupttabellen (jobs, candidates, applications) existieren
      await ensureDbInitialized();
      
      // SQL für die Talent-Pool-Tabellen laden und ausführen
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const sqlFile = await fs.readFile(
        path.join(process.cwd(), 'database', 'create_talent_pool.sql'),
        'utf-8'
      );
      
      const db = await getDb();
      
      // Führe alle SQL-Anweisungen aus
      const statements = sqlFile
        .split(';')
        .filter(statement => statement.trim().length > 0);
      
      for (const statement of statements) {
        await db.exec(statement + ';');
      }
      
      return true;
    } catch (error) {
      console.error('Fehler bei der Initialisierung der Talent-Pool-Tabellen:', error);
      return false;
    }
  }
  
  /**
   * Fügt einen neuen Eintrag zum Talent-Pool hinzu
   * @param params Parameter für den neuen Eintrag
   */
  public static async addToTalentPool(
    params: CreateTalentPoolEntryParams
  ): Promise<TalentPoolEntry | null> {
    const db = await getDb();
    
    try {
      // Prüfen, ob die Entität existiert
      let entityExists = false;
      
      if (params.entity_type === 'candidate') {
        const candidate = await db.get(
          'SELECT id FROM candidates WHERE id = ?',
          [params.entity_id]
        );
        entityExists = !!candidate;
      } else if (params.entity_type === 'application') {
        const application = await db.get(
          'SELECT id FROM applications WHERE id = ?',
          [params.entity_id]
        );
        entityExists = !!application;
      }
      
      if (!entityExists) {
        throw new Error(`${params.entity_type} mit ID ${params.entity_id} nicht gefunden`);
      }
      
      // Prüfen, ob der Eintrag bereits im Talent-Pool existiert
      const existingEntry = await db.get(
        'SELECT id FROM talent_pool WHERE entity_id = ? AND entity_type = ?',
        [params.entity_id, params.entity_type]
      );
      
      if (existingEntry) {
        throw new Error(`${params.entity_type} ist bereits im Talent-Pool`);
      }
      
      // Skills und Erfahrungen abrufen für den Snapshot
      let skills = null;
      let experience = null;
      
      if (params.entity_type === 'candidate') {
        const candidate = await db.get(
          'SELECT skills, experience FROM candidates WHERE id = ?',
          [params.entity_id]
        );
        
        if (candidate) {
          skills = candidate.skills;
          experience = candidate.experience;
        }
      } else if (params.entity_type === 'application') {
        const application = await db.get(
          'SELECT skills, experience FROM applications WHERE id = ?',
          [params.entity_id]
        );
        
        if (application) {
          skills = application.skills;
          experience = application.experience;
        }
      }
      
      // Tags als JSON-String formatieren
      const tags = params.tags ? JSON.stringify(params.tags) : null;
      
      // Eintrag in die Talent-Pool-Tabelle einfügen
      const result = await db.run(
        `INSERT INTO talent_pool (
          entity_id, 
          entity_type, 
          added_by, 
          reason, 
          notes, 
          rating, 
          tags, 
          skills_snapshot, 
          experience_snapshot, 
          status, 
          reminder_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          params.entity_id,
          params.entity_type,
          params.added_by || null,
          params.reason || null,
          params.notes || null,
          params.rating || null,
          tags,
          skills,
          experience,
          params.status || 'active',
          params.reminder_date || null
        ]
      );
      
      // Neuen Eintrag abrufen
      if (result.lastID) {
        return await this.getTalentPoolEntryById(result.lastID);
      }
      
      return null;
    } catch (error) {
      console.error('Fehler beim Hinzufügen zum Talent-Pool:', error);
      throw error;
    }
  }
  
  /**
   * Aktualisiert einen Talent-Pool-Eintrag
   * @param id ID des Talent-Pool-Eintrags
   * @param params Zu aktualisierende Parameter
   */
  public static async updateTalentPoolEntry(
    id: string,
    params: UpdateTalentPoolEntryParams
  ): Promise<TalentPoolEntry | null> {
    const db = await getDb();
    
    try {
      // Prüfen, ob der Eintrag existiert
      const existingEntry = await this.getTalentPoolEntryById(id);
      
      if (!existingEntry) {
        throw new Error(`Talent-Pool-Eintrag mit ID ${id} nicht gefunden`);
      }
      
      // Tags als JSON-String formatieren
      const tags = params.tags ? JSON.stringify(params.tags) : undefined;
      
      // Update-Query erstellen
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      
      if (params.reason !== undefined) {
        updateFields.push('reason = ?');
        updateValues.push(params.reason);
      }
      
      if (params.notes !== undefined) {
        updateFields.push('notes = ?');
        updateValues.push(params.notes);
      }
      
      if (params.rating !== undefined) {
        updateFields.push('rating = ?');
        updateValues.push(params.rating);
      }
      
      if (tags !== undefined) {
        updateFields.push('tags = ?');
        updateValues.push(tags);
      }
      
      if (params.status !== undefined) {
        updateFields.push('status = ?');
        updateValues.push(params.status);
      }
      
      if (params.reminder_date !== undefined) {
        updateFields.push('reminder_date = ?');
        updateValues.push(params.reminder_date);
      }
      
      if (updateFields.length === 0) {
        return existingEntry;
      }
      
      // ID für WHERE-Klausel hinzufügen
      updateValues.push(id);
      
      // Update durchführen
      await db.run(
        `UPDATE talent_pool SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
      
      // Aktualisierte Daten zurückgeben
      return await this.getTalentPoolEntryById(id);
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Talent-Pool-Eintrags:', error);
      throw error;
    }
  }
  
  /**
   * Löscht einen Talent-Pool-Eintrag
   * @param id ID des Talent-Pool-Eintrags
   */
  public static async removeTalentPoolEntry(id: string): Promise<boolean> {
    const db = await getDb();
    
    try {
      // Prüfen, ob der Eintrag existiert
      const existingEntry = await this.getTalentPoolEntryById(id);
      
      if (!existingEntry) {
        throw new Error(`Talent-Pool-Eintrag mit ID ${id} nicht gefunden`);
      }
      
      // Eintrag löschen
      await db.run('DELETE FROM talent_pool WHERE id = ?', [id]);
      
      return true;
    } catch (error) {
      console.error('Fehler beim Löschen des Talent-Pool-Eintrags:', error);
      throw error;
    }
  }
  
  /**
   * Ruft einen Talent-Pool-Eintrag ab
   * @param id ID des Talent-Pool-Eintrags
   */
  public static async getTalentPoolEntryById(id: string): Promise<TalentPoolEntry | null> {
    const db = await getDb();
    
    try {
      const entry = await db.get('SELECT * FROM talent_pool WHERE id = ?', [id]);
      
      if (!entry) {
        return null;
      }
      
      // Tags von JSON-String in Array konvertieren
      if (entry.tags && typeof entry.tags === 'string') {
        try {
          entry.tags = JSON.parse(entry.tags);
        } catch (error) {
          console.error('Fehler beim Parsen der Tags:', error);
          entry.tags = [];
        }
      }
      
      return entry as TalentPoolEntry;
    } catch (error) {
      console.error('Fehler beim Abrufen des Talent-Pool-Eintrags:', error);
      throw error;
    }
  }
  
  /**
   * Ruft einen erweiterten Talent-Pool-Eintrag ab, der auch die Entitätsdaten enthält
   * @param id ID des Talent-Pool-Eintrags
   */
  public static async getTalentPoolEntryExtendedById(id: string): Promise<TalentPoolEntryExtended | null> {
    const db = await getDb();
    
    try {
      const entry = await this.getTalentPoolEntryById(id);
      
      if (!entry) {
        return null;
      }
      
      let entityData: Candidate | ApplicationExtended | null = null;
      
      // Entitätsdaten abrufen
      if (entry.entity_type === 'candidate') {
        entityData = await db.get(
          'SELECT * FROM candidates WHERE id = ?',
          [entry.entity_id]
        );
      } else if (entry.entity_type === 'application') {
        entityData = await db.get(
          'SELECT * FROM applications WHERE id = ?',
          [entry.entity_id]
        );
        
        // TODO: Erweitere Application zu ApplicationExtended, wenn nötig
      }
      
      if (!entityData) {
        throw new Error(`${entry.entity_type} mit ID ${entry.entity_id} nicht gefunden`);
      }
      
      return {
        ...entry,
        entity_data: entityData
      } as TalentPoolEntryExtended;
    } catch (error) {
      console.error('Fehler beim Abrufen des erweiterten Talent-Pool-Eintrags:', error);
      throw error;
    }
  }
  
  /**
   * Ruft Talent-Pool-Einträge ab, gefiltert nach verschiedenen Kriterien
   * @param filter Filter-Optionen
   */
  public static async getTalentPoolEntries(
    filter: TalentPoolFilter = {}
  ): Promise<{ entries: TalentPoolEntry[], total: number }> {
    const db = await getDb();
    
    try {
      // Query-Teile erstellen
      let whereClause = '1=1';
      const whereParams: any[] = [];
      
      // Suchtext
      if (filter.search) {
        whereClause += ' AND (entity_id LIKE ? OR notes LIKE ?)';
        whereParams.push(`%${filter.search}%`, `%${filter.search}%`);
      }
      
      // Entitätstyp
      if (filter.entity_type) {
        whereClause += ' AND entity_type = ?';
        whereParams.push(filter.entity_type);
      }
      
      // Status
      if (filter.statuses && filter.statuses.length > 0) {
        whereClause += ` AND status IN (${filter.statuses.map(() => '?').join(', ')})`;
        whereParams.push(...filter.statuses);
      }
      
      // Rating
      if (filter.minRating !== undefined) {
        whereClause += ' AND (rating IS NULL OR rating >= ?)';
        whereParams.push(filter.minRating);
      }
      
      if (filter.maxRating !== undefined) {
        whereClause += ' AND (rating IS NULL OR rating <= ?)';
        whereParams.push(filter.maxRating);
      }
      
      // Hinzugefügt in Zeitraum
      if (filter.addedSince) {
        whereClause += ' AND added_date >= ?';
        whereParams.push(filter.addedSince);
      }
      
      if (filter.addedBefore) {
        whereClause += ' AND added_date <= ?';
        whereParams.push(filter.addedBefore);
      }
      
      // Kontaktiert in Zeitraum
      if (filter.contactedSince) {
        whereClause += ' AND (last_contacted IS NULL OR last_contacted >= ?)';
        whereParams.push(filter.contactedSince);
      }
      
      if (filter.contactedBefore) {
        whereClause += ' AND (last_contacted IS NULL OR last_contacted <= ?)';
        whereParams.push(filter.contactedBefore);
      }
      
      // Erinnerung in Zeitraum
      if (filter.reminderFrom) {
        whereClause += ' AND (reminder_date IS NULL OR reminder_date >= ?)';
        whereParams.push(filter.reminderFrom);
      }
      
      if (filter.reminderTo) {
        whereClause += ' AND (reminder_date IS NULL OR reminder_date <= ?)';
        whereParams.push(filter.reminderTo);
      }
      
      // Tags
      if (filter.tags && filter.tags.length > 0) {
        // Für jeden Tag prüfen, ob er im JSON-String enthalten ist
        filter.tags.forEach(tag => {
          whereClause += ' AND tags LIKE ?';
          whereParams.push(`%${tag}%`);
        });
      }
      
      // Gesamtzahl der Einträge abrufen
      const countQuery = `SELECT COUNT(*) as total FROM talent_pool WHERE ${whereClause}`;
      const countResult = await db.get(countQuery, whereParams);
      const total = countResult ? countResult.total : 0;
      
      // Sortierung
      const sortBy = filter.sortBy || 'added_date';
      const sortDirection = filter.sortDirection || 'desc';
      
      // Paginierung
      const page = filter.page || 0;
      const pageSize = filter.pageSize || 20;
      const offset = page * pageSize;
      
      // Finale Query
      const query = `
        SELECT * FROM talent_pool 
        WHERE ${whereClause} 
        ORDER BY ${sortBy} ${sortDirection} 
        LIMIT ? OFFSET ?
      `;
      
      const entries = await db.all(query, [...whereParams, pageSize, offset]);
      
      // Tags für alle Einträge konvertieren
      const processedEntries = entries.map((entry: any) => {
        if (entry.tags && typeof entry.tags === 'string') {
          try {
            entry.tags = JSON.parse(entry.tags);
          } catch (error) {
            console.error('Fehler beim Parsen der Tags:', error);
            entry.tags = [];
          }
        }
        return entry as TalentPoolEntry;
      });
      
      return {
        entries: processedEntries,
        total
      };
    } catch (error) {
      console.error('Fehler beim Abrufen der Talent-Pool-Einträge:', error);
      throw error;
    }
  }
  
  /**
   * Ruft erweiterte Talent-Pool-Einträge ab, gefiltert nach verschiedenen Kriterien
   * @param filter Filter-Optionen
   */
  public static async getTalentPoolEntriesExtended(
    filter: TalentPoolFilter = {}
  ): Promise<{ entries: TalentPoolEntryExtended[], total: number }> {
    try {
      const { entries, total } = await this.getTalentPoolEntries(filter);
      
      // Für jeden Eintrag die Entitätsdaten abrufen
      const extendedEntries: TalentPoolEntryExtended[] = [];
      
      for (const entry of entries) {
        try {
          const extendedEntry = await this.getTalentPoolEntryExtendedById(entry.id);
          if (extendedEntry) {
            extendedEntries.push(extendedEntry);
          }
        } catch (error) {
          console.error(`Fehler beim Abrufen erweiterter Daten für Eintrag ${entry.id}:`, error);
          // Wenn ein Fehler auftritt, den Eintrag trotzdem zurückgeben, aber ohne Entitätsdaten
          extendedEntries.push({
            ...entry,
            entity_data: {} as any
          });
        }
      }
      
      return {
        entries: extendedEntries,
        total
      };
    } catch (error) {
      console.error('Fehler beim Abrufen der erweiterten Talent-Pool-Einträge:', error);
      throw error;
    }
  }
  
  /**
   * Fügt eine Notiz zu einem Talent-Pool-Eintrag hinzu
   * @param params Parameter für die neue Notiz
   */
  public static async addNoteToPalentPoolEntry(
    params: AddTalentPoolNoteParams
  ): Promise<TalentPoolNote | null> {
    const db = await getDb();
    
    try {
      // Prüfen, ob der Talent-Pool-Eintrag existiert
      const entry = await this.getTalentPoolEntryById(params.talent_pool_id);
      
      if (!entry) {
        throw new Error(`Talent-Pool-Eintrag mit ID ${params.talent_pool_id} nicht gefunden`);
      }
      
      // Notiz hinzufügen
      const result = await db.run(
        `INSERT INTO talent_pool_notes (
          talent_pool_id, 
          created_by, 
          content, 
          note_type
        ) VALUES (?, ?, ?, ?)`,
        [
          params.talent_pool_id,
          params.created_by,
          params.content,
          params.note_type || 'general'
        ]
      );
      
      // Neue Notiz abrufen
      if (result.lastID) {
        const note = await db.get(
          'SELECT * FROM talent_pool_notes WHERE id = ?',
          [result.lastID]
        );
        
        return note as TalentPoolNote;
      }
      
      return null;
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Notiz:', error);
      throw error;
    }
  }
  
  /**
   * Ruft Notizen zu einem Talent-Pool-Eintrag ab
   * @param talent_pool_id ID des Talent-Pool-Eintrags
   */
  public static async getNotesByTalentPoolId(talent_pool_id: string): Promise<TalentPoolNote[]> {
    const db = await getDb();
    
    try {
      // Prüfen, ob der Talent-Pool-Eintrag existiert
      const entry = await this.getTalentPoolEntryById(talent_pool_id);
      
      if (!entry) {
        throw new Error(`Talent-Pool-Eintrag mit ID ${talent_pool_id} nicht gefunden`);
      }
      
      // Notizen abrufen
      const notes = await db.all(
        'SELECT * FROM talent_pool_notes WHERE talent_pool_id = ? ORDER BY created_at DESC',
        [talent_pool_id]
      );
      
      return notes as TalentPoolNote[];
    } catch (error) {
      console.error('Fehler beim Abrufen der Notizen:', error);
      throw error;
    }
  }
  
  /**
   * Ruft Aktivitäten zu einem Talent-Pool-Eintrag ab
   * @param talent_pool_id ID des Talent-Pool-Eintrags
   */
  public static async getActivitiesByTalentPoolId(talent_pool_id: string): Promise<TalentPoolActivity[]> {
    const db = await getDb();
    
    try {
      // Prüfen, ob der Talent-Pool-Eintrag existiert
      const entry = await this.getTalentPoolEntryById(talent_pool_id);
      
      if (!entry) {
        throw new Error(`Talent-Pool-Eintrag mit ID ${talent_pool_id} nicht gefunden`);
      }
      
      // Aktivitäten abrufen
      const activities = await db.all(
        'SELECT * FROM talent_pool_activities WHERE talent_pool_id = ? ORDER BY created_at DESC',
        [talent_pool_id]
      );
      
      // Aktivitätsdaten von JSON-String in Objekt konvertieren
      return activities.map((activity: any) => {
        if (activity.activity_data && typeof activity.activity_data === 'string') {
          try {
            activity.activity_data = JSON.parse(activity.activity_data);
          } catch (error) {
            console.error('Fehler beim Parsen der Aktivitätsdaten:', error);
            activity.activity_data = {};
          }
        }
        return activity as TalentPoolActivity;
      });
    } catch (error) {
      console.error('Fehler beim Abrufen der Aktivitäten:', error);
      throw error;
    }
  }
  
  /**
   * Berechnet und speichert Job-Matches für einen Talent-Pool-Eintrag
   * @param talent_pool_id ID des Talent-Pool-Eintrags
   */
  public static async calculateJobMatches(talent_pool_id: string): Promise<TalentPoolJobMatch[]> {
    try {
      // Talent-Pool-Eintrag abrufen
      const entry = await this.getTalentPoolEntryExtendedById(talent_pool_id);
      
      if (!entry) {
        throw new Error(`Talent-Pool-Eintrag mit ID ${talent_pool_id} nicht gefunden`);
      }
      
      // Semantisches Matching mit dem TalentPoolJobMatcher durchführen
      const { default: talentPoolJobMatcher } = await import('./matcher/TalentPoolJobMatcher');
      
      // Verwende die Entity-Daten für das Matching
      const matchResults = await talentPoolJobMatcher.calculateMatchesForTalentPool(
        entry.entity_data, 
        talent_pool_id
      );
      
      return matchResults;
    } catch (error) {
      console.error('Fehler beim Berechnen der Job-Matches:', error);
      throw error;
    }
  }
  
  /**
   * Ruft Job-Matches für einen Talent-Pool-Eintrag ab
   * @param talent_pool_id ID des Talent-Pool-Eintrags
   */
  public static async getJobMatchesByTalentPoolId(talent_pool_id: string): Promise<TalentPoolJobMatch[]> {
    const db = await getDb();
    
    try {
      // Prüfen, ob der Talent-Pool-Eintrag existiert
      const entry = await this.getTalentPoolEntryById(talent_pool_id);
      
      if (!entry) {
        throw new Error(`Talent-Pool-Eintrag mit ID ${talent_pool_id} nicht gefunden`);
      }
      
      // Matches abrufen
      const matches = await db.all(
        'SELECT * FROM talent_pool_job_matches WHERE talent_pool_id = ? ORDER BY match_score DESC',
        [talent_pool_id]
      );
      
      // Match-Details von JSON-String in Objekt konvertieren
      return matches.map((match: any) => {
        if (match.match_details && typeof match.match_details === 'string') {
          try {
            match.match_details = JSON.parse(match.match_details);
          } catch (error) {
            console.error('Fehler beim Parsen der Match-Details:', error);
            match.match_details = {};
          }
        }
        return match as TalentPoolJobMatch;
      });
    } catch (error) {
      console.error('Fehler beim Abrufen der Job-Matches:', error);
      throw error;
    }
  }
  
  /**
   * Ändert den Status eines Job-Matches
   * @param match_id ID des Job-Matches
   * @param status Neuer Status
   */
  public static async updateJobMatchStatus(match_id: string, status: string): Promise<TalentPoolJobMatch | null> {
    const db = await getDb();
    
    try {
      // Prüfen, ob das Match existiert
      const match = await db.get(
        'SELECT * FROM talent_pool_job_matches WHERE id = ?',
        [match_id]
      );
      
      if (!match) {
        throw new Error(`Job-Match mit ID ${match_id} nicht gefunden`);
      }
      
      // Status aktualisieren
      await db.run(
        'UPDATE talent_pool_job_matches SET status = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?',
        [status, match_id]
      );
      
      // Aktualisiertes Match abrufen
      const updatedMatch = await db.get(
        'SELECT * FROM talent_pool_job_matches WHERE id = ?',
        [match_id]
      );
      
      if (!updatedMatch) {
        return null;
      }
      
      // Match-Details von JSON-String in Objekt konvertieren
      if (updatedMatch.match_details && typeof updatedMatch.match_details === 'string') {
        try {
          updatedMatch.match_details = JSON.parse(updatedMatch.match_details);
        } catch (error) {
          console.error('Fehler beim Parsen der Match-Details:', error);
          updatedMatch.match_details = {};
        }
      }
      
      return updatedMatch as TalentPoolJobMatch;
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Job-Match-Status:', error);
      throw error;
    }
  }
  
  /**
   * Aktualisiert den Kontaktzeitpunkt eines Talent-Pool-Eintrags
   * @param id ID des Talent-Pool-Eintrags
   * @param contacted_by ID des Benutzers, der den Kontakt hergestellt hat
   */
  public static async updateLastContacted(
    id: string,
    contacted_by?: string
  ): Promise<TalentPoolEntry | null> {
    const db = await getDb();
    
    try {
      // Prüfen, ob der Eintrag existiert
      const existingEntry = await this.getTalentPoolEntryById(id);
      
      if (!existingEntry) {
        throw new Error(`Talent-Pool-Eintrag mit ID ${id} nicht gefunden`);
      }
      
      // Aktualisieren des Kontaktzeitpunkts
      await db.run(
        'UPDATE talent_pool SET last_contacted = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      );
      
      // Aktivität hinzufügen
      await db.run(
        `INSERT INTO talent_pool_activities (
          talent_pool_id, 
          activity_type, 
          created_by
        ) VALUES (?, ?, ?)`,
        [
          id,
          'contacted',
          contacted_by || null
        ]
      );
      
      // Aktualisierte Daten zurückgeben
      return await this.getTalentPoolEntryById(id);
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Kontaktzeitpunkts:', error);
      throw error;
    }
  }
}
