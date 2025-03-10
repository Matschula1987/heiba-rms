#!/bin/bash

# ---------------------------------------
# Server-Setup-Skript für HeiBa Recruitment auf Hetzner Cloud
# ---------------------------------------

# Farben für die Ausgabe
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starte Server-Setup für HeiBa Recruitment...${NC}"

# Root-Verzeichnis für die Anwendung
APP_DIR="/var/www/heiba-recruitment"
DATA_DIR="/data/heiba"

# Domainname und Server-IP
DOMAIN="heiba-rms.de"
WWW_DOMAIN="www.heiba-rms.de"
SERVER_IP="88.99.13.32"

# Prüfen, ob das Skript als Root ausgeführt wird
if [ "$(id -u)" != "0" ]; then
   echo -e "${RED}Dieses Skript muss als Root ausgeführt werden!${NC}" 
   exit 1
fi

# -----------------------------
# 1. System aktualisieren
# -----------------------------
echo -e "${YELLOW}1. Aktualisiere System-Pakete...${NC}"
apt update && apt upgrade -y

# -----------------------------
# 2. Basis-Pakete installieren
# -----------------------------
echo -e "${YELLOW}2. Installiere Basis-Pakete...${NC}"
apt install -y curl wget git nano htop ufw fail2ban

# -----------------------------
# 3. Node.js installieren
# -----------------------------
echo -e "${YELLOW}3. Installiere Node.js 18.x...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Yarn installieren
echo -e "${YELLOW}Installiere Yarn...${NC}"
npm install -g yarn

# PM2 installieren
echo -e "${YELLOW}Installiere PM2...${NC}"
npm install -g pm2

# -----------------------------
# 4. Nginx installieren und konfigurieren
# -----------------------------
echo -e "${YELLOW}4. Installiere und konfiguriere Nginx...${NC}"
apt install -y nginx

# Nginx-Konfigurationsdatei erstellen
cat > /etc/nginx/sites-available/heiba-site << EOF
server {
    listen 80;
    server_name ${DOMAIN} ${WWW_DOMAIN};
    
    # Logging-Konfiguration
    access_log /var/log/nginx/heiba-access.log;
    error_log /var/log/nginx/heiba-error.log;

    # Proxy-Einstellungen
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
    
    # Cache-Konfiguration für statische Dateien
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
EOF

# Aktivieren der Nginx-Site
ln -s /etc/nginx/sites-available/heiba-site /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Nginx neustarten
systemctl restart nginx

# -----------------------------
# 5. Firewall einrichten
# -----------------------------
echo -e "${YELLOW}5. Konfiguriere Firewall...${NC}"
# SSH, HTTP und HTTPS zulassen
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Firewall aktivieren (mit Y bestätigen)
echo "y" | ufw enable

# -----------------------------
# 6. Verzeichnisse erstellen und Berechtigungen setzen
# -----------------------------
echo -e "${YELLOW}6. Erstelle Anwendungs- und Datenverzeichnisse...${NC}"
mkdir -p $APP_DIR
mkdir -p $DATA_DIR
mkdir -p $DATA_DIR/database
mkdir -p $DATA_DIR/uploads
mkdir -p $DATA_DIR/backups

# -----------------------------
# 7. Fail2ban konfigurieren (Schutz vor Brute-Force-Angriffen)
# -----------------------------
echo -e "${YELLOW}7. Konfiguriere Fail2ban...${NC}"
systemctl enable fail2ban
systemctl start fail2ban

# -----------------------------
# 8. Certbot für SSL installieren
# -----------------------------
echo -e "${YELLOW}8. Installiere Certbot für SSL...${NC}"
apt install -y certbot python3-certbot-nginx

# -----------------------------
# 9. Backup-Cronjob einrichten
# -----------------------------
echo -e "${YELLOW}9. Richte automatischen Backup-Cronjob ein...${NC}"

# Backup-Skript in Verzeichnis kopieren
cp $(dirname "$0")/backup.sh /data/heiba/

# Backup-Skript ausführbar machen
chmod +x /data/heiba/backup.sh

# Cronjob für tägliches Backup um 3 Uhr morgens einrichten
(crontab -l 2>/dev/null; echo "0 3 * * * /data/heiba/backup.sh > /var/log/heiba-backup.log 2>&1") | crontab -

# -----------------------------
# 10. SSH-Sicherheit verbessern
# -----------------------------
echo -e "${YELLOW}10. Verbessere SSH-Sicherheit...${NC}"

# Ändere SSH-Konfiguration für erhöhte Sicherheit
cat > /etc/ssh/sshd_config.d/secure.conf << EOF
# Deaktiviere Passwort-Authentifizierung (nach Key-Setup aktivieren)
# PasswordAuthentication no

# Deaktiviere Root-Login
PermitRootLogin prohibit-password

# Limit Login-Versuche
MaxAuthTries 3

# Verwende nur sichere Protokolle
Protocol 2
EOF

# SSH-Dienst neustarten
systemctl restart sshd

# -----------------------------
# 11. Abschluss und Zusammenfassung
# -----------------------------
echo -e "${GREEN}Server-Setup abgeschlossen!${NC}"
echo -e "${YELLOW}Nächste Schritte:${NC}"
echo -e "1. SSL-Zertifikate installieren: ${GREEN}certbot --nginx -d ${DOMAIN} -d ${WWW_DOMAIN}${NC}"
echo -e "2. Führen Sie das Deployment-Skript aus: ${GREEN}./deploy.sh${NC}"
echo -e "3. Bei Bedarf SSH-Keys einrichten und dann PasswordAuthentication deaktivieren"

echo -e "\n${GREEN}Server-Informationen:${NC}"
echo -e "Server-IP: ${SERVER_IP}"
echo -e "Domainname: ${DOMAIN} / ${WWW_DOMAIN}"
echo -e "Anwendungspfad: ${APP_DIR}"
echo -e "Datenpfad: ${DATA_DIR}"
echo -e "Backup-Zeitplan: Täglich um 3 Uhr morgens"
