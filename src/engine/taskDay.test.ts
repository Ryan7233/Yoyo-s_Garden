import { describe, expect, it } from 'vitest'
import { addDays, diffDays, editableDays, isEditable, toTaskDay, weekdayOf } from './taskDay'

describe('任务日与日界线', () => {
  it('23:59 属于当天，00:00 属于第二天', () => {
    expect(toTaskDay(new Date(2026, 9, 11, 23, 59, 59))).toBe('2026-10-11')
    expect(toTaskDay(new Date(2026, 9, 12, 0, 0, 0))).toBe('2026-10-12')
  })
  it('跨月跨年加减天数', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01')
    expect(addDays('2027-01-01', -1)).toBe('2026-12-31')
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29')
  })
  it('星期计算（0 = 周日）', () => {
    expect(weekdayOf('2026-10-11')).toBe(0)
    expect(weekdayOf('2026-10-12')).toBe(1)
  })
  it('补录窗口：今天和前 2 天可编辑', () => {
    expect(isEditable('2026-10-11', '2026-10-11', 2)).toBe(true)
    expect(isEditable('2026-10-09', '2026-10-11', 2)).toBe(true)
    expect(isEditable('2026-10-08', '2026-10-11', 2)).toBe(false)
    expect(isEditable('2026-10-12', '2026-10-11', 2)).toBe(false)
    expect(editableDays('2026-10-11', 2)).toEqual(['2026-10-11', '2026-10-10', '2026-10-09'])
    expect(diffDays('2026-10-11', '2026-10-01')).toBe(10)
  })
})
