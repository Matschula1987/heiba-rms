'use client'

import React, { useState, useEffect } from 'react'
import { Loader2, RefreshCw, PlusCircle, Settings, Trash2, ExternalLink, FileText, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface RSSFeedSource {
  id: string;
  name: string;
  url: string;
  category?: string;
  sourceType: string;
  formatTemplate?: string;
  active: boolean;
  updateInterval: number;
  lastUpdate?: string;
  errorCount: number;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}

export default function RSSFeedsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [feedSources, setFeedSources] = useState<RSSFeedSource[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState<RSSFeedSource | null>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [isTestLoading, setIsTestLoading] = useState(false);
  
  const [formState, setFormState] = useState({
    name: '',
    url: '',
    category: '',
    sourceType: 'generic',
    formatTemplate: '',
    active: true,
    updateInterval: 60
  });
  
  // Laden der Feed-Quellen von der API
  const fetchFeedSources = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/job-portals/rss');
      if (!response.ok) {
        throw new Error('Fehler beim Laden der RSS-Feed-Quellen');
      }
      
      const data = await response.json();
      setFeedSources(data.sources || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Fehler beim Laden der RSS-Feed-Quellen:', error);
      setError('Die RSS-Feed-Quellen konnten nicht geladen werden. Bitte versuchen Sie es später erneut.');
      setIsLoading(false);
    }
  };
  
  // Feed-Quellen beim Laden der Seite abrufen
  useEffect(() => {
    fetchFeedSources();
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-gray-500">Lade RSS-Feed-Quellen...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">RSS-Feed-Verwaltung</h1>
          <p className="text-gray-600">Verwalten Sie RSS-Feeds für den Import von Stellenangeboten</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center">
            <RefreshCw className="h-4 w-4 mr-1" />
            Aktualisieren
          </Button>
          
          <Button size="sm" onClick={() => setIsAddDialogOpen(true)} className="flex items-center">
            <PlusCircle className="h-4 w-4 mr-1" />
            Neuen Feed hinzufügen
          </Button>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Fehler</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {feedSources.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">Keine RSS-Feed-Quellen vorhanden</h3>
          <p className="text-gray-500 mb-4">Sie haben noch keine RSS-Feed-Quellen hinzugefügt.</p>
          <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center mx-auto">
            <PlusCircle className="h-4 w-4 mr-2" />
            Feed-Quelle hinzufügen
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {feedSources.map((feed) => (
            <Card key={feed.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{feed.name}</CardTitle>
                    <CardDescription className="text-xs truncate max-w-[200px]">
                      {feed.url}
                    </CardDescription>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${feed.active ? 'bg-green-500' : 'bg-gray-300'}`} />
                </div>
              </CardHeader>
              <CardContent className="pb-2 pt-0">
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Kategorie:</span>
                    <span>{feed.category || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Typ:</span>
                    <span>{feed.sourceType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Update:</span>
                    <span>Alle {feed.updateInterval} Minuten</span>
                  </div>
                  {feed.lastUpdate && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Letztes Update:</span>
                      <span>{new Date(feed.lastUpdate).toLocaleString()}</span>
                    </div>
                  )}
                  {feed.errorCount > 0 && (
                    <div className="flex justify-between text-red-500">
                      <span>Fehler:</span>
                      <span>{feed.errorCount}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedFeed(feed);
                    setFormState({
                      name: feed.name,
                      url: feed.url,
                      category: feed.category || '',
                      sourceType: feed.sourceType,
                      formatTemplate: feed.formatTemplate || '',
                      active: feed.active,
                      updateInterval: feed.updateInterval
                    });
                    setIsEditDialogOpen(true);
                  }}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Bearbeiten
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Löschen
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Dialog: Neue Feed-Quelle hinzufügen */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Neue RSS-Feed-Quelle hinzufügen</DialogTitle>
            <DialogDescription>
              Fügen Sie eine neue Quelle für den Import von Stellenangeboten hinzu.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="basic">Grundeinstellungen</TabsTrigger>
              <TabsTrigger value="advanced">Erweitert</TabsTrigger>
              <TabsTrigger value="test">Feed testen</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="feed-name">Name</Label>
                <Input
                  id="feed-name"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  placeholder="z.B. Indeed Jobs"
                />
              </div>
              
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="feed-url">URL</Label>
                <Input
                  id="feed-url"
                  value={formState.url}
                  onChange={(e) => setFormState({ ...formState, url: e.target.value })}
                  placeholder="https://beispiel.de/jobs.rss"
                />
              </div>
              
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="feed-category">Kategorie (optional)</Label>
                <Input
                  id="feed-category"
                  value={formState.category}
                  onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                  placeholder="z.B. IT, Marketing, etc."
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="feed-active"
                  checked={formState.active}
                  onCheckedChange={(checked) => setFormState({ ...formState, active: checked })}
                />
                <Label htmlFor="feed-active">Feed aktiv</Label>
              </div>
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="feed-interval">Update-Intervall (Minuten)</Label>
                <Input
                  id="feed-interval"
                  type="number"
                  min="1"
                  max="1440"
                  value={formState.updateInterval}
                  onChange={(e) => setFormState({ ...formState, updateInterval: parseInt(e.target.value) || 60 })}
                />
              </div>
              
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="feed-type">Feed-Typ</Label>
                <Select
                  value={formState.sourceType}
                  onValueChange={(value) => setFormState({ ...formState, sourceType: value })}
                >
                  <SelectTrigger id="feed-type">
                    <SelectValue placeholder="Feed-Typ auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="generic">Generischer RSS-Feed</SelectItem>
                    <SelectItem value="indeed">Indeed</SelectItem>
                    <SelectItem value="monster">Monster</SelectItem>
                    <SelectItem value="stepstone">Stepstone</SelectItem>
                    <SelectItem value="custom">Benutzerdefiniert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="feed-template">Format-Vorlage (optional)</Label>
                <Textarea
                  id="feed-template"
                  value={formState.formatTemplate}
                  onChange={(e) => setFormState({ ...formState, formatTemplate: e.target.value })}
                  placeholder="Benutzerdefinierte Formatierungsvorlage für diesen Feed..."
                  className="min-h-[100px]"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="test" className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Um den Feed zu testen, benötigen wir die URL des Feeds. Bitte geben Sie die URL auf der Registerkarte "Grundeinstellungen" ein.
                </p>
              </div>
              
              <Button
                disabled={isTestLoading || !formState.url}
                className="w-full"
                onClick={() => {
                  setIsTestLoading(true);
                  // Simuliere Test
                  setTimeout(() => {
                    setTestResult({
                      success: true,
                      items: 15,
                      sample: [
                        { title: "Beispiel Job 1", link: "https://example.com/job1" },
                        { title: "Beispiel Job 2", link: "https://example.com/job2" }
                      ]
                    });
                    setIsTestLoading(false);
                  }, 1500);
                }}
              >
                {isTestLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Teste Feed...
                  </>
                ) : (
                  'Feed jetzt testen'
                )}
              </Button>
              
              {testResult && (
                <div className="mt-4 border rounded-lg">
                  <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
                    <h4 className="font-medium">Testergebnis</h4>
                    {testResult.success ? (
                      <div className="flex items-center text-green-600">
                        <Check className="h-4 w-4 mr-1" />
                        Erfolgreich
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600">
                        <X className="h-4 w-4 mr-1" />
                        Fehlgeschlagen
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    {testResult.success ? (
                      <>
                        <p className="text-sm mb-2">{testResult.items} Stellenangebote gefunden</p>
                        <div className="space-y-2">
                          {testResult.sample.map((item: any, index: number) => (
                            <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                              <div className="font-medium">{item.title}</div>
                              <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs flex items-center">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                {item.link}
                              </a>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-red-600">
                        {testResult.error || "Unbekannter Fehler beim Testen des Feeds."}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button>
              Feed hinzufügen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog: Feed-Quelle bearbeiten */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Feed-Quelle bearbeiten</DialogTitle>
            <DialogDescription>
              Bearbeiten Sie die Einstellungen für diese Feed-Quelle.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="basic">Grundeinstellungen</TabsTrigger>
              <TabsTrigger value="advanced">Erweitert</TabsTrigger>
              <TabsTrigger value="test">Feed testen</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="edit-feed-name">Name</Label>
                <Input
                  id="edit-feed-name"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                />
              </div>
              
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="edit-feed-url">URL</Label>
                <Input
                  id="edit-feed-url"
                  value={formState.url}
                  onChange={(e) => setFormState({ ...formState, url: e.target.value })}
                />
              </div>
              
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="edit-feed-category">Kategorie</Label>
                <Input
                  id="edit-feed-category"
                  value={formState.category}
                  onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-feed-active"
                  checked={formState.active}
                  onCheckedChange={(checked) => setFormState({ ...formState, active: checked })}
                />
                <Label htmlFor="edit-feed-active">Feed aktiv</Label>
              </div>
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="edit-feed-interval">Update-Intervall (Minuten)</Label>
                <Input
                  id="edit-feed-interval"
                  type="number"
                  min="1"
                  max="1440"
                  value={formState.updateInterval}
                  onChange={(e) => setFormState({ ...formState, updateInterval: parseInt(e.target.value) || 60 })}
                />
              </div>
              
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="edit-feed-type">Feed-Typ</Label>
                <Select
                  value={formState.sourceType}
                  onValueChange={(value) => setFormState({ ...formState, sourceType: value })}
                >
                  <SelectTrigger id="edit-feed-type">
                    <SelectValue placeholder="Feed-Typ auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="generic">Generischer RSS-Feed</SelectItem>
                    <SelectItem value="indeed">Indeed</SelectItem>
                    <SelectItem value="monster">Monster</SelectItem>
                    <SelectItem value="stepstone">Stepstone</SelectItem>
                    <SelectItem value="custom">Benutzerdefiniert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="edit-feed-template">Format-Vorlage</Label>
                <Textarea
                  id="edit-feed-template"
                  value={formState.formatTemplate}
                  onChange={(e) => setFormState({ ...formState, formatTemplate: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="test" className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Testen Sie den Feed, um zu überprüfen, ob er korrekt gelesen werden kann und gültige Job-Daten enthält.
                </p>
              </div>
              
              <Button
                disabled={isTestLoading || !formState.url}
                className="w-full"
                onClick={() => {
                  setIsTestLoading(true);
                  // Simuliere Test
                  setTimeout(() => {
                    setTestResult({
                      success: true,
                      items: 15,
                      sample: [
                        { title: "Beispiel Job 1", link: "https://example.com/job1" },
                        { title: "Beispiel Job 2", link: "https://example.com/job2" }
                      ]
                    });
                    setIsTestLoading(false);
                  }, 1500);
                }}
              >
                {isTestLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Teste Feed...
                  </>
                ) : (
                  'Feed jetzt testen'
                )}
              </Button>
              
              {testResult && (
                <div className="mt-4 border rounded-lg">
                  <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
                    <h4 className="font-medium">Testergebnis</h4>
                    {testResult.success ? (
                      <div className="flex items-center text-green-600">
                        <Check className="h-4 w-4 mr-1" />
                        Erfolgreich
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600">
                        <X className="h-4 w-4 mr-1" />
                        Fehlgeschlagen
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    {testResult.success ? (
                      <>
                        <p className="text-sm mb-2">{testResult.items} Stellenangebote gefunden</p>
                        <div className="space-y-2">
                          {testResult.sample.map((item: any, index: number) => (
                            <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                              <div className="font-medium">{item.title}</div>
                              <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs flex items-center">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                {item.link}
                              </a>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-red-600">
                        {testResult.error || "Unbekannter Fehler beim Testen des Feeds."}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button>
              Änderungen speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Feed testen (alleinstehend) */}
      <Dialog>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>RSS-Feed testen</DialogTitle>
            <DialogDescription>
              Teste Feed-URL auf Kompatibilität und Inhalt
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="test-feed-url">Feed-URL</Label>
              <Input
                id="test-feed-url"
                placeholder="https://beispiel.de/jobs.rss"
              />
            </div>
            
            <Button className="w-full">
              Feed testen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
