import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { Job } from '@/types/jobs';
import { 
  MovidoJobPosting, 
  MovidoPostingResult, 
  MovidoPortalStatus
} from '@/types/movidoAutomation';
import { MovidoValidationService, ValidatorResult } from '../MovidoValidationService';

/**
 * Modul für die Job-Veröffentlichungen in Movido
 * Erstellt und verwaltet Stellenanzeigen
 */
export class MovidoJobPostingModule {
  private readonly apiBaseUrl = 'https://api.movido.com/v2';
  private readonly validationService = new MovidoValidationService();

  /**
   * Erzeugt eine Movido-Stellenanzeige aus einem Job-Objekt
   * @param job Job-Objekt aus dem Heiba RMS
   * @param companyId Unternehmens-ID bei Movido
   * @param targetPortals Array mit Zielportalen
   * @param premium Flag für Premium-Anzeigen
   * @returns Movido-Stellenanzeigenobjekt
   */
  public createMovidoJobPosting(
    job: Job,
    companyId: string,
    targetPortals: string[] = [],
    premium: boolean = false
  ): MovidoJobPosting {
    // Formatiere die Beschreibung für Movido (behält HTML-Tags bei)
    const description = job.rich_description || job.description;
    
    // Aufteilen des Standorts in Stadt, Region, Land
    const locationParts = job.location.split(',').map(part => part.trim());
    const city = locationParts[0] || '';
    const region = locationParts[1] || '';
    const country = locationParts[2] || 'DE';
    
    // Berechne Enddatum (30 Tage ab jetzt)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    
    // Erstelle Job-Daten im Movido-Format
    return {
      id: '',  // Wird von Movido beim Erstellen gesetzt
      reference: job.external_job_id || job.id,
      title: job.title,
      description: description,
      company: {
        id: companyId,
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
        premium: premium,
        startDate: new Date().toISOString(),
        endDate: endDate.toISOString(),
        targetPortals: targetPortals.length > 0 ? targetPortals : this.getDefaultTargetPortals()
      },
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
  
  /**
   * Gibt die Standard-Zielportale zurück
   * @returns Array mit Standard-Zielportalen
   */
  private getDefaultTargetPortals(): string[] {
    return ['stepstone', 'indeed', 'monster', 'xing', 'linkedin'];
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
   * Validiert und korrigiert ein Stellenanzeigenobjekt für Movido
   * @param jobPosting Ursprüngliches Stellenanzeigenobjekt
   * @param originalJob Original-Job (optional)
   * @returns Validiertes und korrigiertes Stellenanzeigenobjekt
   * @throws Error wenn kritische Fehler gefunden wurden
   */
  public validateAndCorrectPosting(jobPosting: MovidoJobPosting, originalJob?: Job): MovidoJobPosting {
    // Validiere das Posting
    const validationResult = this.validationService.validateJobPosting(jobPosting);
    
    // Log-Warnung für jedes Feld mit Warnungen
    validationResult.warningFields.forEach(warning => {
      console.warn(`[Movido] Warnung für Feld ${warning.fieldName}: ${warning.warningMessage}`);
    });
    
    // Wenn nicht gültig, korrigiere die Daten
    if (!validationResult.isValid) {
      // Log-Infos über fehlende Pflichtfelder
      validationResult.missingFields.forEach(missing => {
        console.info(`[Movido] Fehlender Wert für ${missing.fieldName} (${missing.fieldPath}) - wird automatisch ergänzt`);
      });
      
      // Korrigiere das Posting
      const correctedPosting = this.validationService.autoCorrectJobPosting(jobPosting, originalJob);
      
      // Überprüfe, ob die kritischen Felder nun vorhanden sind
      const criticalMissingFields = validationResult.missingFields.filter(f => f.severity === 'critical');
      
      // Erneute Validierung nach Korrektur
      const revalidationResult = this.validationService.validateJobPosting(correctedPosting);
      
      if (!revalidationResult.isValid) {
        const stillMissingCritical = revalidationResult.missingFields.filter(f => f.severity === 'critical');
        
        if (stillMissingCritical.length > 0) {
          const missingFieldNames = stillMissingCritical.map(f => f.fieldName).join(', ');
          throw new Error(`Kritische Pflichtfelder konnten nicht automatisch ergänzt werden: ${missingFieldNames}`);
        }
      }
      
      return correctedPosting;
    }
    
    // Wenn bereits gültig, gib das Original zurück
    return jobPosting;
  }

  /**
   * Veröffentlicht eine Stellenanzeige über Movido
   * @param jobPosting Movido-Stellenanzeigenobjekt
   * @param authToken Authentifizierungs-Token
   * @param originalJob Original-Job (optional)
   * @returns Ergebnis der Veröffentlichung
   */
  public async publishJob(jobPosting: MovidoJobPosting, authToken: string, originalJob?: Job): Promise<MovidoPostingResult> {
    try {
      // Validiere und korrigiere die Stellenanzeige vor dem Veröffentlichen
      const validatedPosting = this.validateAndCorrectPosting(jobPosting, originalJob);
      
      // In einer realen Implementierung würde hier die Movido-API aufgerufen werden
      // Für Demozwecke simulieren wir eine erfolgreiche Antwort
      
      // Simulierter API-Aufruf
      // const response = await axios.post(
      //   `${this.apiBaseUrl}/jobs`,
      //   validatedPosting,
      //   {
      //     headers: {
      //       'Authorization': `Bearer ${authToken}`,
      //       'Content-Type': 'application/json'
      //     }
      //   }
      // );
      
      // Simuliere API-Antwort
      const movidoId = `movido-${jobPosting.reference}-${Date.now()}`;
      
      // Speichere die Veröffentlichung in der Datenbank
      await this.saveJobPosting(jobPosting.reference, movidoId);
      
      // Erstelle Portal-Status-Einträge
      const portalStatuses = jobPosting.settings.targetPortals.map(portal => this.createPortalStatus(portal));
      
      return {
        jobId: jobPosting.reference,
        movidoId: movidoId,
        status: 'published',
        portalStatuses: portalStatuses,
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Fehler bei der Veröffentlichung über Movido:', error);
      throw new Error('Fehler bei der Veröffentlichung der Stellenanzeige über Movido');
    }
  }
  
  /**
   * Erstellt einen Portal-Status-Eintrag
   * @param portal Name des Portals
   * @returns Portal-Status-Objekt
   */
  private createPortalStatus(portal: string): MovidoPortalStatus {
    return {
      portal: portal,
      status: 'pending',
      externalId: `${portal}-${Date.now()}`,
      postedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
  
  /**
   * Speichert eine Veröffentlichung in der Datenbank
   * @param jobId Job-ID
   * @param movidoId Movido-ID
   */
  private async saveJobPosting(jobId: string, movidoId: string): Promise<void> {
    const db = await getDb();
    const id = uuidv4();
    
    try {
      await db.run(
        'INSERT INTO job_postings (id, job_id, platform, platform_job_id, posting_url, status, publication_date, auto_republish, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          id,
          jobId,
          'movido',
          movidoId,
          `https://app.movido.com/jobs/${movidoId}`,
          'published',
          new Date().toISOString(),
          true,
          new Date().toISOString(),
          new Date().toISOString()
        ]
      );
    } catch (error) {
      console.error('Fehler beim Speichern der Veröffentlichung:', error);
      throw error;
    }
  }
  
  /**
   * Aktualisiert eine Stellenanzeige in Movido
   * @param jobPosting Aktualisiertes Movido-Stellenanzeigenobjekt
   * @param movidoId Movido-ID der Stellenanzeige
   * @param authToken Authentifizierungs-Token
   * @param originalJob Original-Job (optional)
   * @returns Ergebnis der Aktualisierung
   */
  public async updateJob(jobPosting: MovidoJobPosting, movidoId: string, authToken: string, originalJob?: Job): Promise<MovidoPostingResult> {
    try {
      // Validiere und korrigiere die Stellenanzeige vor der Aktualisierung
      const validatedPosting = this.validateAndCorrectPosting(jobPosting, originalJob);
      
      // In einer realen Implementierung würde hier die Movido-API aufgerufen werden
      // Für Demozwecke simulieren wir eine erfolgreiche Antwort
      
      // Simulierter API-Aufruf
      // const response = await axios.put(
      //   `${this.apiBaseUrl}/jobs/${movidoId}`,
      //   validatedPosting,
      //   {
      //     headers: {
      //       'Authorization': `Bearer ${authToken}`,
      //       'Content-Type': 'application/json'
      //     }
      //   }
      // );
      
      // Aktualisiere die Veröffentlichung in der Datenbank
      await this.updateJobPostingStatus(jobPosting.reference, movidoId, 'updated');
      
      // Erstelle Portal-Status-Einträge
      const portalStatuses = jobPosting.settings.targetPortals.map(portal => this.createPortalStatus(portal));
      
      return {
        jobId: jobPosting.reference,
        movidoId: movidoId,
        status: 'updated',
        portalStatuses: portalStatuses,
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Fehler bei der Aktualisierung über Movido:', error);
      throw new Error('Fehler bei der Aktualisierung der Stellenanzeige über Movido');
    }
  }
  
  /**
   * Aktualisiert den Status einer Veröffentlichung in der Datenbank
   * @param jobId Job-ID
   * @param movidoId Movido-ID
   * @param status Neuer Status
   */
  private async updateJobPostingStatus(jobId: string, movidoId: string, status: string): Promise<void> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    try {
      await db.run(
        'UPDATE job_postings SET status = ?, updated_at = ? WHERE job_id = ? AND platform_job_id = ? AND platform = ?',
        [status, now, jobId, movidoId, 'movido']
      );
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Veröffentlichungs-Status:', error);
      throw error;
    }
  }
  
  /**
   * Löscht eine Stellenanzeige von Movido
   * @param movidoId Movido-ID der Stellenanzeige
   * @param jobId Job-ID
   * @param authToken Authentifizierungs-Token
   * @returns true, wenn erfolgreich
   */
  public async deleteJob(movidoId: string, jobId: string, authToken: string): Promise<boolean> {
    try {
      // In einer realen Implementierung würde hier die Movido-API aufgerufen werden
      // Simulierter API-Aufruf
      // await axios.delete(
      //   `${this.apiBaseUrl}/jobs/${movidoId}`,
      //   {
      //     headers: {
      //       'Authorization': `Bearer ${authToken}`
      //     }
      //   }
      // );
      
      // Aktualisiere die Veröffentlichung in der Datenbank
      await this.updateJobPostingStatus(jobId, movidoId, 'deleted');
      
      return true;
    } catch (error) {
      console.error('Fehler beim Löschen der Stellenanzeige über Movido:', error);
      return false;
    }
  }
  
  /**
   * Holt den aktuellen Status einer Stellenanzeige von Movido
   * @param movidoId Movido-ID der Stellenanzeige
   * @param authToken Authentifizierungs-Token
   * @returns Status-Informationen
   */
  public async getJobStatus(movidoId: string, authToken: string): Promise<MovidoPostingResult | null> {
    try {
      // In einer realen Implementierung würde hier die Movido-API aufgerufen werden
      // Simulierter API-Aufruf
      // const response = await axios.get(
      //   `${this.apiBaseUrl}/jobs/${movidoId}/status`,
      //   {
      //     headers: {
      //       'Authorization': `Bearer ${authToken}`
      //     }
      //   }
      // );
      
      // Simuliere API-Antwort
      const db = await getDb();
      
      // Hole Job-ID aus der Datenbank
      const jobPosting = await db.get(
        'SELECT job_id FROM job_postings WHERE platform_job_id = ? AND platform = ?',
        [movidoId, 'movido']
      );
      
      if (!jobPosting) return null;
      
      // Erstelle Portal-Status-Einträge
      const portalStatuses = this.getDefaultTargetPortals().map(portal => ({
        portal: portal,
        status: 'published',
        externalId: `${portal}-12345`,
        postedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      
      return {
        jobId: jobPosting.job_id,
        movidoId: movidoId,
        status: 'published',
        portalStatuses: portalStatuses,
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Fehler beim Abrufen des Status über Movido:', error);
      return null;
    }
  }
  
  /**
   * Ruft aktive Veröffentlichungen von Movido ab
   * @param authToken Authentifizierungs-Token
   * @param companyId Unternehmens-ID
   * @returns Array mit aktiven Veröffentlichungen
   */
  public async getActivePostings(authToken: string, companyId: string): Promise<MovidoPostingResult[]> {
    try {
      // In einer realen Implementierung würde hier die Movido-API aufgerufen werden
      // Simulierter API-Aufruf
      // const response = await axios.get(
      //   `${this.apiBaseUrl}/companies/${companyId}/jobs`,
      //   {
      //     headers: {
      //       'Authorization': `Bearer ${authToken}`
      //     }
      //   }
      // );
      
      // Simuliere API-Antwort
      const db = await getDb();
      
      // Hole aktive Job-Postings aus der Datenbank
      const jobPostings = await db.all(
        'SELECT job_id, platform_job_id FROM job_postings WHERE platform = ? AND status = ?',
        ['movido', 'published']
      );
      
      // Erstelle Ergebnisobjekte
      return jobPostings.map((posting: { job_id: string; platform_job_id: string }) => {
        // Erstelle Portal-Status-Einträge
        const portalStatuses = this.getDefaultTargetPortals().map(portal => ({
          portal: portal,
          status: 'published',
          externalId: `${portal}-12345`,
          postedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
        
        return {
          jobId: posting.job_id,
          movidoId: posting.platform_job_id,
          status: 'published',
          portalStatuses: portalStatuses,
          createdAt: new Date().toISOString()
        };
      });
    } catch (error) {
      console.error('Fehler beim Abrufen der aktiven Veröffentlichungen von Movido:', error);
      return [];
    }
  }
}
