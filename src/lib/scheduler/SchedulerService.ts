import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import {
  ScheduledTask,
  TaskType,
  TaskStatus,
  IntervalType,
  IntervalUnit,
  EntityType,
  ScheduledTaskOptions,
  CustomSchedule,
  LogAction,
  SchedulerLog
} from '@/types/scheduler';
import { addMinutes, addHours, addDays, addWeeks, parseISO, format, isBefore } from 'date-fns';
import { de } from 'date-fns/locale';

/**
 * Hauptservice zur Verwaltung von geplanten Aufgaben (Scheduler)
 */
export class SchedulerService {
  /**
   * Erstellt eine neue geplante Aufgabe
   * 
   * @param task Die zu erstellende Aufgabe (ohne ID, createdAt, updatedAt)
   * @returns Die ID der erstellten Aufgabe
   */
  public async createTask(taskData: Omit<ScheduledTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const db = await getDb();
    const now = new Date().toISOString();
    const taskId = uuidv4();
    
    // Berechne nextRun basierend auf scheduledFor und Intervalltyp
    const nextRun = taskData.scheduledFor;
    
    // Füge die Aufgabe in die Datenbank ein
    await db.run(`
      INSERT INTO scheduled_tasks (
        id, task_type, status, scheduled_for, interval_type, interval_value, interval_unit,
        custom_schedule, config, entity_id, entity_type, created_at, updated_at, next_run
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      taskId,
      taskData.taskType,
      taskData.status || 'pending',
      taskData.scheduledFor,
      taskData.intervalType || null,
      taskData.intervalValue || null,
      taskData.intervalUnit || null,
      taskData.customSchedule || null,
      taskData.config || null,
      taskData.entityId || null,
      taskData.entityType || null,
      now,
      now,
      nextRun
    ]);
    
    // Protokolliere die Erstellung
    await this.logTaskAction(taskId, taskData.taskType, 'start', 'pending');
    
    return taskId;
  }
  
  /**
   * Aktualisiert den Status einer geplanten Aufgabe
   * 
   * @param taskId Die ID der Aufgabe
   * @param status Der neue Status
   * @param result Optionales Ergebnis der Ausführung
   * @param error Optionale Fehlermeldung
   * @returns true, wenn die Aktualisierung erfolgreich war, sonst false
   */
  public async updateTaskStatus(
    taskId: string,
    status: TaskStatus,
    result?: string,
    error?: string
  ): Promise<boolean> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    const params: any[] = [status, now];
    let sql = `
      UPDATE scheduled_tasks
      SET status = ?, updated_at = ?
    `;
    
    if (status === 'completed' || status === 'failed') {
      sql += ', last_run = ?';
      params.push(now);
      
      if (result) {
        sql += ', result = ?';
        params.push(result);
      }
      
      if (error) {
        sql += ', error = ?';
        params.push(error);
      }
      
      // Wenn die Aufgabe abgeschlossen oder fehlgeschlagen ist und wiederkehrend,
      // berechne den nächsten Ausführungszeitpunkt
      const task = await this.getTaskById(taskId);
      if (task && task.intervalType && task.intervalType !== 'once') {
        const nextRun = await this.calculateNextRun(task);
        if (nextRun) {
          sql += ', next_run = ?, status = ?';
          params.push(nextRun);
          params.push('pending'); // Setze den Status für die nächste Ausführung zurück
        }
      }
    }
    
    sql += ' WHERE id = ?';
    params.push(taskId);
    
    const result2 = await db.run(sql, params);
    
    if (result2.changes > 0) {
      // Protokolliere die Aktion
      const action: LogAction = 
        status === 'completed' ? 'complete' :
        status === 'failed' ? 'fail' :
        status === 'cancelled' ? 'cancel' :
        'start';
      
      await this.logTaskAction(taskId, (await this.getTaskById(taskId))?.taskType || 'custom', action, status, {
        result,
        error
      });
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Aktualisiert eine geplante Aufgabe
   * 
   * @param taskId Die ID der Aufgabe
   * @param taskData Die zu aktualisierenden Daten
   * @returns true, wenn die Aktualisierung erfolgreich war, sonst false
   */
  public async updateTask(
    taskId: string,
    taskData: Partial<Omit<ScheduledTask, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<boolean> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    const updates: string[] = [];
    const params: any[] = [];
    
    // Füge alle zu aktualisierenden Felder hinzu
    if (taskData.taskType !== undefined) {
      updates.push('task_type = ?');
      params.push(taskData.taskType);
    }
    
    if (taskData.status !== undefined) {
      updates.push('status = ?');
      params.push(taskData.status);
    }
    
    if (taskData.scheduledFor !== undefined) {
      updates.push('scheduled_for = ?');
      params.push(taskData.scheduledFor);
    }
    
    if (taskData.intervalType !== undefined) {
      updates.push('interval_type = ?');
      params.push(taskData.intervalType);
    }
    
    if (taskData.intervalValue !== undefined) {
      updates.push('interval_value = ?');
      params.push(taskData.intervalValue);
    }
    
    if (taskData.intervalUnit !== undefined) {
      updates.push('interval_unit = ?');
      params.push(taskData.intervalUnit);
    }
    
    if (taskData.customSchedule !== undefined) {
      updates.push('custom_schedule = ?');
      params.push(taskData.customSchedule);
    }
    
    if (taskData.config !== undefined) {
      updates.push('config = ?');
      params.push(taskData.config);
    }
    
    if (taskData.entityId !== undefined) {
      updates.push('entity_id = ?');
      params.push(taskData.entityId);
    }
    
    if (taskData.entityType !== undefined) {
      updates.push('entity_type = ?');
      params.push(taskData.entityType);
    }
    
    if (taskData.nextRun !== undefined) {
      updates.push('next_run = ?');
      params.push(taskData.nextRun);
    }
    
    if (taskData.lastRun !== undefined) {
      updates.push('last_run = ?');
      params.push(taskData.lastRun);
    }
    
    if (taskData.result !== undefined) {
      updates.push('result = ?');
      params.push(taskData.result);
    }
    
    if (taskData.error !== undefined) {
      updates.push('error = ?');
      params.push(taskData.error);
    }
    
    // Aktualisierte Zeitstempel
    updates.push('updated_at = ?');
    params.push(now);
    
    // ID für die WHERE-Klausel
    params.push(taskId);
    
    if (updates.length === 0) {
      return false; // Nichts zu aktualisieren
    }
    
    const result = await db.run(`
      UPDATE scheduled_tasks
      SET ${updates.join(', ')}
      WHERE id = ?
    `, params);
    
    if (result.changes > 0) {
      // Protokolliere die Aktualisierung
      await this.logTaskAction(
        taskId,
        (await this.getTaskById(taskId))?.taskType || 'custom',
        'start',
        taskData.status || 'pending'
      );
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Löscht eine geplante Aufgabe
   * 
   * @param taskId Die ID der Aufgabe
   * @returns true, wenn die Löschung erfolgreich war, sonst false
   */
  public async deleteTask(taskId: string): Promise<boolean> {
    const db = await getDb();
    
    // Protokolliere die Löschung vor dem tatsächlichen Löschen
    const task = await this.getTaskById(taskId);
    if (task) {
      await this.logTaskAction(taskId, task.taskType, 'cancel', 'cancelled');
    }
    
    const result = await db.run('DELETE FROM scheduled_tasks WHERE id = ?', [taskId]);
    
    return result.changes > 0;
  }
  
  /**
   * Holt eine geplante Aufgabe anhand ihrer ID
   * 
   * @param taskId Die ID der Aufgabe
   * @returns Die Aufgabe oder null, wenn nicht gefunden
   */
  public async getTaskById(taskId: string): Promise<ScheduledTask | null> {
    const db = await getDb();
    
    const task = await db.get('SELECT * FROM scheduled_tasks WHERE id = ?', [taskId]);
    
    if (!task) {
      return null;
    }
    
    return this.mapDbTaskToScheduledTask(task);
  }
  
  /**
   * Holt geplante Aufgaben mit Filteroptionen
   * 
   * @param options Filteroptionen
   * @returns Array von geplanten Aufgaben
   */
  public async getTasks(options: ScheduledTaskOptions = {}): Promise<ScheduledTask[]> {
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
      SELECT * FROM scheduled_tasks
      ${where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY next_run ASC
      ${limitOffset}
    `;
    
    const tasks = await db.all(query, params);
    
    // Konvertiere die Ergebnisse
    return tasks.map(this.mapDbTaskToScheduledTask);
  }
  
  /**
   * Holt die nächsten anstehenden Aufgaben
   * 
   * @param limit Maximale Anzahl der Aufgaben
   * @returns Array von anstehenden Aufgaben
   */
  public async getNextPendingTasks(limit: number = 10): Promise<ScheduledTask[]> {
    const now = new Date().toISOString();
    
    return this.getTasks({
      status: 'pending',
      fromDate: now,
      limit
    });
  }
  
  /**
   * Holt alle fälligen Aufgaben, die noch nicht ausgeführt wurden
   * 
   * @returns Array von fälligen Aufgaben
   */
  public async getDueTasks(): Promise<ScheduledTask[]> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    const tasks = await db.all(`
      SELECT * FROM scheduled_tasks
      WHERE status = 'pending' AND next_run <= ?
      ORDER BY next_run ASC
    `, [now]);
    
    return tasks.map(this.mapDbTaskToScheduledTask);
  }
  
