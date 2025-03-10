'use client'

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogPrimitive
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface ConvertToCandidateModalProps {
  open: boolean;
  onClose: () => void;
  applicationId: string;
  applicationName: string;
  onSuccess: (candidateId: string) => void;
}

export default function ConvertToCandidateModal({
  open,
  onClose,
  applicationId,
  applicationName,
  onSuccess
}: ConvertToCandidateModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Optionen für die Konvertierung
  const [useAutoProfile, setUseAutoProfile] = useState(true);
  const [addToTalentPool, setAddToTalentPool] = useState(true);
  const [generateProfile, setGenerateProfile] = useState(true);
  const [sendEmailToCustomers, setSendEmailToCustomers] = useState(false);
  const [sendEmailToPortals, setSendEmailToPortals] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  
  // Konvertierungsergebnisse
  const [result, setResult] = useState<{
    candidateId?: string;
    talentPoolId?: string;
    profileDocumentId?: string;
    emailsSent?: number;
  } | null>(null);
  
  const handleConvert = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.post(`/api/applications/${applicationId}/convert-to-candidate`, {
        userId: 'user123', // TODO: Hier den tatsächlichen Benutzer einfügen
        useAutoProfile,
        addToTalentPool,
        generateProfile,
        sendEmailToCustomers,
        sendEmailToPortals,
        customMessage: customMessage.trim() || undefined
      });
      
      if (response.success) {
        setResult({
          candidateId: response.data.candidateId,
          talentPoolId: response.data.talentPoolId,
          profileDocumentId: response.data.profileDocumentId,
          emailsSent: response.data.emailsSent
        });
        
        if (onSuccess && response.data.candidateId) {
          onSuccess(response.data.candidateId);
        }
      } else {
        setError(response.error || 'Konvertierung fehlgeschlagen');
      }
    } catch (err) {
      console.error('Fehler bei der Konvertierung:', err);
      setError('Fehler bei der Konvertierung zum Kandidaten');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClose = () => {
    if (!isLoading) {
      setError(null);
      setResult(null);
      onClose();
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bewerber in Kandidat konvertieren</DialogTitle>
          <DialogDescription>
            {applicationName ? `"${applicationName}" in einen Kandidaten konvertieren` : 'Bewerber in einen Kandidaten umwandeln'}
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {result ? (
          <div className="py-4">
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
              <p className="text-green-700 font-medium">Konvertierung erfolgreich!</p>
              <p className="text-sm mt-1">Der Bewerber wurde erfolgreich in einen Kandidaten konvertiert.</p>
            </div>
            
            <div className="space-y-2 text-sm">
              {result.talentPoolId && (
                <p>✓ Der Kandidat wurde zum Talent-Pool hinzugefügt.</p>
              )}
              
              {result.profileDocumentId && (
                <p>✓ Ein Qualifikationsprofil wurde erstellt.</p>
              )}
              
              {result.emailsSent && result.emailsSent > 0 && (
                <p>✓ Das Profil wurde an {result.emailsSent} Empfänger gesendet.</p>
              )}
            </div>
            
            <div className="mt-6 flex justify-between">
              <Button 
                variant="outline" 
                onClick={handleClose}
              >
                Schließen
              </Button>
              
              {result.candidateId && (
                <Button
                  onClick={() => {
                    window.location.href = `/dashboard/candidates/${result.candidateId}`;
                  }}
                >
                  Zum Kandidaten
                </Button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="py-4 space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="use-auto-profile" 
                  checked={useAutoProfile}
                  onCheckedChange={(checked) => setUseAutoProfile(checked === true)}
                />
                <Label htmlFor="use-auto-profile" className="font-medium">
                  Automatisierte Verarbeitung verwenden
                </Label>
              </div>
              
              {useAutoProfile && (
                <div className="ml-6 space-y-3 border-l-2 border-gray-200 pl-4 pt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="add-to-talent-pool" 
                      checked={addToTalentPool}
                      onCheckedChange={(checked) => setAddToTalentPool(checked === true)}
                    />
                    <Label htmlFor="add-to-talent-pool">
                      Zum Talent-Pool hinzufügen
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="generate-profile" 
                      checked={generateProfile}
                      onCheckedChange={(checked) => setGenerateProfile(checked === true)}
                    />
                    <Label htmlFor="generate-profile">
                      Qualifikationsprofil erstellen
                    </Label>
                  </div>
                  
                  {generateProfile && (
                    <div className="ml-6 space-y-3 border-l-2 border-gray-200 pl-4 pt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="send-to-customers" 
                          checked={sendEmailToCustomers}
                          onCheckedChange={(checked) => setSendEmailToCustomers(checked === true)}
                        />
                        <Label htmlFor="send-to-customers">
                          An Kunden senden
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="send-to-portals" 
                          checked={sendEmailToPortals}
                          onCheckedChange={(checked) => setSendEmailToPortals(checked === true)}
                        />
                        <Label htmlFor="send-to-portals">
                          An Portale senden
                        </Label>
                      </div>
                      
                      {(sendEmailToCustomers || sendEmailToPortals) && (
                        <div className="pt-2">
                          <Label htmlFor="custom-message">Zusätzliche Nachricht (optional)</Label>
                          <Textarea
                            id="custom-message"
                            placeholder="Ihre persönliche Nachricht zur E-Mail hinzufügen..."
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <DialogFooter>
              <DialogPrimitive.Close asChild>
                <Button type="button" variant="outline" disabled={isLoading}>
                  Abbrechen
                </Button>
              </DialogPrimitive.Close>
              <Button 
                onClick={handleConvert}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Wird konvertiert...
                  </>
                ) : (
                  'Konvertieren'
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
