'use server';

import { Notification, CreateNotificationParams, NotificationImportance } from '@/types/notifications';
import { getDb } from '@/lib/db';

/**
 * Service für Echtzeit-Benachrichtigungen
 * 
 * Dieser Service verwaltet Benachrichtigungen in Echtzeit und interagiert 
 * mit der Datenbank. Er dient als Brücke zwischen dem socketIoService und
 * der Datenbank.
 * 
 * HINWEIS: Dieser Service ist serverseitig und sollte nicht direkt im Browser aufgerufen werden.
 */
class RealtimeNotificationService {
  private static instance: RealtimeNotificationService;
  private activeClients: Map<string, Set<string>> = new Map(); // userId -> Set<clientId>
  
  constructor() {
    if (RealtimeNotificationService.instance) {
      return RealtimeNotificationService.instance;
    }
    RealtimeNotificationService.instance = this;
  }
  
  /**
   * Registriert einen neuen Client
   * @param userId Benutzer-ID
   * @param clientId Client-ID
   */
  registerClient(userId: string, clientId: string): void {
    if (!this.activeClients.has(userId)) {
      this.activeClients.set(userId, new Set());
    }
    
    this.activeClients.get(userId)?.add(clientId);
    console.log(`Client ${clientId} für Benutzer ${userId} registriert (${this.getClientCount(userId)} Clients)`);
  }
  
  /**
   * Meldet einen Client ab
   * @param userId Benutzer-ID
   * @param clientId Client-ID
   */
  unregisterClient(userId: string, clientId: string): void {
    const userClients = this.activeClients.get(userId);
    
    if (userClients) {
      userClients.delete(clientId);
      
      if (userClients.size === 0) {
        this.activeClients.delete(userId);
      }
      
      console.log(`Client ${clientId} für Benutzer ${userId} abgemeldet (${this.getClientCount(userId)} Clients übrig)`);
    }
  }
  
  /**
   * Gibt die Anzahl der aktiven Clients eines Benutzers zurück
   * @param userId Benutzer-ID
   * @returns Anzahl der aktiven Clients
   */
  getClientCount(userId: string): number {
    return this.activeClients.get(userId)?.size || 0;
  }
  
  /**
   * Gibt zurück, ob ein Benutzer aktive Clients hat
   * @param userId Benutzer-ID
   * @returns True, wenn der Benutzer aktive Clients hat
   */
  hasActiveClients(userId: string): boolean {
    return this.getClientCount(userId) > 0;
  }
  
  /**
   * Erstellt eine neue Benachrichtigung in der Datenbank
   * @param params Parameter für die Benachrichtigung
   * @returns Die erstellte Benachrichtigung
   */
  async createNotification(params: CreateNotificationParams): Promise<Notification> {
    try {
      const db = await getDb();
      
      const notification: Notification = {
        id: crypto.randomUUID(),
        title: params.title,
        message: params.message,
        user_id: params.user_id,
        entity_type: params.entity_type,
        entity_id: params.entity_id,
        action: params.action,
        sender_id: params.sender_id,
        importance: params.importance || 'normal',
        created_at: new Date().toISOString(),
        read: false
      };
      
      await db.exec(`
        INSERT INTO notifications (
          id, title, message, user_id, entity_type, entity_id, 
          action, sender_id, importance, created_at, read
        ) VALUES (
          ?, ?, ?, ?, ?, ?, 
          ?, ?, ?, ?, ?
        )
      `, [
        notification.id,
        notification.title,
        notification.message,
        notification.user_id,
        notification.entity_type,
        notification.entity_id,
        notification.action,
        notification.sender_id,
        notification.importance,
        notification.created_at,
        notification.read ? 1 : 0
      ]);
      
      return notification;
    } catch (error) {
      console.error('Fehler beim Erstellen der Benachrichtigung:', error);
      throw error;
    }
  }
  
  /**
   * Ruft die neuesten Benachrichtigungen für einen Benutzer ab
   * @param userId Benutzer-ID
   * @param limit Anzahl der abzurufenden Benachrichtigungen
   * @returns Liste von Benachrichtigungen
   */
  async getLatestNotifications(userId: string, limit: number = 30): Promise<Notification[]> {
    try {
      const db = await getDb();
      
      const notifications = await db.all(`
        SELECT * FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ?
      `, [userId, limit]);
      
      return notifications || [];
    } catch (error) {
      console.error('Fehler beim Abrufen der Benachrichtigungen:', error);
      return [];
    }
  }
  
  /**
   * Gibt die Anzahl der ungelesenen Benachrichtigungen eines Benutzers zurück
   * @param userId Benutzer-ID
   * @returns Anzahl der ungelesenen Benachrichtigungen
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const db = await getDb();
      
      const result = await db.get(`
        SELECT COUNT(*) as count FROM notifications
        WHERE user_id = ? AND read = 0
      `, [userId]);
      
      return result?.count || 0;
    } catch (error) {
      console.error('Fehler beim Zählen der ungelesenen Benachrichtigungen:', error);
      return 0;
    }
  }
  
  /**
   * Markiert eine Benachrichtigung als gelesen
   * @param id Benachrichtigungs-ID
   * @returns True, wenn die Benachrichtigung erfolgreich markiert wurde
   */
  async markAsRead(id: string): Promise<boolean> {
    try {
      const db = await getDb();
      
      const now = new Date().toISOString();
      
      await db.run(`
        UPDATE notifications
        SET read = 1, read_at = ?
        WHERE id = ?
      `, [now, id]);
      
      return true;
    } catch (error) {
      console.error('Fehler beim Markieren der Benachrichtigung als gelesen:', error);
      return false;
    }
  }
  
  /**
   * Markiert alle Benachrichtigungen eines Benutzers als gelesen
   * @param userId Benutzer-ID
   * @returns Anzahl der markierten Benachrichtigungen
   */
  async markAllAsRead(userId: string): Promise<number> {
    try {
      const db = await getDb();
      
      const now = new Date().toISOString();
      
      const result = await db.run(`
        UPDATE notifications
        SET read = 1, read_at = ?
        WHERE user_id = ? AND read = 0
      `, [now, userId]);
      
      // Die Anzahl der aktualisierten Zeilen zurückgeben
      return result?.changes || 0;
    } catch (error) {
      console.error('Fehler beim Markieren aller Benachrichtigungen als gelesen:', error);
      return 0;
    }
  }
  
  /**
   * Löscht alte gelesene Benachrichtigungen eines Benutzers
   * @param userId Benutzer-ID
   * @param daysToKeep Anzahl der Tage, die Benachrichtigungen behalten werden sollen
   * @returns Anzahl der gelöschten Benachrichtigungen
   */
  async cleanupOldNotifications(userId: string, daysToKeep: number = 30): Promise<number> {
    try {
      const db = await getDb();
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      const result = await db.run(`
        DELETE FROM notifications
        WHERE user_id = ? AND read = 1 AND read_at < ?
      `, [userId, cutoffDate.toISOString()]);
      
      // Die Anzahl der gelöschten Zeilen zurückgeben
      return result?.changes || 0;
    } catch (error) {
      console.error('Fehler beim Löschen alter Benachrichtigungen:', error);
      return 0;
    }
  }
}

// Singleton-Instanz exportieren
export const realtimeNotificationService = new RealtimeNotificationService();
