import { Candidate, Job } from '@/types';
import axios from 'axios';
import { SyncSettings } from '@/types/scheduler';
import crypto from 'crypto';

// Definierte Listen für Skill-Erkennung
const COMMON_SKILLS = [
  'Javascript', 'TypeScript', 'React', 'Angular', 'Vue', 'Node.js', 'Python', 'Java', 'C#', '.NET',
  'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
  'HTML', 'CSS', 'SASS', 'LESS', 'PHP', 'Laravel', 'Symfony', 'REST API', 'GraphQL', 'Git',
  'Agile', 'Scrum', 'Kanban', 'CI/CD', 'TDD', 'DevOps', 'Microservices', 'Linux', 'Windows Server',
  'Project Management', 'Team Leadership', 'SEO', 'SEM', 'Adobe Photoshop', 'Adobe Illustrator',
  'Figma', 'UI/UX Design', 'Content Writing', 'Marketing', 'Sales', 'Customer Service',
  'Data Analysis', 'Machine Learning', 'AI', 'Business Intelligence', 'Accounting', 'Finance'
];

// Sprachen-Liste
const LANGUAGES = [
  'Deutsch', 'Englisch', 'Französisch', 'Spanisch', 'Italienisch', 'Portugiesisch',
  'Russisch', 'Arabisch', 'Chinesisch', 'Japanisch', 'Koreanisch', 'Niederländisch',
  'Polnisch', 'Schwedisch', 'Türkisch'
];

// Bildungsabschlüsse
const EDUCATION_LEVELS = [
  'Abitur', 'Fachabitur', 'Realschulabschluss', 'Hauptschulabschluss',
  'Bachelor', 'Master', 'Diplom', 'Magister', 'Staatsexamen', 'Promotion',
  'Ausbildung', 'Fachhochschulreife', 'Hochschulabschluss', 'Berufsausbildung'
];

// Zertifikate
const COMMON_CERTIFICATES = [
  'ISTQB', 'Scrum Master', 'Product Owner', 'PMP', 'PRINCE2', 'ITIL', 'AWS Certified',
  'Microsoft Certified', 'Google Certified', 'Oracle Certified', 'Cisco Certified',
  'Six Sigma', 'Lean Six Sigma', 'IREB', 'TOGAF', 'CISA', 'CISM', 'CISSP'
];

interface Talent360Application {
  id: string;
  jobId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  mobile?: string;
  dateOfBirth?: string;
  address: {
    street: string;
    houseNumber: string;
    postalCode: string;
    city: string;
    country: string;
  };
  documents: {
    type: 'cv' | 'cover_letter' | 'certificates' | 'other';
    name: string;
    url: string;
    content?: string; // Extrahierter Inhalt aus Dokumenten
  }[];
  applicationDate: string;
  source: string;
  status: string;
  desiredSalary?: number;
  availableFrom?: string;
  currentPosition?: string;
  currentEmployer?: string;
  yearsOfExperience?: number;
  highestEducation?: string;
  skills?: string[];
  languages?: {
    language: string;
    level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'native';
  }[];
}

interface Talent360Job {
  id: string;
  title: string;
  department: string;
  location: string;
  description: string;
  requirements: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  employmentType: string;
  startDate?: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  requiredSkills?: string[];
  minYearsExperience?: number;
  requiredEducation?: string;
  contactPerson?: {
    name: string;
    email: string;
    phone?: string;
  };
}

interface DocumentContent {
  text: string;
  type: 'plain' | 'html' | 'pdf' | 'doc';
}

// Webhook Event Types
type WebhookEventType = 
  | 'application.created' 
  | 'application.updated'
  | 'application.status_changed'
  | 'job.created'
  | 'job.updated'
  | 'job.status_changed';

interface WebhookPayload {
  event: WebhookEventType;
  data: any;
  signature: string;
  timestamp: number;
}

// API-Konfiguration
const API_CONFIG = {
  baseURL: process.env.TALENT360_API_URL || 'https://api.talent360.de/v1',
  apiKey: process.env.TALENT360_API_KEY || '',
  webhookSecret: process.env.TALENT360_WEBHOOK_SECRET || '',
};

