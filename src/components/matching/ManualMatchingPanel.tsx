'use client'

import { useState } from 'react'
import { useJobStore } from '@/store/jobStore'
import { useCandidateStore } from '@/store/candidateStore'
import { useMatchingStore } from '@/store/matchingStore'

interface ManualMatchingPanelProps {
  onMatchComplete?: () => void
}

export default function ManualMatchingPanel({ onMatchComplete }: ManualMatchingPanelProps) {
  const { jobs } = useJobStore()
  const { candidates } = useCandidateStore()
  const { 
    runMatching, 
    runGlobalMatching,
    includePortals, 
    includeExternalJobs,
    setIncludePortals,
    setIncludeExternalJobs,
    isLoading 
  } = useMatchingStore()

  const [selectedJob, setSelectedJob] = useState<string>('')
  const [selectedCandidate, setSelectedCandidate] = useState<string>('')
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [matchingOptions, setMatchingOptions] = useState({
    fuzzySkillMatching: true,
    locationRadius: 50,
    minimumScore: 60
  })

  const handleMatch = async () => {
    if (!selectedJob && !selectedCandidate) {
      // Globales Matching durchführen
      await runGlobalMatching()
    } else {
      // Spezifisches Matching durchführen
      await runMatching(selectedJob || undefined, selectedCandidate || undefined, matchingOptions)
    }
    onMatchComplete?.()
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-lg font-semibold text-heiba-blue">Matching durchführen</h2>
        <button
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          className="text-gray-600 hover:text-heiba-blue transition-colors"
        >
          <i className={`fas fa-cog mr-2`}></i>
          {showAdvancedOptions ? 'Einfache Ansicht' : 'Erweiterte Optionen'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stelle & Kandidat Auswahl */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stelle
            </label>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-heiba-blue/20"
            >
              <option value="">Alle Stellen</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kandidat
            </label>
            <select
              value={selectedCandidate}
              onChange={(e) => setSelectedCandidate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-heiba-blue/20"
            >
              <option value="">Alle Kandidaten</option>
              {candidates.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.firstName} {candidate.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Erweiterte Optionen */}
        {showAdvancedOptions && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Matching-Optionen
              </label>
              
              <div className="space-y-3">
                {/* Portal-Integration */}
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={includePortals}
                    onChange={(e) => setIncludePortals(e.target.checked)}
                    className="rounded text-heiba-blue"
                  />
                  <span className="text-sm text-gray-700">Portal-Kandidaten einbeziehen</span>
                </label>

                {/* Externe Jobs */}
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={includeExternalJobs}
                    onChange={(e) => setIncludeExternalJobs(e.target.checked)}
                    className="rounded text-heiba-blue"
                  />
                  <span className="text-sm text-gray-700">Externe Stellen einbeziehen</span>
                </label>

                {/* Fuzzy Matching */}
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={matchingOptions.fuzzySkillMatching}
                    onChange={(e) => setMatchingOptions({
                      ...matchingOptions,
                      fuzzySkillMatching: e.target.checked
                    })}
                    className="rounded text-heiba-blue"
                  />
                  <span className="text-sm text-gray-700">Fuzzy Skill Matching</span>
                </label>

                {/* Umkreissuche */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Umkreis (km)
                  </label>
                  <input
                    type="number"
                    value={matchingOptions.locationRadius}
                    onChange={(e) => setMatchingOptions({
                      ...matchingOptions,
                      locationRadius: parseInt(e.target.value)
                    })}
                    min="0"
                    max="500"
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-heiba-blue/20"
                  />
                </div>

                {/* Minimaler Score */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Minimaler Match Score (%)
                  </label>
                  <input
                    type="number"
                    value={matchingOptions.minimumScore}
                    onChange={(e) => setMatchingOptions({
                      ...matchingOptions,
                      minimumScore: parseInt(e.target.value)
                    })}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-heiba-blue/20"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Text */}
      <div className="mt-4 mb-6">
        <p className="text-sm text-gray-500">
          {!selectedJob && !selectedCandidate ? (
            "Es wird ein globales Matching für alle Kombinationen durchgeführt."
          ) : selectedJob && selectedCandidate ? (
            "Es wird ein spezifisches Matching für die ausgewählte Stelle und den Kandidaten durchgeführt."
          ) : selectedJob ? (
            "Es wird ein Matching der ausgewählten Stelle mit allen verfügbaren Kandidaten durchgeführt."
          ) : (
            "Es wird ein Matching des ausgewählten Kandidaten mit allen verfügbaren Stellen durchgeführt."
          )}
        </p>
      </div>

      {/* Action Button */}
      <div className="flex justify-end">
        <button
          onClick={handleMatch}
          disabled={isLoading}
          className={`
            px-6 py-2 rounded-lg text-white shadow-md
            ${isLoading 
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-heiba-gold hover:bg-[#C19B20] transition-colors'
            }
          `}
        >
          {isLoading ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Matching läuft...
            </>
          ) : (
            <>
              <i className="fas fa-play mr-2"></i>
              Matching durchführen
            </>
          )}
        </button>
      </div>
    </div>
  )
}
