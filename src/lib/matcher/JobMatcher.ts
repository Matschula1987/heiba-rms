import { SkillMatcher } from './SkillMatcher';
import { LocationMatcher } from './LocationMatcher';
import { Job } from '@/types/jobs';
import { Candidate } from '@/types';
import { ApplicationExtended } from '@/types/applications';

// Schnittstelle für Entitäten mit Skills
interface SkillsEntity {
  skills?: string[] | string | { name: string; level?: number }[];
}

// Schnittstelle für Entitäten mit Standort
interface LocationEntity {
  location?: string | string[];
  applicant_location?: string;
}

// Schnittstelle für Entitäten mit Erfahrung
interface ExperienceEntity {
  experience?: string | any[] | { years?: number | string; duration?: number | string }[];
  experience_years?: number | string;
  description?: string;
}

// Schnittstelle für Entitäten mit Ausbildung
interface EducationEntity {
  education?: string | any[] | { degree?: string }[];
  education_required?: string;
  description?: string;
}

// Schnittstelle für Entitäten mit Arbeitsmodell
interface WorkModelEntity {
  preferred_work_model?: string;
  work_model?: string;
  description?: string;
  remote_work?: boolean;
}

// Erweiterte Schnittstellen für Kandidaten/Bewerber und Jobs
type EnhancedCandidate = Candidate & SkillsEntity & LocationEntity & ExperienceEntity & EducationEntity & WorkModelEntity;
type EnhancedApplication = ApplicationExtended & SkillsEntity & LocationEntity & ExperienceEntity & EducationEntity & WorkModelEntity;
type EnhancedJob = Job & SkillsEntity & LocationEntity & ExperienceEntity & EducationEntity & WorkModelEntity;

// Typdefinition für Gewichtungsfaktoren
export interface MatchWeights {
  skills: number;
  location: number;
  experience: number;
  education: number;
  workModel: number;  // Vollzeit, Teilzeit, Projektarbeit etc.
}

// Standard-Gewichtungsfaktoren
const DEFAULT_WEIGHTS: MatchWeights = {
  skills: 0.5,       // 50% der Gewichtung für Skills
  location: 0.2,     // 20% der Gewichtung für Standort
  experience: 0.15,  // 15% der Gewichtung für Berufserfahrung
  education: 0.1,    // 10% der Gewichtung für Ausbildung
  workModel: 0.05    // 5% der Gewichtung für Arbeitsmodell
};

// Detail-Informationen über den Match
export interface MatchDetails {
  skillMatches: {
    score: number;
    matchedSkills: string[];
    partiallyMatchedSkills: string[];
    missingSkills: string[];
  };
  locationMatch: {
    score: number;
    matchedLocations: string[];
  };
  experienceMatch: {
    score: number;
    requiredYears: number;
    actualYears: number;
  };
  educationMatch: {
    score: number;
    requiredLevel: string;
    actualLevel: string;
  };
  workModelMatch: {
    score: number;
    requiredModel: string;
    actualModel: string;
  };
  overallScore: number;
}

/**
 * JobMatcher - Ein Service für semantisches Matching zwischen Kandidaten/Bewerbern und Jobs
 * 
 * Dieser Service kombiniert verschiedene Matching-Faktoren (Skills, Standort, etc.)
 * und berechnet einen Gesamtscore.
 */
export class JobMatcher {
  private skillMatcher: SkillMatcher;
  private locationMatcher: LocationMatcher;
  private weights: MatchWeights;
  
  constructor(weights?: Partial<MatchWeights>) {
    this.weights = { ...DEFAULT_WEIGHTS, ...weights };
    this.skillMatcher = new SkillMatcher();
    this.locationMatcher = new LocationMatcher();
    
    // Normalisiere die Gewichte, damit sie in Summe 1.0 ergeben
    this.normalizeWeights();
  }
  
