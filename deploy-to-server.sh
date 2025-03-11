#!/bin/bash

# HeiBa RMS - Server Deployment Skript
# Dieses Skript führt alle notwendigen Schritte zum Deployment der HeiBa RMS auf dem Server aus

# Farbkodierung für Ausgaben
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Server-Informationen
SERVER_IP="195.201.26.134"
SERVER_USER="root"
DOMAIN="heiba-rms.de"
WWW_DOMAIN="www.heiba-rms.de"
APP_DIR="/var/www/heiba-rms"
GITHUB_REPO="https://github.com/Matschula1987/heiba-rms.git"

# Abschnittsfunktion zur besseren Lesbarkeit
section() {
    echo
    echo -e "${YELLOW}=== $1 ===${NC}"
    echo
}

# Prüfe SSH-Zugang
section "SSH-Verbindung testen"
echo -e "Teste SSH-Verbindung zu ${SERVER_USER}@${SERVER_IP}..."
ssh -o BatchMode=yes -o ConnectTimeout=5 ${SERVER_USER}@${SERVER_IP} echo "SSH-Verbindung erfolgreich!" || {
    echo -e "${RED}SSH-Verbindung fehlgeschlagen. Bitte überprüfen Sie Ihre SSH-Konfiguration.${NC}"
    echo -e "${YELLOW}Falls Sie noch keinen SSH-Schlüssel eingerichtet haben, führen Sie bitte folgende Befehle aus:${NC}"
    echo -e "  ssh-keygen -t rsa -b 4096"
    echo -e "  ssh-copy-id ${SERVER_USER}@${SERVER_IP}"
    exit 1
}

# Repository auf Server klonen
section "Repository auf Server klonen"
echo -e "Folgende Befehle werden auf dem Server ausgeführt:"
echo -e "${YELLOW}1. Vorhandenes Repository entfernen (falls vorhanden):${NC}"
echo -e "   rm -rf ${APP_DIR}"
echo -e "${YELLOW}2. Neues Repository klonen:${NC}"
echo -e "   git clone ${GITHUB_REPO} ${APP_DIR}"
echo -e "${YELLOW}3. Berechtigungen für Skripte setzen:${NC}"
echo -e "   chmod +x ${APP_DIR}/*.sh"

# Führe Befehle auf dem Server aus
ssh ${SERVER_USER}@${SERVER_IP} << EOF
    echo "Verbindung zum Server hergestellt..."
    
    # Entferne vorhandenes Repository, falls vorhanden
    if [ -d "${APP_DIR}" ]; then
        echo "Entferne vorhandenes Repository..."
        rm -rf ${APP_DIR}
    fi
    
    # Klone das Repository
    echo "Klone Repository von GitHub..."
    git clone ${GITHUB_REPO} ${APP_DIR}
    
    # Setze Ausführungsberechtigungen für Skripte
    echo "Setze Berechtigungen für Skripte..."
    chmod +x ${APP_DIR}/*.sh
    
    echo "Repository wurde erfolgreich geklont und vorbereitet."
EOF

# Deployment ausführen
section "Deployment ausführen"
echo -e "Führe deploy-master.sh auf dem Server aus..."
ssh ${SERVER_USER}@${SERVER_IP} << EOF
    cd ${APP_DIR}
    ./deploy-master.sh
EOF

# Domain und SSL einrichten
section "Domain und SSL einrichten"
echo -e "Führe Domain-Einrichtung durch..."
ssh ${SERVER_USER}@${SERVER_IP} << EOF
    cd ${APP_DIR}
    
    # Domain einrichten
    echo "Setze Nginx-Konfiguration für Domain ${DOMAIN} und ${WWW_DOMAIN} auf..."
    ./setup-domain.sh
    
    # SSL-Zertifikat mit Certbot beantragen
    echo "Beantrage SSL-Zertifikat mit Certbot..."
    certbot --nginx -d ${DOMAIN} -d ${WWW_DOMAIN} --agree-tos --redirect --non-interactive
EOF

# Datenbank initialisieren
section "Datenbank initialisieren"
echo -e "Initialisiere Datenbank, falls notwendig..."
ssh ${SERVER_USER}@${SERVER_IP} << EOF
    cd ${APP_DIR}
    
    # Prüfe, ob Datenbankinitialisierung notwendig ist
    if [ ! -f "${APP_DIR}/database/heiba.db" ]; then
        echo "Initialisiere Datenbank..."
        node scripts/init-db.js
    else
        echo "Datenbank scheint bereits zu existieren. Überspringen..."
    fi
EOF

# PM2-Prozesse prüfen und neu starten
section "Anwendung neu starten"
echo -e "Überprüfe PM2-Prozesse und starte sie neu..."
ssh ${SERVER_USER}@${SERVER_IP} << EOF
    # PM2-Status anzeigen
    echo "Aktueller PM2-Status:"
    pm2 status
    
    # Anwendung neu starten, falls sie bereits existiert
    if pm2 list | grep -q "heiba-rms"; then
        echo "Starte heiba-rms-Prozess neu..."
        pm2 restart heiba-rms
    else
        echo "Starte heiba-rms als neuen Prozess..."
        cd ${APP_DIR}
        pm2 start npm --name "heiba-rms" -- start
        pm2 save
    fi
    
    # Erneut PM2-Status anzeigen
    echo "Aktualisierter PM2-Status:"
    pm2 status
EOF

# Abschluss und Zusammenfassung
section "Deployment abgeschlossen"
echo -e "${GREEN}Das Deployment wurde erfolgreich abgeschlossen!${NC}"
echo -e "Die Anwendung sollte nun unter folgenden URLs erreichbar sein:"
echo -e "  - https://${DOMAIN}"
echo -e "  - https://${WWW_DOMAIN}"
echo
echo -e "${YELLOW}Hinweise zur Fehlerbehebung:${NC}"
echo -e "- Überprüfen Sie die Logs mit: ssh ${SERVER_USER}@${SERVER_IP} 'pm2 logs heiba-rms'"
echo -e "- Nginx-Status: ssh ${SERVER_USER}@${SERVER_IP} 'systemctl status nginx'"
echo -e "- Nginx-Logs: ssh ${SERVER_USER}@${SERVER_IP} 'tail -f /var/log/nginx/error.log'"
echo
echo -e "${GREEN}=== Deployment abgeschlossen ===${NC}"