  /**
   * Berechnet den nächsten Ausführungszeitpunkt für eine Aufgabe
   * 
   * @param task Die Aufgabe
   * @returns Der nächste Ausführungszeitpunkt oder null, wenn keine Wiederholung geplant ist
   */
  public async calculateNextRun(task: ScheduledTask): Promise<string | null> {
    // Wenn die Aufgabe einmalig ist, gibt es keinen nächsten Ausführungszeitpunkt
    if (task.intervalType === 'once' || !task.intervalType) {
      return null;
    }
    
    let baseDate = new Date();
    
    // Wenn lastRun existiert, nutze diesen als Basis, andernfalls scheduledFor
    if (task.lastRun) {
      baseDate = parseISO(task.lastRun);
    } else if (task.scheduledFor) {
      baseDate = parseISO(task.scheduledFor);
    }
    
    // Berechnung basierend auf dem Intervalltyp
    let nextDate: Date;
    
    switch (task.intervalType) {
      case 'hourly':
        nextDate = addHours(baseDate, task.intervalValue || 1);
        break;
        
      case 'daily':
        nextDate = addDays(baseDate, task.intervalValue || 1);
        break;
        
      case 'weekly':
        nextDate = addWeeks(baseDate, task.intervalValue || 1);
        break;
        
      case 'monthly':
        // Für monatliche Intervalle verwenden wir 30 Tage als Näherung
        nextDate = addDays(baseDate, (task.intervalValue || 1) * 30);
        break;
        
      case 'custom':
        if (task.customSchedule) {
          nextDate = this.calculateCustomScheduleNextRun(baseDate, JSON.parse(task.customSchedule));
        } else {
          // Fallback auf täglich, wenn kein benutzerdefinierter Zeitplan vorhanden ist
          nextDate = addDays(baseDate, 1);
        }
        break;
        
      default:
        // Fallback auf täglich
        nextDate = addDays(baseDate, 1);
    }
    
    // Wenn der berechnete Zeitpunkt in der Vergangenheit liegt, setze ihn auf jetzt + 5 Minuten
    if (isBefore(nextDate, new Date())) {
      nextDate = addMinutes(new Date(), 5);
    }
    
    return nextDate.toISOString();
  }
  
