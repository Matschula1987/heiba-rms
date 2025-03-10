import { getDb } from '@/lib/db'

// Wir machen den Code ohne drizzle-orm kompatibel
export const db = {
  async select() {
    return {
      from(table: any) {
        return {
          async all() {
            const dbInstance = await getDb()
            return dbInstance.all(`SELECT * FROM ${table.name}`)
          },
          async get(id: string) {
            const dbInstance = await getDb()
            return dbInstance.get(`SELECT * FROM ${table.name} WHERE id = ?`, id)
          },
          where(condition: any) {
            // Einfache where-Implementierung für Kompatibilität
            return {
              async all() {
                const dbInstance = await getDb()
                const column = condition.left.name
                const value = condition.right
                return dbInstance.all(`SELECT * FROM ${table.name} WHERE ${column} = ?`, value)
              },
              async get() {
                const dbInstance = await getDb()
                const column = condition.left.name
                const value = condition.right
                return dbInstance.get(`SELECT * FROM ${table.name} WHERE ${column} = ?`, value)
              }
            }
          }
        }
      }
    }
  },
  
  async insert(table: any) {
    return {
      values(data: any) {
        return {
          async run() {
            const dbInstance = await getDb()
            const keys = Object.keys(data)
            const placeholders = keys.map(() => '?').join(', ')
            const values = keys.map(key => data[key])
            
            return dbInstance.run(
              `INSERT INTO ${table.name} (${keys.join(', ')}) VALUES (${placeholders})`,
              ...values
            )
          }
        }
      }
    }
  },
  
  async update(table: any) {
    return {
      set(data: any) {
        return {
          where(condition: any) {
            return {
              async run() {
                const dbInstance = await getDb()
                const column = condition.left.name
                const value = condition.right
                
                const entries = Object.entries(data)
                const setClause = entries.map(([key]) => `${key} = ?`).join(', ')
                const values = entries.map(([_, value]) => value)
                
                values.push(value) // Wert für die WHERE-Bedingung
                
                return dbInstance.run(
                  `UPDATE ${table.name} SET ${setClause} WHERE ${column} = ?`,
                  ...values
                )
              }
            }
          }
        }
      }
    }
  },
  
  async delete(table: any) {
    return {
      where(condition: any) {
        return {
          async run() {
            const dbInstance = await getDb()
            const column = condition.left.name
            const value = condition.right
            
            return dbInstance.run(
              `DELETE FROM ${table.name} WHERE ${column} = ?`,
              value
            )
          }
        }
      }
    }
  }
}

// Hilfsfunktion für eq
export const eq = (column: any, value: any) => ({ 
  left: column, 
  right: value, 
  operator: '=' 
})

// Hilfsfunktion zum Parsen/Stringifizieren von JSON-Feldern
export const parseJsonFields = (data: any) => {
  if (!data) return data

  // Liste der Felder, die als JSON gespeichert sind
  const jsonFields = ['address', 'skills', 'documents', 'qualificationProfile', 'requiredSkills', 'salaryRange', 
    'experience', 'documents', 'qualifications', 'qualification_profile']

  const parsed = { ...data }
  for (const field of jsonFields) {
    if (parsed[field] && typeof parsed[field] === 'string') {
      try {
        parsed[field] = JSON.parse(parsed[field])
      } catch (e) {
        console.error(`Failed to parse ${field}:`, e)
      }
    }
  }
  return parsed
}

export const stringifyJsonFields = (data: any) => {
  if (!data) return data

  const jsonFields = ['address', 'skills', 'documents', 'qualificationProfile', 'requiredSkills', 'salaryRange',
    'experience', 'documents', 'qualifications', 'qualification_profile']

  const stringified = { ...data }
  for (const field of jsonFields) {
    if (stringified[field] && typeof stringified[field] !== 'string') {
      stringified[field] = JSON.stringify(stringified[field])
    }
  }
  return stringified
}

// Schema-Definitionen für die Kompatibilität mit aktualisierten Routen
export const candidates = {
  name: 'candidates',
  id: { name: 'id' },
  fullName: { name: 'name' },
  email: { name: 'email' },
  status: { name: 'status' },
  // ... weitere Felder nach Bedarf
}

export const jobs = {
  name: 'jobs',
  id: { name: 'id' },
  title: { name: 'title' },
  company: { name: 'company' },
  status: { name: 'status' },
  // ... weitere Felder nach Bedarf
}

export const customers = {
  name: 'customers',
  id: { name: 'id' },
  companyName: { name: 'name' },
  type: { name: 'type' },
  status: { name: 'status' },
  industry: { name: 'industry' },
  website: { name: 'website' },
  address: { name: 'address' },
  notes: { name: 'notes' },
  // ... weitere Felder nach Bedarf
}

export const contacts = {
  name: 'contacts',
  id: { name: 'id' },
  customerId: { name: 'customer_id' },
  firstName: { name: 'first_name' },
  lastName: { name: 'last_name' },
  email: { name: 'email' },
  phone: { name: 'phone' },
  mobile: { name: 'mobile' },
  position: { name: 'position' },
  department: { name: 'department' },
  isMainContact: { name: 'is_main_contact' },
  // ... weitere Felder nach Bedarf
}
