import { Job, PostingStatus } from '@/types/jobs';
import { JobPortalAdapter, PublishResult, JobPortalConfig } from './types';
import { JobPortalService } from './JobPortalService';
import { MovidoAdapter } from './adapters/MovidoAdapter';
import { RSSFeedAdapter } from './adapters/RSSFeedAdapter';

/**
 * Erweiterte Version des JobPortalService mit zusätzlichen Funktionen
 * für das Multiposting-Tool Movido und weitere spezielle Funktionen
 */
export class ExtendedJobPortalService extends JobPortalService {
  
  /**
   * Veröffentlicht einen Job über Movido auf mehreren Portalen
   * @param job Job-Objekt
   * @param targetPortals Array mit Zielportalen für Movido
   * @returns Ergebnis der Veröffentlichung
   */
  public async publishViaMovido(job: Job, targetPortals: string[] = []): Promise<PublishResult> {
    const adapter = this.getAdapter('movido') as MovidoAdapter;
    if (!adapter) {
      return {
        success: false,
        errorMessage: 'Movido-Adapter nicht gefunden'
      };
    }
    
    const config = this.getConfig('movido');
    if (!config?.enabled) {
      return {
        success: false,
        errorMessage: 'Movido-Integration nicht aktiviert'
      };
    }
    
    if (!adapter.isConfigured(config)) {
      return {
        success: false,
        errorMessage: 'Movido-Integration nicht konfiguriert'
      };
    }
    
    // Füge die Zielportale zur Konfiguration hinzu, falls vorhanden
    const extendedConfig = { ...config };
    if (targetPortals.length > 0) {
      extendedConfig.targetPortals = targetPortals;
    }
    
    try {
      return await adapter.publishJob(job, extendedConfig);
    } catch (error) {
      return {
        success: false,
        errorMessage: `Fehler bei der Veröffentlichung über Movido: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
  
  /**
   * Holt die aktiven Veröffentlichungen von Movido
   * @returns Array mit aktiven Veröffentlichungen
   */
  public async getMovidoActivePostings(): Promise<any[]> {
    const adapter = this.getAdapter('movido') as MovidoAdapter;
    if (!adapter) {
      console.error('Movido-Adapter nicht gefunden');
      return [];
    }
    
    const config = this.getConfig('movido');
    if (!config?.enabled) {
      console.error('Movido-Integration nicht aktiviert');
      return [];
    }
    
    try {
      return await adapter.getActivePostings(config);
    } catch (error) {
      console.error(`Fehler beim Abrufen der aktiven Veröffentlichungen von Movido: ${error}`);
      return [];
    }
  }
  
  /**
   * Holt die Bewerbungen von Movido
   * @returns Array mit Bewerbungen
   */
  public async getMovidoApplications(): Promise<any[]> {
    const adapter = this.getAdapter('movido') as MovidoAdapter;
    if (!adapter) {
      console.error('Movido-Adapter nicht gefunden');
      return [];
    }
    
    const config = this.getConfig('movido');
    if (!config?.enabled) {
      console.error('Movido-Integration nicht aktiviert');
      return [];
    }
    
    try {
      return await adapter.getApplications(config);
    } catch (error) {
      console.error(`Fehler beim Abrufen der Bewerbungen von Movido: ${error}`);
      return [];
    }
  }
  
  /**
   * Importiert Jobs aus einem RSS-Feed
   * @param feedUrl URL des RSS-Feeds (optional, falls in der Konfiguration definiert)
   * @returns Array mit importierten Jobs
   */
  public async importJobsFromRSS(feedUrl?: string): Promise<Job[]> {
    const adapter = this.getAdapter('rss_feed') as RSSFeedAdapter;
    if (!adapter) {
      console.error('RSS-Feed-Adapter nicht gefunden');
      return [];
    }
    
    const config = this.getConfig('rss_feed') || {};
    if (feedUrl) {
      config.feedUrl = feedUrl;
    }
    
    if (!config.feedUrl) {
      console.error('Keine Feed-URL konfiguriert');
      return [];
    }
    
    try {
      return await adapter.importJobs(config);
    } catch (error) {
      console.error(`Fehler beim Importieren von Jobs aus dem RSS-Feed: ${error}`);
      return [];
    }
  }
  
  /**
   * Führt einen Batch-Prozess durch, der aktive Jobs auf aktivierten Plattformen neu veröffentlicht,
   * falls sie ein bestimmtes Alter erreicht haben.
   * @param republishAfterDays Anzahl der Tage, nach denen Jobs neu veröffentlicht werden sollen
   * @returns Ergebnisse der Neuveröffentlichungen
   */
  public async batchRepublishJobs(republishAfterDays: number = 30, jobs: Job[]): Promise<Record<string, Record<string, PublishResult>>> {
    const results: Record<string, Record<string, PublishResult>> = {};
    
    // Filtere Jobs, die das angegebene Alter erreicht haben
    const now = new Date();
    const jobsToRepublish = jobs.filter(job => {
      const updatedAt = new Date(job.updated_at);
      const daysSinceUpdate = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceUpdate >= republishAfterDays && job.status === 'active';
    });
    
    // Hole aktive Portale
    const activePortals = Object.keys(this.getConfig('') || {}).filter(key => 
      this.getConfig(key)?.enabled && this.getConfig(key)?.autoRepublish
    );
    
    // Veröffentliche Jobs auf aktiven Portalen neu
    for (const job of jobsToRepublish) {
      results[job.id] = await this.publishJob(job, activePortals);
    }
    
    return results;
  }
  
  /**
   * Prüft den Status aller veröffentlichten Jobs auf allen Plattformen
   * und aktualisiert die Datenbank mit den aktuellen Status.
   * @param jobPostings Array von Job-Posting-Objekten mit Job-ID und Platform-Job-IDs
   * @returns Objekt mit den Status für jeden Job und jede Plattform
   */
  public async checkAllJobStatus(jobPostings: Array<{
    jobId: string,
    platformJobIds: Record<string, string>
  }>): Promise<Record<string, Record<string, PostingStatus>>> {
    const results: Record<string, Record<string, PostingStatus>> = {};
    
    for (const posting of jobPostings) {
      results[posting.jobId] = await this.checkJobStatus(posting.platformJobIds);
    }
    
    return results;
  }
}
