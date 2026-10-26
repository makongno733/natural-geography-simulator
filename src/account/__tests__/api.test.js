import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../config.js', () => ({
  accountEnabled: true,
  accountOrigin: 'https://api.geo-community.example'
}))

import { apiRequest, ApiError, serviceStatus } from '../api.js'

describe('apiRequest resilience and timeout', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    serviceStatus.value.online = true
  })

  it('throws ApiError with network error flag on fetch failure', async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))

    await expect(apiRequest('/api/test')).rejects.toThrow(ApiError)
    await expect(apiRequest('/api/test')).rejects.toThrow('无法连接至云端服务')
    expect(serviceStatus.value.online).toBe(false)
  })

  it('handles 404 response gracefully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({})
    })

    await expect(apiRequest('/api/not-found')).rejects.toThrow('请求资源未找到 (404)')
  })

  it('handles 204 no content correctly', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204
    })

    const result = await apiRequest('/api/delete')
    expect(result).toBeNull()
    expect(serviceStatus.value.online).toBe(true)
  })
})
