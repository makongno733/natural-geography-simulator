import { createAuthClient } from 'better-auth/client'
import { accountEnabled, accountOrigin } from './config.js'

export { accountEnabled, accountOrigin, siteOrigin } from './config.js'
export const authClient = createAuthClient({
  baseURL: accountOrigin || undefined,
  fetchOptions: { credentials: 'include' }
})

export async function apiRequest(path, options = {}) {
  if (!accountEnabled) throw new Error('账号服务尚未启用')
  const response = await fetch(`${accountOrigin}${path}`, {
    credentials: 'include',
    ...options,
    headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers }
  })
  if (response.status === 204) return null
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || `请求失败 (${response.status})`)
  return data
}
