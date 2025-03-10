'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell, Filter, Search, CheckCircle, Trash2, Clock, Calendar, Info } from 'lucide-react';

// Mock-Daten für Benachrichtigungen
const mockNotifications = [
  {
    id: 1,
    title: 'Neue Bewerbung eingegangen',
    message: 'Max Mustermann hat sich auf die Stelle "Frontend Entwickler" beworben.',
    type: 'application',
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 Minuten zuvor
    read: false,
    priority: 'high'
  },
  {
    id: 2,
    title: 'Matching-Ergebnis',
    message: 'Neues Matching-Ergebnis für Kandidat "Anna Schmidt" verfügbar.',
    type: 'matching',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 Stunden zuvor
    read: false,
    priority: 'medium'
  },
  {
    id: 3,
    title: 'Terminerinnerung',
    message: 'Vorstellungsgespräch mit "Thomas Weber" in 2 Stunden.',
    type: 'reminder',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 Stunden zuvor
    read: true,
    priority: 'high'
  },
  {
    id: 4,
    title: 'Integrationsfortschritt',
    message: 'Die Integration mit dem Jobportal Stepstone wurde erfolgreich abgeschlossen.',
    type: 'integration',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 Tag zuvor
    read: true,
    priority: 'low'
  },
  {
    id: 5,
    title: 'Neue Jobs verfügbar',
    message: '3 neue Jobs wurden dem System über die RSS-Feed-Integration hinzugefügt.',
    type: 'job',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 Tage zuvor
    read: false,
    priority: 'medium'
  },
  {
    id: 6,
    title: 'System-Update',
    message: 'Das System wurde auf die neueste Version aktualisiert. Neue Funktionen sind verfügbar.',
    type: 'system',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 Tage zuvor
    read: true,
    priority: 'medium'
  },
  {
    id: 7,
    title: 'Kandidatenprofil aktualisiert',
    message: 'Das Profil von "Julia Mayer" wurde mit neuen Qualifikationen aktualisiert.',
    type: 'candidate',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 Tage zuvor
    read: true,
    priority: 'low'
  },
  {
    id: 8,
    title: 'Neuer Kunde registriert',
    message: 'Ein neuer Kunde "TechStart GmbH" hat sich im System registriert.',
    type: 'customer',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 Tage zuvor
    read: false,
    priority: 'high'
  }
];

// Hilfs-Komponente für Typen-Icons
const TypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'application':
      return <i className="fas fa-file-alt text-blue-500"></i>;
    case 'matching':
      return <i className="fas fa-link text-purple-500"></i>;
    case 'reminder':
      return <i className="fas fa-clock text-yellow-500"></i>;
    case 'integration':
      return <i className="fas fa-plug text-green-500"></i>;
    case 'job':
      return <i className="fas fa-briefcase text-blue-700"></i>;
    case 'system':
      return <i className="fas fa-cog text-gray-600"></i>;
    case 'candidate':
      return <i className="fas fa-user text-indigo-500"></i>;
    case 'customer':
      return <i className="fas fa-building text-orange-500"></i>;
    default:
      return <i className="fas fa-bell text-gray-400"></i>;
  }
};

// Prioritäts-Badge-Komponente
const PriorityBadge = ({ priority }: { priority: string }) => {
  switch (priority) {
    case 'high':
      return <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">Hoch</Badge>;
    case 'medium':
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">Mittel</Badge>;
    case 'low':
      return <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">Niedrig</Badge>;
    default:
      return <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">Normal</Badge>;
  }
};

