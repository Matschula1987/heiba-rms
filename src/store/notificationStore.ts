/**
 * Zustand-Store für Benachrichtigungen
 */

import { create } from 'zustand';
import { 
  Notification, 
  EditingLock,
  CreateNotificationParams, 
  CreateEditingLockParams,
  EntityType
} from '@/types';

interface NotificationStore {
  // Benachrichtigungen
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  currentUserId: string;
  
  // Editing Locks
  activeLocks: Map<string, EditingLock>; // key: `${entityType}-${entityId}`
  
  // Aktionen - Benachrichtigungen
  fetchNotifications: (unreadOnly?: boolean) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<boolean>;
  markAllAsRead: () => Promise<void>;
  createNotification: (params: CreateNotificationParams) => Promise<Notification | null>;
  setCurrentUserId: (userId: string) => void;
  
  // Aktionen - Editing Locks
  checkEditingLock: (entityType: EntityType, entityId: string) => Promise<EditingLock | null>;
  createEditingLock: (params: CreateEditingLockParams) => Promise<EditingLock | null>;
  releaseEditingLock: (entityType: EntityType, entityId: string, userId: string) => Promise<boolean>;
  getLockKey: (entityType: EntityType, entityId: string) => string;
  
  // Helper
  clearErrors: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  // State
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  currentUserId: 'admin', // Standardwert, in der Praxis aus der Auth-Session holen
  activeLocks: new Map(),
  
