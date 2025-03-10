'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRealtimeNotificationStore } from '@/store/realtimeNotificationStore';
import { Notification } from '@/types/notifications';
import { useClickOutside } from '@/lib/utils';

/**
 * NotificationBell Komponente
 * 
 * Zeigt eine Benachrichtigungsglocke mit einer Badge-Anzahl für ungelesene
 * Benachrichtigungen an. Ermöglicht das Anzeigen und Markieren von
 * Benachrichtigungen als gelesen.
 */
export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const {
    isConnected,
    unreadCount,
    notifications,
    markAsRead,
    markAllAsRead,
    getNotifications,
  } = useRealtimeNotificationStore();
  
  // Klick außerhalb des Dropdown-Menüs schließt es
  useClickOutside(dropdownRef, () => setIsOpen(false));
  
  // Benachrichtigungen laden, wenn das Dropdown-Menü geöffnet wird
  useEffect(() => {
    if (isOpen) {
      getNotifications();
    }
  }, [isOpen, getNotifications]);
  
  // Benachrichtigung als gelesen markieren
  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId);
  };
  
  // Alle Benachrichtigungen als gelesen markieren
  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };
  
  // Formatiert das Datum relativ zum aktuellen Zeitpunkt
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSeconds < 60) {
      return 'gerade eben';
    } else if (diffMinutes < 60) {
      return `vor ${diffMinutes} ${diffMinutes === 1 ? 'Minute' : 'Minuten'}`;
    } else if (diffHours < 24) {
      return `vor ${diffHours} ${diffHours === 1 ? 'Stunde' : 'Stunden'}`;
    } else {
      return `vor ${diffDays} ${diffDays === 1 ? 'Tag' : 'Tagen'}`;
    }
  };
  
  // Rendert die Prioritätsfarbe einer Benachrichtigung
  const getPriorityColor = (importance: string) => {
    switch (importance) {
      case 'high':
        return 'bg-red-500';
      case 'normal':
        return 'bg-blue-500';
      case 'low':
        return 'bg-gray-400';
      default:
        return 'bg-blue-500';
    }
  };
  
  // Rendert den Verbindungsstatus-Indikator
  const renderConnectionStatus = () => {
    return (
      <div 
        className={`w-2 h-2 rounded-full mr-1.5 ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}
        title={isConnected ? 'Verbunden' : 'Nicht verbunden'}
      />
    );
  };
  
  // Rendert eine einzelne Benachrichtigung
  const renderNotification = (notification: Notification) => {
    return (
      <div 
        key={notification.id}
        className={`py-3 px-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
          notification.read ? 'opacity-60' : ''
        }`}
        onClick={() => !notification.read && handleMarkAsRead(notification.id)}
      >
        <div className="flex items-start">
          {/* Prioritätsindikator */}
          <div className={`w-2 h-2 rounded-full mt-1.5 mr-2 ${getPriorityColor(notification.importance)}`} />
          
          {/* Inhalt */}
          <div className="flex-1">
            <h4 className="font-medium text-sm text-gray-900 mb-0.5">
              {notification.title}
            </h4>
            <p className="text-xs text-gray-600 line-clamp-2">
              {notification.message}
            </p>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-xs text-gray-500">
                {formatRelativeTime(notification.created_at)}
              </span>
              {!notification.read && (
                <button 
                  className="text-xs text-blue-600 hover:text-blue-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAsRead(notification.id);
                  }}
                >
                  Als gelesen markieren
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Benachrichtigungsglocke */}
      <button
        className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:text-[var(--primary-dark)] hover:bg-gray-100 relative transition-colors shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Benachrichtigungen"
      >
        <div className="flex items-center">
          {renderConnectionStatus()}
          <i className="fas fa-bell text-lg"></i>
        </div>
        
        {/* Ungelesene Benachrichtigungen Badge */}
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-[var(--accent)] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>
      
      {/* Dropdown-Menü */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg w-80 z-50 border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center py-3 px-4 bg-[var(--primary-dark)]/5 border-b border-gray-200">
            <h3 className="font-medium text-sm text-[var(--primary-dark)]">Benachrichtigungen</h3>
            {unreadCount > 0 && (
              <button
                className="text-xs text-[var(--primary-dark)] hover:text-[var(--primary-light)] transition-colors"
                onClick={handleMarkAllAsRead}
              >
                Alle als gelesen markieren
              </button>
            )}
          </div>
          
          {/* Liste der Benachrichtigungen */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-12 px-4 text-center text-sm text-gray-500">
                <i className="fas fa-inbox text-gray-300 text-3xl mb-3"></i>
                <p>Keine Benachrichtigungen vorhanden</p>
              </div>
            ) : (
              notifications.map(renderNotification)
            )}
          </div>
          
          {/* Footer */}
          <div className="py-3 px-4 bg-[var(--primary-dark)]/5 border-t border-gray-200 text-center">
            <button
              className="text-xs text-[var(--primary-dark)] hover:text-[var(--primary-light)] font-medium transition-colors"
              onClick={() => window.location.href = '/dashboard/notifications'}
            >
              Alle Benachrichtigungen anzeigen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
