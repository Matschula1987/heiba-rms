"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { IntervalType, IntervalUnit } from '@/types/scheduler';
import { Heading } from '@/components/ui/heading';
import { useToast } from '@/components/ui/use-toast';

export default function Talent360IntegrationPage() {
  const { toast } = useToast();
  
  // Status für Konfiguration
  const [apiKey, setApiKey] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [apiUrl, setApiUrl] = useState('https://api.talent360.de/v1');
  const [isConfigured, setIsConfigured] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  
  // Status für Synchronisations-Einstellungen
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [intervalType, setIntervalType] = useState<IntervalType>('daily');
  const [intervalValue, setIntervalValue] = useState(1);
  const [intervalUnit, setIntervalUnit] = useState<IntervalUnit>('days');
  const [includeJobs, setIncludeJobs] = useState(true);
  const [includeApplications, setIncludeApplications] = useState(true);
  const [addToTalentPool, setAddToTalentPool] = useState(true);
  const [convertToCandidates, setConvertToCandidates] = useState(false);
  const [notifyOnNew, setNotifyOnNew] = useState(true);
  const [isRunningSync, setIsRunningSync] = useState(false);
  
  // Status für Statistiken
  const [stats, setStats] = useState({
    jobsImported: 0,
    applicationsImported: 0,
    lastSyncStatus: 'none' as 'success' | 'error' | 'none'
  });
  
  // Status für Webhooks
  const [webhookUrl, setWebhookUrl] = useState(`${window.location.origin}/api/talent360/webhooks`);
  
  // Bei Komponenten-Initialisierung Konfiguration und Einstellungen laden
  useEffect(() => {
    loadConfiguration();
    loadSyncSettings();
  }, []);
  
  // Konfiguration laden
  const loadConfiguration = async () => {
    try {
      const response = await fetch('/api/talent360');
      const data = await response.json();
      
      if (data.configured) {
        setIsConfigured(true);
        setApiUrl(data.apiUrl);
        // API-Key und Webhook-Secret nicht zurückgeben aus Sicherheitsgründen
        // Stattdessen mit Platzhaltern füllen, wenn konfiguriert
        setApiKey(data.configured ? '••••••••••••••••' : '');
        setWebhookSecret(data.webhookConfigured ? '••••••••••••••••' : '');
      }
    } catch (error) {
      console.error('Fehler beim Laden der Konfiguration:', error);
      toast({
        title: 'Fehler',
        description: 'Die Konfiguration konnte nicht geladen werden.',
        variant: 'destructive'
      });
    }
  };
  
  // Synchronisations-Einstellungen laden
  const loadSyncSettings = async () => {
    try {
      const response = await fetch('/api/talent360/sync-settings');
      const data = await response.json();
      
      if (data.settings) {
        setSyncEnabled(data.settings.enabled || false);
        setIntervalType(data.settings.syncIntervalType || 'daily');
        setIntervalValue(data.settings.syncIntervalValue || 1);
        setIntervalUnit(data.settings.syncIntervalUnit || 'days');
        setLastSync(data.settings.lastSync || null);
        
        // Konfiguration aus dem config-String parsen, falls vorhanden
        if (data.settings.config) {
          try {
            const config = JSON.parse(data.settings.config);
            if (config.customParams) {
              setIncludeJobs(config.customParams.includeJobs ?? true);
              setIncludeApplications(config.customParams.includeApplications ?? true);
              setAddToTalentPool(config.customParams.addToTalentPool ?? true);
              setConvertToCandidates(config.customParams.convertToCandidates ?? false);
              setNotifyOnNew(config.customParams.notifyOnNew ?? true);
            }
          } catch (e) {
            console.error('Fehler beim Parsen der Sync-Konfiguration:', e);
          }
        }
      }
      
      // Letzten Sync-Status vom Sync-Endpunkt laden
      const syncResponse = await fetch('/api/talent360/sync');
      const syncData = await syncResponse.json();
      
      if (syncData.lastRun) {
        setStats({
          jobsImported: syncData.jobs?.imported || 0,
          applicationsImported: syncData.applications?.imported || 0,
          lastSyncStatus: syncData.success ? 'success' : 'error'
        });
      }
    } catch (error) {
      console.error('Fehler beim Laden der Synchronisations-Einstellungen:', error);
      toast({
        title: 'Fehler',
        description: 'Die Synchronisations-Einstellungen konnten nicht geladen werden.',
        variant: 'destructive'
      });
    }
  };
  
  // Konfiguration speichern
  const saveConfiguration = async () => {
    setIsSaving(true);
    
    try {
      const response = await fetch('/api/talent360', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiKey: apiKey.includes('•') ? undefined : apiKey, // Nur senden, wenn geändert
          webhookSecret: webhookSecret.includes('•') ? undefined : webhookSecret,
          apiUrl
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'Erfolg',
          description: 'Die Konfiguration wurde gespeichert.',
        });
        
        setIsConfigured(true);
        // Mit Platzhaltern füllen
        setApiKey('••••••••••••••••');
        setWebhookSecret('••••••••••••••••');
      } else {
        toast({
          title: 'Fehler',
          description: data.error || 'Die Konfiguration konnte nicht gespeichert werden.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Fehler beim Speichern der Konfiguration:', error);
      toast({
        title: 'Fehler',
        description: 'Die Konfiguration konnte nicht gespeichert werden.',
        variant: 'destructive'
      });
    }
    
    setIsSaving(false);
  };
  
  // Synchronisations-Einstellungen speichern
  const saveSyncSettings = async () => {
    setIsSaving(true);
    
    try {
      const response = await fetch('/api/talent360/sync-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          enabled: syncEnabled,
          syncIntervalType: intervalType,
          syncIntervalValue: intervalValue,
          syncIntervalUnit: intervalUnit,
          includeJobs,
          includeApplications,
          addToTalentPool,
          convertToCandidates,
          notifyOnNew
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'Erfolg',
          description: 'Die Synchronisations-Einstellungen wurden gespeichert.',
        });
      } else {
        toast({
          title: 'Fehler',
          description: data.error || 'Die Synchronisations-Einstellungen konnten nicht gespeichert werden.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Fehler beim Speichern der Synchronisations-Einstellungen:', error);
      toast({
        title: 'Fehler',
        description: 'Die Synchronisations-Einstellungen konnten nicht gespeichert werden.',
        variant: 'destructive'
      });
    }
    
    setIsSaving(false);
  };
  
  // Manuelle Synchronisation starten
  const startSync = async () => {
    setIsRunningSync(true);
    
    try {
      const response = await fetch('/api/talent360/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          syncType: 'all',
          includeJobs,
          includeApplications,
          addToTalentPool,
          convertToCandidates,
          notifyOnNew
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'Erfolg',
          description: 'Die Synchronisation wurde gestartet.',
        });
        
        // Nach kurzer Verzögerung den Status aktualisieren
        setTimeout(() => {
          loadSyncSettings();
        }, 2000);
      } else {
        toast({
          title: 'Fehler',
          description: data.error || 'Die Synchronisation konnte nicht gestartet werden.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Fehler beim Starten der Synchronisation:', error);
      toast({
        title: 'Fehler',
        description: 'Die Synchronisation konnte nicht gestartet werden.',
        variant: 'destructive'
      });
    }
    
    setIsRunningSync(false);
  };
  
  // Aktivieren/Deaktivieren der Synchronisation
  const toggleSyncEnabled = async (enabled: boolean) => {
    try {
      const response = await fetch('/api/talent360/sync-settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          enabled
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSyncEnabled(enabled);
        toast({
          title: 'Erfolg',
          description: enabled ? 'Die Synchronisation wurde aktiviert.' : 'Die Synchronisation wurde deaktiviert.',
        });
      } else {
        toast({
          title: 'Fehler',
          description: data.error || 'Die Synchronisation konnte nicht aktiviert/deaktiviert werden.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Fehler beim Aktivieren/Deaktivieren der Synchronisation:', error);
      toast({
        title: 'Fehler',
        description: 'Die Synchronisation konnte nicht aktiviert/deaktiviert werden.',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <div className="container py-8">
      <Heading title="Talent360 Integration" description="Verbindung zu Talent360 konfigurieren und verwalten" />
      
      <Tabs defaultValue="config" className="mt-6">
        <TabsList>
          <TabsTrigger value="config">Konfiguration</TabsTrigger>
          <TabsTrigger value="sync">Synchronisation</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="config" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>API-Konfiguration</CardTitle>
              <CardDescription>
                Konfigurieren Sie die Verbindung zu Talent360. Sie benötigen einen API-Key und ein Webhook-Secret.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isConfigured && (
                <Alert className="mb-4">
                  <AlertTitle>Integration aktiv</AlertTitle>
                  <AlertDescription>
                    Die Talent360-Integration ist konfiguriert und aktiv.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="apiUrl">API-URL</Label>
                  <Input
                    id="apiUrl"
                    placeholder="https://api.talent360.de/v1"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API-Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="Ihr Talent360 API-Key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="webhookSecret">Webhook-Secret</Label>
                  <Input
                    id="webhookSecret"
                    type="password"
                    placeholder="Ihr Talent360 Webhook-Secret"
                    value={webhookSecret}
                    onChange={(e) => setWebhookSecret(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={saveConfiguration} disabled={isSaving}>
                {isSaving ? 'Wird gespeichert...' : 'Speichern'}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Test-Verbindung</CardTitle>
              <CardDescription>
                Testen Sie die Verbindung zu Talent360.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={loadConfiguration}>
                Verbindung testen
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sync" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Automatische Synchronisation</CardTitle>
                  <CardDescription>
                    Konfigurieren Sie die automatische Synchronisation mit Talent360.
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="syncEnabled">Aktiviert</Label>
                  <Switch
                    checked={syncEnabled}
                    onCheckedChange={toggleSyncEnabled}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="intervalType">Interval-Typ</Label>
                  <Select
                    value={intervalType}
                    onValueChange={(value) => setIntervalType(value as IntervalType)}
                  >
                    <SelectTrigger id="intervalType">
                      <SelectValue placeholder="Interval-Typ auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Stündlich</SelectItem>
                      <SelectItem value="daily">Täglich</SelectItem>
                      <SelectItem value="weekly">Wöchentlich</SelectItem>
                      <SelectItem value="monthly">Monatlich</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="intervalValue">Intervall-Wert</Label>
                  <Input
                    id="intervalValue"
                    type="number"
                    min="1"
                    value={intervalValue}
                    onChange={(e) => setIntervalValue(parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Synchronisations-Optionen</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeJobs"
                      checked={includeJobs}
                      onCheckedChange={(checked) => setIncludeJobs(checked === true)}
                    />
                    <Label htmlFor="includeJobs">Jobs synchronisieren</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeApplications"
                      checked={includeApplications}
                      onCheckedChange={(checked) => setIncludeApplications(checked === true)}
                    />
                    <Label htmlFor="includeApplications">Bewerbungen synchronisieren</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="addToTalentPool"
                      checked={addToTalentPool}
                      onCheckedChange={(checked) => setAddToTalentPool(checked === true)}
                    />
                    <Label htmlFor="addToTalentPool">Zum Talent-Pool hinzufügen</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="convertToCandidates"
                      checked={convertToCandidates}
                      onCheckedChange={(checked) => setConvertToCandidates(checked === true)}
                    />
                    <Label htmlFor="convertToCandidates">In Kandidaten umwandeln</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="notifyOnNew"
                      checked={notifyOnNew}
                      onCheckedChange={(checked) => setNotifyOnNew(checked === true)}
                    />
                    <Label htmlFor="notifyOnNew">Bei neuen Elementen benachrichtigen</Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={saveSyncSettings} disabled={isSaving}>
                {isSaving ? 'Wird gespeichert...' : 'Einstellungen speichern'}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Manuelle Synchronisation</CardTitle>
              <CardDescription>
                Starten Sie eine manuelle Synchronisation mit Talent360.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {lastSync && (
                <div className="mb-4">
                  <p className="text-sm">
                    Letzte Synchronisation: {new Date(lastSync).toLocaleString()}
                  </p>
                  <div className="flex items-center mt-2 space-x-2">
                    <Badge variant={stats.lastSyncStatus === 'success' ? 'default' : 'destructive'}>
                      {stats.lastSyncStatus === 'success' ? 'Erfolgreich' : stats.lastSyncStatus === 'error' ? 'Fehler' : 'Unbekannt'}
                    </Badge>
                    {stats.lastSyncStatus === 'success' && (
                      <>
                        <Badge variant="outline">{stats.jobsImported} Jobs</Badge>
                        <Badge variant="outline">{stats.applicationsImported} Bewerbungen</Badge>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              <Button onClick={startSync} disabled={isRunningSync}>
                {isRunningSync ? 'Synchronisierung läuft...' : 'Jetzt synchronisieren'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="webhooks" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Webhook-Konfiguration</CardTitle>
              <CardDescription>
                Verwenden Sie diese URL, um Webhooks von Talent360 einzurichten.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook-URL</Label>
                <div className="flex space-x-2">
                  <Input
                    id="webhookUrl"
                    value={webhookUrl}
                    readOnly
                  />
                  <Button variant="outline" onClick={() => {
                    navigator.clipboard.writeText(webhookUrl);
                    toast({
                      title: 'Kopiert',
                      description: 'Die Webhook-URL wurde in die Zwischenablage kopiert.',
                    });
                  }}>
                    Kopieren
                  </Button>
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Unterstützte Webhook-Events:</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>application.created</li>
                  <li>application.updated</li>
                  <li>application.status_changed</li>
                  <li>job.created</li>
                  <li>job.updated</li>
                  <li>job.status_changed</li>
                </ul>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Anleitungen</CardTitle>
              <CardDescription>
                So richten Sie Webhooks in Talent360 ein.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Loggen Sie sich in Ihr Talent360-Administrationskonto ein.</li>
                <li>Navigieren Sie zu Einstellungen &gt; Integrationen &gt; Webhooks.</li>
                <li>Klicken Sie auf "Neuen Webhook hinzufügen".</li>
                <li>Fügen Sie die oben angegebene Webhook-URL ein.</li>
                <li>Wählen Sie die Ereignisse aus, die Sie abonnieren möchten.</li>
                <li>Geben Sie das Webhook-Secret ein, das Sie in der API-Konfiguration festgelegt haben.</li>
                <li>Klicken Sie auf "Speichern", um den Webhook zu aktivieren.</li>
              </ol>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
