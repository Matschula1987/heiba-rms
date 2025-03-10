/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: 'de',
    locales: ['de', 'en', 'ru', 'uk', 'fr'],
    localeDetection: false
  },
  fallbackLng: {
    default: ['de'],
    'en': ['de'],
    'ru': ['en', 'de'],
    'uk': ['ru', 'en', 'de'],
    'fr': ['en', 'de'],
  },
  debug: process.env.NODE_ENV === 'development',
  load: 'languageOnly',
  detection: {
    order: ['cookie', 'localStorage', 'navigator', 'path', 'htmlTag'],
    lookupCookie: 'NEXT_LOCALE',
    lookupLocalStorage: 'i18nextLng',
    caches: ['localStorage', 'cookie'],
  }
};
