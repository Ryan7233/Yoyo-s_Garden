import { describe, expect, it } from 'vitest'
import { afterFail, hashPin, isLocked, isValidPin, makeResetQuestion, verifyPin } from './pin'

describe('PIN', () => {
  it('加盐哈希与校验', async () => {
    const h = await hashPin('1234', 'salt')
    expect(h).toHaveLength(64)
    expect(h).not.toBe(await hashPin('1234', 'other'))
    expect(await verifyPin('1234', 'salt', h)).toBe(true)
    expect(await verifyPin('4321', 'salt', h)).toBe(false)
  })
  it('只接受 4 位数字', () => {
    expect(isValidPin('0420')).toBe(true)
    expect(isValidPin('123')).toBe(false)
    expect(isValidPin('12a4')).toBe(false)
  })
  it('连续错 5 次锁 1 分钟', () => {
    let lock = { fails: 0, lockedUntil: 0 }
    for (let i = 0; i < 4; i++) lock = afterFail(lock, 1000, 5, 60_000)
    expect(isLocked(lock, 1000)).toBe(false)
    lock = afterFail(lock, 1000, 5, 60_000)
    expect(isLocked(lock, 1000)).toBe(true)
    expect(isLocked(lock, 61_000)).toBe(false)
  })
  it('重设题是两位数乘两位数', () => {
    for (const r of [0, 0.5, 0.9999]) {
      const q = makeResetQuestion(() => r)
      expect(q.a).toBeGreaterThanOrEqual(11)
      expect(q.a).toBeLessThanOrEqual(99)
      expect(q.answer).toBe(q.a * q.b)
    }
  })
})
