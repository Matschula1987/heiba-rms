'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Editor } from '@tinymce/tinymce-react'
import { useJobStore } from '@/store/jobStore'
import { Job, JobStatus, JobTemplate } from '@/types'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FileText, Plus } from 'lucide-react'
import TemplateSelector from '@/components/jobs/TemplateSelector'

interface JobFormModalEnhancedProps {
  isOpen: boolean
  onClose: () => void
  initialData?: Partial<Job>
}

export default function JobFormModalEnhanced({ isOpen, onClose, initialData }: JobFormModalEnhancedProps) {
  const { createJob, updateJob } = useJobStore()
  const editorRef = useRef<any>(null)
  
  // Status für aktuellen Tab
  const [activeTab, setActiveTab] = useState('basics')
  
  // Template-Selector Dialog State
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false)
  const [currentTemplateField, setCurrentTemplateField] = useState<keyof Job | null>(null)
  const [currentTemplateCategory, setCurrentTemplateCategory] = useState<string>('')
  
  // Template-Daten vom Server
  const [templates, setTemplates] = useState<JobTemplate[]>([])
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)
  const [templatesError, setTemplatesError] = useState<string | null>(null)
  
  // Textbausteine vom Server laden
  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoadingTemplates(true)
      setTemplatesError(null)
      
      try {
        const response = await fetch('/api/job-templates')
        if (!response.ok) {
          throw new Error('Fehler beim Laden der Textbausteine')
        }
        
        const data = await response.json()
        if (data.success && data.templates) {
          setTemplates(data.templates)
        } else {
          throw new Error('Keine Textbausteine in der Antwort gefunden')
        }
      } catch (error) {
        console.error('Fehler beim Laden der Textbausteine:', error)
        setTemplatesError('Textbausteine konnten nicht geladen werden.')
      } finally {
        setIsLoadingTemplates(false)
      }
    }
    
    fetchTemplates()
  }, [])
  
  // TemplateSelector öffnen
  const openTemplateSelector = (field: keyof Job, category: string = '') => {
    setCurrentTemplateField(field)
    setCurrentTemplateCategory(category)
    setIsTemplateSelectorOpen(true)
  }
  
  // Erweitertes Formular-State
  const [formData, setFormData] = useState<Partial<Job>>(initialData || {
    id: `job${Math.floor(Math.random() * 1000)}`,
    company_id: 1,
    title: '',
    description: '',
    rich_description: '',
    location: '',
    salary_range: '',
    job_type: 'Vollzeit',
    requirements: '',
    department: '',
    status: 'draft' as JobStatus,
    skills: [],
    
    // Erweiterte Felder
    customer_id: '',
    external_job_id: '',
    contact_person_id: '',
    company_description: '',
    benefits: '',
    requirements_profile: '',
    keywords: '',
    internal_notes: '',
    publication_start_date: '',
    publication_end_date: '',
    republish_cycle: 30,
    assigned_to: '',
    
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })
  
  // Laden der Daten für externe Referenzen
  const [customers, setCustomers] = useState<any[]>([
    { id: '1', name: 'Musterfirma GmbH', type: 'customer' },
    { id: '2', name: 'Beispiel AG', type: 'customer' },
    { id: '3', name: 'Test Corp.', type: 'prospect' }
  ])
  
  const [contacts, setContacts] = useState<any[]>([
    { id: '1', customer_id: '1', first_name: 'Max', last_name: 'Mustermann', position: 'CEO' },
    { id: '2', customer_id: '1', first_name: 'Maria', last_name: 'Musterfrau', position: 'HR' },
    { id: '3', customer_id: '2', first_name: 'John', last_name: 'Doe', position: 'CTO' }
  ])
  
  // Daten für Multiposting von API
  const [platforms, setPlatforms] = useState<Array<{
    id: string;
    name: string;
    isActive: boolean;
    isFree: boolean;
    configured: boolean;
  }>>([]);
  
  const [isLoadingPlatforms, setIsLoadingPlatforms] = useState(true);
  const [platformsError, setPlatformsError] = useState<string | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  
  // Lade verfügbare Jobportale
  useEffect(() => {
    const fetchPlatforms = async () => {
      setIsLoadingPlatforms(true);
      setPlatformsError(null);
      
      try {
        const response = await fetch('/api/job-portals');
        if (!response.ok) {
          throw new Error('Fehler beim Laden der Jobportale');
        }
        
        const data = await response.json();
        
        // Transformiere die Daten in das benötigte Format
        const formattedPlatforms = data.portals.map((portal: any) => ({
          id: portal.key,
          name: portal.name,
          isActive: portal.enabled,
          isFree: portal.key === 'indeed' || portal.key === 'google_jobs', // Da wir diese Information in unseren Adaptern haben
          configured: portal.configured
        }));
        
        setPlatforms(formattedPlatforms);
        
        // Wenn initiale Daten vorhanden sind, setze ausgewählte Plattformen
        if (initialData?.published_platforms) {
          setSelectedPlatforms(initialData.published_platforms);
        }
      } catch (error) {
        console.error('Fehler beim Laden der Jobportale:', error);
        setPlatformsError('Jobportale konnten nicht geladen werden.');
      } finally {
        setIsLoadingPlatforms(false);
      }
    };
    
    fetchPlatforms();
  }, [initialData]);
  
  // Kontakte nach Kundenwahl filtern
  const filteredContacts = contacts.filter(contact => 
    !formData.customer_id || contact.customer_id === formData.customer_id
  )
  
  if (!isOpen) return null
  
  // Textbausteine einfügen (von Template-Selector)
  const handleTemplateInsert = (content: string) => {
    if (!currentTemplateField) return
    
    // Für Rich-Text-Felder
    if (currentTemplateField === 'rich_description' && editorRef.current) {
      editorRef.current.setContent(content)
    } else {
      // Für reguläre Felder
      setFormData(prev => ({
        ...prev,
        [currentTemplateField]: content
      }))
    }
    
    // Dialog schließen
    setIsTemplateSelectorOpen(false)
  }
  
  // Textbausteine einfügen (von Dropdown)
  const insertTemplate = (templateId: string, field: keyof Job) => {
    const template = templates.find(t => t.id === templateId)
    if (!template) return
    
    // Für Rich-Text-Felder
    if (field === 'rich_description' && editorRef.current) {
      editorRef.current.setContent(template.content)
    } else {
      // Für reguläre Felder
      setFormData(prev => ({
        ...prev,
        [field]: template.content
      }))
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // TinyMCE-Editor-Inhalt übernehmen
    if (editorRef.current) {
      const richContent = editorRef.current.getContent()
      formData.rich_description = richContent
    }
    
    // Ausgewählte Plattformen speichern
    formData.published_platforms = selectedPlatforms
    
    try {
      if (initialData && initialData.id) {
        // Update existing job
        await updateJob(initialData.id.toString(), formData)
      } else {
        // Create new job
        await createJob(formData)
      }
      onClose()
    } catch (error) {
      console.error('Fehler beim Speichern der Stelle:', error)
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-md border border-gray-300 shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-heiba-blue">
            {initialData ? 'Stelle bearbeiten' : 'Neue Stelle erstellen'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          {/* Template-Selector Dialog */}
          <Dialog open={isTemplateSelectorOpen} onOpenChange={setIsTemplateSelectorOpen}>
            <DialogContent className="sm:max-w-[80vw] sm:max-h-[80vh] overflow-hidden">
              <div className="h-[70vh]">
                <TemplateSelector 
                  onInsert={handleTemplateInsert}
                  selectedCategory={currentTemplateCategory}
                  onClose={() => setIsTemplateSelectorOpen(false)}
                  buttonLabel="Einfügen"
                  className="h-full"
                />
              </div>
            </DialogContent>
          </Dialog>
          
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-5 mb-4">
                <TabsTrigger value="basics" className="text-center">Grunddaten</TabsTrigger>
                <TabsTrigger value="description" className="text-center">Beschreibung</TabsTrigger>
                <TabsTrigger value="requirements" className="text-center">Anforderungen</TabsTrigger>
                <TabsTrigger value="publishing" className="text-center">Veröffentlichung</TabsTrigger>
                <TabsTrigger value="notes" className="text-center">Notizen</TabsTrigger>
              </TabsList>

              {/* Grunddaten Tab */}
              <TabsContent value="basics" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-heiba-blue/20"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Externe Job-ID</label>
                    <input
                      type="text"
                      value={formData.external_job_id || ''}
                      onChange={(e) => setFormData({ ...formData, external_job_id: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-heiba-blue/20"
                      placeholder="z.B. DEV-2023-42"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kunde/Interessent</label>
                    <select
                      value={formData.customer_id || ''}
                      onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-heiba-blue/20"
                    >
                      <option value="">-- Bitte auswählen --</option>
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} ({customer.type === 'customer' ? 'Kunde' : 'Interessent'})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ansprechpartner</label>
                    <select
                      value={formData.contact_person_id || ''}
                      onChange={(e) => setFormData({ ...formData, contact_person_id: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-heiba-blue/20"
                      disabled={!formData.customer_id}
                    >
                      <option value="">-- Bitte auswählen --</option>
                      {filteredContacts.map(contact => (
                        <option key={contact.id} value={contact.id}>
                          {contact.first_name} {contact.last_name} ({contact.position})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Standort</label>
                    <input
                      type="text"
                      value={formData.location || ''}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-heiba-blue/20"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Abteilung</label>
                    <input
                      type="text"
                      value={formData.department || ''}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-heiba-blue/20"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gehaltsspanne</label>
                    <input
                      type="text"
                      value={formData.salary_range || ''}
                      onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-heiba-blue/20"
                      placeholder="z.B. 50.000-65.000 EUR"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Arbeitsform</label>
                    <select
                      value={formData.job_type || 'Vollzeit'}
                      onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-heiba-blue/20"
                    >
                      <option value="Vollzeit">Vollzeit</option>
                      <option value="Teilzeit">Teilzeit</option>
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Freelance">Freelance</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status || 'draft'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as JobStatus })}
                      className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-heiba-blue/20"
                    >
                      <option value="draft">Entwurf</option>
                      <option value="active">Aktiv</option>
                      <option value="inactive">Inaktiv</option>
                      <option value="archived">Archiviert</option>
                    </select>
                  </div>
                </div>
              </TabsContent>

              {/* Beschreibungs-Tab mit Rich-Text-Editor */}
              <TabsContent value="description" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700">Unternehmensbeschreibung</label>
                      <div className="flex items-center gap-2">
                        <Button 
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => openTemplateSelector('company_description', 'company_description')}
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          Textbausteine
                        </Button>
                        <select 
                          className="text-xs border rounded px-2 py-1 bg-gray-50"
                          onChange={(e) => {
                            if (e.target.value) insertTemplate(e.target.value, 'company_description')
                            e.target.value = ''
                          }}
                        >
                          <option value="">Schnellauswahl</option>
                          {templates
                            .filter(t => t.category === 'company_description')
                            .map(t => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))
                          }
                        </select>
                      </div>
                    </div>
                    <textarea
                      value={formData.company_description || ''}
                      onChange={(e) => setFormData({ ...formData, company_description: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-heiba-blue/20"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700">Stellenbeschreibung</label>
                      <div className="flex items-center gap-2">
                        <Button 
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => openTemplateSelector('rich_description', 'description')}
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          Textbausteine
                        </Button>
                        <span className="text-xs text-gray-500">Rich-Text-Editor: Formatieren Sie den Text nach Bedarf</span>
                      </div>
                    </div>
                    <Editor
                      onInit={(evt: any, editor: any) => editorRef.current = editor}
                      initialValue={formData.rich_description || formData.description}
                      init={{
                        height: 300,
                        menubar: false,
                        plugins: [
                          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                          'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                        ],
                        toolbar: 'undo redo | blocks | ' +
                          'bold italic forecolor | alignleft aligncenter ' +
                          'alignright alignjustify | bullist numlist outdent indent | ' +
                          'removeformat | help',
                        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                      }}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700">Benefits/Vorteile</label>
                      <div className="flex items-center gap-2">
                        <Button 
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => openTemplateSelector('benefits', 'benefits')}
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          Textbausteine
                        </Button>
                        <select 
                          className="text-xs border rounded px-2 py-1 bg-gray-50"
                          onChange={(e) => {
                            if (e.target.value) insertTemplate(e.target.value, 'benefits')
                            e.target.value = ''
                          }}
                        >
                          <option value="">Schnellauswahl</option>
                          {templates
                            .filter(t => t.category === 'benefits')
                            .map(t => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))
                          }
                        </select>
                      </div>
                    </div>
                    <textarea
                      value={formData.benefits || ''}
                      onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-heiba-blue/20"
                      rows={3}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Anforderungs-Tab */}
              <TabsContent value="requirements" className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">Anforderungsprofil</label>
                    <div className="flex items-center gap-2">
                      <Button 
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => openTemplateSelector('requirements', 'requirements')}
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        Textbausteine
                      </Button>
                      <select 
                        className="text-xs border rounded px-2 py-1 bg-gray-50"
                        onChange={(e) => {
                          if (e.target.value) insertTemplate(e.target.value, 'requirements')
                          e.target.value = ''
                        }}
                      >
                        <option value="">Schnellauswahl</option>
                        {templates
                          .filter(t => t.category === 'requirements')
                          .map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))
                        }
                      </select>
                    </div>
                  </div>
                  <textarea
                    value={formData.requirements || ''}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-heiba-blue/20"
                    rows={4}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Keywords (für SEO und Matching, durch Komma getrennt)
                  </label>
                  <input
                    type="text"
                    value={formData.keywords || ''}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-heiba-blue/20"
                    placeholder="z.B. Python, React, Frontend, Entwickler"
                  />
                </div>
              </TabsContent>

              {/* Veröffentlichungs-Tab */}
              <TabsContent value="publishing" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Startdatum der Veröffentlichung</label>
                    <input
                      type="date"
                      value={formData.publication_start_date || ''}
                      onChange={(e) => setFormData({ ...formData, publication_start_date: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-heiba-blue/20"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Enddatum der Veröffentlichung</label>
                    <input
                      type="date"
                      value={formData.publication_end_date || ''}
                      onChange={(e) => setFormData({ ...formData, publication_end_date: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-heiba-blue/20"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Neu-Veröffentlichungszyklus (in Tagen)</label>
                    <input
                      type="number"
                      value={formData.republish_cycle || 30}
                      onChange={(e) => setFormData({ ...formData, republish_cycle: parseInt(e.target.value) })}
                      min="1"
                      max="90"
                      className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-heiba-blue/20"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="font-medium text-gray-800 mb-2">Veröffentlichungsplattformen</h3>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-sm text-gray-600 mb-2">Kostenlose Plattformen</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {platforms.filter(p => p.isFree).map(platform => (
                        <label key={platform.id} className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={selectedPlatforms.includes(platform.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPlatforms([...selectedPlatforms, platform.id])
                              } else {
                                setSelectedPlatforms(selectedPlatforms.filter(id => id !== platform.id))
                              }
                            }}
                            className="rounded border-gray-300 text-heiba-blue focus:ring-heiba-blue"
                          />
                          <span>{platform.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg mt-4">
                    <h4 className="font-medium text-sm text-gray-600 mb-2">Kostenpflichtige Plattformen</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {platforms.filter(p => !p.isFree).map(platform => (
                        <label key={platform.id} className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={selectedPlatforms.includes(platform.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPlatforms([...selectedPlatforms, platform.id])
                              } else {
                                setSelectedPlatforms(selectedPlatforms.filter(id => id !== platform.id))
                              }
                            }}
                            className="rounded border-gray-300 text-heiba-blue focus:ring-heiba-blue"
                          />
                          <span>{platform.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Notizen-Tab */}
              <TabsContent value="notes" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Interne Notizen</label>
                  <textarea
                    value={formData.internal_notes || ''}
                    onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-heiba-blue/20"
                    rows={6}
                    placeholder="Interne Notizen zur Stelle, die nicht veröffentlicht werden..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zugewiesen an</label>
                  <select
                    value={formData.assigned_to || ''}
                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-heiba-blue/20"
                  >
                    <option value="">-- Nicht zugewiesen --</option>
                    <option value="user1">Max Mustermann</option>
                    <option value="user2">Anna Schmidt</option>
                    <option value="user3">Peter Müller</option>
                  </select>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="flex justify-end items-center px-6 py-4 bg-gray-50 border-t">
            <div className="flex-1">
              <p className="text-sm text-gray-500">Wechseln Sie zwischen den Tabs, um alle Informationen einzugeben.</p>
            </div>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="bg-heiba-gold text-white px-5 py-2 rounded-lg hover:bg-[#C19B20] transition-colors shadow-md"
              >
                {initialData ? 'Speichern' : 'Erstellen'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
