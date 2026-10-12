// 按日期保存的任务配置（SPEC 7.1）：过去的日子按当天的配置计算全勤和统计，
// 之后改任务不会改变过去。今天始终用当前配置。
import type { DayPlan, TaskDef } from '../data/types'
import { tasksForDay, type DayTasks } from './schedule'
import { addDays, diffDays } from './taskDay'

/** 某一天安排的任务 */
export type PlanOf = (day: string) => DayTasks

/** 用当前配置冻结某一天 */
export function freezePlan(tasks: TaskDef[], childId: string, day: string): DayPlan {
  const { required, more } = tasksForDay(tasks, day)
  return { childId, date: day, required: required.map((t) => t.id), more: more.map((t) => t.id) }
}

/** 只看当前配置（今天，或没有快照的日子） */
export function livePlan(tasks: TaskDef[]): PlanOf {
  return (day) => tasksForDay(tasks, day)
}

/** 有快照的日子用快照，没有的用当前配置 */
export function planResolver(tasks: TaskDef[], plans: DayPlan[]): PlanOf {
  const byId = new Map(tasks.map((t) => [t.id, t]))
  const byDay = new Map(plans.map((p) => [p.date, p]))
  const pick = (ids: string[]) => ids.flatMap((id) => byId.get(id) ?? [])
  return (day) => {
    const p = byDay.get(day)
    return p ? { required: pick(p.required), more: pick(p.more) } : tasksForDay(tasks, day)
  }
}

/** 需要冻结的日子：从 firstDay 到 today 的前一天，跳过已有快照的 */
export function daysToFreeze(firstDay: string, today: string, existing: Set<string>): string[] {
  const out: string[] = []
  for (let d = firstDay; diffDays(today, d) > 0; d = addDays(d, 1)) if (!existing.has(d)) out.push(d)
  return out
}
