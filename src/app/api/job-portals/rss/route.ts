import { NextResponse, NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { RSSFeedManager } from "@/lib/jobPortals/rss/RSSFeedManager";

/**
 * Endpunkt für RSS-Feed-Management
 */
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    
    // Alle RSS-Feed-Quellen aus der Datenbank abrufen
    const sources = await db.all("SELECT * FROM rss_feed_sources ORDER BY name");
    
    return NextResponse.json({ sources });
  } catch (error) {
    console.error("[RSS-API] Error loading RSS sources:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der RSS-Feed-Quellen" },
      { status: 500 }
    );
  }
}

/**
 * Endpunkt zum Hinzufügen/Aktualisieren von RSS-Feed-Quellen
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const feedManager = new RSSFeedManager();
    
    // Wenn es sich um eine neue Feed-Quelle handelt
    if (data.name && data.url) {
      const sourceData = {
        name: data.name,
        url: data.url,
        category: data.category || null,
        sourceType: data.sourceType || "generic",
        formatTemplate: data.formatTemplate || null,
        active: data.active !== undefined ? data.active : true,
        updateInterval: data.updateInterval || 60,
        errorCount: 0
      };
      
      const id = await feedManager.addFeedSource(sourceData);
      
      // Alle Feed-Quellen zurückgeben
      const db = await getDb();
      const sources = await db.all("SELECT * FROM rss_feed_sources ORDER BY name");
      
      return NextResponse.json({ 
        success: true, 
        message: "Feed-Quelle hinzugefügt", 
        id, 
        sources 
      });
    }
    
    // Wenn es sich um ein Update handelt (single source)
    if (Object.keys(data).length === 1) {
      const sourceId = Object.keys(data)[0];
      const sourceData = data[sourceId];
      
      await feedManager.updateFeedSource(sourceId, sourceData);
      
      // Alle Feed-Quellen zurückgeben
      const db = await getDb();
      const sources = await db.all("SELECT * FROM rss_feed_sources ORDER BY name");
      
      return NextResponse.json({ 
        success: true, 
        message: "Feed-Quelle aktualisiert", 
        sources 
      });
    }
    
    return NextResponse.json(
      { error: "Ungültige Anfrage" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[RSS-API] Error adding/updating RSS source:", error);
    return NextResponse.json(
      { error: "Fehler beim Hinzufügen/Aktualisieren der RSS-Feed-Quelle" },
      { status: 500 }
    );
  }
}

/**
 * Endpunkt zum Aktualisieren einer bestimmten RSS-Feed-Quelle
 */
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const feedManager = new RSSFeedManager();
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json(
        { error: "Keine Feed-ID angegeben" },
        { status: 400 }
      );
    }
    
    await feedManager.updateFeedSource(id, data);
    
    // Aktualisierte Feed-Quelle zurückgeben
    const db = await getDb();
    const source = await db.get("SELECT * FROM rss_feed_sources WHERE id = ?", [id]);
    
    return NextResponse.json({ 
      success: true, 
      message: "Feed-Quelle aktualisiert", 
      source 
    });
  } catch (error) {
    console.error("[RSS-API] Error updating RSS source:", error);
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren der RSS-Feed-Quelle" },
      { status: 500 }
    );
  }
}

/**
 * Endpunkt zum Löschen einer RSS-Feed-Quelle
 */
export async function DELETE(request: NextRequest) {
  try {
    const feedManager = new RSSFeedManager();
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json(
        { error: "Keine Feed-ID angegeben" },
        { status: 400 }
      );
    }
    
    await feedManager.deleteFeedSource(id);
    
    return NextResponse.json({ 
      success: true, 
      message: "Feed-Quelle gelöscht" 
    });
  } catch (error) {
    console.error("[RSS-API] Error deleting RSS source:", error);
    return NextResponse.json(
      { error: "Fehler beim Löschen der RSS-Feed-Quelle" },
      { status: 500 }
    );
  }
}

// Handler für dynamische Routen
export async function generateStaticParams() {
  return [];
}
