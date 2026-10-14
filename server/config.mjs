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
