import { describe, expect, it } from 'vitest'
import type { LedgerEntry, TaskRecord } from '../data/types'
import { defaultTasks } from '../data/tasks'
import { DEFAULT_EXERCISES } from '../data/exercises'
import { balanceOf, clampedDeduction } from './ledger'
import { livePlan } from './plans'
import { dayProgress, earnsStreakBonus, exerciseReward, reconcileDayAwards, revokeEntries, streakEndingAt } from './rewards'

const tasks = livePlan(defaultTasks('c1'))
let n = 0
const rec = (taskId: string, date: string, status: TaskRecord['status'] = 'done'): TaskRecord => ({
  id: `r${n++}`, childId: 'c1', taskId, date, status, source: 'child', createdAt: new Date(2026, 0, 1, 0, 0, n).toISOString(),
})
const entry = (e: Partial<LedgerEntry>): LedgerEntry => ({ id: `e${n++}`, childId: 'c1', at: '', currency: 'coin', amount: 0, reason: 'task', ...e })

describe('全勤', () => {
  const sat = '2026-10-17' // 周六必做：说开始就开始、英语阅读、喝水
  it('必做全部完成才算全勤', () => {
    const rs = [rec('start-on-time', sat), rec('english-reading', sat)]
    expect(dayProgress(tasks, rs, sat)).toEqual({ requiredDone: 2, requiredTotal: 3, allDone: false })
    rs.push(rec('drink-water', sat))
    expect(dayProgress(tasks, rs, sat).allDone).toBe(true)
  })
  it('待确认不算完成；撤销后以最新记录为准', () => {
    const rs = [rec('start-on-time', sat), rec('english-reading', sat), rec('drink-water', sat, 'pending')]
    expect(dayProgress(tasks, rs, sat).allDone).toBe(false)
    const rs2 = [rec('start-on-time', sat), rec('english-reading', sat), rec('drink-water', sat), rec('drink-water', sat, 'revoked')]
    expect(dayProgress(tasks, rs2, sat).allDone).toBe(false)
  })
  it('非必做任务不影响全勤', () => {
    const rs = [rec('start-on-time', sat), rec('english-reading', sat), rec('drink-water', sat)]
    expect(dayProgress(tasks, rs, sat).allDone).toBe(true)
  })
})

describe('连续全勤', () => {
  const days = new Set(['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-05'])
  it('计算连续天数，断签只影响连续，不清空累计', () => {
    expect(streakEndingAt(days, '2026-10-03')).toBe(3)
    expect(streakEndingAt(days, '2026-10-05')).toBe(1)
    expect(streakEndingAt(days, '2026-10-04')).toBe(0)
    expect(days.size).toBe(4)
  })
  it('每满 3 天发一次', () => {
    expect([1, 2, 3, 4, 6].map(earnsStreakBonus)).toEqual([false, false, true, false, true])
  })
})

describe('对账：全勤和连续奖励', () => {
  const days = new Set(['2026-10-01', '2026-10-02', '2026-10-03'])
  it('补发全勤和连续奖励，重复调用幂等', () => {
    const out = reconcileDayAwards('2026-10-03', days, [], 0)
    expect(out.map((e) => [e.reason, e.amount])).toEqual([['allDone', 5], ['streak', 3]])
    const ledger = out.map((e) => entry(e))
    expect(reconcileDayAwards('2026-10-03', days, ledger, 8)).toEqual([])
  })
  it('不再全勤时扣回，余额最低扣到 0', () => {
    const ledger = [entry({ refId: 'allDone:2026-10-03', reason: 'allDone', amount: 5 })]
    const out = reconcileDayAwards('2026-10-03', new Set(), ledger, 2)
    expect(out).toEqual([{ date: '2026-10-03', currency: 'coin', amount: -2, reason: 'revoke', refId: 'allDone:2026-10-03' }])
  })
})

describe('撤销', () => {
  it('撤销后余额不为负', () => {
    const ledger = [
      entry({ refId: 'r1', amount: 5 }),
      entry({ refId: 'r1', amount: 1, currency: 'drop' }),
      entry({ amount: -4, reason: 'purchase' }),
      entry({ amount: -1, currency: 'drop', reason: 'water' }),
    ]
    const bal = balanceOf(ledger)
    expect(bal).toEqual({ coin: 1, drop: 0 })
    const out = revokeEntries('r1', ledger, bal, '2026-10-11')
    expect(out.map((e) => [e.currency, e.amount])).toEqual([['coin', -1]])
    const after = balanceOf([...ledger, ...out.map((e) => entry(e))])
    expect(after).toEqual({ coin: 0, drop: 0 })
  })
  it('clampedDeduction', () => {
    expect(clampedDeduction(10, 3)).toBe(3)
    expect(clampedDeduction(2, 3)).toBe(2)
    expect(clampedDeduction(0, 3)).toBe(0)
  })
})

describe('运动奖励', () => {
  const [jump, , plank] = DEFAULT_EXERCISES
  const base = { personalBest: null, witnessed: false, doneTodayOtherIds: [] as string[], totalExercises: 5 }
  it('做了 +2，达标再 +1', () => {
    expect(exerciseReward({ ...base, def: jump, value: 80 }).coins).toBe(2)
    expect(exerciseReward({ ...base, def: jump, value: 100 }).coins).toBe(3)
  })
  it('没有见证不算破纪录', () => {
    const r = exerciseReward({ ...base, def: plank, value: 40, personalBest: 20 })
    expect(r.isPersonalBest).toBe(false)
    expect(r.coins).toBe(3)
  })
  it('有见证的破纪录 +5', () => {
    const r = exerciseReward({ ...base, def: plank, value: 40, personalBest: 20, witnessed: true })
    expect(r.isPersonalBest).toBe(true)
    expect(r.coins).toBe(8)
  })
  it('同一项一天内重复记录不重复发基础奖励', () => {
    expect(exerciseReward({ ...base, def: jump, value: 120, doneTodayOtherIds: ['jump-rope'] }).coins).toBe(0)
  })
  it('五项都做了 +3 金币 +2 水滴', () => {
    const r = exerciseReward({ ...base, def: jump, value: 50, doneTodayOtherIds: ['sit-reach', 'plank', 'hang', 'sit-up'] })
    expect(r.allFive).toBe(true)
    expect([r.coins, r.drops]).toEqual([5, 2])
  })
})
