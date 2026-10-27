import { describe, expect, it } from 'vitest'
import type { HandRaise, RaiseResult } from '../data/types'
import { courageSeeds, raiseDaysInWeek, shouldAskChallenge, sunflowerLevel, weekStart } from './courage'

// 2026-10-19 周一，2026-10-25 周日
const raise = (date: string, result: RaiseResult = 'right'): HandRaise => ({ id: `${date}-${result}-${Math.random()}`, childId: 'c', date, result, at: `${date}T10:00:00Z` })

describe('向日葵举手', () => {
  it('一周从周一算到周日', () => {
    expect(weekStart('2026-10-19')).toBe('2026-10-19')
    expect(weekStart('2026-10-22')).toBe('2026-10-19')
    expect(weekStart('2026-10-25')).toBe('2026-10-19')
    expect(weekStart('2026-10-26')).toBe('2026-10-26')
  })

  it('每天只算一颗种子、一天；周一重新算这周', () => {
    const list = [raise('2026-10-20'), raise('2026-10-20', 'wrong'), raise('2026-10-22', 'notCalled'), raise('2026-10-26')]
    expect(courageSeeds(list)).toBe(3)
    expect(raiseDaysInWeek(list, '2026-10-25')).toBe(2)
    expect(raiseDaysInWeek(list, '2026-10-26')).toBe(1)
  })

  it('累计做到的周越多，向日葵越高；不会因为某周没做到变小', () => {
    expect([0, 1, 2, 3, 5, 6, 20].map(sunflowerLevel)).toEqual([0, 1, 1, 2, 2, 3, 3])
  })

  it('这周和上周都做到了才问要不要挑战 3 次；问过两周内不再问', () => {
    const weeks = ['2026-10-12', '2026-10-19']
    expect(shouldAskChallenge(weeks, 2, '2026-10-21')).toBe(true)
    expect(shouldAskChallenge(['2026-10-05', '2026-10-19'], 2, '2026-10-21')).toBe(false)
    expect(shouldAskChallenge(weeks, 3, '2026-10-21')).toBe(false)
    expect(shouldAskChallenge(weeks, 2, '2026-10-21', '2026-10-19')).toBe(false)
    expect(shouldAskChallenge([...weeks, '2026-10-26', '2026-11-02'], 2, '2026-11-03', '2026-10-19')).toBe(true)
  })
})
