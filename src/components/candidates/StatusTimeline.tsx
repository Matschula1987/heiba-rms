'use client'

import { Candidate } from '@/types'
import { useCandidateStore } from '@/store/candidateStore'

interface StatusTimelineProps {
  candidate: Candidate
}

const statusSteps = [
  { key: 'new', label: 'Neu', icon: 'star' },
  { key: 'in_review', label: 'In Prüfung', icon: 'search' },
  { key: 'interview', label: 'Interview', icon: 'comments' },
  { key: 'offer', label: 'Angebot', icon: 'file-contract' },
  { key: 'rejected', label: 'Abgelehnt', icon: 'times-circle' }
]

export default function StatusTimeline({ candidate }: StatusTimelineProps) {
  const { updateCandidate } = useCandidateStore()

  const currentStepIndex = statusSteps.findIndex(step => step.key === candidate.status)

  const handleStatusUpdate = async (newStatus: string) => {
    await updateCandidate(candidate.id, { status: newStatus as Candidate['status'] })
  }

  return (
    <div className="relative">
      <div className="absolute left-5 top-0 h-full w-0.5 bg-gray-200"></div>
      
      <div className="space-y-8 relative">
        {statusSteps.map((step, index) => {
          const isActive = index <= currentStepIndex
          const isCurrent = index === currentStepIndex

          return (
            <div 
              key={step.key}
              className={`flex items-center space-x-4 ${
                isActive ? 'text-heiba-blue' : 'text-gray-400'
              }`}
            >
              <button
                onClick={() => handleStatusUpdate(step.key)}
                className={`
                  relative z-10 w-10 h-10 rounded-full flex items-center justify-center
                  ${isCurrent ? 'bg-heiba-blue text-white' : 
                    isActive ? 'bg-heiba-blue/10 text-heiba-blue' : 
                    'bg-gray-100 text-gray-400'}
                `}
              >
                <i className={`fas fa-${step.icon}`}></i>
              </button>
              <span className={`font-medium ${
                isCurrent ? 'text-heiba-blue' :
                isActive ? 'text-gray-700' : 'text-gray-400'
              }`}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}