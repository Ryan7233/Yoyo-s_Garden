import { describe, expect, it } from 'vitest'
import type { SpellResult, SpellWord } from '../data/types'
import { classifySpellWord, baselineAdvice } from '../data/spelling'
import { applySpellResult, newSpellWord, requeueWord, spellQueue, toSchoolDay, weekQuizWords, SPELL_DONE_STEP } from './spelling'

// 2026-10-19 是周一
const MON = '2026-10-19'
const TUE = '2026-10-20'
const THU = '2026-10-22'
const FRI = '2026-10-23'
const SAT = '2026-10-24'
const NEXT_MON = '2026-10-26'

function word(w: string, today: string, extra: Partial<SpellWord> = {}): SpellWord {
  return { ...newSpellWord({ id: w, childId: 'c', word: w, kind: 'phonics', addedAt: `${today}T10:00:00Z` }, today), ...extra }
}
const ok = (w: string, kind: SpellResult['kind'] = 'review'): SpellResult => ({ word: w, kind, firstTry: true, done: true, attempts: 1 })
const wrong = (w: string, kind: SpellResult['kind'] = 'review'): SpellResult => ({ word: w, kind, firstTry: false, done: true, attempts: 2 })

describe('拼写分级', () => {
  it('高频词、规律词、认识就行', () => {
    expect(classifySpellWord('said')).toBe('sight')
    expect(classifySpellWord('The')).toBe('sight')
    for (const w of ['sunny', 'hot', 'jump', 'cat', 'ship', 'rain']) expect(classifySpellWord(w)).toBe('phonics')
    for (const w of ['wobbly', 'adventure', 'beautiful']) expect(classifySpellWord(w)).toBe('other')
  })
  it('摸底建议', () => {
    expect(baselineAdvice(9)).toMatch(/直接/)
    expect(baselineAdvice(6)).toMatch(/规律/)
    expect(baselineAdvice(3)).toMatch(/补/)
  })
})

describe('复习排期：第 1 天学，第 2、4、7 天听写，周末顺延', () => {
  it('周末加的词从周一开始学', () => {
    expect(toSchoolDay(SAT)).toBe(NEXT_MON)
    expect(word('hot', SAT)).toMatchObject({ startDay: NEXT_MON, due: NEXT_MON, step: 0 })
  })

  it('周一学的词：周二、周四、下周一复习，之后学完', () => {
    let w = word('hot', MON)
    w = applySpellResult(w, ok('hot', 'new'), MON)
    expect(w).toMatchObject({ step: 1, due: TUE })
    w = applySpellResult(w, ok('hot'), TUE)
    expect(w).toMatchObject({ step: 2, due: THU })
    w = applySpellResult(w, ok('hot'), THU)
    // 第 7 天是周日，顺延到周一
    expect(w).toMatchObject({ step: 3, due: NEXT_MON })
    w = applySpellResult(w, ok('hot'), NEXT_MON)
    expect(w.step).toBe(SPELL_DONE_STEP)
  })

  it('周五学的词：第 2 天是周六，顺延到周一', () => {
    const w = applySpellResult(word('jump', FRI), ok('jump', 'new'), FRI)
    expect(w).toMatchObject({ step: 1, due: NEXT_MON })
  })

  it('复习写错：明天再复习这一次，不扣分不倒退', () => {
    const w = applySpellResult(word('hot', MON, { step: 2, due: THU }), wrong('hot'), THU)
    expect(w).toMatchObject({ step: 2, due: FRI })
  })

  it('跳过或没写的词不变；新词写了两次还没写对，明天再学', () => {
    const w = word('hot', MON)
    expect(applySpellResult(w, undefined, MON)).toBe(w)
    const skipped = applySpellResult(w, { word: 'hot', kind: 'new', firstTry: false, done: false, attempts: 2 }, MON)
    expect(skipped).toMatchObject({ step: 0, due: TUE })
  })

  it('今天的词：先新词再复习，最多 12 个', () => {
    const words = [
      ...Array.from({ length: 13 }, (_, i) => word(`r${String.fromCharCode(97 + i)}`, MON, { step: 1, due: TUE })),
      word('new', TUE),
      word('later', TUE, { step: 2, due: THU }),
    ]
    const q = spellQueue(words, TUE)
    expect(q.fresh.map((w) => w.word)).toEqual(['new'])
    expect(q.review).toHaveLength(11)
    expect(q.review.some((w) => w.word === 'later')).toBe(false)
  })
})

describe('周末小听写', () => {
  it('本周开始学的词都在；写错的放回下周当新词', () => {
    const words = [
      word('hot', MON, { step: 2, due: THU }),
      word('old', '2026-10-12', { step: 3, due: NEXT_MON }),
      word('notyet', FRI),
    ]
    expect(weekQuizWords(words, SAT).map((w) => w.word)).toEqual(['hot'])
    expect(requeueWord(words[0], SAT)).toMatchObject({ startDay: NEXT_MON, step: 0, due: NEXT_MON, misses: 1 })
  })
})
