'use client'

import { useState } from 'react'

export default function PrivacySettingsPage() {
  const [privacySettings, setPrivacySettings] = useState({
    dataRetention: '12',
    automaticDeletion: true,
    anonymizeData: false,
    shareAnalytics: true,
    storeDocuments: true
  })

  const handlePrivacySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // API-Aufruf würde hier erfolgen
    alert('Datenschutzeinstellungen gespeichert!')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 mt-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-heiba-blue">Datenschutzeinstellungen</h1>
          <p className="text-gray-600 mt-1">Konfigurieren Sie Datenschutzoptionen und DSGVO-Einstellungen</p>
        </div>

        {/* Hauptinhalt */}
        <form onSubmit={handlePrivacySubmit}>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-heiba-blue mb-4">Datenspeicherung</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Datenspeicherung (Monate)
                    </label>
                    <select
                      value={privacySettings.dataRetention}
                      onChange={(e) => setPrivacySettings({...privacySettings, dataRetention: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-heiba-blue/20"
                    >
                      <option value="3">3 Monate</option>
                      <option value="6">6 Monate</option>
                      <option value="12">12 Monate</option>
                      <option value="24">24 Monate</option>
                      <option value="36">36 Monate</option>
                    </select>
                    <p className="mt-1 text-sm text-gray-500">
                      Nach diesem Zeitraum werden Bewerbungen automatisch archiviert
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Automatische Datenlöschung</p>
                      <p className="text-sm text-gray-500">Alte Daten automatisch löschen</p>
                    </div>
                    <div className="relative inline-block w-12 h-6">
                      <input
                        type="checkbox"
                        id="autoDeleteToggle"
                        className="sr-only"
                        checked={privacySettings.automaticDeletion}
                        onChange={() => setPrivacySettings({
                          ...privacySettings,
                          automaticDeletion: !privacySettings.automaticDeletion
                        })}
                      />
                      <label
                        htmlFor="autoDeleteToggle"
                        className={`block cursor-pointer rounded-full transition-colors ${
                          privacySettings.automaticDeletion ? 'bg-heiba-blue' : 'bg-gray-300'
                        } w-12 h-6`}
                      >
                        <span
                          className={`absolute transform transition-transform rounded-full bg-white h-5 w-5 top-0.5 left-0.5 ${
                            privacySettings.automaticDeletion ? 'translate-x-6' : ''
                          }`}
                        />
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Daten anonymisieren</p>
                      <p className="text-sm text-gray-500">Personenbezogene Daten bei der Auswertung anonymisieren</p>
                    </div>
                    <div className="relative inline-block w-12 h-6">
                      <input
                        type="checkbox"
                        id="anonymizeToggle"
                        className="sr-only"
                        checked={privacySettings.anonymizeData}
                        onChange={() => setPrivacySettings({
                          ...privacySettings,
                          anonymizeData: !privacySettings.anonymizeData
                        })}
                      />
                      <label
                        htmlFor="anonymizeToggle"
                        className={`block cursor-pointer rounded-full transition-colors ${
                          privacySettings.anonymizeData ? 'bg-heiba-blue' : 'bg-gray-300'
                        } w-12 h-6`}
                      >
                        <span
                          className={`absolute transform transition-transform rounded-full bg-white h-5 w-5 top-0.5 left-0.5 ${
                            privacySettings.anonymizeData ? 'translate-x-6' : ''
                          }`}
                        />
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Analytics teilen</p>
                      <p className="text-sm text-gray-500">Nutzungsdaten zur Verbesserung des Systems teilen</p>
                    </div>
                    <div className="relative inline-block w-12 h-6">
                      <input
                        type="checkbox"
                        id="analyticsToggle"
                        className="sr-only"
                        checked={privacySettings.shareAnalytics}
                        onChange={() => setPrivacySettings({
                          ...privacySettings,
                          shareAnalytics: !privacySettings.shareAnalytics
                        })}
                      />
                      <label
                        htmlFor="analyticsToggle"
                        className={`block cursor-pointer rounded-full transition-colors ${
                          privacySettings.shareAnalytics ? 'bg-heiba-blue' : 'bg-gray-300'
                        } w-12 h-6`}
                      >
                        <span
                          className={`absolute transform transition-transform rounded-full bg-white h-5 w-5 top-0.5 left-0.5 ${
                            privacySettings.shareAnalytics ? 'translate-x-6' : ''
                          }`}
                        />
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Dokumente speichern</p>
                      <p className="text-sm text-gray-500">Bewerbungsdokumente dauerhaft speichern</p>
                    </div>
                    <div className="relative inline-block w-12 h-6">
                      <input
                        type="checkbox"
                        id="storeDocumentsToggle"
                        className="sr-only"
                        checked={privacySettings.storeDocuments}
                        onChange={() => setPrivacySettings({
                          ...privacySettings,
                          storeDocuments: !privacySettings.storeDocuments
                        })}
                      />
                      <label
                        htmlFor="storeDocumentsToggle"
                        className={`block cursor-pointer rounded-full transition-colors ${
                          privacySettings.storeDocuments ? 'bg-heiba-blue' : 'bg-gray-300'
                        } w-12 h-6`}
                      >
                        <span
                          className={`absolute transform transition-transform rounded-full bg-white h-5 w-5 top-0.5 left-0.5 ${
                            privacySettings.storeDocuments ? 'translate-x-6' : ''
                          }`}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium text-heiba-blue mb-4">DSGVO-Einstellungen</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 mb-2 font-medium">Datenschutzerklärungen</p>
                  <p className="text-gray-600 text-sm mb-4">Legen Sie fest, welche Datenschutzerklärungen Bewerber akzeptieren müssen.</p>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <input type="checkbox" id="privacyPolicy" className="h-4 w-4" checked />
                    <label htmlFor="privacyPolicy" className="text-sm text-gray-700">Allgemeine Datenschutzerklärung (erforderlich)</label>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <input type="checkbox" id="cookiePolicy" className="h-4 w-4" checked />
                    <label htmlFor="cookiePolicy" className="text-sm text-gray-700">Cookie-Richtlinie (erforderlich)</label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="marketingConsent" className="h-4 w-4" />
                    <label htmlFor="marketingConsent" className="text-sm text-gray-700">Marketing-Einwilligung (optional)</label>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-heiba-blue text-white rounded-md hover:bg-heiba-blue/90 transition-colors"
                >
                  Speichern
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
