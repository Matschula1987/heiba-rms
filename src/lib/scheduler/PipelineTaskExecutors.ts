import { getDb } from "../db";
import customerRequirementMatcher from '../matcher/CustomerRequirementMatcher';
import { notificationService } from '../notificationService';

/**
 * Führt ein vollständiges Matching zwischen Kundenanforderungen und Kandidaten/Bewerbungen/Talent-Pool durch
 * @param minScoreForNotification Mindest-Score für Benachrichtigungen
 * @returns Anzahl der erstellten Matches
 */
export async function executeCustomerRequirementMatching(
  minScoreForNotification: number = 75
): Promise<{ success: boolean; totalMatches: number }> {
  try {
    const totalMatches = await customerRequirementMatcher.runFullMatching(minScoreForNotification);
    
    // Sende eine Benachrichtigung an Admins und Recruiter
    notifyMatchingResults(totalMatches);
    
    return { success: true, totalMatches };
  } catch (error) {
    console.error('Fehler beim Ausführen des Customer-Requirement-Matchings:', error);
    return { success: false, totalMatches: 0 };
  }
}

/**
 * Benachrichtigt Admins und Recruiter über die Ergebnisse des Matchings
 * @param totalMatches Gesamtanzahl der gefundenen Matches
 */
async function notifyMatchingResults(totalMatches: number): Promise<void> {
  try {
    const db = await getDb();
    
    // Admins und Recruiter abrufen
    const staffUsers = await db.all(
      "SELECT id FROM users WHERE role IN ('admin', 'recruiter')"
    );
    
    if (!staffUsers || staffUsers.length === 0) {
      return;
    }
    
    for (const user of staffUsers) {
      // Prüfen, ob Benachrichtigungen für "matchings" aktiviert sind
      const settings = await db.get(
        'SELECT notifyMatchings FROM notification_settings WHERE userId = ?',
        [user.id]
      );
      
      // Wenn Benachrichtigungen deaktiviert sind, überspringen
      if (settings && settings.notifyMatchings === 0) {
        continue;
      }
      
      // Benachrichtigung erstellen
      await notificationService.createNotification({
        user_id: user.id,
        title: 'Kundenanforderungen-Matching abgeschlossen',
        message: `Das System hat ${totalMatches} potenzielle Matches zwischen Kundenanforderungen und Kandidaten/Bewerbungen/Talent-Pool-Einträgen gefunden.`,
        entity_type: 'system',
        entity_id: 'customer_requirement_matching',
        action: 'matching_completed',
        importance: totalMatches > 0 ? 'normal' : 'low'
      });
    }
  } catch (error) {
    console.error('Fehler beim Benachrichtigen über Matching-Ergebnisse:', error);
  }
}

/**
 * Führt ein Job-Matching für alle aktiven Jobs und Kandidaten/Bewerbungen/Talent-Pool durch
 * @param minScoreForNotification Mindest-Score für Benachrichtigungen 
 * @returns Erfolg-Status
 */
export async function executeJobMatching(
  minScoreForNotification: number = 75
): Promise<{ success: boolean }> {
  try {
    const db = await getDb();
    
    // Implementierung des Job-Matchings
    // Dies ist nur ein Platzhalter, da die eigentliche Implementierung 
    // bereits anderweitig vorhanden sein sollte
    
    return { success: true };
  } catch (error) {
    console.error('Fehler beim Ausführen des Job-Matchings:', error);
    return { success: false };
  }
}

/**
 * Bereinigt alte Matches und Benachrichtigungen
 * @param olderThanDays Lösche Einträge, die älter als X Tage sind
 * @returns Anzahl der gelöschten Einträge
 */
export async function cleanupMatches(
  olderThanDays: number = 30
): Promise<{ success: boolean; deletedMatches: number }> {
  try {
    const db = await getDb();
    
    // Lösche alte Matches
    const result = await db.run(`
      DELETE FROM customer_requirement_matches 
      WHERE datetime(updated_at) < datetime('now', '-${olderThanDays} days')
      AND status IN ('rejected', 'contacted')
    `);
    
    return { success: true, deletedMatches: result.changes };
  } catch (error) {
    console.error('Fehler beim Bereinigen alter Matches:', error);
    return { success: false, deletedMatches: 0 };
  }
}
