import { describe, expect, it } from 'vitest'
import { lessonFor } from './etonLessons'

describe('伊顿英语课', () => {
  it('只在课程那一天显示，前一天和第二天都没有', () => {
    expect(lessonFor('2026-11-03')?.title).toContain('11 月 3 日')
    expect(lessonFor('2026-11-02')).toBeUndefined()
    expect(lessonFor('2026-11-04')?.title).toContain('11 月 4 日')
  })

  it('周三是 me、Power Verbs 和小书，不再是周二的 look / at / 季节', () => {
    const kinds = lessonFor('2026-11-04')?.cards.map((c) => c.kind === 'word' ? c.word : c.kind)
    expect(kinds).toEqual(['me', 'verbs', 'book'])
  })

  it('这周每天都有自己的课，11/9 以后没有', () => {
    const firstWord = (d: string) => lessonFor(d)?.cards.flatMap((c) => c.kind === 'word' ? [c.word] : [])[0]
    expect(firstWord('2026-11-05')).toBe('who')
    expect(firstWord('2026-11-06')).toBe('this')
    expect(firstWord('2026-11-07')).toBe('that')
    expect(lessonFor('2026-11-08')?.cards[0].kind).toBe('review')
    expect(lessonFor('2026-11-09')?.cards[0].kind).toBe('talk')
    expect(lessonFor('2026-11-10')).toBeUndefined()
  })
})
