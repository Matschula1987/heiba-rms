import { Job, PostingStatus } from '@/types/jobs';
import { BaseJobPortalAdapter } from '../BaseAdapter';
import { JobPortalConfig, PublishResult } from '../types';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

/**
 * Adapter für die Integration mit dem Index-Anzeigendaten Portal
 */
export class IndexAnzeigenAdapter extends BaseJobPortalAdapter {
  public name = 'Index Anzeigendaten';
  public key = 'index_anzeigen';
  public icon = 'fa-newspaper';
  public isFree = false;
  public requiresAuth = true;
  public configInstructions = `
  ## Konfiguration der Index-Anzeigendaten Integration
  
  Um die Integration mit Index-Anzeigendaten zu konfigurieren, benötigen Sie:
  
  1. Einen API-Schlüssel (apiKey)
  2. Eine Kunden-ID (customerId)
  3. Die Basis-URL der API (optional, Standard: https://api.index-anzeigen.de/v1)
  
  Diese Informationen erhalten Sie vom Index-Anzeigendaten Support.
  `;

  /**
   * Überprüft, ob der Adapter konfiguriert ist
   * @param config Adapter-Konfiguration
   * @returns true, wenn der Adapter konfiguriert ist
   */
  public isConfigured(config?: JobPortalConfig): boolean {
    return this.hasRequiredConfig(config, ['apiKey', 'customerId']);
  }

  /**
   * Veröffentlicht einen Job auf Index-Anzeigendaten
   * @param job Job-Objekt
   * @param config Adapter-Konfiguration
   * @returns Ergebnis der Veröffentlichung
   */
  public async publishJob(job: Job, config?: JobPortalConfig): Promise<PublishResult> {
    if (!this.isConfigured(config)) {
      return this.createErrorResult('Adapter nicht konfiguriert');
    }

    try {
      const apiUrl = config?.apiUrl || 'https://api.index-anzeigen.de/v1';
      const response = await axios.post(
        `${apiUrl}/jobs`,
        this.mapJobToApiFormat(job),
        {
          headers: {
            'Authorization': `Bearer ${config?.apiKey}`,
            'Content-Type': 'application/json',
            'X-Customer-Id': config?.customerId
          }
        }
      );

      if (response.status >= 200 && response.status < 300) {
        return this.createSuccessResult(
          response.data.id,
          response.data.jobUrl,
          response.data
        );
      } else {
        return this.createErrorResult(
          'Fehler bei der Veröffentlichung',
          response.status,
          response.data
        );
      }
    } catch (error) {
      const axiosError = error as any;
      return this.createErrorResult(
        `Fehler bei der Veröffentlichung: ${axiosError.message || 'Unbekannter Fehler'}`,
        axiosError.response?.status,
        axiosError.response?.data
      );
    }
  }

  /**
   * Aktualisiert einen bereits veröffentlichten Job
   * @param job Job-Objekt
   * @param externalId ID des Jobs auf Index-Anzeigendaten
   * @param config Adapter-Konfiguration
   * @returns Ergebnis der Aktualisierung
   */
  public async updateJob(job: Job, externalId: string, config?: JobPortalConfig): Promise<PublishResult> {
    if (!this.isConfigured(config)) {
      return this.createErrorResult('Adapter nicht konfiguriert');
    }

    try {
      const apiUrl = config?.apiUrl || 'https://api.index-anzeigen.de/v1';
      const response = await axios.put(
        `${apiUrl}/jobs/${externalId}`,
        this.mapJobToApiFormat(job),
        {
          headers: {
            'Authorization': `Bearer ${config?.apiKey}`,
            'Content-Type': 'application/json',
            'X-Customer-Id': config?.customerId
          }
        }
      );

      if (response.status >= 200 && response.status < 300) {
        return this.createSuccessResult(
          externalId,
          response.data.jobUrl,
          response.data
        );
      } else {
        return this.createErrorResult(
          'Fehler bei der Aktualisierung',
          response.status,
          response.data
        );
      }
    } catch (error) {
      const axiosError = error as any;
      return this.createErrorResult(
        `Fehler bei der Aktualisierung: ${axiosError.message || 'Unbekannter Fehler'}`,
        axiosError.response?.status,
        axiosError.response?.data
      );
    }
  }

