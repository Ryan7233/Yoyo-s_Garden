import type { ExerciseDef, LedgerEntry, TaskDef, TaskRecord } from '../data/types'
import type { PlanOf } from './plans'
import { BALANCE } from '../data/balance'
import { addDays, weekStart } from './taskDay'
import { isWeekly } from './schedule'
import { clampedDeduction, isAwardActive } from './ledger'

/** 当天有效记录：每个任务取最新一条 */
export function latestRecordByTask(records: TaskRecord[], day: string): Map<string, TaskRecord> {
  const map = new Map<string, TaskRecord>()
  for (const r of records) {
    if (r.date !== day) continue
    const prev = map.get(r.taskId)
    if (!prev || prev.createdAt <= r.createdAt) map.set(r.taskId, r)
  }
  return map
}

/** 每周一次的任务：这一周（周一到周日）里最新的一条记录 */
export function latestThisWeek(records: TaskRecord[], taskId: string, day: string): TaskRecord | undefined {
  const start = weekStart(day)
  const end = addDays(start, 6)
  let out: TaskRecord | undefined
  for (const r of records) {
    if (r.taskId !== taskId || r.date < start || r.date > end) continue
    if (!out || out.createdAt <= r.createdAt) out = r
  }
  return out
}

/** 任务牌和家长记录上显示的记录：普通任务看当天，每周一次的任务看整周 */
export function cardRecords(records: TaskRecord[], tasks: Pick<TaskDef, 'id' | 'schedule'>[], day: string): Map<string, TaskRecord> {
  const map = latestRecordByTask(records, day)
  for (const t of tasks) {
    if (!isWeekly(t)) continue
    const r = latestThisWeek(records, t.id, day)
    if (r) map.set(t.id, r)
    else map.delete(t.id)
  }
  return map
}

export interface DayProgress {
  requiredDone: number
  requiredTotal: number
  allDone: boolean
}

/** 当天必做完成情况，按当天的任务配置计算 */
export function dayProgress(planOf: PlanOf, records: TaskRecord[], day: string): DayProgress {
  const { required } = planOf(day)
  const latest = latestRecordByTask(records, day)
  const requiredDone = required.filter((t) => latest.get(t.id)?.status === 'done').length
  return {
    requiredDone,
    requiredTotal: required.length,
    // 当天没有必做任务时不算全勤
    allDone: required.length > 0 && requiredDone === required.length,
  }
}

/** 截至 day（含）的连续全勤天数 */
export function streakEndingAt(allDoneDays: Set<string>, day: string): number {
  let n = 0
  let d = day
  while (allDoneDays.has(d)) {
    n++
    d = addDays(d, -1)
  }
  return n
}

/** 每连续满 N 天发一次连续奖励（第 3、6、9…天） */
export function earnsStreakBonus(streak: number): boolean {
  return streak > 0 && streak % BALANCE.streakDays === 0
}

export type NewEntry = Omit<LedgerEntry, 'id' | 'childId' | 'at'>

/**
 * 对账：根据当天“应得”的全勤和连续奖励，与流水里已有的比较，
 * 生成需要补发或扣回的流水。幂等，可重复调用。
 */
export function reconcileDayAwards(
  day: string,
  allDoneDays: Set<string>,
  entries: LedgerEntry[],
  coinBalance: number,
): NewEntry[] {
  const out: NewEntry[] = []
  let balance = coinBalance
  const streak = streakEndingAt(allDoneDays, day)
  const awards: [refId: string, reason: 'allDone' | 'streak', amount: number, wanted: boolean][] = [
    [`allDone:${day}`, 'allDone', BALANCE.allDoneCoins, allDoneDays.has(day)],
    [`streak:${day}`, 'streak', BALANCE.streakCoins, earnsStreakBonus(streak)],
  ]
  for (const [refId, reason, amount, wanted] of awards) {
    const active = isAwardActive(entries, refId)
    if (wanted && !active) {
      out.push({ date: day, currency: 'coin', amount, reason, refId })
      balance += amount
    } else if (!wanted && active) {
      const d = clampedDeduction(balance, amount)
      // 扣回额为 0 也写一条，作为“已撤销”的标记
      out.push({ date: day, currency: 'coin', amount: 0 - d, reason: 'revoke', refId })
      balance -= d
    }
  }
  return out
}

/** 一条任务记录完成时发放的奖励 */
export function taskRewardEntries(task: TaskDef, record: TaskRecord): NewEntry[] {
  const out: NewEntry[] = []
  if (task.coins) out.push({ date: record.date, currency: 'coin', amount: task.coins, reason: 'task', refId: record.id })
  if (task.drops) out.push({ date: record.date, currency: 'drop', amount: task.drops, reason: 'task', refId: record.id })
  return out
}

/** 撤销一条记录：按该 refId 已发放的净额扣回，余额最低扣到 0 */
export function revokeEntries(refId: string, entries: LedgerEntry[], balance: { coin: number; drop: number }, day: string): NewEntry[] {
  const out: NewEntry[] = []
  for (const currency of ['coin', 'drop'] as const) {
    const net = entries.filter((e) => e.refId === refId && e.currency === currency).reduce((s, e) => s + e.amount, 0)
    if (net <= 0) continue
    const d = clampedDeduction(balance[currency], net)
    if (d === 0) continue
    out.push({ date: day, currency, amount: -d, reason: 'revoke', refId })
  }
  return out
}

// ---- 运动（4.3） ----

export interface ExerciseRewardInput {
  def: ExerciseDef
  value: number
  /** 当前个人最好（无则 null） */
  personalBest: number | null
  /** 是否有见证的破纪录 */
  witnessed: boolean
  /** 今天之前已经做过的其他子项 id */
  doneTodayOtherIds: string[]
  totalExercises: number
}

export interface ExerciseReward {
  coins: number
  drops: number
  isPersonalBest: boolean
  reachedTarget: boolean
  allFive: boolean
}

/** 数值越大越好（体前屈也是正数更好） */
export function beatsRecord(value: number, best: number | null): boolean {
  return best === null || value > best
}

export function exerciseReward(i: ExerciseRewardInput): ExerciseReward {
  const reachedTarget = i.def.target !== null && i.value >= i.def.target
  const isPersonalBest = i.witnessed && beatsRecord(i.value, i.personalBest)
  const firstTimeToday = !i.doneTodayOtherIds.includes(i.def.id)
  const doneIds = new Set([...i.doneTodayOtherIds, i.def.id])
  const allFive = firstTimeToday && doneIds.size === i.totalExercises

  let coins = 0
  let drops = 0
  // 同一子项一天重复记录：“做了”和“达标”只在第一次发，破纪录照发
  if (firstTimeToday) {
    coins += BALANCE.exercisePerItemCoins
    if (reachedTarget) coins += BALANCE.exerciseTargetBonusCoins
  }
  if (isPersonalBest) coins += BALANCE.exercisePersonalBestCoins
  if (allFive) {
    coins += BALANCE.exerciseAllFiveCoins
    drops += BALANCE.exerciseAllFiveDrops
  }
  return { coins, drops, isPersonalBest, reachedTarget, allFive }
}
