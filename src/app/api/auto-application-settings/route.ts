import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// GET: Alle Einstellungen abrufen
export async function GET() {
  try {
    const db = await getDb();
    
    // Aktive Einstellungen zuerst, dann absteigend nach Datum sortiert
    const settings = await db.all(`
      SELECT * FROM auto_application_settings 
      ORDER BY active DESC, updated_at DESC
    `);
    
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Fehler beim Abrufen der Einstellungen:', error);
    return NextResponse.json(
      { success: false, error: 'Einstellungen konnten nicht abgerufen werden' },
      { status: 500 }
    );
  }
}

// POST: Neue Einstellungen erstellen
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, 
      description, 
      minMatchScoreAutoConversion, 
      maxMatchScoreAutoRejection,
      enableAutoRejection,
      rejectionDelayDays,
      rejectionTemplateId,
      emailConfigId,
      notifyTeamOnNewApplication,
      notifyTeamOnAutoConversion,
      notifyTeamOnAutoRejection,
      autoAddToTalentPool,
      active,
      userId
    } = body;
    
    // Grundlegende Validierung
    if (!name || !userId) {
      return NextResponse.json(
        { success: false, error: 'Name und Benutzer-ID sind erforderlich' },
        { status: 400 }
      );
    }
    
    // Wenn als aktiv markiert, alle anderen deaktivieren
    const db = await getDb();
    
    if (active) {
      await db.run(`
        UPDATE auto_application_settings
        SET active = 0, updated_at = CURRENT_TIMESTAMP
        WHERE active = 1
      `);
    }
    
    // Neue Einstellungen einfügen
    const id = uuidv4();
    
    await db.run(`
      INSERT INTO auto_application_settings (
        id, name, description,
        min_match_score_auto_conversion, max_match_score_auto_rejection,
        enable_auto_rejection, rejection_delay_days, rejection_template_id,
        email_config_id,
        notify_team_new_application, notify_team_auto_conversion, notify_team_auto_rejection,
        auto_add_to_talent_pool, active, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      name,
      description || null,
      minMatchScoreAutoConversion || 85,
      maxMatchScoreAutoRejection || 50,
      enableAutoRejection ? 1 : 0,
      rejectionDelayDays || 3,
      rejectionTemplateId || null,
      emailConfigId || null,
      notifyTeamOnNewApplication ? 1 : 0,
      notifyTeamOnAutoConversion ? 1 : 0,
      notifyTeamOnAutoRejection ? 1 : 0,
      autoAddToTalentPool ? 1 : 0,
      active ? 1 : 0,
      userId
    ]);
    
    // Eingefügte Einstellungen zurückgeben
    const newSettings = await db.get('SELECT * FROM auto_application_settings WHERE id = ?', [id]);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Einstellungen erfolgreich erstellt',
      settings: newSettings
    });
  } catch (error) {
    console.error('Fehler beim Erstellen der Einstellungen:', error);
    return NextResponse.json(
      { success: false, error: 'Einstellungen konnten nicht erstellt werden' },
      { status: 500 }
    );
  }
}

// PUT: Aktive Einstellungen ändern
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Einstellungs-ID ist erforderlich' },
        { status: 400 }
      );
    }
    
    const db = await getDb();
    
    // Prüfen, ob die Einstellungen existieren
    const existing = await db.get('SELECT * FROM auto_application_settings WHERE id = ?', [id]);
    
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Einstellungen nicht gefunden' },
        { status: 404 }
      );
    }
    
    // Wenn als aktiv markiert und noch nicht aktiv, alle anderen deaktivieren
    if (updateData.active && !existing.active) {
      await db.run(`
        UPDATE auto_application_settings
        SET active = 0, updated_at = CURRENT_TIMESTAMP
        WHERE active = 1
      `);
    }
    
    // SQL und Parameter für das Update erstellen
    const updateFields = [];
    const values = [];
    
    if (updateData.name !== undefined) {
      updateFields.push('name = ?');
      values.push(updateData.name);
    }
    
    if (updateData.description !== undefined) {
      updateFields.push('description = ?');
      values.push(updateData.description || null);
    }
    
    if (updateData.minMatchScoreAutoConversion !== undefined) {
      updateFields.push('min_match_score_auto_conversion = ?');
      values.push(updateData.minMatchScoreAutoConversion);
    }
    
    if (updateData.maxMatchScoreAutoRejection !== undefined) {
      updateFields.push('max_match_score_auto_rejection = ?');
      values.push(updateData.maxMatchScoreAutoRejection);
    }
    
    if (updateData.enableAutoRejection !== undefined) {
      updateFields.push('enable_auto_rejection = ?');
      values.push(updateData.enableAutoRejection ? 1 : 0);
    }
    
    if (updateData.rejectionDelayDays !== undefined) {
      updateFields.push('rejection_delay_days = ?');
      values.push(updateData.rejectionDelayDays);
    }
    
    if (updateData.rejectionTemplateId !== undefined) {
      updateFields.push('rejection_template_id = ?');
      values.push(updateData.rejectionTemplateId || null);
    }
    
    if (updateData.emailConfigId !== undefined) {
      updateFields.push('email_config_id = ?');
      values.push(updateData.emailConfigId || null);
    }
    
    if (updateData.notifyTeamOnNewApplication !== undefined) {
      updateFields.push('notify_team_new_application = ?');
      values.push(updateData.notifyTeamOnNewApplication ? 1 : 0);
    }
    
    if (updateData.notifyTeamOnAutoConversion !== undefined) {
      updateFields.push('notify_team_auto_conversion = ?');
      values.push(updateData.notifyTeamOnAutoConversion ? 1 : 0);
    }
    
    if (updateData.notifyTeamOnAutoRejection !== undefined) {
      updateFields.push('notify_team_auto_rejection = ?');
      values.push(updateData.notifyTeamOnAutoRejection ? 1 : 0);
    }
    
    if (updateData.autoAddToTalentPool !== undefined) {
      updateFields.push('auto_add_to_talent_pool = ?');
      values.push(updateData.autoAddToTalentPool ? 1 : 0);
    }
    
    if (updateData.active !== undefined) {
      updateFields.push('active = ?');
      values.push(updateData.active ? 1 : 0);
    }
    
    // Aktualisierungszeit hinzufügen
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    
    // Wenn keine Felder zu aktualisieren sind, nichts tun
    if (updateFields.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Keine Änderungen vorgenommen',
        settings: existing
      });
    }
    
    // Update ausführen
    await db.run(
      `UPDATE auto_application_settings SET ${updateFields.join(', ')} WHERE id = ?`,
      [...values, id]
    );
    
    // Aktualisierte Einstellungen zurückgeben
    const updated = await db.get('SELECT * FROM auto_application_settings WHERE id = ?', [id]);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Einstellungen erfolgreich aktualisiert',
      settings: updated
    });
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Einstellungen:', error);
    return NextResponse.json(
      { success: false, error: 'Einstellungen konnten nicht aktualisiert werden' },
      { status: 500 }
    );
  }
}

// DELETE: Einstellungen löschen
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Einstellungs-ID ist erforderlich' },
        { status: 400 }
      );
    }
    
    const db = await getDb();
    
    // Prüfen, ob die Einstellungen existieren
    const existing = await db.get('SELECT * FROM auto_application_settings WHERE id = ?', [id]);
    
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Einstellungen nicht gefunden' },
        { status: 404 }
      );
    }
    
    // Standard-Einstellungen können nicht gelöscht werden
    if (id === 'default') {
      return NextResponse.json(
        { success: false, error: 'Standard-Einstellungen können nicht gelöscht werden' },
        { status: 400 }
      );
    }
    
    // Warnen, wenn aktive Einstellungen gelöscht werden sollen
    if (existing.active) {
      // Standard-Einstellungen aktivieren
      await db.run(`
        UPDATE auto_application_settings
        SET active = 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = 'default'
      `);
    }
    
    // Einstellungen löschen
    await db.run('DELETE FROM auto_application_settings WHERE id = ?', [id]);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Einstellungen erfolgreich gelöscht' 
    });
  } catch (error) {
    console.error('Fehler beim Löschen der Einstellungen:', error);
    return NextResponse.json(
      { success: false, error: 'Einstellungen konnten nicht gelöscht werden' },
      { status: 500 }
    );
  }
}
