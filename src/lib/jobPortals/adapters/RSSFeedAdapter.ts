import { Job, PostingStatus } from '@/types/jobs';
import type { AxiosError } from 'axios';
import { BaseJobPortalAdapter } from '../BaseAdapter';
import { PublishResult, JobPortalConfig } from '../types';
import axios from 'axios';

/**
 * Adapter für die Integration mit RSS-Feeds
 * Dieser generische Adapter ermöglicht das Importieren von Stellenanzeigen aus RSS-Feeds
 * und optional das Veröffentlichen über einen RSS-Feed (ausgehend)
 */
export class RSSFeedAdapter extends BaseJobPortalAdapter {
  public name = 'RSS Feed';
  public key = 'rss_feed';
  public icon = 'rss-feed-icon.png'; // Sollte im public-Verzeichnis abgelegt werden
  public isFree = true;
  public requiresAuth = false; // Kann je nach Feed-Konfiguration variieren
  public configInstructions = `
    Dieser Adapter ermöglicht die Integration mit RSS-Feeds für Stellenanzeigen.
    
    Für das Importieren von Stellenanzeigen:
    - feedUrl: URL zum RSS-Feed, der importiert werden soll
    - updateInterval: Aktualisierungsintervall in Minuten (Standard: 60)
    
    Optional für ausgehenden Feed:
    - enableOutgoingFeed: Aktiviert einen ausgehenden RSS-Feed (true/false)
    - outgoingFeedTitle: Titel des ausgehenden Feeds
    - outgoingFeedDescription: Beschreibung des ausgehenden Feeds
    - outgoingFeedMaxItems: Maximale Anzahl der Einträge (Standard: 50)
  `;

  /**
   * Überprüft, ob der Adapter konfiguriert ist
   * @param config Konfigurationsobjekt
   * @returns true, wenn der Adapter konfiguriert ist
   */
  public isConfigured(config?: JobPortalConfig): boolean {
    // Für den RSS-Feed-Adapter gilt er als konfiguriert, wenn entweder eine
    // eingehende Feed-URL oder ein ausgehender Feed konfiguriert ist
    if (!config) return false;
    
    return !!(config.feedUrl || config.enableOutgoingFeed);
  }

