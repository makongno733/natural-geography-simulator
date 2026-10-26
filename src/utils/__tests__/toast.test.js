import { describe, it, expect, beforeEach } from 'vitest'
import { toast, showToast, dismissToast } from '../toast.js'

describe('Toast utility', () => {
  beforeEach(() => {
    toast.list.value = []
  })

  it('adds toast to the list and dismisses by id', () => {
    const id = toast.info('测试提示信息')
    expect(toast.list.value.length).toBe(1)
    expect(toast.list.value[0].message).toBe('测试提示信息')
    expect(toast.list.value[0].type).toBe('info')

    dismissToast(id)
    expect(toast.list.value.length).toBe(0)
  })

  it('supports success, warn, error types', () => {
    toast.success('成功操作')
    toast.warn('注意警告')
    toast.error('异常报错')

    expect(toast.list.value.length).toBe(3)
    expect(toast.list.value[0].type).toBe('success')
    expect(toast.list.value[1].type).toBe('warn')
    expect(toast.list.value[2].type).toBe('error')
  })

  it('caps max toasts to 4 items', () => {
    for (let i = 1; i <= 6; i++) {
      toast.info(`消息 ${i}`)
    }
    expect(toast.list.value.length).toBe(4)
    expect(toast.list.value[3].message).toBe('消息 6')
  })
})
