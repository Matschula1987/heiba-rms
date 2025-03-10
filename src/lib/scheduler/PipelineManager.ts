import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import {
  PostPipelineItem,
  PipelineType,
  PipelineStatus,
  SocialMediaPlatform,
  EntityType,
  PostPipelineItemOptions,
  PipelineSettings,
  SocialMediaPostConfig,
  MovidoPostConfig,
  PerformanceMetrics,
  ABTestConfig
} from '@/types/scheduler';
import { schedulerService } from './SchedulerService';
import { format, parseISO, addDays, addMinutes } from 'date-fns';

/**
 * Manager für die Verwaltung der Posting-Pipelines
 * Für soziale Medien und Movido-Portale
 */
export class PipelineManager {
  /**
   * Fügt ein neues Item zur Pipeline hinzu
   * 
   * @param item Das zu erstellende Pipeline-Item (ohne ID, createdAt, updatedAt)
   * @returns Die ID des erstellten Items
   */
  public async addToPipeline(itemData: Omit<PostPipelineItem, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<string> {
    const db = await getDb();
    const now = new Date().toISOString();
    const itemId = uuidv4();
    
    // Füge das Item in die Datenbank ein
    await db.run(`
      INSERT INTO post_pipeline_items (
        id, pipeline_type, platform, entity_type, entity_id, status,
        scheduled_for, priority, content_template, content_params, target_audience,
        scheduled_task_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      itemId,
      itemData.pipelineType,
      itemData.platform || null,
      itemData.entityType,
      itemData.entityId,
      'pending', // Standardmäßig auf 'pending' setzen
      itemData.scheduledFor || null,
      itemData.priority || 0,
      itemData.contentTemplate || null,
      itemData.contentParams || null,
      itemData.targetAudience || null,
      itemData.scheduledTaskId || null,
      now,
      now
    ]);
    
    return itemId;
  }
  
  /**
   * Aktualisiert den Status eines Pipeline-Items
   * 
   * @param itemId Die ID des Items
   * @param status Der neue Status
   * @param result Optionales Ergebnis des Postings
   * @param error Optionale Fehlermeldung
   * @returns true, wenn die Aktualisierung erfolgreich war, sonst false
   */
  public async updateItemStatus(
    itemId: string,
    status: PipelineStatus,
    result?: string,
    error?: string
  ): Promise<boolean> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    const updates: string[] = [];
    const params: any[] = [];
    
    updates.push('status = ?');
    params.push(status);
    
    updates.push('updated_at = ?');
    params.push(now);
    
    if (status === 'posted') {
      updates.push('posted_at = ?');
      params.push(now);
    }
    
    if (result) {
      updates.push('result = ?');
      params.push(result);
    }
    
    if (error) {
      updates.push('error = ?');
      params.push(error);
    }
    
    // ID für die WHERE-Klausel
    params.push(itemId);
    
    const dbResult = await db.run(`
      UPDATE post_pipeline_items
      SET ${updates.join(', ')}
      WHERE id = ?
    `, params);
    
    return dbResult.changes > 0;
  }
  
  /**
   * Löscht ein Item aus der Pipeline
   * 
   * @param itemId Die ID des Items
   * @returns true, wenn die Löschung erfolgreich war, sonst false
   */
  public async removeFromPipeline(itemId: string): Promise<boolean> {
    const db = await getDb();
    
    const result = await db.run('DELETE FROM post_pipeline_items WHERE id = ?', [itemId]);
    
    return result.changes > 0;
  }
  
  /**
   * Holt ein Pipeline-Item anhand seiner ID
   * 
   * @param itemId Die ID des Items
   * @returns Das Item oder null, wenn nicht gefunden
   */
  public async getItemById(itemId: string): Promise<PostPipelineItem | null> {
    const db = await getDb();
    
    const item = await db.get('SELECT * FROM post_pipeline_items WHERE id = ?', [itemId]);
    
    if (!item) {
      return null;
    }
    
    return this.mapDbItemToPostPipelineItem(item);
  }
  
  /**
   * Holt Pipeline-Items mit Filteroptionen
   * 
   * @param options Filteroptionen
   * @returns Array von Pipeline-Items
   */
  public async getItems(options: PostPipelineItemOptions = {}): Promise<PostPipelineItem[]> {
    const db = await getDb();
    
    // Baue die WHERE-Klausel basierend auf den Optionen
    const where: string[] = [];
    const params: any[] = [];
    
    if (options.status) {
      if (Array.isArray(options.status)) {
        where.push(`status IN (${options.status.map(() => '?').join(', ')})`);
        params.push(...options.status);
      } else {
        where.push('status = ?');
        params.push(options.status);
      }
    }
    
    if (options.pipelineType) {
      where.push('pipeline_type = ?');
      params.push(options.pipelineType);
    }
    
    if (options.platform) {
      where.push('platform = ?');
      params.push(options.platform);
    }
    
    if (options.entityType) {
      where.push('entity_type = ?');
      params.push(options.entityType);
    }
    
    if (options.entityId) {
      where.push('entity_id = ?');
      params.push(options.entityId);
    }
    
    if (options.fromDate) {
      where.push('scheduled_for >= ?');
      params.push(options.fromDate);
    }
    
    if (options.toDate) {
      where.push('scheduled_for <= ?');
      params.push(options.toDate);
    }
    
    if (options.priority !== undefined) {
      where.push('priority >= ?');
      params.push(options.priority);
    }
    
    // Füge LIMIT und OFFSET hinzu
    let limitOffset = '';
    if (options.limit) {
      limitOffset = ` LIMIT ${options.limit}`;
      
      if (options.offset) {
        limitOffset += ` OFFSET ${options.offset}`;
      }
    }
    
    // Führe die Abfrage durch
    const query = `
      SELECT * FROM post_pipeline_items
      ${where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY priority DESC, scheduled_for ASC
      ${limitOffset}
    `;
    
    const items = await db.all(query, params);
    
    // Konvertiere die Ergebnisse
    return items.map(this.mapDbItemToPostPipelineItem);
  }
  
  /**
   * Holt die nächsten Items, die gepostet werden sollen, basierend auf den Pipeline-Einstellungen
   * 
   * @param pipelineType Der Typ der Pipeline
   * @param platform Die Plattform (optional)
   * @param limit Maximale Anzahl der Items
   * @returns Array von Items, die für das Posting geplant sind
   */
  public async getNextItemsToPost(
    pipelineType: PipelineType,
    platform?: SocialMediaPlatform,
    limit: number = 5
  ): Promise<PostPipelineItem[]> {
    // Hole zuerst die Pipeline-Einstellungen
    const settings = await this.getPipelineSettings(pipelineType, platform);
    
    if (!settings || !settings.enabled) {
      return []; // Pipeline ist deaktiviert
    }
    
    // Berechne das tägliche Limit basierend auf den Einstellungen
    const dailyLimit = settings.dailyLimit || 5;
    
    // Hole die Anzahl der heute bereits geposteten Items
    const postedToday = await this.getPostedItemsCount(pipelineType, platform);
    
    // Berechne, wie viele Items noch gepostet werden können
    const remainingLimit = Math.max(0, dailyLimit - postedToday);
    
    if (remainingLimit <= 0) {
      return []; // Tägliches Limit erreicht
    }
    
    // Hole die nächsten Items, die für das Posting geplant sind
    const options: PostPipelineItemOptions = {
      pipelineType,
      status: 'pending',
      limit: Math.min(remainingLimit, limit)
    };
    
    if (platform) {
      options.platform = platform;
    }
    
    return this.getItems(options);
  }
  
  /**
   * Zählt die Anzahl der heute bereits geposteten Items
   * 
   * @param pipelineType Der Typ der Pipeline
   * @param platform Die Plattform (optional)
   * @returns Die Anzahl der heute geposteten Items
   */
  private async getPostedItemsCount(
    pipelineType: PipelineType,
    platform?: SocialMediaPlatform
  ): Promise<number> {
    const db = await getDb();
    
    // Berechne das Datum für den Beginn des aktuellen Tages
    const today = format(new Date(), 'yyyy-MM-dd');
    
    // Baue die Abfrage
    let query = `
      SELECT COUNT(*) as count FROM post_pipeline_items
      WHERE pipeline_type = ? AND status = 'posted' AND posted_at >= ?
    `;
    const params: any[] = [pipelineType, `${today}T00:00:00.000Z`];
    
    if (platform) {
      query += ' AND platform = ?';
      params.push(platform);
    }
    
    const result = await db.get(query, params);
    
    return result ? result.count : 0;
  }
  
  /**
   * Erstellt oder aktualisiert die Einstellungen für eine Pipeline
   * 
   * @param settings Die Einstellungen
   * @returns Die ID der erstellten oder aktualisierten Einstellungen
   */
  public async savePipelineSettings(settings: Omit<PipelineSettings, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    // Prüfe, ob bereits Einstellungen für diese Pipeline existieren
    const query = `
      SELECT id FROM pipeline_settings
      WHERE pipeline_type = ? ${settings.platform ? 'AND platform = ?' : 'AND platform IS NULL'}
    `;
    const params = [settings.pipelineType, settings.platform].filter(Boolean);
    
    const existingSettings = await db.get(query, params);
    
    if (existingSettings) {
      // Aktualisiere die vorhandenen Einstellungen
      await db.run(`
        UPDATE pipeline_settings
        SET daily_limit = ?, posting_hours = ?, posting_days = ?,
            min_interval_minutes = ?, enabled = ?, updated_at = ?,
            config = ?
        WHERE id = ?
      `, [
        settings.dailyLimit,
        Array.isArray(settings.postingHours) ? JSON.stringify(settings.postingHours) : null,
        Array.isArray(settings.postingDays) ? JSON.stringify(settings.postingDays) : null,
        settings.minIntervalMinutes,
        settings.enabled ? 1 : 0,
        now,
        settings.config || null,
        existingSettings.id
      ]);
      
      return existingSettings.id;
    } else {
      // Erstelle neue Einstellungen
      const id = uuidv4();
      await db.run(`
        INSERT INTO pipeline_settings (
          id, pipeline_type, platform, daily_limit, posting_hours,
          posting_days, min_interval_minutes, enabled, created_at,
          updated_at, config
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id,
        settings.pipelineType,
        settings.platform || null,
        settings.dailyLimit,
        Array.isArray(settings.postingHours) ? JSON.stringify(settings.postingHours) : null,
        Array.isArray(settings.postingDays) ? JSON.stringify(settings.postingDays) : null,
        settings.minIntervalMinutes,
        settings.enabled ? 1 : 0,
        now,
        now,
        settings.config || null
      ]);
      
      return id;
    }
  }
  
  /**
   * Holt die Einstellungen für eine Pipeline
   * 
   * @param pipelineType Der Typ der Pipeline
   * @param platform Die Plattform (optional)
   * @returns Die Einstellungen oder null, wenn nicht gefunden
   */
  public async getPipelineSettings(
    pipelineType: PipelineType,
    platform?: SocialMediaPlatform
  ): Promise<PipelineSettings | null> {
    const db = await getDb();
    
    const query = `
      SELECT * FROM pipeline_settings
      WHERE pipeline_type = ? ${platform ? 'AND platform = ?' : 'AND platform IS NULL'}
    `;
    const params = [pipelineType, platform].filter(Boolean);
    
    const settings = await db.get(query, params);
    
    if (!settings) {
      return null;
    }
    
    return this.mapDbSettingsToPipelineSettings(settings);
  }
  
  /**
   * Holt alle Pipeline-Einstellungen
   * 
   * @param pipelineType Optionaler Filter für den Pipeline-Typ
   * @returns Array von Pipeline-Einstellungen
   */
  public async getAllPipelineSettings(pipelineType?: PipelineType): Promise<PipelineSettings[]> {
    const db = await getDb();
    
    let query = 'SELECT * FROM pipeline_settings';
    const params: any[] = [];
    
    if (pipelineType) {
      query += ' WHERE pipeline_type = ?';
      params.push(pipelineType);
    }
    
    query += ' ORDER BY pipeline_type, platform';
    
    const settingsArray = await db.all(query, params);
    
    return settingsArray.map(this.mapDbSettingsToPipelineSettings);
  }
  
  /**
   * Aktiviert oder deaktiviert eine Pipeline
   * 
   * @param pipelineType Der Typ der Pipeline
   * @param platform Die Plattform (optional)
   * @param enabled true zum Aktivieren, false zum Deaktivieren
   * @returns true, wenn die Aktualisierung erfolgreich war, sonst false
   */
  public async setPipelineEnabled(
    pipelineType: PipelineType,
    platform: SocialMediaPlatform | undefined,
    enabled: boolean
  ): Promise<boolean> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    const query = `
      UPDATE pipeline_settings
      SET enabled = ?, updated_at = ?
      WHERE pipeline_type = ? ${platform ? 'AND platform = ?' : 'AND platform IS NULL'}
    `;
    const params = [enabled ? 1 : 0, now, pipelineType, platform].filter(Boolean);
    
    const result = await db.run(query, params);
    
    return result.changes > 0;
  }
  
