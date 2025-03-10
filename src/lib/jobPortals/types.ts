import { Job, PostingStatus } from '@/types/jobs';

/**
 * Ergebnis einer Veröffentlichungsaktion
 */
export interface PublishResult {
  success: boolean;
  platformJobId?: string;
  postingUrl?: string;
  errorMessage?: string;
  statusCode?: number;
  rawResponse?: any;
}

/**
 * Gemeinsame Schnittstelle für alle Portale
 */
export interface JobPortalAdapter {
  /**
   * Name des Portals
   */
  name: string;
  
  /**
   * Eindeutiger Schlüssel für das Portal
   */
  key: string;
  
  /**
   * Icon/Logo des Portals
   */
  icon?: string;
  
  /**
   * Ob das Portal kostenlos ist
   */
  isFree: boolean;
  
  /**
   * Veröffentlichen einer Stelle
   */
  publishJob: (job: Job, config?: any) => Promise<PublishResult>;
  
  /**
   * Aktualisieren einer bereits veröffentlichten Stelle
   */
  updateJob: (job: Job, externalId: string, config?: any) => Promise<PublishResult>;
  
  /**
   * Löschen einer Stelle
   */
  deleteJob: (externalId: string, config?: any) => Promise<boolean>;
  
  /**
   * Status einer Veröffentlichung prüfen
   */
  checkStatus: (externalId: string, config?: any) => Promise<PostingStatus>;
  
  /**
   * Ob dieses Portal Authentifizierung benötigt
   */
  requiresAuth: boolean;
  
  /**
   * Ob der Adapter konfiguriert ist (z.B. API-Schlüssel vorhanden)
   */
  isConfigured: (config?: any) => boolean;
  
  /**
   * Anleitung zur Konfiguration
   */
  configInstructions?: string;
}

/**
 * Konfiguration für ein Jobportal
 */
export interface JobPortalConfig {
  /**
   * API-Schlüssel oder andere Authentifizierungsinformationen
   */
  apiKey?: string;
  
  /**
   * API-Secret
   */
  apiSecret?: string;
  
  /**
   * OAuth-Token (falls verwendet)
   */
  accessToken?: string;
  
  /**
   * Automatische Neuveröffentlichung aktivieren
   */
  autoRepublish?: boolean;
  
  /**
   * Zyklus für automatische Neuveröffentlichung in Tagen
   */
  republishCycle?: number;
  
  /**
   * Benutzerdefinierte Einstellungen für spezifische Portale
   */
  [key: string]: any;
}

/**
 * Status einer Jobportal-Integration
 */
export interface JobPortalStatus {
  /**
   * Schlüssel des Portals
   */
  key: string;
  
  /**
   * Name des Portals
   */
  name: string;
  
  /**
   * Ob das Portal aktiviert ist
   */
  enabled: boolean;
  
  /**
   * Ob das Portal konfiguriert ist
   */
  configured: boolean;
  
  /**
   * Anzahl der aktiven Jobs auf diesem Portal
   */
  activeJobs?: number;
  
  /**
   * Letzter Zeitpunkt der Synchronisation
   */
  lastSync?: string;
  
  /**
   * Status der letzten Synchronisation
   */
  lastSyncStatus?: 'success' | 'error' | 'warning';
  
  /**
   * Fehler der letzten Synchronisation
   */
  lastError?: string;
}
