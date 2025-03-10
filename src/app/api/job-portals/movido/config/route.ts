import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { MovidoAuthModule } from '@/lib/movidoAutomation/modules/MovidoAuthModule';

/**
 * GET Handler zum Abrufen der Movido-Konfiguration
 */
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    
    // Abrufen der Movido-Konfiguration aus der Datenbank
    const config = await db.get('SELECT * FROM movido_configurations LIMIT 1');
    
    // Abrufen der aktiven Job-Warteschlange
    const queueItems = await db.all(`
      SELECT * FROM movido_job_queue 
      ORDER BY 
        CASE 
          WHEN status = 'processing' THEN 1
          WHEN status = 'pending' THEN 2
          WHEN status = 'scheduled' THEN 3
          WHEN status = 'completed' THEN 4
          WHEN status = 'failed' THEN 5
          ELSE 6
        END,
        created_at DESC
      LIMIT 100
    `);
    
    // Abrufen der Veröffentlichungszyklen
    const postingCycles = await db.all('SELECT * FROM movido_posting_cycles ORDER BY name');
    
    // Abrufen des Verbindungsstatus
    const authModule = new MovidoAuthModule();
    const isConnected = await authModule.hasValidSession();
    
    // Verarbeiten der Konfiguration für die Antwort
    let configResponse = null;
    if (config) {
      configResponse = {
        apiKey: config.api_key,
        apiSecret: config.api_secret,
        companyId: config.company_id,
        defaultPremium: Boolean(config.default_premium),
        defaultTargetPortals: config.default_target_portals ? JSON.parse(config.default_target_portals) : [],
        autoLoginEnabled: Boolean(config.auto_login_enabled),
        sessionTimeoutMinutes: config.session_timeout_minutes
      };
    }
    
    return NextResponse.json({
      config: configResponse,
      queueItems,
      postingCycles,
      isConnected
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Movido-Konfiguration:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Movido-Konfiguration' },
      { status: 500 }
    );
  }
}

/**
 * POST Handler zum Speichern der Movido-Konfiguration
 */
export async function POST(request: NextRequest) {
  try {
    const { config } = await request.json();
    
    if (!config) {
      return NextResponse.json(
        { error: 'Keine Konfiguration angegeben' },
        { status: 400 }
      );
    }
    
    // Validieren der erforderlichen Felder
    if (!config.apiKey || !config.apiSecret || !config.companyId) {
      return NextResponse.json(
        { error: 'API-Schlüssel, API-Secret und Unternehmens-ID sind erforderlich' },
        { status: 400 }
      );
    }
    
    const db = await getDb();
    
    // Prüfen, ob bereits eine Konfiguration existiert
    const existingConfig = await db.get('SELECT id FROM movido_configurations LIMIT 1');
    
    // Vorbereiten der zu speichernden Daten
    const configData = {
      api_key: config.apiKey,
      api_secret: config.apiSecret,
      company_id: config.companyId,
      default_premium: config.defaultPremium ? 1 : 0,
      default_target_portals: JSON.stringify(config.defaultTargetPortals || []),
      auto_login_enabled: config.autoLoginEnabled ? 1 : 0,
      session_timeout_minutes: config.sessionTimeoutMinutes || 120,
      updated_at: new Date().toISOString()
    };
    
    if (existingConfig) {
      // Aktualisieren der bestehenden Konfiguration
      await db.run(`
        UPDATE movido_configurations 
        SET 
          api_key = ?,
          api_secret = ?,
          company_id = ?,
          default_premium = ?,
          default_target_portals = ?,
          auto_login_enabled = ?,
          session_timeout_minutes = ?,
          updated_at = ?
        WHERE id = ?
      `, [
        configData.api_key,
        configData.api_secret,
        configData.company_id,
        configData.default_premium,
        configData.default_target_portals,
        configData.auto_login_enabled,
        configData.session_timeout_minutes,
        configData.updated_at,
        existingConfig.id
      ]);
    } else {
      // Erstellen einer neuen Konfiguration
      await db.run(`
        INSERT INTO movido_configurations (
          id, api_key, api_secret, company_id, default_premium, default_target_portals,
          auto_login_enabled, session_timeout_minutes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        uuidv4(),
        configData.api_key,
        configData.api_secret,
        configData.company_id,
        configData.default_premium,
        configData.default_target_portals,
        configData.auto_login_enabled,
        configData.session_timeout_minutes,
        configData.updated_at,
        configData.updated_at
      ]);
    }
    
    // Löschen aller bestehenden Sessions, damit ein neuer Login mit den aktualisierten Daten erfolgt
    const authModule = new MovidoAuthModule();
    await authModule.clearSessions();
    
    return NextResponse.json({
      success: true,
      message: 'Movido-Konfiguration erfolgreich gespeichert'
    });
  } catch (error) {
    console.error('Fehler beim Speichern der Movido-Konfiguration:', error);
    return NextResponse.json(
      { error: 'Fehler beim Speichern der Movido-Konfiguration' },
      { status: 500 }
    );
  }
}
