'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Heading } from '@/components/ui/heading'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export default function SocialMediaIntegrationPage() {
  const [activeProvider, setActiveProvider] = useState('linkedin')
  const [linkedInConfig, setLinkedInConfig] = useState({
    apiKey: '',
    apiSecret: '',
    redirectUri: 'https://app.heiba-recruitment.com/api/callback/linkedin',
    accessToken: '',
    refreshToken: '',
    enabled: false
  })
  const [xingConfig, setXingConfig] = useState({
    consumerKey: '',
    consumerSecret: '',
    redirectUri: 'https://app.heiba-recruitment.com/api/callback/xing',
    accessToken: '',
    tokenSecret: '',
    enabled: false
  })
  const [facebookConfig, setFacebookConfig] = useState({
    appId: '',
    appSecret: '',
    redirectUri: 'https://app.heiba-recruitment.com/api/callback/facebook',
    accessToken: '',
    pageId: '',
    enabled: false
  })
  const [instagramConfig, setInstagramConfig] = useState({
    appId: '',
    appSecret: '',
    redirectUri: 'https://app.heiba-recruitment.com/api/callback/instagram',
    accessToken: '',
    businessAccountId: '',
    enabled: false
  })

  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{success?: boolean; message?: string} | null>(null)

  // Dummy-Funktion für das Speichern der Konfiguration
  const saveConfiguration = () => {
    let configToSave;
    
    switch (activeProvider) {
      case 'linkedin':
        configToSave = linkedInConfig;
        break;
      case 'xing':
        configToSave = xingConfig;
        break;
      case 'facebook':
        configToSave = facebookConfig;
        break;
      case 'instagram':
        configToSave = instagramConfig;
        break;
      default:
        configToSave = linkedInConfig;
    }
    
    console.log('Konfiguration gespeichert:', configToSave)
    setTestResult({
      success: true,
      message: 'Konfiguration wurde erfolgreich gespeichert.'
    })
    setTimeout(() => setTestResult(null), 3000)
  }

  // Dummy-Funktion für den Verbindungstest
  const testConnection = () => {
    setIsTesting(true)
    setTestResult(null)
    
    // Simuliere API-Anfrage
    setTimeout(() => {
      setIsTesting(false)
      
      let hasRequiredFields = false;
      
      switch (activeProvider) {
        case 'linkedin':
          hasRequiredFields = Boolean(linkedInConfig.apiKey && linkedInConfig.apiSecret);
          break;
        case 'xing':
          hasRequiredFields = Boolean(xingConfig.consumerKey && xingConfig.consumerSecret);
          break;
        case 'facebook':
        case 'instagram':
          hasRequiredFields = Boolean(
            activeProvider === 'facebook' 
              ? facebookConfig.appId && facebookConfig.appSecret
              : instagramConfig.appId && instagramConfig.appSecret
          );
          break;
        default:
          hasRequiredFields = false;
      }

      if (hasRequiredFields) {
        setTestResult({
          success: true,
          message: `Verbindung zu ${getPlatformDisplayName(activeProvider)} erfolgreich hergestellt.`
        })
      } else {
        setTestResult({
          success: false,
          message: `Verbindung fehlgeschlagen. Bitte überprüfen Sie die API-Zugangsdaten für ${getPlatformDisplayName(activeProvider)}.`
        })
      }
    }, 1500)
  }

  const getPlatformDisplayName = (platform: string) => {
    switch (platform) {
      case 'linkedin': return 'LinkedIn'
      case 'xing': return 'XING'
      case 'facebook': return 'Facebook'
      case 'instagram': return 'Instagram'
      default: return platform
    }
  }

  const renderLinkedInForm = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="linkedin-enabled" className="flex items-center space-x-2">
          <span>LinkedIn-Integration aktivieren</span>
        </Label>
        <Switch 
          id="linkedin-enabled" 
          checked={linkedInConfig.enabled}
          onCheckedChange={(checked) => setLinkedInConfig({...linkedInConfig, enabled: checked})}
        />
      </div>
      
      <div>
        <Label htmlFor="linkedin-api-key">API-Schlüssel (Client ID)</Label>
        <Input 
          id="linkedin-api-key" 
          type="password" 
          value={linkedInConfig.apiKey}
          onChange={(e) => setLinkedInConfig({...linkedInConfig, apiKey: e.target.value})}
          placeholder="Ihr LinkedIn API-Schlüssel"
        />
      </div>
      
      <div>
        <Label htmlFor="linkedin-api-secret">API-Secret (Client Secret)</Label>
        <Input 
          id="linkedin-api-secret" 
          type="password" 
          value={linkedInConfig.apiSecret}
          onChange={(e) => setLinkedInConfig({...linkedInConfig, apiSecret: e.target.value})}
          placeholder="Ihr LinkedIn API-Secret"
        />
      </div>

      <div>
        <Label htmlFor="linkedin-redirect-uri">Redirect URI</Label>
        <Input 
          id="linkedin-redirect-uri" 
          type="text" 
          value={linkedInConfig.redirectUri}
          onChange={(e) => setLinkedInConfig({...linkedInConfig, redirectUri: e.target.value})}
        />
      </div>

      <div>
        <Label htmlFor="linkedin-access-token">Access Token</Label>
        <div className="flex space-x-2">
          <Input 
            id="linkedin-access-token" 
            type="password" 
            value={linkedInConfig.accessToken}
            onChange={(e) => setLinkedInConfig({...linkedInConfig, accessToken: e.target.value})}
            placeholder="Wird automatisch nach der Authentifizierung gesetzt"
            readOnly={true}
            className="flex-grow"
          />
          <Button variant="outline">Authentifizieren</Button>
        </div>
      </div>
    </div>
  )

  const renderXingForm = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="xing-enabled" className="flex items-center space-x-2">
          <span>XING-Integration aktivieren</span>
        </Label>
        <Switch 
          id="xing-enabled" 
          checked={xingConfig.enabled}
          onCheckedChange={(checked) => setXingConfig({...xingConfig, enabled: checked})}
        />
      </div>
      
      <div>
        <Label htmlFor="xing-consumer-key">Consumer Key</Label>
        <Input 
          id="xing-consumer-key" 
          type="password" 
          value={xingConfig.consumerKey}
          onChange={(e) => setXingConfig({...xingConfig, consumerKey: e.target.value})}
          placeholder="Ihr XING Consumer Key"
        />
      </div>
      
      <div>
        <Label htmlFor="xing-consumer-secret">Consumer Secret</Label>
        <Input 
          id="xing-consumer-secret" 
          type="password" 
          value={xingConfig.consumerSecret}
          onChange={(e) => setXingConfig({...xingConfig, consumerSecret: e.target.value})}
          placeholder="Ihr XING Consumer Secret"
        />
      </div>

      <div>
        <Label htmlFor="xing-redirect-uri">Redirect URI</Label>
        <Input 
          id="xing-redirect-uri" 
          type="text" 
          value={xingConfig.redirectUri}
          onChange={(e) => setXingConfig({...xingConfig, redirectUri: e.target.value})}
        />
      </div>

      <div>
        <Label htmlFor="xing-access-token">Access Token</Label>
        <div className="flex space-x-2">
          <Input 
            id="xing-access-token" 
            type="password" 
            value={xingConfig.accessToken}
            onChange={(e) => setXingConfig({...xingConfig, accessToken: e.target.value})}
            placeholder="Wird automatisch nach der Authentifizierung gesetzt"
            readOnly={true}
            className="flex-grow"
          />
          <Button variant="outline">Authentifizieren</Button>
        </div>
      </div>
    </div>
  )

  const renderFacebookForm = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="facebook-enabled" className="flex items-center space-x-2">
          <span>Facebook-Integration aktivieren</span>
        </Label>
        <Switch 
          id="facebook-enabled" 
          checked={facebookConfig.enabled}
          onCheckedChange={(checked) => setFacebookConfig({...facebookConfig, enabled: checked})}
        />
      </div>
      
      <div>
        <Label htmlFor="facebook-app-id">App ID</Label>
        <Input 
          id="facebook-app-id" 
          type="password" 
          value={facebookConfig.appId}
          onChange={(e) => setFacebookConfig({...facebookConfig, appId: e.target.value})}
          placeholder="Ihre Facebook App ID"
        />
      </div>
      
      <div>
        <Label htmlFor="facebook-app-secret">App Secret</Label>
        <Input 
          id="facebook-app-secret" 
          type="password" 
          value={facebookConfig.appSecret}
          onChange={(e) => setFacebookConfig({...facebookConfig, appSecret: e.target.value})}
          placeholder="Ihr Facebook App Secret"
        />
      </div>

      <div>
        <Label htmlFor="facebook-redirect-uri">Redirect URI</Label>
        <Input 
          id="facebook-redirect-uri" 
          type="text" 
          value={facebookConfig.redirectUri}
          onChange={(e) => setFacebookConfig({...facebookConfig, redirectUri: e.target.value})}
        />
      </div>

      <div>
        <Label htmlFor="facebook-page-id">Facebook Seiten-ID</Label>
        <Input 
          id="facebook-page-id" 
          type="text" 
          value={facebookConfig.pageId}
          onChange={(e) => setFacebookConfig({...facebookConfig, pageId: e.target.value})}
          placeholder="ID Ihrer Facebook-Unternehmensseite"
        />
      </div>

      <div>
        <Label htmlFor="facebook-access-token">Access Token</Label>
        <div className="flex space-x-2">
          <Input 
            id="facebook-access-token" 
            type="password" 
            value={facebookConfig.accessToken}
            onChange={(e) => setFacebookConfig({...facebookConfig, accessToken: e.target.value})}
            placeholder="Wird automatisch nach der Authentifizierung gesetzt"
            readOnly={true}
            className="flex-grow"
          />
          <Button variant="outline">Authentifizieren</Button>
        </div>
      </div>
    </div>
  )

  const renderInstagramForm = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="instagram-enabled" className="flex items-center space-x-2">
          <span>Instagram-Integration aktivieren</span>
        </Label>
        <Switch 
          id="instagram-enabled" 
          checked={instagramConfig.enabled}
          onCheckedChange={(checked) => setInstagramConfig({...instagramConfig, enabled: checked})}
        />
      </div>
      
      <div>
        <Label htmlFor="instagram-app-id">App ID</Label>
        <Input 
          id="instagram-app-id" 
          type="password" 
          value={instagramConfig.appId}
          onChange={(e) => setInstagramConfig({...instagramConfig, appId: e.target.value})}
          placeholder="Ihre Instagram App ID"
        />
      </div>
      
      <div>
        <Label htmlFor="instagram-app-secret">App Secret</Label>
        <Input 
          id="instagram-app-secret" 
          type="password" 
          value={instagramConfig.appSecret}
          onChange={(e) => setInstagramConfig({...instagramConfig, appSecret: e.target.value})}
          placeholder="Ihr Instagram App Secret"
        />
      </div>

      <div>
        <Label htmlFor="instagram-redirect-uri">Redirect URI</Label>
        <Input 
          id="instagram-redirect-uri" 
          type="text" 
          value={instagramConfig.redirectUri}
          onChange={(e) => setInstagramConfig({...instagramConfig, redirectUri: e.target.value})}
        />
      </div>

      <div>
        <Label htmlFor="instagram-business-account-id">Business-Account-ID</Label>
        <Input 
          id="instagram-business-account-id" 
          type="text" 
          value={instagramConfig.businessAccountId}
          onChange={(e) => setInstagramConfig({...instagramConfig, businessAccountId: e.target.value})}
          placeholder="ID Ihres Instagram Business-Accounts"
        />
      </div>

      <div>
        <Label htmlFor="instagram-access-token">Access Token</Label>
        <div className="flex space-x-2">
          <Input 
            id="instagram-access-token" 
            type="password" 
            value={instagramConfig.accessToken}
            onChange={(e) => setInstagramConfig({...instagramConfig, accessToken: e.target.value})}
            placeholder="Wird automatisch nach der Authentifizierung gesetzt"
            readOnly={true}
            className="flex-grow"
          />
          <Button variant="outline">Authentifizieren</Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <Heading 
          title="Social Media Integration" 
          description="Verwalten Sie Ihre Unternehmensprofile und automatisieren Sie Stellenausschreibungen auf sozialen Netzwerken."
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Social Media Plattformen</CardTitle>
            <CardDescription>
              Konfigurieren Sie die APIs für verschiedene Social-Media-Plattformen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="linkedin" className="w-full" onValueChange={setActiveProvider}>
              <TabsList className="mb-4">
                <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
                <TabsTrigger value="xing">XING</TabsTrigger>
                <TabsTrigger value="facebook">Facebook</TabsTrigger>
                <TabsTrigger value="instagram">Instagram</TabsTrigger>
              </TabsList>
              
              <TabsContent value="linkedin">
                {renderLinkedInForm()}
              </TabsContent>
              
              <TabsContent value="xing">
                {renderXingForm()}
              </TabsContent>
              
              <TabsContent value="facebook">
                {renderFacebookForm()}
              </TabsContent>
              
              <TabsContent value="instagram">
                {renderInstagramForm()}
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
            <CardTitle>Automatisierte Beiträge</CardTitle>
            <CardDescription>
              Konfigurieren Sie automatische Beiträge für Ihre Social-Media-Kanäle.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <h3 className="font-medium mb-2">Aktive Automatisierungen</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Name</th>
                    <th className="text-left py-2">Plattform</th>
                    <th className="text-left py-2">Häufigkeit</th>
                    <th className="text-right py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">Neue Stellenangebote</td>
                    <td className="py-2">LinkedIn, XING</td>
                    <td className="py-2">Bei Erstellung</td>
                    <td className="py-2 text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Aktiv
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Wöchentliche Top-Jobs</td>
                    <td className="py-2">Facebook, Instagram</td>
                    <td className="py-2">Wöchentlich (Mo, 9:00)</td>
                    <td className="py-2 text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Geplant
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h3 className="font-medium mb-2">Beitragsvorlagen</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Vorlage</th>
                    <th className="text-left py-2">Verwendung</th>
                    <th className="text-right py-2">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">Standard-Stellenanzeige</td>
                    <td className="py-2">Für einzelne Stellenanzeigen</td>
                    <td className="py-2 text-right">
                      <Button variant="outline" size="sm">Bearbeiten</Button>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Wöchentliche Übersicht</td>
                    <td className="py-2">Für Zusammenfassungen</td>
                    <td className="py-2 text-right">
                      <Button variant="outline" size="sm">Bearbeiten</Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
          <CardFooter>
            <Button>Neue Automatisierung erstellen</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics & Performance</CardTitle>
            <CardDescription>
              Übersicht Ihrer Social-Media-Aktivitäten und Performance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded p-4">
                <h3 className="text-gray-500 text-sm mb-1">Gesamtreichweite</h3>
                <p className="text-2xl font-bold">24.865</p>
                <p className="text-green-600 text-sm">+12% vs. letzter Monat</p>
              </div>
              
              <div className="bg-gray-50 rounded p-4">
                <h3 className="text-gray-500 text-sm mb-1">Interaktionen</h3>
                <p className="text-2xl font-bold">1.245</p>
                <p className="text-green-600 text-sm">+8% vs. letzter Monat</p>
              </div>
              
              <div className="bg-gray-50 rounded p-4">
                <h3 className="text-gray-500 text-sm mb-1">Klicks auf Stellenangebote</h3>
                <p className="text-2xl font-bold">482</p>
                <p className="text-green-600 text-sm">+15% vs. letzter Monat</p>
              </div>
              
              <div className="bg-gray-50 rounded p-4">
                <h3 className="text-gray-500 text-sm mb-1">Bewerbungen durch SM</h3>
                <p className="text-2xl font-bold">36</p>
                <p className="text-yellow-600 text-sm">-2% vs. letzter Monat</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Letzte Beiträge</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Beitrag</th>
                    <th className="text-left py-2">Plattform</th>
                    <th className="text-left py-2">Veröffentlicht</th>
                    <th className="text-left py-2">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 text-sm">Stellenanzeige: Senior Developer (m/w/d)</td>
                    <td className="py-2 text-sm">LinkedIn</td>
                    <td className="py-2 text-sm">08.03.2025</td>
                    <td className="py-2 text-sm">2.543 Views, 132 Interaktionen</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 text-sm">Stellenanzeige: UX/UI Designer (m/w/d)</td>
                    <td className="py-2 text-sm">XING</td>
                    <td className="py-2 text-sm">06.03.2025</td>
                    <td className="py-2 text-sm">1.876 Views, 98 Interaktionen</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 text-sm">Wöchentliche Top-Jobs Übersicht</td>
                    <td className="py-2 text-sm">Facebook</td>
                    <td className="py-2 text-sm">04.03.2025</td>
                    <td className="py-2 text-sm">1.245 Views, 65 Interaktionen</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline">Detaillierte Berichte anzeigen</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
