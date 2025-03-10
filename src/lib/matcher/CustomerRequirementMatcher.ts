import { ApplicationExtended } from '@/types/applications';
import { Candidate } from '@/types';
import { Requirement } from '@/types/customer';
import { JobStatus } from '@/types/jobs';
import { JobMatcher, MatchDetails } from './JobMatcher';
import { getDb } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { CreateRequirementMatchParams, CustomerRequirementMatch } from '@/types/customerRequirementMatch';
import { notificationService } from '../notificationService';
import { enhancedNotificationService } from '../EnhancedNotificationService';

/**
 * CustomerRequirementMatcher - Spezialisierte Klasse für das Matching zwischen 
 * Kundenanforderungen und Kandidaten/Bewerbungen/Talent-Pool-Einträgen
 * 
 * Diese Klasse nutzt den JobMatcher und bietet zusätzliche Funktionen für 
 * das Kundenanforderungs-spezifische Matching.
 */
export class CustomerRequirementMatcher {
  private jobMatcher: JobMatcher;
  
  constructor() {
    this.jobMatcher = new JobMatcher();
  }
  
  /**
   * Führt ein Matching zwischen einer Kundenanforderung und einem Kandidaten/Bewerber durch
   * @param entity Kandidat oder Bewerber
   * @param requirement Kundenanforderung
   * @returns Match-Details und Score
   */
  public calculateMatch(
    entity: Candidate | ApplicationExtended,
    requirement: Requirement
  ): MatchDetails {
    // Konvertiere Kundenanforderung in ein Job-ähnliches Format für den Matcher
    const jobLikeRequirement = {
      id: requirement.id,
      title: requirement.title,
      description: requirement.description,
      required_skills: requirement.skills,
      experience_years: requirement.experience,
      education: requirement.education,
      location: requirement.location,
      remote_option: requirement.isRemote ? 'full' : 'none',
      // Felder, die für JobMatcher erforderlich sind
      company: requirement.customerId || 'Kunde',
      job_type: 'requirement',
      // Weitere Felder mit Standardwerten
      status: 'active' as JobStatus,
      created_at: requirement.createdAt,
      updated_at: requirement.updatedAt
    };
    
    // Verwende den vorhandenen JobMatcher für das Matching
    return this.jobMatcher.calculateMatch(entity, jobLikeRequirement);
  }
  
  /**
   * Berechnet und speichert Matches zwischen einer Kundenanforderung und allen Kandidaten,
   * Bewerbungen und Talent-Pool-Einträgen
   * @param requirementId ID der Kundenanforderung
   * @param notifyOnMatches Ob Benachrichtigungen für gute Matches gesendet werden sollen
   * @param minScoreForNotification Minimaler Score für eine Benachrichtigung
   * @returns Array von erstellten Matches
   */
  public async calculateMatchesForRequirement(
    requirementId: string,
    notifyOnMatches: boolean = true,
    minScoreForNotification: number = 75
  ): Promise<CustomerRequirementMatch[]> {
    const db = await getDb();
    const matches: CustomerRequirementMatch[] = [];
    
    try {
      // Kundenanforderung abrufen
      const requirement = await db.get(
        'SELECT * FROM requirements WHERE id = ?',
        [requirementId]
      );
      
      if (!requirement) {
        throw new Error(`Kundenanforderung mit ID ${requirementId} nicht gefunden`);
      }
      
      // Bestehende Matches löschen
      await db.run(
        'DELETE FROM customer_requirement_matches WHERE requirement_id = ?',
        [requirementId]
      );
      
      // 1. Matches mit Kandidaten berechnen
      const candidates = await db.all('SELECT * FROM candidates WHERE status = "active"');
      for (const candidate of candidates) {
        const matchDetails = this.calculateMatch(candidate, requirement);
        
        if (matchDetails.overallScore > 0) {
          const match = await this.saveMatch({
            requirement_id: requirementId,
            entity_type: 'candidate',
            entity_id: candidate.id,
            match_score: matchDetails.overallScore,
            status: 'new'
          });
          
          matches.push(match);
          
          // Benachrichtigung senden, wenn Score über Schwellenwert
          if (notifyOnMatches && matchDetails.overallScore >= minScoreForNotification) {
            await this.sendMatchNotification(match, requirement, candidate.name, 'candidate');
          }
        }
      }
      
      // 2. Matches mit Bewerbungen berechnen
      const applications = await db.all(
        'SELECT * FROM applications_extended WHERE status IN ("new", "in_review", "contacted")'
      );
      
      for (const application of applications) {
        const matchDetails = this.calculateMatch(application, requirement);
        
        if (matchDetails.overallScore > 0) {
          const match = await this.saveMatch({
            requirement_id: requirementId,
            entity_type: 'application',
            entity_id: application.id,
            match_score: matchDetails.overallScore,
            status: 'new'
          });
          
          matches.push(match);
          
          // Benachrichtigung senden, wenn Score über Schwellenwert
          if (notifyOnMatches && matchDetails.overallScore >= minScoreForNotification) {
            await this.sendMatchNotification(match, requirement, application.applicant_name, 'application');
          }
        }
      }
      
      // 3. Matches mit Talent-Pool-Einträgen berechnen
      const talentPoolEntries = await db.all(`
        SELECT tp.*, c.name as entity_name, c.id as entity_id
        FROM talent_pool tp
        JOIN candidates c ON tp.entity_id = c.id
        WHERE tp.entity_type = 'candidate' AND tp.status = 'active'
      `);
      
      for (const entry of talentPoolEntries) {
        // Kandidatendaten abrufen
        const candidate = await db.get(
          'SELECT * FROM candidates WHERE id = ?',
          [entry.entity_id]
        );
        
        if (candidate) {
          const matchDetails = this.calculateMatch(candidate, requirement);
          
          if (matchDetails.overallScore > 0) {
            const match = await this.saveMatch({
              requirement_id: requirementId,
              entity_type: 'talent_pool',
              entity_id: entry.id, // Talent-Pool-ID, nicht Kandidaten-ID
              match_score: matchDetails.overallScore,
              status: 'new'
            });
            
            matches.push(match);
            
            // Benachrichtigung senden, wenn Score über Schwellenwert
            if (notifyOnMatches && matchDetails.overallScore >= minScoreForNotification) {
              await this.sendMatchNotification(match, requirement, candidate.name, 'talent_pool');
            }
          }
        }
      }
      
      return matches;
    } catch (error) {
      console.error('Fehler beim Berechnen der Matches für die Anforderung:', error);
      throw error;
    }
  }
  
