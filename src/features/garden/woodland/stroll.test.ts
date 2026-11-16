import { describe, expect, it } from 'vitest'
import { stroll } from './stroll'
import { starterPlots, HOUSE_RECT, ORCHARD_RECT, inRect } from '../../../engine/plots'
import type { PlantInstance } from '../../../data/types'

const plots = starterPlots('c')
const plant = (x: number, y: number): PlantInstance => ({
  id: 'p', childId: 'c', scene: 'outdoor', x, y, catalogId: 'seed-tulip', plantedAt: '2026-11-01T00:00:00.000Z', waterCount: 1, stage: 1,
})

describe('团团在花园里散步', () => {
  it('只走草地：不穿过小屋、菜畦、果园和家具，每一步只挪一格，走一圈回到原地', () => {
    const bench = { id: 'b', childId: 'c', scene: 'outdoor' as const, layer: 'ground' as const, catalogId: 'out-bench', x: 6, y: 1, flipped: false }
    const stops = stroll(plots, [bench], [])
    expect(stops.length).toBeGreaterThan(8)
    for (const s of stops) {
      const x = Math.floor(s.x), y = Math.floor(s.z)
      expect(inRect(x, y, HOUSE_RECT) || inRect(x, y, ORCHARD_RECT)).toBe(false)
      expect(plots.some((p) => p.x === x && p.y === y)).toBe(false)
      expect(y === 1 && (x === 6 || x === 7)).toBe(false)
    }
    stops.forEach((s, i) => {
      const n = stops[(i + 1) % stops.length]
      expect(Math.abs(n.x - s.x) + Math.abs(n.z - s.z)).toBe(1)
    })
  })
  it('有口渴的植物时，会在它旁边站很久', () => {
    const stops = stroll(plots, [], [plant(3, 4)])
    const wait = stops.find((s) => s.stay === 5)!
    expect(Math.abs(wait.x - 3.5) + Math.abs(wait.z - 4.5)).toBe(1)
  })
})
