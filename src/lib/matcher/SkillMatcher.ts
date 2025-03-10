/**
 * SkillMatcher - Ein Service für semantisches Matching zwischen Skills
 * 
 * Dieser Service bietet Funktionen zum Vergleichen von Skills und zur Berechnung
 * von Ähnlichkeitsscores zwischen verschiedenen Skill-Sets.
 */

// Gewichtungsfaktoren für verschiedene Matching-Typen
export interface MatchWeights {
  exactMatch: number;       // Exakte Übereinstimmung
  partialMatch: number;     // Teilweise Übereinstimmung (Wort ist Teil eines anderen)
  stemMatch: number;        // Stammform-Übereinstimmung (z.B. "program" und "programming")
  synonymMatch: number;     // Synonym-Übereinstimmung
  categoryMatch: number;    // Kategorie-Übereinstimmung (z.B. "React" und "Frontend")
}

// Standard-Gewichtungsfaktoren
const DEFAULT_WEIGHTS: MatchWeights = {
  exactMatch: 1.0,
  partialMatch: 0.7,
  stemMatch: 0.8,
  synonymMatch: 0.9,
  categoryMatch: 0.6
};

// Skill-Kategorien zur besseren Zuordnung von ähnlichen Skills
interface SkillCategory {
  name: string;
  skills: string[];
}

// Vordefinierte Skill-Kategorien
const SKILL_CATEGORIES: SkillCategory[] = [
  {
    name: 'Frontend',
    skills: ['react', 'vue', 'angular', 'javascript', 'typescript', 'html', 'css', 'sass', 'less', 'jquery', 'bootstrap']
  },
  {
    name: 'Backend',
    skills: ['node', 'express', 'django', 'flask', 'spring', 'java', 'python', 'ruby', 'php', 'go', 'rust', 'c#', '.net']
  },
  {
    name: 'Datenbanken',
    skills: ['sql', 'mysql', 'postgresql', 'mongodb', 'firebase', 'oracle', 'cassandra', 'redis', 'dynamodb']
  },
  {
    name: 'DevOps',
    skills: ['docker', 'kubernetes', 'aws', 'azure', 'gcp', 'terraform', 'jenkins', 'gitlab', 'github', 'ci/cd']
  },
  {
    name: 'Mobile',
    skills: ['android', 'ios', 'swift', 'kotlin', 'react native', 'flutter', 'xamarin']
  },
  {
    name: 'Design',
    skills: ['ui', 'ux', 'figma', 'sketch', 'adobe', 'photoshop', 'illustrator', 'indesign']
  },
  {
    name: 'Projektmanagement',
    skills: ['scrum', 'agile', 'kanban', 'jira', 'confluence', 'trello', 'asana', 'pmp']
  },
  {
    name: 'Soft Skills',
    skills: ['kommunikation', 'teamarbeit', 'führung', 'problemlösung', 'zeitmanagement', 'kreativität']
  }
];

// Synonym-Paare für Skills
const SKILL_SYNONYMS: [string, string][] = [
  ['javascript', 'js'],
  ['typescript', 'ts'],
  ['react', 'reactjs'],
  ['vue', 'vuejs'],
  ['node', 'nodejs'],
  ['angular', 'angularjs'],
  ['css', 'stylesheet'],
  ['html', 'markup'],
  ['java', 'jvm'],
  ['python', 'py'],
  ['c#', 'csharp'],
  ['c++', 'cpp'],
  ['postgresql', 'postgres'],
  ['microsoft sql server', 'mssql'],
  ['git', 'version control'],
  ['docker', 'container'],
  ['kubernetes', 'k8s'],
  ['aws', 'amazon web services'],
  ['azure', 'microsoft azure'],
  ['gcp', 'google cloud'],
  ['ui', 'user interface'],
  ['ux', 'user experience'],
  ['devops', 'development operations']
];

export class SkillMatcher {
  private weights: MatchWeights;
  
  constructor(weights?: Partial<MatchWeights>) {
    this.weights = { ...DEFAULT_WEIGHTS, ...weights };
  }
  
