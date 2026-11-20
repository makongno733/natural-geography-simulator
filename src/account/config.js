function resolveDefaultAccountOrigin() {
  const envOrigin = (import.meta.env.VITE_ACCOUNT_ORIGIN || '').trim()
  if (envOrigin) return envOrigin.replace(/\/$/, '')
  if (typeof window !== 'undefined' && window.location) {
    const host = window.location.hostname || ''
    if (host.endsWith('kongnoma279.com')) {
      return 'https://account.kongnoma279.com'
    }
    if (host.startsWith('account.') || window.location.port === '4100') {
      return window.location.origin.replace(/\/$/, '')
    }
  }
  return ''
}

function resolveDefaultSiteOrigin() {
  const envSite = (import.meta.env.VITE_SITE_ORIGIN || '').trim()
  if (envSite) return envSite.replace(/\/$/, '')
  if (typeof window !== 'undefined' && window.location) {
    const host = window.location.hostname || ''
    if (host.endsWith('kongnoma279.com')) {
      return 'https://geo.kongnoma279.com'
    }
    return window.location.origin.replace(/\/$/, '')
  }
  return ''
}

export const accountOrigin = resolveDefaultAccountOrigin()
export const accountEnabled = Boolean(accountOrigin)
export const siteOrigin = resolveDefaultSiteOrigin()
