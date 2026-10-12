import { describe, expect, it } from 'vitest'
import { defaultTasks } from '../data/tasks'
import type { DayPlan, TaskRecord } from '../data/types'
import { daysToFreeze, freezePlan, livePlan, planResolver } from './plans'
import { dayProgress } from './rewards'
import { allDoneDays, dayCompletion, taskRates } from './stats'

const tasks = defaultTasks('c')
const SAT = '2026-10-17' // 周六必做：说开始就开始、英语阅读、喝水
let n = 0
const done = (taskId: string, date: string): TaskRecord => ({
  id: `r${++n}`, childId: 'c', taskId, date, status: 'done', source: 'child', createdAt: `${date}T10:00:${String(n % 60).padStart(2, '0')}Z`,
})

describe('按日期保存的任务配置', () => {
  it('冻结当天安排的任务，按顺序分必做和更多', () => {
    const p = freezePlan(tasks, 'c', SAT)
    expect(p).toMatchObject({ childId: 'c', date: SAT, required: ['start-on-time', 'english-reading', 'drink-water'] })
    expect(p.more).not.toContain('homework')
    expect(p.more[0]).toBe('sport')
  })

  it('有快照的日子用快照，没有的用当前配置', () => {
    const plan: DayPlan = { childId: 'c', date: SAT, required: ['drink-water'], more: ['math'] }
    const of = planResolver(tasks, [plan])
    expect(of(SAT).required.map((t) => t.id)).toEqual(['drink-water'])
    expect(of(SAT).more.map((t) => t.id)).toEqual(['math'])
    expect(of('2026-10-18').required.map((t) => t.id)).toEqual(livePlan(tasks)('2026-10-18').required.map((t) => t.id))
  })

  it('改了任务配置后，过去的全勤和统计不变', () => {
    const records = ['start-on-time', 'english-reading', 'drink-water'].map((t) => done(t, SAT))
    const frozen = [freezePlan(tasks, 'c', SAT)]
    // 之后家长把“数学”改成必做
    const changed = tasks.map((t) => (t.id === 'math' ? { ...t, required: true } : t))
    expect(dayProgress(livePlan(changed), records, SAT).allDone).toBe(false)
    const of = planResolver(changed, frozen)
    expect(dayProgress(of, records, SAT)).toEqual({ requiredDone: 3, requiredTotal: 3, allDone: true })
    expect(allDoneDays(of, records).has(SAT)).toBe(true)
    expect(dayCompletion(of, records, SAT)).toMatchObject({ done: 3, allDone: true })
    expect(dayCompletion(of, records, SAT).total).toBe(dayCompletion(livePlan(tasks), records, SAT).total)
    expect(taskRates(of, records, [SAT]).find((r) => r.task.id === 'math')?.scheduled).toBe(1)
  })

  it('需要冻结的日子：从建园那天到昨天，跳过已有的', () => {
    expect(daysToFreeze('2026-10-15', '2026-10-18', new Set(['2026-10-16']))).toEqual(['2026-10-15', '2026-10-17'])
    expect(daysToFreeze('2026-10-18', '2026-10-18', new Set())).toEqual([])
  })
})

describe('建园之前的日子', () => {
  const of = planResolver(tasks, [], SAT)
  it('没有任务、标记为无数据', () => {
    expect(of('2026-10-16')).toEqual({ required: [], more: [], noData: true })
    expect(of(SAT).noData).toBeFalsy()
    expect(of(SAT).required.length).toBe(3)
  })
  it('不计入完成率和各任务完成率', () => {
    const days = ['2026-10-11', '2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16', SAT]
    const c = dayCompletion(of, [], '2026-10-16')
    expect(c).toMatchObject({ noData: true, rate: null, total: 0, allDone: false })
    expect(dayCompletion(of, [], SAT).noData).toBe(false)
    const reading = taskRates(of, [done('english-reading', SAT)], days).find((r) => r.task.id === 'english-reading')!
    expect([reading.done, reading.scheduled]).toEqual([1, 1])
  })
})
