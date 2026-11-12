// 花园里的“东西”和相邻组合：两样东西挨着放（上下左右和斜角都算）就组成一个组合。
// 组合只是让摆放有讲究：挨着时闪光，第一次发现进图鉴、送一点金币，不改浇水和收获。
import type { PlacedItem, PlantInstance } from '../data/types'
import { getCatalogItem } from '../data/catalog'
import { COMBOS, type ComboDef, type ThingMatcher } from '../data/combos'

/** 室外地面上的一样东西：摆放的装饰，或种下的植物（池塘里的莲花占整个池塘） */
export interface Thing {
  id: string
  kind: 'placed' | 'plant'
  catalogId: string
  x: number
  y: number
  w: number
  h: number
  mature: boolean
}

export function thingsOf(plants: PlantInstance[], placed: PlacedItem[]): Thing[] {
  const items: Thing[] = placed
    .filter((p) => p.scene === 'outdoor' && p.layer === 'ground')
    .map((p) => {
      const [w, h] = getCatalogItem(p.catalogId)?.size ?? [1, 1]
      return { id: p.id, kind: 'placed', catalogId: p.catalogId, x: p.x, y: p.y, w, h, mature: true }
    })
  const grown: Thing[] = plants
    .filter((p) => p.scene === 'outdoor')
    .map((p) => ({ id: p.id, kind: 'plant', catalogId: p.catalogId, x: p.x, y: p.y, w: p.pondId ? 2 : 1, h: p.pondId ? 2 : 1, mature: p.stage === 3 }))
  return [...items, ...grown]
}

/** 挨着：两块矩形之间最多隔 0 格（边贴边或角贴角） */
export function touching(a: Thing, b: Thing): boolean {
  if (a.id === b.id) return false
  return a.x <= b.x + b.w && b.x <= a.x + a.w && a.y <= b.y + b.h && b.y <= a.y + a.h
}

export function matches(m: ThingMatcher, t: Thing): boolean {
  if (!m.ids.includes(t.catalogId)) return false
  return !m.mature || t.mature
}

export interface ActiveCombo {
  combo: ComboDef
  /** 组成这个组合的东西（可能不止一对） */
  thingIds: string[]
}

/** 现在花园里成立的组合 */
export function activeCombos(things: Thing[], combos: ComboDef[] = COMBOS): ActiveCombo[] {
  const out: ActiveCombo[] = []
  for (const combo of combos) {
    const ids = new Set<string>()
    for (const a of things) {
      if (!matches(combo.a, a)) continue
      for (const b of things) {
        if (matches(combo.b, b) && touching(a, b)) {
          ids.add(a.id)
          ids.add(b.id)
        }
      }
    }
    if (ids.size) out.push({ combo, thingIds: [...ids] })
  }
  return out
}

/** 花园里有没有某一类东西（给“还差一点”提示用） */
export function hasThing(things: Thing[], m: ThingMatcher): boolean {
  return things.some((t) => matches(m, t))
}
