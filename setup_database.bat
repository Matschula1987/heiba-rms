@echo off
echo Erstelle SQLite-Datenbank...

:: SQLite-Befehl zum Erstellen der Datenbank und Ausführen der SQL-Skripte
sqlite3 .\database\heiba_recruitment.db < .\database\create_users.sql
sqlite3 .\database\heiba_recruitment.db < .\database\create_jobs.sql
sqlite3 .\database\heiba_recruitment.db < .\database\create_candidates.sql
sqlite3 .\database\heiba_recruitment.db < .\database\create_applications.sql
sqlite3 .\database\heiba_recruitment.db < .\database\seed_users.sql
sqlite3 .\database\heiba_recruitment.db < .\database\seed_jobs.sql
sqlite3 .\database\heiba_recruitment.db < .\database\seed_candidates_applications.sql

echo Datenbank erfolgreich erstellt!
