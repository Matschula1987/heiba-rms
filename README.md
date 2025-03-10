# Hetzner Cloud Deployment für HeiBa Recruitment

Diese Anleitung beschreibt, wie Sie das HeiBa Recruitment System auf einem Hetzner Cloud CX22 Server bereitstellen können.

## Voraussetzungen

- Hetzner Cloud CX22 Server (2 vCPUs, 4GB RAM, 40GB Speicher)
- Ubuntu 24.04 (oder 22.04)
- Domain, die auf die Server-IP zeigt
- SSH-Zugang zum Server

## 1. Server einrichten

1. Laden Sie die Skripte auf Ihren Server hoch:

```bash
# Auf Ihrem lokalen Computer, im Verzeichnis mit den Skripten
scp server-setup.sh deploy.sh backup.sh root@IHRE_SERVER_IP:/root/
```

2. Verbinden Sie sich mit SSH mit Ihrem Server:

```bash
ssh root@IHRE_SERVER_IP
```

3. Machen Sie die Skripte ausführbar:

```bash
chmod +x server-setup.sh deploy.sh backup.sh
```

4. Führen Sie das Server-Setup-Skript aus:

```bash
./server-setup.sh
```

## 2. Domain konfigurieren

1. Konfigurieren Sie Ihre Domain bei IONOS:
   - Fügen Sie einen A-Record hinzu, der auf Ihre Server-IP zeigt
   - Name: @ (oder leer für die Hauptdomain)
   - Wert: IHRE_SERVER_IP
   - TTL: 3600

2. Optional: Fügen Sie einen CNAME-Record für die "www"-Subdomain hinzu:
   - Typ: CNAME
   - Name: www
   - Wert: @
   - TTL: 3600

3. Bearbeiten Sie die Nginx-Konfiguration mit Ihrem Domainnamen:

```bash
nano /etc/nginx/sites-available/heiba-site
```

Ersetzen Sie "example.de" durch Ihre Domain und speichern Sie die Datei.

4. Starten Sie Nginx neu:

```bash
systemctl restart nginx
```

## 3. Anwendung deployen

Führen Sie das Deployment-Skript aus:

```bash
./deploy.sh
```

Dies klont das Repository, installiert alle Abhängigkeiten, baut die Anwendung und startet sie mit PM2.

## 4. SSL-Zertifikat einrichten

1. Installieren Sie certbot:

```bash
apt install -y certbot python3-certbot-nginx
```

2. Richten Sie das SSL-Zertifikat ein:

```bash
certbot --nginx -d ihre-domain.de -d www.ihre-domain.de
```

Folgen Sie den Anweisungen des Assistenten. Certbot aktualisiert automatisch Ihre Nginx-Konfiguration.

## 5. Backups einrichten

1. Führen Sie das Backup-Skript manuell aus, um es zu testen:

```bash
./backup.sh
```

2. Richten Sie einen Cronjob für regelmäßige Backups ein:

```bash
# Bearbeiten Sie die Crontab-Datei
crontab -e
```

3. Fügen Sie folgende Zeile hinzu, um täglich um 3:00 Uhr ein Backup zu erstellen:

```
0 3 * * * /root/backup.sh > /var/log/heiba-backup.log 2>&1
```

## 6. Nützliche Befehle

- **Anwendungsstatus überprüfen**: `pm2 status`
- **Anwendungslogs anzeigen**: `pm2 logs heiba-recruitment`
- **Anwendung neustarten**: `pm2 restart heiba-recruitment`
- **Nginx-Status überprüfen**: `systemctl status nginx`
- **Nginx-Logs anzeigen**: `tail -f /var/log/nginx/heiba-access.log`
- **Manuelles Backup erstellen**: `./backup.sh`

## 7. Domain-Aktualisierung

Wenn Sie Ihre Domain ändern möchten:

1. Aktualisieren Sie die DNS-Einstellungen bei Ihrem Domainanbieter
2. Bearbeiten Sie die Nginx-Konfiguration:
   ```bash
   nano /etc/nginx/sites-available/heiba-site
   ```
3. Führen Sie certbot erneut für die neue Domain aus:
   ```bash
   certbot --nginx -d neue-domain.de -d www.neue-domain.de
   ```
4. Starten Sie Nginx neu:
   ```bash
   systemctl restart nginx
   ```

## Fehlerbehebung

- **Anwendung startet nicht**: Überprüfen Sie die Logs mit `pm2 logs heiba-recruitment`
- **Nginx-Fehler**: Überprüfen Sie `/var/log/nginx/error.log`
- **SSL-Probleme**: Führen Sie `certbot certificates` aus, um den Status Ihrer Zertifikate zu überprüfen
- **Datenbank-Probleme**: Überprüfen Sie die Berechtigungen und den Pfad der Datenbankdatei
