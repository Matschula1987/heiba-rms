import { create } from 'zustand'
import matchingService from '@/lib/matchingService'
import { portalMatchingService } from '@/lib/portalMatchingService'
import { useJobStore } from '@/store/jobStore'
import { useCandidateStore } from '@/store/candidateStore'
import { usePortalStore } from '@/store/portalStore'
import { MatchingWeights } from '@/lib/matchingService'
import { ExtendedMatchResult } from '@/types/portal'
import { MatchingOptions } from '@/types'
import { Job, PortalJob, JobStatus } from '@/types'

interface MatchingState {
  // Bestehendes
  matches: ExtendedMatchResult[]
  dailyMatches: ExtendedMatchResult[]
  matchingWeights: MatchingWeights
  isLoading: boolean
  error: string | null
  includePortals: boolean
  includeExternalJobs: boolean
  
  // Erweitertes Matching
  internalMatches: ExtendedMatchResult[]
  internalDailyMatches: ExtendedMatchResult[]
  externalMatches: ExtendedMatchResult[]
  externalDailyMatches: ExtendedMatchResult[]
  
  // Bestehendes
  runMatching: (jobId?: string, candidateId?: string, options?: Partial<MatchingOptions>) => Promise<void>
  runGlobalMatching: () => Promise<void>
  updateMatchingWeights: (weights: Partial<MatchingWeights>) => void
  setIncludePortals: (include: boolean) => void
  setIncludeExternalJobs: (include: boolean) => void
  setMatches: (matches: ExtendedMatchResult[]) => void
  setDailyMatches: (matches: ExtendedMatchResult[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Neue Funktionen
  runInternalMatching: () => Promise<void>
  runExternalMatching: () => Promise<void>
  getInternalMatchingStats: () => Promise<{
    totalMatches: number,
    highMatchCount: number,
    averageScore: number,
    matchesThisWeek: number
  }>
  getExternalMatchingStats: () => Promise<{
    totalMatches: number,
    highMatchCount: number,
    averageScore: number,
    matchesThisWeek: number
  }>
}

const defaultMatchingOptions: MatchingOptions = {
  fuzzySkillMatching: true,
  locationRadius: 50,
  minimumScore: 60
}

export const useExtendedMatchingStore = create<MatchingState>((set, get) => ({
  // Ursprünglicher State
  matches: [],
  dailyMatches: [],
  matchingWeights: matchingService.defaultWeights,
  isLoading: false,
  error: null,
  includePortals: true,
  includeExternalJobs: true,
  
  // Neuer State für erweitertes Matching
  internalMatches: [],
  internalDailyMatches: [],
  externalMatches: [],
  externalDailyMatches: [],

  // Bestehende Funktionen
  runGlobalMatching: async () => {
    set({ isLoading: true, error: null })
    try {
      const { jobs } = useJobStore.getState()
      const { candidates } = useCandidateStore.getState()
      const { portals } = usePortalStore.getState()
      const { includePortals, includeExternalJobs } = get()
      
      console.log(`Running global matching with ${jobs.length} jobs and ${candidates.length} candidates...`)
      let allMatches: ExtendedMatchResult[] = []
      let internalMatchesList: ExtendedMatchResult[] = []
      let externalMatchesList: ExtendedMatchResult[] = []

      // Interne Matches
      for (const job of jobs) {
        for (const candidate of candidates) {
          const match = matchingService.calculateMatch(job, candidate, undefined, defaultMatchingOptions)
          if (match.score >= defaultMatchingOptions.minimumScore) {
            const extendedMatch: ExtendedMatchResult = {
              ...match,
              jobId: job.id,
              jobTitle: job.title,
              candidateId: candidate.id,
              candidateName: `${candidate.firstName} ${candidate.lastName}`,
              candidatePosition: candidate.position || 'Nicht angegeben',
              customer: job.company || 'Eigenes Unternehmen',
              companyName: 'Eigenes Unternehmen',
              lastUpdated: new Date().toISOString(),
              isPortalJob: false,
              isPortalCandidate: false,
              jobSource: 'internal',
              candidateSource: 'internal'
            }
            allMatches.push(extendedMatch)
            internalMatchesList.push(extendedMatch)
          }
        }
      }

      if (includePortals || includeExternalJobs) {
        const portalJobs = await portalMatchingService.fetchPortalJobs(portals)
        const portalCandidates = await portalMatchingService.fetchPortalCandidates(portals)
        const externalJobs = includeExternalJobs ? await portalMatchingService.fetchExternalJobs() : []

        // Portal-Matches
        for (const portalJob of [...portalJobs, ...externalJobs]) {
          // Ignoriere TypeScript-Fehler, da wir portalJob dynamisch behandeln
          // Konvertiere PortalJob zu Job für das Matching
          const job: any = {
            id: `${portalJob.portalId}-${portalJob.portalJobId}`,
            title: portalJob.title,
            department: '',
            description: portalJob.description,
            location: portalJob.location,
            requirements: '',
            status: 'active' as JobStatus,
            skills: portalJob.requiredSkills || [],
            salary_range: portalJob.salaryRange || '',
            company_id: 0,
            job_type: 'Vollzeit',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            
            // Eigenschaften für den MatchingService
            requiredSkills: portalJob.requiredSkills || [],
            requiredExperience: portalJob.requiredExperience || 0,
            requiredEducation: portalJob.requiredEducation || ''
          }

          for (const candidateItem of [...candidates, ...portalCandidates]) {
            // Behandle Kandidaten als erweitert mit den erforderlichen Eigenschaften
            const candidate = candidateItem as any;
            const match = matchingService.calculateMatch(job, candidate, undefined, defaultMatchingOptions)
            if (match.score >= defaultMatchingOptions.minimumScore) {
              const jobSource: 'internal' | 'portal' | 'external' = 
                'external' in portalJob ? 'external' : 'portal';
              
              const extendedMatch: ExtendedMatchResult = {
                ...match,
                jobId: job.id,
                jobTitle: job.title,
                candidateId: 'id' in candidate ? candidate.id : `${candidate.portalId}-${candidate.portalCandidateId}`,
                candidateName: `${candidate.firstName} ${candidate.lastName}`,
                candidatePosition: candidate.position || 'Nicht angegeben',
                customer: 'portalName' in portalJob ? portalJob.portalName : 'Externes Unternehmen',
                companyName: 'portalName' in portalJob ? portalJob.portalName : 'Externes Unternehmen',
                lastUpdated: new Date().toISOString(),
                isPortalJob: true,
                isPortalCandidate: !('id' in candidate),
                portalName: 'portalName' in portalJob ? portalJob.portalName : undefined,
                originalUrl: 'originalUrl' in portalJob ? portalJob.originalUrl : undefined,
                profileUrl: 'profileUrl' in candidate ? candidate.profileUrl : undefined,
                jobSource,
                candidateSource: 'id' in candidate ? 'internal' : 'portal'
              }
              
              allMatches.push(extendedMatch)
              externalMatchesList.push(extendedMatch)
            }
          }
        }
      }

      // Sortiere nach Score
      allMatches.sort((a, b) => b.score - a.score)
      internalMatchesList.sort((a, b) => b.score - a.score)
      externalMatchesList.sort((a, b) => b.score - a.score)

      // Update Store
      const today = new Date().toDateString()
      set({
        matches: allMatches,
        dailyMatches: allMatches.filter(
          match => new Date(match.lastUpdated).toDateString() === today
        ),
        internalMatches: internalMatchesList,
        internalDailyMatches: internalMatchesList.filter(
          match => new Date(match.lastUpdated).toDateString() === today
        ),
        externalMatches: externalMatchesList,
        externalDailyMatches: externalMatchesList.filter(
          match => new Date(match.lastUpdated).toDateString() === today
        ),
        isLoading: false
      })
    } catch (error) {
      set({ error: 'Failed to run global matching', isLoading: false })
    }
  },

  runMatching: async (jobId?: string, candidateId?: string, options?: Partial<MatchingOptions>) => {
    // Vervollständige partielle Optionen mit Standardwerten
    const fullOptions: MatchingOptions = {
      ...defaultMatchingOptions,
      ...options
    }
    if (!jobId && !candidateId) {
      return get().runGlobalMatching()
    }

    set({ isLoading: true, error: null })
    try {
      const { jobs } = useJobStore.getState()
      const { candidates } = useCandidateStore.getState()
      
      let matches: ExtendedMatchResult[] = []

      if (jobId) {
        // Match spezifischen Job
        const job = jobs.find(j => j.id === jobId)
        if (job) {
          for (const candidate of candidates) {
            const match = matchingService.calculateMatch(job, candidate, undefined, fullOptions)
            matches.push({
              ...match,
              jobId: job.id,
              jobTitle: job.title,
              candidateId: candidate.id,
              candidateName: `${candidate.firstName} ${candidate.lastName}`,
              candidatePosition: candidate.position || 'Nicht angegeben',
              customer: job.company || 'Eigenes Unternehmen',
              companyName: 'Eigenes Unternehmen',
              lastUpdated: new Date().toISOString(),
              isPortalJob: false,
              isPortalCandidate: false,
              jobSource: 'internal',
              candidateSource: 'internal'
            })
          }
        }
      } else if (candidateId) {
        // Match spezifischen Kandidaten
        const candidate = candidates.find(c => c.id === candidateId)
        if (candidate) {
          for (const job of jobs) {
            const match = matchingService.calculateMatch(job, candidate, undefined, fullOptions)
            matches.push({
              ...match,
              jobId: job.id,
              jobTitle: job.title,
              candidateId: candidate.id,
              candidateName: `${candidate.firstName} ${candidate.lastName}`,
              candidatePosition: candidate.position || 'Nicht angegeben',
              customer: job.company || 'Eigenes Unternehmen',
              companyName: 'Eigenes Unternehmen',
              lastUpdated: new Date().toISOString(),
              isPortalJob: false,
              isPortalCandidate: false,
              jobSource: 'internal',
              candidateSource: 'internal'
            })
          }
        }
      }

      // Sortiere und aktualisiere
      matches.sort((a, b) => b.score - a.score)
      const today = new Date().toDateString()
      
      set({
        matches,
        dailyMatches: matches.filter(
          match => new Date(match.lastUpdated).toDateString() === today
        )
      })
    } catch (error) {
      set({ error: 'Failed to run matching', isLoading: false })
    } finally {
      set({ isLoading: false })
    }
  },
  
  // Neue Funktionen für das erweiterte Matching
  runInternalMatching: async () => {
    set({ isLoading: true, error: null })
    try {
      const { jobs } = useJobStore.getState()
      const { candidates } = useCandidateStore.getState()
      
      console.log(`Running internal matching with ${jobs.length} jobs and ${candidates.length} candidates...`)
      let internalMatchesList: ExtendedMatchResult[] = []

      // Interne Matches
      for (const job of jobs) {
        for (const candidate of candidates) {
          const match = matchingService.calculateMatch(job, candidate, undefined, defaultMatchingOptions)
          if (match.score >= defaultMatchingOptions.minimumScore) {
            internalMatchesList.push({
              ...match,
              jobId: job.id,
              jobTitle: job.title,
              candidateId: candidate.id,
              candidateName: `${candidate.firstName} ${candidate.lastName}`,
              candidatePosition: candidate.position || 'Nicht angegeben',
              customer: job.company || 'Eigenes Unternehmen',
              companyName: 'Eigenes Unternehmen',
              lastUpdated: new Date().toISOString(),
              isPortalJob: false,
              isPortalCandidate: false,
              jobSource: 'internal',
              candidateSource: 'internal'
            })
          }
        }
      }

      // Sortiere nach Score
      internalMatchesList.sort((a, b) => b.score - a.score)

      // Update Store
      const today = new Date().toDateString()
      set({
        internalMatches: internalMatchesList,
        internalDailyMatches: internalMatchesList.filter(
          match => new Date(match.lastUpdated).toDateString() === today
        ),
        isLoading: false
      })
    } catch (error) {
      set({ error: 'Failed to run internal matching', isLoading: false })
    }
  },
  
  runExternalMatching: async () => {
    set({ isLoading: true, error: null })
    try {
      const { candidates } = useCandidateStore.getState()
      const { portals } = usePortalStore.getState()
      
      let externalMatchesList: ExtendedMatchResult[] = []

      // Hole externe Jobs und Kandidaten
      const portalJobs = await portalMatchingService.fetchPortalJobs(portals)
      const portalCandidates = await portalMatchingService.fetchPortalCandidates(portals)
      const externalJobs = await portalMatchingService.fetchExternalJobs()

      console.log(`Running external matching with ${portalJobs.length + externalJobs.length} jobs and ${candidates.length + portalCandidates.length} candidates...`)

      // Portal-Matches
      for (const portalJob of [...portalJobs, ...externalJobs]) {
        // Konvertiere PortalJob zu Job für das Matching
        const job: any = {
          id: `${portalJob.portalId}-${portalJob.portalJobId}`,
          title: portalJob.title,
          department: '',
          description: portalJob.description,
          location: portalJob.location,
          requirements: '',
          status: 'active' as JobStatus,
          skills: portalJob.requiredSkills || [],
          salary_range: portalJob.salaryRange || '',
          company_id: 0,
          job_type: 'Vollzeit',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          
          // Eigenschaften für den MatchingService
          requiredSkills: portalJob.requiredSkills || [],
          requiredExperience: portalJob.requiredExperience || 0,
          requiredEducation: portalJob.requiredEducation || ''
        }

        for (const candidateItem of [...candidates, ...portalCandidates]) {
          // Behandle Kandidaten als erweitert mit den erforderlichen Eigenschaften
          const candidate = candidateItem as any;
          const match = matchingService.calculateMatch(job, candidate, undefined, defaultMatchingOptions)
          if (match.score >= defaultMatchingOptions.minimumScore) {
            const jobSource: 'internal' | 'portal' | 'external' = 
              'external' in portalJob ? 'external' : 'portal';
              
            externalMatchesList.push({
              ...match,
              jobId: job.id,
              jobTitle: job.title,
              candidateId: 'id' in candidate ? candidate.id : `${candidate.portalId}-${candidate.portalCandidateId}`,
              candidateName: `${candidate.firstName} ${candidate.lastName}`,
              candidatePosition: candidate.position || 'Nicht angegeben',
              customer: 'portalName' in portalJob ? portalJob.portalName : 'Externes Unternehmen',
              companyName: 'portalName' in portalJob ? portalJob.portalName : 'Externes Unternehmen',
              lastUpdated: new Date().toISOString(),
              isPortalJob: true,
              isPortalCandidate: !('id' in candidate),
              portalName: 'portalName' in portalJob ? portalJob.portalName : undefined,
              originalUrl: 'originalUrl' in portalJob ? portalJob.originalUrl : undefined,
              profileUrl: 'profileUrl' in candidate ? candidate.profileUrl : undefined,
              jobSource,
              candidateSource: 'id' in candidate ? 'internal' : 'portal'
            })
          }
        }
      }

      // Sortiere nach Score
      externalMatchesList.sort((a, b) => b.score - a.score)

      // Update Store
      const today = new Date().toDateString()
      set({
        externalMatches: externalMatchesList,
        externalDailyMatches: externalMatchesList.filter(
          match => new Date(match.lastUpdated).toDateString() === today
        ),
        isLoading: false
      })
    } catch (error) {
      set({ error: 'Failed to run external matching', isLoading: false })
    }
  },
  
  getInternalMatchingStats: async () => {
    const state = get()
    const internalMatches = state.internalMatches
    
    // Berechne Statistik
    const highMatchCount = internalMatches.filter(match => match.score >= 90).length
    
    // Berechne Durchschnitt
    const averageScore = internalMatches.length > 0 
      ? Math.round(internalMatches.reduce((sum, match) => sum + match.score, 0) / internalMatches.length) 
      : 0
    
    // Matches dieser Woche
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const matchesThisWeek = internalMatches.filter(
      match => new Date(match.lastUpdated) >= oneWeekAgo
    ).length
    
    return {
      totalMatches: internalMatches.length,
      highMatchCount,
      averageScore,
      matchesThisWeek
    }
  },
  
  getExternalMatchingStats: async () => {
    const state = get()
    const externalMatches = state.externalMatches
    
    // Berechne Statistik
    const highMatchCount = externalMatches.filter(match => match.score >= 90).length
    
    // Berechne Durchschnitt
    const averageScore = externalMatches.length > 0 
      ? Math.round(externalMatches.reduce((sum, match) => sum + match.score, 0) / externalMatches.length) 
      : 0
    
    // Matches dieser Woche
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const matchesThisWeek = externalMatches.filter(
      match => new Date(match.lastUpdated) >= oneWeekAgo
    ).length
    
    return {
      totalMatches: externalMatches.length,
      highMatchCount,
      averageScore,
      matchesThisWeek
    }
  },

  updateMatchingWeights: (weights) => {
    set((state) => ({
      matchingWeights: { ...state.matchingWeights, ...weights }
    }))
    get().runGlobalMatching()
  },

  setIncludePortals: (include) => {
    set({ includePortals: include })
    get().runGlobalMatching()
  },

  setIncludeExternalJobs: (include) => {
    set({ includeExternalJobs: include })
    get().runGlobalMatching()
  },

  setMatches: (matches) => set({ matches }),
  setDailyMatches: (matches) => set({ dailyMatches: matches }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error })
}))
