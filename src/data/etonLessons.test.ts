import { describe, expect, it } from 'vitest'
import { lessonFor } from './etonLessons'

describe('伊顿英语课', () => {
  it('只在课程那一天显示，前一天和第二天都没有', () => {
    expect(lessonFor('2026-11-03')?.title).toContain('11 月 3 日')
    expect(lessonFor('2026-11-02')).toBeUndefined()
    expect(lessonFor('2026-11-04')).toBeUndefined()
  })
})
