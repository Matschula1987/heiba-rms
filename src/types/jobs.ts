// JobStatus-Typen (erweitert)
export type JobStatus = 'active' | 'inactive' | 'draft' | 'archived';

// Multiposting-Plattform-Status
export type PostingStatus = 'draft' | 'pending' | 'published' | 'expired' | 'rejected' | 'error';

// Social-Media-Post-Status
export type SocialPostStatus = 'draft' | 'scheduled' | 'published' | 'failed' | 'cancelled';

// Bewerbungsstatus
export type ApplicationStatus = 'new' | 'review' | 'interview' | 'offer' | 'hired' | 'rejected' | 'withdrawn';

// Plattformen für Multiposting
export type JobPlatform = 
  // Kostenlose Plattformen
  | 'indeed' 
  | 'google_jobs' 
  | 'arbeitsagentur' 
  | 'joblift' 
  | 'jobrapido' 
  // Kostenpflichtige Plattformen
  | 'stepstone' 
  | 'monster' 
  | 'xing' 
  | 'linkedin' 
  // Andere
  | 'company_website'
  | 'other';

// Social-Media-Plattformen
export type SocialPlatform = 'linkedin' | 'xing' | 'facebook' | 'twitter' | 'instagram' | 'other';

// A/B-Test-Status
export type ABTestStatus = 'active' | 'completed' | 'cancelled';

// Erweitertes Job-Interface
export interface Job {
  id: string;
  title: string;
  description: string;           // Einfache Beschreibung
  rich_description?: string;     // HTML/Rich-Text formatierte Beschreibung
  company: string;
  location: string;
  salary_range?: string;
  job_type: string;
  requirements?: string;
  
  // Erweiterte Daten
  company_id?: number;           // Legacy-Feld für Abwärtskompatibilität
  customer_id?: string;          // Verknüpfung mit Kunden/Interessenten
  external_job_id?: string;      // Anpassbare externe Job-ID
  contact_person_id?: string;    // Ansprechpartner beim Kunden
  department?: string;           // Abteilung
  company_description?: string;  // Beschreibung des Unternehmens
  benefits?: string;             // Vorteile/Benefits für Bewerber
  requirements_profile?: string; // Detailliertes Anforderungsprofil
  keywords?: string;             // Für SEO und Matching
  internal_notes?: string;       // Interne Notizen
  
  // Veröffentlichungsmanagement
  publication_start_date?: string; // Startdatum der Veröffentlichung
  publication_end_date?: string;   // Enddatum der Veröffentlichung
  republish_cycle?: number;        // Zyklus in Tagen
  published_platforms?: string[];  // Array mit IDs der Plattformen, auf denen veröffentlicht wurde
  
  // Workflow und Verantwortlichkeiten
  assigned_to?: string;            // Verantwortlicher Mitarbeiter
  status: JobStatus;               // Status
  
  // Skills & Metadaten
  skills?: Array<{
    name: string;
    level?: number;
  }>;
  applications_count?: number;
  
  // Zeitstempel
  created_at: string;
  updated_at: string;
}

// Textbausteine (Templates)
export interface JobTemplate {
  id: string;
  name: string;
  category: string;   // z.B. 'intro', 'benefits', 'requirements', etc.
  content: string;    // Rich-Text-formatierter Inhalt
  tags?: string[];    // Tags zur besseren Auffindbarkeit
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Veröffentlichungen (Multiposting)
export interface JobPosting {
  id: string;
  job_id: string;
  platform: JobPlatform;
  platform_job_id?: string;      // ID auf der externen Plattform
  posting_url?: string;          // URL zur veröffentlichten Stelle
  status: PostingStatus;         // Status der Veröffentlichung
  publication_date?: string;
  expiry_date?: string;
  auto_republish: boolean;
  analytics?: string;            // JSON-Daten für Statistiken
  error_message?: string;        // Fehlermeldungen
  created_at: string;
  updated_at: string;
}

// Social-Media-Posts
export interface JobSocialPost {
  id: string;
  job_id: string;
  platform: SocialPlatform;
  content: string;
  media_url?: string;            // Bild/Video URL
  posting_date?: string;
  status: SocialPostStatus;
  post_url?: string;             // URL zum fertigen Post
  analytics?: string;            // JSON mit Performance-Metriken
  created_at: string;
}

// Bearbeitungshistorie
export interface JobEditHistory {
  id: string;
  job_id: string;
  user_id: string;
  action: string;                // z.B. 'create', 'update', 'publish', etc.
  details?: string;              // JSON mit Änderungsdetails
  timestamp: string;
}

// Bearbeitungssperren
export interface JobEditLock {
  job_id: string;
  user_id: string;
  user_name: string;              // Name des sperrenden Benutzers
  locked_at: string;
  expires_at?: string;            // Automatisches Verfallsdatum
}

// Erweiterte Bewerbung
export interface JobApplication {
  id: string;
  job_id: string;
  candidate_id?: string;          // Null, wenn noch kein Kandidat
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  source: string;                 // Woher kam die Bewerbung
  cv_url?: string;                // Lebenslauf
  cover_letter_url?: string;      // Anschreiben
  additional_documents?: string;  // JSON-Array mit weiteren Dokumenten
  status: ApplicationStatus;
  matching_score?: number;        // 0-100
  notes?: string;
  rejection_reason?: string;
  rejection_email_sent: boolean;
  rejection_email_date?: string;
  created_at: string;
  updated_at: string;
  
  // UI-Hilfselement (optional)
  candidate?: {
    name: string;
    email: string;
    phone?: string;
  };
}

// A/B-Testing
export interface JobABTest {
  id: string;
  job_id: string;
  name: string;                  // Name des Tests
  status: ABTestStatus;
  start_date: string;
  end_date?: string;
  variants?: JobABTestVariant[];
}

// A/B-Test-Varianten
export interface JobABTestVariant {
  id: string;
  test_id: string;
  variant_name: string;          // z.B. 'A', 'B', etc.
  title?: string;                // Alternative Titel
  description?: string;          // Alternative Beschreibung
  benefits?: string;             // Alternative Benefits
  impressions: number;           // Anzahl der Impressionen
  clicks: number;                // Anzahl der Klicks
  applications: number;          // Anzahl der Bewerbungen
  is_control: boolean;           // Ist dies die Kontrollvariante?
}

// Erweitertes Dashboard mit Jobs-Metriken
export interface JobDashboardStats {
  totalJobs: number;
  activeJobs: number;
  draftJobs: number;
  expiredJobs: number;
  totalApplications: number;
  newApplications: number;
  applicationConversionRate: number;
  averageTimeToFill: number;     // in Tagen
  topPerformingPlatforms: Array<{
    platform: string;
    applications: number;
    views: number;
    conversionRate: number;
  }>;
  jobsByDepartment: Array<{
    department: string;
    count: number;
  }>;
  recentApplications: JobApplication[];
}
