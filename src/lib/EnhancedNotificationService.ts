import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { notificationService } from './notificationService';
import { CreateNotificationParams } from './notificationService';
import { MatchEntityType } from '@/types/customerRequirementMatch';

/**
 * Erweiterte Parameter für Benachrichtigungen mit Direktlinks
 */
export interface EnhancedNotificationParams extends CreateNotificationParams {
  link_type?: string;
  link_entity_type?: MatchEntityType;
  link_entity_id?: string;
  secondary_link_type?: string;
  secondary_link_entity_type?: MatchEntityType;
  secondary_link_entity_id?: string;
}

/**
 * Service-Klasse für erweiterte Benachrichtigungen mit Direktlinks
 */
class EnhancedNotificationService {
  /**
   * Erstellt eine erweiterte Benachrichtigung mit Direktlinks
   */
  public async createEnhancedNotification(params: EnhancedNotificationParams): Promise<any> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    try {
      // Erstelle zunächst die Basis-Benachrichtigung
      const notification = await notificationService.createNotification({
        user_id: params.user_id,
        title: params.title,
        message: params.message,
        entity_type: params.entity_type,
        entity_id: params.entity_id,
        action: params.action,
        sender_id: params.sender_id,
        importance: params.importance
      });
      
      // Falls keine zusätzlichen Link-Daten vorhanden sind, einfach zurückgeben
      if (!params.link_type && !params.link_entity_type && !params.link_entity_id &&
          !params.secondary_link_type && !params.secondary_link_entity_type && !params.secondary_link_entity_id) {
        return notification;
      }
      
      // Aktualisiere die Benachrichtigung mit den zusätzlichen Link-Daten
      await db.run(`
        UPDATE notifications
        SET 
          link_type = ?,
          link_entity_type = ?,
          link_entity_id = ?,
          secondary_link_type = ?,
          secondary_link_entity_type = ?,
          secondary_link_entity_id = ?,
          updated_at = ?
        WHERE id = ?
      `, [
        params.link_type || null,
        params.link_entity_type || null,
        params.link_entity_id || null,
        params.secondary_link_type || null,
        params.secondary_link_entity_type || null,
        params.secondary_link_entity_id || null,
        now,
        notification.id
      ]);
      
      // Lese die aktualisierte Benachrichtigung zurück
      const updatedNotification = await db.get('SELECT * FROM notifications WHERE id = ?', [notification.id]);
      
      return {
        ...updatedNotification,
        read: Boolean(updatedNotification.read)
      };
    } catch (error) {
      console.error('Fehler beim Erstellen der erweiterten Benachrichtigung:', error);
      throw error;
    }
  }
  
  /**
   * Fügt Link-Informationen zu einer bestehenden Benachrichtigung hinzu
   */
  public async addLinksToNotification(
    notificationId: string,
    links: {
      link_type?: string;
      link_entity_type?: MatchEntityType;
      link_entity_id?: string;
      secondary_link_type?: string;
      secondary_link_entity_type?: MatchEntityType;
      secondary_link_entity_id?: string;
    }
  ): Promise<boolean> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    try {
      const result = await db.run(`
        UPDATE notifications
        SET 
          link_type = ?,
          link_entity_type = ?,
          link_entity_id = ?,
          secondary_link_type = ?,
          secondary_link_entity_type = ?,
          secondary_link_entity_id = ?,
          updated_at = ?
        WHERE id = ?
      `, [
        links.link_type || null,
        links.link_entity_type || null,
        links.link_entity_id || null,
        links.secondary_link_type || null,
        links.secondary_link_entity_type || null,
        links.secondary_link_entity_id || null,
        now,
        notificationId
      ]);
      
      return result.changes > 0;
    } catch (error) {
      console.error('Fehler beim Hinzufügen von Links zur Benachrichtigung:', error);
      return false;
    }
  }
  
  /**
   * Holt erweiterte Benachrichtigungen mit Link-Informationen
   */
  public async getEnhancedNotifications(userId: string, options: {
    unreadOnly?: boolean;
    limit?: number;
    offset?: number;
    entityType?: string;
    entityId?: string;
  } = {}): Promise<any[]> {
    const db = await getDb();
    
    // Baue die WHERE-Klausel basierend auf den Optionen
    const where = ['user_id = ?'];
    const params = [userId];
    
    if (options.unreadOnly) {
      where.push('read = 0');
    }
    
    if (options.entityType) {
      where.push('entity_type = ?');
      params.push(options.entityType);
    }
    
    if (options.entityId) {
      where.push('entity_id = ?');
      params.push(options.entityId);
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
      SELECT * FROM notifications
      WHERE ${where.join(' AND ')}
      ORDER BY created_at DESC
      ${limitOffset}
    `;
    
    const notifications = await db.all(query, params);
    
    // Konvertiere die Ergebnisse
    return notifications.map((n: any) => ({
      id: n.id,
      userId: n.user_id,
      title: n.title,
      message: n.message,
      entityType: n.entity_type,
      entityId: n.entity_id,
      action: n.action,
      priority: n.priority,
      read: Boolean(n.read),
      readAt: n.read_at,
      linkType: n.link_type,
      linkEntityType: n.link_entity_type,
      linkEntityId: n.link_entity_id,
      secondaryLinkType: n.secondary_link_type,
      secondaryLinkEntityType: n.secondary_link_entity_type,
      secondaryLinkEntityId: n.secondary_link_entity_id,
      createdAt: n.created_at,
      updatedAt: n.updated_at
    }));
  }
}

// Exportiere eine Instanz als Singleton
export const enhancedNotificationService = new EnhancedNotificationService();
