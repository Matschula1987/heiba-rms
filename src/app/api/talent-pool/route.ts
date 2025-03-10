import { NextRequest, NextResponse } from 'next/server';
import { TalentPoolService } from '@/lib/talentPoolService';
import { CreateTalentPoolEntryParams, TalentPoolFilter } from '@/types/talentPool';

/**
 * GET /api/talent-pool
 * Ruft eine Liste von Talent-Pool-Einträgen ab, mit optionaler Filterung
 */
export async function GET(request: NextRequest) {
  try {
    // Tabellen initialisieren, falls nicht vorhanden
    await TalentPoolService.initTalentPoolTables();
    
    // Query-Parameter für Filterung auslesen
    const searchParams = request.nextUrl.searchParams;
    const filter: TalentPoolFilter = {};
    
    // Suchtext
    if (searchParams.has('search')) {
      filter.search = searchParams.get('search') || undefined;
    }
    
    // Entitätstyp
    if (searchParams.has('entity_type')) {
      filter.entity_type = searchParams.get('entity_type') as any || undefined;
    }
    
    // Status
    if (searchParams.has('statuses')) {
      const statusesParam = searchParams.get('statuses');
      if (statusesParam) {
        filter.statuses = statusesParam.split(',') as any[];
      }
    }
    
    // Rating
    if (searchParams.has('minRating')) {
      filter.minRating = parseInt(searchParams.get('minRating') || '0');
    }
    
    if (searchParams.has('maxRating')) {
      filter.maxRating = parseInt(searchParams.get('maxRating') || '5');
    }
    
    // Zeitraum-Filter
    if (searchParams.has('addedSince')) {
      filter.addedSince = searchParams.get('addedSince') || undefined;
    }
    
    if (searchParams.has('addedBefore')) {
      filter.addedBefore = searchParams.get('addedBefore') || undefined;
    }
    
    if (searchParams.has('contactedSince')) {
      filter.contactedSince = searchParams.get('contactedSince') || undefined;
    }
    
    if (searchParams.has('contactedBefore')) {
      filter.contactedBefore = searchParams.get('contactedBefore') || undefined;
    }
    
    if (searchParams.has('reminderFrom')) {
      filter.reminderFrom = searchParams.get('reminderFrom') || undefined;
    }
    
    if (searchParams.has('reminderTo')) {
      filter.reminderTo = searchParams.get('reminderTo') || undefined;
    }
    
    // Tags
    if (searchParams.has('tags')) {
      const tagsParam = searchParams.get('tags');
      if (tagsParam) {
        filter.tags = tagsParam.split(',');
      }
    }
    
    // Paginierung
    if (searchParams.has('page')) {
      filter.page = parseInt(searchParams.get('page') || '0');
    }
    
    if (searchParams.has('pageSize')) {
      filter.pageSize = parseInt(searchParams.get('pageSize') || '20');
    }
    
    // Sortierung
    if (searchParams.has('sortBy')) {
      filter.sortBy = searchParams.get('sortBy') || undefined;
    }
    
    if (searchParams.has('sortDirection')) {
      filter.sortDirection = searchParams.get('sortDirection') as any || undefined;
    }
    
    // Erweiterte Daten anfordern?
    const extended = searchParams.has('extended') && searchParams.get('extended') === 'true';
    
    // Daten abrufen
    const result = extended 
      ? await TalentPoolService.getTalentPoolEntriesExtended(filter)
      : await TalentPoolService.getTalentPoolEntries(filter);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Fehler beim Abrufen der Talent-Pool-Einträge:', error);
    return NextResponse.json(
      { error: error.message || 'Unbekannter Fehler' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/talent-pool
 * Fügt einen neuen Eintrag zum Talent-Pool hinzu
 */
export async function POST(request: NextRequest) {
  try {
    // Tabellen initialisieren, falls nicht vorhanden
    await TalentPoolService.initTalentPoolTables();
    
    // Request-Body auslesen
    const body = await request.json();
    
    // Parameter validieren
    if (!body.entity_id || !body.entity_type) {
      return NextResponse.json(
        { error: 'entity_id und entity_type sind erforderlich' },
        { status: 400 }
      );
    }
    
    const params: CreateTalentPoolEntryParams = {
      entity_id: body.entity_id,
      entity_type: body.entity_type,
      added_by: body.added_by,
      reason: body.reason,
      notes: body.notes,
      rating: body.rating,
      tags: body.tags,
      status: body.status,
      reminder_date: body.reminder_date
    };
    
    // Eintrag zum Talent-Pool hinzufügen
    const result = await TalentPoolService.addToTalentPool(params);
    
    if (!result) {
      return NextResponse.json(
        { error: 'Fehler beim Hinzufügen zum Talent-Pool' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Fehler beim Hinzufügen zum Talent-Pool:', error);
    return NextResponse.json(
      { error: error.message || 'Unbekannter Fehler' },
      { status: 500 }
    );
  }
}
