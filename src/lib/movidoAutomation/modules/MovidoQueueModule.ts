import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { MovidoQueueItem, MovidoQueueItemStatus } from '@/types/movidoAutomation';
import { Job } from '@/types/jobs';

/**
 * Modul für die Warteschlangenverwaltung von Movido-Jobs
 * Verwaltet das Hinzufügen, Abfragen und Verarbeiten von Jobs in der Warteschlange
 */
export class MovidoQueueModule {
  /**
   * Fügt einen Job zur Verarbeitungswarteschlange hinzu
   * @param jobId ID des Jobs
   * @param targetPortals Array mit Zielportalen
   * @param scheduledFor Zeitpunkt der geplanten Veröffentlichung (optional)
   * @param priority Priorität (0 = normal, höhere Werte = höhere Priorität)
   * @returns ID des Warteschlangeneintrags
   */
  public async addToQueue(
    jobId: string,
    targetPortals: string[],
    scheduledFor?: Date,
    priority: number = 0
  ): Promise<string> {
    const db = await getDb();
    const id = uuidv4();
    const now = new Date().toISOString();
    
    // Bestimme den Status basierend auf dem Schedulingstatus
    const status: MovidoQueueItemStatus = scheduledFor && scheduledFor > new Date() 
      ? 'scheduled' 
      : 'pending';
    
    try {
      await db.run(
        `INSERT INTO movido_job_queue (
          id, job_id, status, target_portals, scheduled_for,
          priority, attempts, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          jobId,
          status,
          JSON.stringify(targetPortals),
          scheduledFor?.toISOString() || null,
          priority,
          0,
          now,
          now
        ]
      );
      
      return id;
    } catch (error) {
      console.error('Fehler beim Hinzufügen zur Movido-Warteschlange:', error);
      throw new Error('Fehler beim Hinzufügen des Jobs zur Warteschlange');
    }
  }
  
  /**
   * Aktualisiert den Status eines Warteschlangeneintrags
   * @param queueId ID des Warteschlangeneintrags
   * @param status Neuer Status
   * @param resultData Ergebnisdaten (optional)
   * @param errorMessage Fehlermeldung (optional)
   */
  public async updateQueueItemStatus(
    queueId: string,
    status: MovidoQueueItemStatus,
    resultData?: Record<string, any>,
    errorMessage?: string
  ): Promise<void> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    try {
      let attempts = 0;
      
      // Bei Fehlern die Anzahl der Versuche erhöhen
      if (status === 'failed') {
        const queueItem = await db.get(
          'SELECT attempts FROM movido_job_queue WHERE id = ?',
          [queueId]
        ) as { attempts: number } | undefined;
        
        if (queueItem) {
          attempts = queueItem.attempts + 1;
        }
      }
      
      await db.run(
        `UPDATE movido_job_queue SET 
          status = ?, 
          ${status === 'failed' ? 'attempts = ?,' : ''}
          ${status === 'failed' || status === 'processing' ? 'last_attempt_at = ?,' : ''}
          ${resultData ? 'result_data = ?,' : ''}
          ${errorMessage ? 'error_message = ?,' : ''}
          updated_at = ?
         WHERE id = ?`,
        [
          status,
          ...(status === 'failed' ? [attempts] : []),
          ...(status === 'failed' || status === 'processing' ? [now] : []),
          ...(resultData ? [JSON.stringify(resultData)] : []),
          ...(errorMessage ? [errorMessage] : []),
          now,
          queueId
        ]
      );
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Warteschlangenstatus:', error);
      throw new Error('Fehler beim Aktualisieren des Warteschlangenstatus');
    }
  }
  
  /**
   * Holt den nächsten zu verarbeitenden Job aus der Warteschlange
   * Berücksichtigt Priorität und geplanten Zeitpunkt
   * @returns Nächstes Warteschlangenelement oder null, wenn keines verfügbar
   */
  public async getNextQueueItem(): Promise<MovidoQueueItem | null> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    try {
      // Suche zunächst nach fälligen geplanten Jobs mit höchster Priorität
      let queueItemDb = await db.get(
        `SELECT * FROM movido_job_queue 
         WHERE status = 'scheduled' AND scheduled_for <= ? 
         ORDER BY priority DESC, scheduled_for ASC
         LIMIT 1`,
        [now]
      ) as any;
      
      // Wenn kein geplanter Job verfügbar, suche nach ausstehenden Jobs
      if (!queueItemDb) {
        queueItemDb = await db.get(
          `SELECT * FROM movido_job_queue 
           WHERE status = 'pending'
           ORDER BY priority DESC, created_at ASC
           LIMIT 1`
        ) as any;
      }
      
      if (!queueItemDb) return null;
      
      // Konvertiere JSON-Strings zurück zu Objekten und mappe Spaltennamen
      return {
        id: queueItemDb.id,
        jobId: queueItemDb.job_id,
        status: queueItemDb.status as MovidoQueueItemStatus,
        targetPortals: JSON.parse(queueItemDb.target_portals || '[]'),
        scheduledFor: queueItemDb.scheduled_for,
        priority: queueItemDb.priority,
        attempts: queueItemDb.attempts,
        lastAttemptAt: queueItemDb.last_attempt_at,
        errorMessage: queueItemDb.error_message,
        resultData: queueItemDb.result_data ? JSON.parse(queueItemDb.result_data) : undefined,
        createdAt: queueItemDb.created_at,
        updatedAt: queueItemDb.updated_at
      };
    } catch (error) {
      console.error('Fehler beim Abrufen des nächsten Warteschlangenelements:', error);
      return null;
    }
  }
  
  /**
   * Holt ein bestimmtes Warteschlangenelement
   * @param queueId ID des Warteschlangeneintrags
   * @returns Warteschlangenelement oder null, wenn nicht gefunden
   */
  public async getQueueItem(queueId: string): Promise<MovidoQueueItem | null> {
    const db = await getDb();
    
    try {
      const queueItemDb = await db.get(
        'SELECT * FROM movido_job_queue WHERE id = ?',
        [queueId]
      ) as any;
      
      if (!queueItemDb) return null;
      
      // Konvertiere JSON-Strings zurück zu Objekten und mappe Spaltennamen
      return {
        id: queueItemDb.id,
        jobId: queueItemDb.job_id,
        status: queueItemDb.status as MovidoQueueItemStatus,
        targetPortals: JSON.parse(queueItemDb.target_portals || '[]'),
        scheduledFor: queueItemDb.scheduled_for,
        priority: queueItemDb.priority,
        attempts: queueItemDb.attempts,
        lastAttemptAt: queueItemDb.last_attempt_at,
        errorMessage: queueItemDb.error_message,
        resultData: queueItemDb.result_data ? JSON.parse(queueItemDb.result_data) : undefined,
        createdAt: queueItemDb.created_at,
        updatedAt: queueItemDb.updated_at
      };
    } catch (error) {
      console.error('Fehler beim Abrufen des Warteschlangenelements:', error);
      return null;
    }
  }
  
  /**
   * Holt alle Warteschlangenelemente für einen bestimmten Job
   * @param jobId ID des Jobs
   * @returns Array mit Warteschlangenelementen
   */
  public async getQueueItemsByJobId(jobId: string): Promise<MovidoQueueItem[]> {
    const db = await getDb();
    
    try {
      const queueItemsDb = await db.all(
        'SELECT * FROM movido_job_queue WHERE job_id = ? ORDER BY created_at DESC',
        [jobId]
      ) as any[];
      
      // Konvertiere JSON-Strings zurück zu Objekten und mappe Spaltennamen
      return queueItemsDb.map((item: any) => ({
        id: item.id,
        jobId: item.job_id,
        status: item.status as MovidoQueueItemStatus,
        targetPortals: JSON.parse(item.target_portals || '[]'),
        scheduledFor: item.scheduled_for,
        priority: item.priority,
        attempts: item.attempts,
        lastAttemptAt: item.last_attempt_at,
        errorMessage: item.error_message,
        resultData: item.result_data ? JSON.parse(item.result_data) : undefined,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));
    } catch (error) {
      console.error('Fehler beim Abrufen der Warteschlangenelemente für Job:', error);
      return [];
    }
  }
  
  /**
   * Holt alle Warteschlangenelemente nach Status
   * @param status Status der Warteschlangenelemente
   * @param limit Maximale Anzahl der Ergebnisse
   * @returns Array mit Warteschlangenelementen
   */
  public async getQueueItemsByStatus(status: MovidoQueueItemStatus, limit: number = 50): Promise<MovidoQueueItem[]> {
    const db = await getDb();
    
    try {
      const queueItemsDb = await db.all(
        'SELECT * FROM movido_job_queue WHERE status = ? ORDER BY updated_at DESC LIMIT ?',
        [status, limit]
      ) as any[];
      
      // Konvertiere JSON-Strings zurück zu Objekten und mappe Spaltennamen
      return queueItemsDb.map((item: any) => ({
        id: item.id,
        jobId: item.job_id,
        status: item.status as MovidoQueueItemStatus,
        targetPortals: JSON.parse(item.target_portals || '[]'),
        scheduledFor: item.scheduled_for,
        priority: item.priority,
        attempts: item.attempts,
        lastAttemptAt: item.last_attempt_at,
        errorMessage: item.error_message,
        resultData: item.result_data ? JSON.parse(item.result_data) : undefined,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));
    } catch (error) {
      console.error(`Fehler beim Abrufen der Warteschlangenelemente mit Status ${status}:`, error);
      return [];
    }
  }
  
  /**
   * Aktualisiert die Priorität eines Warteschlangeneintrags
   * @param queueId ID des Warteschlangeneintrags
   * @param priority Neue Priorität
   */
  public async updateQueueItemPriority(queueId: string, priority: number): Promise<void> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    try {
      await db.run(
        'UPDATE movido_job_queue SET priority = ?, updated_at = ? WHERE id = ?',
        [priority, now, queueId]
      );
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Warteschlangenprioriät:', error);
      throw new Error('Fehler beim Aktualisieren der Warteschlangenprioriät');
    }
  }
  
  /**
   * Aktualisiert den geplanten Zeitpunkt eines Warteschlangeneintrags
   * @param queueId ID des Warteschlangeneintrags
   * @param scheduledFor Neuer geplanter Zeitpunkt
   */
  public async updateQueueItemSchedule(queueId: string, scheduledFor: Date): Promise<void> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    try {
      // Setze Status auf 'scheduled', wenn der Zeitpunkt in der Zukunft liegt,
      // andernfalls auf 'pending'
      const status: MovidoQueueItemStatus = scheduledFor > new Date() 
        ? 'scheduled' 
        : 'pending';
      
      await db.run(
        'UPDATE movido_job_queue SET scheduled_for = ?, status = ?, updated_at = ? WHERE id = ?',
        [scheduledFor.toISOString(), status, now, queueId]
      );
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Warteschlangenzeitplans:', error);
      throw new Error('Fehler beim Aktualisieren des Warteschlangenzeitplans');
    }
  }
  
  /**
   * Entfernt einen Eintrag aus der Warteschlange
   * @param queueId ID des Warteschlangeneintrags
   */
  public async removeFromQueue(queueId: string): Promise<void> {
    const db = await getDb();
    
    try {
      await db.run('DELETE FROM movido_job_queue WHERE id = ?', [queueId]);
    } catch (error) {
      console.error('Fehler beim Entfernen aus der Warteschlange:', error);
      throw new Error('Fehler beim Entfernen aus der Warteschlange');
    }
  }
  
  /**
   * Bereinigt alte, bereits verarbeitete oder fehlgeschlagene Einträge
   * @param olderThanDays Alter in Tagen (Standard: 30)
   * @returns Anzahl der bereinigten Einträge
   */
  public async cleanupQueue(olderThanDays: number = 30): Promise<number> {
    const db = await getDb();
    
    try {
      // Berechne Cutoff-Datum
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
      
      // Lösche alte, abgeschlossene oder fehlgeschlagene Einträge
      const result = await db.run(
        `DELETE FROM movido_job_queue 
         WHERE (status = 'completed' OR status = 'failed') 
         AND updated_at < ?`,
        [cutoffDate.toISOString()]
      );
      
      return result.changes || 0;
    } catch (error) {
      console.error('Fehler bei der Bereinigung der Warteschlange:', error);
      return 0;
    }
  }
  
  /**
   * Prüft, ob ein Job bereits in der Warteschlange ist
   * @param jobId ID des Jobs
   * @param statuses Array mit zu prüfenden Status (optional, Standard: alle)
   * @returns true, wenn der Job in der Warteschlange ist
   */
  public async isJobInQueue(
    jobId: string, 
    statuses?: MovidoQueueItemStatus[]
  ): Promise<boolean> {
    const db = await getDb();
    
    try {
      let query = 'SELECT COUNT(*) as count FROM movido_job_queue WHERE job_id = ?';
      const params: any[] = [jobId];
      
      // Füge Status-Filter hinzu, wenn angegeben
      if (statuses && statuses.length > 0) {
        query += ' AND status IN (' + statuses.map(() => '?').join(',') + ')';
        params.push(...statuses);
      }
      
      const result = await db.get(query, params) as { count: number };
      
      return result.count > 0;
    } catch (error) {
      console.error('Fehler beim Prüfen der Warteschlange:', error);
      return false;
    }
  }
  
  /**
   * Prüft geplante Jobs und setzt sie auf "pending", wenn ihr Zeitpunkt gekommen ist
   * @returns Anzahl der aktualisierten Jobs
   */
  public async processScheduledJobs(): Promise<number> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    try {
      const result = await db.run(
        `UPDATE movido_job_queue 
         SET status = 'pending', updated_at = ? 
         WHERE status = 'scheduled' AND scheduled_for <= ?`,
        [now, now]
      );
      
      return result.changes || 0;
    } catch (error) {
      console.error('Fehler bei der Verarbeitung geplanter Jobs:', error);
      return 0;
    }
  }
  
  /**
   * Gibt Statistiken zur Warteschlange zurück
   * @returns Statistiken (Anzahl pro Status)
   */
  public async getQueueStats(): Promise<Record<MovidoQueueItemStatus, number>> {
    const db = await getDb();
    
    try {
      const results = await db.all(
        'SELECT status, COUNT(*) as count FROM movido_job_queue GROUP BY status'
      ) as Array<{ status: MovidoQueueItemStatus; count: number }>;
      
      // Initialisiere alle Status mit 0
      const stats: Record<MovidoQueueItemStatus, number> = {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        scheduled: 0
      };
      
      // Fülle die tatsächlichen Werte ein
      results.forEach(row => {
        stats[row.status] = row.count;
      });
      
      return stats;
    } catch (error) {
      console.error('Fehler beim Abrufen der Warteschlangenstatistiken:', error);
      return {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        scheduled: 0
      };
    }
  }
}
