'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MonicaAIConfig } from '@/types/monicaAI'

export default function MonicaAIConfigPage() {
  const router = useRouter()
  const [config, setConfig] = useState<MonicaAIConfig>({
    apiKey: '',
    apiEndpoint: 'https://api.monica-ai.com/v1',
    language: 'de'
  })
  
  const [configStatus, setConfigStatus] = useState<{
    isConfigured: boolean;
    message: string;
  }>({
    isConfigured: false,
    message: 'Wird geladen...'
  })
  
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    message?: string;
  }>({})
  
  const [isSaving, setIsSaving] = useState(false)
  const [saveResult, setSaveResult] = useState<{
    success?: boolean;
    message?: string;
  }>({})
  
  // Konfiguration laden
  useEffect(() => {
    async function loadConfig() {
      try {
        const response = await fetch('/api/monica-ai/config')
        if (!response.ok) {
          throw new Error(`Fehler beim Laden der Konfiguration: ${response.status}`)
        }
        
        const data = await response.json()
        
        // Config aktualisieren
        setConfig(data.config)
        
        // Status aktualisieren
        setConfigStatus(data.status)
      } catch (error) {
        console.error('Fehler beim Laden der Konfiguration:', error)
        setConfigStatus({
          isConfigured: false,
          message: 'Fehler beim Laden der Konfiguration'
        })
      }
    }
    
    loadConfig()
  }, [])
  
  // Konfiguration speichern
  const saveConfig = async () => {
    try {
      setIsSaving(true)
      setSaveResult({})
      
      const response = await fetch('/api/monica-ai/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      })
      
      if (!response.ok) {
        throw new Error(`Fehler beim Speichern der Konfiguration: ${response.status}`)
      }
      
      const data = await response.json()
      
      setSaveResult({
        success: true,
        message: 'Konfiguration erfolgreich gespeichert'
      })
      
      // Status aktualisieren
      setConfigStatus(data.status)
    } catch (error) {
      console.error('Fehler beim Speichern der Konfiguration:', error)
      setSaveResult({
        success: false,
        message: `Fehler beim Speichern: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`
      })
    } finally {
      setIsSaving(false)
    }
  }
  
  // Test der Konfiguration
  const testConfig = async () => {
    try {
      setIsTesting(true)
      setTestResult({})
      
      // Einfachen Test durchführen
      const response = await fetch('/api/monica-ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          // Beispiel-Dokument-URL für Test
          documentUrl: 'https://example.com/test-resume.pdf'
        })
      })
      
      const data = await response.json()
      
      if (response.ok && data.requestId) {
        setTestResult({
          success: true,
          message: `Test erfolgreich: Anfrage-ID ${data.requestId} erstellt`
        })
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Unbekannter Fehler beim Testen der Verbindung'
        })
      }
    } catch (error) {
      console.error('Fehler beim Testen der Konfiguration:', error)
      setTestResult({
        success: false,
        message: `Fehler beim Testen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`
      })
    } finally {
      setIsTesting(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-heiba-blue">Monica AI Integration</h1>
          <p className="text-gray-600 mt-1">Konfigurieren Sie die Lebenslaufanalyse mit Monica AI</p>
        </div>
        
        {/* Statusanzeige */}
        <div className={`p-4 mb-6 rounded-lg ${configStatus.isConfigured ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800'}`}>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${configStatus.isConfigured ? 'bg-green-500' : 'bg-amber-500'}`}></div>
            <span className="font-medium">Status:</span>
            <span className="ml-2">{configStatus.message}</span>
          </div>
        </div>
        
        {/* Konfigurationsformular */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <Tabs defaultValue="settings" className="w-full">
            <div className="px-6 pt-6 border-b">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="settings">Einstellungen</TabsTrigger>
                <TabsTrigger value="test">Test & Diagnose</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="settings" className="p-6">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="apiKey" className="text-base">API-Schlüssel</Label>
                  <div className="mt-1">
                    <Input
                      id="apiKey"
                      type="password"
                      value={config.apiKey || ''}
                      onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                      placeholder="Monica AI API-Schlüssel eingeben"
                      className="w-full"
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Den API-Schlüssel finden Sie in Ihrem Monica AI Dashboard unter "API-Zugang".
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="apiEndpoint" className="text-base">API-Endpunkt</Label>
                  <div className="mt-1">
                    <Input
                      id="apiEndpoint"
                      type="text"
                      value={config.apiEndpoint || 'https://api.monica-ai.com/v1'}
                      onChange={(e) => setConfig({ ...config, apiEndpoint: e.target.value })}
                      placeholder="https://api.monica-ai.com/v1"
                      className="w-full"
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    In der Regel müssen Sie diese Einstellung nicht ändern.
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="language" className="text-base">Sprache</Label>
                  <div className="mt-1">
                    <select
                      id="language"
                      value={config.language || 'de'}
                      onChange={(e) => setConfig({ ...config, language: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-heiba-blue focus:border-heiba-blue"
                    >
                      <option value="de">Deutsch</option>
                      <option value="en">Englisch</option>
                      <option value="fr">Französisch</option>
                      <option value="es">Spanisch</option>
                    </select>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Bevorzugte Sprache für die Analyse und die Antworten.
                  </p>
                </div>
                
                {/* Bei Bedarf weitere Einstellungen hier */}
                
                {saveResult.message && (
                  <Alert
                    className={`mt-4 ${saveResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}
                  >
                    {saveResult.message}
                  </Alert>
                )}
                
                <div className="flex justify-end">
                  <Button
                    onClick={saveConfig}
                    disabled={isSaving}
                    className="bg-heiba-blue hover:bg-blue-700 text-white"
                  >
                    {isSaving ? 'Wird gespeichert...' : 'Speichern'}
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="test" className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Verbindungstest</h3>
                  <p className="text-gray-500 mt-1">
                    Testen Sie die Verbindung zu Monica AI, um sicherzustellen, dass Ihre Konfiguration korrekt ist.
                  </p>
                  
                  <div className="mt-4">
                    <Button
                      onClick={testConfig}
                      disabled={isTesting || !configStatus.isConfigured}
                      className="bg-heiba-blue hover:bg-blue-700 text-white"
                    >
                      {isTesting ? 'Test wird durchgeführt...' : 'Verbindung testen'}
                    </Button>
                    
                    {!configStatus.isConfigured && (
                      <p className="mt-2 text-amber-600 text-sm">
                        Bitte zuerst einen API-Schlüssel unter "Einstellungen" konfigurieren.
                      </p>
                    )}
                  </div>
                  
                  {testResult.message && (
                    <Alert
                      className={`mt-4 ${testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}
                    >
                      {testResult.message}
                    </Alert>
                  )}
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium">Diagnose-Informationen</h3>
                  <div className="mt-4 bg-gray-50 p-4 rounded-md">
                    <p><span className="font-medium">Status:</span> {configStatus.isConfigured ? 'Konfiguriert' : 'Nicht konfiguriert'}</p>
                    <p><span className="font-medium">API-Endpunkt:</span> {config.apiEndpoint}</p>
                    <p><span className="font-medium">Sprache:</span> {config.language === 'de' ? 'Deutsch' : config.language === 'en' ? 'Englisch' : config.language}</p>
                    <p><span className="font-medium">API-Schlüssel:</span> {config.apiKey ? '•••••••••• (gesetzt)' : 'Nicht gesetzt'}</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Information zu Monica AI */}
        <div className="mt-8 bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold text-heiba-blue mb-2">Über Monica AI</h2>
          <p className="text-gray-700 mb-4">
            Monica AI ist eine KI-gestützte Plattform, die Lebensläufe automatisch analysiert und wichtige Informationen extrahiert.
            Diese Integration ermöglicht es Ihnen, Kandidatendaten automatisch zu erfassen und zu verarbeiten.
          </p>
          
          <h3 className="text-lg font-medium text-heiba-blue mb-2">Funktionen</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
            <li>Automatische Extraktion von Kontaktdaten, Fähigkeiten und Berufserfahrung</li>
            <li>Erkennung von Ausbildung, Zertifizierungen und Sprachkenntnissen</li>
            <li>Intelligentes Matching von Kandidaten zu offenen Stellen</li>
            <li>Unterstützung für verschiedene Dokumentformate (PDF, DOCX, TXT)</li>
          </ul>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-gray-500 text-sm">
              Noch kein Monica AI-Konto? <a href="https://www.monica-ai.com" target="_blank" rel="noopener noreferrer" className="text-heiba-blue hover:underline">Besuchen Sie die Monica AI-Website</a>, um mehr zu erfahren und ein Konto zu erstellen.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
