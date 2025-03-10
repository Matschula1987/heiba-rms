import { create } from 'zustand'
import { Portal } from '@/types'

interface PortalState {
  portals: Portal[]
  isLoading: boolean
  error: string | null
  activePortals: string[]
  fetchPortals: () => Promise<void>
  addPortal: (portal: Omit<Portal, 'id'>) => Promise<void>
  updatePortal: (id: string, portal: Partial<Portal>) => Promise<void>
  deletePortal: (id: string) => Promise<void>
  togglePortalActive: (id: string) => void
}

export const usePortalStore = create<PortalState>((set, get) => ({
  portals: [],
  isLoading: false,
  error: null,
  activePortals: [],

  fetchPortals: async () => {
    set({ isLoading: true })
    try {
      // TODO: Implementiere API-Aufruf
      const response = await fetch('/api/portals')
      const portals = await response.json()
      set({ portals, isLoading: false })
    } catch (error) {
      set({ error: 'Failed to fetch portals', isLoading: false })
    }
  },

  addPortal: async (portalData) => {
    set({ isLoading: true })
    try {
      // TODO: Implementiere API-Aufruf
      const response = await fetch('/api/portals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(portalData)
      })

      const newPortal = await response.json()
      
      set((state) => ({
        portals: [...state.portals, newPortal],
        isLoading: false
      }))
    } catch (error) {
      set({ error: 'Failed to add portal', isLoading: false })
    }
  },

  updatePortal: async (id, portalData) => {
    set({ isLoading: true })
    try {
      // TODO: Implementiere API-Aufruf
      const response = await fetch(`/api/portals/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(portalData)
      })

      const updatedPortal = await response.json()
      
      set((state) => ({
        portals: state.portals.map((portal) => 
          portal.id === id ? updatedPortal : portal
        ),
        isLoading: false
      }))
    } catch (error) {
      set({ error: 'Failed to update portal', isLoading: false })
    }
  },

  deletePortal: async (id) => {
    set({ isLoading: true })
    try {
      // TODO: Implementiere API-Aufruf
      await fetch(`/api/portals/${id}`, {
        method: 'DELETE'
      })

      set((state) => ({
        portals: state.portals.filter((portal) => portal.id !== id),
        isLoading: false
      }))
    } catch (error) {
      set({ error: 'Failed to delete portal', isLoading: false })
    }
  },

  togglePortalActive: (id) => {
    set((state) => {
      const isActive = state.activePortals.includes(id)
      return {
        activePortals: isActive
          ? state.activePortals.filter(portalId => portalId !== id)
          : [...state.activePortals, id]
      }
    })
  }
}))