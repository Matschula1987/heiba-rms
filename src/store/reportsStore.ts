import { create } from 'zustand'

interface ReportMetrics {
  totalApplications: number
  newApplications: number
  activeJobs: number
  avgTimeToHire: number
  conversionRate: number
  costPerHire: number
}

interface JobStats {
  title: string
  applications: number
  interviews: number
  hired: number
}

interface ReportsState {
  metrics: ReportMetrics
  jobStats: JobStats[]
  dateRange: {
    start: string
    end: string
  }
  isLoading: boolean
  error: string | null
  setDateRange: (start: string, end: string) => void
  fetchReportData: () => Promise<void>
}

export const useReportsStore = create<ReportsState>((set) => ({
  metrics: {
    totalApplications: 156,
    newApplications: 23,
    activeJobs: 12,
    avgTimeToHire: 28,
    conversionRate: 68,
    costPerHire: 850
  },
  jobStats: [
    { title: 'Software Engineer', applications: 45, interviews: 12, hired: 2 },
    { title: 'Product Manager', applications: 32, interviews: 8, hired: 1 },
    { title: 'UX Designer', applications: 28, interviews: 6, hired: 1 },
    { title: 'Sales Manager', applications: 51, interviews: 15, hired: 3 }
  ],
  dateRange: {
    start: '2024-01-16',
    end: '2024-02-16'
  },
  isLoading: false,
  error: null,

  setDateRange: (start, end) => {
    set({ dateRange: { start, end } })
  },

  fetchReportData: async () => {
    set({ isLoading: true, error: null })
    try {
      // Hier würden wir normalerweise die Daten von der API abrufen
      // Für jetzt verwenden wir die Mock-Daten
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simuliere API-Aufruf
      
      // Daten bleiben unverändert, da wir sie bereits im initialen State haben
      set({ isLoading: false })
    } catch (error) {
      set({ error: 'Failed to fetch report data', isLoading: false })
    }
  }
}))