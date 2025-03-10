import { Job } from '@/types/jobs';
import { MovidoJobPosting } from '@/types/movidoAutomation';

/**
 * Ergebnis der Validierung eines Movido-Stellenanzeigenobjekts
 */
export interface ValidatorResult {
  isValid: boolean;
  missingFields: MissingField[];
  warningFields: WarningField[];
}

/**
 * Information über ein fehlendes Pflichtfeld
 */
export interface MissingField {
  fieldPath: string;
  fieldName: string;
  severity: 'critical' | 'normal';
}

/**
 * Information über ein Feld mit Warnungen
 */
export interface WarningField {
  fieldPath: string;
  fieldName: string;
  warningMessage: string;
}

/**
 * Service zur Validierung und Korrektur von Movido-Stellenanzeigen
 * Stellt sicher, dass alle Pflichtfelder korrekt ausgefüllt sind
 */
export class MovidoValidationService {
  /**
   * Movido-Pflichtfelder und deren Beschreibungen
   * Der Boolean-Wert gibt an, ob das Feld kritisch ist (true) oder normal (false)
   */
  private readonly requiredFields: Record<string, [string, boolean]> = {
    'title': ['Titel der Stellenanzeige', true],
    'description': ['Beschreibung der Stelle', true],
    'company.id': ['Unternehmens-ID', true],
    'company.name': ['Unternehmensname', true],
    'location.city': ['Stadt', true],
    'location.country': ['Land', true],
    'details.jobType': ['Beschäftigungsart', true],
    'application.url': ['Bewerbungs-URL', false],
    'settings.startDate': ['Startdatum', true],
    'settings.endDate': ['Enddatum', true],
    'settings.targetPortals': ['Zielportale', true]
  };

  /**
   * Validiert ein Movido-Stellenanzeigenobjekt auf Vollständigkeit
   * @param jobPosting Movido-Stellenanzeigenobjekt
   * @returns Validierungsergebnis mit Liste fehlender Pflichtfelder
   */
  public validateJobPosting(jobPosting: MovidoJobPosting): ValidatorResult {
    const result: ValidatorResult = {
      isValid: true,
      missingFields: [],
      warningFields: []
    };

    // Prüfe alle Pflichtfelder
    for (const [fieldPath, [fieldName, isCritical]] of Object.entries(this.requiredFields)) {
      const fieldValue = this.getNestedProperty(jobPosting, fieldPath);
      
      // Prüfe, ob das Feld existiert und nicht leer ist
      if (fieldValue === undefined || fieldValue === null || fieldValue === '' || 
         (Array.isArray(fieldValue) && fieldValue.length === 0)) {
        result.isValid = false;
        result.missingFields.push({
          fieldPath,
          fieldName,
          severity: isCritical ? 'critical' : 'normal'
        });
      }
    }

    // Zusätzliche Validierungen
    this.validateDescription(jobPosting, result);
    this.validateLocation(jobPosting, result);
    this.validateJobType(jobPosting, result);
    this.validateDates(jobPosting, result);

    return result;
  }

