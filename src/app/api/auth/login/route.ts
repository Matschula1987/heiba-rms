﻿import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { generateToken, logUserLogin, getUserDetails } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;
    
    if (!username || !password) {
      return NextResponse.json(
        { message: "Benutzername und Passwort sind erforderlich" },
        { status: 400 }
      );
    }

    const db = await getDb();
    
    // Demo-Login-Unterstützung beibehalten
    if ((username === "admin" || username === "recruiter") && password === "demo123") {
      let demoUser;
      
      if (username === "admin") {
        demoUser = {
          id: 1,
          username: "admin",
          name: "Administrator",
          email: "admin@heiba.de",
          role: "system_admin",
          active: true,
          permissions: { all: true }
        };
      } else {
        demoUser = {
          id: 2,
          username: "recruiter",
          name: "Recruiter",
          email: "recruiter@heiba.de",
          role: "recruiter",
          active: true,
          permissions: { manage_jobs: true, manage_applications: true, view_jobs: true, view_applications: true }
        };
      }
      
      const token = generateToken(demoUser);
      
      // Token als Cookie setzen
      cookies().set({
        name: "token",
        value: token,
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 8, // 8 Stunden
        sameSite: "strict",
      });
      
      // Login protokollieren
      try {
        await logUserLogin(demoUser.id, request.headers.get("x-forwarded-for") || "127.0.0.1");
      } catch (error) {
        console.error("Fehler beim Protokollieren des Logins:", error);
      }
      
      return NextResponse.json({
        message: "Login erfolgreich",
        user: demoUser
      });
    }
    
    // Benutzer aus der Datenbank abrufen
    const user = await db.get("SELECT * FROM users WHERE username = ? AND active = 1", [username]);
    
    if (!user) {
      return NextResponse.json(
        { message: "Ungültiger Benutzername oder Passwort" },
        { status: 401 }
      );
    }
    
    // In einer Produktionsumgebung sollte das Passwort gehasht sein
    // Hier ist ein Beispiel mit bcrypt:
    let passwordValid;
    
    if (user.password.startsWith('$2')) {
      // Wenn das Passwort bereits mit bcrypt gehasht ist
      passwordValid = await bcrypt.compare(password, user.password);
    } else {
      // Einfacher Vergleich für nicht-gehashte Passwörter (nicht für Produktion empfohlen!)
      passwordValid = password === user.password;
    }
    
    if (!passwordValid) {
      return NextResponse.json(
        { message: "Ungültiger Benutzername oder Passwort" },
        { status: 401 }
      );
    }
    
    // Erweiterte Benutzerdetails mit Berechtigungen abrufen
    const userDetails = await getUserDetails(user.id);
    
    if (!userDetails || !userDetails.active) {
      return NextResponse.json(
        { message: "Das Benutzerkonto ist deaktiviert" },
        { status: 403 }
      );
    }
    
    // Token generieren
    const token = generateToken(userDetails);
    
    // Token als Cookie setzen
    cookies().set({
      name: "token",
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 8, // 8 Stunden
      sameSite: "strict",
    });
    
    // Login protokollieren
    await logUserLogin(user.id, request.headers.get("x-forwarded-for") || "127.0.0.1");
    
    return NextResponse.json({
      message: "Login erfolgreich",
      user: userDetails
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Ein Fehler ist aufgetreten" },
      { status: 500 }
    );
  }
}
