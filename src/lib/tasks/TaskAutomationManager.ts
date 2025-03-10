import { getDb } from '@/lib/db';
import { AutomaticTaskService } from './AutomaticTaskService';
import { Task } from '@/types/tasks';

/**
 * Manager für die automatische Aufgabengenerierung und -überwachung
 * 
 * Diese Klasse verwaltet die automatische Erstellung von Aufgaben basierend auf
 * verschiedenen Ereignissen im System und kann regelmäßig ausgeführt werden,
 * um wiederkehrende Aufgaben zu generieren.
 */
export class TaskAutomationManager {
  private automaticTaskService: AutomaticTaskService;
  
  constructor() {
    this.automaticTaskService = new AutomaticTaskService();
  }
  
  /**
   * Führt alle automatischen Aufgabengenerierungen aus
   * Diese Methode kann von einem Scheduler/Cron-Job in regelmäßigen Abständen aufgerufen werden
   */
  async runAllAutomations(): Promise<{
    jobExpiryTasks: Task[];
    candidateContactTasks: Task[];
    customerContactTasks: Task[];
    reminderCount: number;
  }> {
    // Parallele Ausführung aller Automationen
    const [
      jobExpiryTasks,
      candidateContactTasks,
      customerContactTasks,
      reminderCount
    ] = await Promise.all([
      this.checkJobExpirations(),
      this.checkCandidateContacts(),
      this.checkCustomerContacts(),
      this.sendReminderNotifications()
    ]);
    
    return {
      jobExpiryTasks,
      candidateContactTasks,
      customerContactTasks,
      reminderCount
    };
  }
  
  /**
   * Prüft auf ablaufende Stellenanzeigen und erstellt Aufgaben
   */
  async checkJobExpirations(): Promise<Task[]> {
    try {
      // Stellenanzeigen finden, die in den nächsten 5 Tagen ablaufen
      const expiringJobs = await this.automaticTaskService.findJobsNearingExpiry(5);
      const tasks: Task[] = [];
      
      // Aufgaben für jede ablaufende Stellenanzeige erstellen
      for (const job of expiringJobs) {
        // Sicherstellen, dass nicht bereits eine offene Aufgabe für diese Stellenanzeige existiert
        const db = await getDb();
        const existingTask = await db.get(
          `SELECT * FROM tasks 
           WHERE related_entity_type = 'job'
           AND related_entity_id = ? 
           AND task_type = 'job_expiry'
           AND status != 'completed'
           AND status != 'cancelled'`,
          [job.id]
        );
        
        if (!existingTask) {
          const task = await this.automaticTaskService.createJobExpiryTask(
            job.id,
            job.title,
            job.expiry_date
          );
          
          tasks.push(task);
        }
      }
      
      return tasks;
    } catch (error) {
      console.error('Fehler bei der Prüfung auf ablaufende Stellenanzeigen:', error);
      return [];
    }
  }
  
  /**
   * Prüft auf Kandidaten, die lange nicht kontaktiert wurden
   */
  async checkCandidateContacts(): Promise<Task[]> {
    try {
      // Kandidaten finden, die seit langem nicht kontaktiert wurden
      const candidatesToContact = await this.automaticTaskService.findCandidatesNeedingContact(60);
      const tasks: Task[] = [];
      
      // Aufgaben für jeden Kandidaten erstellen
      for (const candidate of candidatesToContact) {
        // Sicherstellen, dass nicht bereits eine offene Aufgabe für diesen Kandidaten existiert
        const db = await getDb();
        const existingTask = await db.get(
          `SELECT * FROM tasks 
           WHERE related_entity_type = 'candidate'
           AND related_entity_id = ? 
           AND task_type = 'manual'
           AND title LIKE 'Kontaktpflege:%'
           AND status != 'completed'
           AND status != 'cancelled'`,
          [candidate.id]
        );
        
        if (!existingTask) {
          const task = await this.automaticTaskService.createCandidateContactTask(
            candidate.id,
            candidate.name,
            candidate.last_contact_date
          );
          
          tasks.push(task);
        }
      }
      
      return tasks;
    } catch (error) {
      console.error('Fehler bei der Prüfung auf Kandidatenkontakte:', error);
      return [];
    }
  }
  
