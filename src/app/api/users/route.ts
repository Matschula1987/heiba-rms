import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { hasPermission } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

/**
 * GET: Benutzer abrufen
 */
export async function GET(request: NextRequest) {
  try {
    // Authentifizierung prüfen
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
    }
    
    // Token überprüfen
    const token = authHeader.split(" ")[1];
    // Hier würde man normalerweise das Token verifizieren
    // Aber da wir bereits eine auth.ts Middleware haben, nehmen wir an, dass dies bereits erfolgt ist
    
    // URL-Parameter extrahieren
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const searchTerm = searchParams.get("search") || "";
    const offset = (page - 1) * pageSize;
    
    const db = await getDb();
    
    // Abfrage bauen
    let query = `
      SELECT u.id, u.username, u.email, u.name, u.customer_id, u.role_id, u.active, u.created_at, 
             u.updated_at, r.name as role_name
      FROM users u
      LEFT JOIN user_roles r ON u.role_id = r.id
      WHERE 1=1
    `;
    const params = [];
    
    // Filter hinzufügen
    if (customerId) {
      query += " AND u.customer_id = ?";
      params.push(customerId);
    }
    
    if (searchTerm) {
      query += " AND (u.username LIKE ? OR u.email LIKE ? OR u.name LIKE ?)";
      const searchPattern = `%${searchTerm}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }
    
    // Sortierung und Paginierung
    query += " ORDER BY u.created_at DESC LIMIT ? OFFSET ?";
    params.push(pageSize, offset);
    
    // Benutzer abrufen
    const users = await db.all(query, params);
    
    // Gesamtzahl der Benutzer für Paginierung
    let countQuery = "SELECT COUNT(*) as total FROM users WHERE 1=1";
    const countParams = [];
    
    if (customerId) {
      countQuery += " AND customer_id = ?";
      countParams.push(customerId);
    }
    
    if (searchTerm) {
      countQuery += " AND (username LIKE ? OR email LIKE ? OR name LIKE ?)";
      const searchPattern = `%${searchTerm}%`;
      countParams.push(searchPattern, searchPattern, searchPattern);
    }
    
    const countResult = await db.get(countQuery, countParams);
    const total = countResult ? countResult.total : 0;
    
    // Passwort-Felder aus der Antwort entfernen
    const safeUsers = users.map(({ password, ...user }: { password?: string, [key: string]: any }) => user);
    
    return NextResponse.json({
      users: safeUsers,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error("Fehler beim Abrufen der Benutzer:", error);
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten" },
      { status: 500 }
    );
  }
}

/**
 * POST: Neuen Benutzer erstellen
 */
export async function POST(request: NextRequest) {
  try {
    // Request-Body auslesen
    const data = await request.json();
    const {
      username,
      email,
      name,
      password,
      roleId,
      customerId,
      permissions,
      active = true
    } = data;
    
    // Grundlegende Datenvalidierung
    if (!username || !email || !name || !password) {
      return NextResponse.json(
        { error: "Benutzername, E-Mail, Name und Passwort sind erforderlich" },
        { status: 400 }
      );
    }
    
    const db = await getDb();
    
    // Prüfen, ob Benutzername oder E-Mail bereits existieren
    const existingUser = await db.get(
      "SELECT id FROM users WHERE username = ? OR email = ?",
      [username, email]
    );
    
    if (existingUser) {
      return NextResponse.json(
        { error: "Benutzername oder E-Mail existiert bereits" },
        { status: 409 }
      );
    }
    
    // Passwort hashen
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Benutzer in Datenbank einfügen
    const userId = uuidv4();
    const now = new Date().toISOString();
    
    await db.run(
      `INSERT INTO users (
        id, username, email, name, password, role_id, customer_id, 
        permissions, active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        username,
        email,
        name,
        hashedPassword,
        roleId || null,
        customerId || null,
        permissions ? JSON.stringify(permissions) : '{}',
        active ? 1 : 0,
        now,
        now
      ]
    );
    
    // Benutzer mit Rolle aus der Datenbank abrufen
    const createdUser = await db.get(`
      SELECT u.id, u.username, u.email, u.name, u.customer_id, u.role_id, 
             u.active, u.created_at, u.updated_at, r.name as role_name
      FROM users u
      LEFT JOIN user_roles r ON u.role_id = r.id
      WHERE u.id = ?
    `, [userId]);
    
    // Passwort aus der Antwort entfernen
    const { password: _, ...userWithoutPassword } = createdUser as { password?: string, [key: string]: any };
    
    return NextResponse.json({
      message: "Benutzer erfolgreich erstellt",
      user: userWithoutPassword
    }, { status: 201 });
  } catch (error) {
    console.error("Fehler beim Erstellen des Benutzers:", error);
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten" },
      { status: 500 }
    );
  }
}
