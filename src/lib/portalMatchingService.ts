import matchingService from './matchingService'
import { portalAdapters } from './portalAdapters'
import { Job, Candidate, MatchingOptions } from '@/types'
import { PortalJob, PortalCandidate } from './portalAdapters/baseAdapter'
import { usePortalStore } from '@/store/portalStore'

// Interface für Portal, da das Original nicht exportiert wird
interface Portal {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  credentials?: any;
  url?: string;
}

export const portalMatchingService = {
  // Hole Jobs von allen verbundenen Portalen
  async fetchPortalJobs(portals: Portal[]): Promise<PortalJob[]> {
    const allJobs: PortalJob[] = []

    for (const portal of portals) {
      try {
        if (!portal.isActive) continue

        const adapter = portalAdapters[portal.type as keyof typeof portalAdapters]
        if (!adapter) {
          console.warn(`Kein Adapter gefunden für Portal-Typ: ${portal.type}`)
          continue
        }

        const portalJobs = await adapter.searchJobs()
        allJobs.push(...portalJobs)
      } catch (error) {
        console.error(`Fehler beim Abrufen der Jobs von ${portal.name}:`, error)
      }
    }

    return allJobs
  },

  // Hole Kandidaten von allen verbundenen Portalen
  async fetchPortalCandidates(portals: Portal[]): Promise<PortalCandidate[]> {
    const allCandidates: PortalCandidate[] = []

    for (const portal of portals) {
      try {
        if (!portal.isActive) continue

        const adapter = portalAdapters[portal.type as keyof typeof portalAdapters]
        if (!adapter) {
          console.warn(`Kein Adapter gefunden für Portal-Typ: ${portal.type}`)
          continue
        }

        const portalCandidates = await adapter.searchCandidates()
        allCandidates.push(...portalCandidates)
      } catch (error) {
        console.error(`Fehler beim Abrufen der Kandidaten von ${portal.name}:`, error)
      }
    }

    return allCandidates
  },

  // Hole externe Jobs von Job-Boards
  async fetchExternalJobs(): Promise<PortalJob[]> {
    const allJobs: PortalJob[] = []

    try {
      // Durchsuche alle verfügbaren Job-Boards
      for (const adapter of Object.values(portalAdapters)) {
        const jobs = await adapter.searchJobs()
        allJobs.push(...jobs)
      }
    } catch (error) {
      console.error('Fehler beim Abrufen externer Jobs:', error)
    }

    return allJobs
  },

  // Führe Matching mit allen Kandidaten durch
  async matchWithAllCandidates(
    job: Job | PortalJob,
    internalCandidates: Candidate[],
    portalCandidates: PortalCandidate[],
    options = { fuzzySkillMatching: true, locationRadius: 50, minimumScore: 60 }
  ) {
    const matches = []
    
    // Erweitere Job für die Typkompatibilität wenn es ein PortalJob ist
    const jobForMatching = ('portalId' in job) ? {
      ...job,
      id: `${job.portalId}-${job.portalJobId}`,
      company_id: 0,
      salary_range: job.salaryRange ? `${job.salaryRange.min}-${job.salaryRange.max}` : '',
      job_type: 'Vollzeit',
      requirements: '',
      department: '',
      status: 'active' as any,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } : job;

    // Matching mit internen Kandidaten
    for (const candidate of internalCandidates) {
      const match = matchingService.calculateMatch(jobForMatching as Job, candidate, undefined, options)
      if (match.score >= options.minimumScore) {
        matches.push({
          ...match,
          candidateId: candidate.id,
          candidateName: `${candidate.firstName} ${candidate.lastName}`,
          isPortalCandidate: false,
          candidateSource: 'internal'
        })
      }
    }

    // Matching mit Portal-Kandidaten
    for (const candidate of portalCandidates) {
      // Erstelle ein kompatibles Kandidaten-Objekt
      const candidateForMatching = {
        ...candidate,
        id: `${candidate.portalId}-${candidate.portalCandidateId}`,
        name: `${candidate.firstName} ${candidate.lastName}`,
        position: candidate.education || 'Unbekannt',
        status: 'active' as any,
        skills: candidate.skills ? candidate.skills.map((skill: string) => ({ name: skill, level: 1 })) : [],
        // Explizite Typkonvertierung für experience
        experience: [{ position: 'Erfahrung', period: `${candidate.experience} Jahre` }]
      };
      
      // Verwende eine zweistufige Typkonversion, um das TypeScript-System zu beruhigen
      const match = matchingService.calculateMatch(jobForMatching as Job, candidateForMatching as unknown as Candidate, undefined, options)
      
      if (match.score >= options.minimumScore) {
        matches.push({
          ...match,
          candidateId: `${candidate.portalId}-${candidate.portalCandidateId}`,
          candidateName: `${candidate.firstName} ${candidate.lastName}`,
          isPortalCandidate: true,
          candidateSource: 'portal',
          portalName: candidate.portalName,
          profileUrl: candidate.profileUrl
        })
      }
    }

    return matches.sort((a, b) => b.score - a.score)
  },

  // Führe Matching mit allen Jobs durch
  async matchWithAllJobs(
    candidate: Candidate | PortalCandidate,
    internalJobs: Job[],
    portalJobs: PortalJob[],
    options = { fuzzySkillMatching: true, locationRadius: 50, minimumScore: 60 }
  ) {
    const matches = []
    
    // Erstelle ein kompatibles Kandidaten-Objekt wenn es ein PortalCandidate ist
    const candidateForMatching = ('portalId' in candidate) ? {
      ...candidate,
      id: `${candidate.portalId}-${candidate.portalCandidateId}`,
      name: `${candidate.firstName} ${candidate.lastName}`,
      position: candidate.education || 'Unbekannt',
      status: 'active' as any,
      skills: candidate.skills ? candidate.skills.map((skill: string) => ({ name: skill, level: 1 })) : [],
      experience: [{ position: 'Unbekannt', period: `${candidate.experience} Jahre` }]
    } : candidate;

    // Matching mit internen Jobs
    for (const job of internalJobs) {
      // Type Assertion für die Typkompatibilität
      const match = matchingService.calculateMatch(job as Job, candidateForMatching as any, undefined, options as any)
      if (match.score >= options.minimumScore) {
        matches.push({
          ...match,
          jobId: job.id,
          jobTitle: job.title,
          companyName: 'Eigenes Unternehmen',
          isPortalJob: false,
          jobSource: 'internal'
        })
      }
    }

    // Matching mit Portal-Jobs
    for (const job of portalJobs) {
      // Erstelle ein kompatibles Job-Objekt für den MatchingService
      const jobForMatching = {
        ...job,
        id: `${job.portalId}-${job.portalJobId}`,
        company_id: 0,
        salary_range: job.salaryRange ? `${job.salaryRange.min}-${job.salaryRange.max}` : '',
        job_type: 'Vollzeit',
        requirements: job.requiredEducation || '',
        department: '',
        status: 'active' as any,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const match = matchingService.calculateMatch(jobForMatching as unknown as Job, candidateForMatching as any, undefined, options as any)
      
      if (match.score >= options.minimumScore) {
        matches.push({
          ...match,
          jobId: `${job.portalId}-${job.portalJobId}`,
          jobTitle: job.title,
          companyName: job.company,
          isPortalJob: true,
          jobSource: 'portal',
          portalName: job.portalName,
          originalUrl: job.originalUrl
        })
      }
    }

    return matches.sort((a, b) => b.score - a.score)
  }
}
