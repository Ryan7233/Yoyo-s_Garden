// 家长统计与全勤日历（8.2、7.1）：都是对记录的纯计算
import type { ExerciseRecord, LedgerEntry, LedgerReason, TaskDef, TaskRecord } from '../data/types'
import type { PlanOf } from './plans'
import { EXERCISE_TASK_ID, RAISE_HAND_TASK_ID } from '../data/tasks'
import { dayProgress, latestRecordByTask } from './rewards'
import { addDays, parseTaskDay, toTaskDay, weekdayOf } from './taskDay'
import { countsAsDone } from './exercise'

/** 截至 today（含）的最近 n 天，从早到晚 */
export function lastNDays(today: string, n: number): string[] {
  return Array.from({ length: n }, (_, i) => addDays(today, i - n + 1))
}

export interface DayCompletion {
  day: string
  done: number
  total: number
  /** 0–1；当天没有安排任务或无数据时为 null */
  rate: number | null
  allDone: boolean
  /** 建园之前，没有数据 */
  noData: boolean
}

/** 不算完成率的任务：运动卡片单独统计；举手没记录的日子不算“没完成” */
const NOT_RATED = [EXERCISE_TASK_ID, RAISE_HAND_TASK_ID]

/** 某天安排的任务（不含运动卡片和举手）完成了几项 */
export function dayCompletion(planOf: PlanOf, records: TaskRecord[], day: string): DayCompletion {
  const { required, more, noData = false } = planOf(day)
  const list = [...required, ...more].filter((t) => !NOT_RATED.includes(t.id))
  const latest = latestRecordByTask(records, day)
  const done = list.filter((t) => latest.get(t.id)?.status === 'done').length
  return {
    day,
    done,
    total: list.length,
    rate: list.length ? done / list.length : null,
    allDone: dayProgress(planOf, records, day).allDone,
    noData,
  }
}

export interface TaskRate {
  task: TaskDef
  done: number
  scheduled: number
  rate: number | null
}

/** 每个任务在这些天里的完成率（只算安排了它的日子） */
export function taskRates(planOf: PlanOf, records: TaskRecord[], days: string[]): TaskRate[] {
  const out = new Map<string, TaskRate>()
  for (const day of days) {
    const { required, more } = planOf(day)
    const latest = latestRecordByTask(records, day)
    for (const t of [...required, ...more]) {
      if (NOT_RATED.includes(t.id)) continue
      const r = out.get(t.id) ?? { task: t, done: 0, scheduled: 0, rate: null }
      r.scheduled++
      if (latest.get(t.id)?.status === 'done') r.done++
      out.set(t.id, r)
    }
  }
  return [...out.values()]
    .map((r) => ({ ...r, rate: r.scheduled ? r.done / r.scheduled : null }))
    .sort((a, b) => a.task.order - b.task.order)
}

/** 运动子项每天最好成绩，没做为 null（折线图断开） */
export function exerciseSeries(records: ExerciseRecord[], exerciseId: string, days: string[]): (number | null)[] {
  const best = new Map<string, number>()
  for (const r of records) {
    if (r.exerciseId !== exerciseId || !countsAsDone(r)) continue
    best.set(r.date, Math.max(best.get(r.date) ?? -Infinity, r.value))
  }
  return days.map((d) => best.get(d) ?? null)
}

export interface LedgerSummary {
  income: number
  expense: number
  /** 按原因汇总的金币净额（收入为正、支出为负） */
  byReason: Partial<Record<LedgerReason, number>>
  /** 这段时间的金币流水，新的在前 */
  entries: LedgerEntry[]
}

/** 金币收支（按归属的任务日归入这段时间，没有任务日的按记账时刻） */
export function coinSummary(entries: LedgerEntry[], days: string[]): LedgerSummary {
  const set = new Set(days)
  const list = entries.filter((e) => e.currency === 'coin' && e.amount !== 0 && set.has(e.date ?? toTaskDay(new Date(e.at))))
  const byReason: Partial<Record<LedgerReason, number>> = {}
  let income = 0
  let expense = 0
  for (const e of list) {
    byReason[e.reason] = (byReason[e.reason] ?? 0) + e.amount
    if (e.amount > 0) income += e.amount
    else expense -= e.amount
  }
  return { income, expense, byReason, entries: [...list].sort((a, b) => (a.at < b.at ? 1 : -1)) }
}

/** 月历格子：按周排，周日开头，月前月后补 null。month 形如 '2026-10' */
export function monthGrid(month: string): (string | null)[][] {
  const first = `${month}-01`
  const start = weekdayOf(first)
  const d = parseTaskDay(first)
  const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  const cells: (string | null)[] = Array(start).fill(null)
  for (let i = 0; i < daysInMonth; i++) cells.push(addDays(first, i))
  while (cells.length % 7) cells.push(null)
  const weeks: (string | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

export function shiftMonth(month: string, n: number): string {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m - 1 + n, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/** 所有全勤的日子 */
export function allDoneDays(planOf: PlanOf, records: TaskRecord[]): Set<string> {
  const out = new Set<string>()
  for (const d of new Set(records.map((r) => r.date))) if (dayProgress(planOf, records, d).allDone) out.add(d)
  return out
}
