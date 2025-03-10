'use client'

import React from 'react'
import ApplicationList from '@/components/applications/ApplicationList'
import { ApplicationDatabaseMigrationButton } from '@/components/applications/ApplicationDatabaseMigrationButton'

export default function ApplicationsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2 text-[var(--primary-dark)]">Bewerbungsverwaltung</h1>
          <p className="text-gray-600 mb-4">
            Verwalten Sie eingehende Bewerbungen, verfolgen Sie den Status und konvertieren Sie 
            passende Bewerber zu Kandidaten.
          </p>
          
          <div className="p-4 bg-white rounded-md shadow mb-6">
            <h2 className="text-lg font-semibold mb-2">Datenbankeinrichtung</h2>
            <p className="text-sm text-gray-600 mb-4">
              Um die Bewerbungsverwaltung zu nutzen, muss die Datenbank eingerichtet werden. 
              Optional können Testdaten hinzugefügt werden, um die Funktionalität zu testen.
            </p>
            <ApplicationDatabaseMigrationButton />
          </div>
        </div>
        
        <ApplicationList />
      </div>
    </div>
  )
}
