import { describe, expect, it } from 'vitest'
import { puLessonFor } from './puLessons'

describe('美森 PU 课', () => {
  it('11/24 当天复习 L6 故事，11/25 上课前再回顾，别的日子没有', () => {
    expect(puLessonFor('2026-11-24')?.cards.map((c) => c.kind)).toEqual(['read', 'talk'])
    expect(puLessonFor('2026-11-25')?.cards.map((c) => c.kind)).toEqual(['review', 'read', 'talk'])
    expect(puLessonFor('2026-11-23')).toBeUndefined()
    expect(puLessonFor('2026-11-26')).toBeUndefined()
  })
  it('故事 5 段，和课件一样', () => {
    const story = puLessonFor('2026-11-24')!.cards[0]
    expect(story.kind === 'read' && story.sections.length).toBe(5)
  })
})
