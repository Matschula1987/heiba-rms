import { NextRequest, NextResponse } from 'next/server';
import { MovidoAuthModule } from '@/lib/movidoAutomation/modules/MovidoAuthModule';

/**
 * POST Handler zum Testen der Movido-Verbindung
 * Testet die übergebene Konfiguration, ohne sie zu speichern
 */
export async function POST(request: NextRequest) {
  try {
    const { config } = await request.json();
    
    if (!config) {
      return NextResponse.json(
        { error: 'Keine Konfiguration angegeben' },
        { status: 400 }
      );
    }
    
    // Validieren der erforderlichen Felder
    if (!config.apiKey || !config.apiSecret || !config.companyId) {
      return NextResponse.json(
        { error: 'API-Schlüssel, API-Secret und Unternehmens-ID sind erforderlich' },
        { status: 400 }
      );
    }
    
    // Teste die Verbindung mit den übergebenen Zugangsdaten
    const authModule = new MovidoAuthModule();
    
    // Initialisiere das Modul mit den übergebenen Konfigurationen
    const testResult = await authModule.testConnection({
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
      companyId: config.companyId,
      autoLoginEnabled: config.autoLoginEnabled !== false,
      sessionTimeoutMinutes: config.sessionTimeoutMinutes || 120
    });
    
    if (testResult.success) {
      return NextResponse.json({
        success: true,
        message: 'Verbindung zu Movido erfolgreich hergestellt'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: testResult.errorMessage || 'Fehler bei der Verbindung zu Movido'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Fehler beim Testen der Movido-Verbindung:', error);
    
    // Formatiere die Fehlermeldung für eine bessere Benutzerfreundlichkeit
    let errorMessage = 'Fehler beim Testen der Verbindung zu Movido';
    
    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage
      },
      { status: 500 }
    );
  }
}
