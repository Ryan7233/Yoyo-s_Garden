import { describe, expect, it } from 'vitest'
import type { PlacedItem, PlantInstance, Plot } from '../data/types'
import { getCatalogItem } from '../data/catalog'
import { ORCHARD_RECT, expandCandidates, inRect, moveTreesToOrchard, plantRect } from './plots'
import { buildSceneState, canPlace, footprintOf } from './placement'
import { stroll } from '../features/garden/woodland/stroll'

// 一个真实花园在果园出现之前（2026-11-08）的户外布局：4 × 4 菜畦、右边一排池塘喷泉大树，三棵树还种在菜畦里
const childId = 'c'
const plots: Plot[] = [3, 4, 5, 6].flatMap((x) => [2, 3, 4, 5].map((y) => ({ childId, x, y, kind: 'soil' as const })))
const P = (catalogId: string, x: number, y: number, stage: 0 | 1 | 2 | 3, waterCount: number, more: Partial<PlantInstance> = {}): PlantInstance => ({
  id: `${catalogId}@${x},${y}`, childId, scene: 'outdoor', x, y, catalogId, stage, waterCount, plantedAt: '2026-10-01T00:00:00.000Z', ...more,
})
const before: PlantInstance[] = [
  P('seed-peach-tree', 5, 4, 3, 21, { lastHarvestWater: 19 }),
  P('seed-cherry-tree', 6, 2, 0, 2),
  P('seed-lotus', 10, 4, 3, 14, { pondId: 'pond', lastHarvestWater: 12 }),
  P('seed-corn', 3, 5, 1, 3),
  P('seed-rose', 3, 3, 3, 19, { lastHarvestWater: 18 }),
  P('seed-apple-tree', 4, 3, 1, 5),
  P('seed-carrot', 5, 3, 1, 1),
  P('seed-rose', 4, 4, 3, 15, { lastHarvestWater: 15 }),
]
const placed: PlacedItem[] = (
  [
    ['out-fountain', 8, 3], ['out-big-tree', 10, 2], ['out-pond', 10, 4], ['out-beehive', 8, 1], ['out-street-lamp', 11, 0], ['out-birdhouse', 9, 0],
    ['out-big-tree', 5, 0], ['out-bench', 7, 5], ['out-arch', 6, 0], ['out-scarecrow', 3, 6], ['out-fence', 11, 2],
  ] as const
).map(([catalogId, x, y]) => ({ id: catalogId === 'out-pond' ? 'pond' : `${catalogId}@${x}`, childId, scene: 'outdoor', layer: 'ground', catalogId, x, y, flipped: false }))

describe('老花园搬进有果园的新版本', () => {
  const after = moveTreesToOrchard(before)
  const at = (id: string) => after.find((p) => p.catalogId === id)!

  it('三棵树搬进果园的前三个树坑，长到哪儿、摘到哪儿都不变；花、菜和池塘里的莲花原地不动', () => {
    expect(at('seed-peach-tree')).toMatchObject({ x: 12, y: 0, stage: 3, waterCount: 21, lastHarvestWater: 19 })
    expect(at('seed-cherry-tree')).toMatchObject({ x: 14, y: 0, stage: 0, waterCount: 2 })
    expect(at('seed-apple-tree')).toMatchObject({ x: 12, y: 2, stage: 1, waterCount: 5 })
    for (const p of before.filter((q) => !q.catalogId.endsWith('-tree'))) expect(after).toContain(p)
    expect(moveTreesToOrchard(after)).toEqual(after) // 再跑一遍不会再搬
  })

  it('她摆好的东西没有一样落在果园里，原位置在新规则下照样合法', () => {
    const state = buildSceneState('outdoor', plots, placed, after)
    for (const p of placed) {
      const fp = footprintOf(getCatalogItem(p.catalogId)!, p.x, p.y)
      expect(fp.x + fp.w, p.catalogId).toBeLessThanOrEqual(ORCHARD_RECT.x)
      expect(canPlace(fp, 'outdoor', 'ground', state, p.id), p.catalogId).toBe(true)
    }
  })

  it('搬走树以后空出三块菜畦可以种花；树在果园里占 2 × 2；菜畦还能往外扩，但扩不进果园', () => {
    const taken = new Set(after.filter((p) => !p.pondId).map((p) => `${p.x},${p.y}`))
    expect(plots.filter((b) => !taken.has(`${b.x},${b.y}`))).toHaveLength(16 - 4)
    expect(plantRect(at('seed-peach-tree'))).toMatchObject({ w: 2, h: 2 })
    const sized = placed.map((p) => ({ ...p, w: getCatalogItem(p.catalogId)!.size[0], h: getCatalogItem(p.catalogId)!.size[1] }))
    const more = expandCandidates(plots, sized)
    expect(more.length).toBeGreaterThan(0)
    expect(more.some((c) => inRect(c.x, c.y, ORCHARD_RECT))).toBe(false)
  })

  it('团团在这座花园里找得到路散步', () => {
    expect(stroll(plots, placed, []).length).toBeGreaterThan(8)
  })
})
