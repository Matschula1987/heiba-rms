import { Job, PostingStatus } from '@/types/jobs';
import { BaseJobPortalAdapter } from '../BaseAdapter';
import { PublishResult, JobPortalConfig } from '../types';

/**
 * Adapter für die Integration mit der Bundesagentur für Arbeit
 * Die Bundesagentur für Arbeit bietet eine API für Arbeitgeber und Jobportale
 */
export class ArbeitsagenturAdapter extends BaseJobPortalAdapter {
  public name = 'Bundesagentur für Arbeit';
  public key = 'arbeitsagentur';
  public icon = 'arbeitsagentur-logo.png'; // Sollte im public-Verzeichnis abgelegt werden
  public isFree = true;
  public requiresAuth = true;
  public configInstructions = `
    Um die Jobveröffentlichung bei der Bundesagentur für Arbeit zu nutzen, benötigen Sie:
    1. Ein Unternehmensprofil bei der Jobbörse: https://jobboerse.arbeitsagentur.de
    2. Anmeldedaten für die Jobbörse API
    
    Beantragen Sie einen API-Zugang bei der Bundesagentur für Arbeit und erhalten Sie
    eine Partner-ID und einen API-Schlüssel für die Authentifizierung.
  `;

  /**
   * Überprüft, ob der Adapter konfiguriert ist
   * @param config Konfigurationsobjekt
   * @returns true, wenn der Adapter konfiguriert ist
   */
  public isConfigured(config?: JobPortalConfig): boolean {
    return this.hasRequiredConfig(config, ['apiKey', 'partnerId']);
  }

