import { Job, Candidate, Skill, MatchingOptions } from '@/types'

export interface MatchingWeights {
  skills: number
  experience: number
  location: number
  education: number
  salary: number
}

export interface MatchResult {
  score: number
  matchedSkills: string[]
  missingSkills: string[]
  partialMatchSkills?: Array<{skill: string, confidence: number}>
  locationMatch: boolean
  salaryMatch: boolean
  experienceMatch: boolean
  details: {
    skillScore: number
    experienceScore: number
    locationScore: number
    salaryScore: number
    educationScore: number
  }
}

class MatchingService {
  defaultWeights: MatchingWeights = {
    skills: 0.4,
    experience: 0.2,
    location: 0.15,
    education: 0.15,
    salary: 0.1
  }

  calculateMatch(
    job: Job,
    candidate: Candidate,
    weights: MatchingWeights = this.defaultWeights,
    options: MatchingOptions = {
      fuzzySkillMatching: true,
      locationRadius: 50,
      minimumScore: 60
    }
  ): MatchResult {
    // Extrahiere Skills aus den Job-Anforderungen
    const requiredSkills = this.extractSkillsFromRequirements(job.requirements || '')
    
    // Skill Matching - prüfe, ob beide Skill-Arrays vorhanden sind und handle verschiedene Formate
    let candidateSkills: string[] = [];
    
    if (candidate.skills) {
      // Prüfe, ob skills ein Array ist
      if (Array.isArray(candidate.skills)) {
        candidateSkills = candidate.skills.map(skill => {
          // String-Format: direkt zurückgeben
          if (typeof skill === 'string') return skill;
          // Objekt-Format mit name-Eigenschaft
          if (typeof skill === 'object' && skill !== null && 'name' in skill) return skill.name as string;
          // JSON-Format oder anderes Format: als String konvertieren
          return String(skill);
        });
      } 
      // Wenn skills ein String ist, könnte es ein JSON-String sein oder ein einfacher String
      else if (typeof candidate.skills === 'string') {
        try {
          // Versuche als JSON zu parsen
          const parsedSkills = JSON.parse(candidate.skills);
          if (Array.isArray(parsedSkills)) {
            candidateSkills = parsedSkills.map(skill => {
              if (typeof skill === 'string') return skill;
              if (typeof skill === 'object' && skill !== null && 'name' in skill) return skill.name as string;
              return String(skill);
            });
          } else {
            // Wenn es kein Array ist, aber ein Objekt mit name-Eigenschaft
            if (typeof parsedSkills === 'object' && parsedSkills !== null && 'name' in parsedSkills) {
              candidateSkills = [parsedSkills.name as string];
            } else {
              candidateSkills = [candidate.skills as string];
            }
          }
        } catch (e) {
          // Wenn es kein gültiges JSON ist, behandle es als einfachen String
          candidateSkills = [candidate.skills];
        }
      }
    }
    const skillMatches = this.matchSkills(
      requiredSkills, 
      candidateSkills,
      options.fuzzySkillMatching
    )
    
    // Berücksichtige jetzt auch partielle Matches mit einer geringeren Gewichtung
    const partialMatchWeight = 0.5; // Partielle Matches zählen halb so viel wie exakte Matches
    const skillScore = requiredSkills.length > 0 
      ? ((skillMatches.matched.length + (skillMatches.partialMatches.length * partialMatchWeight)) / requiredSkills.length) * 100
      : 50 // Standardwert, wenn keine Skills angegeben

    // Experience Matching - extrahiere Erfahrungsjahre aus Strings
    const requiredExperience = this.extractExperienceYears(job.requirements || '')
    
    // Robuste Verarbeitung von candidateExperience mit verschiedenen Formaten
    let experienceText = '';
    if (candidate.experience) {
      // Wenn es ein Array ist
      if (Array.isArray(candidate.experience)) {
        // Wandle jedes Element in String um und verbinde
        experienceText = candidate.experience.map(exp => {
          if (typeof exp === 'string') return exp;
          if (typeof exp === 'object' && exp !== null) {
            // Extrahiere relevante Felder aus Objekt
            const { position, company, period, startDate, endDate, description } = exp;
            return [position, company, period, description].filter(Boolean).join(' ');
          }
          return String(exp);
        }).join(' ');
      }
      // Wenn es ein String ist
      else if (typeof candidate.experience === 'string') {
        try {
          // Versuche als JSON zu parsen
          const parsedExp = JSON.parse(candidate.experience);
          if (Array.isArray(parsedExp)) {
            experienceText = parsedExp.map(exp => typeof exp === 'string' ? exp : JSON.stringify(exp)).join(' ');
          } else {
            experienceText = candidate.experience;
          }
        } catch (e) {
          // Wenn kein gültiges JSON, verwende als String
          experienceText = candidate.experience;
        }
      }
      // Wenn es ein einzelnes Objekt ist
      else if (typeof candidate.experience === 'object' && candidate.experience !== null) {
        const { position, company, period, description } = candidate.experience;
        experienceText = [position, company, period, description].filter(Boolean).join(' ');
      }
      // Fallback für andere Typen
      else {
        experienceText = String(candidate.experience);
      }
    }
    
    const candidateExperience = this.extractExperienceYears(experienceText);
    const experienceScore = this.matchExperience(requiredExperience, candidateExperience)

    // Location Matching
    const locationScore = this.matchLocation(job.location || '', candidate.location || '')

    // Education Matching - extrahiere Bildungsanforderungen
    const requiredEducation = this.extractEducationRequirements(job.requirements || '')
    const candidateEducation = candidate.qualificationProfile?.certificates?.join(' ') || ''
    const educationScore = this.matchEducation(requiredEducation, candidateEducation)

    // Salary Matching - parse salary_range
    const salaryRange = this.parseSalaryRange(job.salary_range)
    const salaryExpectation = this.extractSalaryExpectation(candidate) || 0
    const salaryScore = this.matchSalary(salaryRange, salaryExpectation)

    // Gewichtete Gesamtpunktzahl
    const totalScore = Math.round(
      (skillScore * weights.skills) +
      (experienceScore * weights.experience) +
      (locationScore * weights.location) +
      (educationScore * weights.education) +
      (salaryScore * weights.salary)
    )

    return {
      score: totalScore,
      matchedSkills: skillMatches.matched,
      missingSkills: skillMatches.missing,
      partialMatchSkills: skillMatches.partialMatches,
      locationMatch: locationScore >= 70,
      salaryMatch: salaryScore >= 70,
      experienceMatch: experienceScore >= 70,
      details: {
        skillScore,
        experienceScore,
        locationScore,
        salaryScore,
        educationScore
      }
    }
  }

