import { afterEach, describe, expect, it } from 'vitest'
import Database from 'better-sqlite3'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const scriptPath = resolve('scripts/account-db-maintenance.mjs')
const temporaryDirectories = []

function makeDatabaseFixture() {
  const directory = mkdtempSync(join(tmpdir(), 'geo-account-backup-test-'))
  temporaryDirectories.push(directory)
  const sourcePath = join(directory, 'data', 'account.sqlite')
  mkdirSync(join(directory, 'data'))
  const database = new Database(sourcePath)
  database.pragma('journal_mode = WAL')
  database.exec('CREATE TABLE user (id TEXT PRIMARY KEY); INSERT INTO user VALUES (\'teacher-1\')')
  database.close()
  return { directory, sourcePath }
}

afterEach(() => {
  while (temporaryDirectories.length) rmSync(temporaryDirectories.pop(), { recursive: true, force: true })
})

describe('account SQLite backup maintenance', () => {
  it('creates a private verified backup and can restore-check it in a scratch directory', () => {
    const { directory, sourcePath } = makeDatabaseFixture()
    const backupDirectory = join(directory, 'backups')
    const backupResult = spawnSync(process.execPath, [scriptPath, 'backup'], {
      encoding: 'utf8',
      env: { ...process.env, ACCOUNT_DB_PATH: sourcePath, ACCOUNT_BACKUP_DIR: backupDirectory }
    })
    expect(backupResult.status, backupResult.stderr).toBe(0)
    const backup = JSON.parse(backupResult.stdout)
    expect(backup).toMatchObject({ status: 'ok', operation: 'backup' })
    expect(statSync(backupDirectory).mode & 0o777).toBe(0o700)
    expect(statSync(backup.file).mode & 0o777).toBe(0o600)

    const restored = new Database(backup.file, { readonly: true, fileMustExist: true })
    expect(restored.prepare('SELECT id FROM user').get()).toEqual({ id: 'teacher-1' })
    restored.close()

    const restoreResult = spawnSync(process.execPath, [scriptPath, 'restore-check', backup.file], {
      encoding: 'utf8',
      env: process.env
    })
    expect(restoreResult.status, restoreResult.stderr).toBe(0)
    expect(JSON.parse(restoreResult.stdout)).toMatchObject({ status: 'ok', operation: 'restore-check' })
  })

  it('refuses to write backups inside the live database directory', () => {
    const { directory, sourcePath } = makeDatabaseFixture()
    const result = spawnSync(process.execPath, [scriptPath, 'backup'], {
      encoding: 'utf8',
      env: { ...process.env, ACCOUNT_DB_PATH: sourcePath, ACCOUNT_BACKUP_DIR: join(directory, 'data', 'backups') }
    })
    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain('outside the account database directory')
  })
})
