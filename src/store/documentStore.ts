import { create } from 'zustand'

export interface Document {
  id: string
  candidateId: string
  name: string
  type: string
  url: string
  uploadedAt: string
  size: number
}

interface DocumentUploadParams {
  file: File
  candidateId: string
  type: string
  name: string
}

interface DocumentState {
  documents: Document[]
  isLoading: boolean
  error: string | null
  fetchDocuments: (candidateId: string) => Promise<void>
  uploadDocument: (params: DocumentUploadParams) => Promise<void>
  deleteDocument: (id: string) => Promise<void>
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  isLoading: false,
  error: null,

  fetchDocuments: async (candidateId: string) => {
    set({ isLoading: true })
    try {
      // TODO: Implementiere API-Aufruf
      const response = await fetch(`/api/candidates/${candidateId}/documents`)
      const documents = await response.json()
      set({ documents, isLoading: false })
    } catch (error) {
      set({ error: 'Failed to fetch documents', isLoading: false })
    }
  },

  uploadDocument: async ({ file, candidateId, type, name }: DocumentUploadParams) => {
    set({ isLoading: true })
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('candidateId', candidateId)
      formData.append('type', type)
      formData.append('name', name)

      // TODO: Implementiere API-Aufruf
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      })

      const newDocument = await response.json()
      
      set((state) => ({
        documents: [...state.documents, newDocument],
        isLoading: false
      }))
    } catch (error) {
      set({ error: 'Failed to upload document', isLoading: false })
    }
  },

  deleteDocument: async (id: string) => {
    set({ isLoading: true })
    try {
      // TODO: Implementiere API-Aufruf
      await fetch(`/api/documents/${id}`, {
        method: 'DELETE'
      })

      set((state) => ({
        documents: state.documents.filter((doc) => doc.id !== id),
        isLoading: false
      }))
    } catch (error) {
      set({ error: 'Failed to delete document', isLoading: false })
    }
  }
}))