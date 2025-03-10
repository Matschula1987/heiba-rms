import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { Task, TaskCreateInput } from '@/types/tasks';
import { v4 as uuidv4 } from 'uuid';

// GET /api/tasks - Alle Aufgaben abrufen (mit optionalen Filtern)
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const searchParams = request.nextUrl.searchParams;
    
    // Filter-Parameter auslesen
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const related_entity_type = searchParams.get('entityType');
    const related_entity_id = searchParams.get('entityId');
    const assigned_to = searchParams.get('assignedTo');
    const is_automated = searchParams.get('automated');
    
    // SQL-Query mit optionalen WHERE-Bedingungen aufbauen
    let query = 'SELECT * FROM tasks';
    const conditions = [];
    const params: any[] = [];
    
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    
    if (priority) {
      conditions.push('priority = ?');
      params.push(priority);
    }
    
    if (related_entity_type) {
      conditions.push('related_entity_type = ?');
      params.push(related_entity_type);
    }
    
    if (related_entity_id) {
      conditions.push('related_entity_id = ?');
      params.push(related_entity_id);
    }
    
    if (assigned_to) {
      conditions.push('assigned_to = ?');
      params.push(assigned_to);
    }
    
    if (is_automated !== null) {
      conditions.push('is_automated = ?');
      params.push(is_automated === 'true' ? 1 : 0);
    }
    
    // Bedingungen zum Query hinzufügen, falls vorhanden
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    // Sortierung hinzufügen (fällige Aufgaben zuerst)
    query += ' ORDER BY due_date ASC';
    
    // Query ausführen
    const tasks = await db.all(query, ...params);
    
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Fehler beim Abrufen der Aufgaben:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Aufgaben' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Neue Aufgabe erstellen
export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const data: TaskCreateInput = await request.json();
    
    // Pflichtfelder prüfen
    if (!data.title || !data.due_date || !data.priority || !data.task_type) {
      return NextResponse.json(
        { error: 'Erforderliche Felder fehlen' },
        { status: 400 }
      );
    }
    
    // UUID generieren
    const id = uuidv4();
    
    // Aktuelles Datum für created_at und updated_at
    const now = new Date().toISOString();
    
    // Status standardmäßig auf 'open' setzen, falls nicht angegeben
    const status = data.status || 'open';
    
    // Task in Datenbank speichern
    const query = `
      INSERT INTO tasks (
        id, title, description, due_date, priority, status, task_type,
        assigned_to, related_entity_type, related_entity_id, 
        is_automated, reminder_sent, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await db.run(
      query,
      id,
      data.title,
      data.description || null,
      data.due_date,
      data.priority,
      status,
      data.task_type,
      data.assigned_to || null,
      data.related_entity_type || null,
      data.related_entity_id || null,
      data.is_automated === undefined ? 0 : (data.is_automated ? 1 : 0),
      0, // reminder_sent initial auf false
      now,
      now
    );
    
    // Neu erstellten Task aus der Datenbank abrufen
    const createdTask = await db.get('SELECT * FROM tasks WHERE id = ?', id);
    
    return NextResponse.json(createdTask, { status: 201 });
  } catch (error) {
    console.error('Fehler beim Erstellen der Aufgabe:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Aufgabe' },
      { status: 500 }
    );
  }
}
