'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Globe, RefreshCw, Settings, AlertTriangle } from 'lucide-react'
import { JobPortalStatus } from '@/lib/jobPortals/types'
import JobPortalCard from '@/components/integrations/JobPortalCard'
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function JobPortalsIntegrationPage() {
  const router = useRouter()
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [portals, setPortals] = useState<JobPortalStatus[]>([])
  const [portalConfigs, setPortalConfigs] = useState<Record<string, any>>({})
  
  // Dialog-State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPortalKey, setSelectedPortalKey] = useState<string | null>(null)
  const [configForm, setConfigForm] = useState<Record<string, any>>({})
  const [isSaving, setIsSaving] = useState(false)
  
  // Lade Portal-Informationen
  const fetchPortals = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/job-portals')
      if (!response.ok) {
        throw new Error('Fehler beim Laden der Jobportale')
      }
      
      const data = await response.json()
      setPortals(data.portals || [])
      setPortalConfigs(data.config || {})
    } catch (error) {
      console.error('Fehler beim Laden der Jobportale:', error)
      setError('Die Jobportale konnten nicht geladen werden. Bitte versuchen Sie es später erneut.')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Lade Portal-Informationen beim ersten Render
  useEffect(() => {
    fetchPortals()
  }, [])
  
  // Toggle Portal-Aktivierung
  const handleToggleEnabled = async (key: string, enabled: boolean) => {
    try {
      const response = await fetch('/api/job-portals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [key]: { enabled }
        })
      })
      
      if (!response.ok) {
        throw new Error('Fehler beim Aktualisieren des Portals')
      }
      
      const data = await response.json()
      setPortals(data.portals || [])
      
      // Aktualisiere auch die lokalen Konfigurationen
      setPortalConfigs(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          enabled
        }
      }))
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Portals:', error)
      alert('Fehler beim Aktualisieren des Portals. Bitte versuchen Sie es später erneut.')
    }
  }
  
  // Öffne Konfigurations-Dialog oder navigiere zu spezieller Konfigurationsseite
  const handleConfigureClick = (key: string) => {
    // Für spezielle Portale zu dedizierten Konfigurationsseiten navigieren
    if (key === 'movido') {
      router.push('/dashboard/integrations/movido')
      return
    }
    
    if (key === 'rss_feed') {
      router.push('/dashboard/integrations/rss-feeds')
      return
    }
    
    if (key === 'index_anzeigen') {
      // Für Index Anzeigendaten eine detailliertere Konfiguration anbieten
      const adapter = portals.find(p => p.key === key)
      if (adapter) {
        setSelectedPortalKey(key)
        
        // Aktuelle Konfiguration laden
        const currentConfig = portalConfigs[key] || {}
        setConfigForm(currentConfig)
        
        setIsDialogOpen(true)
      }
      return
    }
    
    setSelectedPortalKey(key)
    
    // Aktuelle Konfiguration laden
    const currentConfig = portalConfigs[key] || {}
    setConfigForm(currentConfig)
    
    setIsDialogOpen(true)
  }
  
  // Speichere Konfiguration
  const handleSaveConfig = async () => {
    if (!selectedPortalKey) return
    
    setIsSaving(true)
    
    try {
      const response = await fetch('/api/job-portals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [selectedPortalKey]: configForm
        })
      })
      
      if (!response.ok) {
        throw new Error('Fehler beim Speichern der Konfiguration')
      }
      
      const data = await response.json()
      setPortals(data.portals || [])
      
      // Aktualisiere auch die lokalen Konfigurationen
      setPortalConfigs(prev => ({
        ...prev,
        [selectedPortalKey]: configForm
      }))
      
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Fehler beim Speichern der Konfiguration:', error)
      alert('Fehler beim Speichern der Konfiguration. Bitte versuchen Sie es später erneut.')
    } finally {
      setIsSaving(false)
    }
  }
  
  // Renderingsfunktion für portalspezifische Konfigurationen
  const renderPortalConfigFields = () => {
    if (!selectedPortalKey) return null
    
    switch (selectedPortalKey) {
      case 'indeed':
        return (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Indeed bietet einen kostenlosen XML-Feed für Stellenanzeigen. Für größere Unternehmen bietet Indeed auch eine API an.
            </p>
            <div className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="indeed-company-name">Unternehmensname</Label>
                <Input
                  id="indeed-company-name"
                  value={configForm.companyName || ''}
                  onChange={(e) => setConfigForm({ ...configForm, companyName: e.target.value })}
                />
              </div>
              
              <div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="indeed-auto-refresh"
                    checked={configForm.autoRefresh || false}
                    onCheckedChange={(checked) => setConfigForm({ 
                      ...configForm, 
                      autoRefresh: checked === true 
                    })}
                  />
                  <Label htmlFor="indeed-auto-refresh">Automatisch aktualisieren (alle 24h)</Label>
                </div>
              </div>
            </div>
          </>
        )
      
      case 'google_jobs':
        return (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Google for Jobs benötigt keine spezielle Konfiguration. Stelle sicher, dass deine Webseite das
              Schema.org JobPosting Format verwendet, damit Google deine Stellen finden kann.
            </p>
            <div className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="google-site-url">Website URL</Label>
                <Input
                  id="google-site-url"
                  value={configForm.siteUrl || ''}
                  onChange={(e) => setConfigForm({ ...configForm, siteUrl: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </>
        )
      
      case 'arbeitsagentur':
        return (
          <>
            <Alert className="mb-4" variant="warning">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Authentifizierung erforderlich</AlertTitle>
              <AlertDescription>
                Die Bundesagentur für Arbeit benötigt eine Partner-ID und einen API-Schlüssel.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="arbeitsagentur-partner-id">Partner-ID</Label>
                <Input
                  id="arbeitsagentur-partner-id"
                  value={configForm.partnerId || ''}
                  onChange={(e) => setConfigForm({ ...configForm, partnerId: e.target.value })}
                />
              </div>
              
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="arbeitsagentur-api-key">API-Schlüssel</Label>
                <Input
                  id="arbeitsagentur-api-key"
                  type="password"
                  value={configForm.apiKey || ''}
                  onChange={(e) => setConfigForm({ ...configForm, apiKey: e.target.value })}
                />
              </div>
              
              <div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="arbeitsagentur-auto-republish"
                    checked={configForm.autoRepublish || false}
                    onCheckedChange={(checked) => setConfigForm({ 
                      ...configForm, 
                      autoRepublish: checked === true 
                    })}
                  />
                  <Label htmlFor="arbeitsagentur-auto-republish">
                    Automatisch neu veröffentlichen (alle 30 Tage)
                  </Label>
                </div>
              </div>
            </div>
          </>
        )
      
      case 'movido':
        return (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Movido ermöglicht das Veröffentlichen von Stellenanzeigen auf mehreren Jobportalen gleichzeitig.
              Die umfangreichen Konfigurationsoptionen sind auf einer speziellen Seite verfügbar.
            </p>
            <div className="text-center py-4">
              <Button onClick={() => router.push('/dashboard/integrations/movido')}>
                Zu den Movido-Einstellungen
              </Button>
            </div>
          </>
        )
        
      case 'index_anzeigen':
        return (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Index Anzeigendaten ist eine Plattform zur Veröffentlichung von Stellenanzeigen in 
              Deutschland. Veröffentlichen Sie Ihre Stellen direkt über die API.
            </p>
            <div className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="index-api-key">API-Schlüssel</Label>
                <Input
                  id="index-api-key"
                  type="password"
                  value={configForm.apiKey || ''}
                  onChange={(e) => setConfigForm({ ...configForm, apiKey: e.target.value })}
                  placeholder="Ihr API-Schlüssel für Index Anzeigendaten"
                />
              </div>
              
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="index-company-id">Unternehmens-ID</Label>
                <Input
                  id="index-company-id"
                  value={configForm.companyId || ''}
                  onChange={(e) => setConfigForm({ ...configForm, companyId: e.target.value })}
                  placeholder="Ihre Unternehmens-ID"
                />
              </div>
              
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="index-api-endpoint">API-Endpunkt (optional)</Label>
                <Input
                  id="index-api-endpoint"
                  value={configForm.apiEndpoint || ''}
                  onChange={(e) => setConfigForm({ ...configForm, apiEndpoint: e.target.value })}
                  placeholder="https://api.index-anzeigen.de/v1/"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Nur ändern, wenn Sie einen anderen Endpunkt verwenden möchten.
                </p>
              </div>
              
              <div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="index-auto-sync"
                    checked={configForm.autoSync || false}
                    onCheckedChange={(checked) => setConfigForm({ 
                      ...configForm, 
                      autoSync: checked === true 
                    })}
                  />
                  <Label htmlFor="index-auto-sync">
                    Automatische Synchronisierung (täglich)
                  </Label>
                </div>
              </div>
            </div>
          </>
        )
        
      default:
        return (
          <p className="text-sm text-gray-500">
            Keine speziellen Konfigurationsoptionen für dieses Portal verfügbar.
          </p>
        )
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-heiba-blue" />
          <p className="text-sm text-gray-500">Lade Jobportale...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-heiba-blue">Jobportale</h1>
          <p className="text-gray-600">Verbinden Sie Ihr System mit Jobportalen und veröffentlichen Sie Stellen automatisiert.</p>
        </div>
        
        <Button variant="outline" size="sm" onClick={fetchPortals} className="flex items-center space-x-1">
          <RefreshCw className="h-4 w-4 mr-1" />
          Aktualisieren
        </Button>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Fehler</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portals.map(portal => (
          <JobPortalCard
            key={portal.key}
            portal={portal}
            config={portalConfigs[portal.key] || {}}
            onToggleEnabled={handleToggleEnabled}
            onConfigureClick={handleConfigureClick}
          />
        ))}
      </div>
      
      {/* Konfigurations-Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedPortalKey && portals.find(p => p.key === selectedPortalKey)?.name} - Konfiguration
            </DialogTitle>
            <DialogDescription>
              Konfigurieren Sie die Integration mit diesem Jobportal.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {renderPortalConfigFields()}
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              disabled={isSaving}
            >
              Abbrechen
            </Button>
            <Button 
              type="button" 
              onClick={handleSaveConfig}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Speichern...
                </>
              ) : (
                'Speichern'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
