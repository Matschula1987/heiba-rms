'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCustomerStore } from '@/store/customerStore'
import { Customer } from '@/types/customer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Plus, Search, Filter, User, FileText, Clock, Phone } from 'lucide-react'
import Link from 'next/link'

export default function CustomersPage() {
  const router = useRouter()
  
  // Zustand-Store für Kundendaten
  const { 
    customers, 
    fetchCustomers, 
    isLoading, 
    error 
  } = useCustomerStore()
  
  // Lokale Zustände für Filterung und Suche
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  
  // Laden der Kundendaten beim ersten Rendern
  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])
  
  // Dummy-Daten für die Entwicklung, da die API noch nicht implementiert ist
  useEffect(() => {
    if (!customers || customers.length === 0) {
      const dummyCustomers: Customer[] = [
        {
          id: '1',
          name: 'TechSolutions GmbH',
          type: 'customer',
          status: 'active',
          industry: 'IT & Software',
          website: 'www.techsolutions.de',
          createdAt: '2024-10-15T09:00:00Z',
          updatedAt: '2025-02-20T10:30:00Z',
          contactHistory: [
            {
              id: 'ch1',
              customerId: '1',
              type: 'meeting',
              date: '2025-02-15T14:00:00Z',
              subject: 'Jahresplanung',
              content: 'Besprechung der Personalplanung für Q2 2025',
              createdBy: 'admin'
            }
          ],
          contacts: [
            {
              id: 'c1',
              customerId: '1',
              firstName: 'Thomas',
              lastName: 'Müller',
              position: 'HR Manager',
              department: 'Personal',
              email: 'tmueller@techsolutions.de',
              phone: '+49123456789',
              isMainContact: true,
              createdAt: '2024-10-15T09:30:00Z',
              updatedAt: '2024-10-15T09:30:00Z'
            }
          ],
          requirements: [
            {
              id: 'r1',
              customerId: '1',
              title: 'Senior Frontend Entwickler',
              description: 'Erfahrener Frontend-Entwickler mit React-Kenntnissen',
              department: 'Entwicklung',
              location: 'Berlin',
              skills: ['React', 'TypeScript', 'CSS'],
              experience: 4,
              status: 'open',
              priority: 'high',
              createdAt: '2025-01-10T08:00:00Z',
              updatedAt: '2025-01-10T08:00:00Z'
            }
          ]
        },
        {
          id: '2',
          name: 'Digital Marketing Solutions',
          type: 'customer',
          status: 'inactive',
          industry: 'Marketing',
          website: 'www.digitalmarketing.de',
          createdAt: '2024-08-22T11:20:00Z',
          updatedAt: '2025-01-15T13:45:00Z',
          contactHistory: [],
          contacts: [],
          requirements: []
        },
        {
          id: '3',
          name: 'Innovate AG',
          type: 'prospect',
          status: 'prospect',
          industry: 'Forschung & Entwicklung',
          createdAt: '2025-02-01T16:30:00Z',
          updatedAt: '2025-02-01T16:30:00Z',
          contactHistory: [],
          contacts: [],
          requirements: []
        },
        {
          id: '4',
          name: 'Logistik Partner',
          type: 'customer',
          status: 'active',
          industry: 'Logistik & Transport',
          website: 'www.logistikpartner.de',
          createdAt: '2024-09-10T10:15:00Z',
          updatedAt: '2025-02-18T09:20:00Z',
          contactHistory: [
            {
              id: 'ch2',
              customerId: '4',
              type: 'phone',
              date: '2025-02-18T09:15:00Z',
              subject: 'Personalengpass',
              content: 'Dringender Bedarf an 3 Logistikfachkräften ab April',
              createdBy: 'admin'
            }
          ],
          contacts: [],
          requirements: []
        },
        {
          id: '5',
          name: 'Health & Care Solutions',
          type: 'prospect',
          status: 'prospect',
          industry: 'Gesundheitswesen',
          createdAt: '2025-01-25T14:10:00Z',
          updatedAt: '2025-01-25T14:10:00Z',
          contactHistory: [],
          contacts: [],
          requirements: []
        }
      ];
      
      setFilteredCustomers(dummyCustomers);
    } else {
      setFilteredCustomers(customers);
    }
  }, [customers]);
  
  // Filterung der Kunden basierend auf den Filterkriterien
  useEffect(() => {
    if (!customers || customers.length === 0) return;
    
    let result = [...customers];
    
    // Nach Typ filtern (Kunde oder Interessent)
    if (filterType !== 'all') {
      result = result.filter(customer => customer.type === filterType);
    }
    
    // Nach Status filtern
    if (filterStatus !== 'all') {
      result = result.filter(customer => customer.status === filterStatus);
    }
    
    // Nach Suchbegriff filtern
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(customer => 
        customer.name.toLowerCase().includes(searchLower) || 
        customer.industry?.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredCustomers(result);
  }, [customers, filterType, filterStatus, searchTerm]);
  
  // Funktion zum Anzeigen der "Letzte Aktivität"-Informationen
  const getLastActivity = (customer: Customer) => {
    if (!customer.contactHistory || customer.contactHistory.length === 0) {
      return 'Keine Aktivitäten';
    }
    
    // Neueste Aktivität finden
    const latestActivity = customer.contactHistory.reduce((latest, current) => {
      return new Date(current.date) > new Date(latest.date) ? current : latest;
    }, customer.contactHistory[0]);
    
    // Datum formatieren
    const date = new Date(latestActivity.date);
    const formattedDate = date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    return `${latestActivity.type}, ${formattedDate}`;
  };
  
  // Funktion zum Ermitteln der passenden Symbole für den Kundentyp
  const getTypeIcon = (type: string) => {
    return type === 'customer' ? <Building2 className="w-5 h-5 text-blue-500" /> : <User className="w-5 h-5 text-purple-500" />;
  };
  
  // Funktion zum Ermitteln der Statusfarbe
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'prospect':
        return 'bg-yellow-100 text-yellow-800';
      case 'former':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Funktion zum Umwandeln von Status-Codes in lesbare Texte
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktiv';
      case 'inactive':
        return 'Inaktiv';
      case 'prospect':
        return 'Interessent';
      case 'former':
        return 'Ehemaliger Kunde';
      default:
        return status;
    }
  };
  
  // Funktion zum Umwandeln von Typ-Codes in lesbare Texte
  const getTypeText = (type: string) => {
    return type === 'customer' ? 'Kunde' : 'Interessent';
  };
  
  return (
    <div className="container px-4 py-6 mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-[#002451]">Kunden & Interessenten</h1>
        
        <div className="flex gap-2">
          <Button 
            variant="default" 
            onClick={() => router.push('/dashboard/customers/new?type=customer')}
          >
            <Plus className="w-4 h-4 mr-2" /> Neuer Kunde
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard/customers/new?type=prospect')}
          >
            <Plus className="w-4 h-4 mr-2" /> Neuer Interessent
          </Button>
        </div>
      </div>
      
      {/* Filter- und Suchbereich */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center relative">
              <Search className="w-4 h-4 absolute left-3 text-gray-400" />
              <Input
                placeholder="Suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <Select
                value={filterType}
                onValueChange={setFilterType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Alle Typen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Typen</SelectItem>
                  <SelectItem value="customer">Kunden</SelectItem>
                  <SelectItem value="prospect">Interessenten</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <Select
                value={filterStatus}
                onValueChange={setFilterStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Alle Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="active">Aktiv</SelectItem>
                  <SelectItem value="inactive">Inaktiv</SelectItem>
                  <SelectItem value="prospect">Interessent</SelectItem>
                  <SelectItem value="former">Ehemaliger Kunde</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Ladezustand */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#002451]"></div>
        </div>
      )}
      
      {/* Fehlermeldung */}
      {error && (
        <Card className="bg-red-50 border-red-200 mb-6">
          <CardContent className="pt-6">
            <p className="text-red-600">Fehler beim Laden der Daten: {error}</p>
          </CardContent>
        </Card>
      )}
      
      {/* Kundenliste */}
      {!isLoading && !error && (
        <>
          {/* Anzahl der gefilterten Kunden */}
          <p className="text-sm text-gray-500 mb-3">
            {filteredCustomers.length} Ergebnisse gefunden
          </p>
          
          {/* Kundenkarten */}
          <div className="space-y-4">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <Card 
                  key={customer.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-0">
                    <Link 
                      href={`/dashboard/customers/${customer.id}`}
                      className="block p-6"
                    >
                      <div className="flex flex-col md:flex-row justify-between">
                        <div className="flex items-start gap-4 mb-4 md:mb-0">
                          <div className="mt-1">
                            {getTypeIcon(customer.type)}
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-semibold">{customer.name}</h3>
                              <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(customer.status)}`}>
                                {getStatusText(customer.status)}
                              </span>
                            </div>
                            
                            <p className="text-gray-600">{customer.industry}</p>
                            
                            <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Building2 className="w-4 h-4 mr-1" />
                                {getTypeText(customer.type)}
                              </span>
                              
                              {customer.requirements && (
                                <span className="flex items-center">
                                  <FileText className="w-4 h-4 mr-1" />
                                  {customer.requirements.length} Anforderungen
                                </span>
                              )}
                              
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {getLastActivity(customer)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="flex flex-col items-end">
                            {customer.contacts && customer.contacts.length > 0 && (
                              <>
                                <span className="text-sm text-gray-500">
                                  {customer.contacts.length} Ansprechpartner
                                </span>
                                {customer.contacts.find(contact => contact.isMainContact)?.phone && (
                                  <span className="text-sm mt-1 text-blue-600 flex items-center">
                                    <Phone className="w-3 h-3 mr-1" />
                                    {customer.contacts.find(contact => contact.isMainContact)?.phone}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Building2 className="w-12 h-12 text-gray-300 mb-4" />
                  <h3 className="text-xl font-medium text-gray-500 mb-2">Keine Ergebnisse gefunden</h3>
                  <p className="text-gray-400 mb-6">Ändern Sie Ihre Filtereinstellungen oder erstellen Sie einen neuen Eintrag</p>
                  
                  <div className="flex gap-3">
                    <Button 
                      variant="default" 
                      onClick={() => router.push('/dashboard/customers/new?type=customer')}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Neuer Kunde
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => router.push('/dashboard/customers/new?type=prospect')}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Neuer Interessent
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}
