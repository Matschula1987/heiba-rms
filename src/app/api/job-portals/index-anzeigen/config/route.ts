import { NextResponse, NextRequest } from "next/server";
import { getDb } from "@/lib/db";

/**
 * Endpunkt für die Konfiguration des Index-Anzeigendaten Portals
 */
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    
    // Konfiguration aus der Datenbank abrufen
    const config = await db.get(
      "SELECT value FROM job_portal_config WHERE portal_key = ?", 
      ["index_anzeigen"]
    );

    return NextResponse.json({
      success: true,
      config: config ? JSON.parse(config.value) : {}
    });
  } catch (error) {
    console.error("[Index-Anzeigen-Config-API] Error loading config:", error);
    return NextResponse.json(
      { success: false, error: "Fehler beim Laden der Konfiguration" },
      { status: 500 }
    );
  }
}

/**
 * Endpunkt zur Aktualisierung der Konfiguration des Index-Anzeigendaten Portals
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const db = await getDb();
    
    // Konfiguration in der Datenbank speichern oder aktualisieren
    const existingConfig = await db.get(
      "SELECT id FROM job_portal_config WHERE portal_key = ?", 
      ["index_anzeigen"]
    );
    
    if (existingConfig) {
      await db.run(
        "UPDATE job_portal_config SET value = ?, updated_at = datetime('now') WHERE portal_key = ?",
        [JSON.stringify(data), "index_anzeigen"]
      );
    } else {
      await db.run(
        "INSERT INTO job_portal_config (portal_key, value, created_at, updated_at) VALUES (?, ?, datetime('now'), datetime('now'))",
        ["index_anzeigen", JSON.stringify(data)]
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Konfiguration aktualisiert",
      config: data
    });
  } catch (error) {
    console.error("[Index-Anzeigen-Config-API] Error saving config:", error);
    return NextResponse.json(
      { success: false, error: "Fehler beim Speichern der Konfiguration" },
      { status: 500 }
    );
  }
}
