import { NextResponse, NextRequest } from "next/server";
import { getDb } from "@/lib/db";

/**
 * Endpunkt für die Konfiguration von RSS-Feeds
 */
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    
    // Alle RSS-Feed-Quellen und ihre Konfiguration aus der Datenbank abrufen
    const feedSources = await db.all("SELECT * FROM rss_feed_sources ORDER BY name");
    
    // Konfiguration für RSS-Adapter aus der Datenbank abrufen
    const adapterConfig = await db.get(
      "SELECT value FROM job_portal_config WHERE portal_key = ?", 
      ["rss_feed"]
    );

    return NextResponse.json({
      success: true,
      config: adapterConfig ? JSON.parse(adapterConfig.value) : {},
      feedSources: feedSources || []
    });
  } catch (error) {
    console.error("[RSS-Feed-Config-API] Error loading config:", error);
    return NextResponse.json(
      { success: false, error: "Fehler beim Laden der Konfiguration" },
      { status: 500 }
    );
  }
}

/**
 * Endpunkt zur Aktualisierung der RSS-Feed-Konfiguration
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const db = await getDb();
    
    // Adapter-Konfiguration in der Datenbank speichern oder aktualisieren
    if (data.adapterConfig) {
      const existingConfig = await db.get(
        "SELECT id FROM job_portal_config WHERE portal_key = ?", 
        ["rss_feed"]
      );
      
      if (existingConfig) {
        await db.run(
          "UPDATE job_portal_config SET value = ?, updated_at = datetime('now') WHERE portal_key = ?",
          [JSON.stringify(data.adapterConfig), "rss_feed"]
        );
      } else {
        await db.run(
          "INSERT INTO job_portal_config (portal_key, value, created_at, updated_at) VALUES (?, ?, datetime('now'), datetime('now'))",
          ["rss_feed", JSON.stringify(data.adapterConfig)]
        );
      }
    }
    
    // Wenn Änderungen an einer Feed-Quelle vorgenommen wurden
    if (data.feedSourceId && data.feedSourceConfig) {
      // Existierende Feed-Quelle aktualisieren
      await db.run(
        `UPDATE rss_feed_sources SET 
          name = ?, 
          url = ?, 
          category = ?, 
          source_type = ?, 
          format_template = ?, 
          active = ?, 
          update_interval = ?,
          updated_at = datetime('now')
         WHERE id = ?`,
        [
          data.feedSourceConfig.name,
          data.feedSourceConfig.url,
          data.feedSourceConfig.category || null,
          data.feedSourceConfig.sourceType || 'generic',
          data.feedSourceConfig.formatTemplate || null,
          data.feedSourceConfig.active ? 1 : 0,
          data.feedSourceConfig.updateInterval || 60,
          data.feedSourceId
        ]
      );
    }
    
    // Neue Feed-Quelle hinzufügen
    if (data.newFeedSource) {
      await db.run(
        `INSERT INTO rss_feed_sources (
          name, url, category, source_type, format_template, active, update_interval, 
          error_count, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, datetime('now'), datetime('now'))`,
        [
          data.newFeedSource.name,
          data.newFeedSource.url,
          data.newFeedSource.category || null,
          data.newFeedSource.sourceType || 'generic',
          data.newFeedSource.formatTemplate || null,
          data.newFeedSource.active ? 1 : 0,
          data.newFeedSource.updateInterval || 60
        ]
      );
    }
    
    // Alle aktualisierten Feed-Quellen zurückgeben
    const feedSources = await db.all("SELECT * FROM rss_feed_sources ORDER BY name");
    
    return NextResponse.json({
      success: true,
      message: "Konfiguration aktualisiert",
      feedSources
    });
  } catch (error) {
    console.error("[RSS-Feed-Config-API] Error saving config:", error);
    return NextResponse.json(
      { success: false, error: "Fehler beim Speichern der Konfiguration" },
      { status: 500 }
    );
  }
}
