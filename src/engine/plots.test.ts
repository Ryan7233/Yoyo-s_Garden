import { describe, expect, it } from 'vitest'
import { expandCandidates, isOccupied, starterPlots } from './plots'
import { BALANCE } from '../data/balance'

describe('扩建地块', () => {
  const plots = starterPlots('c1')
  it('初始 6 块地的四周都可以扩建', () => {
    const c = expandCandidates(plots, [])
    // 2 × 3 的地块四周共 10 格
    expect(c).toHaveLength(10)
    expect(c).toContainEqual({ x: 2, y: 4 })
    expect(c).toContainEqual({ x: 4, y: 3 })
  })
  it('被装饰占用的格子不能扩建', () => {
    const placed = [{ id: 'a', childId: 'c1', scene: 'outdoor' as const, layer: 'ground' as const, catalogId: 'out-rock', x: 2, y: 4, flipped: false }]
    expect(isOccupied(2, 4, plots, placed)).toBe(true)
    expect(expandCandidates(plots, placed)).not.toContainEqual({ x: 2, y: 4 })
  })
  it('小屋占的格子不能扩建', () => {
    expect(isOccupied(1, 1, [], [])).toBe(true)
    const plots2 = [{ childId: 'c1', x: 3, y: 1, kind: 'soil' as const }]
    expect(expandCandidates(plots2, [])).not.toContainEqual({ x: 2, y: 1 })
  })
  it('达到上限后不能再扩建', () => {
    const many = Array.from({ length: BALANCE.maxPlots }, (_, i) => ({ childId: 'c1', x: 3 + (i % 8), y: 4 + Math.floor(i / 8), kind: 'soil' as const }))
    expect(expandCandidates(many, [])).toEqual([])
  })
})
