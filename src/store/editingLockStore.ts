import { create } from 'zustand';
import { EditingLock } from '@/lib/editingLockService';

interface EditingLockState {
  // Zustände
  activeLock: EditingLock | null;
  isLoading: boolean;
  error: string | null;
  userActiveLocks: EditingLock[];
  
  // Aktionen
  acquireLock: (entityId: string, entityType: string, userId: string, userName: string) => Promise<boolean>;
  releaseLock: (entityId: string, entityType: string, userId: string) => Promise<boolean>;
  extendLock: (lockId: string) => Promise<boolean>;
  fetchActiveLock: (entityId: string, entityType: string) => Promise<EditingLock | null>;
  fetchUserLocks: (userId: string) => Promise<EditingLock[]>;
  
  // Zustandsänderungen
  setActiveLock: (lock: EditingLock | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setUserActiveLocks: (locks: EditingLock[]) => void;
  clearActiveLock: () => void;
  clearError: () => void;
}

export const useEditingLockStore = create<EditingLockState>((set, get) => ({
  // Initialzustände
  activeLock: null,
  isLoading: false,
  error: null,
  userActiveLocks: [],
  
  // Aktionen
  acquireLock: async (entityId, entityType, userId, userName) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch('/api/editing-locks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          entity_id: entityId,
          entity_type: entityType,
          user_id: userId,
          user_name: userName
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        set({ activeLock: data.lock, isLoading: false });
        return data.canEdit;
      } else {
        set({ 
          error: data.error || 'Fehler beim Erstellen der Bearbeitungssperre', 
          activeLock: data.lock,
          isLoading: false 
        });
        return false;
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unbekannter Fehler', 
        isLoading: false 
      });
      return false;
    }
  },
  
  releaseLock: async (entityId, entityType, userId) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch(`/api/editing-locks?entity_id=${entityId}&entity_type=${entityType}&user_id=${userId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        set({ activeLock: null, isLoading: false });
        return true;
      } else {
        set({ 
          error: data.error || 'Fehler beim Freigeben der Bearbeitungssperre', 
          isLoading: false 
        });
        return false;
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unbekannter Fehler', 
        isLoading: false 
      });
      return false;
    }
  },
  
  extendLock: async (lockId) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch('/api/editing-locks', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: lockId,
          duration_minutes: 15
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        set({ activeLock: data.lock, isLoading: false });
        return true;
      } else {
        set({ 
          error: data.error || 'Fehler beim Verlängern der Bearbeitungssperre', 
          isLoading: false 
        });
        return false;
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unbekannter Fehler', 
        isLoading: false 
      });
      return false;
    }
  },
  
  fetchActiveLock: async (entityId, entityType) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch(`/api/editing-locks?entity_id=${entityId}&entity_type=${entityType}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        set({ activeLock: data.lock, isLoading: false });
        return data.lock;
      } else {
        set({ 
          error: data.error || 'Fehler beim Abrufen der Bearbeitungssperre', 
          isLoading: false 
        });
        return null;
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unbekannter Fehler', 
        isLoading: false 
      });
      return null;
    }
  },
  
  fetchUserLocks: async (userId) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch(`/api/editing-locks?user_id=${userId}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        set({ userActiveLocks: data.locks, isLoading: false });
        return data.locks;
      } else {
        set({ 
          error: data.error || 'Fehler beim Abrufen der Bearbeitungssperren des Benutzers', 
          isLoading: false 
        });
        return [];
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unbekannter Fehler', 
        isLoading: false 
      });
      return [];
    }
  },
  
  // Zustandsänderungen
  setActiveLock: (lock) => set({ activeLock: lock }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setUserActiveLocks: (locks) => set({ userActiveLocks: locks }),
  clearActiveLock: () => set({ activeLock: null }),
  clearError: () => set({ error: null })
}));
