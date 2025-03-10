import { getDb } from '@/lib/db';
import {
  FollowupAction,
  FollowupActionWithDetails,
  FollowupPriority,
  FollowupRule,
  FollowupStatus,
  FollowupTemplate,
  FollowupTriggerEvent,
  ProfileSubmissionFollowup,
  ProfileSubmissionStatus
} from '@/types/followup';
import { notificationService } from '@/lib/notificationService';
import { NotificationImportance } from '@/types/notifications';
import { format, addDays, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

/**
 * Service-Klasse für das Nachverfolgungssystem
 */
export class FollowupService {
  /**
   * Erstellt eine neue Nachfassaktion
   */
  public async createFollowupAction(action: FollowupAction): Promise<string> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    // Stelle sicher, dass die dueDate ein ISO-String ist
    const dueDate = typeof action.dueDate === 'string' 
      ? action.dueDate 
      : format(action.dueDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
    
    const result = await db.run(`
      INSERT INTO followup_actions (
        title, description, due_date, completed, priority, action_type,
        assigned_to, assigned_by, reminder_sent, reminder_date,
        candidate_id, application_id, job_id, talent_pool_id,
        notes, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      action.title,
      action.description || null,
      dueDate,
      action.completed ? 1 : 0,
      action.priority,
      action.actionType,
      action.assignedTo,
      action.assignedBy,
      action.reminderSent ? 1 : 0,
      action.reminderDate || null,
      action.candidateId || null,
      action.applicationId || null,
      action.jobId || null,
      action.talentPoolId || null,
      action.notes || null,
      action.status,
      now,
      now
    ]);
    
    // Hole die ID der eingefügten Aktion
    const inserted = await db.get('SELECT id FROM followup_actions ORDER BY rowid DESC LIMIT 1');
    const actionId = inserted.id;
    
    // Protokolliere die Erstellung
    await this.logFollowupAction(actionId, 'create', action.assignedBy);
    
    // Benachrichtige den zugewiesenen Benutzer, wenn es nicht der Ersteller ist
    if (action.assignedTo !== action.assignedBy) {
      await this.notifyAssignee(actionId, action);
    }
    
    return actionId;
  }
  
  /**
   * Erstellt eine neue Nachfassaktion basierend auf einer Regel für ein Ereignis
   */
  public async createFollowupFromRule(
    rule: FollowupRule,
    triggerEntityId: string,
    triggerEntityType: string,
    triggeredBy: string
  ): Promise<string | null> {
    if (!rule.isActive) {
      return null;
    }
    
    const db = await getDb();
    
    // Bestimme den zugewiesenen Benutzer basierend auf dem Zuweisungstyp
    let assignedTo = '';
    
    if (rule.assignedToType === 'specific_user' && rule.assignedToUserId) {
      assignedTo = rule.assignedToUserId;
    } else if (rule.assignedToType === 'creator') {
      assignedTo = triggeredBy;
    } else {
      // Bei 'manager' oder 'recruiter' würden wir normalerweise eine Logik implementieren,
      // um den zuständigen Manager oder Recruiter zu ermitteln
      // Für dieses Beispiel verwenden wir den Auslöser als Fallback
      assignedTo = triggeredBy;
    }
    
    // Berechne das Fälligkeitsdatum basierend auf dem Offset
    const dueDate = addDays(new Date(), rule.daysOffset).toISOString();
    
    // Hole die Template-Inhalte, falls vorhanden
    let title = `Nachfassaktion: ${rule.name}`;
    let templateContent = '';
    
    if (rule.templateId) {
      const template = await db.get(
        'SELECT * FROM followup_templates WHERE id = ?',
        [rule.templateId]
      );
      
      if (template) {
        title = template.name;
        templateContent = template.template_content || '';
      }
    }
    
    // Setze die entsprechenden Entity-IDs basierend auf dem Typ
    let candidateId: string | undefined = undefined;
    let applicationId: string | undefined = undefined;
    let jobId: string | undefined = undefined;
    let talentPoolId: string | undefined = undefined;
    
    if (triggerEntityType === 'candidate') {
      candidateId = triggerEntityId;
    } else if (triggerEntityType === 'application') {
      applicationId = triggerEntityId;
    } else if (triggerEntityType === 'job') {
      jobId = triggerEntityId;
    } else if (triggerEntityType === 'talent_pool') {
      talentPoolId = triggerEntityId;
    }
    
    // Erstelle die Nachfassaktion
    const action: FollowupAction = {
      title,
      description: rule.description,
      dueDate,
      completed: false,
      priority: rule.priority,
      actionType: rule.actionType,
      assignedTo,
      assignedBy: triggeredBy,
      reminderSent: false,
      candidateId,
      applicationId,
      jobId,
      talentPoolId,
      notes: templateContent,
      status: 'pending'
    };
    
    return this.createFollowupAction(action);
  }
  
  /**
   * Erstellt eine Profilversand-Nachverfolgung mit der 2-Tage-Erinnerung
   */
  public async createProfileSubmissionFollowup(
    data: {
      applicationId: string;
      customerId: string;
      sentBy: string;
    }
  ): Promise<string> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    // Erstelle den Eintrag
    const result = await db.run(`
      INSERT INTO profile_submission_followups (
        application_id, customer_id, sent_by, sent_at, 
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      data.applicationId,
      data.customerId,
      data.sentBy,
      now,
      'pending',
      now,
      now
    ]);
    
    // Hole die ID des eingefügten Eintrags
    const inserted = await db.get('SELECT id FROM profile_submission_followups ORDER BY rowid DESC LIMIT 1');
    const profileSubmissionId = inserted.id;
    
    // Erstelle eine Nachfassaktion für 2 Tage später
    const dueDate = addDays(new Date(), 2).toISOString();
    
    // Hole Anwendungsinformationen
    const applicationInfo = await db.get(`
      SELECT a.*, j.title as job_title, c.first_name || ' ' || c.last_name as candidate_name
      FROM applications a
      LEFT JOIN jobs j ON a.job_id = j.id
      LEFT JOIN candidates c ON a.candidate_id = c.id
      WHERE a.id = ?
    `, [data.applicationId]);
    
    // Hole Kundeninformationen
    const customerInfo = await db.get('SELECT * FROM customers WHERE id = ?', [data.customerId]);
    
    const title = `Nachfassen nach Profilversand: ${applicationInfo?.candidate_name || 'Kandidat'} für ${applicationInfo?.job_title || 'Stelle'}`;
    const description = `Nachfassen bei ${customerInfo?.name || 'Kunde'} bezüglich des gesendeten Profils.`;
    
    const action: FollowupAction = {
      title,
      description,
      dueDate,
      completed: false,
      priority: 'high',
      actionType: 'call',
      assignedTo: data.sentBy,
      assignedBy: data.sentBy,
      reminderSent: false,
      applicationId: data.applicationId,
      notes: `Nachfassen bezüglich des Profils, das an ${customerInfo?.name || 'Kunde'} gesendet wurde. Fragen Sie nach Feedback und nächsten Schritten.`,
      status: 'pending'
    };
    
    const actionId = await this.createFollowupAction(action);
    
    // Verknüpfe die Nachfassaktion mit dem Profilversand
    await db.run(`
      UPDATE profile_submission_followups
      SET followup_action_id = ?
      WHERE id = ?
    `, [actionId, profileSubmissionId]);
    
    return profileSubmissionId;
  }
  
  /**
   * Aktualisiert den Status einer Nachfassaktion
   */
  public async updateFollowupActionStatus(
    id: string,
    status: FollowupStatus,
    userId: string,
    completedAt?: string
  ): Promise<boolean> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    // Setze completedAt, wenn der Status auf 'completed' gesetzt wird
    let completed = 0;
    let completed_at = null;
    
    if (status === 'completed') {
      completed = 1;
      completed_at = completedAt || now;
    }
    
    const result = await db.run(`
      UPDATE followup_actions
      SET status = ?, completed = ?, completed_at = ?, updated_at = ?
      WHERE id = ?
    `, [status, completed, completed_at, now, id]);
    
    if (result.changes > 0) {
      // Protokolliere die Aktualisierung
      await this.logFollowupAction(
        id,
        status === 'completed' ? 'complete' : 
        status === 'cancelled' ? 'cancel' : 'update',
        userId
      );
      
      // Überprüfe, ob dies eine Profilversand-Nachfassaktion ist und aktualisiere ggf. den Status
      if (status === 'completed') {
        await db.run(`
          UPDATE profile_submission_followups
          SET status = 'followed_up', updated_at = ?
          WHERE followup_action_id = ?
        `, [now, id]);
      }
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Markiert eine Nachfassaktion als erledigt
   */
  public async completeFollowupAction(id: string, userId: string, notes?: string): Promise<boolean> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    const result = await db.run(`
      UPDATE followup_actions
      SET status = 'completed', completed = 1, completed_at = ?, updated_at = ?, notes = CASE WHEN ? IS NOT NULL THEN ? ELSE notes END
      WHERE id = ?
    `, [now, now, notes, notes, id]);
    
    if (result.changes > 0) {
      // Protokolliere die Erledigung
      await this.logFollowupAction(id, 'complete', userId, notes ? { notes } : undefined);
      
      // Überprüfe, ob dies eine Profilversand-Nachfassaktion ist und aktualisiere ggf. den Status
      await db.run(`
        UPDATE profile_submission_followups
        SET status = 'followed_up', updated_at = ?
        WHERE followup_action_id = ?
      `, [now, id]);
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Aktualisiert den Status einer Profilversand-Nachverfolgung
   */
  public async updateProfileSubmissionStatus(
    id: string,
    status: ProfileSubmissionStatus,
    userId: string,
    responseDetails?: string
  ): Promise<boolean> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    // Aktualisiere den Status und ggf. die Antwortdetails
    const updates: string[] = [];
    const params: any[] = [];
    
    updates.push('status = ?');
    params.push(status);
    
    updates.push('updated_at = ?');
    params.push(now);
    
    if (status === 'response_received') {
      updates.push('response_received_at = ?');
      params.push(now);
      
      if (responseDetails) {
        updates.push('response_details = ?');
        params.push(responseDetails);
      }
    }
    
    // ID für die WHERE-Klausel
    params.push(id);
    
    const result = await db.run(`
      UPDATE profile_submission_followups
      SET ${updates.join(', ')}
      WHERE id = ?
    `, params);
    
    if (result.changes > 0) {
      // Wenn eine Antwort erhalten wurde, aktualisiere auch die zugehörige Nachfassaktion
      if (status === 'response_received') {
        const submission = await db.get(
          'SELECT followup_action_id FROM profile_submission_followups WHERE id = ?',
          [id]
        );
        
        if (submission && submission.followup_action_id) {
          await this.completeFollowupAction(
            submission.followup_action_id,
            userId,
            `Antwort erhalten: ${responseDetails || 'Keine Details angegeben'}`
          );
        }
      }
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Holt Nachfassaktionen mit Filteroptionen
   */
  public async getFollowupActions(options: {
    userId?: string;
    candidateId?: string;
    applicationId?: string;
    jobId?: string;
    talentPoolId?: string;
    status?: FollowupStatus | FollowupStatus[];
    priority?: FollowupPriority;
    dueBeforeDate?: string;
    dueAfterDate?: string;
    limit?: number;
    offset?: number;
    includeCompleted?: boolean;
  } = {}): Promise<FollowupAction[]> {
    const db = await getDb();
    
    // Baue die WHERE-Klausel basierend auf den Optionen
    const where: string[] = [];
    const params: any[] = [];
    
    if (options.userId) {
      where.push('assigned_to = ?');
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
    
    if (options.status) {
      if (Array.isArray(options.status)) {
        where.push(`status IN (${options.status.map(() => '?').join(', ')})`);
        params.push(...options.status);
      } else {
        where.push('status = ?');
        params.push(options.status);
      }
    } else if (!options.includeCompleted) {
      where.push("status != 'completed'");
    }
    
    if (options.priority) {
      where.push('priority = ?');
      params.push(options.priority);
    }
    
    if (options.dueBeforeDate) {
      where.push('due_date <= ?');
      params.push(options.dueBeforeDate);
    }
    
    if (options.dueAfterDate) {
      where.push('due_date >= ?');
      params.push(options.dueAfterDate);
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
      SELECT * FROM followup_actions
      ${where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY due_date ASC
      ${limitOffset}
    `;
    
    const actions = await db.all(query, params);
    
    // Konvertiere die Ergebnisse
    return actions.map(this.mapDbActionToFollowupAction);
  }
  
  /**
   * Holt Nachfassaktionen mit zusätzlichen Details
   */
  public async getFollowupActionsWithDetails(options: any = {}): Promise<FollowupActionWithDetails[]> {
    const db = await getDb();
    
    // Baue die WHERE-Klausel basierend auf den Optionen (wie in getFollowupActions)
    const where: string[] = [];
    const params: any[] = [];
    
    // (Bedingungen wie in getFollowupActions)
    
    // Führe die Abfrage mit JOINs durch
    const query = `
      SELECT 
        fa.*,
        c.first_name || ' ' || c.last_name as candidate_name,
        a.title as application_title,
        j.title as job_title,
        tp.name as talent_pool_name,
        u1.display_name as assigned_to_name,
        u2.display_name as assigned_by_name
      FROM followup_actions fa
      LEFT JOIN candidates c ON fa.candidate_id = c.id
      LEFT JOIN applications a ON fa.application_id = a.id
      LEFT JOIN jobs j ON fa.job_id = j.id
      LEFT JOIN talent_pool tp ON fa.talent_pool_id = tp.id
      LEFT JOIN users u1 ON fa.assigned_to = u1.id
      LEFT JOIN users u2 ON fa.assigned_by = u2.id
      ${where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY fa.due_date ASC
    `;
    
    const actions = await db.all(query, params);
    
    // Konvertiere die Ergebnisse
    return actions.map(this.mapDbActionToFollowupActionWithDetails);
  }
  
  /**
   * Holt Regeln für einen Auslöser
   */
  public async getRulesForTrigger(
    triggerEvent: FollowupTriggerEvent,
    entityType: string
  ): Promise<FollowupRule[]> {
    const db = await getDb();
    
    const rules = await db.all(`
      SELECT * FROM followup_rules
      WHERE trigger_event = ? AND entity_type = ? AND is_active = 1
    `, [triggerEvent, entityType]);
    
    return rules.map(this.mapDbRuleToFollowupRule);
  }
  
  /**
   * Holt Vorlagen für einen Auslöser und eine Anwendbarkeit
   */
  public async getTemplatesForTrigger(
    triggerEvent: FollowupTriggerEvent,
    applicability: string
  ): Promise<FollowupTemplate[]> {
    const db = await getDb();
    
    const templates = await db.all(`
      SELECT * FROM followup_templates
      WHERE trigger_on = ? AND applicability = ? AND is_active = 1
    `, [triggerEvent, applicability]);
    
    return templates.map(this.mapDbTemplateToFollowupTemplate);
  }
  
  /**
   * Erstellt einen Protokolleintrag für eine Nachfassaktion
   */
  private async logFollowupAction(
    followupActionId: string,
    actionType: 'create' | 'update' | 'complete' | 'cancel' | 'remind',
    userId: string,
    details?: any
  ): Promise<void> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    await db.run(`
      INSERT INTO followup_logs (
        followup_action_id, action_type, user_id, details, created_at
      ) VALUES (?, ?, ?, ?, ?)
    `, [
      followupActionId,
      actionType,
      userId,
      details ? JSON.stringify(details) : null,
      now
    ]);
  }
  
  /**
   * Benachrichtigt den zugewiesenen Benutzer über eine neue Nachfassaktion
   */
  private async notifyAssignee(actionId: string, action: FollowupAction): Promise<void> {
    // Formatiere das Fälligkeitsdatum
    const dueDateFormatted = format(
      typeof action.dueDate === 'string' ? parseISO(action.dueDate) : action.dueDate,
      'd. MMMM yyyy',
      { locale: de }
    );
    
    // Erstelle die Benachrichtigung
    const notification = {
      userId: action.assignedTo,
      title: `Neue Nachfassaktion: ${action.title}`,
      message: `Dir wurde eine neue Nachfassaktion zugewiesen: "${action.title}". Fällig am ${dueDateFormatted}.`,
      type: 'followup',
      priority: action.priority === 'high' ? 'high' : 'normal' as NotificationImportance,
      link: `/dashboard/followups/${actionId}`
    };
    
    const notificationId = await notificationService.notifyUser(notification);
    
    if (notificationId) {
      // Verknüpfe die Benachrichtigung mit der Nachfassaktion
      const db = await getDb();
      await db.run(`
        INSERT INTO notification_followup_links (
          notification_id, followup_action_id, created_at
        ) VALUES (?, ?, ?)
      `, [notificationId, actionId, new Date().toISOString()]);
    }
  }
  
  /**
   * Überprüft auf fällige Nachfassaktionen und sendet Erinnerungen
   */
  public async checkDueFollowups(): Promise<number> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    // Hole alle fälligen, nicht abgeschlossenen Nachfassaktionen ohne gesendete Erinnerung
    const dueActions = await db.all(`
      SELECT * FROM followup_actions
      WHERE due_date <= ? AND status IN ('pending', 'in_progress') 
      AND reminder_sent = 0
    `, [now]);
    
    let reminderCount = 0;
    
    for (const action of dueActions) {
      // Erstelle die Benachrichtigung
      const notification = {
        userId: action.assigned_to,
        title: `Erinnerung: ${action.title}`,
        message: `Die Nachfassaktion "${action.title}" ist jetzt fällig.`,
        type: 'followup_reminder',
        priority: action.priority === 'high' ? 'high' : 'normal' as NotificationImportance,
        link: `/dashboard/followups/${action.id}`
      };
      
      const notificationId = await notificationService.notifyUser(notification);
      
      if (notificationId) {
        // Markiere die Erinnerung als gesendet
        await db.run(`
          UPDATE followup_actions
          SET reminder_sent = 1, reminder_date = ?, updated_at = ?
          WHERE id = ?
        `, [now, now, action.id]);
        
        // Protokolliere die Erinnerung
        await this.logFollowupAction(action.id, 'remind', 'system');
        
        reminderCount++;
      }
    }
    
    return reminderCount;
  }
  
  /**
   * Überwacht den Status der 2-Tage-Nachfassungen nach Profilversand
   * und markiert solche ohne Antwort entsprechend
   */
  public async checkProfileSubmissionFollowups(): Promise<number> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    // Hole alle Profilversand-Nachverfolgungen, die älter als 5 Tage sind und noch auf "followed_up" stehen
    const cutoffDate = format(addDays(new Date(), -5), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
    
    const submissions = await db.all(`
      SELECT * FROM profile_submission_followups
      WHERE status = 'followed_up' AND sent_at <= ?
    `, [cutoffDate]);
    
    let updateCount = 0;
    
    for (const submission of submissions) {
      // Aktualisiere auf "no_response"
      await db.run(`
        UPDATE profile_submission_followups
        SET status = 'no_response', updated_at = ?
        WHERE id = ?
      `, [now, submission.id]);
      
      updateCount++;
    }
    
    return updateCount;
  }
  
  /**
   * Konvertiert ein Datenbank-Objekt in ein FollowupAction-Objekt
   */
  private mapDbActionToFollowupAction(dbAction: any): FollowupAction {
    return {
      id: dbAction.id,
      title: dbAction.title,
      description: dbAction.description,
      dueDate: dbAction.due_date,
      completed: Boolean(dbAction.completed),
      completedAt: dbAction.completed_at,
      priority: dbAction.priority as FollowupPriority,
      actionType: dbAction.action_type,
      assignedTo: dbAction.assigned_to,
      assignedBy: dbAction.assigned_by,
      reminderSent: Boolean(dbAction.reminder_sent),
      reminderDate: dbAction.reminder_date,
      candidateId: dbAction.candidate_id,
      applicationId: dbAction.application_id,
      jobId: dbAction.job_id,
      talentPoolId: dbAction.talent_pool_id,
      notes: dbAction.notes,
      status: dbAction.status as FollowupStatus,
      createdAt: dbAction.created_at,
      updatedAt: dbAction.updated_at
    };
  }
  
  /**
   * Konvertiert ein Datenbank-Objekt in ein FollowupActionWithDetails-Objekt
   */
  private mapDbActionToFollowupActionWithDetails(dbAction: any): FollowupActionWithDetails {
    return {
      id: dbAction.id,
      title: dbAction.title,
      description: dbAction.description,
      dueDate: dbAction.due_date,
      completed: Boolean(dbAction.completed),
      completedAt: dbAction.completed_at,
      priority: dbAction.priority as FollowupPriority,
      actionType: dbAction.action_type,
      assignedTo: dbAction.assigned_to,
      assignedBy: dbAction.assigned_by,
      reminderSent: Boolean(dbAction.reminder_sent),
      reminderDate: dbAction.reminder_date,
      candidateId: dbAction.candidate_id,
      applicationId: dbAction.application_id,
      jobId: dbAction.job_id,
      talentPoolId: dbAction.talent_pool_id,
      notes: dbAction.notes,
      status: dbAction.status as FollowupStatus,
      createdAt: dbAction.created_at,
      updatedAt: dbAction.updated_at,
      candidateName: dbAction.candidate_name,
      applicationTitle: dbAction.application_title,
      jobTitle: dbAction.job_title,
      talentPoolName: dbAction.talent_pool_name,
      assignedToName: dbAction.assigned_to_name,
      assignedByName: dbAction.assigned_by_name
    };
  }
  
  /**
   * Konvertiert ein Datenbank-Objekt in ein FollowupRule-Objekt
   */
  private mapDbRuleToFollowupRule(dbRule: any): FollowupRule {
    return {
      id: dbRule.id,
      name: dbRule.name,
      description: dbRule.description,
      isActive: Boolean(dbRule.is_active),
      triggerEvent: dbRule.trigger_event as FollowupTriggerEvent,
      entityType: dbRule.entity_type,
      daysOffset: dbRule.days_offset,
      actionType: dbRule.action_type,
      priority: dbRule.priority as FollowupPriority,
      templateId: dbRule.template_id,
      assignedToType: dbRule.assigned_to_type,
      assignedToUserId: dbRule.assigned_to_user_id,
      conditions: dbRule.conditions,
      createdBy: dbRule.created_by,
      createdAt: dbRule.created_at,
      updatedAt: dbRule.updated_at
    };
  }
  
  /**
   * Konvertiert ein Datenbank-Objekt in ein FollowupTemplate-Objekt
   */
  private mapDbTemplateToFollowupTemplate(dbTemplate: any): FollowupTemplate {
    return {
      id: dbTemplate.id,
      name: dbTemplate.name,
      description: dbTemplate.description,
      actionType: dbTemplate.action_type,
      templateContent: dbTemplate.template_content,
      defaultPriority: dbTemplate.default_priority as FollowupPriority,
      defaultDaysOffset: dbTemplate.default_days_offset,
      createdBy: dbTemplate.created_by,
      triggerOn: dbTemplate.trigger_on as FollowupTriggerEvent,
      applicability: dbTemplate.applicability,
      isActive: Boolean(dbTemplate.is_active),
      createdAt: dbTemplate.created_at,
      updatedAt: dbTemplate.updated_at
    };
  }
}
