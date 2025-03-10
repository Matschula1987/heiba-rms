import { NextRequest, NextResponse } from 'next/server';
import { TaskAutomationManager } from '@/lib/tasks/TaskAutomationManager';

/**
 * API-Endpunkt zur manuellen Auslösung der automatischen Aufgabengenerierung
 * Dieser Endpunkt kann auch von einem Scheduler/Cron-Job aufgerufen werden
 */
export async function POST(request: NextRequest) {
  try {
    const taskAutomationManager = new TaskAutomationManager();
    const results = await taskAutomationManager.runAllAutomations();
    
    // Summe aller generierten Aufgaben
    const totalTasks = 
      results.jobExpiryTasks.length + 
      results.candidateContactTasks.length + 
      results.customerContactTasks.length;
    
    return NextResponse.json({
      success: true,
      message: `${totalTasks} automatische Aufgaben erstellt, ${results.reminderCount} Erinnerungen gesendet`,
      details: {
        jobExpiryTasks: results.jobExpiryTasks.length,
        candidateContactTasks: results.candidateContactTasks.length,
        customerContactTasks: results.customerContactTasks.length,
        remindersSent: results.reminderCount
      }
    });
  } catch (error) {
    console.error('Fehler bei der automatischen Aufgabengenerierung:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Fehler bei der automatischen Aufgabengenerierung',
        error: error instanceof Error ? error.message : 'Unbekannter Fehler'
      },
      { status: 500 }
    );
  }
}

/**
 * API-Endpunkt zur Abfrage des Status der automatischen Aufgabengenerierung
 * Kann verwendet werden, um zu prüfen, ob der Automatisierungsdienst aktiviert ist
 */
export async function GET() {
  try {
    // Hier könnte eine Prüfung auf aktivierte Automatisierung erfolgen
    // z.B. aus einer Einstellungsdatenbank oder Konfigurationsdatei
    
    return NextResponse.json({
      success: true,
      status: 'active',
      automation: {
        jobExpiryCheck: true,
        candidateContactCheck: true,
        customerContactCheck: true,
        reminderNotifications: true
      }
    });
  } catch (error) {
    console.error('Fehler bei der Abfrage des Automatisierungsstatus:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Fehler bei der Abfrage des Automatisierungsstatus',
        error: error instanceof Error ? error.message : 'Unbekannter Fehler'
      },
      { status: 500 }
    );
  }
}
