import { getDb } from '@/lib/db';

/**
 * Typen für Benachrichtigungen
 */
export interface Notification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  priority: 'high' | 'normal' | 'low';
  read: boolean;
  readAt?: string;
  link?: string;
  data?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Interface für Parameter zur Erstellung von Benachrichtigungen
 */
export interface CreateNotificationParams {
  user_id: string;
  title: string;
  message: string;
  entity_type?: string;
  entity_id?: string;
  action?: string;
  sender_id?: string;
  importance?: 'high' | 'normal' | 'low';
}

/**
 * Interface für Parameter zum Abrufen von Benachrichtigungen
 */
export interface GetNotificationsParams {
  user_id: string;
  unread_only?: boolean;
  limit?: number;
  offset?: number;
  entity_type?: string;
  entity_id?: string;
}

/**
 * Erstellt eine neue Benachrichtigung für einen Benutzer
 * @returns Die ID der erstellten Benachrichtigung
 */
export async function notifyUser(notification: {
  userId: string;
  title: string;
  message: string;
  type: string;
  priority?: 'high' | 'normal' | 'low';
  link?: string;
  data?: any;
}): Promise<string> {
  const db = await getDb();
  const now = new Date().toISOString();
  
  // Bereite die Daten vor
  const dataString = notification.data ? JSON.stringify(notification.data) : null;
  
  // Erstelle die Benachrichtigung
  const result = await db.run(`
    INSERT INTO notifications (
      user_id, title, message, type, priority, read, link, data,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    notification.userId,
    notification.title,
    notification.message,
    notification.type,
    notification.priority || 'normal',
    0, // Nicht gelesen
    notification.link || null,
    dataString,
    now,
    now
  ]);
  
  // Hole die ID der eingefügten Benachrichtigung
  const inserted = await db.get('SELECT id FROM notifications ORDER BY rowid DESC LIMIT 1');
  return inserted.id;
}

/**
 * Erstellt eine neue Benachrichtigung (alias für notifyUser mit angepasstem Interface)
 * @returns Die erstellte Benachrichtigung als Objekt
 */
export async function createNotification(params: CreateNotificationParams): Promise<Notification> {
  const db = await getDb();
  const now = new Date().toISOString();
  
  // Erstelle die Benachrichtigung
  const result = await db.run(`
    INSERT INTO notifications (
      user_id, title, message, entity_type, entity_id, action, sender_id, priority, read,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    params.user_id,
    params.title,
    params.message,
    params.entity_type || null,
    params.entity_id || null,
    params.action || null,
    params.sender_id || 'system',
    params.importance || 'normal',
    0, // Nicht gelesen
    now,
    now
  ]);
  
  // Hole die ID der eingefügten Benachrichtigung
  const inserted = await db.get('SELECT * FROM notifications ORDER BY rowid DESC LIMIT 1');
  
  return {
    id: inserted.id,
    userId: inserted.user_id,
    title: inserted.title,
    message: inserted.message,
    type: inserted.entity_type || '',
    priority: inserted.priority,
    read: Boolean(inserted.read),
    createdAt: inserted.created_at,
    updatedAt: inserted.updated_at
  };
}

/**
 * Holt Benachrichtigungen basierend auf den angegebenen Parametern
 */
export async function getNotifications(params: GetNotificationsParams): Promise<Notification[]> {
  const db = await getDb();
  
  // Baue die WHERE-Klausel basierend auf den Parametern
  const where = ['user_id = ?'];
  const queryParams = [params.user_id];
  
  if (params.unread_only) {
    where.push('read = 0');
  }
  
  if (params.entity_type) {
    where.push('entity_type = ?');
    queryParams.push(params.entity_type);
  }
  
  if (params.entity_id) {
    where.push('entity_id = ?');
    queryParams.push(params.entity_id);
  }
  
  // Füge LIMIT und OFFSET hinzu
  let limitOffset = '';
  if (params.limit) {
    limitOffset = ` LIMIT ${params.limit}`;
    
    if (params.offset) {
      limitOffset += ` OFFSET ${params.offset}`;
    }
  }
  
  // Führe die Abfrage aus
  const query = `
    SELECT * FROM notifications
    WHERE ${where.join(' AND ')}
    ORDER BY created_at DESC
    ${limitOffset}
  `;
  
  const notifications = await db.all(query, queryParams);
  
  // Konvertiere die Ergebnisse
  return notifications.map((n: any) => ({
    id: n.id,
    userId: n.user_id,
    title: n.title,
    message: n.message,
    type: n.entity_type || n.type || '',
    priority: n.priority,
    read: Boolean(n.read),
    readAt: n.read_at,
    link: n.link,
    data: n.data ? JSON.parse(n.data) : undefined,
    createdAt: n.created_at,
    updatedAt: n.updated_at
  }));
}

/**
 * Zählt die ungelesenen Benachrichtigungen eines Benutzers
 */
export async function countUnreadNotifications(userId: string): Promise<number> {
  const db = await getDb();
  
  const result = await db.get(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0',
    [userId]
  );
  
  return result.count;
}

/**
 * Markiert eine Benachrichtigung als gelesen
 */
export async function markNotificationAsRead(id: string): Promise<boolean> {
  const db = await getDb();
  const now = new Date().toISOString();
  
  const result = await db.run(`
    UPDATE notifications
    SET read = 1, read_at = ?, updated_at = ?
    WHERE id = ?
  `, [now, now, id]);
  
  return result.changes > 0;
}

/**
 * Markiert alle Benachrichtigungen eines Benutzers als gelesen
 */
export async function markAllNotificationsAsRead(userId: string): Promise<number> {
  const db = await getDb();
  const now = new Date().toISOString();
  
  const result = await db.run(`
    UPDATE notifications
    SET read = 1, read_at = ?, updated_at = ?
    WHERE user_id = ? AND read = 0
  `, [now, now, userId]);
  
  return result.changes;
}

/**
 * Ruft die Benachrichtigungen eines Benutzers ab
 */
export async function getUserNotifications(
  userId: string,
  options: {
    limit?: number;
    offset?: number;
    includeRead?: boolean;
    types?: string[];
  } = {}
): Promise<Notification[]> {
  const db = await getDb();
  
  // Baue die WHERE-Klausel basierend auf den Optionen
  const where = ['user_id = ?'];
  const params = [userId];
  
  if (!options.includeRead) {
    where.push('read = 0');
  }
  
  if (options.types && options.types.length > 0) {
    where.push(`type IN (${options.types.map(() => '?').join(', ')})`);
    params.push(...options.types);
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
    type: n.type,
    priority: n.priority,
    read: Boolean(n.read),
    readAt: n.read_at,
    link: n.link,
    data: n.data ? JSON.parse(n.data) : undefined,
    createdAt: n.created_at,
    updatedAt: n.updated_at
  }));
}

/**
 * Ruft die Anzahl der ungelesenen Benachrichtigungen für einen Benutzer ab
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const db = await getDb();
  
  const result = await db.get(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0',
    [userId]
  );
  
  return result.count;
}

/**
 * Löscht eine Benachrichtigung
 */
export async function deleteNotification(id: string): Promise<boolean> {
  const db = await getDb();
  
  const result = await db.run('DELETE FROM notifications WHERE id = ?', [id]);
  
  return result.changes > 0;
}

/**
 * Service-Klasse für Benachrichtigungen
 */
export const notificationService = {
  notifyUser,
  createNotification,
  getNotifications,
  countUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUserNotifications,
  getUnreadNotificationCount,
  deleteNotification
};
