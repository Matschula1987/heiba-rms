import { NextRequest, NextResponse } from 'next/server';
import { notificationSettingsService } from '@/lib/notificationSettingsService';
import { UpdateNotificationSettingsParams } from '@/types/notifications';

/**
 * GET /api/notification-settings
 * Benutzer-ID wird als Query-Parameter übergeben
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('user_id');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Benutzer-ID ist erforderlich' },
        { status: 400 }
      );
    }
    
    const settings = await notificationSettingsService.getSettingsForUser(userId);
    
    if (!settings) {
      return NextResponse.json(
        { success: false, error: 'Keine Einstellungen für diesen Benutzer gefunden' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Benachrichtigungseinstellungen:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unbekannter Fehler' 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notification-settings
 * Aktualisiert oder erstellt Benachrichtigungseinstellungen
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, ...params } = body;
    
    if (!user_id) {
      return NextResponse.json(
        { success: false, error: 'Benutzer-ID ist erforderlich' },
        { status: 400 }
      );
    }
    
    // Typsichere Konvertierung, da die Eigenschaften unterschiedlich benannt sind (snake_case vs. camelCase)
    const updateParams: UpdateNotificationSettingsParams = {
      emailEnabled: params.email_enabled,
      pushEnabled: params.push_enabled,
      smsEnabled: params.sms_enabled,
      notifyFollowup: params.notify_followup,
      notifyApplications: params.notify_applications,
      notifyStatusChanges: params.notify_status_changes,
      notifyDueActions: params.notify_due_actions,
      notifyProfileSending: params.notify_profile_sending,
      notifyMatchings: params.notify_matchings,
      frequency: params.frequency,
      quietHoursStart: params.quiet_hours_start,
      quietHoursEnd: params.quiet_hours_end,
      weekendDisabled: params.weekend_disabled,
      minPriority: params.min_priority,
      aiModeEnabled: params.ai_mode_enabled,
      aiModeLevel: params.ai_mode_level,
      aiFailureNotification: params.ai_failure_notification
    };
    
    // Filtere undefined-Werte heraus
    Object.keys(updateParams).forEach(key => {
      if (updateParams[key as keyof UpdateNotificationSettingsParams] === undefined) {
        delete updateParams[key as keyof UpdateNotificationSettingsParams];
      }
    });
    
    const settings = await notificationSettingsService.updateSettings(user_id, updateParams);
    
    return NextResponse.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Benachrichtigungseinstellungen:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unbekannter Fehler' 
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notification-settings
 * Löscht Benachrichtigungseinstellungen eines Benutzers
 */
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('user_id');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Benutzer-ID ist erforderlich' },
        { status: 400 }
      );
    }
    
    const success = await notificationSettingsService.deleteSettings(userId);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Einstellungen konnten nicht gelöscht werden' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('Fehler beim Löschen der Benachrichtigungseinstellungen:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unbekannter Fehler' 
      },
      { status: 500 }
    );
  }
}
