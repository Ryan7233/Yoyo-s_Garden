// 运动打卡的业务规则（SPEC 4.3）：计时、数值校验、个人纪录、目标判定、奖励拆分
import type { ExerciseDef, ExerciseRecord, LedgerEntry } from '../data/types'
import { BALANCE } from '../data/balance'
import { clampedDeduction, type Balance } from './ledger'
import { beatsRecord, exerciseReward, type ExerciseReward, type NewEntry } from './rewards'
import { weekdayOf } from './taskDay'

export const COUNTDOWN_SECONDS = 60

/** 当天安排的子项（按家长设置的频率） */
export function exercisesForDay<T extends ExerciseDef>(defs: T[], day: string): T[] {
  const wd = weekdayOf(day)
  return defs.filter((d) => d.days.includes(wd))
}

// ---- 计时器 ----

/** 倒计时剩余整秒（向上取整，到 0 为止） */
export function countdownLeft(startedAt: number, now: number, total = COUNTDOWN_SECONDS): number {
  return Math.max(0, Math.ceil(total - (now - startedAt) / 1000))
}

/** 正计时已过整秒（向下取整，点“停”时记录这个数） */
export function stopwatchSeconds(startedAt: number, now: number): number {
  return Math.max(0, Math.floor((now - startedAt) / 1000))
}

