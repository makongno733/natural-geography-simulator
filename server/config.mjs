const required = (name) => {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing ${name}`)
  return value
}

export const authOrigin = required('AUTH_ORIGIN').replace(/\/$/, '')
export const siteOrigin = required('SITE_ORIGIN').replace(/\/$/, '')
export const allowedOrigins = new Set([authOrigin, siteOrigin])
export const isProduction = process.env.NODE_ENV === 'production'

if (!process.env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET.length < 32) {
  throw new Error('BETTER_AUTH_SECRET must contain at least 32 characters')
}

if (isProduction && (!authOrigin.startsWith('https://') || !siteOrigin.startsWith('https://'))) {
  throw new Error('Production origins must use HTTPS')
}

export const mailReady = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.MAIL_FROM)
export const requireEmailVerification = process.env.REQUIRE_EMAIL_VERIFICATION === 'true' && mailReady

function resolveSharedCookieDomain(urlA, urlB) {
  try {
    const hostA = new URL(urlA).hostname
    const hostB = new URL(urlB).hostname
    if (hostA === 'localhost' || hostB === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostA)) return ''
    if (hostA === hostB) return hostA
    const partsA = hostA.split('.')
    const partsB = hostB.split('.')
    if (partsA.length >= 2 && partsB.length >= 2) {
      const rootA = partsA.slice(-2).join('.')
      const rootB = partsB.slice(-2).join('.')
      if (rootA === rootB) return `.${rootA}`
    }
  } catch {}
  return ''
}

export const sharedCookieDomain = resolveSharedCookieDomain(authOrigin, siteOrigin)
