// C:\Users\stefa\Desktop\heiba\heiba-recruitment\heiba-rms\lib\dsgvo.ts
import { getDb } from './db';

export interface ConsentSettings {
  essentialCookies: boolean;
  functionalCookies: boolean;
  analyticalCookies: boolean;
  marketingCookies: boolean;
}

export async function saveUserConsent(
  userId: number, 
  consentSettings: ConsentSettings, 
  ipAddress: string
): Promise<void> {
  const db = await getDb();
  
  // IP-Adresse pseudonymisieren für DSGVO-Konformität
  const pseudonymizedIp = ipAddress.split('.').slice(0, 3).join('.') + '.xxx';
  
  await db.run(
    `INSERT INTO user_consents 
    (user_id, essential_cookies, functional_cookies, analytical_cookies, marketing_cookies, consent_date, ip_address) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      consentSettings.essentialCookies ? 1 : 0,
      consentSettings.functionalCookies ? 1 : 0,
      consentSettings.analyticalCookies ? 1 : 0,
      consentSettings.marketingCookies ? 1 : 0,
      new Date().toISOString(),
      pseudonymizedIp
    ]
  );
}

export async function getUserConsent(userId: number): Promise<ConsentSettings | null> {
  const db = await getDb();
  
  const consent = await db.get(
    `SELECT essential_cookies, functional_cookies, analytical_cookies, marketing_cookies 
     FROM user_consents 
     WHERE user_id = ? 
     ORDER BY consent_date DESC 
     LIMIT 1`,
    [userId]
  );
  
  if (!consent) {
    return null;
  }
  
  return {
    essentialCookies: !!consent.essential_cookies,
    functionalCookies: !!consent.functional_cookies,
    analyticalCookies: !!consent.analytical_cookies,
    marketingCookies: !!consent.marketing_cookies,
  };
}

export async function logDataAccess(
  userId: number,
  dataType: string,
  accessType: 'read' | 'create' | 'update' | 'delete'
): Promise<void> {
  const db = await getDb();
  
  await db.run(
    `INSERT INTO data_access_logs (user_id, accessed_data_type, access_type) 
     VALUES (?, ?, ?)`,
    [userId, dataType, accessType]
  );
}

export async function requestDataDeletion(userId: number): Promise<void> {
  const db = await getDb();
  
  await db.run('UPDATE users SET data_deletion_requested = 1 WHERE id = ?', [userId]);
}