  /**
   * Berechnet den nächsten Ausführungszeitpunkt für einen benutzerdefinierten Zeitplan
   * 
   * @param baseDate Das Basisdatum
   * @param schedule Der benutzerdefinierte Zeitplan
   * @returns Der nächste Ausführungszeitpunkt
   */
  private calculateCustomScheduleNextRun(baseDate: Date, schedule: CustomSchedule): Date {
    // Diese Implementierung ist vereinfacht und deckt nur grundlegende Fälle ab
    // Eine vollständige Implementierung würde auch Zeitzonen, spezifische Daten usw. berücksichtigen
    
    let nextDate = new Date(baseDate);
    
    // Standardmäßig füge einen Tag hinzu
    nextDate = addDays(nextDate, 1);
    
    // Setze die Stunde, wenn angegeben
    if (schedule.hours && schedule.hours.length > 0) {
      // Finde die nächste Stunde, die nach der aktuellen Uhrzeit liegt
      const currentHour = baseDate.getHours();
      const nextHour = schedule.hours.find(h => h > currentHour);
      
      if (nextHour !== undefined) {
        // Setze die Stunde auf die nächste geplante Stunde
        nextDate.setHours(nextHour, 0, 0, 0);
      } else if (schedule.hours.length > 0) {
        // Wenn keine Stunde nach der aktuellen gefunden wurde, verwende die erste Stunde des nächsten Tages
        nextDate = addDays(baseDate, 1);
        nextDate.setHours(schedule.hours[0], 0, 0, 0);
      }
    }
    
    // Prüfe, ob der Tag der Woche passt, wenn angegeben
    if (schedule.days && schedule.days.length > 0) {
      const currentDayOfWeek = nextDate.getDay(); // 0 = Sonntag, 1 = Montag, ...
      
      // Finde den nächsten Tag, der nach dem aktuellen Tag liegt und in der Liste enthalten ist
      let daysToAdd = 0;
      let found = false;
      
      for (let i = 1; i <= 7; i++) {
        const checkDay = (currentDayOfWeek + i) % 7;
        if (schedule.days.includes(checkDay)) {
          daysToAdd = i;
          found = true;
          break;
        }
      }
      
      if (found) {
        nextDate = addDays(nextDate, daysToAdd);
      }
    }
    
    // Spezifische Daten haben Vorrang
    if (schedule.specificDates && schedule.specificDates.length > 0) {
      const now = new Date();
      
      // Finde das nächste spezifische Datum, das in der Zukunft liegt
      const futureDates = schedule.specificDates
        .map(dateStr => new Date(dateStr))
        .filter(date => date > now)
        .sort((a, b) => a.getTime() - b.getTime());
      
      if (futureDates.length > 0) {
        nextDate = futureDates[0];
      }
    }
    
    // Ausgeschlossene Daten berücksichtigen
    if (schedule.excludeDates && schedule.excludeDates.length > 0) {
      // Wenn nextDate in der Liste der ausgeschlossenen Daten ist, füge einen Tag hinzu
      const excludeDatesStr = schedule.excludeDates.map(d => format(new Date(d), 'yyyy-MM-dd'));
      const nextDateStr = format(nextDate, 'yyyy-MM-dd');
      
      if (excludeDatesStr.includes(nextDateStr)) {
        nextDate = addDays(nextDate, 1);
        // Rekursiv prüfen, falls auch der nächste Tag ausgeschlossen ist
        return this.calculateCustomScheduleNextRun(nextDate, schedule);
      }
    }
    
    return nextDate;
  }
  
