import { afterEach, describe, expect, it } from 'vitest'
import Database from 'better-sqlite3'
import { spawnSync } from 'node:child_process'
import { chmodSync, existsSync, mkdtempSync, mkdirSync, realpathSync, readdirSync, rmSync, statSync, symlinkSync } from 'node:fs'
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

  it.each(['directory', 'ancestor', 'database-file'])('rejects a %s symlink back into live storage before creating files or changing permissions', type => {
    const { directory, sourcePath } = makeDatabaseFixture()
    const dataDirectory = join(directory, 'data')
    chmodSync(dataDirectory, 0o750)
    let source = sourcePath
    let target
    if (type === 'database-file') {
      source = join(directory, 'account-link.sqlite')
      symlinkSync(sourcePath, source)
      target = dataDirectory
    } else {
      const alias = join(directory, 'backup-link')
      symlinkSync(dataDirectory, alias, 'dir')
      target = type === 'ancestor' ? join(alias, 'new', 'backups') : alias
    }
    const before = readdirSync(dataDirectory).sort()
    const result = spawnSync(process.execPath, [scriptPath, 'backup'], {
      encoding: 'utf8',
      env: { ...process.env, ACCOUNT_DB_PATH: source, ACCOUNT_BACKUP_DIR: target }
    })
    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain('outside the account database directory')
    expect(statSync(dataDirectory).mode & 0o777).toBe(0o750)
    expect(readdirSync(dataDirectory).sort()).toEqual(before)
    expect(existsSync(join(dataDirectory, 'new'))).toBe(false)
  })

  it('resolves a symlinked source parent and backup ancestor before applying the boundary', () => {
    const { directory, sourcePath } = makeDatabaseFixture()
    const dataDirectory = join(directory, 'data')
    const sourceAlias = join(directory, 'source-parent')
    const backupAlias = join(directory, 'backup-parent')
    symlinkSync(dataDirectory, sourceAlias, 'dir')
    symlinkSync(dataDirectory, backupAlias, 'dir')
    chmodSync(dataDirectory, 0o750)
    const result = spawnSync(process.execPath, [scriptPath, 'backup'], {
      encoding: 'utf8',
      env: {
        ...process.env,
        ACCOUNT_DB_PATH: join(sourceAlias, 'account.sqlite'),
        ACCOUNT_BACKUP_DIR: join(backupAlias, 'child')
      }
    })
    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain('outside the account database directory')
    expect(statSync(dataDirectory).mode & 0o777).toBe(0o750)
    expect(existsSync(join(dataDirectory, 'child'))).toBe(false)
  })

  it('allows an external symlinked backup ancestor and writes to its canonical private directory', () => {
    const { directory, sourcePath } = makeDatabaseFixture()
    const external = join(directory, 'external')
    const alias = join(directory, 'safe-link')
    mkdirSync(external)
    symlinkSync(external, alias, 'dir')
    const result = spawnSync(process.execPath, [scriptPath, 'backup'], {
      encoding: 'utf8',
      env: { ...process.env, ACCOUNT_DB_PATH: sourcePath, ACCOUNT_BACKUP_DIR: join(alias, 'new', 'backups') }
    })
    expect(result.status, result.stderr).toBe(0)
    const backup = JSON.parse(result.stdout)
    expect(backup.file.startsWith(`${realpathSync(external)}/new/backups/`)).toBe(true)
    expect(statSync(join(external, 'new', 'backups')).mode & 0o777).toBe(0o700)
    const database = new Database(backup.file, { readonly: true, fileMustExist: true })
    expect(database.prepare('SELECT id FROM user').get().id).toBe('teacher-1')
    database.close()
  })
})
