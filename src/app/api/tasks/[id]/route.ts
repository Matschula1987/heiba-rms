import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { TaskUpdateInput } from '@/types/tasks';

// GET /api/tasks/[id] - Einzelne Aufgabe abrufen
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDb();
    const id = params.id;
    
    // Aufgabe aus Datenbank abrufen
    const task = await db.get('SELECT * FROM tasks WHERE id = ?', id);
    
    if (!task) {
      return NextResponse.json(
        { error: 'Aufgabe nicht gefunden' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(task);
  } catch (error) {
    console.error('Fehler beim Abrufen der Aufgabe:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Aufgabe' },
      { status: 500 }
    );
  }
}

// PATCH /api/tasks/[id] - Aufgabe aktualisieren
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDb();
    const id = params.id;
    const data: TaskUpdateInput = await request.json();
    
    // Prüfen, ob die Aufgabe existiert
    const existingTask = await db.get('SELECT * FROM tasks WHERE id = ?', id);
    
    if (!existingTask) {
      return NextResponse.json(
        { error: 'Aufgabe nicht gefunden' },
        { status: 404 }
      );
    }
    
    // Aktuelles Datum für updated_at
    const now = new Date().toISOString();
    
    // Erlaubte Felder für Updates
    const allowedFields = [
      'title',
      'description',
      'due_date',
      'priority',
      'status',
      'assigned_to',
      'reminder_sent',
      'completed_at',
    ];
    
    // Query und Parameter für UPDATE-Anweisung aufbauen
    const updates: string[] = [];
    const values: any[] = [];
    
    Object.entries(data).forEach(([key, value]) => {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    // Immer updated_at aktualisieren
    updates.push('updated_at = ?');
    values.push(now);
    
    // ID als letzten Parameter hinzufügen
    values.push(id);
    
    // Wenn Status auf "completed" gesetzt wird, completed_at setzen falls nicht explizit angegeben
    if (data.status === 'completed' && !data.completed_at) {
      updates.push('completed_at = ?');
      values.splice(values.length - 1, 0, now); // Vor der ID einfügen
    }
    
    // Wenn keine Aktualisierungen angegeben wurden, Fehler zurückgeben
    if (updates.length === 1) { // Nur updated_at würde aktualisiert
      return NextResponse.json(
        { error: 'Keine Aktualisierungen angegeben' },
        { status: 400 }
      );
    }
    
    // Update-Query ausführen
    const query = `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`;
    await db.run(query, ...values);
    
    // Aktualisierte Aufgabe aus der Datenbank abrufen
    const updatedTask = await db.get('SELECT * FROM tasks WHERE id = ?', id);
    
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Aufgabe:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Aufgabe' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Aufgabe löschen
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDb();
    const id = params.id;
    
    // Prüfen, ob die Aufgabe existiert
    const existingTask = await db.get('SELECT * FROM tasks WHERE id = ?', id);
    
    if (!existingTask) {
      return NextResponse.json(
        { error: 'Aufgabe nicht gefunden' },
        { status: 404 }
      );
    }
    
    // Aufgabe aus Datenbank löschen
    await db.run('DELETE FROM tasks WHERE id = ?', id);
    
    return NextResponse.json(
      { message: 'Aufgabe erfolgreich gelöscht' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fehler beim Löschen der Aufgabe:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Aufgabe' },
      { status: 500 }
    );
  }
}
