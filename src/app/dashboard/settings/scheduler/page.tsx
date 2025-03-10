'use client';

import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { initializeScheduler } from '@/lib/dbInit';
import { useSchedulerStore } from '@/store/schedulerStore';
import { SyncSettings, TaskStatus } from '@/types/scheduler';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

// Initialisiere den Scheduler beim Laden der Seite
initializeScheduler().catch(console.error);

/**
 * Komponente zur Verwaltung der Synchronisationseinstellungen
 */
function SyncSettingsManager() {
  const { 
    syncSettings, 
    isLoadingSyncSettings, 
    loadSyncSettings, 
    saveSyncSettings, 
    setSyncEnabled, 
    deleteSyncSettings, 
    triggerSyncNow 
  } = useSchedulerStore();
  
  useEffect(() => {
    loadSyncSettings();
  }, [loadSyncSettings]);
  
  const entityTypes = [
    { value: 'job_portal', label: 'Job-Portal' },
    { value: 'social_media', label: 'Social Media' },
    { value: 'email', label: 'E-Mail' },
    { value: 'movido', label: 'Movido' }
  ];
  
  const timeIntervals = [
    { value: '15m', label: 'Alle 15 Minuten' },
    { value: '30m', label: 'Alle 30 Minuten' },
    { value: '1h', label: 'Stündlich' },
    { value: '3h', label: 'Alle 3 Stunden' },
    { value: '6h', label: 'Alle 6 Stunden' },
    { value: '12h', label: 'Alle 12 Stunden' },
    { value: '24h', label: 'Täglich' },
    { value: '7d', label: 'Wöchentlich' }
  ];
  
  // Hilfsfunktion zur Abbildung der SyncSettings auf eine Intervall-Darstellung
  const getIntervalDisplay = (setting: SyncSettings): string => {
    // Format: 15m, 30m, 1h, etc. aus SyncSettings erstellen
    if (setting.syncIntervalType === 'hourly' && setting.syncIntervalValue) {
      return `${setting.syncIntervalValue}h`;
    } else if (setting.syncIntervalType === 'daily') {
      return '24h';
    } else if (setting.syncIntervalType === 'weekly') {
      return '7d';
    } else if (setting.syncIntervalType === 'custom' && setting.syncIntervalUnit === 'minutes' && setting.syncIntervalValue) {
      return `${setting.syncIntervalValue}m`;
    } else if (setting.syncIntervalType === 'custom' && setting.syncIntervalUnit === 'hours' && setting.syncIntervalValue) {
      return `${setting.syncIntervalValue}h`;
    } else if (setting.syncIntervalType === 'custom' && setting.syncIntervalUnit === 'days' && setting.syncIntervalValue) {
      return `${setting.syncIntervalValue}d`;
    }
    return 'custom';
  };
  
  const syncSettingsByType = syncSettings.reduce((acc, setting) => {
    if (!acc[setting.entityType]) {
      acc[setting.entityType] = [];
    }
    acc[setting.entityType].push(setting);
    return acc;
  }, {} as Record<string, typeof syncSettings>);
  
  return (
    <div className="space-y-6">
      <div className="bg-muted/50 p-4 rounded-lg">
        <p className="text-lg font-semibold">Synchronisationsintervalle</p>
        <p className="text-sm text-muted-foreground mt-1">
          Die Synchronisationsintervalle bestimmen, wie oft Daten mit externen Systemen synchronisiert werden.
          Wählen Sie für jedes System ein passendes Intervall.
        </p>
      </div>
      
      {/* Füge neue Synchronisationseinstellung hinzu */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Neue Synchronisationseinstellung</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entityType">System</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="System auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {entityTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="entityId">ID/Name</Label>
                <Input id="entityId" placeholder="z.B. indeed, linkedin, etc." />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="interval">Intervall</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Intervall auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeIntervals.map(interval => (
                      <SelectItem key={interval.value} value={interval.value}>
                        {interval.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Aktivieren</Label>
                <div className="flex items-center space-x-2 h-10 pt-2">
                  <Switch checked={false} onCheckedChange={() => {}} />
                  <span className="font-normal">Synchronisation aktivieren</span>
                </div>
              </div>
            </div>
            
            <div className="pt-2">
              <Button>Synchronisationseinstellung speichern</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* Vorhandene Einstellungen */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Job-Portale */}
        <div className="border rounded-lg p-4">
          <h3 className="text-md font-semibold">Job-Portale</h3>
          <div className="mt-2 space-y-4">
            {isLoadingSyncSettings ? (
              <p className="text-sm text-muted-foreground">Lade Einstellungen...</p>
            ) : syncSettingsByType.job_portal && syncSettingsByType.job_portal.length > 0 ? (
              syncSettingsByType.job_portal.map(setting => (
                <div key={setting.id} className="p-3 border rounded-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{setting.entityId}</h4>
                      <p className="text-xs text-muted-foreground">
                        Intervall: {timeIntervals.find(i => i.value === getIntervalDisplay(setting))?.label || getIntervalDisplay(setting)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Switch 
                        checked={setting.enabled} 
                        onCheckedChange={(checked) => setSyncEnabled(setting.entityType, setting.entityId, checked)}
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => triggerSyncNow(setting.entityType, setting.entityId)}
                      >
                        <i className="fas fa-sync-alt mr-1 text-xs"></i> Jetzt
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Keine Synchronisationseinstellungen für Job-Portale gefunden.
              </p>
            )}
          </div>
        </div>
        
        {/* Social Media */}
        <div className="border rounded-lg p-4">
          <h3 className="text-md font-semibold">Social Media</h3>
          <div className="mt-2 space-y-4">
            {isLoadingSyncSettings ? (
              <p className="text-sm text-muted-foreground">Lade Einstellungen...</p>
            ) : syncSettingsByType.social_media && syncSettingsByType.social_media.length > 0 ? (
              syncSettingsByType.social_media.map(setting => (
                <div key={setting.id} className="p-3 border rounded-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{setting.entityId}</h4>
                      <p className="text-xs text-muted-foreground">
                        Intervall: {timeIntervals.find(i => i.value === getIntervalDisplay(setting))?.label || getIntervalDisplay(setting)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Switch 
                        checked={setting.enabled} 
                        onCheckedChange={(checked) => setSyncEnabled(setting.entityType, setting.entityId, checked)}
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => triggerSyncNow(setting.entityType, setting.entityId)}
                      >
                        <i className="fas fa-sync-alt mr-1 text-xs"></i> Jetzt
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Keine Synchronisationseinstellungen für Social Media gefunden.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Komponente zur Verwaltung der Social Media Pipeline
 */
function SocialMediaPipelineManager() {
  return (
    <div className="space-y-6">
      <div className="bg-muted/50 p-4 rounded-lg">
        <p className="text-lg font-semibold">Social Media Publishing Pipeline</p>
        <p className="text-sm text-muted-foreground mt-1">
          Mit der Publishing-Pipeline können Sie mehrere Jobs für die Veröffentlichung auf sozialen Medien einplanen.
          Die Veröffentlichung erfolgt automatisch zu den festgelegten Zeiten und gemäß den Einstellungen.
        </p>
      </div>
      
      <div className="space-y-4">
        {/* Hier kommen die Pipeline-Einstellungen für jede Plattform */}
        <div className="border rounded-lg p-4">
          <h3 className="text-md font-semibold">Pipeline-Einstellungen</h3>
          <div className="mt-2 space-y-4">
            {/* Hier würden wir für jede Plattform ein Formular anzeigen */}
            <p className="text-sm text-muted-foreground">
              Laden Sie in Kürze Pipeline-Einstellungen...
            </p>
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <h3 className="text-md font-semibold">Anstehende Posts</h3>
          <div className="mt-2 space-y-4">
            {/* Hier würden wir die anstehenden Posts anzeigen */}
            <p className="text-sm text-muted-foreground">
              Laden Sie in Kürze anstehende Posts...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Komponente zur Verwaltung der Movido Pipeline
 */
function MovidoPipelineManager() {
  return (
    <div className="space-y-6">
      <div className="bg-muted/50 p-4 rounded-lg">
        <p className="text-lg font-semibold">Movido Publishing Pipeline</p>
        <p className="text-sm text-muted-foreground mt-1">
          Mit der Movido-Pipeline können Sie mehrere Jobs für die Veröffentlichung über Movido einplanen.
          Die Veröffentlichung erfolgt automatisch zu den festgelegten Zeiten und gemäß den Einstellungen.
        </p>
      </div>
      
      <div className="space-y-4">
        {/* Hier kommen die Pipeline-Einstellungen für Movido */}
        <div className="border rounded-lg p-4">
          <h3 className="text-md font-semibold">Pipeline-Einstellungen</h3>
          <div className="mt-2 space-y-4">
            {/* Hier würden wir die Einstellungen anzeigen */}
            <p className="text-sm text-muted-foreground">
              Laden Sie in Kürze Movido-Pipeline-Einstellungen...
            </p>
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <h3 className="text-md font-semibold">Anstehende Veröffentlichungen</h3>
          <div className="mt-2 space-y-4">
            {/* Hier würden wir die anstehenden Veröffentlichungen anzeigen */}
            <p className="text-sm text-muted-foreground">
              Laden Sie in Kürze anstehende Veröffentlichungen...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Komponente zur Anzeige und Verwaltung geplanter Aufgaben
 */
function ScheduledTasksManager() {
  const {
    tasks,
    pendingTasks,
    dueTasks,
    isLoadingTasks,
    loadTasks,
    loadPendingTasks,
    loadDueTasks,
    updateTaskStatus,
    deleteTask,
    triggerSchedulerRun
  } = useSchedulerStore();

  useEffect(() => {
    loadTasks();
    loadPendingTasks();
    loadDueTasks();
  }, [loadTasks, loadPendingTasks, loadDueTasks]);

  // Status-Badge-Farben
  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Ausstehend</Badge>;
      case 'running':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">Läuft</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Abgeschlossen</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Fehlgeschlagen</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Abgebrochen</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Formatiert Datum für Anzeige
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-muted/50 p-4 rounded-lg">
        <p className="text-lg font-semibold">Aktive Scheduler-Aufgaben</p>
        <p className="text-sm text-muted-foreground mt-1">
          Hier sehen Sie alle aktiven und geplanten Aufgaben des Schedulers. Sie können diese nach Bedarf anhalten,
          fortsetzen oder löschen.
        </p>
      </div>
      
      <div className="flex justify-end">
        <Button onClick={() => triggerSchedulerRun()} className="mb-4">
          <i className="fas fa-play mr-2"></i> Scheduler manuell ausführen
        </Button>
      </div>
      
      {/* Anstehende Aufgaben */}
      <div className="border rounded-lg p-4">
        <h3 className="text-md font-semibold mb-4">Geplante Aufgaben</h3>
        
        {isLoadingTasks ? (
          <p className="text-sm text-muted-foreground">Lade Aufgaben...</p>
        ) : pendingTasks.length > 0 ? (
          <div className="space-y-3">
            {pendingTasks.map(task => (
              <div key={task.id} className="p-3 border rounded-md">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{task.taskType}</h4>
                      {getStatusBadge(task.status)}
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Geplant für: {formatDate(task.scheduledFor)}
                    </p>
                    {task.entityType && (
                      <p className="text-xs text-muted-foreground">
                        {task.entityType}: {task.entityId}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        if (task.status === 'pending') {
                          updateTaskStatus(task.id, 'cancelled');
                        } else if (task.status === 'cancelled') {
                          updateTaskStatus(task.id, 'pending');
                        }
                      }}
                    >
                      {task.status === 'pending' ? (
                        <>
                          <i className="fas fa-stop mr-1 text-xs"></i> Abbrechen
                        </>
                      ) : task.status === 'cancelled' ? (
                        <>
                          <i className="fas fa-play mr-1 text-xs"></i> Fortsetzen
                        </>
                      ) : (
                        <>
                          <i className="fas fa-info-circle mr-1 text-xs"></i> Details
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Keine anstehenden Aufgaben gefunden.
          </p>
        )}
      </div>
      
      {/* Abgeschlossene Aufgaben */}
      <div className="border rounded-lg p-4">
        <h3 className="text-md font-semibold mb-4">Abgeschlossene Aufgaben</h3>
        
        {isLoadingTasks ? (
          <p className="text-sm text-muted-foreground">Lade Aufgaben...</p>
        ) : tasks.filter(t => t.status === 'completed').length > 0 ? (
          <div className="space-y-3">
            {tasks.filter(t => t.status === 'completed').slice(0, 5).map(task => (
              <div key={task.id} className="p-3 border rounded-md">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{task.taskType}</h4>
                      {getStatusBadge(task.status)}
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Ausgeführt am: {formatDate(task.lastRun || task.updatedAt)}
                    </p>
                    {task.entityType && (
                      <p className="text-xs text-muted-foreground">
                        {task.entityType}: {task.entityId}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteTask(task.id)}
                    >
                      <i className="fas fa-trash mr-1 text-xs"></i> Löschen
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Keine abgeschlossenen Aufgaben gefunden.
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Scheduler-Einstellungsseite
 * Ermöglicht die Verwaltung von Synchronisationseinstellungen und Posting-Pipelines
 */
export default function SchedulerSettingsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Scheduler-Einstellungen</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Verwalten Sie Synchronisationsintervalle und Posting-Pipelines
        </p>
      </div>

      <Tabs defaultValue="sync" className="mt-6">
        <TabsList>
          <TabsTrigger value="sync">Synchronisation</TabsTrigger>
          <TabsTrigger value="social-media">Social Media Pipeline</TabsTrigger>
          <TabsTrigger value="movido">Movido Pipeline</TabsTrigger>
          <TabsTrigger value="tasks">Aktive Aufgaben</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sync" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Synchronisationseinstellungen</CardTitle>
              <CardDescription>
                Konfigurieren Sie die automatische Synchronisation mit externen Portalen und Diensten
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SyncSettingsManager />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="social-media" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Pipeline</CardTitle>
              <CardDescription>
                Verwalten Sie die Veröffentlichung von Jobs auf sozialen Medien
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SocialMediaPipelineManager />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="movido" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Movido Pipeline</CardTitle>
              <CardDescription>
                Konfigurieren Sie die automatische Veröffentlichung über Movido
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MovidoPipelineManager />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tasks" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Aktive Aufgaben</CardTitle>
              <CardDescription>
                Übersicht aller geplanten und aktiven Synchronisations- und Posting-Aufgaben
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScheduledTasksManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
