import { describe, expect, it } from 'vitest'
import { defaultTasks } from '../data/tasks'
import { exceedsRequiredCap, tasksForDay } from './schedule'

const tasks = defaultTasks('c1')

describe('按频率生成当日任务', () => {
  it('上学日（周一）必做 5 项', () => {
    const { required, more } = tasksForDay(tasks, '2026-10-12')
    expect(required.map((t) => t.id)).toEqual(['start-on-time', 'homework', 'english-speaking', 'english-reading', 'drink-water'])
    expect(more.some((t) => t.id === 'toilet-break')).toBe(true)
    expect(more.some((t) => t.id === 'pack-bag')).toBe(true)
  })
  it('周六没有作业和口语课，也不用整理书包', () => {
    const { required, more } = tasksForDay(tasks, '2026-10-17')
    expect(required.map((t) => t.id)).toEqual(['start-on-time', 'english-reading', 'drink-water'])
    expect(more.some((t) => t.id === 'toilet-break')).toBe(false)
    expect(more.some((t) => t.id === 'pack-bag')).toBe(false)
  })
  it('周日要整理书包', () => {
    expect(tasksForDay(tasks, '2026-10-11').more.some((t) => t.id === 'pack-bag')).toBe(true)
  })
  it('停用的任务不出现', () => {
    const t2 = tasks.map((t) => (t.id === 'homework' ? { ...t, enabled: false } : t))
    expect(tasksForDay(t2, '2026-10-12').required.some((t) => t.id === 'homework')).toBe(false)
  })
  it('必做上限提示', () => {
    expect(exceedsRequiredCap(tasks, 6)).toBe(false)
    expect(exceedsRequiredCap(tasks.map((t) => ({ ...t, required: true })), 6)).toBe(true)
  })
})
