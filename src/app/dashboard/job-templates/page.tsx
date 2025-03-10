'use client'

import React, { useState, useEffect } from 'react'
import { 
  Loader2, 
  Plus, 
  Pencil, 
  Trash2, 
  Check, 
  X, 
  Search, 
  FileText,
  Copy
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { JobTemplate } from '@/types/jobs'

export default function JobTemplatesPage() {
  const [templates, setTemplates] = useState<JobTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  
  // Dialog-State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [currentTemplate, setCurrentTemplate] = useState<JobTemplate | null>(null)
  const [formData, setFormData] = useState<Partial<JobTemplate>>({
    name: '',
    category: 'company_description',
    content: ''
  })
  const [isSaving, setIsSaving] = useState(false)
  
  // Delete-Dialog-State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<JobTemplate | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
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
  
  // Textbausteine beim ersten Render laden
  useEffect(() => {
    fetchTemplates()
  }, [])
  
  // Dialog für neuen Textbaustein öffnen
  const handleCreateNew = () => {
    setDialogMode('create')
    setFormData({
      name: '',
      category: 'company_description',
      content: ''
    })
    setIsDialogOpen(true)
  }
  
  // Dialog für Bearbeitung öffnen
  const handleEdit = (template: JobTemplate) => {
    setDialogMode('edit')
    setCurrentTemplate(template)
    setFormData({
      id: template.id,
      name: template.name,
      category: template.category,
      content: template.content
    })
    setIsDialogOpen(true)
  }
  
  // Dialog für Löschen öffnen
  const handleDelete = (template: JobTemplate) => {
    setTemplateToDelete(template)
    setIsDeleteDialogOpen(true)
  }
  
  // Textbaustein speichern
  const handleSave = async () => {
    if (!formData.name || !formData.content || !formData.category) {
      setError('Name, Inhalt und Kategorie sind erforderlich.')
      return
    }
    
    setIsSaving(true)
    setError(null)
    
    try {
      const method = dialogMode === 'create' ? 'POST' : 'PUT'
      const response = await fetch('/api/job-templates', {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        throw new Error(`Fehler beim ${dialogMode === 'create' ? 'Erstellen' : 'Aktualisieren'} des Textbausteins`)
      }
      
      const data = await response.json()
      
      // Lokalen State aktualisieren
      if (dialogMode === 'create') {
        setTemplates([...templates, data.template])
      } else {
        setTemplates(templates.map(t => t.id === data.template.id ? data.template : t))
      }
      
      // Dialog schließen
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Fehler beim Speichern des Textbausteins:', error)
      setError(`Fehler beim ${dialogMode === 'create' ? 'Erstellen' : 'Aktualisieren'} des Textbausteins.`)
    } finally {
      setIsSaving(false)
    }
  }
  
  // Textbaustein löschen
  const handleDeleteConfirm = async () => {
    if (!templateToDelete) return
    
    setIsDeleting(true)
    setError(null)
    
    try {
      const response = await fetch('/api/job-templates', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: templateToDelete.id })
      })
      
      if (!response.ok) {
        throw new Error('Fehler beim Löschen des Textbausteins')
      }
      
      // Lokalen State aktualisieren
      setTemplates(templates.filter(t => t.id !== templateToDelete.id))
      
      // Dialog schließen
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error('Fehler beim Löschen des Textbausteins:', error)
      setError('Fehler beim Löschen des Textbausteins.')
    } finally {
      setIsDeleting(false)
    }
  }
  
  // Textbaustein kopieren
  const handleDuplicate = (template: JobTemplate) => {
    setDialogMode('create')
    setFormData({
      name: `${template.name} (Kopie)`,
      category: template.category,
      content: template.content
    })
    setIsDialogOpen(true)
  }
  
  // Textbaustein in die Zwischenablage kopieren
  const handleCopyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
      .then(() => {
        // Hier könnte man ein Erfolgsfeedback anzeigen
        console.log('Inhalt in die Zwischenablage kopiert')
      })
      .catch((err) => {
        console.error('Fehler beim Kopieren in die Zwischenablage:', err)
      })
  }
  
  // Kategorie anzeigen
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
      template.content.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === '' || template.category === categoryFilter
    
    return matchesSearch && matchesCategory
  })
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-heiba-blue" />
          <p className="text-sm text-gray-500">Lade Textbausteine...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-heiba-blue">Textbausteine für Stellenanzeigen</h1>
          <p className="text-gray-600">Erstellen und verwalten Sie wiederverwendbare Textbausteine für Ihre Stellenanzeigen.</p>
        </div>
        
        <Button onClick={handleCreateNew} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Neuer Textbaustein
        </Button>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Fehler</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Filter und Suche */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
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
        
        <div className="sm:w-64">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-heiba-blue focus:border-heiba-blue"
          >
            <option value="">Alle Kategorien</option>
            <option value="company_description">Unternehmensbeschreibung</option>
            <option value="requirements">Anforderungen</option>
            <option value="benefits">Benefits</option>
            <option value="intro">Einleitung</option>
            <option value="outro">Abschluss</option>
          </select>
        </div>
      </div>
      
      {/* Textbausteine-Liste */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Keine Textbausteine gefunden</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || categoryFilter 
              ? 'Keine Textbausteine entsprechen Ihren Filterkriterien.' 
              : 'Erstellen Sie Ihren ersten Textbaustein, um zu beginnen.'}
          </p>
          
          {(searchTerm || categoryFilter) && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('')
                setCategoryFilter('')
              }}
              className="mt-4"
            >
              Filter zurücksetzen
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTemplates.map((template) => (
            <div 
              key={template.id} 
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-medium">{template.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(template.category)}`}>
                      {getCategoryLabel(template.category)}
                    </span>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-700 border rounded-md p-3 bg-gray-50">
                    <div dangerouslySetInnerHTML={{ __html: template.content }} />
                  </div>
                  
                  <p className="mt-3 text-xs text-gray-500">
                    Erstellt von: {template.created_by} | Letzte Aktualisierung: {new Date(template.updated_at).toLocaleDateString('de-DE')}
                  </p>
                </div>
                
                <div className="flex flex-col gap-2 ml-4">
                  <button 
                    onClick={() => handleEdit(template)}
                    className="p-2 rounded-md hover:bg-gray-100 text-gray-700 transition-colors"
                    title="Bearbeiten"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  
                  <button 
                    onClick={() => handleDuplicate(template)}
                    className="p-2 rounded-md hover:bg-gray-100 text-gray-700 transition-colors"
                    title="Duplizieren"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  
                  <button 
                    onClick={() => handleCopyToClipboard(template.content)}
                    className="p-2 rounded-md hover:bg-gray-100 text-gray-700 transition-colors"
                    title="In Zwischenablage kopieren"
                  >
                    <FileText className="h-4 w-4" />
                  </button>
                  
                  <button 
                    onClick={() => handleDelete(template)}
                    className="p-2 rounded-md hover:bg-red-100 text-red-600 transition-colors"
                    title="Löschen"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Erstellen/Bearbeiten-Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'create' ? 'Neuen Textbaustein erstellen' : 'Textbaustein bearbeiten'}
            </DialogTitle>
            <DialogDescription>
              Erstellen Sie wiederverwendbare Textbausteine für Ihre Stellenanzeigen.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="template-name">Name</Label>
              <Input
                id="template-name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Name des Textbausteins"
              />
            </div>
            
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="template-category">Kategorie</Label>
              <select
                id="template-category"
                value={formData.category || 'company_description'}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-heiba-blue focus:border-heiba-blue"
              >
                <option value="company_description">Unternehmensbeschreibung</option>
                <option value="requirements">Anforderungen</option>
                <option value="benefits">Benefits</option>
                <option value="intro">Einleitung</option>
                <option value="outro">Abschluss</option>
              </select>
            </div>
            
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="template-content">Inhalt</Label>
              <Textarea
                id="template-content"
                value={formData.content || ''}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Inhalt des Textbausteins (HTML unterstützt)"
                rows={8}
              />
              <p className="text-xs text-gray-500 mt-1">
                Sie können HTML-Tags verwenden, z.B. &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt;.
              </p>
            </div>
            
            {/* Vorschau */}
            {formData.content && (
              <div className="mt-4">
                <Label>Vorschau</Label>
                <div className="mt-1 p-3 border rounded-md bg-gray-50">
                  <div dangerouslySetInnerHTML={{ __html: formData.content }} />
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              disabled={isSaving}
            >
              Abbrechen
            </Button>
            <Button 
              type="button" 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Speichern...
                </>
              ) : (
                'Speichern'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Löschen-Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Textbaustein löschen</DialogTitle>
            <DialogDescription>
              Möchten Sie den Textbaustein "{templateToDelete?.name}" wirklich löschen?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-gray-500">
              Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Abbrechen
            </Button>
            <Button 
              type="button" 
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Löschen...
                </>
              ) : (
                'Löschen'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
