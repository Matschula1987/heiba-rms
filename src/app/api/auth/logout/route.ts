// src/app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    // Auth-Token-Cookie löschen
    cookies().delete("auth_token");
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, message: "Ein Fehler ist aufgetreten" },
      { status: 500 }
    );
  }
}
