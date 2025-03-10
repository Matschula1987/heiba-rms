'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Heading } from '@/components/ui/heading';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Connection {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'pending';
  lastSync?: string;
  description: string;
  configUrl?: string;
  logsUrl?: string;
}

export default function ConnectionsPage() {
  const router = useRouter();
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [connections, setConnections] = useState<Connection[]>([
    {
      id: '1',
      name: 'Microsoft Teams',
      type: 'communication',
      status: 'active',
      lastSync: '2025-03-09T10:15:00Z',
      description: 'Integration mit Microsoft Teams für Kommunikation und Kollaboration.',
      configUrl: '/dashboard/integrations/connections/teams/config',
      logsUrl: '/dashboard/integrations/connections/teams/logs'
    },
    {
      id: '2',
      name: 'Google Workspace',
      type: 'productivity',
      status: 'inactive',
      description: 'Verbindung zu Google Workspace für Kalender, Mail und Dokumente.',
      configUrl: '/dashboard/integrations/connections/google/config',
      logsUrl: '/dashboard/integrations/connections/google/logs'
    },
    {
      id: '3',
      name: 'Slack',
      type: 'communication',
      status: 'pending',
      description: 'Integration mit Slack für Team-Kommunikation und Benachrichtigungen.',
      configUrl: '/dashboard/integrations/connections/slack/config',
      logsUrl: '/dashboard/integrations/connections/slack/logs'
    },
    {
      id: '4',
      name: 'Zapier',
      type: 'automation',
      status: 'active',
      lastSync: '2025-03-09T09:30:00Z',
      description: 'Automatisierung von Workflows mit Zapier.',
      configUrl: '/dashboard/integrations/connections/zapier/config',
      logsUrl: '/dashboard/integrations/connections/zapier/logs'
    },
    {
      id: '5',
      name: 'CRM-System',
      type: 'data',
      status: 'active',
      lastSync: '2025-03-09T08:45:00Z',
      description: 'Integration mit dem Kunden-Management-System.',
      configUrl: '/dashboard/integrations/connections/crm/config',
      logsUrl: '/dashboard/integrations/connections/crm/logs'
    }
  ]);

  // Toggle-Funktion für den Connection-Status
  const toggleStatus = (id: string) => {
    setConnections(connections.map(conn => {
      if (conn.id === id) {
        return {
          ...conn,
          status: conn.status === 'active' ? 'inactive' : 'active',
          lastSync: conn.status === 'inactive' ? new Date().toISOString() : conn.lastSync
        };
      }
      return conn;
    }));
  };

  // Synchronisierungs-Funktion
  const handleSync = (id: string) => {
    setConnections(connections.map(conn => {
      if (conn.id === id) {
        return {
          ...conn,
          lastSync: new Date().toISOString()
        };
      }
      return conn;
    }));
  };

  // Konfigurationsdialog öffnen
  const handleOpenConfig = (connection: Connection) => {
    setSelectedConnection(connection);
    setConfigDialogOpen(true);
  };

  // Zur Protokollseite navigieren
  const navigateToLogs = (connection: Connection) => {
    if (connection.logsUrl) {
      router.push(connection.logsUrl);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <Heading 
          title="Verbindungen" 
          description="Verwalten Sie Ihre externen System-Verbindungen und Integrationen."
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {connections.map((connection) => (
          <Card key={connection.id} className="w-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{connection.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id={`status-${connection.id}`}
                    checked={connection.status === 'active'}
                    onCheckedChange={() => toggleStatus(connection.id)}
                    disabled={connection.status === 'pending'}
                  />
                  <Label htmlFor={`status-${connection.id}`} className="text-sm text-gray-500">
                    {connection.status === 'active' ? 'Aktiv' : 
                     connection.status === 'inactive' ? 'Inaktiv' : 'Ausstehend'}
                  </Label>
                </div>
              </div>
              <div className="flex items-center mt-1">
                <span className={`inline-block h-2 w-2 rounded-full mr-2 ${
                  connection.status === 'active' ? 'bg-green-500' : 
                  connection.status === 'inactive' ? 'bg-gray-300' : 'bg-yellow-500'
                }`}></span>
                <CardDescription>
                  {connection.type === 'communication' ? 'Kommunikation' : 
                   connection.type === 'productivity' ? 'Produktivität' : 
                   connection.type === 'data' ? 'Datenaustausch' : 
                   connection.type === 'automation' ? 'Automatisierung' : connection.type}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{connection.description}</p>
              {connection.lastSync && (
                <p className="text-xs text-gray-500 mt-4">
                  Letzte Synchronisierung: {new Date(connection.lastSync).toLocaleString('de-DE')}
                </p>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleSync(connection.id)}
                  disabled={connection.status !== 'active'}
                >
                  Synchronisieren
                </Button>
                {connection.logsUrl && (
                  <Button 
                    variant="outline"
                    onClick={() => navigateToLogs(connection)}
                  >
                    Protokolle
                  </Button>
                )}
              </div>
              <Button 
                variant="outline"
                onClick={() => handleOpenConfig(connection)}
              >
                Konfigurieren
              </Button>
            </CardFooter>
          </Card>
        ))}

        {/* Neue Verbindung hinzufügen */}
        <Card className="w-full border-dashed border-2 flex flex-col justify-center items-center p-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-plus text-gray-400"></i>
            </div>
            <h3 className="font-medium text-gray-900">Neue Verbindung</h3>
            <p className="text-sm text-gray-500 mt-2">Fügen Sie eine neue Integration hinzu</p>
            <Button className="mt-4">Hinzufügen</Button>
          </div>
        </Card>
      </div>

      {/* Konfigurationsdialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedConnection?.name} konfigurieren</DialogTitle>
            <DialogDescription>
              Passen Sie die Einstellungen für die {selectedConnection?.name}-Integration an.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="api-key">API-Schlüssel</Label>
                <input 
                  id="api-key"
                  type="text" 
                  placeholder="API-Schlüssel eingeben" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <input 
                  id="webhook-url"
                  type="text" 
                  placeholder="https://example.com/webhook" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  id="enable-webhooks" 
                  type="checkbox"
                  className="h-4 w-4 text-blue-600"
                />
                <Label htmlFor="enable-webhooks">Webhooks aktivieren</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={() => setConfigDialogOpen(false)}>Speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
