// 向日葵举手：记录、勇气种子、周目标
import { db, uid } from './schema'
import type { HandRaise, RaiseResult } from '../data/types'
import { RAISE_HAND_TASK_ID } from '../data/tasks'
import {
  RAISE_GOAL_DEFAULT, raiseDaysInWeek, shouldAskChallenge, sunflowerLevel, weekStart,
} from '../engine/courage'
import { childReportTask } from './actions'

export interface RaiseOutcome {
  /** 今天第一次记录：得 1 颗勇气种子 */
  seed: boolean
  /** 这周举手几天 / 周目标 */
  weekDays: number
  goal: number
  /** 这次记录让这周刚好达标 */
  reachedNow: boolean
  /** 向日葵长高了（达标后从 a 级变成 b 级） */
  grew: { from: number; to: number } | null
  /** 该问“要不要挑战每周 3 次”了 */
  askChallenge: boolean
}

/** 孩子记一次举手。每次都保存；每天第一次时打卡、给种子、检查这周是否达标 */
export function recordRaise(childId: string, result: RaiseResult, today: string, now = new Date()): Promise<RaiseOutcome> {
  return db.transaction('rw', [db.handRaises, db.settings, db.tasks, db.taskRecords, db.ledger, db.dayPlans], async () => {
    const before = await db.handRaises.where('childId').equals(childId).toArray()
    const seed = !before.some((r) => r.date === today)
    const raise: HandRaise = { id: uid(), childId, date: today, result, at: now.toISOString() }
    await db.handRaises.add(raise)
    // 和其他任务一样留一条打卡记录（孩子自报，不发金币）；今天的任务没安排或被关掉时不打卡，只记举手
    const task = await db.tasks.get(RAISE_HAND_TASK_ID)
    if (seed && task?.enabled) await childReportTask(childId, RAISE_HAND_TASK_ID, today, now)

    const s = await db.settings.get('settings')
    const goal = s?.raiseGoal ?? RAISE_GOAL_DEFAULT
    const weeks = s?.courageWeeks ?? []
    const weekDays = raiseDaysInWeek([...before, raise], today)
    const thisWeek = weekStart(today)
    const reachedNow = seed && weekDays >= goal && !weeks.includes(thisWeek)
    const nextWeeks = reachedNow ? [...weeks, thisWeek] : weeks
    if (reachedNow) await db.settings.update('settings', { courageWeeks: nextWeeks })
    const from = sunflowerLevel(weeks.length)
    const to = sunflowerLevel(nextWeeks.length)
    return {
      seed,
      weekDays,
      goal,
      reachedNow,
      grew: to > from ? { from, to } : null,
      askChallenge: reachedNow && shouldAskChallenge(nextWeeks, goal, today, s?.raiseChallengeAt),
    }
  })
}

/** 孩子回答“要不要挑战每周 3 次”：选“要”才提高；答过就记下，至少两周后才再问 */
export async function answerChallenge(accept: boolean, today: string) {
  const patch: { raiseChallengeAt: string; raiseGoal?: number } = { raiseChallengeAt: weekStart(today) }
  if (accept) patch.raiseGoal = 3
  await db.settings.update('settings', patch)
}

/** 改周目标（孩子随时可以改回 2） */
export async function setRaiseGoal(goal: number) {
  await db.settings.update('settings', { raiseGoal: goal })
}
