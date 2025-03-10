import { getDb } from './db';
import { v4 as uuidv4 } from 'uuid';
import { 
  ApplicationExtended, 
  ApplicationMatchData, 
  ApplicationNote,
  CreateApplicationParams, 
  ExtendedApplicationStatus 
} from '@/types/applications';

// Erweiterte Definition zur besseren Kompatibilität
interface MatchResultData {
  score: number;
  details: Record<string, number>;
}

import { 
  createApplication, 
  calculateApplicationMatch, 
  addApplicationNote,
  changeApplicationStatus, 
  convertToCandidate 
} from './applicationService';
import { autoProfileService } from './autoProfileService';
import { notificationService } from './notificationService';
import { AutomaticTaskService } from './tasks/AutomaticTaskService';
import { Task } from '@/types/tasks';
import { EmailService, OutgoingEmail } from './email/EmailService';
import { JobMatcher } from './matcher/JobMatcher';

/**
 * Einstellungen für die automatische Bewerberverarbeitung
 */
export interface AutoApplicationSettings {
  // Matching-Einstellungen
  minMatchScoreForAutoConversion: number;  // Minimaler Score für automatische Konvertierung
  maxMatchScoreForAutoRejection: number;   // Maximaler Score für automatische Absage
  
  // Absage-Einstellungen
  enableAutoRejection: boolean;            // Automatische Absagen aktivieren
  rejectionDelayDays: number;              // Verzögerung in Tagen für Absagen
  rejectionTemplateId?: string;            // ID der E-Mail-Vorlage für Absagen
  
  // E-Mail-Einstellungen
  emailConfigId?: string;                  // ID der E-Mail-Konfiguration
  
  // Benachrichtigungseinstellungen
  notifyTeamOnNewApplication: boolean;     // Team bei neuer Bewerbung benachrichtigen
  notifyTeamOnAutoConversion: boolean;     // Team bei Konvertierung benachrichtigen
  notifyTeamOnAutoRejection: boolean;      // Team bei Absage benachrichtigen
  
  // Talent-Pool-Einstellungen
  autoAddToTalentPool: boolean;            // Automatisch zum Talent-Pool hinzufügen
}

// Standard-Einstellungen
const DEFAULT_SETTINGS: AutoApplicationSettings = {
  minMatchScoreForAutoConversion: 85,     // 85% Match für Auto-Konvertierung
  maxMatchScoreForAutoRejection: 50,      // Unter 50% für Auto-Absage
  enableAutoRejection: true,              // Auto-Absage aktiviert
  rejectionDelayDays: 3,                  // 3 Tage Verzögerung
  notifyTeamOnNewApplication: true,       // Team benachrichtigen
  notifyTeamOnAutoConversion: true,       // Team bei Konvertierung benachrichtigen
  notifyTeamOnAutoRejection: true,        // Team bei Absage benachrichtigen
  autoAddToTalentPool: true               // Zum Talent-Pool hinzufügen
};

/**
 * Service für die automatische Verarbeitung von Bewerbungen
 */
export class AutomaticApplicationService {
  private taskService: AutomaticTaskService;
  private emailService: EmailService;
  private jobMatcher: JobMatcher;
  
  constructor() {
    this.taskService = new AutomaticTaskService();
    this.emailService = new EmailService();
    this.jobMatcher = new JobMatcher();
  }

