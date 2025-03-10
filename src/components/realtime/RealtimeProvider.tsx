'use client';

import React, { useEffect } from 'react';
import { useRealtimeNotificationStore } from '@/store/realtimeNotificationStore';

interface RealtimeProviderProps {
  children: React.ReactNode;
}

/**
 * RealtimeProvider
 * 
 * Diese Komponente initialisiert die Echtzeit-Verbindung für Benachrichtigungen
 * und stellt sie über den gesamten Dashboard-Bereich zur Verfügung.
 * 
 * Sie sorgt dafür, dass die Socket.io-Verbindung automatisch hergestellt und
 * verwaltet wird, sodass Benutzer Echtzeit-Benachrichtigungen erhalten können.
 */
export const RealtimeProvider: React.FC<RealtimeProviderProps> = ({ children }) => {
  const { connect, disconnect, getNotifications } = useRealtimeNotificationStore();
  
  useEffect(() => {
    // In einer echten Anwendung würde man die userId aus der Session/Auth holen
    const userId = '1'; // Beispiel-User-ID
    
    // Echtzeit-Verbindung herstellen
    connect(userId);
    
    // Initial Benachrichtigungen laden
    getNotifications();
    
    // Aufräumen bei Unmount (z.B. beim Verlassen des Dashboards)
    return () => {
      disconnect();
    };
  }, [connect, disconnect, getNotifications]);
  
  // Keine UI-Komponente, nur Kontext-Provider
  return <>{children}</>;
};
