import { NextRequest, NextResponse } from 'next/server';
import { TalentPoolService } from '@/lib/talentPoolService';
import { UpdateTalentPoolEntryParams } from '@/types/talentPool';

/**
 * GET /api/talent-pool/[id]
 * Ruft einen einzelnen Talent-Pool-Eintrag ab
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Tabellen initialisieren, falls nicht vorhanden
    await TalentPoolService.initTalentPoolTables();
    
    const id = params.id;
    
    // Query-Parameter prüfen
    const searchParams = request.nextUrl.searchParams;
    const extended = searchParams.has('extended') && searchParams.get('extended') === 'true';
    
    // Talent-Pool-Eintrag abrufen
    const entry = extended
      ? await TalentPoolService.getTalentPoolEntryExtendedById(id)
      : await TalentPoolService.getTalentPoolEntryById(id);
    
    if (!entry) {
      return NextResponse.json(
        { error: `Talent-Pool-Eintrag mit ID ${id} nicht gefunden` },
        { status: 404 }
      );
    }
    
    return NextResponse.json(entry);
  } catch (error: any) {
    console.error('Fehler beim Abrufen des Talent-Pool-Eintrags:', error);
    return NextResponse.json(
      { error: error.message || 'Unbekannter Fehler' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/talent-pool/[id]
 * Aktualisiert einen Talent-Pool-Eintrag
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Tabellen initialisieren, falls nicht vorhanden
    await TalentPoolService.initTalentPoolTables();
    
    const id = params.id;
    
    // Request-Body auslesen
    const body = await request.json();
    
    // Parameter validieren
    const updateParams: UpdateTalentPoolEntryParams = {};
    
    if (body.reason !== undefined) updateParams.reason = body.reason;
    if (body.notes !== undefined) updateParams.notes = body.notes;
    if (body.rating !== undefined) updateParams.rating = body.rating;
    if (body.tags !== undefined) updateParams.tags = body.tags;
    if (body.status !== undefined) updateParams.status = body.status;
    if (body.reminder_date !== undefined) updateParams.reminder_date = body.reminder_date;
    
    // Talent-Pool-Eintrag aktualisieren
    const updatedEntry = await TalentPoolService.updateTalentPoolEntry(id, updateParams);
    
    if (!updatedEntry) {
      return NextResponse.json(
        { error: `Talent-Pool-Eintrag mit ID ${id} nicht gefunden` },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedEntry);
  } catch (error: any) {
    console.error('Fehler beim Aktualisieren des Talent-Pool-Eintrags:', error);
    return NextResponse.json(
      { error: error.message || 'Unbekannter Fehler' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/talent-pool/[id]
 * Löscht einen Talent-Pool-Eintrag
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Tabellen initialisieren, falls nicht vorhanden
    await TalentPoolService.initTalentPoolTables();
    
    const id = params.id;
    
    // Talent-Pool-Eintrag löschen
    const success = await TalentPoolService.removeTalentPoolEntry(id);
    
    if (!success) {
      return NextResponse.json(
        { error: `Talent-Pool-Eintrag mit ID ${id} nicht gefunden` },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Fehler beim Löschen des Talent-Pool-Eintrags:', error);
    return NextResponse.json(
      { error: error.message || 'Unbekannter Fehler' },
      { status: 500 }
    );
  }
}
