import { Job, PostingStatus } from '@/types/jobs';
import { JobPortalAdapter, PublishResult, JobPortalConfig, JobPortalStatus } from './types';
import { IndeedAdapter } from './adapters/IndeedAdapter';
import { GoogleJobsAdapter } from './adapters/GoogleJobsAdapter';
import { ArbeitsagenturAdapter } from './adapters/ArbeitsagenturAdapter';
import { StepstoneAdapter } from './adapters/StepstoneAdapter';
import { MonsterAdapter } from './adapters/MonsterAdapter';
import { RSSFeedAdapter } from './adapters/RSSFeedAdapter';
import { MovidoAdapter } from './adapters/MovidoAdapter';
import { IndexAnzeigenAdapter } from './adapters/IndexAnzeigenAdapter';

/**
 * Konfiguration für alle Job-Portale
 */
export interface JobPortalsConfig {
  [key: string]: JobPortalConfig;
}

/**
 * Service zur Verwaltung von Job-Portal-Integrationen
 * Bietet eine einheitliche Schnittstelle für die Veröffentlichung von Jobs auf verschiedenen Plattformen
 */
export class JobPortalService {
  /**
   * Map aller registrierten Adapter, indiziert nach ihrem Schlüssel
   */
  private adapters: Map<string, JobPortalAdapter> = new Map();
  
  /**
   * Konfiguration für alle Portale
   */
  private config: JobPortalsConfig = {};
  
  /**
   * Initialisiert den JobPortalService mit den Standard-Adaptern
   * @param config Optionale Konfiguration für die Portal-Adapter
   */
  constructor(config?: JobPortalsConfig) {
    this.config = config || {};
    
    // Standard-Adapter registrieren
    this.registerDefaultAdapters();
  }
  
  /**
   * Registriert die Standard-Adapter
   */
  private registerDefaultAdapters(): void {
    // Kostenlose Portale
    this.registerAdapter(new IndeedAdapter());
    this.registerAdapter(new GoogleJobsAdapter());
    this.registerAdapter(new ArbeitsagenturAdapter());
    this.registerAdapter(new RSSFeedAdapter());
    
    // Kostenpflichtige Portale
    this.registerAdapter(new StepstoneAdapter());
    this.registerAdapter(new MonsterAdapter());
    this.registerAdapter(new IndexAnzeigenAdapter());
    
    // Multiposting-Tool als Master-Adapter
    this.registerAdapter(new MovidoAdapter());
  }
  
  /**
   * Registriert einen neuen Adapter
   * @param adapter Adapter-Instanz
   */
  public registerAdapter(adapter: JobPortalAdapter): void {
    this.adapters.set(adapter.key, adapter);
  }
  
  /**
   * Liefert einen Adapter anhand seines Schlüssels
   * @param key Schlüssel des Adapters
   * @returns Adapter-Instanz oder undefined, wenn nicht gefunden
   */
  public getAdapter(key: string): JobPortalAdapter | undefined {
    return this.adapters.get(key);
  }
  
  /**
   * Liefert alle registrierten Adapter
   * @returns Array aller Adapter-Instanzen
   */
  public getAllAdapters(): JobPortalAdapter[] {
    return Array.from(this.adapters.values());
  }
  
  /**
   * Aktualisiert die Konfiguration für einen Adapter
   * @param key Schlüssel des Adapters
   * @param config Neue Konfiguration
   */
  public updateConfig(key: string, config: JobPortalConfig): void {
    this.config[key] = config;
  }
  
  /**
   * Liefert die Konfiguration für einen Adapter
   * @param key Schlüssel des Adapters
   * @returns Konfiguration oder undefined, wenn nicht gefunden
   */
  public getConfig(key: string): JobPortalConfig | undefined {
    return this.config[key];
  }
  
  /**
   * Liefert den Status aller Portal-Integrationen
   * @returns Array mit Status-Informationen für alle Portal-Integrationen
   */
  public getPortalStatus(): JobPortalStatus[] {
    return this.getAllAdapters().map(adapter => {
      const config = this.getConfig(adapter.key);
      const configured = adapter.isConfigured(config);
      
      return {
        key: adapter.key,
        name: adapter.name,
        enabled: !!config?.enabled,
        configured
      };
    });
  }
  
