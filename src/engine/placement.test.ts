import { describe, expect, it } from 'vitest'
import type { PlacedItem } from '../data/types'
import { getCatalogItem } from '../data/catalog'
import { canPlace, slotFor, type Footprint, type SceneState } from './placement'
import { starterPlots } from './plots'

const fp = (x: number, y: number, w = 1, h = 1, tile = false): Footprint => ({ x, y, w, h, tile })
const placed = (id: string, x: number, y: number, w = 1, h = 1, tile = false, layer: 'ground' | 'wall' = 'ground') =>
  ({ id, childId: 'c', scene: 'outdoor', layer, catalogId: 'x', x, y, flipped: false, footprint: fp(x, y, w, h, tile) }) as PlacedItem & { footprint: Footprint }

describe('摆放规则', () => {
  const outdoor: SceneState = { plots: starterPlots('c'), placed: [placed('tree', 9, 5)], plants: [] }

  it('物品放到正确的场景和层', () => {
    expect(slotFor(getCatalogItem('out-bench')!)).toEqual({ scene: 'outdoor', layer: 'ground' })
    expect(slotFor(getCatalogItem('in-sofa')!)).toEqual({ scene: 'indoor', layer: 'ground' })
    expect(slotFor(getCatalogItem('in-clock')!)).toEqual({ scene: 'indoor', layer: 'wall' })
    expect(slotFor(getCatalogItem('seed-cactus')!)).toEqual({ scene: 'indoor', layer: 'ground' })
    expect(slotFor(getCatalogItem('seed-sunflower')!)).toBeNull()
    expect(slotFor(getCatalogItem('out-golden-swing')!)).toEqual({ scene: 'outdoor', layer: 'ground' })
  })

  it('户外装饰放在草地上可以，压到地块、小屋、出界不行', () => {
    expect(canPlace(fp(8, 2), 'outdoor', 'ground', outdoor)).toBe(true)
    expect(canPlace(fp(3, 4), 'outdoor', 'ground', outdoor)).toBe(false)
    expect(canPlace(fp(2, 3, 2, 2), 'outdoor', 'ground', outdoor)).toBe(false) // 2×2 压到 (3,4) 的地块
    expect(canPlace(fp(2, 2), 'outdoor', 'ground', outdoor)).toBe(false) // 小屋
    expect(canPlace(fp(11, 7, 2, 1), 'outdoor', 'ground', outdoor)).toBe(false) // 出界
  })

  it('物品之间不能重叠；移动时忽略自己', () => {
    expect(canPlace(fp(8, 5, 2, 1), 'outdoor', 'ground', outdoor)).toBe(false)
    expect(canPlace(fp(9, 5), 'outdoor', 'ground', outdoor, 'tree')).toBe(true)
  })

  it('小路上可以放装饰，小路之间不能重叠', () => {
    const s: SceneState = { ...outdoor, placed: [placed('path', 8, 2, 1, 1, true)] }
    expect(canPlace(fp(8, 2), 'outdoor', 'ground', s)).toBe(true)
    expect(canPlace(fp(8, 2, 1, 1, true), 'outdoor', 'ground', s)).toBe(false)
  })

  it('室内：地板 8×5，墙面 8 格，盆栽占格', () => {
    const indoor: SceneState = {
      plots: [],
      placed: [placed('bed', 0, 3, 2, 1), placed('clock', 2, 0, 1, 1, false, 'wall')],
      plants: [{ id: 'cactus', childId: 'c', scene: 'indoor', x: 5, y: 1, catalogId: 'seed-cactus', plantedAt: '', waterCount: 0, stage: 0 }],
    }
    expect(canPlace(fp(1, 3), 'indoor', 'ground', indoor)).toBe(false)
    expect(canPlace(fp(7, 4, 2, 1), 'indoor', 'ground', indoor)).toBe(false)
    expect(canPlace(fp(5, 1), 'indoor', 'ground', indoor)).toBe(false)
    expect(canPlace(fp(5, 1, 2, 2, true), 'indoor', 'ground', indoor)).toBe(true) // 地毯可以垫在盆栽下面
    expect(canPlace(fp(2, 0), 'indoor', 'wall', indoor)).toBe(false)
    expect(canPlace(fp(3, 0), 'indoor', 'wall', indoor)).toBe(true)
    expect(canPlace(fp(3, 1), 'indoor', 'wall', indoor)).toBe(false)
  })
})
