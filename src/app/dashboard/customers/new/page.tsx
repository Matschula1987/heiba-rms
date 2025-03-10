'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCustomerStore } from '@/store/customerStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Customer, CustomerStatus } from '@/types/customer'
import { ArrowLeft, Save } from 'lucide-react'

export default function NewCustomerPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialType = searchParams.get('type') === 'prospect' ? 'prospect' : 'customer'
  
  const { addCustomer } = useCustomerStore()
  
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    type: initialType,
    status: initialType === 'prospect' ? 'prospect' : 'active',
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
      // Stellen wir sicher, dass die erforderlichen Felder vorhanden sind
      if (!formData.name) {
        throw new Error('Name ist erforderlich')
      }
      
      if (!formData.industry) {
        throw new Error('Branche ist erforderlich')
      }
      
      const newCustomer = await addCustomer(formData as Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>)
      router.push(`/dashboard/customers/${newCustomer.id}`)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
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
          <CardTitle>
            {formData.type === 'customer' ? 'Neuen Kunden anlegen' : 'Neuen Interessenten anlegen'}
          </CardTitle>
          <CardDescription>
            Füllen Sie das Formular aus, um {formData.type === 'customer' ? 'einen neuen Kunden' : 'einen neuen Interessenten'} anzulegen
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
                  <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                  <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={e => handleChange('name', e.target.value)}
                    required
                    placeholder="Firmenname"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="industry">Branche <span className="text-red-500">*</span></Label>
                  <Input 
                    id="industry" 
                    value={formData.industry} 
                    onChange={e => handleChange('industry', e.target.value)}
                    required
                    placeholder="z.B. IT, Finanzen, Fertigung"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Typ</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={value => {
                      handleChange('type', value)
                      if (value === 'prospect') {
                        handleChange('status', 'prospect')
                      } else if (value === 'customer' && formData.status === 'prospect') {
                        handleChange('status', 'active')
                      }
                    }}
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
                      {formData.type === 'customer' && (
                        <>
                          <SelectItem value="active">Aktiv</SelectItem>
                          <SelectItem value="inactive">Inaktiv</SelectItem>
                          <SelectItem value="former">Ehemaliger Kunde</SelectItem>
                        </>
                      )}
                      {formData.type === 'prospect' && (
                        <SelectItem value="prospect">Interessent</SelectItem>
                      )}
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
                  placeholder="z.B. https://example.com"
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
                    placeholder="Straßenname"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="number">Hausnummer</Label>
                  <Input 
                    id="number" 
                    value={formData.address?.number} 
                    onChange={e => handleAddressChange('number', e.target.value)}
                    placeholder="Nr."
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
                    placeholder="PLZ"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="city">Ort</Label>
                  <Input 
                    id="city" 
                    value={formData.address?.city} 
                    onChange={e => handleAddressChange('city', e.target.value)}
                    placeholder="Stadt"
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
            <div className="flex justify-end pt-4">
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
