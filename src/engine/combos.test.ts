import { describe, expect, it } from 'vitest'
import type { PlacedItem, PlantInstance } from '../data/types'
import { VISITORS } from '../data/visitors'
import { COMBOS } from '../data/combos'
import { activeCombos, thingsOf } from './combos'
import { nextGoal } from './goals'
import { computeGrants } from './progress'
import { snapshotOf, visitorAnchor } from './visitors'

const plant = (catalogId: string, x: number, y: number, stage: 0 | 1 | 2 | 3 = 3, waterCount = 0): PlantInstance => ({
  id: `${catalogId}@${x},${y}`, childId: 'c', scene: 'outdoor', x, y, catalogId, plantedAt: '', waterCount, stage,
})
const item = (catalogId: string, x: number, y: number): PlacedItem => ({
  id: `${catalogId}@${x},${y}`, childId: 'c', scene: 'outdoor', layer: 'ground', catalogId, x, y, flipped: false,
})
const ids = (plants: PlantInstance[], placed: PlacedItem[]) => activeCombos(thingsOf(plants, placed)).map((a) => a.combo.id)

describe('相邻组合', () => {
  it('蜂箱挨着开花的花（斜角也算）组成甜蜜花田', () => {
    expect(ids([plant('seed-tulip', 4, 4)], [item('out-beehive', 5, 5)])).toEqual(['sweet-field'])
  })

  it('隔一格就不算，没开花也不算', () => {
    expect(ids([plant('seed-tulip', 4, 4)], [item('out-beehive', 6, 4)])).toEqual([])
    expect(ids([plant('seed-tulip', 4, 4, 2)], [item('out-beehive', 5, 4)])).toEqual([])
  })

  it('2×2 的池塘边上任意一格都算挨着', () => {
    expect(ids([plant('seed-rose', 6, 3)], [item('out-pond', 4, 2)])).toEqual(['pond-flowers'])
  })

  it('第一次成立才发，发现过的不再发', () => {
    const base = {
      catalog: [], visitors: [], badges: [], snapshot: snapshotOf([], [], []),
      stats: { allDoneDays: 0, personalBests: 0, harvests: 0, placedCount: 0, taskCounts: {}, plantedNow: 0, indoorPlaced: 0 },
      plants: [plant('seed-carrot', 1, 1, 1)], placed: [item('out-scarecrow', 2, 1)], combos: COMBOS, unlocks: [],
    } as unknown as Parameters<typeof computeGrants>[0]
    expect(computeGrants(base).combos).toEqual(['veggie-guard'])
    expect(computeGrants({ ...base, unlocks: [{ id: 'u', childId: 'c', kind: 'combo', refId: 'veggie-guard', at: '' }] }).combos).toEqual([])
  })
})

describe('访客落脚点', () => {
  it('蜜蜂落在蜂箱旁边，没有蜂箱时落在开花的花旁边', () => {
    const bee = VISITORS.find((v) => v.id === 'bee')!
    const things = thingsOf([plant('seed-daisy', 1, 1)], [item('out-beehive', 8, 5)])
    expect(visitorAnchor(bee, things)?.catalogId).toBe('out-beehive')
    expect(visitorAnchor(bee, thingsOf([plant('seed-daisy', 1, 1)], []))?.catalogId).toBe('seed-daisy')
  })

  it('刺猬没有落脚点，用固定位置', () => {
    const hedgehog = VISITORS.find((v) => v.id === 'hedgehog')!
    expect(visitorAnchor(hedgehog, thingsOf([], [item('out-rock', 1, 1)]))).toBeUndefined()
  })
})

describe('还差一点', () => {
  const goalOf = (plants: PlantInstance[], placed: PlacedItem[], met: string[] = [], found: string[] = []) =>
    nextGoal({
      visitors: VISITORS, combos: COMBOS, snapshot: snapshotOf(plants, placed, []), plants,
      things: thingsOf(plants, placed), metVisitors: new Set(met), foundCombos: new Set(found),
    })

  it('差 1 朵花就提示蝴蝶', () => {
    const g = goalOf([plant('seed-tulip', 1, 1), plant('seed-daisy', 3, 3)], [])
    expect(g?.icon).toBe('🦋')
    expect(g?.text).toContain('再开 1 朵花')
  })

  it('种下的胡萝卜差几次水，就提示小兔还要等几次', () => {
    const met = ['butterfly', 'bird', 'bee', 'ladybug', 'frog', 'squirrel', 'hedgehog']
    const g = goalOf([plant('seed-carrot', 1, 1, 1, 1)], [], met)
    expect(g?.text).toBe('胡萝卜再浇 2 次水，小兔就会来')
  })

  it('两样都有但没挨着，提示挪到一起', () => {
    const met = VISITORS.map((v) => v.id)
    const g = goalOf([plant('seed-rose', 1, 1)], [item('out-beehive', 9, 6)], met)
    expect(g?.text).toBe('把蜂箱挪到开花的花旁边，试试会发生什么')
  })

  it('都来过、都发现过就不提示', () => {
    expect(goalOf([], [], VISITORS.map((v) => v.id), COMBOS.map((c) => c.id))).toBeNull()
  })
})