  /**
   * Erstellt einen Job zum Posten eines Items in der Pipeline
   * 
   * @param itemId Die ID des Items
   * @param scheduledFor Der Zeitpunkt für das Posting
   * @returns Die ID des erstellten Scheduler-Jobs
   */
  public async scheduleItemPosting(itemId: string, scheduledFor: string): Promise<string> {
    const item = await this.getItemById(itemId);
    
    if (!item) {
      throw new Error(`Pipeline-Item mit ID ${itemId} nicht gefunden`);
    }
    
    // Erstelle eine Scheduler-Aufgabe für das Posting
    const taskId = await schedulerService.createTask({
      taskType: item.pipelineType === 'social_media' ? 'social_post' : 'movido_post',
      status: 'pending',
      scheduledFor,
      intervalType: 'once', // Einmalig posten
      entityId: itemId,
      entityType: 'post_pipeline_item',
      config: JSON.stringify({
        pipelineType: item.pipelineType,
        platform: item.platform,
        entityId: item.entityId,
        entityType: item.entityType
      })
    });
    
    // Aktualisiere das Pipeline-Item mit der Scheduler-Aufgaben-ID
    const db = await getDb();
    await db.run(`
      UPDATE post_pipeline_items
      SET scheduled_task_id = ?, scheduled_for = ?, status = ?, updated_at = ?
      WHERE id = ?
    `, [taskId, scheduledFor, 'scheduled', new Date().toISOString(), itemId]);
    
    return taskId;
  }
  
