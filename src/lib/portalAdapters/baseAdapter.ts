export interface PortalJob {
  portalId: string
  portalJobId: string
  title: string
  company: string
  location: string
  description: string
  requiredSkills: string[]
  requiredExperience: number
  salaryRange: {
    min: number
    max: number
  }
  requiredEducation: string
  originalUrl: string
  portalName: string
}

export interface PortalCandidate {
  portalId: string
  portalCandidateId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  location: string
  skills: string[]
  experience: number
  education: string
  salaryExpectation: number
  profileUrl: string
  portalName: string
}

export interface PortalCredentials {
  apiKey: string
  apiSecret?: string
  accessToken?: string
}

export abstract class BasePortalAdapter {
  protected credentials: PortalCredentials

  constructor(credentials: PortalCredentials) {
    this.credentials = credentials
  }

  abstract searchJobs(query?: string): Promise<PortalJob[]>
  abstract searchCandidates(query?: string): Promise<PortalCandidate[]>
  abstract postJob(job: Partial<PortalJob>): Promise<string>
  abstract updateJob(jobId: string, job: Partial<PortalJob>): Promise<void>
  abstract deleteJob(jobId: string): Promise<void>
  abstract getJobDetails(jobId: string): Promise<PortalJob>
  abstract getCandidateDetails(candidateId: string): Promise<PortalCandidate>
}