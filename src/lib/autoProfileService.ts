import { getDb } from './db';
import { convertToCandidate } from './applicationService';
import { 
  generateQualificationProfilePDF, 
  saveQualificationProfilePDF, 
  createQualificationProfileDocument 
} from './pdfGenerator';
import { EmailService, OutgoingEmail, EmailConfiguration } from './email/EmailService';
import { TobitDavidAdapter } from './email/providers/TobitDavidAdapter';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service für die automatische Verarbeitung von Bewerbern zu Kandidaten
 * mit Erstellung und Versand von Qualifikationsprofilen
 */
export class AutoProfileService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  /**
   * Konvertiert einen Bewerber zu einem Kandidaten, erstellt ein Qualifikationsprofil
   * und fügt ihn zum Talent-Pool hinzu
   * 
   * @param applicationId ID der Bewerbung
   * @param userId ID des Benutzers, der die Konvertierung durchführt
   * @param options Optionen für die Konvertierung und Verteilung
   * @returns Objekt mit Informationen über den Vorgang
   */
  public async processApplicationToCandidate(
    applicationId: string,
    userId: string,
    options: {
      addToTalentPool?: boolean;
      generateProfile?: boolean;
      sendEmailToCustomers?: boolean;
      sendEmailToPortals?: boolean;
      emailConfigId?: string;
      customMessage?: string;
    } = {}
  ): Promise<{
    success: boolean;
    candidateId?: string;
    talentPoolId?: string;
    profileDocumentId?: string;
    emailsSent?: number;
    error?: string;
  }> {
    const db = await getDb();
    
    try {
      // 1. Bewerbung in Kandidaten konvertieren
      const conversionResult = await convertToCandidate(applicationId, userId);
      
      if (!conversionResult) {
        return {
          success: false,
          error: 'Konvertierung fehlgeschlagen oder Bewerbung nicht gefunden'
        };
      }
      
      const candidateId = conversionResult.candidateId;
      let talentPoolId: string | undefined;
      let profileDocumentId: string | undefined;
      let emailsSent = 0;
      
      // 2. Falls gewünscht, zum Talent-Pool hinzufügen
      if (options.addToTalentPool !== false) {
        talentPoolId = await this.addToTalentPool(candidateId, userId);
      }

      // 3. Falls gewünscht, Qualifikationsprofil erstellen
      if (options.generateProfile !== false) {
        // Kandidaten-Daten laden
        const candidate = await db.get('SELECT * FROM candidates WHERE id = ?', [candidateId]);
        
        if (!candidate) {
          return {
            success: true,
            candidateId,
            talentPoolId,
            error: 'Kandidat gefunden, aber keine Daten zum Erstellen des Profils vorhanden'
          };
        }
        
        // Qualifikationsprofil erstellen
        const profile = await this.createQualificationProfile(candidateId);
        
        // PDF generieren
        const pdfData = await saveQualificationProfilePDF(candidate, profile, {
          showCompanyLogo: true,
          showContactInfo: false
        });
        
        // Dokument in der Datenbank speichern
        const documentResult = createQualificationProfileDocument(candidate, pdfData);
        profileDocumentId = documentResult.documentId;
        
        await db.run(`
          INSERT INTO candidate_documents (
            id, candidate_id, name, type, url, size, uploaded_by, upload_date
          ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `, [
          documentResult.documentId,
          candidateId,
          documentResult.document.name,
          documentResult.document.type,
          documentResult.document.url,
          documentResult.document.size,
          userId
        ]);
        
        // 4. Falls gewünscht, E-Mail an Kunden senden
        if (options.sendEmailToCustomers) {
          const customersEmailed = await this.sendProfileToCustomers(
            candidateId, 
            profileDocumentId,
            options.emailConfigId, 
            options.customMessage,
            userId
          );
          
          emailsSent += customersEmailed;
        }
        
        // 5. Falls gewünscht, E-Mail an Portale senden
        if (options.sendEmailToPortals) {
          const portalsEmailed = await this.sendProfileToPortals(
            candidateId, 
            profileDocumentId,
            options.emailConfigId, 
            options.customMessage,
            userId
          );
          
          emailsSent += portalsEmailed;
        }
      }
      
      return {
        success: true,
        candidateId,
        talentPoolId,
        profileDocumentId,
        emailsSent
      };
      
    } catch (error) {
      console.error('Fehler bei der automatischen Verarbeitung:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unbekannter Fehler'
      };
    }
  }
  
  /**
   * Fügt einen Kandidaten zum Talent-Pool hinzu
   */
  private async addToTalentPool(candidateId: string, userId: string): Promise<string> {
    const db = await getDb();
    
    // Kandidaten-Daten laden
    const candidate = await db.get('SELECT * FROM candidates WHERE id = ?', [candidateId]);
    
    if (!candidate) {
      throw new Error(`Kandidat mit ID ${candidateId} nicht gefunden`);
    }
    
    // Talent-Pool-ID generieren
    const talentPoolId = uuidv4();
    
    // UNIX-Zeitstempel für "jetzt" erstellen
    const now = Math.floor(Date.now() / 1000);
    
    // Die Skills des Kandidaten als JSON speichern
    let skillsSnapshot = null;
    const candidateSkills = await db.all(
      'SELECT * FROM candidate_skills WHERE candidate_id = ?',
      [candidateId]
    );
    
    if (candidateSkills && candidateSkills.length > 0) {
      skillsSnapshot = JSON.stringify(candidateSkills);
    }
    
    // Die Erfahrungen des Kandidaten als JSON speichern
    let experienceSnapshot = null;
    const candidateExperience = await db.all(
      'SELECT * FROM candidate_experience WHERE candidate_id = ?',
      [candidateId]
    );
    
    if (candidateExperience && candidateExperience.length > 0) {
      experienceSnapshot = JSON.stringify(candidateExperience);
    }
    
    // Eintrag im Talent-Pool erstellen
    await db.run(`
      INSERT INTO talent_pool (
        id, entity_id, entity_type, added_date, added_by, status,
        skills_snapshot, experience_snapshot
      ) VALUES (?, ?, ?, datetime(?, 'unixepoch'), ?, ?, ?, ?)
    `, [
      talentPoolId,
      candidateId,
      'candidate',
      now,
      userId,
      'active',
      skillsSnapshot,
      experienceSnapshot
    ]);
    
    // Für die Nachverfolgung eine Aktivität hinzufügen
    const activityId = uuidv4();
    await db.run(`
      INSERT INTO talent_pool_activities (
        id, talent_pool_id, activity_type, activity_data, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, datetime(?, 'unixepoch'))
    `, [
      activityId,
      talentPoolId,
      'added_to_pool',
      JSON.stringify({ 
        source: 'application_conversion',
        candidate_name: `${candidate.first_name} ${candidate.last_name}`.trim()
      }),
      userId,
      now
    ]);
    
    return talentPoolId;
  }
  
  /**
   * Erstellt ein Qualifikationsprofil für einen Kandidaten
   */
  private async createQualificationProfile(candidateId: string): Promise<any> {
    const db = await getDb();
    
    // Kandidaten-Daten laden
    const candidate = await db.get('SELECT * FROM candidates WHERE id = ?', [candidateId]);
    
    if (!candidate) {
      throw new Error(`Kandidat mit ID ${candidateId} nicht gefunden`);
    }
    
    // Fähigkeiten laden
    const skills = await db.all(
      'SELECT * FROM candidate_skills WHERE candidate_id = ?',
      [candidateId]
    );
    
    // Erfahrungen laden
    const experience = await db.all(
      'SELECT * FROM candidate_experience WHERE candidate_id = ?',
      [candidateId]
    );
    
    // Ausbildung laden
    const education = await db.all(
      'SELECT * FROM candidate_education WHERE candidate_id = ?',
      [candidateId]
    );
    
    // Zertifikate laden
    const certificates = await db.all(
      'SELECT * FROM candidate_certificates WHERE candidate_id = ?',
      [candidateId]
    );
    
    // Sprachen laden
    const languages = await db.all(
      'SELECT * FROM candidate_languages WHERE candidate_id = ?',
      [candidateId]
    );
    
    // Qualifikationsprofil zusammenstellen
    const profile = {
      summary: candidate.summary || '',
      skills: skills.map((skill: any) => ({
        name: skill.name,
        level: skill.level,
        description: skill.description
      })),
      experience: experience.map((exp: any) => ({
        title: exp.title,
        company: exp.company,
        location: exp.location,
        period: `${exp.start_date} - ${exp.end_date || 'heute'}`,
        description: exp.description
      })),
      education: education.map((edu: any) => ({
        degree: edu.degree,
        institution: edu.institution,
        startDate: edu.start_date,
        endDate: edu.end_date,
        description: edu.description
      })),
      certificates: certificates.map((cert: any) => cert.name),
      languages: languages.map((lang: any) => ({
        name: lang.language,
        level: lang.proficiency
      }))
    };
    
    return profile;
  }
  
  /**
   * Sendet das Qualifikationsprofil an Kunden
   */
  private async sendProfileToCustomers(
    candidateId: string,
    documentId: string,
    emailConfigId?: string,
    customMessage?: string,
    userId?: string
  ): Promise<number> {
    const db = await getDb();
    
    // Kandidaten-Daten laden
    const candidate = await db.get('SELECT * FROM candidates WHERE id = ?', [candidateId]);
    
    if (!candidate) {
      throw new Error(`Kandidat mit ID ${candidateId} nicht gefunden`);
    }
    
    // Dokument laden
    const document = await db.get('SELECT * FROM candidate_documents WHERE id = ?', [documentId]);
    
    if (!document) {
      throw new Error(`Dokument mit ID ${documentId} nicht gefunden`);
    }
    
    // E-Mail-Konfiguration holen
    let emailConfiguration: EmailConfiguration | null = null;
    
    if (emailConfigId) {
      emailConfiguration = await this.emailService.getConfigurationById(emailConfigId);
    } else {
      // Die erste aktive E-Mail-Konfiguration nehmen
      const configurations = await this.emailService.getConfigurations();
      emailConfiguration = configurations.find(config => config.active) || null;
    }
    
    if (!emailConfiguration) {
      throw new Error('Keine aktive E-Mail-Konfiguration gefunden');
    }
    
    // Kunden laden, die Qualifikationsprofile erhalten sollen
    const customers = await db.all(`
      SELECT * FROM customers 
      WHERE receive_profiles = 1 AND email IS NOT NULL
    `);
    
    if (!customers || customers.length === 0) {
      return 0;
    }
    
    // E-Mail an jeden Kunden senden
    let emailsSent = 0;
    
    for (const customer of customers) {
      try {
        const emailSubject = `Qualifikationsprofil: ${candidate.first_name} ${candidate.last_name} (${candidate.position || 'Kandidat'})`;
        
        let emailBody = `
          <p>Sehr geehrte(r) ${customer.contact_name || 'Damen und Herren'},</p>
          
          <p>anbei erhalten Sie das Qualifikationsprofil von <strong>${candidate.first_name} ${candidate.last_name}</strong> 
          ${candidate.position ? `(${candidate.position})` : ''}.</p>
        `;
        
        if (customMessage) {
          emailBody += `<p>${customMessage}</p>`;
        }
        
        emailBody += `
          <p>Bei Interesse oder weiteren Fragen stehen wir Ihnen gerne zur Verfügung.</p>
          
          <p>Mit freundlichen Grüßen,<br>
          Ihr HeiBa Recruitment Team</p>
        `;
        
        // Erstelle den E-Mail-Anhang mit dem Dokument
        const contentBuffer = Buffer.from(document.url.split(',')[1], 'base64');
        const attachment = {
          filename: document.name,
          contentType: 'application/pdf',
          size: document.size,
          content: new Blob([contentBuffer], { type: 'application/pdf' })
        };
        
        // Erstelle die E-Mail
        const email: OutgoingEmail = {
          emailConfigurationId: emailConfiguration.id!,
          sender: emailConfiguration.defaultSender || '',
          recipient: customer.email,
          subject: emailSubject,
          body: emailBody,
          status: 'queued',
          createdBy: userId || 'system',
          attachments: [attachment]
        };
        
        // Sende die E-Mail
        if (emailConfiguration.providerType === 'tobit_david') {
          const adapter = new TobitDavidAdapter(emailConfiguration);
          await adapter.sendEmail(email);
        } else {
          // Für andere Anbieter könnte hier Code hinzugefügt werden
        }
        
        emailsSent++;
      } catch (error) {
        console.error(`Fehler beim Senden der E-Mail an ${customer.email}:`, error);
      }
    }
    
    return emailsSent;
  }
  
  /**
   * Sendet das Qualifikationsprofil an Portale
   */
  private async sendProfileToPortals(
    candidateId: string,
    documentId: string,
    emailConfigId?: string,
    customMessage?: string,
    userId?: string
  ): Promise<number> {
    const db = await getDb();
    
    // Kandidaten-Daten laden
    const candidate = await db.get('SELECT * FROM candidates WHERE id = ?', [candidateId]);
    
    if (!candidate) {
      throw new Error(`Kandidat mit ID ${candidateId} nicht gefunden`);
    }
    
    // Dokument laden
    const document = await db.get('SELECT * FROM candidate_documents WHERE id = ?', [documentId]);
    
    if (!document) {
      throw new Error(`Dokument mit ID ${documentId} nicht gefunden`);
    }
    
    // E-Mail-Konfiguration holen
    let emailConfiguration: EmailConfiguration | null = null;
    
    if (emailConfigId) {
      emailConfiguration = await this.emailService.getConfigurationById(emailConfigId);
    } else {
      // Die erste aktive E-Mail-Konfiguration nehmen
      const configurations = await this.emailService.getConfigurations();
      emailConfiguration = configurations.find(config => config.active) || null;
    }
    
    if (!emailConfiguration) {
      throw new Error('Keine aktive E-Mail-Konfiguration gefunden');
    }
    
    // Portale laden, die Qualifikationsprofile erhalten sollen
    const portals = await db.all(`
      SELECT * FROM job_portals 
      WHERE receive_profiles = 1 AND contact_email IS NOT NULL
    `);
    
    if (!portals || portals.length === 0) {
      return 0;
    }
    
    // E-Mail an jedes Portal senden
    let emailsSent = 0;
    
    for (const portal of portals) {
      try {
        const emailSubject = `Neues Qualifikationsprofil: ${candidate.first_name} ${candidate.last_name} (${candidate.position || 'Kandidat'})`;
        
        let emailBody = `
          <p>Sehr geehrte Damen und Herren,</p>
          
          <p>anbei erhalten Sie das Qualifikationsprofil eines neuen Kandidaten in unserer Datenbank: 
          <strong>${candidate.first_name} ${candidate.last_name}</strong> 
          ${candidate.position ? `(${candidate.position})` : ''}.</p>
        `;
        
        if (customMessage) {
          emailBody += `<p>${customMessage}</p>`;
        }
        
        emailBody += `
          <p>Diese Person hat der Übermittlung des Profils an potenzielle Arbeitgeber zugestimmt.</p>
          
          <p>Bei Interesse oder weiteren Fragen stehen wir Ihnen gerne zur Verfügung.</p>
          
          <p>Mit freundlichen Grüßen,<br>
          Ihr HeiBa Recruitment Team</p>
        `;
        
        // Erstelle den E-Mail-Anhang mit dem Dokument
        const contentBuffer = Buffer.from(document.url.split(',')[1], 'base64');
        const attachment = {
          filename: document.name,
          contentType: 'application/pdf',
          size: document.size,
          content: new Blob([contentBuffer], { type: 'application/pdf' })
        };
        
        // Erstelle die E-Mail
        const email: OutgoingEmail = {
          emailConfigurationId: emailConfiguration.id!,
          sender: emailConfiguration.defaultSender || '',
          recipient: portal.contact_email,
          subject: emailSubject,
          body: emailBody,
          status: 'queued',
          createdBy: userId || 'system',
          attachments: [attachment]
        };
        
        // Sende die E-Mail
        if (emailConfiguration.providerType === 'tobit_david') {
          const adapter = new TobitDavidAdapter(emailConfiguration);
          await adapter.sendEmail(email);
        } else {
          // Für andere Anbieter könnte hier Code hinzugefügt werden
        }
        
        emailsSent++;
      } catch (error) {
        console.error(`Fehler beim Senden der E-Mail an ${portal.contact_email}:`, error);
      }
    }
    
    return emailsSent;
  }
}

// Singleton-Instanz exportieren
export const autoProfileService = new AutoProfileService();
