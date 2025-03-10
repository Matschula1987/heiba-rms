import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import {
  SyncSettings,
  EntityType,
  IntervalType,
  IntervalUnit,
  SyncConfig
} from '@/types/scheduler';
import { schedulerService } from './SchedulerService';
import { format, addMinutes, addHours, addDays, addWeeks, parseISO } from 'date-fns';

/**
 * Service zur Verwaltung der Synchronisationseinstellungen
 */
export class SyncSettingsService {
  /**
   * Erstellt oder aktualisiert Synchronisationseinstellungen
   * 
   * @param settings Die zu speichernden Einstellungen ohne ID, createdAt, updatedAt
   * @returns Die ID der erstellten oder aktualisierten Einstellungen
   */
  public async saveSyncSettings(
    settings: Omit<SyncSettings, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    // Prüfe, ob bereits Einstellungen für diese Entität existieren
    const query = `
      SELECT id FROM sync_settings
      WHERE entity_type = ? AND entity_id = ?
    `;
    const existingSettings = await db.get(query, [settings.entityType, settings.entityId]);
    
    if (existingSettings) {
      // Aktualisiere die vorhandenen Einstellungen
      await db.run(`
        UPDATE sync_settings
        SET sync_interval_type = ?, sync_interval_value = ?, sync_interval_unit = ?,
            custom_schedule = ?, enabled = ?, updated_at = ?, config = ?
        WHERE id = ?
      `, [
        settings.syncIntervalType,
        settings.syncIntervalValue || null,
        settings.syncIntervalUnit || null,
        settings.customSchedule || null,
        settings.enabled ? 1 : 0,
        now,
        settings.config || null,
        existingSettings.id
      ]);
      
      // Berechne den nächsten Synchronisationszeitpunkt, wenn aktiviert
      if (settings.enabled) {
        const nextSync = this.calculateNextSync(settings);
        await db.run(`
          UPDATE sync_settings
          SET next_sync = ?
          WHERE id = ?
        `, [nextSync, existingSettings.id]);
        
        // Erstelle oder aktualisiere die Scheduler-Aufgabe
        await this.createOrUpdateSyncTask(existingSettings.id, {
          ...settings,
          id: existingSettings.id,
          createdAt: now,
          updatedAt: now,
          nextSync
        });
      } else {
        // Wenn deaktiviert, entferne die Scheduler-Aufgabe, falls vorhanden
        await this.removeSyncTask(existingSettings.id);
      }
      
      return existingSettings.id;
    } else {
      // Erstelle neue Einstellungen
      const id = uuidv4();
      
      // Berechne den nächsten Synchronisationszeitpunkt, wenn aktiviert
      let nextSync = null;
      if (settings.enabled) {
        nextSync = this.calculateNextSync(settings);
      }
      
      await db.run(`
        INSERT INTO sync_settings (
          id, entity_type, entity_id, sync_interval_type, sync_interval_value,
          sync_interval_unit, custom_schedule, next_sync, enabled, created_at,
          updated_at, config
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id,
        settings.entityType,
        settings.entityId,
        settings.syncIntervalType,
        settings.syncIntervalValue || null,
        settings.syncIntervalUnit || null,
        settings.customSchedule || null,
        nextSync,
        settings.enabled ? 1 : 0,
        now,
        now,
        settings.config || null
      ]);
      
      // Erstelle die Scheduler-Aufgabe, wenn aktiviert
      if (settings.enabled && nextSync) {
        await this.createOrUpdateSyncTask(id, {
          ...settings,
          id,
          createdAt: now,
          updatedAt: now,
          nextSync
        });
      }
      
      return id;
    }
  }
  
  /**
   * Holt die Synchronisationseinstellungen für eine Entität
   * 
   * @param entityType Der Typ der Entität
   * @param entityId Die ID der Entität
   * @returns Die Einstellungen oder null, wenn nicht gefunden
   */
  public async getSyncSettings(
    entityType: EntityType,
    entityId: string
  ): Promise<SyncSettings | null> {
    const db = await getDb();
    
    const settings = await db.get(`
      SELECT * FROM sync_settings
      WHERE entity_type = ? AND entity_id = ?
    `, [entityType, entityId]);
    
    if (!settings) {
      return null;
    }
    
    return this.mapDbSettingsToSyncSettings(settings);
  }
  
  /**
   * Holt alle Synchronisationseinstellungen
   * 
   * @param entityType Optionaler Filter für den Entitätstyp
   * @param enabled Optionaler Filter für den Aktivierungsstatus
   * @returns Array von Synchronisationseinstellungen
   */
  public async getAllSyncSettings(
    entityType?: EntityType,
    enabled?: boolean
  ): Promise<SyncSettings[]> {
    const db = await getDb();
    
    const where: string[] = [];
    const params: any[] = [];
    
    if (entityType) {
      where.push('entity_type = ?');
      params.push(entityType);
    }
    
    if (enabled !== undefined) {
      where.push('enabled = ?');
      params.push(enabled ? 1 : 0);
    }
    
    const query = `
      SELECT * FROM sync_settings
      ${where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY entity_type, entity_id
    `;
    
    const settingsArray = await db.all(query, params);
    
    return settingsArray.map(this.mapDbSettingsToSyncSettings);
  }
  
  /**
   * Aktiviert oder deaktiviert die Synchronisation für eine Entität
   * 
   * @param entityType Der Typ der Entität
   * @param entityId Die ID der Entität
   * @param enabled true zum Aktivieren, false zum Deaktivieren
   * @returns true, wenn die Aktualisierung erfolgreich war, sonst false
   */
  public async setSyncEnabled(
    entityType: EntityType,
    entityId: string,
    enabled: boolean
  ): Promise<boolean> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    // Prüfe, ob Einstellungen existieren
    const settings = await this.getSyncSettings(entityType, entityId);
    
    if (!settings) {
      return false;
    }
    
    // Berechne den nächsten Synchronisationszeitpunkt, wenn aktiviert
    let nextSync = null;
    if (enabled) {
      nextSync = this.calculateNextSync(settings);
    }
    
    const result = await db.run(`
      UPDATE sync_settings
      SET enabled = ?, updated_at = ?, next_sync = ?
      WHERE entity_type = ? AND entity_id = ?
    `, [
      enabled ? 1 : 0,
      now,
      nextSync,
      entityType,
      entityId
    ]);
    
    if (result.changes > 0) {
      if (enabled && nextSync) {
        // Erstelle oder aktualisiere die Scheduler-Aufgabe
        await this.createOrUpdateSyncTask(settings.id, {
          ...settings,
          enabled,
          nextSync
        });
      } else {
        // Wenn deaktiviert, entferne die Scheduler-Aufgabe, falls vorhanden
        await this.removeSyncTask(settings.id);
      }
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Löscht die Synchronisationseinstellungen für eine Entität
   * 
   * @param entityType Der Typ der Entität
   * @param entityId Die ID der Entität
   * @returns true, wenn die Löschung erfolgreich war, sonst false
   */
  public async deleteSyncSettings(
    entityType: EntityType,
    entityId: string
  ): Promise<boolean> {
    const db = await getDb();
    
    // Hole die ID für das Entfernen der Scheduler-Aufgabe
    const settings = await this.getSyncSettings(entityType, entityId);
    
    if (!settings) {
      return false;
    }
    
    // Entferne die Scheduler-Aufgabe, falls vorhanden
    await this.removeSyncTask(settings.id);
    
    const result = await db.run(`
      DELETE FROM sync_settings
      WHERE entity_type = ? AND entity_id = ?
    `, [entityType, entityId]);
    
    return result.changes > 0;
  }
  
  /**
   * Aktualisiert den letzten Synchronisationszeitpunkt und plant die nächste Synchronisation
   * 
   * @param entityType Der Typ der Entität
   * @param entityId Die ID der Entität
   * @returns Die aktualisierten Synchronisationseinstellungen oder null, wenn nicht gefunden
   */
  public async updateLastSync(
    entityType: EntityType,
    entityId: string
  ): Promise<SyncSettings | null> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    // Hole die aktuellen Einstellungen
    const settings = await this.getSyncSettings(entityType, entityId);
    
    if (!settings || !settings.enabled) {
      return null;
    }
    
    // Berechne den nächsten Synchronisationszeitpunkt
    const nextSync = this.calculateNextSync(settings);
    
    // Aktualisiere die Einstellungen
    await db.run(`
      UPDATE sync_settings
      SET last_sync = ?, next_sync = ?, updated_at = ?
      WHERE entity_type = ? AND entity_id = ?
    `, [
      now,
      nextSync,
      now,
      entityType,
      entityId
    ]);
    
    // Aktualisiere die Scheduler-Aufgabe
    await this.createOrUpdateSyncTask(settings.id, {
      ...settings,
      lastSync: now,
      nextSync
    });
    
    // Gib die aktualisierten Einstellungen zurück
    return this.getSyncSettings(entityType, entityId);
  }
  
  /**
   * Holt alle fälligen Synchronisationen
   * 
   * @returns Array von fälligen Synchronisationseinstellungen
   */
  public async getDueSyncs(): Promise<SyncSettings[]> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    const query = `
      SELECT * FROM sync_settings
      WHERE enabled = 1 AND next_sync <= ?
      ORDER BY next_sync ASC
    `;
    
    const settingsArray = await db.all(query, [now]);
    
    return settingsArray.map(this.mapDbSettingsToSyncSettings);
  }
  
  /**
   * Erstellt oder aktualisiert eine Scheduler-Aufgabe für die Synchronisation
   * 
   * @param syncSettingsId Die ID der Synchronisationseinstellungen
   * @param settings Die Synchronisationseinstellungen
   * @returns Die ID der erstellten oder aktualisierten Aufgabe
   */
  private async createOrUpdateSyncTask(
    syncSettingsId: string,
    settings: SyncSettings
  ): Promise<string> {
    // Überprüfe, ob bereits eine Aufgabe existiert
    const existingTasks = await schedulerService.getTasks({
      entityType: 'sync_settings',
      entityId: syncSettingsId,
      status: ['pending', 'running']
    });
    
    if (existingTasks.length > 0) {
      // Aktualisiere die vorhandene Aufgabe
      const taskId = existingTasks[0].id;
      await schedulerService.updateTask(taskId, {
        scheduledFor: settings.nextSync || new Date().toISOString(),
        status: 'pending',
        config: JSON.stringify({
          entityType: settings.entityType,
          entityId: settings.entityId,
          syncType: 'auto',
          syncConfig: settings.config
        })
      });
      
      return taskId;
    } else {
      // Erstelle eine neue Aufgabe
      const taskId = await schedulerService.createTask({
        taskType: 'sync',
        status: 'pending',
        scheduledFor: settings.nextSync || new Date().toISOString(),
        intervalType: 'once', // Die Wiederholung wird von diesem Service verwaltet
        entityType: 'sync_settings',
        entityId: syncSettingsId,
        config: JSON.stringify({
          entityType: settings.entityType,
          entityId: settings.entityId,
          syncType: 'auto',
          syncConfig: settings.config
        })
      });
      
      return taskId;
    }
  }
  
  /**
   * Entfernt alle Scheduler-Aufgaben für eine Synchronisationseinstellung
   * 
   * @param syncSettingsId Die ID der Synchronisationseinstellungen
   */
  private async removeSyncTask(syncSettingsId: string): Promise<void> {
    // Hole alle Aufgaben für diese Synchronisationseinstellung
    const tasks = await schedulerService.getTasks({
      entityType: 'sync_settings',
      entityId: syncSettingsId
    });
    
    // Lösche alle gefundenen Aufgaben
    for (const task of tasks) {
      await schedulerService.deleteTask(task.id);
    }
  }
  
  /**
   * Berechnet den nächsten Synchronisationszeitpunkt basierend auf den Einstellungen
   * 
   * @param settings Die Synchronisationseinstellungen
   * @returns Der nächste Synchronisationszeitpunkt als ISO-String
   */
  private calculateNextSync(settings: Omit<SyncSettings, 'id' | 'createdAt' | 'updatedAt'>): string {
    let baseDate = new Date();
    
    // Wenn lastSync existiert, nutze diesen als Basis
    if (settings.lastSync) {
      baseDate = parseISO(settings.lastSync);
    }
    
    // Berechnung basierend auf dem Intervalltyp
    let nextDate: Date;
    
    switch (settings.syncIntervalType) {
      case 'hourly':
        nextDate = addHours(baseDate, settings.syncIntervalValue || 1);
        break;
        
      case 'daily':
        nextDate = addDays(baseDate, settings.syncIntervalValue || 1);
        break;
        
      case 'weekly':
        nextDate = addWeeks(baseDate, settings.syncIntervalValue || 1);
        break;
        
      case 'monthly':
        // Für monatliche Intervalle verwenden wir 30 Tage als Näherung
        nextDate = addDays(baseDate, (settings.syncIntervalValue || 1) * 30);
        break;
        
      case 'custom':
        if (settings.customSchedule) {
          // Hier könnte eine komplexere Logik für benutzerdefinierte Zeitpläne implementiert werden
          // Für dieses Beispiel nutzen wir einen einfachen Fallback
          nextDate = addDays(baseDate, 1);
        } else {
          // Fallback auf täglich, wenn kein benutzerdefinierter Zeitplan vorhanden ist
          nextDate = addDays(baseDate, 1);
        }
        break;
        
      default:
        // Fallback auf stündlich
        nextDate = addHours(baseDate, 1);
    }
    
    return nextDate.toISOString();
  }
  
  /**
   * Initiiert eine sofortige Synchronisation
   * 
   * @param entityType Der Typ der Entität
   * @param entityId Die ID der Entität
   * @param config Optionale Konfiguration für die Synchronisation
   * @returns Die ID der erstellten Scheduler-Aufgabe oder null, wenn keine Einstellungen gefunden wurden
   */
  public async triggerSync(
    entityType: EntityType,
    entityId: string,
    config?: SyncConfig
  ): Promise<string | null> {
    // Hole die Synchronisationseinstellungen
    const settings = await this.getSyncSettings(entityType, entityId);
    
    if (!settings) {
      return null;
    }
    
    // Erstelle eine Scheduler-Aufgabe für die sofortige Synchronisation
    const taskId = await schedulerService.createTask({
      taskType: 'sync',
      status: 'pending',
      scheduledFor: new Date().toISOString(),
      intervalType: 'once',
      entityType,
      entityId,
      config: JSON.stringify({
        entityType,
        entityId,
        syncType: 'manual',
        syncConfig: config ? JSON.stringify(config) : settings.config
      })
    });
    
    return taskId;
  }
  
  /**
   * Konvertiert ein Datenbank-Objekt in ein SyncSettings-Objekt
   * 
   * @param dbSettings Das Datenbank-Objekt
   * @returns Das SyncSettings-Objekt
   */
  private mapDbSettingsToSyncSettings(dbSettings: any): SyncSettings {
    return {
      id: dbSettings.id,
      entityType: dbSettings.entity_type as EntityType,
      entityId: dbSettings.entity_id,
      syncIntervalType: dbSettings.sync_interval_type as IntervalType,
      syncIntervalValue: dbSettings.sync_interval_value,
      syncIntervalUnit: dbSettings.sync_interval_unit as IntervalUnit,
      customSchedule: dbSettings.custom_schedule,
      lastSync: dbSettings.last_sync,
      nextSync: dbSettings.next_sync,
      enabled: Boolean(dbSettings.enabled),
      createdAt: dbSettings.created_at,
      updatedAt: dbSettings.updated_at,
      config: dbSettings.config
    };
  }
}

// Export der Singleton-Instanz für einfachen Zugriff
export const syncSettingsService = new SyncSettingsService();
