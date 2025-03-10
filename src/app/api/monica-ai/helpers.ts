import { MonicaAIConfig } from '@/types/monicaAI';
import { getMonicaAIService } from '@/lib/monicaAI/MonicaAIService';
import * as fs from 'fs/promises';
import path from 'path';

// Pfad zur Konfigurationsdatei
const CONFIG_PATH = process.env.MONICA_CONFIG_PATH || './monica-ai-config.json';

/**
 * Lädt die Monica AI-Konfiguration
 * @returns Promise mit der Konfiguration
 */
export async function loadMonicaAIConfig(): Promise<MonicaAIConfig> {
  try {
    // In einer echten Implementierung würde die Konfiguration aus einer Datenbank geladen werden
    // Für Demonstrationszwecke verwenden wir eine Datei
    try {
      const configData = await fs.readFile(CONFIG_PATH, 'utf-8');
      const config = JSON.parse(configData) as MonicaAIConfig;
      return config;
    } catch (error) {
      // Wenn die Datei nicht existiert oder ungültig ist, Standardkonfiguration zurückgeben
      console.warn('Keine gültige Monica AI-Konfiguration gefunden, verwende Standardkonfiguration');
      
      // Standardkonfiguration
      return {
        apiKey: '',
        apiEndpoint: 'https://api.monica-ai.com/v1',
        language: 'de'
      };
    }
  } catch (error) {
    console.error('Fehler beim Laden der Monica AI-Konfiguration:', error);
    throw error;
  }
}

/**
 * Speichert die Monica AI-Konfiguration
 * @param config Konfiguration
 * @returns Promise
 */
export async function saveMonicaAIConfig(config: MonicaAIConfig): Promise<void> {
  try {
    // In einer echten Implementierung würde die Konfiguration in einer Datenbank gespeichert werden
    // Für Demonstrationszwecke verwenden wir eine Datei
    try {
      const configDir = path.dirname(CONFIG_PATH);
      await fs.mkdir(configDir, { recursive: true });
      await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
      
      // MonicaAIService mit der neuen Konfiguration aktualisieren
      getMonicaAIService(config);
    } catch (error) {
      console.error('Fehler beim Speichern der Monica AI-Konfiguration:', error);
      throw error;
    }
  } catch (error) {
    console.error('Fehler beim Speichern der Monica AI-Konfiguration:', error);
    throw error;
  }
}

/**
 * Initialisiert den Monica AI-Service mit der gespeicherten Konfiguration
 * @returns Promise mit dem initialisierten Service
 */
export async function initializeMonicaAIService() {
  try {
    const config = await loadMonicaAIConfig();
    return getMonicaAIService(config);
  } catch (error) {
    console.error('Fehler beim Initialisieren des Monica AI-Service:', error);
    // Fallback auf Standardkonfiguration
    return getMonicaAIService();
  }
}
