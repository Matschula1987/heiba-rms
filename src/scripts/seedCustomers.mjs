// Skript zum Einfügen von Beispieldaten in die Datenbank
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Pfad-Konfiguration für ES-Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Da wir auf TypeScript-Daten zugreifen, lesen wir die Datei manuell
const dummyCustomersPath = path.join(__dirname, '../data/dummyCustomers.ts');
const dummyCustomersContent = fs.readFileSync(dummyCustomersPath, 'utf-8');

// Extrahieren der Arrays aus dem TypeScript-Code
function extractExportedArray(content, exportName) {
  const regex = new RegExp(`export const ${exportName}\\s*=\\s*(\\[.*?\\];)`, 's');
  const match = content.match(regex);
  if (match && match[1]) {
    // Konvertiert den Array-String in ein JS-Objekt
    return eval(`(${match[1]})`);
  }
  return [];
}

// Dummy-Daten extrahieren
const dummyCustomers = extractExportedArray(dummyCustomersContent, 'dummyCustomers');
const dummyRequirements = extractExportedArray(dummyCustomersContent, 'dummyRequirements');

// Für Kontakte müssen wir ein Objekt extrahieren
function extractContactsObject(content) {
  const regex = /export const dummyContacts\s*=\s*({[\s\S]*?};)/m;
  const match = content.match(regex);
  if (match && match[1]) {
    return eval(`(${match[1]})`);
  }
  return {};
}

const dummyContacts = extractContactsObject(dummyCustomersContent);

async function main() {
  console.log('Starte Einfügen von Testdaten in die Datenbank...');
  
  // Datenbankverbindung öffnen
  const db = await open({
    filename: path.join(__dirname, '../../heiba.db'),
    driver: sqlite3.Database
  });
  
  try {
    // Transaktion starten
    await db.run('BEGIN TRANSACTION');

    // Kunden einfügen
    console.log(`Füge ${dummyCustomers.length} Kunden ein...`);
    for (const customer of dummyCustomers) {
      const addressJson = customer.address ? JSON.stringify(customer.address) : null;
      
      await db.run(`
        INSERT INTO customers (
          id, name, type, status, industry, website, 
          address, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        customer.id,
        customer.name,
        customer.type,
        customer.status,
        customer.industry || null,
        customer.website || null,
        addressJson,
        customer.notes || null,
        customer.createdAt || new Date().toISOString(),
        customer.updatedAt || new Date().toISOString()
      ]);
    }
    
    // Kontakte einfügen
    let contactCount = 0;
    for (const customerId in dummyContacts) {
      for (const contact of dummyContacts[customerId]) {
        contactCount++;
        await db.run(`
          INSERT INTO contacts (
            id, customer_id, first_name, last_name, position, 
            department, email, phone, mobile, is_main_contact, notes,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          contact.id,
          contact.customerId,
          contact.firstName,
          contact.lastName,
          contact.position || null,
          contact.department || null,
          contact.email,
          contact.phone || null,
          contact.mobile || null,
          contact.isMainContact ? 1 : 0,
          contact.notes || null,
          contact.createdAt || new Date().toISOString(),
          contact.updatedAt || new Date().toISOString()
        ]);
      }
    }
    console.log(`Habe ${contactCount} Kontakte eingefügt.`);
    
    // Anforderungen einfügen
    console.log(`Füge ${dummyRequirements.length} Anforderungen ein...`);
    for (const requirement of dummyRequirements) {
      await db.run(`
        INSERT INTO requirements (
          id, customer_id, title, description, department, location,
          skills, experience, education, status, priority, start_date,
          end_date, is_remote, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        requirement.id,
        requirement.customerId,
        requirement.title,
        requirement.description || null,
        requirement.department || null,
        requirement.location || null,
        requirement.skills, // Bereits JSON-String oder wird als solcher übergeben
        requirement.experience || null,
        requirement.education || null,
        requirement.status,
        requirement.priority,
        requirement.startDate || null,
        requirement.endDate || null,
        requirement.isRemote ? 1 : 0,
        requirement.createdAt || new Date().toISOString(),
        requirement.updatedAt || new Date().toISOString()
      ]);
    }
    
    // Transaktion abschließen
    await db.run('COMMIT');
    console.log('Alle Testdaten erfolgreich in die Datenbank eingefügt.');
  } catch (error) {
    // Fehlerfall: Transaktion zurückrollen
    await db.run('ROLLBACK');
    console.error('Fehler beim Einfügen der Testdaten:', error);
  } finally {
    // Datenbankverbindung schließen
    await db.close();
  }
}

// Skript ausführen
main().catch(console.error);
