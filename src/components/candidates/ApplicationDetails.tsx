'use client'

import { useState } from 'react'
import { Candidate } from '@/types'
import { useDocumentStore } from '@/store/documentStore'

interface ApplicationDetailsProps {
  candidate: Candidate
}

export default function ApplicationDetails({ candidate }: ApplicationDetailsProps) {
  const { documents } = useDocumentStore()
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null)

  // Gruppiere Dokumente nach Typ
  const groupedDocuments = candidate.documents?.reduce((acc, doc) => {
    if (!acc[doc.type]) acc[doc.type] = []
    acc[doc.type].push(doc)
    return acc
  }, {} as Record<string, typeof candidate.documents>)

  return (
    <div className="space-y-6">
      {/* Bewerbungsübersicht */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-heiba-blue mb-4">Bewerbungsdetails</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-gray-500">Bewerbungsdatum</dt>
                <dd className="text-gray-900">
                  {new Date(candidate.applicationDate).toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Quelle</dt>
                <dd className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                    {candidate.source === 'talent360' ? 'Talent360' : 'Direkte Bewerbung'}
                  </span>
                  {candidate.source === 'talent360' && (
                    <a 
                      href={`https://talent360.de/applications/${candidate.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-heiba-blue hover:underline"
                    >
                      <i className="fas fa-external-link-alt"></i>
                    </a>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Stelle</dt>
                <dd className="text-gray-900">{candidate.position}</dd>
              </div>
            </dl>
          </div>
          <div>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-gray-500">Adresse</dt>
                <dd className="text-gray-900">
                  {candidate.address?.street} {candidate.address?.houseNumber}<br />
                  {candidate.address?.postalCode} {candidate.address?.city}<br />
                  {candidate.address?.country}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Geburtsdatum</dt>
                <dd className="text-gray-900">
                  {candidate.dateOfBirth ? new Date(candidate.dateOfBirth).toLocaleDateString('de-DE') : '-'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Dokumente */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-heiba-blue mb-4">Bewerbungsunterlagen</h3>
        
        <div className="grid grid-cols-3 gap-6">
          {/* Lebenslauf */}
          <div>
            <h4 className="font-medium mb-3">Lebenslauf</h4>
            <div className="space-y-2">
              {groupedDocuments?.cv?.map((doc) => (
                <div
                  key={doc.name}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedDocument === doc.url ? 'border-heiba-blue bg-blue-50' : 'hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedDocument(doc.url)}
                >
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-file-pdf text-red-500"></i>
                    <span className="text-sm text-gray-600 truncate">{doc.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Anschreiben */}
          <div>
            <h4 className="font-medium mb-3">Anschreiben</h4>
            <div className="space-y-2">
              {groupedDocuments?.cover_letter?.map((doc) => (
                <div
                  key={doc.name}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedDocument === doc.url ? 'border-heiba-blue bg-blue-50' : 'hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedDocument(doc.url)}
                >
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-file-word text-blue-500"></i>
                    <span className="text-sm text-gray-600 truncate">{doc.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Zeugnisse */}
          <div>
            <h4 className="font-medium mb-3">Zeugnisse & Zertifikate</h4>
            <div className="space-y-2">
              {groupedDocuments?.certificates?.map((doc) => (
                <div
                  key={doc.name}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedDocument === doc.url ? 'border-heiba-blue bg-blue-50' : 'hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedDocument(doc.url)}
                >
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-file-pdf text-red-500"></i>
                    <span className="text-sm text-gray-600 truncate">{doc.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dokumentenvorschau */}
      {selectedDocument && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h4 className="font-medium">Dokumentenvorschau</h4>
            <button
              onClick={() => setSelectedDocument(null)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="h-[600px]">
            <iframe
              src={selectedDocument}
              className="w-full h-full"
              title="Dokumentenvorschau"
            />
          </div>
        </div>
      )}

      {/* Bewertung und Notizen */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-heiba-blue mb-4">Bewertung</h3>
        <div className="grid grid-cols-2 gap-6">
          {/* Bewertungskriterien */}
          <div>
            <h4 className="font-medium mb-3">Kriterien</h4>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Fachliche Eignung</label>
                <div className="flex items-center space-x-1 text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star}>
                      <i className="fas fa-star"></i>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500">Berufserfahrung</label>
                <div className="flex items-center space-x-1 text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star}>
                      <i className="fas fa-star"></i>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500">Qualifikationen</label>
                <div className="flex items-center space-x-1 text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star}>
                      <i className="fas fa-star"></i>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bewertungsnotizen */}
          <div>
            <h4 className="font-medium mb-3">Notizen zur Bewertung</h4>
            <textarea
              className="w-full h-32 p-3 border rounded-lg resize-none"
              placeholder="Notizen zur Bewerbung hinzufügen..."
            />
          </div>
        </div>
      </div>
    </div>
  )
}