import { NextRequest, NextResponse } from 'next/server';
import { FollowupService } from '@/lib/followup/FollowupService';
import { ensureDbInitializedForApi } from '../initDb';

/**
 * GET: Ruft Nachfassaktionen ab
 */
export async function GET(request: NextRequest) {
  try {
    await ensureDbInitializedForApi();

    // Extrahiere Abfrageparameter
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const candidateId = searchParams.get('candidateId');
    const applicationId = searchParams.get('applicationId');
    const jobId = searchParams.get('jobId');
    const talentPoolId = searchParams.get('talentPoolId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const includeCompleted = searchParams.get('includeCompleted') === 'true';
    const dueBeforeDate = searchParams.get('dueBeforeDate');
    const dueAfterDate = searchParams.get('dueAfterDate');
    
    // Paginierung
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    const offset = offsetParam ? parseInt(offsetParam, 10) : undefined;

    // Optional: Erweiterte Details abrufen
    const withDetails = searchParams.get('withDetails') === 'true';
    
    // Service-Instanz
    const followupService = new FollowupService();

    // Abfrageparameter
    const options: any = {
      userId: userId || undefined,
      candidateId: candidateId || undefined,
      applicationId: applicationId || undefined,
      jobId: jobId || undefined,
      talentPoolId: talentPoolId || undefined,
      status: status || undefined,
      priority: priority || undefined,
      includeCompleted,
      dueBeforeDate: dueBeforeDate || undefined,
      dueAfterDate: dueAfterDate || undefined,
      limit,
      offset
    };

    // Hole die Nachfassaktionen
    let followups;
    if (withDetails) {
      followups = await followupService.getFollowupActionsWithDetails(options);
    } else {
      followups = await followupService.getFollowupActions(options);
    }

    return NextResponse.json({ followups });
  } catch (error) {
    console.error('Fehler beim Abrufen der Nachfassaktionen:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Nachfassaktionen' },
      { status: 500 }
    );
  }
}

/**
 * POST: Erstellt eine neue Nachfassaktion
 */
export async function POST(request: NextRequest) {
  try {
    await ensureDbInitializedForApi();

    // Extrahiere Daten aus dem Request
    const data = await request.json();
    
    // Validiere die erforderlichen Felder
    if (!data.title || !data.dueDate || !data.actionType || !data.assignedTo) {
      return NextResponse.json(
        { error: 'Fehlende erforderliche Felder' },
        { status: 400 }
      );
    }

    // Stelle sicher, dass der Status ein gültiger Wert ist
    const validStatusValues = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (data.status && !validStatusValues.includes(data.status)) {
      return NextResponse.json(
        { error: 'Ungültiger Status' },
        { status: 400 }
      );
    }

    // Priorität validieren
    const validPriorityValues = ['high', 'medium', 'low'];
    if (data.priority && !validPriorityValues.includes(data.priority)) {
      return NextResponse.json(
        { error: 'Ungültige Priorität' },
        { status: 400 }
      );
    }

    // Erstelle eine neue Nachfassaktion
    const followupService = new FollowupService();
    
    // Setze Standardwerte wenn nötig
    data.status = data.status || 'pending';
    data.priority = data.priority || 'medium';
    data.completed = data.completed || false;
    data.reminderSent = data.reminderSent || false;
    
    // Stelle sicher, dass assignedBy vorhanden ist
    if (!data.assignedBy) {
      // Wenn keine Benutzer-ID vorhanden ist, verwenden wir einen Standardwert
      data.assignedBy = data.assignedTo; // Die zugewiesene Person ist auch die, die es erstellt hat
    }
    
    const actionId = await followupService.createFollowupAction(data);

    return NextResponse.json({ id: actionId, success: true });
  } catch (error) {
    console.error('Fehler beim Erstellen der Nachfassaktion:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Nachfassaktion' },
      { status: 500 }
    );
  }
}
