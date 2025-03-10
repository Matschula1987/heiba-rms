import { create } from 'zustand'
import { Task, TaskCreateInput, TaskUpdateInput, TaskStatus, TaskPriority } from '@/types/tasks'
import { v4 as uuidv4 } from 'uuid'

interface TaskStore {
  tasks: Task[];
  filteredTasks: Task[];
  isLoading: boolean;
  error: string | null;
  
  // Filter-Zustände
  statusFilter: TaskStatus | 'all';
  priorityFilter: TaskPriority | 'all';
  searchTerm: string;
  dueDateRange: { start: Date | null; end: Date | null };
  assignedToFilter: string | 'all';
  
  // Aktionen
  fetchTasks: () => Promise<void>;
  getTaskById: (id: string) => Task | undefined;
  createTask: (taskData: TaskCreateInput) => Promise<Task>;
  updateTask: (id: string, taskData: TaskUpdateInput) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  markAsCompleted: (id: string) => Promise<Task>;
  
  // Filter-Aktionen
  setStatusFilter: (status: TaskStatus | 'all') => void;
  setPriorityFilter: (priority: TaskPriority | 'all') => void;
  setSearchTerm: (searchTerm: string) => void;
  setDueDateRange: (range: { start: Date | null; end: Date | null }) => void;
  setAssignedToFilter: (assignedTo: string | 'all') => void;
  resetFilters: () => void;
  applyFilters: () => void;
  
  // Automatisierte Aufgaben-Aktionen
  generateTasksFromApplications: () => Promise<void>;
  generateTasksFromJobExpirations: () => Promise<void>;
  generateTasksFromMatches: () => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  filteredTasks: [],
  isLoading: false,
  error: null,
  
