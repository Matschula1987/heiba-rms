import { create } from 'zustand'
import { Customer, Contact, Requirement, ContactEntry } from '@/types/customer'

interface CustomerState {
  customers: Customer[]
  currentCustomer: Customer | null
  isLoading: boolean
  error: string | null
  
  // Kundenverwaltung
  fetchCustomers: () => Promise<Customer[]>
  fetchCustomer: (id: string) => Promise<Customer>
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Customer>
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<Customer>
  deleteCustomer: (id: string) => Promise<void>
  
  // Kontaktverwaltung
  addContact: (customerId: string, contact: Omit<Contact, 'id' | 'customerId' | 'createdAt' | 'updatedAt'>) => Promise<Contact>
  updateContact: (id: string, contact: Partial<Contact>) => Promise<Contact>
  deleteContact: (id: string) => Promise<void>
  
  // Kontakthistorie
  addContactEntry: (customerId: string, entry: Omit<ContactEntry, 'id' | 'customerId' | 'date'>) => Promise<ContactEntry>
  updateContactEntry: (id: string, entry: Partial<ContactEntry>) => Promise<ContactEntry>
  
  // Anforderungen
  addRequirement: (customerId: string, requirement: Omit<Requirement, 'id' | 'customerId' | 'createdAt' | 'updatedAt'>) => Promise<Requirement>
  updateRequirement: (id: string, requirement: Partial<Requirement>) => Promise<Requirement>
  deleteRequirement: (id: string) => Promise<void>
  matchCandidatesToRequirement: (requirementId: string) => Promise<void>
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: [],
  currentCustomer: null,
  isLoading: false,
  error: null,
  
  // Kundenverwaltung
  fetchCustomers: async () => {
    set({ isLoading: true, error: null })
    try {
      // API-Aufruf um alle Kunden zu laden
      const response = await fetch('/api/customers')
      if (!response.ok) {
        throw new Error('Failed to fetch customers')
      }
      
      const data = await response.json()
      const customers: Customer[] = data.data || []
      set({ customers, isLoading: false })
      return customers
    } catch (error) {
      console.error('Error fetching customers:', error)
      
      // Fallback auf Dummy-Daten, wenn API-Aufruf fehlschlägt
      try {
        const { dummyCustomers } = await import('@/data/dummyCustomers')
        console.log('Using dummy customer data due to API error')
        set({ 
          customers: dummyCustomers, 
          isLoading: false,
          error: null // Fehler zurücksetzen, da wir Dummy-Daten haben
        })
        return dummyCustomers
      } catch (dummyError) {
        // Wenn auch die Dummy-Daten nicht geladen werden können
        set({ 
          error: (error as Error).message, 
          isLoading: false,
          customers: [] // Leeres Array, um "not iterable" Fehler zu vermeiden
        })
        return []
      }
    }
  },
  
  fetchCustomer: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      // API-Aufruf um einen einzelnen Kunden zu laden
      const response = await fetch(`/api/customers/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch customer')
      }
      
      const customer: Customer = await response.json()
      set({ currentCustomer: customer, isLoading: false })
      return customer
    } catch (error) {
      console.error(`Error fetching customer ${id}:`, error)
      
      // Fallback auf Dummy-Daten wenn API-Aufruf fehlschlägt
      try {
        const { dummyCustomers, dummyContacts, dummyRequirements } = await import('@/data/dummyCustomers')
        
        // Suche den Kunden in den Dummy-Daten
        const dummyCustomer = dummyCustomers.find(c => c.id === id)
        
        if (dummyCustomer) {
          console.log(`Using dummy data for customer ${id} due to API error`)
          
          // Vollständiges Kundenobjekt mit Kontakten und Anforderungen erstellen
          const customer: Customer = {
            ...dummyCustomer,
            // Wenn vorhanden, füge zugehörige Kontakte hinzu
            contacts: dummyContacts[id] || [],
            // Wenn vorhanden, füge zugehörige Anforderungen hinzu und konvertiere Skills von JSON-String zu Array
            requirements: dummyRequirements
              .filter(r => r.customerId === id)
              .map(req => ({
                ...req,
                // Parsen des JSON-Strings zu einem Array
                skills: typeof req.skills === 'string' ? JSON.parse(req.skills) : req.skills,
                // Typgerechte Zuweisung der Status- und Prioritätswerte
                status: req.status as RequirementStatus,
                priority: req.priority as RequirementPriority
              })) || []
          }
          
          set({ currentCustomer: customer, isLoading: false, error: null })
          return customer
        }
      } catch (dummyError) {
        console.error(`Error fetching dummy data for customer ${id}:`, dummyError)
      }
      
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },
  
  addCustomer: async (customerData) => {
    set({ isLoading: true, error: null })
    try {
      // API-Aufruf um einen neuen Kunden anzulegen
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(customerData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to add customer')
      }
      
      const newCustomer: Customer = await response.json()
      
      // Aktualisieren des Zustands
      set(state => ({
        customers: [...state.customers, newCustomer],
        isLoading: false
      }))
      
      return newCustomer
    } catch (error) {
      console.error('Error adding customer:', error)
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },
  
  updateCustomer: async (id: string, customerData: Partial<Customer>) => {
    set({ isLoading: true, error: null })
    try {
      // API-Aufruf um einen bestehenden Kunden zu aktualisieren
      const response = await fetch(`/api/customers/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(customerData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to update customer')
      }
      
      const updatedCustomer: Customer = await response.json()
      
      // Aktualisieren des Zustands
      set(state => ({
        customers: state.customers.map(c => c.id === id ? updatedCustomer : c),
        currentCustomer: state.currentCustomer?.id === id ? updatedCustomer : state.currentCustomer,
        isLoading: false
      }))
      
      return updatedCustomer
    } catch (error) {
      console.error(`Error updating customer ${id}:`, error)
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },
  
