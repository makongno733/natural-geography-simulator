import Database from 'better-sqlite3'
import { chmod, mkdir, mkdtemp, realpath, rm, stat } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { tmpdir } from 'node:os'
import { pathToFileURL } from 'node:url'

function requiredEnv(name) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing ${name}`)
  return value
}

function timestamp() {
  return new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-')
}

function verifyIntegrity(database) {
  const integrity = database.prepare('PRAGMA integrity_check').all()
  if (integrity.length !== 1 || integrity[0].integrity_check !== 'ok') {
    throw new Error('SQLite integrity check failed')
  }
  if (database.prepare('PRAGMA foreign_key_check').all().length) {
    throw new Error('SQLite foreign-key check failed')
  }
}

async function resolveBackupDirectory(path) {
  const missing = []
  let ancestor = path
  while (true) {
    try {
      return join(await realpath(ancestor), ...missing)
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
      const parent = dirname(ancestor)
      if (parent === ancestor) throw error
      missing.unshift(basename(ancestor))
      ancestor = parent
    }
  }
}

function checkBackupDirectory(directory, sourcePath) {
  const offset = relative(dirname(sourcePath), directory)
  if (!offset || (!isAbsolute(offset) && offset !== '..' && !offset.startsWith(`..${sep}`))) {
    throw new Error('ACCOUNT_BACKUP_DIR must be outside the account database directory')
  }
}

export async function createAccountBackup() {
  const configuredSource = resolve(requiredEnv('ACCOUNT_DB_PATH'))
  const configuredBackupDirectory = resolve(requiredEnv('ACCOUNT_BACKUP_DIR'))

  let sourceInfo
  try {
    sourceInfo = await stat(configuredSource)
  } catch (error) {
    if (error.code === 'ENOENT') throw new Error('ACCOUNT_DB_PATH must point to an existing SQLite file')
    throw error
  }
  if (!sourceInfo.isFile()) throw new Error('ACCOUNT_DB_PATH must point to an existing SQLite file')

  const sourcePath = await realpath(configuredSource)
  const backupDirectory = await resolveBackupDirectory(configuredBackupDirectory)
  checkBackupDirectory(backupDirectory, sourcePath)
  await mkdir(backupDirectory, { recursive: true, mode: 0o700 })
  const createdDirectory = await realpath(backupDirectory)
  checkBackupDirectory(createdDirectory, sourcePath)
  if (createdDirectory !== backupDirectory) throw new Error('ACCOUNT_BACKUP_DIR changed during backup preparation')
  await chmod(backupDirectory, 0o700)
  const backupPath = join(backupDirectory, `account-${timestamp()}-${randomUUID()}.sqlite`)
  const source = new Database(sourcePath, { readonly: true, fileMustExist: true })

  try {
    await source.backup(backupPath)
    await chmod(backupPath, 0o600)
    const backup = new Database(backupPath, { readonly: true, fileMustExist: true })
    try {
      verifyIntegrity(backup)
    } finally {
      backup.close()
    }
    console.log(JSON.stringify({ status: 'ok', operation: 'backup', file: backupPath }))
    return backupPath
  } catch (error) {
    try {
      await rm(backupPath, { force: true })
    } catch (cleanupError) {
      console.error('Failed to remove incomplete account database backup', cleanupError)
    }
    throw error
  } finally {
    source.close()
  }
}

export async function checkAccountBackupRestore(backupFile) {
  if (!backupFile) throw new Error('Usage: account-db-maintenance.mjs restore-check <backup-file>')
  const backupPath = resolve(backupFile)
  let backupInfo
  try {
    backupInfo = await stat(backupPath)
  } catch (error) {
    if (error.code === 'ENOENT') throw new Error('Backup file does not exist')
    throw error
  }
  if (!backupInfo.isFile()) throw new Error('Backup file does not exist')

  const scratchDirectory = await mkdtemp(join(tmpdir(), 'geo-account-restore-check-'))
  const restoredPath = join(scratchDirectory, 'restored.sqlite')
  const backup = new Database(backupPath, { readonly: true, fileMustExist: true })

  try {
    await backup.backup(restoredPath)
    await chmod(restoredPath, 0o600)
    const restored = new Database(restoredPath, { readonly: true, fileMustExist: true })
    try {
      verifyIntegrity(restored)
    } finally {
      restored.close()
    }
    console.log(JSON.stringify({ status: 'ok', operation: 'restore-check' }))
  } finally {
    try {
      backup.close()
    } finally {
      await rm(scratchDirectory, { recursive: true, force: true })
    }
  }
}

async function main() {
  const [operation, backupFile] = process.argv.slice(2)
  if (operation === 'backup') return createAccountBackup()
  if (operation === 'restore-check') return checkAccountBackupRestore(backupFile)
  throw new Error('Usage: account-db-maintenance.mjs <backup | restore-check <backup-file>>')
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(`[account-db-maintenance] ${error.message}`)
    process.exitCode = 1
  })
}
