import { Job, PostingStatus } from '@/types/jobs';
import type { AxiosError } from 'axios';
import { BaseJobPortalAdapter } from '../BaseAdapter';
import { PublishResult, JobPortalConfig } from '../types';
import axios from 'axios';

/**
 * Adapter für die Integration mit Stepstone
 * Stepstone bietet eine REST-API für die Veröffentlichung von Stellenanzeigen
 */
export class StepstoneAdapter extends BaseJobPortalAdapter {
  public name = 'Stepstone';
  public key = 'stepstone';
  public icon = 'stepstone-logo.png'; // Sollte im public-Verzeichnis abgelegt werden
  public isFree = false;
  public requiresAuth = true;
  public configInstructions = `
    Für die Nutzung der Stepstone-API benötigen Sie einen API-Schlüssel und ein API-Secret.
    Diese Zugangsdaten erhalten Sie beim Stepstone-Partner-Team.
    
    Erforderliche Konfiguration:
    - apiKey: Ihr Stepstone API-Schlüssel
    - apiSecret: Ihr Stepstone API-Secret
    
    Optional:
    - autoRepublish: Automatische Neuveröffentlichung (true/false)
    - republishCycle: Zyklus für Neuveröffentlichung in Tagen (z.B. 14)
    
    Kontaktieren Sie das Stepstone-Partner-Team unter partner@stepstone.de für mehr Informationen.
  `;

  // Basis-URL für die Stepstone-API
  private readonly apiBaseUrl = 'https://api.stepstone.com/v1';

  /**
   * Überprüft, ob der Adapter konfiguriert ist
   * @param config Konfigurationsobjekt
   * @returns true, wenn der Adapter konfiguriert ist
   */
  public isConfigured(config?: JobPortalConfig): boolean {
    return this.hasRequiredConfig(config, ['apiKey', 'apiSecret']);
  }