  /**
   * Plant die nächsten Postings für eine Pipeline basierend auf den Einstellungen
   * 
   * @param pipelineType Der Typ der Pipeline
   * @param platform Die Plattform (optional)
   * @param maxItems Maximale Anzahl der zu planenden Items
   * @returns Die Anzahl der geplanten Items
   */
  public async schedulePipelinePosts(
    pipelineType: PipelineType,
    platform?: SocialMediaPlatform,
    maxItems: number = 10
  ): Promise<number> {
    // Hole die Pipeline-Einstellungen
    const settings = await this.getPipelineSettings(pipelineType, platform);
    
    if (!settings || !settings.enabled) {
      return 0; // Pipeline ist deaktiviert
    }
    
    // Hole die ungeschedulten Items
    const items = await this.getItems({
      pipelineType,
      platform,
      status: 'pending',
      limit: maxItems
    });
    
    if (items.length === 0) {
      return 0; // Keine Items zum Planen
    }
    
    // Berechne die Posting-Zeiten basierend auf den Einstellungen
    let scheduledCount = 0;
    let nextPostingTime = new Date();
    
    // Wenn postingHours definiert ist, verwende die nächste verfügbare Stunde
    if (settings.postingHours && settings.postingHours.length > 0) {
      const currentHour = nextPostingTime.getHours();
      const nextHour = settings.postingHours.find(h => Number(h) > currentHour);
      
      if (nextHour !== undefined) {
        // Setze die Zeit auf die nächste verfügbare Stunde
        nextPostingTime.setHours(Number(nextHour), 0, 0, 0);
      } else {
        // Wenn keine Stunde für heute mehr verfügbar ist, verwende die erste Stunde des nächsten Tages
        nextPostingTime = addDays(nextPostingTime, 1);
        nextPostingTime.setHours(Number(settings.postingHours[0]), 0, 0, 0);
      }
    }
    
    // Wenn postingDays definiert ist, überprüfe, ob der aktuelle Tag gültig ist
    if (settings.postingDays && settings.postingDays.length > 0) {
      const currentDay = nextPostingTime.getDay(); // 0 = Sonntag, 1 = Montag, ...
      
      if (!settings.postingDays.includes(currentDay)) {
        // Finde den nächsten gültigen Tag
        let daysToAdd = 1;
        let foundValidDay = false;
        
        for (let i = 1; i <= 7; i++) {
          const checkDay = (currentDay + i) % 7;
          if (settings.postingDays.includes(checkDay)) {
            daysToAdd = i;
            foundValidDay = true;
            break;
          }
        }
        
        if (foundValidDay) {
          nextPostingTime = addDays(nextPostingTime, daysToAdd);
          // Wenn postingHours definiert ist, setze die Zeit auf die erste verfügbare Stunde
          if (settings.postingHours && settings.postingHours.length > 0) {
            nextPostingTime.setHours(Number(settings.postingHours[0]), 0, 0, 0);
          } else {
            nextPostingTime.setHours(9, 0, 0, 0); // Standardmäßig 9 Uhr
          }
        }
      }
    }
    
    // Plane die Items
    for (const item of items) {
      // Plane das Item
      await this.scheduleItemPosting(item.id, nextPostingTime.toISOString());
      scheduledCount++;
      
      // Berechne die Zeit für das nächste Posting
      nextPostingTime = addMinutes(nextPostingTime, settings.minIntervalMinutes || 30);
      
      // Überprüfe, ob die Uhrzeit noch im erlaubten Bereich liegt
      if (settings.postingHours && settings.postingHours.length > 0) {
        const currentHour = nextPostingTime.getHours();
        
        if (!settings.postingHours.includes(currentHour)) {
          // Finde die nächste verfügbare Stunde
          const nextHour = settings.postingHours.find(h => Number(h) > currentHour);
          
          if (nextHour !== undefined) {
            // Setze die Zeit auf die nächste verfügbare Stunde
            nextPostingTime.setHours(Number(nextHour), 0, 0, 0);
          } else {
            // Wenn keine Stunde für heute mehr verfügbar ist, verwende die erste Stunde des nächsten Tages
            nextPostingTime = addDays(nextPostingTime, 1);
            nextPostingTime.setHours(Number(settings.postingHours[0]), 0, 0, 0);
            
            // Überprüfe, ob der nächste Tag gültig ist
            if (settings.postingDays && settings.postingDays.length > 0) {
              const nextDay = nextPostingTime.getDay();
              
              if (!settings.postingDays.includes(nextDay)) {
                // Finde den nächsten gültigen Tag
                let daysToAdd = 1;
                let foundValidDay = false;
                
                for (let i = 1; i <= 7; i++) {
                  const checkDay = (nextDay + i) % 7;
                  if (settings.postingDays.includes(checkDay)) {
                    daysToAdd = i;
                    foundValidDay = true;
                    break;
                  }
                }
                
                if (foundValidDay) {
                  nextPostingTime = addDays(nextPostingTime, daysToAdd);
                  nextPostingTime.setHours(Number(settings.postingHours[0]), 0, 0, 0);
                }
              }
            }
          }
        }
      }
    }
    
    return scheduledCount;
  }
  
