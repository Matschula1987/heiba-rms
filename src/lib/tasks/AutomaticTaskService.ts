import { getDb } from '@/lib/db';
import { Task, TaskCreateInput, TaskPriority, TaskStatus, TaskType } from '@/types/tasks';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service für automatische Aufgabenerstellung und -verwaltung
 */
export class AutomaticTaskService {
  /**
   * Erstellt eine neue automatische Aufgabe
   */
  async createAutomaticTask(taskData: Omit<TaskCreateInput, 'is_automated'>): Promise<Task> {
    const taskId = uuidv4();
    const now = new Date().toISOString();
    
    const newTask: Task = {
      id: taskId,
      title: taskData.title,
      description: taskData.description || '',
      due_date: taskData.due_date,
      priority: taskData.priority || 'medium',
      status: taskData.status || 'open',
      task_type: taskData.task_type,
      assigned_to: taskData.assigned_to,
      related_entity_type: taskData.related_entity_type,
      related_entity_id: taskData.related_entity_id,
      is_automated: true,
      reminder_sent: false,
      created_at: now,
      updated_at: now
    };
    
    try {
      const db = await getDb();
      await db.run(
        `INSERT INTO tasks (
          id, title, description, due_date, priority, status, 
          task_type, assigned_to, related_entity_type, related_entity_id,
          is_automated, reminder_sent, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newTask.id, newTask.title, newTask.description, newTask.due_date,
          newTask.priority, newTask.status, newTask.task_type, newTask.assigned_to,
          newTask.related_entity_type, newTask.related_entity_id,
          newTask.is_automated ? 1 : 0, newTask.reminder_sent ? 1 : 0,
          newTask.created_at, newTask.updated_at
        ]
      );
      
      return newTask;
    } catch (error) {
      console.error('Fehler beim Erstellen der automatischen Aufgabe:', error);
      throw new Error('Aufgabe konnte nicht erstellt werden');
    }
  }
  
  /**
   * Erstellt eine Aufgabe für Matching-Benachrichtigungen
   */
  async createMatchingTask(
    candidateId: string, 
    jobId: string, 
    matchScore: number, 
    candidateName: string, 
    jobTitle: string
  ): Promise<Task> {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 2); // 2 Tage Frist
    
    let priority: TaskPriority = 'medium';
    if (matchScore >= 85) priority = 'high';
    else if (matchScore < 70) priority = 'low';
    
    return this.createAutomaticTask({
      title: `Matching überprüfen: ${candidateName} für ${jobTitle}`,
      description: `Ein neues Match mit einem Score von ${matchScore}% wurde gefunden. Bitte überprüfen Sie die Eignung des Kandidaten für diese Position.`,
      due_date: dueDate.toISOString(),
      priority,
      task_type: 'matching_review',
      related_entity_type: 'candidate',
      related_entity_id: candidateId
    });
  }
  
  /**
   * Erstellt eine Aufgabe für Stellenanzeigen-Überwachung
   */
  async createJobExpiryTask(
    jobId: string,
    jobTitle: string,
    expiryDate: string,
    daysBeforeNotification: number = 5
  ): Promise<Task> {
    const expiry = new Date(expiryDate);
    const dueDate = new Date(expiry);
    dueDate.setDate(expiry.getDate() - daysBeforeNotification); // X Tage vor Ablauf erinnern
    
    return this.createAutomaticTask({
      title: `Stellenanzeige läuft ab: ${jobTitle}`,
      description: `Die Stellenanzeige "${jobTitle}" läuft am ${new Date(expiryDate).toLocaleDateString('de-DE')} ab. Bitte überprüfen und ggf. verlängern.`,
      due_date: dueDate.toISOString(),
      priority: 'medium',
      task_type: 'job_expiry',
      related_entity_type: 'job',
      related_entity_id: jobId
    });
  }
  
  /**
   * Erstellt eine Aufgabe für Bewerbungsnachverfolgung
   */
  async createApplicationFollowupTask(
    applicationId: string,
    applicantName: string,
    jobTitle: string,
    daysUntilFollowup: number = 7
  ): Promise<Task> {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + daysUntilFollowup);
    
    return this.createAutomaticTask({
      title: `Nachfassen bei Bewerber: ${applicantName}`,
      description: `Es ist Zeit, bei ${applicantName} für die Stelle "${jobTitle}" nachzufassen. Bitte kontaktieren Sie den Bewerber und aktualisieren Sie den Status.`,
      due_date: dueDate.toISOString(),
      priority: 'medium',
      task_type: 'application_followup',
      related_entity_type: 'application',
      related_entity_id: applicationId
    });
  }
  
  /**
   * Erstellt eine Aufgabe für Kontaktpflege bei Kandidaten
   */
  async createCandidateContactTask(
    candidateId: string,
    candidateName: string,
    lastContactDate: string,
    daysThreshold: number = 60
  ): Promise<Task> {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3); // 3 Tage Zeit für die Kontaktaufnahme
    
    return this.createAutomaticTask({
      title: `Kontaktpflege: ${candidateName}`,
      description: `Es sind mehr als ${daysThreshold} Tage seit dem letzten Kontakt mit ${candidateName} vergangen. Bitte nehmen Sie Kontakt auf, um die Beziehung zu pflegen.`,
      due_date: dueDate.toISOString(),
      priority: 'medium',
      task_type: 'manual',
      related_entity_type: 'candidate',
      related_entity_id: candidateId
    });
  }
  
  /**
   * Erstellt eine Aufgabe für Kontaktpflege bei Kunden/Interessenten
   */
  async createCustomerContactTask(
    customerId: string,
    customerName: string,
    lastContactDate: string,
    daysThreshold: number = 90,
    isProspect: boolean = false
  ): Promise<Task> {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3); // 3 Tage Zeit für die Kontaktaufnahme
    
    const customerType = isProspect ? "Interessenten" : "Kunden";
    
    return this.createAutomaticTask({
      title: `Kontaktpflege ${customerType}: ${customerName}`,
      description: `Es sind mehr als ${daysThreshold} Tage seit dem letzten Kontakt mit ${customerName} vergangen. Bitte nehmen Sie Kontakt auf, um die Beziehung zu pflegen.`,
      due_date: dueDate.toISOString(),
      priority: isProspect ? 'medium' : 'high', // Kunden höhere Priorität als Interessenten
      task_type: 'manual',
      related_entity_type: 'other', // Anpassen für Typsystem-Kompatibilität
      related_entity_id: customerId
    });
  }
  
  /**
   * Markiert eine Aufgabe als "Erinnerung gesendet"
   */
  async markReminderSent(taskId: string): Promise<void> {
    try {
      const db = await getDb();
      await db.run(
        `UPDATE tasks SET reminder_sent = 1, updated_at = ? WHERE id = ?`,
        [new Date().toISOString(), taskId]
      );
    } catch (error) {
      console.error('Fehler beim Markieren der Erinnerung als gesendet:', error);
      throw new Error('Aufgabe konnte nicht aktualisiert werden');
    }
  }
  
  /**
   * Findet alle offenen Aufgaben, die eine Erinnerung benötigen
   */
  async findTasksNeedingReminders(hoursBeforeDue: number = 24): Promise<Task[]> {
    try {
      // Aufgaben finden, die innerhalb der nächsten X Stunden fällig sind
      // und für die noch keine Erinnerung gesendet wurde
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() + hoursBeforeDue);
      
      const db = await getDb();
      const tasks = await db.all(
        `SELECT * FROM tasks 
         WHERE status = 'open' 
         AND reminder_sent = 0
         AND due_date <= ?
         ORDER BY due_date ASC`,
        [cutoffTime.toISOString()]
      );
      
      return tasks as Task[];
    } catch (error) {
      console.error('Fehler beim Suchen von Aufgaben für Erinnerungen:', error);
      throw new Error('Aufgaben konnten nicht abgerufen werden');
    }
  }
  
  /**
   * Findet alle abgelaufenen Stellenanzeigen für automatische Aufgaben
   */
  async findJobsNearingExpiry(daysThreshold: number = 5): Promise<any[]> {
    try {
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);
      
      // Stellenanzeigen finden, die bald ablaufen
      const db = await getDb();
      const jobs = await db.all(
        `SELECT * FROM jobs 
         WHERE expiry_date IS NOT NULL
         AND expiry_date <= ?
         AND expiry_date > ?
         AND active = 1`,
        [thresholdDate.toISOString(), new Date().toISOString()]
      );
      
      return jobs;
    } catch (error) {
      console.error('Fehler beim Suchen von ablaufenden Stellenanzeigen:', error);
      throw new Error('Stellenanzeigen konnten nicht abgerufen werden');
    }
  }
  
  /**
   * Findet Kandidaten, die seit langem nicht kontaktiert wurden
   */
  async findCandidatesNeedingContact(daysThreshold: number = 60): Promise<any[]> {
    try {
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);
      
      const db = await getDb();
      const candidates = await db.all(
        `SELECT * FROM candidates 
         WHERE last_contact_date IS NOT NULL
         AND last_contact_date < ?
         AND active = 1`,
        [thresholdDate.toISOString()]
      );
      
      return candidates;
    } catch (error) {
      console.error('Fehler beim Suchen von Kandidaten für Kontaktpflege:', error);
      throw new Error('Kandidaten konnten nicht abgerufen werden');
    }
  }
  
  /**
   * Findet Kunden/Interessenten, die seit langem nicht kontaktiert wurden
   */
  async findCustomersNeedingContact(daysThreshold: number = 90, isProspect: boolean = false): Promise<any[]> {
    try {
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);
      
      const db = await getDb();
      const customers = await db.all(
        `SELECT * FROM customers 
         WHERE last_contact_date IS NOT NULL
         AND last_contact_date < ?
         AND is_prospect = ?
         AND active = 1`,
        [thresholdDate.toISOString(), isProspect ? 1 : 0]
      );
      
      return customers;
    } catch (error) {
      console.error('Fehler beim Suchen von Kunden für Kontaktpflege:', error);
      throw new Error('Kunden konnten nicht abgerufen werden');
    }
  }
}
