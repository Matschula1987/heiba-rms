import { create } from 'zustand'

export interface Communication {
  id: string
  candidateId: string
  type: 'email' | 'phone' | 'meeting'
  subject: string
  content: string
  timestamp: string
  attachments?: string[]
  status?: 'sent' | 'draft' | 'scheduled'
  scheduledFor?: string
  participants?: string[]
}

interface CommunicationState {
  communications: Communication[]
  isLoading: boolean
  error: string | null
  fetchCommunications: (candidateId: string) => Promise<void>
  addCommunication: (communication: Omit<Communication, 'id'>) => Promise<void>
  updateCommunication: (id: string, communication: Partial<Communication>) => Promise<void>
  deleteCommunication: (id: string) => Promise<void>
  sendEmail: (communication: Omit<Communication, 'id' | 'type'>) => Promise<void>
  scheduleMeeting: (communication: Omit<Communication, 'id' | 'type'>) => Promise<void>
}

export const useCommunicationStore = create<CommunicationState>((set, get) => ({
  communications: [],
  isLoading: false,
  error: null,

  fetchCommunications: async (candidateId: string) => {
    set({ isLoading: true })
    try {
      // TODO: Implementiere API-Aufruf
      const response = await fetch(`/api/candidates/${candidateId}/communications`)
      const communications = await response.json()
      set({ communications, isLoading: false })
    } catch (error) {
      set({ error: 'Failed to fetch communications', isLoading: false })
    }
  },

  addCommunication: async (communication) => {
    set({ isLoading: true })
    try {
      // TODO: Implementiere API-Aufruf
      const response = await fetch('/api/communications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(communication)
      })

      const newCommunication = await response.json()
      
      set((state) => ({
        communications: [...state.communications, newCommunication],
        isLoading: false
      }))
    } catch (error) {
      set({ error: 'Failed to add communication', isLoading: false })
    }
  },

  updateCommunication: async (id, communication) => {
    set({ isLoading: true })
    try {
      // TODO: Implementiere API-Aufruf
      const response = await fetch(`/api/communications/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(communication)
      })

      const updatedCommunication = await response.json()
      
      set((state) => ({
        communications: state.communications.map((comm) => 
          comm.id === id ? updatedCommunication : comm
        ),
        isLoading: false
      }))
    } catch (error) {
      set({ error: 'Failed to update communication', isLoading: false })
    }
  },

  deleteCommunication: async (id) => {
    set({ isLoading: true })
    try {
      // TODO: Implementiere API-Aufruf
      await fetch(`/api/communications/${id}`, {
        method: 'DELETE'
      })

      set((state) => ({
        communications: state.communications.filter((comm) => comm.id !== id),
        isLoading: false
      }))
    } catch (error) {
      set({ error: 'Failed to delete communication', isLoading: false })
    }
  },

  sendEmail: async (communication) => {
    set({ isLoading: true })
    try {
      // TODO: Implementiere E-Mail-Versand
      const response = await fetch('/api/communications/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...communication,
          type: 'email',
          status: 'sent'
        })
      })

      const newCommunication = await response.json()
      
      set((state) => ({
        communications: [...state.communications, newCommunication],
        isLoading: false
      }))
    } catch (error) {
      set({ error: 'Failed to send email', isLoading: false })
    }
  },

  scheduleMeeting: async (communication) => {
    set({ isLoading: true })
    try {
      // TODO: Implementiere Kalender-Integration
      const response = await fetch('/api/communications/meeting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...communication,
          type: 'meeting',
          status: 'scheduled'
        })
      })

      const newCommunication = await response.json()
      
      set((state) => ({
        communications: [...state.communications, newCommunication],
        isLoading: false
      }))
    } catch (error) {
      set({ error: 'Failed to schedule meeting', isLoading: false })
    }
  }
}))