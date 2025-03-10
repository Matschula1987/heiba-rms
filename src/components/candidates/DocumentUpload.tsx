'use client'

import { useState } from 'react'
import { useDocumentStore } from '@/store/documentStore'

interface DocumentUploadProps {
  candidateId: string
}

export default function DocumentUpload({ candidateId }: DocumentUploadProps) {
  const { documents, uploadDocument, deleteDocument } = useDocumentStore()
  const [isUploading, setIsUploading] = useState(false)
  
  const candidateDocuments = documents.filter(doc => doc.candidateId === candidateId)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      await uploadDocument({
        file,
        candidateId,
        type: file.type,
        name: file.name
      })
    } catch (error) {
      console.error('Fehler beim Hochladen:', error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div className="flex items-center justify-center w-full">
        <label className="w-full flex flex-col items-center px-4 py-6 bg-white rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-heiba-blue transition-colors">
          <div className="flex flex-col items-center">
            <i className="fas fa-cloud-upload-alt text-2xl text-gray-400 mb-2"></i>
            <span className="text-sm text-gray-500">
              {isUploading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Wird hochgeladen...
                </>
              ) : (
                'Dokument hochladen'
              )}
            </span>
          </div>
          <input 
            type="file" 
            className="hidden" 
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx"
            disabled={isUploading}
          />
        </label>
      </div>

      {/* Dokumentenliste */}
      <div className="space-y-2">
        {candidateDocuments.map((doc) => (
          <div 
            key={doc.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <i className={`fas fa-file-${doc.type === 'application/pdf' ? 'pdf' : 'word'} text-gray-400`}></i>
              <span className="text-sm text-gray-700">{doc.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => window.open(doc.url, '_blank')}
                className="text-gray-400 hover:text-heiba-blue transition-colors"
              >
                <i className="fas fa-eye"></i>
              </button>
              <button
                onClick={() => deleteDocument(doc.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}