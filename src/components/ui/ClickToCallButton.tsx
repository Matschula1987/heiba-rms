import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface ClickToCallButtonProps {
  phoneNumber: string;
  displayName?: string;
  userId: string;
  candidateId?: string;
  applicationId?: string;
  jobId?: string;
  talentPoolId?: string;
  createAssignment?: boolean;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function ClickToCallButton({
  phoneNumber,
  displayName,
  userId,
  candidateId,
  applicationId,
  jobId,
  talentPoolId,
  createAssignment = true,
  variant = 'outline',
  size = 'sm',
  className
}: ClickToCallButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const formatPhoneNumber = (phone: string): string => {
    // Entferne alles außer Zahlen
    const cleaned = phone.replace(/\D/g, '');
    
    // Formatierung für deutsche Telefonnummern
    if (cleaned.startsWith('49') && cleaned.length > 2) {
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
    }
    // Füge '+49' hinzu, wenn es mit '0' beginnt (typisch für deutsche Nummern)
    else if (cleaned.startsWith('0') && cleaned.length > 1) {
      return `+49 ${cleaned.slice(1)}`;
    }
    // Füge '+' hinzu, wenn es mit einer Zahl beginnt
    else if (/^\d+$/.test(cleaned) && !cleaned.startsWith('+')) {
      return `+${cleaned}`;
    }
    
    return phone;
  };

  const handleClick = async () => {
    if (!phoneNumber || !userId) {
      toast.error('Telefonnummer oder Benutzer-ID fehlt');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/phone-integration/click-to-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          phoneNumber,
          displayName,
          candidateId,
          applicationId,
          jobId,
          talentPoolId,
          createAssignment
        })
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Anruf konnte nicht initiiert werden');
      }
      
      toast.success('Anruf wird initiiert');
      
      // Aktualisiere die Ansicht, um die neue Aktivität anzuzeigen
      router.refresh();
    } catch (error) {
      console.error('Fehler beim Initiieren des Anrufs:', error);
      toast.error('Anruf konnte nicht initiiert werden');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isLoading}
      className={className}
      title={`Anrufen: ${phoneNumber} (${displayName || 'Unbekannt'})`}
    >
      <Phone className="h-4 w-4 mr-2" />
      {size !== 'icon' && formatPhoneNumber(phoneNumber)}
    </Button>
  );
}
