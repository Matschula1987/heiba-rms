'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { SocialMediaConfig, SocialMediaPlatform } from '@/lib/socialMedia/types'
import { api } from '@/lib/api'

export default function SocialMediaIntegrationsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [configs, setConfigs] = useState<SocialMediaConfig[]>([])
  const [activeTab, setActiveTab] = useState<string>('linkedin')
  
  // Hilfsfunktion für die Erstellung von Standardkonfigurationen
  const createDefaultConfig = (platform: SocialMediaPlatform): Partial<SocialMediaConfig> => {
    return {
      platform,
      apiKey: '',
      apiSecret: '',
      redirectUri: `https://heiba-recruitment.example.com/auth/${platform}/callback`,
      active: false,
      settings: {
        autoPost: false,
        postFrequency: 'manual',
        useCompanyAccount: true,
        allowComments: true
      }
    }
  }
  
  // Formular-Status für neue/zu bearbeitende Konfigurationen
  const [formData, setFormData] = useState<Record<SocialMediaPlatform, Partial<SocialMediaConfig>>>({
    linkedin: createDefaultConfig('linkedin'),
    xing: createDefaultConfig('xing'),
    facebook: createDefaultConfig('facebook'),
    instagram: createDefaultConfig('instagram')
  })
  
  // Lade Konfigurationen beim Laden der Seite
  useEffect(() => {
    loadConfigurations()
  }, [])
  
  const loadConfigurations = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.get('/api/social-media')
      
      if (response.success) {
        const configs = response.data.configs
        setConfigs(configs)
        
        // Aktualisiere das Formular mit den bestehenden Konfigurationen
        const updatedFormData = { ...formData }
        
        configs.forEach((config: SocialMediaConfig) => {
          updatedFormData[config.platform] = {
            ...config,
            apiSecret: '', // Leere das Passwort-Feld aus Sicherheitsgründen
          }
        })
        
        setFormData(updatedFormData)
      } else {
        setError('Fehler beim Laden der Konfigurationen')
      }
    } catch (err) {
      console.error('Fehler beim Laden der Social Media Konfigurationen:', err)
      setError('Fehler beim Laden der Konfigurationen')
    } finally {
      setLoading(false)
    }
  }
  
  const handleInputChange = (platform: SocialMediaPlatform, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value
      }
    }))
  }
  
  const handleSettingsChange = (platform: SocialMediaPlatform, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        settings: {
          ...prev[platform].settings,
          [field]: value
        }
      }
    }))
  }
  
  const saveConfiguration = async (platform: SocialMediaPlatform) => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      const config = formData[platform] as SocialMediaConfig
      
      if (!config.apiKey) {
        setError('API-Schlüssel ist erforderlich')
        setLoading(false)
        return
      }
      
      if (!config.apiSecret) {
        const existingConfig = configs.find(c => c.platform === platform)
        if (!existingConfig) {
          setError('API-Secret ist erforderlich')
          setLoading(false)
          return
        }
      }
      
      const response = await api.post('/api/social-media', {
        action: 'configure',
        config
      })
      
      if (response.success) {
        setSuccess(`${getPlatformLabel(platform)} wurde erfolgreich konfiguriert`)
        loadConfigurations()
      } else {
        setError(response.error || 'Fehler beim Speichern der Konfiguration')
      }
    } catch (err) {
      console.error('Fehler beim Speichern der Social Media Konfiguration:', err)
      setError('Fehler beim Speichern der Konfiguration')
    } finally {
      setLoading(false)
    }
  }
  
  const removePlatform = async (platform: SocialMediaPlatform) => {
    if (!confirm(`Sind Sie sicher, dass Sie die Integration mit ${getPlatformLabel(platform)} entfernen möchten?`)) {
      return
    }
    
    setLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      const response = await api.post('/api/social-media', {
        action: 'remove',
        platform
      })
      
      if (response.success) {
        setSuccess(`${getPlatformLabel(platform)} wurde erfolgreich entfernt`)
        loadConfigurations()
      } else {
        setError(response.error || 'Fehler beim Entfernen der Plattform')
      }
    } catch (err) {
      console.error('Fehler beim Entfernen der Social Media Plattform:', err)
      setError('Fehler beim Entfernen der Plattform')
    } finally {
      setLoading(false)
    }
  }
  
  const testConnection = async (platform: SocialMediaPlatform) => {
    // Hier würden wir zuerst die Konfiguration speichern
    // und dann die Verbindung testen
    await saveConfiguration(platform)
  }
  
  const getPlatformLabel = (platform: SocialMediaPlatform): string => {
    switch (platform) {
      case 'linkedin': return 'LinkedIn'
      case 'xing': return 'XING'
      case 'facebook': return 'Facebook'
      case 'instagram': return 'Instagram'
      default: return platform
    }
  }
  
  const getPlatformIcon = (platform: SocialMediaPlatform): string => {
    switch (platform) {
      case 'linkedin': return 'fab fa-linkedin'
      case 'xing': return 'fab fa-xing'
      case 'facebook': return 'fab fa-facebook'
      case 'instagram': return 'fab fa-instagram'
      default: return 'fas fa-globe'
    }
  }
  
  const isConfigured = (platform: SocialMediaPlatform): boolean => {
    return configs.some(config => config.platform === platform && config.active)
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Social Media Integrationen</h1>
          <p className="text-gray-600">Verbinden Sie das Recruitment-System mit Social Media Plattformen</p>
        </div>
        <Button
          onClick={loadConfigurations}
          variant="outline"
          disabled={loading}
        >
          <i className="fas fa-sync-alt mr-2"></i>
          Aktualisieren
        </Button>
      </div>
      
      {error && (
        <Alert className="mb-6 bg-red-50 border-red-200">
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <AlertDescription className="text-green-700">
            {success}
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="linkedin" className="flex items-center">
            <i className="fab fa-linkedin mr-2"></i>
            LinkedIn
            {isConfigured('linkedin') && (
              <span className="ml-2 h-2 w-2 rounded-full bg-green-500"></span>
            )}
          </TabsTrigger>
          <TabsTrigger value="xing" className="flex items-center">
            <i className="fab fa-xing mr-2"></i>
            XING
            {isConfigured('xing') && (
              <span className="ml-2 h-2 w-2 rounded-full bg-green-500"></span>
            )}
          </TabsTrigger>
          <TabsTrigger value="facebook" className="flex items-center">
            <i className="fab fa-facebook mr-2"></i>
            Facebook
            {isConfigured('facebook') && (
              <span className="ml-2 h-2 w-2 rounded-full bg-green-500"></span>
            )}
          </TabsTrigger>
          <TabsTrigger value="instagram" className="flex items-center">
            <i className="fab fa-instagram mr-2"></i>
            Instagram
            {isConfigured('instagram') && (
              <span className="ml-2 h-2 w-2 rounded-full bg-green-500"></span>
            )}
          </TabsTrigger>
        </TabsList>
        
        {(['linkedin', 'xing', 'facebook', 'instagram'] as SocialMediaPlatform[]).map((platform) => (
          <TabsContent key={platform} value={platform}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className={`${getPlatformIcon(platform)} mr-2`}></i>
                  {getPlatformLabel(platform)} Integration
                </CardTitle>
                <CardDescription>
                  Konfigurieren Sie die Integration mit {getPlatformLabel(platform)} für die Veröffentlichung von Stellenanzeigen und die Suche nach Kandidaten.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">API-Konfiguration</h3>
                    
                    <div className="space-y-2">
                      <Label>Aktiv</Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={!!formData[platform]?.active}
                          onCheckedChange={(checked) => handleInputChange(platform, 'active', checked)}
                        />
                        <span className="text-sm text-gray-500">
                          {formData[platform]?.active ? 'Integration ist aktiv' : 'Integration ist inaktiv'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`${platform}-api-key`}>API-Schlüssel</Label>
                      <Input
                        id={`${platform}-api-key`}
                        value={formData[platform]?.apiKey || ''}
                        onChange={(e) => handleInputChange(platform, 'apiKey', e.target.value)}
                        placeholder="Ihr API-Schlüssel"
                      />
                      <p className="text-xs text-gray-500">
                        Der API-Schlüssel für den Zugriff auf die {getPlatformLabel(platform)}-API.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`${platform}-api-secret`}>API-Secret</Label>
                      <Input
                        id={`${platform}-api-secret`}
                        type="password"
                        value={formData[platform]?.apiSecret || ''}
                        onChange={(e) => handleInputChange(platform, 'apiSecret', e.target.value)}
                        placeholder={configs.some(c => c.platform === platform) ? '••••••••' : 'Ihr API-Secret'}
                      />
                      <p className="text-xs text-gray-500">
                        Das API-Secret für die Authentifizierung. Lassen Sie dieses Feld leer, wenn Sie das bestehende Secret beibehalten möchten.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`${platform}-redirect-uri`}>Redirect-URI</Label>
                      <Input
                        id={`${platform}-redirect-uri`}
                        value={formData[platform]?.redirectUri || ''}
                        onChange={(e) => handleInputChange(platform, 'redirectUri', e.target.value)}
                        placeholder="https://example.com/auth/callback"
                      />
                      <p className="text-xs text-gray-500">
                        Die URI, zu der {getPlatformLabel(platform)} nach der Authentifizierung umleitet.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Integrations-Einstellungen</h3>
                    
                    <div className="space-y-2">
                      <Label>Automatisches Posten</Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={!!formData[platform]?.settings?.autoPost}
                          onCheckedChange={(checked) => handleSettingsChange(platform, 'autoPost', checked)}
                        />
                        <span className="text-sm text-gray-500">
                          {formData[platform]?.settings?.autoPost 
                            ? 'Neue Stellenanzeigen werden automatisch gepostet' 
                            : 'Stellenanzeigen werden manuell gepostet'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`${platform}-post-frequency`}>Post-Häufigkeit</Label>
                      <select
                        id={`${platform}-post-frequency`}
                        value={formData[platform]?.settings?.postFrequency || 'manual'}
                        onChange={(e) => handleSettingsChange(platform, 'postFrequency', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        disabled={!formData[platform]?.settings?.autoPost}
                      >
                        <option value="manual">Manuell</option>
                        <option value="daily">Täglich</option>
                        <option value="weekly">Wöchentlich</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Unternehmensaccount verwenden</Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={!!formData[platform]?.settings?.useCompanyAccount}
                          onCheckedChange={(checked) => handleSettingsChange(platform, 'useCompanyAccount', checked)}
                        />
                        <span className="text-sm text-gray-500">
                          {formData[platform]?.settings?.useCompanyAccount 
                            ? 'Unternehmensaccount wird verwendet' 
                            : 'Persönlicher Account wird verwendet'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`${platform}-post-template`}>Beitrags-Vorlage</Label>
                      <Textarea
                        id={`${platform}-post-template`}
                        value={formData[platform]?.settings?.postTemplate || ''}
                        onChange={(e) => handleSettingsChange(platform, 'postTemplate', e.target.value)}
                        placeholder="{{companyName}} sucht: {{jobTitle}} in {{location}}\n\n{{description}}\n\nBewerben Sie sich jetzt: {{applyUrl}}"
                        rows={5}
                      />
                      <p className="text-xs text-gray-500">
                        Verfügbare Platzhalter: {'{{'} jobTitle {'}},'} {'{{'} companyName {'}},'} {'{{'} location {'}},'} {'{{'} description {'}},'} {'{{'} applyUrl {'}}'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div>
                  {isConfigured(platform) && (
                    <Button
                      variant="destructive"
                      onClick={() => removePlatform(platform)}
                      disabled={loading}
                    >
                      <i className="fas fa-trash-alt mr-2"></i>
                      Integration entfernen
                    </Button>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => testConnection(platform)}
                    disabled={loading || !formData[platform]?.apiKey}
                  >
                    <i className="fas fa-plug mr-2"></i>
                    Verbindung testen
                  </Button>
                  <Button
                    onClick={() => saveConfiguration(platform)}
                    disabled={loading || !formData[platform]?.apiKey}
                  >
                    <i className="fas fa-save mr-2"></i>
                    Speichern
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
