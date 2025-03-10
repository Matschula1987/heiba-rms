/**
 * API-Endpunkt zum Markieren aller Benachrichtigungen eines Benutzers als gelesen
 */
import { NextRequest, NextResponse } from 'next/server';
import { markAllNotificationsAsRead } from '@/lib/notificationService';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.user_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'user_id ist erforderlich' 
      }, { status: 400 });
    }
    
    const count = await markAllNotificationsAsRead(body.user_id);
    
    return NextResponse.json({ 
      success: true,
      marked_count: count
    });
  } catch (error) {
    console.error('Fehler beim Markieren aller Benachrichtigungen als gelesen:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Fehler beim Markieren aller Benachrichtigungen als gelesen' 
    }, { status: 500 });
  }
}
