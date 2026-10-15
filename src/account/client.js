import { createAuthClient } from 'better-auth/client'
import { accountOrigin } from './config.js'

export { accountEnabled, accountOrigin, siteOrigin } from './config.js'
export { apiRequest } from './api.js'
export const authClient = createAuthClient({
  baseURL: accountOrigin || undefined,
  fetchOptions: { credentials: 'include' }
})
