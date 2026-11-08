import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

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

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('rejects malformed JSON and non-object success payloads', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true, status: 200, json: async () => { throw new SyntaxError('Unexpected token') }
    }))
    await expect(apiRequest('/api/test')).rejects.toThrow('服务器返回了无效的数据')
    fetch.mockResolvedValue({ ok: true, status: 200, json: async () => null })
    await expect(apiRequest('/api/test')).rejects.toThrow('服务器返回了无效的数据')
  })

  it('keeps the timeout active while reading the response body', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async (_url, { signal }) => ({
      ok: true, status: 200,
      json: () => new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () => reject(signal.reason), { once: true })
      })
    })))
    const request = apiRequest('/api/test', { timeout: 50 })
    const result = expect(request).rejects.toThrow('网络请求超时')
    await vi.advanceTimersByTimeAsync(50)
    await result
    expect(serviceStatus.value.online).toBe(false)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('preserves caller cancellation without marking the service offline', async () => {
    const controller = new AbortController()
    vi.spyOn(AbortSignal, 'any').mockImplementation(() => { throw new Error('Unavailable on older browsers') })
    const removeListener = vi.spyOn(controller.signal, 'removeEventListener')
    vi.stubGlobal('fetch', vi.fn().mockImplementation((_url, { signal }) =>
      new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () => reject(signal.reason), { once: true })
      })
    ))
    const request = apiRequest('/api/test', { signal: controller.signal })
    controller.abort()
    await expect(request).rejects.toMatchObject({ name: 'AbortError' })
    expect(serviceStatus.value.online).toBe(true)
    expect(removeListener).toHaveBeenCalledWith('abort', expect.any(Function))
  })

  it('propagates an already cancelled signal and cleans its listener after success', async () => {
    const controller = new AbortController()
    controller.abort()
    vi.stubGlobal('fetch', vi.fn(async (_url, { signal }) => {
      if (signal.aborted) throw signal.reason
      return { ok: true, status: 200, json: async () => ({ status: 'ok' }) }
    }))
    await expect(apiRequest('/api/test', { signal: controller.signal })).rejects.toMatchObject({ name: 'AbortError' })
    const active = new AbortController()
    const removeListener = vi.spyOn(active.signal, 'removeEventListener')
    await expect(apiRequest('/api/test', { signal: active.signal })).resolves.toEqual({ status: 'ok' })
    expect(removeListener).toHaveBeenCalledWith('abort', expect.any(Function))
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
