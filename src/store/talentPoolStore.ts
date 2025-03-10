import { create } from 'zustand';
import { 
  TalentPoolEntry, 
  TalentPoolEntryExtended,
  TalentPoolNote,
  TalentPoolActivity,
  TalentPoolJobMatch,
  TalentPoolFilter
} from '@/types/talentPool';
import { api } from '@/lib/api';

interface TalentPoolState {
  // Daten
  loading: boolean;
  error: string | null;
  entries: TalentPoolEntry[];
  currentEntry: TalentPoolEntryExtended | null;
  notes: TalentPoolNote[];
  activities: TalentPoolActivity[];
  jobMatches: TalentPoolJobMatch[];
  filter: TalentPoolFilter;
  total: number;
  
  // Funktionen
  fetchEntries: (filter?: Partial<TalentPoolFilter>) => Promise<void>;
  fetchEntry: (id: string, extended?: boolean) => Promise<TalentPoolEntryExtended | TalentPoolEntry | null>;
  addEntry: (entityId: string, entityType: 'candidate' | 'application', data?: any) => Promise<TalentPoolEntry | null>;
  updateEntry: (id: string, data: any) => Promise<TalentPoolEntry | null>;
  removeEntry: (id: string) => Promise<boolean>;
  setFilter: (filter: Partial<TalentPoolFilter>) => void;
  
  // Notizen
  fetchNotes: (talentPoolId: string) => Promise<TalentPoolNote[]>;
  addNote: (talentPoolId: string, userId: string, content: string, noteType?: string) => Promise<TalentPoolNote | null>;
  
  // Aktivitäten
  fetchActivities: (talentPoolId: string) => Promise<TalentPoolActivity[]>;
  
  // Job-Matches
  fetchJobMatches: (talentPoolId: string) => Promise<TalentPoolJobMatch[]>;
  calculateJobMatches: (talentPoolId: string) => Promise<TalentPoolJobMatch[]>;
  updateJobMatchStatus: (matchId: string, status: string) => Promise<TalentPoolJobMatch | null>;
  
  // Kontakt
  updateLastContacted: (id: string, userId?: string) => Promise<TalentPoolEntry | null>;
}

