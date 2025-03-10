#!/bin/bash

# HeiBa Recruitment Management System - Deployment Script
# Dieses Skript wird verwendet, um das HeiBa RMS auf dem Server zu deployen

# Verzeichnisse
APP_DIR="/var/www/heiba-rms"
BACKUP_DIR="/var/backups/heiba-rms"
DB_DIR="$APP_DIR/database"

# Fehlerbehandlung aktivieren
set -e
set -o pipefail

# Farbcodes für bessere Lesbarkeit
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Startmeldung
echo -e "${GREEN}=== HeiBa RMS Deployment wird gestartet ===${NC}"
echo "$(date)"
echo

# Prüfen, ob das App-Verzeichnis existiert
if [ ! -d "$APP_DIR" ]; then
    echo -e "${YELLOW}App-Verzeichnis existiert nicht. Wird erstellt...${NC}"
    mkdir -p "$APP_DIR"
    mkdir -p "$DB_DIR"
fi

# Backup vor der Aktualisierung
echo -e "${YELLOW}Backup der aktuellen Version wird erstellt...${NC}"
if [ -d "$APP_DIR/.git" ]; then
    # Backup der Datenbank
    if [ -f "$DB_DIR/heiba.db" ]; then
        mkdir -p "$BACKUP_DIR"
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        sqlite3 "$DB_DIR/heiba.db" ".backup '$BACKUP_DIR/heiba_$TIMESTAMP.db'"
        echo -e "${GREEN}Datenbank-Backup erstellt: $BACKUP_DIR/heiba_$TIMESTAMP.db${NC}"
    else
        echo -e "${YELLOW}Keine Datenbank gefunden. Backup übersprungen.${NC}"
    fi
fi

# Repository klonen/aktualisieren
if [ -d "$APP_DIR/.git" ]; then
    echo -e "${YELLOW}Aktualisiere vorhandenes Repository...${NC}"
    cd "$APP_DIR"
    git pull
    echo -e "${GREEN}Repository wurde aktualisiert.${NC}"
else
    echo -e "${YELLOW}Verzeichnis existiert, aber kein Git-Repository. Bereite Verzeichnis vor...${NC}"
    # Sichern der Datenbank, falls vorhanden
    if [ -f "$DB_DIR/heiba.db" ]; then
        mkdir -p "$BACKUP_DIR"
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        mkdir -p "$BACKUP_DIR/database"
        cp "$DB_DIR/heiba.db" "$BACKUP_DIR/database/heiba_$TIMESTAMP.db"
        echo -e "${GREEN}Datenbank-Backup erstellt: $BACKUP_DIR/database/heiba_$TIMESTAMP.db${NC}"
    fi
    
    # Leere das Verzeichnis, behalte aber Datenbank-Ordner
    find "$APP_DIR" -mindepth 1 -not -path "$DB_DIR*" -delete
    
    # Klone das Repository
    echo -e "${YELLOW}Klone Repository...${NC}"
    GIT_URL="https://github.com/Matschula1987/heiba-rms.git"
    git clone "$GIT_URL" "$APP_DIR.tmp"
    
    # Kopiere Inhalte und behalte .git Verzeichnis
    cp -r "$APP_DIR.tmp/." "$APP_DIR/"
    rm -rf "$APP_DIR.tmp"
    
    echo -e "${GREEN}Repository wurde geklont.${NC}"
fi

# NPM-Pakete installieren
cd "$APP_DIR"
echo -e "${YELLOW}Installiere Abhängigkeiten...${NC}"
npm install --production
echo -e "${GREEN}Abhängigkeiten wurden installiert.${NC}"

# Build-Prozess (falls nötig)
echo -e "${YELLOW}Führe Build-Prozess durch...${NC}"
npm run build
echo -e "${GREEN}Build abgeschlossen.${NC}"

# PM2 Prozess starten/neustarten
echo -e "${YELLOW}Starte Anwendung mit PM2...${NC}"
if pm2 list | grep -q "heiba-rms"; then
    pm2 reload heiba-rms
    echo -e "${GREEN}Anwendung wurde neugestartet.${NC}"
else
    pm2 start npm --name "heiba-rms" -- start
    pm2 save
    echo -e "${GREEN}Anwendung wurde gestartet.${NC}"
fi

# Abschließende Nachricht
echo
echo -e "${GREEN}=== Deployment abgeschlossen ===${NC}"
echo "$(date)"
echo -e "${GREEN}HeiBa RMS läuft jetzt auf http://$(hostname -I | awk '{print $1}')${NC}"
