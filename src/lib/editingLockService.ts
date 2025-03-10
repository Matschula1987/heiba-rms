import { getDb } from '@/lib/db';

// Datenbankschema-Interface
interface DbEditingLock {
  id: string;
  entity_id: string;
  entity_type: string;
  user_id: string;
  user_name: string;
  locked_at: string;
  expires_at: string;
  active: number;
  created_at: string;
  updated_at: string;
}

export interface EditingLock {
  id: string;
  entityId: string;
  entityType: string;
  userId: string;
  userName: string;
  lockedAt: string;
  expiresAt: string;
  active: boolean;
}

export interface LockRequest {
  entityId: string;
  entityType: string;
  userId: string;
  userName: string;
  durationMinutes?: number;
}

/**
 * Service für die Verwaltung von Bearbeitungssperren
 * Verhindert, dass mehrere Benutzer gleichzeitig dasselbe Element bearbeiten
 */
export class EditingLockService {
  private DEFAULT_LOCK_DURATION = 15; // 15 Minuten
  
  /**
   * Erstellt eine Bearbeitungssperre
   */
  public async createLock(request: LockRequest): Promise<EditingLock | null> {
    const db = await getDb();
    const now = new Date();
    
    // Prüfe, ob bereits eine aktive Sperre für dieses Element existiert
    const existingLock = await this.getActiveLock(request.entityId, request.entityType);
    
    if (existingLock && existingLock.userId !== request.userId) {
      // Jemand anderes hat bereits eine Sperre
      return existingLock;
    }
    
    // Wenn die gleiche Person eine Sperre hat, verlängern wir sie
    if (existingLock && existingLock.userId === request.userId) {
      return await this.extendLock(existingLock.id);
    }
    
    // Keine existierende Sperre, erstelle eine neue
    const durationMinutes = request.durationMinutes || this.DEFAULT_LOCK_DURATION;
    const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000);
    
    // Generiere eine eindeutige ID
    const id = this.generateId();
    
