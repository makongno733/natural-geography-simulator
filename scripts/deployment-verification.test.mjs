// @vitest-environment node
import { expect, it } from 'vitest'
import { verifyDeployment } from '../server/verify-deployment.mjs'

function mockFetch(overrides = {}) {
  const calls = []
  const payloads = {
    '/api/ready': { status: 'ok', schema: 'ready', revision: 'new' },
    '/api/config': { authProvider: 'Better Auth' },
    '/api/community/posts': { posts: [{ id: 7, authorId: 'author' }] },
    '/api/community/posts/7': { post: { id: 7, body: 'x'.repeat(200000) } },
    '/api/community/users/author': { user: { id: 'author' } },
    '/api/community/resources': { resources: [] },
    '/api/fanxing/projects': { projects: [{ id: 'project' }] },
    '/api/fanxing/projects/project': { project: { id: 'project' } },
    ...overrides
  }
  return { calls, fetchImpl: async (url, options) => {
    calls.push({ path: new URL(url).pathname, method: options.method || 'GET' })
    const body = payloads[new URL(url).pathname]
    if (body === 500) return { ok: false, status: 500 }
    return { ok: true, json: async () => body }
  } }
}
it('checks real existing post/profile and large responses using only GET', async () => {
  const mocked = mockFetch()
  const result = await verifyDeployment({ ...mocked, expectedRevision: 'new' })
  expect(result.checked).toHaveLength(8)
  expect(mocked.calls.every(c => c.method === 'GET')).toBe(true)
})
it('rejects an old container even if its readiness and business responses succeed', async () => {
  await expect(verifyDeployment({ ...mockFetch(), expectedRevision: 'other' })).rejects.toThrow('revision')
})
it('rejects a profile regression that liveness and the list endpoint cannot detect', async () => {
  await expect(verifyDeployment(mockFetch({ '/api/community/users/author': 500 }))).rejects.toThrow('HTTP 500')
})
it('accepts an empty installation without manufacturing production test data', async () => {
  const mocked = mockFetch({ '/api/community/posts': { posts: [] }, '/api/fanxing/projects': { projects: [] } })
  const result = await verifyDeployment(mocked)
  expect(result.checked).toHaveLength(5)
})
it('rejects a misleading HTTP 200 with an error payload', async () => {
  await expect(verifyDeployment(mockFetch({ '/api/community/resources': { error: 'unavailable' } }))).rejects.toThrow('payload')
})
