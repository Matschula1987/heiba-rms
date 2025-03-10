'use client';

import { Inter } from 'next/font/google'
import './globals.css'
import { useEffect, useState } from 'react'
import { initI18n } from '@/lib/i18n'
import { I18nextProvider } from 'react-i18next'
import i18next from 'i18next'

// Die Datenbankinitialisierung wurde nach src/app/api/initDb.ts verschoben,
// um den "Server Functions cannot be called during initial render"-Fehler zu vermeiden

const inter = Inter({ subsets: ['latin'] })

// Metadata wurde nach src/app/metadata.ts verschoben, um den
// 'use client' Konflikt zu vermeiden

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // State für i18next Instance
  const [i18n, setI18n] = useState<typeof i18next | null>(null);
  
  // Initialisiere i18n beim ersten Laden
  useEffect(() => {
    const initializeI18n = async () => {
      try {
        // Lade gespeicherte Sprache aus localStorage, wenn verfügbar
        let savedLanguage = 'de'; // Standard ist Deutsch
        
        if (typeof window !== 'undefined') {
          const storedLang = localStorage.getItem('i18nextLng');
          if (storedLang) {
            savedLanguage = storedLang;
          }
        }
        
        // Initialisiere i18n mit der gespeicherten oder Standard-Sprache
        const i18nInstance = await initI18n(savedLanguage);
        setI18n(i18nInstance);
      } catch (error) {
        console.error('Fehler beim Initialisieren von i18n:', error);
      }
    };
    
    initializeI18n();
  }, []);

  // Rendere App erst, wenn i18n initialisiert ist
  if (!i18n) {
    // Einfacher Lade-Indikator
    return (
      <html lang="de" className="h-full w-full">
        <body className={`${inter.className} min-h-screen w-full m-0 p-0 flex items-center justify-center`}>
          <div className="loading-spinner"></div>
        </body>
      </html>
    );
  }
  
  return (
    <html lang={i18n.language} className="h-full w-full">
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" 
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" 
          crossOrigin="anonymous" 
          referrerPolicy="no-referrer" 
        />
      </head>
      <body className={`${inter.className} min-h-screen w-full m-0 p-0`}>
        <I18nextProvider i18n={i18n}>
          <main className="min-h-screen w-full">
            {children}
          </main>
        </I18nextProvider>
      </body>
    </html>
  )
}
