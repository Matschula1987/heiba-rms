import { getDb } from '@/lib/db';

/**
 * Typen für E-Mail-Funktionalität
 */
export interface EmailConfiguration {
  id?: string;
  name: string;
  providerType: 'tobit_david' | 'exchange' | 'smtp' | string;
  serverUrl?: string;
  apiKey?: string;
  username?: string;
  password?: string;
  defaultSender?: string;
  signature?: string;
  active: boolean;
  settings?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface IncomingEmail {
  id?: string;
  emailConfigurationId: string;
  externalId?: string;
  sender: string;
  recipient: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  bodyPlain?: string;
  receivedAt: string;
  read: boolean;
  flagged: boolean;
  status: 'new' | 'processed' | 'archived';
  assignedToId?: string;
  candidateId?: string;
  applicationId?: string;
  jobId?: string;
  talentPoolId?: string;
  rawData?: string;
  createdAt?: string;
  updatedAt?: string;
  attachments?: EmailAttachment[];
}

export interface OutgoingEmail {
  id?: string;
  emailConfigurationId: string;
  externalId?: string;
  sender: string;
  recipient: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  bodyPlain?: string;
  scheduledAt?: string;
  sentAt?: string;
  status: 'draft' | 'queued' | 'sent' | 'error';
  errorMessage?: string;
  replyToEmailId?: string;
  candidateId?: string;
  applicationId?: string;
  jobId?: string;
  talentPoolId?: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  id?: string;
  emailId?: string;
  filename: string;
  contentType: string;
  size: number;
  content?: Blob;
  storagePath?: string;
  createdAt?: string;
}

export interface EmailTemplate {
  id?: string;
  name: string;
  description?: string;
  subject: string;
  body: string;
  bodyPlain?: string;
  category?: string;
  variables?: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmailRule {
  id?: string;
  name: string;
  description?: string;
  emailConfigurationId: string;
  conditions: string;
  actions: string;
  priority: number;
  active: boolean;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FollowUpAction {
  id?: string;
  type: 'email' | 'call' | 'meeting';
  name: string;
  description?: string;
  scheduledAt: string;
  completedAt?: string;
  status: 'pending' | 'completed' | 'cancelled';
  candidateId?: string;
  applicationId?: string;
  jobId?: string;
  talentPoolId?: string;
  emailTemplateId?: string;
  assignedToId: string;
  reminderSent: boolean;
  result?: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Service-Klasse für E-Mail-Operationen
 */
export class EmailService {
  /**
   * Holt alle E-Mail-Konfigurationen
   */
  public async getConfigurations(): Promise<EmailConfiguration[]> {
    const db = await getDb();
    const configs = await db.all('SELECT * FROM email_configurations');
    return configs.map(this.mapDbConfigToEmailConfig);
  }

  /**
   * Holt eine E-Mail-Konfiguration anhand der ID
   */
  public async getConfigurationById(id: string): Promise<EmailConfiguration | null> {
    const db = await getDb();
    const config = await db.get('SELECT * FROM email_configurations WHERE id = ?', [id]);
    return config ? this.mapDbConfigToEmailConfig(config) : null;
  }

  /**
   * Erstellt eine neue E-Mail-Konfiguration
   */
  public async createConfiguration(config: EmailConfiguration): Promise<string> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    // Konvertiere settings zu JSON-String, falls vorhanden
    const settingsJson = config.settings ? JSON.stringify(config.settings) : null;
    
    const result = await db.run(`
      INSERT INTO email_configurations (
        name, provider_type, server_url, api_key, username, password, default_sender, 
        signature, active, settings, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      config.name,
      config.providerType,
      config.serverUrl || null,
      config.apiKey || null,
      config.username || null,
      config.password || null,
      config.defaultSender || null,
      config.signature || null,
      config.active ? 1 : 0,
      settingsJson,
      now,
      now
    ]);
    
    // Hole die ID der eingefügten Konfiguration
    const inserted = await db.get('SELECT id FROM email_configurations ORDER BY rowid DESC LIMIT 1');
    return inserted.id;
  }

  /**
   * Aktualisiert eine E-Mail-Konfiguration
   */
  public async updateConfiguration(id: string, config: Partial<EmailConfiguration>): Promise<boolean> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    // Baue die SQL-Abfrage dynamisch
    const updates = [];
    const params = [];
    
    // Füge nur die Felder hinzu, die aktualisiert werden sollen
    if (config.name !== undefined) {
      updates.push('name = ?');
      params.push(config.name);
    }
    if (config.providerType !== undefined) {
      updates.push('provider_type = ?');
      params.push(config.providerType);
    }
    if (config.serverUrl !== undefined) {
      updates.push('server_url = ?');
      params.push(config.serverUrl || null);
    }
    if (config.apiKey !== undefined) {
      updates.push('api_key = ?');
      params.push(config.apiKey || null);
    }
    if (config.username !== undefined) {
      updates.push('username = ?');
      params.push(config.username || null);
    }
    if (config.password !== undefined) {
      updates.push('password = ?');
      params.push(config.password || null);
    }
    if (config.defaultSender !== undefined) {
      updates.push('default_sender = ?');
      params.push(config.defaultSender || null);
    }
    if (config.signature !== undefined) {
      updates.push('signature = ?');
      params.push(config.signature || null);
    }
    if (config.active !== undefined) {
      updates.push('active = ?');
      params.push(config.active ? 1 : 0);
    }
    if (config.settings !== undefined) {
      updates.push('settings = ?');
      params.push(config.settings ? JSON.stringify(config.settings) : null);
    }
    
    // Immer das updated_at-Feld aktualisieren
    updates.push('updated_at = ?');
    params.push(now);
    
    // ID für die WHERE-Klausel
    params.push(id);
    
    // Führe die Aktualisierung durch
    const result = await db.run(`
      UPDATE email_configurations
      SET ${updates.join(', ')}
      WHERE id = ?
    `, params);
    
    return result.changes > 0;
  }

  /**
   * Löscht eine E-Mail-Konfiguration
   */
  public async deleteConfiguration(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.run('DELETE FROM email_configurations WHERE id = ?', [id]);
    return result.changes > 0;
  }

  /**
   * Holt eingehende E-Mails mit Filter-Optionen
   */
  public async getIncomingEmails(options: {
    status?: string;
    candidateId?: string;
    applicationId?: string;
    jobId?: string;
    talentPoolId?: string;
    assignedToId?: string;
    configId?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<IncomingEmail[]> {
    const db = await getDb();
    
    // Baue die WHERE-Klausel basierend auf den Optionen
    const where = [];
    const params = [];
    
    if (options.status) {
      where.push('status = ?');
      params.push(options.status);
    }
    if (options.candidateId) {
      where.push('candidate_id = ?');
      params.push(options.candidateId);
    }
    if (options.applicationId) {
      where.push('application_id = ?');
      params.push(options.applicationId);
    }
    if (options.jobId) {
      where.push('job_id = ?');
      params.push(options.jobId);
    }
    if (options.talentPoolId) {
      where.push('talent_pool_id = ?');
      params.push(options.talentPoolId);
    }
    if (options.assignedToId) {
      where.push('assigned_to_id = ?');
      params.push(options.assignedToId);
    }
    if (options.configId) {
      where.push('email_configuration_id = ?');
      params.push(options.configId);
    }
    
    // Füge LIMIT und OFFSET hinzu
    let limitOffset = '';
    if (options.limit) {
      limitOffset = ` LIMIT ${options.limit}`;
      
      if (options.offset) {
        limitOffset += ` OFFSET ${options.offset}`;
      }
    }
    
    // Führe die Abfrage durch
    const query = `
      SELECT * FROM incoming_emails
      ${where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY received_at DESC
      ${limitOffset}
    `;
    
    const emails = await db.all(query, params);
    const result = [];
    
    // Hole die Anhänge für jede E-Mail
    for (const email of emails) {
      const mappedEmail = this.mapDbEmailToIncomingEmail(email);
      
      // Hole die Anhänge
      const attachments = await db.all(
        'SELECT * FROM email_attachments WHERE email_id = ?',
        [email.id]
      );
      
      mappedEmail.attachments = attachments.map(this.mapDbAttachmentToEmailAttachment);
      result.push(mappedEmail);
    }
    
    return result;
  }

  /**
   * Holt eine eingehende E-Mail anhand der ID
   */
  public async getIncomingEmailById(id: string): Promise<IncomingEmail | null> {
    const db = await getDb();
    const email = await db.get('SELECT * FROM incoming_emails WHERE id = ?', [id]);
    
    if (!email) {
      return null;
    }
    
    const mappedEmail = this.mapDbEmailToIncomingEmail(email);
    
    // Hole die Anhänge
    const attachments = await db.all(
      'SELECT * FROM email_attachments WHERE email_id = ?',
      [id]
    );
    
    mappedEmail.attachments = attachments.map(this.mapDbAttachmentToEmailAttachment);
    
    return mappedEmail;
  }

  /**
   * Fügt eine eingehende E-Mail hinzu (wird normalerweise vom Provider-Adapter aufgerufen)
   */
  public async addIncomingEmail(email: IncomingEmail): Promise<string> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    // Wenn receivedAt nicht gesetzt ist, verwende das aktuelle Datum
    const receivedAt = email.receivedAt || now;
    
    const result = await db.run(`
      INSERT INTO incoming_emails (
        email_configuration_id, external_id, sender, recipient, cc, bcc, subject, 
        body, body_plain, received_at, read, flagged, status, assigned_to_id,
        candidate_id, application_id, job_id, talent_pool_id, raw_data, 
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      email.emailConfigurationId,
      email.externalId || null,
      email.sender,
      email.recipient,
      email.cc || null,
      email.bcc || null,
      email.subject,
      email.body,
      email.bodyPlain || null,
      receivedAt,
      email.read ? 1 : 0,
      email.flagged ? 1 : 0,
      email.status || 'new',
      email.assignedToId || null,
      email.candidateId || null,
      email.applicationId || null,
      email.jobId || null,
      email.talentPoolId || null,
      email.rawData || null,
      now,
      now
    ]);
    
    // Hole die ID der eingefügten E-Mail
    const inserted = await db.get('SELECT id FROM incoming_emails ORDER BY rowid DESC LIMIT 1');
    const emailId = inserted.id;
    
    // Füge Anhänge hinzu, falls vorhanden
    if (email.attachments && email.attachments.length > 0) {
      for (const attachment of email.attachments) {
        await this.addEmailAttachment(emailId, attachment);
      }
    }
    
    // Prüfe, ob automatische Regeln angewendet werden sollen
    await this.applyRulesToEmail(emailId);
    
    return emailId;
  }

  /**
   * Aktualisiert eine eingehende E-Mail
   */
  public async updateIncomingEmail(id: string, email: Partial<IncomingEmail>): Promise<boolean> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    // Baue die SQL-Abfrage dynamisch
    const updates = [];
    const params = [];
    
    // Füge nur die Felder hinzu, die aktualisiert werden sollen
    if (email.emailConfigurationId !== undefined) {
      updates.push('email_configuration_id = ?');
      params.push(email.emailConfigurationId);
    }
    if (email.externalId !== undefined) {
      updates.push('external_id = ?');
      params.push(email.externalId || null);
    }
    if (email.sender !== undefined) {
      updates.push('sender = ?');
      params.push(email.sender);
    }
    if (email.recipient !== undefined) {
      updates.push('recipient = ?');
      params.push(email.recipient);
    }
    if (email.cc !== undefined) {
      updates.push('cc = ?');
      params.push(email.cc || null);
    }
    if (email.bcc !== undefined) {
      updates.push('bcc = ?');
      params.push(email.bcc || null);
    }
    if (email.subject !== undefined) {
      updates.push('subject = ?');
      params.push(email.subject);
    }
    if (email.body !== undefined) {
      updates.push('body = ?');
      params.push(email.body);
    }
    if (email.bodyPlain !== undefined) {
      updates.push('body_plain = ?');
      params.push(email.bodyPlain || null);
    }
    if (email.receivedAt !== undefined) {
      updates.push('received_at = ?');
      params.push(email.receivedAt);
    }
    if (email.read !== undefined) {
      updates.push('read = ?');
      params.push(email.read ? 1 : 0);
    }
    if (email.flagged !== undefined) {
      updates.push('flagged = ?');
      params.push(email.flagged ? 1 : 0);
    }
    if (email.status !== undefined) {
      updates.push('status = ?');
      params.push(email.status);
    }
    if (email.assignedToId !== undefined) {
      updates.push('assigned_to_id = ?');
      params.push(email.assignedToId || null);
    }
    if (email.candidateId !== undefined) {
      updates.push('candidate_id = ?');
      params.push(email.candidateId || null);
    }
    if (email.applicationId !== undefined) {
      updates.push('application_id = ?');
      params.push(email.applicationId || null);
    }
    if (email.jobId !== undefined) {
      updates.push('job_id = ?');
      params.push(email.jobId || null);
    }
    if (email.talentPoolId !== undefined) {
      updates.push('talent_pool_id = ?');
      params.push(email.talentPoolId || null);
    }
    if (email.rawData !== undefined) {
      updates.push('raw_data = ?');
      params.push(email.rawData || null);
    }
    
    // Immer das updated_at-Feld aktualisieren
    updates.push('updated_at = ?');
    params.push(now);
    
    // ID für die WHERE-Klausel
    params.push(id);
    
    // Führe die Aktualisierung durch
    const result = await db.run(`
      UPDATE incoming_emails
      SET ${updates.join(', ')}
      WHERE id = ?
    `, params);
    
    return result.changes > 0;
  }

  /**
   * Fügt einen Anhang zu einer E-Mail hinzu
   */
  private async addEmailAttachment(emailId: string, attachment: EmailAttachment): Promise<string> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    const result = await db.run(`
      INSERT INTO email_attachments (
        email_id, filename, content_type, size, content, storage_path, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      emailId,
      attachment.filename,
      attachment.contentType,
      attachment.size,
      attachment.content || null,
      attachment.storagePath || null,
      now
    ]);
    
    // Hole die ID des eingefügten Anhangs
    const inserted = await db.get('SELECT id FROM email_attachments ORDER BY rowid DESC LIMIT 1');
    return inserted.id;
  }

  /**
   * Wendet E-Mail-Regeln auf eine eingehende E-Mail an
   */
  private async applyRulesToEmail(emailId: string): Promise<void> {
    const db = await getDb();
    
    // Hole die E-Mail
    const email = await this.getIncomingEmailById(emailId);
    
    if (!email) {
      return;
    }
    
    // Hole die aktiven Regeln für die Konfiguration der E-Mail
    const rules = await db.all(`
      SELECT * FROM email_rules 
      WHERE email_configuration_id = ? AND active = 1
      ORDER BY priority DESC
    `, [email.emailConfigurationId]);
    
    // Wende die Regeln nacheinander an
    for (const rule of rules) {
      try {
        // Parse die Bedingungen und Aktionen
        const conditions = JSON.parse(rule.conditions);
        const actions = JSON.parse(rule.actions);
        
        // Überprüfe, ob die Bedingungen erfüllt sind
        if (this.evaluateRuleConditions(email, conditions)) {
          // Führe die Aktionen aus
          await this.executeRuleActions(email, actions);
          
          // Beende die Verarbeitung, wenn stopProcessing gesetzt ist
          if (actions.stopProcessing) {
            break;
          }
        }
      } catch (error) {
        console.error(`Fehler beim Anwenden der Regel ${rule.name} (${rule.id}):`, error);
      }
    }
  }

  /**
   * Überprüft, ob die Bedingungen einer Regel erfüllt sind
   */
  private evaluateRuleConditions(email: IncomingEmail, conditions: any): boolean {
    // Implementiere hier die Logik zur Überprüfung von Bedingungen
    // Beispiel:
    if (conditions.subject && email.subject.includes(conditions.subject)) {
      return true;
    }
    if (conditions.sender && email.sender.includes(conditions.sender)) {
      return true;
    }
    if (conditions.recipient && email.recipient.includes(conditions.recipient)) {
      return true;
    }
    if (conditions.body && email.body.includes(conditions.body)) {
      return true;
    }
    
    return false;
  }

  /**
   * Führt die Aktionen einer Regel aus
   */
  private async executeRuleActions(email: IncomingEmail, actions: any): Promise<void> {
    // Implementiere hier die Logik zur Ausführung von Aktionen
    // Beispiel:
    if (actions.markAsRead) {
      await this.updateIncomingEmail(email.id!, { read: true });
    }
    if (actions.assignTo) {
      await this.updateIncomingEmail(email.id!, { assignedToId: actions.assignTo });
    }
    if (actions.moveToFolder) {
      // Implementiere hier die Logik zum Verschieben in einen Ordner
    }
    if (actions.sendAutoReply && actions.autoReplyTemplate) {
      // Implementiere hier die Logik zum automatischen Antworten
    }
  }

  /**
   * Konvertiert ein Datenbank-Objekt in ein EmailConfiguration-Objekt
   */
  private mapDbConfigToEmailConfig(dbConfig: any): EmailConfiguration {
    let settings: Record<string, any> | undefined;
    
    if (dbConfig.settings) {
      try {
        settings = JSON.parse(dbConfig.settings);
      } catch (error) {
        console.error('Fehler beim Parsen der Einstellungen:', error);
      }
    }
    
    return {
      id: dbConfig.id,
      name: dbConfig.name,
      providerType: dbConfig.provider_type,
      serverUrl: dbConfig.server_url,
      apiKey: dbConfig.api_key,
      username: dbConfig.username,
      password: dbConfig.password,
      defaultSender: dbConfig.default_sender,
      signature: dbConfig.signature,
      active: Boolean(dbConfig.active),
      settings,
      createdAt: dbConfig.created_at,
      updatedAt: dbConfig.updated_at
    };
  }

  /**
   * Konvertiert ein Datenbank-Objekt in ein IncomingEmail-Objekt
   */
  private mapDbEmailToIncomingEmail(dbEmail: any): IncomingEmail {
    return {
      id: dbEmail.id,
      emailConfigurationId: dbEmail.email_configuration_id,
      externalId: dbEmail.external_id,
      sender: dbEmail.sender,
      recipient: dbEmail.recipient,
      cc: dbEmail.cc,
      bcc: dbEmail.bcc,
      subject: dbEmail.subject,
      body: dbEmail.body,
      bodyPlain: dbEmail.body_plain,
      receivedAt: dbEmail.received_at,
      read: Boolean(dbEmail.read),
      flagged: Boolean(dbEmail.flagged),
      status: dbEmail.status as 'new' | 'processed' | 'archived',
      assignedToId: dbEmail.assigned_to_id,
      candidateId: dbEmail.candidate_id,
      applicationId: dbEmail.application_id,
      jobId: dbEmail.job_id,
      talentPoolId: dbEmail.talent_pool_id,
      rawData: dbEmail.raw_data,
      createdAt: dbEmail.created_at,
      updatedAt: dbEmail.updated_at
    };
  }

  /**
   * Konvertiert ein Datenbank-Objekt in ein EmailAttachment-Objekt
   */
  private mapDbAttachmentToEmailAttachment(dbAttachment: any): EmailAttachment {
    return {
      id: dbAttachment.id,
      emailId: dbAttachment.email_id,
      filename: dbAttachment.filename,
      contentType: dbAttachment.content_type,
      size: dbAttachment.size,
      content: dbAttachment.content,
      storagePath: dbAttachment.storage_path,
      createdAt: dbAttachment.created_at
    };
  }
}