  /**
   * Berechnet einen Gesamtmatch-Score zwischen einem Kandidaten/Bewerber und einem Job
   * @param candidate Kandidat oder Bewerber
   * @param job Job
   * @returns MatchDetails mit Score und Detail-Informationen
   */
  public calculateMatch(
    candidate: EnhancedCandidate | EnhancedApplication,
    job: EnhancedJob
  ): MatchDetails {
    // SKILL MATCH
    const skillScore = this.calculateSkillScore(candidate, job);
    
    // LOCATION MATCH
    const locationScore = this.calculateLocationScore(candidate, job);
    
    // EXPERIENCE MATCH
    const experienceScore = this.calculateExperienceScore(candidate, job);
    
    // EDUCATION MATCH
    const educationScore = this.calculateEducationScore(candidate, job);
    
    // WORK MODEL MATCH
    const workModelScore = this.calculateWorkModelScore(candidate, job);
    
    // Gewichteter Gesamtscore
    const overallScore = (
      skillScore.score * this.weights.skills +
      locationScore.score * this.weights.location +
      experienceScore.score * this.weights.experience +
      educationScore.score * this.weights.education +
      workModelScore.score * this.weights.workModel
    );
    
    // Auf zwei Nachkommastellen gerundet
    const roundedScore = Math.round(overallScore * 100) / 100;
    
    return {
      skillMatches: skillScore,
      locationMatch: locationScore,
      experienceMatch: experienceScore,
      educationMatch: educationScore,
      workModelMatch: workModelScore,
      overallScore: roundedScore
    };
  }
  
  /**
   * Berechnet den Skill-Match-Score
   */
  private calculateSkillScore(
    candidate: EnhancedCandidate | EnhancedApplication,
    job: EnhancedJob
  ): {
    score: number;
    matchedSkills: string[];
    partiallyMatchedSkills: string[];
    missingSkills: string[];
  } {
    // Extrahiere Skills aus Kandidat/Bewerber und Job
    const candidateSkills = this.extractSkills(candidate);
    const jobSkills = this.extractSkills(job);
    
    // Berechne den Match-Score
    const score = this.skillMatcher.calculateSkillMatchScore(candidateSkills, jobSkills);
    
    // Für ein detailreiches Matching würden wir hier noch die genauen Matches extrahieren,
    // aber für die Einfachheit geben wir zunächst nur grobe Kategorien zurück
    const matchedSkills: string[] = [];
    const partiallyMatchedSkills: string[] = [];
    const missingSkills: string[] = [];
    
    // Sehr einfache Kategorisierung der Skills (könnte in einer realen Implementierung komplexer sein)
    for (const jobSkill of jobSkills) {
      const matchFound = candidateSkills.some(candidateSkill => 
        candidateSkill.toLowerCase() === jobSkill.toLowerCase()
      );
      
      const partialMatchFound = !matchFound && candidateSkills.some(candidateSkill => 
        candidateSkill.toLowerCase().includes(jobSkill.toLowerCase()) || 
        jobSkill.toLowerCase().includes(candidateSkill.toLowerCase())
      );
      
      if (matchFound) {
        matchedSkills.push(jobSkill);
      } else if (partialMatchFound) {
        partiallyMatchedSkills.push(jobSkill);
      } else {
        missingSkills.push(jobSkill);
      }
    }
    
    return {
      score,
      matchedSkills,
      partiallyMatchedSkills,
      missingSkills
    };
  }
  
  /**
   * Berechnet den Standort-Match-Score
   */
  private calculateLocationScore(
    candidate: EnhancedCandidate | EnhancedApplication,
    job: EnhancedJob
  ): {
    score: number;
    matchedLocations: string[];
  } {
    // Extrahiere Standorte
    const candidateLocation = candidate.location || candidate.applicant_location || '';
    const jobLocation = job.location || '';
    
    // Remote-Arbeit möglich?
    const remoteWorkPossible = job.remote_work || false;
    
    // Berechne den Score
    const score = this.locationMatcher.calculateLocationMatchScore(
      candidateLocation,
      jobLocation,
      remoteWorkPossible
    );
    
    // Ermittle die übereinstimmenden Standorte (vereinfacht)
    const candidateLocations = Array.isArray(candidateLocation) 
      ? candidateLocation
      : candidateLocation.split(',').map((loc: string) => loc.trim());
    
    const jobLocations = Array.isArray(jobLocation)
      ? jobLocation
      : jobLocation.split(',').map((loc: string) => loc.trim());
    
    const matchedLocations = candidateLocations.filter((candidateLoc: string) => 
      jobLocations.some((jobLoc: string) => jobLoc.toLowerCase().includes(candidateLoc.toLowerCase()) || 
      candidateLoc.toLowerCase().includes(jobLoc.toLowerCase()))
    );
    
    return {
      score,
      matchedLocations
    };
  }
  
