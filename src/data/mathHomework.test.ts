import { describe, expect, it } from 'vitest'
import { MATH_HOMEWORK, mathHomeworkFor } from './mathHomework'

describe('数学作业', () => {
  it('只在那一天显示', () => {
    expect(mathHomeworkFor('2026-11-16')?.prompts.map((p) => p.kind)).toEqual(['连加', '连减', '加减混合'])
    expect(mathHomeworkFor('2026-11-17')?.title).toBe('让两个人一样多')
  })
  it('日期不重复，每类问题都有问法和算式', () => {
    expect(new Set(MATH_HOMEWORK.map((h) => h.date)).size).toBe(MATH_HOMEWORK.length)
    for (const h of MATH_HOMEWORK) for (const p of h.prompts) expect(p.ask && p.shape).toBeTruthy()
  })
})
