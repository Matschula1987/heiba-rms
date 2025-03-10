import { Job, PostingStatus } from '@/types/jobs';
import type { AxiosError } from 'axios';
import { BaseJobPortalAdapter } from '../BaseAdapter';
import { PublishResult, JobPortalConfig } from '../types';
import axios from 'axios';
import { MovidoJobPostingModule } from '@/lib/movidoAutomation/modules/MovidoJobPostingModule';

/**
 * Adapter für die Integration mit Movido
 * Movido ist ein Multiposting-Tool, das es ermöglicht, Stellenanzeigen auf verschiedene Portale zu verteilen
 */
export class MovidoAdapter extends BaseJobPortalAdapter {
  public name = 'Movido';
  public key = 'movido';
  public icon = 'movido-logo.png'; // Sollte im public-Verzeichnis abgelegt werden
  public isFree = false;
  public requiresAuth = true;
  private readonly movidoJobPostingModule = new MovidoJobPostingModule(); // Verwende das Modul zur Validierung und Korrektur
  public configInstructions = `
    Für die Nutzung der Movido-API benötigen Sie einen API-Schlüssel und API-Secret.
    Diese Zugangsdaten erhalten Sie von Ihrem Movido Account Manager.
    
    Erforderliche Konfiguration:
    - apiKey: Ihr Movido API-Schlüssel
    - apiSecret: Ihr Movido API-Secret
    - companyId: Ihre Movido-Unternehmens-ID
    
    Optional:
    - defaultPremium: Standardmäßig Premium-Stellenanzeigen verwenden (true/false)
    - defaultTargetPortals: Array mit Standard-Zielportalen (z.B. ["stepstone", "indeed", "monster"])
    
    Kontaktieren Sie Ihren Movido Account Manager für weitere Informationen.
  `;

  // Basis-URL für die Movido-API
  private readonly apiBaseUrl = 'https://api.movido.com/v2';

  /**
   * Überprüft, ob der Adapter konfiguriert ist
   * @param config Konfigurationsobjekt
   * @returns true, wenn der Adapter konfiguriert ist
   */
  public isConfigured(config?: JobPortalConfig): boolean {
    return this.hasRequiredConfig(config, ['apiKey', 'apiSecret', 'companyId']);
  }

