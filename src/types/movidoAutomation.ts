/**
 * Typdefinitionen für die Movido-Automation
 */

export type MovidoSessionStatus = 'active' | 'expired' | 'invalid';

export type MovidoQueueItemStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'scheduled';

export type MovidoScheduleType = 'one_time' | 'daily' | 'weekly' | 'monthly';

export type MovidoCycleType = 'daily' | 'weekly' | 'monthly' | 'custom';

export type MovidoCycleStatus = 'active' | 'completed' | 'paused' | 'cancelled';

export type MovidoMediaType = 'logo' | 'image' | 'document';

export type MovidoMediaUploadStatus = 'pending' | 'uploaded' | 'failed';

export type MovidoMediaRole = 'main_image' | 'logo' | 'additional_image';

/**
 * Konfiguration für die Movido-Integration
 */
export interface MovidoConfiguration {
  id: string;
  apiKey: string;
  apiSecret: string;
  companyId: string;
  defaultPremium: boolean;
  defaultTargetPortals: string[]; // Array von Portalschlüsseln
  autoLoginEnabled: boolean;
  sessionTimeoutMinutes: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Sitzungsinformationen für Movido
 */
export interface MovidoSession {
  id: string;
  sessionToken: string;
  expiresAt: string;
  lastUsedAt: string;
  createdAt: string;
}

/**
 * Warteschlangenelement für Movido-Jobs
 */
export interface MovidoQueueItem {
  id: string;
  jobId: string;
  status: MovidoQueueItemStatus;
  targetPortals: string[];
  scheduledFor?: string;
  priority: number;
  attempts: number;
  lastAttemptAt?: string;
  errorMessage?: string;
  resultData?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Media-Element für Movido
 */
export interface MovidoMedia {
  id: string;
  originalPath: string;
  movidoMediaId?: string;
  mediaType: MovidoMediaType;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  uploadStatus: MovidoMediaUploadStatus;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Job-Media-Verknüpfung
 */
export interface MovidoJobMedia {
  id: string;
  jobId: string;
  mediaId: string;
  mediaRole: MovidoMediaRole;
  createdAt: string;
}

/**
 * Zeitplaneinstellung
 */
export interface MovidoScheduleSetting {
  id: string;
  name: string;
  description?: string;
  scheduleType: MovidoScheduleType;
  scheduleData: Record<string, any>;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Veröffentlichungsstatistik
 */
export interface MovidoPostingStat {
  id: string;
  jobId: string;
  platform: string;
  views: number;
  clicks: number;
  applications: number;
  lastUpdatedAt?: string;
  createdAt: string;
}

/**
 * Automatisierter Veröffentlichungszyklus
 */
export interface MovidoPostingCycle {
  id: string;
  name: string;
  description?: string;
  cycleType: MovidoCycleType;
  intervalDays?: number;
  platforms: string[];
  autoRefresh: boolean;
  refreshIntervalDays?: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Job-Zyklus-Verknüpfung
 */
export interface MovidoJobPostingCycle {
  id: string;
  jobId: string;
  cycleId: string;
  nextPostingDate?: string;
  lastPostedAt?: string;
  status: MovidoCycleStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface für Movido API Antworten
 */
export interface MovidoApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Login-Daten für Movido
 */
export interface MovidoLoginCredentials {
  username: string;
  password: string;
}

/**
 * Login-Antwort von Movido
 */
export interface MovidoLoginResponse {
  token: string;
  expiresAt: string;
  userId: string;
  companyId: string;
}

/**
 * Stellenanzeige in Movido
 */
export interface MovidoJobPosting {
  id: string;
  reference: string;
  title: string;
  description: string;
  company: {
    id: string;
    name: string;
  };
  location: {
    city: string;
    region?: string;
    country: string;
    postalCode?: string;
  };
  details: {
    responsibilities?: string;
    qualifications?: string;
    jobType: string;
    industry?: string;
    experienceLevel?: string;
    educationLevel?: string;
  };
  compensation?: {
    salary?: string;
    benefits?: string;
  };
  application: {
    url?: string;
    email?: string;
    phone?: string;
  };
  settings: {
    premium: boolean;
    startDate: string;
    endDate: string;
    targetPortals: string[];
  };
  status: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Status des Job-Postings pro Portal
 */
export interface MovidoPortalStatus {
  portal: string;
  status: string;
  externalId?: string;
  externalUrl?: string;
  error?: string;
  postedAt?: string;
  updatedAt?: string;
}

/**
 * Ergebnis einer Veröffentlichung
 */
export interface MovidoPostingResult {
  jobId: string;
  movidoId: string;
  status: string;
  portalStatuses: MovidoPortalStatus[];
  createdAt: string;
}

/**
 * Konfiguration für das Movido-Automation-Modul
 */
export interface MovidoAutomationConfig {
  enabled: boolean;
  autoLogin: boolean;
  useScheduling: boolean;
  useQueuing: boolean;
  defaultCycleId?: string;
  defaultScheduleId?: string;
}
