'use client'

import { useRouter } from 'next/navigation'
import { JobStatus } from '@/types'

interface JobListItemProps {
  id: string
  title: string
  location: string
  portals: string[] | number
  applications: any[] | number
  status: JobStatus
}

export default function JobListItem({ id, title, location, portals, applications, status }: JobListItemProps) {
  const router = useRouter()

  // Konvertierung der Werte
  const portalsCount = Array.isArray(portals) ? portals.length : portals
  const applicationsCount = Array.isArray(applications) ? applications.length : applications

  return (
    <div 
      onClick={() => router.push(`/jobs/${id}`)}
      className="p-6 grid grid-cols-12 gap-4 items-center hover:bg-gray-50 transition-colors cursor-pointer"
    >
      <div className="col-span-4">
        <h3 className="font-semibold text-lg text-heiba-blue">{title}</h3>
        <div className="flex items-center space-x-3 mt-2">
          <span className="flex items-center text-sm text-gray-500">
            <i className="fas fa-map-marker-alt mr-1"></i> {location}
          </span>
        </div>
      </div>
      <div className="col-span-2">
        <span className="text-gray-600">{portalsCount} Portale</span>
      </div>
      <div className="col-span-2">
        <span className="text-gray-600">{applicationsCount} Bewerbungen</span>
      </div>
      <div className="col-span-2">
        {/* Hier könnte eine weitere Information stehen */}
      </div>
      <div className="col-span-2 flex justify-between items-center">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          status === 'active' ? 'bg-green-100 text-green-800' :
          status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
          status === 'inactive' ? 'bg-gray-100 text-gray-800' :
          'bg-red-100 text-red-800'
        }`}>
          {status === 'active' ? 'Aktiv' :
           status === 'draft' ? 'Entwurf' :
           status === 'inactive' ? 'Inaktiv' :
           'Archiviert'}
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