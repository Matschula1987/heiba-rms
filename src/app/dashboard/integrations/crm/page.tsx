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

export default function CrmIntegrationPage() {
  const [activeProvider, setActiveProvider] = useState('salesforce');
  const [salesforceConfig, setSalesforceConfig] = useState({
    clientId: '',
    clientSecret: '',
    redirectUri: 'https://app.heiba-recruitment.com/api/callback/salesforce',
    accessToken: '',
    refreshToken: '',
    instanceUrl: '',
    enabled: false
  });
  const [hubspotConfig, setHubspotConfig] = useState({
    apiKey: '',
    clientId: '',
    clientSecret: '',
    redirectUri: 'https://app.heiba-recruitment.com/api/callback/hubspot',
    accessToken: '',
    refreshToken: '',
    enabled: false
  });
  const [pipedriveConfig, setPipedriveConfig] = useState({
    apiKey: '',
    companyDomain: '',
    enabled: false
  });
  
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{success?: boolean; message?: string} | null>(null);

  // Dummy-Funktion für das Speichern der Konfiguration
  const saveConfiguration = () => {
    let configToSave;
    
    switch (activeProvider) {
      case 'salesforce':
        configToSave = salesforceConfig;
        break;
      case 'hubspot':
        configToSave = hubspotConfig;
        break;
      case 'pipedrive':
        configToSave = pipedriveConfig;
        break;
      default:
        configToSave = salesforceConfig;
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
        case 'salesforce':
          hasRequiredFields = Boolean(salesforceConfig.clientId && salesforceConfig.clientSecret);
          break;
        case 'hubspot':
          hasRequiredFields = Boolean(hubspotConfig.apiKey || (hubspotConfig.clientId && hubspotConfig.clientSecret));
          break;
        case 'pipedrive':
          hasRequiredFields = Boolean(pipedriveConfig.apiKey && pipedriveConfig.companyDomain);
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
      case 'salesforce': return 'Salesforce';
      case 'hubspot': return 'HubSpot';
      case 'pipedrive': return 'Pipedrive';
      default: return provider;
    }
  };

  const renderSalesforceForm = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="salesforce-enabled" className="flex items-center space-x-2">
          <span>Salesforce-Integration aktivieren</span>
        </Label>
        <Switch 
          id="salesforce-enabled" 
          checked={salesforceConfig.enabled}
          onCheckedChange={(checked) => setSalesforceConfig({...salesforceConfig, enabled: checked})}
        />
      </div>
      
      <div>
        <Label htmlFor="salesforce-client-id">Client ID</Label>
        <Input 
          id="salesforce-client-id" 
          type="password" 
          value={salesforceConfig.clientId}
          onChange={(e) => setSalesforceConfig({...salesforceConfig, clientId: e.target.value})}
          placeholder="Ihre Salesforce Connected App Client ID"
        />
      </div>
      
      <div>
        <Label htmlFor="salesforce-client-secret">Client Secret</Label>
        <Input 
          id="salesforce-client-secret" 
          type="password" 
          value={salesforceConfig.clientSecret}
          onChange={(e) => setSalesforceConfig({...salesforceConfig, clientSecret: e.target.value})}
          placeholder="Ihr Salesforce Connected App Client Secret"
        />
      </div>

      <div>
        <Label htmlFor="salesforce-redirect-uri">Redirect URI</Label>
        <Input 
          id="salesforce-redirect-uri" 
          type="text" 
          value={salesforceConfig.redirectUri}
          onChange={(e) => setSalesforceConfig({...salesforceConfig, redirectUri: e.target.value})}
        />
      </div>
      
      <div>
        <Label htmlFor="salesforce-instance-url">Instance URL</Label>
        <Input 
          id="salesforce-instance-url" 
          type="text" 
          value={salesforceConfig.instanceUrl}
          onChange={(e) => setSalesforceConfig({...salesforceConfig, instanceUrl: e.target.value})}
          placeholder="https://yourdomain.my.salesforce.com"
        />
      </div>

      <div>
        <Label htmlFor="salesforce-access-token">Access Token</Label>
        <div className="flex space-x-2">
          <Input 
            id="salesforce-access-token" 
            type="password" 
            value={salesforceConfig.accessToken}
            onChange={(e) => setSalesforceConfig({...salesforceConfig, accessToken: e.target.value})}
            placeholder="Wird automatisch nach der Authentifizierung gesetzt"
            readOnly={true}
            className="flex-grow"
          />
          <Button variant="outline">Authentifizieren</Button>
        </div>
      </div>
    </div>
  );

  const renderHubspotForm = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="hubspot-enabled" className="flex items-center space-x-2">
          <span>HubSpot-Integration aktivieren</span>
        </Label>
        <Switch 
          id="hubspot-enabled" 
          checked={hubspotConfig.enabled}
          onCheckedChange={(checked) => setHubspotConfig({...hubspotConfig, enabled: checked})}
        />
      </div>
      
      <div>
        <Label htmlFor="hubspot-api-key">API Key (für Private App-Integration)</Label>
        <Input 
          id="hubspot-api-key" 
          type="password" 
          value={hubspotConfig.apiKey}
          onChange={(e) => setHubspotConfig({...hubspotConfig, apiKey: e.target.value})}
          placeholder="Ihr HubSpot API Key"
        />
        <p className="text-xs text-gray-500 mt-1">
          Entweder API Key oder OAuth-Anmeldedaten (Client ID/Secret) verwenden
        </p>
      </div>

      <div className="mt-4 mb-2">
        <h3 className="text-sm font-medium">Oder OAuth-Authentifizierung</h3>
      </div>
      
      <div>
        <Label htmlFor="hubspot-client-id">Client ID</Label>
        <Input 
          id="hubspot-client-id" 
          type="password" 
          value={hubspotConfig.clientId}
          onChange={(e) => setHubspotConfig({...hubspotConfig, clientId: e.target.value})}
          placeholder="Ihre HubSpot App Client ID"
        />
      </div>
      
      <div>
        <Label htmlFor="hubspot-client-secret">Client Secret</Label>
        <Input 
          id="hubspot-client-secret" 
          type="password" 
          value={hubspotConfig.clientSecret}
          onChange={(e) => setHubspotConfig({...hubspotConfig, clientSecret: e.target.value})}
          placeholder="Ihr HubSpot App Client Secret"
        />
      </div>

      <div>
        <Label htmlFor="hubspot-redirect-uri">Redirect URI</Label>
        <Input 
          id="hubspot-redirect-uri" 
          type="text" 
          value={hubspotConfig.redirectUri}
          onChange={(e) => setHubspotConfig({...hubspotConfig, redirectUri: e.target.value})}
        />
      </div>

      <div>
        <Label htmlFor="hubspot-access-token">Access Token</Label>
        <div className="flex space-x-2">
          <Input 
            id="hubspot-access-token" 
            type="password" 
            value={hubspotConfig.accessToken}
            onChange={(e) => setHubspotConfig({...hubspotConfig, accessToken: e.target.value})}
            placeholder="Wird automatisch nach der Authentifizierung gesetzt"
            readOnly={Boolean(hubspotConfig.clientId && hubspotConfig.clientSecret)}
            className="flex-grow"
          />
          <Button variant="outline" disabled={!Boolean(hubspotConfig.clientId && hubspotConfig.clientSecret)}>
            Authentifizieren
          </Button>
        </div>
      </div>
    </div>
  );

  const renderPipedriveForm = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="pipedrive-enabled" className="flex items-center space-x-2">
          <span>Pipedrive-Integration aktivieren</span>
        </Label>
        <Switch 
          id="pipedrive-enabled" 
          checked={pipedriveConfig.enabled}
          onCheckedChange={(checked) => setPipedriveConfig({...pipedriveConfig, enabled: checked})}
        />
      </div>
      
      <div>
        <Label htmlFor="pipedrive-api-key">API Token</Label>
        <Input 
          id="pipedrive-api-key" 
          type="password" 
          value={pipedriveConfig.apiKey}
          onChange={(e) => setPipedriveConfig({...pipedriveConfig, apiKey: e.target.value})}
          placeholder="Ihr Pipedrive API Token"
        />
        <p className="text-xs text-gray-500 mt-1">
          Zu finden unter Einstellungen &gt; Personal &gt; API
        </p>
      </div>
      
      <div>
        <Label htmlFor="pipedrive-company-domain">Unternehmens-Domain</Label>
        <Input 
          id="pipedrive-company-domain" 
          type="text" 
          value={pipedriveConfig.companyDomain}
          onChange={(e) => setPipedriveConfig({...pipedriveConfig, companyDomain: e.target.value})}
          placeholder="ihrunternehmen.pipedrive.com"
        />
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <Heading 
          title="CRM-Integration" 
          description="Verbinden Sie HeiBa mit Ihrem Customer Relationship Management-System."
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>CRM-Anbieter</CardTitle>
            <CardDescription>
              Wählen Sie einen CRM-Anbieter und konfigurieren Sie die Verbindung.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="salesforce" className="w-full" onValueChange={setActiveProvider}>
              <TabsList className="mb-4">
                <TabsTrigger value="salesforce">Salesforce</TabsTrigger>
                <TabsTrigger value="hubspot">HubSpot</TabsTrigger>
                <TabsTrigger value="pipedrive">Pipedrive</TabsTrigger>
              </TabsList>
              
              <TabsContent value="salesforce">
                {renderSalesforceForm()}
              </TabsContent>
              
              <TabsContent value="hubspot">
                {renderHubspotForm()}
              </TabsContent>
              
              <TabsContent value="pipedrive">
                {renderPipedriveForm()}
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
            <CardTitle>Daten-Synchronisation</CardTitle>
            <CardDescription>
              Konfigurieren Sie, welche Daten zwischen HeiBa und Ihrem CRM synchronisiert werden sollen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <h3 className="font-medium">Kandidaten als Leads synchronisieren</h3>
                  <p className="text-sm text-gray-500">Kandidaten aus HeiBa werden als Leads oder Kontakte in Ihrem CRM angelegt</p>
                </div>
                <Switch id="sync-candidates" checked={true} />
              </div>
              
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <h3 className="font-medium">Kunden synchronisieren</h3>
                  <p className="text-sm text-gray-500">Kundendaten werden zwischen HeiBa und Ihrem CRM synchronisiert</p>
                </div>
                <Switch id="sync-customers" checked={true} />
              </div>
              
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <h3 className="font-medium">Aktivitäten synchronisieren</h3>
                  <p className="text-sm text-gray-500">Termine und Aktivitäten werden im CRM protokolliert</p>
                </div>
                <Switch id="sync-activities" checked={false} />
              </div>
              
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <h3 className="font-medium">Stellenausschreibungen synchronisieren</h3>
                  <p className="text-sm text-gray-500">Stellenausschreibungen werden als Opportunities im CRM angelegt</p>
                </div>
                <Switch id="sync-jobs" checked={true} />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button>Synchronisation jetzt ausführen</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Synchronisations-Verlauf</CardTitle>
            <CardDescription>
              Übersicht der letzten Synchronisationen zwischen HeiBa und Ihrem CRM
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                <div>
                  <h3 className="font-medium">Vollständige Synchronisation</h3>
                  <p className="text-sm text-gray-500">57 Datensätze synchronisiert</p>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Erfolgreich
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">09.03.2025, 06:30</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                <div>
                  <h3 className="font-medium">Neue Leads</h3>
                  <p className="text-sm text-gray-500">12 Kandidaten synchronisiert</p>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Erfolgreich
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">08.03.2025, 18:00</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                <div>
                  <h3 className="font-medium">Aktivitäten-Synchronisation</h3>
                  <p className="text-sm text-gray-500">5 Aktivitäten synchronisiert</p>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Fehler
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">08.03.2025, 12:15</div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">Synchronisations-Protokolle anzeigen</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
