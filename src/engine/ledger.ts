import type { Currency, LedgerEntry } from '../data/types'

export interface Balance {
  coin: number
  drop: number
}

/** 余额 = 流水求和 */
export function balanceOf(entries: LedgerEntry[]): Balance {
  const b: Balance = { coin: 0, drop: 0 }
  for (const e of entries) b[e.currency] += e.amount
  return b
}

/** 撤销时实际扣回的数量：最多扣到 0，不出现负数 */
export function clampedDeduction(balance: number, amount: number): number {
  return Math.max(0, Math.min(balance, amount))
}

/** 某个 refId 下当前的奖励是否“有效”（最后一条不是撤销） */
export function isAwardActive(entries: LedgerEntry[], refId: string, currency: Currency = 'coin'): boolean {
  const rel = entries.filter((e) => e.refId === refId && e.currency === currency)
  if (rel.length === 0) return false
  return rel[rel.length - 1].reason !== 'revoke'
}

/** 某个任务日的收入（不含支出），用于“今日所得” */
export function earnedOn(entries: LedgerEntry[], day: string): Balance {
  const b: Balance = { coin: 0, drop: 0 }
  for (const e of entries) if (e.date === day && e.amount > 0 && e.reason !== 'gift') b[e.currency] += e.amount
  return b
}
