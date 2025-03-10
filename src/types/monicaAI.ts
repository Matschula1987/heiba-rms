/**
 * Monica AI Typendefinitionen für die Lebenslaufanalyse und Datenextraktion
 */

// API-Konfiguration
export interface MonicaAIConfig {
  apiKey: string;
  apiEndpoint?: string; // Standard: Monica AI API URL
  enabledFeatures?: string[]; // z.B. ['resume_analysis', 'skill_extraction']
  language?: string; // Standard: 'de'
  timeout?: number; // Timeout in ms (Standard: 30000)
  maxRetries?: number; // Max. Anzahl Wiederholungsversuche (Standard: 3)
}

// Anfrage für Lebenslaufanalyse
export interface ResumeAnalysisRequest {
  documentUrl?: string; // URL zum Dokument
  documentBase64?: string; // Base64-kodiertes Dokument
  documentType?: 'pdf' | 'docx' | 'txt' | 'image'; // Dokumenttyp
  candidateId?: string; // Referenz zum Kandidaten
  requestId?: string; // Eindeutige Anfrage-ID für Tracking
  options?: {
    extractContact?: boolean; // Kontaktdaten extrahieren
    extractEducation?: boolean; // Bildungsdaten extrahieren
    extractExperience?: boolean; // Berufserfahrung extrahieren
    extractSkills?: boolean; // Fähigkeiten extrahieren
    extractLanguages?: boolean; // Sprachkenntnisse extrahieren
    extractCertifications?: boolean; // Zertifizierungen extrahieren
    detailLevel?: 'basic' | 'standard' | 'detailed'; // Detailgrad
  };
}

// Antwort der Lebenslaufanalyse
export interface ResumeAnalysisResponse {
  requestId: string;
  status: 'success' | 'processing' | 'failed';
  message?: string;
  processingTime?: number; // Zeit in ms
  data?: ExtractedProfileData;
  confidence?: number; // Konfidenzwert (0-1)
  errorDetails?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Struktur der extrahierten Daten
export interface ExtractedProfileData {
  personalInfo?: {
    firstName?: string;
    lastName?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    address?: string;
    postalCode?: string;
    city?: string;
    country?: string;
    nationality?: string;
    birthDate?: string;
    profileSummary?: string;
    photoUrl?: string;
    socialProfiles?: {
      type: 'linkedin' | 'xing' | 'twitter' | 'github' | 'other';
      url: string;
    }[];
  };

  skills?: {
    name: string;
    category?: 'technical' | 'soft' | 'language' | 'other';
    level?: string; // z.B. "Experte", "Fortgeschritten"
    yearsOfExperience?: number;
    lastUsed?: string; // ISO-Datumsformat
    confidence?: number; // Konfidenzwert (0-1)
  }[];

  workExperience?: {
    jobTitle?: string;
    company?: string;
    location?: string;
    startDate?: string; // ISO-Datumsformat
    endDate?: string; // ISO-Datumsformat
    currentPosition?: boolean;
    description?: string;
    achievements?: string[];
    skills?: string[];
    responsibilities?: string[];
  }[];

  education?: {
    institution?: string;
    degree?: string;
    fieldOfStudy?: string;
    startDate?: string; // ISO-Datumsformat
    endDate?: string; // ISO-Datumsformat
    location?: string;
    description?: string;
    grade?: string;
    achievements?: string[];
  }[];

  languages?: {
    name: string;
    proficiency?: 'Muttersprache' | 'Fließend' | 'Verhandlungssicher' | 'Fortgeschritten' | 'Grundkenntnisse';
    level?: string; // z.B. "C2", "B1"
  }[];

  certifications?: {
    name: string;
    issuer?: string;
    issueDate?: string; // ISO-Datumsformat
    expiryDate?: string; // ISO-Datumsformat
    id?: string;
    url?: string;
  }[];
  
  // Zusätzliche Metadaten
  metaData?: {
    documentType?: string;
    documentLanguage?: string;
    pageCount?: number;
    wordCount?: number;
    parsingQualityScore?: number; // 0-1
    detectedIssues?: {
      type: string;
      description: string;
      severity: 'low' | 'medium' | 'high';
    }[];
  };
}

// Status der Analyse
export enum AnalysisStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

// Analyse-Historie
export interface AnalysisHistory {
  id: string;
  candidateId: string;
  documentId: string;
  requestId: string;
  status: AnalysisStatus;
  startTime: string; // ISO-Datumsformat
  endTime?: string; // ISO-Datumsformat
  extractedData?: ExtractedProfileData;
  errorMessage?: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
    accepted: boolean;
  }[];
}

// Map von Extraktionen zu Kandidatendaten
export interface DataMappingConfig {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    // Weitere Felder...
  };
  skills: {
    mappingField: string;
    // Weitere Felder...
  };
  // Weitere Kategorien...
}
