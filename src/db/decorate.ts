// 装扮：摆放、移动、翻转、收回、墙纸地板、花瓶、卖家具（SPEC 5.4–5.5）
import { db, uid } from './schema'
import type { CatalogItem, PlacedItem } from '../data/types'
import { getCatalogItem } from '../data/catalog'
import { harvestInfo } from '../data/plants'
import { BALANCE } from '../data/balance'
import { toTaskDay } from '../engine/taskDay'
import { buildSceneState, canPlace, footprintOf, slotFor, type Layer, type Scene, type SceneState } from '../engine/placement'
import { addInventory, takeInventory } from './inventory'

/** 读取某个场景当前的占格情况 */
export async function sceneState(childId: string, scene: Scene): Promise<SceneState> {
  const [plots, placed, plants] = await Promise.all([
    db.plots.where('childId').equals(childId).toArray(),
    db.placed.where('childId').equals(childId).toArray(),
    db.plants.where('childId').equals(childId).toArray(),
  ])
  return buildSceneState(scene, plots, placed, plants)
}

const TABLES = () => [db.placed, db.plants, db.plots, db.inventory]

/** 从背包摆放到格子上；室内盆栽种在地板上 */
export async function placeFromInventory(childId: string, catalogId: string, x: number, y: number, now = new Date()): Promise<boolean> {
  const item = getCatalogItem(catalogId)
  const slot = item && slotFor(item)
  if (!item || !slot) return false
  return db.transaction('rw', TABLES(), async () => {
    const s = await sceneState(childId, slot.scene)
    if (!canPlace(footprintOf(item, x, y), slot.scene, slot.layer, s)) return false
    if (!(await takeInventory(childId, catalogId))) return false
    if (item.plant) {
      await db.plants.add({ id: uid(), childId, scene: 'indoor', x, y, catalogId, plantedAt: now.toISOString(), waterCount: 0, stage: 0 })
    } else {
      await db.placed.add({ id: uid(), childId, scene: slot.scene, layer: slot.layer, catalogId, x, y, flipped: false })
    }
    return true
  })
}

/** 移动已摆放的物品或室内盆栽 */
export async function moveTo(childId: string, id: string, x: number, y: number): Promise<boolean> {
  return db.transaction('rw', TABLES(), async () => {
    const placed = await db.placed.get(id)
    const plant = placed ? undefined : await db.plants.get(id)
    const catalogId = placed?.catalogId ?? plant?.catalogId
    const item = catalogId ? getCatalogItem(catalogId) : undefined
    if (!item) return false
    const scene: Scene = placed?.scene ?? 'indoor'
    const layer: Layer = placed?.layer ?? 'ground'
    if (plant && plant.scene !== 'indoor') return false
    const s = await sceneState(childId, scene)
    if (!canPlace(footprintOf(item, x, y), scene, layer, s, id)) return false
    if (placed) await db.placed.update(id, { x, y })
    else await db.plants.update(id, { x, y })
    return true
  })
}

export async function flip(id: string) {
  const p = await db.placed.get(id)
  if (p) await db.placed.update(id, { flipped: !p.flipped })
}

/** 收回背包；花瓶里的花也一起收回 */
export async function storeBack(id: string) {
  await db.transaction('rw', [db.placed, db.inventory], async () => {
    const p = await db.placed.get(id)
    if (!p) return
    await db.placed.delete(id)
    await addInventory(p.childId, p.catalogId, 1)
    if (p.content) await addInventory(p.childId, p.content, 1)
  })
}

/** 把鲜花插进花瓶；原来的花放回背包 */
export async function putInVase(vaseId: string, harvestId: string): Promise<boolean> {
  const info = harvestInfo(harvestId)
  if (info?.kind !== 'flower') return false
  return db.transaction('rw', [db.placed, db.inventory], async () => {
    const vase = await db.placed.get(vaseId)
    if (!vase || vase.catalogId !== 'in-vase') return false
    if (!(await takeInventory(vase.childId, harvestId))) return false
    if (vase.content) await addInventory(vase.childId, vase.content, 1)
    await db.placed.update(vaseId, { content: harvestId } satisfies Partial<PlacedItem>)
    return true
  })
}

/** 换墙纸或地板（买过的或初始的才能用） */
export async function applyStyle(childId: string, styleId: string): Promise<boolean> {
  const item = getCatalogItem(styleId)
  if (!item || (item.kind !== 'wallStyle' && item.kind !== 'floorStyle')) return false
  if (!item.starter) {
    const owned = await db.inventory.where({ childId, catalogId: styleId }).first()
    if (!owned) return false
  }
  await db.children.update(childId, item.kind === 'wallStyle' ? { wallStyle: styleId } : { floorStyle: styleId })
  return true
}

export function sellPriceOf(item: CatalogItem): number {
  return Math.floor(item.price * BALANCE.sellRatio)
}

/** 家具和装饰半价卖回（背包里的） */
export async function sellItem(childId: string, catalogId: string, now = new Date()): Promise<boolean> {
  const item = getCatalogItem(catalogId)
  if (!item || item.starter || item.plant || item.price <= 0) return false
  if (item.kind === 'wallStyle' || item.kind === 'floorStyle') return false
  return db.transaction('rw', [db.inventory, db.ledger], async () => {
    if (!(await takeInventory(childId, catalogId))) return false
    const amount = sellPriceOf(item)
    if (amount > 0) {
      await db.ledger.add({ id: uid(), childId, at: now.toISOString(), date: toTaskDay(now), currency: 'coin', amount, reason: 'sell', refId: catalogId })
    }
    return true
  })
}
