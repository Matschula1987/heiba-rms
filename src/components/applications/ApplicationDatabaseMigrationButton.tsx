'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Check, Database, Loader2 } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

/**
 * Komponente, die einen Button zum Migrieren der Bewerbungstabellen in der Datenbank anzeigt
 */
export function ApplicationDatabaseMigrationButton() {
  const [loading, setLoading] = useState(false)
  const [tablesExist, setTablesExist] = useState(false)
  const [migrationSuccess, setMigrationSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [insertTestData, setInsertTestData] = useState(true)
  
  // Überprüfen, ob die Tabellen bereits existieren
  useEffect(() => {
    async function checkTablesExist() {
      try {
        const response = await fetch('/api/migrate-applications')
        const data = await response.json()
        
        if (data.success) {
          setTablesExist(data.exists)
        }
      } catch (err) {
        console.error('Fehler beim Überprüfen der Tabellen:', err)
      }
    }
    
    checkTablesExist()
  }, [])
  
  // Migration starten
  const handleMigration = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/migrate-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ insertTestData })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMigrationSuccess(true)
        setTablesExist(true)
        
        // Nach 3 Sekunden Erfolgsmeldung zurücksetzen
        setTimeout(() => {
          setMigrationSuccess(false)
        }, 3000)
      } else {
        setError(data.message || 'Unbekannter Fehler bei der Migration')
      }
    } catch (err) {
      console.error('Fehler bei der Migration:', err)
      setError('Verbindungsfehler bei der Migration')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="mb-6 p-4 border rounded-lg">
      <h3 className="text-lg font-medium mb-2">Bewerbungsdatenbank-Setup</h3>
      
      {tablesExist ? (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertTitle>Bereit</AlertTitle>
          <AlertDescription>
            Bewerbungstabellen sind bereits initialisiert und bereit zur Verwendung.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="mb-4 bg-amber-50 border-amber-200">
          <Database className="h-4 w-4 text-amber-600" />
          <AlertTitle>Setup erforderlich</AlertTitle>
          <AlertDescription>
            Die Bewerbungstabellen wurden noch nicht initialisiert. 
            Bitte klicken Sie auf die Schaltfläche unten, um die Tabellen zu erstellen.
          </AlertDescription>
        </Alert>
      )}
      
      {error && (
        <Alert className="mb-4 bg-red-50 border-red-200">
          <AlertTitle>Fehler</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {!tablesExist && (
        <div className="mb-4 flex items-center space-x-2">
          <Checkbox 
            id="insert-test-data"
            checked={insertTestData}
            onCheckedChange={(checked) => setInsertTestData(checked === true)}
          />
          <Label htmlFor="insert-test-data">Testdaten hinzufügen</Label>
        </div>
      )}
      
      <Button
        onClick={handleMigration}
        disabled={loading || tablesExist}
        className="bg-[var(--primary-dark)] hover:bg-[var(--primary-dark)]/90"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Migriere Datenbank...
          </>
        ) : migrationSuccess ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Erfolgreich migriert
          </>
        ) : tablesExist ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Bereits initialisiert
          </>
        ) : (
          <>
            <Database className="mr-2 h-4 w-4" />
            Bewerbungstabellen erstellen
          </>
        )}
      </Button>
    </div>
  )
}
