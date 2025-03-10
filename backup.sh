#!/bin/bash

# HeiBa Recruitment Management System - Backup Script
# Dieses Skript erstellt ein vollständiges Backup des HeiBa RMS

# Verzeichnisse
APP_DIR="/var/www/heiba-rms"
BACKUP_DIR="/var/backups/heiba-rms"
DB_DIR="$APP_DIR/database"
DB_FILE="$DB_DIR/heiba.db"
UPLOADED_FILES_DIR="$APP_DIR/uploads"

# Konfiguration
MAX_BACKUPS=7 # Maximale Anzahl der aufzubewahrenden Backups
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="heiba_backup_$TIMESTAMP"
BACKUP_FILE="$BACKUP_DIR/$BACKUP_NAME.tar.gz"

# Fehlerbehandlung aktivieren
set -e
set -o pipefail

# Farbcodes für bessere Lesbarkeit
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Funktion zur Überprüfung des letzten Befehls
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $1${NC}"
    else
        echo -e "${RED}✗ $1${NC}"
        exit 1
    fi
}

# Startmeldung
echo -e "${GREEN}=== HeiBa RMS Backup wird gestartet ===${NC}"
echo "$(date)"
echo

# Prüfen, ob Verzeichnisse existieren
if [ ! -d "$BACKUP_DIR" ]; then
    mkdir -p "$BACKUP_DIR"
    check_status "Backup-Verzeichnis erstellt"
fi

# Prüfen, ob die Anwendung existiert
if [ ! -d "$APP_DIR" ]; then
    echo -e "${RED}Fehler: Das Anwendungsverzeichnis existiert nicht.${NC}"
    exit 1
fi

# Temporäres Verzeichnis für Backup erstellen
TMP_BACKUP_DIR=$(mktemp -d)
check_status "Temporäres Verzeichnis erstellt"

# Datenbank-Backup durchführen (wenn vorhanden)
if [ -f "$DB_FILE" ]; then
    echo -e "${YELLOW}Datenbank-Backup wird erstellt...${NC}"
    mkdir -p "$TMP_BACKUP_DIR/database"
    sqlite3 "$DB_FILE" ".backup '$TMP_BACKUP_DIR/database/heiba.db'"
    check_status "Datenbank-Backup erstellt"
else
    echo -e "${YELLOW}Warnung: Keine Datenbank gefunden.${NC}"
fi

# Umgebungsvariablen-Datei sichern (falls vorhanden)
if [ -f "$APP_DIR/.env" ]; then
    echo -e "${YELLOW}Sichere Umgebungsvariablen...${NC}"
    cp "$APP_DIR/.env" "$TMP_BACKUP_DIR/"
    check_status "Umgebungsvariablen gesichert"
fi

# Uploads-Verzeichnis sichern (falls vorhanden)
if [ -d "$UPLOADED_FILES_DIR" ]; then
    echo -e "${YELLOW}Sichere hochgeladene Dateien...${NC}"
    cp -r "$UPLOADED_FILES_DIR" "$TMP_BACKUP_DIR/"
    check_status "Hochgeladene Dateien gesichert"
fi

# Backup komprimieren
echo -e "${YELLOW}Erstelle komprimiertes Backup-Archiv...${NC}"
tar -czf "$BACKUP_FILE" -C "$TMP_BACKUP_DIR" .
check_status "Backup-Archiv erstellt: $BACKUP_FILE"

# Temporäres Verzeichnis aufräumen
rm -rf "$TMP_BACKUP_DIR"
check_status "Temporäres Verzeichnis gelöscht"

# Ältere Backups rotieren
echo -e "${YELLOW}Rotiere ältere Backups...${NC}"
BACKUP_COUNT=$(find "$BACKUP_DIR" -name "heiba_backup_*.tar.gz" | wc -l)
if [ "$BACKUP_COUNT" -gt "$MAX_BACKUPS" ]; then
    EXCESS_BACKUPS=$((BACKUP_COUNT - MAX_BACKUPS))
    ls -t "$BACKUP_DIR"/heiba_backup_*.tar.gz | tail -n "$EXCESS_BACKUPS" | xargs rm -f
    check_status "$EXCESS_BACKUPS alte Backups gelöscht"
else
    echo -e "${GREEN}Keine alten Backups zu löschen (aktuell $BACKUP_COUNT von $MAX_BACKUPS)${NC}"
fi

# Abschließende Nachricht
echo
echo -e "${GREEN}=== Backup abgeschlossen ===${NC}"
echo "$(date)"
echo -e "${GREEN}Backup-Datei erstellt: $BACKUP_FILE${NC}"
echo -e "${GREEN}Backup-Größe: $(du -h "$BACKUP_FILE" | cut -f1)${NC}"
