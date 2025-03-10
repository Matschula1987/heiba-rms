'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useExtendedMatchingStore } from '@/store/matchingStore.extension'
import { Badge } from '@/components/ui/badge'

interface MatchDetailsModalProps {
  matchId: string | null;
  isOpen: boolean;
  onClose: () => void;
  matchType?: 'internal' | 'external';
}

export default function MatchDetailsModal({
  matchId,
  isOpen,
  onClose,
  matchType = 'internal'
}: MatchDetailsModalProps) {
  const { matches, internalMatches, externalMatches } = useExtendedMatchingStore()
  const [match, setMatch] = useState<any>(null)
  
  useEffect(() => {
    if (!matchId) {
      setMatch(null)
      return
    }
    
    // Suche das Match basierend auf dem übergebenen matchId
    const [jobId, candidateId] = matchId.split('-')
    
    let matchSource = matches
    if (matchType === 'internal') {
      matchSource = internalMatches as any[]
    } else if (matchType === 'external') {
      matchSource = externalMatches as any[]
    }
    
    const foundMatch = (matchSource as any[]).find(
      m => m.jobId === jobId && m.candidateId === candidateId
    )
    
    setMatch(foundMatch || null)
  }, [matchId, matches, internalMatches, externalMatches, matchType])
  
  if (!isOpen || !match) return null
  
  // Berechne die Hintergrundfarbe basierend auf dem Score
  const getBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100'
    if (score >= 75) return 'bg-blue-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-gray-100'
  }
  
  // Berechne den Textfarben-Stil basierend auf dem Score
  const getTextColor = (score: number) => {
    if (score >= 90) return 'text-green-700'
    if (score >= 75) return 'text-blue-700'
    if (score >= 60) return 'text-yellow-700'
    return 'text-gray-700'
  }
  
  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
      <div className="bg-white rounded-md border border-gray-300 shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Modal-Header */}
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{match.jobTitle}</h2>
              <p className="text-gray-600">{match.customer || match.companyName}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className={`text-3xl font-bold ${getTextColor(match.score)}`}>
                {match.score}%
              </div>
              <div className="text-sm text-gray-500">Match-Score</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        
        {/* Modal-Inhalt */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Linke Spalte - Jobdetails */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Stellendetails</h3>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Kunde/Unternehmen</p>
                  <p className="font-medium">{match.customer || match.companyName}</p>
                </div>
                
                {match.jobDescription && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Beschreibung</p>
                    <p className="text-sm line-clamp-3">{match.jobDescription}</p>
                  </div>
                )}
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Standort</p>
                  <p className="font-medium">{match.jobLocation || 'Nicht angegeben'}</p>
                </div>
                
                {match.requiredSkills && match.requiredSkills.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Geforderte Fähigkeiten</p>
                    <div className="flex flex-wrap gap-1">
                      {match.requiredSkills.map((skill: string) => (
                        <Badge key={skill} variant="outline" className="bg-blue-50">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Quelle */}
              {match.isPortalJob && (
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-1">Job-Quelle</p>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">{match.portalName || 'Externes Portal'}</span>
                    {match.originalUrl && (
                      <a 
                        href={match.originalUrl}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <i className="fas fa-external-link-alt"></i>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Rechte Spalte - Kandidatendetails */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Kandidatendetails</h3>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{match.candidateName}</p>
                </div>
                
                {match.candidatePosition && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Position</p>
                    <p className="font-medium">{match.candidatePosition}</p>
                  </div>
                )}
                
                {match.candidateLocation && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Standort</p>
                    <p className="font-medium">{match.candidateLocation}</p>
                  </div>
                )}
                
                {match.matchedSkills && match.matchedSkills.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Übereinstimmende Fähigkeiten</p>
                    <div className="flex flex-wrap gap-1">
                      {match.matchedSkills.map((skill: string) => (
                        <Badge key={skill} variant="outline" className="bg-green-50">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Quelle */}
              {match.isPortalCandidate && (
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-1">Kandidaten-Quelle</p>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">{match.candidatePortalName || 'Externes Portal'}</span>
                    {match.profileUrl && (
                      <a 
                        href={match.profileUrl}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <i className="fas fa-external-link-alt"></i>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Matching-Details Abschnitt */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Matching-Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className={`p-4 rounded-lg ${getBgColor(match.details?.skillScore || 0)}`}>
                <div className="text-2xl font-bold">{Math.round(match.details?.skillScore || 0)}%</div>
                <div className="text-sm">Fähigkeiten</div>
              </div>
              
              <div className={`p-4 rounded-lg ${getBgColor(match.details?.experienceScore || 0)}`}>
                <div className="text-2xl font-bold">{Math.round(match.details?.experienceScore || 0)}%</div>
                <div className="text-sm">Erfahrung</div>
              </div>
              
              <div className={`p-4 rounded-lg ${getBgColor(match.details?.educationScore || 0)}`}>
                <div className="text-2xl font-bold">{Math.round(match.details?.educationScore || 0)}%</div>
                <div className="text-sm">Bildung</div>
              </div>
              
              <div className={`p-4 rounded-lg ${getBgColor(match.details?.locationScore || 0)}`}>
                <div className="text-2xl font-bold">{Math.round(match.details?.locationScore || 0)}%</div>
                <div className="text-sm">Standort</div>
              </div>
              
              <div className={`p-4 rounded-lg ${getBgColor(match.details?.salaryScore || 0)}`}>
                <div className="text-2xl font-bold">{Math.round(match.details?.salaryScore || 0)}%</div>
                <div className="text-sm">Gehalt</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Modal-Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Schließen
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline">
              <i className="fas fa-file-pdf mr-2"></i>
              Exportieren
            </Button>
            <Button>
              <i className="fas fa-paper-plane mr-2"></i>
              {match.isPortalCandidate ? 'Bewerben' : 'Kontaktieren'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
