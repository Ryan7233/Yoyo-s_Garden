import type { CatalogItem } from './types'
import { SEEDS, SPECIAL_SEEDS } from './plants'
import { OUTDOOR, OUTDOOR_SPECIAL } from './outdoor'
import { INDOOR, STYLES } from './indoor'

export const CATALOG: CatalogItem[] = [...SEEDS, ...SPECIAL_SEEDS, ...OUTDOOR, ...OUTDOOR_SPECIAL, ...INDOOR, ...STYLES]

const BY_ID = new Map(CATALOG.map((c) => [c.id, c]))

export function getCatalogItem(id: string): CatalogItem | undefined {
  return BY_ID.get(id)
}
