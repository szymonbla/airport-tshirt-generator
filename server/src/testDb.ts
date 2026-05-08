/// <reference types="bun-types" />
import { Database } from 'bun:sqlite'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import * as schema from './schema.js'
import type { DrizzleDb } from './db.js'

export function openTestDb(): DrizzleDb {
  const sqlite = new Database(':memory:')
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS participants (
      name TEXT PRIMARY KEY,
      size TEXT NOT NULL,
      email TEXT,
      submitted_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS pending_notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      giver_email TEXT NOT NULL,
      recipient TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `)
  return drizzle(sqlite, { schema }) as unknown as DrizzleDb
}
