'use client'

import { useEffect } from 'react'
import { useReportStore } from '@/store/reportStore'

export default function ReportsLocationPage() {
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

  // Berechne Gesamtanzahl der Bewerbungen für Prozentwerte
  const totalApplications = metrics.locationDistribution.reduce((sum, loc) => sum + loc.count, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 mt-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-heiba-blue">Standort-Analyse</h1>
          <p className="text-gray-600 mt-1">Bewerbungen nach Standorten und Regionen</p>
        </div>

        {/* Standortverteilung */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-heiba-blue mb-4">Bewerbungen nach Standort</h3>
          <div className="space-y-4">
            {metrics.locationDistribution.map((location) => {
              const percentage = (location.count / totalApplications) * 100;
              
              return (
                <div key={location.location}>
                  <div className="flex justify-between mb-1">
                    <p className="text-sm text-gray-600">{location.location}</p>
                    <p className="text-sm font-medium">{location.count} ({percentage.toFixed(1)}%)</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-heiba-blue h-2 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detaillierte Analyse */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Regionale Analyse */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-heiba-blue mb-4">Regionale Verteilung</h3>
            <div className="flex flex-col h-80 justify-center items-center">
              <p className="text-gray-500 mb-4">Regionale Karte wird in einer späteren Version verfügbar sein.</p>
              <div className="w-full max-w-md h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-map-marked-alt text-gray-300 text-5xl"></i>
              </div>
            </div>
          </div>

          {/* Remote vs. On-Site */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-heiba-blue mb-4">Remote vs. Vor-Ort</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <p className="text-gray-600">Vor-Ort-Bewerbungen</p>
                  <p className="font-medium">85%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-heiba-blue h-4 rounded-l-full" 
                    style={{ width: '85%' }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <p className="text-gray-600">Remote-Bewerbungen</p>
                  <p className="font-medium">15%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-green-500 h-4 rounded-l-full" 
                    style={{ width: '15%' }}
                  ></div>
                </div>
              </div>
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Trend-Analyse</h4>
                <p className="text-gray-600 text-sm">
                  Der Anteil an Remote-Bewerbungen ist im Vergleich zum Vorjahr um 8% gestiegen. 
                  Dieser Trend spiegelt die zunehmende Akzeptanz von Remote-Arbeit wider.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabelle */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-heiba-blue">Bewerbungen nach Region</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Region</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">Bewerbungen</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">Interviews</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">Einstellungen</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-heiba-blue">Süddeutschland</p>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">48</td>
                  <td className="px-6 py-4 text-center text-gray-600">12</td>
                  <td className="px-6 py-4 text-center text-gray-600">4</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      8.3%
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-heiba-blue">Norddeutschland</p>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">35</td>
                  <td className="px-6 py-4 text-center text-gray-600">8</td>
                  <td className="px-6 py-4 text-center text-gray-600">3</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      8.6%
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-heiba-blue">Ostdeutschland</p>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">22</td>
                  <td className="px-6 py-4 text-center text-gray-600">5</td>
                  <td className="px-6 py-4 text-center text-gray-600">2</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      9.1%
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-heiba-blue">Westdeutschland</p>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">39</td>
                  <td className="px-6 py-4 text-center text-gray-600">10</td>
                  <td className="px-6 py-4 text-center text-gray-600">3</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      7.7%
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-heiba-blue">Remote</p>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">12</td>
                  <td className="px-6 py-4 text-center text-gray-600">4</td>
                  <td className="px-6 py-4 text-center text-gray-600">1</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      8.3%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
