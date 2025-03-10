# Migration von src nach Next.js-Struktur
Write-Host "Beginne Migration von src nach Next.js-Struktur..." -ForegroundColor Green

# 1. Migriere app-Ordner (falls noch nicht vollständig migriert)
Write-Host "Migriere app-Ordner..." -ForegroundColor Cyan
Get-ChildItem -Path ".\src\app" -Recurse -File | ForEach-Object {
     = .FullName.Replace("C:\Users\stefa\Desktop\heiba\heiba-recruitment\src\app\", "")
     = Join-Path -Path "C:\Users\stefa\Desktop\heiba\heiba-recruitment\app" -ChildPath 
     = Split-Path -Path  -Parent
    
    if (-not (Test-Path -Path )) {
        New-Item -Path  -ItemType Directory -Force | Out-Null
    }
    
    if (-not (Test-Path -Path ) -or 
        (Get-Item .FullName).LastWriteTime -gt (Get-Item ).LastWriteTime) {
        Copy-Item -Path .FullName -Destination  -Force
        Write-Host "  Kopiert: " -ForegroundColor Gray
    }
}

# 2. Migriere components-Ordner
Write-Host "Migriere components-Ordner..." -ForegroundColor Cyan
Get-ChildItem -Path ".\src\components" -Recurse -File | ForEach-Object {
     = .FullName.Replace("C:\Users\stefa\Desktop\heiba\heiba-recruitment\src\components\", "")
     = Join-Path -Path "C:\Users\stefa\Desktop\heiba\heiba-recruitment\components" -ChildPath 
     = Split-Path -Path  -Parent
    
    if (-not (Test-Path -Path )) {
        New-Item -Path  -ItemType Directory -Force | Out-Null
    }
    
    if (-not (Test-Path -Path ) -or 
        (Get-Item .FullName).LastWriteTime -gt (Get-Item ).LastWriteTime) {
        Copy-Item -Path .FullName -Destination  -Force
        Write-Host "  Kopiert: " -ForegroundColor Gray
    }
}

# 3. Migriere lib-Ordner und andere Hilfsfunktionen
Write-Host "Migriere lib-Ordner und Hilfsfunktionen..." -ForegroundColor Cyan
if (-not (Test-Path -Path ".\lib")) {
    New-Item -Path ".\lib" -ItemType Directory -Force | Out-Null
}

# Kopiere lib-Dateien
Get-ChildItem -Path ".\src\lib" -Recurse -File | ForEach-Object {
     = .FullName.Replace("C:\Users\stefa\Desktop\heiba\heiba-recruitment\src\lib\", "")
     = Join-Path -Path "C:\Users\stefa\Desktop\heiba\heiba-recruitment\lib" -ChildPath 
     = Split-Path -Path  -Parent
    
    if (-not (Test-Path -Path )) {
        New-Item -Path  -ItemType Directory -Force | Out-Null
    }
    
    Copy-Item -Path .FullName -Destination  -Force
    Write-Host "  Kopiert: " -ForegroundColor Gray
}

# 4. Migriere db-Ordner
Write-Host "Migriere db-Ordner..." -ForegroundColor Cyan
if (-not (Test-Path -Path ".\lib\db")) {
    New-Item -Path ".\lib\db" -ItemType Directory -Force | Out-Null
}

Get-ChildItem -Path ".\src\db" -Recurse -File | ForEach-Object {
     = .FullName.Replace("C:\Users\stefa\Desktop\heiba\heiba-recruitment\src\db\", "")
     = Join-Path -Path "C:\Users\stefa\Desktop\heiba\heiba-recruitment\lib\db" -ChildPath 
     = Split-Path -Path  -Parent
    
    if (-not (Test-Path -Path )) {
        New-Item -Path  -ItemType Directory -Force | Out-Null
    }
    
    Copy-Item -Path .FullName -Destination  -Force
    Write-Host "  Kopiert: " -ForegroundColor Gray
}

# 5. Migriere store-Ordner (Zustand/Redux-Stores)
Write-Host "Migriere store-Ordner..." -ForegroundColor Cyan
if (-not (Test-Path -Path ".\lib\store")) {
    New-Item -Path ".\lib\store" -ItemType Directory -Force | Out-Null
}

Get-ChildItem -Path ".\src\store" -Recurse -File | ForEach-Object {
     = .FullName.Replace("C:\Users\stefa\Desktop\heiba\heiba-recruitment\src\store\", "")
     = Join-Path -Path "C:\Users\stefa\Desktop\heiba\heiba-recruitment\lib\store" -ChildPath 
     = Split-Path -Path  -Parent
    
    if (-not (Test-Path -Path )) {
        New-Item -Path  -ItemType Directory -Force | Out-Null
    }
    
    Copy-Item -Path .FullName -Destination  -Force
    Write-Host "  Kopiert: " -ForegroundColor Gray
}

# 6. Migriere types-Ordner
Write-Host "Migriere types-Ordner..." -ForegroundColor Cyan
if (-not (Test-Path -Path ".\lib\types")) {
    New-Item -Path ".\lib\types" -ItemType Directory -Force | Out-Null
}

Get-ChildItem -Path ".\src\types" -Recurse -File | ForEach-Object {
     = .FullName.Replace("C:\Users\stefa\Desktop\heiba\heiba-recruitment\src\types\", "")
     = Join-Path -Path "C:\Users\stefa\Desktop\heiba\heiba-recruitment\lib\types" -ChildPath 
     = Split-Path -Path  -Parent
    
    if (-not (Test-Path -Path )) {
        New-Item -Path  -ItemType Directory -Force | Out-Null
    }
    
    Copy-Item -Path .FullName -Destination  -Force
    Write-Host "  Kopiert: " -ForegroundColor Gray
}

# 7. Migriere Testdaten
Write-Host "Migriere Testdaten..." -ForegroundColor Cyan
if (-not (Test-Path -Path ".\lib\data")) {
    New-Item -Path ".\lib\data" -ItemType Directory -Force | Out-Null
}

Get-ChildItem -Path ".\src\data" -Recurse -File | ForEach-Object {
     = .FullName.Replace("C:\Users\stefa\Desktop\heiba\heiba-recruitment\src\data\", "")
     = Join-Path -Path "C:\Users\stefa\Desktop\heiba\heiba-recruitment\lib\data" -ChildPath 
     = Split-Path -Path  -Parent
    
    if (-not (Test-Path -Path )) {
        New-Item -Path  -ItemType Directory -Force | Out-Null
    }
    
    Copy-Item -Path .FullName -Destination  -Force
    Write-Host "  Kopiert: " -ForegroundColor Gray
}

# 8. Migriere styles-Ordner
Write-Host "Migriere styles-Ordner..." -ForegroundColor Cyan
if (-not (Test-Path -Path ".\styles")) {
    New-Item -Path ".\styles" -ItemType Directory -Force | Out-Null
}

Get-ChildItem -Path ".\src\styles" -Recurse -File | ForEach-Object {
     = .FullName.Replace("C:\Users\stefa\Desktop\heiba\heiba-recruitment\src\styles\", "")
     = Join-Path -Path "C:\Users\stefa\Desktop\heiba\heiba-recruitment\styles" -ChildPath 
     = Split-Path -Path  -Parent
    
    if (-not (Test-Path -Path )) {
        New-Item -Path  -ItemType Directory -Force | Out-Null
    }
    
    Copy-Item -Path .FullName -Destination  -Force
    Write-Host "  Kopiert: " -ForegroundColor Gray
}

# 9. Füge 'use client' zu allen Komponenten und Seiten hinzu
Write-Host "Füge 'use client' zu Komponenten und Seiten hinzu..." -ForegroundColor Cyan

 = @(".\components", ".\app")
foreach ( in ) {
    Get-ChildItem -Path  -Recurse -Include "*.tsx","*.jsx" -Exclude "*.d.ts","route.ts","layout.tsx" | ForEach-Object {
         = Get-Content -Path .FullName -Raw
        if (-not ( -match "'use client'") -and -not ( -match '"use client"')) {
             = "'use client'

" + 
            Set-Content -Path .FullName -Value  -Encoding UTF8
            Write-Host "  'use client' hinzugefügt zu: " -ForegroundColor Gray
        }
    }
}

# 10. Passe Imports an (Beispiel für eine einfache Anpassung)
Write-Host "Passe Imports an (Beispiel)..." -ForegroundColor Cyan
Write-Host "  HINWEIS: Die Import-Pfade müssen möglicherweise manuell angepasst werden." -ForegroundColor Yellow

Write-Host "
Migration abgeschlossen!" -ForegroundColor Green
Write-Host "Bitte überprüfen Sie die folgenden Punkte manuell:" -ForegroundColor Yellow
Write-Host "1. Import-Pfade in allen Dateien" -ForegroundColor Yellow
Write-Host "2. API-Routen und Serverkomponenten (keine 'use client' Direktive nötig)" -ForegroundColor Yellow
Write-Host "3. Konfigurationsdateien (next.config.js, tailwind.config.js, etc.)" -ForegroundColor Yellow
Write-Host "4. Umgebungsvariablen (.env Dateien)" -ForegroundColor Yellow
