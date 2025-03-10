'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GoldButton } from '@/components/ui/gold-button';
import { AlertTriangle, CheckCircle, InfoIcon, Clock, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface AutomationSetting {
  enabled: boolean;
  daysThreshold: number;
  description: string;
}

interface TaskAutomationSettings {
  jobExpiryCheck: AutomationSetting;
  candidateContactCheck: AutomationSetting;
  customerContactCheck: AutomationSetting;
  prospectContactCheck: AutomationSetting;
  reminderNotifications: AutomationSetting;
  autoGenerateEnabled: boolean;
  autoGenerateFrequency: number; // in hours
  lastAutoGeneration: string | null;
}

export default function TaskAutomationSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [runningNow, setRunningNow] = useState(false);
  const [lastRunResults, setLastRunResults] = useState<any>(null);
  
  // Default-Einstellungen
  const [settings, setSettings] = useState<TaskAutomationSettings>({
    jobExpiryCheck: {
      enabled: true,
      daysThreshold: 5,
      description: 'Aufgaben für ablaufende Stellenanzeigen erstellen'
    },
    candidateContactCheck: {
      enabled: true,
      daysThreshold: 60,
      description: 'Aufgaben für Kandidaten erstellen, die lange nicht kontaktiert wurden'
    },
    customerContactCheck: {
      enabled: true,
      daysThreshold: 90,
      description: 'Aufgaben für Kunden erstellen, die lange nicht kontaktiert wurden'
    },
    prospectContactCheck: {
      enabled: true,
      daysThreshold: 60,
      description: 'Aufgaben für Interessenten erstellen, die lange nicht kontaktiert wurden'
    },
    reminderNotifications: {
      enabled: true,
      daysThreshold: 1,
      description: 'Erinnerungen für bevorstehende Aufgaben senden'
    },
    autoGenerateEnabled: true,
    autoGenerateFrequency: 24, // Täglich
    lastAutoGeneration: null
  });
  
  // Einstellungen laden
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/tasks/automation-settings');
        const data = await response.json();
        if (data.success) {
          setSettings(data.settings);
        }
      } catch (error) {
        console.error('Fehler beim Laden der Automatisierungseinstellungen:', error);
      }
    };
    
    loadSettings();
  }, []);
  
  // Einstellungen speichern
  const saveSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tasks/automation-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await response.json();
      
      toast({
        title: 'Einstellungen gespeichert',
        description: 'Die Aufgabenautomatisierung wurde aktualisiert.'
      });
    } catch (error) {
      console.error('Fehler beim Speichern der Automatisierungseinstellungen:', error);
      toast({
        title: 'Fehler beim Speichern',
        description: 'Die Einstellungen konnten nicht gespeichert werden.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Automatisierung manuell ausführen
  const runAutomationNow = async () => {
    setRunningNow(true);
    try {
      const response = await fetch('/api/tasks/auto-generate', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        setLastRunResults(data);
        toast({
          title: 'Automatisierung ausgeführt',
          description: data.message
        });
      } else {
        toast({
          title: 'Fehler bei der Ausführung',
          description: data.message || 'Die Automatisierung konnte nicht ausgeführt werden.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Fehler bei der Ausführung der Automatisierung:', error);
      toast({
        title: 'Fehler bei der Ausführung',
        description: 'Die Automatisierung konnte nicht ausgeführt werden.',
        variant: 'destructive'
      });
    } finally {
      setRunningNow(false);
    }
  };
  
  // Aktualisieren einer einzelnen Automatisierungseinstellung
  const updateAutomationSetting = (
    key: keyof Omit<TaskAutomationSettings, 'autoGenerateEnabled' | 'autoGenerateFrequency' | 'lastAutoGeneration'>,
    field: keyof AutomationSetting,
    value: boolean | number
  ) => {
    setSettings(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-[var(--primary-dark)]">Aufgaben-Automatisierung</h1>
      </div>
      
      {/* Hauptsteuerung */}
      <Card className="p-6 mb-8 bg-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold mb-2">Automatische Aufgabengenerierung</h2>
            <p className="text-gray-600">Steuern Sie, ob und wie häufig Aufgaben automatisch generiert werden.</p>
          </div>
          <div className="flex items-center">
            <Switch 
              checked={settings.autoGenerateEnabled} 
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoGenerateEnabled: checked }))}
              className="mr-4"
            />
            <span className="font-medium">{settings.autoGenerateEnabled ? 'Aktiviert' : 'Deaktiviert'}</span>
          </div>
        </div>
        
        {settings.autoGenerateEnabled && (
          <div className="mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div>
                <h3 className="font-medium">Häufigkeit</h3>
                <p className="text-sm text-gray-600">Wie oft soll die automatische Generierung ausgeführt werden?</p>
              </div>
              <div className="flex items-center space-x-2 min-w-[120px]">
                <Input
                  type="number"
                  min={1}
                  max={168}
                  value={settings.autoGenerateFrequency}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    autoGenerateFrequency: Math.max(1, Math.min(168, parseInt(e.target.value) || 24))
                  }))}
                  className="w-20"
                />
                <span className="whitespace-nowrap">Stunden</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-500 mt-2">
              <span>Stündlich</span>
              <span>Täglich</span>
              <span>Wöchentlich</span>
            </div>
            <Slider
              value={[settings.autoGenerateFrequency]}
              min={1}
              max={168}
              step={1}
              onValueChange={(value) => setSettings(prev => ({ ...prev, autoGenerateFrequency: value[0] }))}
              className="mt-2"
            />
          </div>
        )}
        
        <div className="flex flex-col md:flex-row gap-4 mt-6">
          <GoldButton 
            onClick={runAutomationNow} 
            disabled={runningNow}
            className="flex items-center justify-center"
          >
            {runningNow ? (
              <>
                <RefreshCw className="animate-spin mr-2 h-4 w-4" />
                Wird ausgeführt...
              </>
            ) : (
              <>
                <Clock className="mr-2 h-4 w-4" />
                Jetzt ausführen
              </>
            )}
          </GoldButton>
          
          {lastRunResults && (
            <div className="flex items-center text-green-700 text-sm">
              <CheckCircle className="mr-2 h-4 w-4" />
              <span>
                {lastRunResults.details.jobExpiryTasks + 
                 lastRunResults.details.candidateContactTasks + 
                 lastRunResults.details.customerContactTasks} Aufgaben erstellt, 
                {lastRunResults.details.remindersSent} Erinnerungen gesendet
              </span>
            </div>
          )}
        </div>
      </Card>
      
      {/* Einzelne Automatisierungen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Stellenanzeigen */}
        <Card className="p-6 bg-white">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold">Stellenanzeigen-Überwachung</h3>
              <p className="text-sm text-gray-600 mt-1">{settings.jobExpiryCheck.description}</p>
            </div>
            <Switch 
              checked={settings.jobExpiryCheck.enabled} 
              onCheckedChange={(checked) => updateAutomationSetting('jobExpiryCheck', 'enabled', checked)}
            />
          </div>
          
          {settings.jobExpiryCheck.enabled && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Tage vor Ablauf:</span>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    min={1}
                    max={30}
                    value={settings.jobExpiryCheck.daysThreshold}
                    onChange={(e) => updateAutomationSetting(
                      'jobExpiryCheck', 
                      'daysThreshold', 
                      Math.max(1, Math.min(30, parseInt(e.target.value) || 5))
                    )}
                    className="w-16"
                  />
                  <span className="text-sm">Tage</span>
                </div>
              </div>
              <Slider
                value={[settings.jobExpiryCheck.daysThreshold]}
                min={1}
                max={30}
                step={1}
                onValueChange={(value) => updateAutomationSetting('jobExpiryCheck', 'daysThreshold', value[0])}
              />
            </div>
          )}
        </Card>
        
        {/* Kandidaten-Kontakt */}
        <Card className="p-6 bg-white">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold">Kandidaten-Kontaktpflege</h3>
              <p className="text-sm text-gray-600 mt-1">{settings.candidateContactCheck.description}</p>
            </div>
            <Switch 
              checked={settings.candidateContactCheck.enabled} 
              onCheckedChange={(checked) => updateAutomationSetting('candidateContactCheck', 'enabled', checked)}
            />
          </div>
          
          {settings.candidateContactCheck.enabled && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Tage ohne Kontakt:</span>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    min={14}
                    max={365}
                    value={settings.candidateContactCheck.daysThreshold}
                    onChange={(e) => updateAutomationSetting(
                      'candidateContactCheck', 
                      'daysThreshold', 
                      Math.max(14, Math.min(365, parseInt(e.target.value) || 60))
                    )}
                    className="w-16"
                  />
                  <span className="text-sm">Tage</span>
                </div>
              </div>
              <Slider
                value={[settings.candidateContactCheck.daysThreshold]}
                min={14}
                max={365}
                step={1}
                onValueChange={(value) => updateAutomationSetting('candidateContactCheck', 'daysThreshold', value[0])}
              />
            </div>
          )}
        </Card>
        
        {/* Kunden-Kontakt */}
        <Card className="p-6 bg-white">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold">Kunden-Kontaktpflege</h3>
              <p className="text-sm text-gray-600 mt-1">{settings.customerContactCheck.description}</p>
            </div>
            <Switch 
              checked={settings.customerContactCheck.enabled} 
              onCheckedChange={(checked) => updateAutomationSetting('customerContactCheck', 'enabled', checked)}
            />
          </div>
          
          {settings.customerContactCheck.enabled && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Tage ohne Kontakt:</span>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    min={14}
                    max={365}
                    value={settings.customerContactCheck.daysThreshold}
                    onChange={(e) => updateAutomationSetting(
                      'customerContactCheck', 
                      'daysThreshold', 
                      Math.max(14, Math.min(365, parseInt(e.target.value) || 90))
                    )}
                    className="w-16"
                  />
                  <span className="text-sm">Tage</span>
                </div>
              </div>
              <Slider
                value={[settings.customerContactCheck.daysThreshold]}
                min={14}
                max={365}
                step={1}
                onValueChange={(value) => updateAutomationSetting('customerContactCheck', 'daysThreshold', value[0])}
              />
            </div>
          )}
        </Card>
        
        {/* Interessenten-Kontakt */}
        <Card className="p-6 bg-white">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold">Interessenten-Kontaktpflege</h3>
              <p className="text-sm text-gray-600 mt-1">{settings.prospectContactCheck.description}</p>
            </div>
            <Switch 
              checked={settings.prospectContactCheck.enabled} 
              onCheckedChange={(checked) => updateAutomationSetting('prospectContactCheck', 'enabled', checked)}
            />
          </div>
          
          {settings.prospectContactCheck.enabled && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Tage ohne Kontakt:</span>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    min={14}
                    max={365}
                    value={settings.prospectContactCheck.daysThreshold}
                    onChange={(e) => updateAutomationSetting(
                      'prospectContactCheck', 
                      'daysThreshold', 
                      Math.max(14, Math.min(365, parseInt(e.target.value) || 60))
                    )}
                    className="w-16"
                  />
                  <span className="text-sm">Tage</span>
                </div>
              </div>
              <Slider
                value={[settings.prospectContactCheck.daysThreshold]}
                min={14}
                max={365}
                step={1}
                onValueChange={(value) => updateAutomationSetting('prospectContactCheck', 'daysThreshold', value[0])}
              />
            </div>
          )}
        </Card>
        
        {/* Erinnerungen */}
        <Card className="p-6 bg-white md:col-span-2">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold">Aufgaben-Erinnerungen</h3>
              <p className="text-sm text-gray-600 mt-1">{settings.reminderNotifications.description}</p>
            </div>
            <Switch 
              checked={settings.reminderNotifications.enabled} 
              onCheckedChange={(checked) => updateAutomationSetting('reminderNotifications', 'enabled', checked)}
            />
          </div>
          
          {settings.reminderNotifications.enabled && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Tage vor Fälligkeit:</span>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    min={0.25}
                    max={7}
                    step={0.25}
                    value={settings.reminderNotifications.daysThreshold}
                    onChange={(e) => updateAutomationSetting(
                      'reminderNotifications', 
                      'daysThreshold', 
                      Math.max(0.25, Math.min(7, parseFloat(e.target.value) || 1))
                    )}
                    className="w-16"
                  />
                  <span className="text-sm">Tage</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                <span>6 Stunden</span>
                <span>1 Tag</span>
                <span>3 Tage</span>
                <span>1 Woche</span>
              </div>
              <Slider
                value={[settings.reminderNotifications.daysThreshold]}
                min={0.25}
                max={7}
                step={0.25}
                onValueChange={(value) => updateAutomationSetting('reminderNotifications', 'daysThreshold', value[0])}
              />
            </div>
          )}
        </Card>
      </div>
      
      {/* Hinweis */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
        <div className="flex items-start">
          <InfoIcon className="text-blue-500 mt-0.5 mr-3 h-5 w-5 flex-shrink-0" />
          <div>
            <p className="text-sm text-blue-800">
              Die automatische Aufgabengenerierung erstellt Aufgaben basierend auf den obigen Einstellungen.
              Das System prüft auf ablaufende Stellenanzeigen, Kontaktbedarf bei Kandidaten/Kunden und sendet Erinnerungen.
              Alle automatisch erstellten Aufgaben können Sie unter "Aufgaben" einsehen und bearbeiten.
            </p>
          </div>
        </div>
      </div>
      
      {/* Speichern-Button */}
      <div className="flex justify-end gap-4">
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()} 
          disabled={isLoading}
        >
          Zurücksetzen
        </Button>
        <GoldButton 
          onClick={saveSettings} 
          disabled={isLoading}
          className="px-8"
        >
          {isLoading ? 'Wird gespeichert...' : 'Einstellungen speichern'}
        </GoldButton>
      </div>
    </div>
  );
}
