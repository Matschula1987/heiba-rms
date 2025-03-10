import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import customerRequirementMatcher from '@/lib/matcher/CustomerRequirementMatcher';
import { z } from 'zod';

// Schema für die Anfragen
const CalculateMatchesForRequirementSchema = z.object({
  requirementId: z.string(),
  notifyOnMatches: z.boolean().optional(),
  minScoreForNotification: z.number().min(0).max(100).optional()
});

const CalculateMatchesForEntitySchema = z.object({
  entityType: z.enum(['candidate', 'application', 'talent_pool']),
  entityId: z.string(),
  notifyOnMatches: z.boolean().optional(),
  minScoreForNotification: z.number().min(0).max(100).optional()
});

const RunFullMatchingSchema = z.object({
  minScoreForNotification: z.number().min(0).max(100).optional()
});

/**
 * Route für API-Endpunkte zur Berechnung von Matches zwischen
 * Kundenanforderungen und Kandidaten/Bewerbungen/Talent-Pool-Einträgen
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    switch (action) {
      case 'calculateMatchesForRequirement': {
        const parsedData = CalculateMatchesForRequirementSchema.safeParse(body.data);
        if (!parsedData.success) {
          return NextResponse.json({ error: 'Ungültige Anfrageparameter', details: parsedData.error }, { status: 400 });
        }

        const { requirementId, notifyOnMatches, minScoreForNotification } = parsedData.data;
        const matches = await customerRequirementMatcher.calculateMatchesForRequirement(
          requirementId, 
          notifyOnMatches, 
          minScoreForNotification
        );

        return NextResponse.json({ 
          success: true, 
          matches, 
          totalCount: matches.length 
        });
      }

      case 'calculateMatchesForEntity': {
        const parsedData = CalculateMatchesForEntitySchema.safeParse(body.data);
        if (!parsedData.success) {
          return NextResponse.json({ error: 'Ungültige Anfrageparameter', details: parsedData.error }, { status: 400 });
        }

        const { entityType, entityId, notifyOnMatches, minScoreForNotification } = parsedData.data;
        const matches = await customerRequirementMatcher.calculateMatchesForEntity(
          entityType,
          entityId,
          notifyOnMatches,
          minScoreForNotification
        );

        return NextResponse.json({ 
          success: true, 
          matches, 
          totalCount: matches.length 
        });
      }

      case 'runFullMatching': {
        const parsedData = RunFullMatchingSchema.safeParse(body.data);
        if (!parsedData.success) {
          return NextResponse.json({ error: 'Ungültige Anfrageparameter', details: parsedData.error }, { status: 400 });
        }

        const { minScoreForNotification } = parsedData.data;
        const totalMatches = await customerRequirementMatcher.runFullMatching(minScoreForNotification);

        return NextResponse.json({ 
          success: true, 
          totalMatches 
        });
      }

      default:
        return NextResponse.json({ error: 'Ungültige Aktion' }, { status: 400 });
    }
  } catch (error) {
    console.error('Fehler bei der Matchberechnung:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * GET-Endpunkt zum Abrufen von Matches für eine Kundenanforderung oder Entität
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const requirementId = searchParams.get('requirementId');
    const entityType = searchParams.get('entityType') as 'candidate' | 'application' | 'talent_pool' | null;
    const entityId = searchParams.get('entityId');
    const minScore = searchParams.get('minScore');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    const db = await getDb();
    let query = 'SELECT * FROM customer_requirement_matches';
    const params: any[] = [];
    const whereConditions: string[] = [];

    if (requirementId) {
      whereConditions.push('requirement_id = ?');
      params.push(requirementId);
    }

    if (entityType && entityId) {
      whereConditions.push('entity_type = ? AND entity_id = ?');
      params.push(entityType, entityId);
    }

    if (minScore) {
      whereConditions.push('match_score >= ?');
      params.push(parseInt(minScore));
    }

    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }

    query += ' ORDER BY match_score DESC';

    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit));
      
      if (offset) {
        query += ' OFFSET ?';
        params.push(parseInt(offset));
      }
    }

    const matches = await db.all(query, params);

    // Hole zusätzliche Informationen für jedes Match
    for (const match of matches) {
      // Anforderungsdaten abrufen
      const requirement = await db.get(
        'SELECT title, customer_id FROM requirements WHERE id = ?',
        [match.requirement_id]
      );

      if (requirement) {
        match.requirement_title = requirement.title;
        match.customer_id = requirement.customer_id;

        // Kundendaten abrufen
        const customer = await db.get(
          'SELECT name FROM customers WHERE id = ?',
          [requirement.customer_id]
        );

        if (customer) {
          match.customer_name = customer.name;
        }
      }

      // Entitätsdaten abrufen
      switch (match.entity_type) {
        case 'candidate':
          const candidate = await db.get(
            'SELECT name, email, phone FROM candidates WHERE id = ?',
            [match.entity_id]
          );
          if (candidate) {
            match.entity_name = candidate.name;
            match.entity_email = candidate.email;
            match.entity_phone = candidate.phone;
          }
          break;
        case 'application':
          const application = await db.get(
            'SELECT applicant_name as name, email, phone FROM applications_extended WHERE id = ?',
            [match.entity_id]
          );
          if (application) {
            match.entity_name = application.name;
            match.entity_email = application.email;
            match.entity_phone = application.phone;
          }
          break;
        case 'talent_pool':
          const tp = await db.get(
            'SELECT entity_id, entity_type FROM talent_pool WHERE id = ?',
            [match.entity_id]
          );
          if (tp && tp.entity_type === 'candidate') {
            const tpCandidate = await db.get(
              'SELECT name, email, phone FROM candidates WHERE id = ?',
              [tp.entity_id]
            );
            if (tpCandidate) {
              match.entity_name = tpCandidate.name;
              match.entity_email = tpCandidate.email;
              match.entity_phone = tpCandidate.phone;
            }
          }
          break;
      }
    }

    return NextResponse.json({ 
      success: true, 
      matches, 
      totalCount: matches.length 
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Matches:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler', details: (error as Error).message },
      { status: 500 }
    );
  }
}