  /**
   * Veröffentlichen einer Stelle bei der Bundesagentur für Arbeit
   * @param job Job-Objekt
   * @param config Konfigurationsobjekt mit apiKey und partnerId
   */
  public async publishJob(job: Job, config?: JobPortalConfig): Promise<PublishResult> {
    try {
      if (!this.isConfigured(config)) {
        return this.createErrorResult('Fehlende Konfiguration für die Bundesagentur für Arbeit. Bitte API-Schlüssel und Partner-ID konfigurieren.');
      }

      // In einer realen Implementierung würde hier die API der Bundesagentur für Arbeit verwendet werden
      // Für dieses Beispiel simulieren wir eine erfolgreiche Veröffentlichung
      const jobData = this.formatJobData(job, config);
      
      console.log('Veröffentlichung bei der Bundesagentur für Arbeit:', jobData);
      
      // Simuliere eine erfolgreiche Veröffentlichung
      const mockPlatformId = `aba-${job.id}-${Date.now()}`;
      const mockUrl = `https://jobboerse.arbeitsagentur.de/vamJB/stellenangebotAnzeigen.html?execution=e1s1&id=${mockPlatformId}`;
      
      return this.createSuccessResult(
        mockPlatformId,
        mockUrl,
        { jobData }
      );
    } catch (error) {
      return this.createErrorResult(
        `Fehler bei der Veröffentlichung bei der Bundesagentur für Arbeit: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Aktualisieren einer bereits veröffentlichten Stelle
   * @param job Job-Objekt
   * @param externalId ID der Stelle bei der Bundesagentur für Arbeit
   * @param config Konfigurationsobjekt mit apiKey und partnerId
   */
  public async updateJob(job: Job, externalId: string, config?: JobPortalConfig): Promise<PublishResult> {
    try {
      if (!this.isConfigured(config)) {
        return this.createErrorResult('Fehlende Konfiguration für die Bundesagentur für Arbeit. Bitte API-Schlüssel und Partner-ID konfigurieren.');
      }

      // In einer realen Implementierung würde hier die API der Bundesagentur für Arbeit angesprochen werden
      // Für dieses Beispiel simulieren wir eine erfolgreiche Aktualisierung
      const jobData = this.formatJobData(job, config, externalId);
      
      console.log('Aktualisierung bei der Bundesagentur für Arbeit:', jobData);
      
      // Simuliere eine erfolgreiche Aktualisierung
      const mockUrl = `https://jobboerse.arbeitsagentur.de/vamJB/stellenangebotAnzeigen.html?execution=e1s1&id=${externalId}`;
      
      return this.createSuccessResult(
        externalId,
        mockUrl,
        { jobData }
      );
    } catch (error) {
      return this.createErrorResult(
        `Fehler bei der Aktualisierung bei der Bundesagentur für Arbeit: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Löschen einer Stelle von der Bundesagentur für Arbeit
   * @param externalId ID der Stelle bei der Bundesagentur für Arbeit
   * @param config Konfigurationsobjekt mit apiKey und partnerId
   */
  public async deleteJob(externalId: string, config?: JobPortalConfig): Promise<boolean> {
    try {
      if (!this.isConfigured(config)) {
        console.error('Fehlende Konfiguration für die Bundesagentur für Arbeit. Bitte API-Schlüssel und Partner-ID konfigurieren.');
        return false;
      }

      // In einer realen Implementierung würde hier die API der Bundesagentur für Arbeit angesprochen werden
      console.log(`Löschung der Stelle ${externalId} von der Bundesagentur für Arbeit`);
      
      // Simuliere erfolgreiche Löschung
      return true;
    } catch (error) {
      console.error(`Fehler beim Löschen der Stelle von der Bundesagentur für Arbeit: ${error}`);
      return false;
    }
  }

  /**
   * Status einer Veröffentlichung bei der Bundesagentur für Arbeit prüfen
   * @param externalId ID der Stelle bei der Bundesagentur für Arbeit
   * @param config Konfigurationsobjekt mit apiKey und partnerId
   */
  public async checkStatus(externalId: string, config?: JobPortalConfig): Promise<PostingStatus> {
    try {
      if (!this.isConfigured(config)) {
        console.error('Fehlende Konfiguration für die Bundesagentur für Arbeit. Bitte API-Schlüssel und Partner-ID konfigurieren.');
        return 'error';
      }

      // In einer realen Implementierung würde hier die API der Bundesagentur für Arbeit angesprochen werden
      // Für unser Beispiel nehmen wir an, dass die Stelle veröffentlicht ist
      return 'published';
    } catch (error) {
      console.error(`Fehler beim Prüfen des Status bei der Bundesagentur für Arbeit: ${error}`);
      return 'error';
    }
  }

  /**
   * Formatiert die Job-Daten für die Bundesagentur für Arbeit API
   * @param job Job-Objekt
   * @param config Konfigurationsobjekt
   * @param externalId Externe ID (für Updates)
   * @returns Formatierte Job-Daten
   */
  private formatJobData(job: Job, config?: JobPortalConfig, externalId?: string): any {
    // Entferne HTML-Tags aus der Beschreibung
    const plainDescription = this.formatDescription(job);
    
    // Extrahiere Stadt und PLZ aus dem Standort
    const location = this.parseLocation(job.location);
    
    // Bereite Validitätsdatum vor
    const validUntil = job.publication_end_date 
      ? new Date(job.publication_end_date).toISOString().split('T')[0]
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 30 Tage in der Zukunft
    
    // Simulierte Daten für die Bundesagentur für Arbeit API
    return {
      partnerId: config?.partnerId,
      reference: externalId || job.external_job_id || job.id,
      title: job.title,
      description: plainDescription,
      company: job.company,
      location: {
        city: location.city,
        postalCode: location.postalCode || '00000',
        street: location.street || '',
        houseNumber: location.houseNumber || '',
        country: 'DE'
      },
      contact: {
        salutation: 'Herr/Frau',
        firstName: 'Kontakt',
        lastName: 'Person',
        phone: '+49 123 456789',
        email: 'kontakt@example.com'
      },
      employment: {
        type: this.mapEmploymentType(job.job_type),
        startDate: 'sofort',
        endDate: job.job_type.includes('Befristet') ? validUntil : 'unbefristet',
        duration: job.job_type.includes('Befristet') ? '1 Jahr' : null,
        workingTime: job.job_type.includes('Teilzeit') ? 'teilzeit' : 'vollzeit',
        workingHours: job.job_type.includes('Teilzeit') ? 20 : 40
      },
      salary: job.salary_range || 'nach Vereinbarung',
      requirements: job.requirements || '',
      applicationMethods: {
        email: true,
        phone: true,
        mail: true,
        online: true
      },
      validUntil: validUntil
    };
  }

  /**
   * Parst eine Standortangabe in strukturierte Daten
   * @param location Standortangabe als String
   * @returns Strukturierte Standortdaten
   */
  private parseLocation(location: string): { city: string; postalCode?: string; street?: string; houseNumber?: string } {
    // Einfache Version: Wir nehmen an, dass der Standort im Format "Stadt, Land" oder "PLZ Stadt, Land" ist
    const parts = location.split(',');
    const cityPart = parts[0].trim();
    
    // Versuche zu erkennen, ob die PLZ im cityPart enthalten ist
    const plzMatch = cityPart.match(/^(\d{5})\s+(.+)$/);
    
    if (plzMatch) {
      return {
        postalCode: plzMatch[1],
        city: plzMatch[2]
      };
    }
    
    return {
      city: cityPart
    };
  }

  /**
   * Übersetzt den Job-Typ in das Format der Bundesagentur für Arbeit
   * @param jobType Job-Typ aus dem HeiBa-System
   * @returns Bundesagentur für Arbeit-konformer Job-Typ
   */
  private mapEmploymentType(jobType: string): string {
    const typeMap: Record<string, string> = {
      'Vollzeit': 'REGULAR',
      'Teilzeit': 'REGULAR',
      'Freelance': 'TEMPORARY',
      'Werkstudent': 'TEMPORARY',
      'Praktikum': 'INTERNSHIP',
      'Ausbildung': 'APPRENTICESHIP',
      'Remote': 'REGULAR',
      'Hybrid': 'REGULAR'
    };
    
    return typeMap[jobType] || 'REGULAR';
  }
}
