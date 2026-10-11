import type { TaskDef } from '../data/types'
import { weekdayOf } from './taskDay'

export function isScheduledOn(task: TaskDef, day: string): boolean {
  if (!task.enabled) return false
  if (task.schedule.kind === 'daily') return true
  return task.schedule.days.includes(weekdayOf(day))
}

export interface DayTasks {
  required: TaskDef[]
  more: TaskDef[]
}

/** 按频率生成当日任务，分“必做”和“更多任务” */
export function tasksForDay(tasks: TaskDef[], day: string): DayTasks {
  const today = tasks.filter((t) => isScheduledOn(t, day)).sort((a, b) => a.order - b.order)
  return {
    required: today.filter((t) => t.required),
    more: today.filter((t) => !t.required),
  }
}

/** 必做数量是否超过上限（只提示，不拦截） */
export function exceedsRequiredCap(tasks: TaskDef[], cap: number): boolean {
  return tasks.filter((t) => t.enabled && t.required).length > cap
}
