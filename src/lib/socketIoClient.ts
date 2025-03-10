import { io, Socket } from 'socket.io-client';
import { Notification } from '@/types/notifications';

type NotificationCallback = (notification: Notification) => void;
type UnreadCountCallback = (count: number) => void;

/**
 * Socket.io-Client
 * 
 * Dieser Client verbindet sich mit dem Socket.io-Server und verarbeitet
 * Echtzeit-Benachrichtigungen. Er bietet eine einfache API zum Empfangen von
 * Benachrichtigungen und zum Verwalten des Benachrichtigungsstatus.
 */
class SocketIoClient {
  private static instance: SocketIoClient;
  private socket: Socket | null = null;
  private connected = false;
  private authenticating = false;
  private userId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeoutId: NodeJS.Timeout | null = null;
  
  // Callbacks
  private notificationCallbacks: NotificationCallback[] = [];
  private unreadCountCallbacks: UnreadCountCallback[] = [];
  
  constructor() {
    if (SocketIoClient.instance) {
      return SocketIoClient.instance;
    }
    
    SocketIoClient.instance = this;
  }
  
  /**
   * Verbindet zum Socket.io-Server und authentifiziert den Benutzer
   * @param userId Benutzer-ID
   * @returns True, wenn die Verbindung hergestellt wurde
   */
  connect(userId: string): boolean {
    if (this.connected || this.authenticating) return true;
    
    this.userId = userId;
    this.authenticating = true;
    
    try {
      const serverUrl = typeof window !== 'undefined' ? 
        window.location.origin + '/api/socket' : 
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/socket';
      
      this.socket = io(serverUrl, {
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        timeout: 10000,
      });
      
      this.setupEventHandlers();
      return true;
    } catch (error) {
      console.error('Fehler beim Verbinden mit dem Socket.io-Server:', error);
      this.authenticating = false;
      return false;
    }
  }
  
  /**
   * Richtet die Event-Handler für Socket.io ein
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;
    
    this.socket.on('connect', () => {
      console.log('Socket.io-Verbindung hergestellt');
      
      // Bei erfolgreicher Verbindung authentifizieren
      if (this.userId) {
        this.socket?.emit('authenticate', this.userId);
      }
    });
    
    this.socket.on('disconnect', () => {
      console.log('Socket.io-Verbindung getrennt');
      this.connected = false;
      
      // Bei Verbindungsabbruch versuchen, die Verbindung wiederherzustellen
      this.scheduleReconnect();
    });
    
    this.socket.on('authenticated', (data: { userId: string }) => {
      console.log(`Authentifiziert als Benutzer ${data.userId}`);
      this.connected = true;
      this.authenticating = false;
      this.reconnectAttempts = 0; // Zurücksetzen der Verbindungsversuche
      
      // Benachrichtigungen abrufen
      this.getNotifications();
    });
    
    this.socket.on('notification', (data: { notification: Notification }) => {
      console.log('Neue Benachrichtigung erhalten:', data.notification);
      
      // Callbacks für neue Benachrichtigungen aufrufen
      this.notificationCallbacks.forEach(callback => callback(data.notification));
    });
    
    this.socket.on('unread_count', (data: { count: number }) => {
      console.log(`Ungelesene Benachrichtigungen: ${data.count}`);
      
      // Callbacks für die ungelesene Anzahl aufrufen
      this.unreadCountCallbacks.forEach(callback => callback(data.count));
    });
    
    this.socket.on('error', (error: any) => {
      console.error('Socket.io-Fehler:', error);
    });
  }
  
  /**
   * Plant einen Verbindungsversuch, wenn die Verbindung unterbrochen wurde
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
    }
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Maximale Anzahl an Verbindungsversuchen erreicht');
      return;
    }
    
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    this.reconnectTimeoutId = setTimeout(() => {
      this.reconnectAttempts++;
      console.log(`Verbindungsversuch ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      if (this.userId) {
        this.connect(this.userId);
      }
    }, delay);
  }
  
  /**
   * Registriert einen Callback für neue Benachrichtigungen
   * @param callback Callback-Funktion, die bei neuen Benachrichtigungen aufgerufen wird
   */
  onNotification(callback: NotificationCallback): void {
    this.notificationCallbacks.push(callback);
  }
  
  /**
   * Registriert einen Callback für Änderungen an der ungelesenen Anzahl
   * @param callback Callback-Funktion, die bei Änderungen an der ungelesenen Anzahl aufgerufen wird
   */
  onUnreadCountChange(callback: UnreadCountCallback): void {
    this.unreadCountCallbacks.push(callback);
  }
  
  /**
   * Entfernt einen Callback für neue Benachrichtigungen
   * @param callback Callback-Funktion, die entfernt werden soll
   */
  removeNotificationCallback(callback: NotificationCallback): void {
    this.notificationCallbacks = this.notificationCallbacks.filter(cb => cb !== callback);
  }
  
  /**
   * Entfernt einen Callback für Änderungen an der ungelesenen Anzahl
   * @param callback Callback-Funktion, die entfernt werden soll
   */
  removeUnreadCountCallback(callback: UnreadCountCallback): void {
    this.unreadCountCallbacks = this.unreadCountCallbacks.filter(cb => cb !== callback);
  }
  
  /**
   * Ruft die neuesten Benachrichtigungen ab
   * @param limit Maximale Anzahl der abzurufenden Benachrichtigungen
   */
  getNotifications(limit: number = 30): void {
    if (!this.socket || !this.connected || !this.userId) return;
    
    this.socket.emit('get_notifications', { userId: this.userId, limit });
  }
  
  /**
   * Markiert eine Benachrichtigung als gelesen
   * @param notificationId Benachrichtigungs-ID
   */
  markAsRead(notificationId: string): void {
    if (!this.socket || !this.connected || !this.userId) return;
    
    this.socket.emit('mark_read', { notificationId, userId: this.userId });
  }
  
  /**
   * Markiert alle Benachrichtigungen als gelesen
   */
  markAllAsRead(): void {
    if (!this.socket || !this.connected || !this.userId) return;
    
    this.socket.emit('mark_all_read', { userId: this.userId });
  }
  
  /**
   * Trennt die Verbindung zum Socket.io-Server
   */
  disconnect(): void {
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.connected = false;
    this.authenticating = false;
    this.userId = null;
    this.reconnectAttempts = 0;
  }
  
  /**
   * Gibt zurück, ob die Verbindung hergestellt wurde
   */
  isConnected(): boolean {
    return this.connected;
  }
}

// Singleton-Instanz exportieren
export const socketIoClient = new SocketIoClient();
