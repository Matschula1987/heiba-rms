// Re-export aller Job-bezogenen Typen
export * from './jobs';
export * from './notifications';
export * from './applications';

// Legacy-Typen für Abwärtskompatibilität
// @deprecated Bitte die Typen aus './jobs' verwenden
export interface Application {
  id: string
  job_id: string
  candidate_id: string
  status: 'new' | 'in_review' | 'interview' | 'offer' | 'rejected' | 'accepted'
  created_at: string
  updated_at: string
  documents?: {
    cv?: string
    cover_letter?: string
    certificates?: string[]
  }
  candidate: {
    name: string
    email: string
    phone?: string
  }
  notes?: string[]
  interview_dates?: string[]
}

// Dashboard-Statistiken
export interface DashboardStats {
  openApplications: number;
  dailyFits: number;
  activeJobs: number;
  portalEntries: number;
  matchRate: number;
  totalCandidates: number;
  activeCandidates: number;
  newCandidatesThisWeek?: number;
  newCandidatesThisMonth?: number;
  upcomingInterviews?: number;
  openPositions?: number;
  candidatesByStatus?: Array<{
    status: string;
    count: number;
  }>;
  candidatesBySource?: Array<{
    source: string;
    count: number;
  }>;
  recentActivities?: Array<{
    type: string;
    name: string;
    position: string;
    date: string;
  }>;
}

export type CandidateStatus = 'new' | 'in_process' | 'interview' | 'hired' | 'rejected' | 'inactive' | 'active';

export interface Skill {
  name: string;
  level: number;
  description?: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  size?: number;
  uploadedAt?: string;
}

export interface Language {
  language?: string;
  name?: string;
  level: string;
}

// Erweitertes Qualifikationsprofil-Interface
export interface QualificationProfile {
  id?: string;
  summary?: string;
  skills: Skill[];
  experience: Array<string | {
    position?: string;
    title?: string;
    company?: string;
    description?: string;
    period?: string;
    startDate?: string;
    endDate?: string;
  }>;
  education?: Array<{
    degree?: string;
    institution?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
  certificates: string[];
  languages: Language[];
  candidateId?: string;
}

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  position: string;
  status: CandidateStatus;
  location: string;
  phone?: string;
  profileImage?: string;
  experience?: Array<string | {
    position?: string;
    title?: string;
    company?: string;
    description?: string;
    period?: string;
    startDate?: string;
    endDate?: string;
  }>;
  documents?: Document[];
  qualifications?: Skill[];
  skills?: Skill[];
  qualificationProfile?: QualificationProfile;
  createdAt?: string;
  updatedAt?: string;
  communicationHistory?: CommunicationEntry[];
}

// Für die Gesprächshistorie
export interface CommunicationEntry {
  id: string;
  type: 'email' | 'call' | 'meeting' | 'note';
  date: string;
  content: string;
  attachments?: string[];
  createdBy?: string;
}

// Für das Matching-System
export interface MatchingOptions {
  fuzzySkillMatching: boolean;
  locationRadius: number;
  minimumScore: number;
}

// PortalJob Schnittstelle (wenn nicht in portal.ts definiert)
export interface PortalJob {
  portalId: string;
  portalJobId: string;
  title: string;
  description: string;
  location: string;
  requirements?: string;
  department?: string;
  requiredSkills?: Skill[];
  requiredExperience?: number;
  requiredEducation?: string;
  salaryRange?: string;
  status?: string;
  portalName?: string;
  originalUrl?: string;
  company?: string;
  external?: boolean;
}
