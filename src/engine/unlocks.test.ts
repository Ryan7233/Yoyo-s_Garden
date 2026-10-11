import { describe, expect, it } from 'vitest'
import { UNLOCKS } from '../data/unlocks'
import { VISITORS } from '../data/visitors'
import { isUnlocked, ruleProgress, type ProgressStats } from './unlocks'
import { presentVisitors, type GardenSnapshot } from './visitors'

const stats: ProgressStats = { allDoneDays: 6, taskCounts: { 'english-reading': 20, 'chinese-reading': 10, 'drink-water': 19 }, personalBests: 5, harvests: 0, placedCount: 0 }

describe('解锁', () => {
  it('按累计数判定', () => {
    expect(isUnlocked(UNLOCKS['rainbow-flower'], stats)).toBe(false)
    expect(isUnlocked(UNLOCKS['rainbow-flower'], { ...stats, allDoneDays: 7 })).toBe(true)
    expect(ruleProgress(UNLOCKS['book-flower'], stats)).toBe(30)
    expect(isUnlocked(UNLOCKS['book-flower'], stats)).toBe(true)
    expect(isUnlocked(UNLOCKS['crystal-lotus'], stats)).toBe(false)
    expect(isUnlocked(UNLOCKS['star-tree'], stats)).toBe(true)
    expect(isUnlocked(undefined, stats)).toBe(true)
  })
})

describe('访客', () => {
  const empty: GardenSnapshot = { placedItemIds: [], outdoorDecorCount: 0, maturePlantIds: [], bloomingFlowers: 0, veggieHarvests: 0 }
  const ids = (g: GardenSnapshot) => presentVisitors(VISITORS, g).map((v) => v.id)
  it('空花园没有访客', () => expect(ids(empty)).toEqual([]))
  it('成熟向日葵吸引小鸟', () => expect(ids({ ...empty, maturePlantIds: ['seed-sunflower'], bloomingFlowers: 1 })).toEqual(['bird']))
  it('3 株开花吸引蝴蝶', () => expect(ids({ ...empty, bloomingFlowers: 3 })).toContain('butterfly'))
  it('蜂箱需要同时有开花的花', () => {
    expect(ids({ ...empty, placedItemIds: ['out-beehive'] })).not.toContain('bee')
    expect(ids({ ...empty, placedItemIds: ['out-beehive'], bloomingFlowers: 1 })).toContain('bee')
  })
  it('条件不满足时离开', () => {
    expect(ids({ ...empty, placedItemIds: ['in-sofa'] })).toEqual(['cat'])
    expect(ids(empty)).not.toContain('cat')
  })
})
