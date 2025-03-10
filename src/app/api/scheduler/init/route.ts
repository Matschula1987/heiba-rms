import { NextResponse } from 'next/server';
import { initializeScheduler } from '@/lib/dbInit';
import { schedulerService } from '@/lib/scheduler/SchedulerService';
import { pipelineManager } from '@/lib/scheduler/PipelineManager';
import { syncSettingsService } from '@/lib/scheduler/SyncSettingsService';

/**
 * API-Endpunkt zur Initialisierung und Steuerung des Schedulers
 */

// GET /api/scheduler/init - Initialisiert den Scheduler und gibt seinen Status zurück
export async function GET() {
  try {
    // Initialisiere die Scheduler-Tabellen in der Datenbank
    const dbInitialized = await initializeScheduler();
    
    if (!dbInitialized) {
      return NextResponse.json(
        { success: false, error: 'Fehler bei der Initialisierung der Scheduler-Tabellen' },
        { status: 500 }
      );
    }
    
    // Hole die aktuellen Scheduler-Informationen
    const pendingTasks = await schedulerService.getNextPendingTasks(10);
    const dueTasks = await schedulerService.getDueTasks();
    
    // Hole die Pipeline-Informationen
    const socialMediaPipeline = await pipelineManager.getItems({
      pipelineType: 'social_media',
      status: 'pending',
      limit: 5
    });
    
    const movidoPipeline = await pipelineManager.getItems({
      pipelineType: 'movido',
      status: 'pending',
      limit: 5
    });
    
    // Hole die Sync-Einstellungen
    const syncSettings = await syncSettingsService.getAllSyncSettings(undefined, true);
    
    return NextResponse.json({
      success: true,
      scheduler: {
        initialized: true,
        pendingTasks: pendingTasks.length,
        dueTasks: dueTasks.length,
        pendingTasksList: pendingTasks,
        dueTasksList: dueTasks
      },
      pipeline: {
        socialMediaPending: socialMediaPipeline.length,
        movidoPending: movidoPipeline.length,
        socialMediaItems: socialMediaPipeline,
        movidoItems: movidoPipeline
      },
      sync: {
        activeSettings: syncSettings.length,
        settingsList: syncSettings
      }
    });
  } catch (error) {
    console.error('Fehler bei der Initialisierung des Schedulers:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: `Fehler bei der Initialisierung des Schedulers: ${error instanceof Error ? error.message : String(error)}` 
      },
      { status: 500 }
    );
  }
}

// POST /api/scheduler/init - Führt einen sofortigen Scheduler-Lauf durch
export async function POST() {
  try {
    // Stelle sicher, dass der Scheduler initialisiert ist
    await initializeScheduler();
    
    // Hole alle fälligen Aufgaben
    const dueTasks = await schedulerService.getDueTasks();
    
    // Hole alle fälligen Synchronisationen
    const dueSyncs = await syncSettingsService.getDueSyncs();
    
    // Das Ergebnis speichert die Ergebnisse aller Aktionen
    const result = {
      tasksProcessed: 0,
      syncsProcessed: 0,
      errors: [] as string[]
    };
    
    // Verarbeite alle fälligen Aufgaben (in einer echten Implementierung würden hier die Aufgaben ausgeführt)
    for (const task of dueTasks) {
      try {
        // Markiere die Aufgabe als in Bearbeitung
        await schedulerService.updateTaskStatus(task.id, 'running');
        
        // In einer vollständigen Implementierung würden wir hier je nach Aufgabentyp
        // unterschiedliche Aktionen ausführen
        
        // Simuliere eine erfolgreiche Ausführung
        await schedulerService.updateTaskStatus(
          task.id, 
          'completed', 
          JSON.stringify({ success: true, message: 'Simulierte Ausführung erfolgreich' })
        );
        
        result.tasksProcessed++;
      } catch (error) {
        // Bei einem Fehler markiere die Aufgabe als fehlgeschlagen
        await schedulerService.updateTaskStatus(
          task.id, 
          'failed', 
          undefined, 
          error instanceof Error ? error.message : String(error)
        );
        
        result.errors.push(`Fehler bei Aufgabe ${task.id}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    // Verarbeite alle fälligen Synchronisationen
    for (const sync of dueSyncs) {
      try {
        // Aktualisiere den letzten Synchronisationszeitpunkt
        await syncSettingsService.updateLastSync(sync.entityType, sync.entityId);
        
        result.syncsProcessed++;
      } catch (error) {
        result.errors.push(`Fehler bei Sync ${sync.id}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    return NextResponse.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Fehler beim Ausführen des Scheduler-Laufs:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: `Fehler beim Ausführen des Scheduler-Laufs: ${error instanceof Error ? error.message : String(error)}` 
      },
      { status: 500 }
    );
  }
}