  deleteCustomer: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      // API-Aufruf um einen Kunden zu löschen
      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete customer')
      }
      
      // Aktualisieren des Zustands
      set(state => ({
        customers: state.customers.filter(c => c.id !== id),
        currentCustomer: state.currentCustomer?.id === id ? null : state.currentCustomer,
        isLoading: false
      }))
    } catch (error) {
      console.error(`Error deleting customer ${id}:`, error)
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },
  
  // Kontaktverwaltung
  addContact: async (customerId: string, contactData) => {
    set({ isLoading: true, error: null })
    try {
      // API-Aufruf um einen neuen Kontakt hinzuzufügen
      const response = await fetch(`/api/customers/${customerId}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contactData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to add contact')
      }
      
      const newContact: Contact = await response.json()
      
      // Aktualisieren des Zustands
      set(state => {
        if (state.currentCustomer && state.currentCustomer.id === customerId) {
          return {
            currentCustomer: {
              ...state.currentCustomer,
              contacts: [...(state.currentCustomer.contacts || []), newContact]
            },
            isLoading: false
          }
        }
        
        return { isLoading: false }
      })
      
      return newContact
    } catch (error) {
      console.error('Error adding contact:', error)
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },
  
  updateContact: async (id: string, contactData: Partial<Contact>) => {
    set({ isLoading: true, error: null })
    try {
      // API-Aufruf um einen Kontakt zu aktualisieren
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contactData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to update contact')
      }
      
      const updatedContact: Contact = await response.json()
      
      // Aktualisieren des Zustands
      set(state => {
        if (state.currentCustomer && state.currentCustomer.contacts) {
          return {
            currentCustomer: {
              ...state.currentCustomer,
              contacts: state.currentCustomer.contacts.map(c => 
                c.id === id ? updatedContact : c
              )
            },
            isLoading: false
          }
        }
        
        return { isLoading: false }
      })
      
      return updatedContact
    } catch (error) {
      console.error(`Error updating contact ${id}:`, error)
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },
  
  deleteContact: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      // API-Aufruf um einen Kontakt zu löschen
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete contact')
      }
      
      // Aktualisieren des Zustands
      set(state => {
        if (state.currentCustomer && state.currentCustomer.contacts) {
          return {
            currentCustomer: {
              ...state.currentCustomer,
              contacts: state.currentCustomer.contacts.filter(c => c.id !== id)
            },
            isLoading: false
          }
        }
        
        return { isLoading: false }
      })
    } catch (error) {
      console.error(`Error deleting contact ${id}:`, error)
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },
  
  // Kontakthistorie
  addContactEntry: async (customerId: string, entryData) => {
    set({ isLoading: true, error: null })
    try {
      // API-Aufruf um einen neuen Kontakteintrag hinzuzufügen
      const response = await fetch(`/api/customers/${customerId}/contact-history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...entryData, date: new Date().toISOString() })
      })
      
      if (!response.ok) {
        throw new Error('Failed to add contact entry')
      }
      
      const newEntry: ContactEntry = await response.json()
      
      // Aktualisieren des Zustands
      set(state => {
        if (state.currentCustomer && state.currentCustomer.id === customerId) {
          return {
            currentCustomer: {
              ...state.currentCustomer,
              contactHistory: [...(state.currentCustomer.contactHistory || []), newEntry]
            },
            isLoading: false
          }
        }
        
        return { isLoading: false }
      })
      
      return newEntry
    } catch (error) {
      console.error('Error adding contact entry:', error)
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },
  
  updateContactEntry: async (id: string, entryData: Partial<ContactEntry>) => {
    set({ isLoading: true, error: null })
    try {
      // API-Aufruf um einen Kontakteintrag zu aktualisieren
      const response = await fetch(`/api/contact-entries/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entryData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to update contact entry')
      }
      
      const updatedEntry: ContactEntry = await response.json()
      
      // Aktualisieren des Zustands
      set(state => {
        if (state.currentCustomer && state.currentCustomer.contactHistory) {
          return {
            currentCustomer: {
              ...state.currentCustomer,
              contactHistory: state.currentCustomer.contactHistory.map(e => 
                e.id === id ? updatedEntry : e
              )
            },
            isLoading: false
          }
        }
        
        return { isLoading: false }
      })
      
      return updatedEntry
    } catch (error) {
      console.error(`Error updating contact entry ${id}:`, error)
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },
  
  // Anforderungen
  addRequirement: async (customerId: string, requirementData) => {
    set({ isLoading: true, error: null })
    try {
      // API-Aufruf um eine neue Anforderung hinzuzufügen
      const response = await fetch(`/api/customers/${customerId}/requirements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requirementData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to add requirement')
      }
      
      const newRequirement: Requirement = await response.json()
      
      // Aktualisieren des Zustands
      set(state => {
        if (state.currentCustomer && state.currentCustomer.id === customerId) {
          return {
            currentCustomer: {
              ...state.currentCustomer,
              requirements: [...(state.currentCustomer.requirements || []), newRequirement]
            },
            isLoading: false
          }
        }
        
        return { isLoading: false }
      })
      
      return newRequirement
    } catch (error) {
      console.error('Error adding requirement:', error)
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },
  
  updateRequirement: async (id: string, requirementData: Partial<Requirement>) => {
    set({ isLoading: true, error: null })
    try {
      // API-Aufruf um eine Anforderung zu aktualisieren
      const response = await fetch(`/api/requirements/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requirementData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to update requirement')
      }
      
      const updatedRequirement: Requirement = await response.json()
      
      // Aktualisieren des Zustands
      set(state => {
        if (state.currentCustomer && state.currentCustomer.requirements) {
          return {
            currentCustomer: {
              ...state.currentCustomer,
              requirements: state.currentCustomer.requirements.map(r => 
                r.id === id ? updatedRequirement : r
              )
            },
            isLoading: false
          }
        }
        
        return { isLoading: false }
      })
      
      return updatedRequirement
    } catch (error) {
      console.error(`Error updating requirement ${id}:`, error)
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },
  
  deleteRequirement: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      // API-Aufruf um eine Anforderung zu löschen
      const response = await fetch(`/api/requirements/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete requirement')
      }
      
      // Aktualisieren des Zustands
      set(state => {
        if (state.currentCustomer && state.currentCustomer.requirements) {
          return {
            currentCustomer: {
              ...state.currentCustomer,
              requirements: state.currentCustomer.requirements.filter(r => r.id !== id)
            },
            isLoading: false
          }
        }
        
        return { isLoading: false }
      })
    } catch (error) {
      console.error(`Error deleting requirement ${id}:`, error)
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },
  
  matchCandidatesToRequirement: async (requirementId: string) => {
    set({ isLoading: true, error: null })
    try {
      // API-Aufruf um Kandidaten mit einer Anforderung zu matchen
      const response = await fetch(`/api/requirements/${requirementId}/match`, {
        method: 'POST'
      })
      
      if (!response.ok) {
        throw new Error('Failed to match candidates to requirement')
      }
      
      const updatedRequirement: Requirement = await response.json()
      
      // Aktualisieren des Zustands
      set(state => {
        if (state.currentCustomer && state.currentCustomer.requirements) {
          return {
            currentCustomer: {
              ...state.currentCustomer,
              requirements: state.currentCustomer.requirements.map(r => 
                r.id === requirementId ? updatedRequirement : r
              )
            },
            isLoading: false
          }
        }
        
        return { isLoading: false }
      })
    } catch (error) {
      console.error(`Error matching candidates to requirement ${requirementId}:`, error)
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  }
}))