  /**
   * Veröffentlichen einer Stelle über Movido auf mehreren Portalen
   * @param job Job-Objekt
   * @param config Konfigurationsobjekt
   */
  public async publishJob(job: Job, config?: JobPortalConfig): Promise<PublishResult> {
    if (!this.isConfigured(config)) {
      return this.createErrorResult('Movido-API nicht konfiguriert. API-Schlüssel, API-Secret und Unternehmens-ID erforderlich.');
    }

    try {
      // Bereite die Daten für Movido vor
      let jobData = this.formatJobData(job, config);
      
      // Validiere und korrigiere die Stellenanzeige vor dem Veröffentlichen
      try {
        jobData = this.movidoJobPostingModule.validateAndCorrectPosting(jobData, job);
        console.log('Stellenanzeige erfolgreich validiert und korrigiert.');
      } catch (validationError) {
        return this.createErrorResult(`Validierungsfehler: ${validationError instanceof Error ? validationError.message : String(validationError)}`);
      }
      
      // In einer realen Implementierung würde hier die Movido-API aufgerufen werden
      console.log('Veröffentliche Job über Movido:', jobData);
      
      // Simuliere API-Aufruf
      // In realer Implementierung:
      // const response = await axios.post(
      //   `${this.apiBaseUrl}/jobs`,
      //   jobData,
      //   {
      //     headers: {
      //       'Authorization': `Bearer ${await this.getAuthToken(config)}`,
      //       'Content-Type': 'application/json'
      //     }
      //   }
      // );
      
      // Simuliere erfolgreiche Antwort
      const mockPlatformId = `movido-${job.id}-${Date.now()}`;
      const mockUrl = `https://app.movido.com/jobs/${mockPlatformId}`;
      
      // Simuliere eine Antwort mit den IDs der Veröffentlichungen auf den verschiedenen Portalen
      const mockResponse = {
        id: mockPlatformId,
        status: 'published',
        portals: this.getTargetPortals(config).map(portal => ({
          name: portal,
          status: 'published',
          externalId: `${portal}-${Date.now()}`,
          url: `https://www.${portal}.de/job/${Date.now()}`
        }))
      };
      
      return this.createSuccessResult(
        mockPlatformId,
        mockUrl,
        mockResponse
      );
    } catch (error) {
      if (axios.isAxiosError(error as Error)) {
        const axiosError = error as AxiosError;
        return this.createErrorResult(
          `Fehler bei der Veröffentlichung über Movido: ${axiosError.message}`,
          axiosError.response?.status,
          axiosError.response?.data
        );
      }
      return this.createErrorResult(
        `Fehler bei der Veröffentlichung über Movido: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Aktualisieren einer bereits veröffentlichten Stelle
   * @param job Job-Objekt
   * @param externalId ID der Stelle bei Movido
   * @param config Konfigurationsobjekt
   */
  public async updateJob(job: Job, externalId: string, config?: JobPortalConfig): Promise<PublishResult> {
    if (!this.isConfigured(config)) {
      return this.createErrorResult('Movido-API nicht konfiguriert. API-Schlüssel, API-Secret und Unternehmens-ID erforderlich.');
    }

    try {
      // Bereite die Daten für Movido vor
      let jobData = this.formatJobData(job, config);
      
      // Validiere und korrigiere die Stellenanzeige vor der Aktualisierung
      try {
        jobData = this.movidoJobPostingModule.validateAndCorrectPosting(jobData, job);
        console.log('Stellenanzeige erfolgreich validiert und korrigiert für Update.');
      } catch (validationError) {
        return this.createErrorResult(`Validierungsfehler beim Update: ${validationError instanceof Error ? validationError.message : String(validationError)}`);
      }
      
      // In einer realen Implementierung würde hier die Movido-API aufgerufen werden
      console.log(`Aktualisiere Job ${externalId} über Movido:`, jobData);
      
      // Simuliere API-Aufruf
      // In realer Implementierung:
      // const response = await axios.put(
      //   `${this.apiBaseUrl}/jobs/${externalId}`,
      //   jobData,
      //   {
      //     headers: {
      //       'Authorization': `Bearer ${await this.getAuthToken(config)}`,
      //       'Content-Type': 'application/json'
      //     }
      //   }
      // );
      
      // Simuliere erfolgreiche Antwort
      const mockUrl = `https://app.movido.com/jobs/${externalId}`;
      
      // Simuliere eine Antwort mit den IDs der Veröffentlichungen auf den verschiedenen Portalen
      const mockResponse = {
        id: externalId,
        status: 'updated',
        portals: this.getTargetPortals(config).map(portal => ({
          name: portal,
          status: 'updated',
          externalId: `${portal}-${Date.now()}`,
          url: `https://www.${portal}.de/job/${Date.now()}`
        }))
      };
      
      return this.createSuccessResult(
        externalId,
        mockUrl,
        mockResponse
      );
    } catch (error) {
      if (axios.isAxiosError(error as Error)) {
        const axiosError = error as AxiosError;
        return this.createErrorResult(
          `Fehler bei der Aktualisierung über Movido: ${axiosError.message}`,
          axiosError.response?.status,
          axiosError.response?.data
        );
      }
      return this.createErrorResult(
        `Fehler bei der Aktualisierung über Movido: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Löschen einer Stelle von Movido (und allen verbundenen Portalen)
   * @param externalId ID der Stelle bei Movido
   * @param config Konfigurationsobjekt
   */
  public async deleteJob(externalId: string, config?: JobPortalConfig): Promise<boolean> {
    if (!this.isConfigured(config)) {
      console.error('Movido-API nicht konfiguriert. API-Schlüssel, API-Secret und Unternehmens-ID erforderlich.');
      return false;
    }

    try {
      // In einer realen Implementierung würde hier die Movido-API aufgerufen werden
      console.log(`Lösche Job ${externalId} von Movido und allen Portalen`);
      
      // Simuliere API-Aufruf
      // In realer Implementierung:
      // await axios.delete(
      //   `${this.apiBaseUrl}/jobs/${externalId}`,
      //   {
      //     headers: {
      //       'Authorization': `Bearer ${await this.getAuthToken(config)}`,
      //     }
      //   }
      // );
      
      return true;
    } catch (error) {
      console.error(`Fehler beim Löschen der Stelle von Movido: ${error}`);
      return false;
    }
  }

  /**
   * Status einer Veröffentlichung auf Movido prüfen
   * @param externalId ID der Stelle bei Movido
   * @param config Konfigurationsobjekt
   */
  public async checkStatus(externalId: string, config?: JobPortalConfig): Promise<PostingStatus> {
    if (!this.isConfigured(config)) {
      console.error('Movido-API nicht konfiguriert. API-Schlüssel, API-Secret und Unternehmens-ID erforderlich.');
      return 'error';
    }

    try {
      // In einer realen Implementierung würde hier die Movido-API aufgerufen werden
      console.log(`Prüfe Status des Jobs ${externalId} auf Movido`);
      
      // Simuliere API-Aufruf
      // In realer Implementierung:
      // const response = await axios.get(
      //   `${this.apiBaseUrl}/jobs/${externalId}/status`,
      //   {
      //     headers: {
      //       'Authorization': `Bearer ${await this.getAuthToken(config)}`,
      //     }
      //   }
      // );
      // 
      // const overallStatus = this.determineOverallStatus(response.data.portals);
      // return overallStatus;
      
      // Simuliere verschiedene Status basierend auf der externalId
      if (externalId.includes('error')) {
        return 'error';
      } else if (externalId.includes('pending')) {
        return 'pending';
      } else if (externalId.includes('expired')) {
        return 'expired';
      } else {
        return 'published';
      }
    } catch (error) {
      console.error(`Fehler beim Prüfen des Status auf Movido: ${error}`);
      return 'error';
    }
  }

  /**
   * Gibt die konfigurierten Zielportale zurück
   * @param config Konfigurationsobjekt
   * @returns Array mit Zielportalen
   */
  private getTargetPortals(config?: JobPortalConfig): string[] {
    if (config?.targetPortals && Array.isArray(config.targetPortals)) {
      return config.targetPortals;
    }
    
    if (config?.defaultTargetPortals && Array.isArray(config.defaultTargetPortals)) {
      return config.defaultTargetPortals;
    }
    
    // Standardmäßig einige der wichtigsten Portale
    return ['stepstone', 'indeed', 'monster', 'xing', 'linkedin'];
  }

  /**
   * Formatiert die Job-Daten für die Movido-API
   * @param job Job-Objekt
   * @param config Konfigurationsobjekt
   * @returns Formatierte Job-Daten
   */
  private formatJobData(job: Job, config?: JobPortalConfig): any {
    // Formatiere die Beschreibung für Movido (behält HTML-Tags bei)
    const description = job.rich_description || job.description;
    
    // Aufteilen des Standorts in Stadt, Region, Land
    const locationParts = job.location.split(',').map(part => part.trim());
    const city = locationParts[0] || '';
    const region = locationParts[1] || '';
    const country = locationParts[2] || 'DE';
    
    // Ermittle, ob Premium-Stellenanzeigen verwendet werden sollen
    const usePremium = config?.defaultPremium === true;
    
    // Ermittle die Zielportale
    const targetPortals = this.getTargetPortals(config);
    
    // Erstelle Job-Daten im Movido-Format
    return {
      reference: job.external_job_id || job.id,
      title: job.title,
      description: description,
      company: {
        id: config?.companyId,
        name: job.company
      },
      location: {
        city,
        region,
        country,
        postalCode: ''
      },
      details: {
        responsibilities: job.requirements || '',
        qualifications: job.requirements || '',
        jobType: this.mapJobType(job.job_type),
        industry: job.department || '',
        experienceLevel: '',
        educationLevel: ''
      },
      compensation: {
        salary: job.salary_range || '',
        benefits: job.benefits || ''
      },
      application: {
        url: `https://example.com/jobs/${job.id}/apply`,
        email: '',
        phone: ''
      },
      settings: {
        premium: usePremium,
        startDate: new Date().toISOString(),
        endDate: this.calculateEndDate(30), // 30 Tage Laufzeit
        targetPortals: targetPortals
      }
    };
  }
  
  /**
   * Mappt den Job-Typ auf Movido-Werte
   * @param jobType Job-Typ
   * @returns Movido-Job-Typ
   */
  private mapJobType(jobType: string): string {
    const jobTypeMap: Record<string, string> = {
      'Vollzeit': 'FULL_TIME',
      'Teilzeit': 'PART_TIME',
      'Befristet': 'FIXED_TERM',
      'Praktikum': 'INTERNSHIP',
      'Ausbildung': 'APPRENTICESHIP',
      'Werkstudent': 'WORKING_STUDENT',
      'Freiberuflich': 'FREELANCE'
    };
    
    return jobTypeMap[jobType] || 'FULL_TIME';
  }
  
  /**
   * Berechnet das Enddatum basierend auf der Laufzeit in Tagen
   * @param days Laufzeit in Tagen
   * @returns ISO-Datums-String
   */
  private calculateEndDate(days: number): string {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    return endDate.toISOString();
  }
  
  /**
   * Ermittelt einen Gesamt-Status basierend auf den Status der einzelnen Portale
   * @param portalStatuses Status-Informationen der einzelnen Portale
   * @returns Gesamt-Status
   */
  private determineOverallStatus(portalStatuses: Array<{portal: string, status: string}>): PostingStatus {
    if (!portalStatuses || portalStatuses.length === 0) {
      return 'error';
    }
    
    // Wenn mindestens ein Portal einen Fehler hat, ist der Gesamt-Status "error"
    if (portalStatuses.some(p => p.status === 'error')) {
      return 'error';
    }
    
    // Wenn alle Portale "expired" sind, ist der Gesamt-Status "expired"
    if (portalStatuses.every(p => p.status === 'expired')) {
      return 'expired';
    }
    
    // Wenn mindestens ein Portal "pending" ist und kein Portal einen Fehler hat,
    // ist der Gesamt-Status "pending"
    if (portalStatuses.some(p => p.status === 'pending')) {
      return 'pending';
    }
    
    // Wenn mindestens ein Portal "published" ist und keine Fehler oder "pending" existieren,
    // ist der Gesamt-Status "published"
    if (portalStatuses.some(p => p.status === 'published')) {
      return 'published';
    }
    
    // Fallback
    return 'draft';
  }
  
  /**
   * Holt ein Auth-Token von der Movido-API
   * @param config Konfigurationsobjekt
   * @returns Auth-Token
   */
  private async getAuthToken(config?: JobPortalConfig): Promise<string> {
    // In einer realen Implementierung würde hier ein Auth-Token von der Movido-API geholt werden
    // Für dieses Beispiel geben wir einen Mock-Token zurück
    return `mock-token-${Date.now()}`;
  }
  
  /**
   * Holt die aktiven Veröffentlichungen von Movido
   * @param config Konfigurationsobjekt
   * @returns Array mit aktiven Veröffentlichungen
   */
  public async getActivePostings(config?: JobPortalConfig): Promise<any[]> {
    if (!this.isConfigured(config)) {
      console.error('Movido-API nicht konfiguriert. API-Schlüssel, API-Secret und Unternehmens-ID erforderlich.');
      return [];
    }

    try {
      // In einer realen Implementierung würde hier die Movido-API aufgerufen werden
      console.log('Hole aktive Veröffentlichungen von Movido');
      
      // Simuliere API-Aufruf
      // In realer Implementierung:
      // const response = await axios.get(
      //   `${this.apiBaseUrl}/companies/${config?.companyId}/jobs`,
      //   {
      //     headers: {
      //       'Authorization': `Bearer ${await this.getAuthToken(config)}`,
      //     }
      //   }
      // );
      // 
      // return response.data.jobs;
      
      // Simuliere Antwort
      return [
        {
          id: `movido-job-1-${Date.now()}`,
          reference: `ref-1-${Date.now()}`,
          title: 'Senior Software Engineer',
          company: 'Technologie GmbH',
          location: 'Berlin',
          status: 'published',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          portals: [
            { portal: 'stepstone', status: 'published' },
            { portal: 'indeed', status: 'published' },
            { portal: 'monster', status: 'published' }
          ]
        },
        {
          id: `movido-job-2-${Date.now()}`,
          reference: `ref-2-${Date.now()}`,
          title: 'Frontend Developer',
          company: 'Web Solutions AG',
          location: 'München',
          status: 'published',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          portals: [
            { portal: 'stepstone', status: 'published' },
            { portal: 'indeed', status: 'error' },
            { portal: 'xing', status: 'published' }
          ]
        }
      ];
    } catch (error) {
      console.error(`Fehler beim Abrufen der aktiven Veröffentlichungen von Movido: ${error}`);
      return [];
    }
  }
  
  /**
   * Holt die Bewerbungen von Movido
   * @param config Konfigurationsobjekt
   * @returns Array mit Bewerbungen
   */
  public async getApplications(config?: JobPortalConfig): Promise<any[]> {
    if (!this.isConfigured(config)) {
      console.error('Movido-API nicht konfiguriert. API-Schlüssel, API-Secret und Unternehmens-ID erforderlich.');
      return [];
    }

    try {
      // In einer realen Implementierung würde hier die Movido-API aufgerufen werden
      console.log('Hole Bewerbungen von Movido');
      
      // Simuliere API-Aufruf
      // In realer Implementierung:
      // const response = await axios.get(
      //   `${this.apiBaseUrl}/companies/${config?.companyId}/applications`,
      //   {
      //     headers: {
      //       'Authorization': `Bearer ${await this.getAuthToken(config)}`,
      //     }
      //   }
      // );
      // 
      // return response.data.applications;
      
      // Simuliere Antwort
      return [
        {
          id: `movido-app-1-${Date.now()}`,
          jobId: `movido-job-1-${Date.now()}`,
          jobTitle: 'Senior Software Engineer',
          candidateName: 'Max Mustermann',
          candidateEmail: 'max@example.com',
          status: 'new',
          portal: 'stepstone',
          receivedAt: new Date().toISOString()
        },
        {
          id: `movido-app-2-${Date.now()}`,
          jobId: `movido-job-2-${Date.now()}`,
          jobTitle: 'Frontend Developer',
          candidateName: 'Erika Musterfrau',
          candidateEmail: 'erika@example.com',
          status: 'new',
          portal: 'xing',
          receivedAt: new Date().toISOString()
        }
      ];
    } catch (error) {
      console.error(`Fehler beim Abrufen der Bewerbungen von Movido: ${error}`);
      return [];
    }
  }
}