  /**
   * Ruft die Einstellungen für die automatische Verarbeitung ab
   */
  public async getSettings(): Promise<AutoApplicationSettings> {
    const db = await getDb();
    try {
      // Einstellungen aus der Datenbank abrufen
      const settings = await db.get('SELECT * FROM auto_application_settings LIMIT 1');
      
      // Wenn Einstellungen gefunden wurden, diese zurückgeben
      if (settings) {
        return {
          minMatchScoreForAutoConversion: settings.min_match_score_for_auto_conversion,
          maxMatchScoreForAutoRejection: settings.max_match_score_for_auto_rejection,
          enableAutoRejection: Boolean(settings.enable_auto_rejection),
          rejectionDelayDays: settings.rejection_delay_days,
          rejectionTemplateId: settings.rejection_template_id,
          emailConfigId: settings.email_config_id,
          notifyTeamOnNewApplication: Boolean(settings.notify_team_on_new_application),
          notifyTeamOnAutoConversion: Boolean(settings.notify_team_on_auto_conversion),
          notifyTeamOnAutoRejection: Boolean(settings.notify_team_on_auto_rejection),
          autoAddToTalentPool: Boolean(settings.auto_add_to_talent_pool)
        };
      }
      
      // Wenn keine Einstellungen gefunden wurden, Standard-Einstellungen zurückgeben
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Fehler beim Abrufen der automatischen Anwendungseinstellungen:', error);
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Kombiniert übergebene Einstellungen mit Standard-Einstellungen
   */
  private async getEffectiveSettings(
    settings: Partial<AutoApplicationSettings> = {}
  ): Promise<AutoApplicationSettings> {
    const defaultSettings = await this.getSettings();
    
    return {
      ...defaultSettings,
      ...settings
    };
  }
  
  /**
   * Berechnet das Fälligkeitsdatum für Aufgaben
   */
  private getDueDate(daysFromNow: number): string {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + daysFromNow);
    return dueDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  }
  
  /**
   * Erstellt eine Eintrag in der Aktivitätshistorie für eine Bewerbung
   */
  private async logApplicationActivity(
    applicationId: string,
    title: string,
    description: string,
    createdBy: string
  ): Promise<void> {
    try {
      // Aktivität als Notiz speichern
      await addApplicationNote(
        applicationId,
        createdBy,
        description
      );
    } catch (error) {
      console.error(`Fehler beim Loggen der Aktivität für Bewerbung ${applicationId}:`, error);
    }
  }
  
  /**
   * Benachrichtigt das Team über eine neue Bewerbung
   */
  private async notifyTeamAboutApplication(
    application: ApplicationExtended,
    type: 'new' | 'updated'
  ): Promise<void> {
    try {
      const db = await getDb();
      
      // Job-Informationen abrufen für die Benachrichtigung
      const job = await db.get('SELECT title, company FROM jobs WHERE id = ?', [application.job_id]);
      
      // Passenden Titel und Text auswählen
      let title = '';
      let text = '';
      
      if (type === 'new') {
        title = `Neue Bewerbung von ${application.applicant_name}`;
        text = `Neue Bewerbung für die Position "${job?.title || 'Unbekannt'}" bei ${job?.company || 'Unbekannt'} eingegangen.`;
      } else {
        title = `Bewerbung aktualisiert: ${application.applicant_name}`;
        text = `Die Bewerbung für die Position "${job?.title || 'Unbekannt'}" bei ${job?.company || 'Unbekannt'} wurde aktualisiert.`;
      }
      
      // Benachrichtigung an alle zuständigen Nutzer senden
      await notificationService.createNotification({
        title: title,
        message: text,
        entity_type: 'application',
        entity_id: application.id,
        user_id: application.assigned_to || 'admin',
        sender_id: 'system'
      });
    } catch (error) {
      console.error('Fehler beim Benachrichtigen des Teams über Bewerbung:', error);
    }
  }
  
  /**
   * Benachrichtigt das Team über Aktionen der automatischen Verarbeitung
   */
  private async notifyTeamAboutAction(
    application: ApplicationExtended,
    type: 'auto_conversion' | 'auto_rejection',
    message: string
  ): Promise<void> {
    try {
      // Passenden Titel basierend auf Aktion auswählen
      let title = '';
      
      if (type === 'auto_conversion') {
        title = `Automatische Konvertierung: ${application.applicant_name}`;
      } else {
        title = `Automatische Absage: ${application.applicant_name}`;
      }
      
      // Benachrichtigung an alle zuständigen Nutzer senden
      await notificationService.createNotification({
        title: title,
        message: message,
        entity_type: 'application_automation',
        entity_id: application.id,
        user_id: application.assigned_to || 'admin',
        sender_id: 'system'
      });
    } catch (error) {
      console.error('Fehler beim Benachrichtigen des Teams über automatisierte Aktion:', error);
    }
  }
  
  /**
   * Erstellt eine zusammenfassende Beschreibung des Match-Ergebnisses
   * @returns Die formatierte Zusammenfassung als String
   */
  private getMatchSummary(matchResult: ApplicationMatchData | MatchResultData | any): string {
    if (!matchResult) {
      return 'Kein Matching-Ergebnis verfügbar';
    }
    
    // Verwende den richtigen Feld-Namen basierend auf dem tatsächlichen Format
    const score = matchResult.overallScore || matchResult.score || 0;
    
    // Wenn keine detaillierten Bewertungen vorhanden, nur Gesamtwertung zurückgeben
    if ((!matchResult.categoryScores || Object.keys(matchResult.categoryScores).length === 0) && 
        (!matchResult.details || Object.keys(matchResult.details).length === 0)) {
      return `Gesamtbewertung: ${score}%`;
    }
    
    // Kategorien und deren Scores abrufen
    const details = matchResult.categoryScores || matchResult.details || {};
    
    // Top-3 Stärken identifizieren
    const strengths = Object.entries(details)
      .filter(([_, categoryScore]) => (categoryScore as number) >= 75)
      .sort(([_, scoreA], [__, scoreB]) => (scoreB as number) - (scoreA as number))
      .slice(0, 3);
    
    // Verbesserungspotenziale identifizieren
    const weaknesses = Object.entries(details)
      .filter(([_, categoryScore]) => (categoryScore as number) < 60)
      .sort(([_, scoreA], [__, scoreB]) => (scoreA as number) - (scoreB as number))
      .slice(0, 3);
    
    // Zusammenfassung erstellen
    let summary = '';
    
    if (strengths.length > 0) {
      summary += 'Stärken: ';
      summary += strengths.map(([category, categoryScore]) => 
        `${this.formatCategoryName(category)} (${categoryScore}%)`
      ).join(', ');
    }
    
    if (weaknesses.length > 0) {
      if (summary) summary += '. ';
      summary += 'Verbesserungspotenzial: ';
      summary += weaknesses.map(([category, categoryScore]) => 
        `${this.formatCategoryName(category)} (${categoryScore}%)`
      ).join(', ');
    }
    
    // Fallback für den Fall, dass weder Stärken noch Schwächen gefunden wurden
    if (!summary) {
      summary = `Gesamtbewertung: ${score}%`;
    }
    
    return summary;
  }
  
  /**
   * Formatiert technische Kategorienamen in lesbare Begriffe
   */
  private formatCategoryName(category: string): string {
    // Bekannte Kategorien mappen
    const categoryMap: Record<string, string> = {
      skills: 'Fähigkeiten',
      experience: 'Erfahrung',
      education: 'Bildung',
      location: 'Standort',
      language: 'Sprachkenntnisse',
      certificates: 'Zertifikate',
      salary: 'Gehaltsvorstellung',
      availability: 'Verfügbarkeit',
      cultural_fit: 'Kulturelle Passung',
      soft_skills: 'Soft Skills'
    };
    
    return categoryMap[category] || category;
  }
  
  /**
   * Erstellt eine Folgeaufgabe für eine neue Bewerbung
   */
  private async createFollowupTask(application: ApplicationExtended): Promise<void> {
    const db = await getDb();
    
    try {
      // Job-Informationen für die Aufgabenbeschreibung abrufen
      const job = await db.get('SELECT title FROM jobs WHERE id = ?', [application.job_id]);
      const jobTitle = job ? job.title : 'Unbekannte Stelle';
      
      // Aufgabe erstellen
      await this.taskService.createAutomaticTask({
        title: `Bewerbung bearbeiten: ${application.applicant_name}`,
        description: `Neue Bewerbung von ${application.applicant_name} für die Stelle "${jobTitle}" ist eingegangen und muss bearbeitet werden.`,
        due_date: this.getDueDate(3), // 3 Tage Frist standardmäßig
        priority: 'medium',
        task_type: 'application_review',
        related_entity_type: 'application',
        related_entity_id: application.id,
        assigned_to: application.assigned_to
      });
      
      // In Kommunikationshistorie dokumentieren
      await this.logApplicationActivity(
        application.id,
        'Folgeaufgabe erstellt',
        `Aufgabe zur Bearbeitung der Bewerbung wurde erstellt und fällig am ${this.getDueDate(3)}.`,
        'system'
      );
    } catch (error) {
      console.error('Fehler beim Erstellen der Folgeaufgabe:', error);
    }
  }
  
  /**
   * Verarbeitet eine neue Bewerbung automatisch
   * @param applicationData Daten der Bewerbung
   * @param settings Einstellungen für die Verarbeitung
   * @returns Die erstellte Bewerbung
   */
  public async processNewApplication(
    applicationData: CreateApplicationParams,
    settings: Partial<AutoApplicationSettings> = {}
  ): Promise<ApplicationExtended> {
    try {
      // 1. Bewerbung erstellen
      const response = await createApplication(applicationData);
      const application = response.application;
      
      // 2. Aktivität in Kommunikationshistorie loggen
      await this.logApplicationActivity(
        application.id,
        'Bewerbung automatisch erstellt',
        `Bewerbung von ${application.applicant_name} wurde automatisch angelegt.`,
        'system'
      );
      
      // 3. Team benachrichtigen
      if (settings.notifyTeamOnNewApplication !== false) {
        await this.notifyTeamAboutApplication(application, 'new');
      }

      // 4. Matching durchführen und Ergebnis speichern
      const matchResultData = await calculateApplicationMatch(application.id);
      
      // Anpassung des Ergebnisformats an das erwartete ApplicationMatchData Format
      const matchResult: ApplicationMatchData = {
        overallScore: matchResultData.score,
        categoryScores: matchResultData.details
      };
      
      // 5. Matching-Ergebnis in Kommunikationshistorie dokumentieren
      await this.logApplicationActivity(
        application.id,
        'Matching durchgeführt',
        `Matching-Score: ${matchResult.overallScore}%. ${this.getMatchSummary(matchResultData)}`,
        'system'
      );
      
      // 6. Basierend auf Match-Score automatisch verarbeiten
      await this.processBasedOnMatchScore(
        application,
        matchResult.overallScore,
        settings
      );
      
      // 7. Aufgabe für Nachverfolgung erstellen, falls nicht automatisch verarbeitet
      if (
        application.status !== 'accepted' && 
        application.status !== 'rejected'
      ) {
        await this.createFollowupTask(application);
      }
      
      return application;
    } catch (error) {
      console.error('Fehler bei der automatischen Verarbeitung einer Bewerbung:', error);
      throw error;
    }
  }
  
  /**
   * Verarbeitet eine Bewerbung basierend auf dem Match-Score
   */
  private async processBasedOnMatchScore(
    application: ApplicationExtended,
    matchScore: number,
    settings: Partial<AutoApplicationSettings> = {}
  ): Promise<void> {
    const db = await getDb();
    const fullSettings = await this.getEffectiveSettings(settings);
    
    try {
      // Wenn Score hoch, automatisch konvertieren
      if (matchScore >= fullSettings.minMatchScoreForAutoConversion) {
        await this.autoConvertToCandidate(application, matchScore, fullSettings);
      }
      // Wenn Score niedrig, für Absage vormerken
      else if (
        matchScore <= fullSettings.maxMatchScoreForAutoRejection && 
        fullSettings.enableAutoRejection
      ) {
        await this.scheduleRejection(application, fullSettings);
      }
      // Ansonsten manuelle Bearbeitung erforderlich
      else {
        // Job-Details für bessere Übersicht
        const job = await db.get('SELECT title FROM jobs WHERE id = ?', [application.job_id]);
        const jobTitle = job ? job.title : 'Unbekannte Stelle';
        
        // Aufgabe für manuelle Prüfung erstellen
        await this.taskService.createAutomaticTask({
          title: `Bewerbung prüfen: ${application.applicant_name}`,
          description: `Bewerbung für "${jobTitle}" mit Match-Score ${matchScore}% erfordert manuelle Prüfung.`,
          due_date: this.getDueDate(2), // 2 Tage Frist
          priority: 'medium',
          task_type: 'application_review',
          related_entity_type: 'application',
          related_entity_id: application.id,
          assigned_to: application.assigned_to
        });
        
        // In Kommunikationshistorie dokumentieren
        await this.logApplicationActivity(
          application.id,
          'Manuelle Prüfung erforderlich',
          `Match-Score ${matchScore}% liegt im Bereich für manuelle Prüfung. Eine Aufgabe wurde erstellt.`,
          'system'
        );
      }
    } catch (error) {
      console.error('Fehler bei der Verarbeitung nach Match-Score:', error);
      throw error;
    }
  }
  
  /**
   * Konvertiert eine Bewerbung automatisch in einen Kandidaten
   */
  private async autoConvertToCandidate(
    application: ApplicationExtended,
    matchScore: number,
    settings: AutoApplicationSettings
  ): Promise<void> {
    try {
      // 1. Konvertierung durchführen
      const result = await autoProfileService.processApplicationToCandidate(
        application.id,
        'system',
        {
          addToTalentPool: settings.autoAddToTalentPool,
          generateProfile: true,
          sendEmailToCustomers: false, // Standardmäßig keine E-Mails senden
          sendEmailToPortals: false,   // Standardmäßig keine E-Mails senden
          emailConfigId: settings.emailConfigId
        }
      );
      
      if (!result.success) {
        throw new Error(`Konvertierung fehlgeschlagen: ${result.error}`);
      }
      
      // 2. In Kommunikationshistorie dokumentieren
      await this.logApplicationActivity(
        application.id,
        'Automatisch in Kandidat konvertiert',
        `Match-Score ${matchScore}% qualifiziert für automatische Konvertierung. Kandidat-ID: ${result.candidateId}`,
        'system'
      );
      
      // 3. Team benachrichtigen
      if (settings.notifyTeamOnAutoConversion) {
        await this.notifyTeamAboutAction(
          application,
          'auto_conversion',
          `Bewerbung von ${application.applicant_name} wurde aufgrund eines Match-Scores von ${matchScore}% automatisch in einen Kandidaten konvertiert.`
        );
      }
      
      // 4. Aufgabe für Nachverfolgung erstellen
      const db = await getDb();
      const job = await db.get('SELECT title FROM jobs WHERE id = ?', [application.job_id]);
      const jobTitle = job ? job.title : 'Unbekannte Stelle';
      
      await this.taskService.createAutomaticTask({
        title: `Kandidat kontaktieren: ${application.applicant_name}`,
        description: `Kandidat wurde automatisch basierend auf Match-Score ${matchScore}% für "${jobTitle}" erstellt. Bitte Kontakt aufnehmen.`,
        due_date: this.getDueDate(1), // 1 Tag Frist
        priority: 'high',
        task_type: 'candidate_contact',
        related_entity_type: 'candidate',
        related_entity_id: result.candidateId as string,
        assigned_to: application.assigned_to
      });
    } catch (error) {
      console.error('Fehler bei der automatischen Konvertierung:', error);
      throw error;
    }
  }
  
  /**
   * Terminiert eine Absage für später
   */
  private async scheduleRejection(
    application: ApplicationExtended,
    settings: AutoApplicationSettings
  ): Promise<void> {
    try {
      const db = await getDb();
      
      // 1. Absage-Datum berechnen
      const rejectionDate = new Date();
      rejectionDate.setDate(rejectionDate.getDate() + settings.rejectionDelayDays);
      
      // 2. In die Datenbank-Tabelle für geplante Absagen einfügen
      await db.run(`
        INSERT INTO scheduled_rejections (
          id, application_id, scheduled_date, template_id, email_config_id, 
          processed, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [
        uuidv4(),
        application.id,
        rejectionDate.toISOString(),
        settings.rejectionTemplateId || null,
        settings.emailConfigId || null,
        0
      ]);
      
      // 3. Status auf "in_review" setzen
      await changeApplicationStatus({
        application_id: application.id,
        status: 'in_review',
        reason: 'Automatische Überprüfung',
        changed_by: 'system'
      });
      
      // 4. In Kommunikationshistorie dokumentieren
      await this.logApplicationActivity(
        application.id,
        'Absage terminiert',
        `Absage für ${rejectionDate.toLocaleDateString('de-DE')} geplant (in ${settings.rejectionDelayDays} Tagen).`,
        'system'
      );
      
      // 5. Aufgabe für Überprüfung erstellen (optional)
      if (application.assigned_to) {
        const job = await db.get('SELECT title FROM jobs WHERE id = ?', [application.job_id]);
        const jobTitle = job ? job.title : 'Unbekannte Stelle';
        
        await this.taskService.createAutomaticTask({
          title: `Geplante Absage überprüfen: ${application.applicant_name}`,
          description: `Für Bewerbung von ${application.applicant_name} für "${jobTitle}" ist eine automatische Absage am ${rejectionDate.toLocaleDateString('de-DE')} geplant. Bitte bei Bedarf stornieren.`,
          due_date: this.getDueDate(settings.rejectionDelayDays - 1), // 1 Tag vor Absage
          priority: 'low',
          task_type: 'rejection_review',
          related_entity_type: 'application',
          related_entity_id: application.id,
          assigned_to: application.assigned_to
        });
      }
    } catch (error) {
      console.error('Fehler beim Terminieren einer Absage:', error);
      throw error;
    }
  }

  /**
   * Ersetzt Variablen in einer Vorlage
   */
  private replaceVariables(template: string, variables: Record<string, string>): string {
    let result = template;
    
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    }
    
    return result;
  }
  
  /**
   * Sendet eine Absage-E-Mail an einen Bewerber
   */
  private async sendRejectionEmail(
    applicationId: string,
    templateId?: string,
    emailConfigId?: string
  ): Promise<void> {
    const db = await getDb();
    
    try {
      // 1. Bewerbungsdaten abrufen
      const application = await db.get('SELECT * FROM applications_extended WHERE id = ?', [applicationId]);
      if (!application) {
        throw new Error(`Bewerbung mit ID ${applicationId} nicht gefunden`);
      }
      
      // 2. Job-Daten für die E-Mail abrufen
      const job = await db.get('SELECT title, company FROM jobs WHERE id = ?', [application.job_id]);
      if (!job) {
        throw new Error(`Job mit ID ${application.job_id} nicht gefunden`);
      }
      
      // 3. E-Mail-Vorlage abrufen oder Standard-Text verwenden
      let emailSubject = `Ihre Bewerbung für die Position ${job.title}`;
      let emailBody = '';
      
      if (templateId) {
        const template = await db.get('SELECT * FROM email_templates WHERE id = ?', [templateId]);
        if (template) {
          emailSubject = this.replaceVariables(template.subject, {
            applicant_name: application.applicant_name,
            job_title: job.title,
            company: job.company
          });
          
          emailBody = this.replaceVariables(template.body, {
            applicant_name: application.applicant_name,
            job_title:
