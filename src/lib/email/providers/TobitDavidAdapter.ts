import axios from 'axios';
import { 
  EmailConfiguration, 
  IncomingEmail, 
  OutgoingEmail, 
  EmailAttachment 
} from '../EmailService';

/**
 * Adapter-Klasse für die Tobit David E-Mail-Integration
 * 
 * Tobit David ist ein CRM-System, das auch E-Mail-Funktionalität bietet.
 * Dieser Adapter ermöglicht die Integration mit der Tobit David API,
 * um E-Mails abzurufen und zu senden.
 */
export class TobitDavidAdapter {
  private apiUrl: string;
  private apiKey: string;
  private username: string;
  private password: string;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(config: EmailConfiguration) {
    if (!config.serverUrl) {
      throw new Error('Tobit David API-URL ist erforderlich');
    }
    
    if (!config.apiKey) {
      throw new Error('Tobit David API-Schlüssel ist erforderlich');
    }
    
    if (!config.username || !config.password) {
      throw new Error('Tobit David Benutzername und Passwort sind erforderlich');
    }
    
    this.apiUrl = config.serverUrl;
    this.apiKey = config.apiKey;
    this.username = config.username;
    this.password = config.password;
  }

  /**
   * Authentifiziert sich bei der Tobit David API und holt ein Access-Token
   * @returns Access-Token
   */
  private async authenticate(): Promise<string> {
    // Prüfe, ob ein gültiges Token vorhanden ist
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken as string;
    }
    
