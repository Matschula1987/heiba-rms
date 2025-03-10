'use client'

import { useState } from 'react'
import { useJobStore } from '@/store/jobStore'
import { useReportStore } from '@/store/reportStore'

interface JobDetailsModalProps {
  jobId: string
  isOpen: boolean
  onClose: () => void
}

export default function JobDetailsModal({ jobId, isOpen, onClose }: JobDetailsModalProps) {
  const { jobs } = useJobStore()
  const { metrics } = useReportStore()
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'applications' | 'timeline'

  const job = jobs.find(j => j.id === jobId)
  const performance = metrics.jobPerformance.find(j => j.jobId === jobId)

  if (!isOpen || !job || !performance) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-heiba-blue">{job.title}</h2>
            <p className="text-gray-600">{job.location}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-heiba-blue text-heiba-blue'
                : 'border-transparent text-gray-600 hover:text-heiba-blue'
            }`}
          >
            Übersicht
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'applications'
                ? 'border-heiba-blue text-heiba-blue'
                : 'border-transparent text-gray-600 hover:text-heiba-blue'
            }`}
          >
            Bewerbungen
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'timeline'
                ? 'border-heiba-blue text-heiba-blue'
                : 'border-transparent text-gray-600 hover:text-heiba-blue'
            }`}
          >
            Timeline
          </button>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Bewerbungen</p>
                <p className="text-2xl font-bold text-heiba-blue">{performance.applications}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Interviews</p>
                <p className="text-2xl font-bold text-heiba-blue">{performance.interviews}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Angebote</p>
                <p className="text-2xl font-bold text-heiba-blue">{performance.offers}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-4">Conversion Funnel</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Bewerbung → Interview</span>
                    <span>{((performance.interviews / performance.applications) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-heiba-gold h-2 rounded-full" 
                      style={{ width: `${(performance.interviews / performance.applications) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Interview → Angebot</span>
                    <span>{((performance.offers / performance.interviews) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-heiba-gold h-2 rounded-full" 
                      style={{ width: `${(performance.offers / performance.interviews) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-4">Bewerbungen nach Status</h3>
              {/* Hier könnten wir die Bewerbungen nach Status anzeigen */}
              <p className="text-gray-500">Detaillierte Bewerbungsstatistiken folgen...</p>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-4">Verlauf</h3>
              {/* Hier könnten wir einen Timeline der Aktivitäten anzeigen */}
              <p className="text-gray-500">Detaillierter Verlauf folgt...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}