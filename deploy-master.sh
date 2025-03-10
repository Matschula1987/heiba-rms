#!/bin/bash

# HeiBa Recruitment Management System - Deployment Script (Master-Branch)
# Dieses Skript verwendet explizit den master-Branch des Repositories

# Verzeichnisse
APP_DIR="/var/www/heiba-rms"
BACKUP_DIR="/var/backups/heiba-rms"
DB_DIR="$APP_DIR/database"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Fehlerbehandlung aktivieren
set -e
set -o pipefail

# Farbcodes für bessere Lesbarkeit
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Startmeldung
echo -e "${GREEN}=== HeiBa RMS Deployment wird gestartet (Master-Branch) ===${NC}"
echo "$(date)"
echo

# Prüfen, ob das App-Verzeichnis existiert
if [ ! -d "$APP_DIR" ]; then
    echo -e "${YELLOW}App-Verzeichnis existiert nicht. Wird erstellt...${NC}"
    mkdir -p "$APP_DIR"
    mkdir -p "$DB_DIR"
fi

# Backup der Datenbank erstellen
if [ -f "$DB_DIR/heiba.db" ]; then
    echo -e "${YELLOW}Backup der Datenbank wird erstellt...${NC}"
    mkdir -p "$BACKUP_DIR"
    
    # SQLite Backup (wenn möglich)
    if command -v sqlite3 &> /dev/null; then
        sqlite3 "$DB_DIR/heiba.db" ".backup '$BACKUP_DIR/heiba_$TIMESTAMP.db'"
    else
        # Fallback auf einfaches Kopieren
        mkdir -p "$BACKUP_DIR/database"
        cp "$DB_DIR/heiba.db" "$BACKUP_DIR/database/heiba_$TIMESTAMP.db"
    fi
    
    echo -e "${GREEN}Datenbank-Backup erstellt: $BACKUP_DIR/heiba_$TIMESTAMP.db${NC}"
else
    echo -e "${YELLOW}Keine Datenbank gefunden. Backup übersprungen.${NC}"
fi

# Repository klonen/aktualisieren
echo -e "${YELLOW}Vorbereiten des Repository-Verzeichnisses...${NC}"

# Temporärer Ordner für die Datenbank
TMP_DB_DIR=$(mktemp -d)
if [ -d "$DB_DIR" ]; then
    # Datenbank-Verzeichnis temporär sichern
    echo -e "${YELLOW}Sichere Datenbank-Verzeichnis...${NC}"
    cp -r "$DB_DIR" "$TMP_DB_DIR/"
fi

# Leeren des Verzeichnisses
echo -e "${YELLOW}Leere das Verzeichnis...${NC}"
rm -rf "$APP_DIR"
mkdir -p "$APP_DIR"

# Explizit den master-Branch klonen
echo -e "${YELLOW}Klone Repository (master-Branch)...${NC}"
GIT_URL="https://github.com/Matschula1987/heiba-rms"
git clone -b master "$GIT_URL" "$APP_DIR" || {
    echo -e "${RED}Fehler beim Klonen des Repositories.${NC}"
    echo -e "${YELLOW}Versuche alternativen Ansatz mit GitHub CLI...${NC}"
    
    # Überprüfe, ob curl installiert ist
    if ! command -v curl &> /dev/null; then
        apt-get update && apt-get install -y curl
    fi
    
    # Lade Masterzip herunter
    echo -e "${YELLOW}Lade ZIP-Archiv des master-Branches herunter...${NC}"
    mkdir -p "$APP_DIR"
    curl -L "https://github.com/Matschula1987/heiba-rms/archive/refs/heads/master.zip" -o "/tmp/master.zip"
    
    # Überprüfe, ob unzip installiert ist
    if ! command -v unzip &> /dev/null; then
        apt-get update && apt-get install -y unzip
    fi
    
    # Entpacke das Archiv
    echo -e "${YELLOW}Entpacke das Archiv...${NC}"
    unzip -q "/tmp/master.zip" -d "/tmp"
    cp -r "/tmp/heiba-rms-master/"* "$APP_DIR/"
    rm -rf "/tmp/master.zip" "/tmp/heiba-rms-master"
    
    echo -e "${GREEN}Repository (master-Branch) wurde als ZIP heruntergeladen und entpackt.${NC}"
}

# Datenbank-Verzeichnis wiederherstellen
if [ -d "$TMP_DB_DIR/database" ]; then
    echo -e "${YELLOW}Stelle Datenbank-Verzeichnis wieder her...${NC}"
    mkdir -p "$DB_DIR"
    cp -r "$TMP_DB_DIR/database"/* "$DB_DIR/"
    rm -rf "$TMP_DB_DIR"
fi

# NPM-Pakete installieren
cd "$APP_DIR"
echo -e "${YELLOW}Installiere Abhängigkeiten...${NC}"
npm install --production
echo -e "${GREEN}Abhängigkeiten wurden installiert.${NC}"

# Build-Prozess
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

# Nginx-Konfiguration überprüfen
echo -e "${YELLOW}Überprüfe Nginx-Konfiguration...${NC}"
nginx -t && systemctl reload nginx
echo -e "${GREEN}Nginx-Konfiguration ist ok.${NC}"

# Abschließende Nachricht
echo
echo -e "${GREEN}=== Deployment (Master-Branch) abgeschlossen ===${NC}"
echo "$(date)"
echo -e "${GREEN}HeiBa RMS läuft jetzt auf https://heiba-rms.de${NC}"
echo -e "${GREEN}Die Anwendung ist auch unter https://www.heiba-rms.de erreichbar${NC}"