  /**
   * Prüft auf Kunden, die lange nicht kontaktiert wurden
   */
  async checkCustomerContacts(): Promise<Task[]> {
    try {
      const tasks: Task[] = [];
      
      // Kunden finden, die seit langem nicht kontaktiert wurden
      const customersToContact = await this.automaticTaskService.findCustomersNeedingContact(90, false);
      
      // Aufgaben für jeden Kunden erstellen
      for (const customer of customersToContact) {
        // Sicherstellen, dass nicht bereits eine offene Aufgabe für diesen Kunden existiert
        const db = await getDb();
        const existingTask = await db.get(
          `SELECT * FROM tasks 
           WHERE related_entity_type = 'other'
           AND related_entity_id = ? 
           AND task_type = 'manual'
           AND title LIKE 'Kontaktpflege Kunden:%'
           AND status != 'completed'
           AND status != 'cancelled'`,
          [customer.id]
        );
        
        if (!existingTask) {
          const task = await this.automaticTaskService.createCustomerContactTask(
            customer.id,
            customer.name,
            customer.last_contact_date,
            90,
            false
          );
          
          tasks.push(task);
        }
      }
      
      // Interessenten finden, die seit langem nicht kontaktiert wurden (niedrigere Priorität)
      const prospectsToContact = await this.automaticTaskService.findCustomersNeedingContact(60, true);
      
      // Aufgaben für jeden Interessenten erstellen
      for (const prospect of prospectsToContact) {
        // Sicherstellen, dass nicht bereits eine offene Aufgabe für diesen Interessenten existiert
        const db = await getDb();
        const existingTask = await db.get(
          `SELECT * FROM tasks 
           WHERE related_entity_type = 'other'
           AND related_entity_id = ? 
           AND task_type = 'manual'
           AND title LIKE 'Kontaktpflege Interessenten:%'
           AND status != 'completed'
           AND status != 'cancelled'`,
          [prospect.id]
        );
        
        if (!existingTask) {
          const task = await this.automaticTaskService.createCustomerContactTask(
            prospect.id,
            prospect.name,
            prospect.last_contact_date,
            60,
            true
          );
          
          tasks.push(task);
        }
      }
      
      return tasks;
    } catch (error) {
      console.error('Fehler bei der Prüfung auf Kundenkontakte:', error);
      return [];
    }
  }
  
  /**
   * Erstellt eine Matching-Aufgabe, wenn ein neues Match gefunden wurde
   */
  async createMatchingTask(
    candidateId: string,
    jobId: string,
    matchScore: number,
    candidateName: string,
    jobTitle: string
  ): Promise<Task | null> {
    try {
      // Sicherstellen, dass nicht bereits eine offene Matching-Aufgabe existiert
      const db = await getDb();
      const existingTask = await db.get(
        `SELECT * FROM tasks 
         WHERE related_entity_type = 'candidate'
         AND related_entity_id = ? 
         AND task_type = 'matching_review'
         AND title LIKE ?
         AND status != 'completed'
         AND status != 'cancelled'`,
        [candidateId, `Matching überprüfen: ${candidateName} für ${jobTitle}`]
      );
      
      if (!existingTask) {
        return this.automaticTaskService.createMatchingTask(
          candidateId,
          jobId,
          matchScore,
          candidateName,
          jobTitle
        );
      }
      
      return null;
    } catch (error) {
      console.error('Fehler beim Erstellen einer Matching-Aufgabe:', error);
      return null;
    }
  }
  
  /**
   * Erstellt eine Followup-Aufgabe für eine Bewerbung
   */
  async createApplicationFollowupTask(
    applicationId: string,
    applicantName: string,
    jobTitle: string,
    daysUntilFollowup: number = 7
  ): Promise<Task | null> {
    try {
      // Sicherstellen, dass nicht bereits eine offene Followup-Aufgabe existiert
      const db = await getDb();
      const existingTask = await db.get(
        `SELECT * FROM tasks 
         WHERE related_entity_type = 'application'
         AND related_entity_id = ? 
         AND task_type = 'application_followup'
         AND status != 'completed'
         AND status != 'cancelled'`,
        [applicationId]
      );
      
      if (!existingTask) {
        return this.automaticTaskService.createApplicationFollowupTask(
          applicationId,
          applicantName,
          jobTitle,
          daysUntilFollowup
        );
      }
      
      return null;
    } catch (error) {
      console.error('Fehler beim Erstellen einer Bewerbungs-Followup-Aufgabe:', error);
      return null;
    }
  }
  
  /**
   * Sendet Erinnerungen für offene Aufgaben
   * Verknüpft mit dem NotificationService
   */
  async sendReminderNotifications(hoursBeforeDue: number = 24): Promise<number> {
    try {
      // Aufgaben finden, die bald fällig sind
      const tasks = await this.automaticTaskService.findTasksNeedingReminders(hoursBeforeDue);
      
      // Hier würde eine Integration mit dem NotificationService stattfinden
      // z.B. über einen Aufruf wie:
      // await notificationService.sendTaskReminders(tasks);
      
      // Aufgaben als "Erinnerung gesendet" markieren
      for (const task of tasks) {
        await this.automaticTaskService.markReminderSent(task.id);
      }
      
      return tasks.length;
    } catch (error) {
      console.error('Fehler beim Senden von Erinnerungen:', error);
      return 0;
    }
  }
}
