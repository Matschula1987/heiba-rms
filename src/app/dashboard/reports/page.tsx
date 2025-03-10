'use client'

import { useEffect, useState } from 'react'
import { useReportStore } from '@/store/reportStore'
import { exportService } from '@/lib/exportService'
import DateRangePicker from '@/components/filters/DateRangePicker'

export default function ReportsPage() {
  const { 
    metrics, 
    fetchMetrics, 
    isLoading,
    startDate,
    endDate,
    setDateRange
  } = useReportStore()
  
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  const handleExport = (type: 'csv' | 'pdf') => {
    if (type === 'csv') {
      exportService.downloadCSV(metrics)
    } else {
      exportService.generatePDF(metrics)
    }
    setShowExportMenu(false)
  }

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-heiba-blue">Loading...</div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 mt-8">
        {/* Header mit Export Button und DateRange */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-heiba-blue">Berichte</h1>
            <p className="text-gray-600 mt-1">Recruiting Performance Übersicht</p>
          </div>

          <div className="flex items-center gap-4">
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onChange={setDateRange}
            />

            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="bg-white text-heiba-blue px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors border flex items-center space-x-2"
              >
                <i className="fas fa-download"></i>
                <span>Exportieren</span>
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10">
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
                  >
                    <i className="fas fa-file-csv mr-2 text-green-600"></i>
                    Als CSV exportieren
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
                  >
                    <i className="fas fa-file-pdf mr-2 text-red-600"></i>
                    Als PDF exportieren
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hinweis auf die Unterseiten in der Sidebar */}
        <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-blue-700 text-sm">
            Weitere Berichte und Details finden Sie in den Unterseiten in der Sidebar.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm">Bewerbungen</p>
                <p className="text-3xl font-bold text-heiba-blue mt-1">{metrics.totalApplications}</p>
              </div>
              <div className="text-heiba-blue/20">
                <i className="fas fa-users text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm">Aktive Stellen</p>
                <p className="text-3xl font-bold text-heiba-blue mt-1">{metrics.activeJobs}</p>
              </div>
              <div className="text-heiba-blue/20">
                <i className="fas fa-briefcase text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm">Ø Match Score</p>
                <p className="text-3xl font-bold text-heiba-blue mt-1">{metrics.averageMatchScore}%</p>
              </div>
              <div className="text-heiba-blue/20">
                <i className="fas fa-percentage text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm">Conversion Rate</p>
                <p className="text-3xl font-bold text-heiba-blue mt-1">{metrics.conversionRate}%</p>
              </div>
              <div className="text-heiba-blue/20">
                <i className="fas fa-chart-line text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm">Time to Hire</p>
                <p className="text-3xl font-bold text-heiba-blue mt-1">{metrics.timeToHire} Tage</p>
              </div>
              <div className="text-heiba-blue/20">
                <i className="fas fa-clock text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-heiba-blue mb-4">Bewerbungsstatus</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <p className="text-sm text-gray-600">Neu</p>
                  <p className="text-sm font-medium">{metrics.applicationsByStatus.new}</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-400 h-2 rounded-full" 
                    style={{ width: `${(metrics.applicationsByStatus.new / metrics.totalApplications) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <p className="text-sm text-gray-600">In Prüfung</p>
                  <p className="text-sm font-medium">{metrics.applicationsByStatus.in_review}</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-400 h-2 rounded-full" 
                    style={{ width: `${(metrics.applicationsByStatus.in_review / metrics.totalApplications) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <p className="text-sm text-gray-600">Interview</p>
                  <p className="text-sm font-medium">{metrics.applicationsByStatus.interview}</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full" 
                    style={{ width: `${(metrics.applicationsByStatus.interview / metrics.totalApplications) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <p className="text-sm text-gray-600">Angebot</p>
                  <p className="text-sm font-medium">{metrics.applicationsByStatus.offer}</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-400 h-2 rounded-full" 
                    style={{ width: `${(metrics.applicationsByStatus.offer / metrics.totalApplications) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <p className="text-sm text-gray-600">Abgelehnt</p>
                  <p className="text-sm font-medium">{metrics.applicationsByStatus.rejected}</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-400 h-2 rounded-full" 
                    style={{ width: `${(metrics.applicationsByStatus.rejected / metrics.totalApplications) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Applications */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-heiba-blue mb-4">Bewerbungen pro Monat</h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {metrics.applicationsByMonth.map((month) => {
                const maxCount = Math.max(...metrics.applicationsByMonth.map(m => m.count));
                const height = (month.count / maxCount) * 100;
                
                return (
                  <div key={month.month} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-heiba-blue/70 rounded-t-sm" 
                      style={{ height: `${height}%` }}
                    ></div>
                    <p className="mt-2 text-xs text-gray-600">{month.month}</p>
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
