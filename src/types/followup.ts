/**
 * Typen für das Nachverfolgungssystem
 */

export type FollowupPriority = 'high' | 'medium' | 'low';
export type FollowupStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type FollowupActionType = 'email' | 'call' | 'meeting' | 'sms' | 'note' | 'other';
export type FollowupTriggerEvent = 
  'profile_sent' | 
  'interview_scheduled' | 
  'interview_completed' | 
  'offer_sent' | 
  'application_received' | 
  'application_status_changed' | 
  'candidate_added' | 
  'talent_pool_added' | 
  'manual';

export type FollowupAssigneeType = 'creator' | 'manager' | 'recruiter' | 'specific_user';
export type FollowupEntityType = 'candidate' | 'application' | 'job' | 'talent_pool';

export type ProfileSubmissionStatus = 
  'pending' | 
  'followed_up' | 
  'no_response' | 
  'response_received' | 
  'cancelled';

export interface FollowupAction {
  id?: string;
  title: string;
  description?: string;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
  priority: FollowupPriority;
  actionType: FollowupActionType;
  assignedTo: string;
  assignedBy: string;
  reminderSent: boolean;
  reminderDate?: string;
  candidateId?: string;
  applicationId?: string;
  jobId?: string;
  talentPoolId?: string;
  notes?: string;
  status: FollowupStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface FollowupTemplate {
  id?: string;
  name: string;
  description?: string;
  actionType: FollowupActionType;
  templateContent?: string;
  defaultPriority: FollowupPriority;
  defaultDaysOffset: number;
  createdBy: string;
  triggerOn?: FollowupTriggerEvent;
  applicability?: FollowupEntityType;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FollowupRule {
  id?: string;
  name: string;
  description?: string;
  isActive: boolean;
  triggerEvent: FollowupTriggerEvent;
  entityType: FollowupEntityType;
  daysOffset: number;
  actionType: FollowupActionType;
  priority: FollowupPriority;
  templateId?: string;
  assignedToType: FollowupAssigneeType;
  assignedToUserId?: string;
  conditions?: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FollowupLog {
  id?: string;
  followupActionId: string;
  actionType: 'create' | 'update' | 'complete' | 'cancel' | 'remind';
  userId: string;
  details?: string;
  createdAt?: string;
}

export interface ProfileSubmissionFollowup {
  id?: string;
  applicationId: string;
  customerId: string;
  sentBy: string;
  sentAt: string;
  followupActionId?: string;
  status: ProfileSubmissionStatus;
  responseReceivedAt?: string;
  responseDetails?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationFollowupLink {
  notificationId: string;
  followupActionId: string;
  createdAt?: string;
}

export interface FollowupActionWithDetails extends FollowupAction {
  candidateName?: string;
  applicationTitle?: string;
  jobTitle?: string;
  talentPoolName?: string;
  assignedToName?: string;
  assignedByName?: string;
}