  /**
   * Erstellt ein neues Item für ein Social-Media-Posting
   * 
   * @param entityType Der Typ der Entität (z.B. 'job')
   * @param entityId Die ID der Entität
   * @param platform Die Social-Media-Plattform
   * @param postConfig Die Konfiguration für den Post
   * @param priority Die Priorität (höher = wichtiger)
   * @returns Die ID des erstellten Items
   */
  public async createSocialMediaPostItem(
    entityType: EntityType,
    entityId: string,
    platform: SocialMediaPlatform,
    postConfig: SocialMediaPostConfig,
    priority: number = 0
  ): Promise<string> {
    return this.addToPipeline({
      pipelineType: 'social_media',
      platform,
      entityType,
      entityId,
      priority,
      contentTemplate: 'default', // Ein Standardtemplate
      contentParams: JSON.stringify(postConfig)
    });
  }
  
  /**
   * Erstellt ein neues Item für ein Movido-Posting
   * 
   * @param entityType Der Typ der Entität (z.B. 'job')
   * @param entityId Die ID der Entität
   * @param postConfig Die Konfiguration für den Post
   * @param priority Die Priorität (höher = wichtiger)
   * @returns Die ID des erstellten Items
   */
  public async createMovidoPostItem(
    entityType: EntityType,
    entityId: string,
    postConfig: MovidoPostConfig,
    priority: number = 0
  ): Promise<string> {
    return this.addToPipeline({
      pipelineType: 'movido',
      entityType,
      entityId,
      priority,
      contentTemplate: 'movido_default', // Ein Standardtemplate für Movido
      contentParams: JSON.stringify(postConfig)
    });
  }
  
