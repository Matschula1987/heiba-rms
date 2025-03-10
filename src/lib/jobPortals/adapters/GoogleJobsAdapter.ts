import { Job, PostingStatus } from '@/types/jobs';
import { BaseJobPortalAdapter } from '../BaseAdapter';
import { PublishResult, JobPortalConfig } from '../types';

/**
 * Adapter für die Integration mit Google for Jobs
 * Google for Jobs verwendet strukturierte Daten, die in die Website eingebettet werden müssen
 */
export class GoogleJobsAdapter extends BaseJobPortalAdapter {
  public name = 'Google for Jobs';
  public key = 'google_jobs';
  public icon = 'google-jobs-logo.png'; // Sollte im public-Verzeichnis abgelegt werden
  public isFree = true;
  public requiresAuth = false;
  public configInstructions = `
    Google for Jobs benötigt keine API-Anmeldung. Stattdessen müssen Sie Schema.org-JobPosting 
    strukturierte Daten in Ihre Stellenseiten einbetten. Diese werden dann von Google indexiert.
    Besuchen Sie https://developers.google.com/search/docs/data-types/job-posting für mehr Informationen.
  `;

  /**
   * Überprüft, ob der Adapter konfiguriert ist
   * @param config Konfigurationsobjekt
   * @returns true, wenn der Adapter konfiguriert ist
   */
  public isConfigured(config?: JobPortalConfig): boolean {
    // Google for Jobs benötigt keine spezielle Konfiguration
    return true;
  }

