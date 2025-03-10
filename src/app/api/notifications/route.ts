/**
 * API-Endpunkte für Benachrichtigungen
 */
import { NextRequest, NextResponse } from 'next/server';
import { 
  createNotification, 
  getNotifications, 
  countUnreadNotifications 
} from '@/lib/notificationService';
import { CreateNotificationParams, GetNotificationsParams } from '@/types';

/**
 * GET /api/notifications - Holt Benachrichtigungen für den Benutzer
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parameter extrahieren
    const params: GetNotificationsParams = {
      user_id: searchParams.get('user_id') || 'admin', // In der Produktion aus der Session holen
      unread_only: searchParams.get('unread_only') === 'true',
      limit: Number(searchParams.get('limit')) || 50,
      offset: Number(searchParams.get('offset')) || 0
    };
    
    const entityType = searchParams.get('entity_type');
    if (entityType) {
      params.entity_type = entityType as any;
    }
    
    const entityId = searchParams.get('entity_id');
    if (entityId) {
      params.entity_id = entityId;
    }
    
    const notifications = await getNotifications(params);
    const unreadCount = await countUnreadNotifications(params.user_id);
    
    return NextResponse.json({ 
      success: true, 
      notifications,
      unread_count: unreadCount
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Benachrichtigungen:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Fehler beim Abrufen der Benachrichtigungen.' 
    }, { status: 500 });
  }
}

/**
 * POST /api/notifications - Erstellt eine neue Benachrichtigung
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validiere die erforderlichen Felder
    if (!body.user_id || !body.title || !body.message) {
      return NextResponse.json({ 
        success: false, 
        error: 'user_id, title und message sind erforderlich' 
      }, { status: 400 });
    }
    
    const params: CreateNotificationParams = {
      user_id: body.user_id,
      title: body.title,
      message: body.message,
      entity_type: body.entity_type,
      entity_id: body.entity_id,
      action: body.action,
      sender_id: body.sender_id || 'system',
      importance: body.importance
    };
    
    const notification = await createNotification(params);
    
    return NextResponse.json({ 
      success: true, 
      notification 
    });
  } catch (error) {
    console.error('Fehler beim Erstellen der Benachrichtigung:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Fehler beim Erstellen der Benachrichtigung.' 
    }, { status: 500 });
  }
}
