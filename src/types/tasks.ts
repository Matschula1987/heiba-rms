// Task Priority Typen
export type TaskPriority = 'high' | 'medium' | 'low';

// Task Status Typen
export type TaskStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';

// Task-Typen
export type TaskType = 
  | 'application_followup' 
  | 'job_expiry' 
  | 'candidate_interview' 
  | 'matching_review'
  | 'document_approval'
  | 'manual'
  | 'application_review'    // Manuelle Überprüfung einer Bewerbung
  | 'rejection_review'      // Überprüfung einer geplanten Absage
  | 'candidate_contact';    // Kontaktaufnahme mit einem Kandidaten

// Task-Interface
export interface Task {
  id: string;
  title: string;
  description: string;
  due_date: string;  // ISO date string
  priority: TaskPriority;
  status: TaskStatus;
  task_type: TaskType;
  
  // Verknüpfungen
  assigned_to?: string;  // Benutzer-ID
  related_entity_type?: 'application' | 'job' | 'candidate' | 'talent_pool' | 'other';
  related_entity_id?: string;

  // Automatisierung
  is_automated: boolean;
  reminder_sent: boolean;
  
  // Zeitstempel
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

// Task-Creation Interface
export interface TaskCreateInput {
  title: string;
  description: string;
  due_date: string;
  priority: TaskPriority;
  status?: TaskStatus;
  task_type: TaskType;
  assigned_to?: string;
  related_entity_type?: 'application' | 'job' | 'candidate' | 'talent_pool' | 'other';
  related_entity_id?: string;
  is_automated?: boolean;
}

// Task-Update Interface
export interface TaskUpdateInput {
  title?: string;
  description?: string;
  due_date?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  assigned_to?: string;
  reminder_sent?: boolean;
  completed_at?: string;
}