export const useTalentPoolStore = create<TalentPoolState>((set, get) => ({
  // Daten
  loading: false,
  error: null,
  entries: [],
  currentEntry: null,
  notes: [],
  activities: [],
  jobMatches: [],
  filter: {
    page: 0,
    pageSize: 20,
    sortBy: 'added_date',
    sortDirection: 'desc'
  },
  total: 0,
  
  // Funktionen
  fetchEntries: async (filter = {}) => {
    try {
      set({ loading: true, error: null });
      
      const currentFilter = get().filter;
      const newFilter = { ...currentFilter, ...filter };
      
      // URL und Query-Parameter erstellen
      let url = '/api/talent-pool';
      const queryParams = new URLSearchParams();
      
      if (newFilter.search) queryParams.append('search', newFilter.search);
      if (newFilter.entity_type) queryParams.append('entity_type', newFilter.entity_type);
      if (newFilter.statuses && newFilter.statuses.length > 0) queryParams.append('statuses', newFilter.statuses.join(','));
      if (newFilter.minRating !== undefined) queryParams.append('minRating', newFilter.minRating.toString());
      if (newFilter.maxRating !== undefined) queryParams.append('maxRating', newFilter.maxRating.toString());
      if (newFilter.addedSince) queryParams.append('addedSince', newFilter.addedSince);
      if (newFilter.addedBefore) queryParams.append('addedBefore', newFilter.addedBefore);
      if (newFilter.contactedSince) queryParams.append('contactedSince', newFilter.contactedSince);
      if (newFilter.contactedBefore) queryParams.append('contactedBefore', newFilter.contactedBefore);
      if (newFilter.reminderFrom) queryParams.append('reminderFrom', newFilter.reminderFrom);
      if (newFilter.reminderTo) queryParams.append('reminderTo', newFilter.reminderTo);
      if (newFilter.tags && newFilter.tags.length > 0) queryParams.append('tags', newFilter.tags.join(','));
      if (newFilter.page !== undefined) queryParams.append('page', newFilter.page.toString());
      if (newFilter.pageSize !== undefined) queryParams.append('pageSize', newFilter.pageSize.toString());
      if (newFilter.sortBy) queryParams.append('sortBy', newFilter.sortBy);
      if (newFilter.sortDirection) queryParams.append('sortDirection', newFilter.sortDirection);
      
      // Erweiterte Daten anfordern?
      queryParams.append('extended', 'false');
      
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }
      
      const response = await api.get(url);
      
      if (response.ok) {
        const data = await response.json();
        set({ 
          entries: data.entries || [], 
          total: data.total || 0,
          filter: newFilter,
          loading: false 
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fehler beim Abrufen der Talent-Pool-Einträge');
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error('Fehler beim Abrufen der Talent-Pool-Einträge:', error);
    }
  },
  
  fetchEntry: async (id, extended = true) => {
    try {
      set({ loading: true, error: null });
      
      const url = `/api/talent-pool/${id}${extended ? '?extended=true' : ''}`;
      const response = await api.get(url);
      
      if (response.ok) {
        const data = await response.json();
        if (extended) {
          set({ currentEntry: data as TalentPoolEntryExtended });
        }
        return data;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || `Fehler beim Abrufen des Talent-Pool-Eintrags mit ID ${id}`);
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error(`Fehler beim Abrufen des Talent-Pool-Eintrags mit ID ${id}:`, error);
      return null;
    } finally {
      set({ loading: false });
    }
  },
  
  addEntry: async (entityId, entityType, data = {}) => {
    try {
      set({ loading: true, error: null });
      
      const payload = {
        entity_id: entityId,
        entity_type: entityType,
        ...data
      };
      
      const response = await api.post('/api/talent-pool', payload);
      
      if (response.ok) {
        const newEntry = await response.json();
        // Lade die Einträge neu
        await get().fetchEntries();
        return newEntry;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fehler beim Hinzufügen zum Talent-Pool');
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error('Fehler beim Hinzufügen zum Talent-Pool:', error);
      return null;
    } finally {
      set({ loading: false });
    }
  },
  
  updateEntry: async (id, data) => {
    try {
      set({ loading: true, error: null });
      
      const response = await api.put(`/api/talent-pool/${id}`, data);
      
      if (response.ok) {
        const updatedEntry = await response.json();
        
        // Aktualisiere die Liste der Einträge, wenn der Eintrag vorhanden ist
        set(state => ({
          entries: state.entries.map(entry => 
            entry.id === id ? updatedEntry : entry
          )
        }));
        
        // Aktualisiere den aktuellen Eintrag, wenn er angezeigt wird
        if (get().currentEntry?.id === id) {
          set(state => ({
            currentEntry: {
              ...state.currentEntry!,
              ...updatedEntry
            }
          }));
        }
        
        return updatedEntry;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || `Fehler beim Aktualisieren des Talent-Pool-Eintrags mit ID ${id}`);
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error(`Fehler beim Aktualisieren des Talent-Pool-Eintrags mit ID ${id}:`, error);
      return null;
    } finally {
      set({ loading: false });
    }
  },
  
  removeEntry: async (id) => {
    try {
      set({ loading: true, error: null });
      
      const response = await api.delete(`/api/talent-pool/${id}`);
      
      if (response.ok) {
        // Entferne den Eintrag aus der Liste
        set(state => ({
          entries: state.entries.filter(entry => entry.id !== id)
        }));
        
        // Setze den aktuellen Eintrag zurück, wenn er gelöscht wurde
        if (get().currentEntry?.id === id) {
          set({ currentEntry: null });
        }
        
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || `Fehler beim Löschen des Talent-Pool-Eintrags mit ID ${id}`);
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error(`Fehler beim Löschen des Talent-Pool-Eintrags mit ID ${id}:`, error);
      return false;
    } finally {
      set({ loading: false });
    }
  },
  
  setFilter: (filter) => {
    set(state => ({
      filter: { ...state.filter, ...filter }
    }));
  },
  
  // Notizen
  fetchNotes: async (talentPoolId) => {
    try {
      set({ loading: true, error: null });
      
      const response = await api.get(`/api/talent-pool/${talentPoolId}/notes`);
      
      if (response.ok) {
        const notes = await response.json();
        set({ notes });
        return notes;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || `Fehler beim Abrufen der Notizen für Talent-Pool-Eintrag mit ID ${talentPoolId}`);
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error(`Fehler beim Abrufen der Notizen für Talent-Pool-Eintrag mit ID ${talentPoolId}:`, error);
      return [];
    } finally {
      set({ loading: false });
    }
  },
  
  addNote: async (talentPoolId, userId, content, noteType = 'general') => {
    try {
      set({ loading: true, error: null });
      
      const payload = {
        created_by: userId,
        content,
        note_type: noteType
      };
      
      const response = await api.post(`/api/talent-pool/${talentPoolId}/notes`, payload);
      
      if (response.ok) {
        const newNote = await response.json();
        
        // Aktualisiere die Liste der Notizen
        set(state => ({
          notes: [newNote, ...state.notes]
        }));
        
        return newNote;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || `Fehler beim Hinzufügen der Notiz für Talent-Pool-Eintrag mit ID ${talentPoolId}`);
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error(`Fehler beim Hinzufügen der Notiz für Talent-Pool-Eintrag mit ID ${talentPoolId}:`, error);
      return null;
    } finally {
      set({ loading: false });
    }
  },
  
  // Aktivitäten
  fetchActivities: async (talentPoolId) => {
    try {
      set({ loading: true, error: null });
      
      const response = await api.get(`/api/talent-pool/${talentPoolId}/activities`);
      
      if (response.ok) {
        const activities = await response.json();
        set({ activities });
        return activities;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || `Fehler beim Abrufen der Aktivitäten für Talent-Pool-Eintrag mit ID ${talentPoolId}`);
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error(`Fehler beim Abrufen der Aktivitäten für Talent-Pool-Eintrag mit ID ${talentPoolId}:`, error);
      return [];
    } finally {
      set({ loading: false });
    }
  },
  
  // Job-Matches
  fetchJobMatches: async (talentPoolId) => {
    try {
      set({ loading: true, error: null });
      
      const response = await api.get(`/api/talent-pool/${talentPoolId}/job-matches`);
      
      if (response.ok) {
        const jobMatches = await response.json();
        set({ jobMatches });
        return jobMatches;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || `Fehler beim Abrufen der Job-Matches für Talent-Pool-Eintrag mit ID ${talentPoolId}`);
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error(`Fehler beim Abrufen der Job-Matches für Talent-Pool-Eintrag mit ID ${talentPoolId}:`, error);
      return [];
    } finally {
      set({ loading: false });
    }
  },
  
  calculateJobMatches: async (talentPoolId) => {
    try {
      set({ loading: true, error: null });
      
      const response = await api.post(`/api/talent-pool/${talentPoolId}/job-matches`, {});
      
      if (response.ok) {
        const jobMatches = await response.json();
        set({ jobMatches });
        return jobMatches;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || `Fehler bei der Berechnung der Job-Matches für Talent-Pool-Eintrag mit ID ${talentPoolId}`);
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error(`Fehler bei der Berechnung der Job-Matches für Talent-Pool-Eintrag mit ID ${talentPoolId}:`, error);
      return [];
    } finally {
      set({ loading: false });
    }
  },
  
  updateJobMatchStatus: async (matchId, status) => {
    try {
      set({ loading: true, error: null });
      
      const payload = { status };
      const response = await api.patch(`/api/talent-pool/job-matches/${matchId}/status`, payload);
      
      if (response.ok) {
        const updatedMatch = await response.json();
        
        // Aktualisiere die Liste der Job-Matches
        set(state => ({
          jobMatches: state.jobMatches.map(match => 
            match.id === matchId ? updatedMatch : match
          )
        }));
        
        return updatedMatch;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || `Fehler beim Aktualisieren des Status für Job-Match mit ID ${matchId}`);
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error(`Fehler beim Aktualisieren des Status für Job-Match mit ID ${matchId}:`, error);
      return null;
    } finally {
      set({ loading: false });
    }
  },
  
  // Kontakt
  updateLastContacted: async (id, userId) => {
    try {
      set({ loading: true, error: null });
      
      const payload = { contacted_by: userId };
      const response = await api.post(`/api/talent-pool/${id}/contact`, payload);
      
      if (response.ok) {
        const updatedEntry = await response.json();
        
        // Aktualisiere die Liste der Einträge
        set(state => ({
          entries: state.entries.map(entry => 
            entry.id === id ? updatedEntry : entry
          )
        }));
        
        // Aktualisiere den aktuellen Eintrag, wenn er angezeigt wird
        if (get().currentEntry?.id === id) {
          set(state => ({
            currentEntry: {
              ...state.currentEntry!,
              ...updatedEntry
            }
          }));
        }
        
        return updatedEntry;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || `Fehler beim Aktualisieren des Kontaktzeitpunkts für Talent-Pool-Eintrag mit ID ${id}`);
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error(`Fehler beim Aktualisieren des Kontaktzeitpunkts für Talent-Pool-Eintrag mit ID ${id}:`, error);
      return null;
    } finally {
      set({ loading: false });
    }
  }
}));
