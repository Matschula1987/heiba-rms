import { useEffect, useState } from 'react';
import i18next from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import { usePathname } from 'next/navigation';
import { getI18n } from 'react-i18next';

// Initialisierungsfunktion für i18n
export const initI18n = async (locale?: string) => {
  // Standardsprache, wenn keine angegeben ist
  const defaultLocale = locale || 'de';
  
  // Dynamisches Laden der Übersetzungen für die aktuelle Sprache
  const loadTranslations = async (lng: string) => {
    try {
      // Laden der Übersetzungen über fetch statt import
      const response = await fetch(`/locales/${lng}/common.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const translations = await response.json();
      return {
        common: translations
      };
    } catch (error) {
      console.error(`Fehler beim Laden der Übersetzungen für ${lng}:`, error);
      // Fallback auf leere Übersetzungen
      return {
        common: {}
      };
    }
  };
  
  // Laden der aktuellen Übersetzungen
  const resources = {
    [defaultLocale]: await loadTranslations(defaultLocale)
  };
  
  // Initialisierung von i18next
  await i18next
    .use(initReactI18next)
    .init({
      resources,
      lng: defaultLocale,
      fallbackLng: 'de',
      interpolation: {
        escapeValue: false
      },
      defaultNS: 'common',
      fallbackNS: 'common',
    });
    
  return i18next;
};

// Hook zum Ändern der Sprache
export const useLanguageChange = () => {
  const { i18n } = useTranslation();
  const pathname = usePathname();
  
  // Aktuelle Sprache und Liste der verfügbaren Sprachen
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const availableLanguages = ['de', 'en', 'ru', 'uk', 'fr', 'lv'];
  
  // Funktion zum Ändern der Sprache
  const changeLanguage = async (lng: string) => {
    if (!availableLanguages.includes(lng)) {
      console.error(`Sprache '${lng}' wird nicht unterstützt.`);
      return;
    }
    
    // Laden der neuen Sprachdateien, wenn noch nicht geladen
    if (!i18n.hasResourceBundle(lng, 'common')) {
      try {
        const response = await fetch(`/locales/${lng}/common.json`);
        if (response.ok) {
          const translations = await response.json();
          i18n.addResourceBundle(lng, 'common', translations);
        } else {
          console.error(`Konnte Sprachdatei für ${lng} nicht laden`);
        }
      } catch (error) {
        console.error(`Fehler beim Laden der Übersetzungen für ${lng}:`, error);
      }
    }
    
    // Sprache wechseln
    await i18n.changeLanguage(lng);
    
    // Sprache im localStorage speichern
    localStorage.setItem('i18nextLng', lng);
    
    // Aktuellen State aktualisieren
    setCurrentLanguage(lng);
    
    // Mit dem App Router ist es nicht mehr notwendig, die URL zu aktualisieren,
    // da Next.js die Navigation und Lokalisierung automatisch verwaltet
  };
  
  // Effekt zum Laden der gespeicherten Sprache beim Start
  useEffect(() => {
    const savedLanguage = localStorage.getItem('i18nextLng');
    if (savedLanguage && savedLanguage !== currentLanguage) {
      changeLanguage(savedLanguage);
    }
  }, []);
  
  return {
    currentLanguage,
    availableLanguages,
    changeLanguage
  };
};

// Hilfsfunktion, um eine Übersetzung zu bekommen, ohne den Hook zu verwenden
export const getTranslation = (key: string, options?: any) => {
  const i18n = getI18n();
  return i18n ? i18n.t(key, options) : key;
};