  /**
   * Veröffentlichen einer Stelle auf Stepstone
   * @param job Job-Objekt
   * @param config Konfigurationsobjekt
   */
  public async publishJob(job: Job, config?: JobPortalConfig): Promise<PublishResult> {
    if (!this.isConfigured(config)) {
      return this.createErrorResult('Stepstone-API nicht konfiguriert. API-Schlüssel und API-Secret erforderlich.');
    }

    try {
      // Bereite die Daten für Stepstone vor
      const jobData = this.formatJobData(job);
      
      // In einer realen Implementierung würde hier die Stepstone-API aufgerufen werden
      console.log('Veröffentliche Job auf Stepstone:', jobData);
      
      // Simuliere API-Aufruf
      // In realer Implementierung:
      // const response = await axios.post(
      //   `${this.apiBaseUrl}/jobs`,
      //   jobData,
      //   {
      //     headers: {
      //       'Authorization': `Basic ${Buffer.from(`${config?.apiKey}:${config?.apiSecret}`).toString('base64')}`,
      //       'Content-Type': 'application/json'
      //     }
      //   }
      // );
      
      // Simuliere erfolgreiche Antwort
      const mockPlatformId = `stepstone-${job.id}-${Date.now()}`;
      const mockUrl = `https://www.stepstone.de/job/${mockPlatformId}`;
      
      return this.createSuccessResult(
        mockPlatformId,
        mockUrl,
        { job: jobData }
      );
    } catch (error) {
      if (axios.isAxiosError(error as Error)) {
        const axiosError = error as AxiosError;
        return this.createErrorResult(
          `Fehler bei der Veröffentlichung auf Stepstone: ${axiosError.message}`,
          axiosError.response?.status,
          axiosError.response?.data
        );
      }
      return this.createErrorResult(
        `Fehler bei der Veröffentlichung auf Stepstone: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Aktualisieren einer bereits veröffentlichten Stelle
   * @param job Job-Objekt
   * @param externalId ID der Stelle auf Stepstone
   * @param config Konfigurationsobjekt
   */
  public async updateJob(job: Job, externalId: string, config?: JobPortalConfig): Promise<PublishResult> {
    if (!this.isConfigured(config)) {
      return this.createErrorResult('Stepstone-API nicht konfiguriert. API-Schlüssel und API-Secret erforderlich.');
    }

    try {
      const jobData = this.formatJobData(job);
      
      // In einer realen Implementierung würde hier die Stepstone-API aufgerufen werden
      console.log(`Aktualisiere Job ${externalId} auf Stepstone:`, jobData);
      
      // Simuliere API-Aufruf
      // In realer Implementierung:
      // const response = await axios.put(
      //   `${this.apiBaseUrl}/jobs/${externalId}`,
      //   jobData,
      //   {
      //     headers: {
      //       'Authorization': `Basic ${Buffer.from(`${config?.apiKey}:${config?.apiSecret}`).toString('base64')}`,
      //       'Content-Type': 'application/json'
      //     }
      //   }
      // );
      
      return this.createSuccessResult(
        externalId,
        `https://www.stepstone.de/job/${externalId}`,
        { job: jobData }
      );
    } catch (error) {
      if (axios.isAxiosError(error as Error)) {
        const axiosError = error as AxiosError;
        return this.createErrorResult(
          `Fehler bei der Aktualisierung auf Stepstone: ${axiosError.message}`,
          axiosError.response?.status,
          axiosError.response?.data
        );
      }
      return this.createErrorResult(
        `Fehler bei der Aktualisierung auf Stepstone: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Löschen einer Stelle von Stepstone
   * @param externalId ID der Stelle auf Stepstone
   * @param config Konfigurationsobjekt
   */
  public async deleteJob(externalId: string, config?: JobPortalConfig): Promise<boolean> {
    if (!this.isConfigured(config)) {
      console.error('Stepstone-API nicht konfiguriert. API-Schlüssel und API-Secret erforderlich.');
      return false;
    }

    try {
      // In einer realen Implementierung würde hier die Stepstone-API aufgerufen werden
      console.log(`Lösche Job ${externalId} von Stepstone`);
      
      // Simuliere API-Aufruf
      // In realer Implementierung:
      // await axios.delete(
      //   `${this.apiBaseUrl}/jobs/${externalId}`,
      //   {
      //     headers: {
      //       'Authorization': `Basic ${Buffer.from(`${config?.apiKey}:${config?.apiSecret}`).toString('base64')}`,
      //     }
      //   }
      // );
      
      return true;
    } catch (error) {
      console.error(`Fehler beim Löschen der Stelle von Stepstone: ${error}`);
      return false;
    }
  }

  /**
   * Status einer Veröffentlichung auf Stepstone prüfen
   * @param externalId ID der Stelle auf Stepstone
   * @param config Konfigurationsobjekt
   */
  public async checkStatus(externalId: string, config?: JobPortalConfig): Promise<PostingStatus> {
    if (!this.isConfigured(config)) {
      console.error('Stepstone-API nicht konfiguriert. API-Schlüssel und API-Secret erforderlich.');
      return 'error';
    }

    try {
      // In einer realen Implementierung würde hier die Stepstone-API aufgerufen werden
      console.log(`Prüfe Status des Jobs ${externalId} auf Stepstone`);
      
      // Simuliere API-Aufruf
      // In realer Implementierung:
      // const response = await axios.get(
      //   `${this.apiBaseUrl}/jobs/${externalId}/status`,
      //   {
      //     headers: {
      //       'Authorization': `Basic ${Buffer.from(`${config?.apiKey}:${config?.apiSecret}`).toString('base64')}`,
      //     }
      //   }
      // );
      // 
      // return response.data.status; // Je nach Stepstone-API Antwort
      
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
      console.error(`Fehler beim Prüfen des Status auf Stepstone: ${error}`);
      return 'error';
    }
  }

  /**
   * Formatiert die Job-Daten für die Stepstone-API
   * @param job Job-Objekt
   * @returns Formatierte Job-Daten
   */
  private formatJobData(job: Job): any {
    // Formatiere die Beschreibung für Stepstone (behält HTML-Tags bei)
    const description = job.rich_description || job.description;
    
    // Aufteilen des Standorts in Stadt, Region, Land
    const locationParts = job.location.split(',').map(part => part.trim());
    const city = locationParts[0] || '';
    const region = locationParts[1] || '';
    const country = locationParts[2] || 'Deutschland';
    
    // Erstelle Job-Daten im Stepstone-Format
    return {
      reference: job.external_job_id || job.id,
      title: job.title,
      company: {
        name: job.company,
        description: '',
        logoUrl: '' // Falls vorhanden: URL zum Unternehmenslogo
      },
      location: {
        city,
        region,
        country,
        postalCode: '', // Falls in den Job-Daten vorhanden
        street: '' // Falls in den Job-Daten vorhanden
      },
      description: {
        fullDescription: description,
        responsibilities: job.requirements || '',
        qualifications: job.requirements || ''
      },
      applicationDetails: {
        contactEmail: '',
        contactPhone: '',
        applyUrl: `https://example.com/jobs/${job.id}/apply`
      },
      employment: {
        type: this.mapJobType(job.job_type),
        schedule: 'FULL_TIME',
        duration: 'PERMANENT'
      },
      compensation: {
        salary: job.salary_range || '',
        benefits: job.benefits || []
      },
      department: job.department || '',
      startDate: 'immediate',
      skills: job.skills || []
    };
  }
  
  /**
   * Mappt den Job-Typ auf Stepstone-Werte
   * @param jobType Job-Typ
   * @returns Stepstone-Job-Typ
   */
  private mapJobType(jobType: string): string {
    const jobTypeMap: Record<string, string> = {
      'Vollzeit': 'FULL_TIME',
      'Teilzeit': 'PART_TIME',
      'Befristet': 'TEMPORARY',
      'Praktikum': 'INTERNSHIP',
      'Ausbildung': 'APPRENTICESHIP',
      'Werkstudent': 'STUDENT',
      'Freiberuflich': 'FREELANCE'
    };
    
    return jobTypeMap[jobType] || 'FULL_TIME';
  }
}