  // Extrahiert Skills aus dem Requirements-Text
  private extractSkillsFromRequirements(requirements: string): string[] {
    if (!requirements) return [];
    
    // Einfache Extraktion basierend auf häufigen Technologie-Keywords
    const techKeywords = [
      'javascript', 'typescript', 'react', 'angular', 'vue', 'node', 'express',
      'html', 'css', 'sass', 'less', 'php', 'laravel', 'python', 'django', 'flask',
      'java', 'spring', 'c#', '.net', 'ruby', 'rails', 'go', 'rust', 'kotlin',
      'swift', 'objective-c', 'sql', 'mysql', 'postgresql', 'mongodb', 'redis',
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'jira',
      'agile', 'scrum', 'kanban', 'rest', 'graphql', 'oauth', 'jwt', 'microservices',
      'sap', 'erp', 'crm', 'excel', 'powerpoint', 'word', 'photoshop', 'illustrator',
      'figma', 'sketch', 'adobe xd', 'indesign', 'after effects'
    ];
    
    const skills: string[] = [];
    const lowercaseRequirements = requirements.toLowerCase();
    
    for (const keyword of techKeywords) {
      if (lowercaseRequirements.includes(keyword)) {
        skills.push(keyword);
      }
    }
    
    return skills;
  }
  