  // Filter-Standardwerte
  statusFilter: 'all',
  priorityFilter: 'all',
  searchTerm: '',
  dueDateRange: { start: null, end: null },
  assignedToFilter: 'all',
  
  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error('Fehler beim Abrufen der Aufgaben');
      }
      const data = await response.json();
      set({ tasks: data, filteredTasks: data, isLoading: false });
      get().applyFilters(); // Filter anwenden, falls vorhanden
    } catch (error) {
      console.error('Fehler beim Laden der Aufgaben:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  getTaskById: (id) => {
    return get().tasks.find(task => task.id === id);
  },
  
  createTask: async (taskData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      
      if (!response.ok) {
        throw new Error('Fehler beim Erstellen der Aufgabe');
      }
      
      const createdTask = await response.json();
      set(state => ({
        tasks: [...state.tasks, createdTask],
        isLoading: false
      }));
      get().applyFilters(); // Filter nach Hinzufügen neu anwenden
      return createdTask;
    } catch (error) {
      console.error('Fehler beim Erstellen der Aufgabe:', error);
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  updateTask: async (id, taskData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      
      if (!response.ok) {
        throw new Error('Fehler beim Aktualisieren der Aufgabe');
      }
      
      const updatedTask = await response.json();
      set(state => ({
        tasks: state.tasks.map(task => task.id === id ? updatedTask : task),
        isLoading: false
      }));
      get().applyFilters(); // Filter nach Update neu anwenden
      return updatedTask;
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Aufgabe:', error);
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  deleteTask: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Fehler beim Löschen der Aufgabe');
      }
      
      set(state => ({
        tasks: state.tasks.filter(task => task.id !== id),
        isLoading: false
      }));
      get().applyFilters(); // Filter nach Löschen neu anwenden
    } catch (error) {
      console.error('Fehler beim Löschen der Aufgabe:', error);
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  markAsCompleted: async (id) => {
    return get().updateTask(id, {
      status: 'completed',
      completed_at: new Date().toISOString()
    });
  },
  
  // Filter-Funktionen
  setStatusFilter: (status) => {
    set({ statusFilter: status });
    get().applyFilters();
  },
  
  setPriorityFilter: (priority) => {
    set({ priorityFilter: priority });
    get().applyFilters();
  },
  
  setSearchTerm: (searchTerm) => {
    set({ searchTerm });
    get().applyFilters();
  },
  
  setDueDateRange: (range) => {
    set({ dueDateRange: range });
    get().applyFilters();
  },
  
  setAssignedToFilter: (assignedTo) => {
    set({ assignedToFilter: assignedTo });
    get().applyFilters();
  },
  
  resetFilters: () => {
    set({
      statusFilter: 'all',
      priorityFilter: 'all',
      searchTerm: '',
      dueDateRange: { start: null, end: null },
      assignedToFilter: 'all'
    });
    get().applyFilters();
  },
  
  applyFilters: () => {
    const { 
      tasks, 
      statusFilter, 
      priorityFilter, 
      searchTerm, 
      dueDateRange,
      assignedToFilter 
    } = get();
    
    let filtered = [...tasks];
    
    // Filter nach Status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }
    
    // Filter nach Priorität
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }
    
    // Filter nach Suchbegriff
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(search) || 
        (task.description && task.description.toLowerCase().includes(search))
      );
    }
    
    // Filter nach Fälligkeitsdatum
    if (dueDateRange.start || dueDateRange.end) {
      filtered = filtered.filter(task => {
        const dueDate = new Date(task.due_date);
        
        if (dueDateRange.start && dueDateRange.end) {
          return dueDate >= dueDateRange.start && dueDate <= dueDateRange.end;
        } else if (dueDateRange.start) {
          return dueDate >= dueDateRange.start;
        } else if (dueDateRange.end) {
          return dueDate <= dueDateRange.end;
        }
        
        return true;
      });
    }
    
    // Filter nach Zugewiesenem Benutzer
    if (assignedToFilter !== 'all') {
      filtered = filtered.filter(task => task.assigned_to === assignedToFilter);
    }
    
    set({ filteredTasks: filtered });
  },
  
  // Automatisierte Aufgaben-Generierung
  generateTasksFromApplications: async () => {
    try {
      const response = await fetch('/api/applications?status=new');
      if (!response.ok) {
        throw new Error('Fehler beim Abrufen neuer Bewerbungen');
      }
      
      const applications = await response.json();
      const newTasks: TaskCreateInput[] = applications.map((application: any) => ({
        title: `Bewerbung prüfen: ${application.first_name} ${application.last_name}`,
        description: `Neue Bewerbung von ${application.first_name} ${application.last_name} für die Stelle ${application.job_title || 'Unbekannt'} eingegangen. Bitte prüfen und Status aktualisieren.`,
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 Tage ab jetzt
        priority: 'medium',
        task_type: 'application_followup',
        is_automated: true,
        related_entity_type: 'application',
        related_entity_id: application.id
      }));
      
      for (const taskData of newTasks) {
        await get().createTask(taskData);
      }
    } catch (error) {
      console.error('Fehler bei der automatischen Aufgabenerstellung:', error);
      throw error;
    }
  },
  
  generateTasksFromJobExpirations: async () => {
    try {
      // Jobs abrufen, die in den nächsten 7 Tagen ablaufen
      const oneWeekFromNow = new Date();
      oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
      
      const response = await fetch(`/api/jobs?expiryBefore=${oneWeekFromNow.toISOString()}`);
      if (!response.ok) {
        throw new Error('Fehler beim Abrufen ablaufender Jobs');
      }
      
      const jobs = await response.json();
      const newTasks: TaskCreateInput[] = jobs.map((job: any) => ({
        title: `Stellenanzeige läuft ab: ${job.title}`,
        description: `Die Stellenanzeige für "${job.title}" läuft am ${new Date(job.publication_end_date).toLocaleDateString()} ab. Bitte prüfen und ggf. verlängern oder deaktivieren.`,
        due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1 Tag ab jetzt
        priority: 'high',
        task_type: 'job_expiry',
        is_automated: true,
        related_entity_type: 'job',
        related_entity_id: job.id
      }));
      
      for (const taskData of newTasks) {
        await get().createTask(taskData);
      }
    } catch (error) {
      console.error('Fehler bei der automatischen Aufgabenerstellung:', error);
      throw error;
    }
  },
  
  generateTasksFromMatches: async () => {
    try {
      // Hochwertige Matches abrufen (Score > 90%)
      const response = await fetch('/api/matching?minScore=90');
      if (!response.ok) {
        throw new Error('Fehler beim Abrufen der Matches');
      }
      
      const matches = await response.json();
      const newTasks: TaskCreateInput[] = matches.map((match: any) => ({
        title: `Hochwertige Übereinstimmung prüfen`,
        description: `Es wurde eine hochwertige Übereinstimmung (${match.score}%) zwischen ${match.candidate_name} und der Stelle "${match.job_title}" gefunden. Bitte prüfen und Kontakt aufnehmen.`,
        due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1 Tag ab jetzt
        priority: 'high',
        task_type: 'matching_review',
        is_automated: true,
        related_entity_type: match.match_type === 'internal' ? 'candidate' : 'job',
        related_entity_id: match.match_type === 'internal' ? match.candidate_id : match.job_id
      }));
      
      for (const taskData of newTasks) {
        await get().createTask(taskData);
      }
    } catch (error) {
      console.error('Fehler bei der automatischen Aufgabenerstellung:', error);
      throw error;
    }
  }
}));