  /**
   * Berechnet Matches zwischen einem Kandidaten/Bewerber/Talent-Pool-Eintrag und allen Kundenanforderungen
   * @param entityType Typ der Entität ('candidate', 'application', 'talent_pool')
   * @param entityId ID der Entität
   * @param notifyOnMatches Ob Benachrichtigungen für gute Matches gesendet werden sollen
   * @param minScoreForNotification Minimaler Score für eine Benachrichtigung
   * @returns Array von erstellten Matches
   */
  public async calculateMatchesForEntity(
    entityType: 'candidate' | 'application' | 'talent_pool',
    entityId: string,
    notifyOnMatches: boolean = true,
    minScoreForNotification: number = 75
  ): Promise<CustomerRequirementMatch[]> {
    const db = await getDb();
    const matches: CustomerRequirementMatch[] = [];
    
    try {
      // Entität abrufen
      let entity;
      let entityName = '';
      
      switch (entityType) {
        case 'candidate':
          entity = await db.get('SELECT * FROM candidates WHERE id = ?', [entityId]);
          entityName = entity?.name || 'Unbekannter Kandidat';
          break;
        case 'application':
          entity = await db.get('SELECT * FROM applications_extended WHERE id = ?', [entityId]);
          entityName = entity?.applicant_name || 'Unbekannter Bewerber';
          break;
        case 'talent_pool':
          const talentPoolEntry = await db.get('SELECT * FROM talent_pool WHERE id = ?', [entityId]);
          if (talentPoolEntry && talentPoolEntry.entity_type === 'candidate') {
            entity = await db.get('SELECT * FROM candidates WHERE id = ?', [talentPoolEntry.entity_id]);
            entityName = entity?.name || 'Unbekannter Talent-Pool-Eintrag';
          }
          break;
      }
      
      if (!entity) {
        throw new Error(`Entität vom Typ ${entityType} mit ID ${entityId} nicht gefunden`);
      }
      
      // Bestehende Matches löschen
      await db.run(
        'DELETE FROM customer_requirement_matches WHERE entity_type = ? AND entity_id = ?',
        [entityType, entityId]
      );
      
      // Offene Kundenanforderungen abrufen
      const requirements = await db.all(
        "SELECT * FROM requirements WHERE status = 'open'"
      );
      
      // Matches für jede Anforderung berechnen
      for (const requirement of requirements) {
        const matchDetails = this.calculateMatch(entity, requirement);
        
        if (matchDetails.overallScore > 0) {
          const match = await this.saveMatch({
            requirement_id: requirement.id,
            entity_type: entityType,
            entity_id: entityId,
            match_score: matchDetails.overallScore,
            status: 'new'
          });
          
          matches.push(match);
          
          // Benachrichtigung senden, wenn Score über Schwellenwert
          if (notifyOnMatches && matchDetails.overallScore >= minScoreForNotification) {
            await this.sendMatchNotification(match, requirement, entityName, entityType);
          }
        }
      }
      
      return matches;
    } catch (error) {
      console.error(`Fehler beim Berechnen der Matches für ${entityType} ${entityId}:`, error);
      throw error;
    }
  }
  