  // Extrahiert Erfahrungsjahre aus einem Text
  private extractExperienceYears(text: string): number {
    if (!text) return 0;
    
    // Regulärer Ausdruck, um Jahre der Erfahrung zu finden 
    // Beispiele: "5 Jahre Erfahrung", "mindestens 3 Jahre", "3-5 Jahre"
    const regex = /(\d+)[-\s]?(\d+)?[\s-]*(jahr|jahre|years|year)/i;
    const match = text.match(regex);
    
    if (match) {
      if (match[2]) {
        // Bei einem Bereich (z.B. "3-5 Jahre") nehmen wir den Durchschnitt
        return Math.floor((parseInt(match[1]) + parseInt(match[2])) / 2);
      }
      return parseInt(match[1]);
    }
    
    return 0;
  }
  
  // Extrahiert Bildungsanforderungen aus einem Text
  private extractEducationRequirements(text: string): string {
    if (!text) return '';
    
    const lowercaseText = text.toLowerCase();
    const educationKeywords = [
      'bachelor', 'master', 'diplom', 'promotion', 'doktor', 'abitur', 
      'fachabitur', 'ausbildung', 'studium', 'universität', 'hochschule',
      'fachhochschule', 'berufsausbildung', 'realschule', 'hauptschule'
    ];
    
    for (const keyword of educationKeywords) {
      if (lowercaseText.includes(keyword)) {
        return keyword;
      }
    }
    
    return '';
  }
  
  // Parsed den salary_range String in min/max-Werte
  private parseSalaryRange(salaryRangeStr?: string): { min?: number, max?: number } {
    if (!salaryRangeStr) return {};
    
    // Entferne alle Nicht-Ziffern außer Dezimalpunkten und Bindestrichen
    const cleaned = salaryRangeStr.replace(/[^\d.-]/g, ' ');
    const numbers = cleaned.match(/\d+/g);
    
    if (!numbers || numbers.length === 0) return {};
    
    if (numbers.length === 1) {
      // Nur eine Zahl gefunden, setze sie als Minimum
      return { min: parseInt(numbers[0]), max: parseInt(numbers[0]) * 1.2 };
    }
    
    // Sortiere die gefundenen Zahlen und nimm die niedrigste und höchste
    const sortedNums = numbers.map(n => parseInt(n)).sort((a, b) => a - b);
    return {
      min: sortedNums[0],
      max: sortedNums[sortedNums.length - 1]
    };
  }
  
