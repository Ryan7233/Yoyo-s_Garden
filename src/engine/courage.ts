// 向日葵举手：上课举手就记一次，答对、答错、没叫到奖励一样（奖励的是“敢举手”，不是答对）。
// 每天第一次记录得 1 颗勇气种子；一周（周一到周日）有几天举过手，达到周目标（默认 2）这周就算达标。
// 达标的周累计越多，花园里的勇气向日葵越高、花越多。没记录的日子不提示失败，没达标的周也不会让向日葵变小。
import type { HandRaise } from '../data/types'
import { addDays, weekStart } from './taskDay'

export { weekStart }

export const RAISE_GOAL_DEFAULT = 2
export const RAISE_GOAL_CHALLENGE = 3
/** 累计达标几周长到第 1、2、3 级 */
export const SUNFLOWER_LEVELS = [1, 3, 6] as const

/** 这周有几天举过手 */
export function raiseDaysInWeek(raises: HandRaise[], day: string): number {
  const start = weekStart(day)
  const end = addDays(start, 6)
  return new Set(raises.filter((r) => r.date >= start && r.date <= end).map((r) => r.date)).size
}

/** 勇气种子：举过手的天数（每天第一次记录得 1 颗） */
export function courageSeeds(raises: HandRaise[]): number {
  return new Set(raises.map((r) => r.date)).size
}

/** 向日葵几级：0 = 还没长出来 */
export function sunflowerLevel(weeksReached: number): 0 | 1 | 2 | 3 {
  if (weeksReached >= SUNFLOWER_LEVELS[2]) return 3
  if (weeksReached >= SUNFLOWER_LEVELS[1]) return 2
  if (weeksReached >= SUNFLOWER_LEVELS[0]) return 1
  return 0
}

/**
 * 要不要问“挑战每周 3 次”：目标还是 2，这周和上周都达标了；
 * 问过一次以后（不管答“要”还是“先不要”），至少再过两周才再问。
 */
export function shouldAskChallenge(courageWeeks: string[], goal: number, day: string, askedAt?: string): boolean {
  if (goal >= RAISE_GOAL_CHALLENGE) return false
  const thisWeek = weekStart(day)
  const lastWeek = addDays(thisWeek, -7)
  if (!courageWeeks.includes(thisWeek) || !courageWeeks.includes(lastWeek)) return false
  return !askedAt || askedAt <= addDays(thisWeek, -14)
}
