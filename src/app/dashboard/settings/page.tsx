'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()
  // Kein activeTab mehr notwendig, da wir nur noch die allgemeinen Einstellungen anzeigen
  const [generalSettings, setGeneralSettings] = useState({
    companyName: 'HeiBa Recruitment GmbH',
    email: 'kontakt@heiba-recruitment.de',
    language: 'de',
    dateFormat: 'DD.MM.YYYY',
    timezone: 'Europe/Berlin'
  })
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    newApplications: true,
    statusChanges: true,
    matchAlerts: true,
    weeklyReport: true,
    marketingEmails: false
  })
  
  const [privacySettings, setPrivacySettings] = useState({
    dataRetention: '12',
    automaticDeletion: true,
    anonymizeData: false,
    shareAnalytics: true,
    storeDocuments: true
  })

  const handleGeneralSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // API-Aufruf würde hier erfolgen
    alert('Allgemeine Einstellungen gespeichert!')
  }

  const handleNotificationsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // API-Aufruf würde hier erfolgen
    alert('Benachrichtigungseinstellungen gespeichert!')
  }

  const handlePrivacySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // API-Aufruf würde hier erfolgen
    alert('Datenschutzeinstellungen gespeichert!')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 mt-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
          <h1 className="text-2xl font-bold text-[var(--primary-dark)]">Einstellungen</h1>
            <p className="text-gray-600 mt-1">Konfigurieren Sie Ihre Systemeinstellungen</p>
          </div>
        </div>

        {/* Hinweis auf die Unterseiten in der Sidebar */}
        <div className="mb-6 p-4 bg-blue-50 rounded-none border border-blue-100">
          <p className="text-blue-700 text-sm">
            Weitere Einstellungsbereiche finden Sie in den Unterseiten in der Sidebar.
          </p>
        </div>

        {/* Allgemeine Einstellungen */}
        <div className="bg-white rounded-none shadow-md p-6">
            <form onSubmit={handleGeneralSubmit}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-[var(--primary-dark)] mb-4">Allgemeine Einstellungen</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unternehmensname
                      </label>
                      <input
                        type="text"
                        value={generalSettings.companyName}
                        onChange={(e) => setGeneralSettings({...generalSettings, companyName: e.target.value})}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-heiba-blue/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        E-Mail-Adresse
                      </label>
                      <input
                        type="email"
                        value={generalSettings.email}
                        onChange={(e) => setGeneralSettings({...generalSettings, email: e.target.value})}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-heiba-blue/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sprache
                      </label>
                      <select
                        value={generalSettings.language}
                        onChange={(e) => setGeneralSettings({...generalSettings, language: e.target.value})}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-heiba-blue/20"
                      >
                        <option value="de">Deutsch</option>
                        <option value="en">Englisch</option>
                        <option value="fr">Französisch</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Datumsformat
                      </label>
                      <select
                        value={generalSettings.dateFormat}
                        onChange={(e) => setGeneralSettings({...generalSettings, dateFormat: e.target.value})}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-heiba-blue/20"
                      >
                        <option value="DD.MM.YYYY">DD.MM.YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Zeitzone
                      </label>
                      <select
                        value={generalSettings.timezone}
                        onChange={(e) => setGeneralSettings({...generalSettings, timezone: e.target.value})}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-heiba-blue/20"
                      >
                        <option value="Europe/Berlin">Europe/Berlin</option>
                        <option value="Europe/London">Europe/London</option>
                        <option value="America/New_York">America/New_York</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[var(--primary-dark)] text-white rounded-none hover:bg-[var(--primary-light)] transition-colors"
                  >
                    Speichern
                  </button>
                </div>
              </div>
            </form>
        </div>
      </main>
    </div>
  )
}
