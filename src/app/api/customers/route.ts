import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ensureDbInitializedForApi } from '@/app/api/initDb';
import { Customer } from '@/types/customer';

// GET /api/customers - Liste aller Kunden abrufen
export async function GET(request: NextRequest) {
  try {
    await ensureDbInitializedForApi();
    const db = await getDb();

    // Parameter für Filterung und Sortierung aus der URL abrufen
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const status = url.searchParams.get('status');
    const searchTerm = url.searchParams.get('search');
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);
    
    // Überprüfen, ob die requirements-Tabelle existiert
    let hasRequirementsTable = false;
    try {
      const requirementsTable = await db.get(`
        SELECT name FROM sqlite_master WHERE type='table' AND name='requirements'
      `);
      hasRequirementsTable = !!requirementsTable;
    } catch (error) {
      console.log('Requirements-Tabelle existiert nicht:', error);
    }

    // SQL-Abfrage aufbauen
    let query = `
      SELECT 
        c.id, c.name, c.type, c.status, c.industry, c.website, c.created_at as createdAt, c.updated_at as updatedAt,
        COUNT(DISTINCT co.id) as contactCount
      FROM customers c
      LEFT JOIN contacts co ON c.id = co.customer_id
    `;
    
    // Requirements nur hinzufügen, wenn die Tabelle existiert
    if (hasRequirementsTable) {
      query = `
        SELECT 
          c.id, c.name, c.type, c.status, c.industry, c.website, c.created_at as createdAt, c.updated_at as updatedAt,
          COUNT(DISTINCT co.id) as contactCount,
          COUNT(DISTINCT r.id) as requirementCount
        FROM customers c
        LEFT JOIN contacts co ON c.id = co.customer_id
        LEFT JOIN requirements r ON c.id = r.customer_id
      `;
    }
    
    const whereConditions = [];
    const queryParams: any[] = [];
    
    // Filterparameter hinzufügen
    if (type) {
      whereConditions.push('c.type = ?');
      queryParams.push(type);
    }
    
    if (status) {
      whereConditions.push('c.status = ?');
      queryParams.push(status);
    }
    
    if (searchTerm) {
      whereConditions.push('(c.name LIKE ? OR c.industry LIKE ?)');
      queryParams.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }
    
    // WHERE-Bedingungen zur Abfrage hinzufügen, falls vorhanden
    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    // Gruppierung und Sortierung
    query += `
      GROUP BY c.id
      ORDER BY c.name ASC
      LIMIT ? OFFSET ?
    `;
    
    queryParams.push(limit, offset);
    
    // Kunden abrufen
    const customers = await db.all(query, ...queryParams);
    
    // Gesamtanzahl der Kunden (für Paginierung)
    let countQuery = 'SELECT COUNT(*) as total FROM customers c';
    
    if (whereConditions.length > 0) {
      countQuery += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    const { total } = await db.get(countQuery, ...queryParams.slice(0, queryParams.length - 2));
    
    // Metadaten für Paginierung
    const meta = {
      total,
      limit,
      offset,
      page: Math.floor(offset / limit) + 1,
      pages: Math.ceil(total / limit)
    };
    
    return NextResponse.json({
      data: customers,
      meta
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Kunden:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Kunden' },
      { status: 500 }
    );
  }
}

// POST /api/customers - Neuen Kunden erstellen
export async function POST(request: NextRequest) {
  try {
    await ensureDbInitializedForApi();
    const db = await getDb();
    const data = await request.json();
    
    // Pflichtfelder überprüfen
    if (!data.name || !data.type || !data.status || !data.industry) {
      return NextResponse.json(
        { error: 'Name, Typ, Status und Branche sind Pflichtfelder' },
        { status: 400 }
      );
    }
    
    // Adressdaten verarbeiten, falls vorhanden
    let addressJson = null;
    if (data.address) {
      addressJson = JSON.stringify(data.address);
    }
    
    // Aktuelles Datum für Zeitstempel
    const now = new Date().toISOString();
    
    // Neuen Kunden in die Datenbank einfügen
    const result = await db.run(
      `INSERT INTO customers (
        id, name, type, status, industry, website, address, created_at, updated_at, notes
      ) VALUES (
        lower(hex(randomblob(4))), ?, ?, ?, ?, ?, ?, ?, ?, ?
      )`,
      [
        data.name,
        data.type,
        data.status,
        data.industry,
        data.website || null,
        addressJson,
        now,
        now,
        data.notes || null
      ]
    );
    
    // ID des neuen Kunden abrufen
    const { id } = await db.get('SELECT id FROM customers ORDER BY rowid DESC LIMIT 1');
    
    // Kundendaten mit ID zurückgeben
    const newCustomer = {
      id,
      ...data,
      createdAt: now,
      updatedAt: now,
      contactHistory: [],
      contacts: [],
      requirements: []
    };
    
    return NextResponse.json(newCustomer, { status: 201 });
  } catch (error) {
    console.error('Fehler beim Erstellen des Kunden:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Kunden' },
      { status: 500 }
    );
  }
}
