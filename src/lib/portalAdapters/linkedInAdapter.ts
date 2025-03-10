import { BasePortalAdapter, PortalJob, PortalCandidate } from './baseAdapter'

export class LinkedInAdapter extends BasePortalAdapter {
  private baseUrl = 'https://api.linkedin.com/v2'

  async searchJobs(query?: string): Promise<PortalJob[]> {
    // TODO: Implementiere LinkedIn-spezifische Logik
    return []
  }

  async searchCandidates(query?: string): Promise<PortalCandidate[]> {
    // TODO: Implementiere LinkedIn-spezifische Logik
    return []
  }

  async postJob(job: Partial<PortalJob>): Promise<string> {
    // TODO: Implementiere LinkedIn-spezifische Logik
    return ''
  }

  async updateJob(jobId: string, job: Partial<PortalJob>): Promise<void> {
    // TODO: Implementiere LinkedIn-spezifische Logik
  }

  async deleteJob(jobId: string): Promise<void> {
    // TODO: Implementiere LinkedIn-spezifische Logik
  }

  async getJobDetails(jobId: string): Promise<PortalJob> {
    // TODO: Implementiere LinkedIn-spezifische Logik
    throw new Error('Not implemented')
  }

  async getCandidateDetails(candidateId: string): Promise<PortalCandidate> {
    // TODO: Implementiere LinkedIn-spezifische Logik
    throw new Error('Not implemented')
  }
}