  /**
   * Füllt fehlende Pflichtfelder automatisch aus
   * @param jobPosting Ursprüngliches Stellenanzeigenobjekt
   * @param originalJob Originales Job-Objekt (optional, für bessere Ableitungen)
   * @returns Korrigiertes Stellenanzeigenobjekt
   */
  public autoCorrectJobPosting(jobPosting: MovidoJobPosting, originalJob?: Job): MovidoJobPosting {
    // Erstelle eine tiefe Kopie des Stellenanzeigenobjekts
    const correctedPosting: MovidoJobPosting = JSON.parse(JSON.stringify(jobPosting));

    // Titel korrigieren falls leer
    if (!correctedPosting.title && originalJob?.title) {
      correctedPosting.title = originalJob.title;
    } else if (!correctedPosting.title) {
      correctedPosting.title = 'Stellenanzeige'; // Fallback
    }

    // Beschreibung korrigieren
    if (!correctedPosting.description && originalJob?.description) {
      correctedPosting.description = originalJob.description;
      // Stelle sicher, dass die Beschreibung HTML-Tags enthält
      if (!this.containsHtmlTags(correctedPosting.description)) {
        correctedPosting.description = this.convertToHtml(correctedPosting.description);
      }
    } else if (!correctedPosting.description) {
      correctedPosting.description = '<p>Detaillierte Stellenbeschreibung folgt.</p>';
    }

    // Unternehmensname korrigieren
    if (!correctedPosting.company.name && originalJob?.company) {
      correctedPosting.company.name = originalJob.company;
    } else if (!correctedPosting.company.name) {
      correctedPosting.company.name = 'Unser Unternehmen';
    }

    // Standort korrigieren
    if (!correctedPosting.location.city && originalJob?.location) {
      const locationParts = originalJob.location.split(',').map(part => part.trim());
      correctedPosting.location.city = locationParts[0] || 'Berlin';
      correctedPosting.location.region = locationParts[1] || '';
      correctedPosting.location.country = locationParts[2] || 'DE';
    } else if (!correctedPosting.location.city) {
      correctedPosting.location.city = 'Berlin'; // Standard-Stadt
      correctedPosting.location.country = 'DE'; // Standard-Land
    }

    // JobType korrigieren
    if (!correctedPosting.details.jobType && originalJob?.job_type) {
      correctedPosting.details.jobType = this.mapJobType(originalJob.job_type);
    } else if (!correctedPosting.details.jobType) {
      correctedPosting.details.jobType = 'FULL_TIME'; // Standard-Jobtyp
    }

    // Bewerbungs-URL korrigieren
    if (!correctedPosting.application.url && originalJob?.id) {
      correctedPosting.application.url = `https://example.com/jobs/${originalJob.id}/apply`;
    } else if (!correctedPosting.application.url) {
      correctedPosting.application.url = 'https://example.com/jobs/apply';
    }

    // Daten korrigieren
    const now = new Date();
    if (!correctedPosting.settings.startDate) {
      correctedPosting.settings.startDate = now.toISOString();
    }
    
    if (!correctedPosting.settings.endDate) {
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 30); // 30 Tage Laufzeit
      correctedPosting.settings.endDate = endDate.toISOString();
    }

    // Zielportale korrigieren
    if (!correctedPosting.settings.targetPortals || correctedPosting.settings.targetPortals.length === 0) {
      correctedPosting.settings.targetPortals = this.getDefaultTargetPortals();
    }

    // Weitere Felder befüllen oder korrigieren
    this.enhanceJobDetails(correctedPosting, originalJob);

