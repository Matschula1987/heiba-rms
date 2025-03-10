'use client'

import { useRouter } from 'next/navigation'
import { useJobStore } from '@/store/jobStore'

interface CandidateListItemProps {
  id: string
  firstName: string
  lastName: string
  email: string
  location: string
  position: string
  status: 'new' | 'in_review' | 'interview' | 'offer' | 'rejected'
  matchScore: number
  appliedDate: string
  jobId: string
}

const statusConfig = {
  new: { label: 'Neu', class: 'bg-blue-100 text-blue-800' },
  in_review: { label: 'In Prüfung', class: 'bg-yellow-100 text-yellow-800' },
  interview: { label: 'Interview', class: 'bg-purple-100 text-purple-800' },
  offer: { label: 'Angebot', class: 'bg-green-100 text-green-800' },
  rejected: { label: 'Abgelehnt', class: 'bg-red-100 text-red-800' },
}

export default function CandidateListItem({
  id,
  firstName,
  lastName,
  email,
  location,
  position,
  status,
  matchScore,
  appliedDate,
  jobId,
}: CandidateListItemProps) {
  const router = useRouter()
  const { jobs } = useJobStore()
  const job = jobs.find(j => j.id === jobId)
  const appliedDateFormatted = new Date(appliedDate).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return (
    <div 
      onClick={() => router.push(`/candidates/${id}`)}
      className="p-6 grid grid-cols-12 gap-4 items-center hover:bg-gray-50 transition-colors cursor-pointer"
    >
      {/* Name & Position */}
      <div className="col-span-3">
        <h3 className="font-semibold text-heiba-blue">
          {firstName} {lastName}
        </h3>
        <p className="text-sm text-gray-500">{position}</p>
      </div>

      {/* Job & Location */}
      <div className="col-span-3">
        <p className="text-gray-600">{job?.title || 'Unbekannte Stelle'}</p>
        <p className="text-sm text-gray-500">
          <i className="fas fa-map-marker-alt mr-1"></i> {location}
        </p>
      </div>

      {/* Match Score */}
      <div className="col-span-2">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-heiba-blue/10 flex items-center justify-center mr-2">
            <span className="text-sm font-medium text-heiba-blue">{matchScore}%</span>
          </div>
          <div className="flex-grow">
            <div className="h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-heiba-gold rounded-full" 
                style={{ width: `${matchScore}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Applied Date */}
      <div className="col-span-2 text-gray-500 text-sm">
        {appliedDateFormatted}
      </div>

      {/* Status */}
      <div className="col-span-2 flex justify-between items-center">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[status].class}`}>
          {statusConfig[status].label}
        </span>
        <button 
          onClick={(e) => {
            e.stopPropagation()
            // Optionen-Menü hier
          }}
          className="text-gray-400 hover:text-heiba-blue transition-colors"
        >
          <i className="fas fa-ellipsis-v"></i>
        </button>
      </div>
    </div>
  )
}