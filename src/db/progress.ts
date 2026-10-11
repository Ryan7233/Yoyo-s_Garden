// 累计进度同步：特殊物品解锁送礼、访客首次来访奖励、成就徽章、图鉴点亮；心愿单（5.6–5.8）
import { db, uid } from './schema'
import { addInventory } from './inventory'
import { progressStats } from './garden'
import type { Unlock } from '../data/types'
import { CATALOG, getCatalogItem } from '../data/catalog'
import { VISITORS } from '../data/visitors'
import { BADGES } from '../data/badges'
import { BALANCE } from '../data/balance'
import { computeGrants, type Grants } from '../engine/progress'
import { snapshotOf } from '../engine/visitors'
import { canWish } from '../engine/wish'
import { toTaskDay } from '../engine/taskDay'

/**
 * 每次写操作后调用。幂等：已经发过的不会重复发。
 * 解锁一旦发生就保留（之后撤销记录也不收回），避免孩子得而复失。
 */
export async function syncProgress(childId: string, now = new Date()): Promise<Grants> {
  return db.transaction('rw', [db.tasks, db.taskRecords, db.exerciseRecords, db.ledger, db.placed, db.plants, db.unlocks, db.inventory], async () => {
    const [stats, plants, placed, ledger, unlocks] = await Promise.all([
      progressStats(childId),
      db.plants.where('childId').equals(childId).toArray(),
      db.placed.where('childId').equals(childId).toArray(),
      db.ledger.where('childId').equals(childId).toArray(),
      db.unlocks.where('childId').equals(childId).toArray(),
    ])
    const grants = computeGrants({
      catalog: CATALOG,
      visitors: VISITORS,
      badges: BADGES,
      stats: {
        ...stats,
        plantedNow: plants.filter((p) => p.scene === 'outdoor').length,
        indoorPlaced: placed.filter((p) => p.scene === 'indoor').length,
      },
      snapshot: snapshotOf(plants, placed, ledger),
      plants,
      unlocks,
    })

    const at = now.toISOString()
    const date = toTaskDay(now)
    const rows: Unlock[] = []
    // 图鉴点亮是安静的，不弹提示
    for (const refId of grants.codex) rows.push({ id: uid(), childId, kind: 'codex', refId, at, seenAt: at })
    for (const refId of grants.items) {
      rows.push({ id: uid(), childId, kind: 'item', refId, at })
      // 特殊植物解锁时送 1 颗种子；特殊装饰解锁即获得
      if (getCatalogItem(refId)) await addInventory(childId, refId, 1)
    }
    for (const refId of grants.visitors) {
      rows.push({ id: uid(), childId, kind: 'visitor', refId, at })
      await db.ledger.add({ id: uid(), childId, at, date, currency: 'coin', amount: BALANCE.visitorFirstCoins, reason: 'visitor', refId })
    }
    for (const refId of grants.badges) rows.push({ id: uid(), childId, kind: 'badge', refId, at })
    if (rows.length) await db.unlocks.bulkAdd(rows)
    return grants
  })
}

/** 孩子看过解锁提示 */
export async function markUnlocksSeen(ids: string[], now = new Date()) {
  const at = now.toISOString()
  await db.transaction('rw', db.unlocks, async () => {
    for (const id of ids) await db.unlocks.update(id, { seenAt: at })
  })
}

// ---- 心愿单 ----

export async function setWish(childId: string, catalogId: string, now = new Date()): Promise<boolean> {
  const item = getCatalogItem(catalogId)
  if (!item || !canWish(item)) return false
  await db.wishes.put({ childId, catalogId, setAt: now.toISOString() })
  return true
}

export async function clearWish(childId: string) {
  await db.wishes.delete(childId)
}
