import { NextResponse } from 'next/server';
import { schedulerService } from '@/lib/scheduler/SchedulerService';
import { pipelineManager } from '@/lib/scheduler/PipelineManager';
import { syncSettingsService } from '@/lib/scheduler/SyncSettingsService';
import { v4 as uuidv4 } from 'uuid';
import { ScheduledTask, TaskType, TaskStatus, EntityType, IntervalType } from '@/types/scheduler';

/**
 * API-Endpunkt für den Scheduler
 * Ermöglicht die Verwaltung von geplanten Aufgaben
 */

// GET /api/scheduler - Holt geplante Aufgaben mit Filteroptionen
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Filteroptionen aus den Query-Parametern extrahieren
    const status = searchParams.get('status');
    const entityType = searchParams.get('entityType') as EntityType | null;
    const entityId = searchParams.get('entityId');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const limit = searchParams.has('limit') ? Number(searchParams.get('limit')) : undefined;
    const offset = searchParams.has('offset') ? Number(searchParams.get('offset')) : undefined;
    
    // Aufgaben mit Filtern abrufen
    const tasks = await schedulerService.getTasks({
      status: status ? status as TaskStatus : undefined,
      entityType: entityType || undefined,
      entityId: entityId || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      limit,
      offset
    });
    
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Fehler beim Abrufen der geplanten Aufgaben:', error);
    return NextResponse.json(
      { error: `Fehler beim Abrufen der geplanten Aufgaben: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

// POST /api/scheduler - Erstellt eine neue geplante Aufgabe
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validierung der erforderlichen Felder
    if (!data.taskType || !data.scheduledFor) {
      return NextResponse.json(
        { error: 'Fehlende Pflichtfelder (taskType, scheduledFor)' },
        { status: 400 }
      );
    }
    
    // Neue Aufgabe erstellen
    const taskId = await schedulerService.createTask({
      taskType: data.taskType as TaskType,
      status: data.status as TaskStatus || 'pending',
      scheduledFor: data.scheduledFor,
      intervalType: data.intervalType as IntervalType | undefined,
      intervalValue: data.intervalValue,
      intervalUnit: data.intervalUnit,
      customSchedule: data.customSchedule,
      config: data.config,
      entityId: data.entityId,
      entityType: data.entityType as EntityType | undefined
    });
    
    // Aufgabe abrufen und zurückgeben
    const task = await schedulerService.getTaskById(taskId);
    
    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Fehler beim Erstellen der geplanten Aufgabe:', error);
    return NextResponse.json(
      { error: `Fehler beim Erstellen der geplanten Aufgabe: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

// DELETE /api/scheduler?id=taskId - Löscht eine geplante Aufgabe
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Fehlende Aufgaben-ID' },
        { status: 400 }
      );
    }
    
    const success = await schedulerService.deleteTask(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Aufgabe nicht gefunden oder konnte nicht gelöscht werden' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Fehler beim Löschen der geplanten Aufgabe:', error);
    return NextResponse.json(
      { error: `Fehler beim Löschen der geplanten Aufgabe: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}
