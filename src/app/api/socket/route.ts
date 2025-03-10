import { NextRequest, NextResponse } from 'next/server';
import { Server as HTTPServer } from 'http';
import { socketIoService } from '../../../lib/socketIoService';

export const runtime = 'nodejs';

/**
 * Socket.io-Endpunkt für die Next.js-API
 * 
 * Diese Route ermöglicht die Socket.io-Verbindung zum Client.
 * Da Next.js standardmäßig keine WebSockets unterstützt, müssen wir
 * einen Workaround implementieren, indem wir auf den zugrunde liegenden
 * HTTP-Server zugreifen und Socket.io daran anhängen.
 */
export async function GET(req: NextRequest) {
  try {
    // Socket.io initialisieren (wenn noch nicht geschehen)
    socketIoService.initialize();
    
    // HTTP 502 zurückgeben, um Next.js-Routing zu umgehen und
    // Socket.io direkt die Verbindung verwalten zu lassen
    return new NextResponse(null, { status: 502 });
  } catch (error) {
    console.error('Fehler beim Initialisieren von Socket.io:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
