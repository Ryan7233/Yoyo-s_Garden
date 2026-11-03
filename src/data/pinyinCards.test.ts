import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { PINYIN_CARDS, formatReadTime, pinyinCardFor } from './pinyinCards'

describe('每日拼读卡片', () => {
  it('只在卡片那一天弹出', () => {
    expect(pinyinCardFor('2026-11-03')?.title).toContain('ao ou iu')
    expect(pinyinCardFor('2026-11-04')).toBeUndefined()
  })

  it('每张卡片的图都在 public 里，日期不重复', () => {
    for (const c of PINYIN_CARDS) expect(existsSync(`public/${c.image}`), c.image).toBe(true)
    expect(new Set(PINYIN_CARDS.map((c) => c.date)).size).toBe(PINYIN_CARDS.length)
  })

  it('用时写成“几分几秒”', () => {
    expect(formatReadTime(65)).toBe('1分05秒')
    expect(formatReadTime(48)).toBe('48秒')
  })
})
