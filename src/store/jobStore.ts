import { create } from 'zustand'
import { Job } from '@/types'
import { dummyJobs } from '@/data/dummyJobs'

interface JobStore {
  jobs: Job[]
  isLoading: boolean
  error: string | null
  fetchJobs: () => Promise<void>
  createJob: (jobData: Partial<Job>) => Promise<Job>
  updateJob: (id: string, jobData: Partial<Job>) => Promise<Job>
  deleteJob: (id: string) => Promise<void>
  getJobById: (id: string) => Promise<Job | null>
}

export const useJobStore = create<JobStore>((set, get) => ({
  jobs: [],
  isLoading: false,
  error: null,

  fetchJobs: async () => {
    set({ isLoading: true, error: null })
    try {
      // Versuche, Daten von der API zu laden
      const response = await fetch('/api/jobs')
      if (!response.ok) {
        throw new Error('API-Antwort nicht OK')
      }
      const data = await response.json()
      
      // Prüfe, ob Daten zurückgegeben wurden
      if (!data || data.length === 0) {
        console.log('Keine Jobs in der API gefunden, verwende Dummy-Daten')
        set({ jobs: dummyJobs, isLoading: false })
      } else {
        set({ jobs: data, isLoading: false })
      }
    } catch (error) {
      console.error('Error fetching jobs from API, using dummy data:', error)
      // Fallback zu Dummy-Daten, wenn die API nicht verfügbar ist
      set({ jobs: dummyJobs, isLoading: false })
    }
  },
  createJob: async (jobData) => {
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData)
      })
      const newJob = await response.json()
      set(state => ({ jobs: [...state.jobs, newJob] }))
      return newJob
    } catch (error) {
      console.error('Error creating job:', error)
      throw error
    }
  },

  updateJob: async (id, jobData) => {
    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData)
      })
      const updatedJob = await response.json()
      set(state => ({
        jobs: state.jobs.map(job => 
          job.id === id ? { ...job, ...updatedJob } : job
        )
      }))
      return updatedJob
    } catch (error) {
      console.error('Error updating job:', error)
      throw error
    }
  },

  deleteJob: async (id) => {
    try {
      await fetch(`/api/jobs/${id}`, { method: 'DELETE' })
      set(state => ({
        jobs: state.jobs.filter(job => job.id !== id)
      }))
    } catch (error) {
      console.error('Error deleting job:', error)
      throw error
    }
  },

  getJobById: async (id) => {
    try {
      const response = await fetch(`/api/jobs/${id}`)
      if (!response.ok) {
        throw new Error('API-Antwort nicht OK')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching job from API, checking dummy data:', error)
      // Fallback zu Dummy-Daten, wenn die API nicht verfügbar ist
      const dummyJob = dummyJobs.find(job => job.id === id)
      return dummyJob || null
    }
  }
}))