  /**
   * Berechnet den Erfahrungs-Match-Score
   */
  private calculateExperienceScore(
    candidate: EnhancedCandidate | EnhancedApplication,
    job: EnhancedJob
  ): {
    score: number;
    requiredYears: number;
    actualYears: number;
  } {
    // Extrahiere Erfahrungsjahre (vereinfacht)
    const candidateExperience = this.extractExperienceYears(candidate);
    const requiredExperience = this.extractRequiredExperienceYears(job);
    
    // Berechne den Score:
    // - Wenn der Kandidat genau die geforderte Erfahrung hat: 100 Punkte
    // - Wenn der Kandidat weniger Erfahrung hat: Prozentsatz der geforderten Erfahrung
    // - Wenn der Kandidat mehr Erfahrung hat: 100 Punkte + Bonus (max. 20 Punkte)
    let score = 0;
    
    if (requiredExperience === 0) {
      // Wenn keine Erfahrung gefordert ist, ist jeder Kandidat geeignet
      score = 100;
    } else if (candidateExperience >= requiredExperience) {
      // Kandidat hat ausreichend Erfahrung
      score = 100;
      
      // Bonus für Überqualifizierung (max. 20 Punkte)
      const overQualificationBonus = Math.min(
        ((candidateExperience - requiredExperience) / requiredExperience) * 20,
        20
      );
      score += overQualificationBonus;
      
      // Score auf maximal 100 begrenzen
      score = Math.min(score, 100);
    } else {
      // Kandidat hat weniger Erfahrung als gefordert
      score = (candidateExperience / requiredExperience) * 100;
    }
    
    return {
      score,
      requiredYears: requiredExperience,
      actualYears: candidateExperience
    };
  }
  
  /**
   * Berechnet den Ausbildungs-Match-Score
   */
  private calculateEducationScore(
    candidate: EnhancedCandidate | EnhancedApplication,
    job: EnhancedJob
  ): {
    score: number;
    requiredLevel: string;
    actualLevel: string;
  } {
    // Extrahiere Ausbildungsstufen
    const candidateEducation = this.extractEducationLevel(candidate);
    const requiredEducation = this.extractRequiredEducationLevel(job);
    
    // Ausbildungsniveau-Hierarchie
    const educationLevels = [
      'keine', 
      'ausbildung', 
      'bachelor', 
      'master', 
      'doktor', 
      'professor'
    ];
    
    // Finde die Indizes in der Hierarchie
    const candidateLevelIndex = educationLevels.indexOf(candidateEducation);
    const requiredLevelIndex = educationLevels.indexOf(requiredEducation);
    
    // Berechne den Score
    let score = 0;
    
    if (requiredLevelIndex === -1 || requiredLevelIndex === 0) {
      // Keine spezifische Ausbildung gefordert
      score = 100;
    } else if (candidateLevelIndex >= requiredLevelIndex) {
      // Kandidat hat ausreichende oder höhere Ausbildung
      score = 100;
    } else {
      // Kandidat hat niedrigere Ausbildung als gefordert
      score = (candidateLevelIndex / requiredLevelIndex) * 100;
    }
    
    return {
      score,
      requiredLevel: requiredEducation,
      actualLevel: candidateEducation
    };
  }
  
  /**
   * Berechnet den Arbeitsmodell-Match-Score
   */
  private calculateWorkModelScore(
    candidate: EnhancedCandidate | EnhancedApplication,
    job: EnhancedJob
  ): {
    score: number;
    requiredModel: string;
    actualModel: string;
  } {
    // Extrahiere Arbeitsmodelle
    const candidateWorkModel = this.extractWorkModel(candidate);
    const jobWorkModel = this.extractWorkModel(job);
    
    // Berechne den Score
    let score = 0;
    
    // Wenn die Arbeitsmodelle exakt übereinstimmen
    if (candidateWorkModel === jobWorkModel) {
      score = 100;
    } 
    // Wenn der Kandidat 'flexibel' als Modell hat, kann er jedes Modell erfüllen
    else if (candidateWorkModel === 'flexibel') {
      score = 100;
    }
    // Teilweise Übereinstimmung für bestimmte Kombinationen
    else if (
      (candidateWorkModel === 'teilzeit' && jobWorkModel === 'vollzeit') ||
      (candidateWorkModel === 'vollzeit' && jobWorkModel === 'teilzeit') ||
      (candidateWorkModel === 'projekt' && jobWorkModel === 'teilzeit')
    ) {
      score = 50;
    }
    // Sonst keine Übereinstimmung
    else {
      score = 0;
    }
    
    return {
      score,
      requiredModel: jobWorkModel,
      actualModel: candidateWorkModel
    };
  }
  
