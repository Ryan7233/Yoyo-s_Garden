// 花园操作：购买、种植、浇水、收获、出售、扩建（SPEC 5.2–5.4）
import { db, uid } from './schema'
import { addInventory, takeInventory } from './inventory'
import type { LedgerEntry, PlantInstance } from '../data/types'
import { getCatalogItem } from '../data/catalog'
import { harvestInfo, plantableInPond, POND_ID } from '../data/plants'
import { BALANCE } from '../data/balance'
import { balanceOf } from '../engine/ledger'
import { canHarvest, canWater, harvest, water } from '../engine/growth'
import { expandCandidates } from '../engine/plots'
import { type ProgressStats } from '../engine/unlocks'
import { itemUnlocked } from '../engine/progress'
import { dayProgress, latestRecordByTask } from '../engine/rewards'
import { toTaskDay } from '../engine/taskDay'

async function ledger(childId: string) {
  return db.ledger.where('childId').equals(childId).toArray()
}

async function addLedger(childId: string, e: Omit<LedgerEntry, 'id' | 'childId' | 'at' | 'date'>, now: Date) {
  await db.ledger.add({ ...e, id: uid(), childId, at: now.toISOString(), date: toTaskDay(now) })
}

/** 解锁和访客用的累计数据 */
export async function progressStats(childId: string): Promise<ProgressStats> {
  const [tasks, records, exRecords, entries, placed] = await Promise.all([
    db.tasks.where('childId').equals(childId).toArray(),
    db.taskRecords.where('childId').equals(childId).toArray(),
    db.exerciseRecords.where('childId').equals(childId).toArray(),
    ledger(childId),
    db.placed.where('childId').equals(childId).toArray(),
  ])
  const days = new Set(records.map((r) => r.date))
  let allDoneDays = 0
  for (const d of days) if (dayProgress(tasks, records, d).allDone) allDoneDays++
  // 每个任务每天只算一次，以当天最新一条记录为准
  const taskCounts: Record<string, number> = {}
  for (const d of days) {
    for (const r of latestRecordByTask(records, d).values()) {
      if (r.status === 'done') taskCounts[r.taskId] = (taskCounts[r.taskId] ?? 0) + 1
    }
  }
  return {
    allDoneDays,
    taskCounts,
    personalBests: exRecords.filter((r) => r.isPersonalBest && r.status === 'done').length,
    harvests: entries.filter((e) => e.reason === 'harvest').length,
    placedCount: placed.filter((p) => p.scene === 'outdoor').length,
  }
}

export type BuyResult = { ok: true; wishDone: boolean } | { ok: false; reason: 'coins' | 'locked' | 'unknown' | 'owned' }

export async function buyItem(childId: string, catalogId: string, now = new Date()): Promise<BuyResult> {
  const item = getCatalogItem(catalogId)
  // 免费的特殊装饰只能靠解锁获得
  if (!item || item.starter || item.price <= 0) return { ok: false, reason: 'unknown' }
  const unlocks = await db.unlocks.where('childId').equals(childId).toArray()
  if (!itemUnlocked(item, item.unlock ? await progressStats(childId) : null, unlocks)) return { ok: false, reason: 'locked' }
  return db.transaction('rw', [db.ledger, db.inventory, db.wishes], async () => {
    if (balanceOf(await ledger(childId)).coin < item.price) return { ok: false, reason: 'coins' } as const
    // 墙纸地板买一次就够了
    if ((item.kind === 'wallStyle' || item.kind === 'floorStyle') && (await db.inventory.where({ childId, catalogId }).count())) {
      return { ok: false, reason: 'owned' } as const
    }
    await addLedger(childId, { currency: 'coin', amount: -item.price, reason: 'purchase', refId: catalogId }, now)
    await addInventory(childId, catalogId, 1)
    // 买到心愿物品：心愿单清空，等她挑下一件
    const wish = await db.wishes.get(childId)
    const wishDone = wish?.catalogId === catalogId
    if (wishDone) await db.wishes.delete(childId)
    return { ok: true, wishDone } as const
  })
}

export async function plantSeed(childId: string, catalogId: string, x: number, y: number, now = new Date()): Promise<boolean> {
  const item = getCatalogItem(catalogId)
  if (!item?.plant || item.plant.needs !== 'soil') return false
  return db.transaction('rw', [db.inventory, db.plants, db.plots], async () => {
    const plot = await db.plots.get([childId, x, y])
    if (plot?.kind !== 'soil') return false
    const taken = await db.plants.where('childId').equals(childId).filter((p) => p.scene === 'outdoor' && p.x === x && p.y === y).count()
    if (taken) return false
    if (!(await takeInventory(childId, catalogId))) return false
    await db.plants.add({ id: uid(), childId, scene: 'outdoor', x, y, catalogId, plantedAt: now.toISOString(), waterCount: 0, stage: 0 })
    return true
  })
}

