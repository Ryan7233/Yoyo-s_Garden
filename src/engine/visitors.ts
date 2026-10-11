import type { VisitorCondition, VisitorDef } from '../data/visitors'

export interface GardenSnapshot {
  /** 已摆放的物品 catalogId（室内外） */
  placedItemIds: string[]
  /** 户外装饰件数 */
  outdoorDecorCount: number
  /** 成熟植物的 catalogId */
  maturePlantIds: string[]
  /** 正在开花（成熟）的花的数量 */
  bloomingFlowers: number
  veggieHarvests: number
}

export function meets(c: VisitorCondition, g: GardenSnapshot): boolean {
  switch (c.kind) {
    case 'bloomingFlowers':
      return g.bloomingFlowers >= c.count
    case 'hasItem':
      return c.itemIds.some((id) => g.placedItemIds.includes(id))
    case 'maturePlant':
      return c.plantIds.some((id) => g.maturePlantIds.includes(id))
    case 'veggieHarvests':
      return g.veggieHarvests >= c.count
    case 'outdoorDecorCount':
      return g.outdoorDecorCount >= c.count
    case 'all':
      return c.conditions.every((x) => meets(x, g))
    case 'any':
      return c.conditions.some((x) => meets(x, g))
  }
}

/** 条件满足时出现，不满足时离开 */
export function presentVisitors(visitors: VisitorDef[], g: GardenSnapshot): VisitorDef[] {
  return visitors.filter((v) => meets(v.condition, g))
}
