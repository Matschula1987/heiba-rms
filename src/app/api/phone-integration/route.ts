import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { PhoneService } from '@/lib/phone/PhoneService';
import { ProCallAdapter } from '@/lib/phone/providers/ProCallAdapter';

const phoneService = new PhoneService();

/**
 * GET /api/phone-integration
 * 
 * Holt alle Telefonanlagen-Konfigurationen
 */
export async function GET(request: NextRequest) {
  try {
    const configs = await phoneService.getConfigurations();
    
    // Aus Sicherheitsgründen keine Passwörter oder API-Keys zurückgeben
    const safeConfigs = configs.map(config => ({
      ...config,
      password: undefined,
      apiKey: undefined
    }));
    
    return NextResponse.json({ configurations: safeConfigs });
  } catch (error) {
    console.error('Fehler beim Abrufen der Telefonanlagen-Konfigurationen:', error);
    return NextResponse.json(
      { error: 'Telefonanlagen-Konfigurationen konnten nicht abgerufen werden' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/phone-integration
 * 
 * Erstellt eine neue Telefonanlagen-Konfiguration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validiere die erforderlichen Felder
    if (!body.name || !body.providerType) {
      return NextResponse.json(
        { error: 'Name und Provider-Typ sind erforderlich' },
        { status: 400 }
      );
    }
    
    const configId = await phoneService.createConfiguration(body);
    
    return NextResponse.json({ id: configId, success: true });
  } catch (error) {
    console.error('Fehler beim Erstellen der Telefonanlagen-Konfiguration:', error);
    return NextResponse.json(
      { error: 'Telefonanlagen-Konfiguration konnte nicht erstellt werden' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/phone-integration
 * 
 * Aktualisiert eine Telefonanlagen-Konfiguration
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validiere die ID
    if (!body.id) {
      return NextResponse.json(
        { error: 'ID ist erforderlich' },
        { status: 400 }
      );
    }
    
    const success = await phoneService.updateConfiguration(body.id, body);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Telefonanlagen-Konfiguration konnte nicht gefunden werden' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success });
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Telefonanlagen-Konfiguration:', error);
    return NextResponse.json(
      { error: 'Telefonanlagen-Konfiguration konnte nicht aktualisiert werden' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/phone-integration
 * 
 * Löscht eine Telefonanlagen-Konfiguration
 */
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID ist erforderlich' },
        { status: 400 }
      );
    }
    
    const success = await phoneService.deleteConfiguration(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Telefonanlagen-Konfiguration konnte nicht gefunden werden' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success });
  } catch (error) {
    console.error('Fehler beim Löschen der Telefonanlagen-Konfiguration:', error);
    return NextResponse.json(
      { error: 'Telefonanlagen-Konfiguration konnte nicht gelöscht werden' },
      { status: 500 }
    );
  }
}