  /**
   * Extrahiert Skills aus einem Kandidaten/Bewerber oder Job
   */
  private extractSkills(entity: SkillsEntity): string[] {
    // Prüfen, ob ein skills-Feld existiert
    if (entity.skills) {
      // Wenn skills ein String ist, konvertiere zu Array
      if (typeof entity.skills === 'string') {
        try {
          return JSON.parse(entity.skills);
        } catch (e) {
          // Falls keine gültige JSON-Liste, versuche eine Komma-getrennte Liste zu parsen
          return entity.skills.split(',').map((skill: string) => skill.trim());
        }
      }
      
      // Wenn skills bereits ein Array ist
      if (Array.isArray(entity.skills)) {
        if (entity.skills.length > 0 && typeof entity.skills[0] === 'object') {
          // Skills im Format { name: string, level?: number }[]
          return entity.skills.map((skill: any) => skill.name || '').filter(Boolean);
        }
        return entity.skills as string[];
      }
    }
    
    return [];
  }
  
  /**
   * Extrahiert die Berufserfahrung eines Kandidaten in Jahren
   */
  private extractExperienceYears(candidate: ExperienceEntity): number {
    if (!candidate.experience) return 0;
    
    // Wenn experience ein String ist, versuche zu parsen
    if (typeof candidate.experience === 'string') {
      try {
        const experiences = JSON.parse(candidate.experience);
        
        // Berechne die Gesamterfahrung in Jahren
        return experiences.reduce((total: number, exp: any) => {
          const years = exp.years || exp.duration || 0;
          return total + parseFloat(years.toString());
        }, 0);
      } catch (e) {
        // Wenn keine gültige JSON, versuche eine Zahl zu extrahieren
        const yearsMatch = candidate.experience.match(/(\d+)(?:\s*jahre|\s*years|\s*jahr|\s*year)/i);
        return yearsMatch ? parseInt(yearsMatch[1], 10) : 0;
      }
    }
    
    // Wenn experience ein Array ist
    if (Array.isArray(candidate.experience)) {
      return candidate.experience.reduce((total: number, exp: any) => {
        const years = exp.years || exp.duration || 0;
        return total + parseFloat(years.toString());
      }, 0);
    }
    
    return 0;
  }
  
  /**
   * Extrahiert die geforderte Berufserfahrung eines Jobs in Jahren
   */
  private extractRequiredExperienceYears(job: ExperienceEntity): number {
    if (!job.experience_years && !job.description) return 0;
    
    // Wenn experience_years vorhanden ist
    if (job.experience_years) {
      return parseFloat(job.experience_years.toString());
    }
    
    // Wenn experience_years nicht vorhanden ist, versuche es aus der Beschreibung zu extrahieren
    if (job.description) {
      const yearsMatch = job.description.match(/(\d+)(?:\s*jahre|\s*years|\s*jahr|\s*year)(?:\s*erfahrung|\s*experience)/i);
      return yearsMatch ? parseInt(yearsMatch[1], 10) : 0;
    }
    
    return 0;
  }
  
  /**
   * Extrahiert das Ausbildungsniveau eines Kandidaten
   */
  private extractEducationLevel(candidate: EducationEntity): string {
    if (!candidate.education) return 'keine';
    
    // Mögliche Ausbildungsstufen (in Kleinbuchstaben)
    const educationKeywords = {
      'ausbildung': ['ausbildung', 'berufsausbildung', 'apprenticeship', 'vocational'],
      'bachelor': ['bachelor', 'bakkalaureus', 'undergraduate', 'b.sc', 'b.a'],
      'master': ['master', 'magister', 'graduate', 'm.sc', 'm.a', 'diplom', 'diploma'],
      'doktor': ['doktor', 'doctor', 'phd', 'dr.', 'promotion'],
      'professor': ['professor', 'prof.', 'lehrstuhl', 'chair']
    };
    
    let education: string;
    
    // Wenn education ein String ist, konvertiere zu Array
    if (typeof candidate.education === 'string') {
      education = candidate.education.toLowerCase();
    } 
    // Wenn education ein Array ist, nehme das höchste Level
    else if (Array.isArray(candidate.education)) {
      education = candidate.education.map((edu: any) => 
        typeof edu === 'string' ? edu.toLowerCase() : 
        edu.degree ? edu.degree.toLowerCase() : 'keine'
      ).join(' ');
    } else {
      return 'keine';
    }
    
    // Finde das höchste Ausbildungsniveau
    for (const level of ['professor', 'doktor', 'master', 'bachelor', 'ausbildung']) {
      const keywords = educationKeywords[level as keyof typeof educationKeywords];
      if (keywords.some(keyword => education.includes(keyword))) {
        return level;
      }
    }
    
    return 'keine';
  }
  