export default function NotificationsPage() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filteredNotifications, setFilteredNotifications] = useState(mockNotifications);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTab, setSelectedTab] = useState('all');

  // Funktion zum Laden der Benachrichtigungen (in einer echten App würde hier ein API-Aufruf stattfinden)
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setIsLoading(true);
        // Hier würden wir normalerweise einen API-Aufruf machen
        // z.B. const response = await fetch('/api/notifications');
        // const notificationData = await response.json();
        // setNotifications(notificationData);
        
        // Simulierte Verzögerung für die Demonstration
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Fehler beim Laden der Benachrichtigungen:', error);
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, []);

  // Benachrichtigung als gelesen markieren
  const markAsRead = (id: number) => {
    const updatedNotifications = notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    );
    setNotifications(updatedNotifications);
  };

  // Benachrichtigung löschen
  const deleteNotification = (id: number) => {
    const updatedNotifications = notifications.filter(notification => notification.id !== id);
    setNotifications(updatedNotifications);
  };

  // Alle Benachrichtigungen als gelesen markieren
  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({ ...notification, read: true }));
    setNotifications(updatedNotifications);
  };

  // Filtern der Benachrichtigungen basierend auf Filterkriterien
  useEffect(() => {
    let result = notifications;

    // Tab-Filter
    if (selectedTab === 'unread') {
      result = result.filter(notification => !notification.read);
    } else if (selectedTab === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      result = result.filter(notification => new Date(notification.timestamp) >= today);
    }

    // Typ-Filter
    if (typeFilter !== 'all') {
      result = result.filter(notification => notification.type === typeFilter);
    }

    // Status-Filter
    if (statusFilter === 'read') {
      result = result.filter(notification => notification.read);
    } else if (statusFilter === 'unread') {
      result = result.filter(notification => !notification.read);
    }

    // Suchfilter
    if (searchTerm) {
      result = result.filter(
        notification =>
          notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notification.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredNotifications(result);
  }, [notifications, searchTerm, typeFilter, statusFilter, selectedTab]);

  // Formatierung des Zeitstempels
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Gerade eben';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Vor ${minutes} ${minutes === 1 ? 'Minute' : 'Minuten'}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Vor ${hours} ${hours === 1 ? 'Stunde' : 'Stunden'}`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      if (days < 7) {
        return `Vor ${days} ${days === 1 ? 'Tag' : 'Tagen'}`;
      } else {
        return date.toLocaleDateString();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-dark)]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Benachrichtigungen</h1>
          <p className="text-gray-500 mt-1">Verwalten Sie Ihre Benachrichtigungen und bleiben Sie informiert</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            variant="outline" 
            onClick={markAllAsRead} 
            className="mr-2"
            disabled={!notifications.some(n => !n.read)}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Alle als gelesen markieren
          </Button>
          <Button 
            variant="accent"
            onClick={() => window.location.href = '/dashboard/settings/notifications'}
          >
            <Bell className="mr-2 h-4 w-4" />
            Einstellungen
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="mb-6" onValueChange={setSelectedTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="all">Alle</TabsTrigger>
            <TabsTrigger value="unread">Ungelesen</TabsTrigger>
            <TabsTrigger value="today">Heute</TabsTrigger>
          </TabsList>
          <p className="text-sm text-gray-500">
            {filteredNotifications.length} {filteredNotifications.length === 1 ? 'Benachrichtigung' : 'Benachrichtigungen'} gefunden
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Filter</CardTitle>
            <CardDescription>
              Filtern Sie Ihre Benachrichtigungen nach Kategorie, Status oder Stichworten
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Suchen nach Titel oder Nachricht..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-auto min-w-[180px]">
                  <Label htmlFor="type" className="block mb-2">
                    Typ
                  </Label>
                  <select
                    id="type"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full h-10 px-3 border border-gray-300 rounded-md"
                  >
                    <option value="all">Alle Typen</option>
                    <option value="application">Bewerbungen</option>
                    <option value="matching">Matching</option>
                    <option value="reminder">Erinnerungen</option>
                    <option value="integration">Integrationen</option>
                    <option value="job">Jobs</option>
                    <option value="system">System</option>
                    <option value="candidate">Kandidaten</option>
                    <option value="customer">Kunden</option>
                  </select>
                </div>
                <div className="w-full sm:w-auto min-w-[180px]">
                  <Label htmlFor="status" className="block mb-2">
                    Status
                  </Label>
                  <select
                    id="status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full h-10 px-3 border border-gray-300 rounded-md"
                  >
                    <option value="all">Alle Status</option>
                    <option value="read">Gelesen</option>
                    <option value="unread">Ungelesen</option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <TabsContent value="all" className="mt-0">
          <Card>
            <CardContent className="p-0">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Keine Benachrichtigungen</h3>
                  <p className="text-gray-500">
                    Es wurden keine Benachrichtigungen gefunden, die Ihren Filterkriterien entsprechen.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {filteredNotifications.map((notification) => (
                    <li
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        !notification.read ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 pt-1 mr-4">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <TypeIcon type={notification.type} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-base font-medium ${!notification.read ? 'text-[var(--primary-dark)]' : 'text-gray-900'}`}>
                              {notification.title}
                            </h4>
                            <PriorityBadge priority={notification.priority} />
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <div className="flex items-center mt-2">
                            <Clock className="h-3.5 w-3.5 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-500">{formatTimestamp(notification.timestamp)}</span>
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="text-[var(--primary-dark)] hover:text-[var(--primary-dark)]/80 p-1"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="text-gray-400 hover:text-red-600 p-1"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unread" className="mt-0">
          <Card>
            <CardContent className="p-0">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Keine ungelesenen Benachrichtigungen</h3>
                  <p className="text-gray-500">
                    Sie haben alle Ihre Benachrichtigungen gelesen.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {filteredNotifications.map((notification) => (
                    <li
                      key={notification.id}
                      className="p-4 hover:bg-gray-50 transition-colors bg-blue-50/40"
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 pt-1 mr-4">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <TypeIcon type={notification.type} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-base font-medium text-[var(--primary-dark)]">
                              {notification.title}
                            </h4>
                            <PriorityBadge priority={notification.priority} />
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <div className="flex items-center mt-2">
                            <Clock className="h-3.5 w-3.5 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-500">{formatTimestamp(notification.timestamp)}</span>
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="text-[var(--primary-dark)] hover:text-[var(--primary-dark)]/80 p-1"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="text-gray-400 hover:text-red-600 p-1"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="today" className="mt-0">
          <Card>
            <CardContent className="p-0">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Calendar className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Keine Benachrichtigungen für heute</h3>
                  <p className="text-gray-500">
                    Heute wurden keine neuen Benachrichtigungen empfangen.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {filteredNotifications.map((notification) => (
                    <li
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        !notification.read ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 pt-1 mr-4">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <TypeIcon type={notification.type} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-base font-medium ${!notification.read ? 'text-[var(--primary-dark)]' : 'text-gray-900'}`}>
                              {notification.title}
                            </h4>
                            <PriorityBadge priority={notification.priority} />
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <div className="flex items-center mt-2">
                            <Clock className="h-3.5 w-3.5 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-500">{formatTimestamp(notification.timestamp)}</span>
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="text-[var(--primary-dark)] hover:text-[var(--primary-dark)]/80 p-1"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="text-gray-400 hover:text-red-600 p-1"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info-Box am Ende */}
      <Alert variant="default" className="bg-blue-50 border-blue-200 mt-6">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700">
          Benachrichtigungen werden automatisch für 30 Tage gespeichert. Sie können Ihre Benachrichtigungseinstellungen jederzeit unter "Einstellungen" anpassen.
        </AlertDescription>
      </Alert>
    </div>
  );
}
