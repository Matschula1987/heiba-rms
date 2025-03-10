'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import JobFormModalEnhanced from '@/components/modals/JobFormModalEnhanced'
import { JobFormEditingLockWrapper } from '@/components/jobs/JobFormEditingLockWrapper'
import { Job } from '@/types'
import { useNotificationStore } from '@/store/notificationStore'

/**
 * Seite zum Bearbeiten einer Stelle mit integrierter Bearbeitungssperre
 * Diese Seite demonstriert die Verwendung der EditingLockGuard-Komponente
 */
export default function EditJobPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const jobId = params.id
  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { createNotification } = useNotificationStore()
  
  // Mock-Benutzer-ID (in echter Anwendung aus Auth-Session holen)
  const currentUserId = 'admin'
  const currentUserName = 'Administrator'
  
  // Job-Daten laden
  useEffect(() => {
    const fetchJob = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/jobs/${jobId}`)
        
        if (!response.ok) {
          throw new Error('Job konnte nicht geladen werden')
        }
        
        const data = await response.json()
        
        if (data.success) {
          setJob(data.job)
        } else {
          throw new Error(data.error || 'Job konnte nicht geladen werden')
        }
      } catch (err) {
        console.error('Fehler beim Laden des Jobs:', err)
        setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
      } finally {
        setIsLoading(false)
      }
    }
    
    if (jobId) {
      fetchJob()
    }
  }, [jobId])
  
  // Behandlung des erfolgreichen Speicherns
  const handleSaveSuccess = async () => {
    // Erfolgsmeldung als Benachrichtigung
    await createNotification({
      user_id: currentUserId,
      title: 'Stelle gespeichert',
      message: `Die Änderungen an der Stelle "${job?.title || jobId}" wurden erfolgreich gespeichert.`,
      entity_type: 'job',
      entity_id: jobId,
      importance: 'low'
    })
    
    // Zurück zur Job-Übersicht
    router.push('/dashboard/jobs')
  }
  
  // Abbrechen der Bearbeitung
  const handleCancel = () => {
    router.push('/dashboard/jobs')
  }
  
  // Lade-Indikator
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Lade Stellendaten...</div>
  }
  
  // Fehleranzeige
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Fehler beim Laden der Stelle</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button 
          onClick={() => router.push('/dashboard/jobs')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Zurück zur Übersicht
        </button>
      </div>
    )
  }
  
  return (
    <div className="p-4">
      {job && (
        <JobFormEditingLockWrapper
          jobId={jobId}
          userId={currentUserId}
          userName={currentUserName}
        >
          <h1 className="text-2xl font-bold mb-6">Stelle bearbeiten: {job.title}</h1>
          
          <JobFormModalEnhanced 
            isOpen={true}
            onClose={handleCancel}
            initialData={job}
          />
        </JobFormEditingLockWrapper>
      )}
    </div>
  )
}
