import { create } from 'zustand'
import { EmailTemplate } from '@/types/customer'

interface DelayedEmail {
  id: string;
  recipient: string;
  recipientName: string;
  subject: string;
  content: string;
  scheduledDate: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  relatedEntityId?: string; // Kandidat oder Kunde ID
  relatedEntityType?: 'candidate' | 'customer';
  createdAt: string;
  createdBy: string;
}

interface EmailSettings {
  delayedRejection: {
    enabled: boolean;
    defaultDelay: number; // in Tagen
    archiveImmediately: boolean;
  };
  automaticMatching: {
    enabled: boolean;
    threshold: number; // Mindestpunktzahl für automatischen Versand
    includeCV: boolean;
    includeQualificationProfile: boolean;
  };
  reminderSettings: {
    enabled: boolean;
    reminderDelay: number; // in Tagen
    includeCustomerInfo: boolean;
  };
}

interface EmailStoreState {
  // E-Mail-Templates
  templates: EmailTemplate[];
  currentTemplate: EmailTemplate | null;
  
  // Verzögerte E-Mails
  delayedEmails: DelayedEmail[];
  
  // E-Mail-Einstellungen
  settings: EmailSettings;
  
  // Status
  isLoading: boolean;
  error: string | null;
  
  // Template-Operationen
  fetchTemplates: () => Promise<EmailTemplate[]>;
  fetchTemplate: (id: string) => Promise<EmailTemplate>;
  createTemplate: (template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<EmailTemplate>;
  updateTemplate: (id: string, template: Partial<EmailTemplate>) => Promise<EmailTemplate>;
  deleteTemplate: (id: string) => Promise<void>;
  
  // Verzögerte E-Mail-Operationen
  scheduleEmail: (
    recipient: string, 
    recipientName: string,
    subject: string, 
    content: string, 
    delayDays: number,
    relatedEntityId?: string,
    relatedEntityType?: 'candidate' | 'customer'
  ) => Promise<DelayedEmail>;
  
  cancelScheduledEmail: (id: string) => Promise<void>;
  fetchDelayedEmails: () => Promise<DelayedEmail[]>;
  fetchPendingEmails: () => Promise<DelayedEmail[]>;
  
  // Einstellungen
  fetchSettings: () => Promise<EmailSettings>;
  updateSettings: (settings: Partial<EmailSettings>) => Promise<EmailSettings>;
  
  // E-Mail-Hilfsfunktionen
  sendImmediateEmail: (
    recipient: string, 
    recipientName: string,
    subject: string, 
    content: string,
    attachments?: string[]
  ) => Promise<void>;
  
  openEmailClient: (
    recipient: string, 
    subject: string, 
    body: string
  ) => void;
  
  processTemplate: (
    templateId: string, 
    variables: Record<string, string>
  ) => Promise<{ subject: string; content: string }>;
}

export const useEmailStore = create<EmailStoreState>((set, get) => ({
  templates: [],
  currentTemplate: null,
  delayedEmails: [],
  settings: {
    delayedRejection: {
      enabled: true,
      defaultDelay: 3, // 3 Tage Standardverzögerung
      archiveImmediately: true,
    },
    automaticMatching: {
      enabled: true,
      threshold: 80, // Ab 80% Übereinstimmung
      includeCV: true,
      includeQualificationProfile: true,
    },
    reminderSettings: {
      enabled: true,
      reminderDelay: 2, // 2 Tage
      includeCustomerInfo: true,
    }
  },
  isLoading: false,
  error: null,
  
  // Template-Operationen
  fetchTemplates: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/email/templates');
      if (!response.ok) {
        throw new Error('Fehler beim Laden der E-Mail-Templates');
      }
      
      const templates = await response.json();
      set({ templates, isLoading: false });
      return templates;
    } catch (error) {
      console.error('Fehler beim Laden der E-Mail-Templates:', error);
      set({ error: (error as Error).message, isLoading: false });
      return [];
    }
  },
  
  fetchTemplate: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/email/templates/${id}`);
      if (!response.ok) {
        throw new Error('Fehler beim Laden des E-Mail-Templates');
      }
      
      const template = await response.json();
      set({ currentTemplate: template, isLoading: false });
      return template;
    } catch (error) {
      console.error(`Fehler beim Laden des E-Mail-Templates ${id}:`, error);
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  createTemplate: async (templateData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/email/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(templateData)
      });
      
      if (!response.ok) {
        throw new Error('Fehler beim Erstellen des E-Mail-Templates');
      }
      
      const newTemplate = await response.json();
      set(state => ({
        templates: [...state.templates, newTemplate],
        isLoading: false
      }));
      
      return newTemplate;
    } catch (error) {
      console.error('Fehler beim Erstellen des E-Mail-Templates:', error);
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  updateTemplate: async (id: string, templateData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/email/templates/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(templateData)
      });
      
      if (!response.ok) {
        throw new Error('Fehler beim Aktualisieren des E-Mail-Templates');
      }
      
      const updatedTemplate = await response.json();
      set(state => ({
        templates: state.templates.map(t => 
          t.id === id ? updatedTemplate : t
        ),
        currentTemplate: state.currentTemplate?.id === id ? updatedTemplate : state.currentTemplate,
        isLoading: false
      }));
      
      return updatedTemplate;
    } catch (error) {
      console.error(`Fehler beim Aktualisieren des E-Mail-Templates ${id}:`, error);
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  deleteTemplate: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/email/templates/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Fehler beim Löschen des E-Mail-Templates');
      }
      
      set(state => ({
        templates: state.templates.filter(t => t.id !== id),
        currentTemplate: state.currentTemplate?.id === id ? null : state.currentTemplate,
        isLoading: false
      }));
    } catch (error) {
      console.error(`Fehler beim Löschen des E-Mail-Templates ${id}:`, error);
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  // Verzögerte E-Mail-Operationen
  scheduleEmail: async (recipient, recipientName, subject, content, delayDays, relatedEntityId, relatedEntityType) => {
    set({ isLoading: true, error: null });
    try {
      // Aktuelles Datum plus Verzögerung berechnen
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + delayDays);
      
      const emailData = {
        recipient,
        recipientName,
        subject,
        content,
        scheduledDate: scheduledDate.toISOString(),
        relatedEntityId,
        relatedEntityType
      };
      
      const response = await fetch('/api/email/delayed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });
      
      if (!response.ok) {
        throw new Error('Fehler beim Planen der verzögerten E-Mail');
      }
      
      const newDelayedEmail = await response.json();
      set(state => ({
        delayedEmails: [...state.delayedEmails, newDelayedEmail],
        isLoading: false
      }));
      
      return newDelayedEmail;
    } catch (error) {
      console.error('Fehler beim Planen der verzögerten E-Mail:', error);
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  cancelScheduledEmail: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/email/delayed/${id}/cancel`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Fehler beim Abbrechen der geplanten E-Mail');
      }
      
