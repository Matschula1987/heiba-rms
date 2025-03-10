import { getDb } from '@/lib/db';

/**
 * Typen für Telefonanlagen-Funktionalität
 */
export interface PhoneConfiguration {
  id?: string;
  name: string;
  providerType: 'procall' | 'asterisk' | 'twilio' | string;
  serverUrl?: string;
  apiKey?: string;
  username?: string;
  password?: string;
  extension?: string;
  active: boolean;
  settings?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserPhoneExtension {
  id?: string;
  userId: string;
  phoneConfigurationId: string;
  extension: string;
  displayName?: string;
  primaryExtension: boolean;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CallLog {
  id?: string;
  phoneConfigurationId: string;
  externalId?: string;
  callType: 'incoming' | 'outgoing' | 'missed';
  callerNumber: string;
  callerName?: string;
  recipientNumber: string;
  recipientName?: string;
  extension?: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  status: 'connected' | 'no_answer' | 'busy' | 'failed';
  recordingUrl?: string;
  notes?: string;
  userId?: string;
  candidateId?: string;
  applicationId?: string;
  jobId?: string;
  talentPoolId?: string;
  requirementId?: string;  // Neu: Kundenanforderung
  customerId?: string;     // Neu: Kunde
  createdAt?: string;
  updatedAt?: string;
}

export interface ScheduledCall {
  id?: string;
  userId: string;
  phoneNumber: string;
  contactName?: string;
  scheduledTime: string;
  notes?: string;
  status: 'pending' | 'completed' | 'cancelled';
  completedAt?: string;
  callLogId?: string;
  reminderSent: boolean;
  candidateId?: string;
  applicationId?: string;
  jobId?: string;
  talentPoolId?: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CallTemplate {
  id?: string;
  name: string;
  description?: string;
  script?: string;
  category?: string;
  estimatedDuration?: number;
  questions?: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactRoutingRule {
  id?: string;
  name: string;
  description?: string;
  phoneConfigurationId: string;
  conditions: string;
  actions: string;
  priority: number;
  active: boolean;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClickToCallAssignment {
  id?: string;
  phoneNumber: string;
  displayName?: string;
  priority: number;
  candidateId?: string;
  applicationId?: string;
  jobId?: string;
  talentPoolId?: string;
  requirementId?: string;  // Neu: Kundenanforderung
  customerId?: string;     // Neu: Kunde
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Service-Klasse für Telefonanlagen-Operationen
 */
export class PhoneService {
  /**
   * Holt alle Telefonanlagen-Konfigurationen
   */
  public async getConfigurations(): Promise<PhoneConfiguration[]> {
    const db = await getDb();
    const configs = await db.all('SELECT * FROM phone_configurations');
    return configs.map(this.mapDbConfigToPhoneConfig);
  }

  /**
   * Holt eine Telefonanlagen-Konfiguration anhand der ID
   */
  public async getConfigurationById(id: string): Promise<PhoneConfiguration | null> {
    const db = await getDb();
    const config = await db.get('SELECT * FROM phone_configurations WHERE id = ?', [id]);
    return config ? this.mapDbConfigToPhoneConfig(config) : null;
  }

  /**
   * Erstellt eine neue Telefonanlagen-Konfiguration
   */
  public async createConfiguration(config: PhoneConfiguration): Promise<string> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    // Konvertiere settings zu JSON-String, falls vorhanden
    const settingsJson = config.settings ? JSON.stringify(config.settings) : null;
    
    const result = await db.run(`
      INSERT INTO phone_configurations (
        name, provider_type, server_url, api_key, username, password, extension,
        active, settings, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      config.name,
      config.providerType,
      config.serverUrl || null,
      config.apiKey || null,
      config.username || null,
      config.password || null,
      config.extension || null,
      config.active ? 1 : 0,
      settingsJson,
      now,
      now
    ]);
    
    // Hole die ID der eingefügten Konfiguration
    const inserted = await db.get('SELECT id FROM phone_configurations ORDER BY rowid DESC LIMIT 1');
    return inserted.id;
  }

  /**
   * Aktualisiert eine Telefonanlagen-Konfiguration
   */
  public async updateConfiguration(id: string, config: Partial<PhoneConfiguration>): Promise<boolean> {
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
    if (config.extension !== undefined) {
      updates.push('extension = ?');
      params.push(config.extension || null);
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
      UPDATE phone_configurations
      SET ${updates.join(', ')}
      WHERE id = ?
    `, params);
    
    return result.changes > 0;
  }

  /**
   * Löscht eine Telefonanlagen-Konfiguration
   */
  public async deleteConfiguration(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.run('DELETE FROM phone_configurations WHERE id = ?', [id]);
    return result.changes > 0;
  }

  /**
   * Holt alle Durchwahlen eines Benutzers
   */
  public async getUserExtensions(userId: string): Promise<UserPhoneExtension[]> {
    const db = await getDb();
    const extensions = await db.all(
      'SELECT * FROM user_phone_extensions WHERE user_id = ?',
      [userId]
    );
    return extensions.map(this.mapDbExtensionToUserPhoneExtension);
  }

  /**
   * Erstellt eine neue Durchwahl für einen Benutzer
   */
  public async createUserExtension(extension: UserPhoneExtension): Promise<string> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    // Wenn diese Durchwahl die primäre ist, setze alle anderen auf nicht-primär
    if (extension.primaryExtension) {
      await db.run(
        'UPDATE user_phone_extensions SET primary_extension = 0 WHERE user_id = ?',
        [extension.userId]
      );
    }
    
    const result = await db.run(`
      INSERT INTO user_phone_extensions (
        user_id, phone_configuration_id, extension, display_name,
        primary_extension, active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      extension.userId,
      extension.phoneConfigurationId,
      extension.extension,
      extension.displayName || null,
      extension.primaryExtension ? 1 : 0,
      extension.active ? 1 : 0,
      now,
      now
    ]);
    
    // Hole die ID der eingefügten Durchwahl
    const inserted = await db.get('SELECT id FROM user_phone_extensions ORDER BY rowid DESC LIMIT 1');
    return inserted.id;
  }

  /**
   * Protokolliert einen Anruf
   */
  public async logCall(call: CallLog): Promise<string> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    const result = await db.run(`
      INSERT INTO call_logs (
        phone_configuration_id, external_id, call_type, caller_number, caller_name,
        recipient_number, recipient_name, extension, start_time, end_time,
        duration, status, recording_url, notes, user_id, candidate_id,
        application_id, job_id, talent_pool_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      call.phoneConfigurationId,
      call.externalId || null,
      call.callType,
      call.callerNumber,
      call.callerName || null,
      call.recipientNumber,
      call.recipientName || null,
      call.extension || null,
      call.startTime,
      call.endTime || null,
      call.duration || null,
      call.status,
      call.recordingUrl || null,
      call.notes || null,
      call.userId || null,
      call.candidateId || null,
      call.applicationId || null,
      call.jobId || null,
      call.talentPoolId || null,
      now,
      now
    ]);
    
    // Hole die ID des eingefügten Anrufprotokolls
    const inserted = await db.get('SELECT id FROM call_logs ORDER BY rowid DESC LIMIT 1');
    const callId = inserted.id;
    
    // Wenn dies ein ausgehender Anruf war, prüfe, ob er einem geplanten Anruf entspricht
    if (call.callType === 'outgoing' && call.userId) {
      await this.checkScheduledCalls(callId, call);
    }
    
    return callId;
  }

  /**
   * Prüft, ob ein Anruf einem geplanten Anruf entspricht und aktualisiert dessen Status
   */
  private async checkScheduledCalls(callLogId: string, call: CallLog): Promise<void> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    // Suche nach einem passenden geplanten Anruf
    const scheduledCall = await db.get(`
      SELECT * FROM scheduled_calls
      WHERE user_id = ? AND phone_number = ? AND status = 'pending'
      ORDER BY ABS(JULIANDAY(scheduled_time) - JULIANDAY(?))
      LIMIT 1
    `, [call.userId, call.recipientNumber, call.startTime]);
    
    if (scheduledCall) {
      // Aktualisiere den geplanten Anruf
      await db.run(`
        UPDATE scheduled_calls
        SET status = 'completed', completed_at = ?, call_log_id = ?, updated_at = ?
        WHERE id = ?
      `, [call.startTime, callLogId, now, scheduledCall.id]);
    }
  }

  /**
   * Holt Anrufprotokolle mit Filter-Optionen
   */
  public async getCallLogs(options: {
    userId?: string;
    candidateId?: string;
    applicationId?: string;
    jobId?: string;
    talentPoolId?: string;
    startDate?: string;
    endDate?: string;
    callType?: string;
    status?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<CallLog[]> {
    const db = await getDb();
    
    // Baue die WHERE-Klausel basierend auf den Optionen
    const where = [];
    const params = [];
    
    if (options.userId) {
      where.push('user_id = ?');
      params.push(options.userId);
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
    if (options.startDate) {
      where.push('start_time >= ?');
      params.push(options.startDate);
    }
    if (options.endDate) {
      where.push('start_time <= ?');
      params.push(options.endDate);
    }
    if (options.callType) {
      where.push('call_type = ?');
      params.push(options.callType);
    }
    if (options.status) {
      where.push('status = ?');
      params.push(options.status);
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
      SELECT * FROM call_logs
      ${where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY start_time DESC
      ${limitOffset}
    `;
    
    const calls = await db.all(query, params);
    return calls.map(this.mapDbCallToCallLog);
  }

  /**
   * Aktualisiert ein Anrufprotokoll
   */
  public async updateCallLog(id: string, call: Partial<CallLog>): Promise<boolean> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    // Baue die SQL-Abfrage dynamisch
    const updates = [];
    const params = [];
    
    // Füge nur die Felder hinzu, die aktualisiert werden sollen
    if (call.phoneConfigurationId !== undefined) {
      updates.push('phone_configuration_id = ?');
      params.push(call.phoneConfigurationId);
    }
    if (call.externalId !== undefined) {
      updates.push('external_id = ?');
      params.push(call.externalId || null);
    }
    if (call.callType !== undefined) {
      updates.push('call_type = ?');
      params.push(call.callType);
    }
    if (call.callerNumber !== undefined) {
      updates.push('caller_number = ?');
      params.push(call.callerNumber);
    }
    if (call.callerName !== undefined) {
      updates.push('caller_name = ?');
      params.push(call.callerName || null);
    }
    if (call.recipientNumber !== undefined) {
      updates.push('recipient_number = ?');
      params.push(call.recipientNumber);
    }
    if (call.recipientName !== undefined) {
      updates.push('recipient_name = ?');
      params.push(call.recipientName || null);
    }
    if (call.extension !== undefined) {
      updates.push('extension = ?');
      params.push(call.extension || null);
    }
    if (call.startTime !== undefined) {
      updates.push('start_time = ?');
      params.push(call.startTime);
    }
    if (call.endTime !== undefined) {
      updates.push('end_time = ?');
      params.push(call.endTime || null);
    }
    if (call.duration !== undefined) {
      updates.push('duration = ?');
      params.push(call.duration || null);
    }
    if (call.status !== undefined) {
      updates.push('status = ?');
      params.push(call.status);
    }
    if (call.recordingUrl !== undefined) {
      updates.push('recording_url = ?');
      params.push(call.recordingUrl || null);
    }
    if (call.notes !== undefined) {
      updates.push('notes = ?');
      params.push(call.notes || null);
    }
    if (call.userId !== undefined) {
      updates.push('user_id = ?');
      params.push(call.userId || null);
    }
    if (call.candidateId !== undefined) {
      updates.push('candidate_id = ?');
      params.push(call.candidateId || null);
    }
    if (call.applicationId !== undefined) {
      updates.push('application_id = ?');
      params.push(call.applicationId || null);
    }
    if (call.jobId !== undefined) {
      updates.push('job_id = ?');
      params.push(call.jobId || null);
    }
    if (call.talentPoolId !== undefined) {
      updates.push('talent_pool_id = ?');
      params.push(call.talentPoolId || null);
    }
    
    // Immer das updated_at-Feld aktualisieren
    updates.push('updated_at = ?');
    params.push(now);
    
    // ID für die WHERE-Klausel
    params.push(id);
    
    // Führe die Aktualisierung durch
    const result = await db.run(`
      UPDATE call_logs
      SET ${updates.join(', ')}
      WHERE id = ?
    `, params);
    
    return result.changes > 0;
  }

  /**
   * Plant einen Anruf
   */
  public async scheduleCall(call: ScheduledCall): Promise<string> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    const result = await db.run(`
      INSERT INTO scheduled_calls (
        user_id, phone_number, contact_name, scheduled_time, notes,
        status, reminder_sent, candidate_id, application_id, job_id,
        talent_pool_id, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      call.userId,
      call.phoneNumber,
      call.contactName || null,
      call.scheduledTime,
      call.notes || null,
      call.status || 'pending',
      call.reminderSent ? 1 : 0,
      call.candidateId || null,
      call.applicationId || null,
      call.jobId || null,
      call.talentPoolId || null,
      call.createdBy,
      now,
      now
    ]);
    
    // Hole die ID des eingefügten geplanten Anrufs
    const inserted = await db.get('SELECT id FROM scheduled_calls ORDER BY rowid DESC LIMIT 1');
    return inserted.id;
  }

  /**
   * Holt geplante Anrufe für einen Benutzer
   */
  public async getScheduledCalls(userId: string, includeCompleted: boolean = false): Promise<ScheduledCall[]> {
    const db = await getDb();
    
    // Hole geplante Anrufe
    const query = `
      SELECT sc.*, cl.* 
      FROM scheduled_calls sc
      LEFT JOIN call_logs cl ON sc.call_log_id = cl.id
      WHERE sc.user_id = ? ${includeCompleted ? '' : "AND sc.status = 'pending'"}
      ORDER BY sc.scheduled_time ASC
    `;
    
    const calls = await db.all(query, [userId]);
    
    // Konvertiere die Ergebnisse
    return calls.map((call: any) => {
      const scheduledCall = this.mapDbScheduledCallToScheduledCall(call);
      
      // Füge Anrufprotokoll hinzu, falls vorhanden
      if (call.call_log_id) {
        scheduledCall.callLogId = call.call_log_id;
      }
      
      return scheduledCall;
    });
  }

  /**
   * Aktualisiert einen geplanten Anruf
   */
  public async updateScheduledCall(id: string, call: Partial<ScheduledCall>): Promise<boolean> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    // Baue die SQL-Abfrage dynamisch
    const updates = [];
    const params = [];
    
    // Füge nur die Felder hinzu, die aktualisiert werden sollen
    if (call.userId !== undefined) {
      updates.push('user_id = ?');
      params.push(call.userId);
    }
    if (call.phoneNumber !== undefined) {
      updates.push('phone_number = ?');
      params.push(call.phoneNumber);
    }
    if (call.contactName !== undefined) {
      updates.push('contact_name = ?');
      params.push(call.contactName || null);
    }
    if (call.scheduledTime !== undefined) {
      updates.push('scheduled_time = ?');
      params.push(call.scheduledTime);
    }
    if (call.notes !== undefined) {
      updates.push('notes = ?');
      params.push(call.notes || null);
    }
    if (call.status !== undefined) {
      updates.push('status = ?');
      params.push(call.status);
    }
    if (call.completedAt !== undefined) {
      updates.push('completed_at = ?');
      params.push(call.completedAt || null);
    }
    if (call.callLogId !== undefined) {
      updates.push('call_log_id = ?');
      params.push(call.callLogId || null);
    }
    if (call.reminderSent !== undefined) {
      updates.push('reminder_sent = ?');
      params.push(call.reminderSent ? 1 : 0);
    }
    if (call.candidateId !== undefined) {
      updates.push('candidate_id = ?');
      params.push(call.candidateId || null);
    }
    if (call.applicationId !== undefined) {
      updates.push('application_id = ?');
      params.push(call.applicationId || null);
    }
    if (call.jobId !== undefined) {
      updates.push('job_id = ?');
      params.push(call.jobId || null);
    }
    if (call.talentPoolId !== undefined) {
      updates.push('talent_pool_id = ?');
      params.push(call.talentPoolId || null);
    }
    
    // Immer das updated_at-Feld aktualisieren
    updates.push('updated_at = ?');
    params.push(now);
    
    // ID für die WHERE-Klausel
    params.push(id);
    
    // Führe die Aktualisierung durch
    const result = await db.run(`
      UPDATE scheduled_calls
      SET ${updates.join(', ')}
      WHERE id = ?
    `, params);
    
    return result.changes > 0;
  }

  /**
   * Initiiert einen Click-to-Call-Anruf
   * 
   * Diese Funktion leitet die Anfrage an den entsprechenden Provider-Adapter weiter
   */
  public async initiateClickToCall(userId: string, phoneNumber: string, displayName?: string): Promise<boolean> {
    // Hole die primäre Durchwahl des Benutzers
    const extensions = await this.getUserExtensions(userId);
    const primaryExtension = extensions.find(ext => ext.primaryExtension && ext.active);
    
    if (!primaryExtension) {
      throw new Error('Keine aktive primäre Durchwahl für diesen Benutzer gefunden');
    }
    
    // Hole die Konfiguration für den Provider
    const config = await this.getConfigurationById(primaryExtension.phoneConfigurationId);
    
    if (!config || !config.active) {
      throw new Error('Keine aktive Telefonanlagenkonfiguration gefunden');
    }
    
    // Je nach Provider-Typ den entsprechenden Adapter verwenden
    switch (config.providerType) {
      case 'procall':
        // Hier würde normalerweise der ProCallAdapter verwendet werden
        console.log('Click-to-Call mit ProCall wird initiiert');
        return true;
      
      case 'asterisk':
        // Hier würde normalerweise der AsteriskAdapter verwendet werden
        console.log('Click-to-Call mit Asterisk wird initiiert');
        return true;
      
      case 'twilio':
        // Hier würde normalerweise der TwilioAdapter verwendet werden
        console.log('Click-to-Call mit Twilio wird initiiert');
        return true;
      
      default:
        throw new Error(`Unbekannter Provider-Typ: ${config.providerType}`);
    }
  }
  
  /**
   * Erstellt eine Click-to-Call-Zuweisung, die in der Benutzeroberfläche angezeigt werden kann
   */
  public async createClickToCallAssignment(assignment: ClickToCallAssignment): Promise<string> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    const result = await db.run(`
      INSERT INTO click_to_call_assignments (
        phone_number, display_name, priority, candidate_id,
        application_id, job_id, talent_pool_id, requirement_id,
        customer_id, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      assignment.phoneNumber,
      assignment.displayName || null,
      assignment.priority || 0,
      assignment.candidateId || null,
      assignment.applicationId || null,
      assignment.jobId || null,
      assignment.talentPoolId || null,
      assignment.requirementId || null,
      assignment.customerId || null,
      assignment.createdBy,
      now,
      now
    ]);
    
    // Hole die ID der eingefügten Zuweisung
    const inserted = await db.get('SELECT id FROM click_to_call_assignments ORDER BY rowid DESC LIMIT 1');
    return inserted.id;
  }

  /**
   * Konvertiert ein Datenbank-Objekt in ein PhoneConfiguration-Objekt
   */
  private mapDbConfigToPhoneConfig(dbConfig: any): PhoneConfiguration {
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
      extension: dbConfig.extension,
      active: Boolean(dbConfig.active),
      settings,
      createdAt: dbConfig.created_at,
      updatedAt: dbConfig.updated_at
    };
  }

  /**
   * Konvertiert ein Datenbank-Objekt in ein UserPhoneExtension-Objekt
   */
  private mapDbExtensionToUserPhoneExtension(dbExtension: any): UserPhoneExtension {
    return {
      id: dbExtension.id,
      userId: dbExtension.user_id,
      phoneConfigurationId: dbExtension.phone_configuration_id,
      extension: dbExtension.extension,
      displayName: dbExtension.display_name,
      primaryExtension: Boolean(dbExtension.primary_extension),
      active: Boolean(dbExtension.active),
      createdAt: dbExtension.created_at,
      updatedAt: dbExtension.updated_at
    };
  }

  /**
   * Konvertiert ein Datenbank-Objekt in ein ScheduledCall-Objekt
   */
  private mapDbScheduledCallToScheduledCall(dbCall: any): ScheduledCall {
    return {
      id: dbCall.id,
      userId: dbCall.user_id,
      phoneNumber: dbCall.phone_number,
      contactName: dbCall.contact_name,
      scheduledTime: dbCall.scheduled_time,
      notes: dbCall.notes,
      status: dbCall.status as 'pending' | 'completed' | 'cancelled',
      completedAt: dbCall.completed_at,
      callLogId: dbCall.call_log_id,
      reminderSent: Boolean(dbCall.reminder_sent),
      candidateId: dbCall.candidate_id,
      applicationId: dbCall.application_id,
      jobId: dbCall.job_id,
      talentPoolId: dbCall.talent_pool_id,
      createdBy: dbCall.created_by,
      createdAt: dbCall.created_at,
      updatedAt: dbCall.updated_at
    };
  }

  /**
   * Konvertiert ein Datenbank-Objekt in ein CallLog-Objekt
   */
  private mapDbCallToCallLog(dbCall: any): CallLog {
    return {
      id: dbCall.id,
      phoneConfigurationId: dbCall.phone_configuration_id,
      externalId: dbCall.external_id,
      callType: dbCall.call_type as 'incoming' | 'outgoing' | 'missed',
      callerNumber: dbCall.caller_number,
      callerName: dbCall.caller_name,
      recipientNumber: dbCall.recipient_number,
      recipientName: dbCall.recipient_name,
      extension: dbCall.extension,
      startTime: dbCall.start_time,
      endTime: dbCall.end_time,
      duration: dbCall.duration,
      status: dbCall.status as 'connected' | 'no_answer' | 'busy' | 'failed',
      recordingUrl: dbCall.recording_url,
      notes: dbCall.notes,
      userId: dbCall.user_id,
      candidateId: dbCall.candidate_id,
      applicationId: dbCall.application_id,
      jobId: dbCall.job_id,
      talentPoolId: dbCall.talent_pool_id,
      requirementId: dbCall.requirement_id,
      customerId: dbCall.customer_id,
      createdAt: dbCall.created_at,
      updatedAt: dbCall.updated_at
    };
  }
}
