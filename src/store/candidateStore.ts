import { create } from 'zustand'
import { Candidate } from '@/types'
import { dummyQualificationProfiles } from '@/data/dummyQualificationProfiles'

interface CandidateStore {
  candidates: Candidate[]
  currentCandidate: Candidate | null
  isLoading: boolean
  error: string | null
  fetchCandidates: () => Promise<void>
  fetchCandidate: (id: string) => Promise<void>
  createCandidate: (data: Partial<Candidate>) => Promise<void>
  updateCandidate: (id: string, data: Partial<Candidate>) => Promise<void>
  deleteCandidate: (id: string) => Promise<void>
}

export const useCandidateStore = create<CandidateStore>((set) => ({
  candidates: [],
  currentCandidate: null,
  isLoading: false,
  error: null,

  fetchCandidates: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('/api/candidates')
      if (!response.ok) throw new Error('Failed to fetch candidates')
      const data = await response.json()
      set({ candidates: data, isLoading: false })
    } catch (error) {
      set({ error: 'Error loading candidates', isLoading: false })
      console.error('Error:', error)
    }
  },

  fetchCandidate: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`/api/candidates/${id}`)
      if (!response.ok) throw new Error('Failed to fetch candidate')
      const data = await response.json()
      
      // Füge ein Dummy-Qualifikationsprofil hinzu, wenn keines vorhanden ist
      if (!data.qualificationProfile) {
        // Bestimme, welches Profil basierend auf der Position des Kandidaten zu nutzen ist
        let profileType = 'default';
        
        if (data.position) {
          const position = data.position.toLowerCase();
          if (position.includes('backend') || position.includes('java') || position.includes('python')) {
            profileType = 'backend-dev';
          } else if (position.includes('devops') || position.includes('cloud') || position.includes('infra')) {
            profileType = 'devops-specialist';
          }
        }
        
        // Kopiere das Dummy-Profil und setze die candidateId
        const profile = {...dummyQualificationProfiles[profileType]};
        profile.candidateId = id;
        
        // Kombiniere die Skills des Kandidaten mit denen aus dem Profil, falls vorhanden
        if (data.skills && Array.isArray(data.skills) && data.skills.length > 0) {
          profile.skills = [...data.skills, ...profile.skills.slice(0, Math.max(0, 7 - data.skills.length))];
        }
        
        // Füge das Profil zum Kandidaten hinzu
        data.qualificationProfile = profile;
      }
      
      set({ currentCandidate: data, isLoading: false })
    } catch (error) {
      set({ error: 'Error loading candidate', isLoading: false })
      console.error('Error:', error)
    }
  },

  createCandidate: async (data) => {
    try {
      // Erzeuge ein leeres Qualifikationsprofil, wenn keines vorhanden ist
      if (!data.qualificationProfile) {
        data.qualificationProfile = {
          summary: '', 
          skills: data.skills || [],
          experience: data.experience || [],
          certificates: [],
          languages: [],
          education: []
        }
      }
      
      const response = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to create candidate')
      const newCandidate = await response.json()
      set(state => ({
        candidates: [...state.candidates, newCandidate]
      }))
    } catch (error) {
      console.error('Error:', error)
      throw error
    }
  },

  updateCandidate: async (id, data) => {
    try {
      const response = await fetch(`/api/candidates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update candidate')
      const updatedCandidate = await response.json()
      set(state => ({
        candidates: state.candidates.map(c => 
          c.id === id ? { ...c, ...updatedCandidate } : c
        )
      }))
    } catch (error) {
      console.error('Error:', error)
      throw error
    }
  },

  deleteCandidate: async (id) => {
    try {
      const response = await fetch(`/api/candidates/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete candidate')
      set(state => ({
        candidates: state.candidates.filter(c => c.id !== id)
      }))
    } catch (error) {
      console.error('Error:', error)
      throw error
    }
  },
}))
