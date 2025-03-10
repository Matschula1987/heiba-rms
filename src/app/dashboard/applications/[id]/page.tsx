'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Calendar, 
  Check, 
  Clock, 
  FileText, 
  Mail, 
  MapPin,
  Phone, 
  User, 
  Users, 
  X,
  BarChart3,
  MessageCircle,
  History
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ApplicationExtended, ApplicationMatchData } from '@/types/applications'

// Status-Icons und Farben für Bewerbungsstatus
const statusConfig: Record<string, { icon: React.ReactNode, color: string, label: string }> = {
  new: { 
    icon: <Clock className="w-4 h-4" />, 
    color: 'bg-blue-100 text-blue-800 border-blue-200', 
    label: 'Neu'
  },
  in_review: { 
    icon: <FileText className="w-4 h-4" />, 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
    label: 'In Bearbeitung'
  },
  interview: { 
    icon: <Users className="w-4 h-4" />, 
    color: 'bg-purple-100 text-purple-800 border-purple-200', 
    label: 'Im Interview'
  },
  accepted: { 
    icon: <Check className="w-4 h-4" />, 
    color: 'bg-green-100 text-green-800 border-green-200', 
    label: 'Angenommen' 
  },
  rejected: { 
    icon: <X className="w-4 h-4" />, 
    color: 'bg-red-100 text-red-800 border-red-200', 
    label: 'Abgelehnt'
  },
  archived: { 
    icon: <FileText className="w-4 h-4" />, 
    color: 'bg-gray-100 text-gray-800 border-gray-200', 
    label: 'Archiviert'
  }
}

// Quellen-Badges
const sourceConfig: Record<string, { color: string, label: string }> = {
  email: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'E-Mail' },
  portal: { color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Jobportal' },
  website: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Website' },
  direct: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Direkt' },
  referral: { color: 'bg-indigo-100 text-indigo-800 border-indigo-200', label: 'Empfehlung' },
  agency: { color: 'bg-pink-100 text-pink-800 border-pink-200', label: 'Agentur' },
  other: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Andere' }
}

// Formatiert das Datum für bessere Lesbarkeit
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

// Komponente zum Anzeigen eines Kategorie-Match-Scores mit Fortschrittsbalken
const ScoreBar = ({
  label,
  score,
  color = "bg-blue-500"
}: {
  label: string;
  score: number;
  color?: string;
}) => (
  <div className="mb-3">
    <div className="flex justify-between text-sm mb-1">
      <span>{label}</span>
      <span>{Math.round(score)}%</span>
    </div>
    <div className="bg-gray-200 rounded-full h-2">
      <div 
        className={`rounded-full h-2 ${color}`} 
        style={{ width: `${score}%` }}
      ></div>
    </div>
  </div>
);

