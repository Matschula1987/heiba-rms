import { NextRequest, NextResponse } from 'next/server';
import { PhoneService } from '@/lib/phone/PhoneService';
import { getDb } from '@/lib/db';

const phoneService = new PhoneService();

/**
 * POST /api/phone-integration/click-to-call
 * 
 * Initiiert einen Anruf über Click-to-Call
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validiere die erforderlichen Felder
    if (!body.userId || !body.phoneNumber) {
      return NextResponse.json(
        { error: 'Benutzer-ID und Telefonnummer sind erforderlich' },
        { status: 400 }
      );
    }
    
    // Initiiere den Anruf
    const success = await phoneService.initiateClickToCall(
      body.userId,
      body.phoneNumber,
      body.displayName
    );
    
    // Protokolliere den Anruf
    if (success) {
      try {
        // Erstelle ein Anrufprotokoll
        await phoneService.logCall({
          phoneConfigurationId: body.configId || 'default', // wird normalerweise vom PhoneService gesetzt
          callType: 'outgoing',
          callerNumber: body.callerNumber || 'Unbekannt',
          recipientNumber: body.phoneNumber,
          recipientName: body.displayName || null,
          startTime: new Date().toISOString(),
          status: 'connected', // Optimistisch annehmen, dass der Anruf verbunden wird
          userId: body.userId,
          candidateId: body.candidateId,
          applicationId: body.applicationId,
          jobId: body.jobId,
          talentPoolId: body.talentPoolId,
          requirementId: body.requirementId,
          customerId: body.customerId
        });
        
        // Erstelle eine Click-to-Call-Zuweisung, wenn keine existiert
        if (
          (body.candidateId || body.applicationId || body.jobId || body.talentPoolId || 
           body.requirementId || body.customerId) &&
          body.createAssignment
        ) {
          await phoneService.createClickToCallAssignment({
            phoneNumber: body.phoneNumber,
            displayName: body.displayName,
            priority: 0,
            candidateId: body.candidateId,
            applicationId: body.applicationId,
            jobId: body.jobId,
            talentPoolId: body.talentPoolId,
            requirementId: body.requirementId,
            customerId: body.customerId,
            createdBy: body.userId
          });
        }
      } catch (error) {
        console.error('Fehler beim Protokollieren des Anrufs:', error);
        // Wir brechen nicht ab, wenn die Protokollierung fehlschlägt
      }
    }
    
    return NextResponse.json({ success });
  } catch (error) {
    console.error('Fehler beim Initiieren des Anrufs:', error);
    return NextResponse.json(
      { error: 'Anruf konnte nicht initiiert werden' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/phone-integration/click-to-call
 * 
 * Holt Click-to-Call-Zuweisungen für eine Entity (z.B. Kandidat, Bewerbung, etc.)
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const candidateId = url.searchParams.get('candidateId');
    const applicationId = url.searchParams.get('applicationId');
    const jobId = url.searchParams.get('jobId');
    const talentPoolId = url.searchParams.get('talentPoolId');
    const requirementId = url.searchParams.get('requirementId');
    const customerId = url.searchParams.get('customerId');
    
    if (!candidateId && !applicationId && !jobId && !talentPoolId && !requirementId && !customerId) {
      return NextResponse.json(
        { error: 'Mindestens eine Entity-ID ist erforderlich' },
        { status: 400 }
      );
    }
    
    const db = await getDb();
    
    // Baue die WHERE-Klausel basierend auf den Parametern
    const where = [];
    const params = [];
    
    if (candidateId) {
      where.push('candidate_id = ?');
      params.push(candidateId);
    }
    if (applicationId) {
      where.push('application_id = ?');
      params.push(applicationId);
    }
    if (jobId) {
      where.push('job_id = ?');
      params.push(jobId);
    }
    if (talentPoolId) {
      where.push('talent_pool_id = ?');
      params.push(talentPoolId);
    }
    if (requirementId) {
      where.push('requirement_id = ?');
      params.push(requirementId);
    }
    if (customerId) {
      where.push('customer_id = ?');
      params.push(customerId);
    }
    
    const query = `
      SELECT * FROM click_to_call_assignments
      WHERE ${where.join(' OR ')}
      ORDER BY priority DESC, created_at DESC
    `;
    
    const assignments = await db.all(query, params);
    
    // Konvertiere die Ergebnisse
    const result = assignments.map((a: any) => ({
      id: a.id,
      phoneNumber: a.phone_number,
      displayName: a.display_name,
      priority: a.priority,
      candidateId: a.candidate_id,
      applicationId: a.application_id,
      jobId: a.job_id,
      talentPoolId: a.talent_pool_id,
      requirementId: a.requirement_id,
      customerId: a.customer_id,
      createdBy: a.created_by,
      createdAt: a.created_at
    }));
    
    return NextResponse.json({ assignments: result });
  } catch (error) {
    console.error('Fehler beim Abrufen der Click-to-Call-Zuweisungen:', error);
    return NextResponse.json(
      { error: 'Click-to-Call-Zuweisungen konnten nicht abgerufen werden' },
      { status: 500 }
    );
  }
}
