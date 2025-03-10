/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');

const nextConfig = {
  // Internationalisierungskonfiguration
  i18n,

  // Nur die notwendige Konfiguration für SQLite
  webpack: (config, { isServer }) => {
    // Behalten Sie die bestehende Konfiguration bei
    const existingConfig = { ...config };
    
    // Fügen Sie nur die notwendigen Fallbacks für SQLite hinzu
    if (!isServer) {
      existingConfig.resolve.fallback = {
        ...existingConfig.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }
    
    return existingConfig;
  },
};

module.exports = nextConfig;
