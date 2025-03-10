import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "../ui/switch";
import { useEmailStore } from "@/store/emailStore";
import { useCandidateStore } from "@/store/candidateStore";
import { Candidate } from '@/types';
import { Loader2, AlertCircle, Clock } from 'lucide-react';

interface CandidateRejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate;
}

const CandidateRejectionModal: React.FC<CandidateRejectionModalProps> = ({
  isOpen,
  onClose,
  candidate
}) => {
  // Email-Store für Templates und Einstellungen
  const { 
    templates, 
    settings,
    fetchTemplates,
    processTemplate, 
    scheduleEmail, 
    isLoading,
    error
  } = useEmailStore();
  
  // Kandidaten-Store für das Aktualisieren des Kandidatenstatus
  const { updateCandidate } = useCandidateStore();
  
  // Lokaler Zustand
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [emailSubject, setEmailSubject] = useState<string>('');
  const [emailContent, setEmailContent] = useState<string>('');
  const [delayDays, setDelayDays] = useState<number>(settings.delayedRejection.defaultDelay);
  const [archiveImmediately, setArchiveImmediately] = useState<boolean>(settings.delayedRejection.archiveImmediately);
  const [customDelay, setCustomDelay] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  
  // Templates beim Öffnen des Modals laden
  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
      
      // Standardverzögerung aus den Einstellungen laden
      setDelayDays(settings.delayedRejection.defaultDelay);
      setArchiveImmediately(settings.delayedRejection.archiveImmediately);
    }
  }, [isOpen, fetchTemplates, settings.delayedRejection]);
  
  // Ausgewähltes Template verarbeiten
  useEffect(() => {
    const processSelectedTemplate = async () => {
      if (!selectedTemplateId) {
        setEmailSubject('');
        setEmailContent('');
        return;
      }
      
      try {
        // Template-Variablen mit den Kandidatendaten füllen
        const variables = {
          name: candidate.name || `${candidate.firstName} ${candidate.lastName}`,
          firstName: candidate.firstName || '',
          lastName: candidate.lastName || '',
          position: candidate.position || '',
          company: 'HeiBa', // Deinen Unternehmensnamen hier
          date: new Date().toLocaleDateString('de-DE')
        };
        
        const { subject, content } = await processTemplate(selectedTemplateId, variables);
        setEmailSubject(subject);
        setEmailContent(content);
      } catch (error) {
        console.error('Fehler beim Verarbeiten des Templates:', error);
      }
    };
    
    if (selectedTemplateId) {
      processSelectedTemplate();
    }
  }, [selectedTemplateId, candidate, processTemplate]);
  
  // Standardwerte setzen, wenn Templates geladen sind
  useEffect(() => {
    if (templates.length > 0 && !selectedTemplateId) {
      // Standardmäßig ein Absage-Template suchen
      const rejectionTemplate = templates.find(t => 
        t.name.toLowerCase().includes('absage') || 
        t.name.toLowerCase().includes('reject')
      );
      
      if (rejectionTemplate) {
        setSelectedTemplateId(rejectionTemplate.id);
      } else if (templates.length > 0) {
        // Wenn kein Absage-Template gefunden wird, das erste Template verwenden
        setSelectedTemplateId(templates[0].id);
      }
    }
  }, [templates, selectedTemplateId]);
  
  // Absage senden und Kandidaten archivieren
  const handleReject = async () => {
    setProcessing(true);
    
    try {
      // 1. E-Mail planen (verzögert oder sofort)
      await scheduleEmail(
        candidate.email,
        candidate.name || `${candidate.firstName} ${candidate.lastName}`,
        emailSubject,
        emailContent,
        customDelay ? delayDays : settings.delayedRejection.defaultDelay,
        candidate.id,
        'candidate'
      );
      
      // 2. Kandidatenstatus aktualisieren (sofort archivieren oder nicht)
      if (archiveImmediately) {
        await updateCandidate(candidate.id, {
          ...candidate,
          status: 'rejected'
        });
      }
      
      setSuccess(true);
      
      // Nach einer kurzen Verzögerung das Modal schließen
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
      
    } catch (error) {
      console.error('Fehler beim Absagen des Kandidaten:', error);
    } finally {
      setProcessing(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Kandidat absagen</DialogTitle>
          <DialogDescription>
            Kandidat {candidate.name || `${candidate.firstName} ${candidate.lastName}`} wird eine Absage erhalten.
          </DialogDescription>
        </DialogHeader>
        
        {success ? (
          <div className="py-6 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Absage erfolgreich geplant</h3>
            <p className="text-gray-500 text-center mt-2">
              {customDelay ? `Die Absage wird in ${delayDays} Tagen gesendet.` : 'Die Absage wurde geplant.'}
              {archiveImmediately && ' Der Kandidat wurde als "abgesagt" markiert.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 py-4">
              {error && (
                <div className="bg-red-50 p-3 rounded-md flex items-start gap-3 text-red-800">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="template" className="text-right">
                  Template
                </Label>
                <Select 
                  value={selectedTemplateId} 
                  onValueChange={setSelectedTemplateId}
                  disabled={isLoading || processing}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="E-Mail-Template auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subject" className="text-right">
                  Betreff
                </Label>
                <Input
                  id="subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="col-span-3"
                  disabled={isLoading || processing}
                />
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <Label htmlFor="content" className="text-right mt-2">
                  Inhalt
                </Label>
                <Textarea
                  id="content"
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  rows={8}
                  className="col-span-3"
                  disabled={isLoading || processing}
                />
              </div>
              
              <div className="flex items-center justify-between mt-2 border-t pt-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Verzögerte Absage</span>
                </div>
                
                <Switch
                  checked={customDelay}
                  onCheckedChange={setCustomDelay}
                  disabled={isLoading || processing}
                />
              </div>
              
              {customDelay && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="delayDays" className="text-right">
                    Verzögerung (Tage)
                  </Label>
                  <Input
                    id="delayDays"
                    type="number"
                    min={1}
                    max={30}
                    value={delayDays}
                    onChange={(e) => setDelayDays(parseInt(e.target.value) || 1)}
                    className="col-span-3"
                    disabled={isLoading || processing}
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between border-t pt-4">
                <div>
                  <Label htmlFor="archive" className="font-medium">
                    Sofort archivieren
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Wenn aktiviert, wird der Kandidat sofort als "abgesagt" markiert.
                  </p>
                </div>
                
                <Switch
                  id="archive"
                  checked={archiveImmediately}
                  onCheckedChange={setArchiveImmediately}
                  disabled={isLoading || processing}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={onClose}
                disabled={processing}
              >
                Abbrechen
              </Button>
              <Button 
                type="submit" 
                onClick={handleReject}
                disabled={isLoading || processing || !emailSubject || !emailContent}
              >
                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {processing ? 'Wird gesendet...' : 'Absagen'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CandidateRejectionModal;
