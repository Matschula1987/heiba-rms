import { NextRequest, NextResponse } from 'next/server';
import { talent360Integration } from '@/lib/talent360Integration';
import { TalentPoolService } from '@/lib/talentPoolService';

// Status der letzten Synchronisierung speichern (in einer echten Implementierung 
// würde dies in einer Datenbank gespeichert werden)
let lastSyncStatus = {
  lastRun: null as Date | null,
  success: false,
  applications: {
    total: 0,
    imported: 0,
    error: 0
  },
  jobs: {
    total: 0,
    imported: 0,
    error: 0
  },
  error: null as string | null
};

/**
 * GET /api/talent360/sync
 * Status der letzten Synchronisierung abrufen
 */
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(lastSyncStatus);
  } catch (error: any) {
    console.error('Fehler beim Abrufen des Synchronisierungsstatus:', error);
    return NextResponse.json(
      { error: error.message || 'Unbekannter Fehler' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/talent360/sync
 * Manuelle Synchronisierung von Talent360-Daten starten
 */
export async function POST(request: NextRequest) {
  try {
    // Prüfen, ob API-Key konfiguriert ist
    const apiKey = process.env.TALENT360_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Talent360 API-Key nicht konfiguriert' },
        { status: 400 }
      );
    }

    // Initialisieren der Status-Variablen
    const syncResult = {
      startTime: new Date(),
      applications: {
        total: 0,
        imported: 0,
        error: 0
      },
      jobs: {
        total: 0,
        imported: 0,
        error: 0
      },
      success: false,
      error: null as string | null
    };

    // Sicherstellen, dass die Talent-Pool-Tabellen existieren
    await TalentPoolService.initTalentPoolTables();

    // Request-Body für benutzerdefinierte Synchronisierungsparameter
    const body = await request.json().catch(() => ({}));
    const syncType = body.syncType || 'all'; // 'all', 'applications', 'jobs'

    try {
      // Bewerbungen synchronisieren, wenn gewünscht
      if (syncType === 'all' || syncType === 'applications') {
        const applications = await talent360Integration.syncApplications();
        syncResult.applications.total = applications.length;
        syncResult.applications.imported = applications.length;

        // In einer vollständigen Implementierung würden wir hier die Bewerbungen 
        // in der Datenbank speichern und zum Talent-Pool hinzufügen
        for (const application of applications) {
          try {
            // Hier würde die Logik zum Speichern und Konvertieren der Bewerbung stehen
            // Beispiel: 
            // await TalentPoolService.addToTalentPool({
            //   entity_id: application.id,
            //   entity_type: 'application',
            //   added_by: 'talent360-sync',
            //   reason: 'Automatische Synchronisierung von Talent360'
            // });
          } catch (error) {
            syncResult.applications.error++;
            console.error('Fehler beim Importieren einer Bewerbung:', error);
          }
        }
      }

      // Jobs synchronisieren, wenn gewünscht
      if (syncType === 'all' || syncType === 'jobs') {
        const jobs = await talent360Integration.syncJobs();
        syncResult.jobs.total = jobs.length;
        syncResult.jobs.imported = jobs.length;

        // In einer vollständigen Implementierung würden wir hier die Jobs 
        // in der Datenbank speichern
        for (const job of jobs) {
          try {
            // Hier würde die Logik zum Speichern des Jobs stehen
          } catch (error) {
            syncResult.jobs.error++;
            console.error('Fehler beim Importieren eines Jobs:', error);
          }
        }
      }

      // Synchronisierung war erfolgreich
      syncResult.success = true;
    } catch (error: any) {
      syncResult.success = false;
      syncResult.error = error.message || 'Unbekannter Fehler bei der Synchronisierung';
      console.error('Fehler bei der Talent360-Synchronisierung:', error);
    }

    // Status der letzten Synchronisierung aktualisieren
    lastSyncStatus = {
      lastRun: syncResult.startTime,
      success: syncResult.success,
      applications: syncResult.applications,
      jobs: syncResult.jobs,
      error: syncResult.error
    };

    return NextResponse.json({
      status: syncResult.success ? 'success' : 'error',
      message: syncResult.success ? 'Synchronisierung erfolgreich' : 'Fehler bei der Synchronisierung',
      syncResult
    });
  } catch (error: any) {
    console.error('Fehler bei der Talent360-Synchronisierung:', error);
    return NextResponse.json(
      { error: error.message || 'Unbekannter Fehler' },
      { status: 500 }
    );
  }
}
