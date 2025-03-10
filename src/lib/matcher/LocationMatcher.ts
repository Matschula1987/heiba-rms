/**
 * LocationMatcher - Ein Service für geografisches Matching zwischen Standorten
 * 
 * Dieser Service bietet Funktionen zum Vergleichen von Standorten und zur Berechnung
 * von Ähnlichkeitsscores basierend auf geografischer Nähe.
 */

// Regionen in Deutschland für besseres Standort-Matching
interface Region {
  name: string;
  cities: string[];
}

// Vordefinierte Regionen in Deutschland
const GERMANY_REGIONS: Region[] = [
  {
    name: 'Berlin/Brandenburg',
    cities: ['berlin', 'potsdam', 'brandenburg', 'cottbus', 'frankfurt (oder)', 'oranienburg']
  },
  {
    name: 'Hamburg/Schleswig-Holstein',
    cities: ['hamburg', 'kiel', 'lübeck', 'flensburg', 'neumünster', 'norderstedt', 'pinneberg']
  },
  {
    name: 'Niedersachsen/Bremen',
    cities: ['hannover', 'bremen', 'oldenburg', 'osnabrück', 'wolfsburg', 'braunschweig', 'göttingen']
  },
  {
    name: 'Nordrhein-Westfalen',
    cities: ['köln', 'düsseldorf', 'dortmund', 'essen', 'duisburg', 'bochum', 'wuppertal', 'bonn', 'münster', 'aachen']
  },
  {
    name: 'Rheinland-Pfalz/Saarland',
    cities: ['mainz', 'trier', 'koblenz', 'kaiserslautern', 'ludwigshafen', 'saarbrücken']
  },
  {
    name: 'Hessen',
    cities: ['frankfurt', 'wiesbaden', 'kassel', 'darmstadt', 'offenbach', 'gießen', 'fulda']
  },
  {
    name: 'Baden-Württemberg',
    cities: ['stuttgart', 'karlsruhe', 'mannheim', 'freiburg', 'heidelberg', 'ulm', 'heilbronn', 'pforzheim']
  },
  {
    name: 'Bayern',
    cities: ['münchen', 'nürnberg', 'augsburg', 'regensburg', 'würzburg', 'ingolstadt', 'erlangen', 'fürth']
  },
  {
    name: 'Sachsen',
    cities: ['dresden', 'leipzig', 'chemnitz', 'zwickau', 'plauen', 'görlitz']
  },
  {
    name: 'Thüringen',
    cities: ['erfurt', 'jena', 'gera', 'weimar', 'eisenach', 'gotha', 'suhl']
  },
  {
    name: 'Sachsen-Anhalt',
    cities: ['magdeburg', 'halle', 'dessau', 'wittenberg', 'stendal', 'halberstadt']
  },
  {
    name: 'Mecklenburg-Vorpommern',
    cities: ['rostock', 'schwerin', 'neubrandenburg', 'stralsund', 'greifswald', 'wismar']
  }
];

// Remote-Arbeit Keywords
const REMOTE_WORK_KEYWORDS = [
  'remote', 'homeoffice', 'home office', 'remote work', 'remote-work', 
  'telearbeit', 'home-office', 'fernarbeit', 'mobiles arbeiten'
];

export class LocationMatcher {
  /**
   * Berechnet einen Standort-Match-Score basierend auf der geografischen Nähe
   * @param candidateLocation Standort des Kandidaten (kann mehrere Orte enthalten)
   * @param jobLocation Standort des Jobs (kann mehrere Orte enthalten)
   * @param remoteWorkPossible Gibt an, ob Remote-Arbeit möglich ist
   * @returns Score zwischen 0 und 100
   */
  public calculateLocationMatchScore(
    candidateLocation: string | string[],
    jobLocation: string | string[],
    remoteWorkPossible: boolean = false
  ): number {
    // Konvertiere einzelne Strings in Arrays
    const candidateLocations = Array.isArray(candidateLocation) 
      ? candidateLocation
      : candidateLocation.split(',').map(loc => loc.trim());
    
    const jobLocations = Array.isArray(jobLocation)
      ? jobLocation
      : jobLocation.split(',').map(loc => loc.trim());
    
    // Prüfe, ob die Standorte leer sind
    if (candidateLocations.length === 0 || jobLocations.length === 0) {
      return 0;
    }

    // Wenn Remote-Arbeit möglich ist, geben wir einen hohen Grundscore
    const remoteWorkScore = this.calculateRemoteWorkScore(candidateLocations, jobLocations, remoteWorkPossible);
    if (remoteWorkScore > 0) {
      return remoteWorkScore;
    }
    
    // Berechne den besten Match-Score zwischen allen Standortpaaren
    let bestScore = 0;
    
    for (const candidateLoc of candidateLocations) {
      for (const jobLoc of jobLocations) {
        const score = this.calculateSingleLocationMatchScore(candidateLoc, jobLoc);
        if (score > bestScore) {
          bestScore = score;
        }
      }
    }
    
    return bestScore;
  }
  
