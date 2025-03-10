/**
 * Typdefinitionen für die erweiterten Filter-Funktionen
 */

/**
 * Basisfilter für alle Entitätstypen
 */
export interface BaseFilter {
  searchText?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

/**
 * Filter für Jobs
 */
export interface JobFilter extends BaseFilter {
  status?: string[];
  locations?: string[];
  departments?: string[];
  jobTypes?: string[];
  skills?: string[];
  minSalary?: number;
  maxSalary?: number;
  createdAfter?: string; // ISO-Datum
  createdBefore?: string; // ISO-Datum
  customers?: string[];
}

/**
 * Filter für Kandidaten
 */
export interface CandidateFilter extends BaseFilter {
  status?: string[];
  locations?: string[];
  skills?: string[];
  experienceMin?: number;
  experienceMax?: number;
  availableFrom?: string; // ISO-Datum
  languages?: string[];
  educationLevels?: string[];
  sources?: string[];
}

/**
 * Filter für Kunden/Unternehmen
 */
export interface CustomerFilter extends BaseFilter {
  type?: ('customer' | 'prospect')[];
  status?: ('active' | 'inactive' | 'prospect' | 'former')[];
  industries?: string[];
  locations?: string[];
  assignedTo?: string[];
  lastContactAfter?: string; // ISO-Datum
  lastContactBefore?: string; // ISO-Datum
}

/**
 * Gespeicherte Filter
 */
export interface SavedFilter {
  id: string;
  name: string;
  entityType: 'job' | 'candidate' | 'customer';
  filter: JobFilter | CandidateFilter | CustomerFilter;
  isDefault?: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Sortieroptionen für Jobs
 */
export const JOB_SORT_OPTIONS = [
  { value: 'created_at', label: 'Erstellungsdatum' },
  { value: 'title', label: 'Titel' },
  { value: 'status', label: 'Status' },
  { value: 'location', label: 'Standort' },
  { value: 'department', label: 'Abteilung' },
  { value: 'company', label: 'Unternehmen' }
];

/**
 * Sortieroptionen für Kandidaten
 */
export const CANDIDATE_SORT_OPTIONS = [
  { value: 'created_at', label: 'Erstellungsdatum' },
  { value: 'name', label: 'Name' },
  { value: 'status', label: 'Status' },
  { value: 'location', label: 'Standort' },
  { value: 'position', label: 'Position' }
];

/**
 * Sortieroptionen für Kunden
 */
export const CUSTOMER_SORT_OPTIONS = [
  { value: 'created_at', label: 'Erstellungsdatum' },
  { value: 'name', label: 'Name' },
  { value: 'status', label: 'Status' },
  { value: 'type', label: 'Typ' },
  { value: 'industry', label: 'Branche' }
];

/**
 * Optionen für Job-Status
 */
export const JOB_STATUS_OPTIONS = [
  { value: 'active', label: 'Aktiv' },
  { value: 'inactive', label: 'Inaktiv' },
  { value: 'draft', label: 'Entwurf' },
  { value: 'archived', label: 'Archiviert' }
];

/**
 * Optionen für Kandidaten-Status
 */
export const CANDIDATE_STATUS_OPTIONS = [
  { value: 'new', label: 'Neu' },
  { value: 'in_process', label: 'In Bearbeitung' },
  { value: 'interview', label: 'Interview' },
  { value: 'hired', label: 'Eingestellt' },
  { value: 'rejected', label: 'Abgelehnt' },
  { value: 'inactive', label: 'Inaktiv' },
  { value: 'active', label: 'Aktiv' }
];

/**
 * Optionen für Kunden-Typen
 */
export const CUSTOMER_TYPE_OPTIONS = [
  { value: 'customer', label: 'Kunde' },
  { value: 'prospect', label: 'Interessent' }
];

/**
 * Optionen für Kunden-Status
 */
export const CUSTOMER_STATUS_OPTIONS = [
  { value: 'active', label: 'Aktiv' },
  { value: 'inactive', label: 'Inaktiv' },
  { value: 'prospect', label: 'Interessent' },
  { value: 'former', label: 'Ehemaliger Kunde' }
];
