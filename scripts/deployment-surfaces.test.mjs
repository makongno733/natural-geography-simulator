import { afterEach, describe, expect, it } from 'vitest'
import { createServer } from 'node:http'
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import { checkDeploymentSurfaces } from './check-deployment-surfaces.mjs'

let server
let baseUrl

async function startFixtureServer(statusForHealth = 200) {
  server = createServer((request, response) => {
    if (request.url === '/site') {
      response.writeHead(200, { 'Content-Type': 'text/html' })
      return response.end('<html><head><title>地理共同体</title><link rel="canonical" href="https://geo.kongnoma279.com/"></head></html>')
    }
    if (request.url === '/sitemap.xml') {
      response.writeHead(200, { 'Content-Type': 'application/xml' })
      return response.end('<urlset><url><loc>https://geo.kongnoma279.com/</loc></url></urlset>')
    }
    if (request.url === '/mirror') {
      response.writeHead(200, { 'Content-Type': 'text/html' })
      return response.end('<link rel="canonical" href="https://geo.kongnoma279.com/"><script>location.replace(\'https://geo.kongnoma279.com/\')</script>')
    }
    if (request.url === '/api/health') {
      response.writeHead(statusForHealth, { 'Content-Type': 'application/json' })
      return response.end(JSON.stringify({ status: statusForHealth === 200 ? 'ok' : 'unavailable' }))
    }
    response.writeHead(404)
    response.end()
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  baseUrl = `http://127.0.0.1:${server.address().port}`
}

afterEach(async () => {
  if (server) await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
  server = undefined
})

describe('deployment surface checks', () => {
  it('checks the canonical site, Pages mirror and account health endpoint', async () => {
    await startFixtureServer()
    const results = await checkDeploymentSurfaces({
      publicSiteUrl: `${baseUrl}/site`,
      pagesMirrorUrl: `${baseUrl}/mirror`,
      accountApiUrl: `${baseUrl}/account`
    })
    expect(results).toEqual([
      { name: 'public site and sitemap', ok: true },
      { name: 'GitHub Pages mirror', ok: true },
      { name: 'account API', ok: true }
    ])
  })

  it('surfaces an unhealthy account API as a failed deployment check', async () => {
    await startFixtureServer(503)
    const results = await checkDeploymentSurfaces({
      publicSiteUrl: `${baseUrl}/site`,
      pagesMirrorUrl: `${baseUrl}/mirror`,
      accountApiUrl: `${baseUrl}/account`
    })
    expect(results.find((result) => result.name === 'account API')).toMatchObject({ ok: false })
  })

  it('refuses outbound checks without an explicit network opt-in', () => {
    const result = spawnSync(process.execPath, [resolve('scripts/check-deployment-surfaces.mjs')], {
      encoding: 'utf8',
      env: { ...process.env, DEPLOYMENT_CHECK_ALLOW_NETWORK: '' }
    })
    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain('Set DEPLOYMENT_CHECK_ALLOW_NETWORK=1')
  })
})
