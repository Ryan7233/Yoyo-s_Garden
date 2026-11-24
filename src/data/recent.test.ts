import { describe, expect, it } from 'vitest'
import { recentDates } from './recent'
import { datedTaskNoteFor, taskNoteFor } from './taskNotes'
import { dictationSay } from '../features/spelling/SpellingSheet'

describe('回看前几天', () => {
  const items = [{ date: '2026-11-16' }, { date: '2026-11-18' }, { date: '2026-11-24' }, { date: '2026-11-25' }, { date: '2026-11-18' }]
  it('只要最近 7 天（含今天）、不要以后的，新的在前、不重复', () => {
    expect(recentDates(items, '2026-11-24')).toEqual(['2026-11-24', '2026-11-18'])
    expect(recentDates(items, '2026-11-23')).toEqual(['2026-11-18'])
    expect(recentDates(items, '2026-12-05')).toEqual([])
  })
})

describe('老师当天的作业', () => {
  it('每日中文阅读的常驻计时卡不算当天作业', () => {
    expect(taskNoteFor('chinese-reading', '2026-11-24')).toBeDefined()
    expect(datedTaskNoteFor('chinese-reading', '2026-11-24')).toBeUndefined()
    expect(datedTaskNoteFor('writing', '2026-11-17')?.title).toBe('课后字词，准备听写')
  })
})

describe('纸笔默写读法', () => {
  it('有例句：词 → 句子 → 词；没有就只读词', () => {
    expect(dictationSay({ word: 'am', sentence: 'I am Yoyo.' })).toBe('am. I am Yoyo. am.')
    expect(dictationSay({ word: 'cat' })).toBe('cat')
  })
})
