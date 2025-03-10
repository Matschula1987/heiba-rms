import { Server as SocketIoServer } from 'socket.io';
import { realtimeNotificationService } from './realtimeNotificationService';
import { Notification } from '@/types/notifications';

/**
 * Socket.io-Service
 * 
 * Dieser Service verwaltet eine Socket.io-Instanz für Echtzeit-Kommunikation.
 * Er verarbeitet Client-Verbindungen, Abmeldungen und sendet Benachrichtigungen
 * an verbundene Clients.
 */
class SocketIoService {
  private static instance: SocketIoService;
  private io: SocketIoServer | null = null;
  private initialized = false;
  
  constructor() {
    if (SocketIoService.instance) {
      return SocketIoService.instance;
    }
    
    SocketIoService.instance = this;
  }
  
  /**
   * Initialisiert die Socket.io-Instanz, falls noch nicht geschehen
   */
  initialize(): boolean {
    if (this.initialized) {
      return true;
    }
    
    try {
      // Auf Server versuchen zuzugreifen
      const { Server } = require('socket.io');
      
      // Für Next.js app-Router muss auf req.socket zugegriffen werden
      // Da das nicht direkt möglich ist, wird dies in der API-Route
      // mit einem speziellen Workaround gelöst (socket/route.ts)
      
      // In einem echten Produktionssystem würde hier mehr
      // Konfiguration erfolgen (z.B. CORS, etc.)
      this.io = new Server({
        cors: {
          origin: "*",
          methods: ["GET", "POST"]
        }
      });
      
      this.setupEventHandlers();
      this.initialized = true;
      
      console.log('Socket.io-Service wurde initialisiert');
      return true;
    } catch (error) {
      console.error('Fehler beim Initialisieren des Socket.io-Service:', error);
      return false;
    }
  }
  
  /**
   * Richtet die Event-Handler für Socket.io ein
   */
  private setupEventHandlers(): void {
    if (!this.io) return;
    
    this.io.on('connection', (socket) => {
      console.log(`Neue Socket-Verbindung: ${socket.id}`);
      
      // Bei Verbindung erstmal nichts tun, bis die Authentifizierung erfolgt
      
      // Authentifizierung
      socket.on('authenticate', (userId: string) => {
        if (!userId) {
          socket.emit('error', { message: 'Benutzer-ID erforderlich' });
          return;
        }
        
        console.log(`Socket ${socket.id} für Benutzer ${userId} authentifiziert`);
        
        // Benutzer dem Room zuordnen
        socket.join(`user:${userId}`);
        
        // Client beim realtimeNotificationService registrieren
        realtimeNotificationService.registerClient(userId, socket.id);
        
        // Bestätigung an Client senden
        socket.emit('authenticated', { userId });
        
        // Ungelesene Benachrichtigungen zählen
        this.sendUnreadCount(userId);
      });
      
      // Beim Trennen der Verbindung
      socket.on('disconnect', () => {
        console.log(`Socket getrennt: ${socket.id}`);
        
        // Client bei realtimeNotificationService abmelden
        // Da wir die userId nicht im Socket speichern, müssen wir alle Benutzer durchgehen
        // In einem realen System würde man eine Map socket.id -> userId führen
      });
      
      // Benachrichtigungen als gelesen markieren
      socket.on('mark_read', async (data: { notificationId: string, userId: string }) => {
        try {
          if (!data.notificationId || !data.userId) {
            socket.emit('error', { message: 'Benachrichtigungs-ID und Benutzer-ID erforderlich' });
            return;
          }
          
          await realtimeNotificationService.markAsRead(data.notificationId);
          
          // Aktualisierte ungelesene Anzahl senden
          this.sendUnreadCount(data.userId);
          
          socket.emit('notification_marked_read', { notificationId: data.notificationId });
        } catch (error) {
          console.error('Fehler beim Markieren der Benachrichtigung als gelesen:', error);
          socket.emit('error', { message: 'Fehler beim Markieren der Benachrichtigung als gelesen' });
        }
      });
      
      // Alle Benachrichtigungen als gelesen markieren
      socket.on('mark_all_read', async (data: { userId: string }) => {
        try {
          if (!data.userId) {
            socket.emit('error', { message: 'Benutzer-ID erforderlich' });
            return;
          }
          
          const count = await realtimeNotificationService.markAllAsRead(data.userId);
          
          // Aktualisierte ungelesene Anzahl senden
          this.sendUnreadCount(data.userId);
          
          socket.emit('all_notifications_marked_read', { count });
        } catch (error) {
          console.error('Fehler beim Markieren aller Benachrichtigungen als gelesen:', error);
          socket.emit('error', { message: 'Fehler beim Markieren aller Benachrichtigungen als gelesen' });
        }
      });
      
      // Neueste Benachrichtigungen abrufen
      socket.on('get_notifications', async (data: { userId: string, limit?: number }) => {
        try {
          if (!data.userId) {
            socket.emit('error', { message: 'Benutzer-ID erforderlich' });
            return;
          }
          
          const notifications = await realtimeNotificationService.getLatestNotifications(
            data.userId,
            data.limit || 30
          );
          
          socket.emit('notifications', { notifications });
        } catch (error) {
          console.error('Fehler beim Abrufen der Benachrichtigungen:', error);
          socket.emit('error', { message: 'Fehler beim Abrufen der Benachrichtigungen' });
        }
      });
    });
  }
  
  /**
   * Sendet die Anzahl der ungelesenen Benachrichtigungen an einen Benutzer
   * @param userId Benutzer-ID
   */
  private async sendUnreadCount(userId: string): Promise<void> {
    if (!this.io) return;
    
    try {
      const count = await realtimeNotificationService.getUnreadCount(userId);
      
      this.io.to(`user:${userId}`).emit('unread_count', { count });
    } catch (error) {
      console.error(`Fehler beim Senden der ungelesenen Anzahl für Benutzer ${userId}:`, error);
    }
  }
  
  /**
   * Sendet eine Benachrichtigung an einen Benutzer
   * @param userId Benutzer-ID
   * @param notification Benachrichtigung
   */
  async sendNotification(userId: string, notification: Notification): Promise<void> {
    if (!this.io || !this.initialized) return;
    
    try {
      // An alle Clients des Benutzers senden
      this.io.to(`user:${userId}`).emit('notification', { notification });
      
      // Ungelesene Anzahl aktualisieren
      await this.sendUnreadCount(userId);
    } catch (error) {
      console.error(`Fehler beim Senden der Benachrichtigung an Benutzer ${userId}:`, error);
    }
  }
  
  /**
   * Gibt die Socket.io-Instanz zurück
   */
  getIo(): SocketIoServer | null {
    return this.io;
  }
  
  /**
   * Gibt zurück, ob der Service initialisiert wurde
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// Singleton-Instanz exportieren
export const socketIoService = new SocketIoService();
