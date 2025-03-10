import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { getDb } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'heiba-rms-secret-key';

export interface Permission {
  all?: boolean;
  manage_users?: boolean;
  manage_settings?: boolean;
  manage_jobs?: boolean;
  manage_applications?: boolean;
  view_jobs?: boolean;
  view_applications?: boolean;
  view_reports?: boolean;
  manage_candidates?: boolean;
  // Weitere spezifische Berechtigungen können hier hinzugefügt werden
}

export interface UserRole {
  id: number;
  name: string;
  description?: string;
  permissions: Permission;
}

export interface UserData {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
  roleId?: number;
  customerId?: number;
  permissions?: Permission;
  active: boolean;
}

export interface DecodedToken extends UserData {
  iat: number;
  exp: number;
}

export function generateToken(userData: UserData): string {
  return jwt.sign(userData, JWT_SECRET, { expiresIn: '8h' });
}

export function verifyToken(token: string): DecodedToken | null {
  try {
    return jwt.verify(token, JWT_SECRET) as DecodedToken;
  } catch (error) {
    return null;
  }
}

export async function logUserLogin(userId: number, ipAddress: string): Promise<void> {
  const db = await getDb();
  
  // Aktualisiere den letzten Login-Zeitstempel
  await db.run('UPDATE users SET last_login = ? WHERE id = ?', [new Date().toISOString(), userId]);
  
  // Pseudonymisiere die IP-Adresse für DSGVO-Konformität
  const pseudonymizedIp = ipAddress.split('.').slice(0, 3).join('.') + '.xxx';
  
  // Protokolliere den Login-Vorgang in der neuen Logging-Tabelle
  await db.run(
    'INSERT INTO user_activity_logs (user_id, action, ip_address, details) VALUES (?, ?, ?, ?)',
    [userId, 'login', pseudonymizedIp, JSON.stringify({ timestamp: new Date().toISOString() })]
  );
}

export async function authenticateUser(req: NextApiRequest, res: NextApiResponse): Promise<DecodedToken | null> {
  // Token aus Cookie oder Authorization-Header holen
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return null;
  }
  
  // Token verifizieren
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return null;
  }
  
  return decoded;
}

/**
 * Überprüft, ob ein Benutzer eine bestimmte Berechtigung hat
 */
export function hasPermission(user: UserData, permission: keyof Permission): boolean {
  // System-Administratoren haben alle Berechtigungen
  if (user.role === 'system_admin') {
    return true;
  }
  
  // Wenn der Benutzer spezifische Berechtigungen hat, diese überprüfen
  if (user.permissions) {
    if (user.permissions.all) {
      return true;
    }
    return !!user.permissions[permission];
  }
  
  // Basierend auf Standardrollen
  if (user.role === 'customer_admin') {
    return ['manage_users', 'manage_settings', 'manage_jobs', 'manage_applications', 'view_jobs', 'view_applications', 'view_reports'].includes(permission);
  }
  
  if (user.role === 'recruiter') {
    return ['manage_jobs', 'manage_applications', 'view_jobs', 'view_applications'].includes(permission);
  }
  
  if (user.role === 'viewer') {
    return ['view_jobs', 'view_applications'].includes(permission);
  }
  
  return false;
}

/**
 * Holt erweiterte Benutzerinformationen aus der Datenbank
 */
export async function getUserDetails(userId: number): Promise<UserData | null> {
  const db = await getDb();
  
  try {
    // Benutzer mit Rolleninformationen holen
    const user = await db.get(`
      SELECT 
        u.id, u.username, u.email, u.name, u.customer_id AS customerId, 
        u.permissions, u.active, u.role_id AS roleId,
        r.name AS role, r.permissions AS role_permissions
      FROM users u
      LEFT JOIN user_roles r ON u.role_id = r.id
      WHERE u.id = ?
    `, [userId]);
    
    if (!user) {
      return null;
    }
    
    // Benutzerberechtigungen parsen
    let permissions: Permission = {};
    
    // Rollenberechtigungen einbeziehen (falls vorhanden)
    if (user.role_permissions) {
      try {
        permissions = { ...permissions, ...JSON.parse(user.role_permissions) };
      } catch (e) {
        console.error('Fehler beim Parsen der Rollenberechtigungen:', e);
      }
    }
    
    // Individuelle Benutzerberechtigungen (überschreiben Rollenberechtigungen)
    if (user.permissions) {
      try {
        permissions = { ...permissions, ...JSON.parse(user.permissions) };
      } catch (e) {
        console.error('Fehler beim Parsen der Benutzerberechtigungen:', e);
      }
    }
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role || 'user',
      roleId: user.roleId,
      customerId: user.customerId,
      permissions,
      active: !!user.active
    };
  } catch (error) {
    console.error('Fehler beim Holen der Benutzerdetails:', error);
    return null;
  }
}
