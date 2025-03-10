import { Job, PostingStatus } from '@/types/jobs';
import { JobPortalAdapter, PublishResult, JobPortalConfig } from './types';

/**
 * Basis-Adapter-Klasse, die gemeinsame Funktionalität für alle Jobportal-Adapter bereitstellt.
 * Spezifische Adapter sollten von dieser Klasse erben und die abstrakten Methoden implementieren.
 */
export abstract class BaseJobPortalAdapter implements JobPortalAdapter {
  /**
   * Name des Portals
   */
  public abstract name: string;
  
  /**
   * Eindeutiger Schlüssel für das Portal
   */
  public abstract key: string;
  
  /**
   * Icon/Logo des Portals
   */
  public abstract icon?: string;
  
  /**
   * Ob das Portal kostenlos ist
   */
  public abstract isFree: boolean;
  
  /**
   * Ob dieses Portal Authentifizierung benötigt
   */
  public abstract requiresAuth: boolean;
  
  /**
   * Anleitung zur Konfiguration
   */
  public abstract configInstructions?: string;

  /**
   * Verarbeitet eine Job-Beschreibung für die spezifische Plattform
   * @param job Job-Objekt
   * @returns Formatierte Beschreibung
   */
  protected formatDescription(job: Job): string {
    // Wenn Rich-Description vorhanden, verwende diese und entferne HTML-Tags
    // für Plattformen, die kein HTML unterstützen
    if (job.rich_description) {
      return this.stripHtml(job.rich_description);
    }
    return job.description;
  }

  /**
   * Entfernt HTML-Tags aus einem String
   * @param html HTML-String
   * @returns Text ohne HTML-Tags
   */
  protected stripHtml(html: string): string {
    return html.replace(/<[^>]*>?/gm, '');
  }

  /**
   * Überprüft, ob der Adapter konfiguriert ist
   * @param config Konfigurationsobjekt
   * @returns true, wenn der Adapter konfiguriert ist
   */
  public abstract isConfigured(config?: JobPortalConfig): boolean;

  /**
   * Veröffentlichen einer Stelle
   * @param job Job-Objekt
   * @param config Konfiguration
   */
  public abstract publishJob(job: Job, config?: JobPortalConfig): Promise<PublishResult>;

  /**
   * Aktualisieren einer bereits veröffentlichten Stelle
   * @param job Job-Objekt
   * @param externalId ID der Stelle auf der externen Plattform
   * @param config Konfiguration
   */
  public abstract updateJob(job: Job, externalId: string, config?: JobPortalConfig): Promise<PublishResult>;

  /**
   * Löschen einer Stelle
   * @param externalId ID der Stelle auf der externen Plattform
   * @param config Konfiguration
   */
  public abstract deleteJob(externalId: string, config?: JobPortalConfig): Promise<boolean>;

  /**
   * Status einer Veröffentlichung prüfen
   * @param externalId ID der Stelle auf der externen Plattform
   * @param config Konfiguration
   */
  public abstract checkStatus(externalId: string, config?: JobPortalConfig): Promise<PostingStatus>;

  /**
   * Erstellt ein Fehler-Ergebnis
   * @param message Fehlermeldung
   * @param statusCode HTTP-Statuscode
   * @param rawResponse Rohantwort der API
   */
  protected createErrorResult(message: string, statusCode?: number, rawResponse?: any): PublishResult {
    return {
      success: false,
      errorMessage: message,
      statusCode,
      rawResponse
    };
  }

  /**
   * Erstellt ein Erfolgs-Ergebnis
   * @param platformJobId ID der Stelle auf der externen Plattform
   * @param postingUrl URL zur veröffentlichten Stelle
   * @param rawResponse Rohantwort der API
   */
  protected createSuccessResult(platformJobId?: string, postingUrl?: string, rawResponse?: any): PublishResult {
    return {
      success: true,
      platformJobId,
      postingUrl,
      rawResponse
    };
  }

  /**
   * Prüft, ob eine Konfiguration die erforderlichen Felder enthält
   * @param config Konfigurationsobjekt
   * @param requiredFields Liste der erforderlichen Felder
   * @returns true, wenn alle erforderlichen Felder vorhanden sind
   */
  protected hasRequiredConfig(config: JobPortalConfig | undefined, requiredFields: string[]): boolean {
    if (!config) return false;
    
    for (const field of requiredFields) {
      if (!config[field]) {
        return false;
      }
    }
    
    return true;
  }
}
