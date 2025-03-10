'use client'

import { useEffect, useState } from 'react'
import { useNotificationSettingsStore } from '@/store/notificationSettingsStore'
import { NotificationFrequency, AILevel, NotificationImportance } from '@/types/notifications'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AlertCircle, Bell, BellOff, Clock, Zap, Bot } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function NotificationsSettingsPage() {
  const { settings, isLoading, error, fetchSettings, updateSettings, resetSettings } = useNotificationSettingsStore()
  
  // Lokaler State für die Formularwerte
  const [formValues, setFormValues] = useState({
    // Kanäle
    emailEnabled: true,
    pushEnabled: true,
    smsEnabled: false,
    
    // Typen
    notifyFollowup: true,
    notifyApplications: true,
    notifyStatusChanges: true,
    notifyDueActions: true,
    notifyProfileSending: true,
    notifyMatchings: true,
    
    // Häufigkeit
    frequency: 'instant' as NotificationFrequency,
    
    // Ruhige Zeiten
    quietHoursStart: '',
    quietHoursEnd: '',
    weekendDisabled: false,
    
    // Priorität
    minPriority: 'normal' as NotificationImportance,
    
    // KI-Modus
    aiModeEnabled: false,
    aiModeLevel: 'assist' as AILevel,
    aiFailureNotification: true
  })
  
  // Lade die Einstellungen beim Laden der Seite
  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])
  
  // Aktualisiere den lokalen State, wenn Settings geladen werden
  useEffect(() => {
    if (settings) {
      setFormValues({
        emailEnabled: settings.emailEnabled,
        pushEnabled: settings.pushEnabled,
        smsEnabled: settings.smsEnabled,
        notifyFollowup: settings.notifyFollowup,
        notifyApplications: settings.notifyApplications,
        notifyStatusChanges: settings.notifyStatusChanges,
        notifyDueActions: settings.notifyDueActions,
        notifyProfileSending: settings.notifyProfileSending,
        notifyMatchings: settings.notifyMatchings,
        frequency: settings.frequency,
        quietHoursStart: settings.quietHoursStart || '',
        quietHoursEnd: settings.quietHoursEnd || '',
        weekendDisabled: settings.weekendDisabled,
        minPriority: settings.minPriority,
        aiModeEnabled: settings.aiModeEnabled,
        aiModeLevel: settings.aiModeLevel,
        aiFailureNotification: settings.aiFailureNotification
      })
    }
  }, [settings])
  
  // Handler für die Formularänderungen
  const handleToggleChange = (field: string) => (checked: boolean) => {
    setFormValues(prev => ({ ...prev, [field]: checked }))
  }
  
  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues(prev => ({ ...prev, [field]: e.target.value }))
  }
  
  const handleSelectChange = (field: string) => (value: string) => {
    setFormValues(prev => ({ ...prev, [field]: value }))
  }
  
  // Handler für das Formular-Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await updateSettings(formValues)
      alert('Benachrichtigungseinstellungen wurden gespeichert')
    } catch (err) {
      console.error('Fehler beim Speichern der Einstellungen:', err)
    }
  }
  
  // Handler für das Zurücksetzen der Einstellungen
  const handleReset = async () => {
    if (confirm('Möchten Sie die Einstellungen wirklich auf die Standardwerte zurücksetzen?')) {
      await resetSettings()
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--primary-dark)]">Benachrichtigungseinstellungen</h1>
          <p className="text-gray-600 mt-1">Konfigurieren Sie, wie und wann Sie benachrichtigt werden möchten</p>
        </div>

        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-dark)]"></div>
          </div>
        )}
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Fehler</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!isLoading && (
          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="channels" className="mb-6">
              <TabsList className="mb-4">
                <TabsTrigger value="channels"><Bell className="mr-2 h-4 w-4" /> Kanäle</TabsTrigger>
                <TabsTrigger value="types"><Bell className="mr-2 h-4 w-4" /> Benachrichtigungstypen</TabsTrigger>
                <TabsTrigger value="timing"><Clock className="mr-2 h-4 w-4" /> Timing und Priorität</TabsTrigger>
                <TabsTrigger value="ai"><Bot className="mr-2 h-4 w-4" /> KI-Assistenz</TabsTrigger>
              </TabsList>
              
              {/* Kanäle Tab */}
              <TabsContent value="channels" className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-semibold text-[var(--primary-dark)] mb-4">Benachrichtigungskanäle</h2>
                <p className="text-gray-500 mb-6">Wählen Sie aus, über welche Kanäle Sie Benachrichtigungen erhalten möchten.</p>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <Label htmlFor="emailToggle" className="font-medium">E-Mail-Benachrichtigungen</Label>
                      <p className="text-sm text-gray-500">Erhalten Sie wichtige Benachrichtigungen per E-Mail</p>
                    </div>
                    <Switch 
                      checked={formValues.emailEnabled}
                      onCheckedChange={handleToggleChange('emailEnabled')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <Label htmlFor="pushToggle" className="font-medium">Push-Benachrichtigungen</Label>
                      <p className="text-sm text-gray-500">Erhalten Sie Benachrichtigungen direkt in der Anwendung</p>
                    </div>
                    <Switch 
                      checked={formValues.pushEnabled}
                      onCheckedChange={handleToggleChange('pushEnabled')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="smsToggle" className="font-medium">SMS-Benachrichtigungen</Label>
                      <p className="text-sm text-gray-500">Erhalten Sie wichtige Benachrichtigungen per SMS (Premium-Funktion)</p>
                    </div>
                    <Switch 
                      checked={formValues.smsEnabled}
                      onCheckedChange={handleToggleChange('smsEnabled')}
                    />
                  </div>
                </div>
              </TabsContent>
              
              {/* Benachrichtigungstypen Tab */}
              <TabsContent value="types" className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-semibold text-[var(--primary-dark)] mb-4">Benachrichtigungstypen</h2>
                <p className="text-gray-500 mb-6">Wählen Sie aus, für welche Ereignisse Sie Benachrichtigungen erhalten möchten.</p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <Label htmlFor="followupToggle" className="font-medium">Nachfassaktionen</Label>
                      <p className="text-sm text-gray-500">Erinnerungen für fällige Nachfassaktionen</p>
                    </div>
                    <Switch 
                      checked={formValues.notifyFollowup}
                      onCheckedChange={handleToggleChange('notifyFollowup')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <Label htmlFor="applicationsToggle" className="font-medium">Neue Bewerbungen</Label>
                      <p className="text-sm text-gray-500">Benachrichtigungen für neue Bewerbungen</p>
                    </div>
                    <Switch 
                      checked={formValues.notifyApplications}
                      onCheckedChange={handleToggleChange('notifyApplications')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <Label htmlFor="statusChangesToggle" className="font-medium">Statusänderungen</Label>
                      <p className="text-sm text-gray-500">Benachrichtigungen für Änderungen des Bewerbungs- oder Kandidatenstatus</p>
                    </div>
                    <Switch 
                      checked={formValues.notifyStatusChanges}
                      onCheckedChange={handleToggleChange('notifyStatusChanges')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <Label htmlFor="dueActionsToggle" className="font-medium">Fällige Aktionen</Label>
                      <p className="text-sm text-gray-500">Benachrichtigungen für fällige Aktionen und Aufgaben</p>
                    </div>
                    <Switch 
                      checked={formValues.notifyDueActions}
                      onCheckedChange={handleToggleChange('notifyDueActions')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <Label htmlFor="profileSendingToggle" className="font-medium">Profilversand</Label>
                      <p className="text-sm text-gray-500">Benachrichtigungen für versendete Profile</p>
                    </div>
                    <Switch 
                      checked={formValues.notifyProfileSending}
                      onCheckedChange={handleToggleChange('notifyProfileSending')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="matchingsToggle" className="font-medium">Matching-Ergebnisse</Label>
                      <p className="text-sm text-gray-500">Benachrichtigungen für neue Matching-Ergebnisse</p>
                    </div>
                    <Switch 
                      checked={formValues.notifyMatchings}
                      onCheckedChange={handleToggleChange('notifyMatchings')}
                    />
                  </div>
                </div>
              </TabsContent>
              
              {/* Timing Tab */}
              <TabsContent value="timing" className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-semibold text-[var(--primary-dark)] mb-4">Timing und Priorität</h2>
                <p className="text-gray-500 mb-6">Legen Sie fest, wann und wie Sie benachrichtigt werden möchten.</p>
                
                <div className="space-y-8">
                  <div>
                    <h3 className="font-medium mb-3">Benachrichtigungshäufigkeit</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div 
                        className={`border rounded-md p-4 cursor-pointer ${formValues.frequency === 'instant' ? 'border-[var(--primary-dark)] bg-blue-50' : 'hover:bg-gray-50'}`}
                        onClick={() => handleSelectChange('frequency')('instant')}
                      >
                        <Zap className="h-6 w-6 mb-2 text-[var(--primary-dark)]" />
                        <p className="font-medium">Sofort</p>
                        <p className="text-sm text-gray-500">Benachrichtigungen sofort erhalten</p>
                      </div>
                      
                      <div 
                        className={`border rounded-md p-4 cursor-pointer ${formValues.frequency === 'daily' ? 'border-[var(--primary-dark)] bg-blue-50' : 'hover:bg-gray-50'}`}
                        onClick={() => handleSelectChange('frequency')('daily')}
                      >
                        <Clock className="h-6 w-6 mb-2 text-[var(--primary-dark)]" />
                        <p className="font-medium">Täglich</p>
                        <p className="text-sm text-gray-500">Tägliche Zusammenfassung</p>
                      </div>
                      
                      <div 
                        className={`border rounded-md p-4 cursor-pointer ${formValues.frequency === 'weekly' ? 'border-[var(--primary-dark)] bg-blue-50' : 'hover:bg-gray-50'}`}
                        onClick={() => handleSelectChange('frequency')('weekly')}
                      >
                        <Clock className="h-6 w-6 mb-2 text-[var(--primary-dark)]" />
                        <p className="font-medium">Wöchentlich</p>
                        <p className="text-sm text-gray-500">Wöchentliche Zusammenfassung</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Ruhige Zeiten</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label htmlFor="quietHoursStart">Ruhige Zeit beginnt</Label>
                        <Input 
                          id="quietHoursStart"
                          type="time"
                          value={formValues.quietHoursStart}
                          onChange={handleInputChange('quietHoursStart')}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="quietHoursEnd">Ruhige Zeit endet</Label>
                        <Input 
                          id="quietHoursEnd"
                          type="time"
                          value={formValues.quietHoursEnd}
                          onChange={handleInputChange('quietHoursEnd')}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <Label htmlFor="weekendDisabledToggle" className="font-medium">Am Wochenende keine Benachrichtigungen</Label>
                        <p className="text-sm text-gray-500">Deaktiviert alle Benachrichtigungen am Samstag und Sonntag</p>
                      </div>
                      <Switch 
                        checked={formValues.weekendDisabled}
                        onCheckedChange={handleToggleChange('weekendDisabled')}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Prioritätsstufe</h3>
                    <p className="text-sm text-gray-500 mb-4">Legen Sie fest, welche Benachrichtigungen Sie je nach Wichtigkeit erhalten möchten.</p>
                    
                    <div className="space-y-6">
                      <div 
                        className={`border rounded-md p-4 cursor-pointer ${formValues.minPriority === 'low' ? 'border-[var(--primary-dark)] bg-blue-50' : 'hover:bg-gray-50'}`}
                        onClick={() => handleSelectChange('minPriority')('low')}
                      >
                        <p className="font-medium">Alle Benachrichtigungen</p>
                        <p className="text-sm text-gray-500">Erhalten Sie alle Benachrichtigungen (niedrige, normale und hohe Priorität)</p>
                      </div>
                      
                      <div 
                        className={`border rounded-md p-4 cursor-pointer ${formValues.minPriority === 'normal' ? 'border-[var(--primary-dark)] bg-blue-50' : 'hover:bg-gray-50'}`}
                        onClick={() => handleSelectChange('minPriority')('normal')}
                      >
                        <p className="font-medium">Normale und wichtige Benachrichtigungen</p>
                        <p className="text-sm text-gray-500">Erhalten Sie nur Benachrichtigungen mit normaler und hoher Priorität</p>
                      </div>
                      
                      <div 
                        className={`border rounded-md p-4 cursor-pointer ${formValues.minPriority === 'high' ? 'border-[var(--primary-dark)] bg-blue-50' : 'hover:bg-gray-50'}`}
                        onClick={() => handleSelectChange('minPriority')('high')}
                      >
                        <p className="font-medium">Nur wichtige Benachrichtigungen</p>
                        <p className="text-sm text-gray-500">Erhalten Sie nur Benachrichtigungen mit hoher Priorität</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* KI Tab */}
              <TabsContent value="ai" className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--primary-dark)]">KI-Assistierte Benachrichtigungen</h2>
                    <p className="text-gray-500">Aktivieren Sie die KI-Unterstützung für intelligentere Benachrichtigungen</p>
                  </div>
                  <Switch 
                    checked={formValues.aiModeEnabled}
                    onCheckedChange={handleToggleChange('aiModeEnabled')}
                  />
                </div>
                
                {formValues.aiModeEnabled && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-3">KI-Assistenzniveau</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div 
                          className={`border rounded-md p-4 cursor-pointer ${formValues.aiModeLevel === 'assist' ? 'border-[var(--primary-dark)] bg-blue-50' : 'hover:bg-gray-50'}`}
                          onClick={() => handleSelectChange('aiModeLevel')('assist')}
                        >
                          <Bot className="h-6 w-6 mb-2 text-[var(--primary-dark)]" />
                          <p className="font-medium">Assistieren</p>
                          <p className="text-sm text-gray-500">Nur Vorschläge für wichtigere Benachrichtigungen</p>
                        </div>
                        
                        <div 
                          className={`border rounded-md p-4 cursor-pointer ${formValues.aiModeLevel === 'enhanced' ? 'border-[var(--primary-dark)] bg-blue-50' : 'hover:bg-gray-50'}`}
                          onClick={() => handleSelectChange('aiModeLevel')('enhanced')}
                        >
                          <Bot className="h-6 w-6 mb-2 text-[var(--primary-dark)]" />
                          <p className="font-medium">Erweitert</p>
                          <p className="text-sm text-gray-500">Automatische Filterung basierend auf Verhalten</p>
                        </div>
                        
                        <div 
                          className={`border rounded-md p-4 cursor-pointer ${formValues.aiModeLevel === 'full' ? 'border-[var(--primary-dark)] bg-blue-50' : 'hover:bg-gray-50'}`}
                          onClick={() => handleSelectChange('aiModeLevel')('full')}
                        >
                          <Bot className="h-6 w-6 mb-2 text-[var(--primary-dark)]" />
                          <p className="font-medium">Vollständig</p>
                          <p className="text-sm text-gray-500">Vollautomatische Benachrichtigungsanpassung</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <Label htmlFor="aiFailureNotificationToggle" className="font-medium">Benachrichtigung bei KI-Fehlfunktion</Label>
                        <p className="text-sm text-gray-500">Erhalten Sie eine Benachrichtigung, wenn die KI-Unterstützung nicht ordnungsgemäß funktioniert</p>
                      </div>
                      <Switch 
                        checked={formValues.aiFailureNotification}
                        onCheckedChange={handleToggleChange('aiFailureNotification')}
                      />
                    </div>
                    
                    <Alert className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Hinweis zur KI-Funktion</AlertTitle>
                      <AlertDescription>
                        Die KI-Assistenz lernt aus Ihrem Verhalten und passt die Benachrichtigungen entsprechend an. Es kann einige Zeit dauern, bis die KI Ihre Präferenzen vollständig versteht.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
                
                {!formValues.aiModeEnabled && (
                  <div className="py-8 text-center text-gray-500">
                    <BellOff className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>KI-Assistenz ist derzeit deaktiviert. Aktivieren Sie sie, um intelligentere Benachrichtigungen zu erhalten.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-between mt-6">
              <Button 
                type="button" 
                variant="outline"
                onClick={handleReset}
              >
                Auf Standardwerte zurücksetzen
              </Button>
              
              <Button type="submit">
                Einstellungen speichern
              </Button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