  /**
   * Berechnet einen Ähnlichkeitsscore zwischen zwei Skill-Sets
   * @param candidateSkills Skills des Kandidaten/Bewerbers
   * @param jobSkills Skills, die für den Job gefordert sind
   * @returns Score zwischen 0 und 100
   */
  public calculateSkillMatchScore(candidateSkills: string[], jobSkills: string[]): number {
    if (!jobSkills || jobSkills.length === 0) return 0;
    if (!candidateSkills || candidateSkills.length === 0) return 0;
    
    // Normalisiere alle Skills (Kleinbuchstaben, Trimmen)
    const normalizedCandidateSkills = this.normalizeSkills(candidateSkills);
    const normalizedJobSkills = this.normalizeSkills(jobSkills);
    
    // Berechne die Punktzahl für jeden Job-Skill und summiere
    let totalScore = 0;
    let possibleScore = 0;
    
    for (const jobSkill of normalizedJobSkills) {
      possibleScore += this.weights.exactMatch; // Maximale Punktzahl pro Skill
      
      // Beste Übereinstimmung für diesen Job-Skill finden
      const bestMatchScore = this.findBestSkillMatch(jobSkill, normalizedCandidateSkills);
      totalScore += bestMatchScore;
    }
    
    // Normalisieren auf einen Wert zwischen 0 und 100
    if (possibleScore === 0) return 0;
    const normalizedScore = (totalScore / possibleScore) * 100;
    
    // Auf zwei Nachkommastellen runden
    return Math.round(normalizedScore * 100) / 100;
  }
  
  /**
   * Findet die beste Übereinstimmung für einen Skill in einer Liste von Skills
   * @param skill Der zu vergleichende Skill
   * @param skillList Die Liste der Skills, mit denen verglichen wird
   * @returns Den besten Match-Score
   */
  private findBestSkillMatch(skill: string, skillList: string[]): number {
    let bestScore = 0;
    
    for (const candidateSkill of skillList) {
      const score = this.calculateSingleSkillMatchScore(skill, candidateSkill);
      if (score > bestScore) {
        bestScore = score;
      }
      
      // Bei exakter Übereinstimmung können wir sofort zurückgeben
      if (bestScore >= this.weights.exactMatch) {
        return this.weights.exactMatch;
      }
    }
    
    return bestScore;
  }
  
  /**
   * Berechnet den Match-Score zwischen zwei einzelnen Skills
   * @param skill1 Erster Skill
   * @param skill2 Zweiter Skill
   * @returns Match-Score basierend auf den Gewichtungsfaktoren
   */
  private calculateSingleSkillMatchScore(skill1: string, skill2: string): number {
    // Exakte Übereinstimmung
    if (skill1 === skill2) {
      return this.weights.exactMatch;
    }
    
    // Teilweise Übereinstimmung
    if (skill1.includes(skill2) || skill2.includes(skill1)) {
      return this.weights.partialMatch;
    }
    
    // Synonym-Übereinstimmung
    if (this.areSynonyms(skill1, skill2)) {
      return this.weights.synonymMatch;
    }
    
    // Stammform-Übereinstimmung
    if (this.haveCommonStem(skill1, skill2)) {
      return this.weights.stemMatch;
    }
    
    // Kategorie-Übereinstimmung
    if (this.areInSameCategory(skill1, skill2)) {
      return this.weights.categoryMatch;
    }
    
    return 0;
  }
  
  /**
   * Prüft, ob zwei Skills Synonyme sind
   */
  private areSynonyms(skill1: string, skill2: string): boolean {
    for (const [syn1, syn2] of SKILL_SYNONYMS) {
      if ((skill1 === syn1 && skill2 === syn2) || (skill1 === syn2 && skill2 === syn1)) {
        return true;
      }
    }
    return false;
  }
  
  /**
   * Prüft, ob zwei Skills einen gemeinsamen Wortstamm haben
   * Einfache Implementierung: Prüft, ob ein Skill mit dem anderen beginnt
   */
  private haveCommonStem(skill1: string, skill2: string): boolean {
    const minLength = 4; // Mindestlänge für sinnvolle Stammformen
    
    if (skill1.length < minLength || skill2.length < minLength) {
      return false;
    }
    
    const shorterSkill = skill1.length <= skill2.length ? skill1 : skill2;
    const longerSkill = skill1.length > skill2.length ? skill1 : skill2;
    
    // Prüfe, ob der längere Skill mit dem kürzeren beginnt (einfache Stammformprüfung)
    return longerSkill.startsWith(shorterSkill);
  }
  
  /**
   * Prüft, ob zwei Skills in der gleichen Kategorie sind
   */
  private areInSameCategory(skill1: string, skill2: string): boolean {
    for (const category of SKILL_CATEGORIES) {
      if (category.skills.includes(skill1) && category.skills.includes(skill2)) {
        return true;
      }
    }
    return false;
  }
  
  /**
   * Normalisiert eine Liste von Skills
   */
  private normalizeSkills(skills: string[]): string[] {
    return skills
      .map(skill => skill.toLowerCase().trim())
      .filter(skill => skill.length > 0);
  }
}
