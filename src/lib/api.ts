import { Candidate, CandidateStatus, DashboardStats, Document, Skill, Language } from '@/types';
import { ReportMetrics } from '@/store/reportStore';

// Mock-Daten für Berichte
const initialMetrics: ReportMetrics = {
  totalApplications: 156,
  activeJobs: 18,
  averageMatchScore: 72,
  conversionRate: 15.4,
  timeToHire: 28,
  applicationsByStatus: {
    new: 45,
    in_review: 38,
    interview: 28,
    offer: 12,
    rejected: 33
  },
  applicationsByMonth: [
    { month: 'Jan', count: 12 },
    { month: 'Feb', count: 18 },
    { month: 'Mär', count: 24 },
    { month: 'Apr', count: 15 },
    { month: 'Mai', count: 22 },
    { month: 'Jun', count: 28 }
  ],
  jobPerformance: [
    {
      jobId: '1',
      jobTitle: 'Senior Software Engineer',
      applications: 45,
      interviews: 12,
      offers: 3
    },
    {
      jobId: '2',
      jobTitle: 'Marketing Manager',
      applications: 32,
      interviews: 8,
      offers: 2
    }
  ],
  locationDistribution: [
    { location: 'München', count: 48 },
    { location: 'Berlin', count: 35 },
    { location: 'Hamburg', count: 28 },
    { location: 'Frankfurt', count: 25 },
    { location: 'Köln', count: 20 }
  ]
};

// Funktionen für verschiedene API-Endpunkte
async function fetchCandidateById(id: string): Promise<Candidate> {
  const mockDocuments: Document[] = [
    {
      id: "doc1",
      name: "Lebenslauf.pdf",
      type: "application/pdf",
      url: "/documents/lebenslauf.pdf",
      size: 1240000,
      uploadedAt: "2025-01-15T10:30:00Z"
    }
  ];

  const mockSkills: Skill[] = [
    {
      name: "React",
      level: 5,
      description: "Umfassende Kenntnisse in React und Redux"
    },
    {
      name: "TypeScript",
      level: 4,
      description: "Fortgeschrittene Kenntnisse in TypeScript"
    }
  ];

  const mockLanguages: Language[] = [
    { name: "Deutsch", level: "Muttersprache" },
    { name: "Englisch", level: "Fließend (C1)" },
    { name: "Französisch", level: "Grundkenntnisse (A2)" }
  ];
  
  return {
    id,
    firstName: "Max",
    lastName: "Mustermann",
    name: "Max Mustermann", // Kombiniert für einfache Anzeige
    email: "max.mustermann@example.com",
    phone: "+49 123 456789",
    position: "Senior Frontend Developer",
    status: "in_process" as CandidateStatus,
    location: "Berlin",
    documents: mockDocuments,
    skills: mockSkills,
    qualifications: mockSkills,
    qualificationProfile: {
      skills: mockSkills,
      certificates: ["React Developer Certification", "TypeScript Advanced"],
      languages: mockLanguages,
      experience: [
        {
          company: "Tech GmbH",
          position: "Frontend Developer",
          period: "2020-2023",
          description: "Entwicklung von React-Anwendungen"
        }
      ]
    },
    createdAt: "2025-01-10T09:00:00Z",
    updatedAt: "2025-02-20T14:30:00Z"
  };
}

// Reports API - Für Berichte und Statistiken
const reports = {
  getMetrics: async (startDate?: Date, endDate?: Date): Promise<ReportMetrics> => {
    console.log('Fetching metrics for date range:', startDate, endDate);
    // In einer echten Implementierung würden hier die Daten basierend auf dem Datumsbereich gefiltert
    // Für jetzt geben wir einfach die Mock-Daten zurück
    return initialMetrics;
  }
};

// Customers API - Für Kunden- und Interessentenverwaltung
const customers = {
  getAll: async () => {
    try {
      // Versuche, die tatsächliche API anzurufen
      const response = await fetch('/api/customers');
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.log('API Error, falling back to dummy data:', error);
      // Dummy-Daten zurückgeben, wenn API-Aufruf fehlschlägt
      const { dummyCustomers } = await import('@/data/dummyCustomers');
      return dummyCustomers;
    }
  },
  getById: async (id: string) => {
    try {
      // Versuche, die tatsächliche API anzurufen
      const response = await fetch(`/api/customers/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch customer');
      }
      return await response.json();
    } catch (error) {
      console.log(`API Error for customer ${id}, falling back to dummy data:`, error);
      
      // Dummy-Daten zurückgeben, wenn API-Aufruf fehlschlägt
      try {
        const { dummyCustomers, dummyContacts, dummyRequirements } = await import('@/data/dummyCustomers');
        
        // Suche den Kunden in den Dummy-Daten
        const customer = dummyCustomers.find(c => c.id === id);
        
        if (customer) {
          // Vollständiges Kundenobjekt mit Kontakten und Anforderungen erstellen
          return {
            ...customer,
            // Wenn vorhanden, füge zugehörige Kontakte hinzu
            contacts: dummyContacts[id] || [],
            // Wenn vorhanden, füge zugehörige Anforderungen hinzu
            requirements: dummyRequirements
              .filter(r => r.customerId === id)
              .map(req => ({
                ...req,
                // Konvertiere Skills-JSON zu Array, falls es ein String ist
                skills: typeof req.skills === 'string' ? JSON.parse(req.skills) : req.skills
              }))
          };
        }
        throw new Error(`Customer with ID ${id} not found in dummy data`);
      } catch (dummyError) {
        console.error(`Error fetching dummy data for customer ${id}:`, dummyError);
        throw error;
      }
    }
  }
};

// HTTP-Hilfsfunktionen für allgemeine API-Aufrufe
const get = async (url: string) => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return data;
};

const post = async (url: string, data: any) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  
  const responseData = await response.json();
  return responseData;
};

const put = async (url: string, data: any) => {
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  
  const responseData = await response.json();
  return responseData;
};

const patch = async (url: string, data: any) => {
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  
  const responseData = await response.json();
  return responseData;
};

const del = async (url: string) => {
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  
  const responseData = await response.json();
  return responseData;
};

// Hauptexport - das api-Objekt mit allen Teilbereichen
export const api = {
  fetchCandidateById,
  reports,
  customers,
  // HTTP-Methoden
  get,
  post,
  put,
  patch,
  delete: del
};

// Einzelexporte für direkten Zugriff
export { fetchCandidateById };
