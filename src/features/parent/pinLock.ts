import type { PinLock } from '../../engine/pin'

// 输错锁定状态存在本机，家长模式和当场见证共用
const LOCK_KEY = 'little-garden:pin-lock'

export function readLock(): PinLock {
  try {
    return JSON.parse(localStorage.getItem(LOCK_KEY) ?? '') as PinLock
  } catch {
    return { fails: 0, lockedUntil: 0 }
  }
}

export function writeLock(l: PinLock) {
  try {
    localStorage.setItem(LOCK_KEY, JSON.stringify(l))
  } catch {
    /* 忽略 */
  }
}
