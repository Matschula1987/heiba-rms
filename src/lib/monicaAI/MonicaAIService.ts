import {
  MonicaAIConfig,
  ResumeAnalysisRequest,
  ResumeAnalysisResponse,
  ExtractedProfileData,
  AnalysisStatus
} from '@/types/monicaAI';

// Standard-Konfiguration
const DEFAULT_CONFIG: MonicaAIConfig = {
  apiKey: '',
  apiEndpoint: 'https://api.monica-ai.com/v1',
  language: 'de',
  timeout: 30000,
  maxRetries: 3,
  enabledFeatures: ['resume_analysis', 'skill_extraction']
};

/**
 * MonicaAIService - Service für die Kommunikation mit der Monica AI API
 */
export class MonicaAIService {
  private config: MonicaAIConfig;
  private cache: Map<string, ResumeAnalysisResponse> = new Map();
  private analysisQueue: Map<string, Promise<ResumeAnalysisResponse>> = new Map();
  private mockMode: boolean = true; // Im Mock-Modus ohne API-Schlüssel

  /**
   * Konstruktor für den MonicaAIService
   * @param config Optionale Konfiguration für die Monica AI API
   */
  constructor(config?: Partial<MonicaAIConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Prüfen, ob ein API-Schlüssel vorhanden ist
    this.mockMode = !this.config.apiKey || this.config.apiKey.trim() === '';
    
    if (this.mockMode) {
      console.warn('MonicaAIService läuft im Mock-Modus. Bitte API-Schlüssel konfigurieren.');
    }
  }

  /**
   * Generiert eine eindeutige Anfrage-ID
   * @returns Eindeutige ID im Format 'monica-TIMESTAMP-RANDOM'
   */
  private generateRequestId(): string {
    return `monica-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  }

  /**
   * Setzt die Konfiguration für den Service
   * @param config Neue Konfiguration
   */
  setConfig(config: Partial<MonicaAIConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Prüfen, ob ein API-Schlüssel vorhanden ist
    this.mockMode = !this.config.apiKey || this.config.apiKey.trim() === '';
  }

  /**
   * Gibt die aktuelle Konfiguration zurück
   * @returns Aktuelle Konfiguration
   */
  getConfig(): MonicaAIConfig {
    // API-Schlüssel für die Ausgabe maskieren
    const displayConfig = { ...this.config };
    if (displayConfig.apiKey) {
      displayConfig.apiKey = displayConfig.apiKey.substring(0, 4) + '...' + 
        displayConfig.apiKey.substring(displayConfig.apiKey.length - 4);
    }
    return displayConfig;
  }

  /**
   * Prüft, ob der Service konfiguriert ist
   * @returns true, wenn ein API-Schlüssel konfiguriert ist
   */
  isConfigured(): boolean {
    return !this.mockMode;
  }

  /**
   * Analysiert einen Lebenslauf
   * @param request Anfrage für die Lebenslaufanalyse
   * @returns Promise mit der Antwort der Lebenslaufanalyse
   */
  async analyzeResume(request: ResumeAnalysisRequest): Promise<ResumeAnalysisResponse> {
    // Anfrage-ID generieren, wenn nicht vorhanden
    const requestId = request.requestId || this.generateRequestId();
    request.requestId = requestId;
    
    // Prüfen, ob die Anfrage bereits im Cache ist
    if (this.cache.has(requestId)) {
      return this.cache.get(requestId)!;
    }
    
    // Prüfen, ob die Anfrage bereits in der Queue ist
    if (this.analysisQueue.has(requestId)) {
      return this.analysisQueue.get(requestId)!;
    }
    
    // Validierung der Anfrage
    if (!request.documentUrl && !request.documentBase64) {
      throw new Error('Entweder documentUrl oder documentBase64 muss angegeben werden');
    }
    
    // Anfrage ausführen
    const analyzePromise = this.mockMode 
      ? this.mockAnalyzeResume(request) 
      : this.realAnalyzeResume(request);
    
    // Anfrage in die Queue eintragen
    this.analysisQueue.set(requestId, analyzePromise);
    
    try {
      const response = await analyzePromise;
      
      // Ergebnis im Cache speichern, wenn erfolgreich
      if (response.status === 'success') {
        this.cache.set(requestId, response);
      }
      
      return response;
    } finally {
      // Aus der Queue entfernen
      this.analysisQueue.delete(requestId);
    }
  }

  /**
   * Ruft das Ergebnis einer Analyse ab
   * @param requestId ID der Anfrage
   * @returns Promise mit der Antwort der Lebenslaufanalyse
   */
  async getAnalysisResult(requestId: string): Promise<ResumeAnalysisResponse | null> {
    // Prüfen, ob die Anfrage im Cache ist
    if (this.cache.has(requestId)) {
      return this.cache.get(requestId)!;
    }
    
    // Prüfen, ob die Anfrage in der Queue ist
    if (this.analysisQueue.has(requestId)) {
      return this.analysisQueue.get(requestId)!;
    }
    
    // Im Mock-Modus: Mockdaten zurückgeben
    if (this.mockMode) {
      return this.mockGetAnalysisResult(requestId);
    }
    
    // Echte API-Anfrage
    try {
      const response = await fetch(`${this.config.apiEndpoint}/analysis/${requestId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API-Fehler: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data as ResumeAnalysisResponse;
    } catch (error) {
      console.error('Fehler beim Abrufen des Analyseergebnisses:', error);
      return null;
    }
  }

