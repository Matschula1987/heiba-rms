#!/bin/bash

# HeiBa Recruitment Management System - Server Setup Script
# Dieses Skript richtet einen neuen Ubuntu Server für das HeiBa RMS ein

# Konfiguration - Directories
APP_DIR="/var/www/heiba-rms"
LOG_DIR="/var/log/heiba-rms"
DB_DIR="/var/www/heiba-rms/database"

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

# Hilfsfunktion für Abschnittstrennungen
section() {
    echo
    echo -e "${YELLOW}=== $1 ===${NC}"
}

# Prüfen, ob das Skript als Root ausgeführt wird
if [ "$(id -u)" -ne 0 ]; then
    echo -e "${RED}Fehler: Dieses Skript muss als Root ausgeführt werden. Bitte verwenden Sie 'sudo'.${NC}"
    exit 1
fi

# Startmeldung
echo -e "${GREEN}=================================================${NC}"
echo -e "${GREEN}  HeiBa RMS - Server Setup                      ${NC}"
echo -e "${GREEN}=================================================${NC}"
echo -e "Dieser Assistent konfiguriert Ihren Server für HeiBa RMS."
echo -e "Hostname: $(hostname)"
echo -e "Server IP: $(hostname -I | awk '{print $1}')"
echo -e "Datum: $(date)"
echo -e "${GREEN}=================================================${NC}"
echo

# Bestätigung vom Benutzer einholen
read -p "Möchten Sie mit der Installation fortfahren? (j/n): " confirm
if [[ $confirm != [jJ] ]]; then
    echo -e "${YELLOW}Installation abgebrochen.${NC}"
    exit
fi

# System Update
section "System Update"
apt-get update
check_status "System-Paketlisten aktualisiert"
apt-get upgrade -y
check_status "System-Pakete aktualisiert"

# Grundlegende Pakete installieren
section "Installation grundlegender Pakete"
apt-get install -y git curl wget ufw build-essential sqlite3
check_status "Grundlegende Pakete installiert"

# Node.js Installation (falls noch nicht installiert)
section "Node.js Installation und Konfiguration"
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js wird installiert...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
    check_status "Node.js installiert"
else
    echo -e "${YELLOW}Node.js ist bereits installiert (Version: $(node -v))${NC}"
fi

# PM2 Installation
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}PM2 wird installiert...${NC}"
    npm install -g pm2
    check_status "PM2 installiert"
    
    # PM2 Startup konfigurieren
    pm2 startup
    check_status "PM2 Startup konfiguriert"
else
    echo -e "${YELLOW}PM2 ist bereits installiert (Version: $(pm2 -v))${NC}"
fi

# Nginx Installation und Konfiguration
section "Nginx Installation und Konfiguration"
if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
    check_status "Nginx installiert"
else
    echo -e "${YELLOW}Nginx ist bereits installiert (Version: $(nginx -v 2>&1 | cut -d'/' -f2))${NC}"
fi

# Firewall konfigurieren
section "Firewall-Konfiguration"
ufw status | grep -q "Status: active" || ufw enable
check_status "Firewall aktiviert"

# HTTP und HTTPS erlauben
ufw allow 'Nginx Full'
check_status "Nginx (HTTP/HTTPS) in Firewall erlaubt"

# SSH erlauben
ufw allow ssh
check_status "SSH in Firewall erlaubt"

# Anwendungsverzeichnisse erstellen
section "Anwendungsverzeichnisse erstellen"
mkdir -p "$APP_DIR"
mkdir -p "$LOG_DIR"
mkdir -p "$DB_DIR"
check_status "Anwendungsverzeichnisse erstellt"

# Berechtigungen setzen
chown -R www-data:www-data "$APP_DIR"
chown -R www-data:www-data "$LOG_DIR"
chmod -R 755 "$APP_DIR"
check_status "Berechtigungen gesetzt"

