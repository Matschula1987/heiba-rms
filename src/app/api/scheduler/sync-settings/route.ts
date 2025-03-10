import { NextResponse } from 'next/server';
import { syncSettingsService } from '@/lib/scheduler/SyncSettingsService';
import { EntityType, IntervalType, IntervalUnit, SyncConfig } from '@/types/scheduler';

/**
 * API-Endpunkt für die Synchronisationseinstellungen
 * Ermöglicht die Verwaltung von Synchronisationsintervallen für verschiedene Entitäten
 */

// GET /api/scheduler/sync-settings - Holt alle Synchronisationseinstellungen
// GET /api/scheduler/sync-settings?entityType=job_portal&entityId=indeed - Holt die Einstellungen für eine bestimmte Entität
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType') as EntityType | null;
    const entityId = searchParams.get('entityId');
    const enabledParam = searchParams.get('enabled');
    
    // Wenn sowohl entityType als auch entityId vorhanden sind, holen wir die spezifischen Einstellungen
    if (entityType && entityId) {
      const settings = await syncSettingsService.getSyncSettings(entityType, entityId);
      
      if (!settings) {
        return NextResponse.json(
          { error: 'Synchronisationseinstellungen nicht gefunden' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ settings });
    } 
    
    // Andernfalls holen wir alle Einstellungen mit optionalem Filterung
    const enabled = enabledParam === 'true' ? true : 
                   enabledParam === 'false' ? false : undefined;
    
    const allSettings = await syncSettingsService.getAllSyncSettings(entityType || undefined, enabled);
    
    return NextResponse.json({ settings: allSettings });
  } catch (error) {
    console.error('Fehler beim Abrufen der Synchronisationseinstellungen:', error);
    return NextResponse.json(
      { error: `Fehler beim Abrufen der Synchronisationseinstellungen: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

// POST /api/scheduler/sync-settings - Erstellt oder aktualisiert Synchronisationseinstellungen
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validierung der erforderlichen Felder
    if (!data.entityType || !data.entityId || !data.syncIntervalType) {
      return NextResponse.json(
        { error: 'Fehlende Pflichtfelder (entityType, entityId, syncIntervalType)' },
        { status: 400 }
      );
    }
    
    // Erstelle oder aktualisiere die Einstellungen
    const settingsId = await syncSettingsService.saveSyncSettings({
      entityType: data.entityType as EntityType,
      entityId: data.entityId,
      syncIntervalType: data.syncIntervalType as IntervalType,
      syncIntervalValue: data.syncIntervalValue,
      syncIntervalUnit: data.syncIntervalUnit as IntervalUnit,
      customSchedule: data.customSchedule,
      enabled: data.enabled !== undefined ? data.enabled : true,
      config: data.config
    });
    
    // Hole die aktualisierten Einstellungen
    const settings = await syncSettingsService.getSyncSettings(
      data.entityType as EntityType, 
      data.entityId
    );
    
    return NextResponse.json({ settings }, { status: 201 });
  } catch (error) {
    console.error('Fehler beim Speichern der Synchronisationseinstellungen:', error);
    return NextResponse.json(
      { error: `Fehler beim Speichern der Synchronisationseinstellungen: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

// DELETE /api/scheduler/sync-settings?entityType=job_portal&entityId=indeed - Löscht Synchronisationseinstellungen
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType') as EntityType | null;
    const entityId = searchParams.get('entityId');
    
    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: 'Fehlende Pflichtfelder (entityType, entityId)' },
        { status: 400 }
      );
    }
    
    const success = await syncSettingsService.deleteSyncSettings(entityType, entityId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Einstellungen nicht gefunden oder konnten nicht gelöscht werden' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Fehler beim Löschen der Synchronisationseinstellungen:', error);
    return NextResponse.json(
      { error: `Fehler beim Löschen der Synchronisationseinstellungen: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

// PATCH /api/scheduler/sync-settings/enable - Aktiviert oder deaktiviert Synchronisationseinstellungen
export async function PATCH(request: Request) {
  try {
    const data = await request.json();
    
    // Validierung der erforderlichen Felder
    if (!data.entityType || !data.entityId || data.enabled === undefined) {
      return NextResponse.json(
        { error: 'Fehlende Pflichtfelder (entityType, entityId, enabled)' },
        { status: 400 }
      );
    }
    
    // Aktiviere oder deaktiviere die Einstellungen
    const success = await syncSettingsService.setSyncEnabled(
      data.entityType as EntityType,
      data.entityId,
      data.enabled
    );
    
    if (!success) {
      return NextResponse.json(
        { error: 'Einstellungen nicht gefunden oder konnten nicht aktualisiert werden' },
        { status: 404 }
      );
    }
    
    // Hole die aktualisierten Einstellungen
    const settings = await syncSettingsService.getSyncSettings(
      data.entityType as EntityType,
      data.entityId
    );
    
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Synchronisationseinstellungen:', error);
    return NextResponse.json(
      { error: `Fehler beim Aktualisieren der Synchronisationseinstellungen: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}
