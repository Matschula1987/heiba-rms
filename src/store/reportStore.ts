import { create } from 'zustand'
import { api } from '@/lib/api'

export interface ReportMetrics {
  totalApplications: number
  activeJobs: number
  averageMatchScore: number
  conversionRate: number
  timeToHire: number
  applicationsByStatus: {
    new: number
    in_review: number
    interview: number
    offer: number
    rejected: number
  }
  applicationsByMonth: {
    month: string
    count: number
  }[]
  jobPerformance: {
    jobId: string
    jobTitle: string
    applications: number
    interviews: number
    offers: number
  }[]
  locationDistribution: {
    location: string
    count: number
  }[]
}

interface ReportState {
  metrics: ReportMetrics
  startDate: Date
  endDate: Date
  isLoading: boolean
  error: string | null
  fetchMetrics: (startDate?: Date, endDate?: Date) => Promise<void>
  setDateRange: (startDate: Date, endDate: Date) => void
  setMetrics: (metrics: ReportMetrics) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

// Beispieldaten
const initialMetrics: ReportMetrics = {
  totalApplications: 156,
  activeJobs: 18,
  averageMatchScore: 72,
  conversionRate: 15.4,
  timeToHire: 28,
  applicationsByStatus: {
    new: 45,
    in_review: 38,
    interview: 28,
    offer: 12,
    rejected: 33
  },
  applicationsByMonth: [
    { month: 'Jan', count: 12 },
    { month: 'Feb', count: 18 },
    { month: 'Mär', count: 24 },
    { month: 'Apr', count: 15 },
    { month: 'Mai', count: 22 },
    { month: 'Jun', count: 28 }
  ],
  jobPerformance: [
    {
      jobId: '1',
      jobTitle: 'Senior Software Engineer',
      applications: 45,
      interviews: 12,
      offers: 3
    },
    {
      jobId: '2',
      jobTitle: 'Marketing Manager',
      applications: 32,
      interviews: 8,
      offers: 2
    }
  ],
  locationDistribution: [
    { location: 'München', count: 48 },
    { location: 'Berlin', count: 35 },
    { location: 'Hamburg', count: 28 },
    { location: 'Frankfurt', count: 25 },
    { location: 'Köln', count: 20 }
  ]
}

export const useReportStore = create<ReportState>((set) => ({
  metrics: initialMetrics,
  startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)), // Letzter Monat
  endDate: new Date(),
  isLoading: false,
  error: null,
  fetchMetrics: async (startDate?: Date, endDate?: Date) => {
    set({ isLoading: true, error: null })
    try {
      // Hier würden wir die API mit den Datumswerten aufrufen
      const metrics = await api.reports.getMetrics(startDate, endDate)
      set({ metrics })
    } catch (error) {
      set({ error: 'Failed to fetch metrics' })
    } finally {
      set({ isLoading: false })
    }
  },
  setDateRange: (startDate: Date, endDate: Date) => {
    set({ startDate, endDate })
    // Automatisch neue Daten laden
    set((state) => {
      state.fetchMetrics(startDate, endDate)
      return state
    })
  },
  setMetrics: (metrics) => set({ metrics }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}))