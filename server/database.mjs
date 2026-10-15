import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { isProduction } from './config.mjs'

if (isProduction && !process.env.ACCOUNT_DB_PATH) {
  throw new Error('Production ACCOUNT_DB_PATH must point to a private directory')
}
const path = resolve(process.env.ACCOUNT_DB_PATH || './data/account.sqlite')
mkdirSync(dirname(path), { recursive: true })
export const database = new Database(path)
database.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;')

export function migrateComments() {
  database.exec(`
    CREATE TABLE IF NOT EXISTS lesson_comment (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      section_key TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL,
      deleted_at TEXT
    );
    CREATE INDEX IF NOT EXISTS lesson_comment_section ON lesson_comment(section_key, created_at);
    CREATE INDEX IF NOT EXISTS lesson_comment_user_time ON lesson_comment(user_id, created_at);
  `)
}

export function migrateGeoEvents() {
  database.exec(`
    CREATE TABLE IF NOT EXISTS geo_earthquake (
      id TEXT PRIMARY KEY,
      occurred_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      magnitude REAL NOT NULL,
      place TEXT NOT NULL,
      longitude REAL NOT NULL,
      latitude REAL NOT NULL,
      depth_km REAL,
      source_url TEXT NOT NULL,
      fetched_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS geo_earthquake_occurred ON geo_earthquake(occurred_at);
    CREATE TABLE IF NOT EXISTS geo_event_sync (
      source TEXT PRIMARY KEY,
      fetched_at TEXT NOT NULL,
      status TEXT NOT NULL
    );
  `)
}
