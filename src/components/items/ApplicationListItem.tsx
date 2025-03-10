'use client'

import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal } from 'lucide-react'

interface ApplicationListItemProps {
  id: string
  candidateName: string
  jobTitle: string
  appliedDate: string
  status: 'new' | 'in_review' | 'interview' | 'offer' | 'rejected'
  matchRate?: number
  email?: string
  phone?: string
}

export default function ApplicationListItem({ 
  id, 
  candidateName, 
  jobTitle, 
  appliedDate, 
  status,
  matchRate,
  email,
  phone
}: ApplicationListItemProps) {
  const router = useRouter()

  const statusConfig = {
    new: { label: 'Neu', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    in_review: { label: 'In Prüfung', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    interview: { label: 'Interview', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    offer: { label: 'Angebot', color: 'bg-green-100 text-green-800 border-green-200' },
    rejected: { label: 'Abgelehnt', color: 'bg-red-100 text-red-800 border-red-200' },
  }

  const handleViewDetails = () => {
    router.push(`/applications/${id}`)
  }

  return (
    <div className="p-4 border border-gray-200 rounded-lg mb-3 hover:shadow-sm transition-shadow">
      <div className="grid grid-cols-12 gap-4 items-center">
        {/* Kandidatenname und Job */}
        <div className="col-span-12 sm:col-span-4 lg:col-span-3">
          <h3 className="font-semibold text-heiba-blue text-lg">{candidateName}</h3>
          <p className="text-sm text-gray-600 mt-1">{jobTitle}</p>
        </div>

        {/* Kontaktinformationen */}
        <div className="col-span-12 sm:col-span-4 lg:col-span-3">
          {email && (
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <span className="mr-2"><i className="fas fa-envelope"></i></span>
              <span className="truncate">{email}</span>
            </div>
          )}
          {phone && (
            <div className="flex items-center text-sm text-gray-600">
              <span className="mr-2"><i className="fas fa-phone"></i></span>
              <span>{phone}</span>
            </div>
          )}
        </div>

        {/* Datum und Match-Rate */}
        <div className="col-span-6 sm:col-span-2">
          <div className="text-sm text-gray-600 mb-1">
            <span className="font-medium">Eingegangen:</span>
          </div>
          <div className="text-sm">{appliedDate}</div>
          
          {matchRate !== undefined && (
            <div className="flex items-center mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                <div 
                  className="bg-heiba-gold h-2 rounded-full" 
                  style={{ width: `${matchRate}%` }}
                ></div>
              </div>
              <span className="text-xs font-medium">{matchRate}%</span>
            </div>
          )}
        </div>

        {/* Status und Aktionen */}
        <div className="col-span-6 sm:col-span-2 lg:col-span-4 flex justify-between items-center">
          <div>
            <Badge className={`${statusConfig[status].color} font-medium`}>
              {statusConfig[status].label}
            </Badge>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleViewDetails}
              className="text-heiba-blue border-heiba-blue hover:bg-heiba-blue/10"
            >
              Details
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-gray-500 hover:text-heiba-blue"
              onClick={(e) => {
                e.stopPropagation()
                // Optionen-Menü hier
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
