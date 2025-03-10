import { BasePortalAdapter, PortalJob, PortalCandidate } from './baseAdapter'

export class StepStoneAdapter extends BasePortalAdapter {
  private baseUrl = 'https://api.stepstone.com/v1'

  async searchJobs(query?: string): Promise<PortalJob[]> {
    try {
      // Implementiere StepStone-spezifische API-Aufrufe
      const response = await fetch(`${this.baseUrl}/jobs/search?q=${query || ''}`, {
        headers: {
          'Authorization': `Bearer ${this.credentials.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch jobs from StepStone')
      }

      const data = await response.json()
      return this.mapJobsResponse(data)
    } catch (error) {
      console.error('StepStone API Error:', error)
      return []
    }
  }

  async searchCandidates(query?: string): Promise<PortalCandidate[]> {
    try {
      const response = await fetch(`${this.baseUrl}/candidates/search?q=${query || ''}`, {
        headers: {
          'Authorization': `Bearer ${this.credentials.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch candidates from StepStone')
      }

      const data = await response.json()
      return this.mapCandidatesResponse(data)
    } catch (error) {
      console.error('StepStone API Error:', error)
      return []
    }
  }

  async postJob(job: Partial<PortalJob>): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/jobs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.credentials.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.mapJobToStepStoneFormat(job))
      })

      if (!response.ok) {
        throw new Error('Failed to post job to StepStone')
      }

      const data = await response.json()
      return data.jobId
    } catch (error) {
      console.error('StepStone API Error:', error)
      throw error
    }
  }

  async updateJob(jobId: string, job: Partial<PortalJob>): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.credentials.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.mapJobToStepStoneFormat(job))
      })

      if (!response.ok) {
        throw new Error('Failed to update job on StepStone')
      }
    } catch (error) {
      console.error('StepStone API Error:', error)
      throw error
    }
  }

  async deleteJob(jobId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.credentials.accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete job from StepStone')
      }
    } catch (error) {
      console.error('StepStone API Error:', error)
      throw error
    }
  }

  async getJobDetails(jobId: string): Promise<PortalJob> {
    try {
      const response = await fetch(`${this.baseUrl}/jobs/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${this.credentials.accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch job details from StepStone')
      }

      const data = await response.json()
      return this.mapJobResponse(data)
    } catch (error) {
      console.error('StepStone API Error:', error)
      throw error
    }
  }

  async getCandidateDetails(candidateId: string): Promise<PortalCandidate> {
    try {
      const response = await fetch(`${this.baseUrl}/candidates/${candidateId}`, {
        headers: {
          'Authorization': `Bearer ${this.credentials.accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch candidate details from StepStone')
      }

      const data = await response.json()
      return this.mapCandidateResponse(data)
    } catch (error) {
      console.error('StepStone API Error:', error)
      throw error
    }
  }

  private mapJobsResponse(data: any): PortalJob[] {
    return data.jobs.map((job: any) => this.mapJobResponse(job))
  }

  private mapJobResponse(job: any): PortalJob {
    return {
      portalId: 'stepstone',
      portalJobId: job.id,
      title: job.title,
      company: job.company.name,
      location: job.location.city,
      description: job.description,
      requiredSkills: job.skills || [],
      requiredExperience: job.experience || 0,
      salaryRange: {
        min: job.salary?.min || 0,
        max: job.salary?.max || 0
      },
      requiredEducation: job.education || '',
      originalUrl: job.url,
      portalName: 'StepStone'
    }
  }

  private mapCandidatesResponse(data: any): PortalCandidate[] {
    return data.candidates.map((candidate: any) => this.mapCandidateResponse(candidate))
  }

  private mapCandidateResponse(candidate: any): PortalCandidate {
    return {
      portalId: 'stepstone',
      portalCandidateId: candidate.id,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      email: candidate.email,
      phone: candidate.phone,
      location: candidate.location.city,
      skills: candidate.skills || [],
      experience: candidate.experience || 0,
      education: candidate.education || '',
      salaryExpectation: candidate.salaryExpectation || 0,
      profileUrl: candidate.profileUrl,
      portalName: 'StepStone'
    }
  }

  private mapJobToStepStoneFormat(job: Partial<PortalJob>): any {
    return {
      title: job.title,
      company: {
        name: job.company
      },
      location: {
        city: job.location
      },
      description: job.description,
      skills: job.requiredSkills,
      experience: job.requiredExperience,
      salary: job.salaryRange && {
        min: job.salaryRange.min,
        max: job.salaryRange.max
      },
      education: job.requiredEducation
    }
  }
}