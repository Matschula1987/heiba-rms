'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Mail, Phone, CircleUser, UserPlus, Filter } from 'lucide-react';

// Mock-Teammitglieder für die Entwicklung
const mockTeamMembers = [
  {
    id: 1,
    name: 'Max Mustermann',
    email: 'max.mustermann@example.com',
    phone: '+49 123 4567890',
    role: 'Administrator',
    department: 'IT',
    status: 'online',
    avatarUrl: '',
    lastActive: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Erika Musterfrau',
    email: 'erika.musterfrau@example.com',
    phone: '+49 123 4567891',
    role: 'Recruiter',
    department: 'HR',
    status: 'away',
    avatarUrl: '',
    lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 Minuten zuvor
  },
  {
    id: 3,
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+49 123 4567892',
    role: 'Benutzer',
    department: 'Marketing',
    status: 'offline',
    avatarUrl: '',
    lastActive: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 Tage zuvor
  },
  {
    id: 4,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+49 123 4567893',
    role: 'Benutzer',
    department: 'Vertrieb',
    status: 'online',
    avatarUrl: '',
    lastActive: new Date().toISOString(),
  },
  {
    id: 5,
    name: 'Peter Schmitz',
    email: 'peter.schmitz@example.com',
    phone: '+49 123 4567894',
    role: 'Manager',
    department: 'Geschäftsführung',
    status: 'busy',
    avatarUrl: '',
    lastActive: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 Minuten zuvor
  },
];

export default function TeamPage() {
  const { t } = useTranslation();
  const [teamMembers, setTeamMembers] = useState(mockTeamMembers);
  const [filteredMembers, setFilteredMembers] = useState(mockTeamMembers);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Funktion zum Laden der Teammitglieder (in einer echten App würde hier ein API-Aufruf stattfinden)
  useEffect(() => {
    const loadTeamMembers = async () => {
      try {
        setIsLoading(true);
        // Hier würden wir normalerweise einen API-Aufruf machen
        // z.B. const response = await fetch('/api/team');
        // const teamData = await response.json();
        // setTeamMembers(teamData);
        
        // Simulierte Verzögerung für die Demonstration
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Fehler beim Laden der Teammitglieder:', error);
        setIsLoading(false);
      }
    };

    loadTeamMembers();
  }, []);

  // Funktion zum Filtern der Teammitglieder
  useEffect(() => {
    let result = teamMembers;

    // Filterung nach Suchbegriff
    if (searchTerm) {
      result = result.filter(
        (member) =>
          member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filterung nach Abteilung
    if (departmentFilter !== 'all') {
      result = result.filter((member) => member.department === departmentFilter);
    }

    // Filterung nach Status
    if (statusFilter !== 'all') {
      result = result.filter((member) => member.status === statusFilter);
    }

    setFilteredMembers(result);
  }, [searchTerm, departmentFilter, statusFilter, teamMembers]);

  // Liste eindeutiger Abteilungen für den Filter
  const departments = ['all', ...teamMembers
    .map(member => member.department)
    .filter((value, index, self) => self.indexOf(value) === index)
  ];

  // Statusbadge-Komponente
  const StatusBadge = ({ status }: { status: string }) => {
    let color = '';
    let label = '';

    switch (status) {
      case 'online':
        color = 'bg-green-100 text-green-800 border-green-200';
        label = 'Online';
        break;
      case 'offline':
        color = 'bg-gray-100 text-gray-800 border-gray-200';
        label = 'Offline';
        break;
      case 'away':
        color = 'bg-yellow-100 text-yellow-800 border-yellow-200';
        label = 'Abwesend';
        break;
      case 'busy':
        color = 'bg-red-100 text-red-800 border-red-200';
        label = 'Beschäftigt';
        break;
      default:
        color = 'bg-gray-100 text-gray-800 border-gray-200';
        label = 'Unbekannt';
    }

    return (
      <Badge variant="outline" className={`${color} px-2 py-1`}>
        {label}
      </Badge>
    );
  };

  // Formatierung der letzten Aktivität
  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'gerade eben';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `vor ${minutes} ${minutes === 1 ? 'Minute' : 'Minuten'}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `vor ${hours} ${hours === 1 ? 'Stunde' : 'Stunden'}`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `vor ${days} ${days === 1 ? 'Tag' : 'Tagen'}`;
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
    <div className="container mx-auto py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <h1 className="text-3xl font-bold mb-4 sm:mb-0">Teammitglieder</h1>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" /> Teammitglied hinzufügen
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Team durchsuchen</CardTitle>
          <CardDescription>
            Suchen und filtern Sie nach Teammitgliedern
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Suchen nach Name, E-Mail, Rolle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-auto min-w-[180px]">
                <Label htmlFor="department" className="block mb-2">
                  Abteilung
                </Label>
                <select
                  id="department"
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-md"
                >
                  <option value="all">Alle Abteilungen</option>
                  {departments
                    .filter((dep) => dep !== 'all')
                    .map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
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
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="away">Abwesend</option>
                  <option value="busy">Beschäftigt</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <Tabs defaultValue="grid">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="grid">Kacheln</TabsTrigger>
              <TabsTrigger value="list">Liste</TabsTrigger>
            </TabsList>
            <p className="text-sm text-gray-500">
              {filteredMembers.length} {filteredMembers.length === 1 ? 'Mitglied' : 'Mitglieder'} gefunden
            </p>
          </div>

          {/* Kachelansicht */}
          <TabsContent value="grid">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.map((member) => (
                <Card key={member.id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center mb-4">
                      <div className="relative">
                        <Avatar className="h-24 w-24 mb-4">
                          <AvatarImage src={member.avatarUrl} alt={member.name} />
                          <AvatarFallback className="text-xl">
                            {member.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute bottom-4 right-0">
                          <StatusBadge status={member.status} />
                        </div>
                      </div>
                      <h3 className="text-lg font-medium">{member.name}</h3>
                      <p className="text-sm text-gray-500 mb-1">{member.role}</p>
                      <p className="text-sm text-gray-500 mb-2">{member.department}</p>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <CircleUser className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Letzte Aktivität:</span>
                        <span>{formatLastActive(member.lastActive)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Listenansicht */}
          <TabsContent value="list">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Name</th>
                        <th className="text-left p-4">Abteilung</th>
                        <th className="text-left p-4">Rolle</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Letzte Aktivität</th>
                        <th className="text-left p-4">Aktionen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMembers.map((member, index) => (
                        <tr
                          key={member.id}
                          className={`${
                            index < filteredMembers.length - 1 ? 'border-b' : ''
                          } hover:bg-gray-50`}
                        >
                          <td className="p-4">
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8 mr-3">
                                <AvatarImage src={member.avatarUrl} alt={member.name} />
                                <AvatarFallback className="text-xs">
                                  {member.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{member.name}</div>
                                <div className="text-xs text-gray-500">{member.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">{member.department}</td>
                          <td className="p-4">{member.role}</td>
                          <td className="p-4">
                            <StatusBadge status={member.status} />
                          </td>
                          <td className="p-4">{formatLastActive(member.lastActive)}</td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Mail className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Phone className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
