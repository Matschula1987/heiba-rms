'use client'

import { useEffect, useState } from 'react'
import { EditingLock } from '@/lib/editingLockService'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertCircle, Lock, UserCheck, User, Clock } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'

interface EditingLockGuardProps {
  entityId: string;
  entityType: string;
  userId: string;
  userName: string;
  onLockAcquired?: () => void;
  onLockFailed?: () => void;
  children: React.ReactNode;
}

export function EditingLockGuard({
  entityId,
  entityType,
  userId,
  userName,
  onLockAcquired,
  onLockFailed,
  children
}: EditingLockGuardProps) {
  const [lock, setLock] = useState<EditingLock | null>(null)
  const [isLocked, setIsLocked] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [lockAcquired, setLockAcquired] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  
  // Prüft und erstellt/verlängert eine Sperre
  const acquireLock = async () => {
    try {
      const response = await fetch('/api/editing-locks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          entity_id: entityId,
          entity_type: entityType,
          user_id: userId,
          user_name: userName,
          duration_minutes: 15 // 15 Minuten
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setLock(data.lock);
        setLockAcquired(data.canEdit);
        
        if (data.canEdit && onLockAcquired) {
          onLockAcquired();
        }
        
        return data.canEdit;
      } else {
        setError(data.error || 'Fehler beim Erstellen der Bearbeitungssperre');
        setLock(data.lock);
        setLockAcquired(false);
        
        if (onLockFailed) {
          onLockFailed();
        }
        
        return false;
      }
    } catch (error) {
      setError('Fehler beim Kontakt mit dem Server');
      setLockAcquired(false);
      
      if (onLockFailed) {
        onLockFailed();
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Verlängert eine bestehende Sperre
  const extendLock = async () => {
    if (!lock || !lock.id) return;
    
    try {
      const response = await fetch('/api/editing-locks', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: lock.id,
          duration_minutes: 15 // 15 Minuten
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setLock(data.lock);
      } else {
        console.error('Fehler beim Verlängern der Sperre:', data.error);
      }
    } catch (error) {
      console.error('Fehler beim Kontakt mit dem Server:', error);
    }
  };
  
  // Gibt eine Sperre frei
  const releaseLock = async () => {
    if (!lock || !userId) return;
    
    try {
      const response = await fetch(`/api/editing-locks?entity_id=${entityId}&entity_type=${entityType}&user_id=${userId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setLock(null);
        setLockAcquired(false);
      } else {
        console.error('Fehler beim Freigeben der Sperre:', data.error);
      }
    } catch (error) {
      console.error('Fehler beim Kontakt mit dem Server:', error);
    }
  };
  
  // Prüft, ob eine Sperre existiert und erstellt ggf. eine neue
  useEffect(() => {
    const checkLock = async () => {
      try {
        const response = await fetch(`/api/editing-locks?entity_id=${entityId}&entity_type=${entityType}`);
        const data = await response.json();
        
        if (response.ok && data.success) {
          const existingLock = data.lock;
          
          // Keine vorhandene Sperre, versuche eine neue zu erstellen
          if (!existingLock) {
            await acquireLock();
          } 
          // Eine vorhandene Sperre, die nicht dem aktuellen Benutzer gehört
          else if (existingLock.userId !== userId) {
            setLock(existingLock);
            setIsLocked(true);
            setLockAcquired(false);
            setIsLoading(false);
            
            if (onLockFailed) {
              onLockFailed();
            }
          } 
          // Eine vorhandene Sperre, die dem aktuellen Benutzer gehört
          else {
            setLock(existingLock);
            setLockAcquired(true);
            setIsLoading(false);
            
            if (onLockAcquired) {
              onLockAcquired();
            }
          }
        } else {
          setError(data.error || 'Fehler beim Abrufen der Sperre');
          setIsLoading(false);
        }
      } catch (error) {
        setError('Fehler beim Kontakt mit dem Server');
        setIsLoading(false);
      }
    };
    
    checkLock();
    
    // Cleanup-Funktion, die die Sperre freigibt
    return () => {
      releaseLock();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityId, entityType, userId]);
  
  // Verlängert die Sperre alle 5 Minuten
  useEffect(() => {
    if (!lockAcquired || !lock) return;
    
    const intervalId = setInterval(() => {
      extendLock();
    }, 5 * 60 * 1000); // Alle 5 Minuten
    
    return () => {
      clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockAcquired, lock]);
  
  // Render-Funktion
  if (isLoading) {
    // Lade-Anzeige
    return (
      <div className="flex justify-center items-center p-6">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-heiba-blue"></div>
        <span className="ml-2">Prüfe Bearbeitungsstatus...</span>
      </div>
    );
  }
  
  // Fehleranzeige
  if (error && !isLocked) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
        <div className="mt-2">
          <Button onClick={() => window.location.reload()} size="sm" variant="outline">
            Erneut versuchen
          </Button>
        </div>
      </div>
    );
  }
  
  // Dialog, wenn die Entität gesperrt ist
  return (
    <>
      {/* Dialog, wenn die Entität gesperrt ist */}
      <Dialog open={isLocked} onOpenChange={setIsLocked}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-heiba-red">
              <Lock className="h-5 w-5 mr-2" />
              Diese Entität wird bereits bearbeitet
            </DialogTitle>
          </DialogHeader>
          
          {lock && (
            <div className="py-4 space-y-4">
              <div className="flex items-center">
                <UserCheck className="h-5 w-5 mr-2 text-gray-600" />
                <span>Bearbeitet von <strong>{lock.userName}</strong></span>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-gray-600" />
                <span>
                  Begonnen: {format(new Date(lock.lockedAt), 'HH:mm:ss')} Uhr
                  ({formatDistanceToNow(new Date(lock.lockedAt), { locale: de, addSuffix: true })})
                </span>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-gray-600" />
                <span>
                  Gültig bis: {format(new Date(lock.expiresAt), 'HH:mm:ss')} Uhr 
                  ({formatDistanceToNow(new Date(lock.expiresAt), { locale: de, addSuffix: true })})
                </span>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-sm text-amber-700">
                Bitte versuchen Sie es später erneut oder kontaktieren Sie den Benutzer, 
                der diese Entität gerade bearbeitet.
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => window.location.reload()}>
              Aktualisieren
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Nur die Kinder anzeigen, wenn die Sperre erworben wurde */}
      {lockAcquired && children}
    </>
  );
}
