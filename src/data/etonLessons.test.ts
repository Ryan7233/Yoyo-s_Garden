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
    expect(lessonFor('2026-11-08')?.cards.map((c) => c.kind)).toEqual(['compare', 'talk', 'book', 'word', 'talk', 'word', 'word', 'talk', 'review'])
    expect(lessonFor('2026-11-08')?.cards.flatMap((c) => c.kind === 'word' ? [c.word] : [])).toEqual(['that', 'is', 'not'])
    expect(lessonFor('2026-11-09')?.cards[0].kind).toBe('talk')
    expect(lessonFor('2026-11-10')).toBeUndefined()
  })
})

describe('Unit 2 Our Land and Water（11/12–11/15）', () => {
  const kinds = (d: string) => lessonFor(d)?.cards.map((c) => c.kind)

  it('四天各有自己的课，11/11 和 11/16 没有', () => {
    expect(lessonFor('2026-11-11')).toBeUndefined()
    expect(kinds('2026-11-12')).toEqual(['vocab', 'talk', 'read', 'read', 'talk'])
    expect(kinds('2026-11-13')).toEqual(['pick', 'vocab', 'sort', 'paper'])
    expect(kinds('2026-11-14')).toEqual(['paper', 'paper', 'paper', 'read', 'review'])
    expect(kinds('2026-11-15')).toEqual(['talk', 'read', 'read'])
    expect(lessonFor('2026-11-16')).toBeUndefined()
  })

  it('周五自己做：勾选题答案是 cat dog bird frog；分类 6 个陆地、3 个水', () => {
    const cards = lessonFor('2026-11-13')!.cards
    const pick = cards.find((c) => c.kind === 'pick')
    const sort = cards.find((c) => c.kind === 'sort')
    expect(pick?.kind === 'pick' && pick.answers).toEqual(['cat', 'dog', 'bird', 'frog'])
    expect(sort?.kind === 'sort' && sort.words.filter((w) => w.group === 'water').map((w) => w.word)).toEqual(['ocean', 'lake', 'river'])
  })

  it('简化版故事：周六读第 1–2 段，周日读第 3–5 段，每段 6 句、3 个 Words to Know', () => {
    const story = (d: string) => lessonFor(d)!.cards.find((c) => c.kind === 'read' && c.title === 'Room on the Broom')
    const sat = story('2026-11-14'), sun = story('2026-11-15')
    expect(sat?.kind === 'read' && sat.sections.map((s) => s.label)).toEqual(['01 Meet the travellers', '02 Lost and found'])
    expect(sun?.kind === 'read' && sun.sections.map((s) => s.label?.slice(0, 2))).toEqual(['03', '04', '05'])
    for (const s of sun?.kind === 'read' ? sun.sections : []) {
      expect(s.lines).toHaveLength(6)
      expect(s.words).toHaveLength(3)
    }
  })
})

describe('Unit 3 We Are Friends（11/17–11/22）', () => {
  const words = (d: string) => lessonFor(d)?.cards.flatMap((c) => (c.kind === 'word' ? [c.word] : []))

  it('周二到周五每天两个新词，周六课文、周日复习，11/23 没有', () => {
    expect(words('2026-11-17')).toEqual(['I', 'am'])
    expect(words('2026-11-18')).toEqual(['you', 'are'])
    expect(words('2026-11-19')).toEqual(['we', 'they'])
    expect(words('2026-11-20')).toEqual(['he', 'she'])
    expect(lessonFor('2026-11-21')?.cards[0]).toMatchObject({ kind: 'read', title: 'We Are Friends' })
    expect(lessonFor('2026-11-22')?.cards.map((c) => c.kind)).toContain('match')
    expect(lessonFor('2026-11-23')).toBeUndefined()
  })

  it('配对游戏：I am，you / we / they are，he / she is；句子都以“代词 + 答案”开头', () => {
    const game = lessonFor('2026-11-22')!.cards.find((c) => c.kind === 'match')
    if (game?.kind !== 'match') throw new Error('no game')
    expect(Object.fromEntries(game.items.map((i) => [i.who, i.answer]))).toEqual({ I: 'am', You: 'are', We: 'are', They: 'are', He: 'is', She: 'is' })
    for (const i of game.items) for (const s of i.sentences) expect(s.startsWith(`${i.who} ${i.answer} `)).toBe(true)
  })

  it('每张海报的图片都在 public/eton 里', async () => {
    const { existsSync } = await import('node:fs')
    const posters = ['2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20', '2026-11-22'].flatMap((d) => lessonFor(d)!.cards.filter((c) => c.kind === 'poster'))
    expect(posters).toHaveLength(5)
    for (const p of posters) expect(p.kind === 'poster' && existsSync(`public/${p.image}`)).toBe(true)
  })
})

describe('Room on the Broom 复述作业（11/24–11/28）', () => {
  const kinds = (d: string) => lessonFor(d)?.cards.map((c) => c.kind)
  it('周二到周六每天一点，周日休息', () => {
    expect(kinds('2026-11-24')).toEqual(['talk', 'read', 'talk'])
    expect(kinds('2026-11-25')).toEqual(['read', 'talk'])
    expect(kinds('2026-11-26')).toEqual(['read', 'review', 'talk'])
    expect(kinds('2026-11-27')).toEqual(['talk', 'read'])
    expect(kinds('2026-11-28')).toEqual(['talk', 'read'])
    expect(lessonFor('2026-11-29')).toBeUndefined()
  })
  it('老师的词不进拼词（标签里没有 Dictation / Spelling）', () => {
    const r = lessonFor('2026-11-26')!.cards.find((c) => c.kind === 'review')
    expect(r && /dictation|spelling/i.test(r.tag)).toBe(false)
  })
})
