# HeiBa RMS Server-Setup-Anleitung

Diese Anleitung führt Sie durch die Installation und Konfiguration des HeiBa Recruitment Management Systems auf einem Hetzner Cloud Server.

## Inhaltsverzeichnis

1. [Voraussetzungen](#voraussetzungen)
2. [Server bestellen und einrichten](#server-bestellen-und-einrichten)
3. [SSH-Zugang einrichten](#ssh-zugang-einrichten)
4. [Server-Setup ausführen](#server-setup-ausführen)
5. [Anwendung deployen](#anwendung-deployen)
6. [SSL-Zertifikat einrichten](#ssl-zertifikat-einrichten)
7. [Backups konfigurieren](#backups-konfigurieren)
8. [Überwachung und Wartung](#überwachung-und-wartung)

## Voraussetzungen

- Ein Hetzner Cloud-Konto
- SSH-Client auf Ihrem lokalen Computer
- Git-Zugang zum HeiBa RMS Repository
- Domain für die Anwendung (optional, aber empfohlen)

## Server bestellen und einrichten

1. Loggen Sie sich in Ihrem Hetzner Cloud-Konto ein: https://console.hetzner.cloud/
2. Klicken Sie auf "Neuer Server"
3. Wählen Sie folgende Konfiguration:
   - Standort: Nürnberg oder Falkenstein (geringere Latenz in Deutschland)
   - Image: Ubuntu 22.04 (LTS)
   - Typ: CX21 oder höher (je nach erwarteter Last)
   - SSH-Key: Fügen Sie Ihren öffentlichen SSH-Key hinzu, wenn vorhanden
   - Name: heiba-rms-production (oder einen anderen aussagekräftigen Namen)
4. Klicken Sie auf "Server erstellen"
5. Notieren Sie sich die IP-Adresse des Servers

## SSH-Zugang einrichten

Eine sichere SSH-Verbindung ist essentiell für den sicheren Betrieb des Servers. Folgen Sie der detaillierten Anleitung in der [SSH-Setup-Anleitung](SSH_SETUP_ANLEITUNG.md).

## Server-Setup ausführen

Das Server-Setup-Skript automatisiert die Installation aller benötigten Software und Konfigurationen.

1. Laden Sie das Setup-Skript auf den Server hoch:

```bash
scp setup-server.sh root@ihre-server-ip:/root/
```

2. Machen Sie das Skript ausführbar und führen Sie es aus:

```bash
ssh root@ihre-server-ip "chmod +x /root/setup-server.sh && /root/setup-server.sh"
```

3. Folgen Sie den Anweisungen im Skript. Es wird folgende Komponenten installieren:
   - Nginx Webserver
   - Node.js und npm
   - PM2 Process Manager
   - SQLite3
   - Firewall-Konfiguration (ufw)

Nach Abschluss des Setups können Sie unter http://ihre-server-ip eine Statusseite aufrufen, die den erfolgreichen Setup bestätigt.

## Anwendung deployen

Zum Deployment der HeiBa RMS Anwendung verwenden Sie das Deployment-Skript.

1. Laden Sie das Deployment-Skript auf den Server hoch:

```bash
scp deploy.sh root@ihre-server-ip:/root/
```

2. Machen Sie das Skript ausführbar:

```bash
ssh root@ihre-server-ip "chmod +x /root/deploy.sh"
```

3. Führen Sie das Deployment aus:

```bash
ssh root@ihre-server-ip "/root/deploy.sh"
```

Das Skript wird:
- Das Repository klonen oder aktualisieren
- Abhängigkeiten installieren
- Die Anwendung bauen
- Den PM2-Prozess starten oder neu starten

## SSL-Zertifikat einrichten

Für eine sichere HTTPS-Verbindung sollten Sie ein SSL-Zertifikat mit Let's Encrypt einrichten:

1. Installieren Sie Certbot:

```bash
ssh root@ihre-server-ip "apt-get update && apt-get install -y certbot python3-certbot-nginx"
```

2. Richten Sie die Domain in der Nginx-Konfiguration ein:

```bash
ssh root@ihre-server-ip "nano /etc/nginx/sites-available/heiba-rms"
```

3. Ändern Sie die server_name-Direktive:

```
server_name ihre-domain.de www.ihre-domain.de;
```

4. Speichern Sie die Datei und überprüfen Sie die Konfiguration:

```bash
ssh root@ihre-server-ip "nginx -t && systemctl reload nginx"
```

5. Beantragen Sie ein SSL-Zertifikat:

```bash
ssh root@ihre-server-ip "certbot --nginx -d ihre-domain.de -d www.ihre-domain.de"
```

6. Folgen Sie den Anweisungen von Certbot, um das Zertifikat einzurichten.

## Backups konfigurieren

Regelmäßige Backups sichern Ihre Daten. Nutzen Sie das Backup-Skript für automatisierte Sicherungen:

1. Laden Sie das Backup-Skript auf den Server hoch:

```bash
scp backup.sh root@ihre-server-ip:/root/
```

2. Machen Sie das Skript ausführbar:

```bash
ssh root@ihre-server-ip "chmod +x /root/backup.sh"
```

3. Richten Sie einen Cronjob für automatische Backups ein:

```bash
ssh root@ihre-server-ip "crontab -e"
```

4. Fügen Sie folgenden Eintrag für tägliche Backups hinzu:

```
0 2 * * * /root/backup.sh > /var/log/heiba-backup.log 2>&1
```

Das Backup wird täglich um 2:00 Uhr ausgeführt und in `/var/backups/heiba-rms/` gespeichert.

## Überwachung und Wartung

### PM2 Monitoring

PM2 bietet ein integriertes Monitoring:

```bash
ssh root@ihre-server-ip "pm2 monit"
```

### Systemupdates

Führen Sie regelmäßig Updates durch:

```bash
ssh root@ihre-server-ip "apt-get update && apt-get upgrade -y"
```

### Log-Dateien

Wichtige Log-Dateien für die Fehlersuche:

- Nginx: `/var/log/nginx/error.log` und `/var/log/heiba-rms/error.log`
- PM2: `pm2 logs heiba-rms`
- System: `journalctl -xe`

## Fehlerbehebung

### Nginx-Konfiguration prüfen:

```bash
ssh root@ihre-server-ip "nginx -t"
```

### PM2-Prozess neu starten:

```bash
ssh root@ihre-server-ip "pm2 restart heiba-rms"
```

### Firewall-Status prüfen:

```bash
ssh root@ihre-server-ip "ufw status"
```

### Verbindung zur Datenbank prüfen:

```bash
ssh root@ihre-server-ip "sqlite3 /var/www/heiba-rms/database/heiba.db .tables"
```

---

Bei Fragen oder Problemen wenden Sie sich bitte an den Support.
