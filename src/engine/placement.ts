// 摆放规则与占格校验（SPEC 5.5）
import type { CatalogItem, PlacedItem, PlantInstance, Plot } from '../data/types'
import { BALANCE } from '../data/balance'
import { HOUSE_RECT, type Rect } from './plots'
import { getCatalogItem } from '../data/catalog'
import { TILE_IDS } from '../data/indoor'

export type Scene = 'outdoor' | 'indoor'
export type Layer = 'ground' | 'wall'

export interface Footprint extends Rect {
  /** 图块（小路、地毯）：其他物品可以叠放在上面，图块之间不能重叠 */
  tile: boolean
}

export interface SceneState {
  plots: Plot[]
  /** 本场景已摆放的物品及其占格 */
  placed: (PlacedItem & { footprint: Footprint })[]
  plants: PlantInstance[]
}

/** 物品放到哪个场景、哪一层；不能摆放的返回 null */
export function slotFor(item: CatalogItem): { scene: Scene; layer: Layer } | null {
  if (item.kind === 'outdoor') return { scene: 'outdoor', layer: 'ground' }
  if (item.kind === 'special' && !item.plant) return { scene: 'outdoor', layer: 'ground' }
  if (item.kind === 'indoor') return { scene: 'indoor', layer: 'ground' }
  if (item.kind === 'wall') return { scene: 'indoor', layer: 'wall' }
  if (item.plant?.needs === 'indoor') return { scene: 'indoor', layer: 'ground' }
  return null
}

export function gridSize(scene: Scene, layer: Layer): { w: number; h: number } {
  if (scene === 'outdoor') return { w: BALANCE.gridWidth, h: BALANCE.gridHeight }
  if (layer === 'wall') return { w: BALANCE.wallSlots, h: 1 }
  return { w: BALANCE.indoorWidth, h: BALANCE.indoorHeight }
}

export function overlaps(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h
}

/**
 * 能不能把一个占格放到 (x, y)。
 * ignoreId：移动已摆放的物品时，忽略它自己。
 */
export function canPlace(
  fp: Footprint,
  scene: Scene,
  layer: Layer,
  s: SceneState,
  ignoreId?: string,
): boolean {
  const g = gridSize(scene, layer)
  if (fp.x < 0 || fp.y < 0 || fp.x + fp.w > g.w || fp.y + fp.h > g.h) return false

  for (const p of s.placed) {
    if (p.id === ignoreId || p.layer !== layer) continue
    // 图块和普通物品可以叠放
    if (p.footprint.tile !== fp.tile) continue
    if (overlaps(fp, p.footprint)) return false
  }
  if (layer === 'wall') return true

  // 植物占格（室外植物在地块上，已经被地块挡住）
  if (!fp.tile) {
    for (const pl of s.plants) {
      if (pl.id === ignoreId) continue
      if (overlaps(fp, { x: pl.x, y: pl.y, w: 1, h: 1 })) return false
    }
  }
  if (scene === 'outdoor') {
    // 户外装饰只能放在草地或小路：不能压小屋和地块
    if (overlaps(fp, HOUSE_RECT)) return false
    if (s.plots.some((p) => overlaps(fp, { x: p.x, y: p.y, w: 1, h: 1 }))) return false
  }
  return true
}

export function footprintOf(item: CatalogItem, x: number, y: number): Footprint {
  return { x, y, w: item.size[0], h: item.size[1], tile: TILE_IDS.has(item.id) }
}

/** 从全部数据里取出某个场景的占格情况 */
export function buildSceneState(scene: Scene, plots: Plot[], placed: PlacedItem[], plants: PlantInstance[]): SceneState {
  return {
    plots: scene === 'outdoor' ? plots : [],
    plants: plants.filter((p) => p.scene === scene),
    placed: placed.flatMap((p) => {
      if (p.scene !== scene) return []
      const item = getCatalogItem(p.catalogId)
      return item ? [{ ...p, footprint: footprintOf(item, p.x, p.y) }] : []
    }),
  }
}
