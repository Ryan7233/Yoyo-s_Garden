import { describe, expect, it } from 'vitest'
import { AUTO_UPDATE_WINDOW_MS, shouldAutoUpdate } from './autoUpdate'

describe('自动更新时机', () => {
  it('刚打开、没有弹窗时直接更新', () => {
    expect(shouldAutoUpdate({ sinceShownMs: 0, busy: false })).toBe(true)
    expect(shouldAutoUpdate({ sinceShownMs: AUTO_UPDATE_WINDOW_MS, busy: false })).toBe(true)
  })

  it('用了一会儿以后不打断，等下次打开', () => {
    expect(shouldAutoUpdate({ sinceShownMs: AUTO_UPDATE_WINDOW_MS + 1, busy: false })).toBe(false)
  })

  it('有弹窗开着（做任务、看课）时不更新', () => {
    expect(shouldAutoUpdate({ sinceShownMs: 0, busy: true })).toBe(false)
  })
})
