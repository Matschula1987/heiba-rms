'use client'

import { useState, useEffect } from 'react'
import { Candidate, Job } from '@/types'
import { useJobStore } from '@/store/jobStore'
import matchingService from '@/lib/matchingService'

interface JobMatchingPanelProps {
  candidate: Candidate
}

export default function JobMatchingPanel({ candidate }: JobMatchingPanelProps) {
  const { jobs, fetchJobs } = useJobStore()
  const [matchResults, setMatchResults] = useState<Array<{ job: Job, score: number }>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadJobs = async () => {
      setIsLoading(true)
      try {
        await fetchJobs()
      } catch (error) {
        console.error('Fehler beim Laden der Jobs:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadJobs()
  }, [fetchJobs])

  useEffect(() => {
    if (jobs.length > 0 && candidate) {
      // Berechne Matching-Scores für alle aktiven Jobs
      const activeJobs = jobs.filter(job => job.status === 'active')
      
      // Für jeden Job ein Matching-Ergebnis berechnen
      const results = activeJobs.map(job => {
        const matchResult = matchingService.calculateMatch(job, candidate)
        return {
          job,
          score: matchResult.score,
          details: matchResult.details,
          matchedSkills: matchResult.matchedSkills,
          missingSkills: matchResult.missingSkills
        }
      })
      
      // Sortiere nach Score absteigend
      const sortedResults = results
        .sort((a, b) => b.score - a.score)
        .map(({ job, score }) => ({ job, score }))
      
      setMatchResults(sortedResults)
    }
  }, [jobs, candidate])

  if (isLoading) {
    return <div className="text-center p-4">Lade Jobdaten...</div>
  }

  if (matchResults.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        Keine aktiven Jobs für den Vergleich verfügbar oder der Kandidat hat kein Qualifikationsprofil.
      </div>
    )
  }

  // Zeige die Top 5 oder weniger Ergebnisse an
  const topResults = matchResults.slice(0, 5)

  return (
    <div className="space-y-4">
      <h4 className="text-md font-medium mb-3">Job-Matching</h4>
      <p className="text-gray-500 mb-2">Ähnlichkeit mit aktuellen Jobs:</p>
      
      <div className="space-y-3">
        {topResults.map(({ job, score }) => (
          <div key={job.id}>
            <div className="flex justify-between items-center">
              <p className="font-medium">{job.title}</p>
              <p className="text-sm text-gray-500">{score.toFixed(0)}%</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div 
                className={`h-2 rounded-full ${
                  score >= 80 ? 'bg-green-500' : 
                  score >= 60 ? 'bg-yellow-500' : 
                  'bg-red-500'
                }`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
