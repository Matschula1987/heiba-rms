import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

// Hilfsfunktion zum Parsen von JSON-Feldern und Mapping der Daten
function parseJsonFields(candidate: any) {
  if (!candidate) return null;
  
  const result = { ...candidate };
  
  // Name aus first_name und last_name zusammensetzen
  result.name = `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim();
  
  // Felder für Frontend sicherstellen
  result.position = candidate.position || '';
  result.location = candidate.location || '';
  result.phone = candidate.phone || '';
  
  // Parse JSON-Felder
  try {
    if (result.experience) result.experience = JSON.parse(result.experience);
    if (result.documents) result.documents = JSON.parse(result.documents);
    if (result.qualifications) result.qualifications = JSON.parse(result.qualifications);
    if (result.qualification_profile) {
      result.qualificationProfile = JSON.parse(result.qualification_profile);
      // Legacy-Feld für Kompatibilität beibehalten
      result.qualification_profile = result.qualificationProfile;
    }
    if (result.communicationHistory) result.communicationHistory = JSON.parse(result.communicationHistory);
  } catch (e) {
    console.error('Fehler beim Parsen der JSON-Felder:', e);
  }
  
  return result;
}

// Hilfsfunktion zum Umwandeln von JSON-Feldern in Strings
function stringifyJsonFields(data: any) {
  const result = { ...data };
  
  // Name in first_name und last_name aufteilen, falls vorhanden
  if (result.name) {
    const nameParts = result.name.split(' ');
    result.first_name = nameParts[0] || '';
    result.last_name = nameParts.slice(1).join(' ') || '';
  }
  
  // Stringify JSON-Felder
  if (result.experience && typeof result.experience !== 'string') {
    result.experience = JSON.stringify(result.experience);
  }
  if (result.documents && typeof result.documents !== 'string') {
    result.documents = JSON.stringify(result.documents);
  }
  if (result.qualifications && typeof result.qualifications !== 'string') {
    result.qualifications = JSON.stringify(result.qualifications);
  }
  if (result.qualificationProfile && typeof result.qualificationProfile !== 'string') {
    result.qualification_profile = JSON.stringify(result.qualificationProfile);
  } else if (result.qualification_profile && typeof result.qualification_profile !== 'string') {
    result.qualification_profile = JSON.stringify(result.qualification_profile);
  }
  if (result.communicationHistory && typeof result.communicationHistory !== 'string') {
    result.communicationHistory = JSON.stringify(result.communicationHistory);
  }
  
  return result;
}

// GET /api/candidates/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDb();
    const result = await db.get(
      'SELECT * FROM candidates WHERE id = ?',
      params.id
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(parseJsonFields(result));
  } catch (error) {
    console.error('Failed to fetch candidate:', error);
    return NextResponse.json(
      { error: 'Failed to fetch candidate' },
      { status: 500 }
    );
  }
}

// PUT /api/candidates/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDb();
    const data = await request.json();
    
    // Aktualisierungszeit setzen
    const updateData = {
      ...data,
      updated_at: new Date().toISOString()
    };
    
    // JSON-Felder konvertieren
    const processedData = stringifyJsonFields(updateData);
    
    // Erstelle dynamisches SQL-Statement basierend auf den zu aktualisierenden Feldern
    const keys = Object.keys(processedData).filter(key => key !== 'id');
    const placeholders = keys.map(key => `${key} = ?`).join(', ');
    const values = keys.map(key => processedData[key]);
    
    // ID für WHERE-Klausel hinzufügen
    values.push(params.id);
    
    // UPDATE ausführen
    await db.run(
      `UPDATE candidates SET ${placeholders} WHERE id = ?`,
      ...values
    );

    // Aktualisierte Daten abrufen
    const updated = await db.get(
      'SELECT * FROM candidates WHERE id = ?',
      params.id
    );

    return NextResponse.json(parseJsonFields(updated));
  } catch (error) {
    console.error('Failed to update candidate:', error);
    return NextResponse.json(
      { error: 'Failed to update candidate' },
      { status: 500 }
    );
  }
}

// DELETE /api/candidates/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDb();
    await db.run(
      'DELETE FROM candidates WHERE id = ?',
      params.id
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete candidate:', error);
    return NextResponse.json(
      { error: 'Failed to delete candidate' },
      { status: 500 }
    );
  }
}
