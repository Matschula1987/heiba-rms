'use client'

import React, { useState, useRef } from 'react'
import { Loader2, Upload, FileText, Check, X, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ExtractedProfileData } from '@/types/monicaAI'

interface ResumeAnalysisUploaderProps {
  onAnalysisComplete?: (data: ExtractedProfileData) => void
  candidateId?: string
  className?: string
}

export default function ResumeAnalysisUploader({
  onAnalysisComplete,
  candidateId,
  className
}: ResumeAnalysisUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<ExtractedProfileData | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  
  // Status für Polling
  const [pollingStatus, setPollingStatus] = useState<'idle' | 'polling' | 'completed' | 'failed'>('idle')
  
  // Datei auswählen
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
      setAnalysisResult(null)
      setRequestId(null)
    }
  }
  
  // Datei hochladen und Analyse starten
  const handleUpload = async () => {
    if (!file) {
      setError('Bitte wählen Sie eine Datei aus')
      return
    }
    
    setIsUploading(true)
    setError(null)
    
    try {
      // Datei in Base64 umwandeln
      const base64 = await convertFileToBase64(file)
      
      setIsUploading(false)
      setIsAnalyzing(true)
      
      // Analyseanfrage senden
      const response = await fetch('/api/monica-ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          documentBase64: base64,
          documentType: getDocumentType(file.name),
          candidateId: candidateId || undefined
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Fehler bei der Analyse')
      }
      
      if (data.status === 'failed') {
        throw new Error(data.message || 'Analyse fehlgeschlagen')
      }
      
      // Wenn sofortiges Ergebnis
      if (data.status === 'success' && data.data) {
        setAnalysisResult(data.data)
        setIsAnalyzing(false)
        
        // Callback aufrufen, wenn vorhanden
        if (onAnalysisComplete) {
          onAnalysisComplete(data.data)
        }
        
        return
      }
      
      // Ansonsten Polling starten
      setRequestId(data.requestId)
      startPolling(data.requestId)
    } catch (error) {
      console.error('Fehler bei der Lebenslaufanalyse:', error)
      setError(error instanceof Error ? error.message : 'Unbekannter Fehler')
      setIsUploading(false)
      setIsAnalyzing(false)
      setPollingStatus('failed')
    }
  }
  
  // Polling für Analyseergebnis
  const startPolling = async (reqId: string) => {
    setPollingStatus('polling')
    
    try {
      // Poll bis zu 60 Sekunden lang (20 Versuche alle 3 Sekunden)
      for (let i = 0; i < 20; i++) {
        // 3 Sekunden warten
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        // Status abrufen
        const response = await fetch(`/api/monica-ai/analyze?requestId=${reqId}`)
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Fehler beim Abrufen des Analyseergebnisses')
        }
        
        // Analyse abgeschlossen
        if (data.status === 'success' && data.data) {
          setAnalysisResult(data.data)
          setIsAnalyzing(false)
          setPollingStatus('completed')
          
          // Callback aufrufen, wenn vorhanden
          if (onAnalysisComplete) {
            onAnalysisComplete(data.data)
          }
          
          return
        }
        
        // Analyse fehlgeschlagen
        if (data.status === 'failed') {
          throw new Error(data.message || 'Analyse fehlgeschlagen')
        }
      }
      
      // Timeout nach 60 Sekunden
      throw new Error('Zeitüberschreitung bei der Analyse')
    } catch (error) {
      console.error('Fehler beim Polling:', error)
      setError(error instanceof Error ? error.message : 'Unbekannter Fehler')
      setIsAnalyzing(false)
      setPollingStatus('failed')
    }
  }
  
  // Datei in Base64 umwandeln
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const base64 = reader.result as string
        // Prefix entfernen (z.B. "data:application/pdf;base64,")
        const base64Data = base64.split(',')[1]
        resolve(base64Data)
      }
      reader.onerror = error => reject(error)
    })
  }
  
  // Dokumenttyp ermitteln
  const getDocumentType = (filename: string): 'pdf' | 'docx' | 'txt' | 'image' => {
    const extension = filename.split('.').pop()?.toLowerCase() || ''
    
    if (extension === 'pdf') return 'pdf'
    if (extension === 'docx' || extension === 'doc') return 'docx'
    if (extension === 'txt') return 'txt'
    if (['jpg', 'jpeg', 'png'].includes(extension)) return 'image'
    
    // Standard
    return 'pdf'
  }
  
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Lebenslauf analysieren</h3>
        {analysisResult && (
          <div className="flex items-center text-sm text-green-600">
            <Check className="h-4 w-4 mr-1" />
            Analyse abgeschlossen
          </div>
        )}
      </div>
      
      {!analysisResult && (
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center ${
            file ? 'border-heiba-blue bg-heiba-blue/5' : 'border-gray-300 hover:border-heiba-blue/50'
          } transition-colors`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            className="hidden"
            disabled={isUploading || isAnalyzing}
          />
          
          {!file ? (
            <div className="cursor-pointer">
              <Upload className="mx-auto h-10 w-10 text-gray-400" />
              <p className="mt-2 text-sm font-medium text-gray-900">Datei auswählen oder per Drag & Drop</p>
              <p className="mt-1 text-xs text-gray-500">PDF, DOC, DOCX, TXT, JPG, PNG (max. 10MB)</p>
            </div>
          ) : (
            <div>
              <FileText className="mx-auto h-8 w-8 text-heiba-blue" />
              <p className="mt-2 text-sm font-medium text-gray-900">{file.name}</p>
              <p className="mt-1 text-xs text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}
        </div>
      )}
      
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Fehler</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {!analysisResult && file && (
        <div className="flex justify-between items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setFile(null)
              if (fileInputRef.current) fileInputRef.current.value = ''
            }}
            disabled={isUploading || isAnalyzing}
          >
            <X className="h-4 w-4 mr-1" />
            Zurücksetzen
          </Button>
          
          <Button
            type="button"
            size="sm"
            onClick={handleUpload}
            disabled={isUploading || isAnalyzing}
          >
            {isUploading || isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isUploading ? 'Hochladen...' : 'Analysieren...'}
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Analysieren
              </>
            )}
          </Button>
        </div>
      )}
      
      {/* Polling-Status */}
      {pollingStatus === 'polling' && (
        <div className="flex items-center justify-center text-sm text-gray-600">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Analyse wird durchgeführt... (kann einige Sekunden dauern)
        </div>
      )}
      
      {/* Analyse-Ergebnis */}
      {analysisResult && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="font-medium text-sm mb-2">Analyseergebnis:</h4>
          
          {/* Vorschau der extrahierten Daten */}
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {analysisResult.personalInfo?.fullName && (
              <div className="col-span-2">
                <dt className="text-gray-500">Name</dt>
                <dd className="font-medium">{analysisResult.personalInfo?.fullName}</dd>
              </div>
            )}
            
            {analysisResult.personalInfo?.email && (
              <div>
                <dt className="text-gray-500">E-Mail</dt>
                <dd>{analysisResult.personalInfo?.email}</dd>
              </div>
            )}
            
            {analysisResult.personalInfo?.phone && (
              <div>
                <dt className="text-gray-500">Telefon</dt>
                <dd>{analysisResult.personalInfo?.phone}</dd>
              </div>
            )}
            
            {analysisResult.skills && analysisResult.skills.length > 0 && (
              <div className="col-span-2 mt-2">
                <dt className="text-gray-500">Skills</dt>
                <dd>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {analysisResult.skills.slice(0, 5).map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-heiba-blue/10 text-heiba-blue rounded text-xs">
                        {skill.name}
                      </span>
                    ))}
                    {analysisResult.skills.length > 5 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        +{analysisResult.skills.length - 5} weitere
                      </span>
                    )}
                  </div>
                </dd>
              </div>
            )}
            
            {analysisResult.workExperience && analysisResult.workExperience.length > 0 && (
              <div className="col-span-2 mt-2">
                <dt className="text-gray-500">Letzte Erfahrung</dt>
                <dd className="font-medium">
                  {analysisResult.workExperience[0].jobTitle} bei {analysisResult.workExperience[0].company}
                </dd>
              </div>
            )}
            
            {analysisResult.education && analysisResult.education.length > 0 && (
              <div className="col-span-2 mt-2">
                <dt className="text-gray-500">Ausbildung</dt>
                <dd className="font-medium">
                  {analysisResult.education[0].degree} in {analysisResult.education[0].fieldOfStudy}
                </dd>
                <dd className="text-sm text-gray-600">
                  {analysisResult.education[0].institution}
                </dd>
              </div>
            )}
          </dl>
          
          <div className="mt-4 pt-3 border-t border-gray-200 flex justify-end">
            <Button
              type="button"
              size="sm"
            >
              <div className="flex items-center">
                <Check className="h-4 w-4 mr-2" />
                In Kandidatenprofil übernehmen
              </div>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
