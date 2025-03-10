import { Candidate } from './index';
import { ApplicationExtended } from './applications';

/**
 * Status eines Talent-Pool-Eintrags
 */
export type TalentPoolStatus = 'active' | 'inactive' | 'contacted' | 'not_interested';

/**
 * Status eines Job-Matches im Talent-Pool
 */
export type TalentPoolMatchStatus = 'new' | 'reviewed' | 'contacted' | 'rejected' | 'accepted';

/**
 * Typ der Entität im Talent-Pool
 */
export type TalentPoolEntityType = 'candidate' | 'application';

/**
 * Basis-Interface für Talent-Pool-Einträge
 */
export interface TalentPoolEntry {
  id: string;
  entity_id: string;
  entity_type: TalentPoolEntityType;
  added_date: string;
  added_by?: string;
  reason?: string;
  notes?: string;
  last_contacted?: string;
  rating?: number;
  tags?: string[] | string; // Kann als JSON-String oder als Array kommen
  skills_snapshot?: any;
  experience_snapshot?: any;
  status: TalentPoolStatus;
  reminder_date?: string;
}

/**
 * Erweitertes Interface für Talent-Pool-Einträge mit Entitätsdaten
 */
export interface TalentPoolEntryExtended extends TalentPoolEntry {
  entity_data: Candidate | ApplicationExtended;
}

/**
 * Interface für Job-Matches im Talent-Pool
 */
export interface TalentPoolJobMatch {
  id: string;
  talent_pool_id: string;
  job_id: string;
  match_score: number;
  created_at: string;
  last_updated: string;
  match_details?: any; // JSON mit Match-Details
  status: TalentPoolMatchStatus;
}

/**
 * Interface für Notizen zu Talent-Pool-Einträgen
 */
export interface TalentPoolNote {
  id: string;
  talent_pool_id: string;
  created_by: string;
  created_at: string;
  content: string;
  note_type: string;
}

/**
 * Interface für Aktivitäten im Talent-Pool
 */
export interface TalentPoolActivity {
  id: string;
  talent_pool_id: string;
  activity_type: string;
  activity_data?: any; // JSON mit Aktivitätsdaten
  created_by?: string;
  created_at: string;
}

/**
 * Interface für Filter beim Abfragen von Talent-Pool-Einträgen
 */
export interface TalentPoolFilter {
  search?: string;
  entity_type?: TalentPoolEntityType;
  statuses?: TalentPoolStatus[];
  minRating?: number;
  maxRating?: number;
  tags?: string[];
  addedSince?: string;
  addedBefore?: string;
  contactedSince?: string;
  contactedBefore?: string;
  reminderFrom?: string;
  reminderTo?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

/**
 * Interface für die Erstellung eines Talent-Pool-Eintrags
 */
export interface CreateTalentPoolEntryParams {
  entity_id: string;
  entity_type: TalentPoolEntityType;
  added_by?: string;
  reason?: string;
  notes?: string;
  rating?: number;
  tags?: string[];
  status?: TalentPoolStatus;
  reminder_date?: string;
}

/**
 * Interface für die Aktualisierung eines Talent-Pool-Eintrags
 */
export interface UpdateTalentPoolEntryParams {
  reason?: string;
  notes?: string;
  rating?: number;
  tags?: string[];
  status?: TalentPoolStatus;
  reminder_date?: string;
}

/**
 * Interface für das Hinzufügen einer Notiz zu einem Talent-Pool-Eintrag
 */
export interface AddTalentPoolNoteParams {
  talent_pool_id: string;
  created_by: string;
  content: string;
  note_type?: string;
}
