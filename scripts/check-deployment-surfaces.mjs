import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const CANONICAL_HOME = 'https://geo.kongnoma279.com/'
const HEALTH_TIMEOUT_MS = 10_000

function parseBaseUrl(value, label) {
  if (!value) throw new Error(`Missing ${label}`)
  const url = new URL(value)
  const localHttp = url.protocol === 'http:' && ['localhost', '127.0.0.1', '::1'].includes(url.hostname)
  if (url.protocol !== 'https:' && !localHttp) throw new Error(`${label} must use HTTPS`)
  if (url.username || url.password) throw new Error(`${label} must not contain credentials`)
  return url
}

async function fetchText(url, fetchImpl) {
  const response = await fetchImpl(url, { signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS) })
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`)
  return { response, body: await response.text() }
}

export async function checkDeploymentSurfaces({ publicSiteUrl, pagesMirrorUrl, accountApiUrl }, fetchImpl = fetch) {
  const site = parseBaseUrl(publicSiteUrl, 'PUBLIC_SITE_URL')
  const mirror = parseBaseUrl(pagesMirrorUrl, 'PAGES_MIRROR_URL')
  const account = parseBaseUrl(accountApiUrl, 'ACCOUNT_API_URL')
  const checks = [
    ['public site and sitemap', async () => {
      const { response, body } = await fetchText(site, fetchImpl)
      if (!response.headers.get('content-type')?.includes('text/html') || !body.includes('<title>')) {
        throw new Error('Public site did not return an HTML document with a title')
      }
      if (!body.includes(`href="${CANONICAL_HOME}"`)) throw new Error('Public site canonical URL is missing')
      const sitemapUrl = new URL('/sitemap.xml', site)
      const sitemap = await fetchText(sitemapUrl, fetchImpl)
      if (!sitemap.body.includes(`<loc>${CANONICAL_HOME}</loc>`)) throw new Error('Sitemap does not list the canonical home page')
    }],
    ['GitHub Pages mirror', async () => {
      const { body } = await fetchText(mirror, fetchImpl)
      if (!body.includes(`href="${CANONICAL_HOME}"`) || !body.includes(CANONICAL_HOME)) {
        throw new Error('GitHub Pages mirror does not point to the canonical site')
      }
    }],
    ['account API', async () => {
      const healthUrl = new URL('/api/health', account)
      const response = await fetchImpl(healthUrl, { signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS) })
      if (!response.ok) throw new Error(`HTTP ${response.status} for ${healthUrl}`)
      const payload = await response.json()
      if (payload?.status !== 'ok') throw new Error('Account API health response is not ready')
    }]
  ]

  return Promise.all(checks.map(async ([name, run]) => {
    try {
      await run()
      return { name, ok: true }
    } catch (error) {
      return { name, ok: false, error: error.message }
    }
  }))
}

async function main() {
  if (process.env.DEPLOYMENT_CHECK_ALLOW_NETWORK !== '1') {
    throw new Error('Set DEPLOYMENT_CHECK_ALLOW_NETWORK=1 to explicitly allow outbound checks')
  }
  const results = await checkDeploymentSurfaces({
    publicSiteUrl: process.env.PUBLIC_SITE_URL,
    pagesMirrorUrl: process.env.PAGES_MIRROR_URL,
    accountApiUrl: process.env.ACCOUNT_API_URL
  })
  for (const result of results) {
    console.log(`${result.ok ? 'PASS' : 'FAIL'} ${result.name}${result.error ? `: ${result.error}` : ''}`)
  }
  if (results.some((result) => !result.ok)) process.exitCode = 1
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(`[deployment-surfaces] ${error.message}`)
    process.exitCode = 1
  })
}