  /**
   * Speichert ein Match in der Datenbank
   * @param matchParams Match-Parameter
   * @returns Gespeichertes Match
   */
  private async saveMatch(
    matchParams: CreateRequirementMatchParams
  ): Promise<CustomerRequirementMatch> {
    const db = await getDb();
    const id = uuidv4();
    
    try {
      await db.run(`
        INSERT INTO customer_requirement_matches (
          id, requirement_id, entity_type, entity_id, match_score, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [
        id,
        matchParams.requirement_id,
        matchParams.entity_type,
        matchParams.entity_id,
        matchParams.match_score,
        matchParams.status || 'new'
      ]);
      
      // Match mit Details abrufen
      const matchResult = await db.get(`
        SELECT m.*, r.title as requirement_title, r.customer_id
        FROM customer_requirement_matches m
        JOIN requirements r ON m.requirement_id = r.id
        WHERE m.id = ?
      `, [id]);
      
      if (matchResult) {
        // Kundendaten abrufen
        const customer = await db.get(
          'SELECT name FROM customers WHERE id = ?',
          [matchResult.customer_id]
        );
        
        if (customer) {
          matchResult.customer_name = customer.name;
        }
        
        return matchResult as CustomerRequirementMatch;
      }
      
      throw new Error(`Match konnte nicht gespeichert werden`);
    } catch (error) {
      console.error('Fehler beim Speichern des Matches:', error);
      throw error;
    }
  }
  
  /**
   * Sendet eine Benachrichtigung über ein Match
   * @param match Match-Daten
   * @param requirement Anforderungsdaten
   * @param entityName Name der Entität (Kandidat, Bewerber, etc.)
   * @param entityType Typ der Entität
   */
  private async sendMatchNotification(
    match: CustomerRequirementMatch,
    requirement: any,
    entityName: string,
    entityType: 'candidate' | 'application' | 'talent_pool'
  ): Promise<void> {
    try {
      const db = await getDb();
      
      // Benutzer mit Recruiter-Rolle abrufen
      const recruiters = await db.all("SELECT id FROM users WHERE role = 'recruiter'");
      
      if (!recruiters || recruiters.length === 0) {
        return;
      }
      
      // Kundeninformationen abrufen
      const customer = await db.get(
        'SELECT * FROM customers WHERE id = ?',
        [requirement.customer_id]
      );
      
      const customerName = customer?.name || 'Unbekannter Kunde';
      
      // Für jeden Recruiter eine Benachrichtigung erstellen
      for (const recruiter of recruiters) {
        // Benutzereinstellungen für Benachrichtigungen prüfen
        const settings = await db.get(
          'SELECT notifyMatchings FROM notification_settings WHERE userId = ?',
          [recruiter.id]
        );
        
        // Wenn der Benutzer Matching-Benachrichtigungen deaktiviert hat, überspringen
        if (settings && settings.notifyMatchings === 0) {
          continue;
        }
        
        // Titel und Text der Benachrichtigung basierend auf dem Entitätstyp anpassen
        let title, message;
        let entityTypeText = '';
        
        switch (entityType) {
          case 'candidate':
            entityTypeText = 'Kandidat';
            break;
          case 'application':
            entityTypeText = 'Bewerber';
            break;
          case 'talent_pool':
            entityTypeText = 'Talent-Pool-Eintrag';
            break;
        }
        
        title = `Matching-Treffer: ${entityName} (${match.match_score}%)`;
        message = `Der ${entityTypeText} "${entityName}" passt mit ${match.match_score}% auf die Anforderung "${requirement.title}" von ${customerName}.`;
        
        // Benachrichtigung mit Direktlinks erstellen - verwenden Sie den EnhancedNotificationService
        await enhancedNotificationService.createEnhancedNotification({
          user_id: recruiter.id,
          title,
          message,
          entity_type: entityType,
          entity_id: match.entity_id,
          action: 'match_found',
          importance: match.match_score >= 90 ? 'high' : (match.match_score >= 75 ? 'normal' : 'low'),
          // Zusätzliche Link-Informationen
          link_type: 'view',
          link_entity_type: entityType,
          link_entity_id: match.entity_id,
          secondary_link_type: 'view_requirement',
          secondary_link_entity_type: 'requirement',
          secondary_link_entity_id: requirement.id
        });
      }
    } catch (error) {
      console.error('Fehler beim Senden der Match-Benachrichtigung:', error);
    }
  }
  
  /**
   * Führt ein vollständiges Matching für die gesamte Datenbank durch
   * @param minScoreForNotification Minimaler Score für eine Benachrichtigung
   * @returns Anzahl der erstellten Matches
   */
  public async runFullMatching(minScoreForNotification: number = 75): Promise<number> {
    const db = await getDb();
    let totalMatches = 0;
    
    try {
      // 1. Alle aktiven Kundenanforderungen abrufen
      const requirements = await db.all("SELECT id FROM requirements WHERE status = 'open'");
      
      // 2. Für jede Anforderung die Matches berechnen
      for (const requirement of requirements) {
        const matches = await this.calculateMatchesForRequirement(
          requirement.id,
          true,
          minScoreForNotification
        );
        
        totalMatches += matches.length;
      }
      
      return totalMatches;
    } catch (error) {
      console.error('Fehler beim vollständigen Matching:', error);
      throw error;
    }
  }
}

// Exportiere eine Instanz als Singleton
const customerRequirementMatcher = new CustomerRequirementMatcher();
export default customerRequirementMatcher;
