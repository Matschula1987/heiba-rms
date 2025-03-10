import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Öffentliche Routen, die ohne Authentifizierung zugänglich sind
  const publicRoutes = ['/login', '/', '/api/auth/login'];
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith('/api/auth/')
  );

  // Prüfen ob der Benutzer authentifiziert ist
  const isAuthenticated = request.cookies.has('authToken');
  
  // Wenn nicht authentifiziert und keine öffentliche Route
  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Wenn authentifiziert und auf Login-Seite, zum Dashboard weiterleiten
  if (isAuthenticated && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Alle anderen Anfragen durchlassen
  return NextResponse.next();
}
// Konfiguration der Pfade, für die die Middleware ausgeführt werden soll
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*|api/auth/login).*)',
  ],
};