  /**
   * Extrahiert das geforderte Ausbildungsniveau eines Jobs
   */
  private extractRequiredEducationLevel(job: EducationEntity): string {
    if (!job.education_required && !job.description) return 'keine';
    
    // Wenn education_required vorhanden ist
    if (job.education_required) {
      const education = job.education_required.toLowerCase();
      
      // Mögliche Ausbildungsstufen (in Kleinbuchstaben)
      const educationKeywords = {
        'ausbildung': ['ausbildung', 'berufsausbildung', 'apprenticeship', 'vocational'],
        'bachelor': ['bachelor', 'bakkalaureus', 'undergraduate', 'b.sc', 'b.a'],
        'master': ['master', 'magister', 'graduate', 'm.sc', 'm.a', 'diplom', 'diploma'],
        'doktor': ['doktor', 'doctor', 'phd', 'dr.', 'promotion'],
        'professor': ['professor', 'prof.', 'lehrstuhl', 'chair']
      };
      
      // Finde das höchste Ausbildungsniveau
      for (const level of ['professor', 'doktor', 'master', 'bachelor', 'ausbildung']) {
        const keywords = educationKeywords[level as keyof typeof educationKeywords];
        if (keywords.some(keyword => education.includes(keyword))) {
          return level;
        }
      }
    }
    
    // Wenn education_required nicht vorhanden ist, versuche es aus der Beschreibung zu extrahieren
    if (job.description) {
      const description = job.description.toLowerCase();
      
      // Mögliche Ausbildungsstufen (in Kleinbuchstaben)
      const educationKeywords = {
        'ausbildung': ['ausbildung', 'berufsausbildung', 'apprenticeship', 'vocational'],
        'bachelor': ['bachelor', 'bakkalaureus', 'undergraduate', 'b.sc', 'b.a'],
        'master': ['master', 'magister', 'graduate', 'm.sc', 'm.a', 'diplom', 'diploma'],
        'doktor': ['doktor', 'doctor', 'phd', 'dr.', 'promotion'],
        'professor': ['professor', 'prof.', 'lehrstuhl', 'chair']
      };
      
      // Finde das höchste Ausbildungsniveau
      for (const level of ['professor', 'doktor', 'master', 'bachelor', 'ausbildung']) {
        const keywords = educationKeywords[level as keyof typeof educationKeywords];
        if (keywords.some(keyword => description.includes(keyword))) {
          return level;
        }
      }
    }
    
    return 'keine';
  }
  
  /**
   * Extrahiert das Arbeitsmodell eines Kandidaten oder Jobs
   */
  private extractWorkModel(entity: WorkModelEntity): string {
    // Mögliche Arbeitsmodelle
    const workModels = {
      'vollzeit': ['vollzeit', 'full-time', 'fulltime', 'full time'],
      'teilzeit': ['teilzeit', 'part-time', 'parttime', 'part time'],
      'projekt': ['projekt', 'project', 'befristet', 'temporary', 'freiberuflich', 'freelance'],
      'praktikum': ['praktikum', 'internship', 'werkstudent', 'student'],
      'ausbildung': ['ausbildung', 'apprenticeship', 'trainee', 'duales-studium'],
      'flexibel': ['flexibel', 'flexible', 'remote', 'homeoffice', 'home-office', 'home office']
    };
    
    let modelText = '';
    
    // Für Kandidaten/Bewerber
    if ('preferred_work_model' in entity && entity.preferred_work_model) {
      modelText = entity.preferred_work_model.toString().toLowerCase();
    }
    // Für Jobs
    else if ('work_model' in entity && entity.work_model) {
      modelText = entity.work_model.toString().toLowerCase();
    }
    // Fallback auf Beschreibung
    else if ('description' in entity && entity.description) {
      modelText = entity.description.toString().toLowerCase();
    }
    
    // Suche nach dem am besten passenden Arbeitsmodell
    for (const [model, keywords] of Object.entries(workModels)) {
      if (keywords.some(keyword => modelText.includes(keyword))) {
        return model;
      }
    }
    
    // Standardwert, wenn kein spezifisches Modell gefunden wurde
    return 'vollzeit';
  }
  
  /**
   * Normalisiert die Gewichte, damit sie in Summe 1.0 ergeben
   */
  private normalizeWeights(): void {
    const sum = 
      this.weights.skills + 
      this.weights.location + 
      this.weights.experience + 
      this.weights.education + 
      this.weights.workModel;
    
    if (sum === 0) return;
    
    this.weights.skills /= sum;
    this.weights.location /= sum;
    this.weights.experience /= sum;
    this.weights.education /= sum;
    this.weights.workModel /= sum;
  }
}
