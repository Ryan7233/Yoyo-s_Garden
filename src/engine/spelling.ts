// 每日拼写的排期：第 1 天学新词（看-读-盖-写-查），第 2、4、7 天各听写一次；
// 落在周末的顺延到周一。每天最多 12 个词，多出来的往后排。
// 周六小听写本周的词，写错的放回下周当新词重新学。错了不扣分。
import type { SpellResult, SpellWord } from '../data/types'
import { addDays, diffDays, weekdayOf } from './taskDay'

/** 第 2、4、7 天：相对第 1 天加 1、3、6 天 */
export const REVIEW_OFFSETS = [1, 3, 6] as const
export const SPELL_DONE_STEP = REVIEW_OFFSETS.length + 1
export const SPELL_DAILY_CAP = 12
export const SPELL_NEW_PER_DAY = 3

/** 周六周日顺延到周一 */
export function toSchoolDay(day: string): string {
  const wd = weekdayOf(day)
  if (wd === 6) return addDays(day, 2)
  if (wd === 0) return addDays(day, 1)
  return day
}

/** 新加的词：从最近的上学日开始学 */
export function newSpellWord(base: Omit<SpellWord, 'startDay' | 'step' | 'due' | 'misses'>, today: string): SpellWord {
  const start = toSchoolDay(today)
  return { ...base, startDay: start, step: 0, due: start, misses: 0 }
}

export interface SpellQueue {
  fresh: SpellWord[]
  review: SpellWord[]
}

/** 今天要练的词：先新词，再按到期先后排复习词，合计不超过 12 个 */
export function spellQueue(words: SpellWord[], today: string, cap = SPELL_DAILY_CAP): SpellQueue {
  const due = words
    .filter((w) => w.step < SPELL_DONE_STEP && w.due <= today)
    .sort((a, b) => a.due.localeCompare(b.due) || a.addedAt.localeCompare(b.addedAt))
  const fresh = due.filter((w) => w.step === 0).slice(0, cap)
  const review = due.filter((w) => w.step > 0).slice(0, Math.max(0, cap - fresh.length))
  return { fresh, review }
}

/** 下一次复习的日子：按第 1 天推算，但不早于明天，并避开周末 */
function nextDue(word: SpellWord, step: number, today: string): string {
  const planned = addDays(word.startDay, REVIEW_OFFSETS[step - 1])
  return toSchoolDay(planned > today ? planned : addDays(today, 1))
}

/**
 * 用一次每日拼写的结果更新词：
 * - 新词写对了（重写后写对也算学过）→ 进入第 1 次复习
 * - 复习一次写对 → 进入下一次复习；写错了 → 明天（下个上学日）再复习这一次
 * - 跳过或没练到的不变
 */
export function applySpellResult(word: SpellWord, result: SpellResult | undefined, today: string): SpellWord {
  if (!result || !result.attempts) return word
  if (word.step === 0) {
    if (!result.done) return { ...word, due: toSchoolDay(addDays(today, 1)) }
    return { ...word, step: 1, due: nextDue(word, 1, today) }
  }
  if (!result.firstTry) return { ...word, due: toSchoolDay(addDays(today, 1)) }
  const step = word.step + 1
  return step >= SPELL_DONE_STEP ? { ...word, step, due: today } : { ...word, step, due: nextDue(word, step, today) }
}

/** 周末小听写：最近 7 天里学的新词（已经开始学的） */
export function weekQuizWords(words: SpellWord[], today: string): SpellWord[] {
  return words
    .filter((w) => w.step > 0 && diffDays(today, w.startDay) >= 0 && diffDays(today, w.startDay) <= 6)
    .sort((a, b) => a.startDay.localeCompare(b.startDay) || a.addedAt.localeCompare(b.addedAt))
}

/** 写错的词放回下周：下个上学日当新词重新学 */
export function requeueWord(word: SpellWord, today: string): SpellWord {
  const start = toSchoolDay(addDays(today, 1))
  return { ...word, startDay: start, step: 0, due: start, misses: word.misses + 1 }
}

/** 某天已经加了几个新词（提示家长每天 3 个就够） */
export function addedOn(words: SpellWord[], day: string): number {
  return words.filter((w) => w.startDay === toSchoolDay(day) && w.misses === 0).length
}