/** 在摆好的池塘里种莲花或水晶莲：一个池塘种一株 */
export async function plantInPond(childId: string, catalogId: string, pondId: string, now = new Date()): Promise<boolean> {
  const item = getCatalogItem(catalogId)
  if (!item || !plantableInPond(item)) return false
  return db.transaction('rw', [db.inventory, db.plants, db.placed], async () => {
    const pond = await db.placed.get(pondId)
    if (!pond || pond.childId !== childId || pond.catalogId !== POND_ID) return false
    const taken = await db.plants.where('childId').equals(childId).filter((p) => p.pondId === pondId).count()
    if (taken) return false
    if (!(await takeInventory(childId, catalogId))) return false
    await db.plants.add({ id: uid(), childId, scene: 'outdoor', x: pond.x, y: pond.y, pondId, catalogId, plantedAt: now.toISOString(), waterCount: 0, stage: 0 })
    return true
  })
}

export type WaterResult = { ok: true; plant: PlantInstance; stageUp: boolean } | { ok: false; reason: 'drops' | 'done' }

export async function waterPlant(plantId: string, now = new Date()): Promise<WaterResult> {
  return db.transaction('rw', [db.plants, db.ledger], async () => {
    const p = await db.plants.get(plantId)
    const spec = p && getCatalogItem(p.catalogId)?.plant
    const today = toTaskDay(now)
    if (!p || !spec || !canWater(p, today, spec)) return { ok: false, reason: 'done' } as const
    if (balanceOf(await ledger(p.childId)).drop < 1) return { ok: false, reason: 'drops' } as const
    const next = water(p, today, spec)
    await db.plants.put(next)
    await addLedger(p.childId, { currency: 'drop', amount: -1, reason: 'water', refId: p.id }, now)
    return { ok: true, plant: next, stageUp: next.stage !== p.stage } as const
  })
}

export interface HarvestResult { coins: number; harvestId?: string; firstTime: boolean }

export async function harvestPlant(plantId: string, now = new Date()): Promise<HarvestResult | null> {
  return db.transaction('rw', [db.plants, db.ledger, db.inventory, db.unlocks], async () => {
    const p = await db.plants.get(plantId)
    const item = p && getCatalogItem(p.catalogId)
    const spec = item?.plant
    if (!p || !spec || !canHarvest(p, spec)) return null
    const next = harvest(p, spec)
    if (next) await db.plants.put(next)
    else await db.plants.delete(p.id)
    if (spec.harvestCoins > 0) {
      await addLedger(p.childId, { currency: 'coin', amount: spec.harvestCoins, reason: 'harvest', refId: p.catalogId }, now)
    }
    if (spec.harvestItem) await addInventory(p.childId, spec.harvestItem, 1)
    // 第一次收获点亮图鉴
    const seen = await db.unlocks.where({ childId: p.childId, kind: 'codex', refId: p.catalogId }).count()
    if (!seen) await db.unlocks.add({ id: uid(), childId: p.childId, kind: 'codex', refId: p.catalogId, at: now.toISOString() })
    return { coins: spec.harvestCoins, harvestId: spec.harvestItem, firstTime: !seen }
  })
}

/** 铲除没成熟的植物，不退种子 */
export async function digUp(plantId: string) {
  await db.plants.delete(plantId)
}

/** 出售果实 */
export async function sellHarvest(childId: string, harvestId: string, now = new Date()): Promise<boolean> {
  const info = harvestInfo(harvestId)
  if (!info || info.kind !== 'fruit') return false
  return db.transaction('rw', [db.inventory, db.ledger], async () => {
    if (!(await takeInventory(childId, harvestId))) return false
    await addLedger(childId, { currency: 'coin', amount: info.sellPrice, reason: 'sell', refId: harvestId }, now)
    return true
  })
}

export type ExpandResult = { ok: true } | { ok: false; reason: 'coins' | 'invalid' }

export async function expandPlot(childId: string, x: number, y: number, now = new Date()): Promise<ExpandResult> {
  return db.transaction('rw', [db.plots, db.placed, db.ledger], async () => {
    const [plots, placed] = await Promise.all([
      db.plots.where('childId').equals(childId).toArray(),
      db.placed.where('childId').equals(childId).filter((p) => p.scene === 'outdoor').toArray(),
    ])
    const sized = placed.map((p) => {
      const s = getCatalogItem(p.catalogId)?.size ?? [1, 1]
      return { ...p, w: s[0], h: s[1] }
    })
    if (!expandCandidates(plots, sized).some((c) => c.x === x && c.y === y)) return { ok: false, reason: 'invalid' } as const
    if (balanceOf(await ledger(childId)).coin < BALANCE.plotExpandCost) return { ok: false, reason: 'coins' } as const
    await addLedger(childId, { currency: 'coin', amount: -BALANCE.plotExpandCost, reason: 'expand' }, now)
    await db.plots.add({ childId, x, y, kind: 'soil' })
    return { ok: true } as const
  })
}

export { veggieHarvestCount } from '../engine/visitors'
