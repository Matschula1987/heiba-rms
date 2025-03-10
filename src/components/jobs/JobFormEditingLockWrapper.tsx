'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EditingLockGuard } from '@/components/ui/EditingLockGuard'
import { Job } from '@/types'
import { useNotificationStore } from '@/store/notificationStore'

interface JobFormEditingLockWrapperProps {
  jobId: string
  userId: string
  userName?: string
  children: React.ReactNode
  returnPath?: string
}

/**
 * Eine Wrapper-Komponente, die eine Bearbeitungssperre für einen Job verwaltet
 * und den Benutzer zurückleitet, wenn er keine Berechtigung zum Bearbeiten hat.
 * 
 * Verwenden Sie diese Komponente, um Job-Formulare zu umschließen:
 * 
 * ```jsx
 * <JobFormEditingLockWrapper jobId="job123" userId="user456">
 *   <JobFormModal job={job} onSave={handleSave} onCancel={handleCancel} />
 * </JobFormEditingLockWrapper>
 * ```
 */
export function JobFormEditingLockWrapper({
  jobId,
  userId,
  userName,
  children,
  returnPath = '/dashboard/jobs'
}: JobFormEditingLockWrapperProps) {
  const router = useRouter()
  const { createNotification } = useNotificationStore()
  const [isRedirecting, setIsRedirecting] = useState(false)
  
  // Wenn der Benutzer keine Berechtigung zum Bearbeiten hat, wird diese Funktion aufgerufen
  const handleLockFailed = async () => {
    // Verhindere mehrfache Weiterleitungen
    if (isRedirecting) return
    setIsRedirecting(true)
    
    // Benachrichtigung erstellen
    await createNotification({
      user_id: userId,
      title: 'Bearbeitung nicht möglich',
      message: `Die Stelle "${jobId}" wird bereits von einem anderen Benutzer bearbeitet.`,
      entity_type: 'job',
      entity_id: jobId,
      importance: 'normal'
    })
    
    // Zurück zur Job-Übersicht
    router.push(returnPath)
  }
  
  return (
    <EditingLockGuard
      entityType="job"
      entityId={jobId}
      userId={userId}
      userName={userName || `Benutzer ${userId}`}
      onLockFailed={handleLockFailed}
    >
      {children}
    </EditingLockGuard>
  )
}
