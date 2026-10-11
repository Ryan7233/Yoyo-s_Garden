import { describe, expect, it } from 'vitest'
import { CATALOG, getCatalogItem } from '../data/catalog'
import { VISITORS } from '../data/visitors'
import { BADGES } from '../data/badges'
import type { LedgerEntry, PlacedItem, PlantInstance, Unlock } from '../data/types'
import { computeGrants, itemUnlocked, type GrantInput } from './progress'
import { presentVisitors, snapshotOf, veggieHarvestCount } from './visitors'
import { canWish, wishProgress } from './wish'

const plant = (catalogId: string, stage: 0 | 1 | 2 | 3, scene: 'outdoor' | 'indoor' = 'outdoor'): PlantInstance => ({
  id: `${catalogId}-${Math.random()}`, childId: 'c', scene, x: 0, y: 0, catalogId, plantedAt: '', waterCount: 0, stage,
})
const item = (catalogId: string, scene: 'outdoor' | 'indoor' = 'outdoor'): PlacedItem => ({
  id: catalogId, childId: 'c', scene, layer: 'ground', catalogId, x: 0, y: 0, flipped: false,
})
const harvest = (refId: string): LedgerEntry => ({ id: refId, childId: 'c', at: '', currency: 'coin', amount: 8, reason: 'harvest', refId })
const unlock = (kind: Unlock['kind'], refId: string): Unlock => ({ id: refId, childId: 'c', kind, refId, at: '' })

describe('访客判定快照', () => {
  it('开花的花只算室外成熟的花，特殊花也算', () => {
    const s = snapshotOf(
      [plant('seed-sunflower', 3), plant('seed-rose', 3), plant('seed-rainbow-flower', 3), plant('seed-tulip', 2), plant('seed-carrot', 3), plant('seed-star-tree', 3)],
      [], [],
    )
    expect(s.bloomingFlowers).toBe(3)
    expect(presentVisitors(VISITORS, s).map((v) => v.id)).toEqual(['butterfly', 'bird', 'rabbit'])
  })
  it('条件不再满足时访客离开', () => {
    expect(presentVisitors(VISITORS, snapshotOf([plant('seed-carrot', 2)], [], [])).map((v) => v.id)).toEqual([])
  })
  it('瓢虫看累计收获蔬果，花不算', () => {
    const entries = [...Array(4)].map(() => harvest('seed-carrot')).concat(harvest('seed-sunflower'), harvest('seed-apple-tree'))
    expect(veggieHarvestCount(entries)).toBe(5)
    expect(presentVisitors(VISITORS, snapshotOf([], [], entries)).map((v) => v.id)).toEqual(['ladybug'])
  })
  it('小猫在室内：有沙发或地毯；刺猬要 10 件户外装饰', () => {
    expect(presentVisitors(VISITORS, snapshotOf([], [item('in-rug', 'indoor')], [])).map((v) => v.id)).toEqual(['cat'])
    const decor = [...Array(10)].map((_, i) => ({ ...item('out-rock'), id: `r${i}` }))
    expect(presentVisitors(VISITORS, snapshotOf([], decor, [])).map((v) => v.id)).toEqual(['hedgehog'])
  })
})

describe('解锁、访客、徽章发放', () => {
  const base: GrantInput = {
    catalog: CATALOG,
    visitors: VISITORS,
    badges: BADGES,
    stats: { allDoneDays: 0, taskCounts: {}, personalBests: 0, harvests: 0, placedCount: 0, plantedNow: 0, indoorPlaced: 0 },
    snapshot: snapshotOf([], [], []),
    plants: [],
    unlocks: [],
  }

  it('什么都没做时什么都不发', () => {
    expect(computeGrants(base)).toEqual({ items: [], visitors: [], codex: [], badges: [] })
  })

  it('累计全勤 7 天解锁彩虹花，并得到“第一颗星”徽章', () => {
    const g = computeGrants({ ...base, stats: { ...base.stats, allDoneDays: 7 } })
    expect(g.items).toEqual(['seed-rainbow-flower'])
    expect(g.badges).toEqual(['first-all-done'])
  })

  it('全勤 30 天解锁金色秋千；已经解锁过的不重复发', () => {
    const stats = { ...base.stats, allDoneDays: 30 }
    expect(computeGrants({ ...base, stats }).items).toEqual(['seed-rainbow-flower', 'out-golden-swing'])
    const g = computeGrants({ ...base, stats, unlocks: [unlock('item', 'seed-rainbow-flower'), unlock('badge', 'first-all-done')] })
    expect(g.items).toEqual(['out-golden-swing'])
    expect(g.badges).toEqual([])
  })

  it('访客第一次来访才发，同一次里算进“第一位客人”徽章', () => {
    const snapshot = snapshotOf([plant('seed-carrot', 3)], [], [])
    const plants = [plant('seed-carrot', 3)]
    const g = computeGrants({ ...base, snapshot, plants })
    expect(g.visitors).toEqual(['rabbit'])
    expect(g.badges).toEqual(['first-visitor'])
    expect(g.codex).toEqual(['seed-carrot'])
    expect(computeGrants({ ...base, snapshot, plants, unlocks: [unlock('visitor', 'rabbit'), unlock('badge', 'first-visitor'), unlock('codex', 'seed-carrot')] }))
      .toEqual({ items: [], visitors: [], codex: [], badges: [] })
  })

  it('成熟就点亮图鉴（观赏树、室内盆栽也能点亮），没成熟不算', () => {
    const g = computeGrants({ ...base, plants: [plant('seed-pine-tree', 3), plant('seed-cactus', 3, 'indoor'), plant('seed-daisy', 2)] })
    expect(g.codex).toEqual(['seed-pine-tree', 'seed-cactus'])
  })

  it('集齐 10 种植物、种满 6 块地、温暖小屋、纪录挑战者', () => {
    const codex = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'].map((id) => unlock('codex', id))
    const g = computeGrants({
      ...base,
      stats: { ...base.stats, plantedNow: 6, indoorPlaced: 10, personalBests: 1, harvests: 1 },
      plants: [plant('seed-daisy', 3)],
      unlocks: codex,
    })
    expect(g.badges.sort()).toEqual(['cozy-house', 'first-harvest', 'first-record', 'full-six', 'ten-plants'])
  })

  it('解锁过的物品即使条件后来不满足也保持解锁', () => {
    const swing = getCatalogItem('out-golden-swing')!
    expect(itemUnlocked(swing, base.stats, [])).toBe(false)
    expect(itemUnlocked(swing, base.stats, [unlock('item', 'out-golden-swing')])).toBe(true)
    expect(itemUnlocked(getCatalogItem('seed-daisy')!, null, [])).toBe(true)
  })
})

describe('心愿单', () => {
  it('进度条和“还差”', () => {
    expect(wishProgress(300, 120)).toEqual({ saved: 120, price: 300, ratio: 0.4, ready: false, short: 180 })
    expect(wishProgress(300, 350)).toMatchObject({ saved: 300, ratio: 1, ready: true, short: 0 })
  })
  it('免费的特殊装饰和初始物品不能许愿', () => {
    expect(canWish(getCatalogItem('out-fountain')!)).toBe(true)
    expect(canWish(getCatalogItem('out-golden-swing')!)).toBe(false)
    expect(canWish(getCatalogItem('in-bed')!)).toBe(false)
  })
})