    try {
      const response = await axios.post(`${this.apiUrl}/auth`, {
        apiKey: this.apiKey,
        username: this.username,
        password: this.password
      });
      
      if (response.data && response.data.accessToken) {
        this.accessToken = response.data.accessToken;
        
        // Token-Ablaufzeit auf 1 Stunde setzen (oder gemäß API-Dokumentation)
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1);
        this.tokenExpiry = expiryDate;
        
        return this.accessToken as string;
      } else {
        throw new Error('Authentifizierung bei Tobit David fehlgeschlagen');
      }
    } catch (error) {
      console.error('Fehler bei der Authentifizierung:', error);
      throw new Error('Authentifizierung bei Tobit David fehlgeschlagen');
    }
  }

  /**
   * Holt neue E-Mails vom Server ab
   * @param folder Ordner, aus dem E-Mails abgerufen werden sollen (z.B. 'inbox')
   * @param limit Maximale Anzahl der abzurufenden E-Mails
   * @param since Datum, ab dem E-Mails abgerufen werden sollen
   * @returns Array mit eingehenden E-Mails
   */
  public async fetchEmails(
    folder: string = 'inbox',
    limit: number = 50,
    since?: Date
  ): Promise<IncomingEmail[]> {
    const token = await this.authenticate();
    
    try {
      // Erstelle die Parameter für die Anfrage
      const params: any = {
        folder,
        limit
      };
      
      if (since) {
        params.since = since.toISOString();
      }
      
      const response = await axios.get(`${this.apiUrl}/emails`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Ungültige Antwort vom Tobit David Server');
      }
      
      // Konvertiere die E-Mails in das interne Format
      const emails: IncomingEmail[] = response.data.map((email: any) => this.mapTobitDavidToIncomingEmail(email));
      
      return emails;
    } catch (error) {
      console.error('Fehler beim Abrufen der E-Mails:', error);
      throw new Error('Abrufen der E-Mails von Tobit David fehlgeschlagen');
    }
  }

  /**
   * Ruft eine einzelne E-Mail mit allen Details ab
   * @param externalId Externe ID der E-Mail
   * @returns Eingehende E-Mail mit allen Details
   */
  public async fetchEmailDetails(externalId: string): Promise<IncomingEmail> {
    const token = await this.authenticate();
    
    try {
      const response = await axios.get(`${this.apiUrl}/emails/${externalId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.data) {
        throw new Error('Ungültige Antwort vom Tobit David Server');
      }
      
      // Konvertiere die E-Mail in das interne Format
      const email = this.mapTobitDavidToIncomingEmail(response.data);
      
      // Hole die Anhänge, falls vorhanden
      if (response.data.attachments && Array.isArray(response.data.attachments)) {
        email.attachments = response.data.attachments.map((attachment: any) => 
          this.mapTobitDavidToEmailAttachment(attachment)
        );
      }
      
      return email;
    } catch (error) {
      console.error('Fehler beim Abrufen der E-Mail-Details:', error);
      throw new Error('Abrufen der E-Mail-Details von Tobit David fehlgeschlagen');
    }
  }

  /**
   * Ruft einen E-Mail-Anhang ab
   * @param emailId Externe ID der E-Mail
   * @param attachmentId Externe ID des Anhangs
   * @returns E-Mail-Anhang mit Inhalt
   */
  public async fetchAttachment(emailId: string, attachmentId: string): Promise<EmailAttachment> {
    const token = await this.authenticate();
    
    try {
      const response = await axios.get(`${this.apiUrl}/emails/${emailId}/attachments/${attachmentId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'arraybuffer'
      });
      
      if (!response.data) {
        throw new Error('Ungültige Antwort vom Tobit David Server');
      }
      
      // Hole die Metadaten des Anhangs
      const metaResponse = await axios.get(`${this.apiUrl}/emails/${emailId}/attachments/${attachmentId}/meta`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!metaResponse.data) {
        throw new Error('Ungültige Antwort vom Tobit David Server');
      }
      
      // Erstelle einen Blob aus den Binärdaten
      const blob = new Blob([response.data], { type: metaResponse.data.contentType });
      
      // Konvertiere die Metadaten in das interne Format
      const attachment: EmailAttachment = {
        filename: metaResponse.data.filename,
        contentType: metaResponse.data.contentType,
        size: response.data.byteLength,
        content: blob
      };
      
      return attachment;
    } catch (error) {
      console.error('Fehler beim Abrufen des Anhangs:', error);
      throw new Error('Abrufen des Anhangs von Tobit David fehlgeschlagen');
    }
  }

  /**
   * Sendet eine E-Mail über Tobit David
   * @param email Ausgehende E-Mail
   * @returns Externe ID der gesendeten E-Mail
   */
  public async sendEmail(email: OutgoingEmail): Promise<string> {
    const token = await this.authenticate();
    
    try {
      // Konvertiere die E-Mail in das Tobit David Format
      const tobitDavidEmail = this.mapOutgoingEmailToTobitDavid(email);
      
      // Sende die E-Mail
      const response = await axios.post(`${this.apiUrl}/emails/send`, tobitDavidEmail, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.data || !response.data.id) {
        throw new Error('Ungültige Antwort vom Tobit David Server');
      }
      
      return response.data.id;
    } catch (error) {
      console.error('Fehler beim Senden der E-Mail:', error);
      throw new Error('Senden der E-Mail über Tobit David fehlgeschlagen');
    }
  }

  /**
   * Löscht eine E-Mail
   * @param externalId Externe ID der E-Mail
   * @returns true, wenn erfolgreich
   */
  public async deleteEmail(externalId: string): Promise<boolean> {
    const token = await this.authenticate();
    
    try {
      await axios.delete(`${this.apiUrl}/emails/${externalId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return true;
    } catch (error) {
      console.error('Fehler beim Löschen der E-Mail:', error);
      throw new Error('Löschen der E-Mail über Tobit David fehlgeschlagen');
    }
  }

  /**
   * Markiert eine E-Mail als gelesen
   * @param externalId Externe ID der E-Mail
   * @returns true, wenn erfolgreich
   */
  public async markAsRead(externalId: string): Promise<boolean> {
    const token = await this.authenticate();
    
    try {
      await axios.post(`${this.apiUrl}/emails/${externalId}/read`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return true;
    } catch (error) {
      console.error('Fehler beim Markieren der E-Mail als gelesen:', error);
      throw new Error('Markieren der E-Mail als gelesen über Tobit David fehlgeschlagen');
    }
  }

  /**
   * Konvertiert eine Tobit David E-Mail in das interne Format
   */
  private mapTobitDavidToIncomingEmail(email: any): IncomingEmail {
    return {
      emailConfigurationId: '', // wird vom Service gesetzt
      externalId: email.id,
      sender: email.from,
      recipient: email.to,
      cc: email.cc,
      bcc: email.bcc,
      subject: email.subject,
      body: email.body,
      bodyPlain: email.bodyPlain || this.stripHtmlTags(email.body),
      receivedAt: email.date,
      read: email.read || false,
      flagged: email.flagged || false,
      status: 'new',
      rawData: JSON.stringify(email)
    };
  }

  /**
   * Konvertiert einen Tobit David Anhang in das interne Format
   */
  private mapTobitDavidToEmailAttachment(attachment: any): EmailAttachment {
    return {
      filename: attachment.filename,
      contentType: attachment.contentType,
      size: attachment.size,
      storagePath: attachment.id // Verwende die ID als Pfad zur Speicherung
    };
  }

  /**
   * Konvertiert eine ausgehende E-Mail in das Tobit David Format
   */
  private mapOutgoingEmailToTobitDavid(email: OutgoingEmail): any {
    const tobitDavidEmail: any = {
      from: email.sender,
      to: email.recipient,
      subject: email.subject,
      body: email.body
    };
    
    if (email.cc) {
      tobitDavidEmail.cc = email.cc;
    }
    
    if (email.bcc) {
      tobitDavidEmail.bcc = email.bcc;
    }
    
    if (email.replyToEmailId) {
      tobitDavidEmail.inReplyTo = email.replyToEmailId;
    }
    
    // Füge Anhänge hinzu, falls vorhanden
    if (email.attachments && email.attachments.length > 0) {
      tobitDavidEmail.attachments = email.attachments.map(attachment => ({
        filename: attachment.filename,
        contentType: attachment.contentType,
        content: attachment.content,
        size: attachment.size
      }));
    }
    
    return tobitDavidEmail;
  }

  /**
   * Entfernt HTML-Tags aus einem String
   */
  private stripHtmlTags(html: string): string {
    return html.replace(/<[^>]*>?/gm, '');
  }
}
