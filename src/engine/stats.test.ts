import { describe, expect, it } from 'vitest'
import { defaultTasks } from '../data/tasks'
import type { ExerciseRecord, LedgerEntry, TaskRecord } from '../data/types'
import { livePlan } from './plans'
import { coinSummary, dayCompletion, exerciseSeries, lastNDays, monthGrid, shiftMonth, taskRates } from './stats'

const tasks = defaultTasks('c')
let n = 0
const done = (taskId: string, date: string, status: TaskRecord['status'] = 'done'): TaskRecord => ({
  id: `t${++n}`, childId: 'c', taskId, date, status, source: 'child', createdAt: `${date}T10:00:${String(n % 60).padStart(2, '0')}Z`,
})

describe('日期', () => {
  it('最近 n 天从早到晚，跨月', () => {
    expect(lastNDays('2026-11-02', 4)).toEqual(['2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'])
  })
  it('月历按周排，周日开头', () => {
    const g = monthGrid('2026-10') // 10 月 1 日是周四
    expect(g[0]).toEqual([null, null, null, null, '2026-10-01', '2026-10-02', '2026-10-03'])
    expect(g.flat().filter(Boolean)).toHaveLength(31)
    expect(g.every((w) => w.length === 7)).toBe(true)
    expect(shiftMonth('2026-01', -1)).toBe('2025-12')
    expect(shiftMonth('2026-12', 1)).toBe('2027-01')
  })
})

describe('完成率', () => {
  const SAT = '2026-10-17'
  it('当天完成率不含运动卡片，撤销的不算', () => {
    const c = dayCompletion(livePlan(tasks), [done('english-reading', SAT), done('drink-water', SAT), done('wash-up', SAT, 'revoked')], SAT)
    const scheduled = tasks.filter((t) => t.schedule.kind === 'daily' && t.id !== 'sport').length
    expect(c).toMatchObject({ done: 2, total: scheduled, allDone: false })
  })
  it('任务完成率只算安排了它的日子', () => {
    const days = lastNDays('2026-10-18', 7) // 周一到周日
    const records = [done('homework', '2026-10-12'), done('homework', '2026-10-13'), done('english-reading', '2026-10-18')]
    const rates = taskRates(livePlan(tasks), records, days)
    const hw = rates.find((r) => r.task.id === 'homework')!
    expect([hw.done, hw.scheduled]).toEqual([2, 5])
    const reading = rates.find((r) => r.task.id === 'english-reading')!
    expect([reading.done, reading.scheduled]).toEqual([1, 7])
    expect(rates.some((r) => r.task.id === 'sport')).toBe(false)
  })
})

describe('运动折线和金币流水', () => {
  it('每天取最好成绩，没做为 null', () => {
    const rec = (date: string, value: number, status: ExerciseRecord['status'] = 'done'): ExerciseRecord => ({
      id: `${date}${value}`, childId: 'c', exerciseId: 'plank', date, value, isPersonalBest: false, status, createdAt: '', recordAttempt: false,
    })
    const days = ['2026-10-16', '2026-10-17', '2026-10-18']
    expect(exerciseSeries([rec('2026-10-16', 20), rec('2026-10-16', 25), rec('2026-10-18', 40, 'revoked')], 'plank', days)).toEqual([25, null, null])
  })
  it('收入、支出、按原因汇总', () => {
    const e = (amount: number, reason: LedgerEntry['reason'], date: string, currency: LedgerEntry['currency'] = 'coin'): LedgerEntry => ({
      id: `${amount}${reason}${date}`, childId: 'c', at: `${date}T12:00:${String(Math.abs(amount)).padStart(2, '0')}Z`, date, currency, amount, reason,
    })
    const s = coinSummary(
      [e(5, 'task', '2026-10-17'), e(8, 'harvest', '2026-10-18'), e(-20, 'purchase', '2026-10-18'), e(3, 'task', '2026-10-01'), e(1, 'task', '2026-10-18', 'drop')],
      ['2026-10-17', '2026-10-18'],
    )
    expect([s.income, s.expense]).toEqual([13, 20])
    expect(s.byReason).toEqual({ task: 5, harvest: 8, purchase: -20 })
    expect(s.entries.map((x) => x.amount)).toEqual([-20, 8, 5])
  })
})
