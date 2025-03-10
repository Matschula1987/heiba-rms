'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePortalStore } from '@/store/portalStore'

interface PortalSettingsPageProps {
  params: {
    id: string
  }
}

export default function PortalSettingsPage({ params }: PortalSettingsPageProps) {
  const router = useRouter()
  const { portals, fetchPortals, updatePortal, deletePortal, isLoading } = usePortalStore()
  const [activeTab, setActiveTab] = useState('general') // 'general' | 'mapping' | 'notifications' | 'billing'
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const portal = portals.find(p => p.id === params.id)

  useEffect(() => {
    fetchPortals()
  }, [fetchPortals])

  const handleDelete = async () => {
    try {
      await deletePortal(params.id)
      router.push('/portals')
    } catch (error) {
      console.error('Failed to delete portal:', error)
    }
  }

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-heiba-blue">Loading...</div>
    </div>
  }

  if (!portal) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-500">Portal nicht gefunden</div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 mt-24">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <button
              onClick={() => router.push('/portals')}
              className="text-gray-500 hover:text-heiba-blue mb-4 flex items-center"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Zurück zur Übersicht
            </button>
            <h1 className="text-2xl font-bold text-heiba-blue">{portal.name}</h1>
            <p className="text-gray-600 mt-1">{portal.url}</p>
          </div>

          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              portal.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {portal.status === 'active' ? 'Aktiv' : 'Inaktiv'}
            </span>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
            >
              <i className="fas fa-trash-alt mr-2"></i>
              Portal löschen
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'general'
                ? 'border-heiba-blue text-heiba-blue'
                : 'border-transparent text-gray-600 hover:text-heiba-blue'
            }`}
          >
            Allgemein
          </button>
          <button
            onClick={() => setActiveTab('mapping')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'mapping'
                ? 'border-heiba-blue text-heiba-blue'
                : 'border-transparent text-gray-600 hover:text-heiba-blue'
            }`}
          >
            Feld-Mapping
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'notifications'
                ? 'border-heiba-blue text-heiba-blue'
                : 'border-transparent text-gray-600 hover:text-heiba-blue'
            }`}
          >
            Benachrichtigungen
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'billing'
                ? 'border-heiba-blue text-heiba-blue'
                : 'border-transparent text-gray-600 hover:text-heiba-blue'
            }`}
          >
            Abrechnung
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            {/* API Configuration */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-heiba-blue mb-4">API-Konfiguration</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Key
                  </label>
                  <div className="flex">
                    <input
                      type="password"
                      value="••••••••••••••••"
                      disabled
                      className="flex-grow px-4 py-2 rounded-l-lg border focus:outline-none focus:ring-2 focus:ring-heiba-blue/20 bg-gray-50"
                    />
                    <button className="px-4 py-2 bg-gray-100 border-t border-r border-b rounded-r-lg text-gray-600 hover:text-heiba-blue">
                      <i className="fas fa-sync-alt"></i>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Webhook URL
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={portal.url + '/webhook'}
                      disabled
                      className="flex-grow px-4 py-2 rounded-l-lg border focus:outline-none focus:ring-2 focus:ring-heiba-blue/20 bg-gray-50"
                    />
                    <button className="px-4 py-2 bg-gray-100 border-t border-r border-b rounded-r-lg text-gray-600 hover:text-heiba-blue">
                      <i className="fas fa-copy"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sync Settings */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-heiba-blue mb-4">Synchronisation</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Synchronisationsintervall
                  </label>
                  <select className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-heiba-blue/20">
                    <option value="15">Alle 15 Minuten</option>
                    <option value="30">Alle 30 Minuten</option>
                    <option value="60">Stündlich</option>
                    <option value="daily">Täglich</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded text-heiba-blue" />
                    <span className="text-gray-700">Automatische Synchronisation aktivieren</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mapping' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-heiba-blue mb-4">Feld-Mapping</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-sm font-medium text-gray-500">HeiBa Feld</div>
                <div className="text-sm font-medium text-gray-500">Portal Feld</div>
                <div className="text-sm font-medium text-gray-500">Transformation</div>
              </div>
              {/* Mapping rows */}
              <div className="grid grid-cols-3 gap-4 items-center">
                <div>Titel</div>
                <select className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-heiba-blue/20">
                  <option value="title">title</option>
                  <option value="job_title">job_title</option>
                </select>
                <select className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-heiba-blue/20">
                  <option value="none">Keine</option>
                  <option value="uppercase">Großbuchstaben</option>
                  <option value="lowercase">Kleinbuchstaben</option>
                </select>
              </div>
              {/* Add more mapping rows as needed */}
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-heiba-blue mb-4">Benachrichtigungen</h2>
            <div className="space-y-4">
              <div>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded text-heiba-blue" />
                  <span className="text-gray-700">Neue Bewerbungen</span>
                </label>
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded text-heiba-blue" />
                  <span className="text-gray-700">Synchronisationsfehler</span>
                </label>
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded text-heiba-blue" />
                  <span className="text-gray-700">API-Limit erreicht</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-heiba-blue mb-4">Abrechnung</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Aktueller Plan</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-heiba-blue">Professional</p>
                      <p className="text-sm text-gray-500">Unbegrenzte Stellenanzeigen</p>
                    </div>
                    <p className="text-lg font-bold text-heiba-blue">299 € / Monat</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Verbrauch</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">API Calls</span>
                    <span className="font-medium">12,345 / 15,000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-heiba-gold h-2 rounded-full" 
                      style={{ width: '82%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
              <h2 className="text-xl font-bold text-heiba-blue mb-4">Portal löschen</h2>
              <p className="text-gray-600 mb-6">
                Sind Sie sicher, dass Sie dieses Portal löschen möchten? 
                Diese Aktion kann nicht rückgängig gemacht werden.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Löschen
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}