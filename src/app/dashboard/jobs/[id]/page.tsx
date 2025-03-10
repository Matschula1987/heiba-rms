'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useJobStore } from '@/store/jobStore'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Job } from '@/types'
import JobFormModalEnhanced from '@/components/modals/JobFormModalEnhanced'
import { 
  ArrowLeft, Edit, Trash2, Globe, Send, Clock, Calendar, MapPin, 
  Building, Briefcase, User, Tag, CheckCircle, XCircle, Plus
} from 'lucide-react'

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { getJobById, deleteJob } = useJobStore()
  const id = params.id as string
  
  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('details')
  
  // Demo: Veröffentlichungsplattformen
  const platforms = [
    { id: 'company_website', name: 'Firmenwebsite', status: 'published', url: '#', date: '01.03.2025' },
    { id: 'indeed', name: 'Indeed', status: 'published', url: '#', date: '01.03.2025' },
    { id: 'stepstone', name: 'StepStone', status: 'pending', url: null, date: null },
    { id: 'arbeitsagentur', name: 'Agentur für Arbeit', status: 'failed', url: null, date: null },
  ]
  
  // Demo: Aktivitätshistorie
  const activities = [
    { id: 1, type: 'create', user: 'Admin', date: '01.03.2025', description: 'Stelle wurde erstellt' },
    { id: 2, type: 'update', user: 'Admin', date: '02.03.2025', description: 'Beschreibung wurde aktualisiert' },
    { id: 3, type: 'publish', user: 'System', date: '02.03.2025', description: 'Veröffentlicht auf Indeed' },
    { id: 4, type: 'publish', user: 'System', date: '02.03.2025', description: 'Veröffentlicht auf Firmenwebsite' },
    { id: 5, type: 'error', user: 'System', date: '02.03.2025', description: 'Fehler bei Veröffentlichung auf Arbeitsagentur: API-Fehler' },
  ]
  
  // Demo: Bewerbungen
  const applications = [
    { id: 1, name: 'Max Mustermann', date: '03.03.2025', status: 'new', score: 85 },
    { id: 2, name: 'Anna Schmidt', date: '04.03.2025', status: 'review', score: 92 },
    { id: 3, name: 'John Doe', date: '04.03.2025', status: 'interview', score: 78 },
  ]

  // Lade Job-Daten
  useEffect(() => {
    const loadJob = async () => {
      setIsLoading(true)
      try {
        const jobData = await getJobById(id)
        if (jobData) {
          setJob(jobData)
        } else {
          setIsError(true)
        }
      } catch (error) {
        console.error('Error loading job details:', error)
        setIsError(true)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadJob()
  }, [id, getJobById])
  
  // Handle Job löschen
  const handleDeleteJob = async () => {
    if (!job) return
    
    if (window.confirm('Sind Sie sicher, dass Sie diese Stelle löschen möchten?')) {
      try {
        await deleteJob(job.id)
        router.push('/dashboard/jobs')
      } catch (error) {
        console.error('Error deleting job:', error)
        alert('Fehler beim Löschen der Stelle')
      }
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-heiba-blue">Lade Stellendetails...</div>
      </div>
    )
  }
  
  if (isError || !job) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4">
        <div className="text-red-500 text-lg">Stelle konnte nicht gefunden werden</div>
        <Button onClick={() => router.push('/dashboard/jobs')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zur Übersicht
        </Button>
      </div>
    )
  }

  // Statusfarbe für Veröffentlichungsstatus
  const getPlatformStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  // Statusfarbe für Bewerbungsstatus
  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'review': return 'bg-yellow-100 text-yellow-800'
      case 'interview': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  // Aktivitätstyp-Icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'create': return <Plus className="h-4 w-4 text-blue-500" />
      case 'update': return <Edit className="h-4 w-4 text-yellow-500" />
      case 'publish': return <Send className="h-4 w-4 text-green-500" />
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header mit Aktionen */}
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push('/dashboard/jobs')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Zurück
          </Button>
          
          <h1 className="text-2xl font-bold text-heiba-blue flex-1">{job.title}</h1>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Bearbeiten
            </Button>
            <Button 
              variant="outline" 
              className="text-red-500 hover:text-red-700 hover:border-red-300"
              onClick={handleDeleteJob}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Löschen
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-2">
          <div className="flex items-center">
            <Building className="h-4 w-4 mr-1" />
            {job.company}
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            {job.location}
          </div>
          <div className="flex items-center">
            <Briefcase className="h-4 w-4 mr-1" />
            {job.job_type}
          </div>
          {job.department && (
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              {job.department}
            </div>
          )}
          {job.salary_range && (
            <div className="flex items-center">
              <Tag className="h-4 w-4 mr-1" />
              {job.salary_range}
            </div>
          )}
          <div className={`flex items-center ml-auto px-2 py-0.5 rounded-md ${
            job.status === 'active' ? 'bg-green-100 text-green-800' : 
            job.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
            job.status === 'inactive' ? 'bg-gray-100 text-gray-800' : 
            'bg-red-100 text-red-800'
          }`}>
            {job.status === 'active' ? (
              <CheckCircle className="h-3 w-3 mr-1" />
            ) : (
              <XCircle className="h-3 w-3 mr-1" />
            )}
            {job.status === 'active' ? 'Aktiv' : 
             job.status === 'draft' ? 'Entwurf' : 
             job.status === 'inactive' ? 'Inaktiv' : 'Archiviert'}
          </div>
        </div>
      </div>
      
      {/* Tab-Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-4 mb-8">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="publishing">Veröffentlichung</TabsTrigger>
          <TabsTrigger value="applications">Bewerbungen</TabsTrigger>
          <TabsTrigger value="activity">Aktivität</TabsTrigger>
        </TabsList>
        
        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          {/* Beschreibung mit Rich Text */}
          <div className="bg-white rounded-lg border p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-heiba-blue">Stellenbeschreibung</h2>
            
            {job.rich_description ? (
              <div 
                className="prose prose-sm max-w-none" 
                dangerouslySetInnerHTML={{ __html: job.rich_description }}
              />
            ) : (
              <div className="whitespace-pre-wrap">{job.description}</div>
            )}
          </div>
          
          {/* Zusätzliche Informationen */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Anforderungen */}
            <div className="bg-white rounded-lg border p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 text-heiba-blue">Anforderungen</h2>
              {job.requirements ? (
                <div className="whitespace-pre-wrap">{job.requirements}</div>
              ) : (
                <p className="text-gray-500 italic">Keine Anforderungen angegeben</p>
              )}
            </div>
            
            {/* Vorteile/Benefits */}
            <div className="bg-white rounded-lg border p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 text-heiba-blue">Benefits</h2>
              {job.benefits ? (
                <div 
                  className="prose prose-sm max-w-none" 
                  dangerouslySetInnerHTML={{ __html: job.benefits || '<p>Keine Benefits angegeben</p>' }}
                />
              ) : (
                <p className="text-gray-500 italic">Keine Benefits angegeben</p>
              )}
            </div>
            
            {/* Keywords und zusätzliche Meta-Daten */}
            <div className="bg-white rounded-lg border p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 text-heiba-blue">Keywords & Metadaten</h2>
              {job.keywords ? (
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.keywords.split(',').map((keyword, index) => (
                    <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm">
                      {keyword.trim()}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic mb-4">Keine Keywords angegeben</p>
              )}
              
              <div className="border-t pt-4 mt-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-500">Erstellt am:</div>
                  <div>{new Date(job.created_at).toLocaleDateString('de-DE')}</div>
                  <div className="text-gray-500">Aktualisiert am:</div>
                  <div>{new Date(job.updated_at).toLocaleDateString('de-DE')}</div>
                  {job.external_job_id && (
                    <>
                      <div className="text-gray-500">Externe Job-ID:</div>
                      <div>{job.external_job_id}</div>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Interne Notizen */}
            <div className="bg-white rounded-lg border p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 text-heiba-blue">Interne Notizen</h2>
              {job.internal_notes ? (
                <div className="whitespace-pre-wrap">{job.internal_notes}</div>
              ) : (
                <p className="text-gray-500 italic">Keine internen Notizen</p>
              )}
            </div>
          </div>
        </TabsContent>
        
        {/* Veröffentlichungs-Tab */}
        <TabsContent value="publishing" className="space-y-6">
          <div className="bg-white rounded-lg border p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-heiba-blue">Veröffentlichungsplattformen</h2>
              <Button size="sm" className="bg-heiba-gold text-white hover:bg-[#C19B20]">
                <Plus className="h-4 w-4 mr-1" />
                Neue Plattform
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 font-medium">Plattform</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Veröffentlicht am</th>
                    <th className="px-4 py-3 font-medium">URL</th>
                    <th className="px-4 py-3 font-medium">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {platforms.map(platform => (
                    <tr key={platform.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{platform.name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-md text-xs ${getPlatformStatusColor(platform.status)}`}>
                          {platform.status === 'published' ? 'Veröffentlicht' : 
                           platform.status === 'pending' ? 'In Bearbeitung' : 
                           platform.status === 'failed' ? 'Fehler' : 'Entwurf'}
                        </span>
                      </td>
                      <td className="px-4 py-3">{platform.date || '-'}</td>
                      <td className="px-4 py-3">
                        {platform.url ? (
                          <a href={platform.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                            <Globe className="h-4 w-4 mr-1" />
                            Öffnen
                          </a>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <Button size="sm" variant="outline" className="h-8">
                          {platform.status === 'published' ? 'Aktualisieren' : 'Veröffentlichen'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Veröffentlichungszeitraum */}
            <div className="bg-white rounded-lg border p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 text-heiba-blue">Veröffentlichungszeitraum</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Startdatum</p>
                  <p className="font-medium">
                    {job.publication_start_date ? 
                      new Date(job.publication_start_date).toLocaleDateString('de-DE') : 
                      'Nicht festgelegt'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Enddatum</p>
                  <p className="font-medium">
                    {job.publication_end_date ? 
                      new Date(job.publication_end_date).toLocaleDateString('de-DE') : 
                      'Nicht festgelegt'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Neu-Veröffentlichungszyklus</p>
                  <p className="font-medium">{job.republish_cycle || 30} Tage</p>
                </div>
              </div>
            </div>
            
            {/* Veröffentlichungsstatistiken */}
            <div className="bg-white rounded-lg border p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 text-heiba-blue">Statistiken</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-gray-500 text-sm">Aufrufe gesamt</p>
                  <p className="text-2xl font-semibold">142</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-gray-500 text-sm">Bewerbungen</p>
                  <p className="text-2xl font-semibold">9</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-gray-500 text-sm">Konversionsrate</p>
                  <p className="text-2xl font-semibold">6.3%</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-gray-500 text-sm">Durchschn. Verweildauer</p>
                  <p className="text-2xl font-semibold">2:15</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Bewerbungen-Tab */}
        <TabsContent value="applications" className="space-y-6">
          <div className="bg-white rounded-lg border p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-heiba-blue">Bewerbungen ({applications.length})</h2>
              <Button size="sm" className="bg-heiba-blue text-white hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-1" />
                Bewerbung hinzufügen
              </Button>
            </div>
            
            {applications.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Eingangsdatum</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Match-Score</th>
                      <th className="px-4 py-3 font-medium">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {applications.map(app => (
                      <tr key={app.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{app.name}</td>
                        <td className="px-4 py-3">{app.date}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-md text-xs ${getApplicationStatusColor(app.status)}`}>
                            {app.status === 'new' ? 'Neu' : 
                             app.status === 'review' ? 'In Prüfung' : 
                             app.status === 'interview' ? 'Interview' : 'Abgelehnt'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                              <div 
                                className={`h-2.5 rounded-full ${
                                  app.score >= 90 ? 'bg-green-500' : 
                                  app.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${app.score}%` }}
                              ></div>
                            </div>
                            <span>{app.score}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Button size="sm" variant="outline" className="h-8">
                            Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Noch keine Bewerbungen für diese Stelle</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Aktivitäts-Tab */}
        <TabsContent value="activity" className="space-y-6">
          <div className="bg-white rounded-lg border p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-6 text-heiba-blue">Aktivitätshistorie</h2>
            
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={activity.id} className="relative pl-6">
                  {/* Verbindungslinie zwischen Aktivitäten */}
                  {index < activities.length - 1 && (
                    <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-gray-200"></div>
                  )}
                  
                  {/* Aktivitätspunkt */}
                  <div className="absolute left-0 top-0.5 w-5 h-5 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  {/* Aktivitätsinhalt */}
                  <div className="pb-5">
                    <div className="flex items-center text-sm mb-1">
                      <span className="font-medium">{activity.user}</span>
                      <span className="mx-2">•</span>
                      <span className="text-gray-500">{activity.date}</span>
                    </div>
                    <p className="text-gray-800">{activity.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Edit Modal */}
      {isEditModalOpen && (
        <JobFormModalEnhanced
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          initialData={job}
        />
      )}
    </div>
  )
}
