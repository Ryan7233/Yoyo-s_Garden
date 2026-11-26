import { describe, expect, it } from 'vitest'
import { needsResume, waitRunning } from './sfx'
import { withTimeout } from './enClips'

describe('网页音频被 iPad 挂起后能恢复', () => {
  it('interrupted（锁屏 / 切后台以后）和 suspended 都要唤醒', () => {
    expect(needsResume({ state: 'interrupted' as AudioContextState })).toBe(true)
    expect(needsResume({ state: 'suspended' })).toBe(true)
    expect(needsResume({ state: 'running' })).toBe(false)
  })

  it('状态 running、时钟在走才算好；时钟卡住的“假死”算没好', async () => {
    let t = 0
    const alive = { state: 'running' as AudioContextState, get currentTime() { return (t += 0.01) }, resume: async () => {} }
    expect(await waitRunning(alive, 200)).toBe(true)
    const stuck = { state: 'running' as AudioContextState, currentTime: 5, resume: async () => {} }
    expect(await waitRunning(stuck, 100)).toBe(false)
    const interrupted = { state: 'interrupted' as AudioContextState, get currentTime() { return (t += 0.01) }, resume: async () => {} }
    expect(await waitRunning(interrupted, 100)).toBe(false)
  })

  it('解码永远不返回时会超时失败，不会卡死', async () => {
    await expect(withTimeout(new Promise(() => {}), 50)).rejects.toThrow('timeout')
    await expect(withTimeout(Promise.resolve(1), 50)).resolves.toBe(1)
  })
})
