'use client'

import { useState } from 'react'
import { Candidate } from '@/types'
import { useCandidateStore } from '@/store/candidateStore'
import DocumentUpload from './DocumentUpload'
import StatusTimeline from './StatusTimeline'
import CommunicationHistory from './CommunicationHistory'

interface CandidateProfileProps {
  candidate: Candidate
}

export default function CandidateProfile({ candidate }: CandidateProfileProps) {
  const { updateCandidate } = useCandidateStore()
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(candidate)

  const handleSave = async () => {
    await updateCandidate(candidate.id, editData)
    setIsEditing(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-md">
      {/* Header mit Profilbild und Hauptinformationen */}
      <div className="p-6 border-b">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
              <i className="fas fa-user text-3xl text-gray-400"></i>
            </div>
            <div>
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editData.firstName}
                    onChange={(e) => setEditData({...editData, firstName: e.target.value})}
                    className="block px-3 py-2 border rounded-lg"
                    placeholder="Vorname"
                  />
                  <input
                    type="text"
                    value={editData.lastName}
                    onChange={(e) => setEditData({...editData, lastName: e.target.value})}
                    className="block px-3 py-2 border rounded-lg"
                    placeholder="Nachname"
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-semibold">{candidate.firstName} {candidate.lastName}</h2>
                  <p className="text-gray-600">{candidate.position}</p>
                </>
              )}
            </div>
          </div>
          <div className="space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-heiba-gold text-white rounded-lg hover:bg-[#C19B20] transition-colors"
                >
                  Speichern
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setEditData(candidate)
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Abbrechen
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-gray-600 hover:text-heiba-blue transition-colors"
              >
                <i className="fas fa-edit mr-2"></i>
                Bearbeiten
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hauptinhalt */}
      <div className="grid grid-cols-3 gap-6 p-6">
        {/* Linke Spalte: Persönliche Informationen */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Kontaktdaten</h3>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-Mail
                  </label>
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={editData.phone || ''}
                    onChange={(e) => setEditData({...editData, phone: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Standort
                  </label>
                  <input
                    type="text"
                    value={editData.location}
                    onChange={(e) => setEditData({...editData, location: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="flex items-center text-gray-600">
                  <i className="fas fa-envelope w-6"></i>
                  {candidate.email}
                </p>
                <p className="flex items-center text-gray-600">
                  <i className="fas fa-phone w-6"></i>
                  {candidate.phone || '-'}
                </p>
                <p className="flex items-center text-gray-600">
                  <i className="fas fa-map-marker-alt w-6"></i>
                  {candidate.location}
                </p>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Skills</h3>
            {isEditing ? (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {editData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center"
                    >
                      {skill}
                      <button
                        onClick={() => setEditData({
                          ...editData,
                          skills: editData.skills.filter((_, i) => i !== index)
                        })}
                        className="ml-2 text-gray-400 hover:text-red-500"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Neue Skill hinzufügen"
                  className="w-full px-3 py-2 border rounded-lg"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.currentTarget
                      if (input.value.trim()) {
                        setEditData({
                          ...editData,
                          skills: [...editData.skills, input.value.trim()]
                        })
                        input.value = ''
                      }
                    }
                  }}
                />
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mittlere Spalte: Status und Timeline */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Bewerbungsstatus</h3>
            <StatusTimeline candidate={candidate} />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Notizen</h3>
            {isEditing ? (
              <textarea
                value={editData.notes || ''}
                onChange={(e) => setEditData({...editData, notes: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg h-40"
                placeholder="Notizen zum Kandidaten..."
              />
            ) : (
              <p className="text-gray-600 whitespace-pre-line">
                {candidate.notes || 'Keine Notizen vorhanden'}
              </p>
            )}
          </div>
        </div>

        {/* Rechte Spalte: Dokumente und Kommunikation */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Dokumente</h3>
            <DocumentUpload candidateId={candidate.id} />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Kommunikationsverlauf</h3>
            <CommunicationHistory candidateId={candidate.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
