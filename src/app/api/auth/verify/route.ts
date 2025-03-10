import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("auth_token")?.value;
    
    // Hier sollten Sie die Token-Validierung implementieren
    const authenticated = !!token;
    
    if (!authenticated) {
      return NextResponse.json({ 
        authenticated: false 
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        name: "Admin",
        email: "admin@heiba.de"
      }
    });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json(
      { 
        authenticated: false, 
        message: "Authentifizierungsfehler" 
      },
      { status: 500 }
    );
  }
}