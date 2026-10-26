import { ref } from 'vue'
import { accountEnabled, accountOrigin } from './config.js'

export const serviceStatus = ref({
  online: accountEnabled,
  lastCheck: null,
  isChecking: false
})

export class ApiError extends Error {
  constructor(message, status = 0, isNetworkError = false) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.isNetworkError = isNetworkError
  }
}

/**
 * 统一网络请求封装
 * @param {string} path 请求路径
 * @param {RequestInit & { timeout?: number }} [options={}] 请求选项
 */
export async function apiRequest(path, options = {}) {
  if (!accountEnabled) {
    serviceStatus.value.online = false
    throw new ApiError('账号服务未配置或未启用', 0, true)
  }

  const { timeout = 6000, ...fetchOptions } = options
  const controller = new AbortController()
  const timer = setTimeout(() => {
    controller.abort()
  }, timeout)

  try {
    const response = await fetch(`${accountOrigin}${path}`, {
      credentials: 'include',
      signal: controller.signal,
      ...fetchOptions,
      headers: {
        ...(fetchOptions.body ? { 'Content-Type': 'application/json' } : {}),
        ...fetchOptions.headers
      }
    })
    clearTimeout(timer)

    if (response.status === 204) {
      serviceStatus.value.online = true
      return null
    }

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      const msg = data.error || (response.status === 404 ? '请求资源未找到 (404)' : `服务器响应异常 (${response.status})`)
      throw new ApiError(msg, response.status, false)
    }

    serviceStatus.value.online = true
    return data
  } catch (err) {
    clearTimeout(timer)
    if (err.name === 'AbortError') {
      serviceStatus.value.online = false
      throw new ApiError('网络请求超时，云端服务暂未响应', 408, true)
    }
    if (err instanceof ApiError) {
      throw err
    }
    // 捕获网络失联 / 拒绝连接
    serviceStatus.value.online = false
    throw new ApiError('无法连接至云端服务，请确认网络或服务状态', 0, true)
  }
}