export default function ApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [application, setApplication] = useState<ApplicationExtended | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  
  const id = params.id as string
  
  // Bewerbung laden
  useEffect(() => {
    const fetchApplication = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/applications/${id}`)
        
        if (!response.ok) {
          throw new Error(`Fehler beim Laden der Bewerbung: ${response.statusText}`)
        }
        
        const data = await response.json()
        setApplication(data.application)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unbekannter Fehler beim Laden der Bewerbung')
        console.error('Fehler beim Laden der Bewerbung:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchApplication()
  }, [id])
  
  // Bewerbungsstatus ändern
  const changeStatus = async (status: string) => {
    try {
      const response = await fetch(`/api/applications/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          changed_by: 'admin', // TODO: Aus Auth-Kontext holen
          reason: ''
        })
      })
      
      if (!response.ok) {
        throw new Error(`Fehler beim Ändern des Status: ${response.statusText}`)
      }
      
      const data = await response.json()
      setApplication(data.application)
    } catch (err) {
      console.error('Fehler beim Ändern des Status:', err)
      // TODO: Fehlermeldung anzeigen
    }
  }
  
  // Bewerbung in Kandidat konvertieren
  const convertToCandidate = async () => {
    try {
      const response = await fetch(`/api/applications/${id}/convert-to-candidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: 'admin' // TODO: Aus Auth-Kontext holen
        })
      })
      
      if (!response.ok) {
        throw new Error(`Fehler bei der Konvertierung: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // Erfolg-Hinweis anzeigen und zur Kandidatenseite navigieren
      router.push(`/dashboard/candidates/${data.candidateId}`)
    } catch (err) {
      console.error('Fehler bei der Konvertierung zum Kandidaten:', err)
      // TODO: Fehlermeldung anzeigen
    }
  }
  
  // Match-Score neu berechnen
  const recalculateMatch = async () => {
    try {
      const response = await fetch(`/api/applications/${id}/calculate-match`, {
        method: 'POST'
      })
      
      if (!response.ok) {
        throw new Error(`Fehler bei der Neuberechnung: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // Application mit aktualisierten Matching-Daten neu laden
      const appResponse = await fetch(`/api/applications/${id}`)
      if (appResponse.ok) {
        const appData = await appResponse.json()
        setApplication(appData.application)
      }
    } catch (err) {
      console.error('Fehler bei der Neuberechnung des Match-Scores:', err)
      // TODO: Fehlermeldung anzeigen
    }
  }
  
  // Notiz hinzufügen
  const addNote = async (content: string) => {
    try {
      const response = await fetch(`/api/applications/${id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: 'admin', // TODO: Aus Auth-Kontext holen
          content
        })
      })
      
      if (!response.ok) {
        throw new Error(`Fehler beim Hinzufügen der Notiz: ${response.statusText}`)
      }
      
      // Bewerbung neu laden um neue Notiz anzuzeigen
      const appResponse = await fetch(`/api/applications/${id}`)
      if (appResponse.ok) {
        const appData = await appResponse.json()
        setApplication(appData.application)
      }
    } catch (err) {
      console.error('Fehler beim Hinzufügen der Notiz:', err)
      // TODO: Fehlermeldung anzeigen
    }
  }
  
  // Parse match_data um die richtige Typensicherheit zu gewährleisten
  const parseMatchData = (matchData: string | ApplicationMatchData | undefined): ApplicationMatchData | null => {
    if (!matchData) return null
    
    if (typeof matchData === 'string') {
      try {
        return JSON.parse(matchData) as ApplicationMatchData
      } catch (e) {
        console.error('Fehler beim Parsen der Match-Daten:', e)
        return null
      }
    }
    
    return matchData
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#002451]"></div>
      </div>
    )
  }
  
  if (error || !application) {
    return (
      <div className="bg-white rounded-lg shadow p-8 mt-4 text-center">
        <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Bewerbung nicht gefunden</h2>
        <p className="text-gray-600 mb-6">{error || 'Die angeforderte Bewerbung konnte nicht gefunden werden.'}</p>
        <Button onClick={() => router.push('/dashboard/applications')}>
          Zurück zur Übersicht
        </Button>
      </div>
    )
  }
  
  const matchData = parseMatchData(application.match_data)
  
  return (
    <div className="container mx-auto">
      {/* Header mit Zurück-Button und Status */}
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/applications')}
          className="flex items-center text-gray-600"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zur Übersicht
        </Button>
        
        <div className="flex items-center space-x-3">
          <Badge className={statusConfig[application.status].color}>
            {statusConfig[application.status].icon}
            <span className="ml-1">{statusConfig[application.status].label}</span>
          </Badge>
          
          <div className="relative">
            <Button onClick={() => {}}>Status ändern</Button>
            {/* TODO: Status-Dropdown-Menü hinzufügen */}
          </div>
          
          <Button 
            variant="default" 
            onClick={convertToCandidate}
          >
            In Kandidat konvertieren
          </Button>
        </div>
      </div>
      
      {/* Bewerber-Headerinfo */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold mb-2">{application.applicant_name}</h1>
            <div className="flex flex-col space-y-1 text-gray-600">
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                <span>{application.applicant_email}</span>
              </div>
              
              {application.applicant_phone && (
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>{application.applicant_phone}</span>
                </div>
              )}
              
              {application.applicant_location && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{application.applicant_location}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="text-right mb-2">
              <div className="flex items-center justify-end">
                <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                <span className="text-sm text-gray-600">Bewerbung vom {formatDate(application.created_at)}</span>
              </div>
              
              <div className="flex items-center justify-end mt-1">
                <Badge variant="outline" className={sourceConfig[application.source].color}>
                  {sourceConfig[application.source].label}
                </Badge>
                {application.source_detail && (
                  <span className="ml-2 text-sm text-gray-500">{application.source_detail}</span>
                )}
              </div>
            </div>
            
            {application.job && (
              <div className="border rounded p-3 bg-gray-50 max-w-xs">
                <div className="font-medium">{application.job.title}</div>
                <div className="text-sm text-gray-600">{application.job.company}</div>
                {application.job.location && (
                  <div className="text-xs text-gray-500 mt-1">{application.job.location}</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Tabs für Details */}
      <div className="bg-white rounded-lg shadow mb-6">
        <Tabs 
          defaultValue="overview"
          className="p-6"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="w-full grid grid-cols-4 mb-6 bg-gray-100">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-[#002451] data-[state=active]:text-white"
            >
              <User className="w-4 h-4 mr-2" />
              Übersicht
            </TabsTrigger>
            <TabsTrigger 
              value="documents" 
              className="data-[state=active]:bg-[#002451] data-[state=active]:text-white"
            >
              <FileText className="w-4 h-4 mr-2" />
              Dokumente
            </TabsTrigger>
            <TabsTrigger 
              value="matching" 
              className="data-[state=active]:bg-[#002451] data-[state=active]:text-white"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Match-Analyse
            </TabsTrigger>
            <TabsTrigger 
              value="communication" 
              className="data-[state=active]:bg-[#002451] data-[state=active]:text-white"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Kommunikation
            </TabsTrigger>
          </TabsList>
          
          {/* Übersichts-Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bewerbungsdaten */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Bewerberdaten</h3>
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <div className="grid grid-cols-3 gap-y-2">
                      <div className="text-gray-600">Name:</div>
                      <div className="col-span-2 font-medium">{application.applicant_name}</div>
                      
                      <div className="text-gray-600">E-Mail:</div>
                      <div className="col-span-2">{application.applicant_email}</div>
                      
                      {application.applicant_phone && (
                        <>
                          <div className="text-gray-600">Telefon:</div>
                          <div className="col-span-2">{application.applicant_phone}</div>
                        </>
                      )}
                      
                      {application.applicant_location && (
                        <>
                          <div className="text-gray-600">Ort:</div>
                          <div className="col-span-2">{application.applicant_location}</div>
                        </>
                      )}
                      
                      <div className="text-gray-600">Status:</div>
                      <div className="col-span-2">
                        <Badge className={statusConfig[application.status].color}>
                          {statusConfig[application.status].label}
                        </Badge>
                      </div>
                      
                      {application.status_changed_at && (
                        <>
                          <div className="text-gray-600">Status seit:</div>
                          <div className="col-span-2">{formatDate(application.status_changed_at)}</div>
                        </>
                      )}
                      
                      <div className="text-gray-600">Quelle:</div>
                      <div className="col-span-2">
                        <Badge className={sourceConfig[application.source].color}>
                          {sourceConfig[application.source].label}
                        </Badge>
                        {application.source_detail && (
                          <span className="ml-2 text-sm">{application.source_detail}</span>
                        )}
                      </div>
                      
                      <div className="text-gray-600">Eingegangen:</div>
                      <div className="col-span-2">{formatDate(application.created_at)}</div>
                    </div>
                  </div>
                </div>
                
                {/* Anschreiben anzeigen, falls vorhanden */}
                {application.cover_letter && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">Anschreiben</h3>
                    <div className="bg-gray-50 rounded-lg p-4 border">
                      <div className="whitespace-pre-line">{application.cover_letter}</div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Rechte Spalte: Job-Details und Match-Zusammenfassung */}
              <div className="space-y-6">
                {/* Job-Details */}
                {application.job && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">Stelle</h3>
                    <div className="bg-gray-50 rounded-lg p-4 border">
                      <div className="mb-2 font-medium text-lg">{application.job.title}</div>
                      <div className="mb-1">{application.job.company}</div>
                      {application.job.location && (
                        <div className="text-gray-600 mb-4">{application.job.location}</div>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => application.job && router.push(`/dashboard/jobs/${application.job.id}`)}
                      >
                        Stellendetails anzeigen
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Match-Score Zusammenfassung */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium">Match-Score</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={recalculateMatch}
                    >
                      Neu berechnen
                    </Button>
                  </div>
                  
                  {application.match_score !== null && application.match_score !== undefined ? (
                    <div className="bg-gray-50 rounded-lg p-4 border">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="text-3xl font-bold">
                          {Math.round(application.match_score)}%
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${
                              application.match_score >= 80 ? 'bg-green-500' :
                              application.match_score >= 60 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${application.match_score}%` }}
                          />
                        </div>
                      </div>
                      
                      {matchData && matchData.categoryScores && (
                        <div>
                          {matchData.categoryScores.skills !== undefined && (
                            <ScoreBar 
                              label="Skills" 
                              score={matchData.categoryScores.skills} 
                              color="bg-blue-500" 
                            />
                          )}
                          
                          {matchData.categoryScores.experience !== undefined && (
                            <ScoreBar 
                              label="Erfahrung" 
                              score={matchData.categoryScores.experience} 
                              color="bg-green-500" 
                            />
                          )}
                          
                          {matchData.categoryScores.location !== undefined && (
                            <ScoreBar 
                              label="Standort" 
                              score={matchData.categoryScores.location} 
                              color="bg-yellow-500" 
                            />
                          )}
                          
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="mt-2 text-[#002451]"
                            onClick={() => setActiveTab('matching')}
                          >
                            Details anzeigen
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 border text-center">
                      <p className="text-gray-500 mb-3">Kein Match-Score vorhanden</p>
                      <Button onClick={recalculateMatch}>
                        Jetzt berechnen
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Dokumente-Tab */}
          <TabsContent value="documents" className="space-y-4">
            <div className="space-y-6">
              {/* Lebenslauf */}
              <div>
                <h3 className="text-lg font-medium mb-3">Lebenslauf</h3>
                {application.has_cv ? (
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="w-8 h-8 text-[#002451] mr-3" />
                        <div>
                          <div className="font-medium">Lebenslauf von {application.applicant_name}</div>
                          <div className="text-sm text-gray-500">{application.cv_file_path}</div>
                        </div>
                      </div>
                      <Button variant="outline">
                        Herunterladen
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6 border text-center">
                    <p className="text-gray-500">Kein Lebenslauf vorhanden</p>
                  </div>
                )}
              </div>
              
              {/* Weitere Dokumente */}
              <div>
                <h3 className="text-lg font-medium mb-3">Weitere Dokumente</h3>
                {application.has_documents && application.documents_paths ? (
                  <div className="space-y-3">
                    {(() => {
                      try {
                        const documents = JSON.parse(application.documents_paths);
                        return documents.map((path: string, index: number) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <FileText className="w-8 h-8 text-[#002451] mr-3" />
                                <div>
                                  <div className="font-medium">Dokument {index + 1}</div>
                                  <div className="text-sm text-gray-500">{path}</div>
                                </div>
                              </div>
                              <Button variant="outline">
                                Herunterladen
                              </Button>
                            </div>
                          </div>
                        ));
                      } catch (e) {
                        return (
                          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                            <p className="text-red-600">Fehler beim Lesen der Dokumentpfade</p>
                          </div>
                        );
                      }
                    })()}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6 border text-center">
                    <p className="text-gray-500">Keine weiteren Dokumente vorhanden</p>
                  </div>
                )}
              </div>
              
              {/* Dokument-Upload-Button (TODO: Implementieren) */}
              <div className="flex justify-end mt-6">
                <Button>
                  <FileText className="w-4 h-4 mr-2" />
                  Dokument hochladen
                </Button>
              </div>
            </div>
          </TabsContent>
          
          {/* Match-Analyse-Tab */}
          <TabsContent value="matching" className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-medium">Match-Score Details</h3>
                <Button 
                  variant="outline"
                  onClick={recalculateMatch}
                >
                  Neu berechnen
                </Button>
              </div>
              
              {application.match_score !== null && application.match_score !== undefined ? (
                <div className="space-y-6">
                  {/* Gesamtscore */}
                  <div className="bg-white border rounded-lg p-6">
                    <div className="flex items-center gap-6 mb-4">
                      <div className="text-4xl font-bold">
                        {Math.round(application.match_score)}%
                      </div>
                      <div className="w-full">
                        <div className="mb-1 text-sm font-medium">Gesamt-Match</div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full ${
                              application.match_score >= 80 ? 'bg-green-500' :
                              application.match_score >= 60 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${application.match_score}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {matchData && matchData.matchDetails && (
                      <div className="text-sm text-gray-700 mt-3">
                        {matchData.matchDetails}
                      </div>
                    )}
                  </div>
                  
                  {/* Kategorie-Scores */}
                  {matchData && matchData.categoryScores && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white border rounded-lg p-6">
                        <h4 className="text-lg font-medium mb-4">Kategorie-Bewertungen</h4>
                        <div className="space-y-5">
                          {matchData.categoryScores.skills !== undefined && (
                            <ScoreBar 
                              label="Skills" 
                              score={matchData.categoryScores.skills} 
                              color="bg-blue-500" 
                            />
                          )}
                          
                          {matchData.categoryScores.experience !== undefined && (
                            <ScoreBar 
                              label="Erfahrung" 
                              score={matchData.categoryScores.experience} 
                              color="bg-green-500" 
                            />
                          )}
                          
                          {matchData.categoryScores.education !== undefined && (
                            <ScoreBar 
                              label="Ausbildung" 
                              score={matchData.categoryScores.education} 
                              color="bg-purple-500" 
                            />
                          )}
                          
                          {matchData.categoryScores.location !== undefined && (
                            <ScoreBar 
                              label="Standort" 
                              score={matchData.categoryScores.location} 
                              color="bg-yellow-500" 
                            />
                          )}
                        </div>
                      </div>
                      
                      {/* Gematchte Skills */}
                      {matchData.matchedSkills && matchData.matchedSkills.length > 0 && (
                        <div className="bg-white border rounded-lg p-6">
                          <h4 className="text-lg font-medium mb-4">Passende Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {matchData.matchedSkills.map((skill, index) => (
                              <Badge 
                                key={index} 
                                className={`
                                  ${skill.score >= 90 ? 'bg-green-100 text-green-800 border-green-200' :
                                    skill.score >= 70 ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                    'bg-yellow-100 text-yellow-800 border-yellow-200'}
                                `}
                              >
                                {skill.skill} ({Math.round(skill.score)}%)
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white border rounded-lg p-6 text-center">
                  <p className="text-gray-500 mb-4">Für diese Bewerbung wurde noch kein Match-Score berechnet.</p>
                  <Button onClick={recalculateMatch}>
                    Match-Score berechnen
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Kommunikations-Tab */}
          <TabsContent value="communication" className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-medium">Kommunikationsverlauf</h3>
                <Button>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Neue Nachricht
                </Button>
              </div>
              
              {/* Kommunikationsverlauf */}
              {application.communication_history ? (
                <div className="space-y-4">
                  {(() => {
                    try {
                      const history = typeof application.communication_history === 'string' 
                        ? JSON.parse(application.communication_history) 
                        : application.communication_history;
                      
                      return history.length > 0 ? (
                        history.map((entry: any, index: number) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                            <div className="flex justify-between mb-2">
                              <div className="font-medium">
                                {entry.type === 'email' 
                                  ? <><Mail className="inline-block w-4 h-4 mr-1" /> E-Mail</>
                                  : entry.type === 'note' 
                                    ? <><FileText className="inline-block w-4 h-4 mr-1" /> Notiz</>
                                    : entry.type
                                }
                              </div>
                              <div className="text-sm text-gray-500">{formatDate(entry.date)}</div>
                            </div>
                            <div className="mb-2">{entry.content}</div>
                            <div className="text-sm text-gray-500">
                              {entry.sender && <span>Von: {entry.sender}</span>}
                              {entry.user && <span>Von: {entry.user}</span>}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-6 border text-center">
                          <p className="text-gray-500">Keine Kommunikation vorhanden</p>
                        </div>
                      );
                    } catch (e) {
                      return (
                        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                          <p className="text-red-600">Fehler beim Lesen des Kommunikationsverlaufs</p>
                        </div>
                      );
                    }
                  })()}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 border text-center">
                  <p className="text-gray-500">Keine Kommunikation vorhanden</p>
                </div>
              )}
              
              {/* Notizen */}
              <div className="mt-6">
                <h4 className="text-lg font-medium mb-3">Notizen</h4>
                
                {application.notes && application.notes.length > 0 ? (
                  <div className="space-y-3">
                    {application.notes.map((note) => (
                      <div key={note.id} className="bg-gray-50 rounded-lg p-4 border">
                        <div className="flex justify-between mb-1">
                          <div className="font-medium">Notiz von {note.user_id}</div>
                          <div className="text-sm text-gray-500">{formatDate(note.created_at)}</div>
                        </div>
                        <div>{note.content}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6 border text-center">
                    <p className="text-gray-500">Keine Notizen vorhanden</p>
                  </div>
                )}
                
                {/* Neue Notiz Form (TODO: Implementieren) */}
                <div className="mt-4">
                  <textarea 
                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#002451]/20"
                    placeholder="Neue Notiz hinzufügen..."
                    rows={3}
                  />
                  <div className="flex justify-end mt-2">
                    <Button>
                      <FileText className="w-4 h-4 mr-2" />
                      Notiz speichern
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
