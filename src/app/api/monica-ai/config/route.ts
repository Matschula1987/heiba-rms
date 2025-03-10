import { NextRequest, NextResponse } from 'next/server';
import { loadMonicaAIConfig, saveMonicaAIConfig } from '../helpers';
import { getMonicaAIService } from '@/lib/monicaAI/MonicaAIService';

/**
 * GET /api/monica-ai/config
 * Gibt die aktuelle Monica AI-Konfiguration zurück
 */
export async function GET() {
  try {
    const config = await loadMonicaAIConfig();
    
    // API-Schlüssel für die Ausgabe maskieren
    const safeConfig = { ...config };
    if (safeConfig.apiKey) {
      safeConfig.apiKey = safeConfig.apiKey.substring(0, 4) + '...' + 
        safeConfig.apiKey.substring(safeConfig.apiKey.length - 4);
    }
    
    // Service-Status hinzufügen
    const service = getMonicaAIService();
    const isConfigured = service.isConfigured();
    
    return NextResponse.json({
      config: safeConfig,
      status: {
        isConfigured,
        message: isConfigured ? 'Monica AI ist konfiguriert' : 'API-Schlüssel fehlt'
      }
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Monica AI-Konfiguration:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Konfiguration' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/monica-ai/config
 * Aktualisiert die Monica AI-Konfiguration
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Aktuelle Konfiguration laden
    const currentConfig = await loadMonicaAIConfig();
    
    // Konfiguration aktualisieren
    const updatedConfig = {
      ...currentConfig,
      ...data
    };
    
    // Konfiguration speichern
    await saveMonicaAIConfig(updatedConfig);
    
    // Service-Status prüfen
    const service = getMonicaAIService();
    const isConfigured = service.isConfigured();
    
    return NextResponse.json({
      success: true,
      message: 'Monica AI-Konfiguration erfolgreich aktualisiert',
      status: {
        isConfigured,
        message: isConfigured ? 'Monica AI ist konfiguriert' : 'API-Schlüssel fehlt'
      }
    });
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Monica AI-Konfiguration:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Konfiguration' },
      { status: 500 }
    );
  }
}