  /**
   * Veröffentlichen einer Stelle auf Google for Jobs
   * @param job Job-Objekt
   * @param config Konfigurationsobjekt (optional)
   */
  public async publishJob(job: Job, config?: JobPortalConfig): Promise<PublishResult> {
    try {
      // Google for Jobs verwendet keine API zum Veröffentlichen
      // Stattdessen generieren wir das Schema.org JSON-LD-Markup, das in die Website eingebettet werden muss
      const jsonLD = this.createJsonLdMarkup(job);
      
      // In einer echten Implementierung würde dieses Markup in die Stellenseite eingebettet werden
      console.log('Google for Jobs JSON-LD Markup:', jsonLD);
      
      // Da Google for Jobs nicht wirklich eine API zum Veröffentlichen hat, simulieren wir eine erfolgreiche Veröffentlichung
      const mockPlatformId = `google-${job.id}-${Date.now()}`;
      const mockUrl = `https://www.example.com/jobs/${job.id}`;
      
      return this.createSuccessResult(
        mockPlatformId,
        mockUrl,
        { jsonLD }
      );
    } catch (error) {
      return this.createErrorResult(
        `Fehler bei der Erstellung des Google for Jobs Markups: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Aktualisieren einer bereits veröffentlichten Stelle
   * @param job Job-Objekt
   * @param externalId ID der Stelle (in diesem Fall nicht relevant)
   * @param config Konfigurationsobjekt (optional)
   */
  public async updateJob(job: Job, externalId: string, config?: JobPortalConfig): Promise<PublishResult> {
    // Google for Jobs hat keine API zur Aktualisierung
    // Stattdessen wird einfach das aktualisierte Markup auf der Website bereitgestellt
    return this.publishJob(job, config);
  }

  /**
   * Löschen einer Stelle von Google for Jobs
   * @param externalId ID der Stelle (in diesem Fall nicht relevant)
   * @param config Konfigurationsobjekt (optional)
   */
  public async deleteJob(externalId: string, config?: JobPortalConfig): Promise<boolean> {
    try {
      // Google for Jobs hat keine API zum Löschen
      // In einer realen Implementierung würde die Seite entfernt oder ein noindex-Tag hinzugefügt werden
      console.log(`Für Google for Jobs: Entfernen Sie die Seite oder fügen Sie ein noindex-Tag hinzu.`);
      
      // Simuliere erfolgreiche Löschung
      return true;
    } catch (error) {
      console.error(`Fehler beim Löschen der Stelle für Google for Jobs: ${error}`);
      return false;
    }
  }

  /**
   * Status einer Veröffentlichung auf Google for Jobs prüfen
   * @param externalId ID der Stelle (in diesem Fall nicht relevant)
   * @param config Konfigurationsobjekt (optional)
   */
  public async checkStatus(externalId: string, config?: JobPortalConfig): Promise<PostingStatus> {
    try {
      // Google for Jobs hat keine API zum Prüfen des Status
      // In einer realen Implementierung könnte die Google Search Console verwendet werden
      // Für unser Beispiel nehmen wir an, dass die Stelle veröffentlicht ist
      return 'published';
    } catch (error) {
      console.error(`Fehler beim Prüfen des Status für Google for Jobs: ${error}`);
      return 'error';
    }
  }

  /**
   * Erstellt JSON-LD-Markup im Schema.org-Format für Google for Jobs
   * @param job Job-Objekt
   * @returns JSON-LD-Markup als String
   */
  private createJsonLdMarkup(job: Job): string {
    // Vorbereiten der Datumsangaben
    const datePosted = new Date().toISOString();
    const validThrough = job.publication_end_date 
      ? new Date(job.publication_end_date).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 Tage in der Zukunft
    
    // Formatieren des Gehalts, falls vorhanden
    let salaryPart = '';
    if (job.salary_range) {
      const salaryMatch = job.salary_range.match(/(\d+)(?:\.(\d+))?(?:\s*-\s*)?(\d+)?(?:\.(\d+))?/);
      if (salaryMatch && salaryMatch[1]) {
        const minSalary = parseInt(salaryMatch[1]);
        const maxSalary = salaryMatch[3] ? parseInt(salaryMatch[3]) : minSalary;
        
        salaryPart = `
        "baseSalary": {
          "@type": "MonetaryAmount",
          "currency": "EUR",
          "value": {
            "@type": "QuantitativeValue",
            "minValue": ${minSalary},
            "maxValue": ${maxSalary},
            "unitText": "YEAR"
          }
        },`;
      }
    }
    
    // Erstellen des JSON-LD-Markups
    return `<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "JobPosting",
  "title": "${job.title}",
  "description": "${this.formatDescription(job).replace(/"/g, '\\"')}",
  "datePosted": "${datePosted}",
  "validThrough": "${validThrough}",
  "employmentType": "${this.mapEmploymentType(job.job_type)}",
  "hiringOrganization": {
    "@type": "Organization",
    "name": "${job.company}",
    "sameAs": "https://www.example.com"
  },
  "jobLocation": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "",
      "addressLocality": "${job.location.split(',')[0].trim()}",
      "addressRegion": "${job.location.split(',')[1]?.trim() || ''}",
      "postalCode": "",
      "addressCountry": "DE"
    }
  },${salaryPart}
  "identifier": {
    "@type": "PropertyValue",
    "name": "${job.company}",
    "value": "${job.external_job_id || job.id}"
  }
}
</script>`;
  }

  /**
   * Übersetzt den Job-Typ in das Schema.org-Format
   * @param jobType Job-Typ aus dem HeiBa-System
   * @returns Schema.org-konformer Job-Typ
   */
  private mapEmploymentType(jobType: string): string {
    const typeMap: Record<string, string> = {
      'Vollzeit': 'FULL_TIME',
      'Teilzeit': 'PART_TIME',
      'Freelance': 'CONTRACTOR',
      'Werkstudent': 'PART_TIME',
      'Praktikum': 'INTERN',
      'Ausbildung': 'FULL_TIME',
      'Remote': 'FULL_TIME', // Remote ist eigentlich kein Employment Type, aber wir verwenden hier Vollzeit als Default
      'Hybrid': 'FULL_TIME', // Hybrid ist eigentlich kein Employment Type, aber wir verwenden hier Vollzeit als Default
    };
    
    return typeMap[jobType] || 'OTHER';
  }
}
