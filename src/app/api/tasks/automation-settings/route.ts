import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

/**
 * GET /api/tasks/automation-settings - Automatisierungseinstellungen abrufen
 */
export async function GET() {
  try {
    const db = await getDb();
    
    // Einstellungen aus der Datenbank abrufen
    // Im Moment simulieren wir diese mit Default-Werten
    // TODO: Tatsächliche Datenbankabfrage implementieren
    
    const settings = {
      jobExpiryCheck: {
        enabled: true,
        daysThreshold: 5,
        description: 'Aufgaben für ablaufende Stellenanzeigen erstellen'
      },
      candidateContactCheck: {
        enabled: true,
        daysThreshold: 60,
        description: 'Aufgaben für Kandidaten erstellen, die lange nicht kontaktiert wurden'
      },
      customerContactCheck: {
        enabled: true,
        daysThreshold: 90,
        description: 'Aufgaben für Kunden erstellen, die lange nicht kontaktiert wurden'
      },
      prospectContactCheck: {
        enabled: true,
        daysThreshold: 60,
        description: 'Aufgaben für Interessenten erstellen, die lange nicht kontaktiert wurden'
      },
      reminderNotifications: {
        enabled: true,
        daysThreshold: 1,
        description: 'Erinnerungen für bevorstehende Aufgaben senden'
      },
      autoGenerateEnabled: true,
      autoGenerateFrequency: 24, // Täglich
      lastAutoGeneration: null
    };
    
    return NextResponse.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Automatisierungseinstellungen:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Fehler beim Abrufen der Automatisierungseinstellungen',
        details: error instanceof Error ? error.message : 'Unbekannter Fehler'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tasks/automation-settings - Automatisierungseinstellungen speichern
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const db = await getDb();
    
    // Einstellungen validieren
    if (!data.jobExpiryCheck || !data.candidateContactCheck || 
        !data.customerContactCheck || !data.prospectContactCheck || 
        !data.reminderNotifications || data.autoGenerateFrequency === undefined) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unvollständige Einstellungen' 
        },
        { status: 400 }
      );
    }
    
    // Hier würden wir die Einstellungen in der Datenbank speichern
    // TODO: Implementieren der tatsächlichen Datenbankoperationen
    
    // Erfolgsantwort
    return NextResponse.json({
      success: true,
      message: 'Automatisierungseinstellungen gespeichert'
    });
  } catch (error) {
    console.error('Fehler beim Speichern der Automatisierungseinstellungen:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Fehler beim Speichern der Automatisierungseinstellungen',
        details: error instanceof Error ? error.message : 'Unbekannter Fehler'
      },
      { status: 500 }
    );
  }
}