  /**
   * Veröffentlichen einer Stelle über RSS-Feed
   * Diese Funktion ist nur relevant, wenn ein ausgehender Feed konfiguriert ist.
   * In den meisten Fällen wird der RSS-Feed nur zum Importieren verwendet.
   * 
   * @param job Job-Objekt
   * @param config Konfigurationsobjekt
   */
  public async publishJob(job: Job, config?: JobPortalConfig): Promise<PublishResult> {
    if (!config?.enableOutgoingFeed) {
      return this.createErrorResult('Ausgehender RSS-Feed nicht aktiviert. Aktivieren Sie ihn in der Konfiguration.');
    }

    try {
      console.log(`Job ${job.id} zum ausgehenden RSS-Feed hinzugefügt`);
      
      // In einer realen Implementierung würde der Job zur Feed-Datenbank hinzugefügt
      // und der RSS-Feed würde dynamisch generiert werden
      
      return this.createSuccessResult(
        `rss-${job.id}`,
        `/api/rss-feed/jobs`, // URL zum öffentlichen RSS-Feed
        { job }
      );
    } catch (error) {
      return this.createErrorResult(
        `Fehler beim Hinzufügen zum RSS-Feed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Aktualisieren eines Jobs im RSS-Feed
   * @param job Job-Objekt
   * @param externalId ID des Jobs
   * @param config Konfigurationsobjekt
   */
  public async updateJob(job: Job, externalId: string, config?: JobPortalConfig): Promise<PublishResult> {
    if (!config?.enableOutgoingFeed) {
      return this.createErrorResult('Ausgehender RSS-Feed nicht aktiviert. Aktivieren Sie ihn in der Konfiguration.');
    }

    try {
      console.log(`Job ${externalId} im ausgehenden RSS-Feed aktualisiert`);
      
      // In einer realen Implementierung würde der Job in der Feed-Datenbank aktualisiert
      
      return this.createSuccessResult(
        externalId,
        `/api/rss-feed/jobs`,
        { job }
      );
    } catch (error) {
      return this.createErrorResult(
        `Fehler beim Aktualisieren im RSS-Feed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Löschen eines Jobs aus dem RSS-Feed
   * @param externalId ID des Jobs
   * @param config Konfigurationsobjekt
   */
  public async deleteJob(externalId: string, config?: JobPortalConfig): Promise<boolean> {
    if (!config?.enableOutgoingFeed) {
      console.error('Ausgehender RSS-Feed nicht aktiviert. Aktivieren Sie ihn in der Konfiguration.');
      return false;
    }

    try {
      console.log(`Job ${externalId} aus dem ausgehenden RSS-Feed entfernt`);
      
      // In einer realen Implementierung würde der Job aus der Feed-Datenbank entfernt
      
      return true;
    } catch (error) {
      console.error(`Fehler beim Entfernen aus dem RSS-Feed: ${error}`);
      return false;
    }
  }

  /**
   * Status eines Jobs im RSS-Feed prüfen
   * @param externalId ID des Jobs
   * @param config Konfigurationsobjekt
   */
  public async checkStatus(externalId: string, config?: JobPortalConfig): Promise<PostingStatus> {
    // Bei einem RSS-Feed gibt es keinen echten "Status"
    // Wir simulieren einfach "published", wenn der Feed aktiviert ist
    if (config?.enableOutgoingFeed) {
      return 'published';
    }
    return 'error';
  }

  /**
   * Importiert Jobs aus einem RSS-Feed
   * @param config Konfigurationsobjekt
   * @returns Array mit importierten Jobs
   */
  public async importJobs(config?: JobPortalConfig): Promise<Job[]> {
    if (!config?.feedUrl) {
      throw new Error('Keine Feed-URL konfiguriert. Geben Sie eine Feed-URL in der Konfiguration an.');
    }

    try {
      console.log(`Importiere Jobs aus RSS-Feed: ${config.feedUrl}`);
      
      // In einer realen Implementierung würde hier der RSS-Feed abgerufen
      // const response = await axios.get(config.feedUrl);
      // const jobs = this.parseRSSFeed(response.data);
      
      // Simuliere Import (in einer echten Implementierung würde der Feed geparst werden)
      return this.simulateRSSImport();
    } catch (error) {
      if (axios.isAxiosError(error as Error)) {
        const axiosError = error as AxiosError;
        console.error(`Fehler beim Importieren aus RSS-Feed: ${axiosError.message}`);
        if (axiosError.response) {
          console.error(`Status: ${axiosError.response.status}`);
          console.error(`Daten: ${JSON.stringify(axiosError.response.data)}`);
        }
      } else {
        console.error(`Fehler beim Importieren aus RSS-Feed: ${error}`);
      }
      return [];
    }
  }
  
  /**
   * Simuliert den Import von Jobs aus einem RSS-Feed
   * @returns Array mit simulierten Jobs
   */
  private simulateRSSImport(): Job[] {
    // Simuliere 3 importierte Jobs
    return [
      {
        id: `rss-import-1-${Date.now()}`,
        title: 'Software Entwickler (m/w/d)',
        description: 'Wir suchen einen erfahrenen Software-Entwickler...',
        rich_description: '<p>Wir suchen einen erfahrenen Software-Entwickler für unser Team.</p>',
        company: 'Technologie GmbH',
        location: 'Berlin, Deutschland',
        salary_range: '60.000€ - 80.000€',
        job_type: 'Vollzeit',
        requirements: 'Erfahrung mit JavaScript, React und Node.js',
        external_job_id: `ext-rss-1-${Date.now()}`,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: `rss-import-2-${Date.now()}`,
        title: 'Frontend Developer (m/w/d)',
        description: 'Frontend-Entwickler für innovative Webprojekte gesucht...',
        company: 'Web Solutions AG',
        location: 'München, Bayern, Deutschland',
        salary_range: '50.000€ - 65.000€',
        job_type: 'Vollzeit',
        requirements: 'Erfahrung mit HTML, CSS, JavaScript und modernen Frameworks',
        external_job_id: `ext-rss-2-${Date.now()}`,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: `rss-import-3-${Date.now()}`,
        title: 'Backend Developer (m/w/d)',
        description: 'Erfahrener Backend-Entwickler für Cloud-Lösungen gesucht...',
        company: 'Cloud Services GmbH',
        location: 'Hamburg, Deutschland',
        salary_range: '65.000€ - 85.000€',
        job_type: 'Vollzeit',
        requirements: 'Erfahrung mit Java, Spring Boot und Cloud-Technologien',
        external_job_id: `ext-rss-3-${Date.now()}`,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }
  
  /**
   * Parst einen RSS-Feed und konvertiert die Einträge in Job-Objekte
   * @param feedData RSS-Feed-XML als String
   * @returns Array mit Job-Objekten
   */
  private parseRSSFeed(feedData: string): Job[] {
    // In einer realen Implementierung würde hier das XML geparst werden
    // Hier ist ein Beispiel, wie der Code aussehen könnte:
    
    /*
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(feedData, 'text/xml');
    const items = xmlDoc.querySelectorAll('item');
    
    return Array.from(items).map(item => {
      const title = item.querySelector('title')?.textContent || '';
      const description = item.querySelector('description')?.textContent || '';
      const link = item.querySelector('link')?.textContent || '';
      const pubDate = item.querySelector('pubDate')?.textContent || '';
      const guid = item.querySelector('guid')?.textContent || '';
      
      // Zusätzliche Feed-spezifische Felder (variieren je nach Feed-Format)
      const company = item.querySelector('company')?.textContent || '';
      const location = item.querySelector('location')?.textContent || '';
      const salary = item.querySelector('salary')?.textContent || '';
      
      return {
        id: `rss-${guid}`,
        title,
        description,
        rich_description: description, // Falls HTML im Feed verwendet wird
        company,
        location,
        salary_range: salary,
        job_type: 'Vollzeit', // Standard, falls nicht im Feed spezifiziert
        external_job_id: guid,
        external_application_url: link,
        status: 'active',
        created_at: new Date(pubDate).toISOString(),
        updated_at: new Date().toISOString()
      };
    });
    */
    
    // Für dieses Beispiel geben wir einen leeren Array zurück
    return [];
  }
}
