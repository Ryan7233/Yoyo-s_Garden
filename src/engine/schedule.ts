import type { TaskDef } from '../data/types'
import { weekdayOf } from './taskDay'

export function isScheduledOn(task: TaskDef, day: string): boolean {
  if (!task.enabled) return false
  // 每周一次的任务这一周每天都显示，做过以后任务牌显示“这周已完成”
  if (task.schedule.kind === 'daily' || task.schedule.kind === 'weekly') return true
  return task.schedule.days.includes(weekdayOf(day))
}

export interface DayTasks {
  required: TaskDef[]
  more: TaskDef[]
}

/** 每周一次的任务不属于某一天，不能算当天必做 */
export function isWeekly(task: Pick<TaskDef, 'schedule'>): boolean {
  return task.schedule.kind === 'weekly'
}

/** 按频率生成当日任务，分“必做”和“更多任务” */
export function tasksForDay(tasks: TaskDef[], day: string): DayTasks {
  const today = tasks.filter((t) => isScheduledOn(t, day)).sort((a, b) => a.order - b.order)
  return {
    required: today.filter((t) => t.required && !isWeekly(t)),
    more: today.filter((t) => !t.required || isWeekly(t)),
  }
}

/** 必做数量是否超过上限（只提示，不拦截） */
export function exceedsRequiredCap(tasks: TaskDef[], cap: number): boolean {
  return tasks.filter((t) => t.enabled && t.required && !isWeekly(t)).length > cap
}