    // Füge die Sperre in die Datenbank ein
    await db.run(`
      INSERT INTO editing_locks (
        id, entity_id, entity_type, user_id, user_name,
        locked_at, expires_at, active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      request.entityId,
      request.entityType,
      request.userId,
      request.userName,
      now.toISOString(),
      expiresAt.toISOString(),
      1, // active
      now.toISOString(),
      now.toISOString()
    ]);
    
    return {
      id,
      entityId: request.entityId,
      entityType: request.entityType,
      userId: request.userId,
      userName: request.userName,
      lockedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      active: true
    };
  }
  
  /**
   * Gibt eine Bearbeitungssperre frei
   */
  public async releaseLock(lockId: string, userId: string): Promise<boolean> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    // Prüfe, ob die Sperre dem Benutzer gehört
    const lock = await db.get(`
      SELECT * FROM editing_locks
      WHERE id = ? AND user_id = ? AND active = 1
    `, [lockId, userId]);
    
    if (!lock) {
      return false; // Sperre nicht gefunden oder gehört nicht dem Benutzer
    }
    
    // Deaktiviere die Sperre
    const result = await db.run(`
      UPDATE editing_locks
      SET active = 0, updated_at = ?
      WHERE id = ?
    `, [now, lockId]);
    
    return result.changes > 0;
  }
  
  /**
   * Gibt eine Bearbeitungssperre für eine Entität frei
   */
  public async releaseEntityLock(entityId: string, entityType: string, userId: string): Promise<boolean> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    // Sperre suchen
    const lock = await db.get(`
      SELECT * FROM editing_locks
      WHERE entity_id = ? AND entity_type = ? AND user_id = ? AND active = 1
    `, [entityId, entityType, userId]);
    
    if (!lock) {
      return false; // Sperre nicht gefunden
    }
    
    // Sperre deaktivieren
    const result = await db.run(`
      UPDATE editing_locks
      SET active = 0, updated_at = ?
      WHERE id = ?
    `, [now, lock.id]);
    
    return result.changes > 0;
  }
  
  /**
   * Verlängert eine bestehende Sperre
   */
  public async extendLock(lockId: string, durationMinutes?: number): Promise<EditingLock | null> {
    const db = await getDb();
    const now = new Date();
    
    // Prüfe, ob die Sperre noch aktiv ist
    const lock = await db.get(`
      SELECT * FROM editing_locks
      WHERE id = ? AND active = 1
    `, [lockId]);
    
    if (!lock) {
      return null; // Sperre nicht gefunden oder nicht aktiv
    }
    
    // Berechne das neue Ablaufdatum
    const additionalMinutes = durationMinutes || this.DEFAULT_LOCK_DURATION;
    const expiresAt = new Date(now.getTime() + additionalMinutes * 60 * 1000);
    
    // Aktualisiere die Sperre
    await db.run(`
      UPDATE editing_locks
      SET expires_at = ?, updated_at = ?
      WHERE id = ?
    `, [expiresAt.toISOString(), now.toISOString(), lockId]);
    
    // Rückgabe der aktualisierten Sperre
    return {
      id: lock.id,
      entityId: lock.entity_id,
      entityType: lock.entity_type,
      userId: lock.user_id,
      userName: lock.user_name,
      lockedAt: lock.locked_at,
      expiresAt: expiresAt.toISOString(),
      active: true
    };
  }
  
  /**
   * Holt eine aktive Sperre für eine Entität
   */
  public async getActiveLock(entityId: string, entityType: string): Promise<EditingLock | null> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    // Überprüfe ob die Tabelle und Spalte existieren
    try {
      // Prüfe auf aktive Sperren und entferne abgelaufene
      await this.cleanupExpiredLocks();
      
      // Hole die aktive Sperre
      const lock = await db.get(`
        SELECT * FROM editing_locks
        WHERE entity_id = ? AND entity_type = ? AND active = 1 AND expires_at > ?
      `, [entityId, entityType, now]);
      
      if (!lock) {
        return null;
      }
      
      return {
        id: lock.id,
        entityId: lock.entity_id,
        entityType: lock.entity_type,
        userId: lock.user_id,
        userName: lock.user_name,
        lockedAt: lock.locked_at,
        expiresAt: lock.expires_at,
        active: Boolean(lock.active)
      };
    } catch (error) {
      console.warn("Fehler beim Abrufen der Bearbeitungssperre:", error);
      return null;
    }
  }
  
  /**
   * Holt alle aktiven Sperren eines Benutzers
   */
  public async getUserActiveLocks(userId: string): Promise<EditingLock[]> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    // Prüfe auf aktive Sperren und entferne abgelaufene
    await this.cleanupExpiredLocks();
    
    // Hole alle aktiven Sperren des Benutzers
    const locks = await db.all(`
      SELECT * FROM editing_locks
      WHERE user_id = ? AND active = 1 AND expires_at > ?
    `, [userId, now]);
    
    return locks.map((lock: DbEditingLock) => ({
      id: lock.id,
      entityId: lock.entity_id,
      entityType: lock.entity_type,
      userId: lock.user_id,
      userName: lock.user_name,
      lockedAt: lock.locked_at,
      expiresAt: lock.expires_at,
      active: Boolean(lock.active)
    }));
  }
  
  /**
   * Bereinigt abgelaufene Sperren
   */
  public async cleanupExpiredLocks(): Promise<number> {
    try {
      const db = await getDb();
      const now = new Date().toISOString();
      
      // Deaktiviere abgelaufene Sperren
      const result = await db.run(`
        UPDATE editing_locks
        SET active = 0, updated_at = ?
        WHERE active = 1 AND expires_at <= ?
      `, [now, now]);
      
      return result.changes || 0;
    } catch (error) {
      console.warn("Fehler beim Bereinigen abgelaufener Sperren:", error);
      return 0;
    }
  }
  
  /**
   * Prüft, ob ein Benutzer ein Element bearbeiten darf
   */
  public async canEditEntity(entityId: string, entityType: string, userId: string): Promise<boolean> {
    const activeLock = await this.getActiveLock(entityId, entityType);
    
    // Keine aktive Sperre oder die Sperre gehört dem Benutzer
    return !activeLock || activeLock.userId === userId;
  }
  
  /**
   * Generiert eine einfache ID
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 10);
  }
}

// Singleton-Instanz
export const editingLockService = new EditingLockService();
