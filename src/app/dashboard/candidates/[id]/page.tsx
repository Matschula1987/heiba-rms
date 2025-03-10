'use client'

import { useState, useEffect } from 'react'
import { PhoneCall, Mail, FileText, Download, X, Check, Clock, MessageSquare } from 'lucide-react'
import { Candidate, CommunicationEntry, Document } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'
import Link from 'next/link'
import { useCandidateStore } from '@/store/candidateStore'
import JobMatchingPanel from '@/components/candidates/JobMatchingPanel'
import CandidateQualificationProfile from '@/components/candidates/CandidateQualificationProfile'
import CandidateRejectionModal from '@/components/candidates/CandidateRejectionModal'

// Format für die Dateigröße
const formatFileSize = (bytes: number) => {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

// Format für das Datum
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('de-DE', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function CandidateDetailPage({ params }: { params: { id: string } }) {
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('profile')
  const [newNote, setNewNote] = useState('')
  const [showRejectionModal, setShowRejectionModal] = useState(false)

  // Zugriff auf den CandidateStore
  const { 
    currentCandidate, 
    fetchCandidate, 
    updateCandidate, 
    isLoading: storeLoading, 
    error: storeError 
  } = useCandidateStore()

  // Lade Kandidatendaten
  useEffect(() => {
    // Setze den initialen Loading-Status
    setLoading(true)
    
    // Lade Kandidaten über den Store
    fetchCandidate(params.id)
      .then(() => {
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message || 'Fehler beim Laden des Kandidaten')
        setLoading(false)
      })
  }, [params.id, fetchCandidate])

  // Synchronisiere lokalen State mit dem Store
  useEffect(() => {
    if (currentCandidate) {
      setCandidate(currentCandidate)
    }
  }, [currentCandidate])

  // Status-Text und Farbe
  const getStatusDetails = (status: string) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      'new': { text: 'Neu', color: 'bg-blue-100 text-blue-800' },
      'in_process': { text: 'In Bearbeitung', color: 'bg-yellow-100 text-yellow-800' },
      'interview': { text: 'Interview', color: 'bg-purple-100 text-purple-800' },
      'hired': { text: 'Vermittelt', color: 'bg-green-100 text-green-800' },
      'rejected': { text: 'Absage', color: 'bg-red-100 text-red-800' },
      'inactive': { text: 'Inaktiv', color: 'bg-gray-100 text-gray-800' },
      'active': { text: 'Aktiv', color: 'bg-green-100 text-green-800' }
    }
    
    return statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800' }
  }

  // Initialen aus dem Namen generieren
  const getInitials = (name: string) => {
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  // Funktion zum Anrufen des Kandidaten
  const handleCall = async () => {
    if (!candidate?.phone) return;
    // In einer echten App würde hier die Telefonie-Integration aufgerufen werden
    alert(`Rufe ${candidate.name} unter ${candidate.phone} an...`)
    
    // Neue Kommunikationshistorie erstellen
    const communicationHistory = candidate.communicationHistory || []
    const newEntry: CommunicationEntry = {
      id: `comm${communicationHistory.length + 1}`,
      type: 'call',
      date: new Date().toISOString(),
      content: 'Anruf getätigt. (Hier würde später eine automatische Zusammenfassung des Gesprächs erscheinen)',
      createdBy: 'Aktueller Benutzer'
    }
    
    // Kandidaten über die API aktualisieren
    if (candidate) {
      const updatedCandidate = {
        ...candidate,
        communicationHistory: [...communicationHistory, newEntry]
      }
      
      try {
        await updateCandidate(candidate.id, updatedCandidate)
        setCandidate(updatedCandidate)
      } catch (error) {
        console.error('Fehler beim Aktualisieren des Kandidaten:', error)
      }
    }
  }

  // Funktion zum Senden einer E-Mail
  const handleSendEmail = () => {
    if (!candidate?.email) return;
    // In einer echten App würde hier das E-Mail-System geöffnet werden
    alert(`E-Mail an ${candidate.name} (${candidate.email}) verfassen...`)
  }

  // Funktion zum Speichern einer neuen Notiz
  const handleSaveNote = async () => {
    if (!newNote.trim() || !candidate) return;
    
    // Neue Kommunikationshistorie erstellen
    const communicationHistory = candidate.communicationHistory || []
    const newEntry: CommunicationEntry = {
      id: `comm${communicationHistory.length + 1}`,
      type: 'note',
      date: new Date().toISOString(),
      content: newNote,
      createdBy: 'Aktueller Benutzer'
    }
    
    // Kandidaten über die API aktualisieren
    try {
      const updatedCandidate = {
        ...candidate,
        communicationHistory: [...communicationHistory, newEntry]
      }
      
      await updateCandidate(candidate.id, updatedCandidate)
      setCandidate(updatedCandidate)
      setNewNote('') // Notizfeld leeren
    } catch (error) {
      console.error('Fehler beim Speichern der Notiz:', error)
    }
  }

  // Funktion zum Öffnen des Absage-Modals
  const handleReject = () => {
    if (!candidate) return;
    setShowRejectionModal(true);
  }

  if (loading || storeLoading) {
    return <div className="flex justify-center items-center h-screen"><p>Lade Kandidatendaten...</p></div>
  }

  if (error || storeError || !candidate) {
    return <div className="text-red-500 p-4">Fehler beim Laden des Kandidaten: {error || storeError || 'Kandidat nicht gefunden'}</div>
  }

  const statusDetails = getStatusDetails(candidate.status)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/dashboard/candidates" className="text-blue-600 hover:underline mb-4 inline-block">
          &larr; Zurück zur Kandidatenliste
        </Link>
      </div>

      {/* Kandidaten-Header mit Aktionen */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          {/* Profil-Header */}
          <div className="flex items-center space-x-4">
            {candidate.profileImage ? (
              <img src={candidate.profileImage} alt={candidate.name} className="w-16 h-16 rounded-full" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#002451] text-white flex items-center justify-center text-xl font-medium">
                {getInitials(candidate.name)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-[#002451]">{candidate.name}</h1>
                <span className={`px-3 py-1 rounded-full text-xs ${statusDetails.color}`}>
                  {statusDetails.text}
                </span>
              </div>
              <p className="text-lg text-gray-600">{candidate.position}</p>
              <div className="flex items-center mt-1 text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                Eintrag vom {formatDate(candidate.createdAt || new Date().toISOString())}
              </div>
            </div>
          </div>

          {/* Aktionsbuttons */}
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={handleCall}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              disabled={!candidate.phone}
            >
              <PhoneCall className="w-4 h-4" />
              <span>Anrufen</span>
            </button>
            
            <button 
              onClick={handleSendEmail}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>E-Mail senden</span>
            </button>
            
            <button 
              onClick={handleReject}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              disabled={candidate.status === 'rejected'}
            >
              <X className="w-4 h-4" />
              <span>Absagen</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'profile'
              ? 'text-[#002451] border-b-2 border-[#002451]'
              : 'text-gray-500 hover:text-[#002451]'
          }`}
        >
          Profil
        </button>
        <button
          onClick={() => setActiveTab('qualificationProfile')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'qualificationProfile'
              ? 'text-[#002451] border-b-2 border-[#002451]'
              : 'text-gray-500 hover:text-[#002451]'
          }`}
        >
          Qualifikationsprofil
        </button>
        <button
          onClick={() => setActiveTab('communication')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'communication'
              ? 'text-[#002451] border-b-2 border-[#002451]'
              : 'text-gray-500 hover:text-[#002451]'
          }`}
        >
          Gesprächshistorie
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'documents'
              ? 'text-[#002451] border-b-2 border-[#002451]'
              : 'text-gray-500 hover:text-[#002451]'
          }`}
        >
          Dokumente
        </button>
      </div>

      {/* Tab-Inhalte */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        {/* Profil-Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Persönliche Informationen */}
              <div>
                <h3 className="text-lg font-medium text-[#002451] mb-4">Kontaktinformationen</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{candidate.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">E-Mail</p>
                    <p className="font-medium">{candidate.email}</p>
                  </div>
                  {candidate.phone && (
                    <div>
                      <p className="text-sm text-gray-500">Telefon</p>
                      <p className="font-medium">{candidate.phone}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Ort</p>
                    <p className="font-medium">{candidate.location}</p>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h3 className="text-lg font-medium text-[#002451] mb-4">Skills</h3>
                {candidate.skills && Array.isArray(candidate.skills) && candidate.skills.length > 0 ? (
                  <div className="space-y-3">
                    {candidate.skills.map((skill, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center">
                          <p className="font-medium">{typeof skill === 'string' ? skill : skill.name || 'Unbenannte Skill'}</p>
                          <p className="text-sm text-gray-500">{typeof skill === 'string' ? '?' : (skill.level || 3)}/5</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-[#002451] h-2 rounded-full" 
                            style={{ width: `${typeof skill === 'string' ? 60 : ((skill.level || 3) / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Keine Skills angegeben</p>
                )}
              </div>
            </div>

            {/* Berufserfahrung */}
            <div className="mt-6">
              <h3 className="text-lg font-medium text-[#002451] mb-4">Erfahrung</h3>
              {candidate.experience && Array.isArray(candidate.experience) && candidate.experience.length > 0 ? (
                <ul className="space-y-3 list-disc pl-5">
                  {candidate.experience.map((exp, index) => (
                    <li key={index}>{typeof exp === 'string' ? exp : JSON.stringify(exp)}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">Keine Erfahrungen angegeben</p>
              )}
            </div>
          </div>
        )}

        {/* Gesprächshistorie-Tab */}
        {activeTab === 'communication' && (
          <div>
            <h3 className="text-lg font-medium text-[#002451] mb-4">Gesprächshistorie</h3>
            
            {/* Neue Notiz hinzufügen */}
            <div className="mb-6 border rounded-lg p-4">
              <h4 className="font-medium mb-2">Neue Notiz hinzufügen</h4>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Geben Sie Ihre Notiz ein..."
                className="w-full border rounded-md p-2 min-h-[100px] mb-2"
              />
              <button
                onClick={handleSaveNote}
                disabled={!newNote.trim()}
                className="px-4 py-2 bg-[#002451] text-white rounded-md hover:bg-[#002451]/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Notiz speichern
              </button>
            </div>
            
            {/* Kommunikationsverlauf */}
            {candidate.communicationHistory && candidate.communicationHistory.length > 0 ? (
              <div className="space-y-4">
                {[...candidate.communicationHistory]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((entry) => {
                    // Icon je nach Typ
                    let Icon = MessageSquare;
                    if (entry.type === 'email') Icon = Mail;
                    if (entry.type === 'call') Icon = PhoneCall;
                    
                    return (
                      <div key={entry.id} className="border-l-4 border-[#002451] pl-4 py-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-2">
                            <Icon className="w-4 h-4 text-[#002451]" />
                            <span className="font-medium">
                              {entry.type === 'email' ? 'E-Mail' : 
                               entry.type === 'call' ? 'Telefonat' : 
                               entry.type === 'meeting' ? 'Meeting' : 'Notiz'}
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatDate(entry.date)}
                            </span>
                          </div>
                          {entry.createdBy && (
                            <span className="text-sm text-gray-500">
                              {entry.createdBy}
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-gray-700 whitespace-pre-line">{entry.content}</p>
                      </div>
                    )
                })}
              </div>
            ) : (
              <p className="text-gray-500">Keine Kommunikationshistorie verfügbar</p>
            )}
          </div>
        )}

        {/* Qualifikationsprofil-Tab */}
        {activeTab === 'qualificationProfile' && (
          <CandidateQualificationProfile 
            candidate={candidate} 
            onAddDocument={(doc) => {
              // Dokument zur Kandidatenakte hinzufügen
              const updatedCandidate = {
                ...candidate,
                documents: [...(candidate.documents || []), doc]
              };
              updateCandidate(candidate.id, updatedCandidate);
            }}
          />
        )}
        
        {/* Dokumente-Tab */}
        {activeTab === 'documents' && (
          <div>
            <h3 className="text-lg font-medium text-[#002451] mb-4">Dokumente</h3>
            
            {candidate.documents && candidate.documents.length > 0 ? (
              <div className="space-y-4">
                {candidate.documents.map((doc) => (
                  <div key={doc.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-6 h-6 text-gray-400" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-xs text-gray-500">
                          {doc.size && formatFileSize(doc.size)} • 
                          Hochgeladen {doc.uploadedAt && formatDate(doc.uploadedAt)}
                        </p>
                      </div>
                    </div>
                    <button 
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                      onClick={() => alert(`Download von ${doc.name} gestartet...`)}
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Keine Dokumente vorhanden</p>
            )}

            {/* Dokumenten-Upload */}
            <div className="mt-6 p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Neues Dokument hochladen</h4>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-medium">Klicken Sie zum Hochladen</span> oder ziehen Sie Dateien hierher
                    </p>
                    <p className="text-xs text-gray-500">PDF, DOCX, JPG (MAX. 10MB)</p>
                  </div>
                  <input type="file" className="hidden" onChange={() => alert('Datei-Upload wird simuliert...')} />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Absage-Modal */}
      {candidate && (
        <CandidateRejectionModal
          isOpen={showRejectionModal}
          onClose={() => setShowRejectionModal(false)}
          candidate={candidate}
        />
      )}
    </div>
  )
}
