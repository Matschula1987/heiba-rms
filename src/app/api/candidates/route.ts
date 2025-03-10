import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ensureDbInitializedForApi } from '@/app/api/initDb';
import { Candidate } from '@/types';

export async function GET() {
  try {
    await ensureDbInitializedForApi();
    const db = await getDb();
    
    const candidates = await db.all(`
      SELECT 
        c.*,
        COUNT(DISTINCT ja.id) as applications_count
      FROM candidates c
      LEFT JOIN job_applications ja ON c.id = ja.candidate_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);

    return NextResponse.json(candidates.map((candidate: any) => ({
      ...candidate,
      // Name aus first_name und last_name zusammensetzen
      name: `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim(),
      // JSON-Felder parsen
      experience: candidate.experience ? JSON.parse(candidate.experience as string) : [],
      documents: candidate.documents ? JSON.parse(candidate.documents as string) : [],
      qualifications: candidate.qualifications ? JSON.parse(candidate.qualifications as string) : [],
      qualificationProfile: candidate.qualification_profile ? JSON.parse(candidate.qualification_profile as string) : {},
      // Sicherstellen, dass position und location existieren
      position: candidate.position || '',
      location: candidate.location || ''
    })));
      } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const db = await getDb();
    
    // Name in first_name und last_name aufteilen
    let firstName = '', lastName = '';
    if (data.name) {
      const nameParts = data.name.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    } else {
      firstName = data.first_name || '';
      lastName = data.last_name || '';
    }
    
    const result = await db.run(
      `INSERT INTO candidates (
        first_name, last_name, email, status, 
        position, location, phone, 
        created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        firstName, 
        lastName, 
        data.email, 
        data.status || 'new',
        data.position || '',
        data.location || '',
        data.phone || ''
      ]
    );
    
    const newCandidate = await db.get(
      'SELECT * FROM candidates WHERE id = ?',
      result.lastID
    );
    
    return NextResponse.json(newCandidate, { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
