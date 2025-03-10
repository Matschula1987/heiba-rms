/**
 * Zustand-Store für gespeicherte Filter und aktuelle Filtereinstellungen
 */

import { create } from 'zustand';
import { 
  SavedFilter, 
  JobFilter, 
  CandidateFilter, 
  CustomerFilter 
} from '@/types/filters';

// Typdefinitionen für den Store
interface FilterStore {
  // Zustand
  savedFilters: SavedFilter[];
  currentJobFilter: JobFilter;
  currentCandidateFilter: CandidateFilter;
  currentCustomerFilter: CustomerFilter;
  isLoading: boolean;
  error: string | null;
  
  // Aktionen - Gespeicherte Filter
  fetchSavedFilters: (entityType: 'job' | 'candidate' | 'customer', userId: string) => Promise<void>;
  saveFilter: (filter: Omit<SavedFilter, 'id' | 'createdAt' | 'updatedAt'>) => Promise<SavedFilter | null>;
  updateFilter: (id: string, filter: Partial<Omit<SavedFilter, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<SavedFilter | null>;
  deleteFilter: (id: string) => Promise<boolean>;
  
  // Aktionen - Aktuelle Filter
  updateJobFilter: (filter: Partial<JobFilter>) => void;
  updateCandidateFilter: (filter: Partial<CandidateFilter>) => void;
  updateCustomerFilter: (filter: Partial<CustomerFilter>) => void;
  resetJobFilter: () => void;
  resetCandidateFilter: () => void;
  resetCustomerFilter: () => void;
  applyFilter: (filter: SavedFilter) => void;
  
  // Helper
  clearErrors: () => void;
}

// Standardwerte für Filter
const defaultJobFilter: JobFilter = {
  searchText: '',
  sortBy: 'created_at',
  sortDirection: 'desc',
  page: 0,
  pageSize: 20
};

const defaultCandidateFilter: CandidateFilter = {
  searchText: '',
  sortBy: 'created_at',
  sortDirection: 'desc',
  page: 0,
  pageSize: 20
};

const defaultCustomerFilter: CustomerFilter = {
  searchText: '',
  sortBy: 'name',
  sortDirection: 'asc',
  page: 0,
  pageSize: 20
};

// Store-Implementierung
export const useFilterStore = create<FilterStore>((set, get) => ({
  // Initialer Zustand
  savedFilters: [],
  currentJobFilter: { ...defaultJobFilter },
  currentCandidateFilter: { ...defaultCandidateFilter },
  currentCustomerFilter: { ...defaultCustomerFilter },
  isLoading: false,
  error: null,
  
  // Aktionen - Gespeicherte Filter
  fetchSavedFilters: async (entityType, userId) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch(`/api/filters?entity_type=${entityType}&user_id=${userId}`);
      
      if (!response.ok) {
        throw new Error('Fehler beim Laden der gespeicherten Filter');
      }
      
      const data = await response.json();
      
      if (data.success) {
        set({ savedFilters: data.filters, isLoading: false });
      } else {
        throw new Error(data.error || 'Fehler beim Laden der gespeicherten Filter');
      }
    } catch (error) {
      console.error('Fehler beim Laden der gespeicherten Filter:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Unbekannter Fehler',
        isLoading: false
      });
    }
  },
  
  saveFilter: async (filter) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch('/api/filters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(filter)
      });
      
      if (!response.ok) {
        throw new Error('Fehler beim Speichern des Filters');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Aktualisiere die Liste der gespeicherten Filter
        set(state => ({
          savedFilters: [...state.savedFilters, data.filter],
          isLoading: false
        }));
        
        return data.filter;
      } else {
        throw new Error(data.error || 'Fehler beim Speichern des Filters');
      }
    } catch (error) {
      console.error('Fehler beim Speichern des Filters:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Unbekannter Fehler',
        isLoading: false
      });
      return null;
    }
  },
  
  updateFilter: async (id, filter) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch(`/api/filters/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(filter)
      });
      
      if (!response.ok) {
        throw new Error('Fehler beim Aktualisieren des Filters');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Aktualisiere die Liste der gespeicherten Filter
        set(state => ({
          savedFilters: state.savedFilters.map(f => 
            f.id === id ? data.filter : f
          ),
          isLoading: false
        }));
        
        return data.filter;
      } else {
        throw new Error(data.error || 'Fehler beim Aktualisieren des Filters');
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Filters:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Unbekannter Fehler',
        isLoading: false
      });
      return null;
    }
  },
  
  deleteFilter: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch(`/api/filters/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Fehler beim Löschen des Filters');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Aktualisiere die Liste der gespeicherten Filter
        set(state => ({
          savedFilters: state.savedFilters.filter(f => f.id !== id),
          isLoading: false
        }));
        
        return true;
      } else {
        throw new Error(data.error || 'Fehler beim Löschen des Filters');
      }
    } catch (error) {
      console.error('Fehler beim Löschen des Filters:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Unbekannter Fehler',
        isLoading: false
      });
      return false;
    }
  },
  
  // Aktionen - Aktuelle Filter
  updateJobFilter: (filter) => {
    set(state => ({
      currentJobFilter: {
        ...state.currentJobFilter,
        ...filter,
        // Bei Änderung der Filter zurück zur ersten Seite
        ...(filter.searchText !== undefined || 
           filter.status !== undefined || 
           filter.locations !== undefined ||
           filter.departments !== undefined ||
           filter.jobTypes !== undefined ? { page: 0 } : {})
      }
    }));
  },
  
  updateCandidateFilter: (filter) => {
    set(state => ({
      currentCandidateFilter: {
        ...state.currentCandidateFilter,
        ...filter,
        // Bei Änderung der Filter zurück zur ersten Seite
        ...(filter.searchText !== undefined || 
           filter.status !== undefined || 
           filter.locations !== undefined ||
           filter.skills !== undefined ? { page: 0 } : {})
      }
    }));
  },
  
  updateCustomerFilter: (filter) => {
    set(state => ({
      currentCustomerFilter: {
        ...state.currentCustomerFilter,
        ...filter,
        // Bei Änderung der Filter zurück zur ersten Seite
        ...(filter.searchText !== undefined || 
           filter.type !== undefined || 
           filter.status !== undefined ||
           filter.industries !== undefined ? { page: 0 } : {})
      }
    }));
  },
  
  resetJobFilter: () => {
    set({
      currentJobFilter: { ...defaultJobFilter }
    });
  },
  
  resetCandidateFilter: () => {
    set({
      currentCandidateFilter: { ...defaultCandidateFilter }
    });
  },
  
  resetCustomerFilter: () => {
    set({
      currentCustomerFilter: { ...defaultCustomerFilter }
    });
  },
  
  applyFilter: (filter) => {
    if (filter.entityType === 'job') {
      set({
        currentJobFilter: {
          ...filter.filter as JobFilter,
          page: 0 // Immer bei Seite 0 anfangen
        }
      });
    } else if (filter.entityType === 'candidate') {
      set({
        currentCandidateFilter: {
          ...filter.filter as CandidateFilter,
          page: 0 // Immer bei Seite 0 anfangen
        }
      });
    } else if (filter.entityType === 'customer') {
      set({
        currentCustomerFilter: {
          ...filter.filter as CustomerFilter,
          page: 0 // Immer bei Seite 0 anfangen
        }
      });
    }
  },
  
  // Helper
  clearErrors: () => {
    set({ error: null });
  }
}));
