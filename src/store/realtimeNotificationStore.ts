'use client';

import { create } from 'zustand';
import { socketIoClient } from '@/lib/socketIoClient';
import { Notification } from '@/types/notifications';

// Zustand für Echtzeit-Benachrichtigungen
interface RealtimeNotificationState {
  // Zustand
  isConnected: boolean;
  unreadCount: number;
  notifications: Notification[];
  isLoading: boolean;
  
  // Aktionen
  connect: (userId: string) => void;
  disconnect: () => void;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  getNotifications: (limit?: number) => Promise<Notification[]>;
  clearNotifications: () => void;
}

export const useRealtimeNotificationStore = create<RealtimeNotificationState>((set, get) => ({
  // Initialer Zustand
  isConnected: false,
  unreadCount: 0,
  notifications: [],
  isLoading: false,
  
  // Aktionen
  connect: (userId: string) => {
    // Echtzeit-Verbindung herstellen
    const success = socketIoClient.connect(userId);
    
    if (success) {
      // Status aktualisieren
      set({ isConnected: socketIoClient.isConnected() });
      
      // Event-Handler für neue Benachrichtigungen
      socketIoClient.onNotification((notification) => {
        set((state) => ({
          notifications: [notification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));
      });
      
      // Event-Handler für ungelesene Anzahl
      socketIoClient.onUnreadCountChange((count) => {
        set({ unreadCount: count });
      });
    }
  },
  
  disconnect: () => {
    socketIoClient.disconnect();
    set({
      isConnected: false,
      unreadCount: 0,
      notifications: [],
    });
  },
  
  markAsRead: async (notificationId: string) => {
    // Optimistisches Update im UI
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
    
    // Echtzeit-Updates über Socket.io
    socketIoClient.markAsRead(notificationId);
    
    // API-Aufruf an den Server
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Fehler beim Markieren als gelesen');
      }
    } catch (error) {
      console.error('Fehler beim Markieren als gelesen:', error);
      
      // Bei Fehler Zustand zurücksetzen
      get().getNotifications();
    }
  },
  
  markAllAsRead: async () => {
    // Optimistisches Update im UI
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
    
    // Echtzeit-Updates über Socket.io
    socketIoClient.markAllAsRead();
    
    // API-Aufruf an den Server
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: '1' // Default-User-ID für Testzwecke, in echter Anwendung aus der Session holen
        })
      });
      
      if (!response.ok) {
        throw new Error('Fehler beim Markieren aller als gelesen');
      }
    } catch (error) {
      console.error('Fehler beim Markieren aller als gelesen:', error);
      
      // Bei Fehler Zustand zurücksetzen
      get().getNotifications();
    }
  },
  
  getNotifications: async (limit = 30) => {
    set({ isLoading: true });
    
    try {
      // Erst die Echtzeit-Verbindung versuchen
      if (socketIoClient.isConnected()) {
        socketIoClient.getNotifications(limit);
      }
      
      // Als Fallback oder zur Erstinitialisierung von der API laden
      const response = await fetch(`/api/notifications?user_id=1&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Fehler beim Laden der Benachrichtigungen');
      }
      
      const data = await response.json();
      const notifications = data.notifications || [];
      
      set({ 
        notifications, 
        unreadCount: data.unread_count || 0,
        isLoading: false 
      });
      
      return notifications;
    } catch (error) {
      console.error('Fehler beim Laden der Benachrichtigungen:', error);
      set({ isLoading: false });
      return [];
    }
  },
  
  clearNotifications: () => {
    set({ notifications: [] });
  },
}));
