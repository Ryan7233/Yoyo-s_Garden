import type { VisitorCondition, VisitorDef } from '../data/visitors'
import type { LedgerEntry, PlacedItem, PlantInstance } from '../data/types'
import { FLOWER_IDS, FRUIT_TREE_IDS, SPECIAL_SEEDS, VEGGIE_IDS } from '../data/plants'

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

const FLOWERS = new Set([...FLOWER_IDS, ...SPECIAL_SEEDS.filter((s) => s.id !== 'seed-star-tree').map((s) => s.id)])
const PRODUCE = new Set([...VEGGIE_IDS, ...FRUIT_TREE_IDS])

/** 累计收获蔬果次数（瓢虫） */
export function veggieHarvestCount(entries: LedgerEntry[]): number {
  return entries.filter((e) => e.reason === 'harvest' && PRODUCE.has(e.refId ?? '')).length
}

/** 从花园现状算出访客判定用的快照 */
export function snapshotOf(plants: PlantInstance[], placed: PlacedItem[], entries: LedgerEntry[]): GardenSnapshot {
  const mature = plants.filter((p) => p.stage === 3)
  return {
    placedItemIds: placed.map((p) => p.catalogId),
    outdoorDecorCount: placed.filter((p) => p.scene === 'outdoor').length,
    maturePlantIds: mature.map((p) => p.catalogId),
    bloomingFlowers: mature.filter((p) => p.scene === 'outdoor' && FLOWERS.has(p.catalogId)).length,
    veggieHarvests: veggieHarvestCount(entries),
  }
}