  // Methoden für Benachrichtigungen
  fetchNotifications: async (unreadOnly = false) => {
    const { currentUserId } = get();
    
    set({ isLoading: true, error: null });
    
    try {
      const params = new URLSearchParams({
        user_id: currentUserId,
        unread_only: unreadOnly ? 'true' : 'false',
        limit: '30'
      });
      
      const response = await fetch(`/api/notifications?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Fehler beim Laden der Benachrichtigungen');
      }
      
      const data = await response.json();
      
      if (data.success) {
        set({ 
          notifications: data.notifications,
          unreadCount: data.unread_count,
          isLoading: false
        });
      } else {
        throw new Error(data.error || 'Fehler beim Laden der Benachrichtigungen');
      }
    } catch (error) {
      console.error('Fehler beim Laden der Benachrichtigungen:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Unbekannter Fehler',
        isLoading: false
      });
    }
  },
  
  markNotificationAsRead: async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT'
      });
      
      if (!response.ok) {
        throw new Error('Fehler beim Markieren der Benachrichtigung als gelesen');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Update local state
        set((state) => ({
          notifications: state.notifications.map(notification => 
            notification.id === id 
              ? { ...notification, read: true, read_at: new Date().toISOString() }
              : notification
          ),
          unreadCount: Math.max(0, state.unreadCount - 1)
        }));
        
        return true;
      } else {
        throw new Error(data.error || 'Fehler beim Markieren der Benachrichtigung als gelesen');
      }
    } catch (error) {
      console.error('Fehler beim Markieren der Benachrichtigung als gelesen:', error);
      set({ error: error instanceof Error ? error.message : 'Unbekannter Fehler' });
      return false;
    }
  },
  
  markAllAsRead: async () => {
    const { currentUserId } = get();
    
    try {
      const response = await fetch(`/api/notifications/mark-all-read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: currentUserId })
      });
      
      if (!response.ok) {
        throw new Error('Fehler beim Markieren aller Benachrichtigungen als gelesen');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Update local state
        set((state) => ({
          notifications: state.notifications.map(notification => ({
            ...notification,
            read: true,
            read_at: notification.read_at || new Date().toISOString()
          })),
          unreadCount: 0
        }));
      } else {
        throw new Error(data.error || 'Fehler beim Markieren aller Benachrichtigungen als gelesen');
      }
    } catch (error) {
      console.error('Fehler beim Markieren aller Benachrichtigungen als gelesen:', error);
      set({ error: error instanceof Error ? error.message : 'Unbekannter Fehler' });
    }
  },
  
  createNotification: async (params: CreateNotificationParams) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });
      
      if (!response.ok) {
        throw new Error('Fehler beim Erstellen der Benachrichtigung');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Nur die Liste aktualisieren, wenn die Benachrichtigung für den aktuellen Benutzer ist
        if (params.user_id === get().currentUserId) {
          set((state) => ({
            notifications: [data.notification, ...state.notifications],
            unreadCount: state.unreadCount + 1
          }));
        }
        
        return data.notification;
      } else {
        throw new Error(data.error || 'Fehler beim Erstellen der Benachrichtigung');
      }
    } catch (error) {
      console.error('Fehler beim Erstellen der Benachrichtigung:', error);
      set({ error: error instanceof Error ? error.message : 'Unbekannter Fehler' });
      return null;
    }
  },
  
  setCurrentUserId: (userId: string) => {
    set({ currentUserId: userId });
  },
  
  // Methoden für Editing Locks
  getLockKey: (entityType: EntityType, entityId: string) => {
    return `${entityType}-${entityId}`;
  },
  
  checkEditingLock: async (entityType: EntityType, entityId: string) => {
    try {
      const params = new URLSearchParams({
        entity_type: entityType,
        entity_id: entityId
      });
      
      const response = await fetch(`/api/editing-locks?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Fehler beim Prüfen der Bearbeitungssperre');
      }
      
      const data = await response.json();
      
      if (data.success) {
        const lockKey = get().getLockKey(entityType, entityId);
        
        if (data.locked && data.lock) {
          // Sperre setzen
          set((state) => ({
            activeLocks: new Map(state.activeLocks).set(lockKey, data.lock)
          }));
          
          return data.lock;
        } else {
          // Sperre entfernen, falls sie existiert
          set((state) => {
            const newLocks = new Map(state.activeLocks);
            newLocks.delete(lockKey);
            return { activeLocks: newLocks };
          });
          
          return null;
        }
      } else {
        throw new Error(data.error || 'Fehler beim Prüfen der Bearbeitungssperre');
      }
    } catch (error) {
      console.error('Fehler beim Prüfen der Bearbeitungssperre:', error);
      set({ error: error instanceof Error ? error.message : 'Unbekannter Fehler' });
      return null;
    }
  },
  
  createEditingLock: async (params: CreateEditingLockParams) => {
    try {
      const response = await fetch('/api/editing-locks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });
      
      if (response.status === 423) {
        // Die Entität ist gesperrt
        const data = await response.json();
        const lock = data.lock_info;
        
        // Sperrinformation im Store speichern
        if (lock) {
          const lockKey = get().getLockKey(params.entity_type, params.entity_id);
          set((state) => ({
            activeLocks: new Map(state.activeLocks).set(lockKey, lock)
          }));
        }
        
        return null;
      }
      
      if (!response.ok) {
        throw new Error('Fehler beim Erstellen der Bearbeitungssperre');
      }
      
      const data = await response.json();
      
      if (data.success && data.lock) {
        // Sperrinformation im Store speichern
        const lockKey = get().getLockKey(params.entity_type, params.entity_id);
        set((state) => ({
          activeLocks: new Map(state.activeLocks).set(lockKey, data.lock)
        }));
        
        return data.lock;
      } else {
        throw new Error(data.error || 'Fehler beim Erstellen der Bearbeitungssperre');
      }
    } catch (error) {
      console.error('Fehler beim Erstellen der Bearbeitungssperre:', error);
      set({ error: error instanceof Error ? error.message : 'Unbekannter Fehler' });
      return null;
    }
  },
  
  releaseEditingLock: async (entityType: EntityType, entityId: string, userId: string) => {
    try {
      const params = new URLSearchParams({
        entity_type: entityType,
        entity_id: entityId,
        user_id: userId
      });
      
      const response = await fetch(`/api/editing-locks?${params.toString()}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Fehler beim Freigeben der Bearbeitungssperre');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Sperre aus dem Store entfernen
        const lockKey = get().getLockKey(entityType, entityId);
        set((state) => {
          const newLocks = new Map(state.activeLocks);
          newLocks.delete(lockKey);
          return { activeLocks: newLocks };
        });
        
        return true;
      } else {
        throw new Error(data.error || 'Fehler beim Freigeben der Bearbeitungssperre');
      }
    } catch (error) {
      console.error('Fehler beim Freigeben der Bearbeitungssperre:', error);
      set({ error: error instanceof Error ? error.message : 'Unbekannter Fehler' });
      return false;
    }
  },
  
  // Helper
  clearErrors: () => {
    set({ error: null });
  }
}));
