/**
 * TypeScript-Definitionen für das Scheduler- und Pipeline-System
 */

// Allgemeine Typen für das Scheduler-System

export type TaskType = 
  | 'sync' 
  | 'social_post' 
  | 'movido_post' 
  | 'job_refresh' 
  | 'portal_sync' 
  | 'pipeline_processor'
  | 'data_cleanup'
  | 'custom';

export type TaskStatus = 
  | 'pending' 
  | 'running' 
  | 'completed' 
  | 'failed' 
  | 'cancelled';

export type IntervalType = 
  | 'once' 
  | 'hourly' 
  | 'daily' 
  | 'weekly' 
  | 'monthly' 
  | 'custom';

export type IntervalUnit = 
  | 'minutes' 
  | 'hours' 
  | 'days' 
  | 'weeks';

export type EntityType = 
  | 'job' 
  | 'job_portal' 
  | 'social_media' 
  | 'application' 
  | 'candidate' 
  | 'talent_pool'
  | 'movido'
  | 'post_pipeline_item'
  | 'sync_settings'
  | 'other';

// Typen für die geplanten Aufgaben
export interface ScheduledTask {
  id: string;
  taskType: TaskType;
  status: TaskStatus;
  scheduledFor: string; // ISO-Datum
  intervalType?: IntervalType;
  intervalValue?: number;
  intervalUnit?: IntervalUnit;
  customSchedule?: string; // JSON-String
  config?: string; // JSON-String
  entityId?: string;
  entityType?: EntityType;
  createdAt: string; // ISO-Datum
  updatedAt: string; // ISO-Datum
  lastRun?: string; // ISO-Datum
  nextRun?: string; // ISO-Datum
  result?: string; // JSON-String
  error?: string;
}

// Typen für Pipeline-Items
export type PipelineType = 
  | 'social_media' 
  | 'movido';

export type PipelineStatus = 
  | 'pending' 
  | 'scheduled' 
  | 'posted' 
  | 'failed' 
  | 'cancelled';

export type SocialMediaPlatform = 
  | 'linkedin' 
  | 'xing' 
  | 'facebook' 
  | 'instagram' 
  | 'twitter' 
  | 'other';

export interface PostPipelineItem {
  id: string;
  pipelineType: PipelineType;
  platform?: SocialMediaPlatform;
  entityType: EntityType;
  entityId: string;
  status: PipelineStatus;
  scheduledFor?: string; // ISO-Datum
  priority: number;
  contentTemplate?: string;
  contentParams?: string; // JSON-String
  targetAudience?: string; // JSON-String
  scheduledTaskId?: string;
  createdAt: string; // ISO-Datum
  updatedAt: string; // ISO-Datum
  postedAt?: string; // ISO-Datum
  result?: string; // JSON-String
  error?: string;
}

// Typen für Pipeline-Einstellungen
export interface PipelineSettings {
  id: string;
  pipelineType: PipelineType;
  platform?: SocialMediaPlatform;
  dailyLimit: number;
  postingHours?: number[]; // [9, 12, 15, 18] für Posts um 9, 12, 15, 18 Uhr
  postingDays?: number[]; // [1, 2, 3, 4, 5] für Mo-Fr (0 = Sonntag, 6 = Samstag)
  minIntervalMinutes: number;
  enabled: boolean;
  createdAt: string; // ISO-Datum
  updatedAt: string; // ISO-Datum
  config?: string; // JSON-String
}

// Typen für Synchronisations-Einstellungen
export interface SyncSettings {
  id: string;
  entityType: EntityType;
  entityId: string;
  syncIntervalType: IntervalType;
  syncIntervalValue?: number;
  syncIntervalUnit?: IntervalUnit;
  customSchedule?: string; // JSON-String
  lastSync?: string; // ISO-Datum
  nextSync?: string; // ISO-Datum
  enabled: boolean;
  createdAt: string; // ISO-Datum
  updatedAt: string; // ISO-Datum
  config?: string; // JSON-String
}

// Typen für Scheduler-Logs
export type LogAction = 
  | 'start' 
  | 'complete' 
  | 'fail' 
  | 'cancel' 
  | 'reschedule' 
  | 'skip';

export interface SchedulerLog {
  id: string;
  taskId?: string;
  taskType: TaskType;
  action: LogAction;
  status: TaskStatus;
  details?: string; // JSON-String
  createdAt: string; // ISO-Datum
}

