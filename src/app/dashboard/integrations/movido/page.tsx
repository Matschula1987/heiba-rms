'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Loader2, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Server, 
  Settings, 
  Database,
  List
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function MovidoAutomationPage() {
  const router = useRouter()
  
  // Konfigurationsstatus
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // Movido-Konfiguration
  const [config, setConfig] = useState({
    apiKey: '',
    apiSecret: '',
    companyId: '',
    defaultPremium: false,
    defaultTargetPortals: ['stepstone', 'indeed', 'monster'],
    autoLoginEnabled: true,
    sessionTimeoutMinutes: 120
  })
  
  // Job-Warteschlange
  const [queueItems, setQueueItems] = useState<any[]>([])
  
  // Veröffentlichungszyklen
  const [postingCycles, setPostingCycles] = useState<any[]>([])
  
  // Lade die Konfiguration beim ersten Rendern
  useEffect(() => {
    loadConfiguration()
  }, [])
  
  // Lade die Konfiguration von der API
  const loadConfiguration = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/job-portals/movido/config')
      
      if (!response.ok) {
        throw new Error('Fehler beim Laden der Movido-Konfiguration')
      }
      
      const data = await response.json()
      
      if (data.config) {
        setConfig({
          apiKey: data.config.apiKey || '',
          apiSecret: data.config.apiSecret || '',
          companyId: data.config.companyId || '',
          defaultPremium: data.config.defaultPremium || false,
          defaultTargetPortals: data.config.defaultTargetPortals || ['stepstone', 'indeed', 'monster'],
          autoLoginEnabled: data.config.autoLoginEnabled !== false,
          sessionTimeoutMinutes: data.config.sessionTimeoutMinutes || 120
        })
        setIsConnected(data.isConnected || false)
      }
      
      // Lade Job-Warteschlange und Veröffentlichungszyklen
      if (data.queueItems) {
        setQueueItems(data.queueItems)
      }
      
      if (data.postingCycles) {
        setPostingCycles(data.postingCycles)
      }
    } catch (error) {
      console.error('Fehler beim Laden der Movido-Konfiguration:', error)
      setError('Die Movido-Konfiguration konnte nicht geladen werden.')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Aktualisieren eines Feldes der Konfiguration
  const handleConfigChange = (field: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value
    }))
  }
  
  // Speichern der Konfiguration
  const handleSaveConfig = async () => {
    setIsSaving(true)
    setError(null)
    setSuccessMessage(null)
    
    try {
      const response = await fetch('/api/job-portals/movido/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ config })
      })
      
      if (!response.ok) {
        throw new Error('Fehler beim Speichern der Movido-Konfiguration')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setSuccessMessage('Die Movido-Konfiguration wurde erfolgreich gespeichert.')
        // Lade die aktualisierte Konfiguration
        loadConfiguration()
      } else {
        setError(data.error || 'Fehler beim Speichern der Konfiguration.')
      }
    } catch (error) {
      console.error('Fehler beim Speichern der Movido-Konfiguration:', error)
      setError('Die Movido-Konfiguration konnte nicht gespeichert werden.')
    } finally {
      setIsSaving(false)
    }
  }
  
  // Testen der Verbindung
  const handleTestConnection = async () => {
    setIsTestingConnection(true)
    setError(null)
    setSuccessMessage(null)
    
    try {
      const response = await fetch('/api/job-portals/movido/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ config })
      })
      
      if (!response.ok) {
        throw new Error('Fehler beim Testen der Movido-Verbindung')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setSuccessMessage('Die Verbindung zu Movido wurde erfolgreich getestet.')
        setIsConnected(true)
      } else {
        setError(data.error || 'Fehler bei der Verbindung zu Movido.')
        setIsConnected(false)
      }
    } catch (error) {
      console.error('Fehler beim Testen der Movido-Verbindung:', error)
      setError('Die Verbindung zu Movido konnte nicht getestet werden.')
      setIsConnected(false)
    } finally {
      setIsTestingConnection(false)
    }
  }
  
  // Formatieren eines Target-Portals-Arrays als String
  const formatTargetPortals = (portals: string[]) => {
    return portals.join(', ')
  }
  
  // Parsen eines Target-Portals-Strings als Array
  const parseTargetPortals = (portalsString: string) => {
    return portalsString.split(',').map(portal => portal.trim()).filter(Boolean)
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-heiba-blue" />
          <p className="text-sm text-gray-500">Lade Movido-Konfiguration...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-heiba-blue">Movido Automation</h1>
          <p className="text-gray-600">Konfigurieren Sie die Movido-Integration zur automatisierten Stellenveröffentlichung</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadConfiguration} 
            className="flex items-center space-x-1"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Aktualisieren
          </Button>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Fehler</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {successMessage && (
        <Alert className="mb-6 bg-green-50 border-green-400">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle>Erfolg</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="configuration" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="configuration">
            <Settings className="h-4 w-4 mr-2" />
            Konfiguration
          </TabsTrigger>
          <TabsTrigger value="queue">
            <List className="h-4 w-4 mr-2" />
            Job-Warteschlange
          </TabsTrigger>
          <TabsTrigger value="cycles">
            <RefreshCw className="h-4 w-4 mr-2" />
            Veröffentlichungszyklen
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="configuration">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Hauptkonfiguration */}
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle>Movido-Konfiguration</CardTitle>
                <CardDescription>
                  Geben Sie Ihre Movido-Zugangsdaten ein, um die Integration zu aktivieren
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="api-key">API-Schlüssel</Label>
                  <Input
                    id="api-key"
                    type="text"
                    value={config.apiKey}
                    onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                    placeholder="Ihr Movido API-Schlüssel"
                  />
                </div>
                
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="api-secret">API-Secret</Label>
                  <Input
                    id="api-secret"
                    type="password"
                    value={config.apiSecret}
                    onChange={(e) => handleConfigChange('apiSecret', e.target.value)}
                    placeholder="Ihr Movido API-Secret"
                  />
                </div>
                
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="company-id">Unternehmens-ID</Label>
                  <Input
                    id="company-id"
                    type="text"
                    value={config.companyId}
                    onChange={(e) => handleConfigChange('companyId', e.target.value)}
                    placeholder="Ihre Movido-Unternehmens-ID"
                  />
                </div>
                
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="target-portals">Standard-Zielportale</Label>
                  <Textarea
                    id="target-portals"
                    value={formatTargetPortals(config.defaultTargetPortals)}
                    onChange={(e) => handleConfigChange('defaultTargetPortals', parseTargetPortals(e.target.value))}
                    placeholder="stepstone, indeed, monster, xing, linkedin"
                  />
                  <p className="text-sm text-gray-500">
                    Geben Sie die Standard-Zielportale getrennt durch Kommas ein.
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="default-premium"
                    checked={config.defaultPremium}
                    onCheckedChange={(checked) => handleConfigChange('defaultPremium', checked)}
                  />
                  <Label htmlFor="default-premium">Premium-Stellenanzeigen als Standard verwenden</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-login"
                    checked={config.autoLoginEnabled}
                    onCheckedChange={(checked) => handleConfigChange('autoLoginEnabled', checked)}
                  />
                  <Label htmlFor="auto-login">Automatischen Login aktivieren</Label>
                </div>
                
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="session-timeout">Session-Timeout (Minuten)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    min="1"
                    max="1440"
                    value={config.sessionTimeoutMinutes}
                    onChange={(e) => handleConfigChange('sessionTimeoutMinutes', parseInt(e.target.value) || 120)}
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={handleTestConnection} 
                  disabled={isTestingConnection || !config.apiKey || !config.apiSecret || !config.companyId}
                >
                  {isTestingConnection ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verbindung testen...
                    </>
                  ) : (
                    'Verbindung testen'
                  )}
                </Button>
                
                <Button 
                  onClick={handleSaveConfig} 
                  disabled={isSaving || !config.apiKey || !config.apiSecret || !config.companyId}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Speichern...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Konfiguration speichern
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            {/* Verbindungsstatus */}
            <Card>
              <CardHeader>
                <CardTitle>Verbindungsstatus</CardTitle>
                <CardDescription>
                  Status der Verbindung zu Movido
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex items-center justify-center py-6">
                <div className="text-center">
                  {isConnected ? (
                    <>
                      <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-green-500 mb-1">Verbunden</h3>
                      <p className="text-sm text-gray-500">
                        Die Verbindung zu Movido ist aktiv.
                      </p>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-red-500 mb-1">Nicht verbunden</h3>
                      <p className="text-sm text-gray-500">
                        Keine aktive Verbindung zu Movido.
                      </p>
                    </>
                  )}
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleTestConnection}
                  disabled={isTestingConnection || !config.apiKey || !config.apiSecret || !config.companyId}
                >
                  <Server className="mr-2 h-4 w-4" />
                  Verbindungsstatus prüfen
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="queue">
          <Card>
            <CardHeader>
              <CardTitle>Job-Warteschlange</CardTitle>
              <CardDescription>
                Verwalten Sie die Warteschlange für die Veröffentlichung von Jobs
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {queueItems.length === 0 ? (
                <div className="text-center py-12">
                  <Database className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-500 mb-2">Keine Jobs in der Warteschlange</h3>
                  <p className="text-sm text-gray-500 max-w-md mx-auto">
                    Es befinden sich derzeit keine Jobs in der Movido-Veröffentlichungswarteschlange.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Job</th>
                        <th className="text-left py-2 px-4">Status</th>
                        <th className="text-left py-2 px-4">Geplant für</th>
                        <th className="text-left py-2 px-4">Portale</th>
                        <th className="text-left py-2 px-4">Aktionen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {queueItems.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-4">{item.jobTitle || item.jobId}</td>
                          <td className="py-2 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              item.status === 'completed' ? 'bg-green-100 text-green-800' :
                              item.status === 'failed' ? 'bg-red-100 text-red-800' :
                              item.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                              item.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {item.status === 'completed' ? 'Abgeschlossen' :
                               item.status === 'failed' ? 'Fehlgeschlagen' :
                               item.status === 'processing' ? 'In Bearbeitung' :
                               item.status === 'scheduled' ? 'Geplant' :
                               'Ausstehend'}
                            </span>
                          </td>
                          <td className="py-2 px-4">
                            {item.scheduledFor ? new Date(item.scheduledFor).toLocaleString('de-DE') : '-'}
                          </td>
                          <td className="py-2 px-4">
                            {item.targetPortals ? (
                              <div className="flex flex-wrap gap-1">
                                {JSON.parse(item.targetPortals).map((portal: string) => (
                                  <span key={portal} className="bg-gray-100 text-xs px-2 py-1 rounded">
                                    {portal}
                                  </span>
                                ))}
                              </div>
                            ) : '-'}
                          </td>
                          <td className="py-2 px-4">
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                Details
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
            
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={loadConfiguration}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Warteschlange aktualisieren
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="cycles">
          <Card>
            <CardHeader>
              <CardTitle>Veröffentlichungszyklen</CardTitle>
              <CardDescription>
                Verwalten Sie automatisierte Veröffentlichungszyklen für Ihre Jobs
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {postingCycles.length === 0 ? (
                <div className="text-center py-12">
                  <RefreshCw className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-500 mb-2">Keine Veröffentlichungszyklen</h3>
                  <p className="text-sm text-gray-500 max-w-md mx-auto">
                    Es wurden noch keine Veröffentlichungszyklen konfiguriert.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Name</th>
                        <th className="text-left py-2 px-4">Typ</th>
                        <th className="text-left py-2 px-4">Intervall</th>
                        <th className="text-left py-2 px-4">Portale</th>
                        <th className="text-left py-2 px-4">Status</th>
                        <th className="text-left py-2 px-4">Aktionen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {postingCycles.map((cycle) => (
                        <tr key={cycle.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-4">{cycle.name}</td>
                          <td className="py-2 px-4">{cycle.cycleType}</td>
                          <td className="py-2 px-4">{cycle.intervalDays} Tage</td>
                          <td className="py-2 px-4">
                            {cycle.platforms ? (
                              <div className="flex flex-wrap gap-1">
                                {JSON.parse(cycle.platforms).map((platform: string) => (
                                  <span key={platform} className="bg-gray-100 text-xs px-2 py-1 rounded">
                                    {platform}
                                  </span>
                                ))}
                              </div>
                            ) : '-'}
                          </td>
                          <td className="py-2 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              cycle.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {cycle.enabled ? 'Aktiv' : 'Inaktiv'}
                            </span>
                          </td>
                          <td className="py-2 px-4">
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                Bearbeiten
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={loadConfiguration}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Aktualisieren
              </Button>
              
              <Button>
                Neuen Zyklus erstellen
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
