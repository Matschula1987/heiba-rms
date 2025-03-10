#!/bin/bash

# HeiBa RMS - Domain und SSL Setup Script
# Dieses Skript richtet die Domain www.heiba-rms.de mit SSL auf dem Server ein

# Domain-Konfiguration
DOMAIN="heiba-rms.de"
WWW_DOMAIN="www.heiba-rms.de"

# Verzeichnisse
APP_DIR="/var/www/heiba-rms"
LOG_DIR="/var/log/heiba-rms"

# Fehlerbehandlung aktivieren
set -e
set -o pipefail

# Farbcodes für bessere Lesbarkeit
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Hilfsfunktion für Abschnittstrennungen
section() {
    echo
    echo -e "${YELLOW}=== $1 ===${NC}"
}

# Funktion zur Überprüfung des letzten Befehls
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $1${NC}"
    else
        echo -e "${RED}✗ $1${NC}"
        exit 1
    fi
}

# Prüfen, ob das Skript als Root ausgeführt wird
if [ "$(id -u)" -ne 0 ]; then
    echo -e "${RED}Fehler: Dieses Skript muss als Root ausgeführt werden. Bitte verwenden Sie 'sudo'.${NC}"
    exit 1
fi

# Startmeldung
echo -e "${GREEN}=================================================${NC}"
echo -e "${GREEN}  HeiBa RMS - Domain und SSL Setup              ${NC}"
echo -e "${GREEN}=================================================${NC}"
echo -e "Dieses Skript konfiguriert die Domain ${YELLOW}${DOMAIN}${NC} und ${YELLOW}${WWW_DOMAIN}${NC}"
echo -e "mit SSL-Verschlüsselung für Ihre HeiBa RMS Installation."
echo -e "Server IP: $(hostname -I | awk '{print $1}')"
echo -e "Datum: $(date)"
echo -e "${GREEN}=================================================${NC}"
echo

# Bestätigung vom Benutzer einholen
read -p "Möchten Sie mit der Domain-Konfiguration fortfahren? (j/n): " confirm
if [[ $confirm != [jJ] ]]; then
    echo -e "${YELLOW}Konfiguration abgebrochen.${NC}"
    exit
fi

# Nginx-Konfiguration aktualisieren
section "Nginx Konfiguration für Domain aktualisieren"

# Backup der vorhandenen Konfiguration
if [ -f /etc/nginx/sites-available/heiba-rms ]; then
    cp /etc/nginx/sites-available/heiba-rms /etc/nginx/sites-available/heiba-rms.bak
    check_status "Backup der Nginx-Konfiguration erstellt"
fi

# Neue Konfiguration erstellen
cat > /etc/nginx/sites-available/heiba-rms << EOL
server {
    listen 80;
    listen [::]:80;
    
    server_name ${DOMAIN} ${WWW_DOMAIN};
    
    # Root-Verzeichnis der Anwendung
    root ${APP_DIR};
    
    # Logs
    access_log ${LOG_DIR}/access.log;
    error_log ${LOG_DIR}/error.log;
    
    # Standardindex-Dateien
    index index.html index.htm;
    
    # Reverse Proxy für die Node.js-Anwendung
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Statische Dateien
    location /static/ {
        alias ${APP_DIR}/public/;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
    
    # Uploads
    location /uploads/ {
        alias ${APP_DIR}/uploads/;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
}
EOL

check_status "Nginx-Konfiguration für Domain erstellt"

# Nginx-Konfiguration testen
nginx -t
check_status "Nginx-Konfiguration getestet"

# Nginx neu starten
systemctl restart nginx
check_status "Nginx neu gestartet"

# Certbot installieren (wenn noch nicht vorhanden)
section "Certbot für SSL-Zertifikat installieren"
if ! command -v certbot &> /dev/null; then
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
    check_status "Certbot installiert"
else
    echo -e "${YELLOW}Certbot ist bereits installiert.${NC}"
fi

# SSL-Zertifikat beantragen
section "SSL-Zertifikat mit Let's Encrypt beantragen"
echo -e "${YELLOW}Wichtig: Stellen Sie sicher, dass die DNS-Einträge für ${DOMAIN} und ${WWW_DOMAIN}${NC}"
echo -e "${YELLOW}auf die IP-Adresse $(hostname -I | awk '{print $1}') dieses Servers zeigen.${NC}"
echo -e "${YELLOW}Warten Sie nach der DNS-Aktualisierung einige Minuten, bis die Änderungen aktiv sind.${NC}"
echo

read -p "Sind die DNS-Einträge korrekt konfiguriert und aktiv? (j/n): " dns_ready
if [[ $dns_ready != [jJ] ]]; then
    echo -e "${YELLOW}Bitte konfigurieren Sie die DNS-Einträge und führen Sie dieses Skript erneut aus.${NC}"
    exit
fi

# SSL-Zertifikat mit Certbot beantragen
certbot --nginx -d ${DOMAIN} -d ${WWW_DOMAIN} --agree-tos --email webmaster@${DOMAIN} --redirect --non-interactive
check_status "SSL-Zertifikat installiert"

# Informationen zum Certbot-Renewal-Cronjob anzeigen
section "Automatische Zertifikatserneuerung"
echo -e "Ein Cronjob für die automatische Erneuerung des Zertifikats wurde eingerichtet."
echo -e "Sie können dies mit folgendem Befehl überprüfen:"
echo -e "  ${YELLOW}systemctl status certbot.timer${NC}"
echo

# Abschlussinformationen
section "Domain-Setup abgeschlossen"
echo -e "${GREEN}Die Domain ${DOMAIN} und ${WWW_DOMAIN} wurden erfolgreich eingerichtet.${NC}"
echo -e "${GREEN}Sie können Ihre Anwendung nun unter https://${WWW_DOMAIN} erreichen.${NC}"
echo
echo -e "${GREEN}=== Zusammenfassung ===${NC}"
echo -e "Domain: ${DOMAIN} und ${WWW_DOMAIN}"
echo -e "Webserver: Nginx mit SSL"
echo -e "SSL-Anbieter: Let's Encrypt (automatische Erneuerung alle 90 Tage)"
echo
echo -e "${GREEN}=================================================${NC}"
echo -e "${GREEN}  Domain-Setup abgeschlossen!                   ${NC}"
echo -e "${GREEN}=================================================${NC}"