  /**
   * Leert den Cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Führt eine Analyse im Mock-Modus durch
   * @param request Anfrage für die Lebenslaufanalyse
   * @returns Promise mit der Antwort der Lebenslaufanalyse
   */
  private async mockAnalyzeResume(request: ResumeAnalysisRequest): Promise<ResumeAnalysisResponse> {
    // Simulation einer API-Anfrage
    console.log('Mock-Analyse für Anfrage:', request.requestId);
    
    // Zufällige Verzögerung zwischen 1-3 Sekunden
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Mockdaten generieren
    return {
      requestId: request.requestId!,
      status: 'success',
      processingTime: 2345,
      confidence: 0.85,
      data: this.generateMockProfileData(request)
    };
  }

  /**
   * Ruft das Ergebnis einer Analyse im Mock-Modus ab
   * @param requestId ID der Anfrage
   * @returns Promise mit der Antwort der Lebenslaufanalyse
   */
  private async mockGetAnalysisResult(requestId: string): Promise<ResumeAnalysisResponse> {
    // Simulation einer API-Anfrage
    console.log('Mock-Abfrage für Anfrage:', requestId);
    
    // Zufällige Verzögerung zwischen 0.5-1.5 Sekunden
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    // Wenn keine Anfrage-ID im Format 'monica-TIMESTAMP-RANDOM'
    if (!requestId.startsWith('monica-')) {
      return {
        requestId,
        status: 'failed',
        message: 'Analyse nicht gefunden',
        errorDetails: {
          code: 'NOT_FOUND',
          message: 'Keine Analyse mit dieser ID gefunden'
        }
      };
    }
    
    // Mockdaten generieren
    return {
      requestId,
      status: 'success',
      processingTime: 2345,
      confidence: 0.85,
      data: this.generateMockProfileData({ requestId })
    };
  }