  /**
   * Löscht einen veröffentlichten Job
   * @param externalId ID des Jobs auf Index-Anzeigendaten
   * @param config Adapter-Konfiguration
   * @returns true, wenn der Job erfolgreich gelöscht wurde
   */
  public async deleteJob(externalId: string, config?: JobPortalConfig): Promise<boolean> {
    if (!this.isConfigured(config)) {
      return false;
    }

    try {
      const apiUrl = config?.apiUrl || 'https://api.index-anzeigen.de/v1';
      const response = await axios.delete(
        `${apiUrl}/jobs/${externalId}`,
        {
          headers: {
            'Authorization': `Bearer ${config?.apiKey}`,
            'Content-Type': 'application/json',
            'X-Customer-Id': config?.customerId
          }
        }
      );

      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error('Fehler beim Löschen des Jobs:', error);
      return false;
    }
  }

  /**
   * Prüft den Status eines veröffentlichten Jobs
   * @param externalId ID des Jobs auf Index-Anzeigendaten
   * @param config Adapter-Konfiguration
   * @returns Status des Jobs
   */
  public async checkStatus(externalId: string, config?: JobPortalConfig): Promise<PostingStatus> {
    if (!this.isConfigured(config)) {
      return 'error';
    }

    try {
      const apiUrl = config?.apiUrl || 'https://api.index-anzeigen.de/v1';
      const response = await axios.get(
        `${apiUrl}/jobs/${externalId}/status`,
        {
          headers: {
            'Authorization': `Bearer ${config?.apiKey}`,
            'Content-Type': 'application/json',
            'X-Customer-Id': config?.customerId
          }
        }
      );

      // Mapping der Index-Anzeigendaten Status-Werte auf unsere PostingStatus-Enum
      if (response.status >= 200 && response.status < 300) {
        const status = response.data.status;
        
        switch (status) {
          case 'active':
            return 'published';
          case 'pending':
            return 'pending';
          case 'rejected':
            return 'rejected';
          case 'expired':
            return 'expired';
          case 'deleted':
            return 'draft';
          default:
            return 'error';
        }
      } else {
        return 'error';
      }
    } catch (error) {
      console.error('Fehler beim Prüfen des Job-Status:', error);
      return 'error';
    }
  }

