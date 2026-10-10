export const accountOrigin = (import.meta.env.VITE_ACCOUNT_ORIGIN || '').replace(/\/$/, '')
export const accountEnabled = Boolean(accountOrigin)
export const siteOrigin = (import.meta.env.VITE_SITE_ORIGIN || window.location.origin).replace(/\/$/, '')