// Optionale Parameter für Service-Methoden
export interface ScheduledTaskOptions {
  status?: TaskStatus | TaskStatus[];
  entityType?: EntityType;
  entityId?: string;
  fromDate?: string;
  toDate?: string;
  limit?: number;
  offset?: number;
}

export interface PostPipelineItemOptions {
  status?: PipelineStatus | PipelineStatus[];
  pipelineType?: PipelineType;
  platform?: SocialMediaPlatform;
  entityType?: EntityType;
  entityId?: string;
  fromDate?: string;
  toDate?: string;
  priority?: number;
  limit?: number;
  offset?: number;
}

// JSON-Schemas für benutzerdefinierte Konfigurationen
export interface CustomSchedule {
  days?: number[]; // [0, 1, 2, 3, 4, 5, 6] für bestimmte Tage
  hours?: number[]; // [9, 12, 15, 18] für bestimmte Stunden
  minutes?: number[]; // [0, 30] für bestimmte Minuten
  specificDates?: string[]; // ["2023-12-24T10:00:00Z"] für bestimmte Daten und Zeiten
  excludeDates?: string[]; // ["2023-12-25"] für Ausschlüsse (z.B. Feiertage)
  timezone?: string; // "Europe/Berlin"
}

export interface SocialMediaPostConfig {
  message?: string;
  imageUrl?: string;
  linkUrl?: string;
  linkTitle?: string;
  linkDescription?: string;
  hashtags?: string[];
  mentionUsers?: string[];
  customParams?: Record<string, any>;
}

export interface MovidoPostConfig {
  title?: string;
  description?: string;
  targetPortals?: string[];
  expirationDays?: number;
  jobType?: string;
  location?: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
    period?: string;
  };
  customParams?: Record<string, any>;
}

export interface SyncConfig {
  syncAll?: boolean;
  syncSpecificIds?: string[];
  depth?: 'basic' | 'full';
  retryOnFail?: boolean;
  maxRetries?: number;
  customParams?: Record<string, any>;
}

/**
 * Performance-Metriken für ein Social-Media-Post oder eine Job-Anzeige
 */
export interface PerformanceMetrics {
  impressions: number;         // Anzahl der Impressionen
  clicks: number;              // Anzahl der Klicks
  applications: number;        // Anzahl der Bewerbungen
  ctr: number;                 // Click-Through-Rate (Klicks/Impressionen)
  applicationRate: number;     // Bewerbungsrate (Bewerbungen/Klicks)
  conversionRate: number;      // Konversionsrate (Bewerbungen/Impressionen)
  engagementScore?: number;    // Engagement-Score (Likes, Shares, Kommentare)
  averageViewTime?: number;    // Durchschnittliche Betrachtungszeit
  bounceRate?: number;         // Absprungrate
  cost?: number;               // Kosten falls vorhanden (z.B. bei Ads)
  costPerClick?: number;       // Kosten pro Klick
  costPerApplication?: number; // Kosten pro Bewerbung
  dateCollected: string;       // Datum der Metrik-Erfassung
  source: string;              // Quelle der Daten (z.B. "LinkedIn Analytics", "Google Analytics")
}

/**
 * Konfiguration für A/B-Testing von Postings
 */
export interface ABTestConfig {
  isActive: boolean;           // Ist der A/B-Test aktiv
  testId: string;              // Eindeutige ID des Tests
  variations: {                // Verschiedene Varianten des Posts
    id: string;                // ID der Variante
    name: string;              // Name der Variante
    content: SocialMediaPostConfig | MovidoPostConfig; // Inhalt der Variante
    weight: number;            // Gewichtung für die Verteilung (0-100%)
  }[];
  targetMetric: keyof PerformanceMetrics; // Ziel-Metrik (z.B. "ctr", "applications")
  minSampleSize: number;       // Minimale Stichprobengröße bevor Ergebnisse ausgewertet werden
  startDate: string;           // Startdatum des Tests
  endDate?: string;            // Enddatum des Tests (optional)
  result?: {                   // Ergebnis des Tests (falls vorhanden)
    winningVariationId: string;  // ID der gewinnenden Variante
    metrics: Record<string, PerformanceMetrics>; // Metriken pro Variation
    confidenceLevel: number;     // Konfidenzlevel des Ergebnisses (0-100%)
  };
}