  /**
   * Konvertiert ein Job-Objekt in das von der Index-Anzeigendaten API erwartete Format
   * @param job Job-Objekt
   * @returns Job-Objekt im API-Format
   */
  private mapJobToApiFormat(job: Job): any {
    // Erstellen einer eindeutigen Referenz für den Job
    const reference = `job-${uuidv4().substring(0, 8)}`;
    
    // Format der Beschreibung
    const description = this.formatDescription(job);
    
    // Standort parsen - versuchen Stadt und PLZ aus dem Standort-String zu extrahieren
    let city = '';
    let zip = '';
    const locationMatch = job.location.match(/([0-9]{5})\s*([a-zA-ZäöüÄÖÜß\s\-.]+)/);
    if (locationMatch) {
      zip = locationMatch[1];
      city = locationMatch[2].trim();
    } else {
      city = job.location;
    }
    
    // Anforderungen aus dem Requirements-Feld parsen, falls vorhanden
    const requirementsText = job.requirements || '';
    // Aufsplitten in Array, wenn es Zeilenumbrüche oder Bulletpoints gibt
    const requirementsArray = requirementsText
      .split(/[\n\r•·]+/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
    
    // Anforderungen als strukturierte Daten
    const requirements = requirementsArray.map(r => ({ 
      type: 'text', 
      value: r 
    }));
    
    // Qualifikationen - da wir kein direktes Feld haben, nutzen wir Requirements
    const qualifications = requirements;
    
    // Basis-Format für die API
    return {
      reference,
      title: job.title,
      description,
      company: {
        name: job.company,
        description: job.company_description || '',
        website: '', // Keine direkte Zuordnung in unserem Job-Modell
        logo_url: '' // Keine direkte Zuordnung in unserem Job-Modell
      },
      location: {
        city,
        zip,
        country: 'DE', // Standard
        street: '',
        street_number: ''
      },
      employment_type: this.mapEmploymentType(job.job_type),
      working_hours: this.mapWorkingHours(job.job_type),
      // Gehalt parsen, wenn im Format "€30.000 - €45.000" oder ähnlich
      salary: this.parseSalaryRange(job.salary_range),
      start_date: 'immediate',
      application_url: '',
      contact: undefined, // Keine direkten Kontaktdaten im Job-Modell
      qualifications,
      requirements,
      benefits: job.benefits || '',
      keywords: job.keywords ? job.keywords.split(',').map(k => k.trim()) : [],
      // Metadaten
      metadata: {
        source: 'HeiBa Recruitment',
        internal_id: job.id,
        language: 'de'
      }
    };
  }
  
  /**
   * Parst einen Gehaltsbereich aus einem String
   * @param salaryRange Gehaltsbereich als String, z.B. "€30.000 - €45.000"
   * @returns Strukturiertes Gehaltsobjekt oder undefined
   */
  private parseSalaryRange(salaryRange?: string): any {
    if (!salaryRange) return undefined;
    
    // Versuche, Zahlenwerte zu extrahieren
    const numbers = salaryRange.match(/\d+(?:[.,]\d+)*/g);
    
    if (numbers && numbers.length >= 2) {
      const min = parseInt(numbers[0].replace(/[.,]/g, ''));
      const max = parseInt(numbers[1].replace(/[.,]/g, ''));
      
      return {
        min,
        max,
        currency: salaryRange.includes('€') ? 'EUR' : 'EUR',
        period: 'yearly'
      };
    } else if (numbers && numbers.length === 1) {
      const value = parseInt(numbers[0].replace(/[.,]/g, ''));
      
      return {
        min: value,
        max: value,
        currency: salaryRange.includes('€') ? 'EUR' : 'EUR',
        period: 'yearly'
      };
    }
    
    return undefined;
  }
  
  /**
   * Mappt den Beschäftigungstyp auf das von der API erwartete Format
   * @param employmentType Beschäftigungstyp
   * @returns Beschäftigungstyp im API-Format
   */
  private mapEmploymentType(employmentType?: string): string {
    if (!employmentType) return 'full_time';
    
    switch (employmentType.toLowerCase()) {
      case 'vollzeit':
      case 'full-time':
      case 'full_time':
        return 'full_time';
      case 'teilzeit':
      case 'part-time':
      case 'part_time':
        return 'part_time';
      case 'befristet':
      case 'temporary':
        return 'temporary';
      case 'freiberuflich':
      case 'freelance':
        return 'freelance';
      case 'praktikum':
      case 'internship':
        return 'internship';
      case 'ausbildung':
      case 'apprenticeship':
        return 'apprenticeship';
      default:
        return 'full_time';
    }
  }
  
  /**
   * Mappt die Arbeitszeiten auf das von der API erwartete Format
   * @param workingHours Arbeitszeiten
   * @returns Arbeitszeiten im API-Format
   */
  private mapWorkingHours(workingHours?: string): any {
    if (!workingHours) return { type: 'full_time', hours_per_week: 40 };
    
    // Versuche, die Stundenanzahl aus dem String zu extrahieren
    const hoursMatch = workingHours.match(/\d+/);
    const hours = hoursMatch ? parseInt(hoursMatch[0]) : null;
    
    if (workingHours.toLowerCase().includes('teilzeit') || 
        workingHours.toLowerCase().includes('part')) {
      return {
        type: 'part_time',
        hours_per_week: hours || 20
      };
    } else if (workingHours.toLowerCase().includes('vollzeit') || 
               workingHours.toLowerCase().includes('full')) {
      return {
        type: 'full_time',
        hours_per_week: hours || 40
      };
    } else if (workingHours.toLowerCase().includes('flex')) {
      return {
        type: 'flexible',
        hours_per_week: hours || 30
      };
    } else {
      return {
        type: 'full_time',
        hours_per_week: hours || 40
      };
    }
  }
}
