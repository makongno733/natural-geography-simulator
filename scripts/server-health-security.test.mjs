import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Database from 'better-sqlite3'
import { betterAuth } from 'better-auth'
import { getMigrations } from 'better-auth/db/migration'
import { setupHealthRoute } from '../server/health.mjs'
import { securityHeaders } from '../server/security-headers.mjs'

function healthHandler(database) {
  let handler
  setupHealthRoute({ get(_path, routeHandler) { handler = routeHandler } }, database)
  let status = 200
  let payload
  const response = {
    status(code) { status = code; return this },
    json(value) { payload = value; return this }
  }
  handler({}, response)
  return { status, payload }
}

describe('account API health and response hardening', () => {
  let database
  beforeEach(async () => {
    database = new Database(':memory:')
    const auth = betterAuth({
      database,
      baseURL: 'http://localhost:9999',
      secret: 'local-test-only-readiness-secret-1234567890'
    })
    const { runMigrations } = await getMigrations(auth.options)
    await runMigrations()
    database.exec(`
      CREATE TABLE lesson_comment (id TEXT PRIMARY KEY, user_id TEXT, section_key TEXT, body TEXT, created_at TEXT, deleted_at TEXT);
      CREATE TABLE user_role (user_id TEXT PRIMARY KEY, role TEXT);
    `)
  })
  afterEach(() => {
    if (database.open) database.close()
    vi.restoreAllMocks()
  })

  it('reports readiness for migrated empty account tables without requiring user data', () => {
    expect(database.prepare('SELECT count(*) AS count FROM user').get().count).toBe(0)
    expect(healthHandler(database))
      .toEqual({ status: 200, payload: { status: 'ok' } })
  })

  it('reports readiness for populated SQLite without returning account data', () => {
    database.prepare('INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)')
      .run('local-teacher', 'Local fixture', 'local@example.invalid', 0, 0, 0)
    expect(healthHandler(database)).toEqual({ status: 200, payload: { status: 'ok' } })
  })

  it.each(['user', 'session', 'account', 'verification', 'lesson_comment', 'user_role'])('is unavailable if the necessary %s table is missing', table => {
    database.exec(`DROP TABLE "${table}"`)
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(healthHandler(database))
      .toEqual({ status: 503, payload: { status: 'unavailable' } })
    expect(log).toHaveBeenCalledWith('Account API database health check failed', expect.any(Error))
  })

  it('rejects an incomplete table schema even when SELECT 1 would succeed', () => {
    database.exec('DROP TABLE lesson_comment; CREATE TABLE lesson_comment (id TEXT)')
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(database.prepare('SELECT 1 AS value').get().value).toBe(1)
    expect(healthHandler(database)).toEqual({ status: 503, payload: { status: 'unavailable' } })
  })

  it('returns unavailable and logs an actual SQLite query failure', () => {
    database.close()
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(healthHandler(database)).toEqual({ status: 503, payload: { status: 'unavailable' } })
    expect(log).toHaveBeenCalledWith('Account API database health check failed', expect.any(Error))
  })

  it('sets baseline browser security headers', () => {
    const headers = new Map()
    const response = { setHeader: (name, value) => headers.set(name, value) }
    const next = vi.fn()
    securityHeaders({}, response, next)
    expect(headers).toEqual(new Map([
      ['X-Content-Type-Options', 'nosniff'],
      ['X-Frame-Options', 'DENY'],
      ['Referrer-Policy', 'strict-origin-when-cross-origin']
    ]))
    expect(next).toHaveBeenCalledOnce()
  })
})
