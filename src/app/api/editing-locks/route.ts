import { NextRequest, NextResponse } from 'next/server';
import { editingLockService, LockRequest } from '@/lib/editingLockService';

/**
 * GET /api/editing-locks
 * Abrufen einer aktiven Sperre für eine Entität
 * Query-Parameter:
 * - entity_id: ID der Entität
 * - entity_type: Typ der Entität
 * Oder:
 * - user_id: ID des Benutzers, um alle Sperren des Benutzers abzurufen
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const entityId = searchParams.get('entity_id');
    const entityType = searchParams.get('entity_type');
    const userId = searchParams.get('user_id');
    
    // Hole alle Sperren eines Benutzers
    if (userId) {
      const locks = await editingLockService.getUserActiveLocks(userId);
      return NextResponse.json({ success: true, locks });
    }
    
    // Wenn entity_id oder entity_type fehlt, Fehler zurückgeben
    if (!entityId || !entityType) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Entitäts-ID und Entitätstyp sind erforderlich' 
        },
        { status: 400 }
      );
    }
    
    // Hole die aktive Sperre für eine Entität
    try {
      const lock = await editingLockService.getActiveLock(entityId, entityType);
      
      return NextResponse.json({ 
        success: true, 
        lock,
        canEdit: !lock // Wenn keine Sperre vorhanden ist, kann bearbeitet werden
      });
    } catch (error) {
      console.warn("Fehler beim Abfragen der Sperre, ermögliche Bearbeitung:", error);
      return NextResponse.json({
        success: true,
        lock: null,
        canEdit: true
      });
    }
  } catch (error) {
    console.error('Fehler beim Abrufen der Bearbeitungssperren:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unbekannter Fehler' 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/editing-locks
 * Erstellen einer neuen Bearbeitungssperre
 * Body-Parameter:
 * - entity_id: ID der Entität
 * - entity_type: Typ der Entität
 * - user_id: ID des Benutzers
 * - user_name: Name des Benutzers
 * - duration_minutes (optional): Dauer der Sperre in Minuten
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const lockRequest: LockRequest = {
      entityId: body.entity_id,
      entityType: body.entity_type,
      userId: body.user_id,
      userName: body.user_name,
      durationMinutes: body.duration_minutes
    };
    
    // Validiere die Anfrage
    if (!lockRequest.entityId || !lockRequest.entityType || !lockRequest.userId || !lockRequest.userName) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unvollständige Anfragedaten' 
        },
        { status: 400 }
      );
    }
    
    try {
      // Erstelle die Sperre
      const lock = await editingLockService.createLock(lockRequest);
      
      // Prüfe, ob die Sperre erstellt wurde
      if (lock && lock.userId !== lockRequest.userId) {
        // Eine andere Person hat bereits eine Sperre
        return NextResponse.json(
          { 
            success: false, 
            lock,
            error: `Diese Entität wird bereits von ${lock.userName} bearbeitet`,
            canEdit: false
          },
          { status: 409 }
        );
      }
      
      return NextResponse.json({ 
        success: true, 
        lock,
        canEdit: true
      });
    } catch (error) {
      console.warn("Fehler beim Erstellen der Sperre, ermögliche Bearbeitung:", error);
      return NextResponse.json({
        success: true,
        lock: null,
        canEdit: true,
        warning: "Sperre konnte nicht erstellt werden, Bearbeitung ist trotzdem möglich"
      });
    }
  } catch (error) {
    console.error('Fehler beim Erstellen der Bearbeitungssperre:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unbekannter Fehler' 
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/editing-locks
 * Freigeben einer Bearbeitungssperre
 * Query-Parameter:
 * - id: ID der Sperre
 * - user_id: ID des Benutzers
 * Oder:
 * - entity_id: ID der Entität
 * - entity_type: Typ der Entität
 * - user_id: ID des Benutzers
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lockId = searchParams.get('id');
    const entityId = searchParams.get('entity_id');
    const entityType = searchParams.get('entity_type');
    const userId = searchParams.get('user_id');
    
    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Benutzer-ID ist erforderlich' 
        },
        { status: 400 }
      );
    }
    
    let success = false;
    
    // Freigabe über Lock-ID
    if (lockId) {
      success = await editingLockService.releaseLock(lockId, userId);
    } 
    // Freigabe über Entitäts-ID und Entitätstyp
    else if (entityId && entityType) {
      success = await editingLockService.releaseEntityLock(entityId, entityType, userId);
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Entweder Lock-ID oder Entitäts-ID und Entitätstyp sind erforderlich' 
        },
        { status: 400 }
      );
    }
    
    if (!success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Sperre konnte nicht freigegeben werden oder existiert nicht' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Fehler beim Freigeben der Bearbeitungssperre:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unbekannter Fehler' 
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/editing-locks
 * Verlängern einer bestehenden Sperre
 * Body-Parameter:
 * - id: ID der Sperre
 * - duration_minutes (optional): Zusätzliche Dauer in Minuten
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const lockId = body.id;
    const durationMinutes = body.duration_minutes;
    
    if (!lockId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Lock-ID ist erforderlich' 
        },
        { status: 400 }
      );
    }
    
    const lock = await editingLockService.extendLock(lockId, durationMinutes);
    
    if (!lock) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Sperre konnte nicht verlängert werden oder existiert nicht' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      lock 
    });
  } catch (error) {
    console.error('Fehler beim Verlängern der Bearbeitungssperre:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unbekannter Fehler' 
      },
      { status: 500 }
    );
  }
}