/** 秒数显示为 m:ss */
export function formatSeconds(s: number): string {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

// ---- 数值录入 ----

const LIMITS: Record<ExerciseDef['unit'], { min: number; max: number; decimals: boolean }> = {
  count: { min: 0, max: 999, decimals: false },
  seconds: { min: 0, max: 3600, decimals: false },
  cm: { min: -50, max: 50, decimals: true },
}

/** 解析孩子输入的数值；不合法返回 null。体前屈可为负，可带一位小数 */
export function parseExerciseValue(input: string, unit: ExerciseDef['unit']): number | null {
  const s = input.trim().replace('－', '-').replace('。', '.')
  const { min, max, decimals } = LIMITS[unit]
  const re = decimals ? /^-?\d{1,2}(\.\d)?$/ : /^\d{1,4}$/
  if (!re.test(s)) return null
  const v = Number(s)
  if (!Number.isFinite(v) || v < min || v > max) return null
  return Object.is(v, -0) ? 0 : v
}

// ---- 纪录 ----

/** 计入成绩的记录：没撤销的（待确认和驳回的也算“做了”） */
export function countsAsDone(r: ExerciseRecord): boolean {
  return r.status !== 'revoked'
}

/** 个人最好：有见证并确认的纪录里的最大值，没有则 null */
export function personalBestOf(records: ExerciseRecord[], exerciseId: string, excludeId?: string): number | null {
  let best: number | null = null
  for (const r of records) {
    if (r.exerciseId !== exerciseId || r.id === excludeId) continue
    if (r.status !== 'done' || !r.isPersonalBest) continue
    if (best === null || r.value > best) best = r.value
  }
  return best
}

/** 当天已做过的子项 id（按记录先后，含重复） */
export function doneIdsOn(records: ExerciseRecord[], day: string, excludeId?: string): string[] {
  return records.filter((r) => r.date === day && r.id !== excludeId && countsAsDone(r)).map((r) => r.exerciseId)
}

/** 当天各子项最好的一次 */
export function bestTodayByExercise(records: ExerciseRecord[], day: string): Map<string, ExerciseRecord> {
  const map = new Map<string, ExerciseRecord>()
  for (const r of records) {
    if (r.date !== day || !countsAsDone(r)) continue
    const prev = map.get(r.exerciseId)
    if (!prev || r.value > prev.value) map.set(r.exerciseId, r)
  }
  return map
}

export function reachesTarget(def: ExerciseDef, value: number): boolean {
  return def.target !== null && value >= def.target
}

/** 是否值得问“要挑战纪录吗？”：超过个人最好（还没有纪录时，第一次成绩就是纪录） */
export function canChallengeRecord(value: number, personalBest: number | null): boolean {
  return beatsRecord(value, personalBest)
}

/** P2：最近 n 次（每天取最好）都达标，提示家长可以提高目标 */
export function suggestRaiseTarget(def: ExerciseDef, records: ExerciseRecord[], n = 3): boolean {
  if (def.target === null) return false
  const byDay = new Map<string, number>()
  for (const r of records) {
    if (r.exerciseId !== def.id || !countsAsDone(r)) continue
    byDay.set(r.date, Math.max(byDay.get(r.date) ?? -Infinity, r.value))
  }
  const recent = [...byDay.entries()].sort(([a], [b]) => (a < b ? 1 : -1)).slice(0, n)
  return recent.length === n && recent.every(([, v]) => v >= def.target!)
}

// ---- 奖励 ----

export interface LogInput {
  def: ExerciseDef
  value: number
  day: string
  /** 当天安排的子项 */
  scheduled: ExerciseDef[]
  /** 该孩子的全部运动记录 */
  records: ExerciseRecord[]
  /** 家长当场见证（视频见证要等家长确认后才算） */
  witnessed: boolean
}

/** 记一条运动成绩时的奖励 */
export function rewardForLog(i: LogInput): ExerciseReward {
  const scheduledIds = new Set(i.scheduled.map((d) => d.id))
  return exerciseReward({
    def: i.def,
    value: i.value,
    personalBest: personalBestOf(i.records, i.def.id),
    witnessed: i.witnessed,
    doneTodayOtherIds: doneIdsOn(i.records, i.day).filter((id) => scheduledIds.has(id)),
    totalExercises: scheduledIds.has(i.def.id) ? scheduledIds.size : Number.POSITIVE_INFINITY,
  })
}

/**
 * 把一条记录的奖励拆成流水：日常练习（含达标）记 exercise，破纪录记 personalBest。
 * “五项全做”不挂在记录上，由 reconcileAllFive 按天对账。
 */
export function exerciseRewardEntries(record: ExerciseRecord, reward: ExerciseReward): NewEntry[] {
  const out: NewEntry[] = []
  const pb = reward.isPersonalBest ? BALANCE.exercisePersonalBestCoins : 0
  const practice = reward.coins - pb - (reward.allFive ? BALANCE.exerciseAllFiveCoins : 0)
  const base = { date: record.date, refId: record.id }
  if (practice > 0) out.push({ ...base, currency: 'coin', amount: practice, reason: 'exercise' })
  if (pb > 0) out.push({ ...base, currency: 'coin', amount: pb, reason: 'personalBest' })
  return out
}

/** 当天安排的子项是否都做了（撤销的不算） */
export function allFiveDone(scheduled: ExerciseDef[], records: ExerciseRecord[], day: string): boolean {
  if (!scheduled.length) return false
  const done = new Set(doneIdsOn(records, day))
  return scheduled.every((d) => done.has(d.id))
}

/**
 * 旧数据里“五项全做”挂在凑齐五项的那条记录上（运动的水滴只来自这项奖励）。
 * 返回仍然有效的那条记录 id。
 */
function legacyAllFiveRef(entries: LedgerEntry[], day: string): string | undefined {
  const drops = entries.filter((e) => e.currency === 'drop' && e.date === day && e.refId && !e.refId.startsWith('allFive:'))
  const refs = new Set(drops.filter((e) => e.reason === 'exercise').map((e) => e.refId!))
  for (const refId of refs) if (drops.filter((e) => e.refId === refId).reduce((s, e) => s + e.amount, 0) > 0) return refId
}

/**
 * “五项全做”按天对账（refId = allFive:日期）：凑齐时发一次，撤销后不再齐就收回，
 * 补录凑齐时不重复发。幂等，可重复调用。
 */
export function reconcileAllFive(
  day: string, scheduled: ExerciseDef[], records: ExerciseRecord[], entries: LedgerEntry[], balance: Balance,
): NewEntry[] {
  const refId = `allFive:${day}`
  const wanted = allFiveDone(scheduled, records, day)
  const legacy = legacyAllFiveRef(entries, day)
  // 发放和收回成对出现，用次数比较，不依赖同一时刻写入的流水顺序
  let grants = 0
  for (const e of entries) if (e.refId === refId && e.currency === 'coin') grants += e.reason === 'revoke' ? -1 : 1
  const active = grants > 0 || legacy !== undefined
  const award = { coin: BALANCE.exerciseAllFiveCoins, drop: BALANCE.exerciseAllFiveDrops }
  if (wanted && !active) {
    return (['coin', 'drop'] as const).map((currency) => ({ date: day, refId, currency, amount: award[currency], reason: 'exercise' as const }))
  }
  if (!wanted && active) {
    // 扣回额为 0 也写一条，作为“已撤销”的标记
    const ref = legacy ?? refId
    return (['coin', 'drop'] as const).map((currency) => ({
      date: day, refId: ref, currency, amount: 0 - clampedDeduction(balance[currency], award[currency]), reason: 'revoke' as const,
    }))
  }
  return []
}

/** 家长确认视频后：这条成绩是否仍然是新纪录（等待期间可能已被别的纪录超过） */
export function confirmVideoRecord(record: ExerciseRecord, records: ExerciseRecord[]): { isPersonalBest: boolean; entries: NewEntry[] } {
  const isPersonalBest = beatsRecord(record.value, personalBestOf(records, record.exerciseId, record.id))
  const entries: NewEntry[] = isPersonalBest
    ? [{ date: record.date, refId: record.id, currency: 'coin', amount: BALANCE.exercisePersonalBestCoins, reason: 'personalBest' }]
    : []
  return { isPersonalBest, entries }
}
