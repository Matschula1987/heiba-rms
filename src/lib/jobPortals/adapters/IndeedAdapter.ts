import { Job, PostingStatus } from '@/types/jobs';
import { BaseJobPortalAdapter } from '../BaseAdapter';
import { PublishResult, JobPortalConfig } from '../types';

/**
 * Adapter für die Integration mit Indeed
 * Indeed bietet einen XML-Feed für die Veröffentlichung von Stellenanzeigen
 */
export class IndeedAdapter extends BaseJobPortalAdapter {
  public name = 'Indeed';
  public key = 'indeed';
  public icon = 'indeed-logo.png'; // Sollte im public-Verzeichnis abgelegt werden
  public isFree = true;
  public requiresAuth = false;
  public configInstructions = `
    Indeed ermöglicht das kostenlose Veröffentlichen von Stellenanzeigen über ihren XML-Feed.
    Für mehr Funktionalität können Sie das Indeed Employer API verwenden, wofür Sie einen API-Schlüssel benötigen.
    Besuchen Sie https://employers.indeed.com/api für mehr Informationen.
  `;

  /**
   * Überprüft, ob der Adapter konfiguriert ist
   * @param config Konfigurationsobjekt
   * @returns true, wenn der Adapter konfiguriert ist
   */
  public isConfigured(config?: JobPortalConfig): boolean {
    // Da Indeed kostenlos nutzbar ist, benötigt es keine spezielle Konfiguration
    return true;
  }

  /**
   * Veröffentlichen einer Stelle auf Indeed
   * @param job Job-Objekt
   * @param config Konfigurationsobjekt (optional)
   */
  public async publishJob(job: Job, config?: JobPortalConfig): Promise<PublishResult> {
    try {
      // In einer realen Implementierung würde hier die Indeed API oder der XML-Feed angesprochen werden
      // Für dieses Beispiel simulieren wir eine erfolgreiche Veröffentlichung
      
      // Erstellen eines XML-Feeds im Indeed-Format
      const xmlContent = this.createXmlFeed(job);
      
      // Hier würde in einer echten Implementierung der XML-Feed an Indeed gesendet werden
      console.log('Veröffentlichung auf Indeed:', xmlContent);
      
      // Simuliere eine erfolgreiche Antwort
      const mockPlatformId = `indeed-${job.id}-${Date.now()}`;
      const mockUrl = `https://www.indeed.com/viewjob?jk=${mockPlatformId}`;
      
      return this.createSuccessResult(
        mockPlatformId,
        mockUrl,
        { xml: xmlContent }
      );
    } catch (error) {
      return this.createErrorResult(
        `Fehler bei der Veröffentlichung auf Indeed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Aktualisieren einer bereits veröffentlichten Stelle
   * @param job Job-Objekt
   * @param externalId ID der Stelle auf Indeed
   * @param config Konfigurationsobjekt (optional)
   */
  public async updateJob(job: Job, externalId: string, config?: JobPortalConfig): Promise<PublishResult> {
    try {
      // Indeed-XML-Feed unterstützt keine direkte Aktualisierung
      // Stattdessen wird eine neue Anzeige erstellt und die alte wird überschrieben
      const result = await this.publishJob(job, config);
      return result;
    } catch (error) {
      return this.createErrorResult(
        `Fehler bei der Aktualisierung auf Indeed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Löschen einer Stelle von Indeed
   * @param externalId ID der Stelle auf Indeed
   * @param config Konfigurationsobjekt (optional)
   */
  public async deleteJob(externalId: string, config?: JobPortalConfig): Promise<boolean> {
    try {
      // Indeed-XML-Feed unterstützt kein direktes Löschen
      // In einer realen Implementierung müsste eine E-Mail an Indeed gesendet werden
      console.log(`Löschung der Stelle ${externalId} von Indeed angefordert`);
      
      // Simuliere erfolgreiche Löschung
      return true;
    } catch (error) {
      console.error(`Fehler beim Löschen der Stelle von Indeed: ${error}`);
      return false;
    }
  }

  /**
   * Status einer Veröffentlichung auf Indeed prüfen
   * @param externalId ID der Stelle auf Indeed
   * @param config Konfigurationsobjekt (optional)
   */
  public async checkStatus(externalId: string, config?: JobPortalConfig): Promise<PostingStatus> {
    try {
      // Indeed bietet keine API zum Prüfen des Status
      // In einer realen Anwendung könnte man scrapen, doch für unser Beispiel nehmen wir an, dass die Stelle veröffentlicht ist
      return 'published';
    } catch (error) {
      console.error(`Fehler beim Prüfen des Status auf Indeed: ${error}`);
      return 'error';
    }
  }

  /**
   * Erstellt einen XML-Feed im Indeed-Format
   * @param job Job-Objekt
   * @returns XML-String
   */
  private createXmlFeed(job: Job): string {
    // Entferne HTML-Tags aus der Beschreibung für Indeed
    const plainDescription = this.formatDescription(job);
    
    // Erstelle XML im Indeed-Format
    return `<?xml version="1.0" encoding="UTF-8"?>
<source>
  <publisher>${job.company}</publisher>
  <publisherurl>https://www.example.com</publisherurl>
  <job>
    <title><![CDATA[${job.title}]]></title>
    <date>${new Date().toISOString().split('T')[0]}</date>
    <referencenumber>${job.external_job_id || job.id}</referencenumber>
    <url>https://www.example.com/jobs/${job.id}</url>
    <company><![CDATA[${job.company}]]></company>
    <city><![CDATA[${job.location.split(',')[0].trim()}]]></city>
    <state><![CDATA[${job.location.split(',')[1]?.trim() || ''}]]></state>
    <country><![CDATA[DE]]></country>
    <description><![CDATA[${plainDescription}]]></description>
    <salary><![CDATA[${job.salary_range || 'Wettbewerbsfähig'}]]></salary>
    <jobtype><![CDATA[${job.job_type}]]></jobtype>
    ${job.department ? `<category><![CDATA[${job.department}]]></category>` : ''}
  </job>
</source>`;
  }
}
