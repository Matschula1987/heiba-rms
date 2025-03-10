# SSH-Zugang zum Server einrichten

Diese Anleitung führt Sie durch den Prozess, einen sicheren SSH-Zugang zu Ihrem Hetzner-Server einzurichten.

## 1. SSH-Key erstellen (falls noch nicht vorhanden)

### Für Windows (mit PowerShell)

1. Öffnen Sie PowerShell
2. Prüfen Sie, ob bereits ein SSH-Key existiert:

```powershell
ls $env:USERPROFILE\.ssh\
```

3. Falls kein Schlüsselpaar existiert, erstellen Sie eines:

```powershell
ssh-keygen -t ed25519 -C "ihre-email@beispiel.de"
```

4. Folgen Sie den Anweisungen. Es wird empfohlen, ein Passwort für Ihren privaten Schlüssel festzulegen.

### Für MacOS/Linux

1. Öffnen Sie das Terminal
2. Prüfen Sie, ob bereits ein SSH-Key existiert:

```bash
ls -la ~/.ssh
```

3. Falls kein Schlüsselpaar existiert, erstellen Sie eines:

```bash
ssh-keygen -t ed25519 -C "ihre-email@beispiel.de"
```

4. Folgen Sie den Anweisungen. Es wird empfohlen, ein Passwort für Ihren privaten Schlüssel festzulegen.

## 2. Öffentlichen Schlüssel auf den Server kopieren

### Möglichkeit 1: Mit ssh-copy-id (MacOS/Linux)

Wenn Sie Zugriff auf den Server mit einem Passwort haben:

```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub root@ihre-server-ip
```

### Möglichkeit 2: Manuelles Kopieren (Windows/MacOS/Linux)

1. Zeigen Sie Ihren öffentlichen Schlüssel an:

```
# Windows (PowerShell)
Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub

# MacOS/Linux
cat ~/.ssh/id_ed25519.pub
```

2. Kopieren Sie den ausgegebenen Text (beginnt mit "ssh-ed25519" und endet mit Ihrer E-Mail-Adresse).

3. Loggen Sie sich in Ihren Server ein:

```
ssh root@ihre-server-ip
```

4. Erstellen oder bearbeiten Sie die authorized_keys-Datei:

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
nano ~/.ssh/authorized_keys
```

5. Fügen Sie den kopierten öffentlichen Schlüssel ein, speichern Sie die Datei und schließen Sie den Editor.

6. Setzen Sie die richtigen Berechtigungen:

```bash
chmod 600 ~/.ssh/authorized_keys
```

## 3. SSH-Konfiguration sichern

1. Bearbeiten Sie die SSH-Server-Konfiguration:

```bash
nano /etc/ssh/sshd_config
```

2. Setzen Sie die folgenden Parameter (einige könnten bereits gesetzt sein):

```
PermitRootLogin prohibit-password  # nur SSH-Key-Authentifizierung für Root
PasswordAuthentication no          # Passwort-Authentifizierung deaktivieren
ChallengeResponseAuthentication no
UsePAM yes
```

3. Speichern Sie die Datei und starten Sie den SSH-Dienst neu:

```bash
systemctl restart sshd
```

## 4. Testen der Verbindung

1. Öffnen Sie ein neues Terminal/PowerShell-Fenster
2. Verbinden Sie sich mit dem Server:

```
ssh root@ihre-server-ip
```

3. Sie sollten sich jetzt ohne Passwort anmelden können (außer dem Passwort für Ihren privaten Schlüssel, falls Sie eines eingerichtet haben).

## 5. SSH-Konfiguration für einfacheren Zugriff (optional)

Sie können eine lokale SSH-Konfiguration erstellen, um den Zugriff zu erleichtern:

### Windows (PowerShell)

```powershell
New-Item -Path $env:USERPROFILE\.ssh\config -ItemType File -Force
notepad $env:USERPROFILE\.ssh\config
```

### MacOS/Linux

```bash
touch ~/.ssh/config
chmod 600 ~/.ssh/config
nano ~/.ssh/config
```

Fügen Sie folgende Konfiguration hinzu:

```
Host heibaserver
    HostName ihre-server-ip
    User root
    IdentityFile ~/.ssh/id_ed25519
```

Nun können Sie sich einfach mit `ssh heibaserver` verbinden.

## Sicherheitshinweise

- Bewahren Sie Ihren privaten Schlüssel sicher auf und teilen Sie ihn mit niemandem.
- Verwenden Sie ein starkes Passwort für Ihren privaten Schlüssel.
- Erwägen Sie die Einrichtung von fail2ban auf dem Server, um Brute-Force-Angriffe zu verhindern.
- Regelmäßige Sicherheitsupdates des Servers sind wichtig.
