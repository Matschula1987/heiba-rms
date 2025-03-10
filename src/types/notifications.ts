/**
 * Typdefinitionen für das Benachrichtigungssystem und Bearbeitungssperren
 */

export type NotificationImportance = 'low' | 'normal' | 'high';

export type EntityType = 'job' | 'candidate' | 'application' | 'customer' | 'document';

export type NotificationFrequency = 'instant' | 'daily' | 'weekly';

export type AILevel = 'assist' | 'enhanced' | 'full';

export type NotificationAction = 
  | 'created' 
  | 'updated' 
  | 'deleted' 
  | 'commented' 
  | 'assigned' 
  | 'status_changed'
  | 'match_found'
  | 'profile_sent'
  | 'document_uploaded'
  | 'reminder';

/**
 * Eine Benachrichtigung im System
 */
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  entity_type?: EntityType;
  entity_id?: string;
  action?: NotificationAction;
  sender_id?: string;
  read: boolean;
  importance: NotificationImportance;
  created_at: string;
  read_at?: string;
}

/**
 * Eine aktive Bearbeitungssperre
 */
export interface EditingLock {
  id: string;
  entity_type: EntityType;
  entity_id: string;
  user_id: string;
  username?: string; // Für die Anzeige
  started_at: string;
  expires_at: string;
}

/**
 * Parameter zum Erstellen einer neuen Benachrichtigung
 */
export interface CreateNotificationParams {
  user_id: string;
  title: string;
  message: string;
  entity_type?: EntityType;
  entity_id?: string;
  action?: NotificationAction;
  sender_id?: string;
  importance?: NotificationImportance;
}

/**
 * Parameter zum Erstellen oder Aktualisieren einer Bearbeitungssperre
 */
export interface CreateEditingLockParams {
  entity_type: EntityType;
  entity_id: string;
  user_id: string;
  duration_minutes?: number; // Standardwert: 15 Minuten
}

/**
 * Parameter zum Abfragen von Benachrichtigungen
 */
export interface GetNotificationsParams {
  user_id: string;
  unread_only?: boolean;
  limit?: number;
  offset?: number;
  entity_type?: EntityType;
  entity_id?: string;
}

/**
 * Einstellungen für Benachrichtigungen
 */
export interface NotificationSettings {
  id?: string;
  userId: string;
  
  // Kanäle
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  
  // Typen
  notifyFollowup: boolean;
  notifyApplications: boolean;
  notifyStatusChanges: boolean;
  notifyDueActions: boolean;
  notifyProfileSending: boolean;
  notifyMatchings: boolean;
  
  // Häufigkeit
  frequency: NotificationFrequency;
  
  // Ruhige Zeiten
  quietHoursStart?: string;
  quietHoursEnd?: string;
  weekendDisabled: boolean;
  
  // Priorität
  minPriority: NotificationImportance;
  
  // KI-Modus
  aiModeEnabled: boolean;
  aiModeLevel: AILevel;
  aiFailureNotification: boolean;
  
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Parameter zum Erstellen oder Aktualisieren von Benachrichtigungseinstellungen
 */
export interface UpdateNotificationSettingsParams {
  emailEnabled?: boolean;
  pushEnabled?: boolean;
  smsEnabled?: boolean;
  notifyFollowup?: boolean;
  notifyApplications?: boolean;
  notifyStatusChanges?: boolean;
  notifyDueActions?: boolean;
  notifyProfileSending?: boolean;
  notifyMatchings?: boolean;
  frequency?: NotificationFrequency;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  weekendDisabled?: boolean;
  minPriority?: NotificationImportance;
  aiModeEnabled?: boolean;
  aiModeLevel?: AILevel;
  aiFailureNotification?: boolean;
}
