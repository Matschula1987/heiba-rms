'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useJobStore } from '@/store/jobStore'
import { Button } from "@/components/ui/button"
import JobList from '@/components/jobs/JobList'
import JobFormModalEnhanced from '@/components/modals/JobFormModalEnhanced'
import JobDatabaseMigrationButton from '@/components/jobs/JobDatabaseMigrationButton'
import { Plus } from 'lucide-react'

export default function JobsPage() {
  const router = useRouter()
  const { jobs, fetchJobs, isLoading } = useJobStore()
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const filteredJobs = jobs.filter(job => {
    const matchesFilter = filter === 'all' || job.status === filter
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const handleJobClick = (jobId: string) => {
    router.push(`/dashboard/jobs/${jobId}`)
  }

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="text-heiba-blue">Loading...</div>
    </div>
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-heiba-blue">Stellenanzeigen</h1>
          <p className="text-gray-600">Verwalten Sie Ihre Stellenanzeigen</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 pl-10 rounded-lg border focus:outline-none focus:ring-2 focus:ring-heiba-blue/20"
            />
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 font-medium shadow-md"
          >
            <Plus className="mr-2 h-4 w-4" />
            Neue Stelle
          </Button>
        </div>
      </div>

      {/* Datenbank-Migrations-Button und Filter Tabs */}
      <div className="flex justify-between mb-6">
        <div className="flex space-x-4">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            Alle
          </Button>
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            onClick={() => setFilter('active')}
          >
            Aktiv
          </Button>
          <Button
            variant={filter === 'draft' ? 'default' : 'outline'}
            onClick={() => setFilter('draft')}
          >
            Entwürfe
          </Button>
        </div>
        
        <JobDatabaseMigrationButton />
      </div>

      {/* JobList */}
      <JobList jobs={filteredJobs} onJobClick={handleJobClick} />

      {/* Modal für neue Stelle (erweiterte Version) */}
      <JobFormModalEnhanced
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
