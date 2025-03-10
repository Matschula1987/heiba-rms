import { NextRequest, NextResponse } from 'next/server';
import { talent360Integration } from '@/lib/talent360Integration';
import { TalentPoolService } from '@/lib/talentPoolService';
import { realtimeNotificationService } from '@/lib/realtimeNotificationService';

/**
 * POST /api/talent360/webhooks
 * Verarbeitet eingehende Webhook-Ereignisse von Talent360
 */
export async function POST(request: NextRequest) {
  try {
    // Webhook-Secret prüfen
    const webhookSecret = process.env.TALENT360_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('Talent360 Webhook-Secret nicht konfiguriert');
      return NextResponse.json(
        { error: 'Webhook nicht konfiguriert' },
        { status: 501 }
      );
    }

    // Request-Body auslesen
    const payload = await request.json();

    // Signatur validieren
    if (!talent360Integration.verifyWebhookSignature(payload)) {
      console.error('Ungültige Webhook-Signatur');
      return NextResponse.json(
        { error: 'Ungültige Signatur' },
        { status: 401 }
      );
    }

    // Event-Typ und Daten extrahieren
    const { event, data } = payload;

    // Sicherstellen, dass die Talent-Pool-Tabellen existieren
    await TalentPoolService.initTalentPoolTables();

    // Event-Typ verarbeiten
    switch (event) {
      case 'application.created':
        await handleApplicationCreated(data);
        break;
      case 'application.updated':
        await handleApplicationUpdated(data);
        break;
      case 'application.status_changed':
        await handleApplicationStatusChanged(data);
        break;
      case 'job.created':
        await handleJobCreated(data);
        break;
      case 'job.updated':
        await handleJobUpdated(data);
        break;
      case 'job.status_changed':
        await handleJobStatusChanged(data);
        break;
      default:
        console.warn(`Unbekannter Event-Typ: ${event}`);
        return NextResponse.json(
          { error: 'Unbekannter Event-Typ' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      status: 'success',
      message: `Event ${event} erfolgreich verarbeitet`
    });
  } catch (error: any) {
    console.error('Fehler bei der Verarbeitung des Talent360-Webhooks:', error);
    return NextResponse.json(
      { error: error.message || 'Unbekannter Fehler' },
      { status: 500 }
    );
  }
}

/**
 * Verarbeitet ein application.created-Ereignis
 */
async function handleApplicationCreated(data: any) {
  try {
    console.log('Neue Bewerbung von Talent360 erhalten:', data.id);

    // Bewerbung in unser System konvertieren und speichern
    // Dies ist eine vereinfachte Version, in einer vollständigen Implementierung
    // würden wir die Bewerbung in die Datenbank speichern und zum Talent-Pool hinzufügen
    const convertedApplication = await talent360Integration.syncApplications();

    // Echtzeitbenachrichtigung erstellen
    await realtimeNotificationService.createNotification({
      title: 'Neue Bewerbung',
      message: `Neue Bewerbung über Talent360 erhalten: ${data.firstName} ${data.lastName}`,
      user_id: 'admin', // Standard-Benutzer oder aus der Konfiguration
      entity_type: 'application',
      entity_id: data.id,
      action: 'created',
      importance: 'normal',
      sender_id: 'talent360-system'
    });

    // In einer vollständigen Implementierung würden wir hier die Bewerbung 
    // in der Datenbank speichern und zum Talent-Pool hinzufügen
  } catch (error) {
    console.error('Fehler bei der Verarbeitung einer neuen Bewerbung:', error);
    throw error;
  }
}

/**
 * Verarbeitet ein application.updated-Ereignis
 */
async function handleApplicationUpdated(data: any) {
  try {
    console.log('Bewerbungsaktualisierung von Talent360 erhalten:', data.id);

    // In einer vollständigen Implementierung würden wir hier die Bewerbung in der Datenbank aktualisieren
  } catch (error) {
    console.error('Fehler bei der Verarbeitung einer Bewerbungsaktualisierung:', error);
    throw error;
  }
}

/**
 * Verarbeitet ein application.status_changed-Ereignis
 */
async function handleApplicationStatusChanged(data: any) {
  try {
    console.log('Statusänderung einer Bewerbung von Talent360 erhalten:', data.id, data.status);

    // In einer vollständigen Implementierung würden wir hier den Status der Bewerbung in der Datenbank aktualisieren
    // und ggf. weitere Aktionen ausführen (z.B. Benachrichtigungen senden)
  } catch (error) {
    console.error('Fehler bei der Verarbeitung einer Bewerbungsstatusänderung:', error);
    throw error;
  }
}

/**
 * Verarbeitet ein job.created-Ereignis
 */
async function handleJobCreated(data: any) {
  try {
    console.log('Neuer Job von Talent360 erhalten:', data.id);

    // In einer vollständigen Implementierung würden wir hier den Job in der Datenbank speichern
  } catch (error) {
    console.error('Fehler bei der Verarbeitung eines neuen Jobs:', error);
    throw error;
  }
}

/**
 * Verarbeitet ein job.updated-Ereignis
 */
async function handleJobUpdated(data: any) {
  try {
    console.log('Jobaktualisierung von Talent360 erhalten:', data.id);

    // In einer vollständigen Implementierung würden wir hier den Job in der Datenbank aktualisieren
  } catch (error) {
    console.error('Fehler bei der Verarbeitung einer Jobaktualisierung:', error);
    throw error;
  }
}

/**
 * Verarbeitet ein job.status_changed-Ereignis
 */
async function handleJobStatusChanged(data: any) {
  try {
    console.log('Statusänderung eines Jobs von Talent360 erhalten:', data.id, data.status);

    // In einer vollständigen Implementierung würden wir hier den Status des Jobs in der Datenbank aktualisieren
  } catch (error) {
    console.error('Fehler bei der Verarbeitung einer Jobstatusänderung:', error);
    throw error;
  }
}