  /**
   * Konvertiert ein Datenbank-Objekt in ein PostPipelineItem-Objekt
   * 
   * @param dbItem Das Datenbank-Objekt
   * @returns Das PostPipelineItem-Objekt
   */
  private mapDbItemToPostPipelineItem(dbItem: any): PostPipelineItem {
    return {
      id: dbItem.id,
      pipelineType: dbItem.pipeline_type as PipelineType,
      platform: dbItem.platform as SocialMediaPlatform | undefined,
      entityType: dbItem.entity_type as EntityType,
      entityId: dbItem.entity_id,
      status: dbItem.status as PipelineStatus,
      scheduledFor: dbItem.scheduled_for,
      priority: dbItem.priority || 0,
      contentTemplate: dbItem.content_template,
      contentParams: dbItem.content_params,
      targetAudience: dbItem.target_audience,
      scheduledTaskId: dbItem.scheduled_task_id,
      createdAt: dbItem.created_at,
      updatedAt: dbItem.updated_at,
      postedAt: dbItem.posted_at,
      result: dbItem.result,
      error: dbItem.error
    };
  }
  
  /**
   * Konvertiert ein Datenbank-Objekt in ein PipelineSettings-Objekt
   * 
   * @param dbSettings Das Datenbank-Objekt
   * @returns Das PipelineSettings-Objekt
   */
  private mapDbSettingsToPipelineSettings(dbSettings: any): PipelineSettings {
    return {
      id: dbSettings.id,
      pipelineType: dbSettings.pipeline_type as PipelineType,
      platform: dbSettings.platform as SocialMediaPlatform | undefined,
      dailyLimit: dbSettings.daily_limit || 5,
      postingHours: dbSettings.posting_hours ? JSON.parse(dbSettings.posting_hours) : undefined,
      postingDays: dbSettings.posting_days ? JSON.parse(dbSettings.posting_days) : undefined,
      minIntervalMinutes: dbSettings.min_interval_minutes || 30,
      enabled: Boolean(dbSettings.enabled),
      createdAt: dbSettings.created_at,
      updatedAt: dbSettings.updated_at,
      config: dbSettings.config
    };
  }

  /**
   * Prüft Jobs auf mangelnde Bewerbungen und plant automatisch Reposts
   * 
   * @param minimumApplications Minimale Anzahl erwarteter Bewerbungen
   * @param daysToWait Anzahl der Tage, die seit dem letzten Posting vergangen sein müssen
   * @param maxReposts Maximale Anzahl von Reposts pro Job
   * @returns Array mit IDs der geplanten Reposts
   */
  public async checkAndScheduleJobReposts(
    minimumApplications: number = 3,
    daysToWait: number = 7,
    maxReposts: number = 3
  ): Promise<string[]> {
    // Diese Methode wird später implementiert
    return [];
  }
}

// Erstelle und exportiere eine Instanz der PipelineManager-Klasse
export const pipelineManager = new PipelineManager();
