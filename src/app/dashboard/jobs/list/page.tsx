'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Download, UploadCloud, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FilterBar } from '@/components/ui/FilterBar'
import { JobFilterInputs, countActiveJobFilters } from '@/components/jobs/JobFilterPanel'
import { useFilterStore } from '@/store/filterStore'
import { useNotificationStore } from '@/store/notificationStore'
import { Job } from '@/types'
import { applyFilterToQuery } from '@/lib/filterService'
import JobFormModalEnhanced from '@/components/modals/JobFormModalEnhanced'

/**
 * Joblistenseite mit Filterung und gespeicherten Filtern
 */
export default function JobListPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNewJobModal, setShowNewJobModal] = useState(false)
  const [totalJobs, setTotalJobs] = useState(0)
  
  // Filter-Zustände
  const { currentJobFilter } = useFilterStore()
  const { createNotification } = useNotificationStore()
  
  // Mock-Benutzer-ID (in echter Anwendung aus Auth-Session holen)
  const currentUserId = 'admin'
  
  // Jobs laden
  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // Filter anwenden
        const baseQuery = `SELECT * FROM jobs`
        const { query, params } = applyFilterToQuery(baseQuery, currentJobFilter, 'job')
        
        // Diese Zeile ist nur ein Platzhalter, in einem echten System würde hier
        // die API mit den generierten Filtern aufgerufen werden
        console.log('Generated SQL query:', query, params)
        
        // Simulierte API-Anfrage
        const response = await fetch('/api/jobs?' + new URLSearchParams({
          searchText: currentJobFilter.searchText || '',
          page: (currentJobFilter.page || 0).toString(),
          pageSize: (currentJobFilter.pageSize || 20).toString(),
          sortBy: currentJobFilter.sortBy || 'created_at',
          sortDirection: currentJobFilter.sortDirection || 'desc',
          // In einer echten App würden auch die anderen Filter übermittelt
        }))
        
        if (!response.ok) {
          throw new Error('Fehler beim Laden der Jobs')
        }
        
        const data = await response.json()
        
        if (data.success) {
          setJobs(data.jobs || [])
          setTotalJobs(data.total || data.jobs.length)
        } else {
          throw new Error(data.error || 'Fehler beim Laden der Jobs')
        }
      } catch (err) {
        console.error('Fehler beim Laden der Jobs:', err)
        setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchJobs()
  }, [currentJobFilter])
  
  // Modal zum Erstellen eines neuen Jobs schließen und Benachrichtigung anzeigen
  const handleJobCreated = () => {
    setShowNewJobModal(false)
    
    // Benachrichtigung erstellen
    createNotification({
      user_id: currentUserId,
      title: 'Neue Stelle erstellt',
      message: 'Die Stelle wurde erfolgreich erstellt.',
      entity_type: 'job',
      importance: 'low'
    })
    
    // Liste neu laden
    // In einer echten App würde hier die Liste der Jobs aktualisiert werden
  }
  
  // Anzahl der aktiven Filter berechnen
  const activeFiltersCount = countActiveJobFilters(currentJobFilter)
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Stellenübersicht</h1>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <UploadCloud className="h-4 w-4" />
            Import
          </Button>
          <Button
            onClick={() => setShowNewJobModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Neue Stelle
          </Button>
        </div>
      </div>
      
      {/* Filterleiste */}
      <FilterBar
        entityType="job"
        userId={currentUserId}
        renderFilterInputs={JobFilterInputs}
        activeFiltersCount={activeFiltersCount}
      />
      
      {/* Fehleranzeige */}
      {error && (
        <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <p>{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => useFilterStore.getState().resetJobFilter()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Filter zurücksetzen und erneut versuchen
          </Button>
        </div>
      )}
      
      {/* Ladeanzeige */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Jobs gefunden</h3>
          <p className="text-gray-600 mb-4">
            Es wurden keine Jobs gefunden, die den aktuellen Filterkriterien entsprechen.
          </p>
          <Button 
            variant="outline" 
            onClick={() => useFilterStore.getState().resetJobFilter()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Filter zurücksetzen
          </Button>
        </div>
      ) : (
        <div>
          {/* Anzahl der gefundenen Jobs */}
          <p className="text-sm text-gray-500 mb-4">
            {totalJobs} {totalJobs === 1 ? 'Stelle' : 'Stellen'} gefunden
          </p>
          
          {/* Job-Liste */}
          <div className="bg-white overflow-hidden border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Titel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unternehmen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Standort
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Erstellt am
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobs.map(job => (
                  <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link 
                        href={`/dashboard/jobs/${job.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {job.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {job.company}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {job.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        job.status === 'active' ? 'bg-green-100 text-green-800' :
                        job.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                        job.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {job.status === 'active' ? 'Aktiv' :
                         job.status === 'inactive' ? 'Inaktiv' :
                         job.status === 'draft' ? 'Entwurf' :
                         'Archiviert'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(job.created_at).toLocaleDateString('de-DE')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/dashboard/jobs/${job.id}/edit`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Bearbeiten
                      </Link>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => {
                          // In einer echten App würde hier ein Bestätigungsdialog angezeigt werden
                          console.log('Lösche Job:', job.id)
                        }}
                      >
                        Löschen
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Paginierung */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Seite {(currentJobFilter.page || 0) + 1} von{' '}
              {Math.ceil(totalJobs / (currentJobFilter.pageSize || 20))}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentJobFilter.page === 0}
                onClick={() => useFilterStore.getState().updateJobFilter({
                  page: Math.max(0, (currentJobFilter.page || 0) - 1)
                })}
              >
                Zurück
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={(currentJobFilter.page || 0) + 1 >= Math.ceil(totalJobs / (currentJobFilter.pageSize || 20))}
                onClick={() => useFilterStore.getState().updateJobFilter({
                  page: (currentJobFilter.page || 0) + 1
                })}
              >
                Weiter
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal für neue Stelle */}
      {showNewJobModal && (
        <JobFormModalEnhanced
          isOpen={showNewJobModal}
          onClose={() => setShowNewJobModal(false)}
        />
      )}
    </div>
  )
}
