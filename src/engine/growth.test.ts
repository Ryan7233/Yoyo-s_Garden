import { describe, expect, it } from 'vitest'
import type { PlantInstance } from '../data/types'
import { SEEDS } from '../data/plants'
import { canHarvest, canWater, harvest, isThirsty, stageFor, water } from './growth'

const spec = (id: string) => SEEDS.find((s) => s.id === id)!.plant!
const plant = (catalogId: string, extra: Partial<PlantInstance> = {}): PlantInstance => ({
  id: 'p1', childId: 'c1', scene: 'outdoor', x: 0, y: 0, catalogId, plantedAt: '2026-10-01T10:00:00.000Z', waterCount: 0, stage: 0, ...extra,
})

describe('生长', () => {
  it('阶段平均分配：6 次的植物每 2 次升一阶', () => {
    const rose = spec('seed-rose')
    expect([0, 1, 2, 3, 4, 5, 6].map((w) => stageFor(w, rose))).toEqual([0, 0, 1, 1, 2, 2, 3])
  })
  it('3 次的植物每次升一阶', () => {
    expect([0, 1, 2, 3].map((w) => stageFor(w, spec('seed-sunflower')))).toEqual([0, 1, 2, 3])
  })
  it('每株每天最多浇一次', () => {
    const s = spec('seed-sunflower')
    const p1 = water(plant('seed-sunflower'), '2026-10-01', s)
    expect(p1.waterCount).toBe(1)
    expect(canWater(p1, '2026-10-01', s)).toBe(false)
    expect(water(p1, '2026-10-01', s)).toBe(p1)
    expect(water(p1, '2026-10-02', s).waterCount).toBe(2)
  })
  it('连续 3 天没浇水口渴，但不会枯死；浇水后恢复', () => {
    const s = spec('seed-tulip')
    const p = plant('seed-tulip', { waterCount: 1, stage: 0, lastWateredDate: '2026-10-01' })
    expect(isThirsty(p, '2026-10-03', s)).toBe(false)
    expect(isThirsty(p, '2026-10-04', s)).toBe(true)
    expect(isThirsty(p, '2026-10-30', s)).toBe(true)
    const p2 = water(p, '2026-10-30', s)
    expect(isThirsty(p2, '2026-10-30', s)).toBe(false)
    expect(p2.waterCount).toBe(2)
  })
  it('一次性植物成熟后收获，地块变空', () => {
    const s = spec('seed-strawberry')
    const p = plant('seed-strawberry', { waterCount: 3, stage: 3 })
    expect(canHarvest(p, s)).toBe(true)
    expect(canWater(p, '2026-10-05', s)).toBe(false)
    expect(isThirsty(p, '2026-10-30', s)).toBe(false)
    expect(harvest(p, s)).toBeNull()
  })
  it('多年生植物成熟后保留，之后每 3 次再产出', () => {
    const s = spec('seed-rose')
    let p = plant('seed-rose', { waterCount: 6, stage: 3 })
    expect(canHarvest(p, s)).toBe(true)
    p = harvest(p, s)!
    expect(canHarvest(p, s)).toBe(false)
    expect(canWater(p, '2026-10-10', s)).toBe(true)
    p = water(p, '2026-10-10', s)
    p = water(p, '2026-10-11', s)
    expect(canHarvest(p, s)).toBe(false)
    p = water(p, '2026-10-12', s)
    expect(canHarvest(p, s)).toBe(true)
    expect(canWater(p, '2026-10-13', s)).toBe(false)
  })
  it('纯观赏树成熟后不再需要浇水', () => {
    const s = spec('seed-pine-tree')
    const p = plant('seed-pine-tree', { waterCount: 8, stage: 3 })
    expect(canWater(p, '2026-10-20', s)).toBe(false)
    expect(canHarvest(p, s)).toBe(false)
    expect(isThirsty(p, '2026-11-20', s)).toBe(false)
  })
})
