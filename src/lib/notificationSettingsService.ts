import { getDb } from '@/lib/db';
import { NotificationImportance, NotificationFrequency, AILevel, NotificationSettings, UpdateNotificationSettingsParams } from '@/types/notifications';

/**
 * Service für die Verwaltung von Benachrichtigungseinstellungen
 */
export class NotificationSettingsService {
  /**
   * Holt die Benachrichtigungseinstellungen für einen Benutzer
   */
  public async getSettingsForUser(userId: string): Promise<NotificationSettings | null> {
    const db = await getDb();
    
    const settings = await db.get(`
      SELECT * FROM notification_settings
      WHERE user_id = ?
    `, [userId]);
    
    if (!settings) {
      return null;
    }
    
    return this.mapDbSettingsToNotificationSettings(settings);
  }
  
  /**
   * Erstellt oder aktualisiert die Benachrichtigungseinstellungen eines Benutzers
   */
  public async updateSettings(userId: string, params: UpdateNotificationSettingsParams): Promise<NotificationSettings> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    // Prüfe, ob Einstellungen bereits existieren
    const existingSettings = await this.getSettingsForUser(userId);
    
    if (existingSettings) {
      // Aktualisieren bestehender Einstellungen
      const updates: string[] = [];
      const values: any[] = [];
      
      // Füge nur die Felder hinzu, die aktualisiert werden sollen
      if (params.emailEnabled !== undefined) {
        updates.push('email_enabled = ?');
        values.push(params.emailEnabled ? 1 : 0);
      }
      
      if (params.pushEnabled !== undefined) {
        updates.push('push_enabled = ?');
        values.push(params.pushEnabled ? 1 : 0);
      }
      
      if (params.smsEnabled !== undefined) {
        updates.push('sms_enabled = ?');
        values.push(params.smsEnabled ? 1 : 0);
      }
      
      if (params.notifyFollowup !== undefined) {
        updates.push('notify_followup = ?');
        values.push(params.notifyFollowup ? 1 : 0);
      }
      
      if (params.notifyApplications !== undefined) {
        updates.push('notify_applications = ?');
        values.push(params.notifyApplications ? 1 : 0);
      }
      
      if (params.notifyStatusChanges !== undefined) {
        updates.push('notify_status_changes = ?');
        values.push(params.notifyStatusChanges ? 1 : 0);
      }
      
      if (params.notifyDueActions !== undefined) {
        updates.push('notify_due_actions = ?');
        values.push(params.notifyDueActions ? 1 : 0);
      }
      
      if (params.notifyProfileSending !== undefined) {
        updates.push('notify_profile_sending = ?');
        values.push(params.notifyProfileSending ? 1 : 0);
      }
      
      if (params.notifyMatchings !== undefined) {
        updates.push('notify_matchings = ?');
        values.push(params.notifyMatchings ? 1 : 0);
      }
      
      if (params.frequency !== undefined) {
        updates.push('frequency = ?');
        values.push(params.frequency);
      }
      
      if (params.quietHoursStart !== undefined) {
        updates.push('quiet_hours_start = ?');
        values.push(params.quietHoursStart || null);
      }
      
      if (params.quietHoursEnd !== undefined) {
        updates.push('quiet_hours_end = ?');
        values.push(params.quietHoursEnd || null);
      }
      
      if (params.weekendDisabled !== undefined) {
        updates.push('weekend_disabled = ?');
        values.push(params.weekendDisabled ? 1 : 0);
      }
      
      if (params.minPriority !== undefined) {
        updates.push('min_priority = ?');
        values.push(params.minPriority);
      }
      
      if (params.aiModeEnabled !== undefined) {
        updates.push('ai_mode_enabled = ?');
        values.push(params.aiModeEnabled ? 1 : 0);
      }
      
      if (params.aiModeLevel !== undefined) {
        updates.push('ai_mode_level = ?');
        values.push(params.aiModeLevel);
      }
      
      if (params.aiFailureNotification !== undefined) {
        updates.push('ai_failure_notification = ?');
        values.push(params.aiFailureNotification ? 1 : 0);
      }
      
      // Immer das updated_at-Feld aktualisieren
      updates.push('updated_at = ?');
      values.push(now);
      
      // ID für die WHERE-Klausel
      values.push(existingSettings.id);
      
      // Führe die Aktualisierung durch
      await db.run(`
        UPDATE notification_settings
        SET ${updates.join(', ')}
        WHERE id = ?
      `, values);
      
      // Hole die aktualisierten Einstellungen
      return (await this.getSettingsForUser(userId))!;
    } else {
      // Einstellungen existieren noch nicht, erstelle neue
      const id = this.generateId();
      
      await db.run(`
        INSERT INTO notification_settings (
          id, user_id,
          email_enabled, push_enabled, sms_enabled,
          notify_followup, notify_applications, notify_status_changes,
          notify_due_actions, notify_profile_sending, notify_matchings,
          frequency,
          quiet_hours_start, quiet_hours_end, weekend_disabled,
          min_priority,
          ai_mode_enabled, ai_mode_level, ai_failure_notification,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id,
        userId,
        params.emailEnabled !== undefined ? (params.emailEnabled ? 1 : 0) : 1,
        params.pushEnabled !== undefined ? (params.pushEnabled ? 1 : 0) : 1,
        params.smsEnabled !== undefined ? (params.smsEnabled ? 1 : 0) : 0,
        params.notifyFollowup !== undefined ? (params.notifyFollowup ? 1 : 0) : 1,
        params.notifyApplications !== undefined ? (params.notifyApplications ? 1 : 0) : 1,
        params.notifyStatusChanges !== undefined ? (params.notifyStatusChanges ? 1 : 0) : 1,
        params.notifyDueActions !== undefined ? (params.notifyDueActions ? 1 : 0) : 1,
        params.notifyProfileSending !== undefined ? (params.notifyProfileSending ? 1 : 0) : 1,
        params.notifyMatchings !== undefined ? (params.notifyMatchings ? 1 : 0) : 1,
        params.frequency || 'instant',
        params.quietHoursStart || null,
        params.quietHoursEnd || null,
        params.weekendDisabled !== undefined ? (params.weekendDisabled ? 1 : 0) : 0,
        params.minPriority || 'normal',
        params.aiModeEnabled !== undefined ? (params.aiModeEnabled ? 1 : 0) : 0,
        params.aiModeLevel || 'assist',
        params.aiFailureNotification !== undefined ? (params.aiFailureNotification ? 1 : 0) : 1,
        now,
        now
      ]);
      
      // Hole die erstellten Einstellungen
      return (await this.getSettingsForUser(userId))!;
    }
  }
  
  /**
   * Löscht die Benachrichtigungseinstellungen eines Benutzers
   */
  public async deleteSettings(userId: string): Promise<boolean> {
    const db = await getDb();
    
    const result = await db.run(`
      DELETE FROM notification_settings
      WHERE user_id = ?
    `, [userId]);
    
    return result.changes > 0;
  }
  
  /**
   * Hilfsmethode zum Konvertieren von DB-Einstellungen in ein NotificationSettings-Objekt
   */
  private mapDbSettingsToNotificationSettings(dbSettings: any): NotificationSettings {
    return {
      id: dbSettings.id,
      userId: dbSettings.user_id,
      
      // Kanäle
      emailEnabled: Boolean(dbSettings.email_enabled),
      pushEnabled: Boolean(dbSettings.push_enabled),
      smsEnabled: Boolean(dbSettings.sms_enabled),
      
      // Typen
      notifyFollowup: Boolean(dbSettings.notify_followup),
      notifyApplications: Boolean(dbSettings.notify_applications),
      notifyStatusChanges: Boolean(dbSettings.notify_status_changes),
      notifyDueActions: Boolean(dbSettings.notify_due_actions),
      notifyProfileSending: Boolean(dbSettings.notify_profile_sending),
      notifyMatchings: Boolean(dbSettings.notify_matchings),
      
      // Häufigkeit
      frequency: dbSettings.frequency as NotificationFrequency,
      
      // Ruhige Zeiten
      quietHoursStart: dbSettings.quiet_hours_start,
      quietHoursEnd: dbSettings.quiet_hours_end,
      weekendDisabled: Boolean(dbSettings.weekend_disabled),
      
      // Priorität
      minPriority: dbSettings.min_priority as NotificationImportance,
      
      // KI-Modus
      aiModeEnabled: Boolean(dbSettings.ai_mode_enabled),
      aiModeLevel: dbSettings.ai_mode_level as AILevel,
      aiFailureNotification: Boolean(dbSettings.ai_failure_notification),
      
      createdAt: dbSettings.created_at,
      updatedAt: dbSettings.updated_at
    };
  }
  
  /**
   * Generiert eine einfache ID
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 10);
  }
}

// Singleton-Instanz
export const notificationSettingsService = new NotificationSettingsService();
