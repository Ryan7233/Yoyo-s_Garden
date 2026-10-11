// 家长 PIN：SHA-256 加盐，只存哈希（SPEC 8.1）

function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function newSalt(): string {
  const a = new Uint8Array(16)
  crypto.getRandomValues(a)
  return toHex(a.buffer)
}

export async function hashPin(pin: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${pin}`)
  return toHex(await crypto.subtle.digest('SHA-256', data))
}

export async function verifyPin(pin: string, salt: string, hash: string): Promise<boolean> {
  return (await hashPin(pin, salt)) === hash
}

export function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin)
}

/** 输错锁定：连续错 maxTries 次锁 lockMs */
export interface PinLock {
  fails: number
  lockedUntil: number
}

export function afterFail(lock: PinLock, now: number, maxTries: number, lockMs: number): PinLock {
  const fails = lock.fails + 1
  if (fails >= maxTries) return { fails: 0, lockedUntil: now + lockMs }
  return { fails, lockedUntil: lock.lockedUntil }
}

export function isLocked(lock: PinLock, now: number): boolean {
  return now < lock.lockedUntil
}

/** 忘记 PIN：两位数乘两位数 */
export function makeResetQuestion(rand: () => number = Math.random): { a: number; b: number; answer: number } {
  const a = 11 + Math.floor(rand() * 89)
  const b = 11 + Math.floor(rand() * 89)
  return { a, b, answer: a * b }
}
