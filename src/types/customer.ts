// Typen für das Kunden- und Interessenten-Management

export type CustomerStatus = 'active' | 'inactive' | 'prospect' | 'former';
export type ContactType = 'phone' | 'email' | 'meeting' | 'other';
export type RequirementStatus = 'open' | 'in_progress' | 'filled' | 'cancelled';
export type RequirementPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface CustomerAddress {
  street: string;
  postalCode?: string;
  zipCode?: string;
  number?: string;
  city: string;
  country: string;
}

export interface Customer {
  id: string;
  name: string;
  type: 'customer' | 'prospect'; // Kunde oder Interessent
  status: CustomerStatus;
  industry: string;
  website?: string;
  address?: CustomerAddress;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  // Für API-Ergebnisse und Listen
  contactCount?: number;
  requirementCount?: number;
  // Beziehungen - können in manchen Sichten leer sein
  contactHistory?: ContactEntry[];
  contacts?: Contact[];
  requirements?: Requirement[];
}

export interface Contact {
  id: string;
  customerId: string;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  email: string;
  phone?: string;
  mobile?: string;
  isMainContact: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactEntry {
  id: string;
  customerId: string;
  contactId?: string; // Optional, falls der Kontakt mit einem bestimmten Ansprechpartner stattfand
  type: ContactType;
  date: string;
  subject: string;
  content: string;
  createdBy: string;
  attachments?: string[];
  followUpDate?: string;
  followUpCompleted?: boolean;
}

export interface Requirement {
  id: string;
  customerId: string;
  title: string;
  description: string;
  department: string;
  location: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  skills: string[];
  experience: number; // In Jahren
  education?: string;
  status: RequirementStatus;
  priority: RequirementPriority;
  startDate?: string;
  endDate?: string;
  isRemote?: boolean;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string; // ID des zuständigen Mitarbeiters
  matchedCandidates?: Array<{
    candidateId: string;
    score: number;
    status: 'new' | 'contacted' | 'rejected' | 'accepted';
    lastContact?: string;
  }>;
}

// Email-Templates
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: 'candidate' | 'customer' | 'general';
  variables: string[]; // Liste der verfügbaren Variablen, z.B. {{name}}, {{position}}
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Verzögerte Email-Einstellungen
export interface DelayedEmailSettings {
  enabled: boolean;
  defaultDelay: number; // In Tagen
  archiveImmediately: boolean;
  templates: {
    candidate: string; // Email-Template-ID
    customer: string; // Email-Template-ID
  };
}
