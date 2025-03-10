// Erweiterte Bewerbungsstatus-Typen
export type ExtendedApplicationStatus = 
  | 'new'
  | 'in_review'
  | 'interview'
  | 'accepted'
  | 'rejected'
  | 'archived';

// Quellen für Bewerbungen
export type ApplicationSource = 
  | 'email'
  | 'portal'
  | 'website'
  | 'direct'
  | 'referral'
  | 'agency'
  | 'other';

// Filter-Parameter für die Bewerbungssuche
export interface ApplicationFilter {
  searchText?: string;
  statuses?: ExtendedApplicationStatus[];
  sources?: ApplicationSource[];
  dateFrom?: string;
  dateTo?: string;
  hasCV?: boolean;
  matchScoreMin?: number;
  matchScoreMax?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
  // Erweiterte Filter-Parameter
  jobIds?: string[];
  assignedTo?: string[];
  nextSteps?: string[];
  tags?: string[];
}

// Antwortformat für Listen von Bewerbungen
export interface ApplicationListResponse {
  applications: ApplicationExtended[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Antwortformat für einzelne Bewerbung
export interface ApplicationResponse {
  application: ApplicationExtended;
}

// Parameter zum Erstellen einer neuen Bewerbung
export interface CreateApplicationParams {
  job_id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone?: string;
  applicant_location?: string;
  status?: ExtendedApplicationStatus;
  source: ApplicationSource;
  source_detail?: string;
  cover_letter?: string;
  has_cv?: boolean;
  cv_file_path?: string;
  has_documents?: boolean;
  documents_paths?: string;
  assigned_to?: string;
  candidate_id?: string;
}

// Parameter zum Aktualisieren einer Bewerbung
export interface UpdateApplicationParams {
  job_id?: string;
  candidate_id?: string;
  applicant_name?: string;
  applicant_email?: string;
  applicant_phone?: string;
  applicant_location?: string;
  status?: ExtendedApplicationStatus;
  status_reason?: string;
  status_changed_by?: string;
  source?: ApplicationSource;
  source_detail?: string;
  cover_letter?: string;
  has_cv?: boolean;
  cv_file_path?: string;
  has_documents?: boolean;
  documents_paths?: string;
  match_score?: number;
  match_data?: string | ApplicationMatchData;
  communication_history?: string | any;
  last_contact_at?: string;
  next_step?: string;
  next_step_due_date?: string;
  assigned_to?: string;
  notes?: ApplicationNote[];
  tags?: ApplicationTag[];
}

// Parameter zum Ändern des Status einer Bewerbung
export interface ChangeApplicationStatusParams {
  application_id: string;
  status: ExtendedApplicationStatus;
  reason?: string;
  changed_by: string;
}

// Tag-Datensatz für Bewerbungen
export interface ApplicationTag {
  id: string;
  application_id: string;
  tag: string;
  created_by?: string;
  created_at: string;
}

// Anhang zu einer Bewerbung
export interface ApplicationAttachment {
  id: string;
  application_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size?: number;
  uploaded_by?: string;
  uploaded_at: string;
}

// Basis-Bewerbung
export interface Application {
  id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone?: string;
  applicant_location?: string;
  job_id?: string;
  status: ExtendedApplicationStatus;
  source: ApplicationSource;
  source_detail?: string;
  has_cv: boolean;
  created_at: string;
  updated_at?: string;
  match_score?: number;
  match_data?: string | ApplicationMatchData;
  notes?: ApplicationNote[];
  tags?: ApplicationTag[];
  attachments?: ApplicationAttachment[];
}

// Erweiterte Bewerbung mit zusätzlichen Daten
export interface ApplicationExtended extends Application {
  job?: {
    id: string;
    title: string;
    company: string;
    location?: string;
  };
  candidate?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    location?: string;
  };
  candidate_id?: string;
  status_reason?: string;
  status_changed_at?: string;
  status_changed_by?: string;
  cover_letter?: string;
  cv_file_path?: string;
  has_documents?: boolean;
  documents_paths?: string;
  communication_history?: any;
  last_contact_at?: string;
  next_step?: string;
  next_step_due_date?: string;
  assigned_to?: string;
}

// Notiz zu einer Bewerbung
export interface ApplicationNote {
  id: string;
  application_id: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at?: string;
}

// Matching-Daten
export interface ApplicationMatchData {
  overallScore: number;
  categoryScores?: {
    skills?: number;
    experience?: number;
    education?: number;
    location?: number;
    salary?: number;
  };
  matchedSkills?: MatchedSkill[];
  matchDetails?: string;
}

// Übereinstimmende Skills
export interface MatchedSkill {
  skill: string;
  score: number;
  relevance?: number;
}
