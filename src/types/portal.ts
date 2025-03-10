import { Job, Candidate } from './index'

export interface PortalJob extends Omit<Job, 'id' | 'portals' | 'applications' | 'status'> {
  portalId: string
  portalJobId: string
  portalName: string
  originalUrl: string
}

export interface PortalCandidate extends Omit<Candidate, 'id' | 'status' | 'notes' | 'jobId'> {
  portalId: string
  portalCandidateId: string
  portalName: string
  profileUrl: string
}

export interface ExtendedMatchResult {
  jobId: string
  jobTitle: string
  candidateId: string
  candidateName: string
  candidatePosition: string
  customer: string
  companyName: string
  score: number
  matchedSkills: string[]
  missingSkills: string[]
  partialMatchSkills?: Array<{skill: string, confidence: number}>
  locationMatch: boolean
  salaryMatch: boolean
  experienceMatch: boolean
  details: {
    skillScore: number
    experienceScore: number
    locationScore: number
    salaryScore: number
    educationScore: number
  }
  lastUpdated: string
  isPortalJob: boolean
  isPortalCandidate: boolean
  portalName?: string
  originalUrl?: string
  profileUrl?: string
  jobSource: 'internal' | 'portal' | 'external'
  candidateSource: 'internal' | 'portal'
}
