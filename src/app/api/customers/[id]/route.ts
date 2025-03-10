import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ensureDbInitializedForApi } from '@/app/api/initDb';
import { Customer } from '@/types/customer';

// GET /api/customers/[id] - Einzelnen Kunden mit allen Details abrufen
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureDbInitializedForApi();
    const db = await getDb();
    const { id } = params;

    // Hauptdaten des Kunden abrufen
    const customer = await db.get(
      `SELECT 
        id, name, type, status, industry, website, address, 
        created_at as createdAt, updated_at as updatedAt, notes
       FROM customers 
       WHERE id = ?`,
      [id]
    );

    if (!customer) {
      return NextResponse.json(
        { error: 'Kunde nicht gefunden' },
        { status: 404 }
      );
    }

    // Adressdaten parsen, falls vorhanden
    if (customer.address) {
      try {
        customer.address = JSON.parse(customer.address);
      } catch (e) {
        console.error('Fehler beim Parsen der Adressdaten:', e);
        customer.address = null;
      }
    }

    // Kontakte des Kunden abrufen
    const contacts = await db.all(
      `SELECT 
        id, customer_id as customerId, first_name as firstName, last_name as lastName,
        position, department, email, phone, mobile, is_main_contact as isMainContact,
        notes, created_at as createdAt, updated_at as updatedAt
       FROM contacts 
       WHERE customer_id = ?
       ORDER BY is_main_contact DESC, last_name ASC, first_name ASC`,
      [id]
    );

    // Kontakthistorie abrufen
    const contactHistory = await db.all(
      `SELECT 
        id, customer_id as customerId, contact_id as contactId, type,
        date, subject, content, created_by as createdBy, 
        follow_up_date as followUpDate, follow_up_completed as followUpCompleted
       FROM contact_history 
       WHERE customer_id = ?
       ORDER BY date DESC`,
      [id]
    );

    // Anhänge für Kontakthistorie ergänzen
    for (const entry of contactHistory) {
      const attachments = await db.all(
        `SELECT file_name as fileName, file_url as fileUrl, file_size as fileSize
         FROM contact_history_attachments 
         WHERE contact_history_id = ?`,
        [entry.id]
      );
      
      if (attachments.length > 0) {
        entry.attachments = attachments.map((a: { fileUrl: string }) => a.fileUrl);
      }
    }

    // Anforderungen abrufen
    const requirements = await db.all(
      `SELECT 
        id, customer_id as customerId, title, description, department,
        location, skills, experience, education, status, priority,
        start_date as startDate, end_date as endDate, is_remote as isRemote,
        created_at as createdAt, updated_at as updatedAt, assigned_to as assignedTo
       FROM requirements 
       WHERE customer_id = ?
       ORDER BY priority DESC, created_at DESC`,
      [id]
    );

    // Skills und weitere JSON-Felder für Anforderungen parsen
    for (const req of requirements) {
      if (req.skills) {
        try {
          req.skills = JSON.parse(req.skills);
        } catch (e) {
          console.error('Fehler beim Parsen der Skills:', e);
          req.skills = [];
        }
      } else {
        req.skills = [];
      }
      
      // Gehaltsdaten abrufen, falls vorhanden
      const salary = await db.get(
        `SELECT min_salary as min, max_salary as max, currency
         FROM requirement_salary 
         WHERE requirement_id = ?`,
        [req.id]
      );
      
      if (salary) {
        req.salary = salary;
      }
      
      // Gematchte Kandidaten abrufen
      const matchedCandidates = await db.all(
        `SELECT 
          candidate_id as candidateId, score, status, last_contact as lastContact
         FROM requirement_candidate_matches 
         WHERE requirement_id = ?
         ORDER BY score DESC`,
        [req.id]
      );
      
      if (matchedCandidates.length > 0) {
        req.matchedCandidates = matchedCandidates;
      }
    }

    // Vollständigen Kunden mit allen Beziehungen zurückgeben
    const fullCustomer = {
      ...customer,
      contacts,
      contactHistory,
      requirements
    };

    return NextResponse.json(fullCustomer);
  } catch (error) {
    console.error('Fehler beim Abrufen des Kunden:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen des Kunden' },
      { status: 500 }
    );
  }
}