  // Extrapoliert die Gehaltserwartung eines Kandidaten
  private extractSalaryExpectation(candidate: Candidate): number | undefined {
    // In einem realen System würde dies aus den Kandidatendaten kommen
    // Hier erstellen wir einen Dummy-Wert basierend auf Position/Skills
    
    // Basis-Gehalt nach Berufsbezeichnung
    const positionBaseSalaries: { [key: string]: number } = {
      'developer': 65000,
      'senior': 85000,
      'junior': 45000,
      'lead': 95000,
      'manager': 90000,
      'director': 120000,
      'cto': 150000,
      'ceo': 200000,
      'frontend': 60000,
      'backend': 65000,
      'fullstack': 70000,
      'devops': 75000,
      'qa': 55000,
      'tester': 50000,
      'designer': 55000,
      'product': 70000
    };
    
    // Standard-Gehalt
    let salary = 60000;
    
    // Passe nach Position an
    if (candidate.position) {
      const lowerPos = candidate.position.toLowerCase();
      
      for (const [key, value] of Object.entries(positionBaseSalaries)) {
        if (lowerPos.includes(key)) {
          salary = value;
          break;
        }
      }
    }
    
    // Passe nach Skills an (5% extra für jede wichtige Skill)
    const premiumSkills = ['react', 'angular', 'vue', 'node', 'typescript', 'python', 'java', 'aws', 'azure', 'kubernetes'];
    let skillBonus = 0;
    
    if (candidate.skills) {
      // Extrahiere Skills aus dem Kandidaten-Objekt, ähnlich wie in calculateMatch
      let skillNames: string[] = [];
      
      if (Array.isArray(candidate.skills)) {
        skillNames = candidate.skills.map(skill => {
          if (typeof skill === 'string') return skill;
          if (typeof skill === 'object' && skill !== null && 'name' in skill) return skill.name as string;
          return String(skill);
        });
      } else if (typeof candidate.skills === 'string') {
        try {
          const parsedSkills = JSON.parse(candidate.skills);
          if (Array.isArray(parsedSkills)) {
            skillNames = parsedSkills.map(skill => {
              if (typeof skill === 'string') return skill;
              if (typeof skill === 'object' && skill !== null && 'name' in skill) return skill.name as string;
              return String(skill);
            });
          } else {
            skillNames = [candidate.skills];
          }
        } catch (e) {
          skillNames = [candidate.skills];
        }
      }
      
      // Berechne Bonus basierend auf Premium-Skills
      for (const skillName of skillNames) {
        if (premiumSkills.some(s => String(skillName).toLowerCase().includes(s))) {
          skillBonus += 0.05;
        }
      }
      
      // Maximum 30% Skill-Bonus
      skillBonus = Math.min(skillBonus, 0.3);
      salary = salary * (1 + skillBonus);
    }
    
    return Math.round(salary);
  }

  // Verbesserte Ähnlichkeitsberechnung mit verschiedenen Algorithmen
  private calculateSimilarity(str1: string, str2: string): number {
    const a = str1.toLowerCase().trim();
    const b = str2.toLowerCase().trim();
    
    // Direkte Übereinstimmungen
    if (a === b) return 1.0;
    if (a.includes(b) || b.includes(a)) return 0.9;
    
    // Wortweise Übereinstimmung für mehrteilige Begriffe
    const aWords = a.split(/\s+/);
    const bWords = b.split(/\s+/);
    
    if (aWords.length > 1 || bWords.length > 1) {
      // Für Multi-Wort-Begriffe, berechne die Übereinstimmung auf Wortebene
      let matchedWords = 0;
      const totalWords = Math.max(aWords.length, bWords.length);
      
      for (const aWord of aWords) {
        if (bWords.some(bWord => this.fuzzyMatchWord(aWord, bWord) > 0.8)) {
          matchedWords++;
        }
      }
      
      const wordLevelSimilarity = matchedWords / totalWords;
      if (wordLevelSimilarity > 0.5) {
        return wordLevelSimilarity;
      }
    }
    
    // Berechne Levenshtein-Distanz für einzelne Wörter oder Fallback
    return this.fuzzyMatchWord(a, b);
  }
  
