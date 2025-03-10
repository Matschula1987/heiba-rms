'use client'

import { useEffect } from 'react'
import { useReportStore } from '@/store/reportStore'

export default function ReportsDetailsPage() {
  const { 
    metrics, 
    fetchMetrics, 
    isLoading,
  } = useReportStore()
  
  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-heiba-blue">Loading...</div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 mt-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-heiba-blue">Stellen-Detailbericht</h1>
          <p className="text-gray-600 mt-1">Detaillierte Performance-Analyse nach Stellen</p>
        </div>

        {/* Stellenperformance */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-heiba-blue">Stellen Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Stelle</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">Bewerbungen</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">Interviews</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">Angebote</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {metrics.jobPerformance.map((job) => (
                  <tr 
                    key={job.jobId}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-heiba-blue">{job.jobTitle}</p>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">{job.applications}</td>
                    <td className="px-6 py-4 text-center text-gray-600">{job.interviews}</td>
                    <td className="px-6 py-4 text-center text-gray-600">{job.offers}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {((job.offers / job.applications) * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Zusätzliche detaillierte Analysen */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-heiba-blue mb-4">Interviewquote nach Stelle</h3>
            <div className="space-y-4">
              {metrics.jobPerformance.map((job) => {
                const interviewRate = (job.interviews / job.applications) * 100;
                return (
                  <div key={`${job.jobId}-interview`}>
                    <div className="flex justify-between mb-1">
                      <p className="text-sm text-gray-600">{job.jobTitle}</p>
                      <p className="text-sm font-medium">{interviewRate.toFixed(1)}%</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-400 h-2 rounded-full" 
                        style={{ width: `${interviewRate}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-heiba-blue mb-4">Angebots-Conversion nach Stelle</h3>
            <div className="space-y-4">
              {metrics.jobPerformance.map((job) => {
                const offerRate = (job.offers / job.interviews) * 100;
                return (
                  <div key={`${job.jobId}-offers`}>
                    <div className="flex justify-between mb-1">
                      <p className="text-sm text-gray-600">{job.jobTitle}</p>
                      <p className="text-sm font-medium">{offerRate.toFixed(1)}%</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-400 h-2 rounded-full" 
                        style={{ width: `${offerRate}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
