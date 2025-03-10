import { ApplicationExtended } from '@/types/applications';
import { Candidate } from '@/types';
import { Job } from '@/types/jobs';
import { TalentPoolJobMatch } from '@/types/talentPool';
import { JobMatcher, MatchDetails } from './JobMatcher';
import { getDb } from '../db';

/**
 * TalentPoolJobMatcher - Spezialisierte Klasse für das Matching zwischen Talent-Pool-Einträgen und Jobs
 * 
 * Diese Klasse nutzt den JobMatcher und bietet zusätzliche Funktionen für Talent-Pool-spezifisches Matching.
 */
export class TalentPoolJobMatcher {
  private jobMatcher: JobMatcher;
  
  constructor() {
    this.jobMatcher = new JobMatcher();
  }
  
  /**
   * Berechnet Matches zwischen einem Kandidaten/Bewerber und allen aktiven Jobs
   * @param entity Kandidat oder Bewerber
   * @param talentPoolId ID des Talent-Pool-Eintrags
   * @returns Array von Job-Matches
   */
  public async calculateMatchesForTalentPool(
    entity: Candidate | ApplicationExtended,
    talentPoolId: string
  ): Promise<TalentPoolJobMatch[]> {
    const db = await getDb();
    
    try {
      // Aktive Jobs abrufen
      const jobs = await db.all("SELECT * FROM jobs WHERE status = 'active'");
      
      if (!jobs || jobs.length === 0) {
        return [];
      }
      
      // Bestehende Matches löschen
      await db.run(
        'DELETE FROM talent_pool_job_matches WHERE talent_pool_id = ?',
        [talentPoolId]
      );
      
      // Matching für jeden Job durchführen und speichern
      const matchResults: TalentPoolJobMatch[] = [];
      
      for (const job of jobs) {
        // Semantisches Matching durchführen
        const matchDetails = this.jobMatcher.calculateMatch(entity, job);
        
        // Match in Datenbank speichern
        const result = await db.run(
          `INSERT INTO talent_pool_job_matches (
            talent_pool_id,
            job_id,
            match_score,
            match_details,
            status
          ) VALUES (?, ?, ?, ?, ?)`,
          [
            talentPoolId,
            job.id,
            matchDetails.overallScore,
            JSON.stringify(this.convertMatchDetailsToDbFormat(matchDetails)),
            'new'
          ]
        );
        
        if (result.lastID) {
          const match = await db.get(
            'SELECT * FROM talent_pool_job_matches WHERE id = ?',
            [result.lastID]
          );
          
          if (match) {
            // Match-Details von JSON-String in Objekt konvertieren
            if (match.match_details && typeof match.match_details === 'string') {
              try {
                match.match_details = JSON.parse(match.match_details);
              } catch (error) {
                console.error('Fehler beim Parsen der Match-Details:', error);
                match.match_details = {};
              }
            }
            
            matchResults.push(match as TalentPoolJobMatch);
          }
        }
      }
      
      return matchResults;
    } catch (error) {
      console.error('Fehler beim Berechnen der Job-Matches:', error);
      throw error;
    }
  }
  
  /**
   * Berechnet ein einzelnes Match zwischen einem Kandidaten/Bewerber und einem Job
   * @param entity Kandidat oder Bewerber
   * @param job Job
   * @returns Match-Details
   */
  public calculateMatch(
    entity: Candidate | ApplicationExtended,
    job: Job
  ): MatchDetails {
    return this.jobMatcher.calculateMatch(entity, job);
  }
  
  /**
   * Konvertiert die MatchDetails in ein datenbankfreundliches Format
   */
  private convertMatchDetailsToDbFormat(matchDetails: MatchDetails): any {
    return {
      overallScore: matchDetails.overallScore,
      categoryScores: {
        skills: matchDetails.skillMatches.score,
        location: matchDetails.locationMatch.score,
        experience: matchDetails.experienceMatch.score,
        education: matchDetails.educationMatch.score,
        workModel: matchDetails.workModelMatch.score
      },
      matchedSkills: matchDetails.skillMatches.matchedSkills,
      partiallyMatchedSkills: matchDetails.skillMatches.partiallyMatchedSkills,
      missingSkills: matchDetails.skillMatches.missingSkills,
      locationMatches: matchDetails.locationMatch.matchedLocations,
      experienceDetails: {
        requiredYears: matchDetails.experienceMatch.requiredYears,
        actualYears: matchDetails.experienceMatch.actualYears
      },
      educationDetails: {
        requiredLevel: matchDetails.educationMatch.requiredLevel,
        actualLevel: matchDetails.educationMatch.actualLevel
      },
      workModelDetails: {
        requiredModel: matchDetails.workModelMatch.requiredModel,
        actualModel: matchDetails.workModelMatch.actualModel
      }
    };
  }
}

// Exportiere eine Instanz als Singleton
const talentPoolJobMatcher = new TalentPoolJobMatcher();
export default talentPoolJobMatcher;