  // Optimierte Levenshtein-Distanz für einzelne Wörter
  private fuzzyMatchWord(str1: string, str2: string): number {
    const a = str1.toLowerCase();
    const b = str2.toLowerCase();
    
    // Für sehr kurze Wörter: strict matching
    if (a.length < 3 || b.length < 3) {
      return a === b ? 1.0 : 0.0;
    }
    
    // Berechne Levenshtein-Distanz
    const matrix: number[][] = [];
    
    // Initialisiere Matrix
    for (let i = 0; i <= a.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= b.length; j++) {
      matrix[0][j] = j;
    }
    
    // Fülle Matrix
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // Löschen
          matrix[i][j - 1] + 1,      // Einfügen
          matrix[i - 1][j - 1] + cost // Ersetzen
        );
      }
    }
    
    // Berechne Ähnlichkeitsscore (0-1)
    const maxLength = Math.max(a.length, b.length);
    const distance = matrix[a.length][b.length];
    const similarity = 1 - distance / maxLength;
    
    return similarity;
  }

  // Skill-Matching Methode
  private matchSkills(
    required: string[],
    candidate: string[],
    fuzzyMatching: boolean
  ): { matched: string[], missing: string[], partialMatches: {skill: string, confidence: number}[] } {
    const matched: string[] = [];
    const missing: string[] = [];
    const partialMatches: {skill: string, confidence: number}[] = [];

    if (!required || required.length === 0) {
      return { matched, missing, partialMatches };
    }
    
    if (!candidate || candidate.length === 0) {
      return { matched, missing: [...required], partialMatches };
    }

    // Normalisiere alle Skills (Kleinbuchstaben, Entferne Sonderzeichen)
    const normalizeSkill = (skill: string): string => {
      return skill.toLowerCase()
        .replace(/[^\w\s\-\+\#]/g, '') // Behalte Wörter, Leerzeichen, Bindestriche, Plus und Hashtags
        .replace(/\s+/g, ' ')          // Reduziere mehrere Leerzeichen auf eines
        .trim();
    };

    const normalizedRequiredSkills = required.map(normalizeSkill);
    const normalizedCandidateSkills = candidate.map(normalizeSkill);

    // Synonyme für häufige Technologien
    const skillSynonyms: {[key: string]: string[]} = {
      'javascript': ['js', 'ecmascript', 'es6', 'es2015', 'es2016', 'es2017', 'es2018', 'es2019', 'es2020'],
      'typescript': ['ts'],
      'react': ['reactjs', 'react.js'],
      'node': ['nodejs', 'node.js'],
      'vue': ['vuejs', 'vue.js'],
      'angular': ['angularjs', 'angular.js', 'ng'],
      'python': ['py'],
      'java': ['jvm'],
      'c#': ['csharp', 'c sharp'],
      '.net': ['dotnet', 'dot net'],
      'php': ['php7', 'php8'],
      'sql': ['mysql', 'postgresql', 'oracle', 'sql server', 'tsql'],
      'nosql': ['mongodb', 'couchdb', 'redis', 'cassandra'],
      'aws': ['amazon web services'],
      'azure': ['microsoft azure'],
      'gcp': ['google cloud', 'google cloud platform'],
      'docker': ['container', 'containerization'],
      'kubernetes': ['k8s', 'container orchestration']
    };

    for (const requiredSkill of normalizedRequiredSkills) {
      // 1. Exakte Übereinstimmung
      if (normalizedCandidateSkills.includes(requiredSkill)) {
        matched.push(requiredSkill);
        continue;
      }

      // 2. Synonymprüfung
      let synonymFound = false;
      for (const [mainSkill, synonyms] of Object.entries(skillSynonyms)) {
        // Wenn geforderte Fähigkeit ein Hauptbegriff ist, suche nach Synonymen beim Kandidaten
        if (requiredSkill === mainSkill && normalizedCandidateSkills.some(s => synonyms.includes(s))) {
          matched.push(requiredSkill);
          synonymFound = true;
          break;
        }
        // Wenn geforderte Fähigkeit ein Synonym ist, prüfe, ob Kandidat den Hauptbegriff oder ein anderes Synonym hat
        if (synonyms.includes(requiredSkill) && 
            (normalizedCandidateSkills.includes(mainSkill) || 
             normalizedCandidateSkills.some(s => synonyms.includes(s)))) {
          matched.push(requiredSkill);
          synonymFound = true;
          break;
        }
      }
      if (synonymFound) continue;

      // 3. Fuzzy-Matching als letztes Mittel, falls aktiviert
      if (fuzzyMatching) {
        const bestMatch = normalizedCandidateSkills
          .map(candidateSkill => ({
            skill: candidateSkill,
            similarity: this.calculateSimilarity(requiredSkill, candidateSkill)
          }))
          .sort((a, b) => b.similarity - a.similarity)[0];
        
        if (bestMatch && bestMatch.similarity > 0.85) {
          matched.push(requiredSkill);
        } else if (bestMatch && bestMatch.similarity > 0.7) {
          partialMatches.push({
            skill: requiredSkill,
            confidence: bestMatch.similarity
          });
        } else {
          missing.push(requiredSkill);
        }
      } else {
        missing.push(requiredSkill);
      }
    }

    return { matched, missing, partialMatches };
  }

  // Verbessertes Experience Matching
  private matchExperience(required: number, candidate: number): number {
    if (required === 0) return 100; // Wenn keine Erfahrung gefordert ist
    if (candidate >= required) return 100; // Volle Übereinstimmung
    
    // Abstufungen je nach Erfüllung der Anforderung
    if (candidate >= required * 0.8) return 90; // Sehr gute Übereinstimmung
    if (candidate >= required * 0.6) return 75; // Gute Übereinstimmung
    if (candidate >= required * 0.4) return 50; // Mittelmäßige Übereinstimmung
    if (candidate >= required * 0.2) return 30; // Schlechte Übereinstimmung
    
    return 15; // Minimale Übereinstimmung
  }

  // Verbesserte Standortübereinstimmung
  private matchLocation(jobLocation: string, candidateLocation: string): number {
    // Wenn einer der Orte nicht angegeben ist, gehen wir vom Worst Case aus
    if (!jobLocation || !candidateLocation) return 30;
    
    // Normalisiere die Standorte für den Vergleich
    const normalizeLocation = (loc: string) => {
      return loc.toLowerCase()
        .replace(/[^\w\s\-\/,äöüß]/g, '') // Behalte deutsche Umlaute, entferne andere Sonderzeichen
        .trim();
    };
    
    const jobLoc = normalizeLocation(jobLocation);
    const candidateLoc = normalizeLocation(candidateLocation);
    
    // Remote-Work-Keywords
    const remoteKeywords = [
      // Deutsch
      'remote', 'homeoffice', 'home office', 'remote-arbeit', 'remote arbeit', 
      'telearbeit', 'mobiles arbeiten', 'flexibel', 'standortunabhängig', 'ortsunabhängig',
      'virtuell', 'aus der ferne', 'von zuhause', 'heimarbeit', 'dezentral'
    ];
    
    // Prüfe auf Remote-Arbeit
    const isJobRemote = remoteKeywords.some(keyword => jobLoc.includes(keyword));
    const isCandidateRemote = remoteKeywords.some(keyword => candidateLoc.includes(keyword));
    
    // Wenn beide Remote sind oder die Stelle Remote und der Kandidat auch
    if (isJobRemote && isCandidateRemote) return 100;
    if (isJobRemote) return 90; // Stelle erlaubt Remote-Arbeit, egal wo der Kandidat ist
    
    // Exakte Standortübereinstimmung
    if (jobLoc === candidateLoc) return 100;
    
    // Trenne den Standort in Komponenten (Stadt, PLZ, Land, etc.)
    const splitLocation = (loc: string) => {
      // Teilt nach Komma, Schrägstrich, Bindestrichen (wenn nicht Teil eines Wortes)
      const parts = loc.split(/\s*[,\/]\s*|\s+-\s+/);
      return parts.map(part => part.trim())
                 .filter(part => part.length > 0);
    };
    
    const jobParts = splitLocation(jobLoc);
    const candidateParts = splitLocation(candidateLoc);
    
    // Wenn ein Teil exakt übereinstimmt (z.B. "Berlin" in "Berlin, Deutschland" und "Berlin")
    for (const jobPart of jobParts) {
      if (candidateParts.some(candPart => 
        jobPart === candPart || 
        (jobPart.length > 3 && candPart.includes(jobPart)) || 
        (candPart.length > 3 && jobPart.includes(candPart))
      )) {
        return 95;
      }
    }
    
    // PLZ-Vergleich (wenn vorhanden)
    const extractPLZ = (parts: string[]): string | null => {
      const plzPattern = /^\d{5}$/;
      for (const part of parts) {
        if (plzPattern.test(part)) return part;
      }
      return null;
    };
    
    const jobPLZ = extractPLZ(jobParts);
    const candidatePLZ = extractPLZ(candidateParts);
    
    if (jobPLZ && candidatePLZ) {
      // Gleiche PLZ
      if (jobPLZ === candidatePLZ) return 95;
      
      // PLZ im gleichen Gebiet (erste 2 Ziffern gleich = gleicher Bezirk)
      if (jobPLZ.substring(0, 2) === candidatePLZ.substring(0, 2)) return 80;
    }
    
    // Einfache Stadtvergleich-Logik
    // Extrahiere Städte aus den Standorten
    const germanCities = [
      'berlin', 'hamburg', 'münchen', 'köln', 'frankfurt', 'stuttgart', 'düsseldorf', 
      'leipzig', 'dortmund', 'essen', 'bremen', 'dresden', 'hannover', 'nürnberg'
    ];
    
    const extractCity = (parts: string[]): string | null => {
      for (const part of parts) {
        const normalizedPart = part.toLowerCase();
        if (germanCities.includes(normalizedPart)) return normalizedPart;
      }
      return null;
    };
    
    const jobCity = extractCity(jobParts);
    const candidateCity = extractCity(candidateParts);
    
    if (jobCity && candidateCity) {
      // Wenn die Städte übereinstimmen
      if (jobCity === candidateCity) return 90;
    }
    
    // Prüfe auf Region/Bundesland
    const germanRegions: { [key: string]: string[] } = {
      'bayern': ['münchen', 'nürnberg', 'augsburg'],
      'berlin': ['berlin'],
      'hamburg': ['hamburg'],
      'nrw': ['köln', 'düsseldorf', 'dortmund', 'essen'],
      'sachsen': ['leipzig', 'dresden', 'chemnitz'],
      'niedersachsen': ['hannover', 'braunschweig', 'oldenburg']
    };
    
    // Finde die Region für beide Standorte
    const findRegion = (city: string | null): string | null => {
      if (city) {
        for (const [region, cities] of Object.entries(germanRegions)) {
          if (cities.includes(city)) return region;
        }
      }
      return null;
    };
    
    const jobRegion = findRegion(jobCity);
    const candidateRegion = findRegion(candidateCity);
    
    // Prüfe, ob beide Orte in derselben Region liegen
    if (jobRegion && candidateRegion && jobRegion === candidateRegion) {
      return 75;
    }
    
    // Teilweise Hybrid-Arbeit oder Bereitschaft zum Pendeln berücksichtigen
    const flexKeywords = ['hybrid', 'teilweise vor ort', 'teilweise remote', 'hybrid-modell'];
    const isJobFlex = flexKeywords.some(keyword => jobLoc.includes(keyword));
    
    if (isJobFlex) {
      return 50; // Hybrides Modell ist flexibler bezüglich des Standorts
    }
    
    return 30; // Grundwert für unterschiedliche Regionen
  }

  // Verbessertes Education Matching
  private matchEducation(required: string, candidate: string): number {
    // Verbesserte Bildungsabgleich-Logik mit Bildungsstufen
    if (!required || !candidate) return 50; // Standardwert, wenn Daten fehlen
    
    // Normalisiere die Eingaben
    const normalizedRequired = required.toLowerCase().trim();
    const normalizedCandidate = candidate.toLowerCase().trim();
    
    // Exakter Match
    if (normalizedRequired === normalizedCandidate) return 100;
    
    // Definiere Bildungsstufen in hierarchischer Reihenfolge
    const educationLevels = [
      ['hauptschule', 'hauptschulabschluss'],
      ['realschule', 'mittlere reife', 'realschulabschluss'],
      ['fachabitur', 'fachhochschulreife'],
      ['abitur', 'allgemeine hochschulreife'],
      ['ausbildung', 'berufsausbildung', 'lehre'],
      ['bachelor', 'b.a.', 'b.sc.', 'b.eng.'],
      ['master', 'm.a.', 'm.sc.', 'm.eng.', 'diplom', 'magister'],
      ['promotion', 'doktor', 'phd', 'dr.']
    ];
    
    // Finde den Level für die Anforderung und den Kandidaten
    const findLevel = (education: string): number => {
      for (let i = 0; i < educationLevels.length; i++) {
        if (educationLevels[i].some(level => education.includes(level))) {
          return i;
        }
      }
      return -1; // Nicht gefunden
    };
    
    const requiredLevel = findLevel(normalizedRequired);
    const candidateLevel = findLevel(normalizedCandidate);
    
    // Wenn beide Levels nicht gefunden wurden
    if (requiredLevel === -1 || candidateLevel === -1) {
      // Prüfe auf ähnliche Begriffe (z.B. Fachrichtung)
      if (normalizedRequired.includes(normalizedCandidate) || 
          normalizedCandidate.includes(normalizedRequired)) {
        return 80;
      }
      return 50; // Standard-Fallback
    }
    
    // Wenn der Kandidat einen höheren Bildungsabschluss als gefordert hat
    if (candidateLevel > requiredLevel) return 100;
    
    // Wenn der Kandidat genau den geforderten Bildungsabschluss hat
    if (candidateLevel === requiredLevel) return 100;
    
    // Wenn der Kandidat einen niedrigeren Bildungsabschluss hat
    const difference = requiredLevel - candidateLevel;
    
    if (difference === 1) return 70; // Nur eine Stufe niedriger
    if (difference === 2) return 50; // Zwei Stufen niedriger
    return Math.max(30, 80 - (difference * 15)); // Abnehmender Score
  }
  
  // Gehaltsmatch-Methode
  private matchSalary(
    jobRange: { min?: number, max?: number } = {},
    candidateExpectation: number = 0
  ): number {
    if (!jobRange.min || !jobRange.max) return 100; // Wenn kein Gehaltsbereich angegeben ist
    
    // Perfekte Übereinstimmung
    if (candidateExpectation >= jobRange.min && candidateExpectation <= jobRange.max) return 100;
    
    // Leichte Abweichungen (10% Toleranz)
    if (candidateExpectation >= jobRange.min * 0.9 && candidateExpectation <= jobRange.max * 1.1) return 85;
    
    // Mittlere Abweichungen (20% Toleranz)
    if (candidateExpectation >= jobRange.min * 0.8 && candidateExpectation <= jobRange.max * 1.2) return 70;
    
    // Größere Abweichungen (30% Toleranz)
    if (candidateExpectation >= jobRange.min * 0.7 && candidateExpectation <= jobRange.max * 1.3) return 50;
    
    // Starke Abweichungen
    if (candidateExpectation < jobRange.min * 0.7) {
      // Kandidat erwartet deutlich weniger - kann positiv sein, aber ist oft ein Zeichen für Überqualifikation
      return 30;
    }
    
    // Kandidat erwartet deutlich mehr als Maximum
    if (candidateExpectation > jobRange.max * 1.3) {
      // Je größer die Abweichung, desto unwahrscheinlicher der Match
      const factor = candidateExpectation / jobRange.max;
      
      if (factor > 2) return 0; // Mehr als doppelt so viel wie Maximum
      if (factor > 1.5) return 15; // 50-100% mehr als Maximum
      return 25; // 30-50% mehr als Maximum
    }
    
    return 40; // Standardwert für alle anderen Fälle
  }
}

// Export der Klasse als Singleton
const matchingService = new MatchingService();
export default matchingService;
