/**
 * Gemeinsame Typen für Social Media Integration
 */

export type SocialMediaPlatform = 'linkedin' | 'xing' | 'facebook' | 'instagram';

export interface SocialMediaConfig {
  platform: SocialMediaPlatform;
  apiKey: string;
  apiSecret: string;
  redirectUri: string;
  active: boolean;
  settings: {
    autoPost: boolean;
    postFrequency: 'daily' | 'weekly' | 'manual';
    postTemplate?: string;
    useCompanyAccount: boolean;
    allowComments?: boolean;
    targetGroups?: string[];
  };
}

export interface SocialMediaPost {
  id?: string;
  platform: SocialMediaPlatform;
  jobId: string;
  content: string;
  imageUrl?: string;
  link: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduledDate?: string;
  publishedDate?: string;
  stats?: {
    views: number;
    likes: number;
    shares: number;
    clicks: number;
    applications?: number;
  };
  metadata?: Record<string, any>;
}

export interface SocialMediaProfile {
  id: string;
  platform: SocialMediaPlatform;
  username: string;
  fullName: string;
  profileUrl: string;
  avatarUrl?: string;
  followers?: number;
  connections?: number;
  isCompanyProfile: boolean;
  isConnected: boolean;
  lastSyncDate?: string;
}

export interface SocialMediaConnection {
  profileId: string;
  platform: SocialMediaPlatform;
  fullName: string;
  position?: string;
  company?: string;
  location?: string;
  connectionDate: string;
  notes?: string;
  tags?: string[];
  profileUrl: string;
  avatarUrl?: string;
  lastContactDate?: string;
  emailAddress?: string;
  phoneNumber?: string;
  skills?: string[];
  isPotentialCandidate?: boolean;
  candidateId?: string; // Falls sie bereits als Kandidat im System erfasst ist
}

export interface SocialMediaSearchParams {
  platform: SocialMediaPlatform;
  keywords: string[];
  location?: string;
  radius?: number;
  jobTitle?: string;
  company?: string;
  experience?: {
    min?: number;
    max?: number;
  };
  skills?: string[];
  excludeConnected?: boolean;
  limit?: number;
}

export interface SocialMediaSearchResult {
  platform: SocialMediaPlatform;
  profiles: SocialMediaProfile[];
  totalCount: number;
  hasMore: boolean;
  nextPageToken?: string;
}

export interface SocialMediaAnalytics {
  platform: SocialMediaPlatform;
  period: 'day' | 'week' | 'month' | 'year';
  date: string;
  metrics: {
    impressions: number;
    engagements: number;
    clicks: number;
    applications: number;
    followers: number;
    postCount: number;
  };
  topPosts: {
    postId: string;
    engagement: number;
    clicks: number;
    applications: number;
  }[];
}
