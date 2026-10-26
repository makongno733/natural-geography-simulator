import { ref } from 'vue'

const toasts = ref([])
let nextId = 1

/**
 * 弹出提示
 * @param {string} message 提示文本
 * @param {'info' | 'success' | 'warn' | 'error'} [type='info'] 类型
 * @param {number} [duration=3600] 持续时间(ms)
 */
export function showToast(message, type = 'info', duration = 3600) {
  const id = nextId++
  const toastItem = {
    id,
    message,
    type,
    created: Date.now()
  }

  // 保证最多显示 4 条，避免遮挡
  if (toasts.value.length >= 4) {
    toasts.value.shift()
  }
  toasts.value.push(toastItem)

  if (duration > 0) {
    setTimeout(() => {
      dismissToast(id)
    }, duration)
  }

  return id
}

export function dismissToast(id) {
  const idx = toasts.value.findIndex(t => t.id === id)
  if (idx !== -1) {
    toasts.value.splice(idx, 1)
  }
}

export const toast = {
  info: (msg, dur) => showToast(msg, 'info', dur),
  success: (msg, dur) => showToast(msg, 'success', dur),
  warn: (msg, dur) => showToast(msg, 'warn', dur),
  error: (msg, dur) => showToast(msg, 'error', dur),
  dismiss: dismissToast,
  list: toasts
}
