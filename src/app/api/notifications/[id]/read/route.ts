/**
 * API-Endpunkt zum Markieren einer Benachrichtigung als gelesen
 */
import { NextRequest, NextResponse } from 'next/server';
import { markNotificationAsRead } from '@/lib/notificationService';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Benachrichtigungs-ID ist erforderlich' 
      }, { status: 400 });
    }
    
    const success = await markNotificationAsRead(id);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Benachrichtigung konnte nicht als gelesen markiert werden' 
      }, { status: 404 });
    }
  } catch (error) {
    console.error('Fehler beim Markieren der Benachrichtigung als gelesen:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Fehler beim Markieren der Benachrichtigung als gelesen' 
    }, { status: 500 });
  }
}