// PATCH /api/customers/[id] - Kundendaten aktualisieren
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureDbInitializedForApi();
    const db = await getDb();
    const { id } = params;
    const data = await request.json();

    // Prüfen, ob der Kunde existiert
    const existingCustomer = await db.get(
      'SELECT id FROM customers WHERE id = ?',
      [id]
    );

    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Kunde nicht gefunden' },
        { status: 404 }
      );
    }

    // Zu aktualisierende Felder ermitteln
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    // Alle erlaubten Felder prüfen
    if (data.name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(data.name);
    }

    if (data.type !== undefined) {
      updateFields.push('type = ?');
      updateValues.push(data.type);
    }

    if (data.status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(data.status);
    }

    if (data.industry !== undefined) {
      updateFields.push('industry = ?');
      updateValues.push(data.industry);
    }

    if (data.website !== undefined) {
      updateFields.push('website = ?');
      updateValues.push(data.website);
    }

    if (data.address !== undefined) {
      updateFields.push('address = ?');
      updateValues.push(data.address ? JSON.stringify(data.address) : null);
    }

    if (data.notes !== undefined) {
      updateFields.push('notes = ?');
      updateValues.push(data.notes);
    }

    // updated_at Feld aktualisieren
    const now = new Date().toISOString();
    updateFields.push('updated_at = ?');
    updateValues.push(now);

    // Aktualisierung nur durchführen, wenn es Änderungen gibt
    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'Keine aktualisierbaren Felder angegeben' },
        { status: 400 }
      );
    }

    // UPDATE-Abfrage ausführen
    await db.run(
      `UPDATE customers SET ${updateFields.join(', ')} WHERE id = ?`,
      [...updateValues, id]
    );

    // Aktualisierte Kundendaten abrufen
    const updatedCustomer = await db.get(
      `SELECT 
        id, name, type, status, industry, website, address, 
        created_at as createdAt, updated_at as updatedAt, notes
       FROM customers 
       WHERE id = ?`,
      [id]
    );

    // Adressdaten parsen, falls vorhanden
    if (updatedCustomer.address) {
      try {
        updatedCustomer.address = JSON.parse(updatedCustomer.address);
      } catch (e) {
        console.error('Fehler beim Parsen der Adressdaten:', e);
        updatedCustomer.address = null;
      }
    }

    return NextResponse.json(updatedCustomer);
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Kunden:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Kunden' },
      { status: 500 }
    );
  }
}

// DELETE /api/customers/[id] - Kunden löschen
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureDbInitializedForApi();
    const db = await getDb();
    const { id } = params;

    // Prüfen, ob der Kunde existiert
    const existingCustomer = await db.get(
      'SELECT id FROM customers WHERE id = ?',
      [id]
    );

    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Kunde nicht gefunden' },
        { status: 404 }
      );
    }

    // Transaktion starten
    await db.run('BEGIN TRANSACTION');

    try {
      // Zuerst alle verknüpften Daten löschen
      
      // 1. Kontaktanhänge löschen
      await db.run(`
        DELETE FROM contact_history_attachments 
        WHERE contact_history_id IN (
          SELECT id FROM contact_history WHERE customer_id = ?
        )
      `, [id]);
      
      // 2. Kontakthistorie löschen
      await db.run(
        'DELETE FROM contact_history WHERE customer_id = ?',
        [id]
      );
      
      // 3. Anforderungs-Kandidaten-Matches löschen
      await db.run(`
        DELETE FROM requirement_candidate_matches 
        WHERE requirement_id IN (
          SELECT id FROM requirements WHERE customer_id = ?
        )
      `, [id]);
      
      // 4. Gehaltsangaben für Anforderungen löschen
      await db.run(`
        DELETE FROM requirement_salary 
        WHERE requirement_id IN (
          SELECT id FROM requirements WHERE customer_id = ?
        )
      `, [id]);
      
      // 5. Anforderungen löschen
      await db.run(
        'DELETE FROM requirements WHERE customer_id = ?',
        [id]
      );
      
      // 6. Kontakte löschen
      await db.run(
        'DELETE FROM contacts WHERE customer_id = ?',
        [id]
      );
      
      // 7. Schließlich den Kunden selbst löschen
      await db.run(
        'DELETE FROM customers WHERE id = ?',
        [id]
      );
      
      // Transaktion abschließen
      await db.run('COMMIT');
      
      return NextResponse.json({ success: true });
    } catch (error) {
      // Transaktion im Fehlerfall zurückrollen
      await db.run('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Fehler beim Löschen des Kunden:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Kunden' },
      { status: 500 }
    );
  }
}
