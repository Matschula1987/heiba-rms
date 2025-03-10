'use client'

import React, { useState, useEffect } from 'react'
import { 
  Loader2, 
  FileText, 
  PlusCircle, 
  Search,
  Tag,
  AlertTriangle,
  X 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { JobTemplate } from '@/types/jobs'

interface TemplateSelectorProps {
  onInsert: (content: string) => void
  selectedCategory?: string
  onClose?: () => void
  buttonLabel?: string
  className?: string
}

export default function TemplateSelector({
  onInsert,
  selectedCategory,
  onClose,
  buttonLabel = 'Einfügen',
  className = ''
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<JobTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState(selectedCategory || '')
  const [previewTemplate, setPreviewTemplate] = useState<JobTemplate | null>(null)
  
  useEffect(() => {
    // Textbausteine laden
    const fetchTemplates = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const response = await fetch('/api/job-templates')
        if (!response.ok) {
          throw new Error('Fehler beim Laden der Textbausteine')
        }
        
        const data = await response.json()
        setTemplates(data.templates || [])
      } catch (error) {
        console.error('Fehler beim Laden der Textbausteine:', error)
        setError('Die Textbausteine konnten nicht geladen werden. Bitte versuchen Sie es später erneut.')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchTemplates()
  }, [])
  
  // Wenn eine Kategorie von außen übergeben wird, Filter aktualisieren
  useEffect(() => {
    if (selectedCategory) {
      setCategoryFilter(selectedCategory)
    }
  }, [selectedCategory])
  
  // Textbaustein zur Vorschau auswählen
  const handlePreview = (template: JobTemplate) => {
    setPreviewTemplate(template)
  }
  
  // Einfügen des Textbausteins
  const handleInsert = (template: JobTemplate) => {
    onInsert(template.content)
    if (onClose) {
      onClose()
    }
  }
  
  // Kategorie-Label anzeigen
  const getCategoryLabel = (category: string): string => {
    switch (category) {
      case 'company_description':
        return 'Unternehmensbeschreibung'
      case 'requirements':
        return 'Anforderungen'
      case 'benefits':
        return 'Benefits'
      case 'intro':
        return 'Einleitung'
      case 'outro':
        return 'Abschluss'
      default:
        return category
    }
  }
  
  // Kategorie-Badge-Farbe
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'company_description':
        return 'bg-blue-100 text-blue-800'
      case 'requirements':
        return 'bg-green-100 text-green-800'
      case 'benefits':
        return 'bg-purple-100 text-purple-800'
      case 'intro':
        return 'bg-yellow-100 text-yellow-800'
      case 'outro':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  // Gefilterte und durchsuchte Textbausteine
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = searchTerm === '' || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (template.tags && template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    
    const matchesCategory = categoryFilter === '' || template.category === categoryFilter
    
    return matchesSearch && matchesCategory
  })
  
  // Nach Kategorie gruppierte Templates
  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    const category = template.category
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(template)
    return acc
  }, {} as Record<string, JobTemplate[]>)
  
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-[200px] ${className}`}>
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-heiba-blue" />
          <p className="text-sm text-gray-500">Lade Textbausteine...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Suchleiste */}
      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Textbausteine durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-heiba-blue focus:border-heiba-blue"
        >
          <option value="">Alle Kategorien</option>
          <option value="company_description">Unternehmensbeschreibung</option>
          <option value="requirements">Anforderungen</option>
          <option value="benefits">Benefits</option>
          <option value="intro">Einleitung</option>
          <option value="outro">Abschluss</option>
        </select>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Zweigeteiltes Layout für Desktop */}
      <div className="flex flex-col md:flex-row gap-4 h-full overflow-hidden">
        {/* Linke Seite: Textbaustein-Liste */}
        <div className="flex-1 overflow-y-auto pr-2">
          {Object.keys(groupedTemplates).length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <FileText className="mx-auto h-8 w-8 text-gray-400" />
              <h3 className="mt-2 text-base font-medium text-gray-900">Keine Textbausteine gefunden</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || categoryFilter 
                  ? 'Keine Textbausteine entsprechen Ihren Filterkriterien.' 
                  : 'Erstellen Sie Textbausteine, um sie hier zu verwenden.'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
                <div key={category} className="space-y-2">
                  <h3 className={`text-sm font-medium px-2 py-1 rounded-md inline-block ${getCategoryColor(category)}`}>
                    {getCategoryLabel(category)}
                  </h3>
                  
                  <div className="space-y-2">
                    {categoryTemplates.map(template => (
                      <div 
                        key={template.id}
                        className={`border rounded-md p-3 cursor-pointer transition-colors ${
                          previewTemplate?.id === template.id 
                            ? 'border-heiba-blue bg-heiba-blue/5' 
                            : 'border-gray-200 hover:border-heiba-blue/50 hover:bg-gray-50'
                        }`}
                        onClick={() => handlePreview(template)}
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-heiba-blue">{template.name}</h4>
                          <Button 
                            size="sm" 
                            variant="secondary"
                            className="h-7 text-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleInsert(template)
                            }}
                          >
                            <PlusCircle className="h-3 w-3 mr-1" />
                            {buttonLabel}
                          </Button>
                        </div>
                        
                        {template.tags && template.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {template.tags.map((tag, idx) => (
                              <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <div className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {template.content.replace(/<[^>]*>/g, ' ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Rechte Seite: Vorschau */}
        <div className="md:w-1/2 bg-gray-50 rounded-lg p-4 border border-gray-200 overflow-y-auto relative">
          {previewTemplate ? (
            <>
              <div className="mb-4 flex justify-between items-center">
                <h3 className="font-medium">{previewTemplate.name}</h3>
                <Button 
                  size="sm" 
                  onClick={() => handleInsert(previewTemplate)}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  {buttonLabel}
                </Button>
              </div>
              
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: previewTemplate.content }} />
              
              <p className="mt-4 text-xs text-gray-500">
                Erstellt von: {previewTemplate.created_by || 'System'} | 
                Letzte Aktualisierung: {new Date(previewTemplate.updated_at).toLocaleDateString('de-DE')}
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <FileText className="h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Vorschau</h3>
              <p className="mt-1 text-sm text-gray-500">
                Wählen Sie einen Textbaustein aus, um eine Vorschau anzuzeigen.
              </p>
            </div>
          )}
          
          {onClose && (
            <button
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 text-gray-500"
              onClick={onClose}
              title="Schließen"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