      set(state => ({
        delayedEmails: state.delayedEmails.map(email => 
          email.id === id ? { ...email, status: 'cancelled' } : email
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error(`Fehler beim Abbrechen der geplanten E-Mail ${id}:`, error);
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  fetchDelayedEmails: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/email/delayed');
      if (!response.ok) {
        throw new Error('Fehler beim Laden der verzögerten E-Mails');
      }
      
      const delayedEmails = await response.json();
      set({ delayedEmails, isLoading: false });
      return delayedEmails;
    } catch (error) {
      console.error('Fehler beim Laden der verzögerten E-Mails:', error);
      set({ error: (error as Error).message, isLoading: false });
      return [];
    }
  },
  
  fetchPendingEmails: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/email/delayed?status=pending');
      if (!response.ok) {
        throw new Error('Fehler beim Laden der ausstehenden E-Mails');
      }
      
      const pendingEmails = await response.json();
      set(state => ({
        delayedEmails: [...state.delayedEmails.filter(e => e.status !== 'pending'), ...pendingEmails],
        isLoading: false
      }));
      return pendingEmails;
    } catch (error) {
      console.error('Fehler beim Laden der ausstehenden E-Mails:', error);
      set({ error: (error as Error).message, isLoading: false });
      return [];
    }
  },
  
  // Einstellungen
  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/email/settings');
      if (!response.ok) {
        throw new Error('Fehler beim Laden der E-Mail-Einstellungen');
      }
      
      const settings = await response.json();
      set({ settings, isLoading: false });
      return settings;
    } catch (error) {
      console.error('Fehler beim Laden der E-Mail-Einstellungen:', error);
      set({ error: (error as Error).message, isLoading: false });
      return get().settings; // Standardeinstellungen zurückgeben
    }
  },
  
  updateSettings: async (settingsData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/email/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settingsData)
      });
      
      if (!response.ok) {
        throw new Error('Fehler beim Aktualisieren der E-Mail-Einstellungen');
      }
      
      const updatedSettings = await response.json();
      set({ settings: updatedSettings, isLoading: false });
      return updatedSettings;
    } catch (error) {
      console.error('Fehler beim Aktualisieren der E-Mail-Einstellungen:', error);
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  // E-Mail-Hilfsfunktionen
  sendImmediateEmail: async (recipient, recipientName, subject, content, attachments) => {
    set({ isLoading: true, error: null });
    try {
      const emailData = {
        recipient,
        recipientName,
        subject,
        content,
        attachments
      };
      
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });
      
      if (!response.ok) {
        throw new Error('Fehler beim Senden der E-Mail');
      }
      
      set({ isLoading: false });
    } catch (error) {
      console.error('Fehler beim Senden der E-Mail:', error);
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  openEmailClient: (recipient, subject, body) => {
    const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  },
  
  processTemplate: async (templateId, variables) => {
    try {
      // Zuerst das Template laden
      const template = await get().fetchTemplate(templateId);
      
      // Variablen ersetzen
      let subject = template.subject;
      let content = template.content;
      
      // Alle Variablen durch ihre Werte ersetzen
      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = new RegExp(`{{${key}}}`, 'g');
        subject = subject.replace(placeholder, value);
        content = content.replace(placeholder, value);
      });
      
      return { subject, content };
    } catch (error) {
      console.error(`Fehler beim Verarbeiten des Templates ${templateId}:`, error);
      throw error;
    }
  }
}));
