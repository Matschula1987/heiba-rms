import { create } from 'zustand';
import { 
  NotificationSettings, 
  UpdateNotificationSettingsParams 
} from '@/types/notifications';
import { api } from '@/lib/api';

interface NotificationSettingsStore {
  // State
  settings: NotificationSettings | null;
  isLoading: boolean;
  error: string | null;
  currentUserId: string;
  
  // Aktionen
  fetchSettings: () => Promise<void>;
  updateSettings: (params: UpdateNotificationSettingsParams) => Promise<void>;
  resetSettings: () => Promise<void>;
  setCurrentUserId: (userId: string) => void;
  
  // Helper
  clearErrors: () => void;
}

export const useNotificationSettingsStore = create<NotificationSettingsStore>((set, get) => ({
  // State
  settings: null,
  isLoading: false,
  error: null,
  currentUserId: 'admin', // Standardwert, in der Praxis aus der Auth-Session holen
  
  // Aktionen
  fetchSettings: async () => {
    const { currentUserId } = get();
    
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch(`/api/notification-settings?user_id=${currentUserId}`);
      
      // Wenn 404, dann existieren noch keine Einstellungen
      if (response.status === 404) {
        set({ settings: null, isLoading: false });
        return;
      }
      
      if (!response.ok) {
        throw new Error('Fehler beim Laden der Benachrichtigungseinstellungen');
      }
      
      const data = await response.json();
      
      if (data.success) {
        set({ 
          settings: data.settings,
          isLoading: false
        });
      } else {
        throw new Error(data.error || 'Fehler beim Laden der Benachrichtigungseinstellungen');
      }
    } catch (error) {
      console.error('Fehler beim Laden der Benachrichtigungseinstellungen:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Unbekannter Fehler',
        isLoading: false
      });
    }
  },
  
  updateSettings: async (params: UpdateNotificationSettingsParams) => {
    const { currentUserId } = get();
    
    set({ isLoading: true, error: null });
    
    try {
      // Konvertiere von camelCase zu snake_case für die API
      const apiParams: Record<string, any> = {
        user_id: currentUserId
      };
      
      Object.entries(params).forEach(([key, value]) => {
        // Konvertiere camelCase zu snake_case
        const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        apiParams[snakeKey] = value;
      });
      
      const response = await fetch('/api/notification-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiParams)
      });
      
      if (!response.ok) {
        throw new Error('Fehler beim Aktualisieren der Benachrichtigungseinstellungen');
      }
      
      const data = await response.json();
      
      if (data.success) {
        set({ 
          settings: data.settings,
          isLoading: false
        });
      } else {
        throw new Error(data.error || 'Fehler beim Aktualisieren der Benachrichtigungseinstellungen');
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Benachrichtigungseinstellungen:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Unbekannter Fehler',
        isLoading: false
      });
    }
  },
  
  resetSettings: async () => {
    const { currentUserId } = get();
    
    set({ isLoading: true, error: null });
    
    try {
      // Aktualisiere Einstellungen auf Standardwerte
      const defaultSettings: UpdateNotificationSettingsParams = {
        emailEnabled: true,
        pushEnabled: true,
        smsEnabled: false,
        notifyFollowup: true,
        notifyApplications: true,
        notifyStatusChanges: true,
        notifyDueActions: true,
        notifyProfileSending: true,
        notifyMatchings: true,
        frequency: 'instant',
        weekendDisabled: false,
        minPriority: 'normal',
        aiModeEnabled: false,
        aiModeLevel: 'assist',
        aiFailureNotification: true
      };
      
      await get().updateSettings(defaultSettings);
    } catch (error) {
      console.error('Fehler beim Zurücksetzen der Benachrichtigungseinstellungen:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Unbekannter Fehler',
        isLoading: false
      });
    }
  },
  
  setCurrentUserId: (userId: string) => {
    set({ currentUserId: userId });
  },
  
  clearErrors: () => {
    set({ error: null });
  }
}));