# Nginx-Konfiguration erstellen
section "Nginx-Konfiguration"
cat > /etc/nginx/sites-available/heiba-rms << 'EOL'
server {
    listen 80;
    listen [::]:80;
    
    # Server-Namen (Domain oder IP) - Später anpassen
    server_name _;
    
    # Root-Verzeichnis der Anwendung
    root /var/www/heiba-rms;
    
    # Logs
    access_log /var/log/heiba-rms/access.log;
    error_log /var/log/heiba-rms/error.log;
    
    # Standardindex-Dateien
    index index.html index.htm;
    
    # Reverse Proxy für die Node.js-Anwendung
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Statische Dateien
    location /static/ {
        alias /var/www/heiba-rms/public/;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
    
    # Uploads
    location /uploads/ {
        alias /var/www/heiba-rms/uploads/;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
}
EOL
check_status "Nginx-Konfigurationsdatei erstellt"

# Nginx-Konfiguration aktivieren
if [ -f /etc/nginx/sites-enabled/heiba-rms ]; then
    rm /etc/nginx/sites-enabled/heiba-rms
fi

ln -s /etc/nginx/sites-available/heiba-rms /etc/nginx/sites-enabled/
check_status "Nginx-Konfiguration aktiviert"

# Nginx-Konfiguration testen
nginx -t
check_status "Nginx-Konfiguration getestet"

# Nginx neu starten
systemctl restart nginx
check_status "Nginx neu gestartet"

# Einfache Info-Seite erstellen
section "Temporäre Info-Seite erstellen"
cat > /var/www/html/index.html << 'EOL'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>HeiBa RMS Server</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 40px;
            color: #333;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        .success-message {
            background-color: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
        }
        .info-section {
            margin-top: 30px;
        }
        .info-section h2 {
            color: #2c3e50;
            font-size: 1.5em;
        }
        .info-section ul {
            list-style-type: none;
            padding-left: 10px;
        }
        .info-section li {
            margin-bottom: 10px;
            padding-left: 20px;
            position: relative;
        }
        .info-section li:before {
            content: '✓';
            position: absolute;
            left: 0;
            color: #28a745;
            font-weight: bold;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 0.9em;
            color: #6c757d;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>HeiBa Recruitment Management System</h1>
        <div class="success-message">
            <strong>Erfolg!</strong> Der Server wurde erfolgreich eingerichtet und ist betriebsbereit.
        </div>
        <div class="info-section">
            <h2>Server-Information:</h2>
            <ul>
                <li>Plattform: Ubuntu Linux</li>
                <li>Webserver: Nginx</li>
                <li>Node.js: Installiert</li>
                <li>PM2: Installiert</li>
                <li>IP-Adresse: SERVER_IP</li>
            </ul>
        </div>
        <div class="info-section">
            <h2>Nächste Schritte:</h2>
            <ul>
                <li>Deployment der HeiBa RMS Anwendung</li>
                <li>Einrichtung der SSL-Verschlüsselung</li>
                <li>Domain-Konfiguration</li>
                <li>Datenbank-Setup</li>
            </ul>
        </div>
        <div class="footer">
            &copy; 2025 HeiBa Recruitment Management System | Server Setup: SETUP_DATE
        </div>
    </div>
</body>
</html>
EOL

# Server-IP und Datum in die Info-Seite einfügen
SERVER_IP=$(hostname -I | awk '{print $1}')
SETUP_DATE=$(date +"%d.%m.%Y")
sed -i "s/SERVER_IP/$SERVER_IP/" /var/www/html/index.html
sed -i "s/SETUP_DATE/$SETUP_DATE/" /var/www/html/index.html
check_status "Temporäre Info-Seite erstellt"

# Zusammenfassung
section "Installation abgeschlossen"
echo -e "${GREEN}HeiBa RMS Server-Setup wurde erfolgreich abgeschlossen!${NC}"
echo -e "${YELLOW}Server-IP: $SERVER_IP${NC}"
echo -e "${YELLOW}Node.js Version: $(node -v)${NC}"
echo -e "${YELLOW}NPM Version: $(npm -v)${NC}"
echo -e "${YELLOW}PM2 Version: $(pm2 -v)${NC}"
echo
echo -e "${GREEN}Nächste Schritte:${NC}"
echo -e "1. Klonen Sie das HeiBa RMS Repository auf den Server"
echo -e "2. Führen Sie das Deployment-Skript aus: sudo ./deploy.sh"
echo -e "3. Richten Sie eine Domain und SSL ein (optional, aber empfohlen)"
echo
echo -e "${YELLOW}Sie können nun auf die Server-Info-Seite zugreifen:${NC}"
echo -e "${GREEN}http://$SERVER_IP${NC}"
echo
echo -e "${GREEN}=================================================${NC}"
echo -e "${GREEN}  Server-Setup abgeschlossen!                    ${NC}"
echo -e "${GREEN}=================================================${NC}"
