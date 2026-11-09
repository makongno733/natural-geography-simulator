import { describe, expect, it, vi } from 'vitest'
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
  it('reports readiness only when SQLite is queryable', () => {
    expect(healthHandler({ prepare: () => ({ get: () => ({ ready: 1 }) }) }))
      .toEqual({ status: 200, payload: { status: 'ok' } })
  })

  it('returns an unavailable status and logs database failures', () => {
    const error = new Error('database unavailable')
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(healthHandler({ prepare: () => { throw error } }))
      .toEqual({ status: 503, payload: { status: 'unavailable' } })
    expect(log).toHaveBeenCalledWith('Account API database health check failed', error)
    log.mockRestore()
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
