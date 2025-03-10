'use client'

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Heading } from '@/components/ui/heading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function VideoIntegrationPage() {
  const [activeProvider, setActiveProvider] = useState('zoom');
  const [zoomConfig, setZoomConfig] = useState({
    clientId: '',
    clientSecret: '',
    redirectUri: 'https://app.heiba-recruitment.com/api/callback/zoom',
    accessToken: '',
    refreshToken: '',
    enabled: false
  });
  const [teamsConfig, setTeamsConfig] = useState({
    clientId: '',
    clientSecret: '',
    redirectUri: 'https://app.heiba-recruitment.com/api/callback/teams',
    accessToken: '',
    refreshToken: '',
    tenantId: '',
    enabled: false
  });
  const [webexConfig, setWebexConfig] = useState({
    clientId: '',
    clientSecret: '',
    redirectUri: 'https://app.heiba-recruitment.com/api/callback/webex',
    accessToken: '',
    refreshToken: '',
    enabled: false
  });
  
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{success?: boolean; message?: string} | null>(null);
  const [repairAttempted, setRepairAttempted] = useState(false);

  // Dummy-Funktion für das Speichern der Konfiguration
  const saveConfiguration = () => {
    let configToSave;
    
    switch (activeProvider) {
      case 'zoom':
        configToSave = zoomConfig;
        break;
      case 'teams':
        configToSave = teamsConfig;
        break;
      case 'webex':
        configToSave = webexConfig;
        break;
      default:
        configToSave = zoomConfig;
    }
    
    console.log('Konfiguration gespeichert:', configToSave);
    setTestResult({
      success: true,
      message: 'Konfiguration wurde erfolgreich gespeichert.'
    });
    setTimeout(() => setTestResult(null), 3000);
  };

  // Dummy-Funktion für den Verbindungstest
  const testConnection = () => {
    setIsTesting(true);
    setTestResult(null);
    
    // Simuliere API-Anfrage
    setTimeout(() => {
      setIsTesting(false);
      
      let hasRequiredFields = false;
      
      switch (activeProvider) {
        case 'zoom':
          hasRequiredFields = Boolean(zoomConfig.clientId && zoomConfig.clientSecret);
          break;
        case 'teams':
          hasRequiredFields = Boolean(teamsConfig.clientId && teamsConfig.clientSecret && teamsConfig.tenantId);
          break;
        case 'webex':
          hasRequiredFields = Boolean(webexConfig.clientId && webexConfig.clientSecret);
          break;
        default:
          hasRequiredFields = false;
      }

      if (hasRequiredFields) {
        setTestResult({
          success: true,
          message: `Verbindung zu ${getProviderDisplayName(activeProvider)} erfolgreich hergestellt.`
        });
      } else if (!repairAttempted) {
        setTestResult({
          success: false,
          message: `Fehler: API-Konfiguration unvollständig. Automatische Reparatur wird versucht...`
        });
        setRepairAttempted(true);
        setTimeout(() => {
          setTestResult({
            success: false,
            message: `Verbindung fehlgeschlagen. Bitte überprüfen Sie die Zugangsdaten für ${getProviderDisplayName(activeProvider)}.`
          });
        }, 2000);
      } else {
        setTestResult({
          success: false,
          message: `Verbindung fehlgeschlagen. Bitte überprüfen Sie die Zugangsdaten für ${getProviderDisplayName(activeProvider)}.`
        });
      }
    }, 1500);
  };

  // Dummy-Funktion zum "Reparieren" der Integration
  const repairIntegration = () => {
    setIsTesting(true);
    setTestResult(null);
    
    // Simuliere Reparatur
    setTimeout(() => {
      setIsTesting(false);
      setTestResult({
        success: true,
        message: `Reparatur für ${getProviderDisplayName(activeProvider)} wurde gestartet. Bitte warten Sie auf die Bestätigung per E-Mail.`
      });
      setTimeout(() => setTestResult(null), 5000);
    }, 2000);
  };

  const getProviderDisplayName = (provider: string) => {
    switch (provider) {
      case 'zoom': return 'Zoom';
      case 'teams': return 'Microsoft Teams';
      case 'webex': return 'Cisco Webex';
      default: return provider;
    }
  };

  const renderZoomForm = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="zoom-enabled" className="flex items-center space-x-2">
          <span>Zoom-Integration aktivieren</span>
        </Label>
        <Switch 
          id="zoom-enabled" 
          checked={zoomConfig.enabled}
          onCheckedChange={(checked) => setZoomConfig({...zoomConfig, enabled: checked})}
        />
      </div>

      <div className="bg-red-50 border border-red-200 p-3 rounded mb-4">
        <h3 className="font-medium text-red-800 flex items-center">
          <span className="mr-2">⚠️</span> Fehlerbehebung erforderlich
        </h3>
        <p className="text-sm text-red-700">
          Die Zoom API-Integration zeigt Fehler an. Bitte aktualisieren Sie Ihre API-Zugangsdaten oder verwenden Sie die Schaltfläche "Integration reparieren".
        </p>
        <Button variant="outline" onClick={repairIntegration} className="mt-2 bg-white hover:bg-gray-50">
          Integration reparieren
        </Button>
      </div>
      
      <div>
        <Label htmlFor="zoom-client-id">Client ID</Label>
        <Input 
          id="zoom-client-id" 
          type="password" 
          value={zoomConfig.clientId}
          onChange={(e) => setZoomConfig({...zoomConfig, clientId: e.target.value})}
          placeholder="Ihre Zoom OAuth App Client ID"
        />
      </div>
      
      <div>
        <Label htmlFor="zoom-client-secret">Client Secret</Label>
        <Input 
          id="zoom-client-secret" 
          type="password" 
          value={zoomConfig.clientSecret}
          onChange={(e) => setZoomConfig({...zoomConfig, clientSecret: e.target.value})}
          placeholder="Ihr Zoom OAuth App Client Secret"
        />
      </div>

      <div>
        <Label htmlFor="zoom-redirect-uri">Redirect URI</Label>
        <Input 
          id="zoom-redirect-uri" 
          type="text" 
          value={zoomConfig.redirectUri}
          onChange={(e) => setZoomConfig({...zoomConfig, redirectUri: e.target.value})}
        />
      </div>

      <div>
        <Label htmlFor="zoom-access-token">Access Token</Label>
        <div className="flex space-x-2">
          <Input 
            id="zoom-access-token" 
            type="password" 
            value={zoomConfig.accessToken}
            onChange={(e) => setZoomConfig({...zoomConfig, accessToken: e.target.value})}
            placeholder="Wird automatisch nach der Authentifizierung gesetzt"
            readOnly={true}
            className="flex-grow"
          />
          <Button variant="outline">Authentifizieren</Button>
        </div>
      </div>
    </div>
  );

  const renderTeamsForm = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="teams-enabled" className="flex items-center space-x-2">
          <span>Microsoft Teams-Integration aktivieren</span>
        </Label>
        <Switch 
          id="teams-enabled" 
          checked={teamsConfig.enabled}
          onCheckedChange={(checked) => setTeamsConfig({...teamsConfig, enabled: checked})}
        />
      </div>
      
      <div>
        <Label htmlFor="teams-client-id">Client ID (Application ID)</Label>
        <Input 
          id="teams-client-id" 
          type="password" 
          value={teamsConfig.clientId}
          onChange={(e) => setTeamsConfig({...teamsConfig, clientId: e.target.value})}
          placeholder="Ihre Microsoft Azure App Client ID"
        />
      </div>
      
      <div>
        <Label htmlFor="teams-client-secret">Client Secret</Label>
        <Input 
          id="teams-client-secret" 
          type="password" 
          value={teamsConfig.clientSecret}
          onChange={(e) => setTeamsConfig({...teamsConfig, clientSecret: e.target.value})}
          placeholder="Ihr Microsoft Azure App Client Secret"
        />
      </div>
      
      <div>
        <Label htmlFor="teams-tenant-id">Tenant ID</Label>
        <Input 
          id="teams-tenant-id" 
          type="text" 
          value={teamsConfig.tenantId}
          onChange={(e) => setTeamsConfig({...teamsConfig, tenantId: e.target.value})}
          placeholder="Ihre Microsoft Azure Active Directory Tenant ID"
        />
      </div>

      <div>
        <Label htmlFor="teams-redirect-uri">Redirect URI</Label>
        <Input 
          id="teams-redirect-uri" 
          type="text" 
          value={teamsConfig.redirectUri}
          onChange={(e) => setTeamsConfig({...teamsConfig, redirectUri: e.target.value})}
        />
      </div>

      <div>
        <Label htmlFor="teams-access-token">Access Token</Label>
        <div className="flex space-x-2">
          <Input 
            id="teams-access-token" 
            type="password" 
            value={teamsConfig.accessToken}
            onChange={(e) => setTeamsConfig({...teamsConfig, accessToken: e.target.value})}
            placeholder="Wird automatisch nach der Authentifizierung gesetzt"
            readOnly={true}
            className="flex-grow"
          />
          <Button variant="outline">Authentifizieren</Button>
        </div>
      </div>
    </div>
  );

  const renderWebexForm = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="webex-enabled" className="flex items-center space-x-2">
          <span>Cisco Webex-Integration aktivieren</span>
        </Label>
        <Switch 
          id="webex-enabled" 
          checked={webexConfig.enabled}
          onCheckedChange={(checked) => setWebexConfig({...webexConfig, enabled: checked})}
        />
      </div>
      
      <div>
        <Label htmlFor="webex-client-id">Client ID</Label>
        <Input 
          id="webex-client-id" 
          type="password" 
          value={webexConfig.clientId}
          onChange={(e) => setWebexConfig({...webexConfig, clientId: e.target.value})}
          placeholder="Ihre Webex Integration Client ID"
        />
      </div>
      
      <div>
        <Label htmlFor="webex-client-secret">Client Secret</Label>
        <Input 
          id="webex-client-secret" 
          type="password" 
          value={webexConfig.clientSecret}
          onChange={(e) => setWebexConfig({...webexConfig, clientSecret: e.target.value})}
          placeholder="Ihr Webex Integration Client Secret"
        />
      </div>

      <div>
        <Label htmlFor="webex-redirect-uri">Redirect URI</Label>
        <Input 
          id="webex-redirect-uri" 
          type="text" 
          value={webexConfig.redirectUri}
          onChange={(e) => setWebexConfig({...webexConfig, redirectUri: e.target.value})}
        />
      </div>

      <div>
        <Label htmlFor="webex-access-token">Access Token</Label>
        <div className="flex space-x-2">
          <Input 
            id="webex-access-token" 
            type="password" 
            value={webexConfig.accessToken}
            onChange={(e) => setWebexConfig({...webexConfig, accessToken: e.target.value})}
            placeholder="Wird automatisch nach der Authentifizierung gesetzt"
            readOnly={true}
            className="flex-grow"
          />
          <Button variant="outline">Authentifizieren</Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <Heading 
          title="Video-Integration" 
          description="Verbinden Sie HeiBa mit Videokonferenz-Plattformen für Bewerbungsgespräche und Meetings."
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Videokonferenz-Plattformen</CardTitle>
            <CardDescription>
              Wählen Sie eine Videokonferenz-Plattform und konfigurieren Sie die Integration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="zoom" className="w-full" onValueChange={setActiveProvider}>
              <TabsList className="mb-4">
                <TabsTrigger value="zoom">Zoom</TabsTrigger>
                <TabsTrigger value="teams">Microsoft Teams</TabsTrigger>
                <TabsTrigger value="webex">Cisco Webex</TabsTrigger>
              </TabsList>
              
              <TabsContent value="zoom">
                {renderZoomForm()}
              </TabsContent>
              
              <TabsContent value="teams">
                {renderTeamsForm()}
              </TabsContent>
              
              <TabsContent value="webex">
                {renderWebexForm()}
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div>
              {testResult && (
                <div className={`p-2 rounded ${testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {testResult.message}
                </div>
              )}
            </div>
            <div className="space-x-2">
              <Button 
                variant="outline" 
                onClick={testConnection}
                disabled={isTesting}
              >
                {isTesting ? 'Teste Verbindung...' : 'Verbindung testen'}
              </Button>
              <Button onClick={saveConfiguration}>Speichern</Button>
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interview-Einstellungen</CardTitle>
            <CardDescription>
              Konfigurieren Sie die Einstellungen für automatisch geplante Interviews.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <h3 className="font-medium">Automatisches Planen von Interviews</h3>
                  <p className="text-sm text-gray-500">Erstellt automatisch Videomeetings wenn Interviews geplant werden</p>
                </div>
                <Switch id="auto-schedule" checked={true} />
              </div>
              
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <h3 className="font-medium">Erinnerungen vor Interviews</h3>
                  <p className="text-sm text-gray-500">Sendet automatisch Erinnerungen vor geplanten Interviews</p>
                </div>
                <Switch id="auto-reminders" checked={true} />
              </div>
              
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <h3 className="font-medium">Aufzeichnung von Interviews</h3>
                  <p className="text-sm text-gray-500">Zeichnet Interviews automatisch auf (nach Zustimmung)</p>
                </div>
                <Switch id="auto-record" checked={false} />
              </div>
              
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <h3 className="font-medium">Warteraum für Kandidaten</h3>
                  <p className="text-sm text-gray-500">Aktiviert einen Warteraum für Kandidaten vor dem Interview</p>
                </div>
                <Switch id="waiting-room" checked={true} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Geplante Interviews</CardTitle>
            <CardDescription>
              Übersicht der anstehenden Video-Interviews
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                <div>
                  <h3 className="font-medium">Interview: Senior Developer Position</h3>
                  <p className="text-sm text-gray-500">Kandidat: Max Mustermann</p>
                </div>
                <div className="text-right">
                  <div className="font-medium">11.03.2025, 14:00</div>
                  <div className="flex justify-end space-x-2 mt-1">
                    <Button variant="outline" size="sm" className="text-xs px-2 py-0.5 h-6">Link kopieren</Button>
                    <Button size="sm" className="text-xs px-2 py-0.5 h-6">Bearbeiten</Button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                <div>
                  <h3 className="font-medium">Interview: UX/UI Designer Position</h3>
                  <p className="text-sm text-gray-500">Kandidat: Anna Schmidt</p>
                </div>
                <div className="text-right">
                  <div className="font-medium">12.03.2025, 10:00</div>
                  <div className="flex justify-end space-x-2 mt-1">
                    <Button variant="outline" size="sm" className="text-xs px-2 py-0.5 h-6">Link kopieren</Button>
                    <Button size="sm" className="text-xs px-2 py-0.5 h-6">Bearbeiten</Button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                <div>
                  <h3 className="font-medium">Interview: Frontend Developer Position</h3>
                  <p className="text-sm text-gray-500">Kandidat: Tom Meyer</p>
                </div>
                <div className="text-right">
                  <div className="font-medium">14.03.2025, 15:30</div>
                  <div className="flex justify-end space-x-2 mt-1">
                    <Button variant="outline" size="sm" className="text-xs px-2 py-0.5 h-6">Link kopieren</Button>
                    <Button size="sm" className="text-xs px-2 py-0.5 h-6">Bearbeiten</Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Neues Interview planen</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
