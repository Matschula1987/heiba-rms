'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { JobPortalStatus } from '@/lib/jobPortals/types'
import { SettingsIcon, InfoIcon, CheckCircle, AlertCircle, Globe } from 'lucide-react'

interface JobPortalCardProps {
  portal: JobPortalStatus
  config: any
  onToggleEnabled: (key: string, enabled: boolean) => Promise<void>
  onConfigureClick: (key: string) => void
}

export default function JobPortalCard({ 
  portal, 
  config, 
  onToggleEnabled, 
  onConfigureClick 
}: JobPortalCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  const handleToggle = async (enabled: boolean) => {
    setIsLoading(true)
    try {
      await onToggleEnabled(portal.key, enabled)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <Card className="overflow-hidden border border-gray-200 shadow-md">
      <CardHeader className="bg-white border-b border-gray-100 pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-md bg-[var(--primary-dark)]/5 shadow-sm border border-[var(--primary-dark)]/10">
              <Globe className="w-6 h-6 text-[var(--primary-dark)]" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-[var(--primary-dark)]">{portal.name}</CardTitle>
              <CardDescription className="text-xs text-gray-600">
                {portal.enabled ? 'Aktiv' : 'Inaktiv'}
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {portal.configured ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 shadow-sm">
                <CheckCircle className="w-3 h-3 mr-1" />
                Konfiguriert
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 shadow-sm">
                <AlertCircle className="w-3 h-3 mr-1" />
                Nicht konfiguriert
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4 bg-white">
        <div className="prose prose-sm max-w-none text-sm text-gray-700">
          {getPortalDescription(portal.key)}
        </div>
        
        {portal.lastError && (
          <div className="mt-3 p-3 bg-red-50 text-red-700 text-xs rounded-md border border-red-200 shadow-sm">
            <p className="font-medium">Letzter Fehler:</p>
            <p>{portal.lastError}</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t px-6 py-4 bg-gray-50 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Switch 
              checked={portal.enabled} 
              disabled={isLoading}
              onCheckedChange={handleToggle}
              className="data-[state=checked]:bg-[var(--accent)] data-[state=checked]:border-[var(--accent)]"
            />
            <span className="text-sm font-medium text-gray-700">
              {portal.enabled ? 'Aktiviert' : 'Deaktiviert'}
            </span>
          </div>
        </div>
        
        <Button 
          onClick={() => onConfigureClick(portal.key)}
          className="bg-[var(--primary-dark)] hover:bg-[var(--primary-light)] text-white shadow-md flex items-center rounded-md transition-colors"
        >
          <SettingsIcon className="w-4 h-4 mr-1.5" />
          Konfigurieren
        </Button>
      </CardFooter>
    </Card>
  )
}

// Hilfsfunktion zur Anzeige der Portal-Beschreibung
function getPortalDescription(key: string): string {
  switch (key) {
    case 'indeed':
      return 'Indeed ist eine der weltweit größten Jobbörsen. Veröffentlichen Sie Ihre Stellenanzeigen kostenlos über den XML-Feed.';
    case 'google_jobs':
      return 'Google for Jobs ist ein Job-Suchdienst von Google. Ihre Stellen werden in Google-Suchergebnissen angezeigt.';
    case 'arbeitsagentur':
      return 'Die Bundesagentur für Arbeit ist die größte Jobbörse in Deutschland. Veröffentlichen Sie Ihre Stellen direkt über die API.';
    default:
      return 'Integrieren Sie Ihre Stellenanzeigen mit diesem Jobportal.';
  }
}
