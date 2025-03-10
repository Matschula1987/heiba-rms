'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCustomerStore } from '@/store/customerStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Customer, CustomerStatus } from '@/types/customer'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'

export default function EditCustomerPage() {
  const params = useParams()
  const router = useRouter()
  const { currentCustomer, fetchCustomer, updateCustomer, isLoading, error } = useCustomerStore()
  
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    type: 'customer',
    status: 'active',
    industry: '',
    website: '',
    notes: '',
    address: {
      street: '',
      number: '',
      postalCode: '',
      city: '',
      country: 'Deutschland'
    }
  })
  
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  
  // Kunde laden, wenn die Komponente montiert oder die ID geändert wird
  useEffect(() => {
    const customerId = params?.id as string
    if (customerId) {
      fetchCustomer(customerId).then(customer => {
        if (customer) {
          // Formulardaten mit den Kundendaten füllen
          setFormData({
            name: customer.name,
            type: customer.type,
            status: customer.status,
            industry: customer.industry,
            website: customer.website || '',
            notes: customer.notes || '',
            address: {
              street: customer.address?.street || '',
              number: customer.address?.number || '',
              postalCode: customer.address?.postalCode || customer.address?.zipCode || '',
              city: customer.address?.city || '',
              country: customer.address?.country || 'Deutschland'
            }
          })
        }
      })
    }
  }, [params?.id, fetchCustomer])

  // Ladestatusanzeige
  if (isLoading && !currentCustomer) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#002451]"></div>
      </div>
    )
  }
  
  // Fehleranzeige
  if (error && !currentCustomer) {
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
  
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => {
      // Stellen wir sicher, dass wir ein vollständiges Adressobjekt haben
      const currentAddress = prev.address || {
        street: '',
        number: '',
        postalCode: '',
        city: '',
        country: ''
      };
      
      return {
        ...prev,
        address: {
          ...currentAddress,
          [field]: value
        }
      };
    });
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveError(null)
    
    try {
      const customerId = params?.id as string
      await updateCustomer(customerId, formData)
      router.back() // Zurück zur Kundendetailseite nach erfolgreichem Speichern
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setIsSaving(false)
    }
  }
  
  return (
    <div className="container px-4 py-6 mx-auto">
      {/* Header mit Zurück-Button */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Zurück
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Kunden bearbeiten</CardTitle>
          <CardDescription>
            Bearbeiten Sie die Informationen für {formData.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Fehleranzeige beim Speichern */}
            {saveError && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md">
                Fehler beim Speichern: {saveError}
              </div>
            )}
            
            {/* Basisinformationen */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basisinformationen</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={e => handleChange('name', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="industry">Branche</Label>
                  <Input 
                    id="industry" 
                    value={formData.industry} 
                    onChange={e => handleChange('industry', e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Typ</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={value => handleChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Typ auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Kunde</SelectItem>
                      <SelectItem value="prospect">Interessent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={value => handleChange('status', value as CustomerStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Aktiv</SelectItem>
                      <SelectItem value="inactive">Inaktiv</SelectItem>
                      <SelectItem value="prospect">Interessent</SelectItem>
                      <SelectItem value="former">Ehemaliger Kunde</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input 
                  id="website" 
                  value={formData.website} 
                  onChange={e => handleChange('website', e.target.value)}
                />
              </div>
            </div>
            
            {/* Adresse */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Adresse</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Straße</Label>
                  <Input 
                    id="street" 
                    value={formData.address?.street} 
                    onChange={e => handleAddressChange('street', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="number">Hausnummer</Label>
                  <Input 
                    id="number" 
                    value={formData.address?.number} 
                    onChange={e => handleAddressChange('number', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postleitzahl</Label>
                  <Input 
                    id="postalCode" 
                    value={formData.address?.postalCode} 
                    onChange={e => handleAddressChange('postalCode', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="city">Ort</Label>
                  <Input 
                    id="city" 
                    value={formData.address?.city} 
                    onChange={e => handleAddressChange('city', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="country">Land</Label>
                <Input 
                  id="country" 
                  value={formData.address?.country} 
                  onChange={e => handleAddressChange('country', e.target.value)}
                />
              </div>
            </div>
            
            {/* Notizen */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notizen</Label>
              <Textarea 
                id="notes" 
                rows={5}
                value={formData.notes} 
                onChange={e => handleChange('notes', e.target.value)}
                placeholder="Zusätzliche Informationen zum Kunden"
              />
            </div>
            
            {/* Aktionsbuttons */}
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Löschen
              </Button>
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Abbrechen
                </Button>
                
                <Button 
                  type="submit"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-current rounded-full" />
                      Speichern...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Speichern
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
