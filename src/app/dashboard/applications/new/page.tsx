'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Check, 
  FileText, 
  Loader2, 
  Mail, 
  MapPin, 
  Phone, 
  Upload, 
  User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { ChevronLeftIcon } from 'lucide-react'

const applicationSources = [
  { value: 'email', label: 'E-Mail' },
  { value: 'portal', label: 'Jobportal' },
  { value: 'website', label: 'Website' },
  { value: 'direct', label: 'Direkt' },
  { value: 'referral', label: 'Empfehlung' },
  { value: 'agency', label: 'Agentur' },
  { value: 'other', label: 'Andere' }
]

export default function NewApplicationPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    applicant_name: '',
    applicant_email: '',
    applicant_phone: '',
    applicant_location: '',
    source: 'email',
    source_detail: '',
    job_id: '',
    cover_letter: '',
    has_cv: false,
    cv_file_path: '',
    has_documents: false,
    documents_paths: ''
  })
  
  const [availableJobs, setAvailableJobs] = useState<{id: string, title: string, company: string}[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Lade verfügbare Jobs
  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/jobs?status=active')
        if (!response.ok) {
          throw new Error('Fehler beim Laden der Stellen')
        }
        
        const data = await response.json()
        setAvailableJobs(data.jobs)
      } catch (error) {
        console.error('Fehler beim Laden der Stellen:', error)
        toast({
          title: 'Fehler',
          description: 'Stellen konnten nicht geladen werden.',
          variant: 'destructive'
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchJobs()
  }, [toast])
  
  // Formularänderungen behandeln
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  // Select-Änderungen behandeln
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  // Checkbox-Änderungen behandeln
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }))
  }
  
  // Formular absenden
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Formatiere die Dokumentenpfade als JSON-Array, wenn vorhanden
      let formattedData = { ...formData }
      
      if (formData.has_documents && formData.documents_paths) {
        // Annahme: Komma-getrennte Pfade
        formattedData.documents_paths = JSON.stringify(
          formData.documents_paths
            .split(',')
            .map(path => path.trim())
            .filter(path => path.length > 0)
        )
      }
      
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formattedData)
      })
      
      if (!response.ok) {
        throw new Error('Fehler beim Erstellen der Bewerbung')
      }
      
      const data = await response.json()
      
      toast({
        title: 'Bewerbung erstellt',
        description: 'Die Bewerbung wurde erfolgreich erstellt.',
        variant: 'default'
      })
      
      // Zur Detailansicht der neuen Bewerbung navigieren
      router.push(`/dashboard/applications/${data.application.id}`)
    } catch (error) {
      console.error('Fehler beim Erstellen der Bewerbung:', error)
      toast({
        title: 'Fehler',
        description: 'Die Bewerbung konnte nicht erstellt werden.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/applications')}
            className="mr-4"
          >
            <ChevronLeftIcon className="mr-2 h-4 w-4" />
            Zurück
          </Button>
          <h1 className="text-2xl font-bold text-[var(--primary-dark)]">Neue Bewerbung erstellen</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Bewerbungsdaten</CardTitle>
            <CardDescription>
              Bitte geben Sie die Daten des Bewerbers und weitere Informationen ein.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Persönliche Daten */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Persönliche Daten</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="applicant_name">
                      <User className="w-4 h-4 inline-block mr-1" /> Name
                    </Label>
                    <Input
                      id="applicant_name"
                      name="applicant_name"
                      placeholder="Max Mustermann"
                      value={formData.applicant_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="applicant_email">
                      <Mail className="w-4 h-4 inline-block mr-1" /> E-Mail
                    </Label>
                    <Input
                      id="applicant_email"
                      name="applicant_email"
                      type="email"
                      placeholder="max.mustermann@example.com"
                      value={formData.applicant_email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="applicant_phone">
                      <Phone className="w-4 h-4 inline-block mr-1" /> Telefon
                    </Label>
                    <Input
                      id="applicant_phone"
                      name="applicant_phone"
                      placeholder="+49 123 4567890"
                      value={formData.applicant_phone}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="applicant_location">
                      <MapPin className="w-4 h-4 inline-block mr-1" /> Standort
                    </Label>
                    <Input
                      id="applicant_location"
                      name="applicant_location"
                      placeholder="Berlin"
                      value={formData.applicant_location}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
              
              {/* Bewerbungsdetails */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Bewerbungsdetails</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="source">Quelle</Label>
                    <Select 
                      name="source" 
                      value={formData.source} 
                      onValueChange={(value) => handleSelectChange('source', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Quelle auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Quellen</SelectLabel>
                          {applicationSources.map((source) => (
                            <SelectItem key={source.value} value={source.value}>
                              {source.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="source_detail">Quelldetails</Label>
                    <Input
                      id="source_detail"
                      name="source_detail"
                      placeholder="z.B. Indeed, LinkedIn, Empfehlung von..."
                      value={formData.source_detail}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="job_id">Stelle</Label>
                    <Select 
                      name="job_id" 
                      value={formData.job_id} 
                      onValueChange={(value) => handleSelectChange('job_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isLoading ? 'Stellen werden geladen...' : 'Stelle auswählen'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Verfügbare Stellen</SelectLabel>
                          {Array.isArray(availableJobs) && availableJobs.length > 0 ? (
                            availableJobs.map((job) => (
                              <SelectItem key={job.id} value={job.id}>
                                {job.title} ({job.company || ''})
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-jobs" disabled>
                              Keine Stellen verfügbar
                            </SelectItem>
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {/* Bewerbungsunterlagen */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Bewerbungsunterlagen</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cover_letter">Anschreiben</Label>
                    <Textarea
                      id="cover_letter"
                      name="cover_letter"
                      placeholder="Inhalt des Anschreibens..."
                      rows={6}
                      value={formData.cover_letter}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="has_cv"
                          className="h-4 w-4 rounded border-gray-300 text-[#002451] focus:ring-[#002451]"
                          checked={formData.has_cv}
                          onChange={(e) => handleCheckboxChange('has_cv', e.target.checked)}
                        />
                        <Label htmlFor="has_cv" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Lebenslauf vorhanden
                        </Label>
                      </div>
                      
                      {formData.has_cv && (
                        <div className="pt-2">
                          <Label htmlFor="cv_file_path">Pfad zum Lebenslauf</Label>
                          <Input
                            id="cv_file_path"
                            name="cv_file_path"
                            placeholder="/uploads/lebenslauf.pdf"
                            value={formData.cv_file_path}
                            onChange={handleChange}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Hinweis: Hier später Datei-Upload einbinden
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="has_documents"
                          className="h-4 w-4 rounded border-gray-300 text-[#002451] focus:ring-[#002451]"
                          checked={formData.has_documents}
                          onChange={(e) => handleCheckboxChange('has_documents', e.target.checked)}
                        />
                        <Label htmlFor="has_documents" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Weitere Dokumente vorhanden
                        </Label>
                      </div>
                      
                      {formData.has_documents && (
                        <div className="pt-2">
                          <Label htmlFor="documents_paths">Pfade zu Dokumenten (kommagetrennt)</Label>
                          <Input
                            id="documents_paths"
                            name="documents_paths"
                            placeholder="/uploads/zeugnis.pdf, /uploads/zertifikat.pdf"
                            value={formData.documents_paths}
                            onChange={handleChange}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Hinweis: Hier später Mehrfach-Datei-Upload einbinden
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/applications')}
              >
                Abbrechen
              </Button>
              
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="bg-[var(--accent)] hover:bg-[var(--accent)]/90 font-medium shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Wird gespeichert...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Bewerbung erstellen
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
