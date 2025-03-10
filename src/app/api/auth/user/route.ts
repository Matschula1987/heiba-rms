// C:\Users\stefa\Desktop\heiba\heiba-recruitment\heiba-rms\pages\api\auth\user.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { authenticateUser } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return return new Response(JSON.stringify({ message: 'Method not allowed' }), { status: 405, headers: { "Content-Type": "application/json" } });
  }

  try {
    const user = await authenticateUser(req, res);
    
    if (!user) {
      return return new Response(JSON.stringify({ message: 'Nicht authentifiziert' }), { status: 401, headers: { "Content-Type": "application/json" } });
    }

    // Benutzerinformationen zurückgeben (ohne sensible Daten)
    return return new Response(JSON.stringify({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error('User validation error:', error);
    return return new Response(JSON.stringify({ message: 'Interner Serverfehler' }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

export async function GET(req) {
  // GET-Methode implementieren
  return new Response(JSON.stringify({ message: 'GET method implementation needed' }), { 
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}
