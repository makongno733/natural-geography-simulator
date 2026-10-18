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

export function migrateInquirySystem() {
  database.exec(`
    CREATE TABLE IF NOT EXISTS user_role (
      user_id TEXT PRIMARY KEY,
      role TEXT NOT NULL DEFAULT 'student',
      display_title TEXT,
      authorized_by TEXT,
      authorized_at TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS teacher_assignment (
      id TEXT PRIMARY KEY,
      teacher_id TEXT NOT NULL,
      class_code TEXT NOT NULL,
      task_id TEXT,
      assigned_by TEXT NOT NULL,
      assigned_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS teacher_assign_idx ON teacher_assignment(teacher_id, class_code);

    CREATE TABLE IF NOT EXISTS student_class_enrollment (
      student_id TEXT PRIMARY KEY,
      class_code TEXT NOT NULL,
      assigned_by TEXT NOT NULL,
      assigned_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS inquiry_submission (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      class_code TEXT NOT NULL DEFAULT 'CLASS-DEFAULT',
      student_name TEXT NOT NULL,
      grade_level TEXT NOT NULL,
      version_count INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'draft',
      initial_hypothesis TEXT,
      revised_conclusion TEXT,
      causal_explanation TEXT,
      counter_examples TEXT,
      model_limitations TEXT,
      variables_setup TEXT,
      evidence_records TEXT,
      next_questions TEXT,
      showcase_consent INTEGER NOT NULL DEFAULT 0,
      is_showcased INTEGER NOT NULL DEFAULT 0,
      is_demo INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      submitted_at TEXT
    );
    CREATE INDEX IF NOT EXISTS inquiry_sub_task ON inquiry_submission(task_id, updated_at);
    CREATE INDEX IF NOT EXISTS inquiry_sub_user ON inquiry_submission(user_id);
    CREATE INDEX IF NOT EXISTS inquiry_sub_class ON inquiry_submission(class_code, task_id);

    CREATE TABLE IF NOT EXISTS inquiry_review (
      id TEXT PRIMARY KEY,
      submission_id TEXT NOT NULL,
      task_id TEXT NOT NULL,
      teacher_id TEXT NOT NULL,
      teacher_name TEXT NOT NULL,
      scores TEXT NOT NULL,
      total_score REAL NOT NULL,
      feedback_comment TEXT NOT NULL,
      override_ai_advice TEXT,
      is_showcased INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS inquiry_rev_task ON inquiry_review(task_id);
    CREATE INDEX IF NOT EXISTS inquiry_rev_sub ON inquiry_review(submission_id);

    CREATE TABLE IF NOT EXISTS inquiry_audit_log (
      id TEXT PRIMARY KEY,
      actor_id TEXT NOT NULL,
      action TEXT NOT NULL,
      target_id TEXT,
      detail TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS inquiry_audit_time ON inquiry_audit_log(created_at);
  `)
}