export const talent360Integration = {
  // Hilfsfunktion zum Erzeugen eines relativen Datums (für Zeiträume)
  getRelativeDate(yearOffset: number, monthOffset: number = 0): string {
    const date = new Date();
    date.setFullYear(date.getFullYear() + yearOffset);
    date.setMonth(date.getMonth() + monthOffset);
    
    return `${date.getMonth() + 1}/${date.getFullYear()}`;
  },

  // Überprüft die Signatur eines Webhooks
  verifyWebhookSignature(payload: WebhookPayload): boolean {
    if (!API_CONFIG.webhookSecret) {
      console.warn('Webhook-Secret nicht konfiguriert');
      return false;
    }

    try {
      // Prüfen, ob die Signatur im Header vorhanden ist
      const receivedSignature = payload.signature;
      if (!receivedSignature) {
        console.error('Keine Signatur im Webhook-Payload vorhanden');
        return false;
      }

      // Signatur berechnen (HMAC mit SHA-256)
      const hmac = crypto.createHmac('sha256', API_CONFIG.webhookSecret);
      // Der zu signierende Payload ist der event + data als JSON-String
      const data = JSON.stringify({
        event: payload.event,
        data: payload.data
      });
      hmac.update(data);
      const calculatedSignature = hmac.digest('hex');

      // Vergleich der Signaturen
      return crypto.timingSafeEqual(
        Buffer.from(calculatedSignature, 'hex'),
        Buffer.from(receivedSignature, 'hex')
      );
    } catch (error) {
      console.error('Fehler bei der Überprüfung der Webhook-Signatur:', error);
      return false;
    }
  },

  // Bewerbungen von Talent360 abrufen und in HeiBa RMS-Format konvertieren
  async syncApplications(): Promise<Candidate[]> {
    try {
      if (!API_CONFIG.apiKey) {
        console.warn('Talent360 API-Key nicht konfiguriert');
        return [];
      }

      // API-Aufruf mit axios und Authentifizierung
      const response = await axios.get(`${API_CONFIG.baseURL}/applications`, {
        headers: {
          'Authorization': `Bearer ${API_CONFIG.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 Sekunden Timeout
      });

      const applications: Talent360Application[] = response.data.applications || [];

      // Für jede Bewerbung Dokumente herunterladen und extrahieren
      for (const app of applications) {
        for (const doc of app.documents) {
          if (doc.url && ['cv', 'cover_letter'].includes(doc.type)) {
            try {
              // Inhalt abrufen
              const docContent = await this.fetchDocumentContent(doc.url);
              // Content im Dokument-Objekt speichern
              doc.content = docContent.text;
            } catch (err) {
              console.error(`Fehler beim Abrufen des Dokuments: ${doc.url}`, err);
            }
          }
        }
      }

      // Hier werden wir die Konvertierung mit 'as unknown as' durchführen,
      // da wir sicherstellen müssen, dass die Struktur kompatibel ist.
      // In einer realen Implementierung müsste dies genauer auf die 
      // tatsächlichen Typen angepasst werden.
      return applications.map(app => {
        // Wir bereiten ein Erfahrungsfeld vor, das mit dem Candidate-Typ kompatibel ist
        const experienceEntries = [];
        if (app.currentPosition && app.currentEmployer) {
          experienceEntries.push({
            position: app.currentPosition,
            company: app.currentEmployer,
            period: `${this.getRelativeDate(-1 * (app.yearsOfExperience || 1))} - heute`,
            description: 'Automatisch aus Talent360 extrahiert'
          });
        }

        return {
          id: app.id,
          name: `${app.firstName} ${app.lastName}`,
          firstName: app.firstName,
          lastName: app.lastName,
          email: app.email,
          phone: app.phone || '',
          mobile: app.mobile || '',
          dateOfBirth: app.dateOfBirth,
          location: `${app.address.street} ${app.address.houseNumber}, ${app.address.postalCode} ${app.address.city}`,
          position: app.currentPosition || '',
          skills: app.skills || this.extractSkillsFromDocuments(app.documents),
          experience: experienceEntries, // Angepasst an den erwarteten Typ
          education: app.highestEducation || this.extractEducationFromDocuments(app.documents),
          salaryExpectation: app.desiredSalary || 0,
          status: 'new',
          notes: '',
          documents: app.documents,
          applicationDate: app.applicationDate,
          source: 'talent360',
          jobId: app.jobId,
          address: app.address,
          qualificationProfile: this.generateQualificationProfile(app),
          createdAt: app.applicationDate,
          updatedAt: new Date().toISOString()
        };
      }) as unknown as Candidate[];
    } catch (error) {
      console.error('Fehler beim Synchronisieren der Bewerbungen:', error);
      if (axios.isAxiosError(error)) {
        console.error('API-Antwort:', error.response?.data);
      }
      return [];
    }
  },

  // Stellen von Talent360 abrufen und in HeiBa RMS-Format konvertieren
  async syncJobs(): Promise<Job[]> {
    try {
      if (!API_CONFIG.apiKey) {
        console.warn('Talent360 API-Key nicht konfiguriert');
        return [];
      }

      // API-Aufruf mit axios und Authentifizierung
      const response = await axios.get(`${API_CONFIG.baseURL}/jobs`, {
        headers: {
          'Authorization': `Bearer ${API_CONFIG.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 Sekunden Timeout
      });

      const jobs: Talent360Job[] = response.data.jobs || [];

      // Diese Implementierung nimmt an, dass die Job-Schnittstelle die
      // erforderlichen Felder wie 'company', 'job_type', etc. hat
      return jobs.map(job => ({
        id: job.id,
        title: job.title,
        department: job.department,
        company: 'Intern', // Erforderliches Feld
        job_type: job.employmentType, // Erforderliches Feld
        location: job.location,
        description: job.description,
        requirements: job.requirements,
        requiredSkills: job.requiredSkills || this.extractSkillsFromRequirements(job.requirements),
        requiredExperience: job.minYearsExperience || this.extractExperienceFromRequirements(job.requirements),
        requiredEducation: job.requiredEducation || this.extractEducationFromRequirements(job.requirements),
        salaryRange: job.salary ? {
          min: job.salary.min,
          max: job.salary.max
        } : undefined,
        employmentType: job.employmentType,
        startDate: job.startDate,
        status: job.status === 'active' ? 'active' : 'draft',
        source: 'talent360',
        portals: 0,
        applications: 0,
        created_at: job.createdAt, // Erforderliches Feld
        updated_at: job.updatedAt, // Erforderliches Feld
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        contactPerson: job.contactPerson ? {
          name: job.contactPerson.name,
          email: job.contactPerson.email,
          phone: job.contactPerson.phone || ''
        } : undefined
      })) as unknown as Job[];
    } catch (error) {
      console.error('Fehler beim Synchronisieren der Stellen:', error);
      if (axios.isAxiosError(error)) {
        console.error('API-Antwort:', error.response?.data);
      }
      return [];
    }
  },

  // Dokument-Inhalte abrufen
  async fetchDocumentContent(url: string): Promise<DocumentContent> {
    try {
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${API_CONFIG.apiKey}`
        },
        timeout: 15000  // 15 Sekunden Timeout
      });

      // Einfache Erkennung des Dokument-Typs
      let type: DocumentContent['type'] = 'plain';
      const contentType = response.headers['content-type'] || '';
      
      if (contentType.includes('html')) {
        type = 'html';
      } else if (contentType.includes('pdf')) {
        type = 'pdf';
      } else if (contentType.includes('msword') || contentType.includes('officedocument')) {
        type = 'doc';
      }

      // Rückgabe als Plaintext - in einem realen Szenario würde hier
      // ein Parser für verschiedene Dokumenttypen (PDF, Word) implementiert werden
      return {
        text: typeof response.data === 'string' ? response.data : JSON.stringify(response.data),
        type
      };
    } catch (error) {
      console.error(`Fehler beim Abrufen des Dokuments: ${url}`, error);
      return { text: '', type: 'plain' };
    }
  },

  // Qualifikationsprofil aus den Bewerbungsunterlagen generieren
  generateQualificationProfile(application: Talent360Application) {
    // Standardinformationen aus dem Bewerbungsobjekt extrahieren
    const profile = {
      skills: application.skills || this.extractSkillsFromDocuments(application.documents),
      experience: [] as { 
        company: string; 
        position: string; 
        startDate: string; 
        endDate?: string; 
        description?: string 
      }[],
      education: [] as {
        institution: string;
        degree: string;
        field: string;
        startDate: string;
        endDate?: string;
      }[],
      languages: application.languages || [] as {
        language: string;
        level: string;
      }[],
      certificates: [] as string[],
      strengths: [] as string[],
      interests: [] as string[]
    };

    // Grundlegende Informationen setzen, falls vorhanden
    if (application.currentPosition && application.currentEmployer) {
      profile.experience.push({
        company: application.currentEmployer,
        position: application.currentPosition,
        startDate: this.getRelativeDate(-1 * (application.yearsOfExperience || 1))
      });
    }

    if (application.highestEducation) {
      profile.education.push({
        institution: 'Nicht angegeben',
        degree: application.highestEducation,
        field: 'Nicht angegeben',
        startDate: this.getRelativeDate(-5)
      });
    }

    // Dokumente nach Informationen durchsuchen
    for (const doc of application.documents) {
      if (doc.content) {
        // Zertifikate aus Dokument extrahieren
        profile.certificates = [
          ...profile.certificates,
          ...this.extractCertificatesFromText(doc.content)
        ];

        // Weitere Informationen zu Berufserfahrung extrahieren
        if (doc.type === 'cv') {
          const extractedExp = this.extractCareerHistoryFromText(doc.content);
          if (extractedExp.length > 0) {
            profile.experience = extractedExp;
          }

          // Ausbildungsinformationen extrahieren
          const extractedEdu = this.extractEducationHistoryFromText(doc.content);
          if (extractedEdu.length > 0) {
            profile.education = extractedEdu;
          }

          // Sprachen extrahieren, wenn noch nicht vorhanden
          if (profile.languages.length === 0) {
            profile.languages = this.extractLanguagesFromText(doc.content);
          }

          // Interessen extrahieren
          profile.interests = this.extractInterestsFromText(doc.content);
        }
      }
    }

    return profile;
  },

  // Skills aus Dokumenten extrahieren
  extractSkillsFromDocuments(documents: Talent360Application['documents']): string[] {
    const extractedSkills = new Set<string>();
    
    for (const doc of documents) {
      if (doc.content) {
        for (const skill of COMMON_SKILLS) {
          // Überprüfen, ob Skill im Text vorhanden ist (case-insensitive)
          const regex = new RegExp(`\\b${skill}\\b`, 'i');
          if (regex.test(doc.content)) {
            extractedSkills.add(skill);
          }
        }
      }
    }
    
    return Array.from(extractedSkills);
  },

  // Erfahrung aus Dokumenten extrahieren
  extractExperienceFromDocuments(documents: Talent360Application['documents']): number {
    for (const doc of documents) {
      if (doc.content) {
        // Regex-Muster für "X Jahre/s Erfahrung"
        const regex = /(\d+)\s*(?:Jahre?|years?|j\.)\s+(?:Erfahrung|experience|Berufserfahrung)/i;
        const match = doc.content.match(regex);
        
        if (match && match[1]) {
          return parseInt(match[1], 10);
        }
      }
    }
    
    return 0;
  },

  // Ausbildung aus Dokumenten extrahieren
  extractEducationFromDocuments(documents: Talent360Application['documents']): string {
    for (const doc of documents) {
      if (doc.content) {
        for (const edu of EDUCATION_LEVELS) {
          // Überprüfen, ob Ausbildungsniveau im Text vorhanden ist
          const regex = new RegExp(`\\b${edu}\\b`, 'i');
          if (regex.test(doc.content)) {
            return edu;
          }
        }
      }
    }
    
    return '';
  },

  // Zertifikate aus Text extrahieren
  extractCertificatesFromText(text: string): string[] {
    const certificates = new Set<string>();
    
    for (const cert of COMMON_CERTIFICATES) {
      const regex = new RegExp(`\\b${cert}\\b`, 'i');
      if (regex.test(text)) {
        certificates.add(cert);
      }
    }
    
    return Array.from(certificates);
  },

  // Berufshistorie aus Text extrahieren
  extractCareerHistoryFromText(text: string): Array<{ 
    company: string; 
    position: string; 
    startDate: string; 
    endDate?: string; 
    description?: string 
  }> {
    // Einfache Implementierung - sucht nach Zeiträumen und Unternehmensnamen
    const companies: Array<{ 
      company: string; 
      position: string; 
      startDate: string; 
      endDate?: string;
      description?: string 
    }> = [];
    
    // Regex für gängige Formate von Karriere-Einträgen
    // z.B. "01/2018 - 12/2020: Projektmanager bei Firma XYZ"
    const careerRegex = /(\d{1,2}\/\d{4}|\d{4})\s*-\s*(\d{1,2}\/\d{4}|\d{4}|heute|present|aktuell|now):\s*([\w\s]+)\s+(?:bei|at|für|for)\s+([\w\s&]+)/gi;
    
    let match;
    while ((match = careerRegex.exec(text)) !== null) {
      companies.push({
        startDate: match[1],
        endDate: match[2].toLowerCase() === 'heute' || match[2].toLowerCase() === 'present' || 
                 match[2].toLowerCase() === 'aktuell' || match[2].toLowerCase() === 'now' ? 
                 undefined : match[2],
        position: match[3].trim(),
        company: match[4].trim()
      });
    }
    
    return companies;
  },

  // Ausbildungshistorie aus Text extrahieren
  extractEducationHistoryFromText(text: string): Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
  }> {
    // Einfache Implementierung - sucht nach Bildungsabschlüssen und Institutionen
    const education: Array<{
      institution: string;
      degree: string;
      field: string;
      startDate: string;
      endDate?: string;
    }> = [];
    
    // Überprüft Text auf Übereinstimmungen mit Ausbildungsniveaus
    const eduBlocks = text.split(/\n\n|\r\n\r\n/);
    
    for (const block of eduBlocks) {
      let foundDegree = '';
      
      // Sucht nach einem Ausbildungsniveau im aktuellen Block
      for (const edu of EDUCATION_LEVELS) {
        if (new RegExp(`\\b${edu}\\b`, 'i').test(block)) {
          foundDegree = edu;
          break;
        }
      }
      
      if (foundDegree) {
        // Extraktion von Institution und Zeitraum
        const instMatch = block.match(/(?:an der|at|at the)\s+([\w\s&]+)/i);
        const dateMatch = block.match(/(\d{1,2}\/\d{4}|\d{4})\s*-\s*(\d{1,2}\/\d{4}|\d{4}|heute|present|aktuell|now)/i);
        const fieldMatch = block.match(/(?:in|im Bereich|im Fach|field of)\s+([\w\s&]+)/i);
        
        education.push({
          institution: instMatch ? instMatch[1].trim() : 'Nicht angegeben',
          degree: foundDegree,
          field: fieldMatch ? fieldMatch[1].trim() : 'Nicht angegeben',
          startDate: dateMatch ? dateMatch[1] : this.getRelativeDate(-5),
          endDate: dateMatch ? (
            dateMatch[2].toLowerCase() === 'heute' || dateMatch[2].toLowerCase() === 'present' || 
            dateMatch[2].toLowerCase() === 'aktuell' || dateMatch[2].toLowerCase() === 'now' ? 
            undefined : dateMatch[2]
          ) : this.getRelativeDate(-2)
        });
      }
    }
    
    return education;
  },

  // Sprachkenntnisse aus Text extrahieren
  extractLanguagesFromText(text: string): Array<{ language: string; level: string }> {
    const languages: Array<{ language: string; level: string }> = [];
    const levelMapping: { [key: string]: string } = {
      'muttersprache': 'native',
      'native': 'native',
      'muttersprachler': 'native',
      'fließend': 'C1',
      'fluent': 'C1',
      'sehr gut': 'C1',
      'very good': 'C1',
      'gut': 'B2',
      'good': 'B2',
      'grundkenntnisse': 'A2',
      'basic': 'A2',
      'anfänger': 'A1',
      'beginner': 'A1'
    };
    
    for (const lang of LANGUAGES) {
      if (new RegExp(`\\b${lang}\\b`, 'i').test(text)) {
        // Versuchen, das Niveau zu ermitteln
        let level = 'B1'; // Standardniveau
        
        for (const [levelText, levelValue] of Object.entries(levelMapping)) {
          const levelRegex = new RegExp(`${lang}\\s*:?\\s*${levelText}|${levelText}\\s*:?\\s*${lang}`, 'i');
          if (levelRegex.test(text)) {
            level = levelValue;
            break;
          }
        }
        
        languages.push({
          language: lang,
          level: level
        });
      }
    }
    
    return languages;
  },

  // Interessen aus Text extrahieren
  extractInterestsFromText(text: string): string[] {
    const interests = new Set<string>();
    const interestSections = ['Interessen', 'Hobbys', 'Freizeit', 'Interests', 'Hobbies'];
    
    // Abschnitt mit Interessen finden
    for (const section of interestSections) {
      const sectionRegex = new RegExp(`${section}[:\\s]+(.*?)(?=\\n\\n|\\r\\n\\r\\n|$)`, 'i');
      const match = text.match(sectionRegex);
      
      if (match && match[1]) {
        // Interessen aufteilen (durch Kommas oder "und" getrennt)
        const interestList = match[1].split(/[,;]|\sund\s|\sand\s/).map(i => i.trim());
        for (const interest of interestList) {
          if (interest && interest.length > 3) { // Mindestlänge, um Störungen zu vermeiden
            interests.add(interest);
          }
        }
      }
    }
    
    return Array.from(interests);
  },

  // Skills aus den Anforderungen extrahieren
  extractSkillsFromRequirements(requirements: string): string[] {
    const extractedSkills = new Set<string>();
    
    for (const skill of COMMON_SKILLS) {
      // Überprüfen, ob Skill in den Anforderungen vorhanden ist (case-insensitive)
      const regex = new RegExp(`\\b${skill}\\b`, 'i');
      if (regex.test(requirements)) {
        extractedSkills.add(skill);
      }
    }
    
    return Array.from(extractedSkills);
  },

  // Benötigte Erfahrung aus den Anforderungen extrahieren
  extractExperienceFromRequirements(requirements: string): number {
    // Regex-Muster für "mindestens X Jahre Erfahrung" oder ähnliche Formulierungen
    const patterns = [
      /mindestens\s+(\d+)\s+Jahr(?:e)?\s+(?:Erfahrung|Berufserfahrung)/i,
      /(\d+)\+?\s+Jahr(?:e)?\s+(?:Erfahrung|Berufserfahrung)/i,
      /(?:Erfahrung|Berufserfahrung)\s+von\s+(?:mindestens\s+)?(\d+)\s+Jahr(?:en)?/i,
      /(?:at least|minimum)\s+(\d+)\s+years?\s+(?:of\s+)?experience/i,
      /(\d+)\+?\s+years?\s+(?:of\s+)?experience/i
    ];
    
    for (const pattern of patterns) {
      const match = requirements.match(pattern);
      if (match && match[1]) {
        return parseInt(match[1], 10);
      }
    }
    
    // Überprüfe, ob nach Erfahrungsstufen gesucht wird
    if (/senior/i.test(requirements)) {
      return 5;
    } else if (/(?:medior|mittlere\s+Erfahrung)/i.test(requirements)) {
      return 3;
    } else if (/junior/i.test(requirements)) {
      return 1;
    }
    
    return 0;
  },

  // Benötigte Ausbildung aus den Anforderungen extrahieren
  extractEducationFromRequirements(requirements: string): string {
    for (const edu of EDUCATION_LEVELS) {
      if (new RegExp(`\\b${edu}\\b`, 'i').test(requirements)) {
        return edu;
      }
    }
    
    // Hochschulabschluss als Default, wenn akademische Bezeichnungen vorhanden sind
    if (/(?:studium|hochschule|universität|university|college|akademisch|academic)/i.test(requirements)) {
      return 'Hochschulabschluss';
    }
    
    // Berufsausbildung als Default, wenn berufliche Bezeichnungen vorhanden sind
    if (/(?:ausbildung|berufsausbildung|vocational|apprenticeship)/i.test(requirements)) {
      return 'Berufsausbildung';
    }
    
    return '';
  }
};
