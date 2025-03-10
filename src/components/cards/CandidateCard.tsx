'use client'

import { useState, useEffect } from 'react'
import { Candidate, CandidateStatus } from '@/types'
import { CalendarDays, BarChart2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'
import Link from 'next/link'
import { useJobStore } from '@/store/jobStore'
import matchingService from '@/lib/matchingService'

interface CandidateCardProps {
  candidate: Candidate
  onClick?: (id: string) => void
}

// Funktion zur Statusfarbbestimmung
const getStatusColor = (status: CandidateStatus) => {
  switch (status) {
    case 'new':
      return 'bg-blue-100 text-blue-800'
    case 'in_process':
      return 'bg-yellow-100 text-yellow-800'
    case 'interview':
      return 'bg-purple-100 text-purple-800'
    case 'hired':
      return 'bg-green-100 text-green-800'
    case 'rejected':
      return 'bg-red-100 text-red-800'
    case 'inactive':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Statustext formatieren
const formatStatus = (status: CandidateStatus) => {
  const statusTexts: Record<CandidateStatus, string> = {
    'new': 'Neu',
    'in_process': 'In Bearbeitung',
    'interview': 'Interview',
    'hired': 'Vermittelt',
    'rejected': 'Absage',
    'inactive': 'Inaktiv',
    'active': 'Aktiv'
  }
  return statusTexts[status] || status.replace('_', ' ')
}

// Datum formatieren
const formatDate = (date: string | undefined) => {
  if (!date) return ''
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: de
  })
}

// Initialen generieren aus dem Namen
const getInitials = (name: string | null | undefined) => {
  if (!name) return 'UN'; // Default für undefined/null name: "Unknown"
  
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

export default function CandidateCard({ candidate, onClick }: CandidateCardProps) {
  const { jobs, fetchJobs } = useJobStore();
  const [bestMatch, setBestMatch] = useState<{score: number; jobTitle: string} | null>(null);
  const [isLoadingMatch, setIsLoadingMatch] = useState(false);

  // Lade Jobs und berechne das beste Match
  useEffect(() => {
    let isMounted = true;
    setIsLoadingMatch(true);

    // Lade Jobs, wenn noch nicht geladen
    if (jobs.length === 0) {
      fetchJobs().then(() => {
        if (isMounted) calculateBestMatch();
      });
    } else {
      calculateBestMatch();
    }

    function calculateBestMatch() {
      // Nur aktive Jobs berücksichtigen
      const activeJobs = jobs.filter(job => job.status === 'active');
      
      if (activeJobs.length === 0) {
        setIsLoadingMatch(false);
        return;
      }

      // Berechne Matching für alle aktiven Jobs
      const matches = activeJobs.map(job => ({
        job,
        result: matchingService.calculateMatch(job, candidate)
      }));

      // Sortiere nach Score absteigend und nehme das beste Match
      const sortedMatches = matches.sort((a, b) => b.result.score - a.result.score);
      
      if (sortedMatches.length > 0 && isMounted) {
        setBestMatch({
          score: sortedMatches[0].result.score,
          jobTitle: sortedMatches[0].job.title
        });
      }
      
      if (isMounted) setIsLoadingMatch(false);
    }

    return () => {
      isMounted = false;
    };
  }, [candidate, jobs, fetchJobs]);

  const handleClick = () => {
    if (onClick) {
      onClick(candidate.id)
    }
  }

  // Score-Farbe bestimmen
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }

  return (
    <Link href={`/dashboard/candidates/${candidate.id}`}>
      <div
        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100"
      >
        <div className="p-4 space-y-3">
          {/* Header mit Profilbild/Initialen, ID und Status */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              {candidate.profileImage ? (
                <img 
                  src={candidate.profileImage} 
                  alt={candidate.name} 
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#002451] text-white flex items-center justify-center font-medium">
                  {getInitials(candidate.name)}
                </div>
              )}
              <div>
                <span className="text-sm text-gray-500">ID: {candidate.id}</span>
              </div>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(candidate.status)}`}>
              {formatStatus(candidate.status)}
            </span>
          </div>
          
          {/* Name und Position */}
          <div>
            <h3 className="text-base font-medium text-[#002451] truncate">{candidate.name}</h3>
            <p className="text-sm text-gray-600 truncate">{candidate.position || 'Keine Position angegeben'}</p>
          </div>
          
          {/* Best Match Anzeige */}
          {bestMatch && (
            <div className="pt-1 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BarChart2 className="w-3 h-3 mr-1 text-gray-500" />
                  <span className="text-xs text-gray-500">Bestes Match:</span>
                </div>
                <span className={`text-xs font-medium ${getScoreColor(bestMatch.score)}`}>
                  {bestMatch.score}%
                </span>
              </div>
              <p className="text-xs text-gray-600 truncate mt-1">{bestMatch.jobTitle}</p>
            </div>
          )}
          
          {/* Datum */}
          <div className="flex items-center text-xs text-gray-500">
            <CalendarDays className="w-3 h-3 mr-1" />
            {formatDate(candidate.createdAt)}
          </div>
        </div>
      </div>
    </Link>
  )
}
