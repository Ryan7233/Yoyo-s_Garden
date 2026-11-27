import { describe, expect, it } from 'vitest'
import { recitesFor } from './reciteTexts'
import { pinyinCardFor } from './pinyinCards'
import { mathHomeworkFor } from './mathHomework'
import { datedTaskNoteFor } from './taskNotes'

describe('11/24 作业', () => {
  it('《江南》11/23 读熟，11/24 起背诵到下周一', () => {
    expect(recitesFor('2026-11-23').map((t) => [t.title, t.kind ?? 'recite'])).toEqual([['江南', 'read']])
    expect(recitesFor('2026-11-24').map((t) => [t.title, t.kind ?? 'recite'])).toEqual([['江南', 'recite']])
    expect(recitesFor('2026-11-30').map((t) => t.title)).toEqual(['江南', '雨点儿'])
    expect(recitesFor('2026-12-01').map((t) => t.title)).toEqual(['雨点儿'])
    expect(recitesFor('2026-12-05')).toHaveLength(0)
  })
  it('看图写拼音周二到周五每天一部分，正好 81 个词，下周一复默', () => {
    const n = ['2026-11-24', '2026-11-25', '2026-11-26', '2026-11-27'].map((d) => pinyinCardFor(d)?.answers?.length)
    expect(n).toEqual([9, 29, 26, 17])
    expect(pinyinCardFor('2026-11-23')?.answers).toHaveLength(72)
  })
  it('数学加法表三种看法；写字上是江南听写', () => {
    expect(mathHomeworkFor('2026-11-24')?.prompts.map((p) => p.kind)).toEqual(['横着看', '竖着看', '斜着看'])
    expect(datedTaskNoteFor('writing', '2026-11-24')?.title).toBe('《江南》听写')
  })
})

describe('11/27 作业', () => {
  it('《雨点儿》读三遍，带课后词语；《江南》还在背', () => {
    const t = recitesFor('2026-11-27')
    expect(t.map((x) => [x.title, x.kind ?? 'recite'])).toEqual([['江南', 'recite'], ['雨点儿', 'read']])
    const y = t[1]
    expect(y.goal).toBe(3)
    expect(y.paragraphs.flat().join('')).toContain('从云彩里落下来')
    expect(y.paragraphs.flat().join('')).toContain('开出了红的花，长出了绿的草')
    expect(y.words?.length).toBe(3)
  })
  it('数学口算卡、周日整理书包提醒校服', () => {
    expect(mathHomeworkFor('2026-11-27')?.title).toBe('口算练习')
    expect(datedTaskNoteFor('pack-bag', '2026-11-29')?.title).toContain('秋季校服')
  })
})
