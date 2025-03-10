import { NextRequest, NextResponse } from 'next/server';
import { initializeMonicaAIService } from '../helpers';
import { ResumeAnalysisRequest } from '@/types/monicaAI';

/**
 * POST /api/monica-ai/analyze
 * Sendet einen Lebenslauf zur Analyse an Monica AI
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validierung der Anfrage
    if (!data.documentUrl && !data.documentBase64 && !data.documentId) {
      return NextResponse.json(
        { error: 'Entweder documentUrl, documentBase64 oder documentId muss angegeben werden' },
        { status: 400 }
      );
    }
    
    // Monica AI-Service initialisieren
    const service = await initializeMonicaAIService();
    
    // Prüfen, ob der Service konfiguriert ist
    if (!service.isConfigured()) {
      return NextResponse.json(
        { error: 'Monica AI ist nicht konfiguriert. Bitte zuerst API-Schlüssel konfigurieren.' },
        { status: 400 }
      );
    }
    
    // Analyse-Request vorbereiten
    const analyzeRequest: ResumeAnalysisRequest = {
      requestId: data.requestId,
      documentUrl: data.documentUrl,
      documentBase64: data.documentBase64,
      documentType: data.documentType,
      candidateId: data.candidateId,
      options: data.options
    };
    
    // Analyse durchführen
    const result = await service.analyzeResume(analyzeRequest);
    
    // Ergebnis zurückgeben
    return NextResponse.json({
      success: result.status === 'success',
      requestId: result.requestId,
      status: result.status,
      message: result.message,
      data: result.data,
      confidence: result.confidence
    });
  } catch (error) {
    console.error('Fehler bei der Lebenslaufanalyse:', error);
    return NextResponse.json(
      { error: 'Fehler bei der Lebenslaufanalyse', details: error instanceof Error ? error.message : 'Unbekannter Fehler' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/monica-ai/analyze
 * Ruft das Ergebnis einer Analyse ab
 */
export async function GET(request: NextRequest) {
  try {
    // RequestId aus Query-Parameter auslesen
    const requestId = request.nextUrl.searchParams.get('requestId');
    
    if (!requestId) {
      return NextResponse.json(
        { error: 'requestId ist erforderlich' },
        { status: 400 }
      );
    }
    
    // Monica AI-Service initialisieren
    const service = await initializeMonicaAIService();
    
    // Prüfen, ob der Service konfiguriert ist
    if (!service.isConfigured()) {
      return NextResponse.json(
        { error: 'Monica AI ist nicht konfiguriert. Bitte zuerst API-Schlüssel konfigurieren.' },
        { status: 400 }
      );
    }
    
    // Analyse-Ergebnis abrufen
    const result = await service.getAnalysisResult(requestId);
    
    if (!result) {
      return NextResponse.json(
        { error: 'Analyse nicht gefunden' },
        { status: 404 }
      );
    }
    
    // Ergebnis zurückgeben
    return NextResponse.json({
      success: result.status === 'success',
      requestId: result.requestId,
      status: result.status,
      message: result.message,
      data: result.data,
      confidence: result.confidence
    });
  } catch (error) {
    console.error('Fehler beim Abrufen des Analyseergebnisses:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen des Analyseergebnisses', details: error instanceof Error ? error.message : 'Unbekannter Fehler' },
      { status: 500 }
    );
  }
}