  /**
   * Führt eine Analyse mit der echten API durch
   * @param request Anfrage für die Lebenslaufanalyse
   * @returns Promise mit der Antwort der Lebenslaufanalyse
   */
  private async realAnalyzeResume(request: ResumeAnalysisRequest): Promise<ResumeAnalysisResponse> {
    try {
      const response = await fetch(`${this.config.apiEndpoint}/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });
      
      if (!response.ok) {
        throw new Error(`API-Fehler: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data as ResumeAnalysisResponse;
    } catch (error) {
      console.error('Fehler bei der Analyse:', error);
      return {
        requestId: request.requestId!,
        status: 'failed',
        message: 'Fehler bei der Analyse',
        errorDetails: {
          code: 'API_ERROR',
          message: error instanceof Error ? error.message : 'Unbekannter Fehler'
        }
      };
    }
  }

  /**
   * Generiert Mock-Daten für das Profil
   * @param request Anfrage für die Lebenslaufanalyse
   * @returns Extrahierte Profildaten
   */
  private generateMockProfileData(request: Partial<ResumeAnalysisRequest>): ExtractedProfileData {
    // Mock-Daten für Testzwecke
    return {
      personalInfo: {
        firstName: 'Max',
        lastName: 'Mustermann',
        fullName: 'Max Mustermann',
        email: 'max.mustermann@example.com',
        phone: '+49 123 4567890',
        address: 'Musterstraße 123',
        postalCode: '12345',
        city: 'Berlin',
        country: 'Deutschland',
        nationality: 'Deutsch',
        birthDate: '1985-05-15',
        profileSummary: 'Erfahrener Softwareentwickler mit 10+ Jahren Erfahrung in der Webentwicklung.',
        socialProfiles: [
          { type: 'linkedin', url: 'https://linkedin.com/in/maxmustermann' },
          { type: 'xing', url: 'https://xing.com/profile/Max_Mustermann' }
        ]
      },
      skills: [
        { 
          name: 'JavaScript', 
          category: 'technical', 
          level: 'Experte',
          yearsOfExperience: 8,
          lastUsed: '2023-12-01',
          confidence: 0.95
        },
        { 
          name: 'React', 
          category: 'technical', 
          level: 'Fortgeschritten',
          yearsOfExperience: 5,
          lastUsed: '2023-12-01',
          confidence: 0.9
        },
        { 
          name: 'TypeScript', 
          category: 'technical', 
          level: 'Fortgeschritten',
          yearsOfExperience: 4,
          lastUsed: '2023-12-01',
          confidence: 0.85
        },
        { 
          name: 'Teamarbeit', 
          category: 'soft', 
          level: 'Experte',
          confidence: 0.8
        }
      ],
      workExperience: [
        {
          jobTitle: 'Senior Frontend Entwickler',
          company: 'TechCorp GmbH',
          location: 'Berlin, Deutschland',
          startDate: '2019-01-01',
          endDate: '2023-12-01',
          currentPosition: true,
          description: 'Entwicklung und Wartung von Webanwendungen mit React und TypeScript.',
          responsibilities: [
            'Entwicklung und Wartung von Webanwendungen',
            'Code-Reviews und Mentoring von Junior-Entwicklern',
            'Architekturentscheidungen und Technologieauswahl'
          ],
          skills: ['JavaScript', 'React', 'TypeScript', 'Redux']
        },
        {
          jobTitle: 'Frontend Entwickler',
          company: 'WebSolutions AG',
          location: 'München, Deutschland',
          startDate: '2015-03-01',
          endDate: '2018-12-31',
          currentPosition: false,
          description: 'Entwicklung von Webanwendungen mit JavaScript und Angular.',
          skills: ['JavaScript', 'Angular', 'HTML', 'CSS']
        }
      ],
      education: [
        {
          institution: 'Technische Universität Berlin',
          degree: 'Master of Science',
          fieldOfStudy: 'Informatik',
          startDate: '2010-10-01',
          endDate: '2013-09-30',
          location: 'Berlin, Deutschland',
          grade: '1,7'
        },
        {
          institution: 'Universität Leipzig',
          degree: 'Bachelor of Science',
          fieldOfStudy: 'Informatik',
          startDate: '2007-10-01',
          endDate: '2010-09-30',
          location: 'Leipzig, Deutschland',
          grade: '2,1'
        }
      ],
      languages: [
        {
          name: 'Deutsch',
          proficiency: 'Muttersprache',
          level: 'C2'
        },
        {
          name: 'Englisch',
          proficiency: 'Fließend',
          level: 'C1'
        },
        {
          name: 'Französisch',
          proficiency: 'Grundkenntnisse',
          level: 'A2'
        }
      ],
      certifications: [
        {
          name: 'AWS Certified Developer - Associate',
          issuer: 'Amazon Web Services',
          issueDate: '2021-05-15',
          expiryDate: '2024-05-15',
          id: 'AWS-DEV-12345'
        },
        {
          name: 'Professional Scrum Master I (PSM I)',
          issuer: 'Scrum.org',
          issueDate: '2020-03-10'
        }
      ],
      metaData: {
        documentType: 'pdf',
        documentLanguage: 'de',
        pageCount: 2,
        wordCount: 750,
        parsingQualityScore: 0.92
      }
    };
  }
}

// Einzelinstanz des Services für die gesamte Anwendung
let monicaAIServiceInstance: MonicaAIService | null = null;

/**
 * Gibt die Instanz des MonicaAIService zurück
 * @param config Optionale Konfiguration
 * @returns MonicaAIService-Instanz
 */
export function getMonicaAIService(config?: Partial<MonicaAIConfig>): MonicaAIService {
  if (!monicaAIServiceInstance) {
    monicaAIServiceInstance = new MonicaAIService(config);
  } else if (config) {
    monicaAIServiceInstance.setConfig(config);
  }
  
  return monicaAIServiceInstance;
}
