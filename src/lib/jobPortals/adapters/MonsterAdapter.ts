import { Job, PostingStatus } from '@/types/jobs';
import type { AxiosError } from 'axios';
import { BaseJobPortalAdapter } from '../BaseAdapter';
import { PublishResult, JobPortalConfig } from '../types';
import axios from 'axios';

/**
 * Adapter für die Integration mit Monster
 * Monster bietet eine REST-API für die Veröffentlichung von Stellenanzeigen
 */
export class MonsterAdapter extends BaseJobPortalAdapter {
  public name = 'Monster';
  public key = 'monster';
  public icon = 'monster-logo.png'; // Sollte im public-Verzeichnis abgelegt werden
  public isFree = false;
  public requiresAuth = true;
  public configInstructions = `
    Für die Nutzung der Monster-API benötigen Sie einen API-Schlüssel und einen API-Secret.
    Diese erhalten Sie über das Monster Developer Portal.
    
    Erforderliche Konfiguration:
    - apiKey: Ihr Monster API-Schlüssel
    - apiSecret: Ihr Monster API-Secret
    
    Optional:
    - autoRepublish: Automatische Neuveröffentlichung (true/false)
    - republishCycle: Zyklus für Neuveröffentlichung in Tagen (z.B. 30)
    
    Besuchen Sie https://developer.monster.com/ für mehr Informationen.
  `;

  // Basis-URL für die Monster-API
  private readonly apiBaseUrl = 'https://api.monster.com/v2';

  /**
   * Überprüft, ob der Adapter konfiguriert ist
   * @param config Konfigurationsobjekt
   * @returns true, wenn der Adapter konfiguriert ist
   */
  public isConfigured(config?: JobPortalConfig): boolean {
    return this.hasRequiredConfig(config, ['apiKey', 'apiSecret']);
  }

  /**
   * Veröffentlichen einer Stelle auf Monster
   * @param job Job-Objekt
   * @param config Konfigurationsobjekt
   */
  public async publishJob(job: Job, config?: JobPortalConfig): Promise<PublishResult> {
    if (!this.isConfigured(config)) {
      return this.createErrorResult('Monster-API nicht konfiguriert. API-Schlüssel und API-Secret erforderlich.');
    }

    try {
      // Bereite die Daten für Monster vor
      const jobData = this.formatJobData(job);
      
      // In einer realen Implementierung würde hier die Monster-API aufgerufen werden
      console.log('Veröffentliche Job auf Monster:', jobData);
      
      // Simuliere API-Aufruf
      // In realer Implementierung:
      // const response = await axios.post(
      //   `${this.apiBaseUrl}/jobs`,
      //   jobData,
      //   {
      //     headers: {
      //       'Authorization': `Bearer ${config?.apiKey}`,
      //       'Content-Type': 'application/json'
      //     }
      //   }
      // );
      
      // Simuliere erfolgreiche Antwort
      const mockPlatformId = `monster-${job.id}-${Date.now()}`;
      const mockUrl = `https://www.monster.de/job/${mockPlatformId}`;
      
      return this.createSuccessResult(
        mockPlatformId,
        mockUrl,
        { job: jobData }
      );
    } catch (error) {
      if (axios.isAxiosError(error as Error)) {
        const axiosError = error as AxiosError;
        return this.createErrorResult(
          `Fehler bei der Veröffentlichung auf Monster: ${axiosError.message}`,
          axiosError.response?.status,
          axiosError.response?.data
        );
      }
      return this.createErrorResult(
        `Fehler bei der Veröffentlichung auf Monster: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Aktualisieren einer bereits veröffentlichten Stelle
   * @param job Job-Objekt
   * @param externalId ID der Stelle auf Monster
   * @param config Konfigurationsobjekt
   */
  public async updateJob(job: Job, externalId: string, config?: JobPortalConfig): Promise<PublishResult> {
    if (!this.isConfigured(config)) {
      return this.createErrorResult('Monster-API nicht konfiguriert. API-Schlüssel und API-Secret erforderlich.');
    }

    try {
      const jobData = this.formatJobData(job);
      
      // In einer realen Implementierung würde hier die Monster-API aufgerufen werden
      console.log(`Aktualisiere Job ${externalId} auf Monster:`, jobData);
      
      // Simuliere API-Aufruf
      // In realer Implementierung:
      // const response = await axios.put(
      //   `${this.apiBaseUrl}/jobs/${externalId}`,
      //   jobData,
      //   {
      //     headers: {
      //       'Authorization': `Bearer ${config?.apiKey}`,
      //       'Content-Type': 'application/json'
      //     }
      //   }
      // );
      
      return this.createSuccessResult(
        externalId,
        `https://www.monster.de/job/${externalId}`,
        { job: jobData }
      );
    } catch (error) {
      if (axios.isAxiosError(error as Error)) {
        const axiosError = error as AxiosError;
        return this.createErrorResult(
          `Fehler bei der Aktualisierung auf Monster: ${axiosError.message}`,
          axiosError.response?.status,
          axiosError.response?.data
        );
      }
      return this.createErrorResult(
        `Fehler bei der Aktualisierung auf Monster: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Löschen einer Stelle von Monster
   * @param externalId ID der Stelle auf Monster
   * @param config Konfigurationsobjekt
   */
  public async deleteJob(externalId: string, config?: JobPortalConfig): Promise<boolean> {
    if (!this.isConfigured(config)) {
      console.error('Monster-API nicht konfiguriert. API-Schlüssel und API-Secret erforderlich.');
      return false;
    }

    try {
      // In einer realen Implementierung würde hier die Monster-API aufgerufen werden
      console.log(`Lösche Job ${externalId} von Monster`);
      
      // Simuliere API-Aufruf
      // In realer Implementierung:
      // await axios.delete(
      //   `${this.apiBaseUrl}/jobs/${externalId}`,
      //   {
      //     headers: {
      //       'Authorization': `Bearer ${config?.apiKey}`,
      //     }
      //   }
      // );
      
      return true;
    } catch (error) {
      console.error(`Fehler beim Löschen der Stelle von Monster: ${error}`);
      return false;
    }
  }

  /**
   * Status einer Veröffentlichung auf Monster prüfen
   * @param externalId ID der Stelle auf Monster
   * @param config Konfigurationsobjekt
   */
  public async checkStatus(externalId: string, config?: JobPortalConfig): Promise<PostingStatus> {
    if (!this.isConfigured(config)) {
      console.error('Monster-API nicht konfiguriert. API-Schlüssel und API-Secret erforderlich.');
      return 'error';
    }

    try {
      // In einer realen Implementierung würde hier die Monster-API aufgerufen werden
      console.log(`Prüfe Status des Jobs ${externalId} auf Monster`);
      
      // Simuliere API-Aufruf
      // In realer Implementierung:
      // const response = await axios.get(
      //   `${this.apiBaseUrl}/jobs/${externalId}`,
      //   {
      //     headers: {
      //       'Authorization': `Bearer ${config?.apiKey}`,
      //     }
      //   }
      // );
      // 
      // return this.mapMonsterStatus(response.data.status);
      
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
      console.error(`Fehler beim Prüfen des Status auf Monster: ${error}`);
      return 'error';
    }
  }

  /**
   * Formatiert die Job-Daten für die Monster-API
   * @param job Job-Objekt
   * @returns Formatierte Job-Daten
   */
  private formatJobData(job: Job): any {
    // Formatiere die Beschreibung für Monster (behält HTML-Tags bei)
    const description = job.rich_description || job.description;
    
    // Aufteilen des Standorts in Stadt, Region, Land
    const locationParts = job.location.split(',').map(part => part.trim());
    const city = locationParts[0] || '';
    const region = locationParts[1] || '';
    const country = locationParts[2] || 'DE';
    
    // Erstelle Job-Daten im Monster-Format
    return {
      jobReference: job.external_job_id || job.id,
      title: job.title,
      description: description,
      company: {
        name: job.company,
        description: job.company_description || '',
      },
      location: {
        addressLine: '',
        city: city,
        state: region,
        country: country,
        postalCode: ''
      },
      jobDetails: {
        jobType: this.mapJobType(job.job_type),
        industry: job.department || '',
        experienceLevel: 'Entry_Level', // Kann aus dem Job-Objekt abgeleitet werden, falls vorhanden
        educationLevel: 'No_Requirement', // Kann aus dem Job-Objekt abgeleitet werden, falls vorhanden
        skills: Array.isArray(job.skills) 
          ? job.skills.map(skill => typeof skill === 'string' ? skill : skill.name) 
          : []
      },
      compensation: {
        salaryType: 'Range',
        salaryRange: {
          minimum: {
            value: this.extractMinSalary(job.salary_range || ''),
            currencyCode: 'EUR'
          },
          maximum: {
            value: this.extractMaxSalary(job.salary_range || ''),
            currencyCode: 'EUR'
          }
        },
        benefits: job.benefits ? [job.benefits] : []
      },
      applicationInfo: {
        applyUrl: `https://example.com/jobs/${job.id}/apply`
      },
      postingInfo: {
        startDate: new Date().toISOString(),
        endDate: this.calculateEndDate(30) // 30 Tage Laufzeit
      }
    };
  }
  
