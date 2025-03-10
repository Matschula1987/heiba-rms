# Bereitstellung auf Render.com

Diese Anleitung beschreibt, wie Sie das HeiBa-Recruitment-System auf Render.com deployen können.

## Vorbereitete Dateien

Für die Bereitstellung auf Render.com wurden folgende Anpassungen am Projekt vorgenommen:

1. **render.yaml** - Konfigurationsdatei für Render.com, die den Web-Service und den persistenten Speicher definiert
2. **Anpassung in src/lib/db.ts** - Der Datenbankpfad wurde angepasst, um den persistenten Speicher auf Render.com zu nutzen
3. **scripts/backup-db.js** - Skript zur regelmäßigen Sicherung der Datenbank

## Schritt-für-Schritt Bereitstellungsanleitung

### 1. Code auf GitHub hochladen

```bash
# Falls noch nicht initialisiert
git init
git add .
git commit -m "Initial commit"

# Mit GitHub verbinden
git remote add origin https://github.com/[IHR_USERNAME]/[IHR_REPO].git
git branch -M main
git push -u origin main
```

### 2. Render.com-Konto erstellen

1. Besuchen Sie [render.com](https://render.com/) und erstellen Sie ein Konto
2. Bestätigen Sie Ihre E-Mail-Adresse

### 3. Neuen Web Service erstellen

1. Klicken Sie im Render Dashboard auf "New +" und wählen Sie "Web Service"
2. Verbinden Sie Ihr GitHub-Repository
3. Wählen Sie "Render Blueprint" als Bereitstellungsoption (nutzt die render.yaml)
4. Falls manuelle Konfiguration: Füllen Sie die Felder wie folgt aus:
   - **Name**: heiba-recruitment
   - **Region**: EU (Frankfurt) oder eine andere Region in Europa
   - **Branch**: main
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

### 4. Persistenten Speicher konfigurieren

Der persistente Speicher ist bereits in der render.yaml definiert. Falls Sie manuell konfigurieren:

1. Gehen Sie in Ihrem Web Service zu "Settings"
2. Scrollen Sie zu "Disks"
3. Erstellen Sie einen Datenträger mit folgenden Einstellungen:
   - **Name**: heiba-data
   - **Mount Path**: /data
   - **Size**: 1 GB

### 5. Datenbank initialisieren

Nach dem ersten Deployment müssen Sie die Datenbank initialisieren:

1. Gehen Sie in Ihrem Web Service Dashboard zu "Shell"
2. Führen Sie die folgenden Befehle aus:
   ```bash
   # Navigieren Sie zum Projektverzeichnis
   cd /opt/render/project/src
   
   # Setzen Sie die Umgebungsvariable
   export NODE_ENV=production
   
   # Initialisieren Sie die Datenbank
   node -e "require('./src/lib/db').initDb()"
   ```

### 6. Benutzerdefinierte Domain einrichten (optional)

1. Gehen Sie in Ihrem Web Service zu "Settings"
2. Scrollen Sie zu "Custom Domain"
3. Klicken Sie auf "Add Custom Domain"
4. Geben Sie Ihre Domain ein (z.B. recruitment.ihrfirma.de)
5. Folgen Sie den Anweisungen, um die DNS-Einstellungen bei Ihrem Domain-Provider zu konfigurieren
   - In der Regel müssen Sie einen CNAME-Eintrag erstellen, der auf Ihre Render URL zeigt
   - Oder A-Records für die angegebenen IP-Adressen einrichten

### 7. Regelmäßige Datensicherung einrichten (optional)

Das Backup-Skript `scripts/backup-db.js` sichert die Datenbank in den persistenten Speicher.

Manuell ausführen:
```bash
cd /opt/render/project/src
node scripts/backup-db.js
```

Um regelmäßige Backups einzurichten, könnten Sie einen eigenen Cron-Job-Service verwenden oder ein externer Scheduler wie UptimeRobot verwenden.

## Umgang mit dem Inaktivitäts-Spin-down

Im kostenlosen Plan von Render.com wird der Dienst nach 15 Minuten Inaktivität heruntergefahren, was zu einer Verzögerung (ca. 30-60 Sekunden) beim nächsten Aufruf führt. Lösungsansätze:

1. **Health-Checker einrichten**: Nutzen Sie einen kostenlosen Dienst wie UptimeRobot, um Ihre Seite alle 5-10 Minuten zu pingen.
2. **Auf bezahlten Plan upgraden**: Der "Starter"-Plan von Render.com ($7/Monat) bietet Always-On-Service.

## Fehlersuche

Wenn Probleme auftreten:

1. Prüfen Sie die Logs im Render Dashboard
2. Stellen Sie sicher, dass der persistente Speicher ordnungsgemäß gemountet ist (`ls -la /data`)
3. Überprüfen Sie, ob die Datenbank existiert (`ls -la /data/heiba.db`)
4. Prüfen Sie den Zustand der Datenbank (`sqlite3 /data/heiba.db .tables`)

## Lokale Entwicklung

Für die lokale Entwicklung bleibt alles unverändert. Die Anpassungen im Code berücksichtigen automatisch, ob die Anwendung in Produktion oder Entwicklung läuft.

```bash
# Starten des Entwicklungsservers
npm run dev
```

Nach dem Pushen von Änderungen an GitHub führt Render.com automatisch ein neues Deployment durch.
