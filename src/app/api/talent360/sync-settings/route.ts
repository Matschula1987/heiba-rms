import { NextRequest, NextResponse } from 'next/server';
import { syncSettingsService } from '@/lib/scheduler/SyncSettingsService';
import { SyncConfig } from '@/types/scheduler';

/**
 * GET /api/talent360/sync-settings
 * Ruft die Synchronisierungseinstellungen für Talent360 ab
 */
export async function GET(request: NextRequest) {
  try {
    // Talent360-spezifische Synchronisationseinstellungen abrufen
    const settings = await syncSettingsService.getSyncSettings(
      'talent_pool', // Entitätstyp für Talent360-Synchronisation
      'talent360' // Feste ID für Talent360-Integration
    );
    
    return NextResponse.json({
      status: 'ok',
      settings: settings || {
        enabled: false,
        syncIntervalType: 'daily',
        syncIntervalValue: 1,
        syncIntervalUnit: 'days'
      }
    });
  } catch (error: any) {
    console.error('Fehler beim Abrufen der Talent360-Synchronisationseinstellungen:', error);
    return NextResponse.json(
      { error: error.message || 'Unbekannter Fehler' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/talent360/sync-settings
 * Aktualisiert die Synchronisierungseinstellungen für Talent360
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validierung der Anforderungsparameter
    if (body.syncIntervalType && !['hourly', 'daily', 'weekly', 'monthly', 'custom'].includes(body.syncIntervalType)) {
      return NextResponse.json(
        { error: 'Ungültiger Intervalltyp' },
        { status: 400 }
      );
    }
    
    // SyncConfig erstellen
    const syncConfig: SyncConfig = {
      syncAll: body.syncAll ?? true,
      depth: body.depth || 'full',
      retryOnFail: body.retryOnFail ?? true,
      maxRetries: body.maxRetries || 3,
      customParams: {
        includeApplications: body.includeApplications ?? true,
        includeJobs: body.includeJobs ?? true,
        converToCandidates: body.convertToCandidates ?? false,
        addToTalentPool: body.addToTalentPool ?? true,
        notifyOnNew: body.notifyOnNew ?? true
      }
    };
    
    // Sync-Einstellungen speichern
    const settingsId = await syncSettingsService.saveSyncSettings({
      entityType: 'talent_pool',
      entityId: 'talent360',
      syncIntervalType: body.syncIntervalType || 'daily',
      syncIntervalValue: body.syncIntervalValue || 1,
      syncIntervalUnit: body.syncIntervalUnit || 'days',
      customSchedule: body.customSchedule,
      enabled: body.enabled ?? true,
      config: JSON.stringify(syncConfig)
    });
    
    // Aktualisierte Einstellungen zurückgeben
    const updatedSettings = await syncSettingsService.getSyncSettings('talent_pool', 'talent360');
    
    return NextResponse.json({
      status: 'ok',
      message: 'Synchronisationseinstellungen aktualisiert',
      settingsId,
      settings: updatedSettings
    });
  } catch (error: any) {
    console.error('Fehler beim Aktualisieren der Talent360-Synchronisationseinstellungen:', error);
    return NextResponse.json(
      { error: error.message || 'Unbekannter Fehler' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/talent360/sync-settings
 * Löscht die Synchronisierungseinstellungen für Talent360
 */
export async function DELETE(request: NextRequest) {
  try {
    // Einstellungen löschen
    const success = await syncSettingsService.deleteSyncSettings(
      'talent_pool',
      'talent360'
    );
    
    if (!success) {
      return NextResponse.json(
        { error: 'Keine Einstellungen gefunden' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      status: 'ok',
      message: 'Synchronisationseinstellungen gelöscht'
    });
  } catch (error: any) {
    console.error('Fehler beim Löschen der Talent360-Synchronisationseinstellungen:', error);
    return NextResponse.json(
      { error: error.message || 'Unbekannter Fehler' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/talent360/sync-settings
 * Aktiviert oder deaktiviert die Talent360-Synchronisation
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validierung
    if (body.enabled === undefined) {
      return NextResponse.json(
        { error: 'Parameter "enabled" wird benötigt' },
        { status: 400 }
      );
    }
    
    // Einstellungen aktivieren/deaktivieren
    const success = await syncSettingsService.setSyncEnabled(
      'talent_pool',
      'talent360',
      body.enabled
    );
    
    if (!success) {
      return NextResponse.json(
        { error: 'Keine Einstellungen gefunden' },
        { status: 404 }
      );
    }
    
    // Aktualisierte Einstellungen zurückgeben
    const updatedSettings = await syncSettingsService.getSyncSettings('talent_pool', 'talent360');
    
    return NextResponse.json({
      status: 'ok',
      message: body.enabled ? 'Synchronisation aktiviert' : 'Synchronisation deaktiviert',
      settings: updatedSettings
    });
  } catch (error: any) {
    console.error('Fehler beim Ändern des Synchronisationsstatus:', error);
    return NextResponse.json(
      { error: error.message || 'Unbekannter Fehler' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/talent360/sync-settings/trigger
 * Löst eine sofortige Synchronisation aus
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    
    // SyncConfig erstellen
    const syncConfig: SyncConfig = {
      syncAll: body.syncAll ?? true,
      depth: body.depth || 'full',
      retryOnFail: body.retryOnFail ?? true,
      customParams: {
        includeApplications: body.includeApplications ?? true,
        includeJobs: body.includeJobs ?? true,
        converToCandidates: body.convertToCandidates ?? false,
        addToTalentPool: body.addToTalentPool ?? true,
        notifyOnNew: body.notifyOnNew ?? true
      }
    };
    
    // Sofortige Synchronisation auslösen
    const taskId = await syncSettingsService.triggerSync(
      'talent_pool',
      'talent360',
      syncConfig
    );
    
    if (!taskId) {
      return NextResponse.json(
        { error: 'Synchronisationseinstellungen nicht gefunden' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      status: 'ok',
      message: 'Synchronisation wurde ausgelöst',
      taskId
    });
  } catch (error: any) {
    console.error('Fehler beim Auslösen der Talent360-Synchronisation:', error);
    return NextResponse.json(
      { error: error.message || 'Unbekannter Fehler' },
      { status: 500 }
    );
  }
}