  /**
   * Mappt den Job-Typ auf Monster-Werte
   * @param jobType Job-Typ
   * @returns Monster-Job-Typ
   */
  private mapJobType(jobType: string): string {
    const jobTypeMap: Record<string, string> = {
      'Vollzeit': 'FULL_TIME',
      'Teilzeit': 'PART_TIME',
      'Befristet': 'CONTRACT',
      'Praktikum': 'INTERNSHIP',
      'Ausbildung': 'APPRENTICESHIP',
      'Werkstudent': 'CONTRACT',
      'Freiberuflich': 'CONTRACTOR'
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
   * Extrahiert den minimalen Gehaltswert aus einem Gehaltsbereich-String
   * @param salaryRange Gehaltsbereich (z.B. "40.000€ - 50.000€")
   * @returns Minimaler Gehaltswert oder 0, wenn nicht extrahierbar
   */
  private extractMinSalary(salaryRange: string): number {
    const match = salaryRange.match(/(\d+[.,]?\d*)/);
    if (match && match[1]) {
      return parseFloat(match[1].replace(',', '.'));
    }
    return 0;
  }
  
  /**
   * Extrahiert den maximalen Gehaltswert aus einem Gehaltsbereich-String
   * @param salaryRange Gehaltsbereich (z.B. "40.000€ - 50.000€")
   * @returns Maximaler Gehaltswert oder 0, wenn nicht extrahierbar
   */
  private extractMaxSalary(salaryRange: string): number {
    const matches = salaryRange.match(/(\d+[.,]?\d*)/g);
    if (matches && matches.length > 1) {
      return parseFloat(matches[1].replace(',', '.'));
    } else if (matches && matches.length === 1) {
      // Falls nur ein Wert vorhanden ist, wird dieser als Minimum und Maximum verwendet
      return parseFloat(matches[0].replace(',', '.'));
    }
    return 0;
  }
}