  /**
   * Veröffentlicht einen Job auf mehreren Plattformen
   * @param job Job-Objekt
   * @param platforms Array mit Schlüsseln der zu verwendenden Plattformen. Wenn leer, werden alle aktivierten Plattformen verwendet.
   * @returns Objekt mit den Ergebnissen für jede Plattform
   */
  public async publishJob(job: Job, platforms: string[] = []): Promise<Record<string, PublishResult>> {
    const results: Record<string, PublishResult> = {};
    const platformsToUse = platforms.length > 0 
      ? platforms 
      : Object.keys(this.config).filter(key => this.config[key]?.enabled);
    
    // Veröffentlichung auf allen angegebenen Plattformen
    for (const key of platformsToUse) {
      const adapter = this.getAdapter(key);
      const config = this.getConfig(key);
      
      if (!adapter) {
        results[key] = {
          success: false,
          errorMessage: `Adapter nicht gefunden: ${key}`
        };
        continue;
      }
      
      if (!config?.enabled) {
        results[key] = {
          success: false,
          errorMessage: `Portal nicht aktiviert: ${adapter.name}`
        };
        continue;
      }
      
      if (!adapter.isConfigured(config)) {
        results[key] = {
          success: false,
          errorMessage: `Portal nicht konfiguriert: ${adapter.name}`
        };
        continue;
      }
      
      try {
        results[key] = await adapter.publishJob(job, config);
      } catch (error) {
        results[key] = {
          success: false,
          errorMessage: `Fehler bei der Veröffentlichung auf ${adapter.name}: ${error instanceof Error ? error.message : String(error)}`
        };
      }
    }
    
    return results;
  }
  
  /**
   * Aktualisiert einen Job auf mehreren Plattformen
   * @param job Job-Objekt
   * @param platformJobIds Objekt mit externen IDs für jede Plattform
   * @returns Objekt mit den Ergebnissen für jede Plattform
   */
  public async updateJob(job: Job, platformJobIds: Record<string, string>): Promise<Record<string, PublishResult>> {
    const results: Record<string, PublishResult> = {};
    
    for (const [key, externalId] of Object.entries(platformJobIds)) {
      const adapter = this.getAdapter(key);
      const config = this.getConfig(key);
      
      if (!adapter) {
        results[key] = {
          success: false,
          errorMessage: `Adapter nicht gefunden: ${key}`
        };
        continue;
      }
      
      if (!config?.enabled) {
        results[key] = {
          success: false,
          errorMessage: `Portal nicht aktiviert: ${adapter.name}`
        };
        continue;
      }
      
      try {
        results[key] = await adapter.updateJob(job, externalId, config);
      } catch (error) {
        results[key] = {
          success: false,
          errorMessage: `Fehler bei der Aktualisierung auf ${adapter.name}: ${error instanceof Error ? error.message : String(error)}`
        };
      }
    }
    
    return results;
  }
  
  /**
   * Löscht einen Job von mehreren Plattformen
   * @param platformJobIds Objekt mit externen IDs für jede Plattform
   * @returns Objekt mit den Ergebnissen für jede Plattform
   */
  public async deleteJob(platformJobIds: Record<string, string>): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    for (const [key, externalId] of Object.entries(platformJobIds)) {
      const adapter = this.getAdapter(key);
      const config = this.getConfig(key);
      
      if (!adapter || !config?.enabled) {
        results[key] = false;
        continue;
      }
      
      try {
        results[key] = await adapter.deleteJob(externalId, config);
      } catch (error) {
        console.error(`Fehler beim Löschen auf ${adapter.name}:`, error);
        results[key] = false;
      }
    }
    
    return results;
  }
  
  /**
   * Prüft den Status eines Jobs auf mehreren Plattformen
   * @param platformJobIds Objekt mit externen IDs für jede Plattform
   * @returns Objekt mit den Status für jede Plattform
   */
  public async checkJobStatus(platformJobIds: Record<string, string>): Promise<Record<string, PostingStatus>> {
    const results: Record<string, PostingStatus> = {};
    
    for (const [key, externalId] of Object.entries(platformJobIds)) {
      const adapter = this.getAdapter(key);
      const config = this.getConfig(key);
      
      if (!adapter || !config?.enabled) {
        results[key] = 'error';
        continue;
      }
      
      try {
        results[key] = await adapter.checkStatus(externalId, config);
      } catch (error) {
        console.error(`Fehler beim Prüfen des Status auf ${adapter.name}:`, error);
        results[key] = 'error';
      }
    }
    
    return results;
  }
}