    return correctedPosting;
  }

  /**
   * Verbessert die Job-Details mit zusätzlichen Informationen
   * @param correctedPosting Das zu verbessernde Posting
   * @param originalJob Das originale Job-Objekt
   */
  private enhanceJobDetails(correctedPosting: MovidoJobPosting, originalJob?: Job): void {
    // Verantwortlichkeiten und Qualifikationen
    if (!correctedPosting.details.responsibilities && originalJob?.requirements) {
      correctedPosting.details.responsibilities = originalJob.requirements;
    }
    
    if (!correctedPosting.details.qualifications && originalJob?.requirements) {
      correctedPosting.details.qualifications = originalJob.requirements;
    }
    
    // Gehalt und Benefits
    if (!correctedPosting.compensation) {
      correctedPosting.compensation = {
        salary: originalJob?.salary_range || '',
        benefits: originalJob?.benefits || ''
      };
    } else {
      if (!correctedPosting.compensation.salary && originalJob?.salary_range) {
        correctedPosting.compensation.salary = originalJob.salary_range;
      }
      
      if (!correctedPosting.compensation.benefits && originalJob?.benefits) {
        correctedPosting.compensation.benefits = originalJob.benefits;
      }
    }
    
    // Branche/Abteilung
    if (!correctedPosting.details.industry && originalJob?.department) {
      correctedPosting.details.industry = originalJob.department;
    }
    
    // Erfahrungslevel basierend auf den Anforderungen ableiten
    if (!correctedPosting.details.experienceLevel && originalJob?.requirements) {
      correctedPosting.details.experienceLevel = this.deriveExperienceLevel(originalJob.requirements);
    }
  }

  /**
   * Validiert die Beschreibung einer Stellenanzeige
   */
  private validateDescription(jobPosting: MovidoJobPosting, result: ValidatorResult): void {
    // Prüfe, ob die Beschreibung HTML-Tags enthält
    if (jobPosting.description && !this.containsHtmlTags(jobPosting.description)) {
      result.warningFields.push({
        fieldPath: 'description',
        fieldName: 'Beschreibung',
        warningMessage: 'Die Beschreibung enthält keine HTML-Tags. Movido erwartet eine HTML-formatierte Beschreibung.'
      });
    }
    
    // Prüfe Mindestlänge
    if (jobPosting.description && jobPosting.description.length < 100) {
      result.warningFields.push({
        fieldPath: 'description',
        fieldName: 'Beschreibung',
        warningMessage: 'Die Beschreibung ist sehr kurz. Eine ausführlichere Beschreibung verbessert die Qualität der Anzeige.'
      });
    }
  }

  /**
   * Validiert die Standortinformationen
   */
  private validateLocation(jobPosting: MovidoJobPosting, result: ValidatorResult): void {
    // Prüfe Länderkürzel
    if (jobPosting.location.country && jobPosting.location.country.length !== 2) {
      result.warningFields.push({
        fieldPath: 'location.country',
        fieldName: 'Land',
        warningMessage: 'Das Länderkürzel sollte im ISO-3166-1 Alpha-2 Format sein (z.B. DE für Deutschland).'
      });
    }
  }

  /**
   * Validiert den Job-Typ
   */
  private validateJobType(jobPosting: MovidoJobPosting, result: ValidatorResult): void {
    const validJobTypes = [
      'FULL_TIME', 'PART_TIME', 'FIXED_TERM', 'INTERNSHIP', 
      'APPRENTICESHIP', 'WORKING_STUDENT', 'FREELANCE'
    ];
    
    if (jobPosting.details.jobType && !validJobTypes.includes(jobPosting.details.jobType)) {
      result.warningFields.push({
        fieldPath: 'details.jobType',
        fieldName: 'Beschäftigungsart',
        warningMessage: `Ungültiger Job-Typ. Gültige Werte sind: ${validJobTypes.join(', ')}`
      });
    }
  }

  /**
   * Validiert Start- und Enddatum
   */
  private validateDates(jobPosting: MovidoJobPosting, result: ValidatorResult): void {
    if (jobPosting.settings.startDate && jobPosting.settings.endDate) {
      const startDate = new Date(jobPosting.settings.startDate);
      const endDate = new Date(jobPosting.settings.endDate);
      
      // Prüfe, ob das Enddatum nach dem Startdatum liegt
      if (endDate <= startDate) {
        result.warningFields.push({
          fieldPath: 'settings.endDate',
          fieldName: 'Enddatum',
          warningMessage: 'Das Enddatum muss nach dem Startdatum liegen.'
        });
      }
      
      // Prüfe Mindestlaufzeit (empfohlen: mindestens 14 Tage)
      const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 14) {
        result.warningFields.push({
          fieldPath: 'settings.endDate',
          fieldName: 'Enddatum',
          warningMessage: 'Die Laufzeit der Anzeige ist sehr kurz. Empfohlen sind mindestens 14 Tage.'
        });
      }
    }
  }

  /**
   * Prüft, ob ein String HTML-Tags enthält
   */
  private containsHtmlTags(text: string): boolean {
    return /<\/?[a-z][\s\S]*>/i.test(text);
  }

  /**
   * Konvertiert Plaintext in einfaches HTML
   */
  private convertToHtml(text: string): string {
    // Ersetze Zeilenumbrüche durch <br> oder <p>-Tags
    const paragraphs = text.split(/\n\s*\n/);
    return paragraphs.map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
  }

  /**
   * Mappt den Job-Typ auf Movido-Werte
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
   * Leitet das Erfahrungslevel aus den Anforderungen ab
   */
  private deriveExperienceLevel(requirements: string): string {
    const lowercaseReqs = requirements.toLowerCase();
    
    if (lowercaseReqs.includes('senior') || 
        lowercaseReqs.includes('führungskraft') || 
        lowercaseReqs.includes('leiter') || 
        lowercaseReqs.includes('5+ jahre')) {
      return 'SENIOR';
    }
    
    if (lowercaseReqs.includes('junior') || 
        lowercaseReqs.includes('berufseinsteiger') || 
        lowercaseReqs.includes('absolventen')) {
      return 'ENTRY_LEVEL';
    }
    
    if (lowercaseReqs.includes('2-5 jahre') || 
        lowercaseReqs.includes('berufserfahrung') || 
        lowercaseReqs.includes('erfahrung')) {
      return 'MID_LEVEL';
    }
    
    return 'MID_LEVEL'; // Standard
  }

  /**
   * Gibt die Standard-Zielportale zurück
   */
  private getDefaultTargetPortals(): string[] {
    return ['stepstone', 'indeed', 'monster', 'xing', 'linkedin'];
  }

  /**
   * Holt einen verschachtelten Eigenschaftswert aus einem Objekt
   * z.B. 'company.name' aus { company: { name: 'xyz' } }
   */
  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((prev, curr) => {
      return prev && prev[curr] !== undefined ? prev[curr] : undefined;
    }, obj);
  }
}
