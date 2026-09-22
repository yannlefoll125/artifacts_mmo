import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import ServerHealth from '../ServerHealth.vue'
import { getHealth } from '@/api/client'

vi.mock('@/api/client', () => ({
  getHealth: vi.fn<() => Promise<{ data?: { status?: string } }>>(),
}))

describe('ServerHealth', () => {
  beforeEach(() => {
    vi.mocked(getHealth).mockReset()
  })

  it('shows ok when the health endpoint answers', async () => {
    vi.mocked(getHealth).mockResolvedValue({ data: { status: 'ok' } } as never)
    const wrapper = mount(ServerHealth)
    await flushPromises()
    expect(wrapper.attributes('data-status')).toBe('ok')
  })

  it('shows unreachable when the health call fails', async () => {
    vi.mocked(getHealth).mockRejectedValue(new Error('down'))
    const wrapper = mount(ServerHealth)
    await flushPromises()
    expect(wrapper.attributes('data-status')).toBe('unreachable')
  })
})