  /**
   * Berechnet den Match-Score für Remote-Arbeit
   */
  private calculateRemoteWorkScore(
    candidateLocations: string[],
    jobLocations: string[],
    remoteWorkPossible: boolean
  ): number {
    // Wenn remote Arbeit nicht möglich ist, ist der Score 0
    if (!remoteWorkPossible) return 0;
    
    // Normalisiere alle Standorte
    const normalizedCandidateLocations = this.normalizeLocations(candidateLocations);
    const normalizedJobLocations = this.normalizeLocations(jobLocations);
    
    // Prüfe, ob der Kandidat Remote-Arbeit sucht
    const candidateWantsRemote = normalizedCandidateLocations.some(loc => 
      REMOTE_WORK_KEYWORDS.some(keyword => loc.includes(keyword))
    );
    
    // Prüfe, ob der Job Remote-Arbeit anbietet
    const jobOffersRemote = normalizedJobLocations.some(loc => 
      REMOTE_WORK_KEYWORDS.some(keyword => loc.includes(keyword))
    );
    
    // Wenn beide Remote-Arbeit wollen/anbieten, geben wir einen hohen Score
    if (candidateWantsRemote && jobOffersRemote) {
      return 100;
    }
    
    // Wenn der Job Remote-Arbeit anbietet, geben wir einen hohen Grundscore
    if (jobOffersRemote) {
      return 80;
    }
    
    return 0;
  }
  
  /**
   * Berechnet den Match-Score zwischen zwei einzelnen Standorten
   */
  private calculateSingleLocationMatchScore(location1: string, location2: string): number {
    // Normalisiere die Standorte
    const normalizedLoc1 = location1.toLowerCase().trim();
    const normalizedLoc2 = location2.toLowerCase().trim();
    
    // Exakte Übereinstimmung
    if (normalizedLoc1 === normalizedLoc2) {
      return 100;
    }
    
    // Postleitzahlen-Vergleich
    const zipCode1 = this.extractZipCode(normalizedLoc1);
    const zipCode2 = this.extractZipCode(normalizedLoc2);
    
    if (zipCode1 && zipCode2) {
      // Bei gleichen Postleitzahlen geben wir vollen Score
      if (zipCode1 === zipCode2) {
        return 100;
      }
      
      // Bei ähnlichen Postleitzahlen (gleiche ersten zwei Ziffern) geben wir einen hohen Score
      if (zipCode1.substring(0, 2) === zipCode2.substring(0, 2)) {
        return 80;
      }
    }
    
    // Teilweise Übereinstimmung (z.B. "Frankfurt am Main" und "Frankfurt")
    if (normalizedLoc1.includes(normalizedLoc2) || normalizedLoc2.includes(normalizedLoc1)) {
      return 90;
    }
    
    // Prüfe, ob die Orte in der gleichen Region liegen
    const sameRegion = this.areInSameRegion(normalizedLoc1, normalizedLoc2);
    if (sameRegion) {
      return 70;
    }
    
    return 0;
  }
  
  /**
   * Prüft, ob zwei Orte in der gleichen Region liegen
   */
  private areInSameRegion(location1: string, location2: string): boolean {
    for (const region of GERMANY_REGIONS) {
      let loc1InRegion = false;
      let loc2InRegion = false;
      
      for (const city of region.cities) {
        if (location1.includes(city)) {
          loc1InRegion = true;
        }
        if (location2.includes(city)) {
          loc2InRegion = true;
        }
        
        if (loc1InRegion && loc2InRegion) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  /**
   * Extrahiert eine Postleitzahl aus einem Standort-String
   * Beispiel: "10115 Berlin" => "10115"
   */
  private extractZipCode(location: string): string | null {
    const zipCodeMatch = location.match(/\b\d{5}\b/);
    return zipCodeMatch ? zipCodeMatch[0] : null;
  }
  
  /**
   * Normalisiert eine Liste von Standorten
   */
  private normalizeLocations(locations: string[]): string[] {
    return locations
      .map(location => location.toLowerCase().trim())
      .filter(location => location.length > 0);
  }
}
