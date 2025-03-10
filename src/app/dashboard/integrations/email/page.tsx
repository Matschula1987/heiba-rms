'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Heading } from '@/components/ui/heading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function EmailIntegrationPage() {
  const [activeProvider, setActiveProvider] = useState('tobit-david');
  const [providerConfig, setProviderConfig] = useState({
    apiKey: '',
    serverUrl: 'https://api.tobit-david.com/v1',
    senderEmail: 'recruiting@heiba.de',
    senderName: 'HeiBa Recruiting'
  });
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{success?: boolean; message?: string} | null>(null);

  // Dummy-Funktion für das Speichern der Konfiguration
  const saveConfiguration = () => {
    console.log('Konfiguration gespeichert:', providerConfig);
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
    
    // Simulierte Verzögerung für die API-Anfrage
    setTimeout(() => {
      setIsTesting(false);
      if (providerConfig.apiKey) {
        setTestResult({
          success: true,
          message: 'Verbindung zum TobitDavid API-Server erfolgreich hergestellt.'
        });
      } else {
        setTestResult({
          success: false,
          message: 'Verbindung fehlgeschlagen. API-Schlüssel fehlt oder ist ungültig.'
        });
      }
    }, 1500);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <Heading 
          title="E-Mail-Integration" 
          description="Konfigurieren Sie die E-Mail-Integration für automatisierte Kommunikation."
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>E-Mail-Anbieter</CardTitle>
            <CardDescription>
              Wählen Sie einen E-Mail-Anbieter für ausgehende Nachrichten.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="tobit-david" className="w-full" onValueChange={setActiveProvider}>
              <TabsList className="mb-4">
                <TabsTrigger value="tobit-david">TobitDavid</TabsTrigger>
                <TabsTrigger value="smtp">SMTP</TabsTrigger>
                <TabsTrigger value="microsoft365">Microsoft 365</TabsTrigger>
                <TabsTrigger value="gmail">Gmail</TabsTrigger>
              </TabsList>
              
              <TabsContent value="tobit-david">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="apiKey">API-Schlüssel</Label>
                    <Input 
                      id="apiKey" 
                      type="password" 
                      value={providerConfig.apiKey}
                      onChange={(e) => setProviderConfig({...providerConfig, apiKey: e.target.value})}
                      placeholder="Ihr TobitDavid API-Schlüssel"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="serverUrl">Server-URL</Label>
                    <Input 
                      id="serverUrl" 
                      type="text" 
                      value={providerConfig.serverUrl}
                      onChange={(e) => setProviderConfig({...providerConfig, serverUrl: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="senderEmail">Absender-E-Mail</Label>
                    <Input 
                      id="senderEmail" 
                      type="email" 
                      value={providerConfig.senderEmail}
                      onChange={(e) => setProviderConfig({...providerConfig, senderEmail: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="senderName">Absender-Name</Label>
                    <Input 
                      id="senderName" 
                      type="text" 
                      value={providerConfig.senderName}
                      onChange={(e) => setProviderConfig({...providerConfig, senderName: e.target.value})}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="smtp">
                <div className="flex items-center justify-center h-40">
                  <p className="text-gray-500">SMTP-Konfiguration wird in Kürze verfügbar sein.</p>
                </div>
              </TabsContent>
              
              <TabsContent value="microsoft365">
                <div className="flex items-center justify-center h-40">
                  <p className="text-gray-500">Microsoft 365-Integration wird in Kürze verfügbar sein.</p>
                </div>
              </TabsContent>
              
              <TabsContent value="gmail">
                <div className="flex items-center justify-center h-40">
                  <p className="text-gray-500">Gmail-Integration wird in Kürze verfügbar sein.</p>
                </div>
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
            <CardTitle>E-Mail-Vorlagen</CardTitle>
            <CardDescription>
              Verwalten Sie Ihre E-Mail-Vorlagen für verschiedene Kommunikationszwecke.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Kategorie</th>
                  <th className="text-left py-2">Zuletzt aktualisiert</th>
                  <th className="text-right py-2">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">Bewerbungseingang</td>
                  <td className="py-2">Bewerbung</td>
                  <td className="py-2">02.03.2025</td>
                  <td className="py-2 text-right">
                    <Button variant="outline" size="sm" className="mr-1">Bearbeiten</Button>
                    <Button variant="outline" size="sm" className="text-red-600">Löschen</Button>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Interview-Einladung</td>
                  <td className="py-2">Interview</td>
                  <td className="py-2">28.02.2025</td>
                  <td className="py-2 text-right">
                    <Button variant="outline" size="sm" className="mr-1">Bearbeiten</Button>
                    <Button variant="outline" size="sm" className="text-red-600">Löschen</Button>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Absage</td>
                  <td className="py-2">Absage</td>
                  <td className="py-2">01.03.2025</td>
                  <td className="py-2 text-right">
                    <Button variant="outline" size="sm" className="mr-1">Bearbeiten</Button>
                    <Button variant="outline" size="sm" className="text-red-600">Löschen</Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </CardContent>
          <CardFooter>
            <Button>Neue Vorlage erstellen</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>E-Mail-Protokolle</CardTitle>
            <CardDescription>
              Überwachen Sie den Status Ihrer gesendeten E-Mails.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b py-2">
                <div>
                  <p className="font-medium">Bewerbungsbestätigung</p>
                  <p className="text-sm text-gray-500">An: max.mustermann@example.com</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">Gesendet</span>
                  <p className="text-sm text-gray-500 mt-1">09.03.2025, 14:30</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between border-b py-2">
                <div>
                  <p className="font-medium">Interview-Einladung</p>
                  <p className="text-sm text-gray-500">An: anna.schmidt@example.com</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs">In Warteschlange</span>
                  <p className="text-sm text-gray-500 mt-1">09.03.2025, 14:25</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between border-b py-2">
                <div>
                  <p className="font-medium">Absage</p>
                  <p className="text-sm text-gray-500">An: peter.mueller@example.com</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs">Fehlgeschlagen</span>
                  <p className="text-sm text-gray-500 mt-1">09.03.2025, 13:45</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline">Protokolle anzeigen</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
