'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCustomerStore } from '@/store/customerStore'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Building2, Edit, Globe, Mail, MapPin, Phone, UserPlus, Calendar, Trash2, FileText } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'

export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { currentCustomer, fetchCustomer, isLoading, error } = useCustomerStore()
  const [activeTab, setActiveTab] = useState('profile')

  // Kunde laden, wenn die Komponente montiert oder die ID geändert wird
  useEffect(() => {
    const customerId = params?.id as string
    if (customerId) {
      fetchCustomer(customerId)
    }
  }, [params?.id, fetchCustomer])

  // Ladestatusanzeige
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#002451]"></div>
      </div>
    )
  }

  // Fehleranzeige
  if (error) {
    return (
      <div className="container px-4 py-6 mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Zurück
          </Button>
        </div>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-600">Fehler beim Laden des Kunden: {error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Kunde nicht gefunden
  if (!currentCustomer) {
    return (
      <div className="container px-4 py-6 mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Zurück
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p>Kunde nicht gefunden.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Funktion zum Formatieren des Status zu einem lesbaren Text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktiv'
      case 'inactive':
        return 'Inaktiv'
      case 'prospect':
        return 'Interessent'
      case 'former':
        return 'Ehemaliger Kunde'
      default:
        return status
    }
  }

  // Funktion zum Bestimmen der Statusfarbe
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'prospect':
        return 'bg-yellow-100 text-yellow-800'
      case 'former':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Funktion zum Formatieren des Typs zu einem lesbaren Text
  const getTypeText = (type: string) => {
    return type === 'customer' ? 'Kunde' : 'Interessent'
  }

  // Funktion zum Formatieren des Datums
  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className="container px-4 py-6 mx-auto">
      {/* Header mit Zurück-Button */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Zurück
        </Button>
      </div>

      {/* Kunden-Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-[#002451]">{currentCustomer.name}</h1>
              <Badge className={getStatusColor(currentCustomer.status)}>
                {getStatusText(currentCustomer.status)}
              </Badge>
            </div>
            <div className="text-lg text-gray-600 mt-1">
              {currentCustomer.industry} · {getTypeText(currentCustomer.type)}
            </div>
          </div>

          <div className="flex gap-2">
            <Link href={`/dashboard/customers/${currentCustomer.id}/edit`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" /> Bearbeiten
              </Button>
            </Link>
            <Link href={`/dashboard/customers/${currentCustomer.id}/contact/new`}>
              <Button variant="default">
                <UserPlus className="mr-2 h-4 w-4" /> Ansprechpartner hinzufügen
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Grundlegende Informationen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Kontaktdaten */}
        <Card>
          <CardHeader>
            <CardTitle>Kontaktdaten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentCustomer.website && (
                <div className="flex gap-2">
                  <Globe className="h-5 w-5 text-gray-500" />
                  <a 
                    href={currentCustomer.website.startsWith('http') ? currentCustomer.website : `https://${currentCustomer.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {currentCustomer.website}
                  </a>
                </div>
              )}
              
              {currentCustomer.address && (
                <div className="flex gap-2">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <div>
                    <p>{currentCustomer.address.street} {currentCustomer.address.number}</p>
                    <p>{currentCustomer.address.postalCode || currentCustomer.address.zipCode} {currentCustomer.address.city}</p>
                    <p>{currentCustomer.address.country}</p>
                  </div>
                </div>
              )}
              
              {/* Hauptkontakt anzeigen, falls vorhanden */}
              {currentCustomer.contacts && currentCustomer.contacts.length > 0 && (
                <>
                  <Separator />
                  <div className="pt-2">
                    <h3 className="font-medium mb-2">Hauptansprechpartner</h3>
                    {currentCustomer.contacts
                      .filter(contact => contact.isMainContact)
                      .map(contact => (
                        <div key={contact.id} className="space-y-2">
                          <p className="font-medium">{contact.firstName} {contact.lastName}</p>
                          <p className="text-sm text-gray-600">{contact.position}</p>
                          
                          <div className="flex gap-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <a 
                              href={`mailto:${contact.email}`} 
                              className="text-blue-600 hover:underline"
                            >
                              {contact.email}
                            </a>
                          </div>
                          
                          {contact.phone && (
                            <div className="flex gap-2">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <a 
                                href={`tel:${contact.phone}`} 
                                className="text-blue-600 hover:underline"
                              >
                                {contact.phone}
                              </a>
                            </div>
                          )}
                        </div>
                      ))}

                    {currentCustomer.contacts.filter(contact => contact.isMainContact).length === 0 && (
                      <div className="text-gray-500 italic">Kein Hauptansprechpartner festgelegt</div>
                    )}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Informationen */}
        <Card>
          <CardHeader>
            <CardTitle>Informationen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-1">
                <div className="text-gray-500">Erstellt am</div>
                <div>{formatDate(currentCustomer.createdAt)}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-1">
                <div className="text-gray-500">Aktualisiert am</div>
                <div>{formatDate(currentCustomer.updatedAt)}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-1">
                <div className="text-gray-500">Anforderungen</div>
                <div>{currentCustomer.requirements?.length || 0}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-1">
                <div className="text-gray-500">Ansprechpartner</div>
                <div>{currentCustomer.contacts?.length || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Aktionen */}
        <Card>
          <CardHeader>
            <CardTitle>Aktionen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" /> Termin vereinbaren
              </Button>
              
              <Link href={`/dashboard/customers/${currentCustomer.id}/requirements/new`}>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="mr-2 h-4 w-4" /> Neue Anforderung
                </Button>
              </Link>
              
              <Button className="w-full justify-start" variant="outline">
                <Mail className="mr-2 h-4 w-4" /> E-Mail senden
              </Button>
              
              <Button className="w-full justify-start text-red-600 hover:text-red-700" variant="ghost">
                <Trash2 className="mr-2 h-4 w-4" /> Löschen
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs für weitere Kundendaten */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="contacts">Ansprechpartner</TabsTrigger>
          <TabsTrigger value="requirements">Anforderungen</TabsTrigger>
          <TabsTrigger value="history">Kommunikationsverlauf</TabsTrigger>
          <TabsTrigger value="documents">Dokumente</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Kundenprofil</CardTitle>
              <CardDescription>Detaillierte Informationen zum Kunden</CardDescription>
            </CardHeader>
            <CardContent>
              {currentCustomer.notes ? (
                <div className="space-y-4">
                  <h3 className="font-medium">Notizen</h3>
                  <p className="text-gray-600">{currentCustomer.notes}</p>
                </div>
              ) : (
                <p className="text-gray-500 italic">Keine Notizen vorhanden</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="contacts" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Ansprechpartner</CardTitle>
                <CardDescription>Kontakte und Ansprechpartner des Kunden</CardDescription>
              </div>
              <Link href={`/dashboard/customers/${currentCustomer.id}/contact/new`}>
                <Button size="sm">
                  <UserPlus className="h-4 w-4 mr-2" /> Neu
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {currentCustomer.contacts && currentCustomer.contacts.length > 0 ? (
                <div className="space-y-6">
                  {currentCustomer.contacts.map(contact => (
                    <div key={contact.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{contact.firstName} {contact.lastName}</h3>
                            {contact.isMainContact && (
                              <Badge variant="outline" className="text-xs">Hauptkontakt</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{contact.position} • {contact.department}</p>
                        </div>
                        <div className="mt-2 md:mt-0 flex gap-2">
                          <Button variant="outline" size="sm">Bearbeiten</Button>
                        </div>
                      </div>
                      
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-1">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                            {contact.email}
                          </a>
                        </div>
                        
                        {contact.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline">
                              {contact.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <UserPlus className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-2 text-sm font-medium text-gray-600">Keine Ansprechpartner vorhanden</h3>
                  <p className="mt-1 text-sm text-gray-500">Fügen Sie Ansprechpartner für diesen Kunden hinzu.</p>
                  <div className="mt-6">
                    <Link href={`/dashboard/customers/${currentCustomer.id}/contact/new`}>
                      <Button>
                        <UserPlus className="h-4 w-4 mr-2" /> Ansprechpartner hinzufügen
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="requirements" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Anforderungen</CardTitle>
                <CardDescription>Stellenanforderungen des Kunden</CardDescription>
              </div>
              <Link href={`/dashboard/customers/${currentCustomer.id}/requirements/new`}>
                <Button size="sm">
                  <FileText className="h-4 w-4 mr-2" /> Neu
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {currentCustomer.requirements && currentCustomer.requirements.length > 0 ? (
                <div className="space-y-6">
                  {currentCustomer.requirements.map((req: any) => (
                    <div key={req.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                      <div className="flex flex-col md:flex-row justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{req.title}</h3>
                            <Badge className={
                              req.status === 'open' ? 'bg-green-100 text-green-800' :
                              req.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              req.status === 'filled' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }>
                              {req.status === 'open' ? 'Offen' :
                               req.status === 'in_progress' ? 'In Bearbeitung' :
                               req.status === 'filled' ? 'Besetzt' :
                               req.status === 'cancelled' ? 'Abgebrochen' : req.status}
                            </Badge>
                            <Badge variant="outline" className={
                              req.priority === 'high' ? 'border-red-300 text-red-600' :
                              req.priority === 'medium' ? 'border-yellow-300 text-yellow-600' :
                              req.priority === 'low' ? 'border-green-300 text-green-600' :
                              'border-gray-300 text-gray-600'
                            }>
                              {req.priority === 'high' ? 'Hohe Priorität' :
                               req.priority === 'medium' ? 'Mittlere Priorität' :
                               req.priority === 'low' ? 'Niedrige Priorität' :
                               req.priority === 'urgent' ? 'Dringend' : req.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{req.department} • {req.location}</p>
                        </div>
                        <div className="mt-2 md:mt-0 flex gap-2">
                          <Button variant="outline" size="sm">Details</Button>
                          <Button variant="secondary" size="sm">Kandidaten zuordnen</Button>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 line-clamp-2">{req.description}</p>
                      </div>
                      
                      <div className="mt-3 flex flex-wrap gap-1">
                        {typeof req.skills === 'string' ? 
                          JSON.parse(req.skills).map((skill: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          )) : 
                          req.skills?.map((skill: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))
                        }
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-2 text-sm font-medium text-gray-600">Keine Anforderungen vorhanden</h3>
                  <p className="mt-1 text-sm text-gray-500">Fügen Sie Stellenanforderungen für diesen Kunden hinzu.</p>
                  <div className="mt-6">
                    <Link href={`/dashboard/customers/${currentCustomer.id}/requirements/new`}>
                      <Button>
                        <FileText className="h-4 w-4 mr-2" /> Anforderung hinzufügen
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Kommunikationsverlauf</CardTitle>
                <CardDescription>Kommunikation mit dem Kunden</CardDescription>
              </div>
              <Button size="sm">
                <Calendar className="h-4 w-4 mr-2" /> Neu
              </Button>
            </CardHeader>
            <CardContent>
              {currentCustomer.contactHistory && currentCustomer.contactHistory.length > 0 ? (
                <div className="space-y-4">
                  {currentCustomer.contactHistory.map((entry: any) => (
                    <div key={entry.id} className="border-l-2 border-blue-100 pl-4 pb-4">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium text-blue-800">{entry.subject}</h3>
                          <p className="text-xs text-gray-500">
                            {entry.type === 'email' ? 'E-Mail' : 
                             entry.type === 'phone' ? 'Telefonat' :
                             entry.type === 'meeting' ? 'Meeting' : entry.type}
                             {' • '}
                            {formatDate(entry.date)}
                          </p>
                        </div>
                        <Badge variant="outline" className="h-5">
                          {entry.createdBy}
                        </Badge>
                      </div>
                      <p className="mt-2 text-gray-600 text-sm">{entry.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-2 text-sm font-medium text-gray-600">Keine Kommunikationseinträge vorhanden</h3>
                  <p className="mt-1 text-sm text-gray-500">Fügen Sie Einträge zur Kommunikationshistorie hinzu.</p>
                  <div className="mt-6">
                    <Button>
                      <Calendar className="h-4 w-4 mr-2" /> Neuer Eintrag
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dokumente</CardTitle>
              <CardDescription>Verwaltung aller Dokumente zu diesem Kunden</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 italic">Diese Funktion ist noch in Entwicklung.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
