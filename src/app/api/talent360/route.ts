import { NextRequest, NextResponse } from 'next/server';
import { talent360Integration } from '@/lib/talent360Integration';

/**
 * GET /api/talent360
 * Status und Konfiguration der Talent360-Integration abrufen
 */
export async function GET(request: NextRequest) {
  try {
    // Prüfen ob Authentifizierung korrekt eingerichtet ist
    const apiKey = process.env.TALENT360_API_KEY;
    const webhookSecret = process.env.TALENT360_WEBHOOK_SECRET;

    return NextResponse.json({
      status: 'ok',
      configured: !!apiKey,
      webhookConfigured: !!webhookSecret,
      apiUrl: process.env.TALENT360_API_URL || 'https://api.talent360.de/v1'
    });
  } catch (error: any) {
    console.error('Fehler beim Abrufen der Talent360-Konfiguration:', error);
    return NextResponse.json(
      { error: error.message || 'Unbekannter Fehler' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/talent360
 * Konfiguration der Talent360-Integration aktualisieren
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // In einer vollständigen Implementierung würden hier die
    // Konfigurationsdaten in der Datenbank gespeichert werden.
    // Für den Prototyp geben wir einfach die empfangenen Daten zurück.
    
    // Validierung der wichtigsten Konfigurationsdaten
    if (!body.apiKey) {
      return NextResponse.json(
        { error: 'API-Key ist erforderlich' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      status: 'ok',
      message: 'Konfiguration aktualisiert',
      config: {
        apiKey: body.apiKey ? '[HIDDEN]' : undefined,
        webhookSecret: body.webhookSecret ? '[HIDDEN]' : undefined,
        apiUrl: body.apiUrl || 'https://api.talent360.de/v1'
      }
    });
  } catch (error: any) {
    console.error('Fehler beim Aktualisieren der Talent360-Konfiguration:', error);
    return NextResponse.json(
      { error: error.message || 'Unbekannter Fehler' },
      { status: 500 }
    );
  }
}
