'use client'

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Heading } from '@/components/ui/heading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

export default function CalendarIntegrationPage() {
  const [activeProvider, setActiveProvider] = useState('google');
  const [googleConfig, setGoogleConfig] = useState({
    clientId: '',
    clientSecret: '',
    redirectUri: 'https://app.heiba-recruitment.com/api/callback/google-calendar',
    accessToken: '',
    refreshToken: '',
    calendarId: 'primary',
    enabled: false
  });
  const [outlookConfig, setOutlookConfig] = useState({
    clientId: '',
    clientSecret: '',
    redirectUri: 'https://app.heiba-recruitment.com/api/callback/outlook-calendar',
    accessToken: '',
    refreshToken: '',
    calendarId: '',
    enabled: false
  });
  const [iCloudConfig, setICloudConfig] = useState({
    username: '',
    password: '',
    calendarId: '',
    enabled: false
  });
  
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{success?: boolean; message?: string} | null>(null);

  // Dummy-Funktion für das Speichern der Konfiguration
  const saveConfiguration = () => {
    let configToSave;
    
    switch (activeProvider) {
      case 'google':
        configToSave = googleConfig;
        break;
      case 'outlook':
        configToSave = outlookConfig;
        break;
      case 'icloud':
        configToSave = iCloudConfig;
        break;
      default:
        configToSave = googleConfig;
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
        case 'google':
          hasRequiredFields = Boolean(googleConfig.clientId && googleConfig.clientSecret);
          break;
        case 'outlook':
          hasRequiredFields = Boolean(outlookConfig.clientId && outlookConfig.clientSecret);
          break;
        case 'icloud':
          hasRequiredFields = Boolean(iCloudConfig.username && iCloudConfig.password);
          break;
        default:
          hasRequiredFields = false;
      }

      if (hasRequiredFields) {
        setTestResult({
          success: true,
          message: `Verbindung zu ${getProviderDisplayName(activeProvider)} erfolgreich hergestellt.`
        });
      } else {
        setTestResult({
          success: false,
          message: `Verbindung fehlgeschlagen. Bitte überprüfen Sie die Zugangsdaten für ${getProviderDisplayName(activeProvider)}.`
        });
      }
    }, 1500);
  };

  const getProviderDisplayName = (provider: string) => {
    switch (provider) {
      case 'google': return 'Google Kalender';
      case 'outlook': return 'Microsoft 365 Kalender';
      case 'icloud': return 'iCloud Kalender';
      default: return provider;
    }
  };

  const renderGoogleForm = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="google-enabled" className="flex items-center space-x-2">
          <span>Google Kalender aktivieren</span>
        </Label>
        <Switch 
          id="google-enabled" 
          checked={googleConfig.enabled}
          onCheckedChange={(checked) => setGoogleConfig({...googleConfig, enabled: checked})}
        />
      </div>
      
      <div>
        <Label htmlFor="google-client-id">Client ID</Label>
        <Input 
          id="google-client-id" 
          type="password" 
          value={googleConfig.clientId}
          onChange={(e) => setGoogleConfig({...googleConfig, clientId: e.target.value})}
          placeholder="Ihre Google API Client ID"
        />
      </div>
      
      <div>
        <Label htmlFor="google-client-secret">Client Secret</Label>
        <Input 
          id="google-client-secret" 
          type="password" 
          value={googleConfig.clientSecret}
          onChange={(e) => setGoogleConfig({...googleConfig, clientSecret: e.target.value})}
          placeholder="Ihr Google API Client Secret"
        />
      </div>

      <div>
        <Label htmlFor="google-redirect-uri">Redirect URI</Label>
        <Input 
          id="google-redirect-uri" 
          type="text" 
          value={googleConfig.redirectUri}
          onChange={(e) => setGoogleConfig({...googleConfig, redirectUri: e.target.value})}
        />
      </div>
      
      <div>
        <Label htmlFor="google-calendar-id">Kalender ID</Label>
        <Input 
          id="google-calendar-id" 
          type="text" 
          value={googleConfig.calendarId}
          onChange={(e) => setGoogleConfig({...googleConfig, calendarId: e.target.value})}
          placeholder="primary oder benutzerdefinierte ID"
        />
        <p className="text-xs text-gray-500 mt-1">
          Lassen Sie "primary" für den Hauptkalender oder geben Sie die ID eines bestimmten Kalenders ein.
        </p>
      </div>

      <div>
        <Label htmlFor="google-access-token">Access Token</Label>
        <div className="flex space-x-2">
          <Input 
            id="google-access-token" 
            type="password" 
            value={googleConfig.accessToken}
            onChange={(e) => setGoogleConfig({...googleConfig, accessToken: e.target.value})}
            placeholder="Wird automatisch nach der Authentifizierung gesetzt"
            readOnly={true}
            className="flex-grow"
          />
          <Button variant="outline">Authentifizieren</Button>
        </div>
      </div>
    </div>
  );

  const renderOutlookForm = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="outlook-enabled" className="flex items-center space-x-2">
          <span>Microsoft 365 Kalender aktivieren</span>
        </Label>
        <Switch 
          id="outlook-enabled" 
          checked={outlookConfig.enabled}
          onCheckedChange={(checked) => setOutlookConfig({...outlookConfig, enabled: checked})}
        />
      </div>
      
      <div>
        <Label htmlFor="outlook-client-id">Client ID</Label>
        <Input 
          id="outlook-client-id" 
          type="password" 
          value={outlookConfig.clientId}
          onChange={(e) => setOutlookConfig({...outlookConfig, clientId: e.target.value})}
          placeholder="Ihre Microsoft API Client ID"
        />
      </div>
      
      <div>
        <Label htmlFor="outlook-client-secret">Client Secret</Label>
        <Input 
          id="outlook-client-secret" 
          type="password" 
          value={outlookConfig.clientSecret}
          onChange={(e) => setOutlookConfig({...outlookConfig, clientSecret: e.target.value})}
          placeholder="Ihr Microsoft API Client Secret"
        />
      </div>

      <div>
        <Label htmlFor="outlook-redirect-uri">Redirect URI</Label>
        <Input 
          id="outlook-redirect-uri" 
          type="text" 
          value={outlookConfig.redirectUri}
          onChange={(e) => setOutlookConfig({...outlookConfig, redirectUri: e.target.value})}
        />
      </div>
      
      <div>
        <Label htmlFor="outlook-calendar-id">Kalender ID</Label>
        <Input 
          id="outlook-calendar-id" 
          type="text" 
          value={outlookConfig.calendarId}
          onChange={(e) => setOutlookConfig({...outlookConfig, calendarId: e.target.value})}
          placeholder="Kalender-ID (leer lassen für Standardkalender)"
        />
      </div>

      <div>
        <Label htmlFor="outlook-access-token">Access Token</Label>
        <div className="flex space-x-2">
          <Input 
            id="outlook-access-token" 
            type="password" 
            value={outlookConfig.accessToken}
            onChange={(e) => setOutlookConfig({...outlookConfig, accessToken: e.target.value})}
            placeholder="Wird automatisch nach der Authentifizierung gesetzt"
            readOnly={true}
            className="flex-grow"
          />
          <Button variant="outline">Authentifizieren</Button>
        </div>
      </div>
    </div>
  );

  const renderICloudForm = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="icloud-enabled" className="flex items-center space-x-2">
          <span>iCloud Kalender aktivieren</span>
        </Label>
        <Switch 
          id="icloud-enabled" 
          checked={iCloudConfig.enabled}
          onCheckedChange={(checked) => setICloudConfig({...iCloudConfig, enabled: checked})}
        />
      </div>
      
      <div>
        <Label htmlFor="icloud-username">Apple ID</Label>
        <Input 
          id="icloud-username" 
          type="email" 
          value={iCloudConfig.username}
          onChange={(e) => setICloudConfig({...iCloudConfig, username: e.target.value})}
          placeholder="Ihre Apple ID (E-Mail)"
        />
      </div>
      
      <div>
        <Label htmlFor="icloud-password">App-spezifisches Passwort</Label>
        <Input 
          id="icloud-password" 
          type="password" 
          value={iCloudConfig.password}
          onChange={(e) => setICloudConfig({...iCloudConfig, password: e.target.value})}
          placeholder="Ihr App-spezifisches Passwort"
        />
        <p className="text-xs text-gray-500 mt-1">
          Ein App-spezifisches Passwort können Sie in Ihren Apple-ID-Einstellungen erstellen.
        </p>
      </div>
      
      <div>
        <Label htmlFor="icloud-calendar-id">Kalender ID</Label>
        <Input 
          id="icloud-calendar-id" 
          type="text" 
          value={iCloudConfig.calendarId}
          onChange={(e) => setICloudConfig({...iCloudConfig, calendarId: e.target.value})}
          placeholder="Kalender-ID (leer lassen für Standardkalender)"
        />
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <Heading 
          title="Kalender-Integration" 
          description="Konfigurieren Sie die Integration mit Ihrem Kalender-System für Termine und Erinnerungen."
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Kalender-Anbieter</CardTitle>
            <CardDescription>
              Wählen Sie einen Kalender-Anbieter und konfigurieren Sie die Verbindung.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="google" className="w-full" onValueChange={setActiveProvider}>
              <TabsList className="mb-4">
                <TabsTrigger value="google">Google</TabsTrigger>
                <TabsTrigger value="outlook">Microsoft 365</TabsTrigger>
                <TabsTrigger value="icloud">iCloud</TabsTrigger>
              </TabsList>
              
              <TabsContent value="google">
                {renderGoogleForm()}
              </TabsContent>
              
              <TabsContent value="outlook">
                {renderOutlookForm()}
              </TabsContent>
              
              <TabsContent value="icloud">
                {renderICloudForm()}
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
            <CardTitle>Automatisierungseinstellungen</CardTitle>
            <CardDescription>
              Konfigurieren Sie, wann und wie Kalendereinträge erstellt werden sollen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <h3 className="font-medium">Automatische Terminplanung für Interviews</h3>
                  <p className="text-sm text-gray-500">Erstellt automatisch Kalendereinträge für Vorstellungsgespräche</p>
                </div>
                <Switch id="auto-interview" checked={true} />
              </div>
              
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <h3 className="font-medium">Erinnerungen für Aufgaben</h3>
                  <p className="text-sm text-gray-500">Erstellt Kalendereinträge für fällige Aufgaben</p>
                </div>
                <Switch id="auto-tasks" checked={true} />
              </div>
              
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <h3 className="font-medium">Termine für Team-Meetings</h3>
                  <p className="text-sm text-gray-500">Erstellt Kalendereinträge für Team-Besprechungen</p>
                </div>
                <Switch id="auto-meetings" checked={false} />
              </div>
              
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <h3 className="font-medium">Erinnerungen vor Bewerbungsfristen</h3>
                  <p className="text-sm text-gray-500">Erstellt Erinnerungen vor dem Ablauf von Bewerbungsfristen</p>
                </div>
                <Switch id="auto-deadlines" checked={true} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Anstehende Termine</CardTitle>
            <CardDescription>
              Übersicht der nächsten Termine aus Ihrem Kalender
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                <div>
                  <h3 className="font-medium">Vorstellungsgespräch mit Max Mustermann</h3>
                  <p className="text-sm text-gray-500">Für: Senior Developer Position</p>
                </div>
                <div className="text-right">
                  <div className="font-medium">11.03.2025, 14:00</div>
                  <div className="text-sm text-gray-500">Dauer: 60 Min.</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                <div>
                  <h3 className="font-medium">Teammeeting - Recruiting-Status</h3>
                  <p className="text-sm text-gray-500">Wöchentliche Besprechung</p>
                </div>
                <div className="text-right">
                  <div className="font-medium">12.03.2025, 09:00</div>
                  <div className="text-sm text-gray-500">Dauer: 30 Min.</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                <div>
                  <h3 className="font-medium">Bewerbungsfrist - UX Designer</h3>
                  <p className="text-sm text-gray-500">Stellenausschreibung #JB-2025-42</p>
                </div>
                <div className="text-right">
                  <div className="font-medium">15.03.2025, 23:59</div>
                  <div className="text-sm text-gray-500">Erinnerung</div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">Alle Termine anzeigen</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
