# Anpassung der Import-Pfade
Write-Host "Beginne Anpassung der Import-Pfade..." -ForegroundColor Green

# Definieren Sie die Pfadänderungen
 = @{
    '@/src/components/' = '@/components/';
    '@/src/lib/' = '@/lib/';
    '@/src/db/' = '@/lib/db/';
    '@/src/store/' = '@/lib/store/';
    '@/src/types/' = '@/lib/types/';
    '@/src/data/' = '@/lib/data/';
    '@/src/styles/' = '@/styles/';
    '../components/' = '@/components/';
    '../lib/' = '@/lib/';
    '../../components/' = '@/components/';
    '../../lib/' = '@/lib/';
}

# Dateien zum Bearbeiten
 = Get-ChildItem -Path @(".\app", ".\components", ".\lib", ".\pages") -Recurse -Include "*.tsx","*.ts","*.jsx","*.js" -Exclude "*.d.ts"

foreach ( in ) {
     = Get-Content -Path .FullName -Raw
     = 
     = False
    
    foreach ( in .Keys) {
         = []
        if ( -match [regex]::Escape()) {
             =  -replace [regex]::Escape(), 
             = True
        }
    }
    
    if () {
        Set-Content -Path .FullName -Value  -Encoding UTF8
        Write-Host "  Angepasst: " -ForegroundColor Gray
    }
}

Write-Host "
Anpassung der Import-Pfade abgeschlossen!" -ForegroundColor Green
Write-Host "Bitte überprüfen Sie die Dateien manuell auf weitere notwendige Anpassungen." -ForegroundColor Yellow
