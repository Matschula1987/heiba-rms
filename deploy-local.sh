#!/bin/bash

# HeiBa Recruitment Management System - Manuelles Deployment von lokalem Rechner
# Dieses Skript kopiert die Anwendung vom lokalen Rechner auf den Server

# Server-Einstellungen
SERVER_IP="195.201.26.134"
SERVER_USER="root"
APP_DIR="/var/www/heiba-rms"
SSH_KEY_PATH="" # Optional, wenn Sie einen SSH-Key verwenden möchten: -i /path/to/key

# Farben für bessere Lesbarkeit
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Startmeldung
echo -e "${GREEN}=== HeiBa RMS Manuelles Deployment wird gestartet ===${NC}"
echo "$(date)"
echo

# Aktuelles Verzeichnis als Basis verwenden
LOCAL_DIR="."
BUILD_DIR="./temp-build"

# Temporäres Build-Verzeichnis erstellen
echo -e "${YELLOW}Erstelle temporäres Build-Verzeichnis...${NC}"
mkdir -p "$BUILD_DIR"

# Wichtige Dateien kopieren
echo -e "${YELLOW}Kopiere wichtige Projektdateien...${NC}"
cp -r src "$BUILD_DIR/"
cp -r public "$BUILD_DIR/"
cp -r database "$BUILD_DIR/"
cp package.json package-lock.json next.config.js tsconfig.json "$BUILD_DIR/"
cp -r .next "$BUILD_DIR/" 2>/dev/null || echo "Kein .next Verzeichnis gefunden, wird während des Builds erstellt."
cp -r node_modules "$BUILD_DIR/" 2>/dev/null || echo "Keine node_modules gefunden. Werden auf dem Server installiert."

# Archiv erstellen
echo -e "${YELLOW}Erstelle Archiv der Anwendung...${NC}"
cd "$BUILD_DIR"
tar -czf ../heiba-rms.tar.gz .
cd ..

# Auf Server kopieren
echo -e "${YELLOW}Kopiere Archiv auf Server...${NC}"
scp $SSH_KEY_PATH heiba-rms.tar.gz $SERVER_USER@$SERVER_IP:/tmp/

# Auf Server entpacken
echo -e "${YELLOW}Entpacke und installiere die Anwendung auf dem Server...${NC}"
ssh $SSH_KEY_PATH $SERVER_USER@$SERVER_IP << 'EOD'
# Farben für bessere Lesbarkeit
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Server-seitiges Deployment
echo -e "${YELLOW}Starte server-seitiges Deployment...${NC}"

# Backup der Datenbank erstellen, falls vorhanden
DB_DIR="/var/www/heiba-rms/database"
if [ -f "$DB_DIR/heiba.db" ]; then
    echo -e "${YELLOW}Erstelle Backup der Datenbank...${NC}"
    mkdir -p /var/backups/heiba-rms
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    cp "$DB_DIR/heiba.db" "/var/backups/heiba-rms/heiba_$TIMESTAMP.db"
    echo -e "${GREEN}Datenbank-Backup erstellt.${NC}"
fi

# Leere das Zielverzeichnis, aber behalte die Datenbank
echo -e "${YELLOW}Leere das Zielverzeichnis...${NC}"
mkdir -p "$DB_DIR"
if [ -f "$DB_DIR/heiba.db" ]; then
    DB_TEMP=$(mktemp -d)
    cp "$DB_DIR/heiba.db" "$DB_TEMP/"
fi

# Entpacke in das APP_DIR
rm -rf /var/www/heiba-rms/* || true
mkdir -p /var/www/heiba-rms
tar -xzf /tmp/heiba-rms.tar.gz -C /var/www/heiba-rms/

# Stelle die Datenbank wieder her
if [ -f "$DB_TEMP/heiba.db" ]; then
    mkdir -p "$DB_DIR"
    cp "$DB_TEMP/heiba.db" "$DB_DIR/"
    rm -rf "$DB_TEMP"
fi

# Berechtigungen setzen
echo -e "${YELLOW}Setze korrekte Berechtigungen...${NC}"
chown -R www-data:www-data /var/www/heiba-rms

# Node-Module installieren falls nötig
cd /var/www/heiba-rms
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installiere Node-Module...${NC}"
    npm install --production
    echo -e "${GREEN}Node-Module installiert.${NC}"
fi

# Build durchführen falls nötig
if [ ! -d ".next" ]; then
    echo -e "${YELLOW}Führe Build durch...${NC}"
    npm run build
    echo -e "${GREEN}Build abgeschlossen.${NC}"
fi

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

# Aufräumen
rm /tmp/heiba-rms.tar.gz

# Abschließende Nachricht
echo -e "${GREEN}=== Manuelles Deployment abgeschlossen ===${NC}"
echo "$(date)"
echo -e "${GREEN}HeiBa RMS läuft jetzt auf https://heiba-rms.de${NC}"
echo -e "${GREEN}Die Anwendung ist auch unter https://www.heiba-rms.de erreichbar${NC}"
EOD

# Aufräumen
echo -e "${YELLOW}Räume auf...${NC}"
rm -rf "$BUILD_DIR" heiba-rms.tar.gz

# Abschluss
echo -e "${GREEN}=== Manuelles Deployment abgeschlossen ===${NC}"
echo "$(date)"
echo -e "${GREEN}HeiBa RMS sollte jetzt auf Ihrem Server unter https://heiba-rms.de laufen${NC}"
