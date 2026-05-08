import Database from 'better-sqlite3'
import path from 'node:path'

const DB_PATH = process.env.DATABASE_PATH ?? path.join(process.cwd(), 'data.db')

export function openDb(dbPath: string = DB_PATH) {
  const db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.exec(`
    CREATE TABLE IF NOT EXISTS participants (
      name         TEXT PRIMARY KEY,
      size         TEXT NOT NULL CHECK(size IN ('XS','S','M','L','XL','2XL')),
      email        TEXT,
      submitted_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pending_notifications (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      giver_email  TEXT NOT NULL,
      recipient    TEXT NOT NULL,
      created_at   TEXT NOT NULL
    );
  `)
  // Migrate: drop NOT NULL on email if old schema
  const cols = db.pragma('table_info(participants)') as Array<{ name: string; notnull: number }>
  const emailCol = cols.find(c => c.name === 'email')
  if (emailCol?.notnull) {
    db.exec(`
      BEGIN;
      CREATE TABLE participants_new (
        name         TEXT PRIMARY KEY,
        size         TEXT NOT NULL CHECK(size IN ('XS','S','M','L','XL','2XL')),
        email        TEXT,
        submitted_at TEXT NOT NULL
      );
      INSERT INTO participants_new SELECT name, size, email, submitted_at FROM participants;
      DROP TABLE participants;
      ALTER TABLE participants_new RENAME TO participants;
      COMMIT;
    `)
  }

  return db
}

export const db = openDb()
