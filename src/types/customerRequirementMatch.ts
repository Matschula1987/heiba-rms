import { Requirement } from './customer';

/**
 * Erweiterter Entity-Typ, der auch requirement enthält
 */
export type MatchEntityType = 'candidate' | 'application' | 'talent_pool' | 'requirement';

/**
 * Status eines Matches zwischen Kundenanforderung und Kandidat/Bewerbung/Talent-Pool
 */
export type RequirementMatchStatus = 'new' | 'viewed' | 'contacted' | 'rejected' | 'accepted';

/**
 * Match zwischen einer Kundenanforderung und einem Kandidaten/einer Bewerbung/einem Talent-Pool-Eintrag
 */
export interface CustomerRequirementMatch {
  id: string;
  requirement_id: string;
  entity_type: 'candidate' | 'application' | 'talent_pool';
  entity_id: string;
  match_score: number;
  status: RequirementMatchStatus;
  last_contact?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Zusätzliche Felder, die bei Join-Abfragen gefüllt werden können
  requirement?: Requirement;
  entity_name?: string;
  entity_email?: string;
  entity_phone?: string;
  customer_id?: string;
  customer_name?: string;
}

/**
 * Neue Eigenschaften für Benachrichtigungen mit Links
 */
export interface EnhancedNotification {
  link_type?: string;           // z.B. 'view', 'edit', 'contact'
  link_entity_type?: MatchEntityType;
  link_entity_id?: string;
  secondary_link_type?: string; // z.B. 'view_requirement'
  secondary_link_entity_type?: MatchEntityType;
  secondary_link_entity_id?: string;
}

/**
 * Parameter zum Erstellen eines neuen Matches
 */
export interface CreateRequirementMatchParams {
  requirement_id: string;
  entity_type: 'candidate' | 'application' | 'talent_pool';
  entity_id: string;
  match_score: number;
  status?: RequirementMatchStatus;
  notes?: string;
}

/**
 * Parameter zum Aktualisieren eines Matches
 */
export interface UpdateRequirementMatchParams {
  id: string;
  status?: RequirementMatchStatus;
  notes?: string;
  last_contact?: string;
}

/**
 * Parameter zum Abfragen von Matches
 */
export interface GetRequirementMatchesParams {
  requirement_id?: string;
  entity_type?: 'candidate' | 'application' | 'talent_pool';
  entity_id?: string;
  min_score?: number;
  status?: RequirementMatchStatus;
  limit?: number;
  offset?: number;
  include_entities?: boolean;
  include_requirements?: boolean;
  include_customers?: boolean;
}

/**
 * Ergebnis-Interface für Matching-Operationen
 */
export interface MatchingResult {
  success: boolean;
  matches?: CustomerRequirementMatch[];
  totalCount?: number;
  error?: string;
}