  /**
   * Protokolliert eine Aktion für eine Aufgabe
   * 
   * @param taskId Die ID der Aufgabe
   * @param taskType Der Typ der Aufgabe
   * @param action Die Aktion
   * @param status Der Status
   * @param details Optionale Details
   */
  public async logTaskAction(
    taskId: string,
    taskType: TaskType,
    action: LogAction,
    status: TaskStatus,
    details: any = null
  ): Promise<void> {
    const db = await getDb();
    const now = new Date().toISOString();
    const logId = uuidv4();
    
    await db.run(`
      INSERT INTO scheduler_logs (
        id, task_id, task_type, action, status, details, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      logId,
      taskId,
      taskType,
      action,
      status,
      details ? JSON.stringify(details) : null,
      now
    ]);
  }
  
  /**
   * Holt die Logs für eine Aufgabe
   * 
   * @param taskId Die ID der Aufgabe
   * @param limit Maximale Anzahl der Logs
   * @returns Array von Logs
   */
  public async getTaskLogs(taskId: string, limit: number = 10): Promise<SchedulerLog[]> {
    const db = await getDb();
    
    const logs = await db.all(`
      SELECT * FROM scheduler_logs
      WHERE task_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `, [taskId, limit]);
    
    return logs.map(this.mapDbLogToSchedulerLog);
  }
  
  /**
   * Konvertiert ein Datenbank-Objekt in ein ScheduledTask-Objekt
   * 
   * @param dbTask Das Datenbank-Objekt
   * @returns Das ScheduledTask-Objekt
   */
  private mapDbTaskToScheduledTask(dbTask: any): ScheduledTask {
    return {
      id: dbTask.id,
      taskType: dbTask.task_type as TaskType,
      status: dbTask.status as TaskStatus,
      scheduledFor: dbTask.scheduled_for,
      intervalType: dbTask.interval_type as IntervalType | undefined,
      intervalValue: dbTask.interval_value as number | undefined,
      intervalUnit: dbTask.interval_unit as IntervalUnit | undefined,
      customSchedule: dbTask.custom_schedule,
      config: dbTask.config,
      entityId: dbTask.entity_id,
      entityType: dbTask.entity_type as EntityType | undefined,
      createdAt: dbTask.created_at,
      updatedAt: dbTask.updated_at,
      lastRun: dbTask.last_run,
      nextRun: dbTask.next_run,
      result: dbTask.result,
      error: dbTask.error
    };
  }
  
  /**
   * Konvertiert ein Datenbank-Objekt in ein SchedulerLog-Objekt
   * 
   * @param dbLog Das Datenbank-Objekt
   * @returns Das SchedulerLog-Objekt
   */
  private mapDbLogToSchedulerLog(dbLog: any): SchedulerLog {
    return {
      id: dbLog.id,
      taskId: dbLog.task_id,
      taskType: dbLog.task_type as TaskType,
      action: dbLog.action as LogAction,
      status: dbLog.status as TaskStatus,
      details: dbLog.details,
      createdAt: dbLog.created_at
    };
  }
}

// Export der Singleton-Instanz für einfachen Zugriff
export const schedulerService = new SchedulerService();
