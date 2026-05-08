import { Database } from 'bun:sqlite'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import { migrate } from 'drizzle-orm/bun-sqlite/migrator'
import path from 'node:path'
import * as schema from './schema.js'

const DB_PATH = process.env.DATABASE_PATH ?? path.join(process.cwd(), 'data.db')
const MIGRATIONS_PATH = new URL('../drizzle', import.meta.url).pathname

export function openDb(dbPath: string = DB_PATH) {
  const sqlite = new Database(dbPath)
  sqlite.exec('PRAGMA journal_mode = WAL')
  const db = drizzle(sqlite, { schema })
  migrate(db, { migrationsFolder: MIGRATIONS_PATH })
  return db
}

export type DrizzleDb = ReturnType<typeof openDb>
export const db = openDb()
